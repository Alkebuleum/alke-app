import { useState } from "react";
import { Gold, Onb, Problem } from "../../ui/onb";
import { useAuth } from "../../auth/AuthProvider";
import { acceptRules } from "../../lib/member";
import { MIN_AGE, PRIVACY_URL, TERMS_URL } from "../../lib/signup";

/* Shown in Settings → Participation rules. */
export const RULES = [
  ["One person, one account", "Duplicate, shared or automated accounts are removed and their records voided."],
  ["A session records participation", "It's app participation, not proof-of-work mining, and nothing runs in the background."],
  ["Rewards are provisional", "Participation rewards are provisional. They are not currently transferable or redeemable blockchain coins."],
  ["Claims open at mainnet", "Eligible rewards are intended to become claimable when the post-quantum mainnet launches, under rules published first. No price or exchange listing is promised."],
  ["Rewards depend on where you live", "Where rewards are off, sessions, the community and games still work."],
  ["Be constructive", "Chat, discussions and games follow the community guidelines."],
];

/* Members who joined before the terms moved into "Create your account"
   accept them here once. Acceptance is stamped with the server time. */
export default function Rules() {
  const { nuruId, signOut } = useAuth();
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
    <Onb
      onBack={signOut}
      step={2}
      label="Your account"
      title="One more thing."
      sub="Please confirm the terms to continue."
      footer={
        <Gold busy={busy} disabled={!agreed || busy} onClick={accept}>
          Continue
        </Gold>
      }
    >
      <label className="onb-check">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>
          I'm {MIN_AGE} or older and agree to the{" "}
          <a href={TERMS_URL} target="_blank" rel="noopener">
            Terms of Use
          </a>{" "}
          and{" "}
          <a href={PRIVACY_URL} target="_blank" rel="noopener">
            Privacy Notice
          </a>
          .
        </span>
      </label>
      <Problem>{error}</Problem>
    </Onb>
  );
}
