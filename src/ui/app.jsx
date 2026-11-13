import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ui.css";

/* Shared pieces for the member screens (Home, Mine, Allocation, History). */

export const tabular = { fontVariantNumeric: "tabular-nums" };
export const mono = { fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".14em", color: "var(--faint)" };
export const display = { fontFamily: "var(--display)", fontWeight: 600 };
export const card = {
  padding: 20,
  borderRadius: 24,
  background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))",
  border: "1px solid rgba(255,255,255,.08)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
};

/** Re-renders every [ms] (clocks, countdowns). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

const pad = (n) => String(n).padStart(2, "0");
export const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};
export const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const alke = (v) => (Number(v) || 0).toFixed(2);

/** "2 hours", "35 minutes", "3 days". */
export function ago(ms) {
  const m = Math.max(1, Math.round(ms / 60000));
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"}`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} hour${h === 1 ? "" : "s"}`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"}`;
}

/** A scrolling member screen with the tab bar. */
export function AppScreen({ tab, glow = "rgba(110,72,255,.40)", children }) {
  return (
    <div
      className="ui-screen"
      style={{
        backgroundImage: `radial-gradient(90% 46% at 50% -6%,${glow} 0%,rgba(110,72,255,0) 72%),radial-gradient(70% 40% at 50% 44%,rgba(94,58,255,.16) 0%,rgba(94,58,255,0) 70%)`,
      }}
    >
      <main style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
        <div style={{ padding: "max(58px, env(safe-area-inset-top)) 20px 128px", display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
      </main>
      <TabBar active={tab} />
    </div>
  );
}

/** Back button + centred title (Allocation, History). */
export function SubHeader({ title, back }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", alignItems: "center", marginTop: -6 }}>
      <Link to={back} className="ui-round" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m14.5 6-6 6 6 6" />
        </svg>
      </Link>
      <h1 style={{ margin: 0, textAlign: "center", ...display, fontSize: 18 }}>{title}</h1>
      <span />
    </div>
  );
}

const TAB = { height: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, textDecoration: "none", fontSize: 10.5 };
const ICONS = {
  home: <path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z" />,
  games: (
    <path d="M6.7 5.5h10.6a3.9 3.9 0 0 1 3.9 3.5l.7 6.4a2.9 2.9 0 0 1-5 2.3l-1.6-1.8a2 2 0 0 0-1.5-.7h-3.6a2 2 0 0 0-1.5.7l-1.6 1.8a2.9 2.9 0 0 1-5-2.3l.7-6.4a3.9 3.9 0 0 1 3.9-3.5zM8 9.2v3.6M6.2 11h3.6M14.9 12a.6.6 0 1 0 1.2 0a.6.6 0 1 0-1.2 0M16.9 9.8a.6.6 0 1 0 1.2 0a.6.6 0 1 0-1.2 0" />
  ),
  network: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 20c.7-3.5 3.3-5.5 6.5-5.5s5.8 2 6.5 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.8 2.6 2.6 3 5.2" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20.5c.9-4 4-6 8-6s7.1 2 8 6" />
    </>
  ),
};

function Tab({ to, id, label, active }) {
  const on = active === id;
  return (
    <Link to={to} aria-current={on ? "page" : undefined} style={{ ...TAB, color: on ? "#F7F5F2" : "#8C8999", fontWeight: on ? 700 : 600 }}>
      <span style={{ width: 48, height: 30, borderRadius: 15, background: on ? "rgba(139,109,255,.22)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: on ? "#C6B6FF" : "inherit" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 1.8 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {ICONS[id]}
        </svg>
      </span>
      {label}
    </Link>
  );
}

export function TabBar({ active }) {
  const mineOn = active === "mine";
  return (
    <nav
      aria-label="Main"
      style={{
        position: "absolute", left: 14, right: 14, bottom: "max(24px, env(safe-area-inset-bottom))", height: 70, borderRadius: 28,
        background: "rgba(20,18,31,.80)", border: "1px solid rgba(255,255,255,.09)",
        boxShadow: "0 20px 40px -14px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.06)",
        backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
        display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", alignItems: "center", padding: "0 4px", boxSizing: "border-box",
      }}
    >
      <Tab to="/home" id="home" label="Home" active={active} />
      <Tab to="/games" id="games" label="Games" active={active} />
      <Link
        to="/mine"
        aria-current={mineOn ? "page" : undefined}
        style={{ height: 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 3, paddingBottom: 6, boxSizing: "border-box", textDecoration: "none", color: mineOn ? "#F7F5F2" : "#A9A6B6", fontSize: 10.5, fontWeight: mineOn ? 700 : 600 }}
      >
        <span style={{ marginTop: -34, width: 58, height: 64, display: "block", filter: mineOn ? "drop-shadow(0 0 14px rgba(155,125,255,.75))" : "drop-shadow(0 10px 18px rgba(110,72,255,.6))" }}>
          <svg width="58" height="64" viewBox="0 0 100 112" aria-hidden="true">
            <defs>
              <linearGradient id="tabHex" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#9B7DFF" />
                <stop offset="1" stopColor="#5530E8" />
              </linearGradient>
            </defs>
            <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="url(#tabHex)" stroke={mineOn ? "#FFFFFF" : "#D9CEFF"} strokeOpacity={mineOn ? 0.9 : 0.55} strokeWidth={mineOn ? 3 : 2.5} strokeLinejoin="round" />
            <MarkStrokes scale={0.5} width={8} />
          </svg>
        </span>
        Mine
      </Link>
      <Tab to="/network" id="network" label="Network" active={active} />
      <Tab to="/profile" id="profile" label="Profile" active={active} />
    </nav>
  );
}

/** The mark's inner strokes, centred in a 100×112 box. */
export function MarkStrokes({ scale = 1, width = 5, color = "#FFFFFF", pulse }) {
  return (
    <g transform={`translate(50 56) scale(${scale}) translate(-50 -56)`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      <g style={pulse ? { animation: "alkPulse 2.4s ease-in-out infinite" } : undefined}>
        <line x1="50" y1="27" x2="50" y2="85" />
        <path d="M20 45 L32 56 L20 67" />
        <path d="M30 45 L42 56 L30 67" />
        <path d="M80 45 L68 56 L80 67" />
        <path d="M70 45 L58 56 L70 67" />
      </g>
    </g>
  );
}

const C = 892.2; // r=142 ring circumference

/** The session core: idle (tap to start) or running with the time-left arc. */
export function Orb({ size = 280, running, fraction = 0 }) {
  if (!running) {
    return (
      <>
        <span aria-hidden="true" style={{ position: "absolute", inset: -26, borderRadius: "50%", background: "radial-gradient(circle,rgba(110,72,255,.34) 0%,rgba(110,72,255,.10) 42%,rgba(110,72,255,0) 68%)", animation: "alkBreath 4.5s ease-in-out infinite" }} />
        <svg width={size} height={size} viewBox="0 0 300 300" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="orbIdle" cx=".36" cy=".3" r=".85">
              <stop offset="0" stopColor="#3D3270" />
              <stop offset=".5" stopColor="#1B1533" />
              <stop offset="1" stopColor="#0C0A17" />
            </radialGradient>
          </defs>
          <circle cx="150" cy="150" r="142" fill="none" stroke="#FFFFFF" strokeOpacity=".07" strokeWidth="3" />
          <circle cx="150" cy="150" r="128" fill="none" stroke="#FFFFFF" strokeOpacity=".14" strokeWidth="6" strokeDasharray="1 12.4" />
          <g style={{ transformOrigin: "150px 150px", animation: "alkSpin 60s linear infinite" }}>
            <circle cx="150" cy="150" r="114" fill="none" stroke="#C6B6FF" strokeOpacity=".14" strokeWidth="1" />
            <circle cx="150" cy="36" r="3.5" fill="#C6B6FF" fillOpacity=".85" />
          </g>
          <circle cx="150" cy="150" r="98" fill="url(#orbIdle)" stroke="#C6B6FF" strokeOpacity=".22" strokeWidth="1" />
          <ellipse cx="130" cy="98" rx="52" ry="24" fill="#FFFFFF" fillOpacity=".06" />
          <g transform="translate(150 150) scale(.95) translate(-50 -56)">
            <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="none" stroke="#C6B6FF" strokeOpacity=".7" strokeWidth="5" strokeLinejoin="round" />
            <MarkStrokes color="#C6B6FF" pulse />
          </g>
        </svg>
      </>
    );
  }
  return (
    <>
      <span aria-hidden="true" style={{ position: "absolute", inset: -34, borderRadius: "50%", background: "radial-gradient(circle,rgba(118,82,255,.58) 0%,rgba(94,58,255,.20) 40%,rgba(94,58,255,0) 68%)", animation: "alkBreath 4s ease-in-out infinite" }} />
      <svg width={size} height={size} viewBox="0 0 300 300" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="arcG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EDE7FF" />
            <stop offset=".5" stopColor="#9B7DFF" />
            <stop offset="1" stopColor="#5E3AFF" />
          </linearGradient>
          <radialGradient id="orbA" cx=".36" cy=".3" r=".85">
            <stop offset="0" stopColor="#9478FF" />
            <stop offset=".45" stopColor="#4C2BD9" />
            <stop offset="1" stopColor="#160B45" />
          </radialGradient>
        </defs>
        <circle cx="150" cy="150" r="142" fill="none" stroke="#FFFFFF" strokeOpacity=".08" strokeWidth="3" />
        <circle cx="150" cy="150" r="142" fill="none" stroke="url(#arcG)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(fraction * C).toFixed(1)} ${C}`} transform="rotate(-90 150 150)" />
        <circle cx="150" cy="150" r="128" fill="none" stroke="#FFFFFF" strokeOpacity=".18" strokeWidth="6" strokeDasharray="1 12.4" />
        <g style={{ transformOrigin: "150px 150px", animation: "alkSpin 30s linear infinite" }}>
          <circle cx="150" cy="150" r="114" fill="none" stroke="#C6B6FF" strokeOpacity=".2" strokeWidth="1" />
          <circle cx="150" cy="36" r="9" fill="#9B7DFF" fillOpacity=".3" />
          <circle cx="150" cy="36" r="4" fill="#EDE7FF" />
        </g>
        <g style={{ transformOrigin: "150px 150px", animation: "alkSpinR 55s linear infinite" }}>
          <circle cx="264" cy="150" r="2.5" fill="#C6B6FF" fillOpacity=".8" />
          <circle cx="36" cy="150" r="2" fill="#C6B6FF" fillOpacity=".5" />
        </g>
        <circle cx="150" cy="150" r="98" fill="url(#orbA)" stroke="#D6CAFF" strokeOpacity=".38" strokeWidth="1" />
        <ellipse cx="128" cy="96" rx="54" ry="24" fill="#FFFFFF" fillOpacity=".1" />
        <g transform="translate(150 150) scale(.95) translate(-50 -56)">
          <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinejoin="round" />
          <MarkStrokes />
        </g>
      </svg>
    </>
  );
}

