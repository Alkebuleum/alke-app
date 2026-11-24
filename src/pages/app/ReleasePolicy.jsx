import { AppPage, SubBar } from "../../ui/shell";

/* The release policy: how cold ALKE in this app becomes ALKE in Nuru.
   The vesting terms aren't set yet; this says what is decided and what isn't.
   Bump POLICY.version (and the date) whenever the text changes. */
export const POLICY = { version: "Draft 2", date: "November 2026", final: false };

const SECTIONS = [
  [
    "What you hold in ALKE",
    [
      "Your drilling and contributions are recorded as cold ALKE, shown to six decimals. Cold ALKE is a record inside this app: it isn't a cryptocurrency, it can't be sold, sent or exchanged, and it has no cash value.",
      "The ALKE app never holds or sends crypto and never asks for a wallet.",
    ],
  ],
  [
    "Warming",
    [
      "Contributions warm a share of your cold ALKE each day: active invites, game XP up to a daily cap and, later, lessons and discussions. Drills record participation but don't warm.",
      "Only warm ALKE can be claimed. Cold ALKE stays cold until it's warmed.",
    ],
  ],
  [
    "Who can claim",
    [
      "You've passed the personhood check: one person, one account.",
      "Your account follows the Participation Rules. Accounts that break them (duplicate accounts, fake invites, automated play) can lose their cold ALKE.",
      "Claiming is offered only where the law allows it, so availability can depend on where you live.",
    ],
  ],
  [
    "Claiming happens in Nuru",
    [
      "When claiming opens, you claim your warm ALKE inside the Nuru app, where you have a wallet. Nuru handles every crypto step.",
      "Claimed ALKE moves to your Nuru wallet one for one.",
    ],
  ],
  [
    "Locked, then released",
    [
      "Claimed ALKE starts locked in your Nuru wallet and is released over time, like vesting.",
      "The release terms (how long, how often and in what amounts) aren't set yet. They'll be published here before claiming opens, and the terms in force when you claim are the ones that apply to that claim.",
    ],
  ],
  [
    "No promises",
    [
      "No price, exchange listing or release date is promised. Nothing here is financial advice.",
      "This policy can change before claiming opens. Each version is dated, and you'll be told in the app when it changes.",
    ],
  ],
];

export default function ReleasePolicy() {
  return (
    <AppPage tab="drill" bar={<SubBar title="Release policy" back="/how-to-redeem" />}>
      <div style={{ margin: "0 4px" }}>
        <span className="ob-pill">{POLICY.final ? "Published" : "Draft"}</span>
        <p className="ob-sub" style={{ marginTop: 10 }}>
          How cold ALKE in this app becomes ALKE in Nuru. {POLICY.version} · {POLICY.date}.
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
