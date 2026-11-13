import { CONTRIBUTIONS, warmingToday } from "../../lib/contribution";
import { I } from "../../ui/ob";
import { Ico, Row, Section, useNow } from "../../ui/shell";

/* Contributions warm cold ALKE, each kind at its own weight (lib/contribution.js).
   Only games are live today; the others show "Soon". The real calculation runs
   on the server; this is the in-app estimate. */

const ICONS = { invites: Ico.Users, circles: Ico.Users, lessons: Ico.Doc, games: Ico.Star, discussions: Ico.Mail };
const LINKS = { invites: "/network", games: "/games" };

export function WarmingSection({ cold = 0, invites = 0 }) {
  useNow(30000);
  const w = warmingToday({ invites });
  const days = w.total > 0 && cold > 0 ? Math.ceil(cold / w.total) : null;

  return (
    <Section title="Contributions" action={<span className="num">Warming {w.total} / day</span>}>
      <ul className="ob-list">
        {CONTRIBUTIONS.map((c) => {
          const Icon = ICONS[c.id];
          const v = w.values[c.id];
          return (
            <li key={c.id}>
              <Row
                to={c.live ? LINKS[c.id] : undefined}
                icon={<Icon />}
                tone={c.live ? undefined : "plain"}
                title={c.label}
                sub={c.rule}
                end={c.live ? <b className="num">{c.cap ? `${v} / ${c.cap}` : v}</b> : <span className="ob-pill">Soon</span>}
              />
            </li>
          );
        })}
      </ul>
      <p className="ob-small" style={{ padding: "0 4px" }}>
        {days
          ? `At today's rate your cold ALKE fully warms in about ${days} days.`
          : w.games.nextAt
            ? `Earn ${w.games.nextAt - w.games.xp} more game XP today to warm ${w.games.warm ? "another" : "your first"} ALKE.`
            : "You've reached today's maximum from games."}
      </p>
    </Section>
  );
}

export function WarmingRules() {
  return (
    <details className="ob-disclosure">
      <summary>
        How warming works
        <I.Chevron />
      </summary>
      <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>
        <p style={{ margin: 0 }}>Your allocation is cold ALKE. Contributions warm it, and only warmed ALKE converts at listing.</p>
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          {CONTRIBUTIONS.map((c) => (
            <li key={c.id}>
              <b style={{ color: "var(--text)", fontWeight: 600 }}>{c.label}:</b> {c.rule}.
            </li>
          ))}
        </ul>
        <p style={{ margin: 0 }}>Invites count most. Unverified invites, practice runs and mining sessions warm nothing.</p>
      </div>
    </details>
  );
}
