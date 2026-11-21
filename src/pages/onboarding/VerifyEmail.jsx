import { useEffect, useRef, useState } from "react";
import { Field, Gold, Onb, Problem, TextBtn } from "../../ui/onb";
import { checkVerified } from "../../lib/account";
import { useAuth } from "../../auth/AuthProvider";
import { sendEmailCode, verifyEmailCode } from "../../lib/signup";

/* An email + password account that hasn't confirmed its email (made before
   sign-up used codes). A 6-digit code confirms it; Nuru only opens accounts
   with a confirmed email. */
export default function VerifyEmail() {
  const { user, refresh, signOut } = useAuth();
  const email = user?.email || "";
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [wait, setWait] = useState(0);
  const sent = useRef(false);

  const send = async () => {
    setBusy("send");
    setError(null);
    try {
      await sendEmailCode(email);
      setWait(45);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    if (email && !sent.current) {
      sent.current = true;
      send();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    if (!wait) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const submit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return setError("Enter the 6-digit code from the email.");
    setBusy("verify");
    setError(null);
    try {
      await verifyEmailCode(email, code);
      await checkVerified();
      await refresh();
    } catch (e2) {
      setError(e2.message);
      setBusy(null);
    }
  };

  return (
    <Onb
      onBack={signOut}
      label="Confirm your email"
      title="Check your email."
      sub={
        <>
          We sent a 6-digit code to <b>{email || "your inbox"}</b>.
        </>
      }
      onSubmit={submit}
      footer={
        <>
          <Gold type="submit" busy={busy === "verify"} disabled={!!busy || code.length !== 6}>
            Continue
          </Gold>
          <TextBtn onClick={send} disabled={!!busy || wait > 0}>
            {busy === "send" ? "Sending…" : wait ? `Send a new code in ${wait}s` : "Send a new code"}
          </TextBtn>
          <TextBtn onClick={signOut}>Use a different account</TextBtn>
        </>
      }
    >
      <Field id="ve-code" label="Code" help="It can take a minute. Check your spam folder too.">
        <span className="onb-input code">
          <input id="ve-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
        </span>
      </Field>
      <Problem>{error}</Problem>
    </Onb>
  );
}
