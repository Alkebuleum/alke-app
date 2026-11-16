import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { useAuth } from "../../auth/AuthProvider";
import { approxAlke, shortC } from "../../lib/genesis";
import { inviteLink } from "../../lib/member";
import { Button } from "../../ui/ob";
import { Ico, clock } from "../../ui/shell";
import { Burst, Core, Counter, buzz, useMilestones, useMining, usePortal, Treasure } from "./mining";

/* Stream mode: a full-screen mining view for going live on social. Real
   figures only (today's estimate is labelled as one), plus the member's
   invite as a QR code so viewers can join. Keeps the screen awake. */
export default function Live() {
  const { nuruId, displayName } = useAuth();
  const m = useMining();
  const [qr, setQr] = useState("");
  const [burst, setBurst] = useState(0);
  const [toast, setToast] = useState(null);
  const link = nuruId ? inviteLink(nuruId) : "";

  useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(link, { margin: 1, width: 240, color: { dark: "#0A0A0F", light: "#FFFFFF" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [link]);

  // Keep the screen on while streaming.
  useEffect(() => {
    let lock = null;
    const get = async () => {
      try {
        lock = await navigator.wakeLock?.request("screen");
      } catch {
        /* not supported or refused */
      }
    };
    get();
    const again = () => document.visibilityState === "visible" && get();
    document.addEventListener("visibilitychange", again);
    return () => {
      document.removeEventListener("visibilitychange", again);
      lock?.release?.().catch(() => {});
    };
  }, []);

  const onMilestone = useCallback((v) => {
    setBurst(Date.now());
    setToast(`${shortC(v)} cALKE today`);
    setTimeout(() => setToast(null), 2400);
    buzz([20, 40, 20]);
  }, []);
  useMilestones(m.todayC, onMilestone);

  const portal = usePortal(m);

  return (
    <div className="ob ob-live">
      <header className="ob-live-top">
        <Link to="/mine" className="ob-icon-btn" aria-label="Close stream mode">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Link>
        <span className="ob-onair">
          <i />
          {m.running ? "Mining live" : "Not mining"}
        </span>
        <span style={{ width: 44 }} />
      </header>

      <div className="ob-live-who">
        <b>{displayName}</b>
        <span>
          Phase {m.phase.n} · {m.phase.name}
          {m.boost > 1 ? ` · ×${m.boost.toFixed(2)} streak boost` : ""}
          {m.tapCount ? ` · ×${m.tapMult.toFixed(1)} tap boost` : ""}
          {m.streak ? ` · ${m.streak}-day streak` : ""}
        </span>
      </div>

      <div className="ob-live-core">
        <Core fraction={m.fraction} running={m.running} size="min(300px, 40cqh, 78cqw)" onPortal={portal.open} locked={!!portal.treasure} />
        <Burst k={burst} />
        {toast ? <span className="ob-toast">{toast}</span> : null}
      </div>

      <div className="ob-live-count">
        {m.running ? (
          <>
            <span className="lbl">Today's estimate{m.hasLive ? "" : " (up to)"}</span>
            <span className="plus">
              <span>+</span>
              <Counter value={m.todayC} size={52} />
            </span>
            <span className="sub">
              cALKE · {approxAlke(m.todayC)} · {clock(m.remaining)} left
            </span>
          </>
        ) : (
          <>
            <span className="lbl">Cold balance</span>
            <Counter value={m.balanceC} size={52} decimals={false} />
            <span className="sub">cALKE · {approxAlke(m.balanceC)}</span>
            <Button size="sm" to="/mine" style={{ marginTop: 8 }}>
              Start a session first
            </Button>
          </>
        )}
      </div>

      <div className="ob-live-join">
        {qr ? <img src={qr} alt={`QR code for ${link}`} width="96" height="96" /> : null}
        <div>
          <b>Join me on ALKE</b>
          <span className="num">{link.replace("https://", "")}</span>
          <small>Scan to sign up with my invite</small>
        </div>
      </div>
      <Treasure treasure={portal.treasure} onDone={portal.close} />
    </div>
  );
}
