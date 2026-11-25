/* ALKÉ Genesis server logic (Firestore Admin SDK; rules don't apply here).
 *
 *   alke_days/{day}/sessions/{nuruId}      a session started that UTC day
 *   alke_members/{id}/entries/s{n}         ledger line for session n
 *   alke_members/{id}/allocation/summary   { locked (your ALKE rewards), updatedAt }
 *   alke_members/{id}/allocation/invites   { joined, active }
 *   alke_members/{id}/entries/m{day}       ledger line for that day's invite match
 *   alke_network/genesis                   { distributed: {phase: ALKE}, spent: {bracket: ALKE}, members }
 *   alke_network/live                      what the Drill screen shows
 *   alke_settlements/{day}                 one per settled day (idempotency)
 *
 * Amounts are ALKE (the app shows cALKE = ALKE × 1,000,000).
 */
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { ACTIVE_AFTER, SESSION_MS, TAP_BOOST, bracketDrill, currentBracket, currentPhase, dayKey, rigBoost, rigLevel, roundAlke, streakBoost, tapBoost } from "./genesis.js";

const ms = (t) => (t && typeof t.toMillis === "function" ? t.toMillis() : Number(t) || 0);
const summaryRef = (db, id) => db.doc(`alke_members/${id}/allocation/summary`);
const invitesRef = (db, id) => db.doc(`alke_members/${id}/allocation/invites`);

/** Writes in batches of up to 450. */
async function commitAll(db, ops) {
  for (let i = 0; i < ops.length; i += 450) {
    const b = db.batch();
    ops.slice(i, i + 450).forEach((op) => op(b));
    await b.commit();
  }
}

/** Every doc of a collection, paged by id. */
async function allDocs(col, page = 1000) {
  const out = [];
  let last = null;
  for (;;) {
    let q = col.orderBy("__name__").limit(page);
    if (last) q = q.startAfter(last);
    const s = await q.get();
    out.push(...s.docs);
    if (s.size < page) return out;
    last = s.docs[s.docs.length - 1];
  }
}

/* ── A session starts (trigger on alke_members/{id}/sessions/{n}) ─────── */

export async function recordSession(db, nuruId, session) {
  const at = session.startedAt || Timestamp.now();
  const day = dayKey(ms(at));
  const member = (await db.doc(`alke_members/${nuruId}`).get()).data() || {};
  const b = db.batch();
  b.set(db.doc(`alke_days/${day}/sessions/${nuruId}`), { n: session.n, at, streak: member.streak || 1 });
  b.set(
    db.doc(`alke_members/${nuruId}/entries/s${session.n}`),
    { session: session.n, kind: "session", label: `Session ${session.n}`, status: "pending", at },
    { merge: true },
  );
  await b.commit();
}

/* ── Tap boost (callable alkeBoost) ───────────────────────────────────── */

/** One combo boost for today (UTC), while a session runs, capped per day.
 *  Kept on allocation/boost (the app reads it) and alke_days/{day}/boosts
 *  (settlement reads it). */
export async function recordBoost(db, nuruId, now = Date.now()) {
  const day = dayKey(now);
  const memberRef = db.doc(`alke_members/${nuruId}`);
  const boostRef = db.doc(`alke_members/${nuruId}/allocation/boost`);
  return db.runTransaction(async (t) => {
    const [m, b] = await Promise.all([t.get(memberRef), t.get(boostRef)]);
    const cur = b.exists && b.data().day === day ? b.data() : { day, count: 0 };
    const out = (ok, reason, count = cur.count) => ({ ok, reason, day, count, mult: tapBoost(count), perDay: TAP_BOOST.perDay });
    const started = ms(m.data()?.lastSessionAt);
    if (!started || now - started >= SESSION_MS) return out(false, "no-session");
    if (cur.count >= TAP_BOOST.perDay) return out(false, "cap");
    if (cur.at && now - ms(cur.at) < TAP_BOOST.minGapMs) return out(false, "too-fast");
    const count = cur.count + 1;
    t.set(boostRef, { day, count, at: Timestamp.fromMillis(now), updatedAt: FieldValue.serverTimestamp() });
    t.set(db.doc(`alke_days/${day}/boosts/${nuruId}`), { count, at: Timestamp.fromMillis(now) });
    return out(true, null, count);
  });
}

