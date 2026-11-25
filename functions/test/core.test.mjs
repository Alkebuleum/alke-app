// Run: npm test (Firestore emulator). Seeds data, runs the server logic, checks results.
import test from "node:test";
import assert from "node:assert/strict";
import { initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { dayPayouts, memberCreated, memberUpdated, recordBoost, recordSession, settleDay, shares, updateLive, warmDay } from "../core.js";
import { BRACKETS, PHASES, bracketDrill, currentBracket } from "../genesis.js";

initializeApp({ projectId: "demo-alke-fn" });
const db = getFirestore();
const DAY = "2026-11-12";
const at = (h) => Timestamp.fromDate(new Date(`${DAY}T${String(h).padStart(2, "0")}:00:00Z`));
const get = async (p) => (await db.doc(p).get()).data();
const G = PHASES[0];
const B1 = BRACKETS[0];
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-5, `${a} != ${b}`);

test("Genesis brackets: by total members, and a spent budget moves on early", () => {
  assert.equal(currentBracket(G, 1).n, 1);
  assert.equal(currentBracket(G, 100).n, 1);
  assert.equal(currentBracket(G, 101).n, 2);
  assert.equal(currentBracket(G, 1000).n, 3);
  assert.equal(currentBracket(G, 5000).n, 4);
  assert.equal(currentBracket(G, 5001).n, 5);
  assert.equal(currentBracket(G, 40, { 1: 400_000 }).n, 2, "bracket 1 budget spent");
  assert.equal(currentBracket(PHASES[1], 300_000), null, "no brackets after Phase 1");
  const budgets = BRACKETS.reduce((a, b) => a + (b.budget || 0), 0);
  assert.ok(budgets < G.pool, "fixed brackets leave pool for bracket 5");
});

test("fixed bracket drill reward: low at ×1, high with every boost", () => {
  assert.equal(bracketDrill(B1, 1), 300);
  assert.equal(bracketDrill(B1, 7.5), 500);
  assert.equal(bracketDrill(B1, 20), 500);
  assert.ok(bracketDrill(B1, 3) > 300 && bracketDrill(B1, 3) < 500);
});

test("invite match: active invitees only, inviter must drill, capped at the inviter's drill, scaled to the cap", () => {
  const rows = [
    { id: "A", w: 1, n: 5 },
    { id: "B", w: 7.5, n: 4, by: "A" }, // active: 75% of 500 = 375, capped at A's 300
    { id: "C", w: 1, n: 2, by: "A" }, // not active yet
    { id: "D", w: 1, n: 9, by: "Z" }, // inviter didn't drill
    { id: "E", w: 1, n: 3, by: "E" }, // own code
  ];
  const p = dayPayouts(rows, { phase: G, bracket: B1, cap: 1e9 });
  assert.equal(p.match.A, 300);
  assert.equal(p.from.A, 1);
  assert.equal(Object.keys(p.match).length, 1);
  close(p.total, 300 + 500 + 300 + 300 + 300 + 300);

  const tight = dayPayouts(rows, { phase: G, bracket: B1, cap: 1000 });
  assert.ok(tight.scale < 1);
  assert.ok(tight.total <= 1000 + 1e-6);

  // Bracket 5: the day's pool shared (cap 5 × weight), 5% match, all within the day's pool.
  const b5 = currentBracket(G, 9000);
  const many = Array.from({ length: 10_000 }, (_, i) => ({ id: `M${i}`, w: 1, n: 5, by: i ? "M0" : null }));
  const q = dayPayouts(many, { phase: G, bracket: b5, cap: 30_000 });
  assert.ok(q.total <= 30_000 + 1e-6);
  assert.equal(q.match.M0, q.drill.M0, "match capped at own drill");
});

