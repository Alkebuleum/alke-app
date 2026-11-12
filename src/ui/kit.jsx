import { Link } from "react-router-dom";
import "./ui.css";

export function Screen({ glow, children }) {
  return <div className={glow ? "ui-screen glow" : "ui-screen"}>{children}</div>;
}

/** Back button, "STEP n OF m", and the progress bar. */
export function StepHeader({ back, step, of = 3 }) {
  return (
    <>
      <div className="ui-top">
        {back ? (
          <Link to={back} className="ui-round" aria-label="Back">
            <Icon.Back />
          </Link>
        ) : (
          <span />
        )}
        <span className="ui-step">{step ? `Step ${step} of ${of}` : ""}</span>
        <span />
      </div>
      {step ? (
        <div className="ui-progress" aria-hidden="true">
          {Array.from({ length: of }, (_, i) => (
            <span key={i} className={i < step ? "on" : ""} />
          ))}
        </div>
      ) : (
        <div style={{ height: 24 }} />
      )}
    </>
  );
}

export function Button({ kind = "primary", busy, children, ...rest }) {
  return (
    <button type="button" className={`ui-btn ${kind}`} {...rest} disabled={!!(busy || rest.disabled)}>
      {busy ? <span className="ui-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Field({ id, label, optional, hint, error, children }) {
  return (
    <div className="ui-field">
      {label ? (
        <label htmlFor={id} className="ui-label">
          {label} {optional ? <small>· optional</small> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span className="ui-err" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="ui-hint">{hint}</span>
      ) : null}
    </div>
  );
}

export function Mark({ size = 18, color = "#8B6DFF" }) {
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 100 112" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" />
      <line x1="50" y1="27" x2="50" y2="85" />
      <path d="M20 45 L32 56 L20 67" />
      <path d="M30 45 L42 56 L30 67" />
      <path d="M80 45 L68 56 L80 67" />
      <path d="M70 45 L58 56 L70 67" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <Mark />
      <span style={{ fontFamily: "var(--display)", fontSize: 13, fontWeight: 600, letterSpacing: ".26em" }}>ΛLKE</span>
    </span>
  );
}

const svg = (d, extra = {}) =>
  function I() {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...extra}>
        {d}
      </svg>
    );
  };

export const Icon = {
  Back: svg(<path d="m14.5 6-6 6 6 6" />),
  Check: svg(<path d="m5 12.5 4.5 4.5L19 7.5" />, { width: 15, height: 15, strokeWidth: 2.2 }),
  Mail: svg(
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>,
  ),
  Eye: svg(
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>,
  ),
  EyeOff: svg(<path d="M3 3l18 18M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.3 4.1M6.4 6.4C3.9 8.1 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2" />),
  Google: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1S8.7 5.8 12 5.8c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 11.9s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
      <path fill="#4285F4" d="M21.2 12.1c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.4-1.1 2.5-2.3 3.3l3.6 2.8c2.1-2 3.4-4.9 3.4-8.4z" />
      <path fill="#FBBC05" d="M6.1 14.2a6 6 0 0 1 0-4.6L2.4 6.8a9.6 9.6 0 0 0 0 10.2l3.7-2.8z" />
      <path fill="#34A853" d="M12 21.5c2.6 0 4.8-.9 6.4-2.4l-3.6-2.8c-.9.6-2.1 1.1-2.8 1.1-2.6 0-4.8-1.7-5.6-4.1L2.7 16.1C4.3 19.3 7.9 21.5 12 21.5z" />
    </svg>
  ),
  Apple: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8 2.2-1.3 3.1-2.5c1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z" />
    </svg>
  ),
};

export function Loading({ label = "Opening your account…" }) {
  return (
    <Screen glow>
      <div className="ui-center">
        <Mark size={40} />
        <span style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 14 }}>
          <span className="ui-spin" aria-hidden="true" />
          {label}
        </span>
      </div>
    </Screen>
  );
}
