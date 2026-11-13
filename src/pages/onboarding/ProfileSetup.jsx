import { useEffect, useState } from "react";
import { Bar, Button, Field, Heading, Notice, Page } from "../../ui/ob";
import { useAuth } from "../../auth/AuthProvider";
import { AVATAR_COLORS, createMember, initialsOf, inviterName, normInvite } from "../../lib/member";

/* Step 2: display name and avatar colour (saved on the shared Nuru person),
   and an optional invite code. Members sign up without a wallet, so they get
   no @handle (handles are for wallet users, registered on-chain); the record's
   internal key comes from their Nuru ID (createMember). */
export default function ProfileSetup() {
  const { nuruId, person, user, signOut } = useAuth();
  const [name, setName] = useState(person?.name || user?.displayName || "");
  const [touched, setTouched] = useState(false);
  const [colorIdx, setColorIdx] = useState(() => Math.max(0, AVATAR_COLORS.findIndex((c) => c.tint === person?.emojiColor)));
  const [invite, setInvite] = useState(() => {
    try {
      return sessionStorage.getItem("alke.invite") || "";
    } catch {
      return "";
    }
  });
  const [inviter, setInviter] = useState(null); // { state: "checking" | "ok" | "bad" | "self", name }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Prefill the name once the Nuru person arrives.
  useEffect(() => {
    if (!touched && !name && person?.name) setName(person.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person]);

  // Who invited me (the code is their Nuru ID), debounced.
  useEffect(() => {
    const c = normInvite(invite);
    if (!c) return setInviter(null);
    if (c === nuruId) return setInviter({ state: "self" });
    setInviter({ state: "checking" });
    let live = true;
    const t = setTimeout(async () => {
      const n = await inviterName(c);
      if (live) setInviter(n ? { state: "ok", name: n } : { state: "bad" });
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [invite, nuruId]);

  const color = AVATAR_COLORS[colorIdx];
  const trimmed = name.trim();
  const nameErr = touched && !trimmed ? "Enter the name other members will see." : null;
  const inviteOk = !inviter || inviter.state === "ok";
  const canContinue = !!trimmed && inviteOk && !busy;

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canContinue) return;
    setBusy(true);
    setError(null);
    try {
      await createMember(nuruId, { displayName: trimmed, tint: color.tint, invitedBy: invite });
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

  return (
    <Page bar={<Bar onBack={signOut} step={2} />}>
      <Heading title="Set up your profile" sub="This is how other members will see you." />

      <form className="ob-stack loose" onSubmit={submit} noValidate>
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

        <Field id="ps-name" label="Your name" error={nameErr} help="The same name appears in Nuru.">
          <div className={nameErr ? "ob-input bad" : "ob-input"}>
            <input
              id="ps-name"
              autoComplete="name"
              maxLength={60}
              placeholder="e.g. Amara Mensah"
              value={name}
              onChange={(e) => {
                setTouched(true);
                setName(e.target.value);
              }}
              aria-invalid={!!nameErr}
            />
          </div>
        </Field>

        <Field
          id="ps-invite"
          label="Invite code"
          optional
          ok={inviter?.state === "ok" ? `Invited by ${inviter.name}` : null}
          error={inviter?.state === "bad" ? "No member has that invite code." : inviter?.state === "self" ? "That's your own code." : null}
          help={inviter?.state === "checking" ? "Checking…" : null}
        >
          <div className="ob-input mono">
            <input id="ps-invite" placeholder="e.g. AA00000113" autoCapitalize="characters" value={invite} onChange={(e) => setInvite(normInvite(e.target.value))} />
          </div>
        </Field>

        {error ? <Notice kind="error">{error}</Notice> : null}

        <Button type="submit" busy={busy} disabled={busy}>
          Continue
        </Button>
      </form>
    </Page>
  );
}
