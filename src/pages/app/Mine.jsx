import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, STREAK_MS, liveStreak, nextStreak, sessionRemaining, startSession } from "../../lib/member";
import { useMemberData } from "../../lib/useMemberData";
import { AppScreen, Chevron, Flame, InfoLink, Lock, Orb, ago, alke, card, clock, display, hhmm, mono, tabular, useNow } from "../../ui/app";

/* Community mining: the daily session. Idle → tap the core → 24 hours,
   counted down from the server's start time. */
export default function Mine() {
  const { nuruId, member } = useAuth();
  const { allocation } = useMemberData({ allocation: true });
  const now = useNow(1000);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const remaining = sessionRemaining(member, now);
  const running = remaining > 0;
  const last = member?.lastSessionAt?.toDate?.();
  const streak = liveStreak(member, now);
  const next = nextStreak(member, now);
  const keepBy = last ? new Date(last.getTime() + STREAK_MS) : null;

  const start = async () => {
    if (running || busy) return;
    setBusy(true);
    setError(null);
    try {
      await startSession(nuruId, member);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen tab="mine" glow={running ? "rgba(110,72,255,.42)" : "rgba(110,72,255,.34)"}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={mono}>COMMUNITY MINING</span>
          <h1 style={{ margin: 0, ...display, fontSize: 30, lineHeight: "34px", letterSpacing: "-.025em" }}>{running ? "Session active" : "Your daily session"}</h1>
        </div>
        <InfoLink />
      </div>

      {running ? (
        <span role="status" style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 7, height: 30, padding: "0 12px", borderRadius: 999, background: "rgba(110,231,183,.12)", fontSize: 12, fontWeight: 600, color: "#6EE7B7" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6EE7B7", boxShadow: "0 0 8px #6EE7B7" }} />
          Recorded at {hhmm(last)} · runs for 24 hours
        </span>
      ) : (
        <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 7, height: 30, padding: "0 12px", borderRadius: 999, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z" />
            <path d="m9 12 2.2 2.2L15.5 10" />
          </svg>
          Participation-based · no computation on your phone
        </span>
      )}

      {running ? (
        <div role="timer" aria-label={`Session active, ${clock(remaining)} left`} style={{ position: "relative", width: 280, height: 280, margin: "6px auto 0" }}>
          <Orb running fraction={remaining / SESSION_MS} />
        </div>
      ) : (
        <button type="button" onClick={start} disabled={busy} aria-label="Start today's session" style={{ position: "relative", width: 280, height: 280, margin: "6px auto 0", display: "block", borderRadius: "50%", border: 0, padding: 0, background: "transparent", cursor: "pointer" }}>
          <Orb />
        </button>
      )}

      {running ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ ...display, fontSize: 52, lineHeight: 1, letterSpacing: "-.03em", ...tabular }}>{clock(remaining)}</span>
          <span style={mono}>UNTIL YOUR NEXT SESSION</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 13, fontWeight: 600, color: "#F2C66B" }}>
            <Flame />
            {streak}-day streak
          </span>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
            <span style={{ ...display, fontSize: 22, letterSpacing: "-.015em" }}>Tap the core to begin</span>
            <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--muted)" }}>
              One tap starts a 24-hour session.
              {last ? (
                <>
                  <br />
                  Your last one ended {ago(now - (last.getTime() + SESSION_MS))} ago.
                </>
              ) : null}
            </span>
          </div>
          <button type="button" className="ui-btn primary" onClick={start} disabled={busy}>
            {busy ? <span className="ui-spin" aria-hidden="true" /> : null}
            Start session
          </button>
        </>
      )}
      {error ? (
        <div className="ui-alert" role="alert">
          {error}
        </div>
      ) : null}

      {/* Streak */}
      <div style={{ ...card, padding: 16, borderRadius: 22, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(242,198,107,.14)", color: "#F2C66B", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Flame size={22} width={1.8} />
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
          <span style={{ ...display, fontSize: 17 }}>{streak > 0 ? `${streak}-day streak` : "No streak yet"}</span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {running
              ? "Your next session opens when this one ends."
              : streak > 0 && keepBy
                ? `Start by ${keepBy.toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })} to make it ${next}`
                : "Start a session each day to build one."}
          </span>
        </span>
        <span style={{ ...mono, fontSize: 11, letterSpacing: ".1em", textAlign: "right" }}>
          BEST
          <br />
          <span style={{ ...display, fontSize: 17, letterSpacing: 0, color: "var(--text)" }}>{member?.bestStreak || 0}</span>
        </span>
      </div>

      {running ? (
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={mono}>TODAY'S ESTIMATE</span>
            <span style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", borderRadius: 999, border: "1px dashed rgba(169,166,182,.7)", color: "#A9A6B6", fontSize: 12, fontWeight: 600, boxSizing: "border-box" }}>Pending</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: "19px", color: "var(--muted)" }}>
            This session is recorded. Any amount is set only when the day is verified, within the published daily community budget, and depends on how many members took part. Sessions never mint new ALKE.
          </p>
          <Link to="/mine/history" style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 4, minHeight: 36, fontSize: 14, fontWeight: 600, color: "#C6B6FF", textDecoration: "none" }}>
            Your sessions
            <Chevron color="currentColor" />
          </Link>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
        <Link to="/mine/allocation" style={{ ...card, padding: 16, borderRadius: 22, display: "flex", flexDirection: "column", gap: 8, textDecoration: "none", color: "var(--text)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C6B6FF" }}>
            <Lock />
            Locked
          </span>
          <span style={{ ...display, fontSize: 24, letterSpacing: "-.02em", ...tabular }}>
            {alke(allocation?.locked)} <span style={{ fontSize: 13, color: "var(--muted)" }}>ALKE</span>
          </span>
        </Link>
        <Link to="/mine/history" style={{ ...card, padding: 16, borderRadius: 22, display: "flex", flexDirection: "column", gap: 8, textDecoration: "none", color: "var(--text)" }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Sessions</span>
          <span style={{ ...display, fontSize: 24, letterSpacing: "-.02em", ...tabular }}>{member?.sessionCount || 0}</span>
        </Link>
      </div>
    </AppScreen>
  );
}
