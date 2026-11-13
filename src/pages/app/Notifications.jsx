import { AppPage, Ico, SubBar } from "../../ui/shell";

/* No notification feed exists yet; show an honest empty state. */
export default function Notifications() {
  return (
    <AppPage tab="home" bar={<SubBar title="Notifications" back="/home" />}>
      <div className="ob-empty" style={{ marginTop: 24 }}>
        <span className="ob-tile">
          <Ico.Bell size={24} />
        </span>
        <b>You're all caught up</b>
        <p>Session reminders and verification updates will show here.</p>
      </div>
    </AppPage>
  );
}
