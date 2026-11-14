// node --test test/games.test.mjs  (no emulator needed: pure checks only)
import { test } from "node:test";
import assert from "node:assert/strict";
import { applyResults, LIMITS } from "../games.js";

const now = Date.UTC(2026, 10, 14, 12);
const won = (t, xp, extra = {}) => ({ t, result: "won", xp, ...extra });

test("first sync only marks existing results as seen", () => {
  const r = applyResults({}, { tz: 0, hex: [won(now - 1000, 100)] }, now);
  assert.equal(r.migrating, true);
  assert.equal(r.hexAdd, 0);
  assert.equal(r.seen.length, 1);
});

test("counts new results once, rejects repeats and impossible scores", () => {
  const state = { migratedAt: 1, seen: ["hex:" + (now - 5000)] };
  const r = applyResults(state, { tz: 0, hex: [won(now - 5000, 100), won(now - 4000, 120), won(now - 3000, 9999)] }, now);
  assert.equal(r.hexAdd, 120);
  assert.equal(r.accepted, 1);
  assert.equal(r.rejected, 1);
});

test("daily board result sets today's board unless practice", () => {
  const s = { migratedAt: 1 };
  assert.deepEqual(applyResults(s, { tz: 0, hex: [won(now - 1000, 80, { kind: "daily", time: 70 })] }, now).hexDaily, { day: "2026-11-14", xp: 80, time: 70 });
  assert.equal(applyResults(s, { tz: 0, hex: [won(now - 1000, 0, { kind: "daily", practice: true })] }, now).hexDaily, null);
});

test("rush: 5 scored runs a day, bonus capped, practice never scores", () => {
  const runs = Array.from({ length: 7 }, (_, i) => ({ t: now - (i + 1) * 1000, result: "banked", xp: 200, bonus: i === 0 ? 50 : 0 }));
  runs.push({ t: now - 9000, result: "banked", xp: 500, practice: true });
  const r = applyResults({ migratedAt: 1 }, { tz: 0, rush: runs }, now);
  assert.equal(r.rushAdd, 5 * 200 + 50);
  assert.equal(r.rushBest["2026-11-14"], 200);
  assert.ok(LIMITS.rush.scored === 5);
});

test("results from the future or too long ago are ignored", () => {
  const r = applyResults({ migratedAt: 1 }, { tz: 0, hex: [won(now + 60 * 60 * 1000, 50), won(now - 10 * 86400000, 50)] }, now);
  assert.equal(r.hexAdd, 0);
  assert.equal(r.accepted + r.rejected, 0);
});
