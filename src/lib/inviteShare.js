/* The invite message and the share links for each app (WhatsApp, Telegram,
   X, Facebook). One place to tune the wording.
   Pitch it to crypto people, but stay on the safe side: say what MAY happen
   on the mainnet, never what will. No price, profit, returns or "investment"
   talk; always "no guarantees", "provisional", "not an investment", and
   "not transferable today". Free means free: nothing to buy, ever.
   Write it as crypto, not as a game: token, Genesis allocation, mainnet,
   on-chain. Leave out tap, rig, levels and "climb live". */

import { isInsideNuru } from "./account";

const NL = String.fromCharCode(10);
const HEAD = "⛏️ DRILL ALKE FOR FREE!!";

/** The full message, link at the top and the bottom (WhatsApp, copy). */
export function inviteMessage({ link, phase = "Phase 1 · Genesis" }) {
  return [
    HEAD,
    "",
    link,
    "⬆️ ⬆️",
    "ALKE is the native fuel of the ALKÉ Network, a post-quantum blockchain in development. The Genesis allocation is open: drill your daily share of it for free. No purchase, no wallet, no hardware.",
    "",
    `🔐 When the ALKÉ post-quantum mainnet launches and claims open, the ALKE you drill may become claimable on-chain. We're in ${phase}, when the daily share per member is at its highest.`,
    "",
    "No guarantees: Genesis rewards are provisional, not an investment, and not transferable today.",
    "",
    `Join me on ALKÉ: ${link}`,
  ].join(NL);
}

/** Telegram puts the link above the text itself, so the text skips the top link. */
const telegramText = ({ link, phase }) => [HEAD, "", ...inviteMessage({ link, phase }).split(NL).slice(4)].join(NL);

/** X has a short limit: the pitch, the caveat and the link. */
const xText = ({ phase }) =>
  `⛏️ Drill ALKE for free!! The Genesis allocation of the ALKÉ post-quantum blockchain is open (${phase}). Drilled ALKE may become claimable on-chain at mainnet. No purchase, no guarantees, not an investment. Join me:`;

const enc = encodeURIComponent;

export const SHARE_TARGETS = {
  whatsapp: (o) => `https://wa.me/?text=${enc(inviteMessage(o))}`,
  telegram: (o) => `https://t.me/share/url?url=${enc(o.link)}&text=${enc(telegramText(o))}`,
  x: (o) => `https://x.com/intent/post?text=${enc(xText(o))}&url=${enc(o.link)}`,
  // Facebook only takes the link; the message is copied so it can be pasted into the post.
  facebook: (o) => `https://www.facebook.com/sharer/sharer.php?u=${enc(o.link)}`,
};

/* Opens the app's share page in a new window. Not with "noopener": that
   makes window.open return null even when the window opened, and the
   fallback below then also sent this page to wa.me / t.me, which redirect
   to whatsapp:// / intent:// links an in-app browser can't open (the error
   page inside Nuru). The opener link is cut by hand instead. Only a real
   pop-up block falls back to this page, and never inside Nuru, whose browser
   always opens new windows outside itself. */
export function openShare(target, o) {
  const url = SHARE_TARGETS[target](o);
  const w = window.open(url, "_blank");
  if (w) {
    try {
      w.opener = null;
    } catch {
      /* cross-origin already: fine */
    }
    return;
  }
  if (isInsideNuru()) return;
  window.location.href = url; // pop-ups blocked (some in-app browsers)
}
