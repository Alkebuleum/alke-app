import { useCallback, useEffect, useState } from "react";
import { ambassadorAdmin, statusLabel } from "../../lib/ambassador";
import { Button, Notice } from "../../ui/ob";
import { AppPage, SubBar } from "../../ui/shell";

/* The ALKE team's Ambassador applications (alke_admins only: the server
   refuses everyone else). Each decision notifies the applicant and is
   logged (alke_config/ambassadors/log). Pay is never handled here. */

const ACTIONS = [
  ["under_review", "Under review"],
  ["info_required", "Ask for info"],
  ["waitlisted", "Waitlist"],
  ["approved", "Approve"],
  ["rejected", "Reject"],
  ["active", "Activate"],
  ["suspended", "Suspend"],
];

export default function AmbassadorReviews() {
  const [list, setList] = useState(undefined);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notes, setNotes] = useState({});

  const load = useCallback(() => {
    setError(null);
    ambassadorAdmin
      .list()
      .then((r) => setList(r.applications || []))
      .catch((e) => {
        setError(e?.message || "Couldn't load applications.");
        setList([]);
      });
  }, []);
  useEffect(load, [load]);

  const decide = async (id, status) => {
    setBusy(`${id}:${status}`);
    setError(null);
    try {
      await ambassadorAdmin.decide(id, status, notes[id] || "");
      setNotes((n) => ({ ...n, [id]: "" }));
      load();
    } catch (e) {
      setError(e?.message || "Couldn't save the decision.");
    }
    setBusy(null);
  };

  return (
    <AppPage
      tab="profile"
      bar={
        <SubBar
          title="Ambassadors"
          back="/settings"
          right={
            <button type="button" className="ob-textlink" style={{ fontSize: 14 }} onClick={load}>
              Refresh
            </button>
          }
        />
      }
    >
      {error ? <Notice kind="error">{error}</Notice> : null}
      {list === undefined ? <p className="ob-small center">Loading…</p> : null}
      {list && !list.length && !error ? <p className="ob-small center">No applications.</p> : null}
      {(list || []).map((a) => {
        const p = a.application || {};
        const s = a.stats || {};
        return (
          <section key={a.id} className="ob-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <b>{p.fullName || a.id}</b>
              <span className="ob-pill accent">{statusLabel(a.status)}</span>
            </div>
            <div className="ob-small mono">
              {a.ref} · {a.id} · {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : ""}
            </div>
            <div className="ob-small">
              {p.city}, {p.region}, {p.country} · {p.languages} · {p.email}
            </div>
            <div className="ob-small">
              {s.drills ?? "?"} drills · streak {s.streak ?? "?"} · referrals {s.referrals?.qualified ?? "?"} qualified of {s.referrals?.joined ?? "?"}
            </div>
            {[
              ["Experience", p.experience],
              ["Communities", p.communities],
              ["Socials", p.socials],
              ["Why", p.why],
              ["Strategy", p.strategy],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <p key={k} className="ob-small" style={{ margin: 0 }}>
                  <b>{k}:</b> {v}
                </p>
              ))}
            {a.info?.reply ? (
              <Notice>
                Asked: {a.info.request} · Reply: {a.info.reply}
              </Notice>
            ) : null}
            <div className="ob-input">
              <input aria-label="Note to the applicant" placeholder="Note to the applicant (needed to ask for info)" value={notes[a.id] || ""} onChange={(e) => setNotes((n) => ({ ...n, [a.id]: e.target.value }))} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ACTIONS.filter(([st]) => st !== a.status).map(([st, label]) => (
                <Button key={st} kind={st === "approved" || st === "active" ? "primary" : "secondary"} size="sm" busy={busy === `${a.id}:${st}`} onClick={() => decide(a.id, st)}>
                  {label}
                </Button>
              ))}
            </div>
          </section>
        );
      })}
    </AppPage>
  );
}
