import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { handleOf, tintHex } from "../../lib/member";
import { gameStatus } from "../../lib/games";
import { AppBar, AppPage, Avatar, Ico, IconLink, Row, Section, Stat } from "../../ui/shell";
import { FOUNDER_INVITES, fmtAlke } from "../../lib/genesis";
import { useDrilling } from "./drilling";
import { rigName } from "./drillScene";

export default function Profile() {
  const { member, person, displayName, initials } = useAuth();
  const m = useDrilling();
  const g = gameStatus();
  const [handle, setHandle] = useState("");
  useEffect(() => {
    let live = true;
    handleOf(person).then((h) => live && setHandle(h));
    return () => {
      live = false;
    };
  }, [person]);
  const since = member?.createdAt?.toDate?.();
  const sessions = member?.sessionCount || 0;
  const best = member?.bestStreak || 0;

  // Earned from real records only.
  const badges = [
    ["First drill", sessions >= 1, <Ico.Hex key="i" />],
    ["7-day streak", best >= 7, <Ico.Flame key="i" size={18} />],
    ["30-day streak", best >= 30, <Ico.Flame key="i" size={18} />],
    ["100 game XP", g.total >= 100, <Ico.Star key="i" />],
    ["Level 1 rig", m.level >= 1, <Ico.Users key="i" />],
    ["Founder", m.activeInvites >= FOUNDER_INVITES, <Ico.Star key="i" />],
  ];
  const founder = m.activeInvites >= FOUNDER_INVITES;

  return (
    <AppPage
      tab="profile"
      bar={
        <AppBar title="Profile">
          <IconLink to="/settings" label="Settings">
            <Ico.Gear />
          </IconLink>
        </AppBar>
      }
    >
      <section style={{ display: "flex", alignItems: "center", gap: 16, padding: "4px 4px 0" }}>
        <Avatar size={64} color={tintHex(person?.emojiColor)} initials={initials} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 14, color: "var(--text-3)" }}>
            {handle ? <span className="ob-pill accent">{handle}</span> : <span className="ob-pill">Member</span>}
            {founder ? <span className="ob-pill gold">Founder</span> : null}
            {since ? <span>since {since.toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span> : null}
          </div>
        </div>
      </section>

      <ul className="ob-list">
        <li>
          <Row to="/profile/edit" icon={<Ico.Users />} title="Edit profile" sub="Name and avatar colour" />
        </li>
      </ul>

      <div className="ob-stats">
        <Stat label="Drills" value={sessions} to="/drill/history" />
        <Stat label="Invites" value={m.activeInvites} unit="active" to="/network" />
        <Stat label="Game XP" value={g.total} to="/games" />
      </div>

      <Section title="Badges" action={<span>{badges.filter((b) => b[1]).length} of {badges.length}</span>}>
        <div className="ob-badges three">
          {badges.map(([t, on, icon]) => (
            <div key={t} className={on ? "ob-badge on" : "ob-badge"}>
              <span className="b">{on ? icon : <Ico.Lock size={15} />}</span>
              {t}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Activity">
        <ul className="ob-list">
          <li>
            <Row to="/drill/allocation" icon={<Ico.Wallet />} title="Your ALKE" sub="Provisional, to date" end={<span className="num">{fmtAlke(m.rewardsAlke, 4)} ALKE</span>} />
          </li>
          <li>
            <Row to="/network" icon={<Ico.Users />} tone="gold" title={rigName(m.level)} sub={`×${m.rig.toFixed(2)} daily ALKE share · ${m.activeInvites}/${FOUNDER_INVITES} to Founder`} />
          </li>
          <li>
            <Row to="/drill/history" icon={<Ico.History />} title="History" end={<span className="num">{sessions} drills</span>} />
          </li>
          <li>
            <Row to="/games/hex" icon={<Ico.Hex />} tone="gold" title="ALKE Hex" end={<span className="num">{g.hexXp} XP</span>} />
          </li>
          <li>
            <Row to="/games/rush" icon={<Ico.Bolt />} tone="cyan" title="ALKE Rush" end={<span className="num">{g.rushXp} XP</span>} />
          </li>
        </ul>
      </Section>
    </AppPage>
  );
}
