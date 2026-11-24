/* Contributions warm cold ALKE. Each kind warms a percentage of your cold
 * balance per day, at its own weight; a verified invite weighs more than 3×
 * any other kind. Percentages scale with any balance (cALKE runs into the
 * millions). Drilling sessions record participation but don't warm.
 *
 * This table is the single place to tune the weights. The real calculation
 * belongs on the server; the app shows today's estimate from what it knows.
 */
import { WARMING, gameWarmingToday } from "./games";

export const CONTRIBUTIONS = [
  { id: "invites", label: "Invites", rule: "1% a day per active invite", per: 1, cap: null, live: true },
  { id: "lessons", label: "Lessons", rule: "0.1% per lesson, max 0.3% a day", per: 0.1, cap: 0.3, live: false },
  { id: "games", label: "Games", rule: `0.1% per ${WARMING.xpPerUnit} XP, max ${(WARMING.gameCap * 0.1).toFixed(1)}% a day`, per: 0.1, cap: WARMING.gameCap * 0.1, live: true },
  { id: "discussions", label: "Discussions", rule: "0.1% per approved post, max 0.2% a day", per: 0.1, cap: 0.2, live: false },
];

export const byId = (id) => CONTRIBUTIONS.find((c) => c.id === id);
export const pct = (v) => `${Number((Number(v) || 0).toFixed(2))}%`;

/** Today's warming rate (% of your cold balance per day) from each kind, and the total. */
export function warmingToday({ invites = 0 } = {}) {
  const g = gameWarmingToday();
  const values = {
    invites: invites * byId("invites").per,
    lessons: 0,
    games: g.warm * byId("games").per,
    discussions: 0,
  };
  const total = Object.values(values).reduce((a, b) => a + b, 0);
  return { values, total, games: g };
}
