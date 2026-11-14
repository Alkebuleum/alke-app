import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, liveStreak, sessionRemaining, startSession, tintHex } from "../../lib/member";
import { lastDays, useMemberData } from "../../lib/useMemberData";
import { useNotifications } from "../../lib/notifications";
import { gameStatus } from "../../lib/games";
import { Button, Notice } from "../../ui/ob";
import { shortC, toC } from "../../lib/genesis";
import { AppPage, Avatar, Ico, IconLink, Ring, Row, Section, Stat, alke, clock, useNow } from "../../ui/shell";

function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const { nuruId, member, person, displayName, initials } = useAuth();
  const { sessions, allocation } = useMemberData({ sessions: true, allocation: true });
  const { unread } = useNotifications(20);
  const navigate = useNavigate();
  const now = useNow(1000);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const remaining = sessionRemaining(member, now);
  const running = remaining > 0;
  const streak = liveStreak(member, now);
  const days = lastDays(sessions, 7);
  const games = gameStatus();

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
    <AppPage
      tab="home"
      bar={
        <header className="ob-appbar">
          <Link to="/profile" className="who" aria-label="Your profile">
            <Avatar size={40} color={tintHex(person?.emojiColor)} initials={initials} />
            <span style={{ minWidth: 0 }}>
              <small>{greeting()}</small>
              <b>{displayName}</b>
            </span>
          </Link>
          <div className="acts">
            <IconLink to="/notifications" label={unread ? `Notifications, ${unread} new` : "Notifications"} badge={unread > 0}>
              <Ico.Bell />
            </IconLink>
          </div>
        </header>
      }
    >
      {/* Today's session */}
      <section className="ob-hero vivid" aria-label="Today's session">
        <div className="top">
          <Ring size={60} fraction={running ? remaining / SESSION_MS : 0} active={running} color="#FFFFFF" track="rgba(255,255,255,.22)" mark="#FFFFFF" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="lbl">{running ? "Session active" : "Today's session"}</div>
            <div className="big num">{running ? clock(remaining) : "Ready to start"}</div>
          </div>
          {running ? (
            <Button kind="secondary" size="sm" to="/mine">
              View
            </Button>
          ) : (
            <Button size="sm" busy={busy} onClick={start}>
              Start
            </Button>
          )}
        </div>
        <div className="foot">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: streak ? "var(--gold)" : "var(--text-2)" }}>
            <Ico.Flame />
            {streak ? `${streak}-day streak` : "No streak yet"}
          </span>
          <span className="ob-week" aria-label={`Last 7 days: ${days.filter((d) => d.done).length} with a session`}>
            {days.map((d) => (
              <span key={d.date.toDateString()}>
                <i className={[d.done && "on", d.today && "today"].filter(Boolean).join(" ")}>{d.done ? <Ico.Check size={11} /> : null}</i>
                {d.date.toLocaleDateString(undefined, { weekday: "narrow" })}
              </span>
            ))}
          </span>
        </div>
      </section>
      {error ? <Notice kind="error">{error}</Notice> : null}

      <div className="ob-stats">
        <Stat to="/mine/allocation" label="Cold" icon={<Ico.Lock size={13} />} value={shortC(toC(allocation?.locked))} unit="cALKE" />
        <Stat to="/mine/history" label="Sessions" value={member?.sessionCount || 0} />
        <Stat to="/games" label="Game XP" value={games.total} />
      </div>

      <Section title="Play today" action={<Link to="/games">All games</Link>}>
        <ul className="ob-list">
          <li>
            <Row to="/games/hex" icon={<Ico.Hex />} tone="gold" title="ALKE Hex" sub={games.hexStatus} end={<span className="ob-pill gold">+100 XP</span>} />
          </li>
          <li>
            <Row to="/games/rush" icon={<Ico.Bolt />} tone="cyan" title="ALKE Rush" sub={games.rushStatus} end={<span className="ob-pill">+50 XP</span>} />
          </li>
        </ul>
      </Section>

      <Section title="Community">
        <ul className="ob-list">
          <li>
            <Row to="/chat" icon={<Ico.Users />} tone="green" title="Alkers chat" sub="Say hi to the community" />
          </li>
          <li>
            <Row to="/network" icon={<Ico.Users />} title="Invite friends" sub="Each verified invite warms 1% a day" />
          </li>
        </ul>
      </Section>
    </AppPage>
  );
}
