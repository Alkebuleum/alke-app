import { useMemberData } from "../../lib/useMemberData";
import { useVerification, verificationLabel } from "../../lib/verification";
import { AppPage, Ico, Row, Section, SubBar } from "../../ui/shell";
import { fmtAlke } from "../../lib/genesis";

/* The member's ALKE rewards: drills and invite matches, as settled by the
   server (alke_members/{id}/allocation/summary.locked); nothing here is
   computed on the phone. Redeemable at the post-quantum mainnet. */
export default function Allocation() {
  const verification = useVerification();
  const { allocation } = useMemberData({ allocation: true });
  const a = allocation || {};
  const updated = a.updatedAt?.toDate?.();

  return (
    <AppPage tab="drill" bar={<SubBar title="ALKE rewards" back="/drill" />}>
      <section className="ob-hero" aria-label="Your ALKE rewards">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span className="lbl">Your ALKE rewards</span>
          <span className="ob-pill accent">
            <Ico.Lock size={12} />
            Not transferable
          </span>
        </div>
        <div className="num" style={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>
          {fmtAlke(a.locked)} <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-2)", letterSpacing: 0 }}>ALKE</span>
        </div>
        <p className="ob-small" style={{ color: "var(--text-2)" }}>
          {allocation
            ? `From your daily drills and invite matches${updated ? `, updated ${updated.toLocaleDateString()}` : ""}. Redeemable when the post-quantum mainnet launches.`
            : "Appears once your drills are verified."}
        </p>
      </section>

      <Section title="Before you can redeem">
        <ul className="ob-list">
          <li>
            <Row to="/release-policy" icon={<Ico.Doc />} tone="plain" title="Release policy" end={<span className="ob-pill">Draft</span>} />
          </li>
          <li>
            <Row to="/verify" icon={<Ico.Shield />} tone="plain" title="Account verified" end={verificationLabel(verification)} />
          </li>
          <li>
            <Row icon={<Ico.Users />} tone="plain" title="Redeem at mainnet" end="When it launches" />
          </li>
        </ul>
      </Section>

      <ul className="ob-list">
        <li>
          <Row to="/how-to-redeem" icon={<Ico.Doc />} title="How to redeem ALKE" sub="Drilling and redeeming, step by step" />
        </li>
      </ul>

      <p className="ob-small center">No listing, release date or price is promised.</p>
    </AppPage>
  );
}
