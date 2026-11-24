import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { Gold, Onb, Problem } from "../../ui/onb";
import { I } from "../../ui/ob";
import { useAuth } from "../../auth/AuthProvider";
import { functions } from "../../lib/firebase";
import { useMemberData } from "../../lib/useMemberData";
import { markCommunitySeen } from "../../lib/signup";

/* The official channels. Each one adds REWARD ALKE once (functions/community.js). */
export const TELEGRAM_URL = "https://t.me/alke_network";
const REWARD = 300;
const CHANNELS = [
  {
    id: "x",
    title: "Follow on X",
    action: "Follow",
    url: "https://x.com/alke_network",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.2-8.3L1.8 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.3 4.7H5.5z" />
      </svg>
    ),
  },
  {
    id: "telegram",
    title: "Join Telegram",
    action: "Join",
    url: TELEGRAM_URL,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.5 3.6 2.9 10.8c-1.3.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.4-1.5zM9.4 13.6l8.9-5.6c.4-.3.8-.1.5.2l-7.4 6.7-.3 3.2z" />
      </svg>
    ),
  },
];

const call = httpsCallable(functions, "alkeCommunity");
const fmt = (n) => (Number(n) || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

/* Step 4: join the official channels. Each follow adds ALKE to the member's
   account right away (once per channel), and the balance shows it. */
export default function JoinCommunity() {
  const { nuruId, member, advance } = useAuth();
  const { allocation } = useMemberData({ allocation: true });
  const [done, setDone] = useState([]);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    call({})
      .then((r) => setDone(r.data?.done || []))
      .catch(() => {});
  }, []);

  const follow = async (c) => {
    // Open the channel first (a tap is needed for the new tab), then record it.
    window.open(c.url, "_blank", "noopener");
    if (done.includes(c.id)) return;
    setBusy(c.id);
    setError(null);
    try {
      await call({ channel: c.id });
      setDone((d) => [...new Set([...d, c.id])]);
    } catch (e) {
      setError(e.message || "Couldn't add your ALKE. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const next = () => {
    markCommunitySeen(nuruId);
    advance();
  };

  const balance = Number(allocation?.locked) || 0;

  return (
    <Onb
      step={4}
      label="Join the community"
      title="Join the community."
      sub={
        <>
          ALKÉ posts every announcement here first. Each one adds ALKE to <span className="onb-mono">{member?.alkerId || "your account"}</span>.
        </>
      }
      footer={<Gold onClick={next}>Next: start my first drill</Gold>}
    >
      {CHANNELS.map((c) => {
        const ok = done.includes(c.id);
        return (
          <div key={c.id} className="onb-panel onb-follow">
            <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span className="onb-follow-ic">{c.icon}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <b style={{ fontSize: 18, fontWeight: 600 }}>{c.title}</b>
                <span className="onb-mono gold">
                  {ok ? `+${REWARD} ALKE added` : `+${REWARD} ALKE`}
                </span>
              </span>
            </span>
            <button type="button" className={ok ? "onb-btn done" : "onb-btn cream"} onClick={() => follow(c)} disabled={busy === c.id}>
              {busy === c.id ? <span className="onb-spin" /> : ok ? <I.Check size={18} /> : null}
              {ok ? (c.id === "x" ? "Following" : "Joined") : c.action}
            </button>
          </div>
        );
      })}

      <Problem>{error}</Problem>

      <p className="onb-balance" aria-live="polite">
        Balance <span className="onb-mono">{fmt(balance)} ALKE</span>
      </p>
      <p className="onb-note">Participation rewards are provisional. They are not currently transferable or redeemable blockchain coins.</p>
    </Onb>
  );
}
