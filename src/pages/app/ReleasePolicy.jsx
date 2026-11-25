import { AppPage, SubBar } from "../../ui/shell";

/* The release policy: how ALKE rewards in this app become redeemable at the
   ALKÉ post-quantum mainnet. The redemption and release terms aren't set yet;
   this says what is decided and what isn't.
   Bump POLICY.version (and the date) whenever the text changes. */
export const POLICY = { version: "Draft 3", date: "November 2026", final: false };

const SECTIONS = [
  [
    "Your ALKE rewards",
    [
      "Your daily drills and invite matches are recorded as ALKE rewards, shown to six decimals. They're a record inside this app: not yet a cryptocurrency, they can't be sold, sent or exchanged, and they have no cash value.",
      "The ALKE app never holds or sends crypto and never asks for a wallet.",
    ],
  ],
  [
    "Who can redeem",
    [
      "You've passed the personhood check: one person, one account.",
      "Your account follows the Participation Rules. Accounts that break them (duplicate accounts, fake invites, automated play) can lose their ALKE rewards.",
      "Redeeming is offered only where the law allows it, so availability can depend on where you live.",
    ],
  ],
  [
    "Redeeming at mainnet",
    [
      "ALKE rewards are intended to become redeemable when the ALKÉ post-quantum mainnet launches.",
      "How you redeem, and any release schedule (how long, how often and in what amounts), aren't set yet. They'll be published here before redemption opens, and the terms in force when you redeem are the ones that apply.",
    ],
  ],
  [
    "No promises",
    [
      "No price, exchange listing or launch date is promised. Nothing here is financial advice.",
      "This policy can change before redemption opens. Each version is dated, and you'll be told in the app when it changes.",
    ],
  ],
];

export default function ReleasePolicy() {
  return (
    <AppPage tab="drill" bar={<SubBar title="Release policy" back="/how-to-redeem" />}>
      <div style={{ margin: "0 4px" }}>
        <span className="ob-pill">{POLICY.final ? "Published" : "Draft"}</span>
        <p className="ob-sub" style={{ marginTop: 10 }}>
          How your ALKE rewards become redeemable at the post-quantum mainnet. {POLICY.version} · {POLICY.date}.
        </p>
      </div>
      <ol className="ob-guide">
        {SECTIONS.map(([title, paras], i) => (
          <li className="ob-guide-step" key={title}>
            <span className="num">{i + 1}</span>
            <div className="body">
              <h2>{title}</h2>
              {paras.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </AppPage>
  );
}
