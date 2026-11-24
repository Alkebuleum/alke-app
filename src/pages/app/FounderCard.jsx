import { Link } from "react-router-dom";
import { FOUNDER_INVITES } from "../../lib/genesis";
import { InviteShare } from "./InviteShare";
import { RIG, rigBoost } from "./drillScene";

/* "Invite 10 friends. Become a Founder." Progress counts active invites
   (friends who've completed 3 drills), the same count that grows the rig.
   Founder is a status and a badge for now; the Founder reward is still to
   be decided (don't promise one in the UI until it is). */
export function FounderCard({ nuruId, phase, active = 0, more = true }) {
  const done = active >= FOUNDER_INVITES;
  const n = Math.min(active, FOUNDER_INVITES);
  return (
    <section className="ob-founder" aria-labelledby="founderTitle">
      <h2 id="founderTitle">{done ? "You're an ALKÉ Founder." : `Invite ${FOUNDER_INVITES} friends. Become a Founder.`}</h2>
      <div className="ob-founder-prog" aria-label={`${n} of ${FOUNDER_INVITES} active invites`}>
        <span className="num">
          <b>
            {n}/{FOUNDER_INVITES}
          </b>{" "}
          active
        </span>
        <span className="segs" aria-hidden="true">
          {Array.from({ length: FOUNDER_INVITES }, (_, i) => (
            <i key={i} className={i < n ? "on" : undefined} />
          ))}
        </span>
      </div>
      <p className="ob-founder-sub">
        A friend counts once they've completed 3 drills. Every {RIG.perLevel} also grow your rig: <b>+{Math.round(RIG.step * 100)}% to your daily ALKE share</b>, up to ×{rigBoost(RIG.max)}.
        {more ? (
          <>
            {" "}
            <Link to="/network">How invites work</Link>
          </>
        ) : null}
      </p>
      <InviteShare nuruId={nuruId} phase={phase} />
    </section>
  );
}
