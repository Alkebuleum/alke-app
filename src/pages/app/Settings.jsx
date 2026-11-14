import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { I } from "../../ui/ob";
import { AppPage, Ico, Row, Section, SubBar } from "../../ui/shell";
import { RULES } from "../onboarding/Rules";
import { enablePush, pushState, usePrefs } from "../../lib/notifications";
import { amIAdmin, useVerification, verificationLabel } from "../../lib/verification";

function maskEmail(e) {
  if (!e || !e.includes("@")) return "";
  const [u, d] = e.split("@");
  return `${u[0]}•••@${d}`;
}

function Toggle({ on, onChange, label }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className="ob-toggle" onClick={() => onChange(!on)} />;
}

const PUSH_TEXT = {
  nuru: ["Delivered by Nuru", "Alerts arrive as Nuru notifications"],
  unsupported: ["Not on this browser", "Add ALKE to your home screen, or use it in Nuru"],
  denied: ["Blocked", "Allow notifications for app.alke.network in your browser settings"],
  granted: ["On", "This device gets alerts"],
  default: ["Turn on", "Get alerts on this device"],
};

export default function Settings() {
  const { user, nuruId, signOut } = useAuth();
  const [prefs, setPref] = usePrefs();
  const verification = useVerification();
  const [push, setPush] = useState(pushState);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let live = true;
    amIAdmin()
      .then((a) => live && setAdmin(a))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const turnOnPush = async () => {
    if (push !== "default") return;
    try {
      setPush(await enablePush(nuruId));
    } catch {
      setPush(pushState());
    }
  };
  const [pushEnd, pushSub] = PUSH_TEXT[push] || PUSH_TEXT.default;

  return (
    <AppPage tab="profile" bar={<SubBar title="Settings" back="/profile" />}>
      <Section title="Account">
        <ul className="ob-list">
          <li>
            <Row icon={<Ico.Mail />} tone="plain" title="Email" end={maskEmail(user?.email)} />
          </li>
          <li>
            <Row to="/profile/edit" icon={<Ico.Users />} tone="plain" title="Name and avatar" />
          </li>
          <li>
            <Row to="/verify" icon={<Ico.Shield />} tone="plain" title="Personhood check" end={verificationLabel(verification)} />
          </li>
        </ul>
      </Section>

      <Section title="Alerts">
        <ul className="ob-list">
          <li>
            <Row
              onClick={push === "default" ? turnOnPush : undefined}
              icon={<Ico.Bell size={18} />}
              tone="plain"
              title="Notifications on this device"
              sub={pushSub}
              end={<span className={push === "granted" || push === "nuru" ? "ob-pill accent" : "ob-pill"}>{pushEnd}</span>}
            />
          </li>
          <li>
            <Row
              icon={<Ico.Bell size={18} />}
              tone="plain"
              title="Session reminders"
              sub="When your next session is ready"
              end={<Toggle on={!!prefs.reminders} onChange={(v) => setPref("reminders", v)} label="Session reminders" />}
            />
          </li>
          <li>
            <Row
              icon={<Ico.Trophy />}
              tone="plain"
              title="Game challenges"
              sub="Once a day, when new games are ready"
              end={<Toggle on={!!prefs.games} onChange={(v) => setPref("games", v)} label="Game challenge alerts" />}
            />
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
            <Row to="/release-policy" icon={<Ico.Doc />} tone="plain" title="Release policy" end={<span className="ob-pill">Draft</span>} />
          </li>
        </ul>
      </Section>

      {admin ? (
        <Section title="ALKE team">
          <ul className="ob-list">
            <li>
              <Row to="/team/reviews" icon={<Ico.Shield />} title="ID reviews" sub="Manual personhood checks waiting" />
            </li>
          </ul>
        </Section>
      ) : null}

      <ul className="ob-list">
        <li>
          <Row onClick={signOut} icon={<Ico.LogOut />} tone="plain" title={<span style={{ color: "var(--danger)" }}>Sign out</span>} />
        </li>
        <li>
          <Row to="/settings/delete" icon={<Ico.Lock size={16} />} tone="plain" title={<span style={{ color: "var(--danger)" }}>Delete ALKE account</span>} />
        </li>
      </ul>

      <p className="ob-small center">ALKE v0.2 · Alkebuleum Technology LLC</p>
    </AppPage>
  );
}
