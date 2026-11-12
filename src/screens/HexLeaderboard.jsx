/* eslint-disable */
// Generated from the ALKE Network App design (23_18_ALKE_Hex_leaderboards.html). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

class Logic extends DCLogic {
  componentDidMount() {
    this.setState({ prog: this.load(), now: Date.now() });
    this._t = setInterval(() => this.setState({ now: Date.now(), prog: this.load() }), 1000);
  }
  componentWillUnmount() {
    if (this._t) clearInterval(this._t);
    if (this._c) clearTimeout(this._c);
  }
  load() {
    try {
      const raw = window.localStorage.getItem('alke.hex.v1');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.v === 1) return p;
      }
    } catch (e) {}
    return null;
  }
  pad(n) {
    return String(n).padStart(2, '0');
  }
  mmss(sec) {
    const v = Math.max(0, Math.round(sec || 0));
    return Math.floor(v / 60) + ':' + this.pad(v % 60);
  }
  dayKey(d) {
    return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate());
  }
  renderVals() {
    const s = this.state || {};
    const tab = s.tab || 'today';
    const now = new Date(s.now || Date.now());
    const p = s.prog || null;
    const no = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(now.getFullYear(), 0, 1)) / 86400000) + 1;

    const people = {
      kd: { u: 'kwame.dev', ini: 'KD', grad: 'linear-gradient(135deg,#8FB2FF,#4A86F7)' },
      no: { u: 'nia.o', ini: 'NO', grad: 'linear-gradient(135deg,#F7D58A,#D99A2B)' },
      zm: { u: 'zola_m', ini: 'ZM', grad: 'linear-gradient(135deg,#8DF0C9,#2BA37A)' },
      ta: { u: 'tunde_a', ini: 'TA', grad: 'linear-gradient(135deg,#C6B6FF,#7A55FA)' },
      ak: { u: 'amara.k', ini: 'AK', grad: 'linear-gradient(135deg,#FF8A9A,#C2354B)' },
      eb: { u: 'efua.b', ini: 'EB', grad: 'linear-gradient(135deg,#A9C4FF,#3B74E6)' },
      sd: { u: 'sefa_d', ini: 'SD', grad: 'linear-gradient(135deg,#FBE2A2,#C08417)' },
      ok: { u: 'obi.k', ini: 'OK', grad: 'linear-gradient(135deg,#B3F5DA,#1F8F68)' },
      lw: { u: 'lindiwe', ini: 'LW', grad: 'linear-gradient(135deg,#E4DBFF,#6A45F5)' },
      yp: { u: 'yaw.p', ini: 'YP', grad: 'linear-gradient(135deg,#FFC2CC,#E5677B)' },
      km: { u: 'Kofi Mensah', ini: 'KM', grad: 'linear-gradient(135deg,#8DF0C9,#2BA37A)' }
    };
    const mk = (k, xp, time, meta) => Object.assign({ xp: xp, time: time || 0, meta: meta }, people[k]);

    const d = p && p.daily && p.daily.date === this.dayKey(now) ? p.daily : null;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    const weekXP = ((p || {}).history || [
      { t: new Date(2026, 10, 9, 18, 20).getTime(), result: 'won', xp: 45 },
      { t: new Date(2026, 10, 9, 18, 8).getTime(), result: 'won', xp: 30 }
    ]).filter((h) => h.result === 'won' && h.t >= monday.getTime()).reduce((a, h) => a + (h.xp || 0), 0);

    let list = [];
    let me = null;
    let kicker = '';
    let context = '';
    let unit = ' XP';
    if (tab === 'today') {
      kicker = 'DAILY #' + no + ' · 1,284 BUILDERS';
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const left = Math.max(0, Math.floor((midnight - now) / 1000));
      context = 'The same board for everyone · resets in ' + this.pad(Math.floor(left / 3600)) + ':' + this.pad(Math.floor((left % 3600) / 60)) + ':' + this.pad(left % 60);
      list = [mk('kd', 150, 102), mk('no', 150, 118), mk('zm', 135, 91), mk('ta', 120, 97), mk('ak', 100, 140), mk('eb', 100, 151), mk('sd', 90, 115), mk('ok', 85, 125), mk('lw', 80, 132), mk('yp', 75, 160)];
      list.forEach((x) => { x.meta = this.mmss(x.time) + (x.xp >= 150 ? ' · no lives lost' : ''); });
      if (d && d.result === 'won') me = { u: 'You', ini: 'AO', xp: d.xp, time: d.time || 0, meta: this.mmss(d.time) + ' · today\'s board', me: true };
    } else if (tab === 'week') {
      kicker = 'THIS WEEK · MONDAY TO SUNDAY';
      context = 'Total game XP banked this week across levels and daily boards';
      list = [mk('kd', 840, 0, '9 rounds won'), mk('no', 790, 0, '8 rounds won'), mk('zm', 720, 0, '8 rounds won'), mk('ak', 655, 0, '7 rounds won'), mk('ta', 610, 0, '7 rounds won'), mk('eb', 540, 0, '6 rounds won'), mk('sd', 505, 0, '6 rounds won'), mk('ok', 470, 0, '5 rounds won'), mk('lw', 430, 0, '5 rounds won'), mk('yp', 395, 0, '4 rounds won')];
      me = { u: 'You', ini: 'AO', xp: weekXP, time: 0, meta: 'This week so far', me: true };
    } else if (tab === 'friends') {
      kicker = 'FRIENDS · THIS WEEK';
      context = 'People in your circles and people who joined with your invite';
      list = [mk('kd', 840, 0, 'Accra Builders'), mk('no', 790, 0, 'Diaspora Learners'), mk('ta', 610, 0, 'Diaspora Learners'), mk('km', 210, 0, 'Joined with your invite')];
      me = { u: 'You', ini: 'AO', xp: weekXP, time: 0, meta: 'This week so far', me: true };
    } else {
      kicker = 'CIRCLE CUP · ENDS SUNDAY 23:59';
      context = 'Average game XP per playing member, so small circles can win too';
      unit = ' avg';
      list = [
        { u: 'Diaspora Learners', ini: 'DL', grad: 'linear-gradient(135deg,#F7D58A,#D99A2B)', xp: 212, meta: '41 playing this week' },
        { u: 'Accra Builders', ini: 'AB', grad: 'linear-gradient(135deg,#C6B6FF,#7A55FA)', xp: 198, meta: '17 playing · your circle', mine: true },
        { u: 'Lagos Ledger Club', ini: 'LL', grad: 'linear-gradient(135deg,#8DF0C9,#2BA37A)', xp: 176, meta: '29 playing' },
        { u: 'Nairobi Nodes', ini: 'NN', grad: 'linear-gradient(135deg,#8FB2FF,#4A86F7)', xp: 160, meta: '22 playing' },
        { u: 'Kumasi Coders', ini: 'KC', grad: 'linear-gradient(135deg,#FF8A9A,#C2354B)', xp: 148, meta: '12 playing' },
        { u: 'Dakar Devs', ini: 'DD', grad: 'linear-gradient(135deg,#A9C4FF,#3B74E6)', xp: 131, meta: '15 playing' }
      ];
    }

    const all = list.concat(me && tab !== 'today' ? [me] : []).concat(me && tab === 'today' ? [me] : []);
    all.sort((a, b) => b.xp - a.xp || a.time - b.time);
    const myIdx = me ? all.indexOf(me) : -1;

    const ringFor = ['linear-gradient(135deg,#FCE7B5,#C98A1E)', 'linear-gradient(135deg,#F7F5F2,#8C8999)', 'linear-gradient(135deg,#F3C9A6,#B5733F)'];
    const inkFor = ['#F2C66B', '#D8D5E2', '#E0A577'];
    const pedH = [104, 78, 60];
    const order = [1, 0, 2];
    const podium = order.filter((i) => all[i]).map((i, k) => {
      const x = all[i];
      const isMe = !!(x.me || x.mine);
      return {
        first: i === 0,
        rank: String(i + 1),
        name: x.u,
        ini: x.ini,
        grad: x.me ? 'linear-gradient(135deg,#C6B6FF,#7A55FA)' : x.grad,
        value: x.xp + unit,
        size: i === 0 ? '68' : '56',
        ring: ringFor[i],
        glow: i === 0 ? '0 0 24px rgba(242,198,107,.55)' : 'none',
        ped: String(pedH[i]),
        pedBg: i === 0 ? 'linear-gradient(180deg,rgba(242,198,107,.26),rgba(242,198,107,.04))' : isMe ? 'linear-gradient(180deg,rgba(139,109,255,.22),rgba(139,109,255,.03))' : 'linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.02))',
        pedEdge: i === 0 ? 'rgba(242,198,107,.45)' : 'rgba(255,255,255,.12)',
        rankInk: inkFor[i],
        delay: (0.05 + k * 0.08).toFixed(2)
      };
    });
    const rows = all.slice(3, 10).map((x, k) => ({
      rank: String(k + 4),
      name: x.u,
      ini: x.ini,
      grad: x.me ? 'linear-gradient(135deg,#C6B6FF,#7A55FA)' : x.grad,
      meta: x.meta || '',
      value: x.xp + unit,
      bg: x.me || x.mine ? 'rgba(242,198,107,.08)' : 'transparent'
    }));

    let youRank = '–';
    let youName = 'You';
    let youMeta = '';
    let youValue = '';
    let youCta = false;
    if (tab === 'today') {
      if (me) {
        youRank = '#' + (myIdx + 1);
        youMeta = this.mmss(me.time) + ' on today\'s board';
        youValue = me.xp + ' XP';
      } else {
        youMeta = d ? (d.result === 'lost' ? 'No rank today: your scored try was lost' : 'Your scored try today was not finished') : 'Play today\'s board to get a rank';
        youCta = !d;
      }
    } else if (tab === 'circles') {
      youRank = '#2';
      youName = 'Accra Builders';
      youMeta = 'You added ' + weekXP + ' XP this week';
      youValue = '198 avg';
    } else {
      youRank = '#' + (myIdx + 1);
      youMeta = tab === 'friends' && myIdx > 0 ? (all[myIdx - 1].xp - weekXP) + ' XP behind ' + all[myIdx - 1].u : 'Banked this week';
      youValue = weekXP + ' XP';
    }

    const defs = [['today', 'Today'], ['week', 'Week'], ['friends', 'Friends'], ['circles', 'Circles']];
    return {
      tabs: defs.map((t) => ({
        label: t[1],
        on: tab === t[0] ? 'true' : 'false',
        bg: tab === t[0] ? 'linear-gradient(135deg,#F7D58A,#C98A1E)' : 'transparent',
        shadow: tab === t[0] ? '0 6px 16px -6px rgba(217,154,43,.8)' : 'none',
        fg: tab === t[0] ? '#1A1205' : '#A9A6B6',
        pick: () => this.setState({ tab: t[0] })
      })),
      kicker: kicker,
      context: context,
      podium: podium,
      rows: rows,
      isCircles: tab === 'circles',
      isFriends: tab === 'friends',
      challengeLabel: s.copied ? 'Challenge link copied' : 'Challenge a friend to today\'s board',
      challenge: () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('Can you beat my ALKE Hex time on Daily #' + no + '?').catch(() => {});
        } catch (e) {}
        this.setState({ copied: true });
        if (this._c) clearTimeout(this._c);
        this._c = setTimeout(() => this.setState({ copied: false }), 1600);
      },
      youRank: youRank,
      youIni: tab === 'circles' ? 'AB' : 'AO',
      youName: youName,
      youMeta: youMeta,
      youValue: youValue,
      youCta: youCta,
      youScore: !youCta,
      queueDaily: () => {
        try {
          const raw = window.localStorage.getItem('alke.hex.v1');
          const q = (raw && JSON.parse(raw)) || { v: 1 };
          if (q.v !== 1) return;
          q.pending = { ts: Date.now(), mode: 'daily' };
          window.localStorage.setItem('alke.hex.v1', JSON.stringify(q));
        } catch (e) {}
      }
    };
  }
}

