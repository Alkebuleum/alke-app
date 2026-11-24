/* The "member here" hint for alke.network. When a member is signed in on
   app.alke.network, a cookie on .alke.network tells the welcome page to say
   "Welcome back" and open the app in one tap, instead of asking for the email
   again. It holds the first name only (no email, no token): it's a hint, not
   a login. The app keeps its own sign-in; signing out removes the hint. */

const NAME = "alke_member";
const DAYS = 180;

// Only on the real domain: localhost and previews keep no cross-site cookie.
const domain = () => {
  const h = window.location.hostname;
  return h === "alke.network" || h.endsWith(".alke.network") ? "; Domain=.alke.network" : null;
};

export function setMemberHint(firstName) {
  const d = domain();
  if (d === null) return;
  const v = encodeURIComponent(String(firstName || "").trim().slice(0, 40) || "Alker");
  document.cookie = `${NAME}=${v}${d}; Path=/; Max-Age=${DAYS * 86400}; Secure; SameSite=Lax`;
}

export function clearMemberHint() {
  const d = domain();
  if (d === null) return;
  document.cookie = `${NAME}=${d}; Path=/; Max-Age=0; Secure; SameSite=Lax`;
}
