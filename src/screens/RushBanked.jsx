/* eslint-disable */
// Generated from the ALKE Network App design (22_22_ALKE_Rush_banked_victory_.html). Edit the logic freely;
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
  renderVals() {
    const s = this.state || {};
    const p = this.load();
    const sample = {
      result: 'banked', how: 'manual', banked: 250, bonus: 50, used: 4, left: 1, blocked: 0,
      newBest: true, best: 250, streak: 3, badge: 'cool', xp: 480, practice: false, runNo: 3, chalDone: true, chalBest: 250,
      stops: [
        { k: 'xp50', d: 50, tone: 'good', at: 50, mult: 1 },
        { k: 'shield', d: 0, tone: 'power', at: 50, mult: 1 },
        { k: 'boost', d: 0, tone: 'power', at: 50, mult: 1 },
        { k: 'xp100', d: 200, tone: 'good', at: 250, mult: 2 }
      ]
    };
    const last = p && p.last && p.last.result === 'banked' ? p.last : sample;
    const banked = last.banked || 0;
    const practice = !!last.practice;

    const title = practice ? 'Practice, banked' : banked >= 250 ? 'Cool head' : banked >= 100 ? 'Banked. Good call.' : 'Safe and sound';
    const chips = [];
    if (last.bonus > 0) chips.push({ t: 'Challenge bonus +' + last.bonus + ' XP', bg: 'rgba(242,198,107,.16)', ink: '#F2C66B' });
    if (last.newBest) chips.push({ t: 'New best run', bg: 'rgba(76,214,228,.16)', ink: '#7FE9EE' });
    if (practice) chips.push({ t: 'Practice · not scored', bg: 'rgba(255,255,255,.08)', ink: '#D8D5E2' });
    if (!chips.length) chips.push({ t: 'Rush total ' + (last.xp || 0) + ' XP', bg: 'rgba(255,255,255,.08)', ink: '#D8D5E2' });

    const names = { xp20: '+20', xp50: '+50', xp100: '+100', boost: '×2', shield: 'Shield', spin: '+1 spin', streak: 'Streak', mystery: 'Mystery', trap: 'Trap', leak: 'Leak', drain: 'Drain', reset: 'Reset', glitch: 'Glitch' };
    const stops = (last.stops || []).slice(-6);
    const path = stops.map((st, i) => {
      let t = names[st.k] || st.k, bg = 'rgba(255,255,255,.06)', edge = 'rgba(255,255,255,.10)', ink = '#D8D5E2';
      if (st.tone === 'good') { t = '+' + st.d + (st.mult > 1 ? ' ×' + st.mult : ''); bg = 'rgba(242,198,107,.12)'; edge = 'rgba(242,198,107,.32)'; ink = '#F2C66B'; }
      else if (st.tone === 'power') { bg = 'rgba(139,109,255,.14)'; edge = 'rgba(160,138,255,.36)'; ink = '#C6B6FF'; }
      else if (st.tone === 'blocked') { t = t + ' blocked'; bg = 'rgba(110,231,183,.12)'; edge = 'rgba(110,231,183,.34)'; ink = '#6EE7B7'; }
      else if (st.tone === 'bad') { t = t + (st.d < 0 ? ' −' + (-st.d) : ''); bg = 'rgba(255,92,122,.12)'; edge = 'rgba(255,138,154,.34)'; ink = '#FF8A9A'; }
      else if (st.tone === 'miss') { bg = 'rgba(255,255,255,.05)'; edge = 'rgba(255,138,154,.22)'; ink = '#A9A6B6'; }
      return { t: t, bg: bg, edge: edge, ink: ink, arrow: 'inline' };
    });

    const streak = last.streak || 0;
    const week = [];
    for (let i = 0; i < 7; i++) {
      const on = i < Math.min(7, streak);
      week.push({ bg: on ? 'linear-gradient(90deg,#F7D58A,#F7B267)' : 'rgba(255,255,255,.08)', glow: on && i === Math.min(7, streak) - 1 ? '0 0 10px rgba(247,178,103,.8)' : 'none' });
    }
    const bonusNext = Math.min(100, 20 * (streak + 1));

    const B = {
      first: ['First Bank', 'You banked your first run', 'M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4zM8.5 12.2l2.4 2.4 4.6-4.8'],
      cool: ['Cool Head', 'Banked 250 or more in one run', 'M12 21a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM12 9.5v4l2.5 1.5M10 2.5h4M18.5 6.5l1.5-1.5'],
      firewall: ['Firewall', 'Blocked 3 hazards with shields', 'M3.5 6.5h17v11h-17zM3.5 12h17M9 6.5V12M15 12v5.5'],
      overclock: ['Overclock', 'Stacked a ×4 boost', 'M13 2.5 5 13.5h6l-1 8 8-11h-6z'],
      close: ['Close Call', 'Banked right after a shield block', 'M3 12h4l2-5 4 10 2-5h6'],
      steady: ['Steady Hand', 'Banked on 5 days in a week', 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4M9 15l2 2 4-4']
    };
    const bd = last.badge && B[last.badge] ? B[last.badge] : null;

    const sampleBoard = [420, 380, 350, 300, 260, 240, 210, 190];
    const bestToday = Math.max(last.chalBest || 0, practice ? 0 : banked);
    const rank = bestToday > 0 ? 1 + sampleBoard.filter((v) => v > bestToday).length : 0;
    const gap = rank > 1 ? sampleBoard[rank - 2] - bestToday : 0;

    const total = (last.used || 0) + (last.left || 0);
    return {
      streakChip: streak + (streak === 1 ? '-day streak' : '-day streak'),
      tag: practice ? 'PRACTICE RUN · NOT SCORED' : 'SCORED RUN ' + (last.runNo || 1) + ' OF 5 · BANKED',
      title: title,
      bankedText: '+' + banked,
      bankedUnit: practice ? 'XP, practice' : 'game XP banked',
      chips: chips,
      spinsValue: (last.used || 0) + ' / ' + (total || 5),
      blockedValue: String(last.blocked || 0),
      bestValue: String(last.best || banked),
      howNote: last.how === 'auto' ? 'Banked on the last spin' : 'You banked with ' + (last.left || 0) + (last.left === 1 ? ' spin' : ' spins') + ' to spare',
      path: path,
      streakTitle: streak ? streak + '-day Rush streak' : 'Start a streak',
      streakBonus: 'Streak node pays +' + Math.min(100, 20 * Math.max(1, streak)),
      streakAria: streak + ' of 7 days',
      week: week,
      streakNote: practice ? 'Practice runs don’t count toward your streak.' : 'Bank a scored run tomorrow to make it ' + (streak + 1) + ' days. Your streak node would pay +' + bonusNext + ' XP.',
      hasBadge: !!bd && !practice,
      badgeName: bd ? bd[0] : '',
      badgeHow: bd ? bd[1] : '',
      badgeIcon: bd ? bd[2] : '',
      rankValue: rank ? '#' + rank : '—',
      rankTitle: rank ? 'You’re #' + rank + ' on today’s board' : 'Not on today’s board yet',
      rankNote: rank === 1 ? 'Top of the board. Ties go to whoever banked first.' : rank ? gap + ' XP behind #' + (rank - 1) + '. Best single run counts.' : 'Practice runs don’t rank. Bank a scored run to join.',
      shareLine: 'ALKE Rush · +' + banked + ' XP · ' + (last.used || 0) + ' spins',
      copyLabel: s.copied ? 'Copied' : 'Copy',
      copy: () => {
        try { if (navigator.clipboard) navigator.clipboard.writeText('ALKE Rush · +' + banked + ' XP in ' + (last.used || 0) + ' spins'); } catch (e) {}
        this.setState({ copied: true });
      },
      againLabel: practice ? 'Practice again' : 'Run again'
    };
  }
}

