import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { InviteShare } from "./InviteShare";
import { RIG, rigBoost, rigDepth, rigName } from "./drillScene";

/* Below the fold on Drill: grow your rig by inviting friends. Every
   RIG.perLevel active Alkers you invite (server-counted) add a rig level,
   and each level drills deeper every drill. It slides in once scrolled to. */

const m = (n) => `${Math.round(n).toLocaleString("en-US")} m`;

/** The level hex: lilac outline at Level 0, gold from Level 1. */
export function Lvl({ n, size = 34 }) {
  const gid = useId().replace(/:/g, "");
  return (
    <span className="ob-lvl" data-l={n} style={{ width: size, height: Math.round(size * 1.12) }} aria-hidden="true">
      <svg viewBox="0 0 34 38">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFDB8E" />
            <stop offset=".52" stopColor="#F7C15C" />
            <stop offset="1" stopColor="#EBA33B" />
          </linearGradient>
        </defs>
        <path d="M17 1.5 32 10v18L17 36.5 2 28V10z" fill={n ? `url(#${gid})` : undefined} />
      </svg>
      <b style={{ fontSize: Math.round(size * 0.44) }}>{n}</b>
    </span>
  );
}

export const DrillDeeper = forwardRef(function DrillDeeper({ nuruId, level, active, joined, phase }, outer) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const top = level >= RIG.max;
  const need = (l) => l * RIG.perLevel;
  const toNext = top ? 0 : need(level + 1) - active;
  const inLevel = top ? RIG.perLevel : Math.max(0, active - need(level));

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
      <span className="ob-eyebrow">Drill deeper</span>
      <h2 id="deeperTitle" className="ob-deeper-title">
        Grow your rig with friends
      </h2>
      <p className="ob-deeper-sub">
        Every <b>{RIG.perLevel} active Alkers</b> you invite adds a rig level. Each level drills <b>{m(rigDepth(1) - rigDepth(0))} deeper</b> and adds <b>+{Math.round(RIG.step * 100)}% to your daily ALKE share</b>, up to ×{rigBoost(RIG.max)}.
      </p>

      <div className="ob-deeper-now">
        <Lvl n={level} size={40} />
        <span className="tx">
          <b>
            {rigName(level)} · ×{rigBoost(level).toFixed(2)} ALKE · {m(rigDepth(level))}
          </b>
          <small>{top ? "Top level reached. Your rig drills as deep as it goes." : `${toNext} more active Alker${toNext === 1 ? "" : "s"} to Level ${level + 1} (${m(rigDepth(level + 1))})`}</small>
        </span>
      </div>
      <div className="ob-deeper-prog" aria-label={`${inLevel} of ${RIG.perLevel} active Alkers to the next level`}>
        <span className="num">
          <b>
            {inLevel}/{RIG.perLevel}
          </b>{" "}
          active to {top ? "the top" : `Level ${level + 1}`}
        </span>
        <span className="segs" aria-hidden="true">
          {Array.from({ length: RIG.perLevel }, (_, i) => (
            <i key={i} className={i < inLevel ? "on" : undefined} />
          ))}
        </span>
      </div>

      <InviteShare nuruId={nuruId} phase={phase} />

      <p className="ob-deeper-stats num">
        <span>
          <b>{joined}</b> joined
        </span>
        <span>
          <b>{active}</b> active
        </span>
      </p>

      <ol className="ob-deeper-ladder">
        {Array.from({ length: RIG.max + 1 }, (_, l) => (
          <li key={l} className={l === level ? "cur" : l < level ? "got" : undefined}>
            <Lvl n={l} size={26} />
            <span>
              {rigName(l)}
              <small>{l ? `${need(l)} active Alkers` : "Everyone starts here"}</small>
            </span>
            <span className="out num">
              ×{rigBoost(l).toFixed(2)}
              <small>{m(rigDepth(l))}</small>
            </span>
          </li>
        ))}
      </ol>

      <ul className="ob-deeper-rules">
        <li>A friend counts as active once they've completed 3 drills.</li>
        <li>Each active invite also warms 1% of your cold ALKE a day.</li>
        <li>The rig boost is a bigger share of the same daily pool, like a streak. Inviting is optional: a starter rig drills every day.</li>
      </ul>
    </section>
  );
});
