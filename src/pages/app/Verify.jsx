import { useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { Bar, Button, Field, Notice, Page } from "../../ui/ob";
import { Ico } from "../../ui/shell";
import { countries, startVerification, submitManualVerification, uploadVerificationPhoto, useVerification, VERIFY_OPEN } from "../../lib/verification";

/* Personhood check: one person, one account.
   Stripe (ID + live selfie + ID number) where it's available; elsewhere,
   photos of the ID and a selfie that the ALKE team reviews. */

const ID_TYPES = [
  ["passport", "Passport"],
  ["id_card", "National ID card"],
  ["driving_license", "Driving licence"],
  ["residence_permit", "Residence permit"],
  ["voter_card", "Voter's card"],
  ["other", "Other government ID"],
];

const PHOTOS = [
  ["id-front", "Front of your ID", "All four corners in view, no glare.", "environment"],
  ["id-back", "Back of your ID", "Skip this for a passport.", "environment", true],
  ["selfie", "A selfie", "Your face clearly, holding the same ID next to it.", "user"],
];

function Shell({ children, footer }) {
  return (
    <Page bar={<Bar back="/settings" />} footer={footer}>
      <span className="ob-tile" style={{ marginTop: 8 }}>
        <Ico.Shield size={30} />
      </span>
      {children}
    </Page>
  );
}

function Message({ title, sub, footer, children }) {
  return (
    <Shell footer={footer}>
      <div>
        <h1 className="ob-title">{title}</h1>
        <p className="ob-sub">{sub}</p>
      </div>
      {children}
    </Shell>
  );
}

function ManualForm({ country, onDone }) {
  const { nuruId } = useAuth();
  const [f, setF] = useState({ fullName: "", dob: "", idType: "", idNumber: "" });
  const [files, setFiles] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const ok = f.fullName.trim().length >= 3 && f.dob && f.idType && f.idNumber.trim().length >= 4 && files["id-front"] && files.selfie;

  const submit = async (e) => {
    e.preventDefault();
    if (!ok || busy) return;
    setBusy(true);
    setError(null);
    try {
      for (const [key] of PHOTOS) if (files[key]) await uploadVerificationPhoto(nuruId, key, files[key]);
      await submitManualVerification({ country, ...f });
      onDone();
    } catch (e2) {
      setError(e2?.message || "Couldn't send your documents. Try again.");
      setBusy(false);
    }
  };

  return (
    <form className="ob-stack loose" onSubmit={submit} noValidate>
      <Field id="v-name" label="Full name, as on your ID">
        <div className="ob-input">
          <input id="v-name" autoComplete="name" maxLength={120} value={f.fullName} onChange={set("fullName")} />
        </div>
      </Field>
      <Field id="v-dob" label="Date of birth">
        <div className="ob-input">
          <input id="v-dob" type="date" autoComplete="bday" value={f.dob} onChange={set("dob")} />
        </div>
      </Field>
      <Field id="v-type" label="Type of ID">
        <div className="ob-input">
          <select id="v-type" className="ob-select" value={f.idType} onChange={set("idType")}>
            <option value="">Choose…</option>
            {ID_TYPES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </Field>
      <Field id="v-num" label="ID number" help="Used only to stop one ID verifying two accounts. We keep the last 4 characters, never the full number.">
        <div className="ob-input mono">
          <input id="v-num" autoComplete="off" maxLength={40} value={f.idNumber} onChange={set("idNumber")} />
        </div>
      </Field>

      {PHOTOS.map(([key, label, help, capture, optional]) => (
        <Field key={key} id={`v-${key}`} label={label} optional={optional} help={help} ok={files[key] ? files[key].name || "Photo added" : null}>
          <label className="ob-upload" htmlFor={`v-${key}`}>
            <Ico.Doc />
            <span>{files[key] ? "Replace photo" : "Take or choose a photo"}</span>
            <input
              id={`v-${key}`}
              type="file"
              accept="image/*"
              capture={capture}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 10 * 1024 * 1024) return setError("Each photo must be under 10 MB.");
                setError(null);
                setFiles((v) => ({ ...v, [key]: file }));
              }}
            />
          </label>
        </Field>
      ))}

      <p className="ob-small">Your photos go to a private, encrypted store that only the review team can open, and they're deleted once your review is decided.</p>
      {error ? <Notice kind="error">{error}</Notice> : null}
      <Button type="submit" busy={busy} disabled={!ok || busy}>
        Send for review
      </Button>
    </form>
  );
}

