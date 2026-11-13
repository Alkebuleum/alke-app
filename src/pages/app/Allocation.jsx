import { useMemberData } from "../../lib/useMemberData";
import { WarmingRules, WarmingSection } from "./Warming";
import { AppPage, Ico, Row, Section, SubBar, alke } from "../../ui/shell";

/* The member's ALKE allocation. Totals come from the server-written
   alke_members/{id}/allocation/summary; nothing here is computed on the phone. */
const Dot = ({ style }) => <span style={{ width: 10, height: 10, borderRadius: "50%", boxSizing: "border-box", ...style }} />;

export default function Allocation() {
  const { allocation } = useMemberData({ allocation: true });
  const a = allocation || {};
  const updated = a.updatedAt?.toDate?.();

  const rows = [
    ["Pending", "Recorded, not yet verified", a.pending, { border: "1.5px dashed #A1A1AA" }],
    ["Verified", "Joins the next batch", a.verified, { background: "var(--success)" }],
    ["Locked", "Reserved for you", a.locked, { background: "var(--accent)" }],
    ["Claimable", "Under the release policy", a.claimable, { border: "1.5px solid var(--gold)" }],
    ["Claimed", "Sent to your wallet", a.claimed, { border: "1.5px solid #71717A" }],
  ];

  return (
    <AppPage tab="mine" bar={<SubBar title="Allocation" back="/mine" />}>
      <section className="ob-hero" aria-label="Locked allocation">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span className="lbl">Locked allocation</span>
          <span className="ob-pill accent">
            <Ico.Lock size={12} />
            Not transferable
          </span>
        </div>
        <div className="num" style={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}>
          {alke(a.locked)} <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-2)", letterSpacing: 0 }}>ALKE</span>
        </div>
        <p className="ob-small" style={{ color: "var(--text-2)" }}>
          {allocation ? "Your share of the existing community allocation, locked until release." : "Appears once your sessions are verified."}
        </p>
      </section>

      <Section title="Breakdown" action={updated ? <span>Updated {updated.toLocaleDateString()}</span> : null}>
        <ul className="ob-list">
          {rows.map(([t, d, v, dot]) => (
            <li key={t}>
              <Row icon={<Dot style={dot} />} tone="plain" title={t} sub={d} end={<b className="num">{alke(v)}</b>} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Release conditions">
        <ul className="ob-list">
          <li>
            <Row icon={<Ico.Doc />} tone="plain" title="Release policy published" end="Not yet" />
          </li>
          <li>
            <Row to="/verify" icon={<Ico.Shield />} tone="plain" title="Account verified" end="Not yet" />
          </li>
          <li>
            <Row icon={<Ico.Wallet />} tone="plain" title="Wallet connected" end="Later" />
          </li>
        </ul>
      </Section>

      <WarmingSection cold={Number(a.locked) || 0} />
      <WarmingRules />

      <p className="ob-small center">No listing, release date or price is promised.</p>
    </AppPage>
  );
}
