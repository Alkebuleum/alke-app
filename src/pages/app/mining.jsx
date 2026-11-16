import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, liveStreak, sessionRemaining } from "../../lib/member";
import { TAP_BOOST, fmtC, phaseFor, streakBoost, tapBoost, toC, utcDay } from "../../lib/genesis";
import { sendBoost, watchBoost } from "../../lib/boost";
import { watchLive } from "../../lib/network";
import { useMemberData } from "../../lib/useMemberData";
import { MarkPaths } from "../../ui/ob";

/* The mining engine for Mine and stream mode.
   Today's counter is an ESTIMATE: today's expected share (the server's
   estPerSession, or the phase's per-member maximum until it publishes one),
   times the streak boost and today's tap boost, filled in over the 24-hour
   session. The real amount is set when the day is verified. */

const MILESTONE = 100_000; // cALKE: a burst every time today's counter passes one

export function useMining() {
  const { member, nuruId } = useAuth();
  const { allocation } = useMemberData({ allocation: true });
  const [live, setLive] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => watchLive(setLive), []);

  // Today's tap boosts: the server's count, or the last answer from alkeBoost if newer.
  const [boostDoc, setBoostDoc] = useState(null);
  const [boostLocal, setBoostLocal] = useState(null);
  useEffect(() => (nuruId ? watchBoost(nuruId, setBoostDoc) : undefined), [nuruId]);
  const today = utcDay(now);
  const tapCount = Math.max(boostDoc?.day === today ? boostDoc.count || 0 : 0, boostLocal?.day === today ? boostLocal.count || 0 : 0);
  const tapMult = tapBoost(tapCount);
  const boostNow = useCallback(async () => {
    const r = await sendBoost();
    if (r?.day) setBoostLocal({ day: r.day, count: r.count });
    return r;
  }, []);

  const remaining = sessionRemaining(member, now);
  const running = remaining > 0;
  const streak = liveStreak(member, now);
  const boost = streakBoost(streak);
  const phase = phaseFor(live?.members || 0);
  const perSession = live?.estPerSession != null ? Number(live.estPerSession) : phase.maxPerMember;
  const baseC = toC(perSession) * boost; // today's share before the tap boost
  const estToday = baseC * tapMult;
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
    tapCount,
    tapMult,
    tapMax: TAP_BOOST.perDay,
    boostNow,
    baseC,
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

/** Portal + treasure: when the core's energy fills, ask the server for a tap
    boost and show what it adds to today. One portal = one boost; the daily
    cap (TAP_BOOST.perDay) still applies. */
export function usePortal(m) {
  const [treasure, setTreasure] = useState(null);
  const busy = useRef(false);
  const { boostNow, baseC, tapCount, tapMax } = m;
  const open = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      if (tapCount >= tapMax) {
        setTreasure({ k: Date.now(), empty: true, mult: tapBoost(tapMax), count: tapMax, perDay: tapMax });
        return;
      }
      const r = await boostNow();
      if (r?.ok) {
        setTreasure({ k: Date.now(), amountC: Math.round(baseC * TAP_BOOST.step), mult: r.mult, count: r.count, perDay: r.perDay });
        buzz([40, 40, 40, 40, 140]);
      } else if (r?.reason === "cap") {
        setTreasure({ k: Date.now(), empty: true, mult: r.mult, count: r.count, perDay: r.perDay });
      }
    } catch {
      /* no treasure this time; the energy refills */
    } finally {
      busy.current = false;
    }
  }, [boostNow, baseC, tapCount, tapMax]);
  const close = useCallback(() => setTreasure(null), []);
  return { treasure, open, close };
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

/* Rhythm energy: a tap close to the last tap's tempo is "on beat" and fills
   the energy ring fast; mashing or random taps barely fill it; it drains
   when tapping stops. Full energy opens the portal (onPortal). */
const BEAT = { tolerance: 0.28, minMs: 170, maxMs: 1100, onBeat: 0.075, offBeat: 0.03, mash: 0.008, drainAfterMs: 1000, drainPerSec: 0.25 };

const Coin = ({ size = 34, fill = "coinFill" }) => (
  <svg viewBox="0 0 100 112" width={size} height={Math.round(size * 1.12)} aria-hidden="true">
    <path d="M50 2 L96 28 L96 84 L50 110 L4 84 L4 28 Z" fill={`url(#${fill})`} stroke="#FFF7DE" strokeWidth="5" strokeLinejoin="round" />
    <g transform="translate(50 56) scale(.55) translate(-50 -56)">
      <MarkPaths stroke="#4B2DE0" width={11} />
    </g>
  </svg>
);

