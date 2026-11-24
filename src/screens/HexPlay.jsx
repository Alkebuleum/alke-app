/* eslint-disable */
// Generated from the ALKE Network App design (17_15_ALKE_Hex_play_live_game_.html). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

class Logic extends DCLogic {
  componentDidMount() {
    if (!this.checkPending(true)) this.bump();
    this._t = setInterval(() => this.tick(), 1000);
  }
  componentWillUnmount() {
    if (this._t) clearInterval(this._t);
    if (this._c) clearInterval(this._c);
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
          easy: { name: 'Easy', xp: 30, r: 2 },
          mid: { name: 'Intermediate', xp: 60, r: 3 },
          hard: { name: 'Advanced', xp: 100, r: 3 }
        },
        pieces: { frame: 6, spine: 7, mark: 11 },
        title: { frame: 'Build the frame', spine: 'Frame and spine', mark: 'The full mark' },
        seg: ['M50 4 L94 29', 'M94 29 L94 83', 'M94 83 L50 108', 'M50 108 L6 83', 'M6 83 L6 29', 'M6 29 L50 4', 'M50 27 L50 85', 'M20 45 L32 56 L20 67', 'M30 45 L42 56 L30 67', 'M80 45 L68 56 L80 67', 'M70 45 L58 56 L70 67'],
        segName: ['Top-right edge', 'Right edge', 'Bottom-right edge', 'Bottom-left edge', 'Left edge', 'Top-left edge', 'The spine', 'Outer left chevron', 'Inner left chevron', 'Outer right chevron', 'Inner right chevron'],
        trap: {
          ember: { name: 'Ember', fx: 'Costs a life.', icon: 'M12 21c3.9 0 7-2.6 7-6.4 0-3.3-2.2-5.4-3.9-7.2.1 2.1-.9 3.5-2.1 4C13.4 8 11.7 5.1 9.2 3.5c.4 3.1-1.4 4.9-2.7 6.6C5.4 11.5 5 12.8 5 14.6 5 18.4 8.1 21 12 21z' },
          snare: { name: 'Snare', fx: 'Costs 2 moves.', icon: 'M3.5 9.5 6 13l2.5-3.5L11 13l2.5-3.5L16 13l2.5-3.5L21 13M4 17.5h16' },
          drain: { name: 'Drain', fx: 'Halves your round XP. Nothing to drain? It takes a life.', icon: 'M12 3.5s6 6.4 6 10.4a6 6 0 0 1-12 0c0-4 6-10.4 6-10.4zM9 14h6' },
          shatter: { name: 'Shatter', fx: 'Breaks your last piece and hides it again. No pieces yet? It takes a life.', icon: 'M12 3 4.5 7.3v9.4L12 21l7.5-4.3V7.3zM12 3l-1 6.5 3 2.5-2.5 3.5.5 5.5' },
          fog: { name: 'Fog', fx: 'Covers nearby clues again.', icon: 'M5 10.5h14M3.5 14h17M6 17.5h12M8 7h8' }
        },
        power: {
          shield: { name: 'Shield', fx: 'Blocks the next trap. Hold up to two.', color: '#6EE7B7', tint: 'rgba(110,231,183,.14)', glow: 'rgba(110,231,183,.6)', icon: 'M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z' },
          mult: { name: '×2 XP', fx: 'Doubles the XP of every piece after it. A second one makes it ×3.', color: '#C6B6FF', tint: 'rgba(139,109,255,.18)', glow: 'rgba(160,138,255,.65)', icon: 'M13 2.5 5 13.5h6l-1 8 8-11h-6z' },
          moves: { name: '+3 moves', fx: 'Three extra reveals.', color: '#8FB2FF', tint: 'rgba(74,134,247,.16)', glow: 'rgba(143,178,255,.6)', icon: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17zM12 8v8M8 12h8' }
        },
        intro: {
          1: 'Numbers count the traps touching a tile. A gold rim means a piece is next to it.',
          2: 'New trap: Snare costs 2 moves. New power-up: +3 moves.',
          3: 'New trap: Drain halves your round XP. New power-up: ×2 XP.',
          4: 'New trap: Shatter breaks your last piece and hides it somewhere else.',
          5: 'New trap: Fog covers nearby clues again. All five traps are now in play.',
          8: 'New piece: the spine. The board grows to 37 tiles.',
          15: 'The full mark: 11 pieces, and now a timer.'
        }
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
  prog() {
    try {
      const raw = window.localStorage.getItem('alke.hex.v1');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.v === 1) return Object.assign(this.defaultProg(), p);
      }
    } catch (e) {}
    return this._mem ? JSON.parse(JSON.stringify(this._mem)) : this.defaultProg();
  }
  save(p) {
    this._mem = p;
    this._pc = p;
    try {
      window.localStorage.setItem('alke.hex.v1', JSON.stringify(p));
    } catch (e) {}
  }
  readPending() {
    try {
      const raw = window.localStorage.getItem('alke.hex.v1');
      if (!raw) return null;
      const p = JSON.parse(raw);
      return p && p.pending ? p.pending : null;
    } catch (e) {
      return null;
    }
  }
  checkPending(force) {
    const p = this.readPending();
    if (!p) return false;
    const ts = Number(p.ts) || 0;
    if (!force && ts <= (this._pts || 0)) return false;
    this._pts = ts || 1;
    if (p.mode === 'daily') this.setup('daily', 0);
    else this.setup('level', Math.max(1, Math.min(20, Number(p.level) || 1)));
    return true;
  }
  bump() {
    this.setState({ v: ((this.state || {}).v || 0) + 1 });
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
  dailyNo(d) {
    return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(d.getFullYear(), 0, 1)) / 86400000) + 1;
  }
  hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  maxLevel() {
    if (((this.props || {}).unlock) === 'all levels open') return 20;
    const p = this._pc || this.prog();
    return Math.max(1, Math.min(20, p.unlocked || 1));
  }
  cfgFor(mode, level) {
    const M = this.meta();
    if (mode === 'daily') {
      return { mode: 'daily', level: 0, tier: 'hard', shape: 'mark', traps: 9, moves: 22, timer: 150, r: 3, xp: 100, types: ['ember', 'snare', 'drain', 'shatter', 'fog'], powers: ['shield', 'mult', 'moves'] };
    }
    const n = Math.max(1, Math.min(20, level || 1));
    const x = M.lv[n - 1];
    const all = ['ember', 'snare', 'drain', 'shatter', 'fog'];
    const types = n === 1 ? ['ember'] : n === 2 ? ['ember', 'snare'] : n === 3 ? ['ember', 'snare', 'drain'] : n === 4 ? ['ember', 'snare', 'drain', 'shatter'] : all;
    const powers = n === 1 ? ['shield'] : n === 2 ? ['shield', 'moves'] : ['shield', 'mult', 'moves'];
    return { mode: 'level', level: n, tier: x[0], shape: x[1], traps: x[2], moves: x[3], timer: x[4], r: M.tier[x[0]].r, xp: M.tier[x[0]].xp, types: types, powers: powers };
  }
  build(cfg, seed) {
    const R = cfg.r;
    const rand = this.rng(seed);
    const tiles = [];
    const index = {};
    for (let q = -R; q <= R; q++) {
      const r1 = Math.max(-R, -q - R);
      const r2 = Math.min(R, -q + R);
      for (let r = r1; r <= r2; r++) {
        index[q + ',' + r] = tiles.length;
        tiles.push({ q: q, r: r, d: Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)), kind: 'empty', sub: '', clue: 0, open: false, flag: false, blocked: false, ghost: false, anim: 'none' });
      }
    }
    const offs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];
    const nb = tiles.map((t) => offs.map((o) => index[(t.q + o[0]) + ',' + (t.r + o[1])]).filter((v) => v !== undefined));
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const k = arr[i];
        arr[i] = arr[j];
        arr[j] = k;
      }
      return arr;
    };
    const outer = shuffle(tiles.map((t, i) => i).filter((i) => tiles[i].d >= 2));
    const nT = Math.min(cfg.traps, outer.length);
    const T = cfg.types;
    for (let i = 0; i < nT; i++) {
      const ti = outer[i];
      tiles[ti].kind = 'trap';
      tiles[ti].sub = (i % 2 === 0 || T.length < 2) ? 'ember' : T[1 + (Math.floor((i - 1) / 2) % (T.length - 1))];
    }
    const free = shuffle(tiles.map((t, i) => i).filter((i) => tiles[i].d >= 1 && tiles[i].kind === 'empty'));
    const P = this.meta().pieces[cfg.shape];
    let k = 0;
    for (let p = 0; p < P && k < free.length; p++, k++) {
      tiles[free[k]].kind = 'piece';
      tiles[free[k]].sub = String(p);
    }
    for (let w = 0; w < cfg.powers.length && k < free.length; w++, k++) {
      tiles[free[k]].kind = 'power';
      tiles[free[k]].sub = cfg.powers[w];
    }
    tiles.forEach((t, i) => {
      t.clue = nb[i].filter((j) => tiles[j].kind === 'trap').length;
    });
    return { tiles: tiles, nb: nb, center: index['0,0'] };
  }
  newGame(cfg, practice) {
    const seed = cfg.mode === 'daily' ? this.hash('alke-hex-daily-' + this.dayKey(new Date())) : ((Date.now() + cfg.level * 7919) >>> 0);
    const b = this.build(cfg, seed);
    this.g = {
      cfg: cfg, practice: !!practice, tiles: b.tiles, nb: b.nb, center: b.center,
      phase: 'intro', lives: 3, moves: cfg.moves, time: cfg.timer || 0, elapsed: 0,
      found: [], foundXP: [], xp: 0, mult: 1, shields: 0, flagMode: false,
      shake: 0, flash: 0, msg: null, msgN: 0, legend: false,
      lost: 0, blocked: 0, trapsHit: 0, result: null, count: 0, shared: false, reason: ''
    };
  }
  quietInit() {
    const p = this.prog();
    this._pc = p;
    this.newGame(this.cfgFor('level', Math.max(1, Math.min(20, p.unlocked || 1))), false);
  }
  setup(mode, level) {
    const p = this.prog();
    this._pc = p;
    const practice = mode === 'daily' && !!(p.daily && p.daily.date === this.dayKey(new Date()));
    if (this._c) {
      clearInterval(this._c);
      this._c = null;
    }
    this.newGame(this.cfgFor(mode, level), practice);
    this.bump();
  }
  needed() {
    return this.meta().pieces[this.g.cfg.shape];
  }
  say(text, tone) {
    const g = this.g;
    g.msg = { text: text, tone: tone || 'info' };
    g.msgN += 1;
  }
  dist(a, b) {
    const dq = a.q - b.q;
    const dr = a.r - b.r;
    return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
  }
  tick() {
    const g = this.g;
    if (g && g.phase === 'play') {
      if (g.legend) return;
      g.elapsed += 1;
      if (g.cfg.timer) {
        g.time -= 1;
        if (g.time <= 0) {
          g.time = 0;
          this.lose('time');
        }
      }
      this.bump();
    } else {
      this.checkPending(false);
    }
  }
  start() {
    const g = this.g;
    if (!g || g.phase !== 'intro') return;
    g.phase = 'play';
    const c = g.tiles[g.center];
    c.open = true;
    c.anim = 'hxFlip .34s ease-out both';
    this.cascade(g.center);
    if (g.cfg.mode === 'daily' && !g.practice) {
      const p = this.prog();
      p.daily = { date: this.dayKey(new Date()), result: 'started', xp: 0, time: 0 };
      this.save(p);
    }
    this.say('Find ' + this.needed() + ' gold pieces. Read the numbers and gold rims.', 'info');
    this.bump();
  }
  cascade(from) {
    const g = this.g;
    const queue = [from];
    const depth = {};
    depth[from] = 0;
    let count = 0;
    while (queue.length) {
      const i = queue.shift();
      if (g.tiles[i].clue !== 0) continue;
      g.nb[i].forEach((j) => {
        const t = g.tiles[j];
        if (t.open || t.flag || t.kind !== 'empty' || depth[j] !== undefined) return;
        depth[j] = depth[i] + 1;
        t.open = true;
        t.anim = 'hxFlip .34s ' + (depth[j] * 0.06).toFixed(2) + 's ease-out both';
        count += 1;
        if (t.clue === 0) queue.push(j);
      });
    }
    return count;
  }
  tap(i) {
    const g = this.g;
    if (!g || g.phase !== 'play' || g.legend) return;
    const t = g.tiles[i];
    if (!t || t.open) return;
    if (g.flagMode) {
      t.flag = !t.flag;
      this.say(t.flag ? 'Flagged. Flags are free.' : 'Flag removed.', 'info');
      this.bump();
      return;
    }
    if (t.flag) {
      this.say('That tile is flagged. Turn on Flag to clear it.', 'info');
      this.bump();
      return;
    }
    g.moves -= 1;
    t.open = true;
    if (t.kind === 'empty') {
      t.anim = 'hxFlip .34s ease-out both';
      const n = this.cascade(i);
      if (n >= 5) this.say('Chain reveal: ' + (n + 1) + ' tiles for one move', 'violet');
      else if (t.clue) this.say(t.clue + (t.clue === 1 ? ' trap touches this tile' : ' traps touch this tile'), 'info');
      else this.say('Clear. No traps touching.', 'info');
    } else if (t.kind === 'piece') {
      t.anim = 'hxGold .6s ease-out both';
      this.collect(t);
    } else if (t.kind === 'power') {
      t.anim = 'hxPower .6s ease-out both';
      this.power(t.sub);
    } else {
      t.anim = 'hxBoom .55s ease-out both';
      this.trap(t, i);
    }
    if (g.phase === 'play') {
      if (g.found.length >= this.needed()) this.win();
      else if (g.lives <= 0) this.lose('lives');
      else if (g.moves <= 0) this.lose('moves');
    }
    this.bump();
  }
  collect(t) {
    const g = this.g;
    const M = this.meta();
    const seg = Number(t.sub);
    const val = (g.cfg.xp / this.needed()) * g.mult;
    g.found.push(seg);
    g.foundXP.push(val);
    g.xp += val;
    const left = this.needed() - g.found.length;
    this.say(left ? M.segName[seg] + ' placed · ' + left + ' to go' : 'Final piece!', 'gold');
  }
  power(kind) {
    const g = this.g;
    if (kind === 'shield') {
      g.shields = Math.min(2, g.shields + 1);
      this.say('Shield up. It blocks the next trap.', 'mint');
    } else if (kind === 'mult') {
      g.mult = Math.min(3, g.mult + 1);
      this.say('×' + g.mult + ' XP on every piece from now on', 'violet');
    } else {
      g.moves += 3;
      this.say('+3 moves', 'sky');
    }
  }
  hurt() {
    const g = this.g;
    g.lives = Math.max(0, g.lives - 1);
    g.lost += 1;
  }
  trap(t, i) {
    const g = this.g;
    const M = this.meta();
    const name = M.trap[t.sub].name;
    g.shake += 1;
    if (g.shields > 0) {
      g.shields -= 1;
      t.blocked = true;
      g.blocked += 1;
      this.say('Your shield blocked ' + name, 'mint');
      return;
    }
    g.trapsHit += 1;
    g.flash += 1;
    if (t.sub === 'ember') {
      this.hurt();
      this.say('Ember: −1 life', 'red');
    } else if (t.sub === 'snare') {
      g.moves = Math.max(0, g.moves - 2);
      this.say('Snare: −2 moves', 'red');
    } else if (t.sub === 'drain') {
      if (g.xp > 0) {
        const before = Math.round(g.xp);
        g.xp = g.xp / 2;
        g.foundXP = g.foundXP.map((v) => v / 2);
        this.say('Drain: round XP ' + before + ' → ' + Math.round(g.xp), 'red');
      } else {
        this.hurt();
        this.say('Drain: nothing to drain, −1 life', 'red');
      }
    } else if (t.sub === 'shatter') {
      if (g.found.length) {
        const seg = g.found.pop();
        const v = g.foundXP.pop() || 0;
        g.xp = Math.max(0, g.xp - v);
        const src = g.tiles.findIndex((x) => x.kind === 'piece' && x.open && Number(x.sub) === seg);
        const spots = [];
        g.tiles.forEach((x, j) => {
          if (!x.open && !x.flag && x.kind === 'empty') spots.push(j);
        });
        if (src >= 0 && spots.length) {
          const dst = spots[Math.floor(Math.random() * spots.length)];
          g.tiles[dst].kind = 'piece';
          g.tiles[dst].sub = String(seg);
          g.tiles[src].kind = 'empty';
          g.tiles[src].sub = '';
          g.tiles[src].anim = 'hxCrack .5s ease-out both';
        } else if (src >= 0) {
          g.tiles[src].open = false;
          g.tiles[src].anim = 'hxFogIn .45s ease-out both';
        }
        this.say('Shatter: ' + M.segName[seg].toLowerCase() + ' broke and hid again', 'red');
      } else {
        this.hurt();
        this.say('Shatter: no piece to break, −1 life', 'red');
      }
    } else if (t.sub === 'fog') {
      let n = 0;
      g.tiles.forEach((x, j) => {
        if (j !== i && x.open && x.kind === 'empty' && this.dist(x, t) <= 2) {
          x.open = false;
          x.anim = 'hxFogIn .45s ease-out both';
          n += 1;
        }
      });
      this.say(n ? 'Fog: ' + n + (n === 1 ? ' clue covered again' : ' clues covered again') : 'Fog: nothing nearby to cover', 'red');
    }
  }
  win() {
    const g = this.g;
    if (g.phase !== 'play') return;
    g.phase = 'won';
    const flawless = g.lives === 3;
    const base = Math.round(g.xp);
    const bonus = flawless ? g.cfg.xp / 2 : 0;
    const total = g.practice ? 0 : base + bonus;
    g.result = { flawless: flawless, stars: g.lives, base: base, bonus: bonus, total: total, mult: g.mult };
    if (!g.practice) {
      const p = this.prog();
      const now = new Date();
      p.xp = (p.xp || 0) + total;
      p.stats = Object.assign({ wins: 0, losses: 0, perfects: 0, blocked: 0 }, p.stats);
      p.stats.wins += 1;
      if (flawless) p.stats.perfects += 1;
      p.stats.blocked += g.blocked;
      p.badges = Object.assign({}, p.badges);
      p.badges.first = true;
      if (flawless) p.badges.flawless = true;
      if (g.mult >= 2) p.badges.amp = true;
      if (p.stats.blocked >= 3) p.badges.shield = true;
      if (g.cfg.mode === 'level') {
        p.stars = Object.assign({}, p.stars);
        p.stars[g.cfg.level] = Math.max(p.stars[g.cfg.level] || 0, g.lives);
        p.unlocked = Math.max(p.unlocked || 1, Math.min(20, g.cfg.level + 1));
        if (g.cfg.level === 20) p.badges.architect = true;
      } else {
        const key = this.dayKey(now);
        const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        p.daily = { date: key, result: 'won', xp: total, time: g.elapsed };
        p.dailyStreak = p.lastDailyWin === this.dayKey(y) ? (p.dailyStreak || 0) + 1 : 1;
        p.lastDailyWin = key;
        p.badges.daily = true;
      }
      p.history = [{ t: now.getTime(), kind: g.cfg.mode, level: g.cfg.level, day: this.dailyNo(now), result: 'won', xp: total, time: g.elapsed, practice: !!g.practice }].concat(p.history || []).slice(0, 30);
      this.save(p);
    }
    this.say('Mark rebuilt', 'gold');
    this.countUp(total);
  }
  lose(reason) {
    const g = this.g;
    if (g.phase !== 'play') return;
    g.phase = 'lost';
    g.reason = reason;
    const lostXP = Math.round(g.xp);
    g.result = { lostXP: lostXP };
    if (!g.practice) {
      const p = this.prog();
      const now = new Date();
      p.stats = Object.assign({ wins: 0, losses: 0, perfects: 0, blocked: 0 }, p.stats);
      p.stats.losses += 1;
      p.stats.blocked += g.blocked;
      p.badges = Object.assign({}, p.badges);
      if (p.stats.blocked >= 3) p.badges.shield = true;
      if (g.cfg.mode === 'daily') p.daily = { date: this.dayKey(now), result: 'lost', xp: 0, time: g.elapsed };
      p.history = [{ t: now.getTime(), kind: g.cfg.mode, level: g.cfg.level, day: this.dailyNo(now), result: 'lost', xp: -lostXP }].concat(p.history || []).slice(0, 30);
      this.save(p);
    }
    g.tiles.forEach((t) => {
      if (!t.open && (t.kind === 'trap' || t.kind === 'piece')) t.ghost = true;
    });
  }
  countUp(total) {
    const g = this.g;
    g.count = 0;
    if (this._c) {
      clearInterval(this._c);
      this._c = null;
    }
    if (!total) {
      this.bump();
      return;
    }
    const step = Math.max(1, Math.ceil(total / 26));
    this._c = setInterval(() => {
      if (this.g !== g) {
        clearInterval(this._c);
        this._c = null;
        return;
      }
      g.count = Math.min(total, g.count + step);
      if (g.count >= total && this._c) {
        clearInterval(this._c);
        this._c = null;
      }
      this.bump();
    }, 45);
  }
  share() {
    const g = this.g;
    if (!g || !g.result) return;
    const no = this.dailyNo(new Date());
    const head = g.cfg.mode === 'daily' ? 'ALKE Hex · Daily #' + no : 'ALKE Hex · Level ' + g.cfg.level;
    const stars = '★★★'.slice(0, g.result.stars || 0) + '☆☆☆'.slice(0, 3 - (g.result.stars || 0));
    const txt = head + ' · ' + stars + ' · ' + this.mmss(g.elapsed) + ' · ' + g.moves + ' moves to spare';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(() => {});
    } catch (e) {}
    g.shared = true;
    this.bump();
  }
  renderVals() {
    if (!this.g) this.quietInit();
    const g = this.g;
    const M = this.meta();
    const cfg = g.cfg;
    const T = M.tier[cfg.tier];
    const P = M.pieces[cfg.shape];
    const now = new Date();
    const no = this.dailyNo(now);
    const playing = g.phase === 'play';
    const timed = !!cfg.timer;
    const R = cfg.r;
    const s = R === 2 ? 38 : 29;
    const W = s * (3 * R + 2);
    const H = Math.sqrt(3) * s * (2 * R + 1);
    const tw = 2 * s;
    const th = Math.sqrt(3) * s;
    const areaTop = 262;
    const areaH = 354;
    const boardTop = areaTop + (areaH - H) / 2;
    const numInk = ['#FFFFFF', '#C6B6FF', '#8FB2FF', '#F2C66B', '#FF8A9A', '#FF8A9A', '#FF8A9A'];

    const tiles = g.tiles.map((t, i) => {
      const o = {
        x: (W / 2 + 1.5 * s * t.q - s).toFixed(1),
        y: (H / 2 + Math.sqrt(3) * s * (t.r + t.q / 2) - th / 2).toFixed(1),
        w: tw.toFixed(1),
        h: th.toFixed(1),
        anim: t.anim || 'none',
        fill: 'url(#hpCov)',
        stroke: 'rgba(198,182,255,.42)',
        sw: '2',
        dash: 'none',
        glow: 'none',
        sheen: '.10',
        qDisp: 'none',
        numDisp: 'none',
        num: '',
        numColor: '#FFFFFF',
        dotDisp: 'none',
        flagDisp: 'none',
        pieceDisp: 'none',
        pieceOp: '1',
        pieceInk: '#3A2605',
        segD: 'M0 0',
        iconDisp: 'none',
        iconOp: '1',
        iconInk: '#FFFFFF',
        icon: 'M0 0',
        cursor: playing && !t.open ? 'pointer' : 'default',
        aria: 'Covered tile',
        tap: () => this.tap(i)
      };
      if (!t.open) {
        if (t.ghost && t.kind === 'trap') {
          o.fill = '#24121A';
          o.stroke = 'rgba(255,138,154,.45)';
          o.sheen = '0';
          o.iconDisp = 'inline';
          o.iconOp = '.6';
          o.iconInk = '#FF8A9A';
          o.icon = M.trap[t.sub].icon;
          o.aria = M.trap[t.sub].name + ' trap was hidden here';
        } else if (t.ghost && t.kind === 'piece') {
          o.fill = '#262012';
          o.stroke = 'rgba(242,198,107,.45)';
          o.sheen = '0';
          o.pieceDisp = 'inline';
          o.pieceOp = '.75';
          o.pieceInk = '#F2C66B';
          o.segD = M.seg[Number(t.sub)];
          o.aria = 'A gold piece was hidden here';
        } else {
          o.qDisp = t.flag ? 'none' : 'inline';
          o.flagDisp = t.flag ? 'inline' : 'none';
          if (t.flag) o.stroke = 'rgba(255,138,154,.8)';
          else if (g.flagMode && playing) o.stroke = 'rgba(255,138,154,.45)';
          o.aria = t.flag ? 'Covered tile, flagged as a trap' : 'Covered tile';
        }
      } else if (t.kind === 'empty') {
        const rim = g.nb[i].some((j) => !g.tiles[j].open && g.tiles[j].kind === 'piece');
        o.fill = '#14121D';
        o.sheen = '0';
        o.stroke = rim ? '#F2C66B' : 'rgba(255,255,255,.10)';
        o.sw = rim ? '3.2' : '1.5';
        o.glow = rim ? 'drop-shadow(0 0 6px rgba(242,198,107,.55))' : 'none';
        if (t.clue) {
          o.numDisp = 'inline';
          o.num = String(t.clue);
          o.numColor = numInk[t.clue] || '#FF8A9A';
        } else {
          o.dotDisp = 'inline';
        }
        o.aria = (t.clue ? t.clue + (t.clue === 1 ? ' trap touching' : ' traps touching') : 'Clear, no traps touching') + (rim ? '. A gold piece is next to this tile' : '');
      } else if (t.kind === 'piece') {
        o.fill = 'url(#hpGold)';
        o.stroke = '#FCE7B5';
        o.sheen = '0';
        o.glow = 'drop-shadow(0 0 8px rgba(242,198,107,.8))';
        o.pieceDisp = 'inline';
        o.segD = M.seg[Number(t.sub)];
        o.aria = 'Gold piece placed: ' + M.segName[Number(t.sub)];
      } else if (t.kind === 'power') {
        const pw = M.power[t.sub];
        o.fill = '#1C1836';
        o.stroke = pw.color;
        o.sw = '2.6';
        o.sheen = '0';
        o.glow = 'drop-shadow(0 0 7px ' + pw.glow + ')';
        o.iconDisp = 'inline';
        o.iconInk = pw.color;
        o.icon = pw.icon;
        o.aria = pw.name + ' power-up collected';
      } else {
        const tr = M.trap[t.sub];
        o.sheen = '0';
        o.iconDisp = 'inline';
        o.icon = tr.icon;
        if (t.blocked) {
          o.fill = '#1E1219';
          o.stroke = 'rgba(255,138,154,.6)';
          o.dash = '7 6';
          o.iconInk = '#FF8A9A';
          o.iconOp = '.6';
          o.aria = tr.name + ' trap, blocked by your shield';
        } else {
          o.fill = 'url(#hpRed)';
          o.stroke = '#FF8A9A';
          o.sw = '2.6';
          o.glow = 'drop-shadow(0 0 10px rgba(255,92,122,.75))';
          o.iconInk = '#FFE1E6';
          o.aria = tr.name + ' trap, triggered';
        }
      }
      return o;
    });

    const need = (k) => k < P;
    const tr = {};
    const vs = {};
    for (let k = 0; k < 11; k++) {
      const got = g.found.indexOf(k) >= 0 || (g.phase === 'won' && need(k));
      tr['s' + k] = got ? { c: '#F2C66B', w: '7', d: 'none', a: 'hxSeg .7s ease-out both' } : need(k) ? { c: 'rgba(242,198,107,.34)', w: '5', d: '4 6', a: 'none' } : { c: 'rgba(255,255,255,.08)', w: '4', d: 'none', a: 'none' };
      vs['s' + k] = { c: need(k) ? '#F2C66B' : 'rgba(255,255,255,.14)', a: 'hxDraw .45s ' + (0.15 + k * 0.07).toFixed(2) + 's ease-out both' };
    }

    const hearts = [0, 1, 2].map((k) => ({
      fill: k < g.lives ? '#FF5C7A' : 'rgba(255,255,255,.06)',
      stroke: k < g.lives ? '#FFB3C0' : 'rgba(255,255,255,.22)',
      anim: k < g.lives ? 'none' : 'hxHeartLost .6s ease-out both'
    }));

    const tones = {
      info: ['rgba(255,255,255,.06)', 'rgba(255,255,255,.10)', '#D8D5E2'],
      gold: ['rgba(242,198,107,.14)', 'rgba(242,198,107,.38)', '#F2C66B'],
      red: ['rgba(255,92,122,.14)', 'rgba(255,138,154,.42)', '#FF8A9A'],
      mint: ['rgba(110,231,183,.12)', 'rgba(110,231,183,.36)', '#6EE7B7'],
      violet: ['rgba(139,109,255,.16)', 'rgba(160,138,255,.42)', '#C6B6FF'],
      sky: ['rgba(74,134,247,.14)', 'rgba(143,178,255,.42)', '#8FB2FF']
    };
    const msg = g.msg || { text: g.phase === 'intro' ? 'Press start when you are ready' : 'Tap a tile to reveal it', tone: 'info' };
    const tone = tones[msg.tone] || tones.info;

    const mode = cfg.mode;
    const maxL = this.maxLevel();
    const tierName = T.name.toUpperCase();
    const tag = mode === 'daily' ? 'DAILY #' + no + (g.practice ? ' · PRACTICE' : '') : 'LEVEL ' + cfg.level + ' · ' + tierName;
    const title = mode === 'daily' ? "Today's board" : M.title[cfg.shape];
    const res = g.result || {};

    const PB = this.props || {};
    const boardLoaded = !!PB.boards;
    const sample = ((PB.boards && PB.boards.hexToday) || []).filter((r) => r.id !== (PB.me || {}).id).map((r) => ({ xp: r.hexDaily || 0, time: r.hexDailyTime || 0 }));
    let rank = 1;
    sample.forEach((x) => {
      if (x.xp > (res.total || 0) || (x.xp === (res.total || 0) && x.time < g.elapsed)) rank += 1;
    });

    const tabDefs = [['level', 'Levels'], ['daily', 'Daily board']];
    const reasons = { lives: 'Out of lives', moves: 'Out of moves', time: "Time's up" };
    const tips = {
      lives: 'Tip: a gold rim means a piece is touching that tile. Follow the rims before you guess.',
      moves: 'Tip: tiles showing zero open their neighbours for free. Work outward from clear ground.',
      time: 'Tip: flag the obvious traps first, then sweep along the gold rims.'
    };

    return {
      hudTag: tag,
      hudTitle: title,
      toggleLegend: () => {
        g.legend = !g.legend;
        this.bump();
      },
      hearts: hearts,
      livesLabel: 'Lives: ' + g.lives + ' of 3',
      moves: String(g.moves),
      movesColor: g.moves <= 3 ? '#FF8A9A' : '#F7F5F2',
      timeText: this.mmss(timed ? g.time : g.elapsed),
      timeLabel: timed ? 'TIME LEFT' : 'TIME',
      timeColor: timed && g.time <= 20 ? '#FF8A9A' : '#F7F5F2',
      xpText: String(Math.round(g.xp)),
      tr: tr,
      vs: vs,
      piecesText: g.found.length + ' of ' + P + ' pieces',
      xpProgText: Math.round(g.xp) + ' / ' + cfg.xp + ' XP',
      xpPct: String(Math.min(100, Math.round((g.xp / cfg.xp) * 100))),
      hasShield: g.shields > 0,
      shieldText: 'Shield ×' + g.shields,
      hasMult: g.mult > 1,
      multText: '×' + g.mult + ' XP',
      isPractice: g.practice,
      showBankNote: g.shields === 0 && g.mult === 1 && !g.practice,
      boardLeft: ((390 - W) / 2).toFixed(1),
      boardTop: boardTop.toFixed(1),
      boardW: W.toFixed(1),
      boardH: H.toFixed(1),
      backL: (-16).toFixed(1),
      backT: (-22).toFixed(1),
      backW: (W + 32).toFixed(1),
      backH: (H + 44).toFixed(1),
      shakeAnim: g.shake ? (g.shake % 2 ? 'hxShakeA .45s ease-in-out' : 'hxShakeB .45s ease-in-out') : 'none',
      flashAnim: g.flash ? (g.flash % 2 ? 'hxRedA .7s ease-out both' : 'hxRedB .7s ease-out both') : 'none',
      tiles: tiles,
      toastTop: String(areaTop + areaH + 10),
      msgText: msg.text,
      msgBg: tone[0],
      msgEdge: tone[1],
      msgInk: tone[2],
      msgAnim: g.msgN ? (g.msgN % 2 ? 'hxToastA .35s ease-out both' : 'hxToastB .35s ease-out both') : 'none',
      flagPressed: g.flagMode ? 'true' : 'false',
      flagLabel: g.flagMode ? 'Flagging is on' : 'Flag a trap',
      flagBg: g.flagMode ? 'rgba(255,138,154,.16)' : 'rgba(255,255,255,.06)',
      flagEdge: g.flagMode ? 'rgba(255,138,154,.6)' : 'rgba(255,255,255,.12)',
      flagInk: g.flagMode ? '#FF8A9A' : '#F7F5F2',
      toggleFlag: () => {
        if (g.phase !== 'play') return;
        g.flagMode = !g.flagMode;
        this.say(g.flagMode ? 'Flag mode: tap tiles to mark suspected traps' : 'Flag mode off: taps reveal again', 'info');
        this.bump();
      },
      restart: () => this.setup(mode, cfg.level),

      isIntro: g.phase === 'intro',
      modeTabs: tabDefs.map((d) => ({
        label: d[1],
        on: mode === d[0] ? 'true' : 'false',
        bg: mode === d[0] ? 'linear-gradient(180deg,#FFDB8E 0%,#F7C15C 52%,#EBA33B 100%)' : 'transparent',
        shadow: mode === d[0] ? '0 6px 16px -6px rgba(217,154,43,.8)' : 'none',
        fg: mode === d[0] ? '#1C1030' : '#A9A6B6',
        pick: () => {
          if (d[0] !== mode) this.setup(d[0], d[0] === 'daily' ? 0 : maxL);
        }
      })),
      isLevelMode: mode === 'level',
      isDailyMode: mode === 'daily',
      introTag: mode === 'daily' ? 'DAILY CHALLENGE #' + no : 'LEVEL ' + cfg.level + ' OF 20 · ' + tierName,
      introTitle: title,
      prevLevel: () => this.setup('level', Math.max(1, cfg.level - 1)),
      nextLevel: () => this.setup('level', Math.min(maxL, cfg.level + 1)),
      prevDisabled: mode !== 'level' || cfg.level <= 1,
      nextDisabled: mode !== 'level' || cfg.level >= maxL,
      introChips: [
        { t: P + ' pieces' },
        { t: cfg.traps + ' traps' },
        { t: cfg.moves + ' moves' },
        { t: timed ? this.mmss(cfg.timer) + ' timer' : 'No timer' }
      ],
      introXP: g.practice ? 'Practice · banks no XP' : '+' + cfg.xp + ' XP',
      introBonus: g.practice ? 'Your scored try today is used' : '+' + cfg.xp / 2 + ' more if you lose no lives',
      newText: mode === 'daily' ? 'The same board for everyone today. Your first try is scored; after that it is practice.' : (M.intro[cfg.level] || 'Flag tiles you think are traps. Flagged tiles cannot be opened by accident.'),
      start: () => this.start(),
      startLabel: g.practice ? 'Practice the board' : mode === 'daily' ? 'Start scored try' : 'Start level ' + cfg.level,

      legendOpen: g.legend,
      legendTraps: ['ember', 'snare', 'drain', 'shatter', 'fog'].map((k) => ({ name: M.trap[k].name, fx: M.trap[k].fx, icon: M.trap[k].icon })),
      legendPowers: ['shield', 'mult', 'moves'].map((k) => ({ name: M.power[k].name, fx: M.power[k].fx, icon: M.power[k].icon, color: M.power[k].color, tint: M.power[k].tint })),

      isWon: g.phase === 'won',
      vicTag: tag,
      vicTitle: res.flawless ? 'Flawless build' : 'Mark rebuilt',
      starsLabel: (res.stars || 0) + ' of 3 stars',
      vicStars: [1, 2, 3].map((k) => ({
        fill: k <= (res.stars || 0) ? '#F2C66B' : 'rgba(255,255,255,.12)',
        anim: 'hxStar .5s ' + (0.55 + k * 0.15).toFixed(2) + 's ease-out both'
      })),
      countText: g.practice ? '0 XP' : '+' + (g.count || 0),
      countSub: g.practice ? 'Practice round · nothing banked' : 'game XP banked',
      breakdown: g.practice ? [{ t: 'Practice' }] : [{ t: 'Pieces +' + (res.base || 0) }].concat(res.bonus ? [{ t: 'No lives lost +' + res.bonus }] : []).concat(res.mult > 1 ? [{ t: '×' + res.mult + ' on later pieces' }] : []),
      vicStats: this.mmss(g.elapsed) + ' · ' + g.moves + ' moves to spare · ' + g.lives + (g.lives === 1 ? ' life left' : ' lives left'),
      isDailyWin: mode === 'daily' && !g.practice,
      rankText: boardLoaded ? 'Ranked #' + rank + ' on today\'s board' : 'Checking today\'s board…',
      nextIsLevel: mode === 'level' && cfg.level < 20,
      nextLabel: 'Next · Level ' + Math.min(20, cfg.level + 1),
      goNext: () => this.setup('level', Math.min(20, cfg.level + 1)),
      showBoardLink: mode === 'daily',
      showDailyCta: mode === 'level' && cfg.level >= 20,
      goDaily: () => this.setup('daily', 0),
      replay: () => this.setup(mode, cfg.level),
      share: () => this.share(),
      shareLabel: g.shared ? 'Copied' : 'Share',

      isLost: g.phase === 'lost',
      defTag: g.practice ? 'PRACTICE ROUND' : 'ROUND LOST',
      defTitle: reasons[g.reason] || 'Round over',
      defSub: g.found.length + ' of ' + P + ' pieces placed',
      defLost: (res.lostXP ? '−' + res.lostXP : '0') + ' XP',
      defLostSub: res.lostXP ? 'Unbanked XP from this round is gone.' : 'Nothing was at stake yet, so nothing is lost.',
      defTip: tips[g.reason] || '',
      retryLabel: mode === 'daily' ? 'Practice this board' : 'Try again'
    };
  }
}

