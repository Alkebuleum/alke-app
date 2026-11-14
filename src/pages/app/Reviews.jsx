import { useCallback, useEffect, useState } from "react";
import { decideReview, listReviews } from "../../lib/verification";
import { Button, Notice } from "../../ui/ob";
import { AppPage, SubBar } from "../../ui/shell";

/* The ALKE team's queue of manual personhood reviews (alke_admins only:
   the server refuses everyone else). Photo links last 10 minutes. */
export default function Reviews() {
  const [list, setList] = useState(undefined);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [reasons, setReasons] = useState({});

  const load = useCallback(() => {
    setError(null);
    listReviews()
      .then(setList)
      .catch((e) => {
        setError(e?.message || "Couldn't load reviews.");
        setList([]);
      });
  }, []);
  useEffect(load, [load]);

  const decide = async (id, approve) => {
    setBusy(id);
    try {
      await decideReview({ id, approve, reason: reasons[id] || "" });
      setList((l) => l.filter((r) => r.id !== id));
    } catch (e) {
      setError(e?.message || "Couldn't save the decision.");
    }
    setBusy(null);
  };

  return (
    <AppPage tab="profile" bar={<SubBar title="ID reviews" back="/settings" right={<button type="button" className="ob-textlink" style={{ fontSize: 14 }} onClick={load}>Refresh</button>} />}>
      {error ? <Notice kind="error">{error}</Notice> : null}
      {list === undefined ? <p className="ob-small center">Loading…</p> : null}
      {list && !list.length && !error ? <p className="ob-small center">No reviews waiting.</p> : null}
      {(list || []).map((r) => (
        <section key={r.id} className="ob-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <b>{r.person.name || "No name"}</b>
            <div className="ob-small">
              {r.country} · born {r.person.dob || "?"} · {r.person.idType || "ID"} ending {r.person.idLast4 || "?"}
            </div>
            <div className="ob-small mono">{r.id}{r.submittedAt ? ` · sent ${new Date(r.submittedAt).toLocaleString()}` : ""}</div>
          </div>
          {r.duplicateOf ? <Notice kind="error">This ID is already verified on another account ({r.duplicateOf}). Approving will reject it.</Notice> : null}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
            {r.photos.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" title={p.name}>
                <img src={p.url} alt={p.name} style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 10, background: "#111" }} />
              </a>
            ))}
          </div>
          <div className="ob-input">
            <input
              aria-label="Reason if rejecting"
              placeholder="Reason, if rejecting (the member sees this)"
              value={reasons[r.id] || ""}
              onChange={(e) => setReasons((v) => ({ ...v, [r.id]: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="sm" busy={busy === r.id} disabled={!!busy} onClick={() => decide(r.id, true)} style={{ flex: 1 }}>
              Approve
            </Button>
            <Button size="sm" kind="secondary" disabled={!!busy} onClick={() => decide(r.id, false)} style={{ flex: 1 }}>
              Reject
            </Button>
          </div>
        </section>
      ))}
    </AppPage>
  );
}
