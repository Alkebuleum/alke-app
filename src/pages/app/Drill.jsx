import { useCallback, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { STREAK_MS, startSession } from "../../lib/member";
import { fmtAlke, toAlke } from "../../lib/genesis";
import { Button, Notice } from "../../ui/ob";
import { AppBar, AppPage, Ico, IconLink, clock, hhmm } from "../../ui/shell";
import { Burst, DrillScene, RollingNumber, Vein, buzz, useDrilling, useMilestones, useVein } from "./drilling";
import { makeShareCard } from "./shareCard";
import { ShareSheet } from "./ShareSheet";
import { DrillDeeper } from "./DrillDeeper";

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
  const deeper = useRef(null);
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
  const info = [`Phase ${m.phase.n} · ${m.phase.name}`];
  if (m.streak) info.push(`${m.streak}-day streak`);
  if (m.boost > 1) info.push(`×${m.boost.toFixed(2)} streak boost`);
  if (m.running) info.push(`${m.tapCount}/${m.tapMax} veins`);

  return (
    <AppPage
      tab="drill"
      bar={
        <AppBar title="Drill">
          <IconLink to="/drill/live" label="Stream mode">
            <Ico.Play size={20} />
          </IconLink>
          <button type="button" className="ob-icon-btn" aria-label="Share card" onClick={openCard} disabled={cardBusy}>
            {cardBusy ? <span className="ob-spin" aria-hidden="true" /> : <Ico.Link size={20} />}
          </button>
          <IconLink to="/drill/history" label="Drilling history">
            <Ico.History size={22} />
          </IconLink>
        </AppBar>
      }
    >
      <section className="ob-drill" aria-label="Drilling">
        <p className="ob-drill-info">{info.join(" · ")}</p>

        <DrillScene
          depth={m.depth}
          sessionDepth={m.sessionDepth}
          sessionTarget={m.sessionTarget}
          fraction={m.fraction}
          level={m.level}
          running={m.running}
          onIdleTap={start}
          onVein={vein.strike}
          locked={!!vein.vein}
          flare={burst}
          veinKey={vein.vein && !vein.vein.empty ? vein.vein.k : 0}
          height="clamp(280px, 46dvh, 420px)"
        >
          <Burst k={burst} />
          {toast ? <span className="ob-toast">{toast}</span> : null}
        </DrillScene>

        <div className="ob-drill-total">
          <span className="lbl">ALKE Rewards · provisional</span>
          <RollingNumber value={m.rewardsAlke} size={44} label={`Your ALKE Rewards: ${fmtAlke(m.rewardsAlke)} ALKE`} />
          {m.running ? (
            <span className="sub" role="status">
              +{fmtAlke(m.todayAlke)} today{m.hasLive ? " (est.)" : " (up to)"} · {clock(m.remaining)} left
            </span>
          ) : (
            <>
              <Button busy={busy} onClick={start}>
                Start drilling
              </Button>
              <span className="ob-small">
                {m.streak && keepBy ? `Start by ${hhmm(keepBy)} ${keepBy.toLocaleDateString(undefined, { weekday: "short" })} to keep your streak` : "One tap starts a 24-hour drill"}
              </span>
            </>
          )}
        </div>
        {error ? <Notice kind="error">{error}</Notice> : null}
        <button type="button" className="ob-drill-cue" onClick={() => deeper.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          Drill deeper
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </section>

      <DrillDeeper ref={deeper} nuruId={nuruId} level={m.level} active={m.activeInvites} joined={m.joinedInvites} />

      <Vein vein={vein.vein} onDone={vein.close} />
      <ShareSheet card={card} onClose={closeCard} />
    </AppPage>
  );
}
