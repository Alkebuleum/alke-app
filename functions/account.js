/* Deleting the ALKE membership (the rules don't allow it from the app).
 * The Nuru account (nuru_people, sign-in) is never touched here.
 */
import Stripe from "stripe";
import { getStorage } from "firebase-admin/storage";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Deletes the ALKE membership: the member record and everything under it,
 * the username, leaderboard row, identity record (and Stripe's copy) and
 * any review photos. Invites the member made stay counted for the inviter.
 */
export async function deleteMembership(db, stripeKey, id, input = {}) {
  if (input.confirm !== "DELETE") throw new HttpsError("invalid-argument", "Type DELETE to confirm.");
  const memberRef = db.doc(`alke_members/${id}`);
  const member = await memberRef.get();
  if (!member.exists) return { deleted: false };

  const v = (await db.doc(`alke_verifications/${id}`).get()).data();
  if (v?.stripeSessionId && stripeKey) {
    await new Stripe(stripeKey).identity.verificationSessions.redact(v.stripeSessionId).catch(() => {});
  }
  await getStorage().bucket().deleteFiles({ prefix: `alke_verification/${id}/` }).catch(() => {});

  const username = member.get("username");
  await db.recursiveDelete(memberRef);
  const b = db.batch();
  if (username) b.delete(db.doc(`alke_usernames/${username}`));
  b.delete(db.doc(`alke_scores/${id}`));
  b.delete(db.doc(`alke_verifications/${id}`));
  await b.commit();

  // The per-day session logs keyed by this member (alke_days/{day}/sessions/{id}).
  const days = await db.collection("alke_days").listDocuments();
  for (let i = 0; i < days.length; i += 400) {
    const batch = db.batch();
    days.slice(i, i + 400).forEach((d) => batch.delete(d.collection("sessions").doc(id)));
    await batch.commit();
  }
  return { deleted: true };
}
