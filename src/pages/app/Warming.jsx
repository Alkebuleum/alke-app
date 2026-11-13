import { CONTRIBUTIONS, pct, warmingToday } from "../../lib/contribution";
import { Ico, Row, Section, useNow } from "../../ui/shell";

/* Contributions warm cold ALKE, each kind at its own weight (lib/contribution.js).
   Only games are live today; the others show "Soon". The real calculation runs
   on the server; this is the in-app estimate. */

const ICONS = { invites: Ico.Users, lessons: Ico.Doc, games: Ico.Star, discussions: Ico.Mail };
const LINKS = { invites: "/network", games: "/games" };

export function WarmingSection({ cold = 0, invites = 0, serverRate }) {
  useNow(30000);
  const w = warmingToday({ invites });
  const rate = serverRate != null ? Math.max(Number(serverRate) || 0, w.total) : w.total;
  const days = rate > 0 && cold > 0 ? Math.ceil(100 / rate) : null;

  return (
    <Section title="Contributions" action={<span className="num">Warming {pct(rate)} a day</span>}>
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
                end={c.live ? <b className="num">{c.cap ? `${pct(v)} / ${pct(c.cap)}` : pct(v)}</b> : <span className="ob-pill">Soon</span>}
              />
            </li>
          );
        })}
      </ul>
      <p className="ob-small" style={{ padding: "0 4px" }}>
        {days
          ? `At today's rate your cold ALKE fully warms in about ${days} days.`
          : w.games.nextAt
            ? `Earn ${w.games.nextAt - w.games.xp} more game XP today to warm ${w.games.warm ? "another" : "your first"} 0.1%.`
            : "You've reached today's maximum from games."}
      </p>
    </Section>
  );
}
