/* Arrivals from alke.network.
   On the web, alke.network is the app's welcome page: the visitor enters their
   email there and lands on /sign-up with the email and any invite code in the
   URL fragment (#email=…&invite=…). A fragment never reaches a server or a
   Referer header; it's read once here, kept for this visit, and removed from
   the address bar before anything else runs. */
import { isInsideNuru } from "./account";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://alke.network").replace(/\/$/, "");

const EMAIL_KEY = "alke.email";
const INVITE_KEY = "alke.invite";

const normInvite = (s) => String(s || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
const put = (k, v) => {
  try {
    sessionStorage.setItem(k, v);
  } catch {
    /* private mode: the field just isn't prefilled */
  }
};

/** Call once, before the router starts. Leaves other fragment keys (#nuru_token=) alone. */
export function readHandoff() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw || !/(^|&)(email|invite)=/.test(raw)) return;
  const p = new URLSearchParams(raw);
  const email = (p.get("email") || "").trim();
  const invite = normInvite(p.get("invite"));
  if (email.includes("@") && email.length <= 254) put(EMAIL_KEY, email);
  if (invite) put(INVITE_KEY, invite);
  p.delete("email");
  p.delete("invite");
  const rest = p.toString();
  // alke.network sends people to the app's root (a deep link would pass through GitHub Pages'
  // 404.html, which copies the fragment into a query string); with an email, start at sign-up.
  const path = email && window.location.pathname === "/" ? "/sign-up" : window.location.pathname;
  window.history.replaceState(window.history.state, "", path + window.location.search + (rest ? "#" + rest : ""));
}

/** The email entered on alke.network this visit, or "". */
export function handedEmail() {
  try {
    return sessionStorage.getItem(EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function clearHandedEmail() {
  try {
    sessionStorage.removeItem(EMAIL_KEY);
  } catch {
    /* ignore */
  }
}

/** Native apps (iOS/Android shells) and the Nuru app keep the in-app welcome;
    a plain web visitor is sent to alke.network instead. */
export function usesSiteWelcome() {
  if (!import.meta.env.PROD) return false;
  if (window.Capacitor?.isNativePlatform?.()) return false;
  return !isInsideNuru();
}
