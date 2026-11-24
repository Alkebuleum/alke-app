import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { openNuruAccount, signOut as accountSignOut, tryNuruHandoff } from "../lib/account";
import { clearMemberHint, setMemberHint } from "../lib/memberHint";
import { initialsOf, watchMember, watchPerson } from "../lib/member";
import { communitySeen } from "../lib/signup";

export const AuthContext = createContext(null);

/* Where the person is in the first run (the six-step card):
   1 email (/sign-up, signed out) · 2 account (/create-account) · 3 Alker ID ·
   4 New Alkers · 5 first session · 6 story (held after step 5, see lib/signup hold). */
export const STEPS = {
  signedOut: "/welcome",
  verifyEmail: "/verify-email",
  profile: "/create-account",
  rules: "/rules",
  alkerId: "/alker-id",
  community: "/new-alkers",
  firstSession: "/first-session",
  done: "/home",
  error: "/account-problem",
};

function stepFor(s) {
  if (!s.user) return "signedOut";
  if (s.needsVerify) return "verifyEmail";
  if (!s.nuruId || s.member === undefined) return s.error ? "error" : null; // null = still loading
  if (!s.member?.username) return "profile";
  if (!s.member.rulesAcceptedAt) return "rules"; // members from before the terms moved into step 2
  if (!s.member.onboardedAt) {
    if (!s.member.alkerId) return "alkerId";
    if (!communitySeen(s.nuruId)) return "community";
    return "firstSession";
  }
  return "done";
}

const needsVerification = (u) => !!u && !u.emailVerified && u.providerData.some((p) => p.providerId === "password");

export function AuthProvider({ children }) {
  const [state, setState] = useState({ ready: false, user: null, needsVerify: false, nuruId: null, person: undefined, member: undefined, error: null });
  const unsubs = useRef([]);
  // Bumped when a device-only step (New Alkers) is done, so the step is worked out again.
  const [advanced, setAdvanced] = useState(0);

  const stopWatching = () => {
    unsubs.current.forEach((u) => u());
    unsubs.current = [];
  };

  const openAccount = useCallback(async (user) => {
    stopWatching();
    if (!user) {
      setState({ ready: true, user: null, needsVerify: false, nuruId: null, person: undefined, member: undefined, error: null });
      return;
    }
    if (needsVerification(user)) {
      setState({ ready: true, user, needsVerify: true, nuruId: null, person: undefined, member: undefined, error: null });
      return;
    }
    setState((s) => ({ ...s, ready: s.ready, user, needsVerify: false, error: null }));
    try {
      const { nuruId } = await openNuruAccount(user);
      const onErr = (e) => setState((s) => ({ ...s, error: e.message || String(e) }));
      unsubs.current.push(watchPerson(nuruId, (person) => setState((s) => ({ ...s, person })), onErr));
      unsubs.current.push(watchMember(nuruId, (member) => setState((s) => ({ ...s, member })), onErr));
      setState((s) => ({ ...s, ready: true, user, nuruId }));
    } catch (e) {
      setState((s) => ({ ...s, ready: true, user, nuruId: null, error: e.message || "Could not open your account." }));
    }
  }, []);

  useEffect(() => {
    let off = () => {};
    let cancelled = false;
    // Inside Nuru, take Nuru's session first so the person never signs in twice.
    tryNuruHandoff().finally(() => {
      if (cancelled) return;
      off = onAuthStateChanged(auth, (u) => openAccount(u));
    });
    return () => {
      cancelled = true;
      off();
      stopWatching();
    };
  }, [openAccount]);

  const value = useMemo(() => {
    const step = state.ready ? stepFor(state) : null;
    const name = state.person?.name || state.user?.displayName || "";
    return {
      ...state,
      step,
      stepPath: step ? STEPS[step] : null,
      displayName: name || "Alker",
      firstName: (name || "Alker").split(/\s+/)[0],
      initials: initialsOf(name, "A"),
      /** Re-checks the account (after verifying an email, or a failed open). */
      refresh: () => openAccount(auth.currentUser),
      /** Re-works out the step after something saved only on this device. */
      advance: () => setAdvanced((n) => n + 1),
      signOut: async () => {
        stopWatching();
        clearMemberHint();
        await accountSignOut();
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, openAccount, advanced]);

  // Tell alke.network a member is signed in here (or no longer is).
  const { step: hintStep, firstName: hintName } = value;
  useEffect(() => {
    if (!state.ready) return;
    if (!state.user) clearMemberHint();
    else if (hintStep === "done") setMemberHint(hintName);
  }, [state.ready, state.user, hintStep, hintName]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
