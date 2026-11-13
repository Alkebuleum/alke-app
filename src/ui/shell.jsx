import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MarkPaths } from "./ob";
import "./ob.css";

/* Member app shell: app bar · scrolling content · tab bar.
   Shares the onboarding tokens (ob.css). */

export function AppPage({ tab, bar, children }) {
  return (
    <div className="ob">
      {bar}
      <div className="ob-scroll">
        <div className="ob-content app">{children}</div>
      </div>
      <TabBar active={tab} />
    </div>
  );
}

/** Top-level screen title with optional action buttons. */
export function AppBar({ title, children }) {
  return (
    <header className="ob-appbar">
      <h1>{title}</h1>
      {children ? <div className="acts">{children}</div> : null}
    </header>
  );
}

/** Pushed screen: back · centred title · optional action. */
export function SubBar({ title, back, right }) {
  return (
    <header className="ob-appbar sub">
      <Link to={back} className="ob-icon-btn" aria-label="Back">
        <Ico.Back />
      </Link>
      <h1>{title}</h1>
      {right || <span />}
    </header>
  );
}

export function IconLink({ to, label, children, badge }) {
  return (
    <Link to={to} className={badge ? "ob-icon-btn ob-dot-badge" : "ob-icon-btn"} aria-label={label}>
      {children}
    </Link>
  );
}

const TABS = [
  ["home", "/home", "Home"],
  ["games", "/games", "Games"],
  ["mine", "/mine", "Mine"],
  ["network", "/network", "Network"],
  ["profile", "/profile", "Profile"],
];

