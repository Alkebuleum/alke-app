import { useEffect, useMemo, useState } from "react";
import { Button, Field, Icon, Screen } from "../../ui/kit";
import { useAuth } from "../../auth/AuthProvider";
import { AVATAR_COLORS, USERNAME_RE, createMember, initialsOf, normInvite, normUsername, usernameStatus } from "../../lib/member";

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
  const canContinue = (status === "available" || status === "mine") && !busy;

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

  const userMsg =
    status === "invalid"
      ? { bad: true, text: "Use 3 to 20 letters, numbers, dots or underscores." }
      : status === "taken"
        ? { bad: true, text: "That username is taken. Try another." }
        : status === "available" || status === "mine"
          ? { ok: true, text: "Available" }
          : null;

  return (
    <Screen>
      <div className="ui-top">
        <button type="button" className="ui-round" aria-label="Sign out and go back" onClick={signOut}>
          <Icon.Back />
        </button>
        <span className="ui-step">Step 2 of 3</span>
        <span />
      </div>
      <div className="ui-progress" aria-hidden="true">
        <span className="on" />
        <span className="on" />
        <span />
      </div>
      <form className="ui-body" onSubmit={submit} noValidate style={{ gap: 20 }}>
        <h1 className="ui-h1" style={{ fontSize: 30, lineHeight: "34px" }}>
          How should Alkers
          <br />
          know you?
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span role="img" aria-label="Avatar preview" style={{ width: 88, height: 88, flex: "none", borderRadius: "50%", padding: 3, boxSizing: "border-box", background: "linear-gradient(135deg,#FFFFFF,#5E3AFF)" }}>
            <span style={{ width: "100%", height: "100%", borderRadius: "50%", background: color.hex, color: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, border: "3px solid #08070D", boxSizing: "border-box" }}>
              {initialsOf(name, normUsername(username))}
            </span>
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <span className="ui-label">Avatar colour</span>
            <div style={{ display: "flex", gap: 2, marginLeft: -5, flexWrap: "wrap" }}>
              {AVATAR_COLORS.map((c, i) => (
                <button
                  key={c.tint}
                  type="button"
                  aria-label={`${c.label} avatar`}
                  aria-pressed={i === colorIdx}
                  onClick={() => setColorIdx(i)}
                  style={{ width: 44, height: 44, border: 0, background: "transparent", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <span style={{ width: 30, height: 30, borderRadius: "50%", background: c.hex, boxShadow: i === colorIdx ? "0 0 0 3px #08070D, 0 0 0 5px #C6B6FF" : "none" }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <Field id="ps-user" label="Username">
          <div className={userMsg?.bad ? "ui-input bad" : "ui-input"}>
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
            />
          </div>
          {status === "checking" ? <span className="ui-hint">Checking…</span> : null}
          {userMsg?.ok ? (
            <span className="ui-ok">
              <Icon.Check />
              {userMsg.text}
            </span>
          ) : null}
          {userMsg?.bad ? <span className="ui-err">{userMsg.text}</span> : null}
        </Field>

        <Field id="ps-name" label="Display name" optional hint="Shown with your username. The same name appears in Nuru.">
          <input id="ps-name" className="ui-input" autoComplete="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field id="ps-invite" label="Invite code" optional hint="Invites earn recognition, not ALKE.">
          <input
            id="ps-invite"
            className="ui-input mono"
            placeholder="e.g. KOFI-3M8D"
            autoCapitalize="characters"
            value={invite}
            onChange={(e) => setInvite(normInvite(e.target.value))}
          />
        </Field>

        {error ? (
          <div className="ui-alert" role="alert">
            {error}
          </div>
        ) : null}

        <p className="ui-note">Your email stays private. Members see only your username, name and avatar.</p>
        <Button type="submit" busy={busy} disabled={!canContinue}>
          Continue
        </Button>
      </form>
    </Screen>
  );
}
