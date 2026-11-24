/* The drilling scene (from the ALKÉ Drill prototype): a rig topped with the
   ALKÉ mark bores down through layers of rock. Gold fuel flows up the drill
   pipe to the rig and out to the connected networks. One canvas, redrawn
   every frame by DrillScene (drilling.jsx). Depth is a picture of progress,
   1 px per metre, not a measurement. */

export const BASE_DEPTH = 2400; // metres a starter rig drills in one 24-hour session
export const MAX_LEVEL = 4;
const BOOST = 0.25;

/* Rig levels: every RIG.perLevel active invites (server-counted) add a level,
   up to MAX_LEVEL. A level drills 25% deeper per drill. Depth only: rewards
   don't change with the level (that would need a server rule). */
export const RIG = { perLevel: 3, step: BOOST, max: MAX_LEVEL };
export const rigLevel = (active) => Math.min(MAX_LEVEL, Math.floor((Number(active) || 0) / RIG.perLevel));
export const rigDepth = (level) => BASE_DEPTH * (1 + BOOST * level);
export const rigName = (level) => (level ? `Level ${level} rig` : "Starter rig");

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hexPath(ctx, x, y, r, rot) {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = rot + (k * Math.PI) / 3;
    const px = x + r * Math.cos(a);
    const py = y + r * Math.sin(a);
    if (k) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.closePath();
}
function lowerBound(arr, v, key) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (arr[m][key] < v) lo = m + 1;
    else hi = m;
  }
  return lo;
}
const nf = new Intl.NumberFormat("en-US");

/* The rock: generated as the drill goes deeper, the same every time. */
const ZONES = [
  [["#2A2049", "#1E1738"], ["#1B1631", "#141026"], ["#33275A", "#251C44"], ["#201A3B", "#17122C"]],
  [["#232750", "#1A1D3E"], ["#171A35", "#111329"], ["#2B305E", "#20244A"], ["#1C1F40", "#141631"]],
  [["#341E48", "#261537"], ["#22142F", "#190E24"], ["#3D2556", "#2D1A42"], ["#2A1839", "#1F112B"]],
  [["#1C2A48", "#142038"], ["#131C31", "#0E1526"], ["#233558", "#1A2844"], ["#18243F", "#111B30"]],
];
class Strata {
  constructor() {
    this.rl = mulberry32(237422);
    this.rd = mulberry32(91813);
    this.rp = mulberry32(5521);
    this.layers = [];
    this.deposits = [];
    this.pebbles = [];
    this.layerEnd = 0;
    this.depEnd = 120;
    this.pebEnd = 0;
    this.n = 0;
  }
  ensure(d) {
    const { rl, rd, rp } = this;
    while (this.layerEnd < d) {
      const th = 70 + rl() * 190;
      const zone = ZONES[Math.floor(this.layerEnd / BASE_DEPTH) % ZONES.length];
      const c = zone[this.n++ % zone.length];
      this.layers.push({ top: this.layerEnd, bottom: this.layerEnd + th, c1: c[0], c2: c[1], amp: 3 + rl() * 7, f1: 0.012 + rl() * 0.02, p1: rl() * 6.28, f2: 0.04 + rl() * 0.05, p2: rl() * 6.28, amp2: 1 + rl() * 2.5 });
      this.layerEnd += th;
    }
    while (this.depEnd < d) {
      const near = rd() < 0.5;
      this.deposits.push({ depth: this.depEnd, xf: near ? 0.5 + (rd() - 0.5) * 0.12 : 0.08 + rd() * 0.7, r: 6 + rd() * 9, n: 3 + Math.floor(rd() * 4), seed: Math.floor(rd() * 1e6) });
      this.depEnd += 60 + rd() * 110;
    }
    while (this.pebEnd < d) {
      this.pebbles.push({ depth: this.pebEnd, xf: rp(), r: 0.8 + rp() * 2.2, a: 0.05 + rp() * 0.14, light: rp() < 0.5 });
      this.pebEnd += 5 + rp() * 9;
    }
  }
}

