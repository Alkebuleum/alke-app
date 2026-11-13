/* Accounts: email + password, Google or Apple. No wallets.
 *
 * Every ALKÉ member is a Nuru person. After Firebase sign-in, the shared
 * `nuruAuth` function finds or creates the person in `nuru_people` and puts
 * their Nuru ID on the session as the `nid` claim; Firestore rules key off it.
 *
 * Inside the Nuru app's browser, Nuru can hand its session over (see
 * tryNuruHandoff) so members never sign in twice.
 */
import {
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "./firebase";

/** A message safe to show the person. */
export class AccountError extends Error {
  constructor(message, { cancelled = false, field = null } = {}) {
    super(message);
    this.cancelled = cancelled;
    this.field = field;
  }
}

function friendly(e) {
  const code = (e && e.code) || "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return new AccountError("Sign-in was cancelled.", { cancelled: true });
    case "auth/popup-blocked":
      return new AccountError("Your browser blocked the sign-in window. Allow pop-ups for this site and try again.");
    case "auth/email-already-in-use":
      return new AccountError("There's already an account with this email. Sign in instead.", { field: "email" });
    case "auth/invalid-email":
      return new AccountError("That email address doesn't look right.", { field: "email" });
    case "auth/weak-password":
      return new AccountError("Use at least 8 characters for your password.", { field: "password" });
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return new AccountError("Email or password is incorrect.", { field: "password" });
    case "auth/too-many-requests":
      return new AccountError("Too many attempts. Wait a few minutes and try again.");
    case "auth/network-request-failed":
      return new AccountError("No connection. Check your internet and try again.");
    case "auth/unauthorized-domain":
      return new AccountError("Sign-in isn't set up for this web address yet.");
    case "auth/operation-not-allowed":
      return new AccountError("This sign-in option isn't switched on yet.");
    case "auth/account-exists-with-different-credential":
      return new AccountError("This email already signs in another way. Use the option you used before.");
    default:
      if (e instanceof AccountError) return e;
      if (code.startsWith("functions/")) return new AccountError(e.message || "Could not open your account. Try again.");
      return new AccountError(e?.message || "Something went wrong. Try again.");
  }
}

const verifyUrl = () => ({ url: `${window.location.origin}/verify-email`, handleCodeInApp: false });

export async function signUpWithEmail(email, password) {
  const clean = email.trim().toLowerCase();
  if (password.length < 8) throw new AccountError("Use at least 8 characters for your password.", { field: "password" });
  try {
    const { user } = await createUserWithEmailAndPassword(auth, clean, password);
    await sendEmailVerification(user, verifyUrl()).catch(() => {});
    return user;
  } catch (e) {
    throw friendly(e);
  }
}

export async function signInWithEmail(email, password) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    return user;
  } catch (e) {
    throw friendly(e);
  }
}

export async function resetPassword(email) {
  const clean = email.trim().toLowerCase();
  if (!clean.includes("@")) throw new AccountError("Enter your email first.", { field: "email" });
  try {
    await sendPasswordResetEmail(auth, clean, { url: `${window.location.origin}/sign-in` });
  } catch (e) {
    // Don't reveal whether an account exists.
    if (e?.code !== "auth/user-not-found") throw friendly(e);
  }
}

export async function resendVerification() {
  if (!auth.currentUser) return;
  try {
    await sendEmailVerification(auth.currentUser, verifyUrl());
  } catch (e) {
    throw friendly(e);
  }
}

/** Re-reads the user; true once the email is verified. */
export async function checkVerified() {
  if (!auth.currentUser) return false;
  await reload(auth.currentUser);
  if (auth.currentUser.emailVerified) await auth.currentUser.getIdToken(true);
  return auth.currentUser.emailVerified;
}

export async function signInWithSocial(kind) {
  const provider = kind === "apple" ? new OAuthProvider("apple.com") : new GoogleAuthProvider();
  if (kind === "apple") {
    provider.addScope("email");
    provider.addScope("name");
  } else {
    provider.addScope("email");
    provider.setCustomParameters({ prompt: "select_account" });
  }
  try {
    const { user } = await signInWithPopup(auth, provider);
    return user;
  } catch (e) {
    throw friendly(e);
  }
}

const NO_HANDOFF = "alke.noNuruHandoff";
const storage = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* private mode */ } },
};

