/* Signing up with an email: a 6-digit code proves the address, then the
 * account is created already verified (Nuru's nuruAuth only opens accounts
 * whose email is verified, because Nuru links accounts by email).
 *
 *   alkeEmailCode   { email }               → sends a code          (no sign-in needed)
 *   alkeEmailVerify { email, code }         → { status, ticket? }  (no sign-in needed)
 *       status "new"      → ticket for alkeCreateAccount
 *       status "password" → an account exists: sign in (an unverified one is verified now)
 *       status "social"   → the email signs in with Google / Apple
 *       signed in with that same email → the login is marked verified ({ status: "verified" })
 *   alkeCreateAccount { ticket, password, name } → creates the verified email + password login
 *
 * And each member's reserved Alker ID (alkeAlkerId): ALK-0000-0000-0000,
 * unique and never reused. It's a member ID, not an on-chain address; it is
 * tied to the Nuru ID, so it maps to the person's AIN whenever they have one.
 *
 * Everything lives under alke_config/ (server only in the rules).
 */
import { createHash, randomBytes, randomInt } from "node:crypto";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

const CODE_TTL_MS = 15 * 60 * 1000;
const TICKET_TTL_MS = 30 * 60 * 1000;
const RESEND_AFTER_MS = 45 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_IP_SENDS_PER_HOUR = 20;
const MAX_ATTEMPTS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const sha = (s) => createHash("sha256").update(s).digest("hex");
const cleanEmail = (e) => String(e || "").trim().toLowerCase();
const codeHash = (email, code) => sha(`${email}:${code}`);
const auth = (db) => db.doc("alke_config/auth");

function needEmail(raw) {
  const email = cleanEmail(raw);
  if (!EMAIL_RE.test(email) || email.length > 254) throw new HttpsError("invalid-argument", "Enter a valid email address.");
  return email;
}

/* ── Email ───────────────────────────────────────────────────────────── */

