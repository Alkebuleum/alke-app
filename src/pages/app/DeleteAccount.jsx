import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../lib/firebase";
import { useAuth } from "../../auth/AuthProvider";
import { Button, Field, Notice } from "../../ui/ob";
import { AppPage, SubBar } from "../../ui/shell";

/* Deletes the ALKE membership (functions/account.js). The Nuru account stays. */
const GONE = [
  "Your cALKE, sessions, streak and allocation",
  "Your game progress and leaderboard scores",
  "Your notifications and alert settings",
  "Your personhood check, including the copy Stripe keeps",
];

export default function DeleteAccount() {
  const { signOut } = useAuth();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const ready = typed.trim().toUpperCase() === "DELETE";

  const run = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      await httpsCallable(functions, "alkeDeleteAccount", { timeout: 300000 })({ confirm: "DELETE" });
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("alke."))
          .forEach((k) => localStorage.removeItem(k));
      } catch {
        /* private mode */
      }
      await signOut();
    } catch (e) {
      setError(e?.message || "Couldn't delete your account. Try again.");
      setBusy(false);
    }
  };

  return (
    <AppPage tab="profile" bar={<SubBar title="Delete ALKE account" back="/settings" />}>
      <div style={{ margin: "0 4px" }} className="ob-stack">
        <p className="ob-sub">This permanently deletes your ALKE membership. It can't be undone, and any cALKE you've mined is lost.</p>
        <section className="ob-sec">
          <div className="ob-group">What gets deleted</div>
          <ul className="ob-rules" style={{ listStyle: "none", padding: 0 }}>
            {GONE.map((g) => (
              <li key={g} style={{ display: "block", padding: "6px 0", color: "var(--text-2)" }}>
                · {g}
              </li>
            ))}
          </ul>
        </section>
        <p className="ob-small">Your Nuru account isn't affected. To delete it as well, use Delete account in the Nuru app's account settings.</p>
        <Field id="del-confirm" label='Type "DELETE" to confirm'>
          <div className="ob-input mono">
            <input id="del-confirm" autoComplete="off" autoCapitalize="characters" value={typed} onChange={(e) => setTyped(e.target.value)} />
          </div>
        </Field>
        {error ? <Notice kind="error">{error}</Notice> : null}
        <Button kind="danger" busy={busy} disabled={!ready || busy} onClick={run}>
          Delete my ALKE account
        </Button>
      </div>
    </AppPage>
  );
}
