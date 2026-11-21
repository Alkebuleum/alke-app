// Run: npm run test:signup (Firestore + Auth emulators).
import test from "node:test";
import assert from "node:assert/strict";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { communityStatus, creditCommunity } from "../community.js";

if (!getApps().length) initializeApp({ projectId: "demo-alke-fn" });
const db = getFirestore();

test("each channel adds 300 ALKE once, into the same locked balance", async () => {
  await assert.rejects(creditCommunity(db, "C0", "x"), /Finish creating/);
  await db.doc("alke_members/C1").set({ username: "c1" });
  await db.doc("alke_members/C1/allocation/summary").set({ locked: 12.5 });
  const a = await creditCommunity(db, "C1", "x");
  assert.deepEqual([a.credited, a.amount, a.locked], [true, 300, 312.5]);
  const again = await creditCommunity(db, "C1", "x");
  assert.equal(again.credited, false);
  await creditCommunity(db, "C1", "telegram");
  assert.equal((await db.doc("alke_members/C1/allocation/summary").get()).get("locked"), 612.5);
  const e = (await db.doc("alke_members/C1/entries/c_x").get()).data();
  assert.equal(e.kind, "community");
  assert.equal(e.amount, 300);
  assert.equal(e.status, "locked");
  assert.deepEqual((await communityStatus(db, "C1")).done.sort(), ["telegram", "x"]);
  await assert.rejects(creditCommunity(db, "C1", "tiktok"), /Unknown community/);
});

test("tapping twice at once still credits only once", async () => {
  await db.doc("alke_members/C2").set({ username: "c2" });
  const r = await Promise.all([creditCommunity(db, "C2", "x"), creditCommunity(db, "C2", "x"), creditCommunity(db, "C2", "x")]);
  assert.equal(r.filter((x) => x.credited).length, 1);
  assert.equal((await db.doc("alke_members/C2/allocation/summary").get()).get("locked"), 300);
});
