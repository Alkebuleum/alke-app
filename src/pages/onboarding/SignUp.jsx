import { useState } from "react";
import { Link } from "react-router-dom";
import { Bar, Button, Field, Heading, I, Notice, Page } from "../../ui/ob";
import { isInsideNuru, resetPassword, signInWithEmail, signInWithNuru, signInWithSocial, signUpWithEmail } from "../../lib/account";

/* Step 1: create an account (or sign in). Email + password, Google or Apple.
   What happens next is decided by the account state (AuthProvider), so this
   screen only signs the person in; the router moves them on. */
export default function SignUp({ mode = "signup" }) {
  const signingUp = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(null); // "email" | "google" | "apple" | "reset" | "nuru"
  const inNuru = isInsideNuru();
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
    if (signingUp && password.length < 8) return setError({ message: "Use at least 8 characters.", field: "password" });
    if (!password) return setError({ message: "Enter your password.", field: "password" });
    run("email", () => (signingUp ? signUpWithEmail(email, password) : signInWithEmail(email, password)));
  };

  const forgot = () => {
    if (!email.includes("@")) return setError({ message: "Enter your email first, then tap “Forgot password?”.", field: "email" });
    run("reset", async () => {
      await resetPassword(email);
      setNotice(`If there's an account for ${email.trim()}, a reset link is on its way.`);
    });
  };

  const fieldErr = (f) => (error && error.field === f ? error.message : null);

  return (
    <Page bar={<Bar back={signingUp ? "/how-it-works" : "/welcome"} step={signingUp ? 1 : null} />}>
      <Heading
        title={signingUp ? "Create your account" : "Welcome back"}
        sub={signingUp ? "It takes about a minute." : null}
      />

      <form className="ob-stack loose" onSubmit={submit} noValidate>
        <div className="ob-stack">
          {inNuru ? (
            <Button busy={busy === "nuru"} disabled={!!busy} onClick={() => run("nuru", signInWithNuru)}>
              Continue with Nuru
            </Button>
          ) : null}
          <Button kind="secondary" icon={<I.Google />} busy={busy === "google"} disabled={!!busy} onClick={() => run("google", () => signInWithSocial("google"))}>
            Continue with Google
          </Button>
          <Button kind="secondary" icon={<I.Apple />} busy={busy === "apple"} disabled={!!busy} onClick={() => run("apple", () => signInWithSocial("apple"))}>
            Continue with Apple
          </Button>
        </div>

        <div className="ob-divider">or with email</div>

        <Field id="su-email" label="Email" error={fieldErr("email")}>
          <div className={fieldErr("email") ? "ob-input bad" : "ob-input"}>
            <input
              id="su-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErr("email")}
            />
          </div>
        </Field>

        <Field id="su-pass" label="Password" error={fieldErr("password")}>
          <div className={fieldErr("password") ? "ob-input bad" : "ob-input"}>
            <input
              id="su-pass"
              type={show ? "text" : "password"}
              autoComplete={signingUp ? "new-password" : "current-password"}
              placeholder={signingUp ? "At least 8 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldErr("password")}
            />
            <button type="button" className="ob-icon-btn" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <I.EyeOff /> : <I.Eye />}
            </button>
          </div>
        </Field>

        {!signingUp ? (
          <div style={{ marginTop: -8 }}>
            <button type="button" className="ob-textlink accent" style={{ fontSize: 14 }} onClick={forgot} disabled={!!busy}>
              {busy === "reset" ? "Sending…" : "Forgot password?"}
            </button>
          </div>
        ) : null}

        {error && !error.field ? <Notice kind="error">{error.message}</Notice> : null}
        {notice ? <Notice kind="success">{notice}</Notice> : null}

        <Button type="submit" busy={busy === "email"} disabled={!!busy}>
          {signingUp ? "Create account" : "Sign in"}
        </Button>
      </form>

      <div className="ob-push" style={{ textAlign: "center" }}>
        <p className="ob-small" style={{ fontSize: 15, color: "var(--text-2)" }}>
          {signingUp ? "Already a member? " : "New to ALKÉ? "}
          <Link to={signingUp ? "/sign-in" : "/sign-up"} className="ob-textlink accent" style={{ fontSize: 15, minHeight: 0, display: "inline" }}>
            {signingUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </Page>
  );
}