export async function sendBrevo(apiKey, { to, subject, html }) {
  if (!apiKey) throw new Error("BREVO_API_KEY is not set");
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "ALKÉ Network", email: process.env.EMAIL_FROM || "noreply@alkebuleum.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}

const codeEmail = (code) => `<!doctype html><html><body style="margin:0;background:#08070D;font-family:Inter,Arial,sans-serif;color:#F7F5F2">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08070D;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#14111F;border:1px solid rgba(255,255,255,.09);border-radius:24px;padding:32px 28px">
<tr><td style="font-size:12px;letter-spacing:.24em;color:#F2C66B;font-family:'Courier New',monospace">ALKÉ NETWORK</td></tr>
<tr><td style="padding-top:18px;font-size:24px;font-weight:700;color:#F7F5F2">Your sign-up code</td></tr>
<tr><td style="padding-top:10px;font-size:15px;line-height:22px;color:#A9A6B6">Enter this code in the ALKÉ app to confirm your email. It works for 15 minutes.</td></tr>
<tr><td style="padding-top:24px"><div style="font-size:36px;font-weight:700;letter-spacing:.3em;color:#F7F5F2;font-family:'Courier New',monospace;text-align:center;background:rgba(255,255,255,.05);border-radius:16px;padding:16px 0">${code}</div></td></tr>
<tr><td style="padding-top:24px;font-size:13px;line-height:19px;color:#8C8999">If you didn't ask for this, you can ignore this email. ALKÉ will never ask for your password, seed phrase or private keys.</td></tr>
</table></td></tr></table></body></html>`;

/* ── Codes ───────────────────────────────────────────────────────────── */

/** Counts sends per IP in the current hour; throws past the limit. */
async function limitIp(db, ip) {
  if (!ip) return;
  const ref = auth(db).collection("limits").doc(sha(`ip:${ip}`).slice(0, 40));
  const hour = Math.floor(Date.now() / 3600000);
  await db.runTransaction(async (tx) => {
    const d = (await tx.get(ref)).data() || {};
    const count = d.hour === hour ? d.count || 0 : 0;
    if (count >= MAX_IP_SENDS_PER_HOUR) throw new HttpsError("resource-exhausted", "Too many codes requested. Try again later.");
    tx.set(ref, { hour, count: count + 1 });
  });
}

export async function sendCode(db, brevoKey, rawEmail, ip) {
  const email = needEmail(rawEmail);
  const ref = auth(db).collection("codes").doc(sha(email));
  const now = Date.now();
  const hour = Math.floor(now / 3600000);
  const prev = (await ref.get()).data() || {};
  const last = prev.sentAt?.toMillis?.() || 0;
  if (now - last < RESEND_AFTER_MS) {
    throw new HttpsError("resource-exhausted", `Wait ${Math.ceil((RESEND_AFTER_MS - (now - last)) / 1000)} seconds before asking for another code.`);
  }
  const sends = prev.hour === hour ? prev.sends || 0 : 0;
  if (sends >= MAX_SENDS_PER_HOUR) throw new HttpsError("resource-exhausted", "Too many codes for this email. Try again in an hour.");
  await limitIp(db, ip);

  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  await ref.set({
    hash: codeHash(email, code),
    attempts: 0,
    sentAt: Timestamp.fromMillis(now),
    expiresAt: Timestamp.fromMillis(now + CODE_TTL_MS),
    hour,
    sends: sends + 1,
  });
  try {
    await sendBrevo(brevoKey, { to: email, subject: `${code} is your ALKÉ code`, html: codeEmail(code) });
  } catch (e) {
    await ref.delete().catch(() => {});
    console.error("[alkeEmailCode] send failed", e?.message || e);
    throw new HttpsError("unavailable", "We couldn't send the email. Try again.");
  }
  return { sent: true };
}

/** Checks the code; on success the code is used up. */
async function useCode(db, email, code) {
  const ref = auth(db).collection("codes").doc(sha(email));
  const clean = String(code || "").replace(/\D/g, "");
  if (clean.length !== 6) throw new HttpsError("invalid-argument", "Enter the 6-digit code.");
  // The transaction returns the problem instead of throwing, so a wrong try's
  // counter is saved (a throw would roll the write back).
  const problem = await db.runTransaction(async (tx) => {
    const d = (await tx.get(ref)).data();
    if (!d || !d.hash) return ["not-found", "That code has expired. Ask for a new one."];
    if ((d.expiresAt?.toMillis?.() || 0) < Date.now()) {
      tx.update(ref, { hash: FieldValue.delete() });
      return ["deadline-exceeded", "That code has expired. Ask for a new one."];
    }
    if ((d.attempts || 0) >= MAX_ATTEMPTS) return ["resource-exhausted", "Too many wrong tries. Ask for a new code."];
    if (d.hash !== codeHash(email, clean)) {
      tx.update(ref, { attempts: FieldValue.increment(1) });
      const left = MAX_ATTEMPTS - (d.attempts || 0) - 1;
      return ["invalid-argument", left > 0 ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.` : "That code isn't right. Ask for a new one."];
    }
    // Keep the send counters (rate limits), drop the code.
    tx.update(ref, { hash: FieldValue.delete(), attempts: 0 });
    return null;
  });
  if (problem) throw new HttpsError(problem[0], problem[1]);
}

async function userByEmail(email) {
  try {
    return await getAuth().getUserByEmail(email);
  } catch (e) {
    if (e?.code === "auth/user-not-found") return null;
    throw e;
  }
}

export async function verifyCode(db, data, signedIn) {
  const email = needEmail(data?.email);
  await useCode(db, email, data?.code);

  // Signed in with this email (an older account that never confirmed it): confirm it now.
  if (signedIn?.uid && cleanEmail(signedIn.token?.email) === email) {
    await getAuth().updateUser(signedIn.uid, { emailVerified: true });
    return { status: "verified" };
  }

  const user = await userByEmail(email);
  if (user) {
    const providers = user.providerData.map((p) => p.providerId);
    if (providers.includes("password")) {
      if (!user.emailVerified) await getAuth().updateUser(user.uid, { emailVerified: true });
      return { status: "password" };
    }
    return { status: "social", providers };
  }

  const ticket = randomBytes(32).toString("base64url");
  await auth(db).collection("tickets").doc(sha(ticket)).set({ email, expiresAt: Timestamp.fromMillis(Date.now() + TICKET_TTL_MS) });
  return { status: "new", ticket };
}

export async function createAccount(db, data) {
  const ticket = String(data?.ticket || "");
  const password = String(data?.password || "");
  const name = String(data?.name || "").trim().slice(0, 60);
  if (!name) throw new HttpsError("invalid-argument", "Enter your name.");
  if (password.length < 8 || password.length > 128) throw new HttpsError("invalid-argument", "Use 8 or more characters for your password.");
  if (!ticket) throw new HttpsError("failed-precondition", "Confirm your email first.");

  const ref = auth(db).collection("tickets").doc(sha(ticket));
  const email = await db.runTransaction(async (tx) => {
    const d = (await tx.get(ref)).data();
    if (!d || (d.expiresAt?.toMillis?.() || 0) < Date.now()) return null;
    tx.delete(ref);
    return d.email;
  });
  if (!email) throw new HttpsError("failed-precondition", "Your email confirmation has expired. Start again with your email.");

  try {
    await getAuth().createUser({ email, password, emailVerified: true, displayName: name });
  } catch (e) {
    if (e?.code === "auth/email-already-exists") throw new HttpsError("already-exists", "There's already an account with this email. Sign in instead.");
    if (e?.code === "auth/invalid-password") throw new HttpsError("invalid-argument", "Use 8 or more characters for your password.");
    throw e;
  }
  return { email };
}

/* ── Alker ID ────────────────────────────────────────────────────────── */

const newAlkerId = () => `ALK-${[0, 1, 2].map(() => String(randomInt(0, 10000)).padStart(4, "0")).join("-")}`;

/** The member's Alker ID, reserving one the first time. */
export async function reserveAlkerId(db, nuruId) {
  const memberRef = db.doc(`alke_members/${nuruId}`);
  const member = await memberRef.get();
  if (!member.exists) throw new HttpsError("failed-precondition", "Finish creating your account first.");
  if (member.get("alkerId")) return { alkerId: member.get("alkerId") };

  const ain = (await db.doc(`nuru_people/${nuruId}`).get()).get("ain") || null;
  for (let i = 0; i < 8; i++) {
    const id = newAlkerId();
    const idRef = db.doc(`alke_config/alker_ids/taken/${id}`);
    const out = await db.runTransaction(async (tx) => {
      const [m, taken] = await Promise.all([tx.get(memberRef), tx.get(idRef)]);
      if (m.get("alkerId")) return m.get("alkerId");
      if (taken.exists) return null;
      tx.create(idRef, { nuruId, ain, createdAt: FieldValue.serverTimestamp() });
      tx.update(memberRef, { alkerId: id, alkerIdAt: FieldValue.serverTimestamp() });
      return id;
    });
    if (out) return { alkerId: out };
  }
  throw new HttpsError("unavailable", "Couldn't reserve an Alker ID. Try again.");
}
