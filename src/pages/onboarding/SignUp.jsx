import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { I } from "../../ui/ob";
import { Field, Gold, Invited, Onb, Problem, TextBtn } from "../../ui/onb";
import { isInsideNuru, resetPassword, signInWithEmail, signInWithNuru, signInWithSocial } from "../../lib/account";
import { clearHandedEmail, handedEmail, SITE_URL, usesSiteWelcome } from "../../lib/handoff";
import { sendEmailCode, setSignupState, signupState, verifyEmailCode } from "../../lib/signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const savedInvite = () => {
  try {
    return sessionStorage.getItem("alke.invite") || "";
  } catch {
    return "";
  }
};

function Socials({ busy, run }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {isInsideNuru() ? (
        <button type="button" className="onb-btn violet" disabled={!!busy} onClick={() => run("nuru", signInWithNuru)}>
          {busy === "nuru" ? <span className="onb-spin" /> : null}Continue with Nuru
        </button>
      ) : null}
      <button type="button" className="onb-btn ghost" disabled={!!busy} onClick={() => run("google", () => signInWithSocial("google"))}>
        {busy === "google" ? <span className="onb-spin" /> : <I.Google />}Continue with Google
      </button>
      <button type="button" className="onb-btn ghost" disabled={!!busy} onClick={() => run("apple", () => signInWithSocial("apple"))}>
        {busy === "apple" ? <span className="onb-spin" /> : <I.Apple />}Continue with Apple
      </button>
    </div>
  );
}

/* Step 1 (sign-up): Google / Apple, or the email (filled in when it came from
   alke.network). Email gets a 6-digit code; once it's confirmed, step 2
   creates the account. Nuru only opens accounts with a confirmed email.
   Sign-in uses the same screen without the steps. */
