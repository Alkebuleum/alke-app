import { useEffect, useState } from "react";
import { Bar, Button, Heading, I, Notice, Page } from "../../ui/ob";
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
      else if (!quiet) setMsg({ bad: true, text: "Not confirmed yet. Open the link in the email, then try again." });
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
      setMsg({ text: "Sent. Check your spam folder too." });
      setCooldown(30);
    } catch (e) {
      setMsg({ bad: true, text: e.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Page
      bar={<Bar step={1} />}
      footer={
        <>
          <Button busy={busy === "check"} disabled={!!busy} onClick={() => check(false)}>
            I've confirmed my email
          </Button>
          <Button kind="secondary" busy={busy === "resend"} disabled={!!busy || cooldown > 0} onClick={resend}>
            {cooldown ? `Resend in ${cooldown}s` : "Resend email"}
          </Button>
          <Button kind="ghost" onClick={signOut}>
            Use a different account
          </Button>
        </>
      }
    >
      <span className="ob-tile" style={{ marginTop: 8 }}>
        <I.Mail />
      </span>
      <Heading
        title="Check your email"
        sub={
          <>
            We sent a link to <b>{user?.email || "your inbox"}</b>. Tap it to continue.
          </>
        }
      />
      {msg ? <Notice kind={msg.bad ? "error" : "success"}>{msg.text}</Notice> : null}
    </Page>
  );
}
