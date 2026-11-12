import { useState } from "react";
import { Button, Screen, StepHeader } from "../../ui/kit";
import { useAuth } from "../../auth/AuthProvider";

/* Shown when the signed-in account can't be opened (nuruAuth refused it,
   the network is down, or the data can't be read). */
export default function AccountProblem() {
  const { error, refresh, signOut, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const retry = async () => {
    setBusy(true);
    await refresh();
    setBusy(false);
  };
  return (
    <Screen>
      <StepHeader />
      <div className="ui-body">
        <h1 className="ui-h1">We couldn't open your account</h1>
        <p className="ui-lede">
          You're signed in as <b style={{ color: "var(--text)" }}>{user?.email || "your account"}</b>, but the network didn't let us load it.
        </p>
        <div className="ui-alert" role="alert">
          {error || "Unknown error."}
        </div>
      </div>
      <div className="ui-foot">
        <Button busy={busy} onClick={retry}>
          Try again
        </Button>
        <Button kind="ghost" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </Screen>
  );
}
