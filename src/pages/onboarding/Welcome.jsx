import { useEffect } from "react";
import { Button, Logo, Page } from "../../ui/ob";
import { Loading } from "../../ui/kit";
import { SITE_URL, usesSiteWelcome } from "../../lib/handoff";

/* On the web, alke.network is the welcome page: a signed-out visitor goes
   there, enters their email and comes back to sign-up with it. This in-app
   welcome stays for the iOS/Android apps and the Nuru app. */
export default function Welcome() {
  const toSite = usesSiteWelcome();
  useEffect(() => {
    if (toSite) window.location.replace(SITE_URL);
  }, [toSite]);
  if (toSite) return <Loading />;

  return (
    <Page
      bar={<header className="ob-bar" />}
      footer={
        <>
          <Button to="/how-it-works">Get started</Button>
          <Button kind="ghost" to="/sign-in">
            I already have an account
          </Button>
        </>
      }
    >
      <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 28 }}>
        <Logo size={96} />
        <div>
          <h1 className="ob-title xl">
            Join the network.
            <br />
            Shape the future.
          </h1>
          <p className="ob-sub">The community home of the Alkebuleum blockchain.</p>
        </div>
      </div>
    </Page>
  );
}
