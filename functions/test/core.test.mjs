// Run: npm test (Firestore emulator). Seeds data, runs the server logic, checks results.
import test from "node:test";
import assert from "node:assert/strict";
import { initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { memberCreated, memberUpdated, recordSession, settleDay, shares, updateLive, warmDay } from "../core.js";

initializeApp({ projectId: "demo-alke-fn" });
const db = getFirestore();
const DAY = "2026-11-12";
const at = (h) => Timestamp.fromDate(new Date(`${DAY}T${String(h).padStart(2, "0")}:00:00Z`));
const get = async (p) => (await db.doc(p).get()).data();

test("pool split: capped while few members, shared once many", () => {
  const few = shares(30000, [{ w: 1 }, { w: 1.1 }, { w: 1.25 }], 1);
  assert.deepEqual(few, [1, 1.1, 1.25]);
  const many = shares(30000, Array.from({ length: 150000 }, () => ({ w: 1 })), 1);
  assert.equal(many[0], 0.2);
  const total = many.reduce((a, b) => a + b, 0);
  assert.ok(total <= 30000 + 1e-6, `total ${total} over pool`);
});

test("a session is logged for its day and shows as pending", async () => {
  await db.doc("alke_members/AA1").set({ username: "aa1", streak: 1, sessionCount: 1, lastSessionAt: at(9) });
  await recordSession(db, "AA1", { n: 1, startedAt: at(9) });
  assert.deepEqual((await get(`alke_days/${DAY}/sessions/AA1`)).n, 1);
  assert.equal((await get("alke_members/AA1/entries/s1")).status, "pending");
});

test("settlement shares the pool by streak, locks it, and runs once", async () => {
  await db.doc("alke_members/AA2").set({ username: "aa2", streak: 7, sessionCount: 7, lastSessionAt: at(10) });
  await db.doc("alke_members/AA3").set({ username: "aa3", streak: 30, sessionCount: 30, lastSessionAt: at(11) });
  await recordSession(db, "AA2", { n: 7, startedAt: at(10) });
  await recordSession(db, "AA3", { n: 30, startedAt: at(11) });

  const r = await settleDay(db, DAY);
  assert.equal(r.sessions, 3);
  assert.equal(r.total, 3.35);
  const e3 = await get("alke_members/AA3/entries/s30");
  assert.equal(e3.status, "locked");
  assert.equal(e3.amount, 1.25);
  assert.equal(e3.breakdown.length, 4);
  assert.equal((await get("alke_members/AA1/allocation/summary")).locked, 1);
  assert.equal((await get("alke_network/genesis")).distributed["1"], 3.35);

  const again = await settleDay(db, DAY);
  assert.equal(again.skipped, true);
  assert.equal((await get("alke_members/AA1/allocation/summary")).locked, 1, "settled twice");
});

test("invites: joined on sign-up, active after 3 sessions", async () => {
  await memberCreated(db, "AA4", { invitedBy: "AA1" });
  await memberCreated(db, "AA5", { invitedBy: "AA1" });
  await memberCreated(db, "AA1", { invitedBy: "AA1" }); // own code: ignored
  await memberUpdated(db, "AA4", { sessionCount: 2, invitedBy: "AA1" }, { sessionCount: 3, invitedBy: "AA1" });
  await memberUpdated(db, "AA4", { sessionCount: 3, invitedBy: "AA1" }, { sessionCount: 4, invitedBy: "AA1" }); // counted once
  const inv = await get("alke_members/AA1/allocation/invites");
  assert.equal(inv.joined, 2);
  assert.equal(inv.active, 1);
});

test("warming: invites + games (capped), never above the cold balance", async () => {
  await db.doc("alke_scores/AA1").set({ hexXp: 100, rushXp: 0 });
  await db.doc("alke_members/AA1/allocation/summary").set({ lastXp: 5 }, { merge: true }); // gained 95 XP → games 0.3%
  const r = await warmDay(db, DAY);
  assert.ok(r.members >= 3);
  const a = await get("alke_members/AA1/allocation/summary");
  assert.equal(a.warmRate, 1.3); // 1 active invite (1%) + games 0.3%
  assert.equal(a.warmed, 0.013); // 1 ALKE × 1.3%
  assert.equal(a.lastXp, 100);
  assert.equal((await warmDay(db, DAY)).skipped, true);
});

test("live figures: members, mining now, today's estimate", async () => {
  const now = Date.parse(`${DAY}T12:00:00Z`);
  const live = await updateLive(db, now);
  assert.equal(live.members, 3);
  assert.equal(live.miningNow, 3);
  assert.equal(live.phase, 1);
  assert.equal(live.estPerSession, 1); // 30,000 / 3 → capped at 1 ALKE
  assert.ok(live.poolToday <= 30000);
});