export default class HexLeaderboard extends Logic {
  render() {
    const $ = this.vals();
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: "#08070D", backgroundImage: "radial-gradient(90% 40% at 50% -6%,rgba(242,198,107,.18) 0%,rgba(242,198,107,0) 70%),radial-gradient(70% 34% at 50% 30%,rgba(110,72,255,.20) 0%,rgba(110,72,255,0) 70%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<main style={{ position: "absolute", inset: "0", overflowY: "auto" }}>{" "}<div style={{ padding: "52px 20px 210px", display: "flex", flexDirection: "column", gap: "14px" }}>{" "}<div style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", alignItems: "center", margin: "0 -4px" }}>{" "}<Link to="/games/hex" aria-label="Back to ALKE Hex" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 6-6 6 6 6"></path></svg></Link>{" "}<h1 style={{ margin: "0", textAlign: "center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", fontWeight: "600" }}>{"Leaderboards"}</h1>{" "}<span></span>{" "}</div>{" "}<div role="group" aria-label="Leaderboard" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", padding: "4px", gap: "4px", borderRadius: "999px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>{" "}{($.tabs || []).map((t, i0) => (<Fragment key={i0}>{" "}<button type="button" aria-pressed={t?.on} onClick={t?.pick} style={{ height: "40px", border: "0", borderRadius: "999px", padding: "0", background: t?.bg, boxShadow: t?.shadow, color: t?.fg, fontSize: "13px", fontWeight: "600" }}>{t?.label}</button>{" "}</Fragment>))}{" "}</div>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "center" }}>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".12em", color: "#F2C66B" }}>{$.kicker}</span>{" "}<span style={{ fontSize: "13px", lineHeight: "18px", color: "#A9A6B6" }}>{$.context}</span>{" "}</div>{" "}<div aria-label="Top three" role="list" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", alignItems: "end", gap: "8px", marginTop: "6px" }}>{" "}{($.podium || []).map((p, i1) => (<Fragment key={i1}>{" "}<div role="listitem" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", animation: `hlRise .45s ${p?.delay ?? ''}s ease-out both` }}>{" "}{p?.first ? (<><svg width="26" height="18" viewBox="0 0 26 18" aria-hidden="true" style={{ animation: "hlCrown 2.6s ease-in-out infinite" }}><path d="M2 16 4 4l5.5 5L13 2l3.5 7L22 4l2 12z" fill="#F2C66B" stroke="#FCE7B5" strokeWidth="1" strokeLinejoin="round"></path></svg></>) : null}{" "}<span aria-hidden="true" style={{ width: `${p?.size ?? ''}px`, height: `${p?.size ?? ''}px`, borderRadius: "50%", padding: "3px", boxSizing: "border-box", background: p?.ring, boxShadow: p?.glow }}><span style={{ display: "flex", width: "100%", height: "100%", borderRadius: "50%", background: p?.grad, border: "2px solid #0E0C18", boxSizing: "border-box", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A0A0F" }}>{p?.ini}</span></span>{" "}<span style={{ maxWidth: "100%", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p?.name}</span>{" "}<span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "15px", fontWeight: "600", color: "#F2C66B" }}>{p?.value}</span>{" "}<span style={{ width: "100%", height: `${p?.ped ?? ''}px`, borderRadius: "16px 16px 6px 6px", background: p?.pedBg, border: `1px solid ${p?.pedEdge ?? ''}`, borderBottom: "0", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10px", boxSizing: "border-box", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "24px", fontWeight: "700", color: p?.rankInk }}>{p?.rank}</span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}<div role="list" style={{ borderRadius: "22px", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)", overflow: "hidden" }}>{" "}{($.rows || []).map((r, i2) => (<Fragment key={i2}>{" "}<div role="listitem" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", minHeight: "60px", boxSizing: "border-box", borderBottom: "1px solid rgba(255,255,255,.06)", background: r?.bg }}>{" "}<span style={{ width: "24px", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "15px", fontWeight: "700", color: "#A9A6B6" }}>{r?.rank}</span>{" "}<span aria-hidden="true" style={{ width: "36px", height: "36px", borderRadius: "50%", background: r?.grad, color: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flex: "none" }}>{r?.ini}</span>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r?.name}</span><span style={{ fontSize: "12px", color: "#8C8999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r?.meta}</span></span>{" "}<span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "15px", fontWeight: "600", color: "#F2C66B", whiteSpace: "nowrap" }}>{r?.value}</span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}{$.isCircles ? (<>{" "}<div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", borderRadius: "18px", background: "rgba(242,198,107,.07)", border: "1px solid rgba(242,198,107,.22)" }}>{" "}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F2C66B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }}><path d="M7 4.5h10v4a5 5 0 0 1-10 0zM7 6.5H4.5a3 3 0 0 0 3 4M17 6.5h2.5a3 3 0 0 1-3 4M12 13.5v3.5M8.5 20.5h7l-1-3.5h-5z"></path></svg>{" "}<span style={{ fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}><b style={{ color: "#F7F5F2" }}>{"The Hex Cup."}</b>{" The top circle on Sunday wears the Hex Cup badge on its page for a week. Bragging rights only: there are no ALKE or cash prizes."}</span>{" "}</div>{" "}</>) : null}{" "}{$.isFriends ? (<>{" "}<button type="button" onClick={$.challenge} style={{ height: "52px", borderRadius: "999px", border: "1px solid rgba(160,138,255,.35)", background: "rgba(139,109,255,.12)", color: "#F7F5F2", fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 13v5.5A2 2 0 0 0 7 20.5h10a2 2 0 0 0 2-2V13"></path></svg>{$.challengeLabel}</button>{" "}</>) : null}{" "}<p style={{ margin: "0", fontSize: "12px", lineHeight: "18px", color: "#8C8999", textAlign: "center" }}>{"Rankings count game XP only. Game XP has no monetary value, can't be transferred and never converts to ALKE."}</p>{" "}</div>{" "}</main>{" "}<div style={{ position: "absolute", left: "14px", right: "14px", bottom: "106px", display: "flex", alignItems: "center", gap: "12px", padding: "10px 10px 10px 14px", borderRadius: "22px", background: "rgba(30,24,52,.92)", border: "1px solid rgba(242,198,107,.30)", boxShadow: "0 18px 36px -14px rgba(0,0,0,.8)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}>{" "}<span style={{ width: "30px", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "16px", fontWeight: "700", color: "#F2C66B", textAlign: "center" }}>{$.youRank}</span>{" "}<span aria-hidden="true" style={{ width: "38px", height: "38px", borderRadius: "50%", padding: "2px", boxSizing: "border-box", background: "conic-gradient(from 200deg,#C6B6FF,#7A55FA,#3150FF,#C6B6FF)", flex: "none" }}><span style={{ display: "flex", width: "100%", height: "100%", borderRadius: "50%", background: "#8B6DFF", border: "2px solid #1E1834", boxSizing: "border-box", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#FFFFFF" }}>{$.youIni}</span></span>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{$.youName}</span><span style={{ fontSize: "12px", color: "#A9A6B6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{$.youMeta}</span></span>{" "}{$.youCta ? (<><Link to="/games/hex/play" onClick={$.queueDaily} style={{ height: "44px", padding: "0 16px", borderRadius: "999px", background: "linear-gradient(135deg,#F7D58A 0%,#E2A93B 55%,#C98A1E 100%)", color: "#1A1205", display: "flex", alignItems: "center", fontSize: "14px", fontWeight: "700", textDecoration: "none", flex: "none" }}>{"Play"}</Link></>) : null}{" "}{$.youScore ? (<><span style={{ paddingRight: "6px", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "16px", fontWeight: "600", color: "#F2C66B", whiteSpace: "nowrap" }}>{$.youValue}</span></>) : null}{" "}</div>{" "}<nav aria-label="Main" style={{ position: "absolute", left: "14px", right: "14px", bottom: "24px", height: "70px", borderRadius: "28px", background: "rgba(20,18,31,.80)", border: "1px solid rgba(255,255,255,.09)", boxShadow: "0 20px 40px -14px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.06)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", alignItems: "center", padding: "0 4px", boxSizing: "border-box" }}>{" "}<Link to="/home" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z"></path></svg></span>{"Home"}</Link>{" "}<Link to="/games" aria-current="page" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#F7F5F2", fontSize: "10.5px", fontWeight: "700" }}><span style={{ width: "48px", height: "30px", borderRadius: "15px", background: "rgba(139,109,255,.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C6B6FF" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.7 5.5h10.6a3.9 3.9 0 0 1 3.9 3.5l.7 6.4a2.9 2.9 0 0 1-5 2.3l-1.6-1.8a2 2 0 0 0-1.5-.7h-3.6a2 2 0 0 0-1.5.7l-1.6 1.8a2.9 2.9 0 0 1-5-2.3l.7-6.4a3.9 3.9 0 0 1 3.9-3.5zM8 9.2v3.6M6.2 11h3.6M14.9 12a.6.6 0 1 0 1.2 0a.6.6 0 1 0-1.2 0M16.9 9.8a.6.6 0 1 0 1.2 0a.6.6 0 1 0-1.2 0"></path></svg></span>{"Games"}</Link>{" "}<Link to="/mine" style={{ height: "70px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "3px", paddingBottom: "6px", boxSizing: "border-box", textDecoration: "none", color: "#A9A6B6", fontSize: "10.5px", fontWeight: "600" }}><span style={{ marginTop: "-34px", width: "58px", height: "64px", display: "block", filter: "drop-shadow(0 10px 18px rgba(110,72,255,.6))" }}><svg width="58" height="64" viewBox="0 0 100 112" aria-hidden="true"><defs><linearGradient id="tabHex" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9B7DFF"></stop><stop offset="1" stopColor="#5530E8"></stop></linearGradient></defs><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="url(#tabHex)" stroke="#D9CEFF" strokeOpacity=".55" strokeWidth="2.5" strokeLinejoin="round"></path><g transform="translate(50 56) scale(.5) translate(-50 -56)" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"><line x1="50" y1="27" x2="50" y2="85"></line><path d="M20 45 L32 56 L20 67"></path><path d="M30 45 L42 56 L30 67"></path><path d="M80 45 L68 56 L80 67"></path><path d="M70 45 L58 56 L70 67"></path></g></svg></span>{"Mine"}</Link>{" "}<Link to="/network" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8.5" r="3.5"></circle><path d="M2.5 20c.7-3.5 3.3-5.5 6.5-5.5s5.8 2 6.5 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.8 2.6 2.6 3 5.2"></path></svg></span>{"Network"}</Link>{" "}<Link to="/profile" style={{ height: "60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", textDecoration: "none", color: "#8C8999", fontSize: "10.5px", fontWeight: "600" }}><span style={{ width: "48px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 20.5c.9-4 4-6 8-6s7.1 2 8 6"></path></svg></span>{"Profile"}</Link>{" "}</nav>{" "}</div>{" "}</>);
  }
}