export async function signOut() {
  // Signing out inside Nuru is respected: no silent sign-in on the next load
  // (the sign-in screen offers "Continue with Nuru" instead).
  if (isInsideNuru()) storage.set(NO_HANDOFF, "1");
  await fbSignOut(auth);
}

/** The Nuru ID on the current session, or null. forceRefresh re-reads the
    token from the server (claims set elsewhere, or a token saved before the
    email was verified). */
export async function sessionNuruId(user = auth.currentUser, forceRefresh = false) {
  if (!user) return null;
  const { claims } = await user.getIdTokenResult(forceRefresh);
  return typeof claims.nid === "string" && claims.nid ? claims.nid : null;
}

/**
 * Opens (or creates) the person's Nuru account and makes sure the session
 * carries their Nuru ID. Returns { nuruId, created }.
 */
export async function openNuruAccount(user = auth.currentUser) {
  if (!user) throw new AccountError("Not signed in.");
  const existing = (await sessionNuruId(user)) || (await sessionNuruId(user, true).catch(() => null));
  if (existing) return { nuruId: existing, created: false };
  try {
    const res = await httpsCallable(functions, "nuruAuth")({});
    await user.getIdToken(true);
    const nuruId = String(res.data?.nuruId || "");
    if (!nuruId) throw new AccountError("Could not open your account. Try again.");
    return { nuruId, created: !!res.data?.created };
  } catch (e) {
    throw friendly(e);
  }
}

/* ── Nuru hand-off ──────────────────────────────────────────────────────────
 * Inside the Nuru app the member is already signed in. Nuru hands its session
 * to this site as a one-time Firebase custom token, either
 *   • in the URL fragment: app.alke.network/#nuru_token=<token>, or
 *   • on request through Nuru's in-app browser bridge:
 *       window.ethereum.request({ method: "nuru_appSession" }) → { token }
 * The token signs this site in as the same Nuru person. Nothing here touches
 * a wallet: the bridge is only Nuru's channel into the page. */
export function isInsideNuru() {
  return typeof window !== "undefined" && !!(window.ethereum && window.ethereum.isNuru);
}

function takeTokenFromUrl() {
  const m = /[#&]nuru_token=([^&]+)/.exec(window.location.hash || "");
  if (!m) return null;
  const clean = window.location.hash.replace(/[#&]?nuru_token=[^&]+/, "").replace(/^#&?$/, "");
  window.history.replaceState(null, "", window.location.pathname + window.location.search + (clean && clean !== "#" ? clean : ""));
  return decodeURIComponent(m[1]);
}

async function askNuruForToken() {
  if (!isInsideNuru()) return null;
  try {
    // Nuru may first open its own session (a network round trip or two).
    const res = await Promise.race([
      window.ethereum.request({ method: "nuru_appSession", params: [{ app: "alke" }] }),
      new Promise((resolve) => setTimeout(() => resolve(null), 15000)),
    ]);
    const token = res && (res.token || (typeof res === "string" ? res : null));
    return token || null;
  } catch {
    return null; // an older Nuru without the hand-off: normal sign-in
  }
}

async function signInWithNuruToken(token) {
  await auth.authStateReady();
  await signInWithCustomToken(auth, token);
  storage.set(NO_HANDOFF, null);
}

/** On load: signs in with Nuru's session when one is handed over (unless the
    person signed out here on purpose). True if it did. */
export async function tryNuruHandoff() {
  const fromUrl = takeTokenFromUrl();
  try {
    if (fromUrl) {
      await signInWithNuruToken(fromUrl);
      return true;
    }
    await auth.authStateReady();
    if (auth.currentUser || storage.get(NO_HANDOFF) === "1") return false;
    const token = await askNuruForToken();
    if (!token) return false;
    await signInWithNuruToken(token);
    return true;
  } catch (e) {
    console.warn("[account] Nuru hand-off failed", e?.code || e);
    return false;
  }
}

/** "Continue with Nuru" on the sign-in screen (inside Nuru only). */
export async function signInWithNuru() {
  const token = await askNuruForToken();
  if (!token) throw new AccountError("Nuru couldn't share your sign-in. Make sure you're signed in to Nuru, then try again.");
  try {
    await signInWithNuruToken(token);
  } catch (e) {
    throw friendly(e);
  }
}
