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
  const ref = doc(db, "alke_members", AMA);
  await assertSucceeds(updateDoc(ref, { onboardedAt: serverTimestamp(), lastSessionAt: serverTimestamp(), sessionCount: increment(1), updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(ref, { lastSessionAt: serverTimestamp(), sessionCount: increment(1), updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(ref, { onboardedAt: serverTimestamp(), updatedAt: serverTimestamp() }));
});

test("a session after 24 hours is allowed; counts can't be forged", async () => {
  const db = as(AMA);
  await join(db, AMA, "ama.builds");
  await env.withSecurityRulesDisabled((ctx) =>
    updateDoc(doc(ctx.firestore(), "alke_members", AMA), { lastSessionAt: Timestamp.fromMillis(Date.now() - 25 * 3600e3), sessionCount: 3 }),
  );
  const ref = doc(db, "alke_members", AMA);
  await assertFails(updateDoc(ref, { lastSessionAt: serverTimestamp(), sessionCount: 10, updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref, { lastSessionAt: serverTimestamp(), sessionCount: increment(1), updatedAt: serverTimestamp() }));
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
