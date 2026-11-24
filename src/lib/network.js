/* Live network figures for the drilling screen, published by the server at
 * alke_network/live: { members, miningNow (members drilling now; the field keeps its old name), poolToday (ALKE),
 * estPerSession (ALKE), updatedAt }. Until the server writes it, this
 * returns null and the app shows the published Genesis figures instead of
 * made-up live numbers.
 */
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export function watchLive(cb) {
  try {
    return onSnapshot(
      doc(db, "alke_network", "live"),
      (s) => cb(s.exists() ? s.data() : null),
      () => cb(null),
    );
  } catch {
    cb(null);
    return () => {};
  }
}
