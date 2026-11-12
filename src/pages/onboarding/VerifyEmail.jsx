import { useEffect, useState } from "react";
import { Button, Icon, Screen, StepHeader } from "../../ui/kit";
import { checkVerified, resendVerification } from "../../lib/account";
import { useAuth } from "../../auth/AuthProvider";

/* Email accounts confirm their address before the account opens. The link
   in the email lands back here; we also re-check whenever the tab regains
   focus, so coming back from the mail app is enough. */
export default function VerifyEmail() {
  const { user, refresh, signOut } = useAuth();
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  const check = async (quiet) => {
    if (!quiet) setBusy("check");
    try {
      if (await checkVerified()) await refresh();
      else if (!quiet) setMsg({ bad: true, text: "Not verified yet. Open the link in the email, then try again." });
    } catch {
      if (!quiet) setMsg({ bad: true, text: "Couldn't check right now. Try again." });
    } finally {
      if (!quiet) setBusy(null);
    }
  };

  useEffect(() => {
    check(true);
    const onFocus = () => check(true);
    window.addEventListener("focus", onFocus);
    const t = setInterval(() => check(true), 5000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    setBusy("resend");
    setMsg(null);
    try {
      await resendVerification();
      setMsg({ text: "Sent. Check your inbox and spam folder." });
      setCooldown(30);
    } catch (e) {
      setMsg({ bad: true, text: e.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <StepHeader step={1} />
      <div className="ui-body">
        <span style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(139,109,255,.16)", color: "var(--lilac)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon.Mail />
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 className="ui-h1">Check your email</h1>
          <p className="ui-lede">
            We sent a link to <b style={{ color: "var(--text)" }}>{user?.email}</b>. Open it to confirm it's you, then come back here.
          </p>
        </div>
        {msg ? (
          <div className={msg.bad ? "ui-alert" : "ui-info"} role="status">
            {msg.text}
          </div>
        ) : null}
      </div>
      <div className="ui-foot">
        <Button busy={busy === "check"} disabled={!!busy} onClick={() => check(false)}>
          I've confirmed my email
        </Button>
        <Button kind="secondary" busy={busy === "resend"} disabled={!!busy || cooldown > 0} onClick={resend}>
          {cooldown ? `Resend in ${cooldown}s` : "Resend the email"}
        </Button>
        <Button kind="ghost" onClick={signOut}>
          Use a different account
        </Button>
      </div>
    </Screen>
  );
}