export default class RushBanked extends Logic {
  render() {
    const $ = this.vals();
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: "#08070D", backgroundImage: "radial-gradient(90% 42% at 50% 6%,rgba(242,198,107,.22) 0%,rgba(242,198,107,0) 70%),radial-gradient(80% 40% at 50% 60%,rgba(110,72,255,.20) 0%,rgba(110,72,255,0) 72%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<main style={{ position: "absolute", inset: "0", overflowY: "auto" }}>{" "}<div style={{ padding: "52px 20px 40px", display: "flex", flexDirection: "column", gap: "18px" }}>{" "}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", margin: "0 -4px" }}>{" "}<Link to="/games/rush" aria-label="Close" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box", flex: "none" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg></Link>{" "}<span style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "34px", padding: "0 12px", borderRadius: "999px", background: "rgba(247,178,103,.12)", border: "1px solid rgba(247,178,103,.30)", color: "#F7B267", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 21c3.9 0 7-2.6 7-6.4 0-3.3-2.2-5.4-3.9-7.2.1 2.1-.9 3.5-2.1 4C13.4 8 11.7 5.1 9.2 3.5c.4 3.1-1.4 4.9-2.7 6.6C5.4 11.5 5 12.8 5 14.6 5 18.4 8.1 21 12 21z"></path></svg>{$.streakChip}</span>{" "}</div>{" "}<div aria-hidden="true" style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto" }}>{" "}<span style={{ position: "absolute", inset: "-36px", borderRadius: "50%", background: "radial-gradient(circle,rgba(242,198,107,.36) 0%,rgba(242,198,107,.10) 45%,rgba(242,198,107,0) 68%)", animation: "rbGlow 3s ease-in-out infinite" }}></span>{" "}<svg width="180" height="180" viewBox="0 0 120 120" style={{ position: "absolute", inset: "0", overflow: "visible" }}><defs><linearGradient id="rbFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FBE2A2"></stop><stop offset=".5" stopColor="#E2A93B"></stop><stop offset="1" stopColor="#B9791A"></stop></linearGradient></defs><g style={{ transformOrigin: "60px 60px", animation: "rbOrbit 18s linear infinite" }}><circle cx="60" cy="60" r="56" fill="none" stroke="#F2C66B" strokeOpacity=".22" strokeWidth="1" strokeDasharray="2 7"></circle><circle cx="60" cy="4" r="2.5" fill="#FCE7B5"></circle></g><path d="M60 14 L99.8 37 L99.8 83 L60 106 L20.2 83 L20.2 37 Z" fill="rgba(242,198,107,.06)" stroke="#F2C66B" strokeOpacity=".55" strokeWidth="2" strokeLinejoin="round"></path><g style={{ transformOrigin: "60px 60px", animation: "rbSeal .6s .15s cubic-bezier(.2,1.4,.4,1) both" }}><path d="M60 24 L91.2 42 L91.2 78 L60 96 L28.8 78 L28.8 42 Z" fill="url(#rbFill)" stroke="#FCE7B5" strokeWidth="2" strokeLinejoin="round"></path><path d="M60 30 L86 45 L86 75 L60 90 L34 75 L34 45 Z" fill="none" stroke="#FFFFFF" strokeOpacity=".35" strokeWidth="1.2" strokeLinejoin="round"></path></g><path d="M45 61 L55 71 L76 49" fill="none" stroke="#2A1A03" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" style={{ animation: "rbTick .5s .55s ease-out both" }}></path></svg>{" "}<svg width="14" height="16" viewBox="0 0 100 112" style={{ position: "absolute", left: "83px", top: "82px", animation: "rbIn1 2.4s .2s ease-in infinite" }}><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="#F2C66B"></path></svg>{" "}<svg width="12" height="14" viewBox="0 0 100 112" style={{ position: "absolute", left: "84px", top: "83px", animation: "rbIn2 2.4s .8s ease-in infinite" }}><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="#5CE1E6"></path></svg>{" "}<svg width="12" height="14" viewBox="0 0 100 112" style={{ position: "absolute", left: "84px", top: "83px", animation: "rbIn3 2.4s 1.4s ease-in infinite" }}><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="#FCE7B5"></path></svg>{" "}<svg width="10" height="12" viewBox="0 0 100 112" style={{ position: "absolute", left: "85px", top: "84px", animation: "rbIn4 2.4s 2s ease-in infinite" }}><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="#C6B6FF"></path></svg>{" "}</div>{" "}<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center" }}>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: "#F2C66B" }}>{$.tag}</span>{" "}<h1 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "34px", lineHeight: "38px", fontWeight: "600", letterSpacing: "-.03em" }}>{$.title}</h1>{" "}<div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px", animation: "rbCount .5s .35s ease-out both" }}><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "64px", lineHeight: "1", fontWeight: "600", letterSpacing: "-.045em", color: "#F2C66B", fontVariantNumeric: "tabular-nums", textShadow: "0 0 30px rgba(242,198,107,.45)" }}>{$.bankedText}</span><span style={{ fontSize: "16px", fontWeight: "600", color: "#D8D5E2" }}>{$.bankedUnit}</span></div>{" "}<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", marginTop: "6px" }}>{" "}{($.chips || []).map((c, i0) => (<Fragment key={i0}><span style={{ display: "inline-flex", alignItems: "center", height: "28px", padding: "0 11px", borderRadius: "999px", background: c?.bg, color: c?.ink, fontSize: "12px", fontWeight: "600" }}>{c?.t}</span></Fragment>))}{" "}</div>{" "}</div>{" "}<dl style={{ margin: "0", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px" }}>{" "}<div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: "3px", padding: "14px 4px", borderRadius: "18px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}><dt style={{ fontSize: "11px", color: "#8C8999" }}>{"Spins used"}</dt><dd style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "600" }}>{$.spinsValue}</dd></div>{" "}<div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: "3px", padding: "14px 4px", borderRadius: "18px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}><dt style={{ fontSize: "11px", color: "#8C8999" }}>{"Hazards blocked"}</dt><dd style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "600", color: "#6EE7B7" }}>{$.blockedValue}</dd></div>{" "}<div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: "3px", padding: "14px 4px", borderRadius: "18px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}><dt style={{ fontSize: "11px", color: "#8C8999" }}>{"Best run"}</dt><dd style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "600", color: "#F2C66B" }}>{$.bestValue}</dd></div>{" "}</dl>{" "}<section aria-label="Your run" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 20px", borderRadius: "24px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600" }}>{"Your run"}</h2><span style={{ fontSize: "12px", color: "#8C8999" }}>{$.howNote}</span></div>{" "}<ol style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>{($.path || []).map((s, i1) => (<Fragment key={i1}><li style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "30px", padding: "0 10px", borderRadius: "999px", background: s?.bg, border: `1px solid ${s?.edge ?? ''}`, color: s?.ink, fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" }}>{s?.t}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6E6A82" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: s?.arrow }}><path d="m9 6 6 6-6 6"></path></svg></li></Fragment>))}<li><span style={{ display: "inline-flex", alignItems: "center", height: "30px", padding: "0 12px", borderRadius: "999px", background: "linear-gradient(135deg,#F7D58A,#E2A93B)", color: "#1A1205", fontSize: "12px", fontWeight: "700", letterSpacing: ".06em" }}>{"BANKED"}</span></li></ol>{" "}</section>{" "}<section aria-label="Rush streak" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 20px", borderRadius: "24px", background: "linear-gradient(160deg,rgba(247,178,103,.12),rgba(255,255,255,.02) 70%)", border: "1px solid rgba(247,178,103,.26)" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600" }}>{$.streakTitle}</h2><span style={{ fontSize: "12px", color: "#F7B267", fontWeight: "600" }}>{$.streakBonus}</span></div>{" "}<div role="img" aria-label={$.streakAria} style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: "6px" }}>{" "}{($.week || []).map((d, i2) => (<Fragment key={i2}><span style={{ height: "8px", borderRadius: "8px", background: d?.bg, boxShadow: d?.glow }}></span></Fragment>))}{" "}</div>{" "}<p style={{ margin: "0", fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}>{$.streakNote}</p>{" "}</section>{" "}{$.hasBadge ? (<>{" "}<section aria-label="New badge" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 18px", borderRadius: "24px", background: "linear-gradient(135deg,rgba(76,214,228,.14),rgba(255,255,255,.02))", border: "1px solid rgba(110,222,232,.32)" }}>{" "}<svg width="52" height="58" viewBox="0 0 100 112" aria-hidden="true" style={{ flex: "none" }}><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="rgba(76,214,228,.16)" stroke="#7FE9EE" strokeWidth="4" strokeLinejoin="round"></path><g transform="translate(50 56) scale(1.7) translate(-12 -12)" fill="none" stroke="#7FE9EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={$.badgeIcon}></path></g></svg>{" "}<span style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "0" }}><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "10.5px", letterSpacing: ".14em", color: "#7FE9EE" }}>{"NEW BADGE"}</span><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "600" }}>{$.badgeName}</span><span style={{ fontSize: "12px", color: "#A9A6B6" }}>{$.badgeHow}</span></span>{" "}</section>{" "}</>) : null}{" "}<Link to="/games/rush/leaderboards" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 18px", borderRadius: "24px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)", textDecoration: "none", color: "#F7F5F2" }}>{" "}<span style={{ flex: "none", width: "52px", height: "52px", borderRadius: "18px", background: "rgba(76,214,228,.12)", border: "1px solid rgba(110,222,232,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "700", color: "#7FE9EE" }}>{$.rankValue}</span>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px" }}><span style={{ fontSize: "15px", fontWeight: "600" }}>{$.rankTitle}</span><span style={{ fontSize: "12px", lineHeight: "17px", color: "#8C8999" }}>{$.rankNote}</span></span>{" "}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8C8999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9.5 6 6 6-6 6"></path></svg>{" "}</Link>{" "}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "12px 16px", borderRadius: "18px", background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)" }}>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "12px", color: "#D8D5E2" }}>{$.shareLine}</span>{" "}<button type="button" onClick={$.copy} style={{ flex: "none", height: "40px", padding: "0 14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "#F7F5F2", fontSize: "13px", fontWeight: "600" }}>{$.copyLabel}</button>{" "}</div>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{" "}<Link to="/games/rush/play" style={{ height: "56px", borderRadius: "999px", background: "linear-gradient(135deg,#F7D58A 0%,#E2A93B 55%,#C98A1E 100%)", color: "#1A1205", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none", boxShadow: "0 16px 34px -14px rgba(226,169,59,.95),inset 0 1px 0 rgba(255,255,255,.45)" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"></path></svg>{$.againLabel}</Link>{" "}<Link to="/games/rush/leaderboards" style={{ height: "52px", borderRadius: "999px", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none", boxSizing: "border-box" }}>{"Challenges and leaderboards"}</Link>{" "}<Link to="/games/rush" style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "600", color: "#C6B6FF", textDecoration: "none" }}>{"Back to ALKE Rush"}</Link>{" "}</div>{" "}<p style={{ margin: "0", fontSize: "12px", lineHeight: "18px", color: "#8C8999", textAlign: "center" }}>{"Game XP only. Nothing was added to or taken from your ALKE, allocation or contribution score, and no cold ALKE was warmed. Game XP is never redeemable for ALKE."}</p>{" "}</div>{" "}</main>{" "}</div>{" "}</>);
  }
}
