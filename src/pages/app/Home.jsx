import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { liveStreak, sessionRemaining, startSession, tintHex } from "../../lib/member";
import { lastDays, useMemberData } from "../../lib/useMemberData";
import { gameTotals } from "../../lib/games";
import { AppScreen, Chevron, Flame, Lock, alke, card, clock, display, mono, tabular, useNow } from "../../ui/app";

function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

const HEX = "0,-13 11.26,-6.5 11.26,6.5 0,13 -11.26,6.5 -11.26,-6.5";

export default function Home() {
  const { nuruId, member, person, displayName, initials } = useAuth();
  const { sessions, allocation } = useMemberData({ sessions: true, allocation: true });
  const navigate = useNavigate();
  const now = useNow(1000);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const remaining = sessionRemaining(member, now);
  const running = remaining > 0;
  const streak = liveStreak(member, now);
  const days = lastDays(sessions, 7);
  const games = gameTotals();

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      await startSession(nuruId, member);
      navigate("/mine");
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <AppScreen tab="home">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/profile" aria-label="Your profile" style={{ width: 46, height: 46, borderRadius: "50%", padding: 2, boxSizing: "border-box", background: "linear-gradient(135deg,#C6B6FF,#5E3AFF)", display: "block", flex: "none", textDecoration: "none" }}>
          <span style={{ width: "100%", height: "100%", borderRadius: "50%", background: tintHex(person?.emojiColor), color: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", ...display, fontSize: 15 }}>{initials}</span>
        </Link>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{greeting()}</span>
          <span style={{ ...display, fontSize: 22, letterSpacing: "-.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</span>
        </div>
        <Link to="/notifications" aria-label="Notifications" className="ui-round" style={{ width: 46, height: 46 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" />
          </svg>
        </Link>
      </div>

      {/* Today's session */}
      <section aria-label="Today's session" style={{ position: "relative", overflow: "hidden", borderRadius: 28, padding: 22, background: "radial-gradient(130% 110% at 0% 0%,#6A4BF0 0%,#4B2DE0 35%,#2A1690 68%,#170D4A 100%)", border: "1px solid rgba(214,202,255,.25)", boxShadow: "0 30px 60px -28px rgba(94,58,255,.75)", display: "flex", flexDirection: "column", gap: 18 }}>
        <svg aria-hidden="true" width="220" height="246" viewBox="0 0 100 112" style={{ position: "absolute", right: -64, top: -48, opacity: 0.13 }} fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" />
          <path d="M50 20 L80 37 L80 75 L50 92 L20 75 L20 37 Z" />
        </svg>
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ ...mono, color: "#FFFFFF" }}>TODAY'S SESSION</span>
            {running ? (
              <>
                <span style={{ ...display, fontSize: 27, lineHeight: "31px", letterSpacing: "-.025em" }}>Session active</span>
                <span style={{ ...display, fontSize: 20, ...tabular, color: "#E4DCFF" }}>{clock(remaining)} left</span>
              </>
            ) : (
              <span style={{ ...display, fontSize: 27, lineHeight: "31px", letterSpacing: "-.025em" }}>
                Ready when
                <br />
                you are
              </span>
            )}
          </div>
          <Link to="/mine" aria-label="Open Mine" style={{ width: 78, height: 78, borderRadius: "50%", flex: "none", background: "radial-gradient(circle at 35% 28%,rgba(255,255,255,.38),rgba(255,255,255,.07) 62%)", border: "1px solid rgba(255,255,255,.35)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.4),0 12px 30px -10px rgba(10,4,40,.8)", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
            <svg width="34" height="38" viewBox="0 0 100 112" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" />
              <line x1="50" y1="27" x2="50" y2="85" />
              <path d="M20 45 L32 56 L20 67" />
              <path d="M30 45 L42 56 L30 67" />
              <path d="M80 45 L68 56 L80 67" />
              <path d="M70 45 L58 56 L70 67" />
            </svg>
          </Link>
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 999, background: "rgba(255,255,255,.14)", fontSize: 13, fontWeight: 600 }}>
            <Flame color="#F2C66B" />
            {streak > 0 ? `${streak}-day streak` : "Start a streak"}
          </span>
          <span aria-label={`Last 7 days: ${days.filter((d) => d.done).length} with a session`} style={{ display: "flex", gap: 5 }}>
            {days.map((d) => (
              <span
                key={d.date.toDateString()}
                style={
                  d.done
                    ? { width: 9, height: 9, borderRadius: "50%", background: "#FFFFFF" }
                    : d.today
                      ? { width: 9, height: 9, borderRadius: "50%", border: "1.5px solid #FFFFFF", boxSizing: "border-box", animation: "alkPulse 2s ease-in-out infinite" }
                      : { width: 9, height: 9, borderRadius: "50%", background: "rgba(255,255,255,.25)" }
                }
              />
            ))}
          </span>
        </div>
        {running ? (
          <Link to="/mine" style={{ position: "relative", height: 54, borderRadius: 999, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.3)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 16, fontWeight: 700, textDecoration: "none", boxSizing: "border-box" }}>
            View session
          </Link>
        ) : (
          <button type="button" onClick={start} disabled={busy} style={{ position: "relative", height: 54, border: 0, borderRadius: 999, background: "#FFFFFF", color: "#2A1690", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 16, fontWeight: 700, boxShadow: "0 10px 24px -10px rgba(0,0,0,.5)", cursor: "pointer" }}>
            {busy ? <span className="ui-spin" aria-hidden="true" /> : null}
            Start session
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        )}
        {error ? <span style={{ position: "relative", fontSize: 13, color: "#FFD3DA" }}>{error}</span> : null}
      </section>

      {/* Allocation */}
      <Link to="/mine/allocation" aria-label={`Your allocation: ${alke(allocation?.locked)} ALKE locked`} style={{ ...card, display: "flex", flexDirection: "column", gap: 16, textDecoration: "none", color: "var(--text)" }}>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={mono}>YOUR ALLOCATION</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 10px", borderRadius: 999, background: "rgba(139,109,255,.16)", color: "#C6B6FF", fontSize: 12, fontWeight: 600 }}>
            <Lock />
            Locked
          </span>
        </span>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ ...display, fontSize: 46, lineHeight: 1, letterSpacing: "-.04em", ...tabular }}>{alke(allocation?.locked)}</span>
          <span style={{ ...display, fontSize: 17, color: "var(--muted)" }}>ALKE</span>
        </span>
        <span style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
          <span style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderRadius: 16, background: "rgba(255,255,255,.04)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6EE7B7" }} />
              Verified
            </span>
            <span style={{ ...display, fontSize: 19, ...tabular }}>{alke(allocation?.verified)}</span>
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderRadius: 16, background: "rgba(255,255,255,.04)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", border: "1.5px dashed #A9A6B6", boxSizing: "border-box" }} />
              Pending
            </span>
            <span style={{ ...display, fontSize: 19, ...tabular, color: "var(--muted)" }}>{alke(allocation?.pending)}</span>
          </span>
        </span>
        <span style={{ fontSize: 12, lineHeight: "17px", color: "var(--faint)" }}>
          {allocation ? "Locked until release conditions are met. No release date yet." : "Amounts appear here once your sessions are verified. Locked until release conditions are met."}
        </span>
      </Link>

      {/* Games */}
      <section aria-label="Today's games" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: 0, ...display, fontSize: 19, letterSpacing: "-.01em" }}>Today's games</h2>
          <Link to="/games" style={{ fontSize: 14, fontWeight: 600, textDecoration: "none", color: "#C6B6FF" }}>
            {games.total > 0 ? `${games.total} game XP` : "All games"}
          </Link>
        </div>
        <GameCard
          to="/games/hex"
          tag="ALKE HEX · DAILY BOARD LIVE"
          tagColor="#F2C66B"
          title="Rebuild the mark"
          text="Find the gold pieces, dodge the traps. Three lives, up to 100 XP."
          bg="radial-gradient(120% 140% at 100% 0%,rgba(242,198,107,.22) 0%,rgba(242,198,107,0) 55%),linear-gradient(160deg,#241A4E 0%,#14102A 70%)"
          edge="rgba(242,198,107,.28)"
          glow="rgba(217,154,43,.7)"
          art={
            <svg width="86" height="80" viewBox="-41 -38 82 76" aria-hidden="true" style={{ flex: "none" }}>
              <polygon points={HEX} fill="#E2A93B" stroke="#FCE7B5" strokeWidth="1" />
              {[["24 0", "#2A2350"], ["12 20.78", "#E2A93B"], ["-12 20.78", "#2A2350"], ["-24 0", "#5A1222"], ["-12 -20.78", "#16141F"], ["12 -20.78", "#2A2350"]].map(([t, f]) => (
                <g key={t} transform={`translate(${t})`}>
                  <polygon points={HEX} fill={f} stroke={f === "#E2A93B" ? "#FCE7B5" : "rgba(198,182,255,.55)"} strokeWidth="1" />
                </g>
              ))}
            </svg>
          }
        />
        <GameCard
          to="/games/rush"
          tag="ALKE RUSH · RISK IT OR BANK IT"
          tagColor="#7FE9EE"
          title="Know when to stop"
          text="Stop the light on the XP, then bank it before a hazard takes it."
          bg="radial-gradient(120% 140% at 100% 0%,rgba(76,214,228,.20) 0%,rgba(76,214,228,0) 55%),linear-gradient(160deg,#1D1A4C 0%,#110E28 70%)"
          edge="rgba(110,222,232,.28)"
          glow="rgba(56,200,220,.65)"
          art={
            <svg width="86" height="80" viewBox="-36 -34 72 68" aria-hidden="true" style={{ flex: "none" }}>
              {[["10.5 -18.2", "#3A2A12", "#F7D58A"], ["-10.5 -18.2", "#0F231E", "rgba(110,231,183,.75)"], ["21 0", "#201A46", "rgba(198,182,255,.8)"], ["-21 0", "#2A0E18", "rgba(255,138,154,.75)"], ["-10.5 18.2", "#0D2227", "rgba(127,233,238,.75)"], ["10.5 18.2", "#16132C", "rgba(127,233,238,.9)"], ["0 0", "#5CE1E6", "#E9FEFF"]].map(([t, f, s]) => (
                <g key={t} transform={`translate(${t})`}>
                  <polygon points="0,-10.5 9.09,-5.25 9.09,5.25 0,10.5 -9.09,5.25 -9.09,-5.25" fill={f} stroke={s} strokeWidth="1" />
                </g>
              ))}
            </svg>
          }
        />
      </section>

      {/* Your activity */}
      <section aria-label="Your activity" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }}>
        {[
          ["SESSIONS", member?.sessionCount || 0],
          ["BEST STREAK", member?.bestStreak || 0],
          ["GAME XP", games.total],
        ].map(([label, v]) => (
          <div key={label} style={{ ...card, padding: 14, borderRadius: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ ...mono, fontSize: 9.5 }}>{label}</span>
            <span style={{ ...display, fontSize: 22, ...tabular }}>{v}</span>
          </div>
        ))}
      </section>
    </AppScreen>
  );
}

function GameCard({ to, tag, tagColor, title, text, bg, edge, glow, art }) {
  return (
    <Link to={to} aria-label={`${title}. ${text}`} style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 14, padding: "16px 16px 16px 12px", borderRadius: 24, background: bg, border: `1px solid ${edge}`, boxShadow: `0 24px 50px -32px ${glow}`, textDecoration: "none", color: "var(--text)" }}>
      {art}
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ ...mono, fontSize: 10.5, color: tagColor }}>{tag}</span>
        <span style={{ ...display, fontSize: 19, lineHeight: "23px", letterSpacing: "-.01em" }}>{title}</span>
        <span style={{ fontSize: 13, lineHeight: "18px", color: "var(--muted)" }}>{text}</span>
        <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", borderRadius: 999, background: "rgba(242,198,107,.14)", color: "#F2C66B", fontSize: 11, fontWeight: 600 }}>Game XP · play only</span>
      </span>
      <Chevron />
    </Link>
  );
}