export default class HexPlay extends Logic {
  render() {
    const $ = this.vals();
    return (<>{" "}{" "}<div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#0A0A0F", backgroundImage: "radial-gradient(90% 34% at 50% -4%,rgba(242,198,107,.16) 0%,rgba(242,198,107,0) 70%),radial-gradient(75% 40% at 50% 52%,rgba(110,72,255,.22) 0%,rgba(110,72,255,0) 70%)", color: "#F7F5F2", fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',sans-serif" }}>{" "}<svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}><defs><linearGradient id="hpCov" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F2760"></stop><stop offset="1" stopColor="#1A1533"></stop></linearGradient><linearGradient id="hpGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FBE2A2"></stop><stop offset=".5" stopColor="#E9B44C"></stop><stop offset="1" stopColor="#C08417"></stop></linearGradient><linearGradient id="hpRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8E1F38"></stop><stop offset="1" stopColor="#46101D"></stop></linearGradient><linearGradient id="hpBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7A55FA" stopOpacity=".16"></stop><stop offset="1" stopColor="#7A55FA" stopOpacity=".03"></stop></linearGradient></defs></svg>{" "}<div style={{ position: "relative", flex: "none", margin: "calc(var(--safe-top) + 6px) 12px 0", display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", alignItems: "center", gap: "8px" }}>{" "}<Link to="/games/hex" aria-label="Back to ALKE Hex" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", textDecoration: "none", boxSizing: "border-box" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 6-6 6 6 6"></path></svg></Link>{" "}<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", minWidth: "0" }}>{" "}<span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "10.5px", letterSpacing: ".14em", color: "#F2C66B", whiteSpace: "nowrap" }}>{$.hudTag}</span>{" "}<h1 style={{ margin: "0", maxWidth: "100%", fontFamily: "Inter,system-ui,sans-serif", fontSize: "17px", lineHeight: "22px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{$.hudTitle}</h1>{" "}</div>{" "}<button type="button" onClick={$.toggleLegend} aria-label="How to play" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7F5F2", padding: "0", boxSizing: "border-box", fontFamily: "Inter,system-ui,sans-serif", fontSize: "18px", fontWeight: "700" }}>{"?"}</button>{" "}</div>{" "}<div style={{ position: "relative", flex: "none", margin: "8px 16px 0", display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", gap: "8px" }}>{" "}<div role="img" aria-label={$.livesLabel} style={{ height: "54px", borderRadius: "18px", background: "rgba(255,92,122,.07)", border: "1px solid rgba(255,138,154,.20)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", boxSizing: "border-box" }}>{" "}<span style={{ display: "flex", gap: "4px" }}>{($.hearts || []).map((h, i0) => (<Fragment key={i0}><svg width="20" height="18" viewBox="0 0 24 22" aria-hidden="true" style={{ animation: h?.anim }}><path d="M12 20.5s-8.5-5.3-8.5-11.4A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.5 2.9c0 6.1-8.5 11.4-8.5 11.4z" fill={h?.fill} stroke={h?.stroke} strokeWidth="1.5" strokeLinejoin="round"></path></svg></Fragment>))}</span>{" "}<span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".08em", color: "#A9A6B6" }}>{"LIVES"}</span>{" "}</div>{" "}<div style={{ height: "54px", borderRadius: "18px", background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.09)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", boxSizing: "border-box" }}><span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "20px", lineHeight: "22px", fontWeight: "600", fontVariantNumeric: "tabular-nums", color: $.movesColor }}>{$.moves}</span><span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".08em", color: "#A9A6B6" }}>{"MOVES"}</span></div>{" "}<div style={{ height: "54px", borderRadius: "18px", background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.09)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", boxSizing: "border-box" }}><span role="timer" style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "20px", lineHeight: "22px", fontWeight: "600", fontVariantNumeric: "tabular-nums", color: $.timeColor }}>{$.timeText}</span><span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".08em", color: "#A9A6B6" }}>{$.timeLabel}</span></div>{" "}<div style={{ height: "54px", borderRadius: "18px", background: "rgba(242,198,107,.07)", border: "1px solid rgba(242,198,107,.22)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", boxSizing: "border-box" }}><span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "20px", lineHeight: "22px", fontWeight: "600", fontVariantNumeric: "tabular-nums", color: "#F2C66B" }}>{$.xpText}</span><span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".08em", color: "#A9A6B6" }}>{"ROUND XP"}</span></div>{" "}</div>{" "}<div style={{ position: "relative", flex: "none", margin: "10px 16px 0", height: "80px", boxSizing: "border-box", padding: "10px 14px 10px 10px", borderRadius: "22px", background: "linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02))", border: "1px solid rgba(242,198,107,.18)", display: "flex", alignItems: "center", gap: "12px" }}>{" "}<svg width="52" height="58" viewBox="0 0 100 112" aria-hidden="true" style={{ flex: "none", overflow: "visible" }}><g fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M50 4 L94 29" stroke={$.tr?.s0?.c} strokeWidth={$.tr?.s0?.w} strokeDasharray={$.tr?.s0?.d} style={{ animation: $.tr?.s0?.a }}></path><path d="M94 29 L94 83" stroke={$.tr?.s1?.c} strokeWidth={$.tr?.s1?.w} strokeDasharray={$.tr?.s1?.d} style={{ animation: $.tr?.s1?.a }}></path><path d="M94 83 L50 108" stroke={$.tr?.s2?.c} strokeWidth={$.tr?.s2?.w} strokeDasharray={$.tr?.s2?.d} style={{ animation: $.tr?.s2?.a }}></path><path d="M50 108 L6 83" stroke={$.tr?.s3?.c} strokeWidth={$.tr?.s3?.w} strokeDasharray={$.tr?.s3?.d} style={{ animation: $.tr?.s3?.a }}></path><path d="M6 83 L6 29" stroke={$.tr?.s4?.c} strokeWidth={$.tr?.s4?.w} strokeDasharray={$.tr?.s4?.d} style={{ animation: $.tr?.s4?.a }}></path><path d="M6 29 L50 4" stroke={$.tr?.s5?.c} strokeWidth={$.tr?.s5?.w} strokeDasharray={$.tr?.s5?.d} style={{ animation: $.tr?.s5?.a }}></path><path d="M50 27 L50 85" stroke={$.tr?.s6?.c} strokeWidth={$.tr?.s6?.w} strokeDasharray={$.tr?.s6?.d} style={{ animation: $.tr?.s6?.a }}></path><path d="M20 45 L32 56 L20 67" stroke={$.tr?.s7?.c} strokeWidth={$.tr?.s7?.w} strokeDasharray={$.tr?.s7?.d} style={{ animation: $.tr?.s7?.a }}></path><path d="M30 45 L42 56 L30 67" stroke={$.tr?.s8?.c} strokeWidth={$.tr?.s8?.w} strokeDasharray={$.tr?.s8?.d} style={{ animation: $.tr?.s8?.a }}></path><path d="M80 45 L68 56 L80 67" stroke={$.tr?.s9?.c} strokeWidth={$.tr?.s9?.w} strokeDasharray={$.tr?.s9?.d} style={{ animation: $.tr?.s9?.a }}></path><path d="M70 45 L58 56 L70 67" stroke={$.tr?.s10?.c} strokeWidth={$.tr?.s10?.w} strokeDasharray={$.tr?.s10?.d} style={{ animation: $.tr?.s10?.a }}></path></g></svg>{" "}<div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "7px" }}>{" "}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}><span style={{ fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap" }}>{$.piecesText}</span><span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "11px", color: "#A9A6B6", whiteSpace: "nowrap" }}>{$.xpProgText}</span></div>{" "}<span aria-hidden="true" style={{ display: "block", height: "8px", borderRadius: "8px", background: "rgba(255,255,255,.07)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${$.xpPct ?? ''}%`, borderRadius: "8px", background: "linear-gradient(90deg,#F7D58A,#E2A93B)", boxShadow: "0 0 10px rgba(242,198,107,.6)", transition: "width .35s ease" }}></span></span>{" "}<div style={{ display: "flex", gap: "6px", alignItems: "center", minHeight: "20px", overflow: "hidden" }}>{" "}{$.hasShield ? (<><span style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "20px", padding: "0 8px", borderRadius: "999px", background: "rgba(110,231,183,.14)", color: "#6EE7B7", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z"></path></svg>{$.shieldText}</span></>) : null}{" "}{$.hasMult ? (<><span style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "20px", padding: "0 8px", borderRadius: "999px", background: "rgba(139,109,255,.18)", color: "#C6B6FF", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden="true"><path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"></path></svg>{$.multText}</span></>) : null}{" "}{$.isPractice ? (<><span style={{ display: "inline-flex", alignItems: "center", height: "20px", padding: "0 8px", borderRadius: "999px", background: "rgba(255,255,255,.08)", color: "#D8D5E2", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}>{"Practice"}</span></>) : null}{" "}{$.showBankNote ? (<><span style={{ fontSize: "11px", color: "#8C8999", whiteSpace: "nowrap" }}>{"Banked only when you win"}</span></>) : null}{" "}</div>{" "}</div>{" "}</div>{" "}<div className="gp-board" style={{ position: "relative", flex: "none", margin: "auto", width: `${$.boardW ?? ''}px`, height: `${$.boardH ?? ''}px`, animation: $.shakeAnim }}>{" "}<svg aria-hidden="true" width={$.backW} height={$.backH} viewBox="0 0 100 112" preserveAspectRatio="none" style={{ position: "absolute", left: `${$.backL ?? ''}px`, top: `${$.backT ?? ''}px`, overflow: "visible", pointerEvents: "none" }}><path d="M50 1 L99 29 L99 83 L50 111 L1 83 L1 29 Z" fill="url(#hpBack)" stroke="#F2C66B" strokeOpacity=".30" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinejoin="round"></path></svg>{" "}<div role="group" aria-label="Game board" style={{ position: "absolute", inset: "0" }}>{" "}{($.tiles || []).map((t, i1) => (<Fragment key={i1}>{" "}<div style={{ position: "absolute", left: `${t?.x ?? ''}px`, top: `${t?.y ?? ''}px`, width: `${t?.w ?? ''}px`, height: `${t?.h ?? ''}px`, pointerEvents: "none" }}>{" "}<button type="button" className="hxbtn" onClick={t?.tap} aria-label={t?.aria} style={{ position: "absolute", left: "0", top: "0", width: `${t?.w ?? ''}px`, height: `${t?.h ?? ''}px`, margin: "0", border: "0", padding: "0", background: "transparent", clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)", pointerEvents: "auto", cursor: t?.cursor }}></button>{" "}<svg className="hxvis" width={t?.w} height={t?.h} viewBox="0 0 100 86.6" aria-hidden="true" style={{ position: "absolute", left: "0", top: "0", overflow: "visible", pointerEvents: "none", animation: t?.anim, filter: t?.glow }}><polygon className="hxedge" points="26.5,2.6 73.5,2.6 97,43.3 73.5,84 26.5,84 3,43.3" fill={t?.fill} stroke={t?.stroke} strokeWidth={t?.sw} strokeDasharray={t?.dash} strokeLinejoin="round"></polygon><polygon points="30,7 70,7 91.5,43.3 70,79.6 30,79.6 8.5,43.3" fill="none" stroke="#FFFFFF" strokeOpacity={t?.sheen} strokeWidth="1.2" strokeLinejoin="round"></polygon><text x="50" y="55" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="700" fill="#C6B6FF" style={{ display: t?.qDisp }}>{"?"}</text><text x="50" y="56" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="36" fontWeight="700" fill={t?.numColor} style={{ display: t?.numDisp }}>{t?.num}</text><circle cx="50" cy="43.3" r="3.5" fill="#FFFFFF" fillOpacity=".22" style={{ display: t?.dotDisp }}></circle><g transform="translate(50 43.3) scale(1.5) translate(-12 -12)" fill="none" stroke="#FF8A9A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: t?.flagDisp }}><path d="M8 20.5V4M8 4.5h9l-2.5 3.8L17 12H8"></path></g><g transform="translate(50 43.3) scale(.36) translate(-50 -56)" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: t?.pieceDisp, opacity: t?.pieceOp }}><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" stroke={t?.pieceInk} strokeOpacity=".3" strokeWidth="5"></path><path d={t?.segD} stroke={t?.pieceInk} strokeWidth="12"></path></g><g transform="translate(50 43.3) scale(1.45) translate(-12 -12)" fill="none" stroke={t?.iconInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: t?.iconDisp, opacity: t?.iconOp }}><path d={t?.icon}></path></g></svg>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</div>{" "}<div role="status" aria-live="polite" style={{ position: "absolute", left: "16px", right: "16px", top: `${$.toastTop ?? ''}px`, display: "flex", justifyContent: "center", pointerEvents: "none" }}>{" "}<span style={{ display: "inline-flex", alignItems: "center", minHeight: "34px", maxWidth: "100%", padding: "6px 14px", boxSizing: "border-box", borderRadius: "999px", background: $.msgBg, border: `1px solid ${$.msgEdge ?? ''}`, color: $.msgInk, fontSize: "13px", lineHeight: "18px", fontWeight: "600", textAlign: "center", animation: $.msgAnim }}>{$.msgText}</span>{" "}</div>{" "}<div style={{ position: "relative", flex: "none", margin: "8px 16px calc(var(--safe-bottom) + 14px)", display: "flex", gap: "10px" }}>{" "}<button type="button" aria-pressed={$.flagPressed} onClick={$.toggleFlag} style={{ flex: "1", height: "54px", borderRadius: "999px", border: `1px solid ${$.flagEdge ?? ''}`, background: $.flagBg, color: $.flagInk, fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 21V3.5M6 4h11l-2.8 4.2L17 12.5H6"></path></svg>{$.flagLabel}</button>{" "}<button type="button" onClick={$.restart} aria-label="Restart this round" style={{ width: "54px", height: "54px", flex: "none", borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", padding: "0" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4.5V9h4.5"></path></svg></button>{" "}</div>{" "}{" "}<div aria-hidden="true" style={{ position: "absolute", inset: "0", pointerEvents: "none", opacity: "0", background: "radial-gradient(75% 55% at 50% 52%,rgba(255,40,80,0) 35%,rgba(255,40,80,.42) 100%)", animation: $.flashAnim }}></div>{" "}{$.isIntro ? (<>{" "}<div style={{ position: "absolute", inset: "0", background: "rgba(6,5,11,.55)", animation: "hxFade .3s ease-out both" }}>{" "}<section role="dialog" aria-modal="true" aria-labelledby="hx-intro-title" style={{ position: "absolute", left: "0", right: "0", bottom: "0", boxSizing: "border-box", padding: "10px 20px 30px", borderRadius: "32px 32px 0 0", background: "linear-gradient(180deg,#1C1734 0%,#110E21 45%,#0B0A14 100%)", borderTop: "1px solid rgba(242,198,107,.28)", boxShadow: "0 -30px 60px -24px rgba(217,154,43,.35)", display: "flex", flexDirection: "column", gap: "14px", animation: "hxRise .4s cubic-bezier(.2,.8,.2,1) both" }}>{" "}<span aria-hidden="true" style={{ alignSelf: "center", width: "40px", height: "5px", borderRadius: "5px", background: "rgba(255,255,255,.18)" }}></span>{" "}<div role="group" aria-label="Mode" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", padding: "4px", gap: "4px", borderRadius: "999px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>{" "}{($.modeTabs || []).map((m, i2) => (<Fragment key={i2}>{" "}<button type="button" aria-pressed={m?.on} onClick={m?.pick} style={{ height: "40px", border: "0", borderRadius: "999px", background: m?.bg, boxShadow: m?.shadow, color: m?.fg, fontSize: "14px", fontWeight: "600" }}>{m?.label}</button>{" "}</Fragment>))}{" "}</div>{" "}<div style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", alignItems: "center", gap: "8px" }}>{" "}{$.isLevelMode ? (<><button type="button" onClick={$.prevLevel} disabled={$.prevDisabled} aria-label="Previous level" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", padding: "0" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 6-6 6 6 6"></path></svg></button></>) : null}{" "}{$.isDailyMode ? (<><span></span></>) : null}{" "}<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textAlign: "center", minWidth: "0" }}>{" "}<span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "11px", letterSpacing: ".14em", color: "#F2C66B" }}>{$.introTag}</span>{" "}<h2 id="hx-intro-title" style={{ margin: "0", fontFamily: "Inter,system-ui,sans-serif", fontSize: "26px", lineHeight: "30px", fontWeight: "600", letterSpacing: "-.02em" }}>{$.introTitle}</h2>{" "}</div>{" "}{$.isLevelMode ? (<><button type="button" onClick={$.nextLevel} disabled={$.nextDisabled} aria-label="Next level" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", padding: "0" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9.5 6 6 6-6 6"></path></svg></button></>) : null}{" "}{$.isDailyMode ? (<><span></span></>) : null}{" "}</div>{" "}<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px" }}>{" "}{($.introChips || []).map((c, i3) => (<Fragment key={i3}><span style={{ display: "inline-flex", alignItems: "center", height: "28px", padding: "0 11px", borderRadius: "999px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", fontSize: "12px", fontWeight: "600", color: "#D8D5E2" }}>{c?.t}</span></Fragment>))}{" "}</div>{" "}<div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}><span style={{ display: "inline-flex", alignItems: "center", height: "28px", padding: "0 12px", borderRadius: "999px", background: "rgba(242,198,107,.16)", color: "#F2C66B", fontSize: "13px", fontWeight: "700" }}>{$.introXP}</span><span style={{ display: "inline-flex", alignItems: "center", height: "28px", padding: "0 12px", borderRadius: "999px", background: "rgba(255,255,255,.06)", color: "#D8D5E2", fontSize: "12px", fontWeight: "600" }}>{$.introBonus}</span></div>{" "}<div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", borderRadius: "18px", background: "rgba(139,109,255,.09)", border: "1px solid rgba(160,138,255,.24)" }}>{" "}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6B6FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3.5a6 6 0 0 1 3.5 10.9V17h-7v-2.6A6 6 0 0 1 12 3.5zM9.5 20.5h5"></path></svg>{" "}<span style={{ fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}>{$.newText}</span>{" "}</div>{" "}<button type="button" onClick={$.start} style={{ height: "56px", border: "0", borderRadius: "999px", background: "linear-gradient(180deg,#FFDB8E 0%,#F7C15C 52%,#EBA33B 100%)", color: "#1C1030", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 12px 28px -12px rgba(245,184,77,.6), inset 0 1px 0 rgba(255,255,255,.55)" }}>{$.startLabel}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button>{" "}<p style={{ margin: "0", fontSize: "12px", lineHeight: "17px", color: "#8C8999", textAlign: "center" }}>{"The opening is free. Each reveal after that costs a move."}</p>{" "}</section>{" "}</div>{" "}</>) : null}{" "}{$.legendOpen ? (<>{" "}<div style={{ position: "absolute", inset: "0", background: "rgba(6,5,11,.72)", animation: "hxFade .25s ease-out both" }}>{" "}<section role="dialog" aria-modal="true" aria-labelledby="hx-legend-title" style={{ position: "absolute", left: "0", right: "0", bottom: "0", maxHeight: "calc(100% - 70px)", overflowY: "auto", boxSizing: "border-box", padding: "10px 20px 30px", borderRadius: "32px 32px 0 0", background: "linear-gradient(180deg,#1A1630 0%,#100E1C 45%,#0B0A14 100%)", borderTop: "1px solid rgba(214,202,255,.2)", display: "flex", flexDirection: "column", gap: "14px", animation: "hxRise .35s cubic-bezier(.2,.8,.2,1) both" }}>{" "}<span aria-hidden="true" style={{ alignSelf: "center", width: "40px", height: "5px", borderRadius: "5px", background: "rgba(255,255,255,.18)" }}></span>{" "}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}><h2 id="hx-legend-title" style={{ margin: "0", fontFamily: "Inter,system-ui,sans-serif", fontSize: "24px", fontWeight: "600" }}>{"How to play"}</h2><button type="button" onClick={$.toggleLegend} aria-label="Close" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.06)", color: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", padding: "0" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"></path></svg></button></div>{" "}<p style={{ margin: "0", fontSize: "14px", lineHeight: "21px", color: "#D8D5E2" }}>{"Reveal tiles to find every gold piece of the mark before you run out of lives, moves or time. The timer pauses while this is open."}</p>{" "}<span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "11px", letterSpacing: ".14em", color: "#8C8999" }}>{"CLUES"}</span>{" "}<div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}>{" "}<span style={{ display: "flex", gap: "12px", alignItems: "center" }}><svg width="34" height="30" viewBox="0 0 100 86.6" aria-hidden="true" style={{ flex: "none" }}><polygon points="26.5,2.6 73.5,2.6 97,43.3 73.5,84 26.5,84 3,43.3" fill="#14121D" stroke="rgba(255,255,255,.18)" strokeWidth="3"></polygon><text x="50" y="58" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="40" fontWeight="700" fill="#8FB2FF">{"2"}</text></svg>{"A number counts the traps touching that tile."}</span>{" "}<span style={{ display: "flex", gap: "12px", alignItems: "center" }}><svg width="34" height="30" viewBox="0 0 100 86.6" aria-hidden="true" style={{ flex: "none" }}><polygon points="26.5,2.6 73.5,2.6 97,43.3 73.5,84 26.5,84 3,43.3" fill="#14121D" stroke="#F2C66B" strokeWidth="5"></polygon></svg>{"A gold rim means a gold piece is touching it."}</span>{" "}<span style={{ display: "flex", gap: "12px", alignItems: "center" }}><svg width="34" height="30" viewBox="0 0 100 86.6" aria-hidden="true" style={{ flex: "none" }}><polygon points="26.5,2.6 73.5,2.6 97,43.3 73.5,84 26.5,84 3,43.3" fill="url(#hpCov)" stroke="rgba(255,138,154,.75)" strokeWidth="3"></polygon><g transform="translate(50 43.3) scale(1.6) translate(-12 -12)" fill="none" stroke="#FF8A9A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 20.5V4M8 4.5h9l-2.5 3.8L17 12H8"></path></g></svg>{"Flag a suspected trap so you can't open it by accident. Flags are free."}</span>{" "}</div>{" "}<span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "11px", letterSpacing: ".14em", color: "#FF8A9A" }}>{"FIVE TRAPS"}</span>{" "}<div style={{ display: "flex", flexDirection: "column", borderRadius: "18px", background: "rgba(255,92,122,.05)", border: "1px solid rgba(255,138,154,.16)", overflow: "hidden" }}>{" "}{($.legendTraps || []).map((x, i4) => (<Fragment key={i4}>{" "}<div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,.05)" }}><span aria-hidden="true" style={{ width: "34px", height: "34px", borderRadius: "11px", background: "rgba(255,92,122,.16)", color: "#FF8A9A", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={x?.icon}></path></svg></span><span style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "14px", fontWeight: "600" }}>{x?.name}</span><span style={{ fontSize: "12px", lineHeight: "17px", color: "#A9A6B6" }}>{x?.fx}</span></span></div>{" "}</Fragment>))}{" "}</div>{" "}<span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "11px", letterSpacing: ".14em", color: "#6EE7B7" }}>{"THREE POWER-UPS"}</span>{" "}<div style={{ display: "flex", flexDirection: "column", borderRadius: "18px", background: "rgba(110,231,183,.04)", border: "1px solid rgba(110,231,183,.14)", overflow: "hidden" }}>{" "}{($.legendPowers || []).map((x, i5) => (<Fragment key={i5}>{" "}<div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,.05)" }}><span aria-hidden="true" style={{ width: "34px", height: "34px", borderRadius: "11px", background: x?.tint, color: x?.color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={x?.icon}></path></svg></span><span style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "14px", fontWeight: "600" }}>{x?.name}</span><span style={{ fontSize: "12px", lineHeight: "17px", color: "#A9A6B6" }}>{x?.fx}</span></span></div>{" "}</Fragment>))}{" "}</div>{" "}<span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "11px", letterSpacing: ".14em", color: "#F2C66B" }}>{"WINNING AND LOSING"}</span>{" "}<ul style={{ margin: "0", padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}><li>{"Place every piece to win. Your round XP is banked, plus half the level's XP again if you lost no lives."}</li><li>{"Run out of lives, moves or time and the round ends. Unbanked round XP is lost."}</li><li>{"Game XP is separate from participation points and ALKE. No result ever adds or removes ALKE."}</li></ul>{" "}</section>{" "}</div>{" "}</>) : null}{" "}{$.isWon ? (<>{" "}<div role="dialog" aria-modal="true" aria-labelledby="hx-win-title" style={{ position: "absolute", inset: "0", overflowY: "auto", boxSizing: "border-box", padding: "56px 22px 30px", background: "radial-gradient(70% 42% at 50% 24%,rgba(242,198,107,.26) 0%,rgba(8,7,13,0) 70%),rgba(8,7,13,.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center", animation: "hxFade .35s ease-out both" }}>{" "}<div aria-hidden="true" style={{ position: "relative", width: "150px", height: "168px", flex: "none" }}>{" "}<span style={{ position: "absolute", left: "50%", top: "50%", width: "0", height: "0", transform: "rotate(0deg)" }}><span style={{ position: "absolute", left: "-6px", top: "-6px", width: "12px", height: "12px", background: "#F2C66B", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", opacity: "0", animation: "hxShard 1.1s .55s ease-out both" }}></span></span>{" "}<span style={{ position: "absolute", left: "50%", top: "50%", width: "0", height: "0", transform: "rotate(36deg)" }}><span style={{ position: "absolute", left: "-5px", top: "-5px", width: "10px", height: "10px", background: "#FBE2A2", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", opacity: "0", animation: "hxShard 1.2s .6s ease-out both" }}></span></span>{" "}<span style={{ position: "absolute", left: "50%", top: "50%", width: "0", height: "0", transform: "rotate(72deg)" }}><span style={{ position: "absolute", left: "-6px", top: "-6px", width: "12px", height: "12px", background: "#C6B6FF", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", opacity: "0", animation: "hxShard 1.1s .5s ease-out both" }}></span></span>{" "}<span style={{ position: "absolute", left: "50%", top: "50%", width: "0", height: "0", transform: "rotate(108deg)" }}><span style={{ position: "absolute", left: "-5px", top: "-5px", width: "10px", height: "10px", background: "#F2C66B", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", opacity: "0", animation: "hxShard 1.25s .62s ease-out both" }}></span></span>{" "}<span style={{ position: "absolute", left: "50%", top: "50%", width: "0", height: "0", transform: "rotate(144deg)" }}><span style={{ position: "absolute", left: "-6px", top: "-6px", width: "12px", height: "12px", background: "#E9B44C", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", opacity: "0", animation: "hxShard 1.1s .56s ease-out both" }}></span></span>{" "}<span style={{ position: "absolute", left: "50%", top: "50%", width: "0", height: "0", transform: "rotate(180deg)" }}><span style={{ position: "absolute", left: "-5px", top: "-5px", width: "10px", height: "10px", background: "#FBE2A2", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", opacity: "0", animation: "hxShard 1.2s .52s ease-out both" }}></span></span>{" "}<span style={{ position: "absolute", left: "50%", top: "50%", width: "0", height: "0", transform: "rotate(216deg)" }}><span style={{ position: "absolute", left: "-6px", top: "-6px", width: "12px", height: "12px", background: "#F2C66B", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", opacity: "0", animation: "hxShard 1.15s .6s ease-out both" }}></span></span>{" "}<span style={{ position: "absolute", left: "50%", top: "50%", width: "0", height: "0", transform: "rotate(252deg)" }}><span style={{ position: "absolute", left: "-5px", top: "-5px", width: "10px", height: "10px", background: "#C6B6FF", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", opacity: "0", animation: "hxShard 1.2s .58s ease-out both" }}></span></span>{" "}<span style={{ position: "absolute", left: "50%", top: "50%", width: "0", height: "0", transform: "rotate(288deg)" }}><span style={{ position: "absolute", left: "-6px", top: "-6px", width: "12px", height: "12px", background: "#E9B44C", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", opacity: "0", animation: "hxShard 1.1s .54s ease-out both" }}></span></span>{" "}<span style={{ position: "absolute", left: "50%", top: "50%", width: "0", height: "0", transform: "rotate(324deg)" }}><span style={{ position: "absolute", left: "-5px", top: "-5px", width: "10px", height: "10px", background: "#FBE2A2", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", opacity: "0", animation: "hxShard 1.25s .6s ease-out both" }}></span></span>{" "}<svg width="150" height="168" viewBox="0 0 100 112" style={{ position: "absolute", left: "0", top: "0", overflow: "visible", animation: "hxGlow 2.6s 1.2s ease-in-out infinite" }}><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="rgba(242,198,107,.08)" stroke="none"></path><g fill="none" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round"><path d="M50 4 L94 29" pathLength="100" strokeDasharray="100" stroke={$.vs?.s0?.c} style={{ animation: $.vs?.s0?.a }}></path><path d="M94 29 L94 83" pathLength="100" strokeDasharray="100" stroke={$.vs?.s1?.c} style={{ animation: $.vs?.s1?.a }}></path><path d="M94 83 L50 108" pathLength="100" strokeDasharray="100" stroke={$.vs?.s2?.c} style={{ animation: $.vs?.s2?.a }}></path><path d="M50 108 L6 83" pathLength="100" strokeDasharray="100" stroke={$.vs?.s3?.c} style={{ animation: $.vs?.s3?.a }}></path><path d="M6 83 L6 29" pathLength="100" strokeDasharray="100" stroke={$.vs?.s4?.c} style={{ animation: $.vs?.s4?.a }}></path><path d="M6 29 L50 4" pathLength="100" strokeDasharray="100" stroke={$.vs?.s5?.c} style={{ animation: $.vs?.s5?.a }}></path><path d="M50 27 L50 85" pathLength="100" strokeDasharray="100" stroke={$.vs?.s6?.c} style={{ animation: $.vs?.s6?.a }}></path><path d="M20 45 L32 56 L20 67" pathLength="100" strokeDasharray="100" stroke={$.vs?.s7?.c} style={{ animation: $.vs?.s7?.a }}></path><path d="M30 45 L42 56 L30 67" pathLength="100" strokeDasharray="100" stroke={$.vs?.s8?.c} style={{ animation: $.vs?.s8?.a }}></path><path d="M80 45 L68 56 L80 67" pathLength="100" strokeDasharray="100" stroke={$.vs?.s9?.c} style={{ animation: $.vs?.s9?.a }}></path><path d="M70 45 L58 56 L70 67" pathLength="100" strokeDasharray="100" stroke={$.vs?.s10?.c} style={{ animation: $.vs?.s10?.a }}></path></g></svg>{" "}</div>{" "}<span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "11px", letterSpacing: ".14em", color: "#F2C66B" }}>{$.vicTag}</span>{" "}<h2 id="hx-win-title" style={{ margin: "0", fontFamily: "Inter,system-ui,sans-serif", fontSize: "32px", lineHeight: "36px", fontWeight: "600", letterSpacing: "-.03em" }}>{$.vicTitle}</h2>{" "}<span role="img" aria-label={$.starsLabel} style={{ display: "flex", gap: "6px" }}>{($.vicStars || []).map((st, i6) => (<Fragment key={i6}><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" style={{ animation: st?.anim }}><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill={st?.fill}></path></svg></Fragment>))}</span>{" "}<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}><span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "54px", lineHeight: "1", fontWeight: "600", letterSpacing: "-.04em", fontVariantNumeric: "tabular-nums", color: "#F2C66B" }}>{$.countText}</span><span style={{ fontSize: "13px", fontWeight: "600", color: "#D8D5E2" }}>{$.countSub}</span></div>{" "}<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px" }}>{($.breakdown || []).map((b, i7) => (<Fragment key={i7}><span style={{ display: "inline-flex", alignItems: "center", height: "26px", padding: "0 10px", borderRadius: "999px", background: "rgba(242,198,107,.12)", border: "1px solid rgba(242,198,107,.22)", color: "#F2C66B", fontSize: "12px", fontWeight: "600" }}>{b?.t}</span></Fragment>))}</div>{" "}<span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "12px", color: "#A9A6B6" }}>{$.vicStats}</span>{" "}{$.isDailyWin ? (<><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "30px", padding: "0 12px", borderRadius: "999px", background: "rgba(139,109,255,.16)", color: "#C6B6FF", fontSize: "13px", fontWeight: "600" }}>{$.rankText}</span></>) : null}{" "}<div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>{" "}{$.nextIsLevel ? (<><button type="button" onClick={$.goNext} style={{ width: "100%", height: "56px", border: "0", borderRadius: "999px", background: "linear-gradient(180deg,#FFDB8E 0%,#F7C15C 52%,#EBA33B 100%)", color: "#1C1030", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 12px 28px -12px rgba(245,184,77,.6), inset 0 1px 0 rgba(255,255,255,.55)" }}>{$.nextLabel}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button></>) : null}{" "}{$.showBoardLink ? (<><Link to="/games/hex/leaderboards" style={{ width: "100%", height: "56px", boxSizing: "border-box", borderRadius: "999px", background: "linear-gradient(180deg,#FFDB8E 0%,#F7C15C 52%,#EBA33B 100%)", color: "#1C1030", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", boxShadow: "0 12px 28px -12px rgba(245,184,77,.6), inset 0 1px 0 rgba(255,255,255,.55)" }}>{"See today's leaderboard"}</Link></>) : null}{" "}{$.showDailyCta ? (<><button type="button" onClick={$.goDaily} style={{ width: "100%", height: "56px", border: "0", borderRadius: "999px", background: "linear-gradient(180deg,#FFDB8E 0%,#F7C15C 52%,#EBA33B 100%)", color: "#1C1030", fontSize: "16px", fontWeight: "700", boxShadow: "0 12px 28px -12px rgba(245,184,77,.6), inset 0 1px 0 rgba(255,255,255,.55)" }}>{"All 20 cleared · play today's board"}</button></>) : null}{" "}<div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px" }}>{" "}<button type="button" onClick={$.replay} style={{ height: "50px", borderRadius: "999px", border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "#F7F5F2", fontSize: "15px", fontWeight: "600" }}>{"Replay"}</button>{" "}<button type="button" onClick={$.share} style={{ height: "50px", borderRadius: "999px", border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "#F7F5F2", fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 13v5.5A2 2 0 0 0 7 20.5h10a2 2 0 0 0 2-2V13"></path></svg>{$.shareLabel}</button>{" "}</div>{" "}<Link to="/games/hex" style={{ height: "46px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none", color: "#C6B6FF" }}>{"Back to ALKE Hex"}</Link>{" "}</div>{" "}<p style={{ margin: "0", fontSize: "11.5px", lineHeight: "17px", color: "#8C8999" }}>{"Game XP only. Nothing was added to or removed from your ALKE."}</p>{" "}</div>{" "}</>) : null}{" "}{$.isLost ? (<>{" "}<div role="dialog" aria-modal="true" aria-labelledby="hx-lose-title" style={{ position: "absolute", inset: "0", overflowY: "auto", boxSizing: "border-box", padding: "64px 22px 30px", background: "radial-gradient(70% 42% at 50% 22%,rgba(255,60,90,.22) 0%,rgba(8,7,13,0) 70%),rgba(8,7,13,.93)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center", animation: "hxFade .35s ease-out both" }}>{" "}<div aria-hidden="true" style={{ position: "relative", width: "130px", height: "146px", flex: "none", animation: "hxSway 3.4s ease-in-out infinite" }}>{" "}<svg width="130" height="146" viewBox="0 0 100 112" style={{ position: "absolute", left: "0", top: "0", overflow: "visible" }}><path d="M50 4 L94 29 L94 83 L50 108 L6 83 L6 29 Z" fill="rgba(255,92,122,.08)" stroke="#FF8A9A" strokeOpacity=".75" strokeWidth="4" strokeLinejoin="round"></path><path d="M50 4 L46 30 L57 44 L44 60 L54 76 L48 108" fill="none" stroke="#FF8A9A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"></path><g fill="none" stroke="#6E6A82" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 45 L32 56 L20 67"></path><path d="M80 45 L68 56 L80 67"></path></g></svg>{" "}<span style={{ position: "absolute", left: "18px", top: "96px", width: "14px", height: "14px", background: "#FF8A9A", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", animation: "hxFall 1.4s .4s ease-in both" }}></span>{" "}<span style={{ position: "absolute", left: "96px", top: "84px", width: "11px", height: "11px", background: "#C2354B", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", animation: "hxFall 1.3s .55s ease-in both" }}></span>{" "}<span style={{ position: "absolute", left: "62px", top: "118px", width: "9px", height: "9px", background: "#FF8A9A", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", animation: "hxFall 1.5s .7s ease-in both" }}></span>{" "}</div>{" "}<span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "11px", letterSpacing: ".14em", color: "#FF8A9A" }}>{$.defTag}</span>{" "}<h2 id="hx-lose-title" style={{ margin: "0", fontFamily: "Inter,system-ui,sans-serif", fontSize: "32px", lineHeight: "36px", fontWeight: "600", letterSpacing: "-.03em" }}>{$.defTitle}</h2>{" "}<span style={{ fontSize: "14px", color: "#A9A6B6" }}>{$.defSub}</span>{" "}<div style={{ width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "16px 18px", borderRadius: "22px", background: "rgba(255,92,122,.07)", border: "1px solid rgba(255,138,154,.22)", textAlign: "left" }}>{" "}<span style={{ display: "flex", flexDirection: "column", gap: "3px" }}><span style={{ fontSize: "14px", fontWeight: "600" }}>{"Round XP"}</span><span style={{ fontSize: "12px", lineHeight: "17px", color: "#A9A6B6" }}>{$.defLostSub}</span></span>{" "}<span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: "28px", fontWeight: "600", color: "#FF8A9A", whiteSpace: "nowrap" }}>{$.defLost}</span>{" "}</div>{" "}<div style={{ width: "100%", boxSizing: "border-box", display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", borderRadius: "18px", background: "rgba(110,231,183,.07)", border: "1px solid rgba(110,231,183,.2)", textAlign: "left" }}>{" "}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3.5 5 6.5v5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5v-5z"></path><path d="m9 12 2.2 2.2L15.5 10"></path></svg>{" "}<span style={{ fontSize: "13px", lineHeight: "19px", color: "#D8D5E2" }}>{"Your ALKE allocation, contribution score and drilling streak are untouched. Only this round's game XP is affected."}</span>{" "}</div>{" "}<p style={{ margin: "0", fontSize: "13px", lineHeight: "19px", color: "#A9A6B6" }}>{$.defTip}</p>{" "}<div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>{" "}<button type="button" onClick={$.replay} style={{ width: "100%", height: "56px", border: "0", borderRadius: "999px", background: "linear-gradient(180deg,#FFDB8E 0%,#F7C15C 52%,#EBA33B 100%)", color: "#1C1030", fontSize: "16px", fontWeight: "700", boxShadow: "0 12px 28px -12px rgba(245,184,77,.6), inset 0 1px 0 rgba(255,255,255,.55)" }}>{$.retryLabel}</button>{" "}<Link to="/games/hex" style={{ height: "46px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "600", textDecoration: "none", color: "#C6B6FF" }}>{"Back to ALKE Hex"}</Link>{" "}</div>{" "}</div>{" "}</>) : null}{" "}</div>{" "}</>);
  }
}
