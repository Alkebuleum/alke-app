import { useState } from "react";
import { Gold, Onb, Problem } from "../../ui/onb";
import { useAuth } from "../../auth/AuthProvider";
import { joinAlkers, resolveAlkers } from "../../lib/chat";
import { markCommunitySeen } from "../../lib/signup";

const Out = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A9A6B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const FACES = [
  ["KA", "linear-gradient(135deg,#2F8F6B,#1C5A43)"],
  ["LM", "linear-gradient(135deg,#A8721A,#6E4A0E)"],
  ["TO", "linear-gradient(135deg,#2B8C96,#1A5C63)"],
];

/* Step 4: join New Alkers, the community chat in the app (the same one as
   the Chat screen). Optional; the official channels are optional too. */
export default function JoinCommunity() {
  const { nuruId, displayName, advance } = useAuth();
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const join = async () => {
    if (joined || busy) return;
    setBusy(true);
    setError(null);
    try {
      await joinAlkers(await resolveAlkers(), nuruId, displayName);
      setJoined(true);
    } catch (e) {
      setError(e.message || "Couldn't join right now. You can join later from Community.");
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    markCommunitySeen(nuruId);
    advance();
  };

  return (
    <Onb
      step={4}
      label="New Alkers"
      title="Say hello to New Alkers."
      sub="Your community space, right here in the app. No other app or login needed."
      footer={
        <>
          <Gold onClick={next}>Continue</Gold>
          <p className="onb-note center">You can join or leave spaces any time.</p>
        </>
      }
    >
      <div className="onb-panel gold">
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex" }} aria-hidden="true">
            {FACES.map(([t, bg], i) => (
              <span key={t} className="onb-avatar" style={{ background: bg, marginLeft: i ? -10 : 0, border: "2px solid #14111F" }}>
                {t}
              </span>
            ))}
          </span>
          <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            <b style={{ fontSize: 16, fontWeight: 600 }}>New Alkers</b>
            <small style={{ fontSize: 12.5, color: "#A9A6B6" }}>Questions, daily tips, new members</small>
          </span>
        </span>
        <button type="button" className={joined ? "onb-btn done" : "onb-btn violet"} aria-pressed={joined} onClick={join} disabled={busy}>
          {busy ? <span className="onb-spin" /> : null}
          {joined ? "Joined" : "Join New Alkers"}
        </button>
        <Problem>{error}</Problem>
      </div>

      <div className="onb-panel">
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <h2>Official channels</h2>
          <span className="onb-chip soft">Optional</span>
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          <a className="onb-btn ghost" style={{ height: 48, fontSize: 15 }} href="https://x.com/alkenetwork" target="_blank" rel="noopener">
            X<Out />
          </a>
          <a className="onb-btn ghost" style={{ height: 48, fontSize: 15 }} href="https://www.youtube.com/@alkenetwork" target="_blank" rel="noopener">
            YouTube<Out />
          </a>
        </div>
        <p className="onb-note">Only follow official ALKÉ accounts.</p>
      </div>
    </Onb>
  );
}
