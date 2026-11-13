import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, STREAK_MS, liveStreak, sessionRemaining, startSession } from "../../lib/member";
import { useMemberData } from "../../lib/useMemberData";
import { Button, Notice } from "../../ui/ob";
import { AppBar, AppPage, Ico, IconLink, Ring, Row, Stat, alke, clock, hhmm, useNow } from "../../ui/shell";

/* Community mining: the daily session. Idle → one tap → 24 hours,
   counted down from the server's start time. */
export default function Mine() {
  const { nuruId, member } = useAuth();
  const { allocation } = useMemberData({ allocation: true });
  const now = useNow(1000);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const remaining = sessionRemaining(member, now);
  const running = remaining > 0;
  const last = member?.lastSessionAt?.toDate?.();
  const streak = liveStreak(member, now);
  const keepBy = last ? new Date(last.getTime() + STREAK_MS) : null;

  const start = async () => {
    if (running || busy) return;
    setBusy(true);
    setError(null);
    try {
      await startSession(nuruId, member);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const hint = running
    ? `Started at ${hhmm(last)} · next session opens when this ends`
    : streak && keepBy
      ? `Start by ${keepBy.toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })} to keep your streak`
      : "One tap starts a 24-hour session";

  return (
    <AppPage
      tab="mine"
      bar={
        <AppBar title="Mine">
          <IconLink to="/mine/history" label="Session history">
            <Ico.History size={22} />
          </IconLink>
        </AppBar>
      }
    >
      <section aria-label="Session" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "12px 0 4px" }}>
        <span className={running ? "ob-pill green" : "ob-pill"}>
          <span className="d" />
          {running ? "Mining" : "Not mining"}
        </span>
        <div role={running ? "timer" : undefined} aria-label={running ? `${clock(remaining)} left` : undefined} style={{ width: "min(220px, 32cqh)", aspectRatio: "1" }}>
          <Ring size="100%" stroke={4} fraction={running ? remaining / SESSION_MS : 0} active={running}>
            {running ? (
              <>
                <span className="num" style={{ fontSize: 34, fontWeight: 700 }}>
                  {clock(remaining)}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-3)" }}>remaining</span>
              </>
            ) : null}
          </Ring>
        </div>
        <p className="ob-small" style={{ textAlign: "center", fontSize: 14 }}>
          {hint}
        </p>
        {!running ? (
          <Button busy={busy} onClick={start}>
            Start session
          </Button>
        ) : null}
        {error ? <Notice kind="error">{error}</Notice> : null}
      </section>

      <div className="ob-stats">
        <Stat label="Streak" icon={<Ico.Flame size={13} />} value={streak} unit={`best ${member?.bestStreak || 0}`} />
        <Stat to="/mine/history" label="Sessions" value={member?.sessionCount || 0} />
        <Stat to="/mine/allocation" label="Locked" icon={<Ico.Lock size={13} />} value={alke(allocation?.locked)} unit="ALKE" />
      </div>

      <ul className="ob-list">
        <li>
          <Row to="/mine/allocation" icon={<Ico.Wallet />} title="Allocation" sub="Pending, verified and locked ALKE" />
        </li>
        <li>
          <Row to="/mine/history" icon={<Ico.History />} title="History" sub="Every session and how it was counted" />
        </li>
        <li>
          <Row to="/how-to-redeem" icon={<Ico.Doc />} title="How to redeem ALKE" sub="From cold ALKE to your wallet" />
        </li>
      </ul>

      <p className="ob-small center">Sessions record participation. They never create new ALKE.</p>
    </AppPage>
  );
}