export default function Verify() {
  const v = useVerification();
  const list = useMemo(() => countries(), []);
  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [manual, setManual] = useState(false);
  const back = <Button to="/home">Back to Home</Button>;

  if (v === undefined) return <Message title="Personhood check" sub="Loading…" />;

  const status = v.status;
  if (status === "verified")
    return <Message title="You're verified" sub="One person, one account: your personhood check is done. You can claim in Nuru when claiming opens." footer={back} />;
  if (status === "review")
    return <Message title="In review" sub="The ALKE team is reviewing your documents, usually within a few days. We'll notify you. Your sessions keep counting meanwhile." footer={back} />;
  if (status === "processing" || (status === "pending" && new URLSearchParams(window.location.search).get("back")))
    return <Message title="Checking your ID" sub="Stripe is checking your documents. This usually takes a few minutes; we'll notify you when it's done." footer={back} />;

  if (!VERIFY_OPEN)
    return (
      <Message
        title="Personhood checks open soon"
        sub="One person, one account. ID checks aren't open yet; we'll notify you when they are. Your sessions and cALKE keep counting meanwhile, and nothing is lost by waiting."
        footer={back}
      />
    );

  const start = async () => {
    if (!country || busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await startVerification({ country });
      if (r.url) window.location.assign(r.url);
      else if (r.method === "manual") {
        setManual(true);
        setBusy(false);
      } else setBusy(false);
    } catch (e) {
      setError(e?.message || "Couldn't start the check. Try again.");
      setBusy(false);
    }
  };

  if (manual || status === "manual") {
    const cc = country || v.country;
    return (
      <Shell>
        <div>
          <h1 className="ob-title">Verify with your ID</h1>
          <p className="ob-sub">Automatic ID checks aren't available where you live yet, so the ALKE team checks your documents by hand.</p>
        </div>
        <ManualForm country={cc} onDone={() => setManual(false)} />
      </Shell>
    );
  }

  const intro =
    status === "rejected"
      ? ["Verification wasn't approved", v.reason || "Your check couldn't be approved. You can try again."]
      : status === "needs_input"
        ? ["Let's try that again", "Stripe couldn't finish the check (often a blurry photo or glare). Start again when you're ready."]
        : ["Personhood check", "One person, one account. Verify once to claim your ALKE in Nuru when claiming opens. Your sessions keep counting meanwhile."];

  return (
    <Shell
      footer={
        <Button busy={busy} disabled={!country || busy} onClick={start}>
          Continue
        </Button>
      }
    >
      <div>
        <h1 className="ob-title">{intro[0]}</h1>
        <p className="ob-sub">{intro[1]}</p>
      </div>
      <section className="ob-sec">
        <div className="ob-group">What you'll need</div>
        <ul className="ob-list">
          {[
            [Ico.Doc, "A government ID", "Passport, national ID card or driving licence"],
            [Ico.Star, "A live selfie", "Taken on the spot, to match your ID"],
            [Ico.Shield, "About two minutes", "Most checks finish in minutes"],
          ].map(([I, t, d]) => (
            <li key={t}>
              <div className="ob-row static">
                <span className="ic plain">
                  <I />
                </span>
                <span className="tx">
                  <b>{t}</b>
                  <span>{d}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <Field id="v-country" label="Country where you live">
        <div className="ob-input">
          <select id="v-country" className="ob-select" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Choose your country…</option>
            {list.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </Field>
      {error ? <Notice kind="error">{error}</Notice> : null}
      <p className="ob-small">ID checks are run by Stripe. Your documents and images never appear in ALKE or on a blockchain.</p>
    </Shell>
  );
}
