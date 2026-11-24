import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gold, Onb, Problem, Switch } from "../../ui/onb";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, finishOnboarding } from "../../lib/member";
import { fmtAlke } from "../../lib/genesis";
import { enablePush, pushState, usePrefs } from "../../lib/notifications";
import { hold } from "../../lib/signup";
import { DrillScene, RollingNumber, useDrilling } from "../app/drilling";

const pad = (n) => String(n).padStart(2, "0");
const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

const Bell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" />
  </svg>
);

/* Step 5: start drilling. A person check, then drill 1 starts (a 24-hour
   session, server time). Kept minimal for someone still onboarding: the rig
   from the Drill tab, their ALKE climbing, and one next step. No tap game
   yet; they meet veins and invites on the Drill tab. Recording the drill
   also finishes onboarding, which would move the router on, so this screen
   holds until "Next" (then the story, step 6). A reload keeps the state:
   it lives on the member record. */
export default function FirstSession() {
  const { nuruId, member } = useAuth();
  const navigate = useNavigate();
  const m = useDrilling();
  const [human, setHuman] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [flare, setFlare] = useState(0);
  const [prefs, setPref] = usePrefs();

  const started = !!member?.onboardedAt && !!member?.lastSessionAt;

  const start = async () => {
    if (!human || busy) return;
    setBusy(true);
    setError(null);
    hold("firstSession");
    try {
      await finishOnboarding(nuruId, member, { startSession: true });
      setFlare(Date.now());
    } catch (e) {
      hold(null);
      setError(e.message || "Couldn't start drilling. Try again.");
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

  const scene = (
    <div className="onb-drill">
      <DrillScene
        depth={m.depth}
        sessionDepth={m.sessionDepth}
        sessionTarget={m.sessionTarget}
        fraction={m.fraction}
        running={m.running}
        level={m.level}
        taps={false}
        onIdleTap={() => (human ? start() : null)}
        flare={flare}
        height="clamp(210px, 32dvh, 280px)"
      />
    </div>
  );

  if (started) {
    const opens = new Date((member.lastSessionAt?.toMillis?.() || Date.now()) + SESSION_MS);
    const at = opens.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return (
      <Onb step={5} label="Start drilling" title="You're drilling ALKE." sub={`Your rig drills for 24 hours. Your next drill opens tomorrow at ${at}.`} footer={<Gold onClick={next}>Next: the ALKÉ story</Gold>}>
        {scene}

        <div className="onb-drill-total">
          <span className="lbl">ALKE Rewards · provisional</span>
          <RollingNumber value={m.rewardsAlke} size={38} label={`Your ALKE Rewards: ${fmtAlke(m.rewardsAlke)} ALKE`} />
          <span className="sub" role="timer">
            +{fmtAlke(m.todayAlke)} today (est.) · {clock(m.remaining)} left
          </span>
        </div>

        <div className="onb-panel onb-list" style={{ padding: 0 }}>
          <div className="onb-row">
            <span className="tile">
              <Bell />
            </span>
            <span className="txt">
              <b>Remind me for my next drill</b>
              <small>Respects quiet hours</small>
            </span>
            <Switch on={!!prefs.reminders} onChange={remind} label="Remind me for my next drill" />
          </div>
        </div>
      </Onb>
    );
  }

  return (
    <Onb
      step={5}
      label="Start drilling"
      title="Start drilling ALKE."
      sub="One tap starts 24 hours of drilling. The ALKE you drill is yours."
      footer={
        <Gold busy={busy} disabled={!human || busy} onClick={start}>
          Start drilling
        </Gold>
      }
    >
      {scene}
      <label className="onb-check" style={{ alignItems: "center", justifyContent: "center", color: human ? "#6EE7B7" : "#D8D5E2" }}>
        <input type="checkbox" checked={human} onChange={(e) => setHuman(e.target.checked)} style={{ width: 20, height: 20, accentColor: "#6EE7B7" }} />
        <span style={{ fontSize: 15, fontWeight: 600 }}>I'm a person, not a bot</span>
      </label>
      <p className="onb-note center">Drilling is app participation. Nothing runs on your phone and it doesn't use your battery.</p>
      <Problem>{error}</Problem>
    </Onb>
  );
}
