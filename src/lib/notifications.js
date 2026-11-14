/* Notifications feed, alert preferences and push (see functions/notify.js).
 *
 *   alke_members/{id}/notifications/{n}  server-written; members mark read / clear
 *   alke_members/{id}/settings/prefs     { reminders, games }
 *   alke_members/{id}/devices/{key}      this browser's push token
 *
 * Push on the web needs VITE_FCM_VAPID_KEY (Firebase console → Project
 * settings → Cloud Messaging → Web Push certificates). Inside the Nuru app,
 * pushes arrive through Nuru's own notifications instead.
 */
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { app, db } from "./firebase";
import { useAuth } from "../auth/AuthProvider";
import { isInsideNuru } from "./account";

const VAPID = import.meta.env.VITE_FCM_VAPID_KEY || "";

/** The latest notifications, live: { items, unread }. items undefined while loading. */
export function useNotifications(count = 50) {
  const { nuruId } = useAuth();
  const [items, setItems] = useState(undefined);
  useEffect(() => {
    if (!nuruId) return;
    const q = query(collection(db, "alke_members", nuruId, "notifications"), orderBy("at", "desc"), limit(count));
    return onSnapshot(
      q,
      (s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) }))),
      () => setItems([]),
    );
  }, [nuruId, count]);
  return { items, unread: (items || []).filter((n) => !n.read).length };
}

export async function markAllRead(nuruId, items) {
  const unread = (items || []).filter((n) => !n.read);
  for (let i = 0; i < unread.length; i += 400) {
    const b = writeBatch(db);
    unread.slice(i, i + 400).forEach((n) => b.update(doc(db, "alke_members", nuruId, "notifications", n.id), { read: true }));
    await b.commit();
  }
}

export const markRead = (nuruId, id) => updateDoc(doc(db, "alke_members", nuruId, "notifications", id), { read: true });

export async function clearAll(nuruId, items) {
  await Promise.all((items || []).map((n) => deleteDoc(doc(db, "alke_members", nuruId, "notifications", n.id))));
}

/* ── Preferences ──────────────────────────────────────────────────────── */

const DEFAULTS = { reminders: true, games: false };

/** [prefs, setPref(key, value)], saved on the server so every device agrees. */
export function usePrefs() {
  const { nuruId } = useAuth();
  const [prefs, setPrefs] = useState(DEFAULTS);
  useEffect(() => {
    if (!nuruId) return;
    return onSnapshot(
      doc(db, "alke_members", nuruId, "settings", "prefs"),
      (s) => setPrefs({ ...DEFAULTS, ...(s.exists() ? s.data() : {}) }),
      () => {},
    );
  }, [nuruId]);
  const set = async (key, value) => {
    const next = { reminders: !!prefs.reminders, games: !!prefs.games, [key]: !!value };
    setPrefs(next);
    await setDoc(doc(db, "alke_members", nuruId, "settings", "prefs"), { ...next, updatedAt: serverTimestamp() });
  };
  return [prefs, set];
}

/* ── Push on this browser ─────────────────────────────────────────────── */

/** "nuru" (Nuru delivers them) | "unsupported" | "off" | "granted" | "denied" | "default" */
export function pushState() {
  if (isInsideNuru()) return "nuru";
  if (!VAPID || typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  return Notification.permission;
}

const keyOf = (token) => token.slice(-40).replace(/[^A-Za-z0-9_-]/g, "_");

/** Asks for permission (from a tap) and registers this browser for pushes. */
export async function enablePush(nuruId) {
  if (pushState() === "unsupported" || pushState() === "nuru") return pushState();
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;
  const { getMessaging, getToken, isSupported } = await import("firebase/messaging");
  if (!(await isSupported())) return "unsupported";
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const token = await getToken(getMessaging(app), { vapidKey: VAPID, serviceWorkerRegistration: registration });
  if (!token) return "unsupported";
  await setDoc(doc(db, "alke_members", nuruId, "devices", keyOf(token)), { token, kind: "web", updatedAt: serverTimestamp() });
  return "granted";
}

/** Keeps this browser's token fresh when push is already allowed (call on start). */
export async function refreshPush(nuruId) {
  if (!nuruId || pushState() !== "granted") return;
  try {
    await enablePush(nuruId);
  } catch {
    /* best effort */
  }
}
