import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { handleOf, liveStreak, tintHex } from "../../lib/member";
import { gameStatus } from "../../lib/games";
import { useMemberData } from "../../lib/useMemberData";
import { AppBar, AppPage, Avatar, Ico, IconLink, Row, Section, Stat } from "../../ui/shell";
import { shortC, toC } from "../../lib/genesis";

export default function Profile() {
  const { member, person, displayName, initials } = useAuth();
  const { allocation } = useMemberData({ allocation: true });
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
    ["First session", sessions >= 1, <Ico.Hex key="i" />],
    ["7-day streak", best >= 7, <Ico.Flame key="i" size={18} />],
    ["30-day streak", best >= 30, <Ico.Flame key="i" size={18} />],
    ["100 game XP", g.total >= 100, <Ico.Star key="i" />],
  ];

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
            {since ? <span>since {since.toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span> : null}
          </div>
        </div>
      </section>

      <div className="ob-stats">
        <Stat label="Streak" value={liveStreak(member)} unit="days" />
        <Stat label="Sessions" value={sessions} />
        <Stat label="Game XP" value={g.total} />
      </div>

      <Section title="Badges" action={<span>{badges.filter((b) => b[1]).length} of {badges.length}</span>}>
        <div className="ob-badges">
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
            <Row to="/mine/allocation" icon={<Ico.Wallet />} title="Allocation" end={<span className="num">{shortC(toC(allocation?.locked))} cALKE</span>} />
          </li>
          <li>
            <Row to="/mine/history" icon={<Ico.History />} title="History" end={<span className="num">{sessions} sessions</span>} />
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
