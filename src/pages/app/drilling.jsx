import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, liveStreak, sessionRemaining } from "../../lib/member";
import { TAP_BOOST, bracketDrill, bracketFor, fmtAlke, phaseFor, streakBoost, tapBoost, toAlke, toC, utcDay } from "../../lib/genesis";
import { sendBoost, watchBoost } from "../../lib/boost";
import { watchLive } from "../../lib/network";
import { useMemberData } from "../../lib/useMemberData";
import { MarkPaths } from "../../ui/ob";
import { BASE_DEPTH, Scene, rigBoost, rigDepth, rigLevel } from "./drillScene";

/* The drilling engine for Drill and stream mode.
   Today's counter is an ESTIMATE, filled in over the 24-hour session. In a
   fixed Genesis bracket it's the bracket's drill reward for your boosts
   (streak × rig × taps move it from low to high); otherwise today's expected
   share (the server's estPerSession, or the phase's per-member maximum until
   it publishes one) times those boosts. The real amount is set when the day is verified.
   Depth is a picture of progress: BASE_DEPTH metres a session, deeper with
   today's tap boost (each vein struck drills further). */

const MILESTONE = 100_000; // cALKE: a burst every time today's counter passes one

export function useDrilling() {
  const { member, nuruId } = useAuth();
  const { allocation, invites } = useMemberData({ allocation: true, invites: true });
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
  const activeInvites = Number(invites?.active) || 0;
  const level = rigLevel(activeInvites);
  const rig = rigBoost(level);
  const bracket = bracketFor(live);
  const fixed = !!bracket?.drill;
  // Today's estimate (cALKE) with [taps] tap boosts.
  const estFor = (taps) => (fixed ? toC(bracketDrill(bracket, boost * rig * tapBoost(taps))) : toC(perSession) * boost * rig * tapBoost(taps));
  const estToday = estFor(tapCount);
  const veinC = Math.max(0, estFor(tapCount + 1) - estToday); // what the next vein adds
  const fraction = running ? 1 - remaining / SESSION_MS : 0;
  const balanceC = toC(allocation?.locked);

  // Depth: every finished drill went BASE_DEPTH; this one goes as deep as the
  // rig level allows (active invites), further still with the tap boost.
  const sessions = member?.sessionCount || 0;
  const pastDepth = Math.max(0, sessions - (running ? 1 : 0)) * BASE_DEPTH;
  const sessionTarget = rigDepth(level) * tapMult;
  const sessionDepth = running ? sessionTarget * fraction : 0;

  // Smooth ticking while drilling (~30 fps); once a second otherwise.
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
    veinC,
    phase,
    bracket,
    live,
    hasLive: live?.estPerSession != null,
    estToday,
    todayC: running ? estToday * fraction : 0,
    fraction,
    balanceC,
    // Real ALKE for display: the locked balance plus today's drill so far (provisional).
    rewardsAlke: toAlke(balanceC + (running ? estToday * fraction : 0)),
    todayAlke: toAlke(running ? estToday * fraction : 0),
    perHourAlke: toAlke(estToday) / 24,
    level,
    rig,
    activeInvites,
    joinedInvites: Number(invites?.joined) || 0,
    depth: pastDepth + sessionDepth,
    sessionDepth,
    sessionTarget,
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

/** Veins: when the drill's pressure fills, ask the server for a tap boost
    and show what it adds to today. One vein = one boost; the daily cap
    (TAP_BOOST.perDay) still applies. */
export function useVein(m) {
  const [vein, setVein] = useState(null);
  const busy = useRef(false);
  const { boostNow, veinC, tapCount, tapMax } = m;
  const strike = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      if (tapCount >= tapMax) {
        setVein({ k: Date.now(), empty: true, mult: tapBoost(tapMax), count: tapMax, perDay: tapMax });
        return;
      }
      const r = await boostNow();
      if (r?.ok) {
        setVein({ k: Date.now(), amountC: Math.round(veinC), mult: r.mult, count: r.count, perDay: r.perDay });
        buzz([40, 40, 40, 40, 140]);
      } else if (r?.reason === "cap") {
        setVein({ k: Date.now(), empty: true, mult: r.mult, count: r.count, perDay: r.perDay });
      } else if (r?.reason === "no-session") {
        setVein({ k: Date.now(), empty: true, title: "Start drilling first", sub: "Then tap the rock to strike veins" });
      }
    } catch {
      setVein({ k: Date.now(), empty: true, title: "The drill slipped", sub: "Couldn't reach ALKE. Check your connection and tap again" });
    } finally {
      busy.current = false;
    }
  }, [boostNow, veinC, tapCount, tapMax]);
  const close = useCallback(() => setVein(null), []);
  return { vein, strike, close };
}

