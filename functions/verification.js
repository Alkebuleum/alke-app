/* Personhood check: one person, one account.
 *
 * Two ways, chosen by the member's country of residence:
 *   • Stripe Identity (countries in STRIPE_COUNTRIES): ID document + live
 *     selfie + ID number, the same checks Nuru uses. Stripe keeps the images.
 *   • Manual review (everywhere else): the member uploads ID photos and a
 *     selfie to private storage, and the ALKE team approves or rejects.
 *
 * What's stored, all server-only (no client can read it):
 *   alke_verifications/{nuruId}   { method, status, country, stripeSessionId,
 *                                   person: { name, dob, idType, idLast4 },
 *                                   idHash, files[], reviewedBy, ... }
 *   Storage alke_verification/{nuruId}/*   manual-review photos
 * What the member sees:
 *   alke_members/{nuruId}/verification/status  { status, method, country, reason, updatedAt }
 *
 * idHash (country + ID type + ID number, hashed with a server secret) stops
 * one ID verifying two accounts. The ID number itself is never stored.
 *
 * The Stripe-supported list can be changed without a deploy: set
 * alke_config/verification { stripeCountries: ["US", ...] } in Firestore.
 */
import { createHmac } from "node:crypto";
import Stripe from "stripe";
import { getStorage } from "firebase-admin/storage";
import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { notify, APP_URL } from "./notify.js";

/* Default countries where members verify with Stripe Identity. Check this
   against the document countries your Stripe account supports
   (Dashboard → Identity → Settings) and override it in alke_config. */
export const STRIPE_COUNTRIES = [
  "US", "CA", "MX", "BR", "AR", "CL", "CO", "PE",
  "GB", "IE", "FR", "DE", "ES", "IT", "PT", "NL", "BE", "LU", "AT", "CH", "SE", "NO", "DK", "FI", "IS",
  "PL", "CZ", "SK", "HU", "RO", "BG", "GR", "HR", "SI", "EE", "LV", "LT", "CY", "MT",
  "AU", "NZ", "JP", "SG", "HK", "MY", "TH", "PH", "ID", "IN", "AE", "SA", "IL", "TR",
  "NG", "GH", "KE", "ZA", "EG", "MA",
];

const ID_TYPES = ["passport", "id_card", "driving_license", "residence_permit", "voter_card", "other"];
const MAX_FILE = 10 * 1024 * 1024;

const statusRef = (db, id) => db.doc(`alke_members/${id}/verification/status`);
const recordRef = (db, id) => db.doc(`alke_verifications/${id}`);

export async function stripeCountries(db) {
  const s = await db.doc("alke_config/verification").get();
  const list = s.exists ? s.get("stripeCountries") : null;
  return Array.isArray(list) && list.length ? list.map((c) => String(c).toUpperCase()) : STRIPE_COUNTRIES;
}

export function idHash(secret, country, type, number) {
  const norm = String(number || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!norm) return null;
  return createHmac("sha256", secret).update(`${country}|${type}|${norm}`).digest("hex");
}

