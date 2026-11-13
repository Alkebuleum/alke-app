/* eslint-disable */
// Generated from the ALKE Network App design (16_19_ALKE_Rush_intro.html). Edit the logic freely;
// The layout is hand-built on the app shell (src/ui/shell.jsx).
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";
import { Button, Notice } from "../ui/ob";
import { AppPage, Ico, Row, Section, Stat, SubBar } from "../ui/shell";

const tc = (s) => String(s).split(" · ").map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(" · ");

class Logic extends DCLogic {
  componentDidMount() {
    this._t = setInterval(() => this.setState({ now: Date.now() }), 2000);
  }
  componentWillUnmount() {
    if (this._t) clearInterval(this._t);
  }
  pad(n) { return String(n).padStart(2, '0'); }
  dayKey(d) { return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate()); }
  shift(days) { const d = new Date(); d.setDate(d.getDate() + days); return d; }
  defaultProg() {
    // A new player: no XP, no runs, no history.
    return {
      v: 1, xp: 0, best: 0, streak: 0, lastBank: null,
      day: null, runsToday: 0, chal: { best: 0, done: false, block: false },
      stats: { runs: 0, banks: 0, blocked: 0, hazards: 0 },
      badges: {},
      history: [],
      last: null
    };
  }
  load() {
    try {
      const raw = window.localStorage.getItem('alke.rush.v1');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.v === 1) return Object.assign(this.defaultProg(), p);
      }
    } catch (e) {}
    return this.defaultProg();
  }
  kinds() {
    const I = {
      shield: 'M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z',
      spin: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4',
      streak: 'M12 21c3.9 0 7-2.6 7-6.4 0-3.3-2.2-5.4-3.9-7.2.1 2.1-.9 3.5-2.1 4C13.4 8 11.7 5.1 9.2 3.5c.4 3.1-1.4 4.9-2.7 6.6C5.4 11.5 5 12.8 5 14.6 5 18.4 8.1 21 12 21z',
      trap: 'M3.5 16.5 6 9.5l2.5 7 2.5-7 2.5 7 2.5-7 2.5 7 2.5-7M3.5 19.5h17',
      leak: 'M12 3.5s6 6.4 6 10.4a6 6 0 0 1-12 0c0-4 6-10.4 6-10.4zM8.5 14.5h7',
      drain: 'M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5zM9 12h6',
      reset: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4',
      glitch: 'M4 6.5h9M15.5 6.5H20M4 12h4M10.5 12H20M4 17.5h11M17.5 17.5H20'
    };
    const gold = { fill: '#16132C', edge: 'rgba(242,198,107,.6)', ink: '#F2C66B' };
    const bad = { fill: '#2A0E18', edge: 'rgba(255,138,154,.7)', ink: '#FF8A9A', bad: true };
    return {
      xp20: Object.assign({ name: '+20 XP', label: '+20', fx: 'Adds 20 XP to what you hold', count: 5 }, gold),
      xp50: Object.assign({ name: '+50 XP', label: '+50', fx: 'Adds 50 XP', count: 3 }, gold, { edge: 'rgba(242,198,107,.85)' }),
      xp100: { name: '+100 XP', label: '+100', fx: 'Adds 100 XP', count: 1, fill: '#3A2A12', edge: '#F7D58A', ink: '#FCE7B5' },
      boost: { name: '×2 Boost', label: '×2', fx: 'Doubles your next XP node, stacks to ×4', count: 1, fill: '#201A46', edge: 'rgba(198,182,255,.8)', ink: '#C6B6FF' },
      shield: { name: 'Shield', icon: I.shield, fx: 'Blocks one hazard. Hold up to two', count: 1, fill: '#0F231E', edge: 'rgba(110,231,183,.75)', ink: '#6EE7B7' },
      spin: { name: 'Bonus spin', icon: I.spin, fx: 'One more spin this run', count: 1, fill: '#111B37', edge: 'rgba(143,178,255,.75)', ink: '#8FB2FF' },
      streak: { name: 'Streak bonus', icon: I.streak, fx: '+20 XP per day of your Rush streak, up to +100', count: 1, fill: '#23170D', edge: 'rgba(247,178,103,.75)', ink: '#F7B267' },
      mystery: { name: 'Mystery', label: '?', fx: 'XP, a shield or a spin. Never a hazard', count: 1, fill: '#0D2227', edge: 'rgba(127,233,238,.75)', ink: '#7FE9EE' },
      trap: Object.assign({ name: 'Trap', icon: I.trap, fx: 'Takes all your unbanked XP', count: 1 }, bad),
      leak: Object.assign({ name: 'Leak', icon: I.leak, fx: 'Takes half your unbanked XP', count: 1 }, bad),
      drain: Object.assign({ name: 'Drain', icon: I.drain, fx: 'Takes a shield. Shields can’t stop it', count: 1 }, bad),
      reset: Object.assign({ name: 'Reset', icon: I.reset, fx: 'Unbanked XP, boost and shields back to zero', count: 1 }, bad),
      glitch: Object.assign({ name: 'Network glitch', icon: I.glitch, fx: 'Takes all unbanked XP and ends the run', count: 1 }, bad)
    };
  }
  renderVals() {
    const K = this.kinds();
    const p = this.load();
    const now = new Date();
    const today = this.dayKey(now);
    const yest = this.dayKey(this.shift(-1));
    const isToday = p.day === today;
    const runs = isToday ? p.runsToday || 0 : 0;
    const chal = isToday && p.chal ? p.chal : { best: 0, done: false };
    const streak = p.lastBank === today || p.lastBank === yest ? p.streak || 0 : 0;
    const bankedToday = p.lastBank === today;

    // The preview lattice: a fixed sample layout, with the signal walking a path.
    const layout = ['xp20', 'shield', 'xp50', 'leak', 'xp20', 'boost', 'xp20', 'spin', 'xp50', 'xp100', 'trap', 'xp20', 'reset', 'mystery', 'xp50', 'streak', 'glitch', 'xp20', 'drain'];
    const cells = [];
    for (let r = -2; r <= 2; r++) for (let q = -2; q <= 2; q++) if (Math.abs(q + r) <= 2) cells.push({ q: q, r: r });
    const route = [9, 10, 5, 4, 8, 13, 14, 15];
    const nodes = cells.map((c, i) => {
      const k = K[layout[i]];
      const step = route.indexOf(i);
      return {
        left: (155 + Math.sqrt(3) * 24 * (c.q + c.r / 2) - 20).toFixed(2),
        top: (96 + 36 * c.r - 23).toFixed(2),
        fill: k.fill, edge: k.edge, ink: k.ink,
        label: k.label || '', textDisp: k.label ? 'inline' : 'none',
        fs: k.label === '+100' ? '10' : k.label === '?' ? '14' : '12',
        ty: k.label === '?' ? '5' : '4',
        icon: k.icon || '', iconDisp: k.icon ? 'inline' : 'none',
        anim: step >= 0 ? 'riHop 3.2s ' + (step * 0.4).toFixed(1) + 's linear infinite' : 'none'
      };
    });

    const order = ['xp20', 'xp50', 'xp100', 'boost', 'shield', 'spin', 'streak', 'mystery', 'trap', 'leak', 'drain', 'reset', 'glitch'];
    const spaces = order.map((id, i) => {
      const k = K[id];
      return {
        name: k.name, fx: k.fx, count: String(k.count),
        fill: k.fill, edge: k.edge, ink: k.ink,
        nameInk: k.bad ? '#FF8A9A' : '#F7F5F2',
        label: k.label || '', textDisp: k.label ? 'inline' : 'none',
        fs: k.label === '+100' ? '11' : k.label === '?' ? '16' : '13',
        ty: k.label === '?' ? '5.5' : '4.5',
        icon: k.icon || '', iconDisp: k.icon ? 'inline' : 'none',
        line: i === 0 ? '0' : id === 'trap' ? '1px solid rgba(255,138,154,.22)' : '1px solid rgba(255,255,255,.06)'
      };
    });

    const B = p.badges || {};
    const defs = [
      ['first', 'First Bank', 'Bank a run', 'M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4zM8.5 12.2l2.4 2.4 4.6-4.8'],
      ['cool', 'Cool Head', 'Bank 250+ in one run', 'M12 21a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM12 9.5v4l2.5 1.5M10 2.5h4M18.5 6.5l1.5-1.5'],
      ['firewall', 'Firewall', 'Block 3 hazards', 'M3.5 6.5h17v11h-17zM3.5 12h17M9 6.5V12M15 12v5.5'],
      ['overclock', 'Overclock', 'Stack a ×4 boost', 'M13 2.5 5 13.5h6l-1 8 8-11h-6z'],
      ['close', 'Close Call', 'Bank right after a block', 'M3 12h4l2-5 4 10 2-5h6'],
      ['steady', 'Steady Hand', 'Bank on 5 days in a week', 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4M9 15l2 2 4-4']
    ];
    const badges = defs.map((d) => {
      const on = !!B[d[0]];
      return {
        name: d[1], how: d[2], icon: d[3],
        bg: on ? 'linear-gradient(160deg,rgba(76,214,228,.14),rgba(255,255,255,.02) 70%)' : 'rgba(255,255,255,.03)',
        edge: on ? 'rgba(110,222,232,.32)' : 'rgba(255,255,255,.07)',
        hexFill: on ? 'rgba(76,214,228,.16)' : 'rgba(255,255,255,.03)',
        hexEdge: on ? '#7FE9EE' : 'rgba(255,255,255,.16)',
        ink: on ? '#7FE9EE' : '#6E6A82',
        nameInk: on ? '#F7F5F2' : '#A9A6B6'
      };
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const when = (t) => {
      const d = new Date(t);
      const k = this.dayKey(d);
      const day = k === today ? 'Today' : k === yest ? 'Yesterday' : days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
      return day + ' ' + this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
    };
    const hz = { trap: 'a trap', leak: 'a leak', reset: 'a reset', glitch: 'a glitch', drain: 'a drain' };
    const runsList = (p.history || []).slice(0, 4).map((h, i) => {
      const banked = h.result === 'banked';
      const crashed = h.result === 'crashed';
      const spins = h.spins ? ' · ' + h.spins + (h.spins === 1 ? ' spin' : ' spins') : '';
      return {
        title: (h.practice ? 'Practice · ' : '') + (banked ? 'Banked' : crashed ? 'Run crashed' : h.lost ? 'Lost to ' + (hz[h.hazard] || 'a hazard') : 'Nothing banked'),
        meta: when(h.t) + spins,
        value: banked ? '+' + ((h.xp || 0) + (h.bonus || 0)) : h.lost ? '−' + h.lost : '0',
        ink: banked ? '#F2C66B' : h.lost ? '#FF8A9A' : '#8C8999',
        dot: banked ? '#F2C66B' : 'transparent',
        dotEdge: banked ? '0' : h.lost ? '2px solid #FF8A9A' : '2px solid #6E6A82',
        line: i === 0 ? '0' : '1px solid rgba(255,255,255,.06)'
      };
    });
    if (!runsList.length) runsList.push({ title: 'No runs yet', meta: 'Start a run to see it here', value: '', ink: '#8C8999', dot: 'transparent', dotEdge: '2px solid #6E6A82', line: '0' });

    const sample = [420, 380, 350, 300, 260, 240, 210, 190];
    const best = chal.best || 0;
    const rank = best > 0 ? 1 + sample.filter((v) => v > best).length : 0;
    const left = Math.max(0, 5 - runs);

    return {
      xp: String(p.xp || 0),
      heroTag: left ? 'SCORED RUN ' + (runs + 1) + ' OF 5' : 'PRACTICE · SCORED RUNS DONE',
      ctaLabel: left ? 'Start run' : 'Start a practice run',
      runsNote: left ? left + (left === 1 ? ' scored run' : ' scored runs') + ' left today. Practice is open after that.' : 'Practice runs bank nothing. Scored runs come back at midnight.',
      nodes: nodes,
      chalValue: chal.done ? 'Done' : best + ' / 250',
      chalPct: String(chal.done ? 100 : Math.min(100, Math.round(best / 2.5))),
      streakValue: streak + (streak === 1 ? ' day' : ' days'),
      streakNote: bankedToday ? 'Banked today' : streak ? 'Bank today to keep it' : 'Bank a run to start one',
      rankValue: rank ? '#' + rank : '—',
      rankNote: rank ? 'Best run ' + best + ' XP' : 'Bank a run to rank',
      spaces: spaces,
      badges: badges,
      badgeCount: String(defs.filter((d) => B[d[0]]).length),
      runs: runsList,
      reset: () => {
        try { window.localStorage.removeItem('alke.rush.v1'); } catch (e) {}
        this.setState({ now: Date.now() });
      }
    };
  }
}

export default class RushIntro extends Logic {
  render() {
    const $ = this.vals();
    const earned = Number($.badgeCount);
    const hasRuns = $.runs.length && $.runs[0].title !== "No runs yet";
    return (
      <AppPage
        tab="games"
        bar={
          <SubBar
            title="ALKE Rush"
            back="/games"
            right={
              <span className="ob-pill" style={{ justifySelf: "end", marginRight: 4, color: "var(--cyan)" }}>
                <span className="num">{$.xp}</span> XP
              </span>
            }
          />
        }
      >
        <section className="ob-hero cyan" aria-label="Start a run">
          <div>
            <div className="tag" style={{ color: "var(--cyan)" }}>{tc($.heroTag)}</div>
            <div className="big" style={{ marginTop: 4 }}>Risk it or bank it</div>
            <div className="meta" style={{ marginTop: 4 }}>{$.runsNote}</div>
          </div>
          <div className="foot">
            <span className="ob-small">~1 min · 5 spins</span>
            <Button size="sm" to="/games/rush/play">
              <Ico.Play size={14} />
              {$.ctaLabel}
            </Button>
          </div>
        </section>

        <div className="ob-stats two">
          <div className="ob-stat" style={{ gap: 8 }}>
            <span className="l">Daily challenge · +50 XP</span>
            <span className="v num">{$.chalValue}</span>
            <span className="ob-bar-track" aria-hidden="true">
              <span style={{ width: `${$.chalPct}%` }} />
            </span>
          </div>
          <div className="ob-stat" style={{ gap: 8 }}>
            <span className="l">
              <Ico.Flame size={13} />
              Rush streak
            </span>
            <span className="v">{$.streakValue}</span>
            <span className="ob-small" style={{ fontSize: 12 }}>
              {$.streakNote}
            </span>
          </div>
        </div>

        <Section title="How it plays">
          <ul className="ob-list">
            {[
              ["Stop", "Tap STOP to take the XP the light is on."],
              ["Bank", "Keep what you've stacked. The run ends."],
              ["Risk", "Spin again for more. A hazard takes unbanked XP."],
            ].map(([t, d], i) => (
              <li key={t}>
                <Row icon={<span className="num" style={{ fontWeight: 700, fontSize: 14 }}>{i + 1}</span>} tone="cyan" title={t} sub={d} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Badges" action={<span>{earned} of 6</span>}>
          <div className="ob-badges three">
            {$.badges.map((b) => {
              const on = b.ink === "#7FE9EE";
              return (
                <div key={b.name} className={on ? "ob-badge on" : "ob-badge"} title={b.how}>
                  <span className="b" style={on ? { background: "var(--cyan-soft)", color: "var(--cyan)" } : undefined}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={b.icon} />
                    </svg>
                  </span>
                  {b.name}
                </div>
              );
            })}
          </div>
        </Section>

        {hasRuns ? (
          <Section title="Recent runs">
            <ul className="ob-list">
              {$.runs.map((r, i) => (
                <li key={i}>
                  <Row
                    title={r.title}
                    sub={r.meta}
                    end={<b className="num" style={{ color: r.ink === "#F2C66B" ? "var(--gold)" : r.ink === "#FF8A9A" ? "var(--danger)" : "var(--text-3)" }}>{r.value}</b>}
                  />
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <ul className="ob-list">
          <li>
            <Row to="/games/rush/leaderboards" icon={<Ico.Trophy />} tone="cyan" title="Challenges and leaderboards" sub="Best run today · all time" />
          </li>
        </ul>

        <p className="ob-small center">Game XP never becomes ALKE. It counts as a contribution that warms up to 3 cold ALKE a day.</p>
        {import.meta.env.DEV ? (
          <button type="button" className="ob-btn ghost" onClick={$.reset}>
            Reset progress (dev)
          </button>
        ) : null}
      </AppPage>
    );
  }
}