export const Flame = ({ size = 15, color = "currentColor", width = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21c3.9 0 7-2.6 7-6.4 0-3.3-2.2-5.4-3.9-7.2.1 2.1-.9 3.5-2.1 4C13.4 8 11.7 5.1 9.2 3.5c.4 3.1-1.4 4.9-2.7 6.6C5.4 11.5 5 12.8 5 14.6 5 18.4 8.1 21 12 21z" />
  </svg>
);
export const Lock = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
);
export const Chevron = ({ color = "#8C8999" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none" }}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
);
export const InfoLink = () => (
  <Link to="/how-it-works" aria-label="How community mining works" className="ui-round" style={{ flex: "none" }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8v.01" />
    </svg>
  </Link>
);

/** "Pending" (dashed) / "Verified" / "Locked" status pill. */
export function Status({ kind }) {
  const s = {
    pending: { label: "Pending", border: "1px dashed rgba(169,166,182,.7)", color: "#A9A6B6", background: "transparent" },
    verified: { label: "Verified", border: 0, color: "#6EE7B7", background: "rgba(110,231,183,.12)" },
    locked: { label: "Locked", border: 0, color: "#C6B6FF", background: "rgba(139,109,255,.16)" },
    recorded: { label: "Recorded", border: 0, color: "#A9A6B6", background: "rgba(255,255,255,.06)" },
  }[kind] || { label: kind, border: 0, color: "#A9A6B6", background: "rgba(255,255,255,.06)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, boxSizing: "border-box", border: s.border, color: s.color, background: s.background, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}
