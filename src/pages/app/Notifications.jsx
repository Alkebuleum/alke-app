import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { clearAll, markAllRead, markRead, useNotifications } from "../../lib/notifications";
import { AppPage, Ico, Row, SubBar } from "../../ui/shell";

const ICONS = { session: Ico.Bell, invite: Ico.Users, verification: Ico.Shield, policy: Ico.Doc, games: Ico.Star };

function when(d) {
  if (!d) return "";
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Notifications() {
  const { nuruId } = useAuth();
  const { items, unread } = useNotifications();
  const navigate = useNavigate();

  // Seen once opened: clear the badge after a moment.
  useEffect(() => {
    if (!unread) return;
    const t = setTimeout(() => markAllRead(nuruId, items).catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, [unread, items, nuruId]);

  const open = (n) => {
    if (!n.read) markRead(nuruId, n.id).catch(() => {});
    if (n.link) navigate(n.link);
  };

  return (
    <AppPage
      tab="home"
      bar={
        <SubBar
          title="Notifications"
          back="/home"
          right={
            items?.length ? (
              <button type="button" className="ob-textlink" style={{ fontSize: 14 }} onClick={() => clearAll(nuruId, items).catch(() => {})}>
                Clear
              </button>
            ) : null
          }
        />
      }
    >
      {items === undefined ? <p className="ob-small center">Loading…</p> : null}
      {items && !items.length ? (
        <div className="ob-empty" style={{ marginTop: 24 }}>
          <span className="ob-tile">
            <Ico.Bell size={24} />
          </span>
          <b>You're all caught up</b>
          <p>Drill reminders, invites and verification updates show here.</p>
        </div>
      ) : null}
      {items?.length ? (
        <ul className="ob-list">
          {items.map((n) => {
            const I = ICONS[n.kind] || Ico.Bell;
            return (
              <li key={n.id}>
                <Row
                  onClick={() => open(n)}
                  icon={<I />}
                  tone={n.read ? "plain" : undefined}
                  title={n.title}
                  sub={n.body}
                  end={
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-3)" }}>
                      {when(n.at?.toDate?.())}
                      {!n.read ? <span aria-label="Unread" style={{ width: 8, height: 8, borderRadius: 4, background: "var(--accent)" }} /> : null}
                    </span>
                  }
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </AppPage>
  );
}
