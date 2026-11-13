import { Link } from "react-router-dom";
import "./ob.css";

/* Onboarding kit. Every screen is <Page bar footer>content</Page>:
   the bar and footer stay put, the content scrolls between them. */

export function Page({ bar, footer, center, children }) {
  return (
    <div className="ob">
      {bar}
      <div className="ob-scroll">
        <div className={center ? "ob-content center" : "ob-content"}>{children}</div>
      </div>
      {footer ? <div className="ob-foot">{footer}</div> : null}
    </div>
  );
}

/** Back button · progress (or anything) · right slot. */
export function Bar({ back, onBack, step, of = 3, right, children }) {
  const backEl = back ? (
    <Link to={back} className="ob-icon-btn" aria-label="Back">
      <I.Back />
    </Link>
  ) : onBack ? (
    <button type="button" className="ob-icon-btn" aria-label="Back" onClick={onBack}>
      <I.Back />
    </button>
  ) : (
    <span />
  );
  return (
    <header className="ob-bar">
      {backEl}
      <div className="ob-bar-mid">
        {step ? (
          <div className="ob-progress" role="progressbar" aria-label={`Step ${step} of ${of}`} aria-valuemin={1} aria-valuemax={of} aria-valuenow={step}>
            {Array.from({ length: of }, (_, i) => (
              <span key={i} className={i < step ? "on" : ""} />
            ))}
          </div>
        ) : (
          children
        )}
      </div>
      {right || <span />}
    </header>
  );
}

export function Heading({ eyebrow, title, sub, xl, as: H = "h1" }) {
  return (
    <div>
      {eyebrow ? <p className="ob-eyebrow">{eyebrow}</p> : null}
      <H className={xl ? "ob-title xl" : "ob-title"}>{title}</H>
      {sub ? <p className="ob-sub">{sub}</p> : null}
    </div>
  );
}

export function Button({ kind = "primary", size, busy, icon, to, children, ...rest }) {
  const cls = `ob-btn ${kind}${size ? ` ${size}` : ""}${busy ? " busy" : ""}`;
  const inner = (
    <>
      {icon && !busy ? <span className="ob-btn-icon">{icon}</span> : null}
      {busy ? <span className="ob-spin" aria-hidden="true" /> : null}
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest} disabled={!!(busy || rest.disabled)} aria-busy={busy ? true : undefined}>
      {inner}
    </button>
  );
}

export function Field({ id, label, optional, help, error, ok, children }) {
  return (
    <div className="ob-field">
      {label ? (
        <label htmlFor={id} className="ob-label">
          {label}
          {optional ? <small> (optional)</small> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span className="ob-help bad" role="alert">
          {error}
        </span>
      ) : ok ? (
        <span className="ob-help ok">
          <I.Check size={15} />
          {ok}
        </span>
      ) : help ? (
        <span className="ob-help">{help}</span>
      ) : null}
    </div>
  );
}

export function Notice({ kind = "info", children, ...rest }) {
  const icon = kind === "error" ? <I.Alert /> : kind === "success" ? <I.Check size={18} /> : <I.Info />;
  return (
    <div className={`ob-notice ${kind}`} role={kind === "error" ? "alert" : "status"} {...rest}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

export function MarkPaths({ stroke = "#fff", width = 8 }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" />
      <line x1="50" y1="27" x2="50" y2="85" />
      <path d="M20 45 L32 56 L20 67" />
      <path d="M30 45 L42 56 L30 67" />
      <path d="M80 45 L68 56 L80 67" />
      <path d="M70 45 L58 56 L70 67" />
    </g>
  );
}

/** The app icon: the ALKÉ mark on a rounded tile. */
export function Logo({ size = 40 }) {
  const m = Math.round(size * 0.5);
  return (
    <span className="ob-logo" style={{ width: size, height: size, borderRadius: size * 0.28 }} aria-hidden="true">
      <svg width={m} height={m * 1.12} viewBox="0 0 100 112">
        <MarkPaths width={size > 60 ? 7 : 9} />
      </svg>
    </span>
  );
}

export function Wordmark({ size = 30 }) {
  return (
    <span className="ob-wordmark">
      <Logo size={size} />
      <span>
        ALKÉ <small>Network</small>
      </span>
    </span>
  );
}

const svg = (body, { size: dflt = 20, sw = 2, fill = "none" } = {}) =>
  function Icon({ size = dflt }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {body}
      </svg>
    );
  };

export const I = {
  Back: svg(<path d="m15 5-7 7 7 7" />, { size: 22 }),
  Check: svg(<path d="m5 12.5 4.5 4.5L19 7.5" />, { sw: 2.4 }),
  Chevron: svg(<path d="m6 9 6 6 6-6" />),
  Arrow: svg(<path d="M5 12h14M13 6l6 6-6 6" />, { size: 18 }),
  Info: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.6v.01" />
    </>,
    { size: 18, sw: 1.8 },
  ),
  Alert: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.4v.01" />
    </>,
    { size: 18, sw: 1.8 },
  ),
  Mail: svg(
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>,
    { size: 32, sw: 1.6 },
  ),
  Eye: svg(
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>,
  ),
  EyeOff: svg(<path d="M3 3l18 18M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.3 4.1M6.4 6.4C3.9 8.1 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2" />),
  Calendar: svg(
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>,
  ),
  Book: svg(<path d="M5 5a2 2 0 0 1 2-2h12v15H7a2 2 0 0 0-2 2zM5 20a2 2 0 0 0 2 2h12v-4" />),
  Shield: svg(
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>,
  ),
  Users: svg(
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 20c.7-3.5 3.3-5.5 6.5-5.5s5.8 2 6.5 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.8 2.6 2.6 3 5.2" />
    </>,
  ),
  Google: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  ),
  Apple: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8 2.2-1.3 3.1-2.5c1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z" />
    </svg>
  ),
};
