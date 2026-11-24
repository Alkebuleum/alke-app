import { forwardRef, useEffect, useRef, useState } from "react";
import { copyText } from "../../lib/clipboard";
import { inviteLink } from "../../lib/member";
import { Button } from "../../ui/ob";
import { RIG, rigDepth, rigName } from "./drillScene";

/* Below the fold on Drill: grow your rig by inviting friends. Every
   RIG.perLevel active Alkers you invite (server-counted) add a rig level,
   and each level drills deeper every drill. It slides in once scrolled to. */

const m = (n) => `${Math.round(n).toLocaleString("en-US")} m`;

/** The level hex: lilac outline at Level 0, gold from Level 1. */
export function Lvl({ n, size = 34 }) {
  return (
    <span className="ob-lvl" data-l={n} style={{ width: size, height: Math.round(size * 1.12) }} aria-hidden="true">
      <svg viewBox="0 0 34 38">
        <path d="M17 1.5 32 10v18L17 36.5 2 28V10z" />
      </svg>
      <b style={{ fontSize: Math.round(size * 0.44) }}>{n}</b>
    </span>
  );
}

export const DrillDeeper = forwardRef(function DrillDeeper({ nuruId, level, active, joined }, outer) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  const [copied, setCopied] = useState(false);
  const link = nuruId ? inviteLink(nuruId) : "";
  const shown = link.replace(/^https:\/\//, "");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const copy = async () => {
    setCopied((await copyText(link)) ? "Copied" : "Hold to copy");
    setTimeout(() => setCopied(false), 1800);
  };
  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: "Drill ALKE with me", text: "Join me on ALKE and help my rig drill deeper:", url: link });
    } catch (e) {
      if (e?.name !== "AbortError") copy();
    }
  };

  const top = level >= RIG.max;
  const need = (l) => l * RIG.perLevel;
  const toNext = top ? 0 : need(level + 1) - active;
  const prog = top ? 1 : (active - need(level)) / RIG.perLevel;

  return (
    <section
      ref={(el) => {
        ref.current = el;
        if (typeof outer === "function") outer(el);
        else if (outer) outer.current = el;
      }}
      className={`ob-deeper${seen ? " in" : ""}`}
      aria-labelledby="deeperTitle"
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="obLvlGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFDB8E" />
            <stop offset=".52" stopColor="#F7C15C" />
            <stop offset="1" stopColor="#EBA33B" />
          </linearGradient>
        </defs>
      </svg>
      <span className="ob-eyebrow">Drill deeper</span>
      <h2 id="deeperTitle" className="ob-deeper-title">
        Grow your rig with friends
      </h2>
      <p className="ob-deeper-sub">
        Every <b>{RIG.perLevel} active Alkers</b> you invite adds a rig level. Each level drills <b>{m(rigDepth(1) - rigDepth(0))} deeper</b> every drill.
      </p>

      <div className="ob-deeper-now" style={{ "--p": `${Math.round(prog * 100)}%` }}>
        <Lvl n={level} size={40} />
        <span className="tx">
          <b>
            {rigName(level)} · {m(rigDepth(level))} per drill
          </b>
          <small>{top ? "Top level reached. Your rig drills as deep as it goes." : `${toNext} more active Alker${toNext === 1 ? "" : "s"} to Level ${level + 1}`}</small>
        </span>
      </div>

      <ol className="ob-deeper-ladder">
        {Array.from({ length: RIG.max + 1 }, (_, l) => (
          <li key={l} className={l === level ? "cur" : l < level ? "got" : undefined}>
            <Lvl n={l} size={26} />
            <span>
              {rigName(l)}
              <small>{l ? `${need(l)} active Alkers` : "Everyone starts here"}</small>
            </span>
            <span className="out num">{m(rigDepth(l))}</span>
          </li>
        ))}
      </ol>

      <div className="ob-deeper-invite">
        <span className="lbl">Your invite link</span>
        <div className="ob-invite">
          <span className="num">{shown}</span>
          <button type="button" className="ob-invite-copy" onClick={copy} aria-label="Copy invite link">
            {copied || "Copy"}
          </button>
        </div>
      </div>
      <Button onClick={share}>Invite friends</Button>
      <p className="ob-deeper-stats num">
        <span>
          <b>{joined}</b> joined
        </span>
        <span>
          <b>{active}</b> active
        </span>
      </p>

      <ul className="ob-deeper-rules">
        <li>A friend counts as active once they've completed 3 drills.</li>
        <li>Each active invite also warms 1% of your cold ALKE a day.</li>
        <li>Inviting is optional: a starter rig drills every day.</li>
      </ul>
    </section>
  );
});
