/* eslint-disable */
// Generated from the ALKE Network App design (18_20_ALKE_Rush_play_live_game_.html). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

class Logic extends DCLogic {
  componentDidMount() {
    try {
      this._rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      this._rm = false;
    }
  }
  componentWillUnmount() { this.halt(); }
  halt() {
    if (this._hop) { clearTimeout(this._hop); this._hop = null; }
    if (this._dead) { clearTimeout(this._dead); this._dead = null; }
    if (this._land) { clearTimeout(this._land); this._land = null; }
  }
  bump() { this.setState({ n: ((this.state && this.state.n) || 0) + 1 }); }

  // ---------- saved progress (alke.rush.v1)
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
  save(p) { try { window.localStorage.setItem('alke.rush.v1', JSON.stringify(p)); } catch (e) {} }
  today(p) {
    const k = this.dayKey(new Date());
    if (p.day !== k) { p.day = k; p.runsToday = 0; p.chal = { best: 0, done: false, block: false }; }
    if (!p.chal) p.chal = { best: 0, done: false, block: false };
    return p;
  }
  streakNow(p) {
    const t = this.dayKey(new Date()), y = this.dayKey(this.shift(-1));
    return p.lastBank === t || p.lastBank === y ? p.streak || 0 : 0;
  }
  daysBanked(p, now) {
    const keys = {};
    for (let i = 0; i < 7; i++) { const d = new Date(now.getTime()); d.setDate(d.getDate() - i); keys[this.dayKey(d)] = true; }
    const seen = {};
    (p.history || []).forEach((h) => {
      if (h.practice || h.result !== 'banked') return;
      const k = this.dayKey(new Date(h.t));
      if (keys[k]) seen[k] = true;
    });
    return Object.keys(seen).length;
  }

  // ---------- the board
  meta() {
    if (this._m) return this._m;
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
    const gold = { fill: '#16132C', edge: 'rgba(242,198,107,.6)', ink: '#F2C66B', cap: 'XP' };
    const bad = { fill: '#2A0E18', edge: 'rgba(255,138,154,.7)', ink: '#FF8A9A', bad: true };
    const K = {
      xp20: Object.assign({ name: '+20 XP', label: '+20', tag: '+20', sub: 'XP', xp: 20, fx: 'Adds 20 XP to what you hold', count: 5 }, gold),
      xp50: Object.assign({ name: '+50 XP', label: '+50', tag: '+50', sub: 'XP', xp: 50, fx: 'Adds 50 XP', count: 3 }, gold, { edge: 'rgba(242,198,107,.85)' }),
      xp100: { name: '+100 XP', label: '+100', tag: '+100', sub: 'XP', xp: 100, fx: 'Adds 100 XP', count: 1, fill: 'url(#rpTop)', swatch: '#3A2A12', edge: '#F7D58A', ink: '#FCE7B5', cap: 'XP' },
      boost: { name: '×2 Boost', label: '×2', tag: '×2', sub: 'BOOST', cap: 'BOOST', fx: 'Doubles your next XP node, stacks to ×4', count: 1, fill: '#201A46', edge: 'rgba(198,182,255,.8)', ink: '#C6B6FF' },
      shield: { name: 'Shield', icon: I.shield, tag: 'SHIELD', sub: 'BLOCKS 1', cap: 'SHIELD', fx: 'Blocks one hazard. Hold up to two', count: 1, fill: '#0F231E', edge: 'rgba(110,231,183,.75)', ink: '#6EE7B7' },
      spin: { name: 'Bonus spin', icon: I.spin, tag: '+1', sub: 'SPIN', cap: '+1 SPIN', fx: 'One more spin this run', count: 1, fill: '#111B37', edge: 'rgba(143,178,255,.75)', ink: '#8FB2FF' },
      streak: { name: 'Streak bonus', icon: I.streak, tag: '+20', sub: 'STREAK', cap: 'STREAK', fx: '+20 XP per day of your Rush streak, up to +100', count: 1, fill: '#23170D', edge: 'rgba(247,178,103,.75)', ink: '#F7B267' },
      mystery: { name: 'Mystery', label: '?', tag: '?', sub: 'MYSTERY', cap: 'MYSTERY', fx: 'XP, a shield or a spin. Never a hazard', count: 1, fill: '#0D2227', edge: 'rgba(127,233,238,.75)', ink: '#7FE9EE' },
      trap: Object.assign({ name: 'Trap', icon: I.trap, tag: 'TRAP', sub: 'LOSE ALL', cap: 'TRAP', fx: 'Takes all your unbanked XP', count: 1 }, bad),
      leak: Object.assign({ name: 'Leak', icon: I.leak, tag: 'LEAK', sub: 'LOSE HALF', cap: 'LEAK', fx: 'Takes half your unbanked XP', count: 1 }, bad),
      drain: Object.assign({ name: 'Drain', icon: I.drain, tag: 'DRAIN', sub: '−1 SHIELD', cap: 'DRAIN', fx: 'Takes a shield. Shields can’t stop it', count: 1 }, bad),
      reset: Object.assign({ name: 'Reset', icon: I.reset, tag: 'RESET', sub: 'ALL TO 0', cap: 'RESET', fx: 'Unbanked XP, boost and shields back to zero', count: 1 }, bad),
      glitch: Object.assign({ name: 'Network glitch', icon: I.glitch, tag: 'GLITCH', sub: 'RUN ENDS', cap: 'GLITCH', fx: 'Takes all unbanked XP and ends the run', count: 1 }, bad)
    };
    const deck = [];
    Object.keys(K).forEach((k) => { for (let i = 0; i < K[k].count; i++) deck.push(k); });
    this._m = { K: K, deck: deck, order: Object.keys(K), hazards: deck.filter((k) => K[k].bad).length };
    return this._m;
  }
  geo() {
    if (this._g) return this._g;
    const RL = 39.5, W = 62.4, H = 72, CX = 175, CY = 156;
    const cells = [];
    for (let r = -2; r <= 2; r++) for (let q = -2; q <= 2; q++) if (Math.abs(q + r) <= 2) cells.push({ q: q, r: r });
    const at = {};
    cells.forEach((c, i) => {
      at[c.q + ',' + c.r] = i;
      c.cx = CX + Math.sqrt(3) * RL * (c.q + c.r / 2);
      c.cy = CY + 1.5 * RL * c.r;
      c.x = c.cx - W / 2;
      c.y = c.cy - H / 2;
    });
    const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
    cells.forEach((c) => { c.nb = dirs.map((d) => at[(c.q + d[0]) + ',' + (c.r + d[1])]).filter((v) => v !== undefined); });
    this._g = { cells: cells, center: at['0,0'] };
    return this._g;
  }
  path(a, b) {
    if (a === b) return [];
    const G = this.geo();
    const prev = {};
    prev[a] = -1;
    const q = [a];
    while (q.length) {
      const c = q.shift();
      if (c === b) break;
      G.cells[c].nb.forEach((n) => { if (prev[n] === undefined) { prev[n] = c; q.push(n); } });
    }
    const out = [];
    let c = b;
    while (c !== a && c !== undefined && c !== -1) { out.unshift(c); c = prev[c]; }
    return out;
  }