export const buzz = (ms) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* not supported */
  }
};

/* Rolling digits (from the ALKÉ Drill prototype): each digit is a strip of
   0-9 twice over that slides; a 9 rolls forward into the next 0. Slow digits
   roll, fast ones (the last decimals, many times a second) just tick. The
   digits are built by hand into an empty node React never touches. */
function snapDigit(rec, pos) {
  rec.pos = pos;
  rec.moving = false;
  rec.strip.classList.add("snap");
  rec.strip.style.transform = `translateY(${-pos}em)`;
  void rec.strip.offsetHeight;
  rec.strip.classList.remove("snap");
}

/** A big live ALKE number with rolling digits; decimals past the second are small and gold. */
export function RollingNumber({ value, decimals = 6, unit = "ALKE", size = 46, label }) {
  const box = useRef(null);
  const st = useRef({ shape: "", digits: [], prev: 0 });
  const str = fmtAlke(value, decimals);

  useLayoutEffect(() => {
    const el = box.current;
    const s = st.current;
    const shape = str.replace(/\d/g, "0");
    if (shape !== s.shape) {
      s.shape = shape;
      s.prev = value;
      el.textContent = "";
      s.digits = [];
      const dot = str.indexOf(".");
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (ch >= "0" && ch <= "9") {
          const d = document.createElement("span");
          d.className = dot >= 0 && i > dot + 2 ? "d fine" : "d";
          const strip = document.createElement("span");
          strip.className = "strip";
          for (let n = 0; n < 20; n++) {
            const c = document.createElement("span");
            c.textContent = String(n % 10);
            strip.appendChild(c);
          }
          d.appendChild(strip);
          el.appendChild(d);
          const rec = { strip, pos: 0, last: 0, moving: false };
          snapDigit(rec, Number(ch));
          strip.addEventListener("transitionend", () => {
            rec.moving = false;
            if (rec.pos >= 10) snapDigit(rec, rec.pos - 10);
          });
          strip.addEventListener("transitioncancel", () => {
            rec.moving = false;
          });
          s.digits.push(rec);
        } else {
          const sep = document.createElement("span");
          sep.className = "sep";
          sep.textContent = ch;
          el.appendChild(sep);
        }
      }
      if (unit) {
        const u = document.createElement("span");
        u.className = "unit";
        u.textContent = unit;
        el.appendChild(u);
      }
      // Shrink to fit very large balances.
      el.style.fontSize = `${size}px`;
      let px = size;
      for (let i = 0; i < 6 && el.clientWidth > 0 && el.scrollWidth > el.clientWidth && px > 22; i++) {
        px = Math.max(22, Math.floor((px * el.clientWidth) / el.scrollWidth) - (i ? 1 : 0));
        el.style.fontSize = `${px}px`;
      }
      return;
    }
    const up = value >= s.prev;
    s.prev = value;
    const now = performance.now();
    const still = reducedMotion();
    let k = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i) - 48;
      if (ch < 0 || ch > 9) continue;
      const rec = s.digits[k++];
      if (!rec) break;
      const cur = rec.pos % 10;
      if (ch === cur) continue;
      if (rec.pos >= 10 && !rec.moving) snapDigit(rec, rec.pos - 10);
      let target;
      if (up) {
        const base = rec.pos - (rec.pos % 10);
        target = ch > cur ? base + ch : base + 10 + ch;
        if (target >= 20) {
          snapDigit(rec, rec.pos % 10);
          target = ch > cur ? ch : 10 + ch;
        }
      } else target = ch;
      const gap = now - rec.last;
      rec.last = now;
      const dur = still || gap < 160 ? 0 : Math.min(450, gap * 0.6);
      if (!dur) {
        snapDigit(rec, target >= 10 ? target - 10 : target);
        continue;
      }
      rec.strip.style.transitionDuration = `${Math.round(dur)}ms`;
      rec.pos = target;
      rec.moving = true;
      rec.strip.style.transform = `translateY(${-target}em)`;
    }
  }, [str, value, unit, size]);

  return (
    <div className="ob-roll" role="img" aria-label={label || `${str} ${unit}`}>
      <span className="ob-roll-digits" ref={box} aria-hidden="true" />
    </div>
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

/* Rhythm pressure: a tap close to the last tap's tempo is "on beat" and
   builds pressure fast; mashing or random taps barely build it; it bleeds
   off when tapping stops. Full pressure strikes a vein (onVein). */
const BEAT = { tolerance: 0.28, minMs: 170, maxMs: 1100, onBeat: 0.075, offBeat: 0.03, mash: 0.008, drainAfterMs: 1000, drainPerSec: 0.25 };

const reducedMotion = () => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const m2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The drilling scene: rig, bore and rock (drillScene.js), with tap-to-strike
    pressure on top. Tapping while idle starts a session. A change of [flare]
    replays a celebration (session start, milestones); of [veinKey], a vein strike. */
export function DrillScene({ depth, sessionDepth = 0, sessionTarget = 0, fraction, running, level = 0, taps = true, onIdleTap, onVein, locked = false, flare = 0, veinKey = 0, height = 300, children }) {
  const cv = useRef(null);
  const scene = useRef(null);
  const depthEl = useRef(null);
  const props = useRef({});
  props.current = { depth, fraction, running, level };

  const [pressure, setPressure] = useState(0);
  const [beats, setBeats] = useState(0);
  const st = useRef({ energy: 0, last: 0, gap: 0, beats: 0 });

  // The animation loop. Depth eases toward its target, so a vein makes the drill surge down.
  useEffect(() => {
    const s = new Scene(cv.current);
    scene.current = s;
    let shown = props.current.depth;
    let raf;
    let last = 0;
    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
      last = ts;
      const p = props.current;
      const reduced = reducedMotion();
      shown = reduced || p.depth < shown ? p.depth : shown + (p.depth - shown) * Math.min(1, dt * 2.5);
      s.frame(ts, shown, p.running ? p.fraction : 0, p.running ? "drilling" : "ready", reduced, p.level);
      if (depthEl.current) {
        const txt = m2.format(shown);
        if (depthEl.current.textContent !== txt) depthEl.current.textContent = txt;
      }
    };
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => s.resize());
    ro.observe(cv.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (flare) scene.current?.celebrate();
  }, [flare]);
  useEffect(() => {
    if (veinKey) scene.current?.vein();
  }, [veinKey]);

  // Pressure bleeds off once tapping stops.
  useEffect(() => {
    const t = setInterval(() => {
      const s = st.current;
      if (s.energy <= 0 || performance.now() - s.last < BEAT.drainAfterMs) return;
      s.energy = Math.max(0, s.energy - BEAT.drainPerSec / 10);
      s.beats = 0;
      setPressure(s.energy);
      setBeats(0);
    }, 100);
    return () => clearInterval(t);
  }, []);

  const tap = () => {
    if (!running) return onIdleTap?.();
    if (locked) return;
    if (!taps) {
      // Onboarding: taps just throw sparks; no pressure game yet.
      scene.current?.strike(false);
      return buzz(6);
    }
    const s = st.current;
    const now = performance.now();
    const gap = s.last ? now - s.last : 0;
    const onBeat = gap >= BEAT.minMs && gap <= BEAT.maxMs && s.gap > 0 && Math.abs(gap - s.gap) / s.gap <= BEAT.tolerance;
    s.beats = onBeat ? s.beats + 1 : 0;
    const gain = onBeat ? BEAT.onBeat * (1 + Math.min(s.beats, 10) * 0.03) : gap && gap < BEAT.minMs ? BEAT.mash : BEAT.offBeat;
    s.energy = Math.min(1, s.energy + gain);
    s.gap = gap && gap <= BEAT.maxMs * 1.5 ? gap : 0;
    s.last = now;
    scene.current?.strike(onBeat);
    buzz(onBeat ? 14 : 6);
    if (s.energy >= 1) {
      s.energy = 0;
      s.beats = 0;
      s.gap = 0;
      onVein?.();
    }
    setPressure(s.energy);
    setBeats(s.beats);
  };

  const pct = Math.round(pressure * 100);
  return (
    <div className={`ob-drill-scene${running ? " on" : ""}${pressure > 0.75 ? " charged" : ""}`} style={{ height }}>
      <canvas ref={cv} aria-hidden="true" />
      <button type="button" className="hit" onPointerDown={tap} aria-label={running ? (taps ? `Strike the rock. Pressure ${pct}%` : "Strike the rock") : "Start drilling"} />
      <span className="ob-drill-badge" data-s={running ? "drilling" : "ready"}>
        <i />
        {running ? "Drilling" : "Ready"}
      </span>
      <div className="ob-drill-depth" aria-hidden="true">
        <span className="lbl">TOTAL DEPTH</span>
        <b>
          <span ref={depthEl}>{m2.format(depth)}</span>
          <small>m</small>
        </b>
        {running ? (
          <span className="sess">
            THIS DRILL {Math.floor(sessionDepth).toLocaleString("en-US")} / {Math.round(sessionTarget).toLocaleString("en-US")} M
          </span>
        ) : null}
      </div>
      {running && taps ? (
        <span className={`ob-drill-pressure${pct ? " live" : ""}`} aria-hidden="true">
          <span className="track">
            <span style={{ height: `${pct}%` }} />
          </span>
          <span className="txt">
            <b key={pct}>{pct}%</b>
            <small>pressure</small>
            <small className="next">{beats >= 2 ? `${beats} on beat` : "tap a steady beat"}</small>
          </span>
        </span>
      ) : null}
      {children}
    </div>
  );
}

