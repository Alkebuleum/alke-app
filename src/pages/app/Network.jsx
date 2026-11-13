import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { inviteLink } from "../../lib/member";
import { Button } from "../../ui/ob";
import { AppBar, AppPage, Ico, Row } from "../../ui/shell";

/* Community chat + your invite link. The invite code is your Nuru ID; who
   joined with it is recorded (invitedBy) and counted once the server side
   is in place. */
export default function Network() {
  const { nuruId } = useAuth();
  const [copied, setCopied] = useState(false);
  const link = nuruId ? inviteLink(nuruId) : "";
  const shown = link.replace(/^https:\/\//, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the link is still selectable */
    }
  };
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const share = async () => {
    try {
      await navigator.share({ title: "Join me on ALKÉ Network", text: "Join the Alké Network community with my invite:", url: link });
    } catch {
      /* cancelled */
    }
  };

  return (
    <AppPage tab="network" bar={<AppBar title="Network" />}>
      <ul className="ob-list">
        <li>
          <Row
            to="/chat"
            icon={<Ico.Users />}
            tone="green"
            title="Alkers community chat"
            sub="Shared with the Nuru app"
            end={
              <span className="ob-pill green">
                <span className="d" />
                Live
              </span>
            }
          />
        </li>
      </ul>

      <section className="ob-hero" aria-label="Invite friends">
        <div className="top">
          <span className="ob-tile" style={{ width: 48, height: 48, borderRadius: 14 }}>
            <Ico.Link size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="big" style={{ fontSize: 18 }}>
              Invite friends
            </div>
            <div className="lbl">Each verified invite warms 10 of your cold ALKE a day</div>
          </div>
        </div>

        <div className="ob-invite">
          <span className="num" title={link}>
            {shown}
          </span>
          <button type="button" className="ob-invite-copy" onClick={copy} aria-label="Copy invite link">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {canShare ? (
            <Button size="sm" onClick={share} style={{ flex: 1 }}>
              Share invite
            </Button>
          ) : null}
          <span className="ob-small" style={{ flex: canShare ? "none" : 1 }}>
            Your code: <b className="num" style={{ color: "var(--text)" }}>{nuruId}</b>
          </span>
        </div>
      </section>

      <ul className="ob-list">
        <li>
          <Row to="/how-to-redeem" icon={<Ico.Doc />} title="How to redeem ALKE" sub="Mining, warming and converting, step by step" />
        </li>
      </ul>
    </AppPage>
  );
}
