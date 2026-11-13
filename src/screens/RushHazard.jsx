/* eslint-disable */
// Generated from the ALKE Network App design (20_21_ALKE_Rush_hazard_run_lost_.html). Edit the logic freely;
// The layout is hand-built on the app shell (src/ui/shell.jsx).
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";
import { Bar, Button, Notice, Page } from "../ui/ob";
import { AppPage, Ico, Row, Section, Stat, SubBar } from "../ui/shell";

const tc = (s) => String(s).split(" · ").map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(" · ");

class Logic extends DCLogic {
  load() {
    try {
      const raw = window.localStorage.getItem('alke.rush.v1');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.v === 1) return p;
      }
    } catch (e) {}
    return null;
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
      xp20: Object.assign({ name: '+20 XP', glyph: '+20' }, gold),
      xp50: Object.assign({ name: '+50 XP', glyph: '+50' }, gold),
      xp100: { name: '+100 XP', glyph: '+100', fill: '#3A2A12', edge: '#F7D58A', ink: '#FCE7B5' },
      boost: { name: 'Boost', glyph: '×2', fill: '#201A46', edge: 'rgba(198,182,255,.8)', ink: '#C6B6FF' },
      shield: { name: 'Shield', icon: I.shield, fill: '#0F231E', edge: 'rgba(110,231,183,.75)', ink: '#6EE7B7' },
      spin: { name: 'Bonus spin', icon: I.spin, fill: '#111B37', edge: 'rgba(143,178,255,.75)', ink: '#8FB2FF' },
      streak: { name: 'Streak bonus', icon: I.streak, fill: '#23170D', edge: 'rgba(247,178,103,.75)', ink: '#F7B267' },
      mystery: { name: 'Mystery', glyph: '?', fill: '#0D2227', edge: 'rgba(127,233,238,.75)', ink: '#7FE9EE' },
      trap: Object.assign({ name: 'Trap', icon: I.trap }, bad),
      leak: Object.assign({ name: 'Leak', icon: I.leak }, bad),
      drain: Object.assign({ name: 'Drain', icon: I.drain }, bad),
      reset: Object.assign({ name: 'Reset', icon: I.reset }, bad),
      glitch: Object.assign({ name: 'Network glitch', icon: I.glitch }, bad)
    };
  }
  renderVals() {
    const K = this.kinds();
    const p = this.load();
    const sample = {
      result: 'crashed', hazard: 'glitch', lost: 250, peak: 250, used: 4, left: 1, blocked: 0, practice: false, runNo: 2,
      stops: [
        { k: 'xp50', d: 50, tone: 'good', at: 50, mult: 1 },
        { k: 'boost', d: 0, tone: 'power', at: 50, mult: 1 },
        { k: 'xp100', d: 200, tone: 'good', at: 250, mult: 2 },
        { k: 'glitch', d: -250, tone: 'bad', at: 0, mult: 1 }
      ]
    };
    const last = p && p.last && p.last.result && p.last.result !== 'banked' ? p.last : sample;
    const xp = p && p.xp != null ? p.xp : 0;
    const words = {
      glitch: ['NETWORK GLITCH · RUN OVER', 'Glitched out', 'The signal hit a network glitch. Everything you hadn’t banked went with it, and the run ended.'],
      trap: ['TRAP · RUN OVER', 'Trapped', 'A trap took your unbanked XP, and the run ran out of spins before you could build it back.'],
      leak: ['LEAK · RUN OVER', 'Drained away', 'A leak took half of what you held, and the run ended before you banked the rest.'],
      reset: ['RESET · RUN OVER', 'Back to zero', 'A reset cleared your unbanked XP, boost and shields, and the spins ran out.'],
      drain: ['RUN OVER', 'Nothing banked', 'The run ended with nothing in hand to bank.']
    };
    const w = last.result === 'crashed' ? words.glitch : words[last.hazard] || ['RUN OVER', 'Nothing banked', 'The run ended with nothing in hand to bank.'];

    const stopsSrc = last.stops && last.stops.length ? last.stops : sample.stops;
    let peak = 0, peakAt = 0;
    stopsSrc.forEach((s, i) => { if (s.at > peak) { peak = s.at; peakAt = i + 1; } });
    const stops = stopsSrc.map((s, i) => {
      const k = K[s.k] || K.xp20;
      let label = k.name, value = '', valInk = '#A9A6B6', nameInk = '#F7F5F2';
      if (s.tone === 'good') { label = s.k === 'streak' ? 'Streak bonus' : s.k === 'mystery' ? 'Mystery' : 'XP node'; value = '+' + s.d + (s.mult > 1 ? ' (×' + s.mult + ')' : ''); valInk = '#F2C66B'; }
      else if (s.tone === 'power') { label = s.k === 'boost' ? 'Boost armed' : s.k === 'shield' ? 'Shield up' : s.k === 'spin' ? 'Bonus spin' : 'Mystery power'; value = s.k === 'boost' ? '×2' : '—'; valInk = '#C6B6FF'; }
      else if (s.tone === 'blocked') { label = k.name + ', blocked'; value = 'Shield'; valInk = '#6EE7B7'; }
      else if (s.tone === 'miss') { label = k.name + ', nothing lost'; value = '0'; }
      else { label = k.name; value = s.d < 0 ? '−' + (-s.d) : s.k === 'drain' ? '−1 shield' : '—'; valInk = '#FF8A9A'; nameInk = '#FF8A9A'; }
      const glyph = k.glyph || '';
      return {
        n: String(i + 1).padStart(2, '0'),
        label: label, value: value, valInk: valInk, nameInk: nameInk,
        hold: s.tone === 'bad' && s.k === 'glitch' ? 'Run crashed' : 'Holding ' + s.at + ' XP',
        fill: k.fill, edge: k.edge, ink: k.ink,
        glyph: glyph, textDisp: glyph ? 'inline' : 'none',
        fs: glyph === '+100' ? '11' : glyph === '?' ? '16' : '13',
        ty: glyph === '?' ? '5.5' : '4.5',
        icon: k.icon || '', iconDisp: k.icon ? 'inline' : 'none',
        line: i === 0 ? '0' : '1px solid rgba(255,255,255,.06)'
      };
    });
    const lost = last.lost || 0;
    const hazards = 5;
    const spins = (last.used || stopsSrc.length) + (last.left || 0);
    return {
      xp: String(xp),
      tag: (last.practice ? 'PRACTICE · ' : '') + w[0],
      title: w[1],
      lede: w[2],
      lostValue: lost ? '−' + lost : '0',
      lostNote: lost ? (peak > lost ? 'You were holding ' + peak + ' XP at your best.' : 'All of it was unbanked when the hazard hit.') : 'Nothing was at risk when it ended.',
      stops: stops,
      spinsNote: (last.used || stopsSrc.length) + ' of ' + spins + ' spins',
      showPeak: peak > 0,
      peakNote: 'Banking after stop ' + peakAt + ' would have kept ' + peak + ' XP.',
      hazards: String(hazards),
      againLabel: last.practice ? 'Practice again' : 'Run again'
    };
  }
}

