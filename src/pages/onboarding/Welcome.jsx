import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Loading } from "../../ui/kit";
import { Gold, Lockup, Orb } from "../../ui/onb";
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
    <div className="onb onb-welcome">
      <div className="top">
        <Lockup />
        <Link to="/sign-in" className="onb-link" style={{ fontSize: 15, padding: "12px 4px" }}>
          Sign in
        </Link>
      </div>
      <div className="hero">
        <Orb size={200} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <span className="eyebrow">THE NEXT BILLION NETWORK</span>
          <h1>Your place in tomorrow starts here.</h1>
          <p className="onb-sub" style={{ textAlign: "center" }}>
            Join free, take part every day and qualify for ALKE rewards.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Gold to="/sign-up">Join ALKÉ Free</Gold>
        <Link to="/sign-in" className="onb-text-btn">
          I already have an account
        </Link>
        <p className="onb-note center" style={{ fontSize: 12 }}>
          No payment. No crypto wallet needed.
        </p>
      </div>
    </div>
  );
}
