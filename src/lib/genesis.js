/* The ALKÉ Genesis Program: how the 10,000,000 ALKE for the first members is
 * shared out, in one place. The server applies these (pool split,
 * verification, warming); the app shows them and estimates from them.
 *
 * Unit: 1 ALKE = 1,000,000 cALKE (cold ALKE). A fixed rate, like satoshis.
 * Only warmed cALKE converts; unwarmed cALKE stays cold.
 */

export const C_PER_ALKE = 1_000_000;
export const GENESIS_POOL = 10_000_000; // ALKE

/* Each day's pool is shared by everyone with a verified session that day, up
   to a per-member maximum; what isn't handed out goes back to the pool. A
   phase ends at its member milestone or when its pool is used up. */
export const PHASES = [
  { n: 1, name: "Genesis", untilMembers: 250_000, pool: 4_000_000, daily: 30_000, maxPerMember: 1 },
  { n: 2, name: "Growth", untilMembers: 1_000_000, pool: 3_000_000, daily: 15_000, maxPerMember: 0.5 },
  { n: 3, name: "Expansion", untilMembers: 3_000_000, pool: 3_000_000, daily: 7_500, maxPerMember: 0.25 },
];

/* Streaks earn a bigger share of the same daily pool (never extra ALKE). */
export const STREAK_BOOSTS = [
  { days: 30, boost: 1.25 },
  { days: 7, boost: 1.1 },
];
export const streakBoost = (streak) => (STREAK_BOOSTS.find((b) => streak >= b.days) || { boost: 1 }).boost;

/** The phase for a member count (the server publishes the count; until then, phase 1). */
export const phaseFor = (members = 0) => PHASES.find((p) => members < p.untilMembers) || PHASES[PHASES.length - 1];

/* ── Formatting ─────────────────────────────────────────────────────────── */

export const toC = (alke) => Math.round((Number(alke) || 0) * C_PER_ALKE);
export const fmtC = (c) => Math.floor(Number(c) || 0).toLocaleString("en-US");
/** "≈ 1.25 ALKE" for a cALKE amount. */
export const approxAlke = (c) => {
  const a = (Number(c) || 0) / C_PER_ALKE;
  return `≈ ${a.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: a < 1 ? 4 : 2 })} ALKE`;
};
/** Compact: 1.2M, 184K. */
export const shortC = (c) => {
  const v = Number(c) || 0;
  if (v >= 1e9) return `${(v / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (v >= 1e4) return `${Math.floor(v / 1e3)}K`;
  return fmtC(v);
};

/* Tap boost: every TAP_BOOST.combo-tap combo while mining earns one boost;
   each adds `step` to today's (UTC) share, up to `perDay` boosts a day
   (×3 at most). The server records them (alkeBoost) and applies them when
   the day settles. Keep in step with functions/genesis.js. */
export const TAP_BOOST = { combo: 25, step: 0.2, perDay: 10 };
export const tapBoost = (count) => Math.round((1 + TAP_BOOST.step * Math.min(Math.max(0, count || 0), TAP_BOOST.perDay)) * 100) / 100;
export const utcDay = (d = Date.now()) => new Date(d).toISOString().slice(0, 10);
