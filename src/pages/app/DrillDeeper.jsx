import { forwardRef, useEffect, useRef, useState } from "react";
import { copyText } from "../../lib/clipboard";
import { inviteLink } from "../../lib/member";
import { inviteMessage, openShare } from "../../lib/inviteShare";
import { RIG, rigDepth, rigName } from "./drillScene";

/* Below the fold on Drill: grow your rig by inviting friends. Every
   RIG.perLevel active Alkers you invite (server-counted) add a rig level,
   and each level drills deeper every drill. It slides in once scrolled to. */

const m = (n) => `${Math.round(n).toLocaleString("en-US")} m`;

const Glyph = {
  whatsapp: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.6a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.7-1.2A9.4 9.4 0 1 0 12 2.6z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M8.7 7.4c.2-.4.5-.4.8-.4h.6c.2 0 .4.1.5.4l.8 1.9c.1.3 0 .5-.1.7l-.6.7c-.1.2-.1.4 0 .5.5.9 1.4 1.9 2.6 2.5.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.7-.1l1.8.9c.3.1.4.3.4.5 0 .5-.2 1.3-.9 1.8-.7.5-1.6.6-2.5.3-1.6-.5-3.6-1.7-5-3.6-1-1.4-1.5-2.7-1.4-3.7 0-.6.3-1.1.6-1.4z" fill="currentColor" />
    </svg>
  ),
  telegram: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.2 3.6 2.9 10.7c-1 .4-.9 1.7.1 2l4.6 1.4 1.8 5.6c.2.7 1.1.9 1.6.4l2.6-2.5 4.8 3.5c.6.5 1.5.1 1.7-.6l3.1-15.3c.2-1-.7-1.9-1.8-1.6zM9.8 14.4l-.4 3.8-1.3-4.3 9.5-6.2z" fill="currentColor" />
    </svg>
  ),
  x: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.8 2.8h3.3l-7.2 8.2 8.5 10.2h-6.6l-5.2-6.3-5.9 6.3H1.4l7.7-8.7L1 2.8h6.8l4.7 5.7zm-1.2 16.5h1.8L7.5 4.6H5.6z" fill="currentColor" />
    </svg>
  ),
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 8.4V6.7c0-.8.5-1 .9-1H17V2.1h-2.9C11 2.1 10 4.4 10 6.4v2H8v3.7h2V22h4v-9.9h2.7l.4-3.7z" fill="currentColor" />
    </svg>
  ),
};

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

export const DrillDeeper = forwardRef(function DrillDeeper({ nuruId, level, active, joined, phase }, outer) {
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
  const [note, setNote] = useState(null);
  const [preview, setPreview] = useState(false);
  const share = { link, phase };
  const message = inviteMessage(share);
  const say = (t) => {
    setNote(t);
    setTimeout(() => setNote(null), 2600);
  };
  const copyMessage = async () => say((await copyText(message)) ? "Message copied" : "Couldn't copy. Hold the text to copy it");
  const facebook = async () => {
    // Facebook takes only the link; copy the message so it can be pasted into the post.
    if (await copyText(message)) say("Message copied: paste it into your post");
    openShare("facebook", share);
  };
  const more = async () => {
    try {
      await navigator.share({ title: "Drill ALKE with me", text: message });
    } catch (e) {
      if (e?.name !== "AbortError") copyMessage();
    }
  };
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

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

      <div className="ob-deeper-now">
        <Lvl n={level} size={40} />
        <span className="tx">
          <b>
            {rigName(level)} · {m(rigDepth(level))} per drill
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

      <div className="ob-invite ob-deeper-link">
        <span className="num">{shown}</span>
        <button type="button" className="ob-invite-copy" onClick={copy} aria-label="Copy invite link">
          {copied || "Copy link"}
        </button>
      </div>
      <div className="ob-share">
        <button type="button" className="ob-share-btn wa" onClick={() => openShare("whatsapp", share)}>
          {Glyph.whatsapp}
          WhatsApp
        </button>
        <button type="button" className="ob-share-btn tg" onClick={() => openShare("telegram", share)}>
          {Glyph.telegram}
          Telegram
        </button>
        <button type="button" className="ob-share-btn x" onClick={() => openShare("x", share)} aria-label="Share on X">
          {Glyph.x}
        </button>
        <button type="button" className="ob-share-btn fb" onClick={facebook}>
          {Glyph.facebook}
          Facebook
        </button>
      </div>
      {note ? (
        <p className="ob-deeper-note" role="status">
          {note}
        </p>
      ) : null}

      <div className="ob-deeper-msg">
        <button type="button" className="ob-deeper-msg-h" onClick={() => setPreview((v) => !v)} aria-expanded={preview}>
          <span>See the message your friends get</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: preview ? "rotate(180deg)" : undefined }}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {preview ? (
          <>
            <div className="ob-bubble-preview">
              {message.split("\n").map((line, i) =>
                link && line.endsWith(link) ? (
                  <p key={i}>
                    {line.slice(0, line.length - link.length)}
                    <u>{link}</u>
                  </p>
                ) : (
                  <p key={i}>{line || "\u00a0"}</p>
                ),
              )}
            </div>
            <div className="ob-deeper-msg-acts">
              <button type="button" className="ob-textlink accent" onClick={copyMessage}>
                Copy message
              </button>
              {canShare ? (
                <button type="button" className="ob-textlink accent" onClick={more}>
                  More apps
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

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
            <span className="out num">{m(rigDepth(l))}</span>
          </li>
        ))}
      </ol>

      <ul className="ob-deeper-rules">
        <li>A friend counts as active once they've completed 3 drills.</li>
        <li>Each active invite also warms 1% of your cold ALKE a day.</li>
        <li>Inviting is optional: a starter rig drills every day.</li>
      </ul>
    </section>
  );
});
