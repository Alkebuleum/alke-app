/* eslint-disable */
// Generated from the ALKE Network App design (24_23_ALKE_Rush_leaderboards_challenges.html). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

class Logic extends DCLogic {
  componentDidMount() {
    this.setState({ now: Date.now() });
    this._t = setInterval(() => this.setState({ now: Date.now() }), 1000);
  }
  componentWillUnmount() {
    if (this._t) clearInterval(this._t);
  }
  pad(n) { return String(n).padStart(2, '0'); }
  dayKey(d) { return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate()); }
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
    const now = new Date(s.now || Date.now());
    const today = this.dayKey(now);
    const p = this.load();
    const day = new Date(now.getTime());
    const history = p && p.history ? p.history : [
      { t: day.getTime() - 86400000 - 3600000 * 4, result: 'banked', xp: 120, bonus: 0, practice: false },
      { t: day.getTime() - 2 * 86400000 - 3600000 * 2, result: 'banked', xp: 60, bonus: 0, practice: false }
    ];
    const chal = p && p.day === today && p.chal ? p.chal : { best: 0, done: false, block: false };

    // Last 7 calendar days, scored and banked runs only
    const keys = {};
    for (let i = 0; i < 7; i++) { const d = new Date(now.getTime()); d.setDate(d.getDate() - i); keys[this.dayKey(d)] = true; }
    const daysSeen = {};
    let weekTotal = 0;
    history.forEach((h) => {
      if (h.practice || h.result !== 'banked') return;
      const k = this.dayKey(new Date(h.t));
      if (!keys[k]) return;
      daysSeen[k] = true;
      weekTotal += (h.xp || 0) + (h.bonus || 0);
    });
    const weekDays = Math.min(5, Object.keys(daysSeen).length);

    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const sec = Math.max(0, Math.floor((midnight - now) / 1000));
    const best = chal.best || 0;

    const AV = ['linear-gradient(135deg,#C6B6FF,#7A55FA)', 'linear-gradient(135deg,#8DF0C9,#2BA37A)', 'linear-gradient(135deg,#F7D58A,#D99A2B)', 'linear-gradient(135deg,#A9C4FF,#4A86F7)', 'linear-gradient(135deg,#9AF5F6,#25B5C6)', 'linear-gradient(135deg,#FFC2CC,#E5677B)'];
    const boards = {
      today: { label: 'Today', note: 'Best single banked run today', unit: 'XP', you: best, list: [['nia.o', 420], ['kwame.dev', 380], ['zola_m', 350], ['tunde_a', 300], ['amara.k', 260], ['kofi.m', 240], ['sade_b', 210], ['ife.dev', 190]] },
      week: { label: 'This week', note: 'Total XP banked in the last 7 days', unit: 'XP', you: weekTotal, list: [['kwame.dev', 1840], ['nia.o', 1610], ['zola_m', 1450], ['amara.k', 1220], ['tunde_a', 980], ['kofi.m', 860], ['sade_b', 720], ['ife.dev', 640]] },
      friends: { label: 'Friends', note: 'Friends from your Network, best run today', unit: 'XP', you: best, list: [['kwame.dev', 380], ['kofi.m', 240], ['ife.dev', 190], ['esi.b', 90]] },
      circle: { label: 'Circle', note: 'Accra Builders, best run today', unit: 'XP', you: best, list: [['nia.o', 420], ['kofi.m', 240], ['sade_b', 210], ['yaw.b', 150], ['efua.a', 120]] }
    };
    const order = ['today', 'week', 'friends', 'circle'];
    const tab = order.indexOf(s.tab) >= 0 ? s.tab : 'today';
    const b = boards[tab];
    const entries = b.list.map((e) => ({ name: e[0], v: e[1], you: false }));
    if (b.you > 0) entries.push({ name: 'You · ama.o', v: b.you, you: true });
    entries.sort((x, y) => y.v - x.v || (x.you ? 1 : 0) - (y.you ? 1 : 0));
    const rows = entries.slice(0, 8).map((e, i) => this.row(e, i + 1, AV));
    const youIdx = entries.findIndex((e) => e.you);
    if (b.you > 0 && youIdx >= 8) rows.push(this.row(entries[youIdx], youIdx + 1, AV));
    if (!(b.you > 0)) rows.push(this.row({ name: 'You · ama.o', v: 0, you: true }, 0, AV));
    rows.forEach((r, i) => { r.line = i === 0 ? '0' : '1px solid rgba(255,255,255,.06)'; });

    return {
      resetIn: this.pad(Math.floor(sec / 3600)) + ':' + this.pad(Math.floor((sec % 3600) / 60)) + ':' + this.pad(sec % 60),
      chalNow: String(Math.min(250, best)),
      chalPct: String(chal.done ? 100 : Math.min(100, Math.round(best / 2.5))),
      chalStatus: chal.done ? 'Done · +50 XP added to your Rush total' : best ? 'Best today: ' + best + ' of 250' : 'Not played yet today',
      chalCta: chal.done ? 'Play again' : 'Go for it',
      blockStatus: chal.block ? 'Done · +20 XP added' : 'Not yet today',
      blockInk: chal.block ? '#6EE7B7' : '#A9A6B6',
      blockDot: chal.block ? '#6EE7B7' : '#6E6A82',
      weekDots: [0, 1, 2, 3, 4].map((i) => ({ bg: i < weekDays ? 'linear-gradient(90deg,#9AF5F6,#3CC7D6)' : 'rgba(255,255,255,.10)' })),
      weekAria: weekDays + ' of 5 days',
      weekStatus: weekDays >= 5 ? 'Done · Steady Hand earned' : weekDays + ' of 5 days · Steady Hand badge',
      tabs: order.map((k) => {
        const on = k === tab;
        return {
          label: boards[k].label, on: on ? 'true' : 'false',
          bg: on ? 'linear-gradient(135deg,#7FF0F2 0%,#3CC7D6 50%,#6F4BF2 100%)' : 'transparent',
          ink: on ? '#04161A' : '#D8D5E2',
          glow: on ? '0 8px 18px -8px rgba(60,200,220,.9)' : 'none',
          pick: () => this.setState({ tab: k })
        };
      }),
      panelLabel: b.label + ' board',
      panelNote: b.note,
      panelUnit: b.unit,
      rows: rows
    };
  }
  row(e, rank, AV) {
    const initials = e.you ? 'AO' : e.name.replace(/[^a-z]/gi, ' ').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    let h = 0;
    for (let i = 0; i < e.name.length; i++) h = (h * 31 + e.name.charCodeAt(i)) % 997;
    const medal = rank >= 1 && rank <= 3;
    const medalFill = rank === 1 ? 'rgba(242,198,107,.9)' : rank === 2 ? 'rgba(198,182,255,.85)' : 'rgba(92,225,230,.8)';
    return {
      rank: rank ? String(rank) : '—',
      rankInk: medal ? '#0A0A0F' : '#8C8999',
      medalDisp: medal ? 'block' : 'none',
      medalFill: medalFill,
      medalEdge: medal ? '#FFFFFF' : 'transparent',
      avatar: e.you ? 'linear-gradient(135deg,#F7D58A,#7A55FA)' : AV[h % AV.length],
      initials: initials,
      name: e.name,
      meta: e.you ? (e.v ? 'Your best' : 'Bank a scored run to rank') : rank === 1 ? 'Top of the board' : 'Alker',
      value: e.v ? e.v.toLocaleString('en-US') : '—',
      valInk: e.you ? '#F2C66B' : '#F7F5F2',
      bg: e.you ? 'linear-gradient(90deg,rgba(242,198,107,.10),rgba(242,198,107,.02))' : 'transparent',
      line: '1px solid rgba(255,255,255,.06)'
    };
  }
}

