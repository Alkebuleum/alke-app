// Run: npm run test:ambassador (Firestore emulator). Seeds members and referrals, runs the Ambassador flow.
import test from "node:test";
import assert from "node:assert/strict";
import { initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { adminAction, memberAction, referrals, config } from "../ambassador.js";

initializeApp({ projectId: "demo-alke-amb" });
const db = getFirestore();
const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.now() - 60 * DAY;
const ts = (ms) => Timestamp.fromMillis(ms);

/** A referral of [by] who joined at T0 and drilled [n] times, the 7th on day [day7]. */
async function referral(id, by, n, day7 = 10) {
  await db.doc(`alke_members/${id}`).set({ username: id.toLowerCase(), invitedBy: by, sessionCount: n, createdAt: ts(T0) });
  if (n >= 7) await db.doc(`alke_members/${id}/sessions/7`).set({ n: 7, startedAt: ts(T0 + day7 * DAY) });
}

const AGREED = { performance: true, review: true, identity: true, nuru: true, conduct: true, age: true };
const FORM = { fullName: "Ada Obi", region: "Lagos", city: "Ikeja", languages: "English, Yoruba", experience: "Ran a 2k-member student group", why: "Grow ALKÉ in Lagos", strategy: "Campus meetups", agreed: AGREED };

test("referrals: only 7 drills within 30 days of joining qualify", async () => {
  await db.doc("alke_members/AM0").set({ username: "am0", sessionCount: 3, createdAt: ts(T0) });
  await referral("R1", "AM0", 7, 10); // qualifies
  await referral("R2", "AM0", 9, 40); // 7th drill too late
  await referral("R3", "AM0", 4); // not yet
  const r = await referrals(db, "AM0", await config(db));
  assert.equal(r.joined, 3);
  assert.equal(r.qualified, 1);
});

test("not eligible: checklist shows progress and apply is refused", async () => {
  let res = await memberAction(db, "AM0", { action: "get" });
  assert.equal(res.eligibility.ok, false);
  const days = res.eligibility.items.find((i) => i.id === "days");
  assert.deepEqual([days.have, days.need], [3, 14]);
  assert.equal(res.canApply, false);
  await assert.rejects(memberAction(db, "AM0", { action: "apply", application: FORM }), /requirement/);

  // Outside a pilot country: interest is registered, still can't apply.
  res = await memberAction(db, "AM0", { action: "country", country: "gh" });
  assert.equal(res.record.country, "GH");
  assert.equal(res.record.interest, true);
  assert.equal(res.eligibility.items.find((i) => i.id === "country").done, false);
});

test("eligible member applies, gets a reference, can't apply twice, can withdraw", async () => {
  await db.doc("alke_members/AM1").set({ username: "am1", sessionCount: 14, streak: 5, createdAt: ts(T0) });
  for (let i = 0; i < 25; i++) await referral(`Q${i}`, "AM1", 8, 5);
  let res = await memberAction(db, "AM1", { action: "country", country: "NG" });
  assert.equal(res.eligibility.ok, true);
  assert.equal(res.canApply, true);

  await assert.rejects(memberAction(db, "AM1", { action: "apply", application: { ...FORM, agreed: { ...AGREED, nuru: false } } }), /Confirm/);
  res = await memberAction(db, "AM1", { action: "apply", application: FORM }, { email: "ada@example.com" });
  assert.equal(res.record.status, "submitted");
  assert.match(res.record.ref, /^AMB-NG-\d{5}$/);
  assert.equal(res.record.application.email, "ada@example.com");
  assert.equal(res.canApply, false);
  const saved = (await db.doc("alke_config/ambassadors/members/AM1").get()).data();
  assert.equal(saved.stats.referrals.qualified, 25);
  const note = (await db.collection("alke_members/AM1/notifications").get()).docs.map((d) => d.data());
  assert.ok(note.some((n) => n.kind === "ambassador" && n.link === "/ambassador"));

  await assert.rejects(memberAction(db, "AM1", { action: "apply", application: FORM }), /already/);
  res = await memberAction(db, "AM1", { action: "withdraw" });
  assert.equal(res.record.status, "withdrawn");
  assert.equal(res.canApply, true, "withdrawn: can apply again");
});

test("team: request info, member replies, then approve; rejected waits to reapply", async () => {
  await memberAction(db, "AM1", { action: "apply", application: FORM });
  const list = await adminAction(db, "ADMIN", { action: "list" });
  assert.ok(list.applications.some((a) => a.id === "AM1" && a.status === "submitted"));

  await assert.rejects(adminAction(db, "ADMIN", { action: "decide", id: "AM1", status: "info_required" }), /information/);
  await adminAction(db, "ADMIN", { action: "decide", id: "AM1", status: "info_required", note: "Share your group's link" });
  let res = await memberAction(db, "AM1", { action: "get" });
  assert.equal(res.record.status, "info_required");
  assert.equal(res.record.info.request, "Share your group's link");

  res = await memberAction(db, "AM1", { action: "respond", text: "t.me/example" });
  assert.equal(res.record.status, "under_review");
  await adminAction(db, "ADMIN", { action: "decide", id: "AM1", status: "approved" });
  res = await memberAction(db, "AM1", { action: "get" });
  assert.equal(res.record.status, "approved");
  assert.deepEqual(res.record.timeline.map((t) => t.status).slice(-4), ["submitted", "info_required", "under_review", "approved"]);

  await adminAction(db, "ADMIN", { action: "decide", id: "AM1", status: "rejected" });
  res = await memberAction(db, "AM1", { action: "get" });
  assert.equal(res.canApply, false, "rejected: waits reapplyDays");
  await db.doc("alke_config/ambassadors/members/AM1").update({ decidedAt: ts(Date.now() - 61 * DAY) });
  res = await memberAction(db, "AM1", { action: "get" });
  assert.equal(res.canApply, true);
});

test("ID checks: only approved ambassadors (or everyone when opened); no real-time key means manual review", async () => {
  const { startVerification, realtimeReady } = await import("../verification.js");
  assert.equal(realtimeReady("PLACEHOLDER"), false);
  assert.equal(realtimeReady("sk_live_abc"), true);
  await db.doc("alke_members/AM2").set({ username: "am2", sessionCount: 1, createdAt: ts(T0) });
  assert.deepEqual(await startVerification(db, "PLACEHOLDER", "AM2", { check: true }), { open: false });
  await assert.rejects(startVerification(db, "PLACEHOLDER", "AM2", { country: "NG" }), /aren't open/);

  await db.doc("alke_config/ambassadors/members/AM2").set({ status: "approved" });
  assert.deepEqual(await startVerification(db, "PLACEHOLDER", "AM2", { check: true }), { open: true });
  // Nigeria is a Stripe country, but with no real key the details are collected for review.
  assert.deepEqual(await startVerification(db, "PLACEHOLDER", "AM2", { country: "NG" }), { method: "manual" });
  assert.equal((await db.doc("alke_members/AM2/verification/status").get()).get("status"), "manual");
});

test("activation needs a verified identity; requireVerified counts only verified referrals", async () => {
  await db.doc("alke_config/ambassadors/members/AM1").set({ status: "approved" }, { merge: true });
  await assert.rejects(adminAction(db, "ADMIN", { action: "decide", id: "AM1", status: "active" }), /verified/);
  await db.doc("alke_members/AM1/verification/status").set({ status: "verified" });
  await adminAction(db, "ADMIN", { action: "decide", id: "AM1", status: "active" });
  assert.equal((await db.doc("alke_config/ambassadors/members/AM1").get()).get("status"), "active");

  const cfg = await config(db);
  cfg.qualifying.requireVerified = true;
  for (let i = 0; i < 3; i++) await db.doc(`alke_members/Q${i}/verification/status`).set({ status: "verified" });
  const r = await referrals(db, "AM1", cfg);
  assert.equal(r.qualified, 3);
  assert.equal(r.unverified, 22);
});
