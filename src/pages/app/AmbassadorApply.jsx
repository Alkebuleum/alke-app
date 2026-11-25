import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { ambassador } from "../../lib/ambassador";
import { Button, Field, Notice } from "../../ui/ob";
import { AppPage, Ico, Row, Section, SubBar } from "../../ui/shell";
import { useAmbassador } from "./Ambassador";

/* Ambassador application: form → review → submit → confirmation. What the
   account already knows (email, country, participation and referrals) is
   filled in or attached by the server, not asked again. */

const FIELDS = [
  ["fullName", "Full name", { auto: "name", max: 120 }],
  ["region", "State or region", { auto: "address-level1", max: 80 }],
  ["city", "City", { auto: "address-level2", max: 80 }],
  ["languages", "Languages you speak", { max: 160, help: "For example: English, Yoruba, Pidgin" }],
  ["socials", "Social media profiles", { max: 600, optional: true, area: true, help: "Links to the profiles you'd use for ALKÉ" }],
  ["experience", "Community or leadership experience", { max: 2000, area: true }],
  ["communities", "Communities or audiences you manage", { max: 2000, area: true, optional: true }],
  ["why", "Why do you want to be an ALKÉ Ambassador?", { max: 2000, area: true }],
  ["strategy", "How would you grow ALKÉ in your community?", { max: 3000, area: true }],
];

const CONFIRM = [
  ["performance", "Pay is performance-based and not guaranteed."],
  ["review", "Acceptance depends on the team's review."],
  ["identity", "I'll verify my identity if I'm approved."],
  ["nuru", "Pay is made through the Nuru app, not the ALKE app."],
  ["conduct", "I won't make misleading financial promises or recruit fraudulently."],
  ["age", "I'm 18 or older."],
];

export default function AmbassadorApply({ preview }) {
  const { person, displayName } = useAuth();
  const { data, error, busy, act } = useAmbassador(preview);
  const [step, setStep] = useState("form");
  const [f, setF] = useState(() => ({ fullName: person?.name || displayName || "" }));
  const [agreed, setAgreed] = useState({});
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  if (!data) {
    return (
      <AppPage tab="ambassador" bar={<SubBar title="Apply" back="/ambassador" />}>
        {error ? <Notice kind="error">{error}</Notice> : <p className="ob-small center">Loading…</p>}
      </AppPage>
    );
  }
  if (step === "done") {
    return (
      <AppPage tab="ambassador" bar={<SubBar title="Application sent" back="/ambassador" />}>
        <section className="ob-hero ob-amb-hero" aria-labelledby="sentTitle">
          <span className="kick">Application received</span>
          <h1 id="sentTitle">Thank you. We've got it.</h1>
          <p className="ob-small">
            Your reference is <b className="num">{data.record?.ref}</b>. We've sent a confirmation to {data.record?.application?.email || "your email"}. Track your
            application in the Ambassador tab.
          </p>
        </section>
        <Button to="/ambassador">Track my application</Button>
      </AppPage>
    );
  }
  if (!data.canApply) return <Navigate to="/ambassador" replace />;

  const country = data.config.countries[data.record?.country]?.name || data.record?.country;
  const missing = FIELDS.filter(([k, , o]) => !o.optional && !String(f[k] || "").trim());
  const allAgreed = CONFIRM.every(([k]) => agreed[k]);
  const submit = async () => {
    const ok = await act(() => ambassador.apply({ ...f, agreed }));
    if (ok) setStep("done");
  };

  return (
    <AppPage tab="ambassador" bar={<SubBar title={step === "review" ? "Review" : "Apply"} back="/ambassador" />}>
      {step === "form" ? (
        <>
          <p className="ob-sub" style={{ margin: "0 4px" }}>
            Tell us about you and your plan. Your participation, referrals and account history are attached automatically.
          </p>
          <Section title="From your account">
            <ul className="ob-list">
              <li>
                <Row icon={<Ico.Mail />} tone="plain" title="Email" sub={data.email || "Your sign-in email"} />
              </li>
              <li>
                <Row icon={<Ico.Users />} tone="plain" title="Country of residence" sub={country} />
              </li>
            </ul>
          </Section>
          <Section title="About you">
            {FIELDS.map(([k, label, o]) => (
              <Field key={k} id={`ap-${k}`} label={label} optional={o.optional} help={o.help}>
                <div className={o.area ? "ob-input area" : "ob-input"}>
                  {o.area ? (
                    <textarea id={`ap-${k}`} rows={4} maxLength={o.max} value={f[k] || ""} onChange={set(k)} />
                  ) : (
                    <input id={`ap-${k}`} autoComplete={o.auto || "off"} maxLength={o.max} value={f[k] || ""} onChange={set(k)} />
                  )}
                </div>
              </Field>
            ))}
          </Section>
          <Section title="Please confirm">
            {CONFIRM.map(([k, text]) => (
              <label key={k} className="ob-check">
                <input type="checkbox" checked={!!agreed[k]} onChange={(e) => setAgreed((s) => ({ ...s, [k]: e.target.checked }))} />
                <span className="box" aria-hidden="true">
                  <Ico.Check size={14} />
                </span>
                <span>{text}</span>
              </label>
            ))}
          </Section>
          <Button disabled={!!missing.length || !allAgreed} onClick={() => setStep("review")}>
            Review application
          </Button>
          {missing.length ? <p className="ob-small center">Still to fill in: {missing.map(([, l]) => l.replace(/\?$/, "")).join(", ")}.</p> : null}
        </>
      ) : (
        <>
          <Section title="Your application">
            <ul className="ob-list">
              <li>
                <Row tone="plain" title="Email" sub={data.email || "Your sign-in email"} />
              </li>
              <li>
                <Row tone="plain" title="Country" sub={country} />
              </li>
              {FIELDS.filter(([k]) => String(f[k] || "").trim()).map(([k, label]) => (
                <li key={k}>
                  <Row tone="plain" title={label} sub={f[k]} />
                </li>
              ))}
            </ul>
          </Section>
          <p className="ob-small">Your participation days, referrals and account history are attached when you submit.</p>
          {error ? <Notice kind="error">{error}</Notice> : null}
          <Button busy={busy} onClick={submit}>
            Submit application
          </Button>
          <Button kind="secondary" onClick={() => setStep("form")}>
            Edit
          </Button>
        </>
      )}
    </AppPage>
  );
}
