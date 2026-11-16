import { useCallback, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { STREAK_MS, startSession } from "../../lib/member";
import { approxAlke, fmtC, shortC } from "../../lib/genesis";
import { Button, Notice } from "../../ui/ob";
import { AppBar, AppPage, Ico, IconLink, Row, Stat, clock, hhmm } from "../../ui/shell";
import { Burst, Core, Counter, buzz, useMilestones, useMining, usePortal, Treasure } from "./mining";
import { shareCard } from "./shareCard";

/* Community mining: one tap starts a 24-hour session; today's estimated
   cALKE climbs live while it runs. */
export default function Mine() {
  const { nuruId, member, displayName } = useAuth();
  const m = useMining();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [burst, setBurst] = useState(0);
  const [toast, setToast] = useState(null);

  const onMilestone = useCallback((v) => {
    setBurst(Date.now());
    setToast(`${shortC(v)} cALKE today`);
    setTimeout(() => setToast(null), 2200);
    buzz([20, 40, 20]);
  }, []);
  useMilestones(m.todayC, onMilestone);

  const portal = usePortal(m);

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

  return (
    <AppPage
      tab="mine"
      bar={
        <AppBar title="Mine">
          <IconLink to="/mine/live" label="Stream mode">
            <Ico.Play size={20} />
          </IconLink>
          <IconLink to="/mine/history" label="Session history">
            <Ico.History size={22} />
          </IconLink>
        </AppBar>
      }
    >
      <section className="ob-mine" aria-label="Mining">
        <div className="ob-mine-pills">
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
              ×{m.tapMult.toFixed(1)} tap boost · {m.tapCount}/{m.tapMax}
            </span>
          ) : null}
        </div>

        <div className="ob-mine-core">
          <Core fraction={m.fraction} running={m.running} onIdleTap={start} onPortal={portal.open} locked={!!portal.treasure} />
          <Burst k={burst} />
          {toast ? <span className="ob-toast">{toast}</span> : null}
        </div>

        {m.running ? (
          <div className="ob-mine-count" role="status" aria-label={`Today's estimate ${fmtC(m.todayC)} cALKE`}>
            <span className="lbl">
              <span className="dot" />
              Mining · today's estimate{m.hasLive ? "" : " (up to)"}
            </span>
            <span className="plus">
              <span>+</span>
              <Counter value={m.todayC} />
            </span>
            <span className="sub">
              cALKE · {approxAlke(m.todayC)} · {clock(m.remaining)} left
            </span>
            <span className="ob-small">
              {m.tapCount >= m.tapMax ? `Max tap boost ×${m.tapMult.toFixed(1)} for today` : `Tap the core to a steady beat: full energy opens a hidden treasury (${m.tapCount}/${m.tapMax} today)`}
            </span>
          </div>
        ) : (
          <div className="ob-mine-count">
            <span className="lbl">Your cold balance</span>
            <Counter value={m.balanceC} decimals={false} />
            <span className="sub">
              cALKE · {approxAlke(m.balanceC)}
            </span>
            <Button busy={busy} onClick={start}>
              Start mining
            </Button>
            <span className="ob-small">
              {m.streak && keepBy ? `Start by ${hhmm(keepBy)} ${keepBy.toLocaleDateString(undefined, { weekday: "short" })} to keep your ${m.streak}-day streak` : "One tap starts a 24-hour session"}
            </span>
          </div>
        )}
        {error ? <Notice kind="error">{error}</Notice> : null}
      </section>

      {m.live ? (
        <div className="ob-pulse" aria-label="Network">
          <span>
            <i className="dot" />
            <b className="num">{(m.live.miningNow || 0).toLocaleString("en-US")}</b> mining now
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
        <Stat label="Cold" icon={<Ico.Lock size={13} />} value={shortC(m.balanceC)} unit="cALKE" to="/mine/allocation" />
        <Stat label="Streak" icon={<Ico.Flame size={13} />} value={m.streak} unit={`best ${member?.bestStreak || 0}`} />
        <Stat label="Sessions" value={member?.sessionCount || 0} to="/mine/history" />
      </div>

      <div className="ob-stats two">
        <Button kind="secondary" size="sm" to="/mine/live" style={{ width: "100%" }}>
          <Ico.Play size={14} />
          Stream mode
        </Button>
        <Button kind="secondary" size="sm" style={{ width: "100%" }} onClick={() => shareCard({ name: displayName, streak: m.streak, balanceC: m.balanceC, todayC: m.todayC, nuruId })}>
          <Ico.Link size={16} />
          Share card
        </Button>
      </div>

      <ul className="ob-list">
        <li>
          <Row to="/mine/allocation" icon={<Ico.Wallet />} title="Allocation" sub="Pending, verified and locked" />
        </li>
        <li>
          <Row to="/how-to-redeem" icon={<Ico.Doc />} title="How to redeem ALKE" sub="From cALKE to ALKE in Nuru" />
        </li>
      </ul>

      <p className="ob-small center">Today's figure is an estimate; the amount is set when the day is verified. Sessions never create new ALKE.</p>
      <Treasure treasure={portal.treasure} onDone={portal.close} />
    </AppPage>
  );
}