/* ── Invites (triggers on alke_members/{id}) ──────────────────────────── */

export async function memberCreated(db, nuruId, member) {
  const by = member.invitedBy;
  if (!by || by === nuruId) return;
  await invitesRef(db, by).set({ joined: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function memberUpdated(db, nuruId, before, after) {
  const by = after.invitedBy;
  if (!by || by === nuruId) return;
  if ((before.sessionCount || 0) < ACTIVE_AFTER && (after.sessionCount || 0) >= ACTIVE_AFTER) {
    await invitesRef(db, by).set({ active: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
}

/* ── Daily settlement: pay the day's drills and invite matches ────────── */

/** Each row's share of [pool]: by weight (streak × taps × rig), capped at maxPerMember × weight. */
export function shares(pool, rows, maxPerMember) {
  const W = rows.reduce((t, r) => t + r.w, 0);
  if (!W || !pool) return rows.map(() => 0);
  return rows.map((r) => roundAlke(Math.min((pool * r.w) / W, maxPerMember * r.w)));
}

/** A day's payouts. Drill rewards: a fixed bracket's reward for each weight,
 *  or a share of the daily pool. Then invite matches: each active invitee's
 *  drill earns their inviter [bracket.match] of it, if the inviter drilled
 *  that day, up to the inviter's own drill reward. If drills + matches go
 *  over [cap] (what's left of the budget or the day's pool), all of it is
 *  scaled down to fit.
 *  rows: [{ id, w, n (session number), by (invitedBy) }]. */
export function dayPayouts(rows, { phase, bracket, cap }) {
  const out = { drill: {}, match: {}, from: {}, scale: 1, total: 0 };
  if (!phase || !rows.length || !(cap > 0)) {
    for (const r of rows) out.drill[r.id] = 0;
    return out;
  }
  const drills = bracket?.drill ? rows.map((r) => bracketDrill(bracket, r.w)) : shares(Math.min(phase.daily, cap), rows, phase.maxPerMember);
  rows.forEach((r, i) => (out.drill[r.id] = drills[i]));

  if (bracket?.match) {
    for (const r of rows) {
      const by = r.by;
      if (!by || by === r.id || out.drill[by] == null || (r.n || 0) < ACTIVE_AFTER) continue;
      out.match[by] = (out.match[by] || 0) + out.drill[r.id] * bracket.match;
      out.from[by] = (out.from[by] || 0) + 1;
    }
    for (const by of Object.keys(out.match)) out.match[by] = Math.min(out.match[by], out.drill[by]);
  }

  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  const raw = sum(out.drill) + sum(out.match);
  if (raw > cap) out.scale = cap / raw;
  for (const o of [out.drill, out.match]) for (const k of Object.keys(o)) o[k] = roundAlke(o[k] * out.scale);
  out.total = roundAlke(sum(out.drill) + sum(out.match));
  return out;
}

const alke = (v) => `${roundAlke(v).toLocaleString("en-US", { maximumFractionDigits: 6 })} ALKE`;
const pctOf = (f) => `${Math.round(f * 100)}%`;

export async function settleDay(db, day) {
  const done = db.doc(`alke_settlements/${day}`);
  if ((await done.get()).exists) return { day, skipped: true };

  const genRef = db.doc("alke_network/genesis");
  const gen = (await genRef.get()).data() || {};
  const distributed = gen.distributed || {};
  const spent = gen.spent || {};
  const members = (await db.collection("alke_members").count().get()).data().count;
  const phase = currentPhase(members, distributed);
  const bracket = currentBracket(phase, members, spent);

  const sessions = await allDocs(db.collection(`alke_days/${day}/sessions`));
  const boosts = Object.fromEntries((await allDocs(db.collection(`alke_days/${day}/boosts`))).map((d) => [d.id, d.data().count || 0]));
  // Each driller's active invites set their rig level; their member record says who invited them (read in batches).
  const active = {};
  const invitedBy = {};
  for (let i = 0; i < sessions.length; i += 300) {
    const chunk = sessions.slice(i, i + 300);
    const snaps = await db.getAll(...chunk.flatMap((d) => [invitesRef(db, d.id), db.doc(`alke_members/${d.id}`)]));
    chunk.forEach((d, k) => {
      active[d.id] = Number(snaps[k * 2].get("active")) || 0;
      invitedBy[d.id] = snaps[k * 2 + 1].get("invitedBy") || null;
    });
  }
  const rows = sessions.map((d) => {
    const sb = streakBoost(d.data().streak || 1);
    const tb = tapBoost(boosts[d.id]);
    const rb = rigBoost(active[d.id]);
    return { id: d.id, ...d.data(), by: invitedBy[d.id], sb, tb, rb, rig: rigLevel(active[d.id]), taps: Math.min(boosts[d.id] || 0, TAP_BOOST.perDay), w: Math.round(sb * tb * rb * 1000) / 1000 };
  });
  const W = rows.reduce((a, r) => a + r.w, 0);

  // What today may pay out: a fixed bracket's budget left, or the day's pool; never past the phase pool.
  let cap = 0;
  if (phase) {
    const phaseLeft = Math.max(0, phase.pool - (distributed[phase.n] || 0));
    cap = bracket?.budget != null ? Math.min(phaseLeft, bracket.budget - (spent[bracket.n] || 0)) : Math.min(phase.daily, phaseLeft);
  }
  const pay = dayPayouts(rows, { phase, bracket, cap });
  const fixed = !!bracket?.drill;
  const where = phase ? `Phase ${phase.n} · ${phase.name}${bracket ? ` · Bracket ${bracket.n}` : ""}` : "Genesis complete";
  const scaled = pay.scale < 1 ? `Scaled to ${Math.round(pay.scale * 100)}%: the budget was nearly spent` : "";

  const ops = [];
  const credit = {};
  for (const r of rows) {
    const share = pay.drill[r.id] || 0;
    credit[r.id] = (credit[r.id] || 0) + share;
    ops.push((b) =>
      b.set(
        db.doc(`alke_members/${r.id}/entries/s${r.n}`),
        {
          session: r.n,
          kind: "session",
          label: `Drill ${r.n}`,
          amount: share,
          status: "locked",
          batch: day,
          breakdown: [
            fixed
              ? { label: "Genesis bracket", value: `Bracket ${bracket.n}`, note: `${bracket.drill[0]}–${bracket.drill[1]} ALKE a drill · ${where}` }
              : { label: "Day's pool", value: alke(phase ? Math.min(phase.daily, cap) : 0), note: where },
            { label: "Drills that day", value: rows.length.toLocaleString("en-US") },
            { label: "Your streak boost", value: `×${r.sb}` },
            { label: "Your tap boost", value: `×${r.tb}`, note: `${r.taps} of ${TAP_BOOST.perDay} veins` },
            { label: "Your rig boost", value: `×${r.rb}`, note: r.rig ? `Level ${r.rig} rig` : "Starter rig" },
            {
              label: fixed ? "Your drill reward" : "Your share",
              value: `${share.toFixed(6)} ALKE`,
              note: scaled || (fixed ? "Boosts move you from the low to the high end" : phase ? `max ${roundAlke(phase.maxPerMember * r.w).toFixed(6)} ALKE` : ""),
            },
          ],
        },
        { merge: true },
      ),
    );
  }
  for (const [by, amount] of Object.entries(pay.match)) {
    if (!(amount > 0)) continue;
    credit[by] = (credit[by] || 0) + amount;
    const n = pay.from[by];
    ops.push((b) =>
      b.set(db.doc(`alke_members/${by}/entries/m${day}`), {
        kind: "match",
        label: "Invite match",
        note: `${n} active invite${n === 1 ? "" : "s"} drilled · ${pctOf(bracket.match)} match`,
        amount,
        status: "locked",
        batch: day,
        at: Timestamp.fromDate(new Date(`${day}T23:59:59Z`)),
        breakdown: [
          { label: "Genesis bracket", value: `Bracket ${bracket.n}`, note: where },
          { label: "Invite match", value: pctOf(bracket.match), note: "Of each active invite's drill reward" },
          { label: "Invites who drilled", value: String(n) },
          { label: "Your match", value: `${amount.toFixed(6)} ALKE`, note: scaled || "At most your own drill reward that day" },
        ],
      }),
    );
  }
  for (const [id, amount] of Object.entries(credit)) {
    if (amount > 0) ops.push((b) => b.set(summaryRef(db, id), { locked: FieldValue.increment(roundAlke(amount)), updatedAt: FieldValue.serverTimestamp() }, { merge: true }));
  }
  await commitAll(db, ops);

  const total = pay.total;
  const matched = roundAlke(Object.values(pay.match).reduce((a, b) => a + b, 0));
  if (phase) {
    await genRef.set(
      { distributed: { [phase.n]: FieldValue.increment(total) }, ...(bracket ? { spent: { [bracket.n]: FieldValue.increment(total) } } : {}), members, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  }
  await done.set({ day, phase: phase ? phase.n : null, bracket: bracket ? bracket.n : null, cap, sessions: rows.length, weight: W, total, matched, scale: pay.scale, members, at: FieldValue.serverTimestamp() });
  return { day, phase: phase?.n ?? null, bracket: bracket?.n ?? null, sessions: rows.length, total, matched };
}

/* ── Live figures for the Drill screen ────────────────────────────────── */

export async function updateLive(db, now = Date.now()) {
  const gen = (await db.doc("alke_network/genesis").get()).data() || {};
  const members = (await db.collection("alke_members").count().get()).data().count;
  const miningNow = (
    await db
      .collection("alke_members")
      .where("lastSessionAt", ">", Timestamp.fromMillis(now - 24 * 60 * 60 * 1000))
      .count()
      .get()
  ).data().count;
  const phase = currentPhase(members, gen.distributed || {});
  const bracket = currentBracket(phase, members, gen.spent || {});
  const phaseLeft = phase ? Math.max(0, phase.pool - ((gen.distributed || {})[phase.n] || 0)) : 0;
  const fixed = !!bracket?.drill;
  const poolToday = phase ? (fixed ? Math.min(phaseLeft, bracket.budget - ((gen.spent || {})[bracket.n] || 0)) : Math.min(phase.daily, phaseLeft)) : 0;
  // A fixed bracket's estimate is its low end (x1); boosts move it up.
  const estPerSession = phase ? (fixed ? bracket.drill[0] : roundAlke(Math.min(phase.maxPerMember, poolToday / Math.max(1, miningNow)))) : 0;
  const live = {
    members,
    miningNow,
    poolToday,
    estPerSession,
    phase: phase ? phase.n : null,
    phaseName: phase ? phase.name : "Complete",
    nextAt: phase ? phase.untilMembers : null,
    // Phase 1's bracket: fixed drill reward, invite match, when it ends (members) and its budget left.
    bracket: bracket
      ? { n: bracket.n, drill: bracket.drill || null, match: bracket.match || 0, upTo: Number.isFinite(bracket.upTo) ? bracket.upTo : null, left: fixed ? poolToday : null }
      : null,
    distributed: gen.distributed || {},
    updatedAt: FieldValue.serverTimestamp(),
  };
  await db.doc("alke_network/live").set(live);
  return live;
}
