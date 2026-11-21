import { Link } from "react-router-dom";
import { I } from "./ob";
import "./onb.css";

/* The onboarding card (six steps). Every step is
   <Onb step label title sub footer>fields</Onb>: top bar, then one card with
   the progress, the step's heading and content, and its pinned action. */

export const STEPS = 6;

export function Mark({ size = 18, color = "#8B6DFF", width = 7 }) {
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 100 112" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" />
      <line x1="50" y1="27" x2="50" y2="85" />
      <path d="M20 45 L32 56 L20 67" />
      <path d="M30 45 L42 56 L30 67" />
      <path d="M80 45 L68 56 L80 67" />
      <path d="M70 45 L58 56 L70 67" />
    </svg>
  );
}

export function Lockup() {
  return (
    <span className="onb-lockup">
      <Mark />
      ALKÉ NETWORK
    </span>
  );
}

/** The violet orb with the mark (splash, welcome, first session). */
export function Orb({ size = 176, ring = true }) {
  const inset = Math.round(size * 0.16);
  return (
    <span className="onb-orb" aria-hidden="true" style={{ width: size, height: size }}>
      <span className="halo" />
      {ring ? <span className="ring" /> : null}
      <span className="core" style={{ inset }}>
        <Mark size={Math.round(size * 0.37)} color="#FFFFFF" width={6} />
      </span>
    </span>
  );
}

function Back({ back, onBack }) {
  if (back) {
    return (
      <Link to={back} className="onb-back" aria-label="Back">
        <I.Back size={20} />
      </Link>
    );
  }
  if (onBack) {
    return (
      <button type="button" className="onb-back" aria-label="Back" onClick={onBack}>
        <I.Back size={20} />
      </button>
    );
  }
  return <span />;
}

export function Onb({ back, onBack, step, label, title, sub, footer, children, onSubmit }) {
  const Body = onSubmit ? "form" : "div";
  return (
    <div className="onb">
      <div className="onb-top">
        <Back back={back} onBack={onBack} />
        <Lockup />
        <span />
      </div>
      <Body className="onb-card" onSubmit={onSubmit} noValidate={onSubmit ? true : undefined}>
        <div className="onb-body">
          {step ? (
            <>
              <div className="onb-progress" role="progressbar" aria-label={`Step ${step} of ${STEPS}`} aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step}>
                {Array.from({ length: STEPS }, (_, i) => (
                  <span key={i} className={i + 1 < step ? "done" : i + 1 === step ? "now" : ""} />
                ))}
              </div>
              <span className="onb-label">
                Step {step} of {STEPS}
                {label ? ` · ${label}` : ""}
              </span>
            </>
          ) : label ? (
            <span className="onb-label">{label}</span>
          ) : null}
          {title ? <h1 className="onb-title">{title}</h1> : null}
          {sub ? <p className="onb-sub">{sub}</p> : null}
          {children}
        </div>
        {footer ? <div className="onb-foot">{footer}</div> : null}
      </Body>
    </div>
  );
}

/** The main action: gold, full width. A link with `to`, else a button. */
export function Gold({ to, busy, arrow = true, children, ...rest }) {
  const inner = (
    <>
      {busy ? <span className="onb-spin" aria-hidden="true" /> : null}
      {children}
      {arrow && !busy ? <I.Arrow /> : null}
    </>
  );
  if (to) {
    return (
      <Link to={to} className="onb-btn gold" {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className="onb-btn gold" {...rest} disabled={!!(busy || rest.disabled)} aria-busy={busy ? true : undefined}>
      {inner}
    </button>
  );
}

export function TextBtn({ to, lilac, children, ...rest }) {
  const cls = lilac ? "onb-text-btn lilac" : "onb-text-btn";
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Field({ id, label, error, help, children }) {
  return (
    <div className="onb-field">
      {label ? <label htmlFor={id}>{label}</label> : null}
      {children}
      {error ? (
        <p className="onb-err" role="alert">
          {error}
        </p>
      ) : help ? (
        <p className="onb-note">{help}</p>
      ) : null}
    </div>
  );
}

export function Problem({ children }) {
  return children ? (
    <p className="onb-err" role="alert">
      {children}
    </p>
  ) : null;
}

/** "Invited by …" (a name once known, else just that there is an invite). */
export function Invited({ name, initials }) {
  return (
    <div className="onb-invited">
      <span className="onb-avatar" aria-hidden="true">
        {initials || "✓"}
      </span>
      <span>
        <small>{name ? "Invited by" : "Invite"}</small>
        <b>{name || "Your invite is saved"}</b>
      </span>
      <span style={{ color: "#6EE7B7", display: "flex" }}>
        <I.Check size={18} />
      </span>
    </div>
  );
}

export function Switch({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on ? "true" : "false"} aria-label={label} className="onb-switch" onClick={() => onChange(!on)}>
      <span aria-hidden="true">
        <span />
      </span>
    </button>
  );
}
