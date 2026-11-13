import { useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, sessionRemaining } from "../../lib/member";
import { useMemberData } from "../../lib/useMemberData";
import { AppPage, Ico, SubBar, alke, hhmm, useNow } from "../../ui/shell";

const TABS = [
  ["all", "All"],
  ["session", "Sessions"],
  ["contrib", "Contributions"],
];

const STATUS = {
  pending: ["Pending", "ob-pill dashed"],
  verified: ["Verified", "ob-pill green"],
  locked: ["Locked", "ob-pill accent"],
  recorded: ["Recorded", "ob-pill"],
};

function dayLabel(d, now = new Date()) {
  const k = (x) => x.toDateString();
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (k(d) === k(now)) return "Today";
  if (k(d) === k(y)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

/* Every session the member started (sessions/{n}) plus the server's ledger
   lines (entries/{id}) — amounts appear only once the server sets them. */
export default function History() {
  const { member } = useAuth();
  const { sessions, entries } = useMemberData({ sessions: true, entries: true });
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);
  const now = useNow(30000);

  const items = useMemo(() => {
    const out = [];
    // A server entry for a session (entry.session = n) replaces the bare record.
    const bySession = new Map((entries || []).filter((e) => e.session != null).map((e) => [Number(e.session), e]));
    for (const s of sessions || []) {
      const at = s.startedAt?.toDate?.();
      if (!at) continue;
      const e = bySession.get(s.n);
      const ends = at.getTime() + SESSION_MS;
      out.push({
        key: "s" + s.n,
        kind: "session",
        at,
        title: `Session ${s.n}`,
        sub: e?.label || `Started ${hhmm(at)}`,
        amount: e?.amount,
        status: e?.status || (ends > now && sessionRemaining(member, now) > 0 && s.n === member?.sessionCount ? "recorded" : "pending"),
        breakdown: e?.breakdown,
        batch: e?.batch,
      });
    }
    for (const e of entries || []) {
      if (e.session != null) continue;
      const at = e.at?.toDate?.();
      if (!at) continue;
      out.push({ key: "e" + e.id, kind: e.kind === "session" ? "session" : "contrib", at, title: e.label || "Contribution", sub: e.note || hhmm(at), amount: e.amount, status: e.status || "pending", breakdown: e.breakdown, batch: e.batch });
    }
    out.sort((a, b) => b.at - a.at);
    return out;
  }, [sessions, entries, member, now]);

  const shown = items.filter((i) => filter === "all" || i.kind === filter);
  const groups = [];
  for (const i of shown) {
    const label = dayLabel(i.at);
    if (!groups.length || groups[groups.length - 1].label !== label) groups.push({ label, items: [] });
    groups[groups.length - 1].items.push(i);
  }
  const loading = sessions === undefined;

  return (
    <AppPage tab="mine" bar={<SubBar title="History" back="/mine" />}>
      <div className="ob-seg" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <p className="ob-small center">Loading…</p> : null}
      {!loading && !groups.length ? (
        <div className="ob-empty">
          <span className="ob-tile">
            <Ico.History size={24} />
          </span>
          <b>Nothing here yet</b>
          <p>{filter === "contrib" ? "Lessons and discussions will show here." : "Start a session from Mine."}</p>
        </div>
      ) : null}

      {groups.map((g) => (
        <section key={g.label} className="ob-sec">
          <div className="ob-group">{g.label}</div>
          <ul className="ob-list">
            {g.items.map((i) => {
              const expandable = !!i.breakdown;
              const isOpen = open === i.key;
              const [statusLabel, statusCls] = STATUS[i.status] || [i.status, "ob-pill"];
              return (
                <li key={i.key}>
                  <button
                    type="button"
                    className={expandable ? "ob-row" : "ob-row static"}
                    onClick={() => expandable && setOpen(isOpen ? null : i.key)}
                    aria-expanded={expandable ? isOpen : undefined}
                  >
                    <span className={i.kind === "session" ? "ic" : "ic gold"}>{i.kind === "session" ? <Ico.Hex /> : <Ico.Star />}</span>
                    <span className="tx">
                      <b>{i.title}</b>
                      <span>{i.sub}</span>
                    </span>
                    <span className="end" style={{ flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      {i.amount != null ? <b className="num">{(i.status === "pending" ? "~" : "") + alke(i.amount)}</b> : null}
                      <span className={statusCls}>{statusLabel}</span>
                    </span>
                  </button>
                  {isOpen ? (
                    <div style={{ padding: "0 14px 14px 62px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {(i.breakdown || []).map((b) => (
                        <div key={b.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                          <span style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 600 }}>{b.label}</span>
                            {b.note ? <span style={{ color: "var(--text-3)", fontSize: 12 }}>{b.note}</span> : null}
                          </span>
                          <span className="num">{b.value}</span>
                        </div>
                      ))}
                      {i.batch ? <span className="ob-small">Batch #{i.batch}</span> : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </AppPage>
  );
}