const Crystal = ({ size = 34, fill = "coinFill" }) => (
  <svg viewBox="0 0 100 112" width={size} height={Math.round(size * 1.12)} aria-hidden="true">
    <path d="M50 2 L96 28 L96 84 L50 110 L4 84 L4 28 Z" fill={`url(#${fill})`} stroke="#FFF7DE" strokeWidth="5" strokeLinejoin="round" />
    <g transform="translate(50 56) scale(.55) translate(-50 -56)">
      <MarkPaths stroke="#4B2DE0" width={11} />
    </g>
  </svg>
);

/** The vein reveal, TikTok-gift style: veil, a gusher of light, a rising ALKE
    crystal, crystal rain and a banner whose amount counts up; fades by itself. */
export function Vein({ vein, onDone }) {
  const [shown, setShown] = useState(0);
  const k = vein?.k;
  useEffect(() => {
    if (!k) return;
    const total = vein.empty ? 0 : vein.amountC || 0;
    const reduce = reducedMotion();
    let raf;
    const t0 = performance.now();
    const step = (ts) => {
      const p = reduce ? 1 : Math.min(1, Math.max(0, (ts - t0 - 900) / 1500));
      setShown(total * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const done = setTimeout(onDone, vein.empty ? 2600 : 4600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);
  if (!vein) return null;

  if (vein.empty) {
    return (
      <div className="ob-treasure empty" key={k} role="status">
        <div className="veil" />
        <div className="banner">
          {vein.title ? (
            <>
              <span className="kicker">{vein.title}</span>
              <span className="sub">{vein.sub}</span>
            </>
          ) : (
            <>
              <span className="kicker">No veins left today</span>
              <b className="amt num">×{vein.mult.toFixed(1)}</b>
              <span className="sub">
                Max tap boost reached · {vein.count}/{vein.perDay} · new veins at 00:00 UTC
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ob-treasure" key={k} role="status" aria-label={`You struck a vein: ${fmtAlke(toAlke(vein.amountC))} ALKE`}>
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
        <Crystal size={120} fill="tCoin" />
      </div>
      <div className="rain" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} style={{ "--x": `${(i * 37) % 100}%`, "--d": `${900 + (i % 7) * 140}ms`, "--t": `${1.4 + (i % 5) * 0.25}s`, "--r": `${(i % 2 ? 1 : -1) * (180 + i * 20)}deg`, "--s": 0.55 + (i % 4) * 0.15 }}>
            <Crystal size={26} fill="tCoin" />
          </span>
        ))}
      </div>
      <div className="banner">
        <span className="kicker">You struck a vein</span>
        <b className="amt num">+{fmtAlke(toAlke(shown))}</b>
        <span className="sub">
          ALKE added to today · tap boost ×{vein.mult.toFixed(1)} · {vein.count}/{vein.perDay}
        </span>
      </div>
    </div>
  );
}
