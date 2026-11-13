import { Link } from "react-router-dom";
import { gameStatus, gameWarmingToday } from "../../lib/games";
import { AppBar, AppPage, Ico, Row, Section, clock, useNow } from "../../ui/shell";

const HEX = "0,-13 11.26,-6.5 11.26,6.5 0,13 -11.26,6.5 -11.26,-6.5";

function HexArt() {
  return (
    <svg width="64" height="60" viewBox="-41 -38 82 76" aria-hidden="true">
      <polygon points={HEX} fill="#E2A93B" />
      {[["24 0", "#2A2350"], ["12 20.78", "#E2A93B"], ["-12 20.78", "#2A2350"], ["-24 0", "#3B1B2A"], ["-12 -20.78", "#1E1C2A"], ["12 -20.78", "#2A2350"]].map(([t, f]) => (
        <polygon key={t} transform={`translate(${t})`} points={HEX} fill={f} stroke="rgba(255,255,255,.12)" strokeWidth="1" />
      ))}
    </svg>
  );
}

function RushArt() {
  const p = "0,-10.5 9.09,-5.25 9.09,5.25 0,10.5 -9.09,5.25 -9.09,-5.25";
  return (
    <svg width="64" height="60" viewBox="-36 -34 72 68" aria-hidden="true">
      {[["10.5 -18.2", "#3A2E14"], ["-10.5 -18.2", "#12302A"], ["21 0", "#24204A"], ["-21 0", "#33141F"], ["-10.5 18.2", "#102A30"], ["10.5 18.2", "#1A1734"], ["0 0", "#5EE0E8"]].map(([t, f]) => (
        <polygon key={t} transform={`translate(${t})`} points={p} fill={f} stroke="rgba(255,255,255,.12)" strokeWidth="1" />
      ))}
    </svg>
  );
}

const TONE = { done: "ob-pill green", lost: "ob-pill", live: "ob-pill accent", idle: "ob-pill" };

function GameCard({ to, art, name, tag, status, tone, xp, color }) {
  return (
    <Link to={to} className="ob-stat" style={{ gap: 10, padding: 14, borderRadius: 18 }}>
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {art}
        <span className="ob-pill" style={{ color }}>
          {xp} XP
        </span>
      </span>
      <span>
        <b style={{ display: "block", fontSize: 16, fontWeight: 700 }}>{name}</b>
        <span style={{ display: "block", fontSize: 13, color: "var(--text-3)" }}>{tag}</span>
      </span>
      <span className={TONE[tone]} style={{ alignSelf: "flex-start", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
        {status}
      </span>
    </Link>
  );
}

export default function Games() {
  useNow(1000);
  const g = gameStatus();
  const w = gameWarmingToday();

  return (
    <AppPage
      tab="games"
      bar={
        <AppBar title="Games">
          <span className="ob-pill gold" style={{ marginRight: 8 }}>
            <Ico.Star size={13} />
            <span className="num">{g.total}</span> XP
          </span>
        </AppBar>
      }
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Today's challenges</span>
        <span className="ob-small" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Ico.Clock size={14} />
          Resets in <span className="num">{clock(g.resetMs)}</span>
        </span>
      </div>

      <div className="ob-stats two">
        <GameCard to="/games/hex" art={<HexArt />} name="ALKE Hex" tag={`Level ${g.hexLevel} · 3 lives`} status={g.hexStatus} tone={g.hexTone} xp={g.hexXp} color="var(--gold)" />
        <GameCard to="/games/rush" art={<RushArt />} name="ALKE Rush" tag={`Best run ${g.rushBest}`} status={g.rushStatus} tone={g.rushTone} xp={g.rushXp} color="var(--cyan)" />
      </div>

      <ul className="ob-list">
        <li>
          <Row
            to="/mine/allocation"
            icon={<Ico.Lock />}
            title="Warming from games"
            sub={w.nextAt ? `${w.nextAt - w.xp} XP to the next one today` : "Today's maximum reached"}
            end={
              <b className="num">
                {w.warm} / {w.cap}
              </b>
            }
          />
        </li>
      </ul>

      <Section title="Leaderboards">
        <ul className="ob-list">
          <li>
            <Row to="/games/hex/leaderboards" icon={<Ico.Trophy />} tone="gold" title="ALKE Hex" sub="Daily board · all time" />
          </li>
          <li>
            <Row to="/games/rush/leaderboards" icon={<Ico.Trophy />} tone="cyan" title="ALKE Rush" sub="Best run today · all time" />
          </li>
        </ul>
      </Section>

      <p className="ob-small center">Game XP never becomes ALKE. It can warm up to 3 cold ALKE a day.</p>
    </AppPage>
  );
}
