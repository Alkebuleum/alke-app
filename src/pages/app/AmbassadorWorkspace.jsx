import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { NURU_URL, estimate, money } from "../../lib/ambassador";
import { Field, Notice } from "../../ui/ob";
import { Ico, Row, Section, Stat } from "../../ui/shell";
import { InviteShare } from "./InviteShare";

/* The active ambassador's workspace. Its backend (referral generations,
   assignments, resources, earnings) doesn't exist yet, so live members see
   a "being set up" note; the dev preview passes MOCK_WORKSPACE as [data].
   Every amount is an estimate. Approved and paid amounts live in Nuru:
   the ALKE app has no wallets, payments or crypto. */

const TABS = [
  ["overview", "Overview"],
  ["network", "My network"],
  ["community", "Community"],
  ["assignments", "Assignments"],
  ["resources", "Resources"],
  ["earnings", "Earnings"],
  ["payments", "Payments"],
  ["kedo", "Contact Kedo"],
];

export function Workspace({ data, record, config }) {
  const [tab, setTab] = useState("overview");
  if (!data) {
    return (
      <>
        <section className="ob-hero ob-amb-hero" aria-label="Ambassador Workspace">
          <span className="kick">Ambassador · {record.ref}</span>
          <h1>Your workspace is being set up.</h1>
          <p className="ob-small">The team will let you know when your dashboard, assignments and resources are ready here.</p>
        </section>
        <Payments />
      </>
    );
  }
  const c = config.compensation;
  const est = estimate(c, { direct: data.metrics.directQualified, indirect: data.metrics.indirectQualified });
  return (
    <>
      <section className="ob-hero" aria-label="Ambassador">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span className="lbl">
            {data.name} · {data.id}
          </span>
          <span className="ob-pill green">
            <span className="d" />
            Active
          </span>
        </div>
        <p className="ob-small">
          {data.country} · {data.period}
        </p>
      </section>

      <div className="ob-seg pill scroll" role="tablist" aria-label="Workspace">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? <Overview data={data} c={c} est={est} /> : null}
      {tab === "network" ? <MyNetwork data={data} /> : null}
      {tab === "community" ? <Community /> : null}
      {tab === "assignments" ? <Assignments data={data} /> : null}
      {tab === "resources" ? <Resources data={data} /> : null}
      {tab === "earnings" ? <Earnings data={data} c={c} est={est} /> : null}
      {tab === "payments" ? <Payments /> : null}
      {tab === "kedo" ? <Kedo /> : null}
    </>
  );
}

function Progress({ value, max, label }) {
  return (
    <div className="ob-founder-prog" aria-label={label}>
      <span className="track" aria-hidden="true">
        <i style={{ width: `${Math.max(2, Math.min(1, value / max) * 100)}%` }} />
      </span>
    </div>
  );
}

function Overview({ data, c, est }) {
  const m = data.metrics;
  const peak = Math.max(...data.weekly, 1);
  return (
    <>
      <section className="ob-hero" aria-label="This month's estimated earnings">
        <span className="lbl">This month's estimated earnings</span>
        <div className="big num">
          {money(est.total)}
          <small className="ob-small"> / {money(c.monthlyMax)}</small>
        </div>
        <Progress value={est.total} max={c.monthlyMax} label={`${Math.round((est.total / c.monthlyMax) * 100)}% of the monthly maximum`} />
        <p className="ob-small">Estimate only. The team approves real pay each month; approved and paid amounts are in Nuru.</p>
      </section>
      <div className="ob-stats">
        <Stat label="Direct" value={m.direct} unit={`${m.directQualified} qualified`} />
        <Stat label="Indirect" value={m.indirect} unit={`${m.indirectQualified} qualified`} />
        <Stat label="Community" value={m.community} unit={`${Math.round(m.retention * 100)}% retained`} />
      </div>
      <div className="ob-stats">
        <Stat label="New verified" value={m.newVerified} />
        <Stat label="Active members" value={m.activeMembers} />
        <Stat label="Mgmt fee" value={est.mgmt ? "Unlocked" : "Not yet"} />
      </div>
      <Section title="Weekly growth">
        <div className="ob-amb-bars" role="img" aria-label={`New referrals per week: ${data.weekly.join(", ")}`}>
          {data.weekly.map((v, i) => (
            <i key={i} style={{ height: `${(v / peak) * 100}%` }} />
          ))}
        </div>
      </Section>
      <Notice>Recommendations from Kedo will appear here once Kedo is connected.</Notice>
    </>
  );
}

