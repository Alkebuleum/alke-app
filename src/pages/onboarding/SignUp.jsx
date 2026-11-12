import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Field, Icon, Screen, StepHeader } from "../../ui/kit";
import { isInsideNuru, resetPassword, signInWithEmail, signInWithSocial, signUpWithEmail } from "../../lib/account";

/* Step 1: create an account (or sign in). Email + password, Google or Apple.
   What happens next is decided by the account state (AuthProvider), so this
   screen only signs the person in; the router moves them on. */
export default function SignUp({ mode = "signup" }) {
  const signingUp = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(null); // "email" | "google" | "apple" | "reset"
  const [error, setError] = useState(null); // { message, field }
  const [notice, setNotice] = useState(null);

  const run = async (what, fn) => {
    setBusy(what);
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      if (!e.cancelled) setError({ message: e.message, field: e.field });
    } finally {
      setBusy(null);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return setError({ message: "Enter your email address.", field: "email" });
    if (signingUp && password.length < 8) return setError({ message: "Use at least 8 characters for your password.", field: "password" });
    if (!password) return setError({ message: "Enter your password.", field: "password" });
    run("email", () => (signingUp ? signUpWithEmail(email, password) : signInWithEmail(email, password)));
  };

  const forgot = () =>
    run("reset", async () => {
      await resetPassword(email);
      setNotice(`If there's an account for ${email.trim()}, a reset link is on its way.`);
    });

  const fieldErr = (f) => (error && error.field === f ? error.message : null);

  return (
    <Screen>
      <StepHeader back={signingUp ? "/how-it-works" : "/welcome"} step={signingUp ? 1 : null} />
      <form className="ui-body" onSubmit={submit} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 className="ui-h1">{signingUp ? "Create your account" : "Welcome back"}</h1>
          <p className="ui-lede">{signingUp ? "About a minute. No wallet or purchase needed." : "Sign in to pick up where you left off."}</p>
        </div>

        {isInsideNuru() ? <div className="ui-info">Opened from Nuru? Use the same Google, Apple or email login you use in Nuru — it's one account.</div> : null}

        <div className="ui-row2">
          <Button kind="secondary" busy={busy === "google"} disabled={!!busy} onClick={() => run("google", () => signInWithSocial("google"))}>
            {busy === "google" ? null : <Icon.Google />}Google
          </Button>
          <Button kind="secondary" busy={busy === "apple"} disabled={!!busy} onClick={() => run("apple", () => signInWithSocial("apple"))}>
            {busy === "apple" ? null : <Icon.Apple />}Apple
          </Button>
        </div>

        <div className="ui-or">or use email</div>

        <Field id="su-email" label="Email" error={fieldErr("email")}>
          <input
            id="su-email"
            className={fieldErr("email") ? "ui-input bad" : "ui-input"}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field
          id="su-pass"
          label="Password"
          error={fieldErr("password")}
          hint={signingUp ? "At least 8 characters." : null}
        >
          <div className={fieldErr("password") ? "ui-input bad" : "ui-input"}>
            <input
              id="su-pass"
              type={show ? "text" : "password"}
              autoComplete={signingUp ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="ui-eye" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <Icon.EyeOff /> : <Icon.Eye />}
            </button>
          </div>
        </Field>

        {!signingUp ? (
          <div style={{ marginTop: -6 }}>
            <button type="button" className="ui-link" style={{ fontSize: 14 }} onClick={forgot} disabled={!!busy}>
              Forgot password?
            </button>
          </div>
        ) : null}

        {error && !error.field ? (
          <div className="ui-alert" role="alert">
            {error.message}
          </div>
        ) : null}
        {notice ? <div className="ui-info">{notice}</div> : null}

        <Button type="submit" busy={busy === "email"} disabled={!!busy}>
          {signingUp ? "Create account" : "Sign in"}
        </Button>
      </form>

      <div className="ui-foot" style={{ alignItems: "center", gap: 6 }}>
        {signingUp ? (
          <Link to="/sign-in" style={{ display: "flex", alignItems: "center", height: 44, fontSize: 15, fontWeight: 500, color: "var(--soft)", textDecoration: "none" }}>
            Already a member?<span style={{ color: "var(--lilac)", fontWeight: 700, marginLeft: 6 }}>Sign in</span>
          </Link>
        ) : (
          <Link to="/sign-up" style={{ display: "flex", alignItems: "center", height: 44, fontSize: 15, fontWeight: 500, color: "var(--soft)", textDecoration: "none" }}>
            New here?<span style={{ color: "var(--lilac)", fontWeight: 700, marginLeft: 6 }}>Create an account</span>
          </Link>
        )}
        <p className="ui-note">One account across ALKÉ Network and Nuru. Your email stays private.</p>
      </div>
    </Screen>
  );
}
