import { useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { SESSION_MS, sessionRemaining } from "../../lib/member";
import { useMemberData } from "../../lib/useMemberData";
import { AppScreen, Status, SubHeader, alke, card, display, hhmm, mono, tabular, useNow } from "../../ui/app";

const TABS = [
  ["all", "All"],
  ["session", "Sessions"],
  ["contrib", "Contributions"],
];

function dayLabel(d, now = new Date()) {
  const k = (x) => x.toDateString();
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (k(d) === k(now)) return "TODAY";
  if (k(d) === k(y)) return "YESTERDAY · " + d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
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
        title: `Daily session ${s.n}`,
        sub: e?.label || (ends > now ? `Started ${hhmm(at)} · verifies after it ends` : `Started ${hhmm(at)} · awaiting verification`),
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
      out.push({ key: "e" + e.id, kind: e.kind === "session" ? "session" : "contrib", at, title: e.label || "Contribution", sub: e.note || "", amount: e.amount, status: e.status || "pending", breakdown: e.breakdown, batch: e.batch });
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
    <AppScreen tab="mine">
      <SubHeader title="History" back="/mine" />
      <div role="tablist" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 4, padding: 4, borderRadius: 999, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
        {TABS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            style={{ height: 38, border: 0, borderRadius: 999, background: filter === k ? "linear-gradient(135deg,#7A55FA,#5530E8)" : "transparent", boxShadow: filter === k ? "0 6px 16px -6px rgba(110,72,255,.8)" : "none", color: filter === k ? "#FFFFFF" : "#A9A6B6", fontSize: 14, fontWeight: 600 }}
          >
            {label}
          </button>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: "18px", color: "var(--faint)" }}>Every amount shows how it was worked out under Participation Rules v1.</p>

      {loading ? <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>Loading…</p> : null}
      {!loading && !groups.length ? (
        <div style={{ ...card, textAlign: "center", color: "var(--muted)", fontSize: 14, lineHeight: "20px" }}>
          {filter === "contrib" ? "No contributions yet. Lessons, discussions and circles will show here." : "Your history starts with one tap. Start a session from Mine."}
        </div>
      ) : null}

      {groups.map((g) => (
        <section key={g.label} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ margin: 0, ...mono }}>{g.label}</h2>
          <div style={{ ...card, padding: "4px 16px" }}>
            {g.items.map((i, idx) => {
              const expandable = !!i.breakdown;
              const isOpen = open === i.key;
              return (
                <div key={i.key} style={{ borderBottom: idx < g.items.length - 1 ? "1px solid rgba(255,255,255,.06)" : 0 }}>
                  <button
                    type="button"
                    onClick={() => expandable && setOpen(isOpen ? null : i.key)}
                    aria-expanded={expandable ? isOpen : undefined}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 0", border: 0, background: "transparent", color: "inherit", textAlign: "left", cursor: expandable ? "pointer" : "default" }}
                  >
                    <span style={{ width: 36, height: 36, borderRadius: 12, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: i.kind === "session" ? "rgba(139,109,255,.16)" : "rgba(242,198,107,.14)", color: i.kind === "session" ? "#C6B6FF" : "#F2C66B" }}>
                      <svg width="18" height="20" viewBox="0 0 100 112" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" aria-hidden="true">
                        <path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" />
                      </svg>
                    </span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{i.title}</span>
                      <span style={{ fontSize: 12, color: "var(--faint)" }}>{i.sub}</span>
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      {i.amount != null ? <span style={{ ...display, fontSize: 16, ...tabular }}>{(i.status === "pending" ? "~" : "") + alke(i.amount)}</span> : null}
                      <Status kind={i.status} />
                    </span>
                  </button>
                  {isOpen ? (
                    <div style={{ padding: "0 0 14px 48px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {(i.breakdown || []).map((b) => (
                        <div key={b.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                          <span style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 600 }}>{b.label}</span>
                            {b.note ? <span style={{ color: "var(--faint)", fontSize: 12 }}>{b.note}</span> : null}
                          </span>
                          <span style={{ fontFamily: "var(--mono)", ...tabular }}>{b.value}</span>
                        </div>
                      ))}
                      {i.batch ? <span style={{ ...mono, fontSize: 10.5 }}>BATCH #{i.batch}</span> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {!loading && groups.length ? <p style={{ margin: 0, fontSize: 12, textAlign: "center", color: "var(--faint)" }}>All amounts in ALKE. Sessions never mint new ALKE.</p> : null}
    </AppScreen>
  );
}
