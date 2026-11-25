import { CONTRIBUTIONS, pct } from "../../lib/contribution";
import { BRACKETS, GENESIS_POOL, PHASES, STREAK_BOOSTS, TAP_BOOST, pctMatch, tapBoost } from "../../lib/genesis";
import { RIG, rigBoost } from "./drillScene";
import { AppPage, Ico, Row, SubBar } from "../../ui/shell";
import { useVerification, verificationLabel } from "../../lib/verification";

/* How to redeem ALKE: the whole journey in one place. Figures come from
   lib/genesis.js (unit, phases, boosts) and lib/contribution.js (warming). */

const EX = { invites: 3, other: 0.6 }; // 3 invites + full games and lessons
const exRate = EX.invites * 1 + EX.other;

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
        From your daily drill to ALKE in Nuru, in five steps. The ALKE app never holds crypto.
      </p>

      <ol className="ob-guide">
        <Step n="1" title="Drill cold ALKE">
          <p>
            Start a drill each day. Early in Genesis each drill earns a fixed reward that shrinks as the network grows; after that, everyone with a verified drill
            shares that day's pool, up to a per-member maximum. Your ALKE arrives as <b>cold ALKE</b>: locked, not transferable.
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

        <Step n="2" title="Warm it with contributions">
          <p>Each day, contributions warm a share of your cold ALKE. Invites count most.</p>
          <ul className="ob-list">
            {CONTRIBUTIONS.map((c) => (
              <li key={c.id}>
                <div className="ob-row static" style={{ minHeight: 48 }}>
                  <span className="tx">
                    <b>{c.label}</b>
                    <span>{c.rule}</span>
                  </span>
                  <span className="end">
                    <b className="num">{c.cap ? `max ${pct(c.cap)}` : `${pct(c.per)} each`}</b>
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="ob-formula">Warmed per day = invites × 1% + lessons + games + discussions</div>
          <p>
            <b>Example:</b> with {EX.invites} verified invites plus full games and lessons, you warm {pct(exRate)} a day and your cold ALKE is fully warm in about{" "}
            {Math.ceil(100 / exRate)} days. With no invites, about {Math.ceil(100 / EX.other)} days.
          </p>
          <p className="note">An invite becomes active once the person you invited has completed 3 drills. Practice runs and drills themselves warm nothing.</p>
        </Step>

        <Step n="3" title="Verify you're one real person">
          <p>Complete the personhood check (one person, one account) before you convert. Your cold ALKE keeps building and warming meanwhile. Nothing is lost.</p>
        </Step>

        <Step n="4" title="Claim it in Nuru">
          <p>
            When claiming opens, open the Nuru app, where you have a wallet, and claim your warm ALKE. It moves to your Nuru wallet one for one. Cold ALKE that isn't
            warmed yet stays cold until it is.
          </p>
          <ul className="ob-list">
            <li>
              <Row to="/release-policy" icon={<Ico.Doc />} tone="plain" title="Release policy" end={<span className="ob-pill">Draft</span>} />
            </li>
            <li>
              <Row to="/verify" icon={<Ico.Shield />} tone="plain" title="Your account verified" end={verificationLabel(verification)} />
            </li>
            <li>
              <Row icon={<Ico.Users />} tone="plain" title="Claiming where you live" end="By region" />
            </li>
          </ul>
        </Step>

        <Step n="5" title="Locked, then released">
          <p>Claimed ALKE starts locked in your Nuru wallet and is released over time, like vesting. The release terms aren't set yet; they're published before claiming opens.</p>
          <p className="note">No listing, release date or price is promised.</p>
        </Step>
      </ol>

      <ul className="ob-list">
        <li>
          <Row to="/drill/allocation" icon={<Ico.Wallet />} title="Your allocation" sub="Pending, verified and locked" />
        </li>
        <li>
          <Row to="/network" icon={<Ico.Users />} title="Invite friends" sub="Your biggest contribution" />
        </li>
      </ul>

      <p className="ob-small center">Game XP never becomes ALKE. It only counts toward warming.</p>
    </AppPage>
  );
}
