import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { NURU_URL, STATUS, ambassador, money, statusLabel } from "../../lib/ambassador";
import { countries, useVerification, verificationLabel } from "../../lib/verification";
import { Button, Field, Notice } from "../../ui/ob";
import { AppBar, AppPage, Ico, Row, Section } from "../../ui/shell";
import { InviteShare } from "./InviteShare";
import { Workspace } from "./AmbassadorWorkspace";

/* The Ambassador tab. One place whose content follows the member's state:
   program intro and eligibility → application status → onboarding →
   workspace (or suspended). Everything comes from the server
   (lib/ambassador.js); `preview` swaps in mock data for the dev preview.
   No crypto here: pay is only described, and handled in the Nuru app. */

/** Loads the member's Ambassador state (or uses [preview]); `act` runs an action and keeps its result. */
export function useAmbassador(preview) {
  const [data, setData] = useState(preview);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    if (preview) return;
    setError(null);
    ambassador
      .get()
      .then(setData)
      .catch((e) => setError(e?.message || "Couldn't load the Ambassador Program."));
  }, [preview]);
  useEffect(load, [load]);
  const act = useCallback(
    async (fn) => {
      if (preview) return true;
      setBusy(true);
      setError(null);
      try {
        setData(await fn());
        return true;
      } catch (e) {
        setError(e?.message || "Something went wrong. Try again.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [preview],
  );
  return { data, error, busy, load, act };
}

const TRACKING = new Set(["submitted", "under_review", "info_required", "waitlisted", "rejected", "withdrawn"]);

export default function Ambassador({ preview, workspace }) {
  const s = useAmbassador(preview);
  const { data } = s;
  const status = data?.record?.status;
  // A withdrawn (or rejected, after the wait) member who can apply again sees the program again.
  const showIntro = !status || ((status === "withdrawn" || status === "rejected") && data.canApply);

  let body;
  if (!data) body = s.error ? <LoadError {...s} /> : <p className="ob-small center">Loading…</p>;
  else if (showIntro) body = <Intro {...s} />;
  else if (TRACKING.has(status)) body = <Tracker {...s} />;
  else if (status === "approved") body = <Onboarding />;
  else if (status === "active") body = <Workspace data={workspace} record={data.record} config={data.config} />;
  else body = <Suspended record={data.record} />;

  return <AppPage tab="ambassador" bar={<AppBar title="Ambassador" />}>{body}</AppPage>;
}

function LoadError({ error, load }) {
  return (
    <>
      <Notice kind="error">{error}</Notice>
      <Button kind="secondary" onClick={load}>
        Try again
      </Button>
    </>
  );
}

/* ── Intro and eligibility ─────────────────────────────────────────────── */

function Intro({ data, error, busy, act }) {
  const { nuruId } = useAuth();
  const c = data.config.compensation;
  const open = Object.entries(data.config.countries).filter(([, v]) => v.open);
  const elig = useRef(null);
  const status = data.record?.status;
  return (
    <>
      <section className="ob-hero ob-amb-hero" aria-labelledby="ambTitle">
        <span className="kick">ALKÉ Ambassador Program</span>
        <h1 id="ambTitle">Lead your community. Grow the network.</h1>
        <p className="ob-small">
          Become an ALKÉ Ambassador and help bring the Next Billion Network to your community. Show your commitment, build an active community and earn real
          compensation for your impact.
        </p>
        <div className="earn">
          <b className="num">Up to {money(c.monthlyMax, c.currency)}</b> a month
          <span>Performance-based, from the Kedo Treasury, paid through the Nuru app. Not a salary, and not guaranteed.</span>
        </div>
        <div className="acts">
          <Button onClick={() => elig.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>Get started</Button>
          <Button kind="secondary" to="/ambassador/how">
            How it works
          </Button>
        </div>
      </section>

      {status === "withdrawn" ? <Notice>You withdrew your last application. You can apply again whenever you're ready.</Notice> : null}
      {status === "rejected" ? <Notice>Your last application wasn't successful. You can apply again now.</Notice> : null}

      <div ref={elig} style={{ scrollMarginTop: 72 }}>
        <Eligibility data={data} busy={busy} act={act} />
      </div>
      {error ? <Notice kind="error">{error}</Notice> : null}

      {data.canApply ? (
        <Button to="/ambassador/apply">Apply now</Button>
      ) : (
        <Button disabled>Apply now</Button>
      )}
      <p className="ob-small center">Meeting the requirements doesn't guarantee approval. There are no fees, purchases or deposits, ever.</p>

      <Section title="Share your invite">
        <InviteShare nuruId={nuruId} />
      </Section>

      <Section title="The program">
        <ul className="ob-list">
          <li>
            <Row to="/ambassador/how" icon={<Ico.Doc />} tone="plain" title="How it works" sub="What ambassadors do, how pay works, FAQ" />
          </li>
          <li>
            <Row icon={<Ico.Users />} tone="plain" title="Open countries" sub={open.length ? open.map(([, v]) => `${v.name} (pilot)`).join(", ") : "None right now"} />
          </li>
        </ul>
      </Section>
    </>
  );
}

function Eligibility({ data, busy, act }) {
  const list = useMemo(() => countries(), []);
  const { items, referrals } = data.eligibility;
  const q = data.config.qualifying;
  const country = data.record?.country || "";
  const cfgCountry = data.config.countries[country];
  return (
    <Section title="Your eligibility">
      <Field id="amb-country" label="Country of residence">
        <div className="ob-input">
          <select id="amb-country" className="ob-select" value={country} disabled={busy} onChange={(e) => act(() => ambassador.setCountry(e.target.value))}>
            <option value="">Choose your country…</option>
            {list.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </Field>
      {country && !cfgCountry?.open ? (
        <Notice>We've noted your interest. The program isn't open in your country yet; we'll tell you when it is.</Notice>
      ) : null}
      <ul className="ob-list">
        {items.map((i) => (
          <li key={i.id}>
            <Row
              icon={i.done ? <Ico.Check /> : <Ico.Clock />}
              tone={i.done ? "green" : "plain"}
              title={i.label}
              sub={i.need ? `${i.have} of ${i.need} ${i.unit}` : i.note}
              end={i.done ? <span className="ob-pill green">Done</span> : <span className="ob-pill">To do</span>}
            />
          </li>
        ))}
      </ul>
      <p className="ob-small">
        A referral qualifies once they've done {q.drills} daily drills within {q.withinDays} days of joining.
        {referrals.pending ? ` ${referrals.pending} of your referrals ${referrals.pending === 1 ? "is" : "are"} on their way.` : ""} Keep drilling daily to build your participation days.
      </p>
    </Section>
  );
}

/* ── Application status ──────────────────────────────────────────────── */

const NEXT = {
  submitted: "The team reviews applications in the order they arrive. You'll get a notification and an email when it moves on.",
  under_review: "The team is looking at your participation, referrals and plan. Keep drilling and growing your community meanwhile.",
  info_required: "Reply below so the team can carry on with your review.",
  waitlisted: "You're eligible, but no position is open right now. We'll contact you when one opens.",
  rejected: "You can apply again after the waiting period. Keep building your community meanwhile.",
  withdrawn: "You can apply again whenever you're ready.",
};

function Tracker({ data, error, busy, act }) {
  const r = data.record;
  const [reply, setReply] = useState("");
  const [confirm, setConfirm] = useState(false);
  const canWithdraw = ["submitted", "under_review", "info_required", "waitlisted"].includes(r.status);
  const latest = r.timeline[r.timeline.length - 1];
  const reapplyAt = r.status === "rejected" && r.decidedAt ? new Date(r.decidedAt + data.config.reapplyDays * 864e5) : null;
  return (
    <>
      <section className="ob-hero" aria-label="Your application">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span className="lbl">Your Ambassador application</span>
          <span className={`ob-pill ${r.status === "rejected" ? "" : "accent"}`}>{statusLabel(r.status)}</span>
        </div>
        <div className="big num">{r.ref}</div>
        <p className="ob-small">
          Submitted {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"} · {data.config.countries[r.country]?.name || r.country}
        </p>
      </section>

      {r.status === "info_required" ? (
        <Section title="The team asked">
          <Notice>{r.info?.request || "Please share more information."}</Notice>
          <Field id="amb-reply" label="Your reply">
            <div className="ob-input area">
              <textarea id="amb-reply" rows={4} maxLength={3000} value={reply} onChange={(e) => setReply(e.target.value)} />
            </div>
          </Field>
          <Button busy={busy} disabled={!reply.trim()} onClick={() => act(() => ambassador.respond(reply.trim()))}>
            Send reply
          </Button>
        </Section>
      ) : null}

      <Section title="Progress">
        <ul className="ob-list">
          {r.timeline.map((t, i) => (
            <li key={`${t.status}${t.at}${i}`}>
              <Row
                icon={<Ico.Check />}
                tone={i === r.timeline.length - 1 ? "gold" : "plain"}
                title={statusLabel(t.status)}
                sub={t.note || STATUS[t.status]?.[1]}
                end={<span className="ob-small">{new Date(t.at).toLocaleDateString()}</span>}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Next steps">
        <p className="ob-small">
          {NEXT[r.status]}
          {reapplyAt ? ` You can apply again from ${reapplyAt.toLocaleDateString()}.` : ""}
        </p>
        {latest?.note && r.status !== "info_required" ? <Notice>{latest.note}</Notice> : null}
      </Section>

      {error ? <Notice kind="error">{error}</Notice> : null}
      {canWithdraw ? (
        <Button kind="secondary" busy={busy} onClick={() => (confirm ? act(() => ambassador.withdraw()) : setConfirm(true))}>
          {confirm ? "Tap again to withdraw" : "Withdraw application"}
        </Button>
      ) : null}
      <Link to="/ambassador/how" className="ob-small center" style={{ display: "block" }}>
        How the program works
      </Link>
    </>
  );
}

/* ── Approved: onboarding ─────────────────────────────────────────────── */

function Onboarding() {
  const verification = useVerification();
  return (
    <>
      <section className="ob-hero ob-amb-hero" aria-labelledby="ambWelcome">
        <span className="kick">Approved</span>
        <h1 id="ambWelcome">Welcome to the ALKÉ Ambassador Program.</h1>
        <p className="ob-small">Your application has been approved. Complete the steps below to activate your Ambassador Workspace and become eligible to earn compensation.</p>
      </section>
      <ol className="ob-guide">
        <li className="ob-guide-step">
          <span className="num">1</span>
          <div className="body">
            <h2>Verify your identity</h2>
            <p>Your legal name, date of birth, government ID and country, checked by our verification provider. Your documents are never stored in the app.</p>
            <ul className="ob-list">
              <li>
                <Row to="/verify" icon={<Ico.Shield />} tone="plain" title="Identity verification" end={verificationLabel(verification)} />
              </li>
            </ul>
          </div>
        </li>
        <li className="ob-guide-step">
          <span className="num">2</span>
          <div className="body">
            <h2>Accept the Ambassador agreement</h2>
            <p>Responsibilities, pay rules and monthly limits, community standards, honest promotion and paid-promotion disclosures, and when status can be suspended.</p>
            <ul className="ob-list">
              <li>
                <Row icon={<Ico.Doc />} tone="plain" title="Ambassador agreement" end={<span className="ob-pill">The team will send it</span>} />
              </li>
            </ul>
          </div>
        </li>
        <li className="ob-guide-step">
          <span className="num">3</span>
          <div className="body">
            <h2>Get paid through Nuru</h2>
            <p>Ambassador pay is handled entirely in the Nuru app. Download Nuru and create your account; the team confirms your payout details with you there. The ALKE app never asks for wallets, keys or recovery phrases.</p>
            <a className="ob-btn secondary" href={NURU_URL} target="_blank" rel="noopener noreferrer">
              Get Nuru
            </a>
          </div>
        </li>
      </ol>
      <Notice>Your workspace activates once all three steps are complete and approved by the team.</Notice>
    </>
  );
}

function Suspended({ record }) {
  const last = record.timeline[record.timeline.length - 1];
  return (
    <>
      <section className="ob-hero" aria-label="Ambassador status">
        <span className="lbl">Ambassador status</span>
        <div className="big">Suspended</div>
        <p className="ob-small">Your workspace and pay are paused while this is reviewed.</p>
      </section>
      {last?.note ? <Notice>{last.note}</Notice> : null}
      <p className="ob-small center">Questions? Reach the team through the Alkers community chat.</p>
      <Button kind="secondary" to="/chat">
        Open community chat
      </Button>
    </>
  );
}
