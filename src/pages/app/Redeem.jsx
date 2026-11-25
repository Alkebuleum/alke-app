import { BRACKETS, GENESIS_POOL, PHASES, STREAK_BOOSTS, TAP_BOOST, pctMatch, tapBoost } from "../../lib/genesis";
import { RIG, rigBoost } from "./drillScene";
import { AppPage, Ico, Row, SubBar } from "../../ui/shell";
import { useVerification, verificationLabel } from "../../lib/verification";

/* How to redeem ALKE: the whole journey in one place. Figures come from
   lib/genesis.js (phases, brackets, boosts). */

function Step({ n, title, children }) {
  return (
    <li className="ob-guide-step">
      <span className="num">{n}</span>
      <div className="body">
        <h2>{title}</h2>
        {children}
      </div>
    </li>
  );
}

export default function Redeem() {
  const verification = useVerification();
  return (
    <AppPage tab="drill" bar={<SubBar title="How to redeem ALKE" back="/drill" />}>
      <p className="ob-sub" style={{ margin: "0 4px" }}>
        From your daily drill to redeeming at mainnet, in four steps. The ALKE app never holds crypto.
      </p>

      <ol className="ob-guide">
        <Step n="1" title="Drill ALKE rewards">
          <p>
            Start a drill each day. Early in Genesis each drill earns a fixed reward that shrinks as the network grows; after that, everyone with a verified drill
            shares that day's pool, up to a per-member maximum. Your <b>ALKE rewards</b> build up in the app: not transferable until they're redeemable.
          </p>
          <ul className="ob-list">
            {PHASES.map((p) => (
              <li key={p.n}>
                <div className="ob-row static" style={{ minHeight: 52 }}>
                  <span className="tx">
                    <b>
                      Phase {p.n} · {p.name}
                    </b>
                    <span>Until {p.untilMembers.toLocaleString("en-US")} members</span>
                  </span>
                  <span className="end" style={{ flexDirection: "column", alignItems: "flex-end", gap: 0 }}>
                    <b className="num">{p.daily.toLocaleString("en-US")} ALKE/day</b>
                    <span style={{ fontSize: 12 }}>max {p.maxPerMember} ALKE each</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p>
            <b>Phase 1 brackets.</b> Each bracket ends at its member count or when its budget is spent. The invite match is what you also earn from each active friend's
            drill; it ends with Phase 1.
          </p>
          <ul className="ob-list">
            {BRACKETS.map((b, i) => {
              const from = i ? BRACKETS[i - 1].upTo + 1 : 1;
              return (
                <li key={b.n}>
                  <div className="ob-row static" style={{ minHeight: 52 }}>
                    <span className="tx">
                      <b>Bracket {b.n}</b>
                      <span>{Number.isFinite(b.upTo) ? `Members ${from.toLocaleString("en-US")}–${b.upTo.toLocaleString("en-US")}` : `${from.toLocaleString("en-US")}+ members`}</span>
                    </span>
                    <span className="end" style={{ flexDirection: "column", alignItems: "flex-end", gap: 0 }}>
                      <b className="num">{b.drill ? `${b.drill[0]}–${b.drill[1]} ALKE/drill` : `Share of ${PHASES[0].daily.toLocaleString("en-US")}/day`}</b>
                      <span style={{ fontSize: 12 }}>{pctMatch(b.match)} invite match</span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <p>
            In a fixed bracket, boosts move you from the low to the high end. After that, boosts earn a bigger share of the same pool: streaks {STREAK_BOOSTS.slice().reverse().map((b) => `×${b.boost} at ${b.days} days`).join(", ")}; your rig ×
            {rigBoost(1)} per level (every {RIG.perLevel} active invites, up to ×{rigBoost(RIG.max)}); and veins up to ×{tapBoost(TAP_BOOST.perDay)} a day. The Genesis
            Program shares {GENESIS_POOL.toLocaleString("en-US")} ALKE in total.
          </p>
          <p className="note">Drills never create new ALKE, and amounts are estimates until verified.</p>
        </Step>

        <Step n="2" title="Invite friends for the invite match">
          <p>
            During Phase 1, each day an active friend drills, you also earn a share of their drill reward, on top of your own. A friend is active once they've completed
            3 drills, and the match counts on days you drill too. It shrinks bracket by bracket and ends with Phase 1.
          </p>
          <p className="note">Only friends you invite directly count. Fake or duplicate accounts break the Participation Rules.</p>
        </Step>

        <Step n="3" title="Verify you're one real person">
          <p>Complete the personhood check (one person, one account) before you redeem. Your ALKE rewards keep building meanwhile. Nothing is lost.</p>
        </Step>

        <Step n="4" title="Redeem at the post-quantum mainnet">
          <p>
            Your ALKE rewards are intended to become redeemable when the ALKÉ post-quantum mainnet launches. How you redeem, and any release schedule, are published in
            the release policy before redemption opens.
          </p>
          <ul className="ob-list">
            <li>
              <Row to="/release-policy" icon={<Ico.Doc />} tone="plain" title="Release policy" end={<span className="ob-pill">Draft</span>} />
            </li>
            <li>
              <Row to="/verify" icon={<Ico.Shield />} tone="plain" title="Your account verified" end={verificationLabel(verification)} />
            </li>
            <li>
              <Row icon={<Ico.Users />} tone="plain" title="Redeeming where you live" end="By region" />
            </li>
          </ul>
          <p className="note">No listing, release date or price is promised.</p>
        </Step>
      </ol>

      <ul className="ob-list">
        <li>
          <Row to="/drill/allocation" icon={<Ico.Wallet />} title="Your ALKE rewards" sub="Drills and invite matches so far" />
        </li>
        <li>
          <Row to="/home" icon={<Ico.Users />} title="Invite friends" sub="Earn the invite match" />
        </li>
      </ul>

      <p className="ob-small center">Game XP is for play and the leaderboards for now. Later, games will also help you drill deeper, along with other contributions.</p>
    </AppPage>
  );
}
