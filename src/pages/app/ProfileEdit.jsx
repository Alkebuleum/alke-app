import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { AVATAR_COLORS, initialsOf, saveProfile } from "../../lib/member";
import { Button, Field, Notice } from "../../ui/ob";
import { AppPage, SubBar } from "../../ui/shell";

/* Edit the name and avatar colour (saved on the shared Nuru person, so they
   change in Nuru too). */
export default function ProfileEdit() {
  const { nuruId, person, displayName } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(person?.name || displayName || "");
  const [colorIdx, setColorIdx] = useState(() => Math.max(0, AVATAR_COLORS.findIndex((c) => c.tint === person?.emojiColor)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const color = AVATAR_COLORS[colorIdx];
  const trimmed = name.trim();

  const save = async (e) => {
    e.preventDefault();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      await saveProfile(nuruId, { displayName: trimmed, tint: color.tint });
      navigate("/profile");
    } catch (e2) {
      setError(e2?.message || "Couldn't save. Try again.");
      setBusy(false);
    }
  };

  return (
    <AppPage tab="profile" bar={<SubBar title="Edit profile" back="/profile" />}>
      <form className="ob-stack loose" onSubmit={save} noValidate>
        <div className="ob-card" style={{ padding: "20px 12px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <span className="ob-avatar" role="img" aria-label="Avatar preview" style={{ width: 80, height: 80, background: color.hex, fontSize: 28 }}>
            {initialsOf(trimmed, "") || "?"}
          </span>
          <div className="ob-swatches" role="group" aria-label="Avatar colour">
            {AVATAR_COLORS.map((c, i) => (
              <button key={c.tint} type="button" className="ob-swatch" aria-label={`${c.label} avatar`} aria-pressed={i === colorIdx} onClick={() => setColorIdx(i)}>
                <span style={{ background: c.hex }} />
              </button>
            ))}
          </div>
        </div>
        <Field id="pe-name" label="Your name" error={!trimmed ? "Enter the name other members will see." : null} help="Your name and colour are shared with Nuru.">
          <div className={trimmed ? "ob-input" : "ob-input bad"}>
            <input id="pe-name" autoComplete="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </Field>
        {error ? <Notice kind="error">{error}</Notice> : null}
        <Button type="submit" busy={busy} disabled={!trimmed || busy}>
          Save
        </Button>
      </form>
    </AppPage>
  );
}
