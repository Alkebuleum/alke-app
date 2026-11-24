import { useAuth } from "../../auth/AuthProvider";
import { FOUNDER_INVITES } from "../../lib/genesis";
import { AppBar, AppPage, Ico, Row, Section, Stat } from "../../ui/shell";
import { useDrilling } from "./drilling";
import { FounderCard } from "./FounderCard";
import { Lvl } from "./DrillDeeper";
import { RIG, rigBoost, rigName } from "./drillScene";

/* Your network: invite friends (Founder progress and the share buttons),
   what your invites have done for your rig, how invites work, and the
   community chat. The invite code is your Nuru ID; the server counts who
   joined with it and who is active (3 drills). */
export default function Network() {
  const { nuruId } = useAuth();
  const m = useDrilling();
  const phase = `Phase ${m.phase.n} · ${m.phase.name}`;
  const top = m.level >= RIG.max;
  const toNext = top ? 0 : (m.level + 1) * RIG.perLevel - m.activeInvites;

  return (
    <AppPage tab="network" bar={<AppBar title="Network" />}>
      <FounderCard nuruId={nuruId} phase={phase} active={m.activeInvites} more={false} />

      <div className="ob-stats">
        <Stat label="Joined" value={m.joinedInvites} />
        <Stat label="Active" value={m.activeInvites} />
        <Stat label="Rig" value={`×${m.rig.toFixed(2)}`} unit={m.level ? `L${m.level}` : "starter"} />
      </div>

      <Section title="Your rig">
        <ul className="ob-list">
          <li>
            <Row
              to="/drill"
              icon={<Lvl n={m.level} size={30} />}
              tone="plain"
              title={`${rigName(m.level)} · ×${m.rig.toFixed(2)} daily ALKE share`}
              sub={top ? "Top level: your rig is at its biggest" : `${toNext} more active friend${toNext === 1 ? "" : "s"} to Level ${m.level + 1} (×${rigBoost(m.level + 1).toFixed(2)})`}
            />
          </li>
        </ul>
      </Section>

      <Section title="How invites work">
        <ol className="ob-how">
          <li>
            <b>Share your link.</b> Your friend signs up with it, free.
          </li>
          <li>
            <b>They drill 3 times.</b> Then they count as an active invite.
          </li>
          <li>
            <b>Your rig grows.</b> Every {RIG.perLevel} active invites add a level: +{Math.round(RIG.step * 100)}% to your daily ALKE share, up to ×{rigBoost(RIG.max)} at Level {RIG.max}. It's a bigger share of the same daily pool, like a streak.
          </li>
          <li>
            <b>Your ALKE warms.</b> Each active invite warms 1% of your cold ALKE a day.
          </li>
          <li>
            <b>Become a Founder</b> with {FOUNDER_INVITES} active invites: a Founder badge on your profile.
          </li>
        </ol>
        <p className="ob-small">Only friends you invite directly count. Fake or duplicate accounts break the Participation Rules.</p>
      </Section>

      <Section title="Community">
        <ul className="ob-list">
          <li>
            <Row
              to="/chat"
              icon={<Ico.Users />}
              tone="green"
              title="Alkers community chat"
              sub="Shared with the Nuru app"
              end={
                <span className="ob-pill green">
                  <span className="d" />
                  Live
                </span>
              }
            />
          </li>
          <li>
            <Row to="/how-to-redeem" icon={<Ico.Doc />} title="How to redeem ALKE" sub="Drilling, warming and converting, step by step" />
          </li>
        </ul>
      </Section>
    </AppPage>
  );
}
