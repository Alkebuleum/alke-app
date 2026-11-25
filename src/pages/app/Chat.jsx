import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { NURU_CHAT_LINK, isMember, joinAlkers, previewOf, resolveAlkers, sendText, watchChat, watchMessages } from "../../lib/chat";
import { personLook } from "../../lib/games";
import { Button, Notice } from "../../ui/ob";
import { Ico } from "../../ui/shell";

/* The Alkers community chat (shared with Nuru): read and send text. */

const hhmm = (d) => d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
function dayLabel(d) {
  const k = (x) => x.toDateString();
  const now = new Date();
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (k(d) === k(now)) return "Today";
  if (k(d) === k(y)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export default function Chat({ demo }) {
  const { nuruId, displayName } = useAuth();
  const [ids, setIds] = useState(demo ? demo.ids : null); // { communityId, chatId, name }
  const [joined, setJoined] = useState(demo ? demo.joined : null); // null = checking
  const [chat, setChat] = useState(demo ? demo.chat : null);
  const [msgs, setMsgs] = useState(demo ? demo.msgs : undefined);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const scroller = useRef(null);
  const stick = useRef(true);

  // Find the Alkers chat and whether I'm in it.
  useEffect(() => {
    if (demo) return;
    let live = true;
    (async () => {
      try {
        const r = await resolveAlkers();
        if (!live) return;
        setIds(r);
        setJoined(await isMember(r.chatId, nuruId));
      } catch (e) {
        if (live) setError(e.message || "Couldn't open the community chat.");
      }
    })();
    return () => {
      live = false;
    };
  }, [nuruId, demo]);

  // Live messages once I'm in.
  useEffect(() => {
    if (demo || !ids || !joined) return;
    const offs = [
      watchMessages(ids.chatId, setMsgs, (e) => setError(e.message)),
      watchChat(ids.chatId, setChat, () => {}),
    ];
    return () => offs.forEach((off) => off());
  }, [ids, joined, demo]);

  // Keep the newest message in view, unless I've scrolled up to read.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [msgs]);
  const onScroll = () => {
    const el = scroller.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const join = async () => {
    setBusy(true);
    setError(null);
    try {
      await joinAlkers(ids, nuruId, displayName);
      setJoined(true);
    } catch (e) {
      setError(e.code === "permission-denied" ? "Couldn't join the chat. Try again in a moment." : e.message);
    } finally {
      setBusy(false);
    }
  };

  const send = async (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    setError(null);
    stick.current = true;
    try {
      await sendText(ids.chatId, nuruId, displayName, t);
      setText("");
    } catch (err) {
      setError(err.code === "permission-denied" ? "Your message couldn't be sent." : err.message);
    } finally {
      setBusy(false);
    }
  };

  const adminsOnly = chat?.settings?.adminsOnly === true;
  const members = chat?.memberCount;

  return (
    <div className="ob">
      <header className="ob-appbar sub" style={{ gridTemplateColumns: "44px minmax(0,1fr) 44px" }}>
        <Link to="/home" className="ob-icon-btn" aria-label="Back">
          <Ico.Back />
        </Link>
        <div style={{ textAlign: "center", minWidth: 0 }}>
          <h1 style={{ lineHeight: "22px" }}>{chat?.name || "Alkers"}</h1>
          <div className="ob-small" style={{ fontSize: 12, lineHeight: "16px" }}>
            {ids?.name || "Alké Network"}
            {members ? ` · ${members.toLocaleString()} members` : ""}
          </div>
        </div>
        <a href={NURU_CHAT_LINK} target="_blank" rel="noopener" className="ob-icon-btn" aria-label="Open in Nuru">
          <Ico.Link size={20} />
        </a>
      </header>

      <div className="ob-scroll ob-chat" ref={scroller} onScroll={onScroll}>
        {error ? (
          <div style={{ padding: "8px 16px" }}>
            <Notice kind="error">{error}</Notice>
          </div>
        ) : null}

        {joined === false ? (
          <div className="ob-content center" style={{ gap: 16 }}>
            <span className="ob-tile">
              <Ico.Users size={30} />
            </span>
            <div>
              <h2 className="ob-title" style={{ fontSize: 22 }}>
                Join the Alkers chat
              </h2>
              <p className="ob-sub">The Alké Network community, shared with the Nuru app. You'll appear as {displayName}.</p>
            </div>
            <Button busy={busy} onClick={join}>
              Join chat
            </Button>
            <p className="ob-small center">Follow the community guidelines. Never share your keys or recovery phrase.</p>
          </div>
        ) : !ids || joined === null || msgs === undefined ? (
          error ? null : <p className="ob-small center" style={{ padding: 24 }}>Loading…</p>
        ) : (
          <Messages msgs={msgs} me={nuruId} />
        )}
      </div>

      {joined ? (
        adminsOnly ? (
          <div className="ob-composer">
            <p className="ob-small center" style={{ flex: 1 }}>Only admins can post here right now.</p>
          </div>
        ) : (
          <form className="ob-composer" onSubmit={send}>
            <textarea
              rows={1}
              value={text}
              maxLength={4000}
              placeholder="Message Alkers"
              aria-label="Message"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(pointer: fine)").matches) send(e);
              }}
            />
            <button type="submit" className="ob-send" disabled={!text.trim() || busy} aria-label="Send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        )
      ) : null}
    </div>
  );
}

function Messages({ msgs, me }) {
  if (!msgs.length) {
    return <p className="ob-small center" style={{ padding: 24 }}>No messages yet. Say hi!</p>;
  }
  const out = [];
  let lastDay = "";
  let lastSender = "";
  msgs.forEach((m) => {
    const at = m.createdAt?.toDate?.() || new Date();
    const day = dayLabel(at);
    if (day !== lastDay) {
      out.push(
        <div key={`d${m.id}`} className="ob-chat-day">
          {day}
        </div>,
      );
      lastDay = day;
      lastSender = "";
    }
    const p = previewOf(m);
    if (p.kind === "system") {
      out.push(
        <div key={m.id} className="ob-chat-sys">
          {p.text}
        </div>,
      );
      lastSender = "";
      return;
    }
    const mine = m.senderAin === me;
    const first = m.senderAin !== lastSender;
    lastSender = m.senderAin;
    const look = personLook(m.senderName || "?");
    out.push(
      <div key={m.id} className={`ob-msg${mine ? " mine" : ""}${first ? " first" : ""}`}>
        {!mine ? (
          first ? (
            <span className="ob-avatar" style={{ width: 30, height: 30, fontSize: 11, background: look.grad }}>
              {look.ini}
            </span>
          ) : (
            <span style={{ width: 30, flex: "none" }} />
          )
        ) : null}
        <div className="ob-bubble">
          {!mine && first ? <div className="who">{m.senderName || "Alker"}</div> : null}
          <div className={p.kind === "text" ? "txt" : "txt dim"}>
            {p.text}
            {p.kind === "media" ? (
              <a href={NURU_CHAT_LINK} target="_blank" rel="noopener" className="open">
                Open in Nuru
              </a>
            ) : null}
          </div>
          <div className="at">{hhmm(at)}</div>
        </div>
      </div>,
    );
  });
  return <div className="ob-chat-list">{out}</div>;
}
