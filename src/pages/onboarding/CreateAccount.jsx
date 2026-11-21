import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { I } from "../../ui/ob";
import { Field, Gold, Invited, Onb, Problem } from "../../ui/onb";
import { Loading } from "../../ui/kit";
import { useAuth } from "../../auth/AuthProvider";
import { acceptRules, AVATAR_COLORS, createMember, initialsOf, inviterName, normInvite } from "../../lib/member";
import { createAccount, hold, holding, MIN_AGE, PRIVACY_URL, setSignupState, signupState, TERMS_URL } from "../../lib/signup";

const savedInvite = () => {
  try {
    return normInvite(sessionStorage.getItem("alke.invite") || "");
  } catch {
    return "";
  }
};

function strength(pw) {
  const rich = /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
  return pw.length >= 16 || (pw.length >= 12 && rich) ? 3 : pw.length >= 12 ? 2 : pw.length >= 8 ? 1 : 0;
}

function Terms({ agreed, setAgreed }) {
  return (
    <label className="onb-check">
      <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
      <span>
        I'm {MIN_AGE} or older and agree to the{" "}
        <a href={TERMS_URL} target="_blank" rel="noopener">
          Terms of Use
        </a>{" "}
        and{" "}
        <a href={PRIVACY_URL} target="_blank" rel="noopener">
          Privacy Notice
        </a>
        .
      </span>
    </label>
  );
}

/* Step 2: create the account.
   - Signed out, email just confirmed (a ticket from step 1): name, password and
     the terms; the server creates the login already verified, then we sign in.
   - Signed in without a membership (that sign-in, or Google / Apple): the
     membership is created with the name (asked for here if we don't have it
     yet) and the terms accepted, then on to the Alker ID. */
export default function CreateAccount() {
  const a = useAuth();
  const navigate = useNavigate();
  const pending = signupState();
  const [name, setName] = useState(pending.name || "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [agreed, setAgreed] = useState(!!pending.agreed);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [inviter, setInviter] = useState(null);
  const invite = savedInvite();
  const started = useRef(false);

  const signedIn = !!a.user;
  const inStep = a.ready && a.step === "profile";
  const saving = holding() === "profile";

  // Prefill the name from Google / Apple / Nuru once known.
  useEffect(() => {
    if (!name && (a.person?.name || a.user?.displayName)) setName(a.person?.name || a.user?.displayName || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.person, a.user]);

  // Who invited them (readable once signed in).
  useEffect(() => {
    if (!signedIn || !invite) return;
    let live = true;
    inviterName(invite).then((n) => live && setInviter(n));
    return () => {
      live = false;
    };
  }, [signedIn, invite]);

  const saveMembership = async (displayName) => {
    hold("profile");
    setBusy(true);
    setError(null);
    try {
      if (!a.member?.username) {
        await createMember(a.nuruId, { displayName, tint: AVATAR_COLORS[0].tint, invitedBy: invite && invite !== a.nuruId ? invite : "" });
      }
      await acceptRules(a.nuruId);
      setSignupState(null);
      try {
        sessionStorage.removeItem("alke.invite");
      } catch {
        /* ignore */
      }
    } catch (e) {
      hold(null);
      started.current = false;
      setBusy(false);
      setError(e.code === "permission-denied" ? "Couldn't save your account (permission denied). Try again in a moment." : e.message || "Couldn't save that. Try again.");
    }
  };

  // Came through step 2 already (name and terms given): finish without asking again.
  useEffect(() => {
    if (inStep && a.nuruId && pending.name && pending.agreed && !started.current) {
      started.current = true;
      saveMembership(pending.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inStep, a.nuruId]);

  // Saved: move on once the record shows the terms (the router would otherwise
  // pass through the old rules step on the way).
  useEffect(() => {
    if (saving && a.member?.username && a.member?.rulesAcceptedAt) {
      hold(null);
      navigate(a.stepPath && a.stepPath !== "/create-account" ? a.stepPath : "/alker-id", { replace: true });
    }
  }, [saving, a.member, a.stepPath, navigate]);

  const trimmed = name.trim();
  const lvl = strength(password);
  const ready = !!trimmed && agreed && (signedIn || password.length >= 8);

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || busy) return;
    if (signedIn) return saveMembership(trimmed);
    setBusy(true);
    setError(null);
    try {
      setSignupState({ name: trimmed, agreed: true });
      await createAccount({ ticket: pending.ticket, email: pending.email, password, name: trimmed });
      setSignupState({ ticket: null });
      // Signed in: the auth state moves this screen into its second half.
    } catch (e2) {
      setBusy(false);
      setError(e2.message || "Couldn't create the account. Try again.");
    }
  };

  /* Guards */
  if (!a.ready) return <Loading />;
  if (!signedIn && !pending.ticket) return <Navigate to="/sign-up" replace />;
  if (signedIn && !inStep && !saving) return a.stepPath ? <Navigate to={a.stepPath} replace /> : <Loading />;
  if (signedIn && (busy || (pending.name && pending.agreed && !error))) {
    return (
      <Onb step={2} label="Your account" title="Setting up your account…" sub="This takes a moment.">
        <div style={{ display: "flex", justifyContent: "center", padding: 24, color: "#C6B6FF" }}>
          <span className="onb-spin" style={{ width: 28, height: 28 }} />
        </div>
      </Onb>
    );
  }

  return (
    <Onb
      {...(signedIn ? { onBack: a.signOut } : { back: "/sign-up" })}
      step={2}
      label="Your account"
      title="Create your account."
      sub={
        signedIn ? (
          <>
            Joining as <b>{a.user?.email || "a new member"}</b>.
          </>
        ) : (
          <>
            Joining as <b>{pending.email}</b>.{" "}
            <a
              href="/sign-up"
              onClick={(e) => {
                e.preventDefault();
                setSignupState(null);
                navigate("/sign-up");
              }}
            >
              Change
            </a>
          </>
        )
      }
      onSubmit={submit}
      footer={
        <Gold type="submit" busy={busy} disabled={!ready || busy}>
          Continue
        </Gold>
      }
    >
      {invite ? <Invited name={inviter} initials={inviter ? initialsOf(inviter) : null} /> : null}

      <Field id="ca-name" label="Your name">
        <span className="onb-input">
          <input id="ca-name" autoComplete="name" maxLength={60} placeholder="How other Alkers see you" value={name} onChange={(e) => setName(e.target.value)} />
        </span>
      </Field>

      {!signedIn ? (
        <Field id="ca-pass" label="Password">
          <span className="onb-input has-eye">
            <input id="ca-pass" type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="eye" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <I.EyeOff /> : <I.Eye />}
            </button>
          </span>
          <span className="onb-strength" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <span key={i} className={lvl >= i ? "on" : ""} />
            ))}
          </span>
          <span className="onb-note">8 or more characters. A short phrase is easy to remember.</span>
        </Field>
      ) : null}

      <Terms agreed={agreed} setAgreed={setAgreed} />
      <Problem>{error}</Problem>
    </Onb>
  );
}
