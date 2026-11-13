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
import { logger } from "firebase-functions/v2";
import { memberCreated, memberUpdated, recordSession, settleDay, updateLive, warmDay } from "./core.js";
import { dayKey } from "./genesis.js";

initializeApp();
const db = getFirestore();

/** A session started: log it for its day; History shows it as Pending. */
export const alkeOnSession = onDocumentCreated("alke_members/{id}/sessions/{n}", async (e) => {
  if (e.data) await recordSession(db, e.params.id, e.data.data());
});

/** A member joined: credit the inviter. */
export const alkeOnMemberCreated = onDocumentCreated("alke_members/{id}", async (e) => {
  if (e.data) await memberCreated(db, e.params.id, e.data.data());
});

/** A member's sessions grew: an invite becomes active after a few sessions. */
export const alkeOnMemberUpdated = onDocumentUpdated("alke_members/{id}", async (e) => {
  await memberUpdated(db, e.params.id, e.data.before.data() || {}, e.data.after.data() || {});
});

/** 00:10 UTC: settle yesterday's pool, then warm everyone's cold ALKE. */
export const alkeDaily = onSchedule({ schedule: "10 0 * * *", timeZone: "UTC", timeoutSeconds: 540, memory: "1GiB" }, async () => {
  const day = dayKey(Date.now() - 24 * 60 * 60 * 1000);
  logger.info("settle", await settleDay(db, day));
  logger.info("warm", await warmDay(db, day));
});

/** Every 10 minutes: the live figures the Mine screen shows. */
export const alkeLive = onSchedule({ schedule: "every 10 minutes", timeoutSeconds: 120 }, async () => {
  await updateLive(db);
});
