/* Contributions warm cold ALKE. Every kind of contribution counts, each at its
 * own weight; verified invites weigh the most (more than 3× any other kind).
 * Mining sessions record participation but don't warm.
 *
 * This table is the single place to tune the weights. The real calculation
 * belongs on the server; the app shows today's estimate from what it knows.
 */
import { WARMING, gameWarmingToday } from "./games";

export const CONTRIBUTIONS = [
  { id: "invites", label: "Invites", rule: "10 a day per verified invite", per: 10, cap: null, live: false },
  { id: "lessons", label: "Lessons", rule: "1 per lesson, max 3 a day", per: 1, cap: 3, live: false },
  { id: "games", label: "Games", rule: `1 per ${WARMING.xpPerUnit} XP, max ${WARMING.gameCap} a day`, per: 1, cap: WARMING.gameCap, live: true },
  { id: "discussions", label: "Discussions", rule: "1 per approved post, max 2 a day", per: 1, cap: 2, live: false },
];

export const byId = (id) => CONTRIBUTIONS.find((c) => c.id === id);

/** Today's warming from each contribution, and the total. Only games are live;
    the rest show 0 until their features exist. */
export function warmingToday({ invites = 0 } = {}) {
  const g = gameWarmingToday();
  const values = {
    invites: invites * byId("invites").per,
    lessons: 0,
    games: g.warm,
    discussions: 0,
  };
  const total = Object.values(values).reduce((a, b) => a + b, 0);
  return { values, total, games: g };
}