/** The mining core: session ring, rhythm energy ring, tap sparks. */
export function Core({ fraction, running, onIdleTap, onPortal, locked = false, size = "min(230px, 34cqh)" }) {
  const [coins, setCoins] = useState([]);
  const [energy, setEnergy] = useState(0);
  const [beats, setBeats] = useState(0);
  const [flash, setFlash] = useState(0);
  const st = useRef({ energy: 0, last: 0, gap: 0, beats: 0 });
  const id = useRef(0);

  // A set of ALKE coins rising from (x, y) inside the core, then fading away.
  const rise = (x, y, count) => {
    const set = Array.from({ length: count }, (_, i) => ({
      n: ++id.current,
      x: x + (Math.random() - 0.5) * 36,
      y: y + (Math.random() - 0.5) * 16,
      dx: (Math.random() - 0.5) * 110,
      dy: 150 + Math.random() * 90,
      r: (Math.random() - 0.5) * 70,
      s: 0.75 + Math.random() * 0.5,
      d: i * 70,
    }));
    setCoins((c) => [...c.slice(-24), ...set]);
    const ids = new Set(set.map((c) => c.n));
    setTimeout(() => setCoins((c) => c.filter((k) => !ids.has(k.n))), 1700);
  };

  // While mining, an occasional coin drifts up by itself.
  useEffect(() => {
    if (!running || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      const el = document.querySelector(".ob-core.on");
      if (!el || document.hidden) return;
      const w = el.clientWidth;
      rise(w / 2 + (Math.random() - 0.5) * w * 0.3, w * 0.42, 1);
    }, 2600);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Energy drains once tapping stops.
  useEffect(() => {
    const t = setInterval(() => {
      const s = st.current;
      if (s.energy <= 0 || performance.now() - s.last < BEAT.drainAfterMs) return;
      s.energy = Math.max(0, s.energy - BEAT.drainPerSec / 10);
      s.beats = 0;
      setEnergy(s.energy);
      setBeats(0);
    }, 100);
    return () => clearInterval(t);
  }, []);

  const tap = (e) => {
    if (!running) return onIdleTap?.();
    if (locked) return;
    const box = e.currentTarget.getBoundingClientRect();
    const s = st.current;
    const now = performance.now();
    const gap = s.last ? now - s.last : 0;
    const onBeat = gap >= BEAT.minMs && gap <= BEAT.maxMs && s.gap > 0 && Math.abs(gap - s.gap) / s.gap <= BEAT.tolerance;
    s.beats = onBeat ? s.beats + 1 : 0;
    const gain = onBeat ? BEAT.onBeat * (1 + Math.min(s.beats, 10) * 0.03) : gap && gap < BEAT.minMs ? BEAT.mash : BEAT.offBeat;
    s.energy = Math.min(1, s.energy + gain);
    s.gap = gap && gap <= BEAT.maxMs * 1.5 ? gap : 0;
    s.last = now;
    rise(e.clientX - box.left, e.clientY - box.top, onBeat ? 4 + Math.floor(Math.random() * 3) : 2);
    if (onBeat) setFlash(now);
    buzz(onBeat ? 14 : 6);
    if (s.energy >= 1) {
      s.energy = 0;
      s.beats = 0;
      s.gap = 0;
      onPortal?.();
    }
    setEnergy(s.energy);
    setBeats(s.beats);
  };

  const r = 46;
  const c = 2 * Math.PI * r;
  const er = 40;
  const ec = 2 * Math.PI * er;
  const pct = Math.round(energy * 100);
  return (
    <button
      type="button"
      className={`ob-core${running ? " on" : ""}${energy > 0.75 ? " charged" : ""}`}
      style={{ width: size }}
      onPointerDown={tap}
      aria-label={running ? `Mining core, energy ${pct}%` : "Start today's session"}
    >
      <span className="halo" aria-hidden="true" />
      {flash ? <span className="beat" key={flash} aria-hidden="true" /> : null}
      <svg viewBox="0 0 100 100" aria-hidden="true" className="ring">
        <defs>
          <linearGradient id="coreArc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EDE7FF" />
            <stop offset=".5" stopColor="#9B7DFF" />
            <stop offset="1" stopColor="#5E3AFF" />
          </linearGradient>
          <linearGradient id="coinFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF0C2" />
            <stop offset=".45" stopColor="#F5C451" />
            <stop offset="1" stopColor="#D08A12" />
          </linearGradient>
          <linearGradient id="energyArc" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#F5C451" />
            <stop offset="1" stopColor="#FFF3D1" />
          </linearGradient>
          <radialGradient id="coreOrb" cx=".36" cy=".3" r=".85">
            <stop offset="0" stopColor={running ? "#8F72FF" : "#3A3160"} />
            <stop offset=".5" stopColor={running ? "#4B2DE0" : "#1B1533"} />
            <stop offset="1" stopColor={running ? "#170D4A" : "#0C0A17"} />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2.5" />
        {running ? (
          <circle cx="50" cy="50" r={r} fill="none" stroke="url(#coreArc)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(fraction * c).toFixed(2)} ${c.toFixed(2)}`} transform="rotate(-90 50 50)" />
        ) : null}
        <circle cx="50" cy="50" r={er} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.6" strokeDasharray=".4 3.6" className="dots" />
        {running && energy > 0 ? (
          <circle cx="50" cy="50" r={er} fill="none" stroke="url(#energyArc)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(energy * ec).toFixed(2)} ${ec.toFixed(2)}`} transform="rotate(-90 50 50)" className="energy" />
        ) : null}
        <circle cx="50" cy="50" r="33" fill="url(#coreOrb)" stroke="rgba(214,202,255,.35)" strokeWidth=".5" />
        <g transform="translate(50 50) scale(.3) translate(-50 -56)" className="mark">
          <MarkPaths stroke={running ? "#FFFFFF" : "#B4A2FF"} width={6} />
        </g>
      </svg>
      {coins.map((k) => (
        <span
          key={k.n}
          className="coin"
          style={{ left: k.x, top: k.y, "--dx": `${k.dx}px`, "--dy": `${-k.dy}px`, "--r": `${k.r}deg`, "--s": k.s, animationDelay: `${k.d}ms` }}
          aria-hidden="true"
        >
          <Coin />
        </span>
      ))}
      {running && energy > 0 ? (
        <span className="combo" aria-hidden="true">
          <b key={pct}>{pct}%</b>
          <small>energy</small>
          <small className="next">{beats >= 2 ? `${beats} on beat` : "tap a steady beat"}</small>
        </span>
      ) : null}
    </button>
  );
}

/** The treasure reveal, TikTok-gift style: veil, portal, rising coin, coin
    rain and a banner whose amount counts up; fades out by itself. */
export function Treasure({ treasure, onDone }) {
  const [shown, setShown] = useState(0);
  const k = treasure?.k;
  useEffect(() => {
    if (!k) return;
    const total = treasure.empty ? 0 : treasure.amountC || 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf;
    const t0 = performance.now();
    const step = (ts) => {
      const p = reduce ? 1 : Math.min(1, Math.max(0, (ts - t0 - 900) / 1500));
      setShown(total * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const done = setTimeout(onDone, treasure.empty ? 2600 : 4600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);
  if (!treasure) return null;

  if (treasure.empty) {
    return (
      <div className="ob-treasure empty" key={k} role="status">
        <div className="veil" />
        <div className="banner">
          <span className="kicker">The treasury is empty today</span>
          <b className="amt num">×{treasure.mult.toFixed(1)}</b>
          <span className="sub">
            Max tap boost reached · {treasure.count}/{treasure.perDay} · new treasures at 00:00 UTC
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="ob-treasure" key={k} role="status" aria-label={`Hidden treasury: ${fmtC(treasure.amountC)} cALKE`}>
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="tCoin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF0C2" />
            <stop offset=".45" stopColor="#F5C451" />
            <stop offset="1" stopColor="#D08A12" />
          </linearGradient>
        </defs>
      </svg>
      <div className="veil" />
      <div className="portal" aria-hidden="true">
        <i className="rays" />
        <i className="swirl" />
        <i className="hole" />
      </div>
      <div className="gem" aria-hidden="true">
        <Coin size={120} fill="tCoin" />
      </div>
      <div className="rain" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} style={{ "--x": `${(i * 37) % 100}%`, "--d": `${900 + (i % 7) * 140}ms`, "--t": `${1.4 + (i % 5) * 0.25}s`, "--r": `${(i % 2 ? 1 : -1) * (180 + i * 20)}deg`, "--s": 0.55 + (i % 4) * 0.15 }}>
            <Coin size={26} fill="tCoin" />
          </span>
        ))}
      </div>
      <div className="banner">
        <span className="kicker">Hidden treasury opened</span>
        <b className="amt num">+{fmtC(shown)}</b>
        <span className="sub">
          cALKE added to today · tap boost ×{treasure.mult.toFixed(1)} · {treasure.count}/{treasure.perDay}
        </span>
      </div>
    </div>
  );
}
