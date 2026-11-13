import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { useMemberData } from "../../lib/useMemberData";
import { AppScreen, Chevron, Lock, SubHeader, alke, card, display, mono, tabular } from "../../ui/app";

/* The member's ALKE allocation. Totals come from the server-written
   alke_members/{id}/allocation/summary; nothing here is computed on the phone. */
export default function Allocation() {
  const { nuruId } = useAuth();
  const { allocation } = useMemberData({ allocation: true });
  const a = allocation || {};
  const updated = a.updatedAt?.toDate?.();

  const rows = [
    ["Pending", "Recorded, not yet verified", a.pending, { border: "1.5px dashed #A9A6B6" }, "var(--muted)"],
    ["Verified", "Amount set, joins the next batch", a.verified, { background: "#6EE7B7" }],
    ["Allocated · locked", "Reserved for you", a.locked, { background: "#8B6DFF", boxShadow: "0 0 8px #8B6DFF" }],
    ["Claimable", "Only under the published release policy", a.claimable, { border: "1.5px solid #F2C66B" }],
    ["Claimed", "Delivered to your wallet", a.claimed, { border: "1.5px solid #8C8999" }],
  ];

  return (
    <AppScreen tab="mine">
      <SubHeader title="Your allocation" back="/mine" />

      <section style={{ position: "relative", overflow: "hidden", borderRadius: 28, padding: 22, background: "radial-gradient(130% 110% at 0% 0%,#6A4BF0 0%,#4B2DE0 35%,#2A1690 68%,#170D4A 100%)", border: "1px solid rgba(214,202,255,.25)", boxShadow: "0 30px 60px -28px rgba(94,58,255,.75)", display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{ ...mono, color: "#FFFFFF" }}>ALLOCATED · LOCKED</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 10px", borderRadius: 999, background: "rgba(255,255,255,.16)", fontSize: 12, fontWeight: 600 }}>
            <Lock />
            Not transferable
          </span>
        </span>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ ...display, fontSize: 52, lineHeight: 1, letterSpacing: "-.04em", ...tabular }}>{alke(a.locked)}</span>
          <span style={{ ...display, fontSize: 18, color: "#E4DCFF" }}>ALKE</span>
        </span>
        <p style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: "#E4DCFF" }}>
          {allocation
            ? "Reserved for you from ALKE's existing community allocation. It can't be moved or spent until it is released."
            : "Nothing allocated yet. Once your sessions are verified, your share of the existing community allocation shows here, locked until it is released."}
        </p>
        <span style={{ ...mono, color: "#E4DCFF" }}>{nuruId}</span>
      </section>

      <div style={{ ...card, padding: "6px 18px" }}>
        {rows.map(([t, d, v, dot, color], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,.06)" : 0 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", boxSizing: "border-box", flex: "none", ...dot }} />
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{t}</span>
              <span style={{ fontSize: 12, color: "var(--faint)" }}>{d}</span>
            </span>
            <span style={{ ...display, fontSize: 17, ...tabular, color: color || "var(--text)" }}>{alke(v)}</span>
          </div>
        ))}
      </div>
      {updated ? <p style={{ margin: "-6px 0 0", fontSize: 12, color: "var(--faint)" }}>Updated {updated.toLocaleString()}</p> : null}

      <section style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, ...display, fontSize: 19 }}>How warming works</h2>
          <span style={{ height: 24, padding: "0 9px", borderRadius: 999, background: "rgba(242,198,107,.14)", color: "#F2C66B", fontSize: 11.5, fontWeight: 600, display: "inline-flex", alignItems: "center" }}>10 a day per invite</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: "var(--muted)" }}>
          Your allocation is cold ALKE. Cold ALKE is warmed only by real, verified people you invite. Each verified invite warms 10 of your cold ALKE per day.
        </p>
        <div style={{ padding: "12px 14px", borderRadius: 16, background: "rgba(10,6,20,.55)", border: "1px solid rgba(242,198,107,.3)" }}>
          <span style={{ ...mono, fontSize: 10.5, color: "#F2C66B" }}>WARMING TIME</span>
          <p style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 600 }}>Your cold ALKE ÷ (verified invites × 10 per day)</p>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5, color: "var(--muted)" }}>
          <li>Unverified invites warm nothing.</li>
          <li>Your own mining doesn't warm your coins.</li>
          <li>Only warmed ALKE converts to hot ALKE at listing. Unwarmed cold ALKE stays cold.</li>
        </ul>
        <Link to="/network" style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 4, minHeight: 36, fontSize: 14, fontWeight: 600, color: "#C6B6FF", textDecoration: "none" }}>
          Your invites
          <Chevron color="currentColor" />
        </Link>
      </section>

      <section style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={{ margin: 0, ...display, fontSize: 19 }}>Release conditions</h2>
        {[
          ["Release policy published", "Not yet"],
          ["Your account is verified", "Not yet"],
          ["A wallet connected", "Only needed once claims open"],
        ].map(([t, s]) => (
          <div key={t} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
            <span style={{ fontWeight: 600 }}>{t}</span>
            <span style={{ color: "var(--faint)", textAlign: "right" }}>{s}</span>
          </div>
        ))}
        <p style={{ margin: "4px 0 0", fontSize: 12.5, lineHeight: "18px", color: "var(--faint)" }}>
          An exchange listing may be one factor the release policy considers. No listing, release date or price is promised.
        </p>
      </section>

      <Link to="/mine/history" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 56, padding: "0 18px", borderRadius: 22, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)", textDecoration: "none", color: "var(--text)" }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>History and calculations</span>
        <Chevron />
      </Link>
      <p style={{ margin: 0, fontSize: 12, textAlign: "center", color: "var(--faint)" }}>Sessions never mint new ALKE.</p>
    </AppScreen>
  );
}
