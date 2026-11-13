import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { namesOf } from "../../lib/member";
import { dayKey, gameStatus, personLook } from "../../lib/games";
import { AppPage, Ico, Row, Section, SubBar, clock, useNow } from "../../ui/shell";

/* Real leaderboards for ALKE Hex and ALKE Rush (alke_scores, loaded by the
   Boards route wrapper as props.boards). Today + all time; ranks game XP only. */

const mmss = (sec) => {
  const v = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;
};

function readRush() {
  try {
    const p = JSON.parse(localStorage.getItem("alke.rush.v1") || "null");
    return p && p.v === 1 ? p : {};
  } catch {
    return {};
  }
}

function readHex() {
  try {
    const p = JSON.parse(localStorage.getItem("alke.hex.v1") || "null");
    return p && p.v === 1 ? p : {};
  } catch {
    return {};
  }
}

const MEDAL = ["var(--gold)", "#D4D4D8", "#E0A577"];

export default function Leaderboard({ game = "hex", boards, memberId, demoNames }) {
  const { displayName } = useAuth();
  const [tab, setTab] = useState("today");
  const [names, setNames] = useState(demoNames || {});
  useNow(1000);
  const g = gameStatus();
  const isHex = game === "hex";
  const today = dayKey();

  // Board rows from the server.
  const src = boards ? (isHex ? (tab === "today" ? boards.hexToday : boards.hexAll) : tab === "today" ? boards.rushToday : boards.rushAll) : null;
  const value = (r) => (isHex ? (tab === "today" ? r.hexDaily : r.hexXp) : tab === "today" ? r.rushBest : r.rushXp);
  const rows = (src || []).map((r) => ({
    id: r.id,
    name: r.id === memberId ? displayName : names[r.id] || "Alker",
    v: value(r),
    meta: isHex && tab === "today" ? mmss(r.hexDailyTime) : "",
    me: r.id === memberId,
  }));

  // My own value from this device, in case the board hasn't caught up yet.
  const hex = readHex();
  const rush = readRush();
  const mine = isHex
    ? tab === "today"
      ? hex.daily && hex.daily.date === today && hex.daily.result === "won"
        ? hex.daily.xp
        : 0
      : g.hexXp
    : tab === "today"
      ? rush.day === today && rush.chal
        ? rush.chal.best || 0
        : 0
      : g.rushXp;
  if (mine > 0 && !rows.some((r) => r.me)) {
    rows.push({ id: "me", name: displayName || "You", v: mine, meta: "", me: true });
    rows.sort((a, b) => b.v - a.v);
  }
  const myIdx = rows.findIndex((r) => r.me);
  const shown = rows.slice(0, 20);
  const meOutside = myIdx >= 20;

  // Names come from the shared Nuru profile (members have no handle).
  const shownIds = shown.map((r) => r.id).join(",");
  useEffect(() => {
    if (demoNames || !shownIds) return;
    let live = true;
    namesOf(shownIds.split(",")).then((n) => live && setNames((old) => ({ ...old, ...n })));
    return () => {
      live = false;
    };
  }, [shownIds, demoNames]);

  const chal = rush.day === today && rush.chal ? rush.chal : { best: 0, done: false, block: false };

  return (
    <AppPage tab="games" bar={<SubBar title={isHex ? "Hex leaderboards" : "Rush boards"} back={isHex ? "/games/hex" : "/games/rush"} />}>
      {!isHex ? (
        <Section title="Daily challenges" action={<span className="num">Resets in {clock(g.resetMs)}</span>}>
          <ul className="ob-list">
            <li>
              <Row
                to="/games/rush/play"
                icon={<Ico.Star />}
                tone={chal.done ? "green" : "cyan"}
                title="Bank 250 XP in one run"
                sub={chal.done ? "Done · +50 XP added" : `Best today ${Math.min(250, chal.best || 0)} of 250`}
                end={<span className="ob-pill gold">+50 XP</span>}
              />
            </li>
            <li>
              <Row icon={<Ico.Shield />} tone={chal.block ? "green" : "cyan"} title="Block a hazard with a shield" sub={chal.block ? "Done · +20 XP added" : "Not yet today"} end={<span className="ob-pill">+20 XP</span>} />
            </li>
          </ul>
        </Section>
      ) : null}

      <div className="ob-seg" role="tablist">
        {[
          ["today", "Today"],
          ["all", "All time"],
        ].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      <p className="ob-small" style={{ padding: "0 4px", marginTop: -6 }}>
        {isHex ? (tab === "today" ? "Today's daily board · same board for everyone" : "Total Hex game XP") : tab === "today" ? "Best single banked run today" : "Total Rush game XP"}
      </p>

      {!boards ? (
        <p className="ob-small center">Loading…</p>
      ) : !rows.length ? (
        <div className="ob-empty">
          <span className="ob-tile" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
            <Ico.Trophy size={24} />
          </span>
          <b>No scores yet</b>
          <p>{tab === "today" ? "Be the first on today's board." : "Win a round to get on the board."}</p>
        </div>
      ) : (
        <ul className="ob-list">
          {shown.map((r, i) => (
            <LbRow key={r.id + i} r={r} rank={i + 1} />
          ))}
          {meOutside ? <LbRow r={rows[myIdx]} rank={myIdx + 1} /> : null}
        </ul>
      )}

      {boards && myIdx < 0 ? (
        <ul className="ob-list">
          <li>
            <Row to={isHex ? "/games/hex/play" : "/games/rush/play"} icon={<Ico.Play />} title="You're not ranked yet" sub={isHex ? "Win today's board to rank" : "Bank a scored run to rank"} />
          </li>
        </ul>
      ) : null}

      <p className="ob-small center">Rankings count game XP only.</p>
    </AppPage>
  );
}

function LbRow({ r, rank }) {
  const look = personLook(r.name);
  return (
    <li style={r.me ? { background: "rgba(124,92,255,.08)" } : undefined}>
      <div className="ob-row static">
        <span className="num" style={{ width: 22, textAlign: "center", fontSize: 14, fontWeight: 700, color: MEDAL[rank - 1] || "var(--text-3)" }}>
          {rank}
        </span>
        <span className="ob-avatar" style={{ width: 34, height: 34, fontSize: 12, background: look.grad }}>
          {look.ini}
        </span>
        <span className="tx">
          <b>{r.me ? `${r.name} (you)` : r.name}</b>
          {r.meta ? <span>{r.meta}</span> : null}
        </span>
        <span className="end">
          <b className="num">{r.v.toLocaleString()}</b> XP
        </span>
      </div>
    </li>
  );
}
