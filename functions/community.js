/* "Join the Community" (onboarding step 4): following an official ALKÉ
 * channel adds ALKE to the member's account straight away, once per channel.
 * The follow itself can't be checked on X or Telegram, so tapping counts.
 *
 *   alke_members/{id}/entries/c_{channel}  { kind: "community", label, amount, status: "locked", at }
 *   alke_members/{id}/allocation/summary   locked += amount (same balance as sessions)
 *
 * Both are server-only in the rules, so the app can't add or change them.
 */
import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

export const COMMUNITY_REWARD = 300;
export const CHANNELS = {
  x: "Followed ALKÉ on X",
  telegram: "Joined ALKÉ on Telegram",
};

/** Credits [channel] once. → { credited, amount, locked } (locked = the balance after). */
export async function creditCommunity(db, nuruId, channel) {
  const label = CHANNELS[channel];
  if (!label) throw new HttpsError("invalid-argument", "Unknown community.");
  const memberRef = db.doc(`alke_members/${nuruId}`);
  const entryRef = db.doc(`alke_members/${nuruId}/entries/c_${channel}`);
  const summaryRef = db.doc(`alke_members/${nuruId}/allocation/summary`);

  return db.runTransaction(async (tx) => {
    const [member, entry, summary] = await Promise.all([tx.get(memberRef), tx.get(entryRef), tx.get(summaryRef)]);
    if (!member.exists) throw new HttpsError("failed-precondition", "Finish creating your account first.");
    const locked = Number(summary.get("locked")) || 0;
    if (entry.exists) return { credited: false, amount: 0, locked };
    tx.create(entryRef, { kind: "community", channel, label, amount: COMMUNITY_REWARD, status: "locked", at: FieldValue.serverTimestamp() });
    tx.set(summaryRef, { locked: FieldValue.increment(COMMUNITY_REWARD), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { credited: true, amount: COMMUNITY_REWARD, locked: locked + COMMUNITY_REWARD };
  });
}

/** Which channels the member has already been credited for. */
export async function communityStatus(db, nuruId) {
  const refs = Object.keys(CHANNELS).map((c) => db.doc(`alke_members/${nuruId}/entries/c_${c}`));
  const snaps = await db.getAll(...refs);
  const summary = await db.doc(`alke_members/${nuruId}/allocation/summary`).get();
  return {
    done: Object.keys(CHANNELS).filter((_, i) => snaps[i].exists),
    amount: COMMUNITY_REWARD,
    locked: Number(summary.get("locked")) || 0,
  };
}
