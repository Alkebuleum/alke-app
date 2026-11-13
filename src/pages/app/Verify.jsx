import { Bar, Button, Page } from "../../ui/ob";
import { Ico } from "../../ui/shell";

/* Personhood verification isn't live yet. Say so, and say what it will be. */
const METHODS = [
  [Ico.Shield, "AfPass digital ID", "About two minutes"],
  [Ico.Users, "Three member vouches", "From verified members who know you"],
  [Ico.Star, "Liveness check", "A short selfie video, deleted after"],
];

export default function Verify() {
  return (
    <Page bar={<Bar back="/settings" />} footer={<Button to="/home">Back to Home</Button>}>
      <span className="ob-tile" style={{ marginTop: 8 }}>
        <Ico.Shield size={30} />
      </span>
      <div>
        <h1 className="ob-title">Personhood check</h1>
        <p className="ob-sub">One person, one account. Verification opens soon. Until then your sessions stay pending, and nothing is lost.</p>
      </div>
      <section className="ob-sec">
        <div className="ob-group">Planned ways to verify</div>
        <ul className="ob-list">
          {METHODS.map(([I, t, d]) => (
            <li key={t}>
              <div className="ob-row static">
                <span className="ic plain">
                  <I />
                </span>
                <span className="tx">
                  <b>{t}</b>
                  <span>{d}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <p className="ob-small">Your documents and images never appear in ALKÉ Network or on the blockchain.</p>
    </Page>
  );
}