export default class RushLeaderboard extends Logic {
  render() {
    const $ = this.vals();
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: "#08070D", backgroundImage: "radial-gradient(90% 40% at 50% -6%,rgba(76,214,228,.18) 0%,rgba(76,214,228,0) 70%),radial-gradient(70% 36% at 50% 40%,rgba(110,72,255,.18) 0%,rgba(110,72,255,0) 72%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<main style={{ position: "absolute", inset: "0", overflowY: "auto" }}>{" "}<div style={{ padding: "52px 20px 128px", display: "flex", flexDirection: "column", gap: "18px" }}>{" "}<div style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", alignItems: "center", margin: "0 -4px" }}>{" "}<Link to="/games/rush" aria-label="Back to ALKE Rush" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 6-6 6 6 6"></path></svg></Link>{" "}<h1 style={{ margin: "0", textAlign: "center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600" }}>{"Rush boards"}</h1>{" "}<span></span>{" "}</div>{" "}<section aria-label="Challenges" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}><h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "19px", fontWeight: "600", letterSpacing: "-.01em" }}>{"Challenges"}</h2><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "12px", color: "#A9A6B6" }}>{"Resets in "}{$.resetIn}</span></div>{" "}<div style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: "12px", padding: "18px", borderRadius: "24px", background: "radial-gradient(120% 120% at 100% 0%,rgba(242,198,107,.22) 0%,rgba(242,198,107,0) 55%),linear-gradient(160deg,#2B1F5E 0%,#17112F 60%,#0E0B1E 100%)", border: "1px solid rgba(242,198,107,.32)", boxShadow: "0 26px 54px -32px rgba(217,154,43,.6)" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: "#F2C66B" }}>{"DAILY CHALLENGE"}</span><span style={{ display: "inline-flex", alignItems: "center", height: "26px", padding: "0 10px", borderRadius: "999px", background: "rgba(242,198,107,.18)", color: "#F2C66B", fontSize: "12px", fontWeight: "700" }}>{"+50 XP"}</span></div>{" "}<span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "22px", lineHeight: "26px", fontWeight: "600", letterSpacing: "-.02em" }}>{"Bank 250 XP in a single run"}</span>{" "}<div role="progressbar" aria-label="Daily challenge progress" aria-valuemin="0" aria-valuemax="250" aria-valuenow={$.chalNow} style={{ display: "block", height: "10px", borderRadius: "10px", background: "rgba(255,255,255,.10)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${$.chalPct ?? ''}%`, borderRadius: "10px", background: "linear-gradient(90deg,#F7D58A,#E2A93B)", boxShadow: "0 0 12px rgba(242,198,107,.7)" }}></span></div>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", fontSize: "13px" }}><span style={{ color: "#D8D5E2" }}>{$.chalStatus}</span><Link to="/games/rush/play" style={{ flex: "none", height: "40px", padding: "0 16px", borderRadius: "999px", background: "linear-gradient(135deg,#F7D58A 0%,#E2A93B 55%,#C98A1E 100%)", color: "#1A1205", display: "inline-flex", alignItems: "center", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}>{$.chalCta}</Link></div>{" "}</div>{" "}<div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px" }}>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "14px", borderRadius: "20px", background: "linear-gradient(180deg,rgba(110,231,183,.08),rgba(255,255,255,.02))", border: "1px solid rgba(110,231,183,.22)" }}>{" "}<span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}><span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".06em", color: "#6EE7B7" }}>{"DAILY"}</span><span style={{ fontSize: "11px", fontWeight: "700", color: "#F2C66B" }}>{"+20 XP"}</span></span>{" "}<span style={{ fontSize: "14px", lineHeight: "19px", fontWeight: "600" }}>{"Block a hazard with a shield"}</span>{" "}<span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: $.blockInk }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: $.blockDot, flex: "none" }}></span>{$.blockStatus}</span>{" "}</div>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "14px", borderRadius: "20px", background: "linear-gradient(180deg,rgba(76,214,228,.08),rgba(255,255,255,.02))", border: "1px solid rgba(110,222,232,.22)" }}>{" "}<span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}><span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".06em", color: "#7FE9EE" }}>{"WEEKLY"}</span><span style={{ fontSize: "11px", fontWeight: "700", color: "#7FE9EE" }}>{"Badge"}</span></span>{" "}<span style={{ fontSize: "14px", lineHeight: "19px", fontWeight: "600" }}>{"Bank a run on 5 days"}</span>{" "}<span role="img" aria-label={$.weekAria} style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "4px" }}>{($.weekDots || []).map((w, i0) => (<Fragment key={i0}><span style={{ height: "6px", borderRadius: "6px", background: w?.bg }}></span></Fragment>))}</span>{" "}<span style={{ fontSize: "12px", color: "#A9A6B6" }}>{$.weekStatus}</span>{" "}</div>{" "}</div>{" "}</section>{" "}<section aria-label="Leaderboards" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{" "}<h2 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "19px", fontWeight: "600", letterSpacing: "-.01em" }}>{"Leaderboards"}</h2>{" "}<div role="tablist" aria-label="Board" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "4px", padding: "4px", borderRadius: "999px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>{" "}{($.tabs || []).map((t, i1) => (<Fragment key={i1}>{" "}<button type="button" role="tab" aria-selected={t?.on} onClick={t?.pick} style={{ height: "40px", border: "0", borderRadius: "999px", background: t?.bg, color: t?.ink, fontSize: "13px", fontWeight: "600", boxShadow: t?.glow }}>{t?.label}</button>{" "}</Fragment>))}{" "}</div>{" "}<div role="tabpanel" aria-label={$.panelLabel} style={{ borderRadius: "22px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)", overflow: "hidden" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.06)" }}><span style={{ fontSize: "12px", color: "#A9A6B6" }}>{$.panelNote}</span><span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".08em", color: "#8C8999" }}>{$.panelUnit}</span></div>{" "}<ol style={{ listStyle: "none", margin: "0", padding: "0" }}>{($.rows || []).map((r, i2) => (<Fragment key={i2}><li style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", minHeight: "56px", boxSizing: "border-box", background: r?.bg, borderTop: r?.line }}>{" "}<span style={{ flex: "none", width: "28px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>{" "}<svg width="28" height="32" viewBox="0 0 100 112" aria-hidden="true" style={{ position: "absolute", inset: "0", display: r?.medalDisp }}><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill={r?.medalFill} stroke={r?.medalEdge} strokeWidth="5" strokeLinejoin="round"></path></svg>{" "}<span style={{ position: "relative", fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "12px", fontWeight: "600", color: r?.rankInk }}>{r?.rank}</span>{" "}</span>{" "}<span aria-hidden="true" style={{ flex: "none", width: "34px", height: "34px", borderRadius: "50%", background: r?.avatar, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#0A0A0F" }}>{r?.initials}</span>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r?.name}</span><span style={{ fontSize: "12px", color: "#8C8999" }}>{r?.meta}</span></span>{" "}<span style={{ flex: "none", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "16px", fontWeight: "600", color: r?.valInk, fontVariantNumeric: "tabular-nums" }}>{r?.value}</span>{" "}</li></Fragment>))}</ol>{" "}</div>{" "}<p style={{ margin: "0", fontSize: "12px", lineHeight: "18px", color: "#8C8999" }}>{"Boards rank game XP only. Practice runs never count, and ties go to whoever banked first. Friends and circles come from your Network."}</p>{" "}</section>{" "}<Link to="/games/hex/leaderboards" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", minHeight: "56px", padding: "0 18px", borderRadius: "22px", background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)", textDecoration: "none", color: "#F7F5F2", fontSize: "15px", fontWeight: "600" }}>{"ALKE Hex boards"}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8C8999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9.5 6 6 6-6 6"></path></svg></Link>{" "}</div>{" "}</main>{" "}<nav aria-label="Main" style={{ position: "absolute", left: "14px", right: "14px", bottom: "24px", height: "70px", borderRadius: "28px", background: "rgba(20,18,31,.80)", border: "1px solid rgba(255,255,255,.09)", boxShadow: "0 20px 40px -14px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.06)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", alignItems: "center", padding: "0 4px", boxSizing: "border-box" }}>{" "}<Link to="/home" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z"></path></svg></span>{"Home"}</Link>{" "}<Link to="/games" aria-current="page" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#F7F5F2", fontSize: "10.5px", fontWeight: "700" }}><span style={{ width: "48px", height: "30px", borderRadius: "15px", background: "rgba(139,109,255,.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C6B6FF" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.7 5.5h10.6a3.9 3.9 0 0 1 3.9 3.5l.7 6.4a2.9 2.9 0 0 1-5 2.3l-1.6-1.8a2 2 0 0 0-1.5-.7h-3.6a2 2 0 0 0-1.5.7l-1.6 1.8a2.9 2.9 0 0 1-5-2.3l.7-6.4a3.9 3.9 0 0 1 3.9-3.5zM8 9.2v3.6M6.2 11h3.6M14.9 12a.6.6 0 1 0 1.2 0a.6.6 0 1 0-1.2 0M16.9 9.8a.6.6 0 1 0 1.2 0a.6.6 0 1 0-1.2 0"></path></svg></span>{"Games"}</Link>{" "}<Link to="/mine" style={{ height: "70px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "3px", paddingBottom: "6px", boxSizing: "border-box", textDecoration: "none", color: "#A9A6B6", fontSize: "10.5px", fontWeight: "600" }}><span style={{ marginTop: "-34px", width: "58px", height: "64px", display: "block", filter: "drop-shadow(0 10px 18px rgba(110,72,255,.6))" }}><svg width="58" height="64" viewBox="0 0 100 112" aria-hidden="true"><defs><linearGradient id="tabHex" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9B7DFF"></stop><stop offset="1" stopColor="#5530E8"></stop></linearGradient></defs><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="url(#tabHex)" stroke="#D9CEFF" strokeOpacity=".55" strokeWidth="2.5" strokeLinejoin="round"></path><g transform="translate(50 56) scale(.5) translate(-50 -56)" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"><line x1="50" y1="27" x2="50" y2="85"></line><path d="M20 45 L32 56 L20 67"></path><path d="M30 45 L42 56 L30 67"></path><path d="M80 45 L68 56 L80 67"></path><path d="M70 45 L58 56 L70 67"></path></g></svg></span>{"Mine"}</Link>{" "}<Link to="/network" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8.5" r="3.5"></circle><path d="M2.5 20c.7-3.5 3.3-5.5 6.5-5.5s5.8 2 6.5 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.8 2.6 2.6 3 5.2"></path></svg></span>{"Network"}</Link>{" "}<Link to="/profile" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 20.5c.9-4 4-6 8-6s7.1 2 8 6"></path></svg></span>{"Profile"}</Link>{" "}</nav>{" "}</div>{" "}</>);
  }
}
