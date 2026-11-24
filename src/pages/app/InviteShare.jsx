import { useState } from "react";
import { copyText } from "../../lib/clipboard";
import { inviteLink } from "../../lib/member";
import { inviteMessage, openShare } from "../../lib/inviteShare";

/* The one invite block used everywhere (Home, Network, Drill): the link with
   Copy, a button per app (WhatsApp, Telegram, X, Facebook) and a preview of
   the message that goes out. The wording lives in src/lib/inviteShare.js. */

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

export function InviteShare({ nuruId, phase, preview: showPreview = true }) {
  const link = nuruId ? inviteLink(nuruId) : "";
  const shown = link.replace(/^https:\/\//, "");
  const share = { link, phase };
  const message = inviteMessage(share);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState(null);
  const [open, setOpen] = useState(false);

  const say = (t) => {
    setNote(t);
    setTimeout(() => setNote(null), 2600);
  };
  const copy = async () => {
    setCopied((await copyText(link)) ? "Copied" : "Hold to copy");
    setTimeout(() => setCopied(false), 1800);
  };
  const copyMessage = async () => say((await copyText(message)) ? "Message copied" : "Couldn't copy. Hold the text to copy it");
  const facebook = async () => {
    // Facebook takes only the link; copy the message so it can be pasted into the post.
    if (await copyText(message)) say("Message copied: paste it into your post");
    openShare("facebook", share);
  };
  const more = async () => {
    try {
      await navigator.share({ title: "Drill ALKE for free", text: message });
    } catch (e) {
      if (e?.name !== "AbortError") copyMessage();
    }
  };
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="ob-share-block">
      <div className="ob-invite ob-share-link">
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
        <p className="ob-share-note" role="status">
          {note}
        </p>
      ) : null}

      {showPreview ? (
        <div className="ob-share-msg">
          <button type="button" className="ob-share-msg-h" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            <span>See the message your friends get</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : undefined }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {open ? (
            <>
              <div className="ob-bubble-preview">
                {message.split(String.fromCharCode(10)).map((line, i) =>
                  link && line.endsWith(link) ? (
                    <p key={i}>
                      {line.slice(0, line.length - link.length)}
                      <u>{link}</u>
                    </p>
                  ) : (
                    <p key={i}>{line || String.fromCharCode(160)}</p>
                  ),
                )}
              </div>
              <div className="ob-share-msg-acts">
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
      ) : null}
    </div>
  );
}
