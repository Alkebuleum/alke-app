import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { clearAll, markAllRead, markRead, useNotifications } from "../../lib/notifications";
import { AppPage, Ico, Row, SubBar } from "../../ui/shell";

// Each kind gets its icon and tile colour.
const KINDS = {
  session: [Ico.Bell, undefined],
  invite: [Ico.Users, "green"],
  verification: [Ico.Shield, "green"],
  policy: [Ico.Doc, "plain"],
  games: [Ico.Star, "cyan"],
  ambassador: [Ico.Star, "gold"],
};

function when(d) {
  if (!d) return "";
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dayLabel(d, now = new Date()) {
  if (!d) return "Earlier";
  const k = (x) => x.toDateString();
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (k(d) === k(now)) return "Today";
  if (k(d) === k(y)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

/* Notifications: a summary card, then everything grouped by day. Unread ones
   are marked gold and cleared a moment after the page opens. */
export default function Notifications({ demo }) {
  const { nuruId } = useAuth();
  const live = useNotifications();
  const { items, unread } = demo ? { items: demo, unread: demo.filter((n) => !n.read).length } : live;
  const navigate = useNavigate();

  // Seen once opened: clear the badge after a moment.
  useEffect(() => {
    if (demo || !unread) return;
    const t = setTimeout(() => markAllRead(nuruId, items).catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, [demo, unread, items, nuruId]);

  const open = (n) => {
    if (!demo && !n.read) markRead(nuruId, n.id).catch(() => {});
    if (n.link) navigate(n.link);
  };

  const groups = [];
  for (const n of items || []) {
    const label = dayLabel(n.at?.toDate?.());
    if (!groups.length || groups[groups.length - 1].label !== label) groups.push({ label, items: [] });
    groups[groups.length - 1].items.push(n);
  }

  return (
    <AppPage
      tab="home"
      bar={
        <SubBar
          title="Notifications"
          back="/home"
          right={
            items?.length ? (
              <button type="button" className="ob-textlink" style={{ fontSize: 14 }} onClick={() => !demo && clearAll(nuruId, items).catch(() => {})}>
                Clear
              </button>
            ) : null
          }
        />
      }
    >
      <section className="ob-note-hero" aria-label="Notifications summary">
        <span className="lbl">Notifications</span>
        <b>{items === undefined ? "…" : unread ? `${unread} new` : "All caught up"}</b>
        <span className="sub">
          Drill reminders, invites, games and verification updates.{" "}
          <Link to="/settings">Manage alerts</Link>
        </span>
      </section>

      {items === undefined ? <p className="ob-small center">Loading…</p> : null}
      {items && !items.length ? (
        <div className="ob-empty ob-lb-empty">
          <span className="ob-tile">
            <Ico.Bell size={24} />
          </span>
          <b>Nothing yet</b>
          <p>When your next drill is ready, or a friend joins with your link, you'll see it here.</p>
        </div>
      ) : null}

      {groups.map((g) => (
        <section key={g.label} className="ob-sec">
          <div className="ob-group">{g.label}</div>
          <ul className="ob-list ob-notes">
            {g.items.map((n) => {
              const [I, tone] = KINDS[n.kind] || [Ico.Bell, undefined];
              return (
                <li key={n.id} className={n.read ? undefined : "ob-note-new"}>
                  <Row
                    onClick={() => open(n)}
                    icon={<I />}
                    tone={tone}
                    title={n.title}
                    sub={n.body}
                    chevron={false}
                    end={
                      <span className="ob-note-end">
                        <span className="num">{when(n.at?.toDate?.())}</span>
                        {!n.read ? <i aria-label="Unread" /> : null}
                      </span>
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </AppPage>
  );
}
