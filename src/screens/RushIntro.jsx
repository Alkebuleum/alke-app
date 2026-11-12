/* eslint-disable */
// Generated from the ALKE Network App design (16_19_ALKE_Rush_intro.html). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

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
    const y = this.shift(-1), y2 = this.shift(-2);
    const at = (d, h, m) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).getTime();
    return {
      v: 1, xp: 180, best: 120, streak: 2, lastBank: this.dayKey(y),
      day: null, runsToday: 0, chal: { best: 0, done: false, block: false },
      stats: { runs: 3, banks: 2, blocked: 1, hazards: 1 },
      badges: { first: true },
      history: [
        { t: at(y, 19, 40), result: 'banked', xp: 120, bonus: 0, spins: 4, practice: false },
        { t: at(y, 19, 34), result: 'lost', xp: 0, lost: 70, hazard: 'trap', spins: 3, practice: false },
        { t: at(y2, 21, 10), result: 'banked', xp: 60, bonus: 0, spins: 3, practice: false }
      ],
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
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: "#08070D", backgroundImage: "radial-gradient(90% 40% at 50% -6%,rgba(76,214,228,.20) 0%,rgba(76,214,228,0) 70%),radial-gradient(80% 44% at 50% 26%,rgba(110,72,255,.24) 0%,rgba(110,72,255,0) 72%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<main style={{ position: "absolute", inset: "0", overflowY: "auto" }}>{" "}<div style={{ padding: "52px 20px 128px", display: "flex", flexDirection: "column", gap: "18px" }}>{" "}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", margin: "0 -4px" }}>{" "}<Link to="/games" aria-label="Back to Games" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box", flex: "none" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 6-6 6 6 6"></path></svg></Link>{" "}<span style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "34px", padding: "0 12px", borderRadius: "999px", background: "rgba(242,198,107,.12)", border: "1px solid rgba(242,198,107,.28)", color: "#F2C66B", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" }}><svg width="13" height="15" viewBox="0 0 100 112" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" aria-hidden="true"><path d="M50 6 L92 30 L92 82 L50 106 L8 82 L8 30 Z"></path></svg>{$.xp}{" Rush XP"}</span>{" "}</div>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: "#7FE9EE" }}>{"ALKE RUSH · RISK IT OR BANK IT"}</span>{" "}<h1 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "32px", lineHeight: "36px", fontWeight: "600", letterSpacing: "-.03em" }}>{"Know when to stop"}</h1>{" "}<p style={{ margin: "0", fontSize: "14px", lineHeight: "21px", color: "#A9A6B6" }}>{"Tap STOP when the light is on the XP you want. Bank it to keep it, or risk it for more. A hazard takes whatever you haven't banked."}</p>{" "}</div>{" "}<section aria-label="Start a run" style={{ position: "relative", overflow: "hidden", borderRadius: "28px", padding: "20px", background: "radial-gradient(120% 80% at 50% 0%,rgba(76,214,228,.26) 0%,rgba(76,214,228,0) 62%),linear-gradient(165deg,#1E2160 0%,#121436 55%,#0B0C1E 100%)", border: "1px solid rgba(110,222,232,.32)", boxShadow: "0 30px 60px -30px rgba(56,200,220,.6)", display: "flex", flexDirection: "column", gap: "16px" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: "#7FE9EE" }}>{$.heroTag}</span><span style={{ display: "inline-flex", alignItems: "center", height: "26px", padding: "0 10px", borderRadius: "999px", background: "rgba(255,255,255,.10)", color: "#F7F5F2", fontSize: "12px", fontWeight: "600" }}>{"5 spins"}</span></div>{" "}<div aria-hidden="true" style={{ position: "relative", width: "310px", maxWidth: "100%", height: "192px", alignSelf: "center" }}>{" "}<svg width="0" height="0" style={{ position: "absolute" }}><defs><linearGradient id="riLit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9FAFB"></stop><stop offset="1" stopColor="#25B5C6"></stop></linearGradient></defs></svg>{" "}{($.nodes || []).map((n, i0) => (<Fragment key={i0}>{" "}<svg width="40" height="46" viewBox="-20 -23 40 46" style={{ position: "absolute", left: `${n?.left ?? ''}px`, top: `${n?.top ?? ''}px`, overflow: "visible" }}><polygon points="0,-21.5 18.62,-10.75 18.62,10.75 0,21.5 -18.62,10.75 -18.62,-10.75" fill={n?.fill} stroke={n?.edge} strokeWidth="1.6" strokeLinejoin="round"></polygon><polygon points="0,-21.5 18.62,-10.75 18.62,10.75 0,21.5 -18.62,10.75 -18.62,-10.75" fill="url(#riLit)" fillOpacity=".62" stroke="#E9FEFF" strokeWidth="2" strokeLinejoin="round" style={{ opacity: "0", animation: n?.anim, filter: "drop-shadow(0 0 6px rgba(92,225,230,.9))" }}></polygon><text x="0" y={n?.ty} textAnchor="middle" fontFamily="Space Grotesk, Inter, sans-serif" fontSize={n?.fs} fontWeight="700" fill={n?.ink} style={{ display: n?.textDisp }}>{n?.label}</text><g transform="translate(-7.8 -7.8) scale(.65)" fill="none" stroke={n?.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: n?.iconDisp }}><path d={n?.icon}></path></g></svg>{" "}</Fragment>))}{" "}</div>{" "}<dl style={{ margin: "0", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px" }}>{" "}<div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: "2px", padding: "10px 4px", borderRadius: "16px", background: "rgba(255,255,255,.06)" }}><dt style={{ fontSize: "11px", color: "#A9A6B6" }}>{"nodes, reshuffled"}</dt><dd style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "600" }}>{"19"}</dd></div>{" "}<div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: "2px", padding: "10px 4px", borderRadius: "16px", background: "rgba(255,92,122,.10)" }}><dt style={{ fontSize: "11px", color: "#A9A6B6" }}>{"hazards"}</dt><dd style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "600", color: "#FF8A9A" }}>{"5"}</dd></div>{" "}<div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: "2px", padding: "10px 4px", borderRadius: "16px", background: "rgba(255,255,255,.06)" }}><dt style={{ fontSize: "11px", color: "#A9A6B6" }}>{"a run"}</dt><dd style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "600" }}>{"~1 min"}</dd></div>{" "}</dl>{" "}<Link to="/games/rush/play" style={{ position: "relative", overflow: "hidden", height: "58px", borderRadius: "999px", background: "linear-gradient(135deg,#7FF0F2 0%,#3CC7D6 45%,#6F4BF2 100%)", color: "#04161A", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "700", letterSpacing: ".02em", textDecoration: "none", boxShadow: "0 16px 34px -14px rgba(60,200,220,.95),inset 0 1px 0 rgba(255,255,255,.5)" }}><span aria-hidden="true" style={{ position: "absolute", top: "0", bottom: "0", left: "0", width: "40%", background: "linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.45),rgba(255,255,255,0))", animation: "riSweep 2.8s ease-in-out infinite" }}></span><span style={{ position: "relative" }}>{$.ctaLabel}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ position: "relative" }}><path d="M5 12h14M13 6l6 6-6 6"></path></svg></Link>{" "}<span style={{ fontSize: "12px", lineHeight: "17px", color: "#A9A6B6", textAlign: "center" }}>{$.runsNote}</span>{" "}</section>{" "}<div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px" }}>{" "}<Link to="/games/rush/leaderboards" style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px", borderRadius: "18px", background: "linear-gradient(180deg,rgba(242,198,107,.12),rgba(242,198,107,.03))", border: "1px solid rgba(242,198,107,.26)", textDecoration: "none", color: "#F7F5F2", minHeight: "96px", boxSizing: "border-box" }}>{" "}<span style={{ fontSize: "11px", lineHeight: "14px", fontWeight: "600", color: "#F2C66B" }}>{"Daily challenge"}</span>{" "}<span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", lineHeight: "22px", fontWeight: "600" }}>{$.chalValue}</span>{" "}<span aria-hidden="true" style={{ display: "block", height: "5px", borderRadius: "5px", background: "rgba(255,255,255,.10)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${$.chalPct ?? ''}%`, borderRadius: "5px", background: "linear-gradient(90deg,#F7D58A,#E2A93B)" }}></span></span>{" "}<span style={{ fontSize: "11px", lineHeight: "14px", color: "#A9A6B6" }}>{"Bank 250 in one run"}</span>{" "}</Link>{" "}<Link to="/games/rush/leaderboards" style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px", borderRadius: "18px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)", textDecoration: "none", color: "#F7F5F2", minHeight: "96px", boxSizing: "border-box" }}>{" "}<span style={{ fontSize: "11px", lineHeight: "14px", fontWeight: "600", color: "#F7B267" }}>{"Rush streak"}</span>{" "}<span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", lineHeight: "22px", fontWeight: "600" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F7B267" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 21c3.9 0 7-2.6 7-6.4 0-3.3-2.2-5.4-3.9-7.2.1 2.1-.9 3.5-2.1 4C13.4 8 11.7 5.1 9.2 3.5c.4 3.1-1.4 4.9-2.7 6.6C5.4 11.5 5 12.8 5 14.6 5 18.4 8.1 21 12 21z"></path></svg>{$.streakValue}</span>{" "}<span style={{ fontSize: "11px", lineHeight: "14px", color: "#A9A6B6" }}>{$.streakNote}</span>{" "}</Link>{" "}<Link to="/games/rush/leaderboards" style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px", borderRadius: "18px", background: "linear-gradient(180deg,rgba(76,214,228,.10),rgba(76,214,228,.02))", border: "1px solid rgba(110,222,232,.24)", textDecoration: "none", color: "#F7F5F2", minHeight: "96px", boxSizing: "border-box" }}>{" "}<span style={{ fontSize: "11px", lineHeight: "14px", fontWeight: "600", color: "#7FE9EE" }}>{"Today's board"}</span>{" "}<span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", lineHeight: "22px", fontWeight: "600" }}>{$.rankValue}</span>{" "}<span style={{ fontSize: "11px", lineHeight: "14px", color: "#A9A6B6" }}>{$.rankNote}</span>{" "}</Link>{" "}</div>{" "}<section aria-label="How it plays" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px", borderRadius: "24px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)" }}>{" "}<h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "600" }}>{"How it plays"}</h2>{" "}<ol style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "12px" }}><li style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}><span aria-hidden="true" style={{ flex: "none", minWidth: "58px", height: "28px", padding: "0 8px", boxSizing: "border-box", borderRadius: "999px", background: "linear-gradient(135deg,#7FF0F2,#3CC7D6)", color: "#04161A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "12px", fontWeight: "700", letterSpacing: ".08em" }}>{"STOP"}</span><span style={{ fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}>{"The light hops across the lattice, faster every spin. Tap STOP and it stops on what's lit."}</span></li><li style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}><span aria-hidden="true" style={{ flex: "none", minWidth: "58px", height: "28px", padding: "0 8px", boxSizing: "border-box", borderRadius: "999px", background: "linear-gradient(135deg,#F7D58A,#E2A93B)", color: "#1A1205", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "12px", fontWeight: "700", letterSpacing: ".08em" }}>{"BANK"}</span><span style={{ fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}>{"Keep everything you've stacked. Banked XP is safe, and the run ends there."}</span></li><li style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}><span aria-hidden="true" style={{ flex: "none", minWidth: "58px", height: "28px", padding: "0 8px", boxSizing: "border-box", borderRadius: "999px", background: "linear-gradient(135deg,#8B6DFF,#5530E8)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "12px", fontWeight: "700", letterSpacing: ".08em" }}>{"RISK"}</span><span style={{ fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}>{"Spin again for more. A hazard can take what's unbanked; a shield blocks one."}</span></li></ol>{" "}<p style={{ margin: "0", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,.06)", fontSize: "12px", lineHeight: "18px", color: "#8C8999" }}>{"Every hex shows its prize. What's lit when you tap is what you get. The light's path is random and it stops by itself after 12 seconds. The chance of a hazard is shown before every decision."}</p>{" "}</section>{" "}<section aria-label="On the board" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "19px", fontWeight: "600", letterSpacing: "-.01em" }}>{"On the board"}</h2><span style={{ fontSize: "12px", color: "#8C8999" }}>{"19 nodes a run"}</span></div>{" "}<div style={{ borderRadius: "22px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)", overflow: "hidden" }}>{" "}{($.spaces || []).map((sp, i1) => (<Fragment key={i1}>{" "}<div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", minHeight: "52px", boxSizing: "border-box", borderTop: sp?.line }}>{" "}<svg width="30" height="34" viewBox="-21 -24 42 48" aria-hidden="true" style={{ flex: "none" }}><polygon points="0,-21.5 18.62,-10.75 18.62,10.75 0,21.5 -18.62,10.75 -18.62,-10.75" fill={sp?.fill} stroke={sp?.edge} strokeWidth="2" strokeLinejoin="round"></polygon><text x="0" y={sp?.ty} textAnchor="middle" fontFamily="Space Grotesk, Inter, sans-serif" fontSize={sp?.fs} fontWeight="700" fill={sp?.ink} style={{ display: sp?.textDisp }}>{sp?.label}</text><g transform="translate(-7.8 -7.8) scale(.65)" fill="none" stroke={sp?.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ display: sp?.iconDisp }}><path d={sp?.icon}></path></g></svg>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "14px", fontWeight: "600", color: sp?.nameInk }}>{sp?.name}</span><span style={{ fontSize: "12px", lineHeight: "16px", color: "#A9A6B6" }}>{sp?.fx}</span></span>{" "}<span style={{ flex: "none", fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "12px", color: "#8C8999" }}>{"×"}{sp?.count}</span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</section>{" "}<section aria-label="Rush badges" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "19px", fontWeight: "600", letterSpacing: "-.01em" }}>{"Rush badges"}</h2><span style={{ fontSize: "12px", color: "#8C8999" }}>{$.badgeCount}{" of 6"}</span></div>{" "}<ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "10px" }}>{($.badges || []).map((b, i2) => (<Fragment key={i2}><li style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 6px", borderRadius: "18px", background: b?.bg, border: `1px solid ${b?.edge ?? ''}`, textAlign: "center" }}>{" "}<svg width="44" height="50" viewBox="0 0 100 112" aria-hidden="true"><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill={b?.hexFill} stroke={b?.hexEdge} strokeWidth="4" strokeLinejoin="round"></path><g transform="translate(50 56) scale(1.7) translate(-12 -12)" fill="none" stroke={b?.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={b?.icon}></path></g></svg>{" "}<span style={{ fontSize: "12px", lineHeight: "15px", fontWeight: "600", color: b?.nameInk }}>{b?.name}</span>{" "}<span style={{ fontSize: "11px", lineHeight: "14px", color: "#8C8999" }}>{b?.how}</span>{" "}</li></Fragment>))}</ul>{" "}</section>{" "}<section aria-label="Recent runs" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{" "}<h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "19px", fontWeight: "600", letterSpacing: "-.01em" }}>{"Recent runs"}</h2>{" "}<div style={{ borderRadius: "22px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)", overflow: "hidden" }}>{" "}{($.runs || []).map((r, i3) => (<Fragment key={i3}>{" "}<div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", minHeight: "60px", boxSizing: "border-box", borderTop: r?.line }}>{" "}<span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "50%", background: r?.dot, border: r?.dotEdge, boxSizing: "border-box", flex: "none" }}></span>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "14px", fontWeight: "600" }}>{r?.title}</span><span style={{ fontSize: "12px", color: "#8C8999" }}>{r?.meta}</span></span>{" "}<span style={{ flex: "none", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "16px", fontWeight: "600", color: r?.ink }}>{r?.value}</span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</section>{" "}<button type="button" onClick={$.reset} style={{ alignSelf: "center", height: "44px", padding: "0 18px", borderRadius: "999px", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "#D8D5E2", fontSize: "13px", fontWeight: "600" }}>{"Reset demo progress"}</button>{" "}<p style={{ margin: "0", fontSize: "12px", lineHeight: "18px", color: "#8C8999", textAlign: "center" }}>{"Game XP is for play only: no monetary value, not transferable, never redeemable for ALKE. No run adds or removes ALKE, warms cold ALKE or changes your contribution score."}</p>{" "}</div>{" "}</main>{" "}<nav aria-label="Main" style={{ position: "absolute", left: "14px", right: "14px", bottom: "24px", height: "70px", borderRadius: "28px", background: "rgba(20,18,31,.80)", border: "1px solid rgba(255,255,255,.09)", boxShadow: "0 20px 40px -14px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.06)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", alignItems: "center", padding: "0 4px", boxSizing: "border-box" }}>{" "}<Link to="/home" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z"></path></svg></span>{"Home"}</Link>{" "}<Link to="/games" aria-current="page" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#F7F5F2", fontSize: "10.5px", fontWeight: "700" }}><span style={{ width: "48px", height: "30px", borderRadius: "15px", background: "rgba(139,109,255,.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C6B6FF" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.7 5.5h10.6a3.9 3.9 0 0 1 3.9 3.5l.7 6.4a2.9 2.9 0 0 1-5 2.3l-1.6-1.8a2 2 0 0 0-1.5-.7h-3.6a2 2 0 0 0-1.5.7l-1.6 1.8a2.9 2.9 0 0 1-5-2.3l.7-6.4a3.9 3.9 0 0 1 3.9-3.5zM8 9.2v3.6M6.2 11h3.6M14.9 12a.6.6 0 1 0 1.2 0a.6.6 0 1 0-1.2 0M16.9 9.8a.6.6 0 1 0 1.2 0a.6.6 0 1 0-1.2 0"></path></svg></span>{"Games"}</Link>{" "}<Link to="/mine" style={{ height: "70px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "3px", paddingBottom: "6px", boxSizing: "border-box", textDecoration: "none", color: "#A9A6B6", fontSize: "10.5px", fontWeight: "600" }}><span style={{ marginTop: "-34px", width: "58px", height: "64px", display: "block", filter: "drop-shadow(0 10px 18px rgba(110,72,255,.6))" }}><svg width="58" height="64" viewBox="0 0 100 112" aria-hidden="true"><defs><linearGradient id="tabHex" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9B7DFF"></stop><stop offset="1" stopColor="#5530E8"></stop></linearGradient></defs><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="url(#tabHex)" stroke="#D9CEFF" strokeOpacity=".55" strokeWidth="2.5" strokeLinejoin="round"></path><g transform="translate(50 56) scale(.5) translate(-50 -56)" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"><line x1="50" y1="27" x2="50" y2="85"></line><path d="M20 45 L32 56 L20 67"></path><path d="M30 45 L42 56 L30 67"></path><path d="M80 45 L68 56 L80 67"></path><path d="M70 45 L58 56 L70 67"></path></g></svg></span>{"Mine"}</Link>{" "}<Link to="/network" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8.5" r="3.5"></circle><path d="M2.5 20c.7-3.5 3.3-5.5 6.5-5.5s5.8 2 6.5 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.8 2.6 2.6 3 5.2"></path></svg></span>{"Network"}</Link>{" "}<Link to="/profile" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 20.5c.9-4 4-6 8-6s7.1 2 8 6"></path></svg></span>{"Profile"}</Link>{" "}</nav>{" "}</div>{" "}</>);
  }
}
