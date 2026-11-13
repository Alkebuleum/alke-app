import { CONTRIBUTIONS } from "../../lib/contribution";
import { AppPage, Ico, Row, SubBar } from "../../ui/shell";

/* How to redeem ALKE: the whole journey in one place — mining cold ALKE,
   warming it with contributions (and their weights), verification, the
   conversion to hot ALKE and claiming. Weights come from lib/contribution.js. */

const EX = { cold: 1000, invites: 2, games: 3 };
const exRate = EX.invites * 10 + EX.games;

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
    <AppPage tab="mine" bar={<SubBar title="How to redeem ALKE" back="/mine/allocation" />}>
      <p className="ob-sub" style={{ margin: "0 4px" }}>
        From your daily session to ALKE in your wallet, in five steps.
      </p>

      <ol className="ob-guide">
        <Step n="1" title="Mine cold ALKE">
          <p>
            Start a session each day. Once a day is verified, you're allocated a share of ALKE's existing community allocation, within the published daily budget. It
            arrives as <b>cold ALKE</b>: locked, not transferable.
          </p>
          <div className="ob-flow" aria-label="Allocation stages">
            {["Pending", "Verified", "Locked (cold)"].map((s, i) => (
              <span key={s}>
                {i ? <Ico.Chevron size={14} /> : null}
                <b>{s}</b>
              </span>
            ))}
          </div>
          <p className="note">Sessions never create new ALKE, and amounts are estimates until verified.</p>
        </Step>

        <Step n="2" title="Warm it with contributions">
          <p>Contributions warm your cold ALKE every day. Each kind has its own weight, and invites count most.</p>
          <ul className="ob-list">
            {CONTRIBUTIONS.map((c) => (
              <li key={c.id}>
                <div className="ob-row static" style={{ minHeight: 48 }}>
                  <span className="tx">
                    <b>{c.label}</b>
                    <span>{c.rule}</span>
                  </span>
                  <span className="end">
                    <b className="num">{c.cap ? `max ${c.cap}` : `${c.per} each`}</b>
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="ob-formula">Warmed per day = invites × 10 + lessons + games + discussions</div>
          <p>
            <b>Example:</b> {EX.cold.toLocaleString()} cold ALKE, {EX.invites} verified invites and a full day of games warms {exRate} a day, so it's fully warm in about{" "}
            {Math.ceil(EX.cold / exRate)} days.
          </p>
          <p className="note">Unverified invites, practice runs and mining sessions warm nothing.</p>
        </Step>

        <Step n="3" title="Verify you're one real person">
          <p>Complete the personhood check: one person, one account. Until then, your days stay pending. Nothing is lost.</p>
        </Step>

        <Step n="4" title="Convert to hot ALKE">
          <p>
            Only <b>warmed</b> ALKE converts to hot ALKE, under the published release policy. Cold ALKE that isn't warmed yet stays cold until it is.
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
          <p>
            When ALKE becomes claimable, connect a wallet (Nuru or another) and claim it. A wallet is only needed then. Claimed ALKE is yours to hold or move.
          </p>
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
