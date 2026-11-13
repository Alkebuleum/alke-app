import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { I } from "../../ui/ob";
import { AppPage, Ico, Row, Section, SubBar } from "../../ui/shell";
import { RULES } from "../onboarding/Rules";

function maskEmail(e) {
  if (!e || !e.includes("@")) return "";
  const [u, d] = e.split("@");
  return `${u[0]}•••@${d}`;
}

/* Preferences are per device for now (no server setting exists yet). */
function usePref(key, dflt) {
  const k = `alke.pref.${key}`;
  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem(k);
      return s == null ? dflt : s === "1";
    } catch {
      return dflt;
    }
  });
  const set = (next) => {
    setV(next);
    try {
      localStorage.setItem(k, next ? "1" : "0");
    } catch {
      /* private mode */
    }
  };
  return [v, set];
}

function Toggle({ on, onChange, label }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className="ob-toggle" onClick={() => onChange(!on)} />;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const [reminders, setReminders] = usePref("reminders", true);
  const [games, setGames] = usePref("games", false);

  return (
    <AppPage tab="profile" bar={<SubBar title="Settings" back="/profile" />}>
      <Section title="Account">
        <ul className="ob-list">
          <li>
            <Row icon={<Ico.Mail />} tone="plain" title="Email" end={maskEmail(user?.email)} />
          </li>
          <li>
            <Row to="/verify" icon={<Ico.Shield />} tone="plain" title="Personhood check" end="Not yet" />
          </li>
        </ul>
      </Section>

      <Section title="Alerts">
        <ul className="ob-list">
          <li>
            <Row icon={<Ico.Bell size={18} />} tone="plain" title="Session reminders" end={<Toggle on={reminders} onChange={setReminders} label="Session reminders" />} />
          </li>
          <li>
            <Row icon={<Ico.Trophy />} tone="plain" title="Game challenges" end={<Toggle on={games} onChange={setGames} label="Game challenge alerts" />} />
          </li>
        </ul>
      </Section>

      <Section title="Rules">
        <details className="ob-disclosure">
          <summary>
            Participation rules v1
            <I.Chevron />
          </summary>
          <ol className="ob-rules">
            {RULES.map(([t, d], i) => (
              <li key={t}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <b>{t}</b>
                  <span>{d}</span>
                </div>
              </li>
            ))}
          </ol>
        </details>
        <ul className="ob-list">
          <li>
            <Row icon={<Ico.Doc />} tone="plain" title="Release policy" end={<span className="ob-pill">Draft</span>} />
          </li>
        </ul>
      </Section>

      <ul className="ob-list">
        <li>
          <Row onClick={signOut} icon={<Ico.LogOut />} tone="plain" title={<span style={{ color: "var(--danger)" }}>Sign out</span>} />
        </li>
      </ul>

      <p className="ob-small center">ALKE v0.1 · Alkebuleum Technology LLC</p>
    </AppPage>
  );
}
