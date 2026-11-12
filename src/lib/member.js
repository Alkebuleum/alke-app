/* ALKÉ member data.
 *
 *   nuru_people/{nuruId}     shared Nuru person: name, emojiColor (avatar tint)
 *   alke_members/{nuruId}    ALKÉ record: username, invitedBy, rules, sessions
 *   alke_usernames/{name}    { nuruId } — one username per member, unique
 *
 * Times that matter (rules accepted, sessions) are written as serverTimestamp()
 * and the Firestore rules require them to equal request.time, so the server's
 * clock decides when a session started and whether 24 hours have passed.
 * Rules for the two alke_ collections: firestore.alke.rules.
 */
import {
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export const RULES_VERSION = 1;
export const SESSION_MS = 24 * 60 * 60 * 1000;

/* Avatar colours offered at sign-up, as indexes into Nuru's tint palette
   (NuruColors.tints) so the person looks the same in Nuru. */
export const AVATAR_COLORS = [
  { tint: 0, hex: "#A586F7", bg: "#211A3A", label: "Violet" },
  { tint: 3, hex: "#EDB95A", bg: "#372C1A", label: "Gold" },
  { tint: 5, hex: "#72D3A0", bg: "#1E302C", label: "Green" },
  { tint: 1, hex: "#84B1F7", bg: "#1F2A45", label: "Blue" },
  { tint: 7, hex: "#F07AB8", bg: "#3A1A2E", label: "Pink" },
];
const ALL_TINTS = ["#A586F7", "#84B1F7", "#22BFAF", "#EDB95A", "#F06A6A", "#72D3A0", "#B9A2F6", "#F07AB8"];
export const tintHex = (i) => ALL_TINTS[Number.isInteger(i) && i >= 0 ? i % ALL_TINTS.length : 0];

export const USERNAME_RE = /^[a-z0-9._]{3,20}$/;
export const normUsername = (s) => String(s || "").trim().replace(/^@/, "").toLowerCase();
export const normInvite = (s) => String(s || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);

export function initialsOf(name, fallback = "") {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  const s = words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return s || String(fallback || "A")[0].toUpperCase();
}

export function watchPerson(nuruId, cb, onError) {
  return onSnapshot(doc(db, "nuru_people", nuruId), (s) => cb(s.exists() ? s.data({ serverTimestamps: "estimate" }) : null), onError);
}

export function watchMember(nuruId, cb, onError) {
  return onSnapshot(doc(db, "alke_members", nuruId), (s) => cb(s.exists() ? s.data({ serverTimestamps: "estimate" }) : null), onError);
}

/** "available" | "taken" | "mine" | "invalid" */
export async function usernameStatus(name, nuruId) {
  const u = normUsername(name);
  if (!USERNAME_RE.test(u)) return "invalid";
  const snap = await getDoc(doc(db, "alke_usernames", u));
  if (!snap.exists()) return "available";
  return snap.data().nuruId === nuruId ? "mine" : "taken";
}

/**
 * Creates the ALKÉ member record and reserves the username in one batch, then
 * saves the display name and avatar colour on the shared Nuru person.
 */
export async function createMember(nuruId, { username, displayName, tint, invitedBy }) {
  const u = normUsername(username);
  if (!USERNAME_RE.test(u)) throw new Error("Use 3 to 20 letters, numbers, dots or underscores.");
  const status = await usernameStatus(u, nuruId);
  if (status === "taken") throw new Error("That username is taken. Try another.");

  const batch = writeBatch(db);
  if (status !== "mine") batch.set(doc(db, "alke_usernames", u), { nuruId, createdAt: serverTimestamp() });
  batch.set(doc(db, "alke_members", nuruId), {
    username: u,
    invitedBy: normInvite(invitedBy) || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();

  const person = { emojiColor: tint, updatedAt: serverTimestamp() };
  const name = String(displayName || "").trim().slice(0, 60);
  if (name) person.name = name;
  await updateDoc(doc(db, "nuru_people", nuruId), person);
}

export async function acceptRules(nuruId) {
  await updateDoc(doc(db, "alke_members", nuruId), {
    rulesVersion: RULES_VERSION,
    rulesAcceptedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Ends onboarding; with startSession, also records the first session. */
export async function finishOnboarding(nuruId, { startSession }) {
  const data = { onboardedAt: serverTimestamp(), updatedAt: serverTimestamp() };
  if (startSession) Object.assign(data, { lastSessionAt: serverTimestamp(), sessionCount: increment(1) });
  await updateDoc(doc(db, "alke_members", nuruId), data);
}

/** Starts a 24-hour session. The rules refuse it while one is still running. */
export async function startSession(nuruId) {
  await updateDoc(doc(db, "alke_members", nuruId), {
    lastSessionAt: serverTimestamp(),
    sessionCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}

/** Milliseconds left in the current session, or 0. */
export function sessionRemaining(member, now = Date.now()) {
  const t = member?.lastSessionAt?.toMillis?.();
  if (!t) return 0;
  return Math.max(0, t + SESSION_MS - now);
}
