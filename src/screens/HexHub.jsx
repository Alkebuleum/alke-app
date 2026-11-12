/* eslint-disable */
// Generated from the ALKE Network App design (15_14_ALKE_Hex_hub.html). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

class Logic extends DCLogic {
  componentDidMount() {
    this.setState({ prog: this.loadProg(), now: Date.now() });
    this._t = setInterval(() => this.setState({ now: Date.now(), prog: this.loadProg() }), 1000);
  }
  componentWillUnmount() {
    if (this._t) clearInterval(this._t);
  }
  meta() {
    if (!this._m) {
      this._m = {
        lv: [
          ['easy', 'frame', 2, 14, 0], ['easy', 'frame', 2, 13, 0], ['easy', 'frame', 3, 13, 0], ['easy', 'frame', 3, 13, 0],
          ['easy', 'frame', 4, 13, 0], ['easy', 'frame', 4, 12, 0], ['easy', 'frame', 4, 12, 0],
          ['mid', 'spine', 5, 19, 0], ['mid', 'spine', 6, 19, 0], ['mid', 'spine', 7, 19, 0], ['mid', 'spine', 7, 18, 0],
          ['mid', 'spine', 8, 18, 0], ['mid', 'spine', 9, 18, 0], ['mid', 'spine', 9, 18, 0],
          ['hard', 'mark', 8, 22, 180], ['hard', 'mark', 9, 22, 170], ['hard', 'mark', 9, 22, 160],
          ['hard', 'mark', 10, 21, 150], ['hard', 'mark', 10, 21, 140], ['hard', 'mark', 11, 21, 130]
        ],
        tier: {
          easy: { name: 'Easy', xp: 30, edge: '#B9A6FF', fill: 'linear-gradient(160deg,#7A55FA,#4C2BD9)', ink: '#FFFFFF' },
          mid: { name: 'Intermediate', xp: 60, edge: '#B5CCFF', fill: 'linear-gradient(160deg,#3B74E6,#24479E)', ink: '#FFFFFF' },
          hard: { name: 'Advanced', xp: 100, edge: '#FCE7B5', fill: 'linear-gradient(160deg,#F2C66B,#C98A1E)', ink: '#1A1205' }
        },
        pieces: { frame: 6, spine: 7, mark: 11 },
        title: { frame: 'Build the frame', spine: 'Frame and spine', mark: 'The full mark' }
      };
    }
    return this._m;
  }
  defaultProg() {
    return {
      v: 1,
      unlocked: 4,
      xp: 120,
      stars: { 1: 3, 2: 2, 3: 3 },
      daily: null,
      dailyStreak: 0,
      lastDailyWin: null,
      pending: null,
      badges: { first: true, flawless: true },
      stats: { wins: 3, losses: 1, perfects: 2, blocked: 1 },
      history: [
        { t: new Date(2026, 10, 9, 18, 20).getTime(), kind: 'level', level: 3, result: 'won', xp: 45 },
        { t: new Date(2026, 10, 9, 18, 8).getTime(), kind: 'level', level: 2, result: 'won', xp: 30 },
        { t: new Date(2026, 10, 8, 21, 40).getTime(), kind: 'level', level: 2, result: 'lost', xp: -20 },
        { t: new Date(2026, 10, 8, 21, 31).getTime(), kind: 'level', level: 1, result: 'won', xp: 45 }
      ]
    };
  }
  loadProg() {
    try {
      const raw = window.localStorage.getItem('alke.hex.v1');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.v === 1) return Object.assign(this.defaultProg(), p);
      }
    } catch (e) {}
    return this.defaultProg();
  }
  saveProg(p) {
    try {
      window.localStorage.setItem('alke.hex.v1', JSON.stringify(p));
    } catch (e) {}
  }
  curProg() {
    const s = this.state || {};
    return s.prog || this.defaultProg();
  }
  queue(pending) {
    const prog = Object.assign({}, this.loadProg(), { pending: Object.assign({ ts: Date.now() }, pending) });
    this.saveProg(prog);
    this.setState({ prog: prog });
  }
  pad(n) {
    return String(n).padStart(2, '0');
  }
  dayKey(d) {
    return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate());
  }
  dailyNo(d) {
    return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(d.getFullYear(), 0, 1)) / 86400000) + 1;
  }
  mmss(sec) {
    const v = Math.max(0, Math.round(sec || 0));
    return Math.floor(v / 60) + ':' + this.pad(v % 60);
  }
  when(t) {
    const d = new Date(t);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return days[d.getDay()] + ' ' + d.getDate() + ' ' + mons[d.getMonth()] + ' · ' + this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
  }
  renderVals() {
    const s = this.state || {};
    const M = this.meta();
    const prog = this.curProg();
    const all = ((this.props || {}).unlock) === 'all levels open';
    const now = new Date(s.now || Date.now());
    const stars = prog.stars || {};
    const unlocked = Math.max(1, Math.min(20, prog.unlocked || 1));
    const next = unlocked;
    const m = M.lv[next - 1];
    const T = M.tier[m[0]];
    const cleared = Object.keys(stars).filter((k) => stars[k] > 0).length;

    const today = this.dayKey(now);
    const d = prog.daily && prog.daily.date === today ? prog.daily : null;
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const left = Math.max(0, Math.floor((midnight - now) / 1000));
    const resetIn = this.pad(Math.floor(left / 3600)) + ':' + this.pad(Math.floor((left % 3600) / 60)) + ':' + this.pad(left % 60);
    let dailyStatus = 'Not played yet';
    let dailyDot = '#8C8999';
    if (d && d.result === 'won') {
      dailyStatus = 'Won · +' + d.xp + ' XP in ' + this.mmss(d.time);
      dailyDot = '#F2C66B';
    } else if (d && d.result === 'lost') {
      dailyStatus = 'Lost · back tomorrow';
      dailyDot = '#FF8A9A';
    } else if (d) {
      dailyStatus = 'Scored try used';
      dailyDot = '#FF8A9A';
    }

    const levels = M.lv.map((x, i) => {
      const n = i + 1;
      const t = M.tier[x[0]];
      const st = stars[n] || 0;
      const open = all || n <= unlocked;
      const cur = open && n === next && !st;
      const on = (k) => (st >= k ? '#F2C66B' : 'rgba(255,255,255,.14)');
      return {
        n: String(n),
        open: open,
        locked: !open,
        label: open ? 'Level ' + n + ', ' + t.name + (st ? ', ' + st + ' of 3 stars' : cur ? ', next up' : '') : 'Level ' + n + ', locked',
        edge: st ? t.edge : cur ? 'linear-gradient(160deg,#F7D58A,#C98A1E)' : 'rgba(198,182,255,.35)',
        fill: st ? t.fill : '#15112A',
        ink: st ? t.ink : cur ? '#F2C66B' : '#F7F5F2',
        anim: cur ? 'hxPulse 2.4s ease-in-out infinite' : 'none',
        s1: on(1),
        s2: on(2),
        s3: on(3),
        pick: () => this.queue({ mode: 'level', level: n })
      };
    });

    const B = [
      ['first', 'First Build', 'Win a round', 'M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4zM12 7v10'],
      ['flawless', 'Flawless', 'Win with no lives lost', 'M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.7a4.3 4.3 0 0 1 7.5 2.8c0 5.4-7.5 10-7.5 10z'],
      ['shield', 'Shield Wall', 'Block 3 traps', 'M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z'],
      ['amp', 'Amplified', 'Win with ×2 on', 'M13 2.5 5 13.5h6l-1 8 8-11h-6z'],
      ['daily', 'Daily Builder', 'Win a daily board', 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4'],
      ['architect', 'Master Architect', 'Clear level 20', 'M3.5 8.5 8 12l4-6 4 6 4.5-3.5-2 10h-13z']
    ];
    const got = prog.badges || {};
    const badges = B.map((b) => ({
      name: b[1],
      hint: got[b[0]] ? 'Earned' : b[2],
      icon: b[3],
      fill: got[b[0]] ? 'url(#hbGold)' : 'rgba(255,255,255,.03)',
      stroke: got[b[0]] ? '#FCE7B5' : 'rgba(255,255,255,.18)',
      dash: got[b[0]] ? 'none' : '7 7',
      ink: got[b[0]] ? '#3A2605' : '#6E6A82',
      color: got[b[0]] ? '#F7F5F2' : '#A9A6B6'
    }));

    const rounds = (prog.history || []).slice(0, 4).map((h) => {
      const won = h.result === 'won';
      return {
        title: (h.kind === 'daily' ? 'Daily #' + (h.day || '') : 'Level ' + h.level) + ' · ' + (won ? 'Won' : 'Lost'),
        when: this.when(h.t),
        amt: won ? '+' + h.xp + ' XP banked' : (h.xp ? Math.abs(h.xp) + ' unbanked XP lost' : 'Nothing banked'),
        amtColor: won ? '#F2C66B' : '#FF8A9A',
        tint: won ? 'rgba(242,198,107,.14)' : 'rgba(255,138,154,.12)',
        ink: won ? '#F2C66B' : '#FF8A9A',
        icon: won ? 'm5 12.5 4.5 4.5L19 7.5' : 'M6.5 6.5l11 11M17.5 6.5l-11 11'
      };
    });

    const sample = [
      { u: 'kwame.dev', ini: 'KD', grad: 'linear-gradient(135deg,#8FB2FF,#4A86F7)', xp: 150, time: 102 },
      { u: 'nia.o', ini: 'NO', grad: 'linear-gradient(135deg,#F7D58A,#D99A2B)', xp: 150, time: 118 },
      { u: 'zola_m', ini: 'ZM', grad: 'linear-gradient(135deg,#8DF0C9,#2BA37A)', xp: 135, time: 91 },
      { u: 'tunde_a', ini: 'TA', grad: 'linear-gradient(135deg,#C6B6FF,#7A55FA)', xp: 120, time: 97 },
      { u: 'amara.k', ini: 'AK', grad: 'linear-gradient(135deg,#FF8A9A,#C2354B)', xp: 100, time: 140 }
    ];
    const mine = d && d.result === 'won' ? { u: 'You', ini: 'AO', grad: 'linear-gradient(135deg,#C6B6FF,#7A55FA)', xp: d.xp, time: d.time || 0, me: true } : null;
    const list = sample.concat(mine ? [mine] : []).sort((a, b) => b.xp - a.xp || a.time - b.time);
    const top = list.slice(0, 3).map((p, i) => ({
      rank: String(i + 1),
      name: p.u,
      ini: p.ini,
      grad: p.grad,
      xp: p.xp + ' XP',
      meta: this.mmss(p.time) + ' · daily board',
      bg: p.me ? 'rgba(242,198,107,.08)' : 'transparent',
      rankColor: i === 0 ? '#F2C66B' : i === 1 ? '#D8D5E2' : '#E0A577'
    }));
    const myRank = mine ? list.indexOf(mine) + 1 : 0;

    return {
      xpTotal: String(prog.xp || 0),
      heroTag: 'LEVEL ' + next + ' · ' + T.name.toUpperCase(),
      heroTitle: M.title[m[1]],
      heroMeta: M.pieces[m[1]] + ' pieces · ' + m[2] + ' traps · ' + m[3] + ' moves' + (m[4] ? ' · ' + this.mmss(m[4]) + ' timer' : ''),
      heroXP: '+' + T.xp + ' XP',
      heroBonus: '+' + T.xp / 2 + ' if flawless',
      heroCta: (stars[next] ? 'Replay · Level ' : 'Continue · Level ') + next,
      pickNext: () => this.queue({ mode: 'level', level: next }),
      dailyTag: 'DAILY CHALLENGE #' + this.dailyNo(now),
      resetIn: resetIn,
      dailyStatus: dailyStatus,
      dailyDot: dailyDot,
      dailyNote: d ? 'Practice banks no XP' : 'One scored try a day',
      dailyCta: d ? "Practice today's board" : "Play today's board",
      pickDaily: () => this.queue({ mode: 'daily' }),
      clearedLabel: cleared + ' of 20 cleared',
      levels: levels,
      badges: badges,
      badgeCount: String(B.filter((b) => got[b[0]]).length),
      rounds: rounds,
      hasRounds: rounds.length > 0,
      noRounds: rounds.length === 0,
      top: top,
      showYou: !mine || myRank > 3,
      youRank: mine ? String(myRank) : '–',
      youMeta: mine ? this.mmss(mine.time) + ' · ' + mine.xp + ' XP' : "Play today's board to rank",
      reset: () => {
        const p = this.defaultProg();
        this.saveProg(p);
        this.setState({ prog: p });
      }
    };
  }
}