  // ---------- a run
  make(start) {
    const M = this.meta(), G = this.geo();
    const p = this.today(this.load());
    const practice = p.runsToday >= 5;
    if (start && !practice) p.runsToday += 1;
    this.save(p);
    this._p = p;
    const deck = M.deck.slice();
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
    return {
      phase: start ? 'spin' : 'ready', board: deck, pos: G.center, trail: [],
      spins: 5, used: 0, shields: 0, boost: 1, maxBoost: 1, unbanked: 0, peak: 0, blocked: 0, lost: 0,
      practice: practice, runNo: practice ? 0 : (start ? p.runsToday : p.runsToday + 1),
      stops: [], land: null, ev: 0, crashed: false, result: null,
      lit: [], spinNo: 0, armAt: 0, deadline: 0, auto: false
    };
  }
  fresh(start) {
    this.halt();
    this.g = this.make(start);
    if (start) this.spin();
    this.bump();
  }
  begin() {
    const g = this.g;
    if (!g || g.phase !== 'ready') return;
    const p = this.today(this.load());
    g.practice = p.runsToday >= 5;
    if (!g.practice) { p.runsToday += 1; g.runNo = p.runsToday; this.save(p); }
    this._p = p;
    g.phase = 'spin';
    this.spin();
    this.bump();
  }
  // ---------- the light: it hops at random and speeds up every spin; STOP takes what's lit
  hopMs(n) { return Math.max(95, Math.round(240 * Math.pow(0.85, n - 1))); }
  spin() {
    const g = this.g, G = this.geo();
    this.halt();
    g.land = null;
    g.auto = false;
    g.spinNo = (g.spinNo || 0) + 1;
    const T = this.hopMs(g.used + 1);
    const hop = () => {
      const nb = G.cells[g.pos].nb.filter((n) => n !== g.trail[0]);
      const nx = nb[Math.floor(Math.random() * nb.length)];
      g.trail = [g.pos].concat(g.trail).slice(0, 2);
      g.pos = nx;
      g.lit.push({ t: Date.now(), i: nx, prev: g.trail[0] });
      if (g.lit.length > 14) g.lit.shift();
    };
    const now = Date.now();
    g.lit = [];
    hop(); // the light always leaves the node it stopped on last time
    g.armAt = now + 450;
    g.deadline = now + 12000;
    const tick = () => {
      this._hop = setTimeout(() => {
        if (this.g !== g || g.phase !== 'spin') return;
        hop();
        this.bump();
        tick();
      }, T * (0.88 + Math.random() * 0.24));
    };
    tick();
    this._dead = setTimeout(() => { if (this.g === g && g.phase === 'spin') this.stop(true); }, 12000);
  }
  stop(auto) {
    const g = this.g;
    if (!g || g.phase !== 'spin') return;
    const now = Date.now();
    if (!auto && now < g.armAt) return;
    this.halt();
    // It stops on what was lit a beat before the tap: 0.15 s covers the time
    // from seeing a node to the tap reaching the screen.
    let e = g.lit[g.lit.length - 1];
    if (!auto) {
      const t = now - 150;
      for (let k = g.lit.length - 1; k >= 0; k--) { e = g.lit[k]; if (e.t <= t) break; }
    }
    g.pos = e.i;
    g.trail = [];
    g.auto = !!auto;
    g.phase = 'landing';
    this.bump();
    this._land = setTimeout(() => this.land(), 380);
  }
  land() {
    const g = this.g;
    if (!g || g.phase !== 'landing') return;
    const M = this.meta();
    const kind = g.board[g.pos], K = M.K[kind];
    g.spins -= 1;
    g.used += 1;
    g.ev += 1;
    let delta = 0, text = '', tone = 'good', mult = 1, float = '';
    const add = (base) => { mult = g.boost; const v = base * g.boost; g.boost = 1; g.unbanked += v; delta += v; return v; };
    if (!K.bad) {
      if (K.xp) {
        add(K.xp);
        text = '+' + delta + ' XP' + (mult > 1 ? ', boosted ×' + mult : '') + '. Bank it, or risk it for more?';
      } else if (kind === 'streak') {
        const days = Math.max(1, this.streakNow(this._p || this.load()));
        add(Math.min(100, 20 * days));
        text = 'Streak bonus: +' + delta + ' XP' + (mult > 1 ? ', boosted ×' + mult : '') + '.';
      } else if (kind === 'boost') {
        g.boost = Math.min(4, g.boost * 2);
        g.maxBoost = Math.max(g.maxBoost, g.boost);
        tone = 'power'; float = '×' + g.boost;
        text = 'Boost: your next XP node pays ×' + g.boost + '.';
      } else if (kind === 'shield') {
        if (g.shields < 2) { g.shields += 1; tone = 'power'; float = 'Shield'; text = 'Shield up. It blocks the next hazard.'; }
        else { add(20); text = 'Shields are full, so +' + delta + ' XP instead.'; }
      } else if (kind === 'spin') {
        g.spins += 1; tone = 'power'; float = '+1 spin';
        text = 'Bonus spin: ' + g.spins + ' spins left.';
      } else if (kind === 'mystery') {
        const r = Math.random();
        if (r < 0.3) { add(30); text = 'Mystery: +' + delta + ' XP.'; }
        else if (r < 0.55) { add(75); text = 'Mystery: +' + delta + ' XP.'; }
        else if (r < 0.65) { add(150); text = 'Mystery: +' + delta + ' XP!'; }
        else if (r < 0.8 && g.shields < 2) { g.shields += 1; tone = 'power'; float = 'Shield'; text = 'Mystery: a shield.'; }
        else { g.spins += 1; tone = 'power'; float = '+1 spin'; text = 'Mystery: a bonus spin.'; }
      }
    } else {
      if (kind !== 'drain' && g.shields > 0) {
        g.shields -= 1; g.blocked += 1; tone = 'blocked'; float = 'Blocked';
        text = 'Your shield blocked the ' + (kind === 'glitch' ? 'glitch' : K.name.toLowerCase()) + '.';
      } else if (kind === 'trap') {
        delta = -g.unbanked; g.unbanked = 0; tone = delta ? 'bad' : 'miss';
        text = delta ? 'Trap! ' + (-delta) + ' unbanked XP is gone.' : 'A trap, but you had nothing at risk.';
      } else if (kind === 'leak') {
        const l = Math.ceil(g.unbanked / 2);
        delta = -l; g.unbanked -= l; tone = l ? 'bad' : 'miss';
        text = l ? 'Leak: half your unbanked XP, ' + l + ', drained away.' : 'A leak, but you had nothing at risk.';
      } else if (kind === 'drain') {
        if (g.shields > 0) { g.shields -= 1; tone = 'bad'; float = '−1 shield'; text = 'Drain took a shield.'; }
        else { tone = 'miss'; text = 'A drain, but you had no shield to lose.'; }
      } else if (kind === 'reset') {
        const had = g.unbanked > 0 || g.boost > 1 || g.shields > 0;
        delta = -g.unbanked; g.unbanked = 0; g.boost = 1; g.shields = 0; tone = had ? 'bad' : 'miss';
        text = had ? 'Reset: unbanked XP, boost and shields are back to zero.' : 'A reset, with nothing to lose.';
      } else if (kind === 'glitch') {
        delta = -g.unbanked; g.unbanked = 0; g.crashed = true; tone = 'bad';
        text = 'Network glitch! The run crashed.';
      }
      if (delta < 0) g.lost += -delta;
    }
    g.peak = Math.max(g.peak, g.unbanked);
    g.stops.push({ k: kind, d: delta, tone: tone, at: g.unbanked, mult: mult });
    if (g.auto) text = 'Time’s up. ' + text;
    g.land = { idx: g.pos, kind: kind, tone: tone, delta: delta, text: text, float: float, ev: g.ev };
    if (g.crashed) return this.finish('crashed', 'auto');
    if (g.spins <= 0) return this.finish(g.unbanked > 0 ? 'banked' : 'empty', 'auto');
    g.phase = 'decide';
    this.bump();
  }
  finish(kind, how) {
    const g = this.g;
    if (!g || g.phase === 'over') return;
    this.halt();
    const p = this.today(this.load());
    const now = new Date(), tk = this.dayKey(now), yk = this.dayKey(this.shift(-1));
    const banked = kind === 'banked' ? g.unbanked : 0;
    let bonus = 0, badge = null, newBest = false, hazard = null;
    for (let i = g.stops.length - 1; i >= 0; i--) { if (g.stops[i].tone === 'bad') { hazard = g.stops[i].k; break; } }
    const last = g.stops.length ? g.stops[g.stops.length - 1] : null;
    const result = kind === 'banked' ? 'banked' : kind === 'crashed' ? 'crashed' : 'lost';
    if (!g.practice) {
      const S = p.stats || (p.stats = {});
      const B = p.badges || (p.badges = {});
      const earn = (k) => { if (!B[k]) { B[k] = true; if (!badge) badge = k; } };
      S.runs = (S.runs || 0) + 1;
      S.blocked = (S.blocked || 0) + g.blocked;
      if (g.lost > 0 || kind === 'crashed') S.hazards = (S.hazards || 0) + 1;
      if (g.blocked > 0 && !p.chal.block) { p.chal.block = true; bonus += 20; }
      if (banked > 0) {
        if (banked >= 250 && !p.chal.done) { p.chal.done = true; bonus += 50; }
        p.chal.best = Math.max(p.chal.best || 0, banked);
        newBest = banked > (p.best || 0);
        p.best = Math.max(p.best || 0, banked);
        if (p.lastBank !== tk) { p.streak = p.lastBank === yk ? (p.streak || 0) + 1 : 1; p.lastBank = tk; }
        S.banks = (S.banks || 0) + 1;
        earn('first');
        if (banked >= 250) earn('cool');
        if (last && last.tone === 'blocked') earn('close');
      }
      if (g.maxBoost >= 4) earn('overclock');
      if ((S.blocked || 0) >= 3) earn('firewall');
      p.xp = (p.xp || 0) + banked + bonus;
      p.history = [{ t: now.getTime(), result: result, xp: banked, bonus: bonus, lost: g.lost, hazard: hazard, spins: g.used, practice: false }].concat(p.history || []).slice(0, 20);
      if (banked > 0 && this.daysBanked(p, now) >= 5) earn('steady');
    } else {
      p.history = [{ t: now.getTime(), result: result, xp: banked, bonus: 0, lost: g.lost, hazard: hazard, spins: g.used, practice: true }].concat(p.history || []).slice(0, 20);
    }
    p.last = {
      t: now.getTime(), result: kind, how: how, banked: banked, bonus: bonus, lost: g.lost, peak: g.peak,
      used: g.used, left: Math.max(0, g.spins), blocked: g.blocked, practice: g.practice, runNo: g.runNo,
      newBest: newBest, best: p.best || 0, streak: this.streakNow(p), badge: badge, xp: p.xp || 0, hazard: hazard,
      chalDone: !!p.chal.done, chalBest: p.chal.best || 0,
      stops: g.stops.slice(-10).map((s) => ({ k: s.k, d: s.d, tone: s.tone, at: s.at, mult: s.mult || 1 }))
    };
    this.save(p);
    this._p = p;
    g.phase = 'over';
    g.result = p.last;
    this.bump();
  }

