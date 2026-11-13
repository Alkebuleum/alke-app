import { useState } from "react";
import { Button, Heading, I, Notice, Page } from "../../ui/ob";
import { useAuth } from "../../auth/AuthProvider";

/* Shown when the signed-in account can't be opened (nuruAuth refused it,
   the network is down, or the data can't be read). */
export default function AccountProblem() {
  const { error, refresh, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const retry = async () => {
    setBusy(true);
    await refresh();
    setBusy(false);
  };
  return (
    <Page
      bar={<header className="ob-bar" />}
      footer={
        <>
          <Button busy={busy} onClick={retry}>
            Try again
          </Button>
          <Button kind="ghost" onClick={signOut}>
            Sign out
          </Button>
        </>
      }
    >
      <span className="ob-tile danger" style={{ marginTop: 8 }}>
        <I.Alert size={32} />
      </span>
      <Heading
        title="Couldn't open your account"
        sub={
          <>
            Check your connection and try again.
          </>
        }
      />
      <Notice kind="error">{error || "Unknown error."}</Notice>
    </Page>
  );
}
