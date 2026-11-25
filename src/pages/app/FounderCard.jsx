import { Link } from "react-router-dom";
import { BRACKETS, FOUNDER_INVITES, pctMatch } from "../../lib/genesis";
import { InviteShare } from "./InviteShare";
import { RIG, rigBoost } from "./drillScene";

/* "Invite 10 friends. Become a Founder." Progress counts active invites
   (friends who've completed 3 drills), the same count that grows the rig.
   Founder is a status and a badge for now; the Founder reward is still to
   be decided (don't promise one in the UI until it is).
   During Phase 1 it leads with the invite match: the share of each active
   friend's daily drill reward you also earn, which shrinks bracket by
   bracket as the network grows (lib/genesis.js BRACKETS). */
export function FounderCard({ nuruId, phase, active = 0, bracket = null, members = null, more = true }) {
  const done = active >= FOUNDER_INVITES;
  const n = Math.min(active, FOUNDER_INVITES);
  return (
    <section className="ob-founder" aria-labelledby="founderTitle">
      {bracket?.match ? <InviteMatch bracket={bracket} members={members} /> : null}
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

/** Genesis invite match: this bracket's rate, an example, and how long it lasts. */
function InviteMatch({ bracket, members }) {
  const next = BRACKETS.find((b) => b.n === bracket.n + 1);
  const lo = bracket.drill?.[0];
  const known = Number.isFinite(bracket.upTo) && members != null;
  const left = known ? Math.max(0, bracket.upTo - members) : null;
  const fill = known ? Math.min(1, members / bracket.upTo) : 0;
  return (
    <div className="ob-founder-match">
      <span className="kick">
        Genesis bracket {bracket.n} · invite match
      </span>
      <p className="big">
        Earn <b>{pctMatch(bracket.match)}</b> of every drill your friends make
      </p>
      <p className="ob-founder-sub">
        {lo ? (
          <>
            A friend who drills {lo.toLocaleString("en-US")} ALKE a day earns you <b>+{Math.floor(lo * bracket.match).toLocaleString("en-US")} ALKE</b>, on top of your own
            drill. They lose nothing.
          </>
        ) : (
          <>Paid on top of your own drill. Your friends lose nothing.</>
        )}{" "}
        It counts on days you drill too, once a friend has done 3 drills.
      </p>
      {known ? (
        <div className="bar" aria-label={`${members.toLocaleString("en-US")} of ${bracket.upTo.toLocaleString("en-US")} members`}>
          <span className="track" aria-hidden="true">
            <i style={{ width: `${Math.max(2, fill * 100)}%` }} />
          </span>
          <span className="txt">
            <b>{left.toLocaleString("en-US")}</b> {left === 1 ? "spot" : "spots"} left at {pctMatch(bracket.match)}
            {next ? ` · then ${pctMatch(next.match)}` : ""}
          </span>
        </div>
      ) : (
        <span className="ob-small">{next ? `Drops to ${pctMatch(next.match)} as the network grows.` : "The invite match ends with Phase 1."}</span>
      )}
    </div>
  );
}