export class Scene {
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.geo = new Strata();
    this.t = 0;
    this.last = 0;
    this.intensity = 0;
    this.rot = 0;
    this.hexPulse = 0;
    this.lastDepth = -1;
    this.lv = -1;
    this.kick = 0; // a short surge of intensity from a tap
    this.fuel = [];
    this.sparks = [];
    this.cuttings = [];
    this.pulses = [];
    this.rings = [];
    this.spawnAcc = 0;
    this.sparkAcc = 0;
    this.cutAcc = 0;
    const r = mulberry32(4242);
    this.stars = [];
    for (let i = 0; i < 48; i++) this.stars.push({ xf: r(), yf: r(), s: 0.4 + r() * 1.1, tw: r() * 6.28, sp: 0.6 + r() * 1.8 });
    this.nodes = [
      { xf: 0.13, dy: 12, s: 7, flash: 0 },
      { xf: 0.87, dy: 16, s: 8, flash: 0 },
      { xf: 0.7, dy: 8, s: 5, flash: 0 },
    ];
    this.noise = this.makeNoise();
    this.resize();
  }
  makeNoise() {
    const c = document.createElement("canvas");
    c.width = c.height = 96;
    const g = c.getContext("2d");
    const r = mulberry32(7);
    for (let i = 0; i < 460; i++) {
      g.fillStyle = r() < 0.45 ? `rgba(198,182,255,${(0.03 + r() * 0.07).toFixed(3)})` : `rgba(0,0,0,${(0.08 + r() * 0.16).toFixed(3)})`;
      const s = r() < 0.85 ? 1 : 2;
      g.fillRect(Math.floor(r() * 96), Math.floor(r() * 96), s, s);
    }
    for (let i = 0; i < 20; i++) {
      g.fillStyle = `rgba(198,182,255,${(0.02 + r() * 0.03).toFixed(3)})`;
      g.fillRect(Math.floor(r() * 96), Math.floor(r() * 96), 6 + Math.floor(r() * 14), 1);
    }
    return this.ctx.createPattern(c, "repeat");
  }
  resize() {
    const b = this.cv.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = Math.max(200, b.width);
    this.H = Math.max(200, b.height);
    this.cv.width = Math.round(this.W * this.dpr);
    this.cv.height = Math.round(this.H * this.dpr);
    this.gy = 96;
    this.cx = Math.round(this.W * 0.5);
    this.crownY = 28;
    this.tipY = this.H - 52;
    this.xs = [];
    for (let x = -12; x <= this.W + 12; x += 12) this.xs.push(x);
    for (const n of this.nodes) {
      n.x = this.W * n.xf;
      n.y = this.gy - n.dy;
    }
  }
  edge(L, x) {
    return L.top + L.amp * Math.sin(x * L.f1 + L.p1) + L.amp2 * Math.sin(x * L.f2 + L.p2);
  }
  /** Where the bit is on screen (for tap effects). */
  tipAt(depth) {
    const top = Math.max(0, depth - (this.tipY - this.gy));
    return this.gy + (depth - top);
  }

  // depth: total metres drilled; p: progress through this session (0 to 1); lvl: the rig level
  frame(now, depth, p, phase, reduced, lvl) {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
    this.last = now;
    const target = phase === "drilling" ? 1 : 0;
    if (reduced) {
      this.intensity = target;
      this.fuel.length = 0;
      this.sparks.length = 0;
      this.cuttings.length = 0;
      this.pulses.length = 0;
      this.rings.length = 0;
    } else {
      this.t += dt;
      this.intensity += (target - this.intensity) * Math.min(1, dt * (target ? 1.3 : 2.4));
      this.kick = Math.max(0, this.kick - dt * 2.2);
      this.rot += dt * (1.5 + 18 * this.intensity + 30 * this.kick);
    }
    if (this.lv < 0 || reduced) this.lv = lvl;
    else this.lv += (lvl - this.lv) * Math.min(1, dt * 2.5);
    this.crownY = 28 - 2.5 * this.lv;
    const I = Math.min(1.4, this.intensity + 0.6 * this.kick);
    this.hexPulse = Math.max(0, this.hexPulse - dt * 1.6);
    if (phase === "ready" && !reduced) this.hexPulse = Math.max(this.hexPulse, 0.22 + 0.22 * Math.sin(this.t * 1.8)); // the rig breathes while it waits
    for (const n of this.nodes) n.flash = Math.max(0, n.flash - dt * 1.4);

    const top = Math.max(0, depth - (this.tipY - this.gy)); // depth at the top of the bore window
    const tip = this.gy + (depth - top); // the bit on screen; the camera follows it down
    this.geo.ensure(top + (this.H - this.gy) + 320);
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.W, this.H);
    this.drawSky(ctx, I);
    this.drawNetwork(ctx, I);
    this.drawUnderground(ctx, top, depth, tip, I, reduced);
    this.drawRig(ctx, p, I, tip);
    this.drawString(ctx, tip, I, reduced);
    if (!reduced) this.step(dt, tip, I);
    this.drawFlow(ctx, tip);
    this.lastDepth = depth;
    this.tip = tip;
  }

  drawSky(ctx, I) {
    const { W, gy } = this;
    const g = ctx.createLinearGradient(0, 0, 0, gy);
    g.addColorStop(0, "#0A0818");
    g.addColorStop(0.7, "#151033");
    g.addColorStop(1, "#251B52");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, gy);
    const hg = ctx.createRadialGradient(this.cx, gy, 0, this.cx, gy, W * 0.62);
    hg.addColorStop(0, `rgba(139,109,255,${(0.26 + 0.14 * Math.min(1, I)).toFixed(3)})`);
    hg.addColorStop(1, "rgba(139,109,255,0)");
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, W, gy);
    for (const s of this.stars) {
      const a = (0.25 + 0.55 * (0.5 + 0.5 * Math.sin(this.t * s.sp + s.tw))) * (1 - s.yf * 0.5);
      ctx.fillStyle = `rgba(247,245,242,${a.toFixed(3)})`;
      ctx.fillRect(s.xf * W, s.yf * (gy - 30), s.s, s.s);
    }
    ctx.fillStyle = "#130E29";
    ctx.beginPath();
    ctx.moveTo(0, gy);
    for (let x = 0; x <= W + 16; x += 16) ctx.lineTo(x, gy - 9 - 6 * Math.sin(x * 0.021 + 1.3) - 4 * Math.sin(x * 0.053));
    ctx.lineTo(W, gy);
    ctx.closePath();
    ctx.fill();
  }

  drawNetwork(ctx, I) {
    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(198,182,255,${(0.16 + 0.12 * Math.min(1, I)).toFixed(3)})`;
    for (const n of this.nodes) {
      ctx.beginPath();
      ctx.moveTo(this.cx, this.crownY);
      ctx.quadraticCurveTo((this.cx + n.x) / 2, Math.min(this.crownY, n.y) - 16, n.x, n.y);
      ctx.stroke();
    }
    ctx.restore();
    for (const n of this.nodes) {
      if (n.flash > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.s * 3.2);
        g.addColorStop(0, `rgba(245,184,77,${(0.5 * n.flash).toFixed(3)})`);
        g.addColorStop(1, "rgba(245,184,77,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.s * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      hexPath(ctx, n.x, n.y, n.s, -Math.PI / 2);
      ctx.fillStyle = "#17112F";
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = n.flash > 0.05 ? "#F5B84D" : "rgba(198,182,255,0.6)";
      ctx.stroke();
      ctx.fillStyle = n.flash > 0.05 ? "#FFDB8E" : "rgba(198,182,255,0.75)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawUnderground(ctx, top, depth, tip, I, reduced) {
    const { W, H, gy, cx, geo, xs } = this;
    const yOf = (d) => gy + (d - top);
    const bottomD = top + (H - gy) + 6;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, gy, W, H - gy);
    ctx.clip();
    const sh = reduced ? 0 : I * 0.7;
    ctx.translate(Math.sin(this.t * 53) * sh, Math.cos(this.t * 47) * sh);

    // rock layers with wavy boundaries
    const layers = geo.layers;
    const i0 = lowerBound(layers, top - 14, "bottom");
    let i1 = i0;
    for (let i = i0; i < layers.length; i++) {
      const L = layers[i];
      const N = layers[i + 1];
      if (L.top > bottomD + 14) break;
      i1 = i;
      ctx.beginPath();
      for (let k = 0; k < xs.length; k++) {
        const y = i === 0 ? yOf(0) : yOf(this.edge(L, xs[k]));
        if (k) ctx.lineTo(xs[k], y);
        else ctx.moveTo(xs[k], y);
      }
      for (let k = xs.length - 1; k >= 0; k--) ctx.lineTo(xs[k], N ? yOf(this.edge(N, xs[k])) : yOf(L.bottom));
      ctx.closePath();
      const lg = ctx.createLinearGradient(0, yOf(L.top), 0, yOf(L.bottom));
      lg.addColorStop(0, L.c1);
      lg.addColorStop(1, L.c2);
      ctx.fillStyle = lg;
      ctx.fill();
    }
    if (this.noise) {
      ctx.save();
      ctx.translate(0, gy - (top % 96));
      ctx.fillStyle = this.noise;
      ctx.fillRect(-4, -96, W + 8, H - gy + 200);
      ctx.restore();
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(198,182,255,0.12)";
    for (let i = Math.max(1, i0); i <= i1 + 1 && i < layers.length; i++) {
      const L = layers[i];
      ctx.beginPath();
      for (let k = 0; k < xs.length; k++) {
        const y = yOf(this.edge(L, xs[k]));
        if (k) ctx.lineTo(xs[k], y);
        else ctx.moveTo(xs[k], y);
      }
      ctx.stroke();
    }
    const peb = geo.pebbles;
    for (let k = lowerBound(peb, top - 4, "depth"); k < peb.length && peb[k].depth < bottomD; k++) {
      const pb = peb[k];
      ctx.fillStyle = pb.light ? `rgba(198,182,255,${pb.a.toFixed(3)})` : `rgba(0,0,0,${(pb.a + 0.1).toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(pb.xf * W, yOf(pb.depth), pb.r * 1.6, pb.r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // fuel pockets: the ones in the drill's path go dark once it passes through them
    const deps = geo.deposits;
    for (let k = lowerBound(deps, top - 40, "depth"); k < deps.length; k++) {
      const dp = deps[k];
      if (dp.depth > bottomD + 40) break;
      const x = dp.xf * W;
      const near = Math.abs(x - cx) < 20 + dp.r;
      if (near && !reduced && this.lastDepth >= 0 && this.lastDepth < dp.depth && depth >= dp.depth && depth - this.lastDepth < 30) this.burst(cx, tip);
      this.drawDeposit(ctx, x, yOf(dp.depth), dp, near && depth >= dp.depth);
    }

    if (tip - gy - 4 > 0) {
      ctx.fillStyle = "rgba(4,3,10,0.85)";
      ctx.fillRect(cx - 13, gy - 2, 26, tip - gy - 4);
      ctx.fillStyle = "rgba(198,182,255,0.12)";
      ctx.fillRect(cx - 14, gy - 2, 1, tip - gy - 4);
      ctx.fillRect(cx + 13, gy - 2, 1, tip - gy - 4);
    }
    for (const c of this.cuttings) {
      ctx.fillStyle = `rgba(176,156,214,${(0.55 * (c.life / c.max)).toFixed(3)})`;
      ctx.fillRect(c.x, c.y, c.s, c.s);
    }
    const shade = ctx.createLinearGradient(0, gy, 0, H);
    shade.addColorStop(0, "rgba(8,7,13,0)");
    shade.addColorStop(1, "rgba(8,7,13,0.45)");
    ctx.fillStyle = shade;
    ctx.fillRect(-4, gy, W + 8, H - gy);
    ctx.restore();

    if (top > 0) {
      // a break in the view: the rock between the surface and the window is skipped
      ctx.save();
      ctx.strokeStyle = "rgba(247,245,242,0.2)";
      ctx.lineWidth = 1;
      for (const off of [7, 12]) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 8) ctx.lineTo(x, gy + off + ((x / 8) % 2 ? 2 : -2));
        ctx.stroke();
      }
      ctx.restore();
    }
    this.drawRuler(ctx, top);
  }

  drawDeposit(ctx, x, y, dp, drained) {
    const r = dp.r;
    const rng = mulberry32(dp.seed);
    if (!drained) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const pul = 0.18 + 0.06 * Math.sin(this.t * 2 + dp.seed);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8);
      g.addColorStop(0, `rgba(245,184,77,${pul.toFixed(3)})`);
      g.addColorStop(1, "rgba(245,184,77,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (let k = 0; k < dp.n; k++) {
      const ox = (rng() - 0.5) * r * 1.7;
      const oy = (rng() - 0.5) * r;
      const s = r * (0.35 + rng() * 0.45);
      hexPath(ctx, x + ox, y + oy, s, -Math.PI / 2 + rng() * 0.5);
      if (drained) ctx.fillStyle = "rgba(92,74,64,0.45)";
      else {
        const g = ctx.createLinearGradient(x + ox - s, y + oy - s, x + ox + s, y + oy + s);
        g.addColorStop(0, "#FFE3A1");
        g.addColorStop(0.5, "#F5B84D");
        g.addColorStop(1, "#9A5E12");
        ctx.fillStyle = g;
      }
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = drained ? "rgba(255,255,255,0.06)" : "rgba(255,240,200,0.55)";
      ctx.stroke();
    }
  }

  drawPipe(ctx, y0, y1, tip) {
    if (y1 <= y0) return;
    const cx = this.cx;
    const g = ctx.createLinearGradient(cx - 4, 0, cx + 4, 0);
    g.addColorStop(0, "#2E2850");
    g.addColorStop(0.45, "#C9BEF0");
    g.addColorStop(1, "#2A2447");
    ctx.fillStyle = g;
    ctx.fillRect(cx - 4, y0, 8, y1 - y0);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    const step = 9;
    const off = (this.rot * 7) % step;
    for (let y = y0 + off; y < y1; y += step) ctx.fillRect(cx - 4 + ((y * 0.37 + this.rot * 5) % 8), y, 1.2, 4);
    if (typeof tip === "number") {
      const jg = ctx.createLinearGradient(cx - 6, 0, cx + 6, 0);
      jg.addColorStop(0, "#3A3360");
      jg.addColorStop(0.5, "#E4DCFF");
      jg.addColorStop(1, "#3A3360");
      ctx.fillStyle = jg;
      for (let y = tip - 40; y > y0 + 2; y -= 46) ctx.fillRect(cx - 6, y - 3, 12, 6);
    }
  }

  drawBit(ctx, x, tip, I) {
    const top = tip - 30;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const R = (16 + 20 * I + Math.sin(this.t * 22) * 2 * I) * (1 + 0.08 * this.lv);
    const g = ctx.createRadialGradient(x, tip, 0, x, tip, R);
    g.addColorStop(0, `rgba(255,214,140,${Math.min(0.9, 0.08 + 0.55 * I).toFixed(3)})`);
    g.addColorStop(0.5, `rgba(245,140,60,${Math.min(0.4, 0.22 * I).toFixed(3)})`);
    g.addColorStop(1, "rgba(245,140,60,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, tip, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - 9, top);
    ctx.lineTo(x + 9, top);
    ctx.lineTo(x + 8, tip - 9);
    ctx.lineTo(x, tip);
    ctx.lineTo(x - 8, tip - 9);
    ctx.closePath();
    const bg = ctx.createLinearGradient(x - 9, 0, x + 9, 0);
    bg.addColorStop(0, "#2B2546");
    bg.addColorStop(0.45, "#D6CCF7");
    bg.addColorStop(0.62, "#8F82C4");
    bg.addColorStop(1, "#231E3A");
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.clip();
    ctx.strokeStyle = "rgba(20,16,40,0.7)";
    ctx.lineWidth = 2;
    const off = (this.rot * 9) % 7;
    for (let y = top - 8 + off; y < tip + 4; y += 7) {
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y + 6);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = "#F5B84D";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + s * 7.5, tip - 9);
      ctx.lineTo(x + s * 2.5, tip - 3);
      ctx.lineTo(x + s * 8.5, tip - 4);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawRuler(ctx, top) {
    const { W, H, gy } = this;
    const x = W - 8;
    ctx.save();
    ctx.fillStyle = "rgba(8,7,13,0.32)";
    ctx.fillRect(W - 54, gy, 54, H - gy);
    ctx.strokeStyle = "rgba(198,182,255,0.32)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, gy);
    ctx.lineTo(x + 0.5, H);
    ctx.stroke();
    ctx.font = '500 9px "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let d = Math.ceil(top / 10) * 10; d <= top + (H - gy); d += 10) {
      const y = Math.round(gy + (d - top)) + 0.5;
      const major = d % 50 === 0;
      ctx.strokeStyle = major ? "rgba(198,182,255,0.6)" : "rgba(198,182,255,0.25)";
      ctx.beginPath();
      ctx.moveTo(x - (major ? 7 : 4), y);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (major && y > gy + 20 && y < H - 6) {
        ctx.fillStyle = "rgba(247,245,242,0.55)";
        ctx.fillText(nf.format(d), x - 10, y);
      }
    }
    ctx.restore();
  }

  // the drill string: pipe, bit and sparks, drawn over the rig so the bit also shows at the surface
  drawString(ctx, tip, I, reduced) {
    const sh = reduced ? 0 : I * 0.7;
    ctx.save();
    ctx.translate(Math.sin(this.t * 53) * sh, Math.cos(this.t * 47) * sh);
    this.drawPipe(ctx, this.gy - 2, tip - 30, tip);
    this.drawBit(ctx, this.cx, tip, I);
    ctx.globalCompositeOperation = "lighter";
    for (const s of this.sparks) {
      const a = Math.max(0, s.life / s.max);
      ctx.strokeStyle = `rgba(255,${Math.round(170 + 60 * a)},${Math.round(90 + 60 * a)},${a.toFixed(3)})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.035, s.y - s.vy * 0.035);
      ctx.stroke();
    }
    ctx.restore();
  }

  // the derrick grows with the rig level: wider, taller, one pair of lamps per level
  drawRig(ctx, p, I, tip) {
    const { W, gy } = this;
    const x = this.cx;
    const cy = this.crownY;
    const L = this.lv;
    ctx.fillStyle = "#1B1533";
    ctx.fillRect(0, gy - 3, W, 5);
    ctx.fillStyle = "rgba(198,182,255,0.28)";
    ctx.fillRect(0, gy - 3, W, 1);
    const yTop = cy + 16;
    const yBase = gy - 8;
    const bh = 23 + 3 * L;
    const th = 6 + 0.5 * L;
    const half = 32 + 4 * L;
    this.drawPipe(ctx, yTop, Math.min(gy + 1, tip - 30));
    ctx.strokeStyle = "rgba(198,182,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - bh, yBase);
    ctx.lineTo(x - th, yTop);
    ctx.moveTo(x + bh, yBase);
    ctx.lineTo(x + th, yTop);
    ctx.stroke();
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = "rgba(198,182,255,0.42)";
    for (let k = 0; k < 5; k++) {
      const a = k / 5;
      const b = (k + 1) / 5;
      const ya = yBase + (yTop - yBase) * a;
      const yb = yBase + (yTop - yBase) * b;
      const ha = bh + (th - bh) * a;
      const hb = bh + (th - bh) * b;
      ctx.beginPath();
      ctx.moveTo(x - ha, ya);
      ctx.lineTo(x + hb, yb);
      ctx.moveTo(x + ha, ya);
      ctx.lineTo(x - hb, yb);
      ctx.moveTo(x - hb, yb);
      ctx.lineTo(x + hb, yb);
      ctx.stroke();
    }
    ctx.fillStyle = "#2B2350";
    ctx.fillRect(x - half, gy - 9, half * 2, 6);
    ctx.fillStyle = "rgba(198,182,255,0.4)";
    ctx.fillRect(x - half, gy - 9, half * 2, 1);
    const lamps = Math.floor(L + 0.01);
    for (let k = 0; k < lamps; k++) {
      const f = (k + 1) / (MAX_LEVEL + 1);
      const yy = yBase + (yTop - yBase) * f;
      const hw = bh + (th - bh) * f;
      const on = 0.55 + 0.45 * Math.sin(this.t * 4 + k * 1.7);
      for (const s of [-1, 1]) {
        const lx = x + s * hw;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(lx, yy, 0, lx, yy, 6);
        g.addColorStop(0, `rgba(255,219,142,${(0.6 * on).toFixed(3)})`);
        g.addColorStop(1, "rgba(255,219,142,0)");
        ctx.fillStyle = g;
        ctx.fillRect(lx - 6, yy - 6, 12, 12);
        ctx.restore();
        ctx.fillStyle = "#FFDB8E";
        ctx.beginPath();
        ctx.arc(lx, yy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    this.drawCrown(ctx, x, cy, p, I);
    const blink = Math.sin(this.t * 3.1) > 0.55 ? 0.95 : 0.15;
    ctx.fillStyle = `rgba(255,138,154,${blink})`;
    ctx.beginPath();
    ctx.arc(x, cy - 15 - 0.75 * L, 1.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // the ALKÉ hex at the top of the rig fills with this session's progress
  drawCrown(ctx, x, y, p, I) {
    const L = this.lv;
    const R = 13 + 0.75 * L;
    const k = R / 13;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const hr = 24 + 12 * this.hexPulse + 4 * I + 2 * L;
    const g = ctx.createRadialGradient(x, y, 0, x, y, hr);
    g.addColorStop(0, `rgba(139,109,255,${(0.32 + 0.3 * this.hexPulse).toFixed(3)})`);
    g.addColorStop(1, "rgba(139,109,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, hr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    hexPath(ctx, x, y, R, -Math.PI / 2);
    ctx.fillStyle = "#140F2C";
    ctx.fill();
    ctx.save();
    hexPath(ctx, x, y, R - 1.6, -Math.PI / 2);
    ctx.clip();
    const lvl = y + R - 2 * R * p;
    const fg = ctx.createLinearGradient(0, y - R, 0, y + R);
    fg.addColorStop(0, "#FFDB8E");
    fg.addColorStop(1, "#EBA33B");
    ctx.fillStyle = fg;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(x - R, y + R);
    for (let dx = -R; dx <= R; dx += 2) ctx.lineTo(x + dx, lvl + Math.sin(this.t * 4 + dx * 0.6) * 1.2 * (0.3 + I));
    ctx.lineTo(x + R, y + R);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    hexPath(ctx, x, y, R, -Math.PI / 2);
    ctx.strokeStyle = "#C6B6FF";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    if (L > 0.05) {
      hexPath(ctx, x, y, R + 3.5, -Math.PI / 2);
      ctx.strokeStyle = `rgba(245,184,77,${Math.min(0.75, 0.25 + 0.12 * L).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 1.3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y - 7 * k);
    ctx.lineTo(x, y + 7 * k);
    ctx.moveTo(x - 7 * k, y - 3 * k);
    ctx.lineTo(x - 4 * k, y);
    ctx.lineTo(x - 7 * k, y + 3 * k);
    ctx.moveTo(x + 7 * k, y - 3 * k);
    ctx.lineTo(x + 4 * k, y);
    ctx.lineTo(x + 7 * k, y + 3 * k);
    ctx.stroke();
  }

  burst(x, y) {
    for (let i = 0; i < 26; i++) {
      const a = -Math.PI * (0.05 + Math.random() * 0.9);
      const v = 90 + Math.random() * 170;
      this.sparks.push({ x: x + (Math.random() - 0.5) * 8, y: y - 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.4, max: 0.9 });
    }
    this.rings.push({ x, y, t: 0 });
    for (let i = 0; i < 6; i++) this.fuel.push({ pos: -i * 10, v: 110 + Math.random() * 40 });
  }

  /** A tap on the rock: the bit bites harder. On beat it throws more sparks and a slug of fuel. */
  strike(onBeat) {
    const x = this.cx;
    const y = this.tip ?? this.tipY;
    this.kick = Math.min(1, this.kick + (onBeat ? 0.55 : 0.3));
    const n = onBeat ? 18 : 8;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * (0.05 + Math.random() * 0.9);
      const v = 70 + Math.random() * (onBeat ? 190 : 120);
      this.sparks.push({ x: x + (Math.random() - 0.5) * 8, y: y - 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.35 + Math.random() * 0.35, max: 0.7 });
    }
    if (onBeat) {
      this.rings.push({ x, y, t: 0 });
      for (let i = 0; i < 3; i++) this.fuel.push({ pos: -i * 10, v: 130 + Math.random() * 40 });
    }
  }

  /** Struck a vein: rings and a shower of gold from the crown, and every network lights up. */
  vein() {
    this.hexPulse = 1;
    this.kick = 1;
    this.rings.push({ x: this.cx, y: this.crownY, t: 0 }, { x: this.cx, y: this.crownY, t: -0.22 });
    const y = this.tip ?? this.tipY;
    this.burst(this.cx, y);
    for (let i = 0; i < 34; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 60 + Math.random() * 140;
      this.sparks.push({ x: this.cx, y: this.crownY, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 0.6 + Math.random() * 0.5, max: 1.1 });
    }
    for (const n of this.nodes) n.flash = 1;
  }

  /** Session started: the crown pulses and the networks light up. */
  celebrate() {
    this.hexPulse = 1;
    this.rings.push({ x: this.cx, y: this.crownY, t: 0 });
    for (const n of this.nodes) this.pulses.push({ n, t: 0, d: 0.6 + Math.random() * 0.4 });
  }

  step(dt, tip, I) {
    const { cx, gy } = this;
    const lenA = Math.max(0, tip - 30 - gy);
    const lenB = gy - (this.crownY + 12);
    if (I > 0.05) {
      this.spawnAcc += dt * (2 + 7 * I) * (1 + BOOST * this.lv);
      while (this.spawnAcc >= 1) {
        this.spawnAcc -= 1;
        this.fuel.push({ pos: 0, v: 85 + Math.random() * 45 });
      }
      this.sparkAcc += dt * 46 * I;
      while (this.sparkAcc >= 1) {
        this.sparkAcc -= 1;
        const a = -Math.PI * (0.08 + Math.random() * 0.84);
        const v = 50 + Math.random() * 120;
        this.sparks.push({ x: cx + (Math.random() - 0.5) * 10, y: tip - 3, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.25 + Math.random() * 0.35, max: 0.6 });
      }
      this.cutAcc += dt * 30 * I;
      while (this.cutAcc >= 1) {
        this.cutAcc -= 1;
        const side = Math.random() < 0.5 ? -1 : 1;
        this.cuttings.push({ x: cx + side * (6 + Math.random() * 5), y: tip - 12, v: 26 + Math.random() * 46, s: 1 + Math.random() * 1.4, life: 2.6, max: 2.6 });
      }
    }
    for (let i = this.fuel.length - 1; i >= 0; i--) {
      const f = this.fuel[i];
      f.pos += f.v * dt;
      if (f.pos >= lenA + lenB) {
        this.fuel.splice(i, 1);
        this.hexPulse = Math.min(1, this.hexPulse + 0.35);
        if (Math.random() < 0.45 + 0.1 * this.lv) this.pulses.push({ n: this.nodes[Math.floor(Math.random() * this.nodes.length)], t: 0, d: 0.9 + Math.random() * 0.5 });
      }
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }
      s.vy += 260 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
    for (let i = this.cuttings.length - 1; i >= 0; i--) {
      const c = this.cuttings[i];
      c.life -= dt;
      c.y -= c.v * dt;
      if (c.life <= 0 || c.y < gy) this.cuttings.splice(i, 1);
    }
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const q = this.pulses[i];
      q.t += dt / q.d;
      if (q.t >= 1) {
        q.n.flash = 1;
        this.pulses.splice(i, 1);
      }
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      this.rings[i].t += dt;
      if (this.rings[i].t > 0.7) this.rings.splice(i, 1);
    }
    if (this.fuel.length > 100) this.fuel.splice(0, this.fuel.length - 100);
    if (this.sparks.length > 240) this.sparks.splice(0, this.sparks.length - 240);
  }

  drawFlow(ctx, tip) {
    const { cx, gy } = this;
    const lenA = Math.max(0, tip - 30 - gy);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const f of this.fuel) {
      if (f.pos < 0) continue;
      const y = f.pos < lenA ? tip - 30 - f.pos : gy - (f.pos - lenA);
      const g = ctx.createRadialGradient(cx, y, 0, cx, y, 7);
      g.addColorStop(0, "rgba(255,226,150,0.95)");
      g.addColorStop(0.35, "rgba(245,184,77,0.55)");
      g.addColorStop(1, "rgba(245,184,77,0)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - 7, y - 7, 14, 14);
    }
    for (const q of this.pulses) {
      const n = q.n;
      const t = q.t;
      const mx = (cx + n.x) / 2;
      const my = Math.min(this.crownY, n.y) - 16;
      const px = (1 - t) * (1 - t) * cx + 2 * (1 - t) * t * mx + t * t * n.x;
      const py = (1 - t) * (1 - t) * this.crownY + 2 * (1 - t) * t * my + t * t * n.y;
      const g = ctx.createRadialGradient(px, py, 0, px, py, 6);
      g.addColorStop(0, "rgba(255,226,150,0.95)");
      g.addColorStop(1, "rgba(245,184,77,0)");
      ctx.fillStyle = g;
      ctx.fillRect(px - 6, py - 6, 12, 12);
    }
    for (const r of this.rings) {
      if (r.t < 0) continue;
      const a = Math.max(0, 1 - r.t / 0.7);
      ctx.strokeStyle = `rgba(255,219,142,${(0.6 * a).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 8 + r.t * 70, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
