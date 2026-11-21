import { Orb } from "../../ui/onb";

/* Brand moment while the account loads; SplashRoute moves on by itself. */
export default function Splash() {
  return (
    <div className="onb onb-splash" role="status" aria-label="ALKÉ Network is loading">
      <Orb size={170} ring={false} />
      <span className="onb-word">
        <b>ALKÉ</b>
        <small>NETWORK</small>
      </span>
      <p className="onb-tagline">THE NEXT BILLION NETWORK</p>
    </div>
  );
}
