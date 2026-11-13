import { CONTRIBUTIONS, pct } from "../../lib/contribution";
import { C_PER_ALKE, GENESIS_POOL, PHASES, STREAK_BOOSTS, fmtC } from "../../lib/genesis";
import { AppPage, Ico, Row, SubBar } from "../../ui/shell";

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
  return (
    <AppPage tab="mine" bar={<SubBar title="How to redeem ALKE" back="/mine" />}>
      <p className="ob-sub" style={{ margin: "0 4px" }}>
        From your daily session to ALKE in your wallet, in five steps.
      </p>

      <ol className="ob-guide">
        <Step n="1" title="Mine cold ALKE">
          <p>
            Start a session each day. Everyone with a verified session shares that day's pool, up to a per-member maximum. Your share arrives as <b>cALKE</b> (cold
            ALKE): locked, not transferable.
          </p>
          <div className="ob-formula">1 ALKE = {fmtC(C_PER_ALKE)} cALKE</div>
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
                    <span style={{ fontSize: 12 }}>max {fmtC(p.maxPerMember * C_PER_ALKE)} cALKE each</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p>
            Streaks earn a bigger share of the same pool: {STREAK_BOOSTS.slice().reverse().map((b) => `×${b.boost} at ${b.days} days`).join(", ")}. The Genesis Program
            shares {GENESIS_POOL.toLocaleString("en-US")} ALKE in total.
          </p>
          <p className="note">Sessions never create new ALKE, and amounts are estimates until verified.</p>
        </Step>

        <Step n="2" title="Warm it with contributions">
          <p>Each day, contributions warm a share of your cALKE. Invites count most.</p>
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
            <b>Example:</b> with {EX.invites} verified invites plus full games and lessons, you warm {pct(exRate)} a day and your cALKE is fully warm in about{" "}
            {Math.ceil(100 / exRate)} days. With no invites, about {Math.ceil(100 / EX.other)} days.
          </p>
          <p className="note">An invite becomes active once the person you invited has completed 3 sessions. Practice runs and mining sessions warm nothing.</p>
        </Step>

        <Step n="3" title="Verify you're one real person">
          <p>Complete the personhood check (one person, one account) before you convert. Your cALKE keeps building and warming meanwhile. Nothing is lost.</p>
        </Step>

        <Step n="4" title="Convert to hot ALKE">
          <p>
            Warmed cALKE converts at {fmtC(C_PER_ALKE)} cALKE = 1 ALKE, under the published release policy. Cold cALKE that isn't warmed yet stays cold until it is.
          </p>
          <ul className="ob-list">
            <li>
              <Row icon={<Ico.Doc />} tone="plain" title="Release policy published" end="Not yet" />
            </li>
            <li>
              <Row to="/verify" icon={<Ico.Shield />} tone="plain" title="Your account verified" end="Not yet" />
            </li>
            <li>
              <Row icon={<Ico.Wallet />} tone="plain" title="Rewards available where you live" end="By region" />
            </li>
          </ul>
          <p className="note">An exchange listing may be one factor the release policy considers. No listing, release date or price is promised.</p>
        </Step>

        <Step n="5" title="Claim to your wallet">
          <p>When ALKE becomes claimable, connect a wallet (Nuru or another) and claim it. A wallet is only needed then.</p>
        </Step>
      </ol>

      <ul className="ob-list">
        <li>
          <Row to="/mine/allocation" icon={<Ico.Wallet />} title="Your allocation" sub="Pending, verified and locked" />
        </li>
        <li>
          <Row to="/network" icon={<Ico.Users />} title="Invite friends" sub="Your biggest contribution" />
        </li>
      </ul>

      <p className="ob-small center">Game XP never becomes ALKE. It only counts toward warming.</p>
    </AppPage>
  );
}
