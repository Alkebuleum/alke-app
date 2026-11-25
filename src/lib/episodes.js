/* The ALKÉ story: three short episodes (1080p, captions burned in).
   The files are served by the app itself from public/videos/. To move them to
   a CDN or Firebase Storage later, change `src` here; nothing else changes. */

const base = import.meta.env.BASE_URL || "/";

export const EPISODES = [
  { id: "ep1", n: 1, title: "The ALKÉ Story", sub: "The Next Billion Network, Powered by Kedo", secs: 116, src: `${base}videos/alke-ep1.mp4`, poster: `${base}videos/alke-ep1.jpg` },
  { id: "ep2", n: 2, title: "Your First Day on ALKÉ", secs: 79, src: `${base}videos/alke-ep2.mp4`, poster: `${base}videos/alke-ep2.jpg` },
  { id: "ep3", n: 3, title: "How Deep Can You Drill?", secs: 89, src: `${base}videos/alke-ep3.mp4`, poster: `${base}videos/alke-ep3.jpg` },
];

export const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/* Watched episodes, kept on this device. */
const KEY = "alke_watched";
export function watched() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return new Set();
  }
}
export function markWatched(id) {
  const w = watched();
  w.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...w]));
  } catch {
    /* private mode: fine */
  }
  return w;
}

/* The Genesis invite match explainer (HeyGen), on the invite card while the
   match runs. Drop the files in public/videos/ and set `src` (and `poster`,
   `secs`, `aspect`: "16 / 9", "1 / 1" or "9 / 16"). Until `src` is set the
   slot is hidden in the live app (a placeholder shows in dev only). */
export const GENESIS_VIDEO = {
  id: "genesis-invite",
  title: "Early wins: the Genesis invite match",
  src: `${base}videos/alke-genesis-invite.mp4`,
  poster: null, // add public/videos/alke-genesis-invite.jpg and set it here; until then the cover is the gold-on-purple play tile
  secs: 208,
  aspect: "16 / 9",
};
