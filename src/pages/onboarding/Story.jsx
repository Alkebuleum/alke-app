import { useNavigate } from "react-router-dom";
import { I } from "../../ui/ob";
import { Gold, Mark, Onb } from "../../ui/onb";
import { hold } from "../../lib/signup";

const EPISODES = [
  ["How ALKÉ works", "Episode 2"],
  ["The road to mainnet", "Episode 3"],
];

/* Step 6: the ALKÉ story, three short episodes (videos still to come). */
export default function Story() {
  const navigate = useNavigate();
  const done = () => {
    hold(null);
    navigate("/home", { replace: true });
  };
  return (
    <Onb
      step={6}
      label="The story"
      title="The ALKÉ story."
      sub="Three short episodes on where ALKÉ comes from and where it's going."
      footer={
        <>
          <Gold onClick={done}>Go to my dashboard</Gold>
          <p className="onb-note center">All three episodes stay on Home.</p>
        </>
      }
    >
      <div className="onb-video" role="img" aria-label="Episode 1: Networks start small. Video to come.">
        <span className="mark" aria-hidden="true">
          <Mark size={140} color="#FFFFFF" width={3} />
        </span>
        <span className="play" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M8 5.5v13l11-6.5z" fill="#1C1030" />
          </svg>
        </span>
        <span className="n" aria-hidden="true">
          01
        </span>
      </div>
      <div className="onb-ep">
        <small>EPISODE 1 · VIDEO TO COME</small>
        <b>Networks start small</b>
      </div>
      <div className="onb-panel onb-list" role="group" aria-label="More episodes" style={{ padding: 0 }}>
        {EPISODES.map(([t, n]) => (
          <div key={t} className="onb-row">
            <span className="tile">
              <I.Book size={18} />
            </span>
            <span className="txt">
              <b>{t}</b>
              <small>{n} · video to come</small>
            </span>
          </div>
        ))}
      </div>
    </Onb>
  );
}
