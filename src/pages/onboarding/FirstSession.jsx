import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Heading, MarkPaths, Notice, Page } from "../../ui/ob";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, finishOnboarding, sessionRemaining } from "../../lib/member";

const pad = (n) => String(n).padStart(2, "0");
const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};
const R = 88;
const C = 2 * Math.PI * R;

/* The last first-run step: one tap records session 1 (server time), then
   Home. The session state lives on the member record, so a reload keeps it. */
export default function FirstSession() {
  const { nuruId, member, firstName } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [startedHere, setStarted] = useState(false);
  // After a reload mid-hold, the saved record says the session already started.
  const started = startedHere || (!!member?.onboardedAt && sessionRemaining(member) > 0);

  const remaining = sessionRemaining(member, now);
  const running = started && remaining > 0;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  // Session 1 is recorded together with "onboarded", which would move the
  // router to Home straight away. Hold here to show the session, then go.
  const start = async () => {
    setBusy("start");
    setError(null);
    try {
      sessionStorage.setItem("alke.firstSession", "1");
      await finishOnboarding(nuruId, member, { startSession: true });
      setStarted(true);
      setNow(Date.now());
    } catch (e) {
      sessionStorage.removeItem("alke.firstSession");
      setError(e.message || "Couldn't start the session. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const skip = async () => {
    setBusy("skip");
    try {
      await finishOnboarding(nuruId, member, { startSession: false });
    } catch (e) {
      setError(e.message || "Couldn't save that. Try again.");
      setBusy(null);
    }
  };

  const goHome = () => {
    sessionStorage.removeItem("alke.firstSession");
    navigate("/home", { replace: true });
  };

  const frac = started ? remaining / SESSION_MS : 0;

  return (
    <Page
      bar={<header className="ob-bar" />}
      footer={
        started ? (
          <Button onClick={goHome}>Go to Home</Button>
        ) : (
          <>
            <Button busy={busy === "start"} disabled={!!busy} onClick={start}>
              Start my first session
            </Button>
            <Button kind="ghost" busy={busy === "skip"} disabled={!!busy} onClick={skip}>
              Skip for now
            </Button>
          </>
        )
      }
    >
      <Heading
        title={firstName ? `You're in, ${firstName}` : "You're in"}
        sub={started ? "Your first session is running." : "Start your first 24-hour session."}
      />

      <div role={started ? "timer" : undefined} aria-label={started ? "Session 1 time remaining" : undefined} style={{ position: "relative", width: "min(208px, 30cqh)", aspectRatio: "1", margin: "4px auto" }}>
        <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
          {frac > 0 ? (
            <circle
              cx="100" cy="100" r={R} fill="none" stroke="#7C5CFF" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(frac * C).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 100 100)"
              style={{ transition: "stroke-dasharray .6s ease" }}
            />
          ) : null}
          <circle cx="100" cy="100" r="70" fill="#14141B" stroke="rgba(255,255,255,.06)" />
          <g transform="translate(100 100) scale(.62) translate(-50 -56)">
            <MarkPaths stroke={started ? "#B4A2FF" : "#71717A"} width={6} />
          </g>
        </svg>
      </div>

      {started ? (
        <div className="ob-stack" style={{ gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums" }}>{clock(remaining)}</div>
            <p className="ob-small">until your next session</p>
          </div>
        </div>
      ) : null}

      {error ? <Notice kind="error">{error}</Notice> : null}
    </Page>
  );
}
