// The ALKÉ member flows against the live-shaped ruleset (Nuru's + ALKÉ's).
import { after, before, beforeEach, test } from "node:test";
import fs from "node:fs";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { Timestamp, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";

let env;
const AMA = "NAMA00000001";
const KOFI = "NKOF00000002";

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-alke-rules",
    firestore: { rules: fs.readFileSync(new URL("./combined.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8181 },
  });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    for (const id of [AMA, KOFI]) await setDoc(doc(ctx.firestore(), "nuru_people", id), { name: id, tier: "member" });
  });
});

const as = (nid) => env.authenticatedContext(`uid_${nid}`, { nid }).firestore();
const plain = () => env.authenticatedContext("anon").firestore();

/** A session start the way the app writes it: member fields + sessions/{n}. */
function session(db, nid, { n, streak, best, extra = {} }) {
  const b = writeBatch(db);
  b.update(doc(db, "alke_members", nid), { lastSessionAt: serverTimestamp(), sessionCount: n, streak, bestStreak: best, updatedAt: serverTimestamp(), ...extra });
  b.set(doc(db, "alke_members", nid, "sessions", String(n)), { n, startedAt: serverTimestamp() });
  return b.commit();
}
const hoursAgo = (h) => Timestamp.fromMillis(Date.now() - h * 3600e3);
const setMember = (nid, data) => env.withSecurityRulesDisabled((ctx) => updateDoc(doc(ctx.firestore(), "alke_members", nid), data));

function join(db, nid, username, extra = {}) {
  const b = writeBatch(db);
  b.set(doc(db, "alke_usernames", username), { nuruId: nid, createdAt: serverTimestamp() });
  b.set(doc(db, "alke_members", nid), { username, invitedBy: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra });
  return b.commit();
}

test("a member joins: username + member record in one batch", async () => {
  await assertSucceeds(join(as(AMA), AMA, "ama.builds"));
  await assertSucceeds(getDoc(doc(as(AMA), "alke_members", AMA)));
});

test("only the member reads their record", async () => {
  await join(as(AMA), AMA, "ama.builds");
  await assertFails(getDoc(doc(as(KOFI), "alke_members", AMA)));
  await assertFails(getDoc(doc(plain(), "alke_members", AMA)));
});

test("a signed-in session without a Nuru ID can't join", async () => {
  const db = plain();
  await assertFails(join(db, "anon", "anon.user"));
});

test("usernames are unique", async () => {
  await join(as(AMA), AMA, "ama.builds");
  await assertFails(join(as(KOFI), KOFI, "ama.builds"));
  await assertSucceeds(join(as(KOFI), KOFI, "kofi"));
});

test("no claiming a username without the matching member record", async () => {
  const db = as(KOFI);
  await assertFails(setDoc(doc(db, "alke_usernames", "squat"), { nuruId: KOFI, createdAt: serverTimestamp() }));
});

test("no joining as someone else, or with a bad username", async () => {
  await assertFails(join(as(KOFI), AMA, "ama.builds"));
  await assertFails(join(as(AMA), AMA, "Bad Name!"));
  await assertFails(join(as(AMA), AMA, "ama", { sessionCount: 99 }));
});