  // ---------- view
  renderVals() {
    if (!this.g) this.g = this.make(false);
    const g = this.g, M = this.meta(), G = this.geo();
    const p = this._p || this.load();
    const s = this.state || {};
    const ph = g.phase;
    const L = g.land;
    const showLand = !!L && (ph === 'decide' || ph === 'over');
    const ab = L && L.ev % 2 ? 'A' : 'B';
    const moving = ph === 'spin' || ph === 'landing';

    const streakXP = Math.min(100, 20 * Math.max(1, this.streakNow(p)));
    const nodes = G.cells.map((c, i) => {
      const K = M.K[g.board[i]];
      let fill = K.fill, edge = K.edge, ink = K.ink, sw = '3', glow = 'none', tf = 'none', anim = 'none', sheen = '.07', op = '1';
      if (ph === 'ready') {
        anim = 'rpIdle 2.6s ' + ((((c.q * 3 + c.r * 5) % 7) + 7) % 7 * 0.2).toFixed(1) + 's ease-in-out infinite';
      } else if (moving && i === g.pos) {
        fill = 'url(#rpLit)'; edge = '#EFFEFF'; ink = '#03252A'; sw = '4'; sheen = '.55';
        glow = 'drop-shadow(0 0 12px rgba(92,225,230,.95))'; tf = 'scale(1.12)';
      } else if (moving && (i === g.trail[0] || i === g.trail[1])) {
        edge = 'rgba(127,233,238,.9)'; sw = '3.6';
        glow = i === g.trail[0] ? 'drop-shadow(0 0 8px rgba(92,225,230,.6))' : 'drop-shadow(0 0 4px rgba(92,225,230,.3))';
      } else if (showLand && L.idx === i) {
        sheen = '.4';
        if (L.tone === 'bad') { fill = 'url(#rpRed)'; edge = '#FF8A9A'; ink = '#FFE3E8'; sw = '4.5'; glow = 'drop-shadow(0 0 16px rgba(255,92,122,.95))'; anim = 'rpGlitch' + ab + ' .55s ease-out both'; tf = 'scale(1.04)'; }
        else if (L.tone === 'blocked') { edge = '#6EE7B7'; sw = '5'; glow = 'drop-shadow(0 0 14px rgba(110,231,183,.95))'; anim = 'rpLand' + ab + ' .45s ease-out both'; tf = 'scale(1.06)'; }
        else if (L.tone === 'miss') { edge = '#FF8A9A'; sw = '4'; glow = 'drop-shadow(0 0 8px rgba(255,92,122,.5))'; anim = 'rpLand' + ab + ' .45s ease-out both'; tf = 'scale(1.04)'; }
        else if (L.tone === 'power') { edge = '#EFFEFF'; sw = '4.5'; glow = 'drop-shadow(0 0 14px rgba(160,140,255,.95))'; anim = 'rpLand' + ab + ' .45s ease-out both'; tf = 'scale(1.06)'; }
        else { fill = 'url(#rpGold)'; edge = '#FCE7B5'; ink = '#2A1A03'; sw = '4.5'; glow = 'drop-shadow(0 0 16px rgba(242,198,107,.95))'; anim = 'rpLand' + ab + ' .45s ease-out both'; tf = 'scale(1.06)'; }
      } else if (showLand) {
        op = '.5';
      }
      const label = g.board[i] === 'streak' ? '+' + streakXP : K.tag;
      return {
        x: c.x.toFixed(1), y: c.y.toFixed(1),
        fill: fill, edge: edge, ink: ink, sw: sw, glow: glow, tf: tf, anim: anim, sheen: sheen, op: op,
        label: label,
        fs: label.length <= 2 ? '24' : label.length === 3 ? '21' : label.length === 4 ? '17' : label.length === 5 ? '14.5' : '12.5',
        cap: K.sub
      };
    });

    // Floating result over the landed node
    let floatText = '', floatInk = '#F2C66B', floatGlow = 'rgba(242,198,107,.8)';
    if (showLand) {
      if (L.delta > 0) floatText = '+' + L.delta;
      else if (L.delta < 0) { floatText = '−' + (-L.delta); floatInk = '#FF8A9A'; floatGlow = 'rgba(255,92,122,.85)'; }
      else if (L.float) {
        floatText = L.float;
        floatInk = L.tone === 'blocked' ? '#6EE7B7' : L.tone === 'bad' ? '#FF8A9A' : '#DCD2FF';
        floatGlow = L.tone === 'blocked' ? 'rgba(110,231,183,.8)' : L.tone === 'bad' ? 'rgba(255,92,122,.85)' : 'rgba(160,140,255,.85)';
      }
    }
    const fc = showLand ? G.cells[L.idx] : null;

    // Score
    const hit = showLand && L.tone === 'bad' && L.delta < 0;
    const has = g.unbanked > 0;

    // Spins, shields, boost
    const totalPips = Math.min(8, Math.max(5, g.used + g.spins));
    const pips = [];
    for (let i = 0; i < totalPips; i++) {
      const on = i < g.spins;
      pips.push({ bg: on ? '#5CE1E6' : 'transparent', edge: on ? '0' : '1.5px solid rgba(127,233,238,.35)', glow: on ? '0 0 6px rgba(92,225,230,.8)' : 'none' });
    }
    const shieldSlots = [0, 1].map((i) => ({ fill: i < g.shields ? 'rgba(110,231,183,.85)' : 'none', stroke: i < g.shields ? '#6EE7B7' : 'rgba(110,231,183,.4)' }));
    const boosted = g.boost > 1;

    // Status line
    let msg = '', tone = 'idle';
    const litKind = g.board[g.pos], LK = M.K[litKind];
    if (ph === 'ready') msg = g.practice ? 'Five scored runs are used today. This one is practice.' : 'Start, then STOP when the light is on the XP.';
    else if (ph === 'spin') { msg = g.used === 0 ? 'STOP when the light is on the prize you want.' : 'Faster now. STOP on the prize you want.'; tone = 'signal'; }
    else if (ph === 'landing') { msg = (g.auto ? 'Time’s up. ' : '') + 'Stopped on ' + LK.name + '.'; tone = 'signal'; }
    else if (L) { msg = L.text; tone = L.tone; }
    const T = {
      idle: ['rgba(255,255,255,.05)', 'rgba(255,255,255,.10)', '#D8D5E2'],
      signal: ['rgba(76,214,228,.10)', 'rgba(127,233,238,.28)', '#BFF6F8'],
      good: ['rgba(242,198,107,.12)', 'rgba(242,198,107,.32)', '#FCE7B5'],
      power: ['rgba(139,109,255,.14)', 'rgba(160,138,255,.36)', '#DCD2FF'],
      blocked: ['rgba(110,231,183,.12)', 'rgba(110,231,183,.34)', '#C9F6E3'],
      bad: ['rgba(255,92,122,.14)', 'rgba(255,138,154,.4)', '#FFD3DA'],
      miss: ['rgba(255,255,255,.05)', 'rgba(255,138,154,.25)', '#D8D5E2']
    }[tone] || ['rgba(255,255,255,.05)', 'rgba(255,255,255,.10)', '#D8D5E2'];

    // End of run
    const R = g.result;
    const over = ph === 'over' && !!R;
    const okBank = over && R.result === 'banked';
    let overTitle = '', overBoxTitle = '', overBoxNote = '', overBoxValue = '';
    if (over) {
      if (okBank) {
        overTitle = R.how === 'auto' ? 'Out of spins, banked' : 'Banked';
        overBoxTitle = R.practice ? 'Would have banked' : R.how === 'auto' ? 'Banked automatically' : 'Banked';
        overBoxNote = R.how === 'auto' ? 'Your last spin landed safely, so the run banked itself.' : 'Safe in your Rush total.';
        overBoxValue = '+' + R.banked + ' XP';
      } else {
        overTitle = R.result === 'crashed' ? 'Network glitch' : 'Run over';
        overBoxTitle = R.lost ? 'Unbanked XP lost' : 'Nothing banked';
        overBoxNote = 'XP you banked before is safe. ALKE is never touched.';
        overBoxValue = R.lost ? '−' + R.lost + ' XP' : '0 XP';
      }
    }
    const H = M.hazards;
    const left = Math.max(0, 5 - (p.day === this.dayKey(new Date()) ? p.runsToday || 0 : 0));

    const legend = M.order.map((id, i) => {
      const k = M.K[id];
      return {
        name: k.name, fx: k.fx, count: String(k.count),
        fill: k.swatch || k.fill, edge: k.edge, ink: k.ink, nameInk: k.bad ? '#FF8A9A' : '#F7F5F2',
        label: k.label || '', textDisp: k.label ? 'inline' : 'none',
        fs: k.label === '+100' ? '11' : k.label === '?' ? '16' : '13',
        ty: k.label === '?' ? '5.5' : '4.5',
        icon: k.icon || '', iconDisp: k.icon ? 'inline' : 'none',
        line: i === 0 ? '0' : id === 'trap' ? '1px solid rgba(255,138,154,.22)' : '1px solid rgba(255,255,255,.06)'
      };
    });

    return {
      runTag: g.practice ? 'PRACTICE · BANKS NOTHING' : 'SCORED RUN ' + g.runNo + ' OF 5',
      tagInk: g.practice ? '#A9A6B6' : '#7FE9EE',

      unbanked: String(g.unbanked),
      riskInk: hit ? '#FF8A9A' : has ? '#F2C66B' : '#8C8999',
      riskEdge: hit ? 'rgba(255,138,154,.6)' : has ? 'rgba(242,198,107,.55)' : 'rgba(255,255,255,.16)',
      riskBg: hit ? 'rgba(255,92,122,.08)' : has ? 'rgba(242,198,107,.07)' : 'rgba(255,255,255,.03)',
      riskLabel: hit ? '#FF8A9A' : has ? '#F2C66B' : '#A9A6B6',
      popAnim: showLand && L.delta !== 0 ? 'rpPop' + ab + ' .35s ease-out' : 'none',
      deltaDisp: showLand && L.delta !== 0 ? 'inline' : 'none',
      deltaText: showLand && L.delta > 0 ? '+' + L.delta : showLand && L.delta < 0 ? '−' + (-L.delta) : '',
      deltaInk: showLand && L.delta < 0 ? '#FF8A9A' : '#F2C66B',
      bankedTotal: String(p.xp || 0),
      bankedNote: g.practice ? 'Practice banks nothing' : 'Your Rush total',

      pips: pips,
      spinsText: g.spins + (g.spins === 1 ? ' SPIN LEFT' : ' SPINS LEFT'),
      spinsAria: g.spins + (g.spins === 1 ? ' spin left' : ' spins left'),
      shieldSlots: shieldSlots,
      shieldAria: g.shields + (g.shields === 1 ? ' shield' : ' shields') + ' ready',
      boostText: '×' + g.boost,
      boostInk: boosted ? '#C6B6FF' : '#6E6A82',
      boostBg: boosted ? 'rgba(139,109,255,.16)' : 'rgba(255,255,255,.03)',
      boostEdge: boosted ? 'rgba(160,138,255,.5)' : 'rgba(255,255,255,.08)',
      boostAria: boosted ? 'Next XP node pays times ' + g.boost : 'No boost armed',

      nodes: nodes,
      shakeAnim: showLand && L.tone === 'bad' && (L.delta < 0 || L.kind === 'glitch' || L.kind === 'reset') ? 'rpShake' + ab + ' .45s ease-out' : 'none',
      flashAnim: showLand && L.tone === 'bad' ? 'rpRed' + ab + ' .75s ease-out both' : 'none',
      floatText: floatText,
      floatInk: floatInk,
      floatGlow: floatGlow,
      floatAnim: floatText ? 'rpFloat' + ab + ' 1.1s ease-out both' : 'none',
      floatX: fc ? fc.cx.toFixed(1) : '0',
      floatY: fc ? (fc.cy - 52).toFixed(1) : '0',

      msg: msg, msgBg: T[0], msgEdge: T[1], msgInk: T[2],

      isReady: ph === 'ready',
      isSpin: ph === 'spin',
      isLanding: ph === 'landing',
      isDecide: ph === 'decide',
      canBank: ph === 'decide' && has,
      noBank: ph === 'decide' && !has,
      startLabel: g.practice ? 'START PRACTICE' : 'START RUN',
      startSub: g.practice ? 'Practice banks nothing' : 'Scored run ' + g.runNo + ' of 5 · 5 spins',
      bankSub: 'Keep +' + g.unbanked + ' XP',
      riskSub: g.spins + (g.spins === 1 ? ' spin left' : ' spins left'),
      showOdds: ph === 'decide' && has,
      showEnd: ph === 'decide' && !has,
      odds: 'Next spin is faster · ' + H + ' of 19 nodes are hazards' + (g.shields ? ' · shield ready' : ''),
      live: 'polite',
      stopSub: Date.now() < g.armAt ? 'Get ready…' : Math.max(0, Math.ceil((g.deadline - Date.now()) / 1000)) + 's left · stops on what’s lit',
      stopOp: Date.now() < g.armAt ? '.78' : '1',
      drainAnim: 'rpDrain' + (g.spinNo % 2 ? 'A' : 'B') + ' 12s linear forwards',
      landLabel: g.auto ? 'TIME’S UP' : 'STOPPED',

      showHelp: !!s.help,
      legend: legend,

      isOver: over,
      overTag: over ? (R.practice ? 'PRACTICE RUN · NOT SCORED' : 'SCORED RUN ' + R.runNo + ' OF 5') : '',
      overTagInk: okBank ? '#F2C66B' : '#FF8A9A',
      overTitle: overTitle,
      overBoxTitle: overBoxTitle,
      overBoxNote: overBoxNote,
      overBoxValue: overBoxValue,
      overBoxInk: okBank ? '#F2C66B' : over && R.lost ? '#FF8A9A' : '#A9A6B6',
      overBoxBg: okBank ? 'rgba(242,198,107,.08)' : 'rgba(255,92,122,.07)',
      overBoxEdge: okBank ? 'rgba(242,198,107,.26)' : 'rgba(255,138,154,.22)',
      overEdge: okBank ? 'rgba(242,198,107,.4)' : 'rgba(255,138,154,.4)',
      overGlow: okBank ? 'rgba(226,169,59,.55)' : 'rgba(255,92,122,.45)',
      overBanked: okBank,
      overLost: over && !okBank,
      showBonus: over && R.bonus > 0,
      bonusText: over && R.bonus > 0 ? 'Challenge bonus +' + R.bonus + ' XP added' : '',
      againLabel: left > 0 ? 'Run again' : 'Practice run',

      start: () => this.begin(),
      stop: () => this.stop(),
      bank: () => { const g2 = this.g; if (g2 && g2.phase === 'decide' && g2.unbanked > 0) this.finish('banked', 'manual'); },
      risk: () => { const g2 = this.g; if (g2 && g2.phase === 'decide') { g2.phase = 'spin'; this.spin(); this.bump(); } },
      endRun: () => { const g2 = this.g; if (g2 && g2.phase === 'decide') this.finish(g2.unbanked > 0 ? 'banked' : 'empty', 'manual'); },
      again: () => this.fresh(true),
      toggleHelp: () => this.setState({ help: !(this.state && this.state.help) })
    };
  }
}

