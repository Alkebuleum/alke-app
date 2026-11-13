/* ALKE Hex and ALKE Rush: game XP (play only, never ALKE).
 *
 * The games keep their progress on the device (localStorage 'alke.hex.v1' /
 * 'alke.rush.v1'). Progress belongs to the signed-in member: switching
 * accounts on a device swaps it (ensureGameOwner). Totals are posted to
 * alke_scores/{nuruId} for the leaderboards (postScores).
 */
import { collection, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "./firebase";

const KEYS = ["alke.hex.v1", "alke.rush.v1"];
const OWNER = "alke.games.owner";

const ls = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/** Puts [nuruId]'s game progress in place (stashing the previous owner's). */
export function ensureGameOwner(nuruId) {
  if (!nuruId) return;
  const owner = ls.get(OWNER);
  if (owner === nuruId) return;
  for (const k of KEYS) {
    if (owner) ls.set(`${k}@${owner}`, ls.get(k));
    ls.set(k, ls.get(`${k}@${nuruId}`));
  }
  ls.set(OWNER, nuruId);
}

function read(k) {
  try {
    const p = JSON.parse(ls.get(k) || "null");
    return p && p.v === 1 ? p : null;
  } catch {
    return null;
  }
}

const pad = (n) => String(n).padStart(2, "0");
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const int = (v) => Math.max(0, Math.round(Number(v) || 0));

/** The member's game XP from the saved progress. */
export function gameTotals() {
  const hex = read("alke.hex.v1") || {};
  const rush = read("alke.rush.v1") || {};
  const hexXp = int(hex.xp);
  const rushXp = int(rush.xp);
  return { hexXp, rushXp, total: hexXp + rushXp };
}

/** The leaderboard row for the saved progress. */
function scoreRow(username) {
  const hex = read("alke.hex.v1") || {};
  const rush = read("alke.rush.v1") || {};
  const today = dayKey();
  const daily = hex.daily && hex.daily.result === "won" ? hex.daily : null;
  const rushToday = rush.day === today && rush.chal ? rush.chal.best : 0;
  return {
    username,
    hexXp: int(hex.xp),
    hexDaily: daily ? int(daily.xp) : 0,
    hexDailyTime: daily ? int(daily.time) : 0,
    hexDay: daily ? String(daily.date || "").slice(0, 10) : "",
    rushXp: int(rush.xp),
    rushBest: int(rushToday),
    rushDay: rushToday ? today : "",
  };
}

/** Posts the member's scores when they've changed since the last post. */
export async function postScores(nuruId, username) {
  if (!nuruId || !username) return;
  const row = scoreRow(username);
  const sig = JSON.stringify(row);
  const key = `alke.scores.posted@${nuruId}`;
  if (ls.get(key) === sig) return;
  if (!row.hexXp && !row.rushXp && !ls.get(key)) return; // nothing played yet
  await setDoc(doc(db, "alke_scores", nuruId), { ...row, updatedAt: serverTimestamp() });
  ls.set(key, sig);
}

/* ── Leaderboards ─────────────────────────────────────────────────────── */

const scores = collection(db, "alke_scores");
const rows = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

/** { hexToday, hexAll, rushToday, rushAll } — arrays of score rows. */
export async function loadLeaderboards() {
  const today = dayKey();
  // Equality filters and single-field ordering only: no composite indexes needed.
  const [hexToday, rushToday, hexAll, rushAll] = await Promise.all([
    getDocs(query(scores, where("hexDay", "==", today), limit(500))).then(rows),
    getDocs(query(scores, where("rushDay", "==", today), limit(500))).then(rows),
    getDocs(query(scores, orderBy("hexXp", "desc"), limit(50))).then(rows),
    getDocs(query(scores, orderBy("rushXp", "desc"), limit(50))).then(rows),
  ]);
  return {
    hexToday: hexToday.filter((r) => r.hexDaily > 0).sort((a, b) => b.hexDaily - a.hexDaily || a.hexDailyTime - b.hexDailyTime),
    rushToday: rushToday.filter((r) => r.rushBest > 0).sort((a, b) => b.rushBest - a.rushBest),
    hexAll: hexAll.filter((r) => r.hexXp > 0),
    rushAll: rushAll.filter((r) => r.rushXp > 0),
  };
}

/** Avatar initials and a colour for a username. */
export function personLook(username) {
  const u = String(username || "?");
  const parts = u.split(/[._\s-]+/).filter(Boolean);
  const ini = ((parts[0] || u)[0] + (parts[1] ? parts[1][0] : (parts[0] || u)[1] || "")).toUpperCase();
  const grads = [
    "linear-gradient(135deg,#8FB2FF,#4A86F7)",
    "linear-gradient(135deg,#F7D58A,#D99A2B)",
    "linear-gradient(135deg,#8DF0C9,#2BA37A)",
    "linear-gradient(135deg,#C6B6FF,#7A55FA)",
    "linear-gradient(135deg,#FF8A9A,#C2354B)",
    "linear-gradient(135deg,#A9C4FF,#3B74E6)",
  ];
  let h = 0;
  for (const ch of u) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { ini, grad: grads[h % grads.length] };
}
