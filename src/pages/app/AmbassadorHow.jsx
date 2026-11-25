import { estimate, money } from "../../lib/ambassador";
import { Notice } from "../../ui/ob";
import { AppPage, Section, SubBar } from "../../ui/shell";
import { useAmbassador } from "./Ambassador";

/* How the Ambassador Program works: duties, qualifying, pay, applying,
   rules, countries and FAQ. Figures come from the server's settings. */

const EXAMPLES = [
  [25, 0, false],
  [50, 25, false],
  [25, 75, true],
  [100, 200, true],
  [150, 400, true],
  [200, 600, true],
  [250, 625, true],
];

const FAQ = [
  ["Is this a job or a salary?", "No. Pay is performance-based: it depends on verified growth and community work, from zero up to the monthly maximum. Nothing is guaranteed."],
  ["Do I have to pay anything?", "Never. There are no application fees, no required ALKE purchases and no deposits."],
  ["Why is Nuru needed?", "Ambassador pay is handled in the Nuru app. You only need Nuru if you're approved as an ambassador; drilling and everything else in ALKE work without it."],
  ["Do registrations count?", "No. A referral counts only once they're a unique, real person who has done the required daily drills and passed fraud checks."],
  ["What about people my referrals invite?", "They're your second generation. Attribution stops there. Second-generation pay is switched off until it's approved by compliance."],
  ["Do referrals from before I'm active earn pay?", "They count toward eligibility and your track record, but they don't earn pay retroactively."],
  ["My country isn't open yet. What now?", "Choose your country in the Ambassador tab to register interest. We'll tell you when it opens."],
];

export default function AmbassadorHow({ preview }) {
  const { data, error } = useAmbassador(preview);
  return (
    <AppPage tab="ambassador" bar={<SubBar title="How it works" back="/ambassador" />}>
      {!data ? error ? <Notice kind="error">{error}</Notice> : <p className="ob-small center">Loading…</p> : <Body config={data.config} />}
    </AppPage>
  );
}

function Body({ config }) {
  const c = config.compensation;
  const e = config.eligibility;
  const q = config.qualifying;
  const open = Object.values(config.countries).filter((v) => v.open);
  return (
    <>
      <ol className="ob-guide">
        <Step n="1" title="What an ambassador does">
          <p>
            Ambassadors grow an informed, active ALKÉ community where they live: they welcome new members, help them understand drilling, run community sessions,
            share approved material and report back to the team. It's community leadership, not just recruiting.
          </p>
        </Step>
        <Step n="2" title="How to qualify">
          <ul className="ob-how">
            <li>
              <b>{e.activeDays} days</b> of active ALKÉ participation
            </li>
            <li>
              <b>{e.directReferrals} qualifying direct referrals</b>: each a unique, real person with {q.drills} daily drills within {q.withinDays} days of joining
            </li>
            <li>
              <b>{e.minAge} or older</b>, living in an open country, account in good standing
            </li>
          </ul>
          <p className="note">Meeting the requirements doesn't guarantee approval.</p>
        </Step>
        <Step n="3" title="How pay works">
          <ul className="ob-list">
            <li>
              <div className="ob-row static">
                <span className="tx">
                  <b>Qualifying direct referral</b>
                  <span>People you invite</span>
                </span>
                <span className="end">
                  <b className="num">{money(c.direct)}</b>
                </span>
              </div>
            </li>
            <li>
              <div className="ob-row static">
                <span className="tx">
                  <b>Qualifying indirect referral</b>
                  <span>{c.indirectEnabled ? "People your referrals invite" : "Not active yet: pending compliance approval"}</span>
                </span>
                <span className="end">
                  <b className="num">{money(c.indirect)}</b>
                </span>
              </div>
            </li>
            <li>
              <div className="ob-row static">
                <span className="tx">
                  <b>Monthly management fee</b>
                  <span>
                    {c.mgmtCombined}+ qualifying referrals with {c.mgmtDirect}+ direct, and the month's assignments done
                  </span>
                </span>
                <span className="end">
                  <b className="num">{money(c.managementFee)}</b>
                </span>
              </div>
            </li>
            <li>
              <div className="ob-row static">
                <span className="tx">
                  <b>Monthly maximum</b>
                  <span>Third generation and beyond: nothing</span>
                </span>
                <span className="end">
                  <b className="num">{money(c.monthlyMax)}</b>
                </span>
              </div>
            </li>
          </ul>
          <div className="ob-formula">Monthly pay = direct + indirect + management fee, up to {money(c.monthlyMax)}</div>
          <table className="ob-amb-table">
            <caption className="ob-small">Examples (qualifying referrals in a month)</caption>
            <thead>
              <tr>
                <th>Direct</th>
                <th>Indirect</th>
                <th>Mgmt</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLES.map(([d, i, mg]) => {
                const x = estimate({ ...c, indirectEnabled: true }, { direct: d, indirect: i, tasksDone: mg });
                return (
                  <tr key={`${d}-${i}`}>
                    <td className="num">{d}</td>
                    <td className="num">{i}</td>
                    <td className="num">{x.mgmt}</td>
                    <td className="num">{money(x.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="note">
            Examples include second-generation pay, which isn't active yet. Pay is performance-based from the Kedo Treasury, approved monthly and paid through the Nuru
            app. Not guaranteed.
          </p>
        </Step>
        <Step n="4" title="How to apply">
          <p>Meet the requirements, then apply from the Ambassador tab with your plan for growing ALKÉ in your community. Track your application there; you'll get a notification and an email at each step.</p>
        </Step>
        <Step n="5" title="If you're approved">
          <p>Verify your identity, accept the Ambassador agreement and set up the Nuru app for pay. Then your Ambassador Workspace opens.</p>
        </Step>
      </ol>

      <Section title="Program rules">
        <ul className="ob-how">
          <li>No application fees, ALKE purchases or deposits</li>
          <li>No guaranteed income, and no promises of token prices or listings</li>
          <li>No pay beyond the second referral generation</li>
          <li>No fake, bought or automated sign-ups</li>
          <li>No misleading financial claims; paid promotion must be disclosed</li>
          <li>Other people's personal details stay private</li>
        </ul>
      </Section>

      <Section title="Open countries">
        <p className="ob-small">
          {open.length ? `${open.map((v) => v.name).join(", ")}: pilot with ${open.reduce((a, v) => a + (v.positions || 0), 0)} paid position${open.length === 1 && open[0].positions === 1 ? "" : "s"}.` : "None right now."}{" "}
          More countries and positions open as the program grows.
        </p>
      </Section>

      <Section title="Questions">
        <div className="ob-amb-faq">
          {FAQ.map(([qq, a]) => (
            <details key={qq}>
              <summary>{qq}</summary>
              <p className="ob-small">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      <p className="ob-small center">Lead your community. Grow the network. Powered by Kedo. Paid through Nuru.</p>
    </>
  );
}

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
