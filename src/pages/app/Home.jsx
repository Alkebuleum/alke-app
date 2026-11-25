import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, liveStreak, startSession, tintHex } from "../../lib/member";
import { lastDays, useMemberData } from "../../lib/useMemberData";
import { useNotifications } from "../../lib/notifications";
import { gameStatus } from "../../lib/games";
import { fmtAlke } from "../../lib/genesis";
import { Button, Notice } from "../../ui/ob";
import { AppPage, Avatar, Ico, IconLink, Ring, Row, Section, Stat, clock } from "../../ui/shell";
import { RollingNumber, useDrilling } from "./drilling";
import { FounderCard } from "./FounderCard";
import { Series } from "./Series";

function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* Later, not soon (README "Later"): a spot on Home where members suggest
   how the ALKÉ Network can succeed, so the team can gather ideas from the
   public. Not planned yet; don't add it until it is. */
export default function Home() {
  const { nuruId, member, person, displayName, initials } = useAuth();
  const { sessions } = useMemberData({ sessions: true });
  const { unread } = useNotifications(20);
  const navigate = useNavigate();
  const m = useDrilling();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const { running, remaining } = m;
  const streak = liveStreak(member);
  const days = lastDays(sessions, 7);
  const games = gameStatus();
  const phase = `Phase ${m.phase.n} · ${m.phase.name}`;

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      await startSession(nuruId, member);
      navigate("/drill");
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
      {/* Balance to date, and today's drill */}
      <section className="ob-hero vivid ob-home-hero" aria-label="Your ALKE and today's drill">
        <Link to="/drill/allocation" className="bal">
          <span className="lbl">Your ALKE · provisional</span>
          <RollingNumber value={m.rewardsAlke} size={40} label={`Your ALKE to date: ${fmtAlke(m.rewardsAlke)} ALKE`} />
          <span className="sub">{running ? `+${fmtAlke(m.todayAlke)} today (est.) · ${phase}` : phase}</span>
        </Link>
        <div className="top">
          <Ring size={52} fraction={running ? remaining / SESSION_MS : 0} active={running} color="#FFFFFF" track="rgba(255,255,255,.22)" mark="#FFFFFF" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="lbl">{running ? "Drilling now" : "Today's drill"}</div>
            <div className="big num">{running ? `${clock(remaining)} left` : "Ready to start"}</div>
          </div>
          {running ? (
            <Button kind="secondary" size="sm" to="/drill">
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
          <span className="ob-week" aria-label={`Last 7 days: ${days.filter((d) => d.done).length} with a drill`}>
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
        <Stat to="/drill/history" label="Drills" value={member?.sessionCount || 0} />
        <Stat to="/drill" label="Invites" value={m.activeInvites} unit="active" />
        <Stat to="/games" label="Game XP" value={games.total} />
      </div>

      <FounderCard nuruId={nuruId} phase={phase} active={m.activeInvites} bracket={m.bracket} members={m.live?.members ?? null} />

      <Series />

      <Section title="Play today" action={<Link to="/games">All games</Link>}>
        <ul className="ob-list">
          <li>
            <Row to="/games/hex" icon={<Ico.Hex />} tone="gold" title="ALKE Hex" sub={games.hexStatus} end={<span className="ob-pill gold">+100 XP</span>} />
          </li>
          <li>
            <Row to="/games/rush" icon={<Ico.Bolt />} tone="cyan" title="ALKE Rush" sub={games.rushStatus} end={<span className="ob-pill">+50 XP</span>} />
          </li>
          <li>
            <Row to="/chat" icon={<Ico.Users />} tone="green" title="Alkers chat" sub="Say hi to the community" />
          </li>
        </ul>
      </Section>
    </AppPage>
  );
}
