import { useState } from "react";
import { Button, Screen, StepHeader } from "../../ui/kit";
import { useAuth } from "../../auth/AuthProvider";
import { acceptRules } from "../../lib/member";

export const RULES = [
  ["One person, one account", "Duplicate, shared or automated accounts are removed and their records voided."],
  ["A session records participation", "It is not mining computation and nothing runs in the background."],
  ["Estimates aren't rewards", "Amounts become final only after verification, within the published daily budget and per-member limits."],
  ["Allocations stay locked", "Until published release conditions are met. No price, exchange listing or release date is promised."],
  ["Rewards depend on where you live", "Where rewards are off, sessions, contributions and games still work."],
  ["Be constructive", "Discussions, circles and games follow the community guidelines."],
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
    <Screen>
      <StepHeader step={3} />
      <div className="ui-body" style={{ gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 className="ui-h1">Participation rules</h1>
          <p className="ui-lede" style={{ fontSize: 14, lineHeight: "20px" }}>
            The short version of Participation Rules v1.
          </p>
        </div>
        <ol className="ui-card" style={{ listStyle: "none", margin: 0, padding: 0 }} aria-label="Rules summary">
          {RULES.map(([t, d], i) => (
            <li key={t} style={{ display: "flex", gap: 14, padding: "16px 18px", borderBottom: i < RULES.length - 1 ? "1px solid rgba(255,255,255,.06)" : 0 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#A08AFF", flex: "none", marginTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{t}</span>
                <span style={{ fontSize: 13, lineHeight: "19px", color: "var(--muted)" }}>{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <label style={{ display: "flex", gap: 12, alignItems: "flex-start", minHeight: 44, fontSize: 15, lineHeight: "22px", color: "var(--soft)", cursor: "pointer" }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: 22, height: 22, margin: 0, flex: "none", accentColor: "#8B6DFF" }} />
          <span>I've read the participation rules and agree to take part under them.</span>
        </label>
        {error ? (
          <div className="ui-alert" role="alert">
            {error}
          </div>
        ) : null}
      </div>
      <div className="ui-foot">
        <Button busy={busy} disabled={!agreed} onClick={accept}>
          Agree and enter the network
        </Button>
      </div>
    </Screen>
  );
}