export default class RushPlay extends Logic {
  render() {
    const $ = this.vals();
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", backgroundColor: "#08070D", backgroundImage: "radial-gradient(90% 32% at 50% -6%,rgba(76,214,228,.18) 0%,rgba(76,214,228,0) 70%),radial-gradient(80% 42% at 50% 50%,rgba(110,72,255,.26) 0%,rgba(110,72,255,0) 70%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}><defs><linearGradient id="rpLit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C8FBFC"></stop><stop offset=".5" stopColor="#5CE1E6"></stop><stop offset="1" stopColor="#1FA6B8"></stop></linearGradient><linearGradient id="rpGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FBE2A2"></stop><stop offset=".5" stopColor="#E9B44C"></stop><stop offset="1" stopColor="#C08417"></stop></linearGradient><linearGradient id="rpRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A3264A"></stop><stop offset="1" stopColor="#4A0F1E"></stop></linearGradient><linearGradient id="rpTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5A3E1A"></stop><stop offset="1" stopColor="#2A1C0A"></stop></linearGradient><linearGradient id="rpEdge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5CE1E6" stopOpacity=".55"></stop><stop offset="1" stopColor="#7A55FA" stopOpacity=".45"></stop></linearGradient></defs></svg>{" "}<div style={{ position: "absolute", left: "12px", right: "12px", top: "50px", display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", alignItems: "center", gap: "8px" }}>{" "}<Link to="/games/rush" aria-label="Leave the run" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg></Link>{" "}<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", minWidth: "0" }}>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "10.5px", letterSpacing: ".14em", color: $.tagInk, whiteSpace: "nowrap" }}>{$.runTag}</span>{" "}<h1 style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "17px", lineHeight: "22px", fontWeight: "600" }}>{"ALKE Rush"}</h1>{" "}</div>{" "}<button type="button" onClick={$.toggleHelp} aria-label="How the board works" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", padding: "0", boxSizing: "border-box" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17zM9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.6-2.4 2.1-2.4 3.6M12 16.6h.01"></path></svg></button>{" "}</div>{" "}<div style={{ position: "absolute", left: "16px", right: "16px", top: "104px", height: "84px", display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "8px" }}>{" "}<div style={{ position: "relative", overflow: "hidden", boxSizing: "border-box", padding: "10px 14px", borderRadius: "20px", background: $.riskBg, border: `1.5px dashed ${$.riskEdge ?? ''}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px" }}>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "10px", letterSpacing: ".14em", color: $.riskLabel }}>{"UNBANKED · AT RISK"}</span>{" "}<span style={{ display: "flex", alignItems: "baseline", gap: "6px", minWidth: "0" }}><span style={{ display: "inline-block", transformOrigin: "left center", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "36px", lineHeight: "40px", fontWeight: "600", letterSpacing: "-.03em", fontVariantNumeric: "tabular-nums", color: $.riskInk, animation: $.popAnim }}>{$.unbanked}</span><span style={{ fontSize: "14px", fontWeight: "600", color: "#A9A6B6" }}>{"XP"}</span><span style={{ marginLeft: "auto", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "15px", fontWeight: "700", color: $.deltaInk, display: $.deltaDisp }}>{$.deltaText}</span></span>{" "}</div>{" "}<div style={{ boxSizing: "border-box", padding: "10px 14px", borderRadius: "20px", background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.09)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", minWidth: "0" }}>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "10px", letterSpacing: ".14em", color: "#A9A6B6" }}>{"BANKED · SAFE"}</span>{" "}<span style={{ display: "flex", alignItems: "baseline", gap: "5px" }}><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "24px", lineHeight: "30px", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>{$.bankedTotal}</span><span style={{ fontSize: "12px", fontWeight: "600", color: "#A9A6B6" }}>{"XP"}</span></span>{" "}<span style={{ fontSize: "11px", lineHeight: "14px", color: "#8C8999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{$.bankedNote}</span>{" "}</div>{" "}</div>{" "}<div style={{ position: "absolute", left: "16px", right: "16px", top: "198px", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px" }}>{" "}<div role="img" aria-label={$.spinsAria} style={{ height: "52px", boxSizing: "border-box", borderRadius: "18px", background: "rgba(76,214,228,.07)", border: "1px solid rgba(127,233,238,.22)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>{" "}<span style={{ display: "flex", gap: "4px" }}>{($.pips || []).map((p, i0) => (<Fragment key={i0}><span style={{ width: "9px", height: "9px", borderRadius: "50%", boxSizing: "border-box", background: p?.bg, border: p?.edge, boxShadow: p?.glow }}></span></Fragment>))}</span>{" "}<span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: ".08em", color: "#A9A6B6" }}>{$.spinsText}</span>{" "}</div>{" "}<div role="img" aria-label={$.shieldAria} style={{ height: "52px", boxSizing: "border-box", borderRadius: "18px", background: "rgba(110,231,183,.06)", border: "1px solid rgba(110,231,183,.20)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}>{" "}<span style={{ display: "flex", gap: "4px" }}>{($.shieldSlots || []).map((sl, i1) => (<Fragment key={i1}><svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z" fill={sl?.fill} stroke={sl?.stroke} strokeWidth="1.8" strokeLinejoin="round"></path></svg></Fragment>))}</span>{" "}<span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: ".08em", color: "#A9A6B6" }}>{"SHIELDS"}</span>{" "}</div>{" "}<div role="img" aria-label={$.boostAria} style={{ height: "52px", boxSizing: "border-box", borderRadius: "18px", background: $.boostBg, border: `1px solid ${$.boostEdge ?? ''}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>{" "}<span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", lineHeight: "20px", fontWeight: "700", color: $.boostInk }}>{$.boostText}</span>{" "}<span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: ".08em", color: "#A9A6B6" }}>{"NEXT XP BOOST"}</span>{" "}</div>{" "}</div>{" "}<div aria-hidden="true" style={{ position: "absolute", left: "20px", top: "262px", width: "350px", height: "312px", animation: $.shakeAnim }}>{" "}<svg width="350" height="312" viewBox="0 0 350 312" style={{ position: "absolute", left: "0", top: "0", overflow: "visible" }}><path d="M88 3 L262 3 L347 156 L262 309 L88 309 L3 156 Z" fill="rgba(122,85,250,.05)" stroke="url(#rpEdge)" strokeWidth="1.5" strokeLinejoin="round"></path></svg>{" "}{($.nodes || []).map((n, i2) => (<Fragment key={i2}>{" "}<div style={{ position: "absolute", left: `${n?.x ?? ''}px`, top: `${n?.y ?? ''}px`, width: "62.4px", height: "72px", opacity: n?.op, transform: n?.tf, transition: "transform .12s ease,opacity .2s ease", filter: n?.glow, animation: n?.anim }}>{" "}<svg width="62.4" height="72" viewBox="0 0 100 115.47" style={{ position: "absolute", left: "0", top: "0", overflow: "visible" }}><polygon points="50,3 97,30.3 97,85.2 50,112.5 3,85.2 3,30.3" fill={n?.fill} stroke={n?.edge} strokeWidth={n?.sw} strokeLinejoin="round"></polygon><polygon points="50,11 90,34.1 90,81.4 50,104.5 10,81.4 10,34.1" fill="none" stroke="#FFFFFF" strokeOpacity={n?.sheen} strokeWidth="1.4" strokeLinejoin="round"></polygon></svg>{" "}<span style={{ position: "absolute", left: "0", right: "0", top: "0", bottom: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", color: n?.ink, pointerEvents: "none" }}><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: `${n?.fs ?? ''}px`, lineHeight: "1", fontWeight: "700", letterSpacing: "-.01em", whiteSpace: "nowrap" }}>{n?.label}</span><span style={{ fontFamily: "Inter,sans-serif", fontSize: "8.5px", lineHeight: "1", fontWeight: "700", letterSpacing: ".05em", whiteSpace: "nowrap", opacity: ".88" }}>{n?.cap}</span></span>{" "}</div>{" "}</Fragment>))}{" "}<span style={{ position: "absolute", left: `${$.floatX ?? ''}px`, top: `${$.floatY ?? ''}px`, whiteSpace: "nowrap", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "22px", fontWeight: "700", color: $.floatInk, textShadow: `0 0 14px ${$.floatGlow ?? ''}`, opacity: "0", pointerEvents: "none", animation: $.floatAnim }}>{$.floatText}</span>{" "}</div>{" "}<div role="status" aria-live={$.live} style={{ position: "absolute", left: "16px", right: "16px", top: "584px", height: "42px", display: "flex", justifyContent: "center", alignItems: "center" }}>{" "}<span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "34px", maxWidth: "100%", padding: "6px 14px", boxSizing: "border-box", borderRadius: "999px", background: $.msgBg, border: `1px solid ${$.msgEdge ?? ''}`, color: $.msgInk, fontSize: "13px", lineHeight: "17px", fontWeight: "600", textAlign: "center" }}>{$.msg}</span>{" "}</div>{" "}<div style={{ position: "absolute", left: "16px", right: "16px", top: "634px" }}>{" "}{$.isReady ? (<>{" "}<button type="button" onClick={$.start} style={{ width: "100%", height: "74px", border: "0", borderRadius: "999px", background: "linear-gradient(135deg,#7FF0F2 0%,#3CC7D6 45%,#6F4BF2 100%)", color: "#04161A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", boxShadow: "0 18px 40px -14px rgba(60,200,220,.9),inset 0 1px 0 rgba(255,255,255,.5)" }}><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "700", letterSpacing: ".08em" }}>{$.startLabel}</span><span style={{ fontSize: "12px", fontWeight: "600", opacity: ".82" }}>{$.startSub}</span></button>{" "}</>) : null}{" "}{$.isSpin ? (<>{" "}<button type="button" onClick={$.stop} aria-label="Stop the light on the node that is lit" style={{ position: "relative", overflow: "hidden", width: "100%", height: "74px", border: "0", borderRadius: "999px", background: "linear-gradient(135deg,#A8F7F8 0%,#3CC7D6 42%,#5C3AF0 100%)", color: "#04161A", animation: "rpRing 1s ease-out infinite", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1px", opacity: $.stopOp }}><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "28px", lineHeight: "30px", fontWeight: "700", letterSpacing: ".22em", paddingLeft: ".22em" }}>{"STOP"}</span><span style={{ fontSize: "12px", lineHeight: "15px", fontWeight: "700", opacity: ".8" }}>{$.stopSub}</span><span aria-hidden="true" style={{ position: "absolute", left: "28px", right: "28px", bottom: "7px", height: "4px", borderRadius: "4px", background: "rgba(4,22,26,.16)", overflow: "hidden" }}><span style={{ display: "block", width: "100%", height: "100%", borderRadius: "4px", background: "rgba(4,22,26,.55)", transformOrigin: "left center", animation: $.drainAnim }}></span></span></button>{" "}</>) : null}{" "}{$.isLanding ? (<>{" "}<button type="button" disabled style={{ width: "100%", height: "74px", borderRadius: "999px", border: "1px solid rgba(127,233,238,.32)", background: "rgba(76,214,228,.10)", color: "#7FE9EE", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "700", letterSpacing: ".14em" }}>{$.landLabel}</button>{" "}</>) : null}{" "}{$.isDecide ? (<>{" "}<div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px" }}>{" "}{$.canBank ? (<>{" "}<Link to="/games/rush/banked" onClick={$.bank} style={{ height: "74px", borderRadius: "26px", background: "linear-gradient(135deg,#F7D58A 0%,#E2A93B 55%,#C98A1E 100%)", color: "#1A1205", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", textDecoration: "none", boxShadow: "0 16px 34px -14px rgba(226,169,59,.95),inset 0 1px 0 rgba(255,255,255,.45)" }}><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "700", letterSpacing: ".1em" }}>{"BANK"}</span><span style={{ fontSize: "12px", fontWeight: "700" }}>{$.bankSub}</span></Link>{" "}</>) : null}{" "}{$.noBank ? (<>{" "}<button type="button" disabled style={{ width: "100%", height: "74px", borderRadius: "26px", border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", color: "#8C8999", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "20px", fontWeight: "700", letterSpacing: ".1em" }}>{"BANK"}</span><span style={{ fontSize: "12px", fontWeight: "600" }}>{"Nothing to bank"}</span></button>{" "}</>) : null}{" "}<button type="button" onClick={$.risk} style={{ height: "74px", border: "0", borderRadius: "26px", background: "linear-gradient(135deg,#7FF0F2 0%,#3CC7D6 45%,#6F4BF2 100%)", color: "#04161A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", boxShadow: "0 16px 34px -14px rgba(60,200,220,.9),inset 0 1px 0 rgba(255,255,255,.5)" }}><span style={{ fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "18px", fontWeight: "700", letterSpacing: ".06em" }}>{"RISK AGAIN"}</span><span style={{ fontSize: "12px", fontWeight: "700" }}>{$.riskSub}</span></button>{" "}</div>{" "}</>) : null}{" "}</div>{" "}<div style={{ position: "absolute", left: "16px", right: "16px", top: "718px", minHeight: "42px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textAlign: "center" }}>{" "}{$.showOdds ? (<><span style={{ fontSize: "12px", lineHeight: "17px", color: "#A9A6B6" }}>{$.odds}</span></>) : null}{" "}{$.showEnd ? (<><button type="button" onClick={$.endRun} style={{ height: "42px", padding: "0 16px", borderRadius: "999px", border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.05)", color: "#D8D5E2", fontSize: "13px", fontWeight: "600" }}>{"End run, nothing banked"}</button></>) : null}{" "}</div>{" "}<p style={{ position: "absolute", left: "24px", right: "24px", top: "772px", margin: "0", fontSize: "11px", lineHeight: "16px", color: "#8C8999", textAlign: "center" }}>{"Game XP is for play only. It has no monetary value and never converts to ALKE. No run touches your ALKE or contribution score."}</p>{" "}<div aria-hidden="true" style={{ position: "absolute", inset: "0", pointerEvents: "none", opacity: "0", background: "radial-gradient(70% 55% at 50% 48%,rgba(255,40,80,0) 30%,rgba(255,40,80,.5) 100%)", animation: $.flashAnim }}></div>{" "}{$.showHelp ? (<>{" "}<div style={{ position: "absolute", inset: "0", background: "rgba(6,5,11,.66)", animation: "rpFade .25s ease-out both" }}>{" "}<section role="dialog" aria-modal="true" aria-labelledby="rp-help-title" style={{ position: "absolute", left: "0", right: "0", bottom: "0", boxSizing: "border-box", padding: "12px 20px 28px", borderRadius: "32px 32px 0 0", background: "linear-gradient(180deg,#171433 0%,#0F0D21 60%,#0B0A14 100%)", borderTop: "1px solid rgba(110,222,232,.3)", display: "flex", flexDirection: "column", gap: "12px", animation: "rpRise .35s cubic-bezier(.2,.8,.2,1) both" }}>{" "}<span aria-hidden="true" style={{ alignSelf: "center", width: "40px", height: "5px", borderRadius: "5px", background: "rgba(255,255,255,.18)" }}></span>{" "}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}><h2 id="rp-help-title" style={{ margin: "0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "22px", fontWeight: "600" }}>{"The board"}</h2><button type="button" onClick={$.toggleHelp} aria-label="Close" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", padding: "0" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg></button></div>{" "}<p style={{ margin: "0", fontSize: "13px", lineHeight: "19px", color: "#A9A6B6" }}>{"19 nodes, reshuffled every run. The light hops at random and gets faster every spin. Tap STOP and it stops on the hex that’s lit, and you get the prize shown on it; after 12 seconds it stops by itself. 5 of the 19 are hazards; a shield blocks any of them except a Drain."}</p>{" "}<div style={{ maxHeight: "520px", overflowY: "auto", borderRadius: "20px", background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)" }}>{" "}{($.legend || []).map((l, i3) => (<Fragment key={i3}>{" "}<div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 14px", minHeight: "48px", boxSizing: "border-box", borderTop: l?.line }}>{" "}<svg width="28" height="32" viewBox="-21 -24 42 48" aria-hidden="true" style={{ flex: "none" }}><polygon points="0,-21.5 18.62,-10.75 18.62,10.75 0,21.5 -18.62,10.75 -18.62,-10.75" fill={l?.fill} stroke={l?.edge} strokeWidth="2" strokeLinejoin="round"></polygon><text x="0" y={l?.ty} textAnchor="middle" fontFamily="Space Grotesk, Inter, sans-serif" fontSize={l?.fs} fontWeight="700" fill={l?.ink} style={{ display: l?.textDisp }}>{l?.label}</text><g transform="translate(-7.8 -7.8) scale(.65)" fill="none" stroke={l?.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ display: l?.iconDisp }}><path d={l?.icon}></path></g></svg>{" "}<span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "14px", fontWeight: "600", color: l?.nameInk }}>{l?.name}</span><span style={{ fontSize: "12px", lineHeight: "16px", color: "#A9A6B6" }}>{l?.fx}</span></span>{" "}<span style={{ flex: "none", fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "12px", color: "#8C8999" }}>{"×"}{l?.count}</span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</section>{" "}</div>{" "}</>) : null}{" "}{$.isOver ? (<>{" "}<div style={{ position: "absolute", inset: "0", background: "rgba(6,5,11,.62)", animation: "rpFade .3s ease-out both" }}>{" "}<section role="dialog" aria-modal="true" aria-labelledby="rp-over-title" style={{ position: "absolute", left: "0", right: "0", bottom: "0", boxSizing: "border-box", padding: "12px 20px 30px", borderRadius: "32px 32px 0 0", background: "linear-gradient(180deg,#171433 0%,#100E22 55%,#0B0A14 100%)", borderTop: `1px solid ${$.overEdge ?? ''}`, boxShadow: `0 -30px 60px -24px ${$.overGlow ?? ''}`, display: "flex", flexDirection: "column", gap: "14px", animation: "rpRise .4s cubic-bezier(.2,.8,.2,1) both" }}>{" "}<span aria-hidden="true" style={{ alignSelf: "center", width: "40px", height: "5px", borderRadius: "5px", background: "rgba(255,255,255,.18)" }}></span>{" "}<span style={{ fontFamily: "'JetBrains Mono',ui-monospace,Menlo,monospace", fontSize: "11px", letterSpacing: ".14em", color: $.overTagInk }}>{$.overTag}</span>{" "}<h2 id="rp-over-title" style={{ margin: "-4px 0 0", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "28px", lineHeight: "32px", fontWeight: "600", letterSpacing: "-.02em" }}>{$.overTitle}</h2>{" "}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 16px", borderRadius: "20px", background: $.overBoxBg, border: `1px solid ${$.overBoxEdge ?? ''}` }}>{" "}<span style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "0" }}><span style={{ fontSize: "14px", fontWeight: "600" }}>{$.overBoxTitle}</span><span style={{ fontSize: "12px", lineHeight: "17px", color: "#A9A6B6" }}>{$.overBoxNote}</span></span>{" "}<span style={{ flex: "none", fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: "26px", fontWeight: "600", whiteSpace: "nowrap", color: $.overBoxInk }}>{$.overBoxValue}</span>{" "}</div>{" "}{$.showBonus ? (<><span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "6px", height: "30px", padding: "0 12px", borderRadius: "999px", background: "rgba(242,198,107,.14)", color: "#F2C66B", fontSize: "13px", fontWeight: "600" }}>{$.bonusText}</span></>) : null}{" "}<div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "2px" }}>{" "}{$.overBanked ? (<><Link to="/games/rush/banked" style={{ height: "54px", borderRadius: "999px", background: "linear-gradient(135deg,#F7D58A 0%,#E2A93B 55%,#C98A1E 100%)", color: "#1A1205", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", textDecoration: "none", boxShadow: "0 14px 30px -14px rgba(226,169,59,.95)" }}>{"See results"}</Link></>) : null}{" "}{$.overLost ? (<><Link to="/games/rush/lost" style={{ height: "54px", borderRadius: "999px", border: "1px solid rgba(255,138,154,.45)", background: "rgba(255,92,122,.10)", color: "#FFD3DA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", textDecoration: "none", boxSizing: "border-box" }}>{"See what happened"}</Link></>) : null}{" "}<button type="button" onClick={$.again} style={{ height: "54px", border: "0", borderRadius: "999px", background: "linear-gradient(135deg,#7FF0F2 0%,#3CC7D6 45%,#6F4BF2 100%)", color: "#04161A", fontSize: "16px", fontWeight: "700", boxShadow: "0 14px 30px -14px rgba(60,200,220,.9)" }}>{$.againLabel}</button>{" "}<Link to="/games/rush" style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "600", color: "#C6B6FF", textDecoration: "none" }}>{"Back to ALKE Rush"}</Link>{" "}</div>{" "}</section>{" "}</div>{" "}</>) : null}{" "}</div>{" "}</>);
  }
}
