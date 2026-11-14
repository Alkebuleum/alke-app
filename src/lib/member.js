/* ALKÉ member data.
 *
 *   nuru_people/{nuruId}     shared Nuru person: name, emojiColor (avatar tint)
 *   alke_members/{nuruId}    ALKÉ record: username (internal key, see memberKey), invitedBy, rules, sessions
 *   alke_usernames/{key}     { nuruId } — keeps that key unique
 *   alke_members/{id}/sessions/{n}         one record per session (history)
 *   alke_members/{id}/allocation/summary   server-written ALKE totals
 *   alke_members/{id}/entries/{id}         server-written ledger lines
 *   alke_scores/{nuruId}     game XP for the leaderboards
 *
 * Times that matter (rules accepted, sessions) are written as serverTimestamp()
 * and the Firestore rules require them to equal request.time, so the server's
 * clock decides when a session started and whether 24 hours have passed.
 * Rules for the two alke_ collections: firestore.alke.rules.
 */
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export const RULES_VERSION = 1;

/* Invites: a member's invite code is their Nuru ID, so their link is
   app.alke.network/join/<Nuru ID> (the same ID Nuru uses for referrals).
   The new member's record keeps it as invitedBy. */
export const inviteLink = (nuruId) => `https://app.alke.network/join/${nuruId}`;

/** The display name behind an invite code, or null if no such member. */
export async function inviterName(code) {
  const c = normInvite(code);
  if (!c) return null;
  try {
    const s = await getDoc(doc(db, "nuru_people", c));
    return s.exists() ? s.data().name || "an Alker" : null;
  } catch {
    return null;
  }
}
/** A wallet person's on-chain handle (Nuru's ain_cache), e.g. "kojo.alke";
    '' for members (no wallet → no handle). */
export async function handleOf(person) {
  const ain = person && person.ain;
  if (!ain) return "";
  try {
    const d = (await getDoc(doc(db, "ain_cache", ain))).data() || {};
    const h = String(d.primaryHandle || (typeof d.ansName === "string" ? d.ansName : "") || "").trim();
    return h ? (h.includes(".") ? h : `${h}.alke`) : "";
  } catch {
    return "";
  }
}

/** Display names for Nuru IDs (nuru_people), for lists like leaderboards. */
export async function namesOf(ids) {
  const out = {};
  await Promise.all(
    [...new Set(ids)].filter(Boolean).slice(0, 40).map(async (id) => {
      try {
        const s = await getDoc(doc(db, "nuru_people", id));
        if (s.exists() && s.data().name) out[id] = s.data().name;
      } catch {
        /* unreadable: falls back to "Alker" */
      }
    }),
  );
  return out;
}

export const SESSION_MS = 24 * 60 * 60 * 1000;
/** A session that starts within this long of the previous one keeps the streak. */
export const STREAK_MS = 48 * 60 * 60 * 1000;

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

/* Members sign up without a wallet, so they have no @handle (handles belong
   to wallet users and are registered on-chain). The record still needs a
   unique key in the username field (the rules require it), so it's derived
   from the Nuru ID and never shown. */
export const memberKey = (nuruId) => {
  const k = String(nuruId || "").toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 20);
  return k.length >= 3 ? k : `m.${k}`.padEnd(3, "0");
};

/**
 * Saves the display name and avatar colour on the shared Nuru person, then
 * creates the ALKÉ member record (keyed by memberKey) in one batch. The name
 * goes first: the app moves on as soon as the member record appears.
 */
