// Run: npm run test:signup (Firestore + Auth emulators). Email sending is
// replaced by a stub that keeps the last message, so the code can be read.
import test from "node:test";
import assert from "node:assert/strict";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { createAccount, reserveAlkerId, sendCode, verifyCode } from "../signup.js";

initializeApp({ projectId: "demo-alke-fn" });
const db = getFirestore();

let last = null;
globalThis.fetch = async (url, init) => {
  last = { url, body: JSON.parse(init.body) };
  return { ok: true, json: async () => ({}), text: async () => "" };
};
const lastCode = () => /letter-spacing:\.3em[^>]*>(\d{6})</.exec(last.body.htmlContent)[1];
const rejects = (p, re) => assert.rejects(p, (e) => re.test(e.message));

test("a code goes out, wrong tries are counted, the right one gives a ticket", async () => {
  await sendCode(db, "key", "Ama@Example.com", "1.1.1.1");
  assert.equal(last.body.to[0].email, "ama@example.com");
  const code = lastCode();
  const wrong = code === "000000" ? "111111" : "000000";
  await rejects(verifyCode(db, { email: "ama@example.com", code: wrong }), /4 tries left/);
  await rejects(verifyCode(db, { email: "ama@example.com", code: wrong }), /3 tries left/);
  const res = await verifyCode(db, { email: "ama@example.com", code });
  assert.equal(res.status, "new");
  assert.ok(res.ticket.length > 30);
  // used up
  await rejects(verifyCode(db, { email: "ama@example.com", code }), /expired/);

  // the ticket creates a verified login, once
  await createAccount(db, { ticket: res.ticket, password: "a long phrase", name: "Ama Owusu" });
  const user = await getAuth().getUserByEmail("ama@example.com");
  assert.equal(user.emailVerified, true);
  assert.equal(user.displayName, "Ama Owusu");
  await rejects(createAccount(db, { ticket: res.ticket, password: "a long phrase", name: "Ama" }), /expired/);
});

test("a second code right away is refused", async () => {
  await sendCode(db, "key", "kofi@example.com", "2.2.2.2");
  await rejects(sendCode(db, "key", "kofi@example.com", "2.2.2.2"), /Wait \d+ seconds/);
});

test("five wrong tries lock the code", async () => {
  await sendCode(db, "key", "esi@example.com", "3.3.3.3");
  const code = lastCode();
  const wrong = code === "000000" ? "111111" : "000000";
  for (let i = 0; i < 5; i++) await verifyCode(db, { email: "esi@example.com", code: wrong }).catch(() => {});
  await rejects(verifyCode(db, { email: "esi@example.com", code }), /Too many wrong tries/);
});

test("an existing unverified password account is confirmed, not duplicated", async () => {
  await getAuth().createUser({ email: "yaw@example.com", password: "old password", emailVerified: false });
  await sendCode(db, "key", "yaw@example.com", "4.4.4.4");
  const res = await verifyCode(db, { email: "yaw@example.com", code: lastCode() });
  assert.equal(res.status, "password");
  assert.equal(res.ticket, undefined);
  assert.equal((await getAuth().getUserByEmail("yaw@example.com")).emailVerified, true);
});

test("signed in with that email: the login is marked verified", async () => {
  const u = await getAuth().createUser({ email: "abena@example.com", password: "old password", emailVerified: false });
  await sendCode(db, "key", "abena@example.com", "5.5.5.5");
  const res = await verifyCode(db, { email: "abena@example.com", code: lastCode() }, { uid: u.uid, token: { email: "abena@example.com" } });
  assert.equal(res.status, "verified");
  assert.equal((await getAuth().getUser(u.uid)).emailVerified, true);
});

test("Alker ID: reserved once, unique, mapped to the Nuru ID and AIN", async () => {
  await rejects(reserveAlkerId(db, "NOBODY"), /Finish creating/);
  await db.doc("alke_members/N1").set({ username: "n1" });
  await db.doc("nuru_people/N1").set({ name: "Ama", ain: "0xabc" });
  const { alkerId } = await reserveAlkerId(db, "N1");
  assert.match(alkerId, /^ALK-\d{4}-\d{4}-\d{4}$/);
  assert.equal((await reserveAlkerId(db, "N1")).alkerId, alkerId);
  const map = (await db.doc(`alke_config/alker_ids/taken/${alkerId}`).get()).data();
  assert.equal(map.nuruId, "N1");
  assert.equal(map.ain, "0xabc");
  assert.equal((await db.doc("alke_members/N1").get()).get("alkerId"), alkerId);
});
