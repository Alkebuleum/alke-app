/* Tap boost: a 25-tap combo while mining earns one boost for today (UTC).
 * The server (alkeBoost, functions/core.js recordBoost) checks and counts
 * it, capped per day, and writes alke_members/{id}/allocation/boost
 * { day, count }; settlement multiplies that day's share by tapBoost(count). */
import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./firebase";

/** Asks for one boost: { ok, reason ("cap" | "no-session" | "too-fast"), day, count, mult, perDay }. */
export async function sendBoost() {
  return (await httpsCallable(functions, "alkeBoost")({})).data;
}

export function watchBoost(nuruId, cb) {
  return onSnapshot(
    doc(db, "alke_members", nuruId, "allocation", "boost"),
    (s) => cb(s.exists() ? s.data() : null),
    () => cb(null),
  );
}
