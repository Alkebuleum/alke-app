/* Genesis Program figures for the server. Keep in step with the app's
 * src/lib/genesis.js and src/lib/contribution.js (the app shows them; the
 * server applies them). Amounts are in ALKE; 1 ALKE = 1,000,000 cALKE. */

export const C_PER_ALKE = 1_000_000;

export const PHASES = [
  { n: 1, name: "Genesis", untilMembers: 250_000, pool: 4_000_000, daily: 30_000, maxPerMember: 1 },
  { n: 2, name: "Growth", untilMembers: 1_000_000, pool: 3_000_000, daily: 15_000, maxPerMember: 0.5 },
  { n: 3, name: "Expansion", untilMembers: 3_000_000, pool: 3_000_000, daily: 7_500, maxPerMember: 0.25 },
];

export const streakBoost = (streak) => (streak >= 30 ? 1.25 : streak >= 7 ? 1.1 : 1);

/** Warming, as % of the cold balance per day. */
export const WARMING = {
  perActiveInvite: 1, // each invitee who has completed ACTIVE_AFTER sessions
  gamesPerXp: 0.1 / 30, // 0.1% per 30 game XP
  gamesCap: 0.3,
};
/** Until personhood checks exist, an invite counts once the invitee has this many sessions. */
export const ACTIVE_AFTER = 3;

/** The current phase: the first whose member milestone and pool aren't reached. */
export function currentPhase(members, distributed = {}) {
  return (
    PHASES.find((p) => members < p.untilMembers && (distributed[p.n] || 0) < p.pool) || null
  );
}

/** UTC day key, e.g. "2026-11-13". */
export const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

/** Round to whole cALKE (6 decimals of ALKE). */
export const roundAlke = (v) => Math.floor(v * C_PER_ALKE) / C_PER_ALKE;

/* Tap boost: every TAP_BOOST.combo-tap combo on the mining core while a
   session runs is one boost; each adds `step` to that UTC day's share
   weight, up to `perDay` boosts (1 + 0.2 × 10 = ×3). Keep in step with the
   app's src/lib/genesis.js. */
export const TAP_BOOST = { combo: 25, step: 0.2, perDay: 10, minGapMs: 2000 };
export const tapBoost = (count) => Math.round((1 + TAP_BOOST.step * Math.min(Math.max(0, count || 0), TAP_BOOST.perDay)) * 100) / 100;
export const SESSION_MS = 24 * 60 * 60 * 1000;
