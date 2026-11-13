import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, liveStreak, sessionRemaining } from "../../lib/member";
import { phaseFor, streakBoost, toC } from "../../lib/genesis";
import { watchLive } from "../../lib/network";
import { useMemberData } from "../../lib/useMemberData";
import { MarkPaths } from "../../ui/ob";

/* The mining engine for Mine and stream mode.
   Today's counter is an ESTIMATE: today's expected share (the server's
   estPerSession, or the phase's per-member maximum until it publishes one),
   times the streak boost, filled in over the 24-hour session. The real
   amount is set when the day is verified. */

const MILESTONE = 100_000; // cALKE: a burst every time today's counter passes one

export function useMining() {
  const { member } = useAuth();
  const { allocation } = useMemberData({ allocation: true });
  const [live, setLive] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => watchLive(setLive), []);

  const remaining = sessionRemaining(member, now);
  const running = remaining > 0;
  const streak = liveStreak(member, now);
  const boost = streakBoost(streak);
  const phase = phaseFor(live?.members || 0);
  const perSession = live?.estPerSession != null ? Number(live.estPerSession) : phase.maxPerMember;
  const estToday = toC(perSession) * boost;
  const fraction = running ? 1 - remaining / SESSION_MS : 0;
  const balanceC = toC(allocation?.locked);

  // Smooth ticking while mining (~30 fps); once a second otherwise.
  useEffect(() => {
    let raf;
    let t;
    if (running) {
      let last = 0;
      const loop = (ts) => {
        if (ts - last > 33) {
          last = ts;
          setNow(Date.now());
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    } else {
      t = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, [running]);

  return {
    member,
    running,
    remaining,
    streak,
    boost,
    phase,
    live,
    hasLive: live?.estPerSession != null,
    estToday,
    todayC: running ? estToday * fraction : 0,
    fraction,
    balanceC,
  };
}

/** Fires onMilestone each time [value] passes a multiple of MILESTONE (not on first load). */
export function useMilestones(value, onMilestone) {
  const last = useRef(null);
  useEffect(() => {
    const step = Math.floor(value / MILESTONE);
    if (last.current === null) {
      last.current = step;
      return;
    }
    if (step > last.current) {
      last.current = step;
      onMilestone(step * MILESTONE);
    }
  }, [value, onMilestone]);
}

export const buzz = (ms) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* not supported */
  }
};

/** A big rolling number: whole cALKE with commas, plus two small live decimals. */
export function Counter({ value, size = 44, decimals = true, className = "" }) {
  const v = Math.max(0, value);
  const whole = Math.floor(v);
  const frac = Math.floor((v - whole) * 100);
  return (
    <span className={`ob-counter num ${className}`} style={{ fontSize: size }}>
      {whole.toLocaleString("en-US")}
      {decimals ? <small>.{String(frac).padStart(2, "0")}</small> : null}
    </span>
  );
}

/** A burst of hex particles from the centre; change [k] to replay. */
export function Burst({ k }) {
  if (!k) return null;
  return (
    <span className="ob-burst" key={k} aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => (
        <i key={i} style={{ "--a": `${(360 / 14) * i}deg`, "--d": `${90 + (i % 3) * 30}px`, "--s": `${0.6 + (i % 4) * 0.15}` }} />
      ))}
    </span>
  );
}

/** The mining core: ring + mark, with tap sparks and a combo count (just for fun; it never changes cALKE). */
export function Core({ fraction, running, onIdleTap, size = "min(230px, 34cqh)" }) {
  const [sparks, setSparks] = useState([]);
  const [combo, setCombo] = useState(0);
  const timer = useRef(null);
  const id = useRef(0);

  const tap = (e) => {
    if (!running) return onIdleTap?.();
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const n = ++id.current;
    setSparks((s) => [...s.slice(-10), { n, x, y }]);
    setTimeout(() => setSparks((s) => s.filter((p) => p.n !== n)), 700);
    setCombo((c) => c + 1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCombo(0), 1200);
    buzz(8);
  };

  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <button type="button" className={running ? "ob-core on" : "ob-core"} style={{ width: size }} onPointerDown={tap} aria-label={running ? "Mining core" : "Start today's session"}>
      <span className="halo" aria-hidden="true" />
      <svg viewBox="0 0 100 100" aria-hidden="true" className="ring">
        <defs>
          <linearGradient id="coreArc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EDE7FF" />
            <stop offset=".5" stopColor="#9B7DFF" />
            <stop offset="1" stopColor="#5E3AFF" />
          </linearGradient>
          <radialGradient id="coreOrb" cx=".36" cy=".3" r=".85">
            <stop offset="0" stopColor={running ? "#8F72FF" : "#3A3160"} />
            <stop offset=".5" stopColor={running ? "#4B2DE0" : "#1B1533"} />
            <stop offset="1" stopColor={running ? "#170D4A" : "#0C0A17"} />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2.5" />
        {running ? <circle cx="50" cy="50" r={r} fill="none" stroke="url(#coreArc)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(fraction * c).toFixed(2)} ${c.toFixed(2)}`} transform="rotate(-90 50 50)" /> : null}
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.6" strokeDasharray=".4 3.6" className="dots" />
        <circle cx="50" cy="50" r="33" fill="url(#coreOrb)" stroke="rgba(214,202,255,.35)" strokeWidth=".5" />
        <g transform="translate(50 50) scale(.3) translate(-50 -56)" className="mark">
          <MarkPaths stroke={running ? "#FFFFFF" : "#B4A2FF"} width={6} />
        </g>
      </svg>
      {sparks.map((p) => (
        <span key={p.n} className="spark" style={{ left: p.x, top: p.y }} aria-hidden="true" />
      ))}
      {combo > 2 ? (
        <span className="combo" key={combo} aria-hidden="true">
          Combo {combo}
        </span>
      ) : null}
    </button>
  );
}