test("rules acceptance must carry the server time", async () => {
  const db = as(AMA);
  await join(db, AMA, "ama.builds");
  await assertFails(updateDoc(doc(db, "alke_members", AMA), { rulesVersion: 1, rulesAcceptedAt: Timestamp.fromMillis(0), updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(doc(db, "alke_members", AMA), { rulesVersion: 1, rulesAcceptedAt: serverTimestamp(), updatedAt: serverTimestamp() }));
});

test("first session: onboarding + session 1, then no second session within 24h", async () => {
  const db = as(AMA);
  await join(db, AMA, "ama.builds");
  await assertSucceeds(session(db, AMA, { n: 1, streak: 1, best: 1, extra: { onboardedAt: serverTimestamp() } }));
  await assertSucceeds(getDoc(doc(db, "alke_members", AMA, "sessions", "1")));
  await assertFails(session(db, AMA, { n: 2, streak: 2, best: 2 }));
  await assertFails(updateDoc(doc(db, "alke_members", AMA), { onboardedAt: serverTimestamp(), updatedAt: serverTimestamp() }));
});

test("a session needs its record; counts can't be forged", async () => {
  const db = as(AMA);
  await join(db, AMA, "ama.builds");
  await setMember(AMA, { lastSessionAt: hoursAgo(30), sessionCount: 3, streak: 3, bestStreak: 5 });
  const ref = doc(db, "alke_members", AMA);
  // member fields alone, no sessions/{n}
  await assertFails(updateDoc(ref, { lastSessionAt: serverTimestamp(), sessionCount: 4, streak: 4, bestStreak: 5, updatedAt: serverTimestamp() }));
  await assertFails(session(db, AMA, { n: 10, streak: 4, best: 5 }));
  await assertSucceeds(session(db, AMA, { n: 4, streak: 4, best: 5 }));
});

test("streak: continues within 48h, resets after; best streak is kept", async () => {
  const db = as(AMA);
  await join(db, AMA, "ama.builds");
  await setMember(AMA, { lastSessionAt: hoursAgo(30), sessionCount: 3, streak: 5, bestStreak: 5 });
  await assertFails(session(db, AMA, { n: 4, streak: 9, best: 9 }));
  await assertFails(session(db, AMA, { n: 4, streak: 6, best: 5 }));
  await assertSucceeds(session(db, AMA, { n: 4, streak: 6, best: 6 }));

  await setMember(AMA, { lastSessionAt: hoursAgo(50) });
  await assertFails(session(db, AMA, { n: 5, streak: 7, best: 7 }));
  await assertSucceeds(session(db, AMA, { n: 5, streak: 1, best: 6 }));
});

test("session records: only by their owner, only with a real session", async () => {
  const db = as(AMA);
  await join(db, AMA, "ama.builds");
  await assertFails(setDoc(doc(db, "alke_members", AMA, "sessions", "1"), { n: 1, startedAt: serverTimestamp() }));
  await session(db, AMA, { n: 1, streak: 1, best: 1 });
  await assertFails(getDoc(doc(as(KOFI), "alke_members", AMA, "sessions", "1")));
  await assertFails(getDoc(doc(plain(), "alke_members", AMA, "sessions", "1")));
});

test("allocation and entries: read by the member, written only by the server", async () => {
  await env.withSecurityRulesDisabled((ctx) =>
    setDoc(doc(ctx.firestore(), "alke_members", AMA, "allocation", "summary"), { locked: 31.2, verified: 2.4, pending: 0.2 }),
  );
  await assertSucceeds(getDoc(doc(as(AMA), "alke_members", AMA, "allocation", "summary")));
  await assertFails(getDoc(doc(as(KOFI), "alke_members", AMA, "allocation", "summary")));
  await assertFails(getDoc(doc(plain(), "alke_members", AMA, "allocation", "summary")));
  await assertFails(setDoc(doc(as(AMA), "alke_members", AMA, "allocation", "summary"), { locked: 1e6 }));
  await assertFails(setDoc(doc(as(AMA), "alke_members", AMA, "entries", "x"), { amount: 5 }));
});

test("game scores: server-written, read by members only", async () => {
  const db = as(AMA);
  await join(db, AMA, "ama.builds");
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "alke_scores", AMA), { hexXp: 120, rushXp: 180 });
  });
  await assertSucceeds(getDoc(doc(as(KOFI), "alke_scores", AMA)));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "alke_scores", AMA)));
  await assertFails(setDoc(doc(db, "alke_scores", AMA), { hexXp: 99999 }));
  await assertFails(setDoc(doc(as(KOFI), "alke_scores", AMA), { hexXp: 1 }));
});

test("identity records, team list and config are never readable", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const f = ctx.firestore();
    await setDoc(doc(f, "alke_verifications", "x"), { idHash: "h" });
    await setDoc(doc(f, "alke_admins", AMA), { at: 1 });
    await setDoc(doc(f, "alke_config", "verification"), { stripeCountries: [] });
  });
  for (const fs_ of [as(AMA), env.unauthenticatedContext().firestore()]) {
    await assertFails(getDoc(doc(fs_, "alke_verifications", "x")));
    await assertFails(getDoc(doc(fs_, "alke_admins", AMA)));
    await assertFails(getDoc(doc(fs_, "alke_config", "verification")));
  }
});

test("username can't be changed or released", async () => {
  const db = as(AMA);
  await join(db, AMA, "ama.builds");
  await assertFails(updateDoc(doc(db, "alke_members", AMA), { username: "other", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(db, "alke_usernames", "ama.builds"), { nuruId: KOFI }));
});

test("profile name and avatar tint go on the shared Nuru person", async () => {
  await assertSucceeds(updateDoc(doc(as(AMA), "nuru_people", AMA), { name: "Ama Owusu", emojiColor: 3, updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(as(KOFI), "nuru_people", AMA), { name: "Not Ama" }));
});

test("server-only Genesis data: day logs and settlements are private, network figures public", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const f = ctx.firestore();
    await setDoc(doc(f, "alke_days", "2026-11-12", "sessions", AMA), { n: 1 });
    await setDoc(doc(f, "alke_settlements", "2026-11-12"), { total: 1 });
    await setDoc(doc(f, "alke_network", "live"), { members: 1 });
    await setDoc(doc(f, "alke_members", AMA, "allocation", "invites"), { joined: 1 });
  });
  await assertFails(getDoc(doc(as(KOFI), "alke_days", "2026-11-12", "sessions", AMA)));
  await assertFails(getDoc(doc(as(AMA), "alke_days", "2026-11-12", "sessions", AMA)));
  await assertFails(getDoc(doc(as(AMA), "alke_settlements", "2026-11-12")));
  await assertFails(setDoc(doc(as(AMA), "alke_network", "live"), { members: 9 }));
  await assertSucceeds(getDoc(doc(as(KOFI), "alke_network", "live")));
  await assertSucceeds(getDoc(doc(as(AMA), "alke_members", AMA, "allocation", "invites")));
  await assertFails(getDoc(doc(as(KOFI), "alke_members", AMA, "allocation", "invites")));
  await assertFails(setDoc(doc(as(AMA), "alke_members", AMA, "allocation", "invites"), { joined: 99 }));
});
