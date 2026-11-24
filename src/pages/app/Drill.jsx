import { useCallback, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, STREAK_MS, startSession } from "../../lib/member";
import { fmtAlke, toAlke } from "../../lib/genesis";
import { Button, Notice } from "../../ui/ob";
import { AppBar, AppPage, Ico, IconLink, Row, Stat, clock, hhmm } from "../../ui/shell";
import { Burst, DrillScene, RollingNumber, Vein, buzz, useDrilling, useMilestones, useVein } from "./drilling";
import { makeShareCard } from "./shareCard";
import { ShareSheet } from "./ShareSheet";

const HOUR = SESSION_MS / 24;

/** 24 cells, one per hour of the drill; the current one fills and glows. */
function HourCells({ fraction }) {
  const done = fraction * 24;
  return (
    <div className="ob-drill-cells" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => {
        const f = Math.max(0, Math.min(1, done - i));
        return (
          <span key={i} className={f > 0 && f < 1 ? "now" : undefined}>
            <i style={{ width: `${f * 100}%` }} />
          </span>
        );
      })}
    </div>
  );
}

/* Community drilling: one tap starts a 24-hour drill; the rig bores down
   while your ALKE Rewards climb live (real ALKE, six decimals). Tapping the rock to a steady
   beat builds pressure, and full pressure strikes a vein (a tap boost). */
