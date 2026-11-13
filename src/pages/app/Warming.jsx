import { WARMING, gameWarmingToday } from "../../lib/games";
import { I } from "../../ui/ob";
import { Ico, Section, Stat, useNow } from "../../ui/shell";

/* Warming: verified invites warm cold ALKE (10 a day each); games add a small,
   capped amount (up to 3 a day). Invites outweigh games more than 3 to 1.
   Invites aren't live yet, so the invite count is 0 for now. The real
   calculation runs on the server; this is the in-app estimate. */

export function WarmingSection({ cold = 0, invites = 0 }) {
  useNow(30000);
  const g = gameWarmingToday();
  const rate = invites * WARMING.perInvite + g.warm;
  const days = rate > 0 && cold > 0 ? Math.ceil(cold / rate) : null;

  return (
    <Section title="Warming" action={<span>Today's estimate</span>}>
      <div className="ob-stats">
        <Stat label="Invites" icon={<Ico.Users size={13} />} value={invites * WARMING.perInvite} unit={`${invites} × ${WARMING.perInvite}`} />
        <Stat to="/games" label="Games" icon={<Ico.Star size={13} />} value={g.warm} unit={`of ${g.cap}`} />
        <Stat label="Per day" value={rate} unit="ALKE" />
      </div>
      <p className="ob-small" style={{ padding: "0 4px" }}>
        {days ? `At today's rate your cold ALKE fully warms in about ${days} days.` : g.nextAt ? `Earn ${g.nextAt - g.xp} more game XP today to warm ${g.warm ? "another" : "your first"} ALKE.` : "Invite people you know to warm faster."}
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
        <p style={{ margin: 0 }}>Your allocation is cold ALKE. Only warmed ALKE converts at listing.</p>
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          <li>Each verified invite warms {WARMING.perInvite} a day.</li>
          <li>Games add up to {WARMING.gameCap} a day: 1 for every {WARMING.xpPerUnit} game XP you earn that day.</li>
          <li>Unverified invites, practice runs and mining sessions warm nothing.</li>
        </ul>
        <p style={{ margin: 0, padding: "10px 12px", borderRadius: 10, background: "var(--surface-2)", color: "var(--text)", fontWeight: 600 }}>
          Daily warming = invites × {WARMING.perInvite} + games (max {WARMING.gameCap})
        </p>
      </div>
    </details>
  );
}
