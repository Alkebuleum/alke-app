import { Link } from "react-router-dom";
import { EPISODES, mmss, watched } from "../../lib/episodes";

/* The ALKÉ Network series: the episodes as a row of thumbnails that scrolls
   sideways. Tapping one opens the player on that episode. */
export function Series() {
  const seen = watched();
  return (
    <section className="ob-sec" aria-labelledby="seriesTitle">
      <div className="ob-sec-h">
        <h2 id="seriesTitle">The ALKÉ Network series</h2>
        <Link to="/episodes">See all</Link>
      </div>
      <ul className="ob-series">
        {EPISODES.map((e) => (
          <li key={e.id}>
            <Link to={`/episodes?ep=${e.n}`} className="ob-ep" aria-label={`Episode ${e.n}: ${e.title}, ${mmss(e.secs)}${seen.has(e.id) ? ", watched" : ""}`}>
              <span className="thumb">
                <img src={e.poster} alt="" loading="lazy" width="640" height="360" />
                <span className="play" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M8 5.5v13l11-6.5z" fill="#1C1030" />
                  </svg>
                </span>
                <span className="len num">{mmss(e.secs)}</span>
                {seen.has(e.id) ? <span className="seen">Watched</span> : null}
              </span>
              <span className="meta">
                <small>EPISODE {e.n}</small>
                <b>{e.title}</b>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
