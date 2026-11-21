import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gold, Mark, Onb, Orb, Problem, Switch } from "../../ui/onb";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, finishOnboarding, sessionRemaining } from "../../lib/member";
import { enablePush, pushState, usePrefs } from "../../lib/notifications";
import { hold } from "../../lib/signup";

const pad = (n) => String(n).padStart(2, "0");
const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};
const C = 892.2; // 2πr for r = 142 in the 300 viewBox

const Bell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" />
  </svg>
);

/* Step 5: a person check, then session 1 starts (server time). Recording it
   also finishes onboarding, which would move the router on, so this screen
   holds until "Continue" (then the story, step 6). A reload keeps the state:
   it lives on the member record. */
export default function FirstSession() {
  const { nuruId, member } = useAuth();
  const navigate = useNavigate();
  const [human, setHuman] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [prefs, setPref] = usePrefs();

  const started = !!member?.onboardedAt && !!member?.lastSessionAt;
  const remaining = sessionRemaining(member, now);

  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [started]);

  const start = async () => {
    if (!human || busy) return;
    setBusy(true);
    setError(null);
    hold("firstSession");
    try {
      await finishOnboarding(nuruId, member, { startSession: true });
      setNow(Date.now());
    } catch (e) {
      hold(null);
      setError(e.message || "Couldn't start the session. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const remind = async (on) => {
    await setPref("reminders", on).catch(() => {});
    if (on && pushState() === "default") enablePush(nuruId).catch(() => {});
  };

  const next = () => {
    hold("story");
    navigate("/story", { replace: true });
  };

  if (started) {
    const opens = new Date((member.lastSessionAt?.toMillis?.() || Date.now()) + SESSION_MS);
    const at = opens.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return (
      <Onb
        step={5}
        label="First session"
        title={`Session ${member.sessionCount || 1} is recorded.`}
        sub={`Your next session opens tomorrow at ${at}.`}
        footer={<Gold onClick={next}>Continue</Gold>}
      >
        <div className="onb-timer" role="timer" aria-label={`Next session in ${clock(remaining)}`}>
          <svg width="196" height="196" viewBox="0 0 300 300" aria-hidden="true">
            <defs>
              <linearGradient id="obArc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#C6B6FF" />
                <stop offset="1" stopColor="#5530E8" />
              </linearGradient>
            </defs>
            <circle cx="150" cy="150" r="142" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="5" />
            <circle cx="150" cy="150" r="142" fill="none" stroke="url(#obArc)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${((remaining / SESSION_MS) * C).toFixed(1)} ${C}`} transform="rotate(-90 150 150)" />
          </svg>
          <div className="face">
            <Mark size={28} color="#C6B6FF" />
            <span className="clock">{clock(remaining)}</span>
            <small>UNTIL NEXT SESSION</small>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="onb-chip green">Recorded</span>
          <span className="onb-chip gold">Pending verification</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", borderRadius: 18, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <b style={{ fontSize: 15, fontWeight: 600 }}>Provisional reward</b>
            <small style={{ fontSize: 12.5, color: "#A9A6B6" }}>Shown once the reward rules are published</small>
          </span>
          <span className="onb-chip plain">Not set yet</span>
        </div>

        <div className="onb-panel onb-list" style={{ padding: 0 }}>
          <div className="onb-row">
            <span className="tile">
              <Bell />
            </span>
            <span className="txt">
              <b>Remind me when it opens</b>
              <small>Respects quiet hours</small>
            </span>
            <Switch on={!!prefs.reminders} onChange={remind} label="Remind me when it opens" />
          </div>
        </div>
      </Onb>
    );
  }

  return (
    <Onb
      step={5}
      label="First session"
      title="Start your first ALKE session."
      sub="One tap starts 24 hours of participation. Rewards stay provisional until the rules are published."
      footer={
        <Gold busy={busy} disabled={!human || busy} onClick={start}>
          Start my first session
        </Gold>
      }
    >
      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
        <Orb size={176} />
      </div>
      <label
        className="onb-check"
        style={{ alignItems: "center", minHeight: 62, padding: "0 18px", borderRadius: 18, border: `1px solid ${human ? "rgba(110,231,183,.45)" : "rgba(255,255,255,.12)"}`, background: human ? "rgba(110,231,183,.08)" : "rgba(255,255,255,.04)" }}
      >
        <input type="checkbox" checked={human} onChange={(e) => setHuman(e.target.checked)} style={{ width: 24, height: 24, accentColor: "#6EE7B7" }} />
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <b style={{ fontSize: 16, fontWeight: 600, color: "#F7F5F2" }}>I'm a person, not a bot</b>
          <small style={{ fontSize: 12.5, color: "#A9A6B6" }}>Keeps rewards fair for real people</small>
        </span>
      </label>
      <p className="onb-note center">App participation, not proof-of-work mining. Nothing runs on your phone.</p>
      <Problem>{error}</Problem>
    </Onb>
  );
}