async function setStatus(db, id, status, extra = {}) {
  await statusRef(db, id).set({ status, ...extra, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

/** Another account already verified with this ID? */
async function duplicateOf(db, id, hash) {
  if (!hash) return null;
  const q = await db.collection("alke_verifications").where("idHash", "==", hash).where("status", "==", "verified").limit(2).get();
  const other = q.docs.find((d) => d.id !== id);
  return other ? other.id : null;
}

const MESSAGES = {
  verified: ["You're verified", "Your personhood check is done. One person, one account."],
  rejected: ["Verification wasn't approved", "Open ALKE to see why and what to do next."],
  needs_input: ["Your ID check needs another try", "Stripe couldn't finish the check. Open ALKE to try again."],
  review: ["We received your documents", "The ALKE team will review them, usually within a few days."],
};

async function tell(db, id, status) {
  const m = MESSAGES[status];
  if (m) await notify(db, id, { kind: "verification", title: m[0], body: m[1], link: "/verify" });
}

/* ── Start: pick the method for the country ──────────────────────────── */

export async function startVerification(db, stripeKey, id, { country } = {}) {
  const cc = String(country || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) throw new HttpsError("invalid-argument", "Choose the country where you live.");
  const member = await db.doc(`alke_members/${id}`).get();
  if (!member.exists) throw new HttpsError("failed-precondition", "Finish setting up ALKE first.");
  const current = (await statusRef(db, id).get()).data() || {};
  if (current.status === "verified") return { status: "verified" };
  if (current.status === "review") return { status: "review" };

  if (!(await stripeCountries(db)).includes(cc)) {
    await setStatus(db, id, "manual", { method: "manual", country: cc, reason: null });
    return { method: "manual" };
  }
  if (!stripeKey) throw new HttpsError("unavailable", "ID checks aren't switched on yet. Try again later.");

  const stripe = new Stripe(stripeKey);
  const session = await stripe.identity.verificationSessions.create({
    type: "document",
    client_reference_id: id,
    metadata: { nuruId: id, app: "alke", country: cc },
    options: { document: { require_matching_selfie: true, require_live_capture: true, require_id_number: true } },
    return_url: `${APP_URL}/verify?back=1`,
  });
  await recordRef(db, id).set(
    { method: "stripe", status: "pending", country: cc, stripeSessionId: session.id, startedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  await setStatus(db, id, "pending", { method: "stripe", country: cc, reason: null });
  return { method: "stripe", url: session.url };
}

/* ── Stripe webhook ──────────────────────────────────────────────────── */

export async function handleStripeEvent(db, stripeKey, hashSecret, event) {
  const s = event.data?.object;
  if (!s || s.object !== "identity.verification_session") return { ignored: true };
  const id = s.client_reference_id || s.metadata?.nuruId;
  if (!id || s.metadata?.app !== "alke") return { ignored: true };

  if (event.type === "identity.verification_session.processing") {
    await setStatus(db, id, "processing");
    return { id, status: "processing" };
  }
  if (event.type === "identity.verification_session.requires_input") {
    const reason = s.last_error?.reason || s.last_error?.code || "The check couldn't be completed.";
    await recordRef(db, id).set({ status: "needs_input", lastError: s.last_error?.code || null }, { merge: true });
    await setStatus(db, id, "needs_input", { reason });
    await tell(db, id, "needs_input");
    return { id, status: "needs_input" };
  }
  if (event.type === "identity.verification_session.canceled") {
    await recordRef(db, id).set({ status: "canceled" }, { merge: true });
    await setStatus(db, id, "none", { reason: null });
    return { id, status: "none" };
  }
  if (event.type !== "identity.verification_session.verified") return { ignored: true };

  // Read the verified details (expanded fields need a fresh retrieve).
  const stripe = new Stripe(stripeKey);
  const full = await stripe.identity.verificationSessions.retrieve(s.id, {
    expand: ["verified_outputs", "verified_outputs.dob", "verified_outputs.id_number"],
  });
  const vo = full.verified_outputs || {};
  const country = vo.address?.country || s.metadata?.country || null;
  const idType = vo.id_number_type || "document";
  const hash = idHash(hashSecret, country || "", idType, vo.id_number);
  const dup = await duplicateOf(db, id, hash);
  const dob = vo.dob ? `${vo.dob.year}-${String(vo.dob.month).padStart(2, "0")}-${String(vo.dob.day).padStart(2, "0")}` : null;
  const status = dup ? "rejected" : "verified";
  await recordRef(db, id).set(
    {
      status,
      idHash: hash,
      country,
      person: { name: [vo.first_name, vo.last_name].filter(Boolean).join(" ") || null, dob, idType, idLast4: vo.id_number ? String(vo.id_number).slice(-4) : null },
      duplicateOf: dup || null,
      decidedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  await setStatus(db, id, status, { method: "stripe", reason: dup ? "This ID is already verified on another ALKE account." : null });
  await tell(db, id, status);
  return { id, status };
}

/* ── Manual review: submit ───────────────────────────────────────────── */

export async function submitManual(db, hashSecret, id, input = {}) {
  const cc = String(input.country || "").toUpperCase();
  const name = String(input.fullName || "").trim().slice(0, 120);
  const dob = String(input.dob || "");
  const idType = ID_TYPES.includes(input.idType) ? input.idType : null;
  const number = String(input.idNumber || "").trim().slice(0, 40);
  if (!/^[A-Z]{2}$/.test(cc) || name.length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(dob) || !idType || number.length < 4) {
    throw new HttpsError("invalid-argument", "Fill in every field.");
  }
  const current = (await statusRef(db, id).get()).data() || {};
  if (current.status === "verified") return { status: "verified" };

  // The photos must already be in this member's private folder.
  const bucket = getStorage().bucket();
  const want = ["id-front", "selfie"];
  const [files] = await bucket.getFiles({ prefix: `alke_verification/${id}/` });
  const found = {};
  for (const f of files) {
    const key = f.name.split("/").pop().split(".")[0];
    const size = Number(f.metadata?.size || 0);
    if (size > 0 && size <= MAX_FILE && /^image\//.test(f.metadata?.contentType || "")) found[key] = f.name;
  }
  for (const k of want) if (!found[k]) throw new HttpsError("invalid-argument", k === "selfie" ? "Add your selfie." : "Add a photo of the front of your ID.");

  const hash = idHash(hashSecret, cc, idType, number);
  const dup = await duplicateOf(db, id, hash);
  await recordRef(db, id).set(
    {
      method: "manual",
      status: "review",
      country: cc,
      idHash: hash,
      duplicateOf: dup || null,
      person: { name, dob, idType, idLast4: number.replace(/[^A-Za-z0-9]/g, "").slice(-4) },
      files: Object.values(found),
      submittedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  await setStatus(db, id, "review", { method: "manual", country: cc, reason: null });
  await tell(db, id, "review");
  return { status: "review" };
}

/* ── Manual review: the team ─────────────────────────────────────────── */

export async function isAdmin(db, id) {
  return !!id && (await db.doc(`alke_admins/${id}`).get()).exists;
}

/** Waiting reviews, with photo links that work for 10 minutes. */
export async function listReviews(db) {
  const q = await db.collection("alke_verifications").where("status", "==", "review").limit(50).get();
  const bucket = getStorage().bucket();
  const expires = Date.now() + 10 * 60 * 1000;
  const out = [];
  for (const d of q.docs) {
    const v = d.data();
    const member = (await db.doc(`alke_members/${d.id}`).get()).data() || {};
    const photos = [];
    for (const name of v.files || []) {
      const [url] = await bucket.file(name).getSignedUrl({ action: "read", expires }).catch(() => [null]);
      if (url) photos.push({ name: name.split("/").pop(), url });
    }
    out.push({
      id: d.id,
      username: member.username || "",
      country: v.country,
      person: v.person || {},
      duplicateOf: v.duplicateOf || null,
      submittedAt: v.submittedAt?.toMillis?.() || null,
      photos,
    });
  }
  return out.sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0));
}

export async function decideReview(db, adminId, { id, approve, reason } = {}) {
  if (!id) throw new HttpsError("invalid-argument", "Missing member.");
  const ref = recordRef(db, id);
  const v = (await ref.get()).data();
  if (!v || v.status !== "review") throw new HttpsError("failed-precondition", "This review is already decided.");
  const dup = approve ? await duplicateOf(db, id, v.idHash) : null;
  const status = approve && !dup ? "verified" : "rejected";
  const why = dup ? "This ID is already verified on another ALKE account." : approve ? null : String(reason || "Your documents couldn't be verified.").slice(0, 300);
  await ref.set({ status, reviewedBy: adminId, decidedAt: FieldValue.serverTimestamp(), reason: why }, { merge: true });
  await setStatus(db, id, status, { reason: why });
  await tell(db, id, status);
  // The photos aren't needed after a decision.
  await getStorage().bucket().deleteFiles({ prefix: `alke_verification/${id}/` }).catch(() => {});
  return { status };
}