export default function SignUp({ mode = "signup" }) {
  const navigate = useNavigate();
  const signingUp = mode === "signup";
  const [email, setEmail] = useState(() => handedEmail() || signupState().email || "");
  const [phase, setPhase] = useState("email"); // "email" | "code"
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null); // { field?, message }
  const [notice, setNotice] = useState(() => signupState().notice || null);
  const [wait, setWait] = useState(0);
  const codeRef = useRef(null);
  const invite = savedInvite();

  useEffect(() => {
    if (!wait) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);
  useEffect(() => {
    if (phase === "code") codeRef.current?.focus();
  }, [phase]);
  useEffect(() => {
    if (signupState().notice) setSignupState({ notice: null });
  }, []);

  const run = async (what, fn) => {
    setBusy(what);
    setError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      if (!e.cancelled) setError({ field: e.field, message: e.message });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const sendCode = async (e) => {
    e?.preventDefault?.();
    const v = email.trim();
    if (!EMAIL_RE.test(v)) return setError({ field: "email", message: "Enter your email address, like name@example.com." });
    setNotice(null);
    const ok = await run("send", () => sendEmailCode(v));
    if (ok) {
      setPhase("code");
      setCode("");
      setWait(45);
    }
  };

  const checkCode = async (e) => {
    e?.preventDefault?.();
    const c = code.replace(/\D/g, "");
    if (c.length !== 6) return setError({ field: "code", message: "Enter the 6-digit code from the email." });
    await run("verify", async () => {
      const res = await verifyEmailCode(email, c);
      clearHandedEmail();
      if (res.status === "new") {
        setSignupState({ email: email.trim().toLowerCase(), ticket: res.ticket, notice: null });
        navigate("/create-account");
      } else if (res.status === "password") {
        setSignupState({ email: email.trim().toLowerCase(), notice: "You already have an account with this email. Sign in with your password." });
        navigate("/sign-in");
      } else {
        setPhase("email");
        setNotice(`This email signs in with ${res.providers?.includes("apple.com") ? "Apple" : "Google"}. Use that button above.`);
      }
    });
  };

  const signIn = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError({ field: "email", message: "Enter your email address." });
    if (!password) return setError({ field: "password", message: "Enter your password." });
    if (await run("signin", () => signInWithEmail(email, password))) clearHandedEmail();
  };

  const forgot = () => {
    if (!EMAIL_RE.test(email.trim())) return setError({ field: "email", message: "Enter your email first, then tap “Forgot password?”." });
    run("reset", async () => {
      await resetPassword(email);
      setNotice(`If there's an account for ${email.trim()}, a reset link is on its way.`);
    });
  };

  const err = (f) => (error && error.field === f ? error.message : null);
  const general = error && !["email", "code", "password"].includes(error.field) ? error.message : null;
  const back = usesSiteWelcome() ? { onBack: () => window.location.assign(SITE_URL) } : { back: "/welcome" };

  const emailField = (
    <Field id="su-email" label="Email" error={err("email")} help={signingUp ? "Use an email you check. We'll send a code to it." : null}>
      <span className={err("email") ? "onb-input bad" : "onb-input"}>
        <input
          id="su-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false}
          placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err("email")}
        />
      </span>
    </Field>
  );

  /* ── Sign in ── */
  if (!signingUp) {
    return (
      <Onb
        {...back}
        label="Welcome back"
        title="Sign in to ALKÉ."
        onSubmit={signIn}
        footer={
          <>
            <Gold type="submit" busy={busy === "signin"} disabled={!!busy}>
              Sign in
            </Gold>
            <TextBtn to="/sign-up">New to ALKÉ? Join free</TextBtn>
          </>
        }
      >
        {notice ? <p className="onb-sub" role="status">{notice}</p> : null}
        <Socials busy={busy} run={run} />
        <div className="onb-divider">or with email</div>
        {emailField}
        <Field id="si-pass" label="Password" error={err("password")}>
          <span className={err("password") ? "onb-input has-eye bad" : "onb-input has-eye"}>
            <input
              id="si-pass" type={show ? "text" : "password"} autoComplete="current-password" autoFocus={!!email}
              value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!err("password")}
            />
            <button type="button" className="eye" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <I.EyeOff /> : <I.Eye />}
            </button>
          </span>
        </Field>
        <button type="button" className="onb-link" style={{ alignSelf: "flex-start", fontSize: 14 }} onClick={forgot} disabled={!!busy}>
          {busy === "reset" ? "Sending…" : "Forgot password?"}
        </button>
        <Problem>{general}</Problem>
      </Onb>
    );
  }

  /* ── Step 1, code sent ── */
  if (phase === "code") {
    return (
      <Onb
        onBack={() => setPhase("email")}
        step={1}
        label="Your email"
        title="Check your email."
        sub={
          <>
            We sent a 6-digit code to <b>{email.trim()}</b>.{" "}
            <button type="button" className="onb-link" onClick={() => setPhase("email")}>
              Change
            </button>
          </>
        }
        onSubmit={checkCode}
        footer={
          <>
            <Gold type="submit" busy={busy === "verify"} disabled={!!busy || code.replace(/\D/g, "").length !== 6}>
              Continue
            </Gold>
            <TextBtn onClick={() => sendCode()} disabled={!!busy || wait > 0}>
              {busy === "send" ? "Sending…" : wait ? `Send a new code in ${wait}s` : "Send a new code"}
            </TextBtn>
          </>
        }
      >
        <Field id="su-code" label="Code" error={err("code")} help="It can take a minute. Check your spam folder too.">
          <span className={err("code") ? "onb-input code bad" : "onb-input code"}>
            <input
              id="su-code" ref={codeRef} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} aria-invalid={!!err("code")}
            />
          </span>
        </Field>
        <Problem>{general}</Problem>
      </Onb>
    );
  }

  /* ── Step 1 ── */
  return (
    <Onb
      {...back}
      step={1}
      label="Your email"
      title="Join ALKÉ free."
      sub="No payment. No crypto wallet needed."
      onSubmit={sendCode}
      footer={
        <>
          <Gold type="submit" busy={busy === "send"} disabled={!!busy}>
            Send my code
          </Gold>
          <TextBtn to="/sign-in">Already a member? Sign in</TextBtn>
        </>
      }
    >
      {invite ? <Invited /> : null}
      {notice ? <p className="onb-sub" role="status">{notice}</p> : null}
      <Socials busy={busy} run={run} />
      <div className="onb-divider">or with email</div>
      {emailField}
      <Problem>{general}</Problem>
    </Onb>
  );
}
