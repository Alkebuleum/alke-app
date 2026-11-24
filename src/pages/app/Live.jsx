import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { useAuth } from "../../auth/AuthProvider";
import { fmtAlke, toAlke } from "../../lib/genesis";
import { inviteLink } from "../../lib/member";
import { Button } from "../../ui/ob";
import { Ico, clock } from "../../ui/shell";
import { Burst, DrillScene, RollingNumber, Vein, buzz, useDrilling, useMilestones, useVein } from "./drilling";

/* Stream mode: a full-screen drilling view for going live on social. Real
   figures only (today's estimate is labelled as one), plus the member's
   invite as a QR code so viewers can join. Keeps the screen awake. */
export default function Live() {
  const { nuruId, displayName } = useAuth();
  const m = useDrilling();
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
    setToast(`+${fmtAlke(toAlke(v), 1)} ALKE today`);
    setTimeout(() => setToast(null), 2400);
    buzz([20, 40, 20]);
  }, []);
  useMilestones(m.todayC, onMilestone);

  const vein = useVein(m);

  return (
    <div className="ob ob-live">
      <header className="ob-live-top">
        <Link to="/drill" className="ob-icon-btn" aria-label="Close stream mode">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Link>
        <span className="ob-onair">
          <i />
          {m.running ? "Drilling live" : "Not drilling"}
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
        <DrillScene
          depth={m.depth}
          sessionDepth={m.sessionDepth}
          sessionTarget={m.sessionTarget}
          fraction={m.fraction}
          level={m.level}
          running={m.running}
          onVein={vein.strike}
          locked={!!vein.vein}
          flare={burst}
          veinKey={vein.vein && !vein.vein.empty ? vein.vein.k : 0}
          height="min(360px, 44dvh)"
        />
        <Burst k={burst} />
        {toast ? <span className="ob-toast">{toast}</span> : null}
      </div>

      <div className="ob-live-count">
        <span className="lbl">ALKE Rewards · provisional</span>
        <RollingNumber value={m.rewardsAlke} size={44} label={`ALKE Rewards: ${fmtAlke(m.rewardsAlke)} ALKE`} />
        {m.running ? (
          <span className="sub">
            +{fmtAlke(m.todayAlke)} today{m.hasLive ? " (est.)" : " (up to)"} · {clock(m.remaining)} left
          </span>
        ) : (
          <Button size="sm" to="/drill" style={{ marginTop: 8 }}>
            Start a drill first
          </Button>
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
      <Vein vein={vein.vein} onDone={vein.close} />
    </div>
  );
}
