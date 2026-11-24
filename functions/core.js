/* ALKÉ Genesis server logic (Firestore Admin SDK; rules don't apply here).
 *
 *   alke_days/{day}/sessions/{nuruId}      a session started that UTC day
 *   alke_members/{id}/entries/s{n}         ledger line for session n
 *   alke_members/{id}/allocation/summary   { locked, warmed, warmRate, lastXp, updatedAt }
 *   alke_members/{id}/allocation/invites   { joined, active }
 *   alke_network/genesis                   { distributed: {phase: ALKE}, members }
 *   alke_network/live                      what the Drill screen shows
 *   alke_settlements/{day}                 one per settled day (idempotency)
 *
 * Amounts are ALKE (the app shows cALKE = ALKE × 1,000,000).
 */
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { ACTIVE_AFTER, SESSION_MS, TAP_BOOST, WARMING, currentPhase, dayKey, roundAlke, streakBoost, tapBoost } from "./genesis.js";

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

/* ── Daily settlement: split the day's pool, then warm ────────────────── */

/** Each row's share of [pool]: by streak weight, capped at maxPerMember × weight. */
export function shares(pool, rows, maxPerMember) {
  const W = rows.reduce((t, r) => t + r.w, 0);
  if (!W || !pool) return rows.map(() => 0);
  return rows.map((r) => roundAlke(Math.min((pool * r.w) / W, maxPerMember * r.w)));
}

export async function settleDay(db, day) {
  const done = db.doc(`alke_settlements/${day}`);
  if ((await done.get()).exists) return { day, skipped: true };

  const genRef = db.doc("alke_network/genesis");
  const gen = (await genRef.get()).data() || {};
  const distributed = gen.distributed || {};
  const members = (await db.collection("alke_members").count().get()).data().count;
  const phase = currentPhase(members, distributed);

  const sessions = await allDocs(db.collection(`alke_days/${day}/sessions`));
  const boosts = Object.fromEntries((await allDocs(db.collection(`alke_days/${day}/boosts`))).map((d) => [d.id, d.data().count || 0]));
  const rows = sessions.map((d) => {
    const sb = streakBoost(d.data().streak || 1);
    const tb = tapBoost(boosts[d.id]);
    return { id: d.id, ...d.data(), sb, tb, taps: Math.min(boosts[d.id] || 0, TAP_BOOST.perDay), w: Math.round(sb * tb * 1000) / 1000 };
  });
  const W = rows.reduce((a, r) => a + r.w, 0);

  let pool = 0;
  if (phase) pool = Math.max(0, Math.min(phase.daily, phase.pool - (distributed[phase.n] || 0)));

  const split = phase ? shares(pool, rows, phase.maxPerMember) : rows.map(() => 0);
  let total = 0;
  const ops = [];
  for (const [i, r] of rows.entries()) {
    const share = split[i];
    total += share;
    ops.push((b) =>
      b.set(
        db.doc(`alke_members/${r.id}/entries/s${r.n}`),
        {
          session: r.n,
          kind: "session",
          label: `Session ${r.n}`,
          amount: share,
          status: "locked",
          batch: day,
          breakdown: [
            { label: "Day's pool", value: `${pool.toLocaleString("en-US")} ALKE`, note: phase ? `Phase ${phase.n} · ${phase.name}` : "Genesis complete" },
            { label: "Sessions that day", value: rows.length.toLocaleString("en-US") },
            { label: "Your streak boost", value: `×${r.sb}` },
            { label: "Your tap boost", value: `×${r.tb}`, note: `${r.taps} of ${TAP_BOOST.perDay} boosts` },
            { label: "Your share", value: `${Math.round(share * 1e6).toLocaleString("en-US")} cALKE`, note: phase ? `max ${(phase.maxPerMember * r.w * 1e6).toLocaleString("en-US")} cALKE` : "" },
          ],
        },
        { merge: true },
      ),
    );
    if (share > 0) ops.push((b) => b.set(summaryRef(db, r.id), { locked: FieldValue.increment(share), updatedAt: FieldValue.serverTimestamp() }, { merge: true }));
  }
  await commitAll(db, ops);

  total = roundAlke(total);
  if (phase) {
    await genRef.set({ distributed: { [phase.n]: FieldValue.increment(total) }, members, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  await done.set({ day, phase: phase ? phase.n : null, pool, sessions: rows.length, weight: W, total, members, at: FieldValue.serverTimestamp() });
  return { day, phase: phase?.n ?? null, pool, sessions: rows.length, total };
}

/** Warms every member's cold balance for one day: invites + games (capped). */
export async function warmDay(db, day) {
  const done = db.doc(`alke_settlements/${day}`);
  const s = (await done.get()).data() || {};
  if (s.warmed) return { day, skipped: true };

  const ids = (await allDocs(db.collection("alke_members"))).map((d) => d.id);

  let warmedMembers = 0;
  const ops = [];
  // Read each member's summary, invites and scores together, 300 members at a time.
  for (let i = 0; i < ids.length; i += 300) {
    const chunk = ids.slice(i, i + 300);
    const refs = chunk.flatMap((id) => [summaryRef(db, id), invitesRef(db, id), db.doc(`alke_scores/${id}`)]);
    const snaps = await db.getAll(...refs);
    chunk.forEach((id, k) => {
      const a = snaps[k * 3].data() || {};
      const inv = snaps[k * 3 + 1].data() || {};
      const sc = snaps[k * 3 + 2].data() || {};
      const locked = Number(a.locked) || 0;
      const xp = (Number(sc.hexXp) || 0) + (Number(sc.rushXp) || 0);
      if (!locked && a.lastXp == null && !xp) return; // nothing to warm or track yet
      const gained = a.lastXp == null ? 0 : Math.max(0, xp - a.lastXp);
      const games = Math.min(WARMING.gamesCap, Math.floor(gained / 30) * 0.1);
      const active = Number(inv.active) || 0;
      const rate = Math.round((active * WARMING.perActiveInvite + games) * 100) / 100; // % per day
      const warmed = Math.min(locked, roundAlke((Number(a.warmed) || 0) + (locked * rate) / 100));
      if (rate > 0) warmedMembers++;
      ops.push((b) => b.set(summaryRef(db, id), { warmed, warmRate: rate, lastXp: xp, warmedAt: FieldValue.serverTimestamp() }, { merge: true }));
    });
  }
  await commitAll(db, ops);
  await done.set({ warmed: true, warmedMembers }, { merge: true });
  return { day, members: ids.length, warmedMembers };
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
  const poolToday = phase ? Math.min(phase.daily, phase.pool - ((gen.distributed || {})[phase.n] || 0)) : 0;
  const estPerSession = phase ? roundAlke(Math.min(phase.maxPerMember, poolToday / Math.max(1, miningNow))) : 0;
  const live = {
    members,
    miningNow,
    poolToday,
    estPerSession,
    phase: phase ? phase.n : null,
    phaseName: phase ? phase.name : "Complete",
    nextAt: phase ? phase.untilMembers : null,
    distributed: gen.distributed || {},
    updatedAt: FieldValue.serverTimestamp(),
  };
  await db.doc("alke_network/live").set(live);
  return live;
}
