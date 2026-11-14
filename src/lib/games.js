/* ALKE Hex and ALKE Rush: game XP. Daily game XP warms cold ALKE (capped).
 *
 * The games keep their progress on the device (localStorage 'alke.hex.v1' /
 * 'alke.rush.v1'). Progress belongs to the signed-in member: switching
 * accounts on a device swaps it (ensureGameOwner). Results and progress
 * are synced to the server (syncGames), which keeps the leaderboards.
 */
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./firebase";

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

/* Games are one kind of contribution that warms cold ALKE (see
   lib/contribution.js for all of them and their weights). */
export const WARMING = { perInvite: 10, gameCap: 3, xpPerUnit: 30 };

/** Game XP earned today (won Hex rounds, banked scored Rush runs) and the
    warming it adds, capped. Estimate only: applied once verified server-side. */
export function gameWarmingToday(now = new Date()) {
  const today = dayKey(now);
  const onToday = (t) => t && dayKey(new Date(t)) === today;
  const hex = read("alke.hex.v1") || {};
  const rush = read("alke.rush.v1") || {};
  let xp = 0;
  for (const h of hex.history || []) if (onToday(h.t) && h.result === "won") xp += int(h.xp);
  for (const h of rush.history || []) if (onToday(h.t) && h.result === "banked" && !h.practice) xp += int(h.xp) + int(h.bonus);
  const warm = Math.min(WARMING.gameCap, Math.floor(xp / WARMING.xpPerUnit));
  return { xp, warm, cap: WARMING.gameCap, nextAt: warm < WARMING.gameCap ? (warm + 1) * WARMING.xpPerUnit : null };
}

/** Today's state of both games, for the Home and Games screens. */
export function gameStatus(now = new Date()) {
  const hex = read("alke.hex.v1") || {};
  const rush = read("alke.rush.v1") || {};
  const today = dayKey(now);

  const hd = hex.daily && hex.daily.date === today ? hex.daily : null;
  let hexStatus = "Daily board ready";
  let hexTone = "idle";
  if (hd && hd.result === "won") [hexStatus, hexTone] = [`Won today · +${int(hd.xp)} XP`, "done"];
  else if (hd && hd.result === "lost") [hexStatus, hexTone] = ["Lost today · back tomorrow", "lost"];
  else if (hd) [hexStatus, hexTone] = ["Started · practice open", "live"];

  const rd = rush.day === today;
  const runs = rd ? rush.runsToday || 0 : 0;
  const chal = rd && rush.chal ? rush.chal : { best: 0, done: false };
  let rushStatus = `${Math.max(0, 5 - runs)} of 5 scored runs left`;
  let rushTone = "idle";
  if (chal.done) [rushStatus, rushTone] = ["Challenge done · +50 XP", "done"];
  else if (chal.best) [rushStatus, rushTone] = [`Best today ${int(chal.best)} of 250`, "live"];

  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return {
    hexXp: int(hex.xp),
    rushXp: int(rush.xp),
    total: int(hex.xp) + int(rush.xp),
    hexLevel: Math.max(1, Math.min(20, hex.unlocked || 1)),
    rushBest: int(rush.best),
    hexCleared: Object.values(hex.stars || {}).filter((v) => v > 0).length,
    rushChal: Math.min(250, int(chal.best)),
    rushChalDone: !!chal.done,
    hexStatus,
    hexTone,
    rushStatus,
    rushTone,
    resetMs: midnight - now,
  };
}

/* ── Server sync ──────────────────────────────────────────────────────
   Finished results go to the server (functions/games.js), which checks them
   and keeps the leaderboard row; members can't write scores themselves.
   The saved progress goes with them, so it follows the member to any device. */

const SYNC = (id) => `alke.games.synced@${id}`;
let syncing = null;

function results() {
  const hex = read("alke.hex.v1") || {};
  const rush = read("alke.rush.v1") || {};
  const pick = (h) => ({ t: h.t, result: h.result, kind: h.kind, xp: h.xp, bonus: h.bonus, time: h.time, practice: h.practice });
  return { hex: (hex.history || []).map(pick), rush: (rush.history || []).map(pick) };
}

/** Sends new results and changed progress; restores progress saved on another device. */
export function syncGames(nuruId) {
  if (!nuruId) return Promise.resolve(null);
  return (syncing ??= doSync(nuruId).finally(() => (syncing = null)));
}

async function doSync(nuruId) {
  const local = { hex: ls.get("alke.hex.v1"), rush: ls.get("alke.rush.v1") };
  let meta = {};
  try {
    meta = JSON.parse(ls.get(SYNC(nuruId)) || "{}");
  } catch {
    /* start fresh */
  }
  const changed = local.hex !== (meta.hex ?? null) || local.rush !== (meta.rush ?? null);
  const res = await httpsCallable(functions, "alkeGameSync")({
    tz: new Date().getTimezoneOffset(),
    ...results(),
    progress: changed ? { hex: local.hex, rush: local.rush } : null,
  });
  const data = res.data || {};
  if (!data.ok) return data;

  // Another device saved newer progress and this one hasn't changed: take it.
  const server = data.progress || {};
  let mine = local;
  const empty = !local.hex && !local.rush;
  if ((empty || (!changed && server.savedAt && server.savedAt > (meta.at || 0))) && (server.hex || server.rush)) {
    if (server.hex) ls.set("alke.hex.v1", server.hex);
    if (server.rush) ls.set("alke.rush.v1", server.rush);
    mine = { hex: server.hex ?? local.hex, rush: server.rush ?? local.rush };
  }
  ls.set(SYNC(nuruId), JSON.stringify({ hex: mine.hex, rush: mine.rush, at: server.savedAt || Date.now() }));
  return data;
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
