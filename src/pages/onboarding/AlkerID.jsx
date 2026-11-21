import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { I } from "../../ui/ob";
import { Gold, Onb, Problem } from "../../ui/onb";
import { useAuth } from "../../auth/AuthProvider";
import { hold, reserveAlkerId } from "../../lib/signup";
import { copyText } from "../../lib/clipboard";

/* Step 3: the member's reserved Alker ID (ALK-0000-0000-0000). The server
   picks it and keeps it (functions/signup.js); it's a member number, not a
   wallet address, and it's linked to their AIN whenever they have one. */
export default function AlkerID() {
  const { member } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState(member?.alkerId || "");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tries, setTries] = useState(0);

  // Stay on this screen after the ID is saved (that ends the step).
  useEffect(() => {
    hold("alkerId");
  }, []);

  useEffect(() => {
    if (id) return;
    let live = true;
    setError(null);
    reserveAlkerId()
      .then((r) => live && setId(r.alkerId))
      .catch((e) => live && setError(e.message || "Couldn't reserve your Alker ID. Try again."));
    return () => {
      live = false;
    };
  }, [id, tries]);

  useEffect(() => {
    if (!id && member?.alkerId) setId(member.alkerId);
  }, [member, id]);

  const copy = async () => {
    if (await copyText(id).catch(() => false)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const next = () => {
    hold(null);
    navigate("/new-alkers", { replace: true });
  };

  return (
    <Onb
      step={3}
      label="Your Alker ID"
      title="Your Alker ID is reserved."
      sub="Your own member number in ALKÉ. Nobody else can have it."
      footer={
        <>
          <Gold disabled={!id} onClick={next}>
            Continue
          </Gold>
          <p className="onb-note center">You'll find it any time in Profile.</p>
        </>
      }
    >
      <div className="onb-id" aria-live="polite">
        <small>ALKER ID</small>
        {id ? <b>{id}</b> : error ? <b style={{ opacity: 0.4 }}>ALK-····-····-····</b> : <span className="onb-spin" style={{ width: 24, height: 24, color: "#C6B6FF" }} />}
        {id ? (
          <button type="button" className="onb-text-btn" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>

      {error ? (
        <>
          <Problem>{error}</Problem>
          <button type="button" className="onb-btn ghost" onClick={() => setTries((n) => n + 1)}>
            Try again
          </button>
        </>
      ) : null}

      <div className="onb-info">
        <I.Info />
        <p>A member ID, not a wallet address. Nobody can send coins to it. If you set up an ALKÉ wallet later, it's linked to this ID, and the ID is meant to stay with you on the post-quantum network.</p>
      </div>
    </Onb>
  );
}
