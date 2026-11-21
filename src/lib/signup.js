/* Email sign-up with a 6-digit code (functions/signup.js), the details
   carried between onboarding steps, and the member's reserved Alker ID. */
import { httpsCallable } from "firebase/functions";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, functions } from "./firebase";

const call = (name) => async (data) => {
  try {
    return (await httpsCallable(functions, name)(data)).data;
  } catch (e) {
    // Callable errors carry the server's own wording; network trouble doesn't.
    const own = e?.message && e.code !== "functions/internal";
    throw new Error(own ? e.message : "Something went wrong. Try again.");
  }
};

export const sendEmailCode = (email) => call("alkeEmailCode")({ email: email.trim().toLowerCase() });
/** → { status: "new", ticket } | { status: "password" } | { status: "social", providers } | { status: "verified" } */
export const verifyEmailCode = (email, code) => call("alkeEmailVerify")({ email: email.trim().toLowerCase(), code });
export const reserveAlkerId = () => call("alkeAlkerId")({});

/** Creates the verified email + password login from the ticket, then signs in. */
export async function createAccount({ ticket, email, password, name }) {
  await call("alkeCreateAccount")({ ticket, password, name });
  await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

/* ── Between steps (this tab only) ─────────────────────────────────────── */

const KEY = "alke.signup";
export function signupState() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
export function setSignupState(patch) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(patch === null ? {} : { ...signupState(), ...patch }));
  } catch {
    /* private mode: the next step asks again */
  }
}

/* A screen the person is looking at after its step is already done (the
   router would otherwise move straight on): the Alker ID they were just
   given, the first session, the story. */
const HOLD = "alke.hold";
export const holding = () => {
  try {
    return sessionStorage.getItem(HOLD) || "";
  } catch {
    return "";
  }
};
export const hold = (name) => {
  try {
    if (name) sessionStorage.setItem(HOLD, name);
    else sessionStorage.removeItem(HOLD);
  } catch {
    /* ignore */
  }
};

/* Step 4 (New Alkers) isn't stored on the server; it's remembered on this device. */
export const communityKey = (nuruId) => `alke.community.${nuruId}`;
export const communitySeen = (nuruId) => {
  try {
    return localStorage.getItem(communityKey(nuruId)) === "1";
  } catch {
    return true;
  }
};
export const markCommunitySeen = (nuruId) => {
  try {
    localStorage.setItem(communityKey(nuruId), "1");
  } catch {
    /* ignore */
  }
};

/** Set by the app config: the minimum age in the terms checkbox. TO CONFIRM. */
export const MIN_AGE = 18;
export const TERMS_URL = "https://alke.network/#security";
export const PRIVACY_URL = "https://alke.network/#security";
