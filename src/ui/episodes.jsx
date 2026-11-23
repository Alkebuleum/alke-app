import { useState } from "react";
import { EPISODES, markWatched, mmss, watched } from "../lib/episodes";
import { Mark } from "./onb";
import "./episodes.css";

/* The ALKÉ story player: one screen-wide player and the list of episodes.
   Nothing downloads until someone taps play. Videos play inline on iPhone,
   with native controls (and full screen) from there. */
export function Episodes({ start = 0 }) {
  const [i, setI] = useState(start);
  const [playing, setPlaying] = useState(false);
  const [seen, setSeen] = useState(watched);
  const ep = EPISODES[i];

  const pick = (n) => {
    setI(n);
    setPlaying(true);
  };
  const ended = () => {
    setSeen(markWatched(ep.id));
    setPlaying(false);
    if (i < EPISODES.length - 1) setI(i + 1);
  };

  return (
    <div className="ep">
      {playing ? (
        <video
          key={ep.id}
          className="ep-player"
          src={ep.src}
          controls
          autoPlay
          playsInline
          preload="auto"
          onEnded={ended}
          aria-label={`Episode ${ep.n}: ${ep.title}`}
        />
      ) : (
        <button type="button" className="ep-player ep-cover" onClick={() => setPlaying(true)} aria-label={`Play episode ${ep.n}: ${ep.title}, ${mmss(ep.secs)}`}>
          <span className="mark" aria-hidden="true">
            <Mark size={140} color="#FFFFFF" width={3} />
          </span>
          <span className="play" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M8 5.5v13l11-6.5z" fill="#1C1030" />
            </svg>
          </span>
          <span className="n" aria-hidden="true">
            {String(ep.n).padStart(2, "0")}
          </span>
          <span className="len" aria-hidden="true">
            {mmss(ep.secs)}
          </span>
        </button>
      )}
      <div className="ep-now">
        <small>
          EPISODE {ep.n} · {mmss(ep.secs)}
          {seen.has(ep.id) ? " · WATCHED" : ""}
        </small>
        <b>{ep.title}</b>
        {ep.sub ? <span>{ep.sub}</span> : null}
      </div>
      <ul className="ep-list" aria-label="All episodes">
        {EPISODES.map((e, n) => (
          <li key={e.id}>
            <button type="button" className={n === i ? "ep-row on" : "ep-row"} onClick={() => pick(n)} aria-current={n === i ? "true" : undefined}>
              <span className="tile" aria-hidden="true">
                {seen.has(e.id) ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
                  </svg>
                )}
              </span>
              <span className="txt">
                <b>{e.title}</b>
                <small>
                  Episode {e.n} · {mmss(e.secs)}
                  {seen.has(e.id) ? " · watched" : ""}
                </small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