export default class HexHub extends Logic {
  render() {
    const $ = this.vals();
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: "#08070D", backgroundImage: "radial-gradient(90% 40% at 50% -6%,rgba(242,198,107,.16) 0%,rgba(242,198,107,0) 70%),radial-gradient(80% 40% at 50% 26%,rgba(110,72,255,.24) 0%,rgba(110,72,255,0) 70%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}><defs><linearGradient id="hbGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7D58A"></stop><stop offset="1" stopColor="#B97F1C"></stop></linearGradient></defs></svg>{" "}<main style={{ position: "absolute", inset: "0", overflowY: "auto" }}>{" "}<div style={{ padding: "52px 20px 128px", display: "flex", flexDirection: "column", gap: "18px" }}>{" "}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 -4px" }}>{" "}<Link to="/games" aria-label="Back to Games" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 6-6 6 6 6"></path></svg></Link>{" "}<span style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "34px", padding: "0 12px", borderRadius: "999px", background: "rgba(242,198,107,.12)", border: "1px solid rgba(242,198,107,.28)", color: "#F2C66B", fontSize: "13px", fontWeight: "600" }}><svg width="14" height="16" viewBox="0 0 100 112" fill="none" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" aria-hidden="true"><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z"></path></svg>{$.xpTotal}{" game XP"}</span>{" "}</div>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: "#F2C66B" }}>{"ALKE HEX · REVEAL & BUILD"}</span>{" "}<h1 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "32px", lineHeight: "36px", fontWeight: "600", letterSpacing: "-.03em" }}>{"Rebuild the mark"}</h1>{" "}<p style={{ margin: "0", fontSize: "14px", lineHeight: "21px", color: "#A9A6B6" }}>{"Uncover the gold pieces, read the clues, dodge the traps. Three lives a round."}</p>{" "}</div>{" "}<section aria-label="Next level" style={{ position: "relative", overflow: "hidden", borderRadius: "28px", padding: "22px", background: "radial-gradient(120% 120% at 100% 0%,rgba(242,198,107,.24) 0%,rgba(242,198,107,0) 55%),linear-gradient(160deg,#2B1F5E 0%,#17112F 60%,#0E0B1E 100%)", border: "1px solid rgba(242,198,107,.30)", boxShadow: "0 30px 60px -32px rgba(217,154,43,.6)", display: "flex", flexDirection: "column", gap: "18px" }}>{" "}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: "#F2C66B" }}>{$.heroTag}</span>{" "}<span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "24px", lineHeight: "28px", fontWeight: "600", letterSpacing: "-.02em" }}>{$.heroTitle}</span>{" "}<span style={{ fontSize: "13px", lineHeight: "18px", color: "#D8D5E2" }}>{$.heroMeta}</span>{" "}<span style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "2px" }}><span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 9px", borderRadius: "999px", background: "rgba(242,198,107,.16)", color: "#F2C66B", fontSize: "12px", fontWeight: "600" }}>{$.heroXP}</span><span style={{ display: "inline-flex", alignItems: "center", height: "24px", padding: "0 9px", borderRadius: "999px", background: "rgba(255,255,255,.08)", color: "#D8D5E2", fontSize: "12px", fontWeight: "500" }}>{$.heroBonus}</span></span>{" "}</div>{" "}<svg width="92" height="103" viewBox="0 0 100 112" aria-hidden="true" style={{ flex: "none", animation: "hxPulse 3.2s ease-in-out infinite" }}><g fill="none" stroke="#F2C66B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"><path d="M50 4 L94 29" style={{ animation: "hxLit 3.6s 0s ease-in-out infinite" }}></path><path d="M94 29 L94 83" style={{ animation: "hxLit 3.6s .3s ease-in-out infinite" }}></path><path d="M94 83 L50 108" style={{ animation: "hxLit 3.6s .6s ease-in-out infinite" }}></path><path d="M50 108 L6 83" style={{ animation: "hxLit 3.6s .9s ease-in-out infinite" }}></path><path d="M6 83 L6 29" style={{ animation: "hxLit 3.6s 1.2s ease-in-out infinite" }}></path><path d="M6 29 L50 4" style={{ animation: "hxLit 3.6s 1.5s ease-in-out infinite" }}></path><path d="M50 27 L50 85" style={{ animation: "hxLit 3.6s 1.8s ease-in-out infinite" }}></path><path d="M20 45 L32 56 L20 67" style={{ animation: "hxLit 3.6s 2.1s ease-in-out infinite" }}></path><path d="M30 45 L42 56 L30 67" style={{ animation: "hxLit 3.6s 2.4s ease-in-out infinite" }}></path><path d="M80 45 L68 56 L80 67" style={{ animation: "hxLit 3.6s 2.1s ease-in-out infinite" }}></path><path d="M70 45 L58 56 L70 67" style={{ animation: "hxLit 3.6s 2.4s ease-in-out infinite" }}></path></g></svg>{" "}</div>{" "}<Link to="/games/hex/play" onClick={$.pickNext} style={{ height: "54px", borderRadius: "999px", background: "linear-gradient(135deg,#F7D58A 0%,#E2A93B 55%,#C98A1E 100%)", color: "#1A1205", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "16px", fontWeight: "700", textDecoration: "none", boxShadow: "0 14px 30px -12px rgba(217,154,43,.8),inset 0 1px 0 rgba(255,255,255,.5)" }}>{$.heroCta}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></Link>{" "}</section>{" "}<section aria-label="Daily challenge" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px", borderRadius: "24px", background: "radial-gradient(130% 110% at 0% 0%,rgba(124,90,255,.30) 0%,rgba(124,90,255,0) 60%),linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02))", border: "1px solid rgba(160,138,255,.28)" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".12em", color: "#C6B6FF" }}>{$.dailyTag}</span><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "12px", color: "#A9A6B6" }}>{"Resets in "}{$.resetIn}</span></div>{" "}<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}><span style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "600" }}>{"Today's board"}</span><span style={{ fontSize: "13px", lineHeight: "18px", color: "#A9A6B6" }}>{"Full mark · 2:30 timer · the same board for everyone"}</span></span><span style={{ flex: "none", display: "inline-flex", alignItems: "center", height: "24px", padding: "0 9px", borderRadius: "999px", background: "rgba(242,198,107,.16)", color: "#F2C66B", fontSize: "12px", fontWeight: "600" }}>{"+100 XP"}</span></div>{" "}<div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: $.dailyDot, flex: "none" }}></span><span style={{ color: "#D8D5E2" }}>{$.dailyStatus}</span><span style={{ marginLeft: "auto", color: "#8C8999", textAlign: "right" }}>{$.dailyNote}</span></div>{" "}<Link to="/games/hex/play" onClick={$.pickDaily} style={{ height: "50px", borderRadius: "999px", background: "linear-gradient(135deg,#7A55FA 0%,#6236F5 50%,#5530E8 100%)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none", boxShadow: "0 12px 26px -12px rgba(110,72,255,.9),inset 0 1px 0 rgba(255,255,255,.22)" }}>{$.dailyCta}</Link>{" "}</section>{" "}<section aria-label="Levels" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px", borderRadius: "24px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "600" }}>{"Levels"}</h2><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "12px", color: "#A9A6B6" }}>{$.clearedLabel}</span></div>{" "}<div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", fontSize: "12px", color: "#A9A6B6" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#7A55FA" }}></span>{"Easy 1–7"}</span><span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#4A86F7" }}></span>{"Intermediate 8–14"}</span><span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#E2A93B" }}></span>{"Advanced 15–20"}</span></div>{" "}<div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "14px 6px", justifyItems: "center" }}>{" "}{($.levels || []).map((lv, i0) => (<Fragment key={i0}>{" "}<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", animation: lv?.anim }}>{" "}{lv?.open ? (<>{" "}<Link to="/games/hex/play" onClick={lv?.pick} aria-label={lv?.label} style={{ position: "relative", display: "block", width: "52px", height: "60px", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", background: lv?.edge, textDecoration: "none" }}><span style={{ position: "absolute", inset: "2px", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", background: lv?.fill, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "700", color: lv?.ink }}>{lv?.n}</span></Link>{" "}</>) : null}{" "}{lv?.locked ? (<>{" "}<span role="img" aria-label={lv?.label} style={{ position: "relative", display: "block", width: "52px", height: "60px", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", background: "rgba(255,255,255,.09)" }}><span style={{ position: "absolute", inset: "2px", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", background: "#0F0D18", display: "flex", alignItems: "center", justifyContent: "center", color: "#6E6A82" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg></span></span>{" "}</>) : null}{" "}<span aria-hidden="true" style={{ display: "flex", gap: "2px" }}><svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill={lv?.s1}></path></svg><svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill={lv?.s2}></path></svg><svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill={lv?.s3}></path></svg></span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</section>{" "}<section aria-label="Your counters" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px", borderRadius: "24px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)" }}>{" "}<h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "600" }}>{"Three counters, never mixed"}</h2>{" "}<div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px" }}>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px", borderRadius: "16px", background: "rgba(242,198,107,.08)", border: "1px solid rgba(242,198,107,.22)" }}><span style={{ fontSize: "11px", fontWeight: "600", color: "#F2C66B" }}>{"Game XP"}</span><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "600" }}>{$.xpTotal}</span><span style={{ fontSize: "11px", lineHeight: "14px", color: "#A9A6B6" }}>{"ALKE Hex only"}</span></div>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px", borderRadius: "16px", background: "rgba(139,109,255,.08)", border: "1px solid rgba(139,109,255,.22)" }}><span style={{ fontSize: "11px", fontWeight: "600", color: "#C6B6FF" }}>{"Contribution"}</span><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "600" }}>{"640"}</span><span style={{ fontSize: "11px", lineHeight: "14px", color: "#A9A6B6" }}>{"Sessions and community work"}</span></div>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px", borderRadius: "16px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.10)" }}><span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: "#D8D5E2" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg>{"ALKE"}</span><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "600" }}>{"31.20"}</span><span style={{ fontSize: "11px", lineHeight: "14px", color: "#A9A6B6" }}>{"Locked allocation"}</span></div>{" "}</div>{" "}<p style={{ margin: "0", fontSize: "12px", lineHeight: "18px", color: "#8C8999" }}>{"Separate ledgers. Game XP has no monetary value, can't be transferred and never converts to ALKE. No game result adds or removes ALKE."}</p>{" "}</section>{" "}<section aria-label="Today's leaderboard" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "600" }}>{"Today's top builders"}</h2><Link to="/games/hex/leaderboards" style={{ fontSize: "14px", fontWeight: "600", textDecoration: "none", color: "#C6B6FF" }}>{"All boards"}</Link></div>{" "}<div style={{ borderRadius: "22px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)", overflow: "hidden" }}>{" "}{($.top || []).map((p, i1) => (<Fragment key={i1}>{" "}<div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", minHeight: "60px", boxSizing: "border-box", borderBottom: "1px solid rgba(255,255,255,.06)", background: p?.bg }}>{" "}<span style={{ width: "20px", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "16px", fontWeight: "700", color: p?.rankColor }}>{p?.rank}</span>{" "}<span aria-hidden="true" style={{ width: "36px", height: "36px", borderRadius: "50%", background: p?.grad, color: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flex: "none" }}>{p?.ini}</span>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "14px", fontWeight: "600" }}>{p?.name}</span><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", color: "#8C8999" }}>{p?.meta}</span></span>{" "}<span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "15px", fontWeight: "600", color: "#F2C66B" }}>{p?.xp}</span>{" "}</div>{" "}</Fragment>))}{" "}{$.showYou ? (<>{" "}<div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", minHeight: "60px", boxSizing: "border-box", background: "rgba(139,109,255,.08)" }}>{" "}<span style={{ width: "20px", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "16px", fontWeight: "700", color: "#C6B6FF" }}>{$.youRank}</span>{" "}<span aria-hidden="true" style={{ width: "36px", height: "36px", borderRadius: "50%", padding: "2px", boxSizing: "border-box", background: "linear-gradient(135deg,#C6B6FF,#5E3AFF)", flex: "none" }}><span style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1A1530", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#F7F5F2" }}>{"AO"}</span></span>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "14px", fontWeight: "600" }}>{"You"}</span><span style={{ fontSize: "12px", color: "#A9A6B6" }}>{$.youMeta}</span></span>{" "}</div>{" "}</>) : null}{" "}</div>{" "}</section>{" "}<section aria-label="Hex badges" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px", borderRadius: "24px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "600" }}>{"Hex badges"}</h2><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "12px", color: "#F2C66B" }}>{$.badgeCount}{" of 6"}</span></div>{" "}<ul style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px 8px" }}>{($.badges || []).map((b, i2) => (<Fragment key={i2}><li style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center" }}><svg width="48" height="54" viewBox="0 0 100 112" aria-hidden="true"><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill={b?.fill} stroke={b?.stroke} strokeWidth="3" strokeDasharray={b?.dash} strokeLinejoin="round"></path><g transform="translate(50 56) scale(1.8) translate(-12 -12)" fill="none" stroke={b?.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={b?.icon}></path></g></svg><span style={{ fontSize: "12px", lineHeight: "16px", fontWeight: "600", color: b?.color }}>{b?.name}</span><span style={{ fontSize: "11px", lineHeight: "14px", color: "#8C8999" }}>{b?.hint}</span></li></Fragment>))}</ul>{" "}<p style={{ margin: "0", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,.06)", fontSize: "12px", lineHeight: "18px", color: "#8C8999" }}>{"Badges celebrate play. They have no monetary value and can't be traded."}</p>{" "}</section>{" "}<section aria-label="Recent rounds" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{" "}<h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "600" }}>{"Recent rounds"}</h2>{" "}{$.hasRounds ? (<>{" "}<div style={{ borderRadius: "22px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)", overflow: "hidden" }}>{" "}{($.rounds || []).map((r, i3) => (<Fragment key={i3}>{" "}<div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", minHeight: "60px", boxSizing: "border-box", borderBottom: "1px solid rgba(255,255,255,.06)" }}>{" "}<span aria-hidden="true" style={{ width: "36px", height: "36px", borderRadius: "12px", background: r?.tint, color: r?.ink, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={r?.icon}></path></svg></span>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "14px", fontWeight: "600" }}>{r?.title}</span><span style={{ fontSize: "12px", color: "#8C8999" }}>{r?.when}</span></span>{" "}<span style={{ fontSize: "13px", fontWeight: "600", textAlign: "right", color: r?.amtColor }}>{r?.amt}</span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</>) : null}{" "}{$.noRounds ? (<>{" "}<p style={{ margin: "0", fontSize: "14px", color: "#A9A6B6" }}>{"No rounds yet. Your wins, losses and banked XP will show here."}</p>{" "}</>) : null}{" "}</section>{" "}<p style={{ margin: "0", fontSize: "12px", lineHeight: "18px", color: "#8C8999", textAlign: "center" }}>{"Game XP is for play only: no monetary value, not transferable, never redeemable for ALKE. Losing a round never touches your ALKE, allocation or contribution score."}</p>{" "}<button type="button" onClick={$.reset} style={{ alignSelf: "center", height: "44px", padding: "0 16px", borderRadius: "999px", border: "1px solid rgba(255,255,255,.10)", background: "transparent", color: "#A9A6B6", fontSize: "13px", fontWeight: "600" }}>{"Reset demo progress"}</button>{" "}</div>{" "}</main>{" "}<nav aria-label="Main" style={{ position: "absolute", left: "14px", right: "14px", bottom: "24px", height: "70px", borderRadius: "28px", background: "rgba(20,18,31,.80)", border: "1px solid rgba(255,255,255,.09)", boxShadow: "0 20px 40px -14px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.06)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", alignItems: "center", padding: "0 4px", boxSizing: "border-box" }}>{" "}<Link to="/home" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z"></path></svg></span>{"Home"}</Link>{" "}<Link to="/games" aria-current="page" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#F7F5F2", fontSize: "10.5px", fontWeight: "700" }}><span style={{ width: "48px", height: "30px", borderRadius: "15px", background: "rgba(139,109,255,.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C6B6FF" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.7 5.5h10.6a3.9 3.9 0 0 1 3.9 3.5l.7 6.4a2.9 2.9 0 0 1-5 2.3l-1.6-1.8a2 2 0 0 0-1.5-.7h-3.6a2 2 0 0 0-1.5.7l-1.6 1.8a2.9 2.9 0 0 1-5-2.3l.7-6.4a3.9 3.9 0 0 1 3.9-3.5zM8 9.2v3.6M6.2 11h3.6M14.9 12a.6.6 0 1 0 1.2 0a.6.6 0 1 0-1.2 0M16.9 9.8a.6.6 0 1 0 1.2 0a.6.6 0 1 0-1.2 0"></path></svg></span>{"Games"}</Link>{" "}<Link to="/mine" style={{ height: "70px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "3px", paddingBottom: "6px", boxSizing: "border-box", textDecoration: "none", color: "#A9A6B6", fontSize: "10.5px", fontWeight: "600" }}><span style={{ marginTop: "-34px", width: "58px", height: "64px", display: "block", filter: "drop-shadow(0 10px 18px rgba(110,72,255,.6))" }}><svg width="58" height="64" viewBox="0 0 100 112" aria-hidden="true"><defs><linearGradient id="tabHex" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9B7DFF"></stop><stop offset="1" stopColor="#5530E8"></stop></linearGradient></defs><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="url(#tabHex)" stroke="#D9CEFF" strokeOpacity=".55" strokeWidth="2.5" strokeLinejoin="round"></path><g transform="translate(50 56) scale(.5) translate(-50 -56)" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"><line x1="50" y1="27" x2="50" y2="85"></line><path d="M20 45 L32 56 L20 67"></path><path d="M30 45 L42 56 L30 67"></path><path d="M80 45 L68 56 L80 67"></path><path d="M70 45 L58 56 L70 67"></path></g></svg></span>{"Mine"}</Link>{" "}<Link to="/network" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8.5" r="3.5"></circle><path d="M2.5 20c.7-3.5 3.3-5.5 6.5-5.5s5.8 2 6.5 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.8 2.6 2.6 3 5.2"></path></svg></span>{"Network"}</Link>{" "}<Link to="/profile" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 20.5c.9-4 4-6 8-6s7.1 2 8 6"></path></svg></span>{"Profile"}</Link>{" "}</nav>{" "}</div>{" "}</>);
  }
}