export default function Drill() {
  const { nuruId, member, displayName } = useAuth();
  const m = useDrilling();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [burst, setBurst] = useState(0);
  const [toast, setToast] = useState(null);

  const onMilestone = useCallback((v) => {
    setBurst(Date.now());
    setToast(`+${fmtAlke(toAlke(v), 1)} ALKE today`);
    setTimeout(() => setToast(null), 2200);
    buzz([20, 40, 20]);
  }, []);
  useMilestones(m.todayC, onMilestone);

  const vein = useVein(m);
  const [card, setCard] = useState(null);
  const [cardBusy, setCardBusy] = useState(false);
  const openCard = async () => {
    if (cardBusy) return;
    setCardBusy(true);
    setError(null);
    try {
      setCard(await makeShareCard({ name: displayName, streak: m.streak, balanceC: m.balanceC, todayC: m.todayC, nuruId }));
    } catch (e) {
      setError(e.message || "Couldn't make the share card.");
    } finally {
      setCardBusy(false);
    }
  };
  const closeCard = useCallback(() => setCard(null), []);

  const start = async () => {
    if (m.running || busy) return;
    setBusy(true);
    setError(null);
    try {
      await startSession(nuruId, member);
      setBurst(Date.now());
      buzz(30);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const last = member?.lastSessionAt?.toDate?.();
  const keepBy = last ? new Date(last.getTime() + STREAK_MS) : null;
  const hour = Math.min(24, Math.floor((m.fraction * SESSION_MS) / HOUR) + 1);

  return (
    <AppPage
      tab="drill"
      bar={
        <AppBar title="Drill">
          <IconLink to="/drill/live" label="Stream mode">
            <Ico.Play size={20} />
          </IconLink>
          <IconLink to="/drill/history" label="Drilling history">
            <Ico.History size={22} />
          </IconLink>
        </AppBar>
      }
    >
      <section className="ob-drill" aria-label="Drilling">
        <div className="ob-drill-pills">
          <span className="ob-pill accent">
            Phase {m.phase.n} · {m.phase.name}
          </span>
          {m.boost > 1 ? (
            <span className="ob-pill gold ob-boost">
              <Ico.Flame size={12} />×{m.boost.toFixed(2)} streak boost
            </span>
          ) : null}
          {m.running ? (
            <span className={m.tapCount ? "ob-pill gold ob-boost" : "ob-pill"}>
              ×{m.tapMult.toFixed(1)} tap boost · {m.tapCount}/{m.tapMax} veins
            </span>
          ) : null}
        </div>

        <DrillScene
          depth={m.depth}
          sessionDepth={m.sessionDepth}
          sessionTarget={m.sessionTarget}
          fraction={m.fraction}
          running={m.running}
          onIdleTap={start}
          onVein={vein.strike}
          locked={!!vein.vein}
          flare={burst}
          veinKey={vein.vein && !vein.vein.empty ? vein.vein.k : 0}
          height="clamp(260px, 42dvh, 340px)"
        >
          <Burst k={burst} />
          {toast ? <span className="ob-toast">{toast}</span> : null}
        </DrillScene>

        <div className="ob-drill-meter">
          <div className="top">
            <span>Your ALKE Rewards</span>
            <span className="ob-drill-prov">Provisional</span>
          </div>
          <RollingNumber value={m.rewardsAlke} label={`Your ALKE Rewards: ${fmtAlke(m.rewardsAlke)} ALKE`} />
          {m.running ? (
            <p className="sub" role="status">
              <span className="dot" />
              +{fmtAlke(m.todayAlke)} today{m.hasLive ? " (est.)" : " (up to)"} · <b>{fmtAlke(m.perHourAlke, 4)} ALKE / hr</b>
            </p>
          ) : (
            <p className="sub">
              Start a drill to earn · <b>{fmtAlke(m.perHourAlke, 4)} ALKE / hr</b>
            </p>
          )}
        </div>

        {m.running ? (
          <div className="ob-drill-gauge" aria-label={`Hour ${hour} of 24, ${clock(m.remaining)} left`}>
            <div className="top">
              <span>
                Hour <b>{hour}</b> of 24
              </span>
              <span>
                <b>{clock(m.remaining)}</b> left
              </span>
            </div>
            <HourCells fraction={m.fraction} />
            <span className="ob-small">
              {m.tapCount >= m.tapMax ? `Max tap boost ×${m.tapMult.toFixed(1)} for today` : `Tap the rock to a steady beat: full pressure strikes a vein (${m.tapCount}/${m.tapMax} today)`}
            </span>
          </div>
        ) : (
          <div className="ob-drill-go">
            <Button busy={busy} onClick={start}>
              Start drilling
            </Button>
            <span className="ob-small">
              {m.streak && keepBy ? `Start by ${hhmm(keepBy)} ${keepBy.toLocaleDateString(undefined, { weekday: "short" })} to keep your ${m.streak}-day streak` : "One tap starts a 24-hour drill"}
            </span>
          </div>
        )}
        {error ? <Notice kind="error">{error}</Notice> : null}
      </section>

      {m.live ? (
        <div className="ob-pulse" aria-label="Network">
          <span>
            <i className="dot" />
            <b className="num">{(m.live.miningNow || 0).toLocaleString("en-US")}</b> drilling now
          </span>
          {m.live.poolToday ? (
            <span>
              Pool <b className="num">{Number(m.live.poolToday).toLocaleString("en-US")}</b> ALKE
            </span>
          ) : null}
          {m.live.members ? (
            <span>
              <b className="num">{Math.min(100, Math.round((m.live.members / m.phase.untilMembers) * 100))}%</b> to Phase {m.phase.n + 1}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="ob-stats">
        <Stat label="Cold" icon={<Ico.Lock size={13} />} value={fmtAlke(toAlke(m.balanceC), 2)} unit="ALKE" to="/drill/allocation" />
        <Stat label="Streak" icon={<Ico.Flame size={13} />} value={m.streak} unit={`best ${member?.bestStreak || 0}`} />
        <Stat label="Drills" value={member?.sessionCount || 0} to="/drill/history" />
      </div>

      <div className="ob-stats two">
        <Button kind="secondary" size="sm" to="/drill/live" style={{ width: "100%" }}>
          <Ico.Play size={14} />
          Stream mode
        </Button>
        <Button kind="secondary" size="sm" style={{ width: "100%" }} busy={cardBusy} onClick={openCard}>
          <Ico.Link size={16} />
          Share card
        </Button>
      </div>

      <ul className="ob-list">
        <li>
          <Row to="/drill/allocation" icon={<Ico.Wallet />} title="Allocation" sub="Pending, verified and locked" />
        </li>
        <li>
          <Row to="/how-to-redeem" icon={<Ico.Doc />} title="How to redeem ALKE" sub="From cALKE to ALKE in Nuru" />
        </li>
      </ul>

      <p className="ob-small center">Today's figure is an estimate; the amount is set when the day is verified. Drilling is app participation: your phone does no computing, and drills never create new ALKE.</p>
      <Vein vein={vein.vein} onDone={vein.close} />
      <ShareSheet card={card} onClose={closeCard} />
    </AppPage>
  );
}
