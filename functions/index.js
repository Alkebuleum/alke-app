/* ALKÉ Network server functions (codebase "alke"), deployed apart from
 * Nuru's own functions in the shared project:
 *
 *   firebase deploy --only functions:alke
 *
 * firebase.json in this folder's parent lists ONLY these functions, so a
 * deploy from here can't touch the project's rules, indexes or Nuru's code.
 */
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import { logger } from "firebase-functions/v2";
import { memberCreated, memberUpdated, recordBoost, recordSession, settleDay, updateLive, warmDay } from "./core.js";
import { ACTIVE_AFTER, dayKey } from "./genesis.js";
import { syncGames } from "./games.js";
import { notify, sendGameAlerts, sendSessionReminders } from "./notify.js";
import { decideReview, handleStripeEvent, isAdmin, listReviews, startVerification, submitManual } from "./verification.js";
import { deleteMembership } from "./account.js";
import { createAccount, reserveAlkerId, sendCode, verifyCode } from "./signup.js";
import { communityStatus, creditCommunity } from "./community.js";

/* Secrets (firebase functions:secrets:set NAME):
 *   STRIPE_SECRET_KEY               Stripe secret key (Identity enabled)
 *   STRIPE_IDENTITY_WEBHOOK_SECRET  signing secret of the alkeStripeIdentity webhook
 *   ALKE_ID_HASH_SECRET             any long random string; keys the ID-number hash
 *   BREVO_API_KEY                   Brevo v3 API key (the same one Nuru sends email with) */
const STRIPE_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK = defineSecret("STRIPE_IDENTITY_WEBHOOK_SECRET");
const ID_HASH = defineSecret("ALKE_ID_HASH_SECRET");
const BREVO_KEY = defineSecret("BREVO_API_KEY");

initializeApp();
const db = getFirestore();

/** A session started: log it for its day; History shows it as Pending. */
export const alkeOnSession = onDocumentCreated("alke_members/{id}/sessions/{n}", async (e) => {
  if (e.data) await recordSession(db, e.params.id, e.data.data());
});

/** A member joined: credit the inviter. */
export const alkeOnMemberCreated = onDocumentCreated("alke_members/{id}", async (e) => {
  if (!e.data) return;
  const m = e.data.data();
  await memberCreated(db, e.params.id, m);
  if (m.invitedBy && m.invitedBy !== e.params.id) {
    await notify(db, m.invitedBy, {
      kind: "invite",
      title: "Someone joined with your invite",
      body: `${m.username || "A new member"} joined ALKE. Their invite becomes active after 3 drills.`,
      link: "/network",
    });
  }
});

/** A member's sessions grew: an invite becomes active after a few sessions. */
export const alkeOnMemberUpdated = onDocumentUpdated("alke_members/{id}", async (e) => {
  const before = e.data.before.data() || {};
  const after = e.data.after.data() || {};
  await memberUpdated(db, e.params.id, before, after);
  if (after.invitedBy && after.invitedBy !== e.params.id && (before.sessionCount || 0) < ACTIVE_AFTER && (after.sessionCount || 0) >= ACTIVE_AFTER) {
    await notify(db, after.invitedBy, {
      kind: "invite",
      title: "An invite is now active",
      body: `${after.username || "Your invite"} finished 3 drills. It now warms 1% of your cold ALKE a day.`,
      link: "/network",
    });
  }
});

/** 00:10 UTC: settle yesterday's pool, then warm everyone's cold ALKE. */
export const alkeDaily = onSchedule({ schedule: "10 0 * * *", timeZone: "UTC", timeoutSeconds: 540, memory: "1GiB" }, async () => {
  const day = dayKey(Date.now() - 24 * 60 * 60 * 1000);
  logger.info("settle", await settleDay(db, day));
  logger.info("warm", await warmDay(db, day));
});

/** Every 10 minutes: the live figures the Drill screen shows. */
export const alkeLive = onSchedule({ schedule: "every 10 minutes", timeoutSeconds: 120 }, async () => {
  await updateLive(db);
});

/** The signed-in member's Nuru ID (the `nid` claim nuruAuth puts on the session). */
function memberId(req) {
  const id = req.auth?.token?.nid;
  if (!id || typeof id !== "string") throw new HttpsError("unauthenticated", "Sign in to ALKE first.");
  return id;
}

/** Game results and progress from the app: checked, recorded, returned. */
export const alkeGameSync = onCall({ enforceAppCheck: false }, async (req) => {
  return syncGames(db, memberId(req), req.data || {});
});

