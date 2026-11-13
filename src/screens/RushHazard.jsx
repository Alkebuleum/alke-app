/* eslint-disable */
// Generated from the ALKE Network App design (20_21_ALKE_Rush_hazard_run_lost_.html). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

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
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: "#08070D", backgroundImage: "radial-gradient(90% 40% at 50% 8%,rgba(255,60,100,.20) 0%,rgba(255,60,100,0) 70%),radial-gradient(80% 40% at 50% 62%,rgba(110,72,255,.16) 0%,rgba(110,72,255,0) 72%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<main style={{ position: "absolute", inset: "0", overflowY: "auto" }}>{" "}<div style={{ padding: "52px 20px 40px", display: "flex", flexDirection: "column", gap: "18px" }}>{" "}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", margin: "0 -4px" }}>{" "}<Link to="/games/rush" aria-label="Close" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box", flex: "none" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg></Link>{" "}<span style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "34px", padding: "0 12px", borderRadius: "999px", background: "rgba(110,231,183,.10)", border: "1px solid rgba(110,231,183,.28)", color: "#6EE7B7", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z"></path><path d="m9 12 2.2 2.2L15.5 10"></path></svg>{$.xp}{" XP banked, safe"}</span>{" "}</div>{" "}<div aria-hidden="true" style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto" }}>{" "}<span style={{ position: "absolute", inset: "-34px", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,60,100,.32) 0%,rgba(255,60,100,.08) 45%,rgba(255,60,100,0) 68%)", animation: "rhPulse 2.6s ease-in-out infinite" }}></span>{" "}<svg width="180" height="180" viewBox="0 0 120 120" style={{ position: "absolute", inset: "0", overflow: "visible" }}><defs><linearGradient id="rhFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A1428"></stop><stop offset="1" stopColor="#1E0811"></stop></linearGradient></defs><g style={{ animation: "rhSplitA 1.9s steps(1) infinite" }}><path d="M60 14 L99.8 37 L99.8 83 L60 106 L20.2 83 L20.2 37 Z" fill="none" stroke="#5CE1E6" strokeOpacity=".7" strokeWidth="3" strokeLinejoin="round"></path></g><g style={{ animation: "rhSplitB 1.9s steps(1) infinite" }}><path d="M60 14 L99.8 37 L99.8 83 L60 106 L20.2 83 L20.2 37 Z" fill="none" stroke="#FF3D6E" strokeOpacity=".75" strokeWidth="3" strokeLinejoin="round"></path></g><g style={{ animation: "rhJolt 2.4s steps(2) infinite" }}><path d="M60 14 L99.8 37 L99.8 83 L60 106 L20.2 83 L20.2 37 Z" fill="url(#rhFill)" stroke="#FF8A9A" strokeWidth="3.5" strokeLinejoin="round"></path><path d="M60 22 L92.6 41 L92.6 79 L60 98 L27.4 79 L27.4 41 Z" fill="none" stroke="#FFFFFF" strokeOpacity=".08" strokeWidth="1.5" strokeLinejoin="round"></path><g transform="translate(60 60) scale(2) translate(-12 -12)" fill="none" stroke="#FFD3DA" strokeWidth="2" strokeLinecap="round"><path d="M4 6.5h9M15.5 6.5H20M4 12h4M10.5 12H20M4 17.5h11M17.5 17.5H20"></path></g><path d="M63 16 L56 42 L67 55 L53 78 L61 104" fill="none" stroke="#FFE3E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="110" style={{ animation: "rhCrack .8s .2s ease-out both" }}></path></g><rect x="22" y="58" width="76" height="4" rx="2" fill="#FF8A9A" fillOpacity=".55" style={{ animation: "rhScan 2.2s ease-in-out infinite" }}></rect></svg>{" "}<svg width="16" height="16" viewBox="0 0 16 16" style={{ position: "absolute", left: "44px", top: "120px", animation: "rhFallA 2.8s .3s ease-in infinite" }}><path d="M2 3 L14 1 L9 14 Z" fill="#FF8A9A" fillOpacity=".85"></path></svg>{" "}<svg width="13" height="13" viewBox="0 0 16 16" style={{ position: "absolute", left: "118px", top: "128px", animation: "rhFallB 2.8s 1.1s ease-in infinite" }}><path d="M1 2 L15 5 L6 15 Z" fill="#5CE1E6" fillOpacity=".8"></path></svg>{" "}<svg width="11" height="11" viewBox="0 0 16 16" style={{ position: "absolute", left: "84px", top: "140px", animation: "rhFallC 2.8s 1.9s ease-in infinite" }}><path d="M3 1 L15 9 L1 14 Z" fill="#FFD3DA" fillOpacity=".85"></path></svg>{" "}</div>{" "}<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: "#FF8A9A" }}>{$.tag}</span>{" "}<h1 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "34px", lineHeight: "38px", fontWeight: "600", letterSpacing: "-.03em" }}>{$.title}</h1>{" "}<p style={{ margin: "0", maxWidth: "320px", fontSize: "14px", lineHeight: "21px", color: "#A9A6B6" }}>{$.lede}</p>{" "}</div>{" "}<section aria-label="What you lost" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "18px 20px", borderRadius: "24px", background: "linear-gradient(135deg,rgba(255,92,122,.16),rgba(255,92,122,.04))", border: "1px solid rgba(255,138,154,.34)", boxShadow: "0 24px 50px -30px rgba(255,60,100,.7)" }}>{" "}<span style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "0" }}><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "10.5px", letterSpacing: ".14em", color: "#FF8A9A" }}>{"UNBANKED XP LOST"}</span><span style={{ fontSize: "13px", lineHeight: "18px", color: "#D8D5E2" }}>{$.lostNote}</span></span>{" "}<span style={{ flex: "none", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "40px", lineHeight: "1", fontWeight: "600", letterSpacing: "-.03em", color: "#FF8A9A", fontVariantNumeric: "tabular-nums", animation: "rhCount .5s .3s ease-out both" }}>{$.lostValue}</span>{" "}</section>{" "}<section aria-label="What is safe" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 20px", borderRadius: "24px", background: "linear-gradient(180deg,rgba(110,231,183,.08),rgba(110,231,183,.02))", border: "1px solid rgba(110,231,183,.24)" }}>{" "}<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z"></path><path d="m9 12 2.2 2.2L15.5 10"></path></svg><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600" }}>{"Still safe"}</h2></div>{" "}<dl style={{ margin: "0", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "8px" }}>{" "}<div style={{ display: "flex", flexDirection: "column-reverse", gap: "2px", padding: "10px 12px", borderRadius: "14px", background: "rgba(255,255,255,.04)" }}><dt style={{ fontSize: "11px", color: "#A9A6B6" }}>{"Banked Rush XP"}</dt><dd style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600", color: "#F2C66B" }}>{$.xp}</dd></div>{" "}<div style={{ display: "flex", flexDirection: "column-reverse", gap: "2px", padding: "10px 12px", borderRadius: "14px", background: "rgba(255,255,255,.04)" }}><dt style={{ fontSize: "11px", color: "#A9A6B6" }}>{"ALKE · cold, locked"}</dt><dd style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600" }}>{"31.20"}</dd></div>{" "}<div style={{ display: "flex", flexDirection: "column-reverse", gap: "2px", padding: "10px 12px", borderRadius: "14px", background: "rgba(255,255,255,.04)" }}><dt style={{ fontSize: "11px", color: "#A9A6B6" }}>{"Contribution score"}</dt><dd style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600", color: "#C6B6FF" }}>{"640"}</dd></div>{" "}<div style={{ display: "flex", flexDirection: "column-reverse", gap: "2px", padding: "10px 12px", borderRadius: "14px", background: "rgba(255,255,255,.04)" }}><dt style={{ fontSize: "11px", color: "#A9A6B6" }}>{"Mining streak"}</dt><dd style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600" }}>{"12 days"}</dd></div>{" "}</dl>{" "}<p style={{ margin: "0", fontSize: "12px", lineHeight: "18px", color: "#A9A6B6" }}>{"A hazard only ever takes the game XP you hadn't banked in this run."}</p>{" "}</section>{" "}<section aria-label="How the run went" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 20px", borderRadius: "24px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600" }}>{"How the run went"}</h2><span style={{ fontSize: "12px", color: "#8C8999" }}>{$.spinsNote}</span></div>{" "}<ol style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column" }}>{($.stops || []).map((st, i0) => (<Fragment key={i0}><li style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 0", borderTop: st?.line }}>{" "}<span style={{ flex: "none", width: "26px", fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", color: "#8C8999" }}>{st?.n}</span>{" "}<svg width="26" height="30" viewBox="-21 -24 42 48" aria-hidden="true" style={{ flex: "none" }}><polygon points="0,-21.5 18.62,-10.75 18.62,10.75 0,21.5 -18.62,10.75 -18.62,-10.75" fill={st?.fill} stroke={st?.edge} strokeWidth="2.4" strokeLinejoin="round"></polygon><text x="0" y={st?.ty} textAnchor="middle" fontFamily="Space Grotesk, Inter, sans-serif" fontSize={st?.fs} fontWeight="700" fill={st?.ink} style={{ display: st?.textDisp }}>{st?.glyph}</text><g transform="translate(-7.8 -7.8) scale(.65)" fill="none" stroke={st?.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ display: st?.iconDisp }}><path d={st?.icon}></path></g></svg>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "14px", fontWeight: "600", color: st?.nameInk }}>{st?.label}</span><span style={{ fontSize: "12px", color: "#8C8999" }}>{st?.hold}</span></span>{" "}<span style={{ flex: "none", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "15px", fontWeight: "600", color: st?.valInk }}>{st?.value}</span>{" "}</li></Fragment>))}</ol>{" "}{$.showPeak ? (<>{" "}<div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 14px", borderRadius: "16px", background: "rgba(242,198,107,.08)", border: "1px solid rgba(242,198,107,.24)" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F2C66B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 3.6 10.8c-.8.6-1.1 1.4-1.1 2.2h-5c0-.8-.3-1.6-1.1-2.2A6 6 0 0 1 12 3z"></path></svg><span style={{ fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}>{$.peakNote}</span></div>{" "}</>) : null}{" "}</section>{" "}<p style={{ margin: "0", padding: "0 4px", fontSize: "13px", lineHeight: "20px", color: "#A9A6B6", textAlign: "center" }}>{"Every spin has the same "}{$.hazards}{" in 19 chance of a hazard. Bank when what you hold matters more than what one more spin could add."}</p>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{" "}<Link to="/games/rush/play" style={{ height: "56px", borderRadius: "999px", background: "linear-gradient(135deg,#7FF0F2 0%,#3CC7D6 45%,#6F4BF2 100%)", color: "#04161A", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none", boxShadow: "0 16px 34px -14px rgba(60,200,220,.95),inset 0 1px 0 rgba(255,255,255,.5)" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"></path></svg>{$.againLabel}</Link>{" "}<Link to="/games/rush/leaderboards" style={{ height: "52px", borderRadius: "999px", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none", boxSizing: "border-box" }}>{"Challenges and leaderboards"}</Link>{" "}<Link to="/games/rush" style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "600", color: "#C6B6FF", textDecoration: "none" }}>{"Back to ALKE Rush"}</Link>{" "}</div>{" "}<p style={{ margin: "0", fontSize: "12px", lineHeight: "18px", color: "#8C8999", textAlign: "center" }}>{"Game XP is for play only: no monetary value, not transferable, never redeemable for ALKE. Losing a run never touches your ALKE, allocation or contribution score."}</p>{" "}</div>{" "}</main>{" "}</div>{" "}</>);
  }
}
