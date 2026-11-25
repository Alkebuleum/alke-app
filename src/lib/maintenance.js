/* A short maintenance pause (app_config/maintenance { on }), e.g. the
 * Alker ID switch (Nuru repo docs/ALKER_ID_MIGRATION.md). While it's on the
 * app shows "back in a moment" and writes nothing. When it ends the sign-in
 * token is refreshed (the switch can change the member's ID, carried in the
 * `nid` claim) and the app reloads, so every screen starts on the new ID.
 * app_config is publicly readable (the rules' fallback), so this works
 * signed in or out.
 */
import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";

export function useMaintenance() {
  const [on, setOn] = useState(false);
  const was = useRef(false);
  useEffect(() => {
    try {
      return onSnapshot(
        doc(db, "app_config", "maintenance"),
        async (s) => {
          const now = s.exists() && s.data().on === true;
          setOn(now);
          if (was.current && !now) {
            try {
              await auth.currentUser?.getIdToken(true);
            } catch {
              /* signed out, or offline: the reload signs in again */
            }
            window.location.reload();
          }
          was.current = now;
        },
        () => setOn(false),
      );
    } catch {
      return undefined;
    }
  }, []);
  return on;
}
