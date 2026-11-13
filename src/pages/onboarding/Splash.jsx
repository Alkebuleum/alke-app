import { Link } from "react-router-dom";
import { Logo, Page } from "../../ui/ob";

/* Brand moment while the account loads; SplashRoute moves on by itself. */
export default function Splash() {
  return (
    <Page center>
      <Link to="/welcome" aria-label="ALKE. Tap to continue" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textDecoration: "none", color: "inherit", margin: "auto 0" }}>
        <Logo size={88} />
        <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: ".04em" }}>ALKE</span>
          <span className="ob-small" style={{ fontSize: 15 }}>Join the network. Shape the future.</span>
        </span>
      </Link>
      <p className="ob-small" style={{ paddingBottom: "var(--safe-bottom)" }}>
        <span className="ob-spin" aria-hidden="true" style={{ display: "inline-block", width: 14, height: 14, verticalAlign: "-2px", marginRight: 8 }} />
        Loading
      </p>
    </Page>
  );
}
