/* eslint-disable */
// Generated from the ALKE Network App design (15_14_ALKE_Hex_hub.html). Edit the logic freely;
// The layout is hand-built on the app shell (src/ui/shell.jsx).
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";
import { Button, Notice } from "../ui/ob";
import { AppPage, Ico, Row, Section, Stat, SubBar } from "../ui/shell";

const tc = (s) => String(s).split(" · ").map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(" · ");

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
      // A new player: level 1, no XP, no history.
      unlocked: 1,
      xp: 0,
      stars: {},
      daily: null,
      dailyStreak: 0,
      lastDailyWin: null,
      pending: null,
      badges: {},
      stats: { wins: 0, losses: 0, perfects: 0, blocked: 0 },
      history: []
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

    // Today's real board (alke_scores via the Boards wrapper), without my own row.
    const PB = this.props || {};
    const me = PB.me || {};
    const look = PB.look || (() => ({ ini: '?', grad: 'linear-gradient(135deg,#C6B6FF,#7A55FA)' }));
    const others = ((PB.boards && PB.boards.hexToday) || []).filter((r) => r.id !== me.id).map((r) => Object.assign({ u: r.name || 'Alker', xp: r.hexDaily || 0, time: r.hexDailyTime || 0 }, look(r.name || r.id)));
    const mine = d && d.result === 'won' ? Object.assign({ u: 'You', xp: d.xp, time: d.time || 0, me: true }, look(me.name || me.id)) : null;
    const list = others.concat(mine ? [mine] : []).sort((a, b) => b.xp - a.xp || a.time - b.time);
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
    const earned = $.badges.filter((b) => b.hint === "Earned").length;
    return (
      <AppPage
        tab="games"
        bar={
          <SubBar
            title="ALKE Hex"
            back="/games"
            right={
              <span className="ob-pill gold" style={{ justifySelf: "end", marginRight: 4 }}>
                <span className="num">{$.xpTotal}</span> XP
              </span>
            }
          />
        }
      >
        <section className="ob-hero gold" aria-label="Next level">
          <div>
            <div className="tag" style={{ color: "var(--gold)" }}>{tc($.heroTag)}</div>
            <div className="big" style={{ marginTop: 4 }}>{$.heroTitle}</div>
            <div className="meta" style={{ marginTop: 4 }}>{$.heroMeta}</div>
          </div>
          <div className="foot">
            <span style={{ display: "flex", gap: 6 }}>
              <span className="ob-pill gold">{$.heroXP}</span>
            </span>
            <Button size="sm" to="/games/hex/play" onClick={$.pickNext}>
              <Ico.Play size={14} />
              {$.heroCta.replace(" · ", " ")}
            </Button>
          </div>
        </section>

        <Section title="Daily challenge" action={<span className="num">Resets in {$.resetIn}</span>}>
          <ul className="ob-list">
            <li>
              <Row to="/games/hex/play" onClick={$.pickDaily} icon={<Ico.Star />} tone="gold" title="Today's board" sub={`${$.dailyStatus} · ${$.dailyNote}`} end={<span className="ob-pill gold">+100 XP</span>} />
            </li>
          </ul>
        </Section>

        <Section title="Levels" action={<span>{$.clearedLabel}</span>}>
          <div className="ob-levels">
            {$.levels.map((lv) =>
              lv.open ? (
                <Link key={lv.n} to="/games/hex/play" onClick={lv.pick} aria-label={lv.label} ref={lv.anim !== "none" ? (el) => { if (el && !this._shown) { this._shown = true; const box = el.parentNode; box.scrollLeft += el.getBoundingClientRect().left - box.getBoundingClientRect().left - 16; } } : undefined} className={`ob-level${lv.s1 === "#F2C66B" ? " done" : ""}${lv.anim !== "none" ? " cur" : ""}`}>
                  {lv.n}
                  <span className="stars" aria-hidden="true">
                    <i className={lv.s1 === "#F2C66B" ? "on" : ""} />
                    <i className={lv.s2 === "#F2C66B" ? "on" : ""} />
                    <i className={lv.s3 === "#F2C66B" ? "on" : ""} />
                  </span>
                </Link>
              ) : (
                <span key={lv.n} aria-label={lv.label} className="ob-level locked">
                  <Ico.Lock size={14} />
                </span>
              ),
            )}
          </div>
        </Section>

        <Section title="Badges" action={<span>{earned} of 6</span>}>
          <div className="ob-badges three">
            {$.badges.map((b) => (
              <div key={b.name} className={b.hint === "Earned" ? "ob-badge on" : "ob-badge"} title={b.hint}>
                <span className="b">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={b.icon} />
                  </svg>
                </span>
                {b.name}
              </div>
            ))}
          </div>
        </Section>

        {$.hasRounds ? (
          <Section title="Recent rounds">
            <ul className="ob-list">
              {$.rounds.map((r, i) => (
                <li key={i}>
                  <Row
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <path d={r.icon} />
                      </svg>
                    }
                    tone={r.amtColor === "#F2C66B" ? "gold" : "plain"}
                    title={r.title}
                    sub={r.when}
                    end={<span style={{ color: r.amtColor === "#F2C66B" ? "var(--gold)" : "var(--text-3)", fontSize: 13 }}>{r.amt}</span>}
                  />
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <ul className="ob-list">
          <li>
            <Row to="/games/hex/leaderboards" icon={<Ico.Trophy />} tone="gold" title="Leaderboards" sub="Daily board · all time" />
          </li>
        </ul>

        <p className="ob-small center">Game XP never becomes ALKE. It counts as a contribution that warms up to 0.3% of your cold ALKE a day.</p>
        {import.meta.env.DEV ? (
          <button type="button" className="ob-btn ghost" onClick={$.reset}>
            Reset progress (dev)
          </button>
        ) : null}
      </AppPage>
    );
  }
}
