/* Notifications: the in-app feed, plus a push to the member's devices.
 *
 *   alke_members/{id}/notifications/{n}  { kind, title, body, link, at, read }
 *   alke_members/{id}/settings/prefs     { reminders, games }   (member-written)
 *   alke_members/{id}/devices/{key}      { token, kind: "web", updatedAt } (member-written)
 *
 * Pushes go to the ALKE web app's tokens (devices) and to the Nuru app's
 * tokens for the same person (ain_cache/{nuruId or AIN}.fcmTokens), so a
 * member using ALKE inside Nuru gets them too. Push is best-effort: the feed
 * entry is the record.
 */
import { getMessaging } from "firebase-admin/messaging";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";

export const APP_URL = "https://app.alke.network";

/* Which preference allows a push of each kind (kinds not listed always push). */
const PREF_FOR = { session: "reminders", games: "games" };
const DEFAULT_PREFS = { reminders: true, games: false };
/* Kinds that only push and don't stay in the feed. */
const PUSH_ONLY = new Set(["games"]);

export async function prefsOf(db, id) {
  const s = await db.doc(`alke_members/${id}/settings/prefs`).get();
  return { ...DEFAULT_PREFS, ...(s.exists ? s.data() : {}) };
}

async function tokensOf(db, id) {
  const web = (await db.collection(`alke_members/${id}/devices`).get()).docs.map((d) => ({ token: d.get("token"), ref: d.ref }));
  // Nuru app tokens: the person's own id, and their AIN when they have one.
  const ids = new Set([id]);
  const person = await db.doc(`nuru_people/${id}`).get();
  const ain = person.exists ? person.get("ain") : null;
  if (typeof ain === "string" && ain) ids.add(ain);
  const nuru = [];
  for (const k of ids) {
    const s = await db.doc(`ain_cache/${k}`).get();
    if (s.exists) for (const t of s.get("fcmTokens") || []) if (typeof t === "string" && t) nuru.push(t);
  }
  return { web: web.filter((w) => typeof w.token === "string" && w.token), nuru: [...new Set(nuru)] };
}

async function push(db, id, { title, body, link, kind }) {
  const { web, nuru } = await tokensOf(db, id);
  const tokens = [...web.map((w) => w.token), ...nuru];
  if (!tokens.length) return 0;
  const url = `${APP_URL}${link || "/notifications"}`;
  const res = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: { app: "alke", kind: String(kind || ""), link: url },
    webpush: { fcmOptions: { link: url }, notification: { icon: `${APP_URL}/icon-192.png`, badge: `${APP_URL}/favicon-32.png` } },
    android: { priority: "high" },
  });
  // Forget web tokens the browser has dropped.
  const dead = [];
  res.responses.forEach((r, i) => {
    const code = r.error?.code || "";
    if (i < web.length && (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token")) dead.push(web[i].ref);
  });
  await Promise.all(dead.map((ref) => ref.delete().catch(() => {})));
  return res.successCount;
}

/**
 * Adds a notification to the member's feed and pushes it if their
 * preferences allow. Never throws: a failed push mustn't fail the caller.
 */
export async function notify(db, id, { kind, title, body, link = "/notifications" }) {
  try {
    if (!PUSH_ONLY.has(kind)) {
      await db.collection(`alke_members/${id}/notifications`).add({ kind, title, body, link, at: FieldValue.serverTimestamp(), read: false });
    }
    const pref = PREF_FOR[kind];
    if (pref && !(await prefsOf(db, id))[pref]) return;
    await push(db, id, { title, body, link, kind });
  } catch (e) {
    logger.warn("notify failed", { id, kind, error: String(e?.message || e) });
  }
}

/* ── Scheduled reminders ──────────────────────────────────────────────── */

const H = 60 * 60 * 1000;

/**
 * Members whose 24-hour session ended in the last `windowMs` and who haven't
 * been reminded for it: "Your next session is ready".
 */
export async function sendSessionReminders(db, now = Date.now(), windowMs = 15 * 60 * 1000) {
  const from = new Date(now - 24 * H - windowMs);
  const to = new Date(now - 24 * H);
  const snap = await db.collection("alke_members").where("lastSessionAt", ">", from).where("lastSessionAt", "<=", to).get();
  let sent = 0;
  for (const d of snap.docs) {
    const n = d.get("sessionCount") || 0;
    const mark = db.doc(`alke_members/${d.id}/settings/reminded`);
    const done = await mark.get();
    if (done.exists && done.get("session") === n) continue;
    await mark.set({ session: n, at: FieldValue.serverTimestamp() });
    await notify(db, d.id, {
      kind: "session",
      title: "Your next drill is ready",
      body: `Tap to start it and keep your ${d.get("streak") || 1}-day streak going.`,
      link: "/drill",
    });
    sent++;
  }
  return { checked: snap.size, sent };
}

/** Once a day: today's game challenges, for members who turned the alert on. */
export async function sendGameAlerts(db) {
  const snap = await db.collectionGroup("settings").where("games", "==", true).get();
  let sent = 0;
  for (const d of snap.docs) {
    if (d.id !== "prefs") continue;
    const id = d.ref.parent.parent.id;
    await notify(db, id, {
      kind: "games",
      title: "Today's games are ready",
      body: "A new ALKE Hex board and 5 scored Rush runs. Climb the leaderboards.",
      link: "/games",
    });
    sent++;
  }
  return { sent };
}