export default class RushHazard extends Logic {
  render() {
    const $ = this.vals();
    return (
      <Page
        bar={<Bar back="/games/rush" />}
        footer={
          <>
            <Button to="/games/rush/play">{$.againLabel}</Button>
            <Button kind="ghost" to="/games/rush">
              Back to ALKE Rush
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, paddingTop: 8 }}>
          <span className="ob-tile danger">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
            </svg>
          </span>
          <p className="ob-eyebrow" style={{ margin: "8px 0 0", color: "var(--text-3)" }}>
            {tc($.tag)}
          </p>
          <h1 className="ob-title">{$.title}</h1>
          <p className="ob-sub" style={{ marginTop: 0, fontSize: 15 }}>
            {$.lede}
          </p>
        </div>

        <div className="ob-stats two">
          <div className="ob-stat">
            <span className="l">Unbanked XP lost</span>
            <span className="v num" style={{ color: "var(--danger)" }}>
              {$.lostValue}
            </span>
          </div>
          <div className="ob-stat">
            <span className="l">Banked Rush XP · safe</span>
            <span className="v num">{$.xp}</span>
          </div>
        </div>

        {$.showPeak ? <Notice>{$.peakNote}</Notice> : null}

        <Section title="How the run went" action={<span>{$.spinsNote}</span>}>
          <ul className="ob-list">
            {$.stops.map((s) => (
              <li key={s.n}>
                <Row
                  icon={<span className="num" style={{ fontSize: 13, fontWeight: 700 }}>{s.n}</span>}
                  tone={s.nameInk === "#FF8A9A" ? "plain" : "plain"}
                  title={<span style={{ color: s.nameInk === "#FF8A9A" ? "var(--danger)" : undefined }}>{s.label}</span>}
                  sub={s.hold}
                  end={<b className="num" style={{ color: s.valInk === "#F2C66B" ? "var(--gold)" : s.valInk === "#FF8A9A" ? "var(--danger)" : s.valInk === "#6EE7B7" ? "var(--success)" : "var(--text-2)" }}>{s.value}</b>}
                />
              </li>
            ))}
          </ul>
        </Section>

        <p className="ob-small center">Losing a run only costs unbanked game XP. Your ALKE is never affected.</p>
      </Page>
    );
  }
}