function MyNetwork({ data }) {
  const { nuruId } = useAuth();
  const m = data.metrics;
  return (
    <>
      <Section title="You">
        <ul className="ob-list">
          <li>
            <Row icon={<Ico.Users />} tone="gold" title={data.name} sub={`${m.direct} direct · ${m.indirect} indirect (2nd generation)`} />
          </li>
        </ul>
      </Section>
      <Section title="Your direct referrals">
        <ul className="ob-list">
          {data.branches.map((b) => (
            <li key={b.name}>
              <Row icon={<Ico.Users />} tone="plain" title={b.name} sub={`${b.joined} joined through them · ${b.qualified} qualified`} />
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Qualification">
        <ul className="ob-list">
          {Object.entries(data.referralStates).map(([k, v]) => (
            <li key={k}>
              <Row tone="plain" title={k} end={<b className="num">{v}</b>} />
            </li>
          ))}
        </ul>
      </Section>
      <p className="ob-small">Only names and counts are shown. Your referrals' contact details and documents are never shared. Attribution stops at the second generation.</p>
      <Section title="Share your invite">
        <InviteShare nuruId={nuruId} />
      </Section>
    </>
  );
}

function Community() {
  return (
    <Section title="Your community">
      <ul className="ob-list">
        <li>
          <Row to="/chat" icon={<Ico.Users />} tone="green" title="Alkers community chat" sub="Talk with your community" />
        </li>
        <li>
          <Row icon={<Ico.Bell />} tone="plain" title="Announcements" sub="From the team, once published" />
        </li>
        <li>
          <Row icon={<Ico.Doc />} tone="plain" title="Feedback and issues" sub="Report what your community needs" />
        </li>
      </ul>
    </Section>
  );
}

function Assignments({ data }) {
  return (
    <Section title="Assignments">
      <ul className="ob-list">
        {data.assignments.map((a) => (
          <li key={a.id}>
            <Row
              icon={<Ico.Check />}
              tone={a.status === "Completed" ? "green" : "plain"}
              title={a.title}
              sub={`Due ${a.due} · Evidence: ${a.evidence}${a.feedback ? ` · “${a.feedback}”` : ""}`}
              end={<span className={`ob-pill ${a.status === "Completed" ? "green" : ""}`}>{a.status}</span>}
            />
          </li>
        ))}
      </ul>
      <p className="ob-small">Completing the month's assignments counts toward the management fee.</p>
    </Section>
  );
}

function Resources({ data }) {
  return (
    <Section title="Marketing resources">
      <ul className="ob-list">
        {data.resources.map((r) =>
          r.url ? (
            <li key={r.title}>
              <a className="ob-row" href={r.url} target="_blank" rel="noopener noreferrer">
                <span className="ic plain">
                  <Ico.Doc />
                </span>
                <span className="tx">
                  <b>{r.title}</b>
                  <span>{r.kind}</span>
                </span>
              </a>
            </li>
          ) : (
            <li key={r.title}>
              <Row icon={<Ico.Doc />} tone="plain" title={r.title} sub={r.kind} />
            </li>
          ),
        )}
      </ul>
      <p className="ob-small">Use approved material only. Never promise prices, listings or income.</p>
    </Section>
  );
}

function Earnings({ data, c, est }) {
  const [calc, setCalc] = useState({ direct: data.metrics.directQualified, indirect: data.metrics.indirectQualified });
  const e = estimate(c, calc);
  const num = (k) => (ev) => setCalc((s) => ({ ...s, [k]: Math.max(0, Math.floor(Number(ev.target.value) || 0)) }));
  return (
    <>
      <Section title="This month (estimate)">
        <ul className="ob-list">
          <li>
            <Row tone="plain" title="Direct referrals" sub={`${data.metrics.directQualified} × ${money(c.direct)}`} end={<b className="num">{money(est.direct)}</b>} />
          </li>
          <li>
            <Row
              tone="plain"
              title="Indirect referrals"
              sub={c.indirectEnabled ? `${data.metrics.indirectQualified} × ${money(c.indirect)}` : "Not active yet: pending compliance approval"}
              end={<b className="num">{money(est.indirect)}</b>}
            />
          </li>
          <li>
            <Row tone="plain" title="Management fee" sub={`${c.mgmtCombined}+ qualifying referrals, ${c.mgmtDirect}+ direct, assignments done`} end={<b className="num">{money(est.mgmt)}</b>} />
          </li>
          <li>
            <Row tone="plain" title="Remaining this month" sub={`Monthly maximum ${money(c.monthlyMax)}`} end={<b className="num">{money(c.monthlyMax - est.total)}</b>} />
          </li>
        </ul>
      </Section>
      <Section title="Calculator">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field id="calc-d" label="Qualifying direct">
            <div className="ob-input">
              <input id="calc-d" type="number" inputMode="numeric" min="0" value={calc.direct} onChange={num("direct")} />
            </div>
          </Field>
          <Field id="calc-i" label="Qualifying indirect">
            <div className="ob-input">
              <input id="calc-i" type="number" inputMode="numeric" min="0" value={calc.indirect} onChange={num("indirect")} />
            </div>
          </Field>
        </div>
        <p className="ob-small">
          Estimated: <b>{money(e.total)}</b>
          {e.capped ? " (monthly maximum reached)" : ""}. A projection, not a promise.
        </p>
      </Section>
      <Section title="Ledger">
        <ul className="ob-list">
          {data.ledger.map((l, i) => (
            <li key={i}>
              <Row tone="plain" title={l.type} sub={`${l.date} · ${l.ref}`} end={<span className="ob-pill">{`${money(l.amount)} · ${l.status}`}</span>} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function Payments() {
  return (
    <Section title="Payments">
      <p className="ob-small">
        Ambassador pay is handled in the Nuru app: payout details, payments and their history all live there. The ALKE app never handles wallets, keys or payments.
      </p>
      <a className="ob-btn secondary" href={NURU_URL} target="_blank" rel="noopener noreferrer">
        Open Nuru
      </a>
    </Section>
  );
}

function Kedo() {
  return (
    <Section title="Contact Kedo">
      <Notice>Kedo, your program coordinator, isn't connected yet. Until then, reach the team in the Alkers community chat.</Notice>
      <ul className="ob-list">
        <li>
          <Row to="/chat" icon={<Ico.Users />} tone="green" title="Alkers community chat" sub="Questions about rules, referrals or pay" />
        </li>
      </ul>
    </Section>
  );
}