/** A 25-tap combo on the drilling rig: one tap boost for today, capped per day. */
export const alkeBoost = onCall(async (req) => {
  return recordBoost(db, memberId(req));
});

/** Every 15 minutes: "your next session is ready" for sessions that just ended. */
export const alkeReminders = onSchedule({ schedule: "every 15 minutes", timeoutSeconds: 300 }, async () => {
  logger.info("reminders", await sendSessionReminders(db));
});

/** 17:00 UTC: today's games, for members who turned game alerts on. */
export const alkeGameAlerts = onSchedule({ schedule: "0 17 * * *", timeZone: "UTC", timeoutSeconds: 300 }, async () => {
  logger.info("game alerts", await sendGameAlerts(db));
});

/* ── Personhood check ─────────────────────────────────────────────────── */

export const alkeVerifyStart = onCall({ secrets: [STRIPE_KEY] }, async (req) => {
  return startVerification(db, STRIPE_KEY.value(), memberId(req), req.data || {});
});

export const alkeVerifySubmit = onCall({ secrets: [ID_HASH] }, async (req) => {
  return submitManual(db, ID_HASH.value(), memberId(req), req.data || {});
});

/** Stripe → here: Identity session events (verified, needs input, canceled). */
export const alkeStripeIdentity = onRequest({ secrets: [STRIPE_KEY, STRIPE_WEBHOOK, ID_HASH] }, async (req, res) => {
  let event;
  try {
    event = new Stripe(STRIPE_KEY.value()).webhooks.constructEvent(req.rawBody, req.get("stripe-signature"), STRIPE_WEBHOOK.value());
  } catch (e) {
    logger.warn("stripe signature", String(e?.message || e));
    res.status(400).send("bad signature");
    return;
  }
  try {
    logger.info("stripe identity", await handleStripeEvent(db, STRIPE_KEY.value(), ID_HASH.value(), event));
    res.json({ received: true });
  } catch (e) {
    logger.error("stripe identity failed", String(e?.message || e));
    res.status(500).send("error");
  }
});

/* The ALKE team (alke_admins/{nuruId} exists) reviews manual submissions. */
async function adminId(req) {
  const id = memberId(req);
  if (!(await isAdmin(db, id))) throw new HttpsError("permission-denied", "Only the ALKE team can do this.");
  return id;
}

export const alkeIsAdmin = onCall(async (req) => ({ admin: await isAdmin(db, memberId(req)) }));
export const alkeReviewList = onCall(async (req) => {
  await adminId(req);
  return { reviews: await listReviews(db) };
});
export const alkeReviewDecide = onCall(async (req) => decideReview(db, await adminId(req), req.data || {}));

/* ── Sign-up (functions/signup.js) ────────────────────────────────────── */

/** A 6-digit code to the email (no sign-in needed). Rate-limited per email and per IP. */
export const alkeEmailCode = onCall({ secrets: [BREVO_KEY] }, async (req) => {
  const email = req.data?.email || (req.auth ? req.auth.token?.email : "");
  return sendCode(db, BREVO_KEY.value(), email, req.rawRequest?.ip || "");
});

/** Checks the code: a ticket for a new account, or what to do for an existing one. */
export const alkeEmailVerify = onCall(async (req) => verifyCode(db, req.data || {}, req.auth || null));

/** Creates the email + password login, already verified, from a ticket. */
export const alkeCreateAccount = onCall(async (req) => createAccount(db, req.data || {}));

/** The member's reserved Alker ID (ALK-0000-0000-0000), reserved on the first call.
    Only the server writes it or its Nuru ID / AIN link (alke_config, and a
    field the rules don't let the app change). */
export const alkeAlkerId = onCall(async (req) => reserveAlkerId(db, memberId(req)));

/** Join the Community: { channel } → credits 300 ALKE once per channel; {} → what's done. */
export const alkeCommunity = onCall(async (req) => {
  const id = memberId(req);
  return req.data?.channel ? creditCommunity(db, id, String(req.data.channel)) : communityStatus(db, id);
});

/* ── Account ──────────────────────────────────────────────────────────── */

export const alkeDeleteAccount = onCall({ secrets: [STRIPE_KEY], timeoutSeconds: 300 }, async (req) => {
  return deleteMembership(db, STRIPE_KEY.value(), memberId(req), req.data || {});
});
