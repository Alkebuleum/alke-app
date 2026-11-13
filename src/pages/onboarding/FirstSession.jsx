import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Screen, Wordmark } from "../../ui/kit";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, finishOnboarding, sessionRemaining } from "../../lib/member";

const pad = (n) => String(n).padStart(2, "0");
const clock = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};
const C = 892.2; // circumference of the r=142 ring

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

  const dash = `${((remaining / SESSION_MS) * C).toFixed(1)} ${C}`;

  return (
    <Screen glow>
      <div className="ui-body" style={{ paddingTop: "max(60px, env(safe-area-inset-top))", gap: 10 }}>
        <Wordmark />
        <h1 className="ui-h1" style={{ margin: "6px 0 0", fontSize: 34, lineHeight: "38px" }}>
          You're in, {firstName}.
        </h1>
        <p className="ui-lede">{started ? "Session 1 is running. Here's what happens to it next." : "Start your first session. One tap, then it runs for 24 hours on its own."}</p>

        <div style={{ position: "relative", width: 220, height: 220, margin: "34px auto 20px", flex: "none" }}>
          {!started ? (
            <button type="button" onClick={start} disabled={!!busy} aria-label="Start your first session" style={{ position: "absolute", inset: 0, border: 0, padding: 0, background: "transparent", borderRadius: "50%" }}>
              <span aria-hidden="true" style={{ position: "absolute", inset: -26, borderRadius: "50%", background: "radial-gradient(circle,rgba(110,72,255,.34) 0%,rgba(110,72,255,.10) 42%,rgba(110,72,255,0) 68%)", animation: "alkBreath 4.5s ease-in-out infinite" }} />
              <svg width="220" height="220" viewBox="0 0 300 300" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
                <defs>
                  <radialGradient id="fsIdle" cx=".36" cy=".3" r=".85">
                    <stop offset="0" stopColor="#3D3270" />
                    <stop offset=".5" stopColor="#1B1533" />
                    <stop offset="1" stopColor="#0C0A17" />
                  </radialGradient>
                </defs>
                <circle cx="150" cy="150" r="142" fill="none" stroke="#FFFFFF" strokeOpacity=".07" strokeWidth="3" />
                <circle cx="150" cy="150" r="128" fill="none" stroke="#FFFFFF" strokeOpacity=".14" strokeWidth="6" strokeDasharray="1 12.4" />
                <g style={{ transformOrigin: "150px 150px", animation: "alkSpin 60s linear infinite" }}>
                  <circle cx="150" cy="36" r="3.5" fill="#C6B6FF" fillOpacity=".85" />
                </g>
                <circle cx="150" cy="150" r="98" fill="url(#fsIdle)" stroke="#C6B6FF" strokeOpacity=".22" strokeWidth="1" />
                <ellipse cx="130" cy="98" rx="52" ry="24" fill="#FFFFFF" fillOpacity=".06" />
                <g transform="translate(150 150) scale(.95) translate(-50 -56)" fill="none" stroke="#C6B6FF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" strokeOpacity=".7" />
                  <g style={{ animation: "alkPulse 2.4s ease-in-out infinite" }}>
                    <line x1="50" y1="27" x2="50" y2="85" />
                    <path d="M20 45 L32 56 L20 67" />
                    <path d="M30 45 L42 56 L30 67" />
                    <path d="M80 45 L68 56 L80 67" />
                    <path d="M70 45 L58 56 L70 67" />
                  </g>
                </g>
              </svg>
            </button>
          ) : (
            <div role="timer" aria-label="Session 1 active" style={{ position: "absolute", inset: 0 }}>
              <span aria-hidden="true" style={{ position: "absolute", inset: -34, borderRadius: "50%", background: "radial-gradient(circle,rgba(118,82,255,.58) 0%,rgba(94,58,255,.20) 40%,rgba(94,58,255,0) 68%)" }} />
              <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid #C6B6FF", animation: "alkBurst .8s ease-out forwards" }} />
              <svg width="220" height="220" viewBox="0 0 300 300" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
                <defs>
                  <linearGradient id="fsArc" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#EDE7FF" />
                    <stop offset=".5" stopColor="#9B7DFF" />
                    <stop offset="1" stopColor="#5E3AFF" />
                  </linearGradient>
                  <radialGradient id="fsOrb" cx=".36" cy=".3" r=".85">
                    <stop offset="0" stopColor="#9478FF" />
                    <stop offset=".45" stopColor="#4C2BD9" />
                    <stop offset="1" stopColor="#160B45" />
                  </radialGradient>
                </defs>
                <circle cx="150" cy="150" r="142" fill="none" stroke="#FFFFFF" strokeOpacity=".08" strokeWidth="3" />
                <circle cx="150" cy="150" r="142" fill="none" stroke="url(#fsArc)" strokeWidth="4" strokeLinecap="round" strokeDasharray={dash} transform="rotate(-90 150 150)" />
                <circle cx="150" cy="150" r="128" fill="none" stroke="#FFFFFF" strokeOpacity=".18" strokeWidth="6" strokeDasharray="1 12.4" />
                <g style={{ transformOrigin: "150px 150px", animation: "alkSpin 30s linear infinite" }}>
                  <circle cx="150" cy="36" r="9" fill="#9B7DFF" fillOpacity=".3" />
                  <circle cx="150" cy="36" r="4" fill="#EDE7FF" />
                </g>
                <circle cx="150" cy="150" r="98" fill="url(#fsOrb)" stroke="#D6CAFF" strokeOpacity=".38" strokeWidth="1" />
                <ellipse cx="128" cy="96" rx="54" ry="24" fill="#FFFFFF" fillOpacity=".1" />
                <g transform="translate(150 150) scale(.95) translate(-50 -56)" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" />
                  <line x1="50" y1="27" x2="50" y2="85" />
                  <path d="M20 45 L32 56 L20 67" />
                  <path d="M30 45 L42 56 L30 67" />
                  <path d="M80 45 L68 56 L80 67" />
                  <path d="M70 45 L58 56 L70 67" />
                </g>
              </svg>
            </div>
          )}
        </div>

        {!started ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
            <span style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600, letterSpacing: "-.015em" }}>Tap the core</span>
            <p style={{ margin: 0, fontSize: 14, lineHeight: "21px", color: "var(--muted)" }}>Nothing to install or keep open. Your phone does no mining computation, so it won't drain your battery.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: "var(--display)", fontSize: 40, lineHeight: 1, fontWeight: 600, letterSpacing: "-.03em", fontVariantNumeric: "tabular-nums" }}>{clock(remaining)}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em", color: "var(--faint)" }}>SESSION 1 · UNTIL YOUR NEXT</span>
            </div>
            <ol className="ui-card" style={{ listStyle: "none", margin: 0, padding: "6px 16px", borderRadius: 22 }}>
              {[
                ["Recorded now", "Pending", { border: "1.5px dashed #A9A6B6" }, "var(--muted)"],
                ["Checked within a day", "Verified", { background: "#6EE7B7" }, "var(--mint)"],
                ["Reserved for you", "Locked", { background: "#8B6DFF", boxShadow: "0 0 8px #8B6DFF" }, "var(--lilac)"],
              ].map(([t, s, dot, c], i) => (
                <li key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,.06)" : 0 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", boxSizing: "border-box", flex: "none", ...dot }} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{t}</span>
                  <span style={{ fontSize: 12, color: c }}>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {error ? (
          <div className="ui-alert" role="alert">
            {error}
          </div>
        ) : null}
      </div>
      <div className="ui-foot" style={{ gap: 6 }}>
        {started ? (
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
        )}
      </div>
    </Screen>
  );
}
