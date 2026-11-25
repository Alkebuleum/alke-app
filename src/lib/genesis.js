/* The ALKÉ Genesis Program: how the 10,000,000 ALKE for the first members is
 * shared out, in one place. The server applies these (brackets, pool split,
 * invite match); the app shows them and estimates from them.
 *
 * Unit: amounts are kept in micro-ALKE (cALKE): 1 ALKE = 1,000,000, like
 * satoshis. Members only ever see ALKE rewards.
 */

export const C_PER_ALKE = 1_000_000;
export const GENESIS_POOL = 10_000_000; // ALKE

/* Each day's pool is shared by everyone with a verified session that day, up
   to a per-member maximum; what isn't handed out goes back to the pool. A
   phase ends at its member milestone or when its pool is used up. */
/* Phase 1 runs in brackets by total members. Brackets 1-4 pay a fixed drill
   reward (`drill` [low, high]: boosts move you from low to high) out of
   their own `budget`; bracket 5 shares the daily pool. A bracket ends at its
   member count or when its budget is spent. `match`: the invite match, the
   share of each active invitee's drill reward their inviter also earns that
   day (direct invites; the inviter drills that day too; at most the
   inviter's own drill reward). It ends with Phase 1. Keep in step with
   functions/genesis.js. */
export const BRACKETS = [
  { n: 1, upTo: 100, drill: [300, 500], match: 0.75, budget: 400_000 },
  { n: 2, upTo: 500, drill: [100, 200], match: 0.5, budget: 600_000 },
  { n: 3, upTo: 1_000, drill: [40, 80], match: 0.25, budget: 400_000 },
  { n: 4, upTo: 5_000, drill: [10, 20], match: 0.1, budget: 600_000 },
  { n: 5, upTo: Infinity, match: 0.05 },
];

export const PHASES = [
  { n: 1, name: "Genesis", untilMembers: 250_000, pool: 4_000_000, daily: 30_000, maxPerMember: 5, brackets: BRACKETS },
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
/* Founder: a member with FOUNDER_INVITES active invites (each has completed
   3 drills). A status and a profile badge; it carries no extra reward. */
export const FOUNDER_INVITES = 10;

/** cALKE → real ALKE. */
export const toAlke = (c) => (Number(c) || 0) / C_PER_ALKE;
/** "1,234.567890": ALKE to [d] decimals (6 = every cALKE), rounded down. */
export const fmtAlke = (alke, d = 6) => {
  const v = Math.max(0, Number(alke) || 0);
  const f = (Math.floor(v * 10 ** d + 1e-6) / 10 ** d).toFixed(d).split(".");
  return Number(f[0]).toLocaleString("en-US") + (d ? `.${f[1]}` : "");
};
/** Compact: 1.2M, 184K. */
export const shortC = (c) => {
  const v = Number(c) || 0;
  if (v >= 1e9) return `${(v / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (v >= 1e4) return `${Math.floor(v / 1e3)}K`;
  return fmtC(v);
};

/* Tap boost: every TAP_BOOST.combo-tap combo while drilling earns one boost;
   each adds `step` to today's (UTC) share, up to `perDay` boosts a day
   (×3 at most). The server records them (alkeBoost) and applies them when
   the day settles. Keep in step with functions/genesis.js. */
export const TAP_BOOST = { combo: 25, step: 0.2, perDay: 10 };
export const tapBoost = (count) => Math.round((1 + TAP_BOOST.step * Math.min(Math.max(0, count || 0), TAP_BOOST.perDay)) * 100) / 100;

/** The bracket now: the server's (alke_network/live), else the one for the member count. */
export function bracketFor(live) {
  if (live?.bracket?.n) return { ...BRACKETS.find((b) => b.n === live.bracket.n), ...live.bracket, upTo: live.bracket.upTo ?? Infinity };
  const members = Number(live?.members) || 0;
  if (members >= PHASES[0].untilMembers) return null;
  return BRACKETS.find((b) => members <= b.upTo) || null;
}

/* Every boost maxed: streak ×1.25 × veins ×3 × rig ×2 (Level 4, drillScene RIG). */
const MAX_WEIGHT = streakBoost(Infinity) * tapBoost(TAP_BOOST.perDay) * 2;
const floorAlke = (v) => Math.floor(v * C_PER_ALKE) / C_PER_ALKE;

/** A fixed bracket's drill reward (ALKE) for share weight [w]: low at ×1, high with every boost. */
export function bracketDrill(bracket, w) {
  const [lo, hi] = bracket.drill;
  return floorAlke(lo + (hi - lo) * Math.min(1, Math.max(0, (w - 1) / (MAX_WEIGHT - 1))));
}

export const pctMatch = (m) => `${Math.round((Number(m) || 0) * 100)}%`;
export const utcDay = (d = Date.now()) => new Date(d).toISOString().slice(0, 10);