test("pool split (bracket 5 and later phases): capped while few, shared once many", () => {
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
  assert.equal(r.bracket, 1);
  const want = bracketDrill(B1, 1) + bracketDrill(B1, 1.1) + bracketDrill(B1, 1.25);
  close(r.total, want);
  const e3 = await get("alke_members/AA3/entries/s30");
  assert.equal(e3.status, "locked");
  assert.equal(e3.amount, bracketDrill(B1, 1.25));
  assert.equal(e3.breakdown.length, 6); // bracket, drills, streak, tap boost, rig boost, reward
  assert.equal(e3.breakdown[0].value, "Bracket 1");
  assert.equal((await get("alke_members/AA1/allocation/summary")).locked, 300);
  const gen = await get("alke_network/genesis");
  close(gen.distributed["1"], want);
  close(gen.spent["1"], want);

  const again = await settleDay(db, DAY);
  assert.equal(again.skipped, true);
  assert.equal((await get("alke_members/AA1/allocation/summary")).locked, 300, "settled twice");
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
  assert.equal(a.warmed, 3.9); // 300 ALKE × 1.3%
  assert.equal(a.lastXp, 100);
  assert.equal((await warmDay(db, DAY)).skipped, true);
});

test("live figures: members, mining now, today's estimate", async () => {
  const now = Date.parse(`${DAY}T12:00:00Z`);
  const live = await updateLive(db, now);
  assert.equal(live.members, 3);
  assert.equal(live.miningNow, 3);
  assert.equal(live.phase, 1);
  assert.equal(live.estPerSession, 300); // bracket 1's low end
  assert.deepEqual(live.bracket.drill, [300, 500]);
  assert.equal(live.bracket.match, 0.75);
  assert.equal(live.bracket.upTo, 100);
  assert.ok(live.bracket.left < B1.budget);
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
  const e = await get("alke_members/BB1/entries/s1");
  assert.equal(e.amount, bracketDrill(B1, 3)); // tap boost ×3 moves it up the bracket's range
  assert.equal(r.total, e.amount);
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
  assert.equal((await get("alke_members/RG1/entries/s1")).amount, 300); // starter rig
  assert.equal((await get("alke_members/RG2/entries/s1")).amount, bracketDrill(B1, 1.5)); // 7 active → Level 2
  const e3 = await get("alke_members/RG3/entries/s1");
  assert.equal(e3.amount, bracketDrill(B1, 2)); // capped at Level 4
  assert.ok(e3.breakdown.some((b) => b.label === "Your rig boost" && b.value === "×2" && b.note === "Level 4 rig"));
});

test("settlement pays the invite match to an inviter who drilled, as its own ledger line", async () => {
  const D4 = "2026-11-15";
  const t = (h) => Timestamp.fromDate(new Date(`${D4}T${String(h).padStart(2, "0")}:00:00Z`));
  await db.doc("alke_members/MT1").set({ username: "mt1", streak: 1, sessionCount: 4, lastSessionAt: t(8) });
  await db.doc("alke_members/MT2").set({ username: "mt2", streak: 1, sessionCount: 3, lastSessionAt: t(9), invitedBy: "MT1" });
  await db.doc("alke_members/MT3").set({ username: "mt3", streak: 1, sessionCount: 1, lastSessionAt: t(9), invitedBy: "MT1" });
  await recordSession(db, "MT1", { n: 4, startedAt: t(8) });
  await recordSession(db, "MT2", { n: 3, startedAt: t(9) });
  await recordSession(db, "MT3", { n: 1, startedAt: t(9) });
  const before = (await get("alke_network/genesis")).spent["1"];

  const r = await settleDay(db, D4);
  assert.equal(r.matched, 225); // 75% of MT2's 300; MT3 isn't active yet
  const m = await get(`alke_members/MT1/entries/m${D4}`);
  assert.equal(m.kind, "match");
  assert.equal(m.amount, 225);
  assert.equal(m.status, "locked");
  assert.equal((await get("alke_members/MT1/allocation/summary")).locked, 525); // own 300 + match 225
  assert.equal((await get("alke_members/MT2/allocation/summary")).locked, 300); // the invitee loses nothing
  close((await get("alke_network/genesis")).spent["1"] - before, 900 + 225);
});
