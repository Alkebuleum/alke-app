/* Genesis Program figures for the server. Keep in step with the app's
 * src/lib/genesis.js and src/lib/contribution.js (the app shows them; the
 * server applies them). Amounts are in ALKE; 1 ALKE = 1,000,000 cALKE. */

export const C_PER_ALKE = 1_000_000;

/* Phase 1 runs in brackets by total members. Brackets 1-4 pay a fixed drill
   reward (`drill` [low, high]: boosts move you from low to high) out of
   their own `budget`; bracket 5 shares `daily` by weight, capped at
   maxPerMember × weight, out of whatever is left of the phase pool. A
   bracket ends at its member count or when its budget is spent. `match` is
   the invite match: the share of each active invitee's drill reward their
   inviter also earns that day (direct invites only; the inviter must drill
   that day; at most the inviter's own drill reward). Invite match ends with
   Phase 1. Keep in step with the app's src/lib/genesis.js. */
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

export const streakBoost = (streak) => (streak >= 30 ? 1.25 : streak >= 7 ? 1.1 : 1);

/* Rig levels: every RIG.perLevel active invites add a level (up to RIG.max);
   each level adds RIG.step to the day's share weight (Level 4 = ×2). Like the
   streak boost, it's a bigger share of the same pool, never new ALKE. Keep
   in step with the app's src/pages/app/drillScene.js. */
export const RIG = { perLevel: 3, step: 0.25, max: 4 };
export const rigLevel = (active) => Math.min(RIG.max, Math.floor((Number(active) || 0) / RIG.perLevel));
export const rigBoost = (active) => 1 + RIG.step * rigLevel(active);

/** Until personhood checks exist, an invite counts once the invitee has this many sessions. */
export const ACTIVE_AFTER = 3;

/** The current phase: the first whose member milestone and pool aren't reached. */
export function currentPhase(members, distributed = {}) {
  return (
    PHASES.find((p) => members < p.untilMembers && (distributed[p.n] || 0) < p.pool) || null
  );
}

/** The phase's current bracket: the first whose member count and budget aren't reached
    (null for a phase without brackets). */
export function currentBracket(phase, members, spent = {}) {
  if (!phase?.brackets) return null;
  return phase.brackets.find((b) => members <= b.upTo && (b.budget == null || (spent[b.n] || 0) < b.budget)) || null;
}

/** The highest share weight: every boost maxed (streak × taps × rig). */
export const MAX_WEIGHT = () => streakBoost(30) * tapBoost(TAP_BOOST.perDay) * rigBoost(RIG.perLevel * RIG.max);

/** A fixed bracket's drill reward for share weight [w]: low at ×1, high with every boost maxed. */
export function bracketDrill(bracket, w) {
  const [lo, hi] = bracket.drill;
  const t = Math.min(1, Math.max(0, (w - 1) / (MAX_WEIGHT() - 1)));
  return roundAlke(lo + (hi - lo) * t);
}

/** UTC day key, e.g. "2026-11-13". */
export const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

/** Round to whole cALKE (6 decimals of ALKE). */
export const roundAlke = (v) => Math.floor(v * C_PER_ALKE) / C_PER_ALKE;

/* Tap boost: every TAP_BOOST.combo-tap combo on the drilling rig while a
   session runs is one boost; each adds `step` to that UTC day's share
   weight, up to `perDay` boosts (1 + 0.2 × 10 = ×3). Keep in step with the
   app's src/lib/genesis.js. */
export const TAP_BOOST = { combo: 25, step: 0.2, perDay: 10, minGapMs: 2000 };
export const tapBoost = (count) => Math.round((1 + TAP_BOOST.step * Math.min(Math.max(0, count || 0), TAP_BOOST.perDay)) * 100) / 100;
export const SESSION_MS = 24 * 60 * 60 * 1000;
