import { WarmingRules } from "./Warming";
import { AppBar, AppPage, Ico, Row, Section } from "../../ui/shell";

/* Invitations and circles aren't live yet: say so plainly instead of
   showing sample numbers. */
export default function Network() {
  return (
    <AppPage tab="network" bar={<AppBar title="Network" />}>
      <ul className="ob-list">
        <li>
          <Row to="/chat" icon={<Ico.Users />} title="Alkers community chat" sub="Shared with the Nuru app" end={<span className="ob-pill green"><span className="d" />Live</span>} />
        </li>
      </ul>

      <section className="ob-hero" aria-label="Invite friends">
        <div className="top">
          <span className="ob-tile" style={{ width: 48, height: 48, borderRadius: 14 }}>
            <Ico.Users size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="big" style={{ fontSize: 18 }}>
              Invite friends
            </div>
            <div className="lbl">Your biggest contribution: 10 cold ALKE warmed a day per verified invite</div>
          </div>
        </div>
        <div className="foot">
          <span className="ob-pill accent">Coming soon</span>
          <span className="ob-small">Your invite link will appear here</span>
        </div>
      </section>

      <Section title="Circles">
        <div className="ob-empty">
          <span className="ob-tile">
            <Ico.Users size={24} />
          </span>
          <b>Circles are coming soon</b>
          <p>Small groups to learn and build together.</p>
        </div>
      </Section>

      <WarmingRules />
    </AppPage>
  );
}
