import { useEffect, useMemo, useState } from "react";
import { Bar, Button, Field, Heading, Notice, Page } from "../../ui/ob";
import { useAuth } from "../../auth/AuthProvider";
import { AVATAR_COLORS, USERNAME_RE, createMember, initialsOf, inviterName, normInvite, normUsername, usernameStatus } from "../../lib/member";

/* Step 2: username (unique across ALKÉ), display name and avatar colour
   (saved on the shared Nuru person), and an optional invite code. */
export default function ProfileSetup() {
  const { nuruId, person, user, signOut } = useAuth();
  const suggested = useMemo(() => {
    const base = (person?.name || user?.displayName || user?.email?.split("@")[0] || "").toLowerCase();
    return base.replace(/\s+/g, ".").replace(/[^a-z0-9._]/g, "").slice(0, 20);
  }, [person, user]);

  const [username, setUsername] = useState(suggested);
  const [touched, setTouched] = useState(false);
  const [name, setName] = useState(person?.name || user?.displayName || "");
  const [colorIdx, setColorIdx] = useState(() => Math.max(0, AVATAR_COLORS.findIndex((c) => c.tint === person?.emojiColor)));
  const [invite, setInvite] = useState(() => {
    try {
      return sessionStorage.getItem("alke.invite") || "";
    } catch {
      return "";
    }
  });
  const [status, setStatus] = useState(null); // available | taken | mine | invalid | checking | null
  const [inviter, setInviter] = useState(null); // { state: "checking" | "ok" | "bad" | "self", name }

  // Who invited me (the code is their Nuru ID), debounced.
  useEffect(() => {
    const c = normInvite(invite);
    if (!c) return setInviter(null);
    if (c === nuruId) return setInviter({ state: "self" });
    setInviter({ state: "checking" });
    let live = true;
    const t = setTimeout(async () => {
      const name = await inviterName(c);
      if (live) setInviter(name ? { state: "ok", name } : { state: "bad" });
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [invite, nuruId]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Prefill once the Nuru person arrives.
  useEffect(() => {
    if (!touched && suggested) setUsername(suggested);
    if (!name && person?.name) setName(person.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggested, person]);

  // Live availability, debounced.
  useEffect(() => {
    const u = normUsername(username);
    if (!u) return setStatus(null);
    if (!USERNAME_RE.test(u)) return setStatus("invalid");
    setStatus("checking");
    let live = true;
    const t = setTimeout(async () => {
      try {
        const s = await usernameStatus(u, nuruId);
        if (live) setStatus(s);
      } catch {
        if (live) setStatus(null);
      }
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [username, nuruId]);

  const color = AVATAR_COLORS[colorIdx];
  const inviteOk = !inviter || inviter.state === "ok";
  const canContinue = (status === "available" || status === "mine") && inviteOk && !busy;

  const submit = async (e) => {
    e.preventDefault();
    if (!canContinue) return;
    setBusy(true);
    setError(null);
    try {
      await createMember(nuruId, { username, displayName: name, tint: color.tint, invitedBy: invite });
      try {
        sessionStorage.removeItem("alke.invite");
      } catch {
        /* ignore */
      }
      // The router moves on when the member record appears.
    } catch (e2) {
      setError(e2.code === "permission-denied" ? "Couldn't save your profile (permission denied). Try again in a moment." : e2.message);
      setBusy(false);
    }
  };

  const userErr =
    status === "invalid" ? "Use 3 to 20 letters, numbers, dots or underscores." : status === "taken" ? "That username is taken. Try another." : null;
  const userOk = status === "available" || status === "mine" ? "Available" : null;
  const userHelp = status === "checking" ? "Checking…" : null;

  return (
    <Page bar={<Bar onBack={signOut} step={2} />}>
      <Heading title="Set up your profile" />

      <form className="ob-stack loose" onSubmit={submit} noValidate>
        <div className="ob-card" style={{ padding: "20px 12px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <span className="ob-avatar" role="img" aria-label="Avatar preview" style={{ width: 80, height: 80, background: color.hex, fontSize: 28 }}>
            {initialsOf(name, normUsername(username))}
          </span>
          <div className="ob-swatches" role="group" aria-label="Avatar colour">
            {AVATAR_COLORS.map((c, i) => (
              <button key={c.tint} type="button" className="ob-swatch" aria-label={`${c.label} avatar`} aria-pressed={i === colorIdx} onClick={() => setColorIdx(i)}>
                <span style={{ background: c.hex }} />
              </button>
            ))}
          </div>
        </div>

        <Field id="ps-user" label="Username" error={userErr} ok={userOk} help={userHelp}>
          <div className={userErr ? "ob-input bad" : "ob-input"}>
            <span className="pre">@</span>
            <input
              id="ps-user"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => {
                setTouched(true);
                setUsername(e.target.value.toLowerCase().replace(/\s/g, ""));
              }}
              aria-invalid={!!userErr}
            />
          </div>
        </Field>

        <Field id="ps-name" label="Display name" optional>
          <div className="ob-input">
            <input id="ps-name" autoComplete="name" maxLength={60} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </Field>

        <Field id="ps-invite" label="Invite code" optional ok={inviter?.state === "ok" ? `Invited by ${inviter.name}` : null} error={inviter?.state === "bad" ? "No member has that invite code." : inviter?.state === "self" ? "That's your own code." : null} help={inviter?.state === "checking" ? "Checking…" : null}>
          <div className="ob-input mono">
            <input id="ps-invite" placeholder="e.g. AA00000113" autoCapitalize="characters" value={invite} onChange={(e) => setInvite(normInvite(e.target.value))} />
          </div>
        </Field>

        {error ? <Notice kind="error">{error}</Notice> : null}

        <Button type="submit" busy={busy} disabled={!canContinue}>
          Continue
        </Button>
      </form>
    </Page>
  );
}
