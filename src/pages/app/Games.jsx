import { Link } from "react-router-dom";
import { gameStatus, gameXpToday } from "../../lib/games";
import { AppBar, AppPage, Ico, Row, Section, clock, useNow } from "../../ui/shell";

const HEX = "0,-13 11.26,-6.5 11.26,6.5 0,13 -11.26,6.5 -11.26,-6.5";

function HexArt() {
  return (
    <svg width="78" height="72" viewBox="-41 -38 82 76" aria-hidden="true">
      {[["24 0", "#2A2350", "rgba(198,182,255,.35)"], ["12 20.78", "#E2A93B", "#FCE7B5"], ["-12 20.78", "#2A2350", "rgba(198,182,255,.35)"], ["-24 0", "#4A1626", "rgba(248,113,113,.6)"], ["-12 -20.78", "#E2A93B", "#FCE7B5"], ["12 -20.78", "#2A2350", "rgba(198,182,255,.35)"]].map(([t, f, e]) => (
        <polygon key={t} transform={`translate(${t})`} points={HEX} fill={f} stroke={e} strokeWidth="1.2" />
      ))}
      <polygon points={HEX} fill="#F5C451" stroke="#FFF3D1" strokeWidth="1.4" />
    </svg>
  );
}

function RushArt() {
  const p = "0,-10.5 9.09,-5.25 9.09,5.25 0,10.5 -9.09,5.25 -9.09,-5.25";
  return (
    <svg width="78" height="72" viewBox="-36 -34 72 68" aria-hidden="true">
      {[["10.5 -18.2", "#3A2E14", "#F5C451"], ["-10.5 -18.2", "#12302A", "#34D399"], ["21 0", "#24204A", "#B4A2FF"], ["-21 0", "#33141F", "#F87171"], ["-10.5 18.2", "#102A30", "#5EE0E8"], ["10.5 18.2", "#3A2E14", "#F5C451"]].map(([t, f, e]) => (
        <polygon key={t} transform={`translate(${t})`} points={p} fill={f} stroke={e} strokeOpacity=".7" strokeWidth="1.2" />
      ))}
      <polygon points={p} fill="#5EE0E8" stroke="#E6FDFF" strokeWidth="1.4" />
    </svg>
  );
}

function GameCard({ to, art, theme, name, tag, status, xp, progress, progressLabel }) {
  return (
    <Link to={to} className={`ob-game ${theme}`} aria-label={`${name}. ${tag}. ${status}`}>
      <span className="ob-game-top">
        <span className="ob-game-art">{art}</span>
        <span className="ob-game-xp num">{xp} XP</span>
      </span>
      <span>
        <b className="ob-game-name">{name}</b>
        <span className="ob-game-tag">{tag}</span>
      </span>
      <span className="ob-game-prog">
        <span className="ob-game-prog-l">
          <span>{progressLabel}</span>
        </span>
        <span className="ob-game-bar" aria-hidden="true">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
      </span>
      <span className="ob-game-status">{status}</span>
      <span className="ob-game-play">
        <Ico.Play size={13} />
        Play
      </span>
    </Link>
  );
}

/* Games: your game XP up top (like Home's main card), today's two
   challenges, then the leaderboards. Games are just games for now. */
export default function Games() {
  useNow(1000);
  const g = gameStatus();
  const today = gameXpToday();

  return (
    <AppPage tab="games" bar={<AppBar title="Games" />}>
      <Link to="/games/hex/leaderboards" className="ob-games-hero" aria-label={`Your game XP ${g.total}, ${today} today. Leaderboards`}>
        <span className="lbl">Your game XP</span>
        <b className="num">{g.total.toLocaleString("en-US")}</b>
        <span className="warm">
          <span className="row num">
            <span>
              Today <b>+{today.toLocaleString("en-US")} XP</b>
            </span>
            <span>Leaderboards</span>
          </span>
        </span>
      </Link>

      <Section
        title="Today's challenges"
        action={
          <span className="num" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Ico.Clock size={13} />
            Resets in {clock(g.resetMs)}
          </span>
        }
      >
        <div className="ob-stats two">
          <GameCard to="/games/hex" theme="gold" art={<HexArt />} name="ALKE Hex" tag={`Level ${g.hexLevel} · 3 lives`} status={g.hexStatus} xp={g.hexXp} progress={g.hexCleared / 20} progressLabel={`${g.hexCleared} of 20 levels`} />
          <GameCard to="/games/rush" theme="cyan" art={<RushArt />} name="ALKE Rush" tag={`Best run ${g.rushBest} XP`} status={g.rushStatus} xp={g.rushXp} progress={g.rushChalDone ? 1 : g.rushChal / 250} progressLabel={g.rushChalDone ? "Challenge done" : `${g.rushChal} of 250 today`} />
        </div>
      </Section>

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

      <p className="ob-small center">Game XP is for play and the leaderboards for now. Later, games will also help you drill deeper, along with other contributions.</p>
    </AppPage>
  );
}