export function TabBar({ active }) {
  return (
    <nav className="ob-tabs" aria-label="Main">
      {TABS.map(([id, to, label]) => {
        if (id === "mine") {
          return (
            <Link key={id} to={to} className="ob-tab ob-tab-mine" aria-current={active === id ? "page" : undefined}>
              <span className="hex" aria-hidden="true">
                <svg viewBox="0 0 100 112" width="40" height="45">
                  <defs>
                    <linearGradient id="tabMine" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#8D70FF" />
                      <stop offset="1" stopColor="#6141F0" />
                    </linearGradient>
                  </defs>
                  <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="url(#tabMine)" stroke="rgba(255,255,255,.22)" strokeWidth="3" strokeLinejoin="round" />
                  <g transform="translate(50 56) scale(.5) translate(-50 -56)">
                    <MarkPaths stroke="#fff" width={9} />
                  </g>
                </svg>
              </span>
              {label}
            </Link>
          );
        }
        const I = TabIcons[id];
        return (
          <Link key={id} to={to} className="ob-tab" aria-current={active === id ? "page" : undefined}>
            <span className="ic">
              <I />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Section({ title, action, children }) {
  return (
    <section className="ob-sec" aria-label={typeof title === "string" ? title : undefined}>
      {title ? (
        <div className="ob-sec-h">
          <h2>{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Stat({ label, value, unit, icon, to }) {
  const inner = (
    <>
      <span className="l">
        {icon}
        {label}
      </span>
      <span className="v">
        {value}
        {unit ? <small>{unit}</small> : null}
      </span>
    </>
  );
  return to ? (
    <Link to={to} className="ob-stat">
      {inner}
    </Link>
  ) : (
    <div className="ob-stat">{inner}</div>
  );
}

/** A list row. Pass `to` for a link, `onClick` for a button, neither for static. */
export function Row({ to, onClick, icon, tone, title, sub, end, chevron = !!to, ...rest }) {
  const body = (
    <>
      {icon ? <span className={tone ? `ic ${tone}` : "ic"}>{icon}</span> : null}
      <span className="tx">
        <b>{title}</b>
        {sub ? <span>{sub}</span> : null}
      </span>
      {end != null ? <span className="end">{end}</span> : null}
      {chevron ? (
        <span className="chev">
          <Ico.Chevron />
        </span>
      ) : null}
    </>
  );
  if (to)
    return (
      <Link to={to} className="ob-row" {...rest}>
        {body}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" className="ob-row" onClick={onClick} {...rest}>
        {body}
      </button>
    );
  return (
    <div className="ob-row static" {...rest}>
      {body}
    </div>
  );
}

/** Session ring: progress arc + the ALKÉ mark (or children) in the middle. */
export function Ring({ size = 64, fraction = 0, stroke = 5, active, children }) {
  const r = 50 - stroke / 2 - 1;
  const c = 2 * Math.PI * r;
  return (
    <span className="ob-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
        {fraction > 0 ? (
          <circle cx="50" cy="50" r={r} fill="none" stroke="#7C5CFF" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(fraction * c).toFixed(2)} ${c.toFixed(2)}`} transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray .6s ease" }} />
        ) : null}
      </svg>
      <span className="mid">
        {children || (
          <svg viewBox="0 0 100 112" aria-hidden="true" style={{ width: "36%", height: "auto" }}>
            <MarkPaths stroke={active ? "#B4A2FF" : "#71717A"} width={7} />
          </svg>
        )}
      </span>
    </span>
  );
}

export function Avatar({ size = 40, color, initials }) {
  return (
    <span className="ob-avatar" style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.36) }}>
      {initials}
    </span>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

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

/* ── Icons (24px grid, 1.8 stroke) ─────────────────────────────────────── */

const icon = (body, dflt = 20, sw = 1.8) =>
  function Icon({ size = dflt }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {body}
      </svg>
    );
  };

export const Ico = {
  Back: icon(<path d="m15 5-7 7 7 7" />, 22, 2),
  Chevron: icon(<path d="m9.5 6 6 6-6 6" />, 18, 2),
  Bell: icon(<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" />, 22),
  Gear: icon(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>,
    22,
  ),
  Info: icon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.6v.01" />
    </>,
    22,
  ),
  Flame: icon(<path d="M12 21c3.9 0 7-2.6 7-6.4 0-3.3-2.2-5.4-3.9-7.2.1 2.1-.9 3.5-2.1 4C13.4 8 11.7 5.1 9.2 3.5c.4 3.1-1.4 4.9-2.7 6.6C5.4 11.5 5 12.8 5 14.6 5 18.4 8.1 21 12 21z" />, 16),
  Lock: icon(
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>,
    16,
    2,
  ),
  Clock: icon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
    18,
  ),
  Hex: icon(<path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z" />, 18),
  Bolt: icon(<path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12z" />, 18),
  Trophy: icon(<path d="M7 4h10v4a5 5 0 0 1-10 0zM7 6H4.5a2.5 2.5 0 0 0 2.6 3.4M17 6h2.5a2.5 2.5 0 0 1-2.6 3.4M12 13v4M8.5 20.5h7M9.5 17h5v3.5h-5z" />, 18),
  History: icon(<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 4v4h4M12 8v4l3 2" />, 18),
  Wallet: icon(
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
      <rect x="4" y="8" width="16.5" height="11" rx="2.5" />
      <path d="M16 13.5h.01" />
    </>,
    18,
  ),
  Users: icon(
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 20c.7-3.5 3.3-5.5 6.5-5.5s5.8 2 6.5 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.8 2.6 2.6 3 5.2" />
    </>,
    18,
  ),
  Link: icon(<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />, 18),
  Shield: icon(<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6zM9 12l2.2 2.2L15.5 10" />, 18),
  Mail: icon(
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>,
    18,
  ),
  Doc: icon(<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4" />, 18),
  LogOut: icon(<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />, 18),
  Star: icon(<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />, 18),
  Check: icon(<path d="m5 12.5 4.5 4.5L19 7.5" />, 14, 2.6),
  Play: icon(<path d="M7 4.5v15l12-7.5z" />, 16, 2),
};

const TabIcons = {
  home: icon(<path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z" />, 22),
  mine: () => (
    <svg width="20" height="22" viewBox="0 0 100 112" aria-hidden="true">
      <MarkPaths stroke="currentColor" width={8} />
    </svg>
  ),
  games: icon(<path d="M6.7 5.5h10.6a3.9 3.9 0 0 1 3.9 3.5l.7 6.4a2.9 2.9 0 0 1-5 2.3l-1.6-1.8a2 2 0 0 0-1.5-.7h-3.6a2 2 0 0 0-1.5.7l-1.6 1.8a2.9 2.9 0 0 1-5-2.3l.7-6.4a3.9 3.9 0 0 1 3.9-3.5zM8 9.2v3.6M6.2 11h3.6M15.5 10.5v.01M17.5 12.5v.01" />, 22),
  network: () => <Ico.Users size={22} />,
  profile: icon(
    <>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 20.5c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" />
    </>,
    22,
  ),
};