export async function createMember(nuruId, { displayName, tint, invitedBy }) {
  const name = String(displayName || "").trim().slice(0, 60);
  if (!name) throw new Error("Enter the name other members will see.");
  await updateDoc(doc(db, "nuru_people", nuruId), { name, emojiColor: tint, updatedAt: serverTimestamp() });

  const u = memberKey(nuruId);
  const status = await usernameStatus(u, nuruId);
  if (status === "taken") throw new Error("Couldn't set up your profile. Contact support.");
  const inv = normInvite(invitedBy);
  const batch = writeBatch(db);
  if (status !== "mine") batch.set(doc(db, "alke_usernames", u), { nuruId, createdAt: serverTimestamp() });
  batch.set(doc(db, "alke_members", nuruId), {
    username: u,
    invitedBy: inv && inv !== nuruId ? inv : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function acceptRules(nuruId) {
  await updateDoc(doc(db, "alke_members", nuruId), {
    rulesVersion: RULES_VERSION,
    rulesAcceptedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** The streak a session started at [now] gets (the rules check the same). */
export function nextStreak(member, now = Date.now()) {
  const last = member?.lastSessionAt?.toMillis?.();
  if (!last) return 1;
  return now <= last + STREAK_MS ? (member.streak || 1) + 1 : 1;
}

/** The current streak as of [now]: 0 once the window to continue it has passed. */
export function liveStreak(member, now = Date.now()) {
  const last = member?.lastSessionAt?.toMillis?.();
  if (!last) return 0;
  return now <= last + STREAK_MS ? member.streak || 1 : 0;
}

/* A session start: member fields + sessions/{n}, in one write. The server's
   clock decides the streak; if ours disagrees right at the 48-hour edge the
   write is refused, so the other value is tried once. */
async function writeSession(nuruId, member, extra = {}) {
  const n = (member?.sessionCount || 0) + 1;
  const guess = nextStreak(member);
  const attempt = (streak) => {
    const b = writeBatch(db);
    b.update(doc(db, "alke_members", nuruId), {
      lastSessionAt: serverTimestamp(),
      sessionCount: n,
      streak,
      bestStreak: Math.max(member?.bestStreak || 0, streak),
      updatedAt: serverTimestamp(),
      ...extra,
    });
    b.set(doc(db, "alke_members", nuruId, "sessions", String(n)), { n, startedAt: serverTimestamp() });
    return b.commit();
  };
  try {
    await attempt(guess);
  } catch (e) {
    if (e?.code !== "permission-denied" || !member?.lastSessionAt) throw e;
    await attempt(guess === 1 ? (member.streak || 1) + 1 : 1);
  }
}

/** Ends onboarding; with startSession, also records the first session. */
export async function finishOnboarding(nuruId, member, { startSession }) {
  if (startSession) return writeSession(nuruId, member, { onboardedAt: serverTimestamp() });
  await updateDoc(doc(db, "alke_members", nuruId), { onboardedAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

/** Starts a 24-hour session. The rules refuse it while one is still running. */
export async function startSession(nuruId, member) {
  if (sessionRemaining(member) > 0) throw new Error("Your session is still running.");
  try {
    await writeSession(nuruId, member);
  } catch (e) {
    throw new Error(e?.code === "permission-denied" ? "Your next session isn't open yet." : e?.message || "Couldn't start the session. Try again.");
  }
}

/** The latest sessions, newest first. */
export function watchSessions(nuruId, cb, onError, count = 60) {
  const q = query(collection(db, "alke_members", nuruId, "sessions"), orderBy("n", "desc"), limit(count));
  return onSnapshot(q, (s) => cb(s.docs.map((d) => d.data({ serverTimestamps: "estimate" }))), onError);
}

/** Server-written ALKE totals ({ locked, verified, pending, claimable, claimed }), or null. */
/** Invites credited by the server: { joined, active } (functions/core.js). */
export function watchInvites(nuruId, cb, onError) {
  return onSnapshot(doc(db, "alke_members", nuruId, "allocation", "invites"), (s) => cb(s.exists() ? s.data() : null), onError);
}

export function watchAllocation(nuruId, cb, onError) {
  return onSnapshot(doc(db, "alke_members", nuruId, "allocation", "summary"), (s) => cb(s.exists() ? s.data() : null), onError);
}

/** Server-written ledger lines, newest first. */
export function watchEntries(nuruId, cb, onError, count = 60) {
  const q = query(collection(db, "alke_members", nuruId, "entries"), orderBy("at", "desc"), limit(count));
  return onSnapshot(q, (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

/** Milliseconds left in the current session, or 0. */
export function sessionRemaining(member, now = Date.now()) {
  const t = member?.lastSessionAt?.toMillis?.();
  if (!t) return 0;
  return Math.max(0, t + SESSION_MS - now);
}

/** Updates the display name and avatar colour on the shared Nuru person. */
export async function saveProfile(nuruId, { displayName, tint }) {
  const name = String(displayName || "").trim().slice(0, 60);
  if (!name) throw new Error("Enter the name other members will see.");
  await updateDoc(doc(db, "nuru_people", nuruId), { name, emojiColor: tint, updatedAt: serverTimestamp() });
}
