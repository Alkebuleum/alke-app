// Run: npm test (Firestore emulator). Seeds data, runs the server logic, checks results.
import test from "node:test";
import assert from "node:assert/strict";
import { initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { memberCreated, memberUpdated, recordBoost, recordSession, settleDay, shares, updateLive, warmDay } from "../core.js";

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
  assert.equal(e3.breakdown.length, 6); // pool, drills, streak, tap boost, rig boost, share
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

test("tap boost: needs a session, capped per day, multiplies that day's share", async () => {
  const D2 = "2026-11-13";
  const t = (h, m = 0) => Date.parse(`${D2}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`);
  await db.doc("alke_members/BB1").set({ username: "bb1", streak: 1, sessionCount: 1 });
  assert.equal((await recordBoost(db, "BB1", t(8))).reason, "no-session");

  await db.doc("alke_members/BB1").update({ lastSessionAt: Timestamp.fromMillis(t(8)) });
  await recordSession(db, "BB1", { n: 1, startedAt: Timestamp.fromMillis(t(8)) });
  assert.equal((await recordBoost(db, "BB1", t(9))).count, 1);
  assert.equal((await recordBoost(db, "BB1", t(9) + 500)).reason, "too-fast");
  let last;
  for (let i = 1; i <= 12; i++) last = await recordBoost(db, "BB1", t(9) + i * 3000);
  assert.equal(last.reason, "cap");
  assert.equal(last.count, 10);
  assert.equal(last.mult, 3);

  const r = await settleDay(db, D2);
  assert.equal(r.sessions, 1);
  assert.equal(r.total, 3); // 1 ALKE max × tap boost ×3
  const e = await get("alke_members/BB1/entries/s1");
  assert.equal(e.amount, 3);
  assert.ok(e.breakdown.some((b) => b.label === "Your tap boost" && b.value === "×3"));
});

test("rig boost: every 3 active invites add ×0.25 to the day's share, up to ×2", async () => {
  const D3 = "2026-11-14";
  const t = (h) => Timestamp.fromDate(new Date(`${D3}T${String(h).padStart(2, "0")}:00:00Z`));
  for (const [id, active] of [["RG1", 0], ["RG2", 7], ["RG3", 40]]) {
    await db.doc(`alke_members/${id}`).set({ username: id.toLowerCase(), streak: 1, sessionCount: 1, lastSessionAt: t(8) });
    await db.doc(`alke_members/${id}/allocation/invites`).set({ joined: active, active });
    await recordSession(db, id, { n: 1, startedAt: t(8) });
  }
  const r = await settleDay(db, D3);
  assert.equal(r.sessions, 3);
  assert.equal((await get("alke_members/RG1/entries/s1")).amount, 1); // starter rig
  assert.equal((await get("alke_members/RG2/entries/s1")).amount, 1.5); // 7 active → Level 2
  const e3 = await get("alke_members/RG3/entries/s1");
  assert.equal(e3.amount, 2); // capped at Level 4
  assert.ok(e3.breakdown.some((b) => b.label === "Your rig boost" && b.value === "×2" && b.note === "Level 4 rig"));
});
