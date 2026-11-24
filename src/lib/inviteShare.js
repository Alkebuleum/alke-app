/* The invite message and the share links for each app (WhatsApp, Telegram,
   X, Facebook). One place to tune the wording. Keep it honest: rewards are
   provisional, and inviting grows your rig (depth), never "earn from friends". */

/** The full message, link at the top and the bottom (WhatsApp, copy). */
export function inviteMessage({ link, phase = "Phase 1 · Genesis" }) {
  return [
    "⛏️ DRILL ALKE WITH ME",
    "",
    link,
    "⬆️ ⬆️",
    "I'm drilling ALKE on the ALKÉ Network. One tap a day starts a 24-hour drill, and my ALKE Rewards climb live. It's free: no payment, no crypto wallet, and your phone does no computing.",
    "",
    `Rewards are provisional until claims open, so no guarantees. But it's early (${phase}), and every friend who joins helps my rig drill deeper 🚀`,
    "",
    `Join me on ALKÉ: ${link}`,
  ].join("\n");
}

/** Telegram puts the link above the text itself, so the text skips the top link. */
const telegramText = ({ link, phase }) => inviteMessage({ link, phase }).split("\n").slice(4).join("\n");

/** X has a short limit: one line and the link. */
const xText = ({ phase }) => `⛏️ I'm drilling ALKE on the ALKÉ Network: one tap a day, free, no wallet needed. It's early (${phase}). Join me and help my rig drill deeper:`;

const enc = encodeURIComponent;

export const SHARE_TARGETS = {
  whatsapp: (o) => `https://wa.me/?text=${enc(inviteMessage(o))}`,
  telegram: (o) => `https://t.me/share/url?url=${enc(o.link)}&text=${enc(telegramText(o))}`,
  x: (o) => `https://x.com/intent/post?text=${enc(xText(o))}&url=${enc(o.link)}`,
  // Facebook only takes the link; the message is copied so it can be pasted into the post.
  facebook: (o) => `https://www.facebook.com/sharer/sharer.php?u=${enc(o.link)}`,
};

export function openShare(target, o) {
  const url = SHARE_TARGETS[target](o);
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) window.location.href = url; // pop-ups blocked (some in-app browsers)
}
