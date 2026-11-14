/* ALKE Hex and ALKE Rush on the server.
 *
 * The app sends its finished game results (and its saved progress) here;
 * members can no longer write their own scores. Each result is checked
 * against the games' limits before it counts:
 *
 *   alke_members/{id}/games/state   { progress, counts, seen, migratedAt, savedAt }
 *   alke_scores/{id}                the leaderboard row (server-written only)
 *
 * These are plausibility checks, not a replay of the game: they stop made-up
 * totals, repeated results, out-of-range scores and more runs than a day
 * allows. Game warming is capped per day anyway (core.js warmDay).
 */
import { FieldValue } from "firebase-admin/firestore";

export const LIMITS = {
  hex: { maxWin: 500, maxLoss: 300, perDay: 60 },
  rush: { maxRun: 800, maxBonus: 70, scored: 5, perDay: 80 },
  maxAgeDays: 3, // results older than this are ignored
  progressBytes: 120000,
};

const DAY = 24 * 60 * 60 * 1000;
const int = (v) => Math.round(Number(v) || 0);
const pad = (n) => String(n).padStart(2, "0");

/** The member's local calendar day for a time, from their UTC offset (minutes, like Date#getTimezoneOffset). */
export function localDay(t, tz) {
  const d = new Date(t - tz * 60000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * Pure check of a batch of results against the state. Returns what to add
 * and the new state pieces; never throws on bad input (bad entries are skipped).
 */
export function applyResults(state, input, now = Date.now()) {
  const tz = Math.max(-840, Math.min(840, int(input.tz)));
  const today = localDay(now, tz);
  const seen = new Set(state.seen || []);
  const counts = { ...(state.counts || {}) }; // { [day]: { hex, rush, scored, bonus } }
  const migrating = !state.migratedAt;
  const out = { hexAdd: 0, rushAdd: 0, hexDaily: null, rushBest: {}, accepted: 0, rejected: 0 };

  const take = (game, e, check) => {
    const t = int(e && e.t);
    const id = `${game}:${t}`;
    if (!t || t > now + 5 * 60000 || t < now - LIMITS.maxAgeDays * DAY || seen.has(id)) return;
    seen.add(id);
    // First sync after this change: results already on the device were posted
    // by the old app and are in the starting totals. Mark them seen only.
    if (migrating) return;
    const day = localDay(t, tz);
    const c = (counts[day] = { hex: 0, rush: 0, scored: 0, bonus: 0, ...(counts[day] || {}) });
    if (check(e, c, day)) out.accepted++;
    else out.rejected++;
  };

  for (const e of (Array.isArray(input.hex) ? input.hex : []).slice(0, 100)) {
    take("hex", e, (e, c, day) => {
      if (c.hex >= LIMITS.hex.perDay) return false;
      const xp = int(e.xp);
      if (e.result === "won" ? xp < 0 || xp > LIMITS.hex.maxWin : e.result === "lost" ? xp > 0 || xp < -LIMITS.hex.maxLoss : true) return false;
      c.hex++;
      out.hexAdd += xp;
      if (e.result === "won" && e.kind === "daily" && !e.practice && day === today && !state.hexDay?.startsWith(day)) {
        out.hexDaily = { day, xp, time: Math.max(0, int(e.time)) };
      }
      return true;
    });
  }

  for (const e of (Array.isArray(input.rush) ? input.rush : []).slice(0, 100)) {
    take("rush", e, (e, c, day) => {
      if (c.rush >= LIMITS.rush.perDay) return false;
      c.rush++;
      if (e.practice) return true; // practice runs never score
      if (c.scored >= LIMITS.rush.scored) return false;
      c.scored++;
      if (e.result !== "banked") return true; // a lost run uses a scored run, scores nothing
      const xp = int(e.xp);
      const bonus = int(e.bonus);
      if (xp < 0 || xp > LIMITS.rush.maxRun || bonus < 0 || c.bonus + bonus > LIMITS.rush.maxBonus) return false;
      c.bonus += bonus;
      out.rushAdd += xp + bonus;
      out.rushBest[day] = Math.max(out.rushBest[day] || 0, xp);
      return true;
    });
  }

  // Keep only recent counters and ids.
  const cutoff = localDay(now - (LIMITS.maxAgeDays + 1) * DAY, tz);
  for (const d of Object.keys(counts)) if (d < cutoff) delete counts[d];
  const minT = now - (LIMITS.maxAgeDays + 1) * DAY;
  const keep = [...seen].filter((id) => int(id.split(":")[1]) >= minT).slice(-400);

  return { ...out, today, counts, seen: keep, migrating };
}

const clean = (s) => (typeof s === "string" && s.length <= LIMITS.progressBytes ? s : null);

/** The callable's work: check and record results, save progress, return the state. */
export async function syncGames(db, nuruId, input = {}) {
  const stateRef = db.doc(`alke_members/${nuruId}/games/state`);
  const scoreRef = db.doc(`alke_scores/${nuruId}`);
  const memberRef = db.doc(`alke_members/${nuruId}`);

  return db.runTransaction(async (tx) => {
    const [stateSnap, scoreSnap, memberSnap] = await Promise.all([tx.get(stateRef), tx.get(scoreRef), tx.get(memberRef)]);
    if (!memberSnap.exists) return { ok: false, reason: "not-member" };
    const state = stateSnap.exists ? stateSnap.data() : {};
    const score = scoreSnap.exists ? scoreSnap.data() : {};
    const now = Date.now();
    const r = applyResults({ ...state, hexDay: score.hexDay }, input, now);

    const hexXp = Math.max(0, int(score.hexXp) + r.hexAdd);
    const rushXp = Math.max(0, int(score.rushXp) + r.rushAdd);
    const row = {
      username: memberSnap.get("username") || "",
      hexXp,
      rushXp,
      hexDaily: int(score.hexDaily),
      hexDailyTime: int(score.hexDailyTime),
      hexDay: String(score.hexDay || ""),
      rushBest: int(score.rushBest),
      rushDay: String(score.rushDay || ""),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (r.hexDaily) Object.assign(row, { hexDaily: r.hexDaily.xp, hexDailyTime: r.hexDaily.time, hexDay: r.hexDaily.day });
    const best = r.rushBest[r.today];
    if (best) {
      if (row.rushDay !== r.today) Object.assign(row, { rushBest: best, rushDay: r.today });
      else row.rushBest = Math.max(row.rushBest, best);
    }

    // Progress: the device sends it when it changed; the newest save wins.
    const progress = { ...(state.progress || {}) };
    let savedAt = state.savedAt || null;
    const sent = input.progress && typeof input.progress === "object" ? input.progress : null;
    if (sent && (clean(sent.hex) || clean(sent.rush))) {
      if (clean(sent.hex)) progress.hex = sent.hex;
      if (clean(sent.rush)) progress.rush = sent.rush;
      savedAt = now;
    }

    const next = { counts: r.counts, seen: r.seen, progress, savedAt, updatedAt: FieldValue.serverTimestamp() };
    if (r.migrating) next.migratedAt = now;
    tx.set(stateRef, next, { merge: false });
    if (r.accepted || r.migrating || !scoreSnap.exists || row.username !== score.username) tx.set(scoreRef, row);

    return {
      ok: true,
      accepted: r.accepted,
      rejected: r.rejected,
      scores: { hexXp, rushXp },
      progress: { hex: progress.hex || null, rush: progress.rush || null, savedAt },
    };
  });
}
