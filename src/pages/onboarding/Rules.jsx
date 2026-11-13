import { useState } from "react";
import { Bar, Button, Heading, I, Notice, Page } from "../../ui/ob";
import { useAuth } from "../../auth/AuthProvider";
import { acceptRules } from "../../lib/member";

export const RULES = [
  ["One person, one account", "Duplicate, shared or automated accounts are removed and their records voided."],
  ["A session records participation", "It is not mining computation and nothing runs in the background."],
  ["Estimates aren't rewards", "Amounts become final only after verification, within the published daily budget and per-member limits."],
  ["Allocations stay locked", "Until published release conditions are met. No price, exchange listing or release date is promised."],
  ["Rewards depend on where you live", "Where rewards are off, sessions, contributions and games still work."],
  ["Be constructive", "Chat, discussions and games follow the community guidelines."],
];

/* Step 3: Participation Rules v1. Acceptance is stamped with the server time. */
export default function Rules() {
  const { nuruId } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const accept = async () => {
    setBusy(true);
    setError(null);
    try {
      await acceptRules(nuruId);
    } catch (e) {
      setError(e.message || "Couldn't save that. Try again.");
      setBusy(false);
    }
  };

  return (
    <Page
      bar={<Bar step={3} />}
      footer={
        <Button busy={busy} disabled={!agreed} onClick={accept}>
          Agree and continue
        </Button>
      }
    >
      <Heading title="Participation rules" sub="Tap a rule for details." />

      <ol className="ob-card ob-rules" aria-label="Participation rules">
        {RULES.map(([t, d], i) => (
          <li key={t}>
            <details>
              <summary>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <b>{t}</b>
                <I.Chevron size={18} />
              </summary>
              <span>{d}</span>
            </details>
          </li>
        ))}
      </ol>

      <label className="ob-check">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span className="box">
          <I.Check size={15} />
        </span>
        <span>I agree to the participation rules</span>
      </label>

      {error ? <Notice kind="error">{error}</Notice> : null}
    </Page>
  );
}
