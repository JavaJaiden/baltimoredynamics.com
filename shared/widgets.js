/* Interactive pieces shared by every version. Plain DOM, themed entirely through CSS variables and .bdw-* classes (see widgets.css). */
(function () {
"use strict";
window.BD = window.BD || {};
const cv = (el, n, fb) => (getComputedStyle(el).getPropertyValue(n).trim() || fb);
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const palette = (el) => ({ bg: cv(el, "--bd-panel", cv(el, "--bd-bg", "#0a0c0a")), fg: cv(el, "--bd-fg", "#ece6d9"), dim: cv(el, "--bd-dim", "#a8a396"), rule: cv(el, "--bd-rule", "rgba(236,230,217,.2)"), accent: cv(el, "--bd-accent", "#f5b800"), water: cv(el, "--bd-water", "#6fd6c6"), ember: cv(el, "--bd-ember", "#ff5a1f"), land: cv(el, "--bd-land", "rgba(111,214,198,.12)"), wait: cv(el, "--bd-wait", "rgba(128,128,128,.35)"), fly: cv(el, "--bd-fly", cv(el, "--bd-dim", "#8a8678")), mono: cv(el, "--bd-font-mono", "ui-monospace,Menlo,monospace"), sans: cv(el, "--bd-font-body", "system-ui,sans-serif"), led: cv(el, "--led", cv(el, "--bd-accent", "#ffb300")) });

/* Fleet model: slider-driven event simulation of aircraft sharing refill stations. */
const TANK = 2, FLOW = 10 / 60, SORTIE = 60, SERVICE = 90, T_END = 600;
function runFleet(n, st) {
  const spray = TANK / FLOW, out = (SORTIE - spray) / 2, free = [], tracks = [], ac = []; let litres = 0;
  for (let i = 0; i < st; i++) free.push(0);
  for (let i = 0; i < n; i++) { ac.push({ id: i, ready: i * 4 }); tracks.push([]); }
  for (let g = 0; g < 5000; g++) { ac.sort((a, b) => a.ready - b.ready); const c = ac[0]; if (c.ready >= T_END) break; const s0 = c.ready + out, s1 = s0 + spray, back = s1 + out; litres += Math.max(0, Math.min(s1, T_END) - Math.min(s0, T_END)) * FLOW; free.sort((a, b) => a - b); const start = Math.max(back, free[0]), end = start + SERVICE; free[0] = end; tracks[c.id].push(["fly", c.ready, s0], ["spray", s0, s1], ["fly", s1, back], ["wait", back, start], ["svc", start, end]); c.ready = end; }
  return { litres, tracks };
}
function fleet(root, o) {
  o = o || {}; let n = o.aircraft || 6, st = o.stations || 2; const id = "f" + Math.random().toString(36).slice(2, 7);
  root.classList.add("bdw", "bdw-fleet");
  root.innerHTML = `<div class="bdw-fleet__top"><div><span class="bdw-label">Water released in 10 minutes</span><b class="bdw-big" data-l></b></div><span class="bdw-tag bdw-tag--sim">Illustrative model</span></div>
  <div class="bdw-fleet__sliders"><label for="${id}a" class="bdw-slider"><span class="bdw-label">Aircraft <b data-na></b></span><input id="${id}a" type="range" min="2" max="12" value="${n}"></label><label for="${id}s" class="bdw-slider"><span class="bdw-label">Refill stations <b data-ns></b></span><input id="${id}s" type="range" min="1" max="4" value="${st}"></label></div>
  <canvas role="img" aria-label="Timeline of each aircraft flying, spraying, waiting and refilling over ten minutes"></canvas>
  <div class="bdw-legend"><span><i data-c="fly"></i>Flying</span><span><i data-c="spray"></i>Spraying</span><span><i data-c="wait"></i>Waiting</span><span><i data-c="svc"></i>Refilling</span></div>
  <p class="bdw-note" data-note aria-live="polite"></p><p class="bdw-fine">2 L tanks, 10 L/min, 60 s sortie, 90 s service. A planning model. It says nothing about fire suppression or flight safety.</p>`;
  const c = root.querySelector("canvas"), q = (s) => root.querySelector(s), a = q(`#${id}a`), s = q(`#${id}s`);
  const draw = () => {
    const r = runFleet(n, st), P = palette(root), COL = { fly: P.fly, spray: P.ember, wait: P.wait, svc: P.water };
    root.querySelectorAll("[data-c]").forEach((i) => (i.style.background = COL[i.dataset.c]));
    q("[data-l]").textContent = Math.round(r.litres) + " L"; q("[data-na]").textContent = n; q("[data-ns]").textContent = st;
    let waited = 0; r.tracks.forEach((t) => t.forEach((x) => { if (x[0] === "wait") waited += Math.max(0, Math.min(x[2], T_END) - Math.min(x[1], T_END)); }));
    const share = Math.round((waited / (n * T_END)) * 100);
    q("[data-note]").textContent = share > 20 ? `Aircraft spend ${share}% of the window waiting for a station. Add a station before adding aircraft.` : `Aircraft wait ${share}% of the window. Stations are keeping up.`;
    const dpr = Math.min(devicePixelRatio || 1, 2), w = c.clientWidth || 560, rowH = 18, gap = 6, h = n * (rowH + gap) + 26; c.width = w * dpr; c.height = h * dpr; c.style.height = h + "px";
    const x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h); const left = 34, sc = (w - left) / T_END; x.font = "12px " + P.mono; x.textBaseline = "middle";
    r.tracks.forEach((t, i) => { const y = i * (rowH + gap); x.fillStyle = P.dim; x.fillText("A" + (i + 1), 0, y + rowH / 2); t.forEach((k) => { const A = Math.min(k[1], T_END), B = Math.min(k[2], T_END); if (B <= A) return; x.fillStyle = COL[k[0]]; x.fillRect(left + A * sc, y, Math.max(1, (B - A) * sc - 1), rowH); }); });
    x.fillStyle = P.dim; const step = w < 520 ? 5 : 2; for (let m = 0; m <= 10; m += step) { x.textAlign = m === 10 ? "right" : m === 0 ? "left" : "center"; x.fillText(m + " min", left + m * 60 * sc, h - 9); } x.textAlign = "left";
  };
  a.addEventListener("input", () => { n = +a.value; draw(); }); s.addEventListener("input", () => { st = +s.value; draw(); });
  const ro = new ResizeObserver(draw); ro.observe(c); if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); draw();
  return { redraw: draw, destroy() { ro.disconnect(); } };
}

/* Harbormaster board: six aircraft loop from three refill stations to a fire and back, drawn like a line map. A station is kept for an aircraft that goes quiet. */
const OUT = 24, SPRAY = 12, BACK = 24, SVC = 90, ROLL = 10, SPEED = 4;
const START = "Six aircraft, three refill stations, one fire. Harbormaster gives each aircraft its turn, and never sends two to the same station.";
const sat = (v) => Math.max(0, Math.min(1, v)), ease = (t) => { const k = sat(t); return k * k * (3 - 2 * k); };
function fresh() {
  /* The model's steady state: an aircraft takes off every 30 seconds and every station has one aircraft in it. */
  const units = [0, 1, 2, 3, 4, 5].map((i) => { const c = 12 + i * 30, phase = c < 24 ? "out" : c < 36 ? "spray" : c < 60 ? "back" : c < 90 ? "queue" : "refill", t = c - { out: 0, spray: 24, back: 36, queue: 60, refill: 90 }[phase]; return { id: i + 1, phase, t, bay: 2 - (i % 3), tank: phase === "out" ? 1 : phase === "refill" ? sat((t - ROLL) / (SVC - ROLL)) : 0, q: phase === "back" ? 1 : 0, from: 0 }; });
  return { units, busy: [6, 5, 4], held: [0, 0, 0], say: START, pend: false };
}
const airborne = (s) => { const U = s.units; return U.find((u) => u.phase === "out" && u.t > 8 && u.t < OUT - 1) || U.find((u) => u.phase === "back" && u.t < 9) || U.find((u) => u.phase === "spray") || U.find((u) => u.phase === "out" && u.t > 8); };
function cut(s, u) {
  s.pend = false; u.was = u.phase; u.phase = "lost";
  let k = s.busy.findIndex((b, i) => !b && !s.held[i]);
  if (k < 0) { let most = -1; s.units.forEach((v) => { if (v.phase === "refill" && !s.held[v.bay] && v.t > most) { most = v.t; k = v.bay; } }); }
  if (k < 0) k = u.bay;
  s.held[k] = u.id; u.keep = k;
  s.say = "One aircraft has gone quiet. Harbormaster keeps a refill station reserved for it, shown in red. No other aircraft is sent there until a person confirms it has landed.";
}
function land(s) { const u = s.units.find((v) => v.phase === "lost"); if (!u) return; u.phase = "down"; s.held[u.keep] = 0; s.say = "A person has confirmed it is on the ground. Its refill station is back in use."; }
function stepBoard(s, dt) {
  const U = s.units, turn = (a, b) => b.t - a.t;
  U.forEach((u) => {
    if (u.phase === "lost" || u.phase === "down") return; u.t += dt;
    if (u.phase === "refill") { u.tank = sat((u.t - ROLL) / (SVC - ROLL)); if (u.t >= SVC) { u.phase = "out"; u.t -= SVC; u.tank = 1; s.busy[u.bay] = 0; } }
    else if (u.phase === "out") { if (u.t >= OUT) { u.phase = "spray"; u.t -= OUT; } }
    else if (u.phase === "spray") { u.tank = sat(1 - u.t / SPRAY); if (u.t >= SPRAY) { u.phase = "back"; u.t -= SPRAY; u.tank = 0; } }
    else if (u.phase === "back" && u.t >= BACK) { u.phase = "queue"; u.t -= BACK; }
  });
  /* Hand out turns: whoever has waited longest gets the next free station. A reserved station is never given out. */
  for (const u of U.filter((v) => v.phase === "queue").sort(turn)) { const k = s.busy.findIndex((b, i) => !b && !s.held[i]); if (k < 0) break; s.busy[k] = u.id; u.bay = k; u.phase = "refill"; u.t = 0; u.from = u.q; }
  U.filter((v) => v.phase === "queue").sort(turn).concat(U.filter((v) => v.phase === "back").sort(turn)).forEach((u, i) => { u.q += (i - u.q) * (1 - Math.exp(-dt / 2.5)); });
  if (s.pend) { const u = airborne(s); if (u) cut(s, u); }
}
const uncut = (s, u) => { u.phase = u.was; s.held[u.keep] = 0; delete u.lt; };
/* The picture is a side view, drawn as plainly as a diagram in a children's book: refill stations on the ground at the left, the fire at the right, aircraft in the air between them, and Harbormaster's ground station in the middle with a radio link to every aircraft in the air. */
function lay(w, h) {
  /* A narrow canvas packs things closer so they can be drawn bigger. Spare height is shared above and below, so the picture sits in the middle. */
  const k = Math.max(0.6, Math.min(1.7, Math.min(w / (w < 520 ? 400 : 470), h / 330))), pad = 14 * k, rise = w < 520 ? 205 : 262, gy = h - 34 * k - Math.max(0, (h - (rise + 58) * k) / 2), tw = 46 * k, th = 36 * k, tx = [0, 1, 2].map((i) => pad + tw / 2 + i * (tw + 12 * k)), tr = tx[2] + tw / 2, fw = 80 * k, fx = w - pad - fw / 2;
  const padY = gy - th - 13 * k, hov = gy - 128 * k, apex = Math.max(22 * k, gy - rise * k);
  /* Aircraft waiting for a turn hover in a stack, the next one to go at the bottom. */
  return { k, gy, tw, th, tx, fx, fw, padY, hov, slotY: gy - 98 * k, s0: tr + 70 * k, sg: 27 * k, hx: tr + (fx - fw / 2 - tr) * 0.6, outC: 2 * (apex - 0.25 * (padY + hov)), backC: gy - 72 * k };
}
const bez = (a, c, b, t) => { const m = 1 - t; return [m * m * a[0] + 2 * m * t * c[0] + t * t * b[0], m * m * a[1] + 2 * m * t * c[1] + t * t * b[1]]; };
function place(u, L, T) {
  const ph = u.phase === "lost" ? u.was : u.phase, k = L.k, sx = L.s0, sy = (q) => L.slotY - q * L.sg, pad = [L.tx[u.bay], L.padY], bob = Math.sin(T * 1.6 + u.id * 1.9) * 2 * k;
  if (ph === "out") { const f = ease(u.t / OUT), p = bez(pad, [pad[0] + (L.fx - pad[0]) * 0.42, L.outC], [L.fx - 24 * k, L.hov], f); return [p[0], p[1], Math.sin(f * Math.PI) * 0.13]; }
  if (ph === "spray") return [L.fx - 24 * k + 48 * k * sat(u.t / SPRAY), L.hov + bob, 0];
  if (ph === "back") { const f = ease(u.t / BACK), p = bez([L.fx + 24 * k, L.hov], [(L.fx + sx) / 2, L.backC], [sx, sy(u.q)], f); return [p[0], p[1] + bob * f, -Math.sin(f * Math.PI) * 0.13]; }
  if (ph === "queue") return [sx, sy(u.q) + bob, 0];
  const f = ease(u.t / ROLL), p = bez([sx, sy(u.from)], [pad[0], sy(u.from)], pad, f); return [p[0], p[1] + bob * (1 - f), 0];
}
function drawScene(c, s, T, P, o) {
  o = o || {}; const dpr = Math.min(devicePixelRatio || 1, 3), w = c.clientWidth || 600, h = c.clientHeight || 400; if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const x = c.getContext("2d"), L = lay(w, h), { k, gy, tw, th, tx, fx, fw } = L, TAU = Math.PI * 2, hm = o.hm === undefined ? 1 : o.hm, still = !!o.still, HMC = P.led, fs = Math.max(11, Math.min(15, 11 * k));
  const font = (px, wt) => { x.font = `${wt || 600} ${px}px ${P.sans}`; }, text = (t, px, py, al, col) => { x.textAlign = al || "center"; x.fillStyle = col || P.dim; x.fillText(t, px, py); };
  const line = (a, b, c2, d) => { x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke(); };
  x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = P.bg; x.fillRect(0, 0, w, h); x.lineCap = "round"; x.lineJoin = "round"; x.textBaseline = "middle"; x.setLineDash([]);
  const lw = Math.max(1.3, 1.6 * k), lost = s.units.find((u) => u.phase === "lost"), spots = s.units.map((u) => place(u, L, T));
  s.units.forEach((u, i) => { if (u.phase !== "lost") return; if (u.lt === undefined) u.lt = T; /* an aircraft that has gone quiet is shown off to one side, above the fire, where nothing else flies */ const e = still ? 1 : ease((T - u.lt) / 1.6), to = [fx + 6 * k, Math.max(40 * k, L.hov - 64 * k)]; spots[i] = [spots[i][0] + (to[0] - spots[i][0]) * e, spots[i][1] + (to[1] - spots[i][1]) * e, 0]; });
  /* the ground, and a name under each thing standing on it */
  x.strokeStyle = P.fg; x.globalAlpha = 0.3; x.lineWidth = 1; line(0, gy, w, gy); x.globalAlpha = 1;
  font(fs); text("Refill stations", tx[1], gy + 19 * k); text("Fire", fx, gy + 19 * k, "center", P.ember);
  /* the refill stations: a tank of water with a pad on top */
  tx.forEach((t, i) => {
    const hd = s.held[i], l = t - tw / 2, top = gy - th, lvl = gy - th * 0.62;
    x.fillStyle = P.water; x.globalAlpha = 0.3; x.fillRect(l + 1, lvl, tw - 2, gy - lvl - 1); x.globalAlpha = 0.9; x.strokeStyle = P.water; x.lineWidth = 1.2; x.beginPath(); for (let j = 0; j <= 8; j++) { const px = l + 2 + ((tw - 4) * j) / 8, py = lvl + (still ? 0 : Math.sin(T * 1.4 + j * 1.1 + i) * 1.2 * k); j ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); x.globalAlpha = 1;
    x.strokeStyle = hd ? P.ember : P.fg; x.lineWidth = lw; if (hd) x.setLineDash([5 * k, 4 * k]); x.beginPath(); x.moveTo(l, gy); x.lineTo(l, top + 5 * k); x.quadraticCurveTo(l, top, l + 5 * k, top); x.lineTo(l + tw - 5 * k, top); x.quadraticCurveTo(l + tw, top, l + tw, top + 5 * k); x.lineTo(l + tw, gy); x.stroke(); x.setLineDash([]);
    x.lineWidth = lw * 1.5; line(l - 3 * k, top - 3 * k, l + tw + 3 * k, top - 3 * k);
    if (hd) { font(fs, 700); const half = x.measureText("Reserved").width / 2 + 3; text("Reserved", Math.max(half, t), top - (s.busy[i] ? 34 : 14) * k, "center", P.ember); }
  });
  /* the fire */
  [[0, 66, 30, 0], [-24, 40, 22, 1.7], [24, 44, 22, 3.1]].forEach(([dx, fh, fwd, ph]) => {
    const cx = fx + dx * k, hh = fh * k * (still ? 1 : 1 + 0.07 * Math.sin(T * 5.2 + ph)), ww = fwd * k, sw = still ? 0 : Math.sin(T * 3.1 + ph) * 3 * k;
    [[1, P.ember], [0.5, HMC]].forEach(([sc, col]) => { const H2 = hh * sc, W2 = ww * sc; x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(cx - W2 / 2, gy); x.bezierCurveTo(cx - W2 * 0.8, gy - H2 * 0.42, cx - W2 * 0.15 + sw, gy - H2 * 0.6, cx + sw, gy - H2); x.bezierCurveTo(cx + W2 * 0.15 + sw, gy - H2 * 0.6, cx + W2 * 0.8, gy - H2 * 0.42, cx + W2 / 2, gy); x.stroke(); });
  });
  /* Harbormaster: a screen on the ground with an aerial, and a radio link to each aircraft in the air */
  if (hm > 0.01) {
    const hx = L.hx, up = (1 - hm) * 8 * k, sw2 = 50 * k, sh = 32 * k, st = gy - 46 * k + up, ax = hx + 36 * k, ay = gy - 64 * k + up;
    x.globalAlpha = hm; x.strokeStyle = HMC; x.fillStyle = P.bg; x.lineWidth = lw;
    s.units.forEach((u, i) => {
      const ph = u.phase === "lost" ? u.was : u.phase; if (u.phase === "down" || ph === "refill") return; const [X, Y] = spots[i], dx = X - ax, dy = Y - ay, d = Math.hypot(dx, dy) || 1, end = (d - 20 * k) / d;
      if (u.phase === "lost") { x.strokeStyle = P.ember; x.setLineDash([2, 5]); /* its link is cut: a short stub left hanging from the aircraft */ const a0 = (d - 21 * k) / d, a1 = (d - 31 * k) / d, cutAt = (d - 38 * k) / d; line(ax + dx * a0, ay + dy * a0, ax + dx * a1, ay + dy * a1); x.setLineDash([]); const mx = ax + dx * cutAt, my = ay + dy * cutAt, e = 4.5 * k; x.lineWidth = lw * 1.3; line(mx - e, my - e, mx + e, my + e); line(mx - e, my + e, mx + e, my - e); x.lineWidth = lw; x.strokeStyle = HMC; return; }
      x.globalAlpha = hm * 0.5; x.setLineDash([2, 5]); line(ax, ay, ax + dx * end, ay + dy * end); x.setLineDash([]);
      if (!still) { const f = (T * 0.45 + u.id * 0.17) % 1; x.globalAlpha = hm * Math.sin(f * Math.PI); x.fillStyle = HMC; x.beginPath(); x.arc(ax + dx * end * f, ay + dy * end * f, 2.2 * k, 0, TAU); x.fill(); x.fillStyle = P.bg; }
      x.globalAlpha = hm;
    });
    x.beginPath(); x.rect(hx - sw2 / 2, st, sw2, sh); x.fill(); x.stroke(); line(hx, st + sh, hx, gy + up); line(hx - 14 * k, gy, hx + 14 * k, gy);
    x.globalAlpha = hm * 0.75; x.lineWidth = Math.max(1, 1.2 * k); [0, 1, 2].forEach((r) => { const ry = st + (8 + r * 8) * k; x.beginPath(); x.arc(hx - 17 * k, ry, 1.6 * k, 0, TAU); x.fillStyle = HMC; x.fill(); line(hx - 11 * k, ry, hx + (r === 1 ? 8 : 16) * k, ry); }); x.fillStyle = P.bg;
    x.globalAlpha = hm; x.lineWidth = lw; line(ax, gy, ax, ay); x.beginPath(); x.arc(ax, ay, 2.6 * k, 0, TAU); x.fillStyle = HMC; x.fill();
    [9, 15].forEach((r, i) => { x.globalAlpha = hm * (still ? 0.6 : 0.3 + 0.5 * ((Math.sin(T * 2.4 - i * 1.1) + 1) / 2)); x.beginPath(); x.arc(ax, ay, r * k, -Math.PI * 0.8, -Math.PI * 0.2); x.stroke(); });
    x.globalAlpha = hm; font(fs, 700); text("Harbormaster", hx + 4 * k, gy + 19 * k, "center", HMC);
    const next = s.units.findIndex((u) => u.phase === "queue" && u.q < 0.4); if (next >= 0) { const [X, Y] = spots[next]; const tf = Math.max(10.5, Math.min(14, 10.5 * k)); font(tf, 700); const t = "Next", tw2 = x.measureText(t).width + tf, tcx = X - 27 * k - tw2 / 2; x.fillStyle = HMC; x.beginPath(); x.rect(tcx - tw2 / 2, Y - tf * 0.8, tw2, tf * 1.6); x.fill(); text(t, tcx, Y + 0.5, "center", P.bg); }
    x.globalAlpha = 1;
  }
  /* the aircraft: two rotors, a body, and a tank underneath that shows the water left */
  s.units.forEach((u, i) => {
    if (u.phase === "down") return; const [X, Y, tilt] = spots[i], gone = u.phase === "lost", col = gone ? P.ember : P.fg, ph = gone ? u.was : u.phase;
    if (u.phase === "spray") { x.strokeStyle = P.water; x.lineWidth = lw; x.setLineDash([2, 6]); x.lineDashOffset = still ? 0 : -T * 30; [-10, 0, 10].forEach((d) => line(X + d * 0.3 * k, Y + 14 * k, X + d * k, gy - 34 * k)); x.setLineDash([]); x.lineDashOffset = 0; }
    x.save(); x.translate(X, Y); x.rotate(tilt || 0); x.strokeStyle = col; x.fillStyle = P.bg; x.lineWidth = lw; if (gone) x.setLineDash([3, 3]);
    line(-15 * k, -3 * k, 15 * k, -3 * k);
    [-15, 15].forEach((rx, j) => { line(rx * k, -3 * k, rx * k, -8 * k); const spin = ph === "refill" && u.t > ROLL ? 0.55 : still || gone ? 0.9 : 0.62 + 0.38 * Math.abs(Math.sin(T * 17 + u.id + j * 1.3)); x.beginPath(); x.ellipse(rx * k, -8.5 * k, 9 * k * spin, 1.7 * k, 0, 0, TAU); x.stroke(); });
    x.beginPath(); x.rect(-7 * k, -7 * k, 14 * k, 8 * k); x.fill(); x.stroke();
    const by = 1 * k, bh = 9 * k, lv = gone ? 0 : Math.min(1, u.tank); x.beginPath(); x.rect(-6 * k, by, 12 * k, bh); x.fill(); if (lv > 0.02) { x.fillStyle = P.water; x.fillRect(-6 * k, by + bh * (1 - lv), 12 * k, bh * lv); } x.stroke();
    x.restore(); x.setLineDash([]);
    if (gone) { font(fs, 700); const half = x.measureText("No signal").width / 2 + 3; text("No signal", Math.max(half, Math.min(w - half, X)), Y - 21 * k, "center", P.ember); }
  });
}
/* The same picture, told as a story: p runs from 0 to 1. Harbormaster arrives a third of the way in, and one aircraft goes quiet two thirds of the way in. Going back up undoes both. */
function scene(c, root) {
  let s = fresh(), T = 1, hm = 0; const P = palette(root || c), still = reduced(); P.bg = cv(c, "--bg", P.bg); /* the story sits straight on the page, with no panel behind it */
  const api = {
    advance(dt) { T += dt; stepBoard(s, dt * SPEED); },
    story(p) { hm = ease((p - 0.27) / 0.1); const lost = s.units.find((u) => u.phase === "lost"); if (p >= 0.66 && !lost) { const u = airborne(s); if (u) cut(s, u); else s.pend = true; if (still) for (let i = 0; i < 220; i++) stepBoard(s, 0.2); } else if (p < 0.6) { s.pend = false; if (lost) uncut(s, lost); } },
    paint() { drawScene(c, s, T, P, { hm, still }); },
  };
  api.paint(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(api.paint);
  return api;
}
function board(root, o) {
  o = o || {}; root.classList.add("bdw", "bdw-board"); let s = fresh();
  root.innerHTML = `<div class="bdw-board__bar"><span><b>Practice run</b></span><span class="bdw-tag--sim">Simulation, ${SPEED}× speed</span></div>
  <div class="bdw-board__map"><canvas role="img" aria-label="Illustration: six aircraft carry water from three refill stations to a fire and come back for more. A ground station named Harbormaster has a radio link to each aircraft in the air."></canvas></div>
  <div class="bdw-board__foot"><p class="bdw-say" data-say aria-live="polite"></p><div class="bdw-btns"><button type="button" class="bdw-btn bdw-btn--primary" data-drop>Cut an aircraft's radio link</button><button type="button" class="bdw-btn" data-confirm disabled>Confirm it has landed</button><button type="button" class="bdw-btn bdw-btn--quiet" data-reset>Start over</button></div></div>`;
  const c = root.querySelector("canvas"), q = (x) => root.querySelector(x), P = palette(root), still = reduced();
  const dom = () => {
    if (q("[data-say]").textContent !== s.say) q("[data-say]").textContent = s.say;
    const lost = s.units.some((u) => u.phase === "lost"), up = s.units.filter((u) => u.phase !== "lost" && u.phase !== "down").length;
    q("[data-drop]").disabled = lost || s.pend || up < 4; q("[data-confirm]").disabled = !lost; q("[data-confirm]").classList.toggle("bdw-btn--primary", lost); q("[data-drop]").classList.toggle("bdw-btn--primary", !lost);
  };
  let T = 1; const paint = () => drawScene(c, s, T, P, { hm: 1, still });
  /* With motion turned off the picture stands still, so each press jumps ahead to show what the press changed. */
  const act = (fn) => () => { fn(); if (still) for (let i = 0; i < 220; i++) stepBoard(s, 0.2); dom(); paint(); };
  q("[data-drop]").onclick = act(() => { const u = airborne(s); if (u) cut(s, u); else { s.pend = true; s.say = "The next aircraft to take off will lose its radio link."; } });
  q("[data-confirm]").onclick = act(() => land(s));
  q("[data-reset]").onclick = () => { s = fresh(); dom(); paint(); };
  dom(); paint(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
  const ro = new ResizeObserver(paint); ro.observe(c);
  const api = { destroy() { ro.disconnect(); } };
  if (still) return api;
  let raf = 0, last = performance.now(), visible = true, acc = 0; const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting)); io.observe(c);
  const loop = (now) => { raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!visible) return; T += dt; stepBoard(s, dt * SPEED); paint(); acc += dt; if (acc > 0.2) { acc = 0; dom(); } };
  raf = requestAnimationFrame(loop); api.destroy = () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  return api;
}

/* Payload interlock: try to turn the water on when it shouldn't be. */
function interlock(root) {
  const EXPIRE = 1500; root.classList.add("bdw", "bdw-lock");
  let s = { armed: false, stream: false, link: true, fault: "", last: 0, valve: false, log: ["Powered up. Water off. Holding the switch at startup doesn't arm it."] };
  root.innerHTML = `<div class="bdw-lock__btns"><span class="bdw-label">Try to break it</span><button type="button" class="bdw-btn bdw-btn--primary" data-a>Arm payload</button><button type="button" class="bdw-btn" data-c>Send water command</button><button type="button" class="bdw-btn" data-l>Drop the link</button><button type="button" class="bdw-btn" data-sf>Sensor goes stale</button><button type="button" class="bdw-btn" data-pf>Press physical stop</button><button type="button" class="bdw-btn" data-r>Reset</button></div>
  <div class="bdw-lock__state"><span class="bdw-label">Water</span><div class="bdw-lock__big" data-v aria-live="polite"></div><div data-rows></div><div class="bdw-log" data-log></div></div>`;
  const q = (x) => root.querySelector(x); const add = (m) => { s.log = [m, ...s.log].slice(0, 5); };
  const dom = () => { const v = q("[data-v]"); v.textContent = s.valve ? "ON" : "OFF"; v.classList.toggle("is-on", s.valve); q("[data-c]").textContent = s.stream ? "Stop water command" : "Send water command"; q("[data-l]").textContent = s.link ? "Drop the link" : "Restore the link";
    const row = (n, val, cls) => `<div class="bdw-lock__row"><span class="bdw-label">${n}</span><span class="${cls || ""}">${val}</span></div>`;
    q("[data-rows]").innerHTML = row("Armed", s.armed ? "Yes" : "No", s.armed ? "is-accent" : "") + row("Link", s.link ? "Up" : "Down", s.link ? "" : "is-bad") + row("Fault", s.fault ? "Latched" : "None", s.fault ? "is-bad" : "") + row("Flight", "Separate from water");
    q("[data-log]").innerHTML = s.log.slice(0, 3).map((m, i) => `<div class="${i ? "" : "is-new"}">${m}</div>`).join(""); };
  const tick = () => { const now = Date.now(), was = s.valve; if (s.stream && s.link && s.armed && !s.fault) s.last = now; const fresh_ = s.last > 0 && now - s.last < EXPIRE; const valve = s.armed && !s.fault && s.stream && fresh_; if (valve !== s.valve) { s.valve = valve; if (was && !valve && !s.fault && s.armed) { s.armed = false; s.stream = false; s.last = 0; add("Command expired. Water off. Arming is required again."); } dom(); } };
  const id = setInterval(tick, 100);
  q("[data-a]").onclick = () => { if (s.fault) add("Arm refused. Clear the fault first."); else if (!s.armed) { s.armed = true; add("Armed by a deliberate action. Water still off."); } dom(); };
  q("[data-c]").onclick = () => { if (s.stream) { s.stream = s.valve = s.armed = false; s.last = 0; add("Command stopped. Water off."); } else if (!s.armed || s.fault) add("Water command ignored. Not armed."); else { s.stream = true; s.last = Date.now(); add("Water command received. Valve open while commands stay fresh."); } tick(); dom(); };
  q("[data-l]").onclick = () => { s.link = !s.link; add(s.link ? "Link restored. Water does not restart on its own." : "Link dropped. Commands have stopped arriving."); dom(); };
  const fault = (m) => { s.fault = m; s.valve = s.armed = s.stream = false; s.last = 0; add(m + " Water off. Fault latched."); dom(); };
  q("[data-sf]").onclick = () => fault("Sensor data went stale."); q("[data-pf]").onclick = () => fault("Physical stop pressed.");
  q("[data-r]").onclick = () => { s.fault = ""; s.valve = s.armed = s.stream = false; s.last = 0; add("Reset. Water stays off until someone arms and commands again."); dom(); };
  dom(); return { destroy() { clearInterval(id); } };
}

/* Small helpers. */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const progress = (el, offset) => { const r = el.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp((-r.top + (offset || 0)) / span, 0, 1) : clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); };
function reveal(sel, cls) { const els = [...document.querySelectorAll(sel || "[data-reveal]")]; if (reduced() || /[?&]qa\b/.test(location.search)) { els.forEach((e) => e.classList.add(cls || "is-in")); return; } const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(cls || "is-in"); io.unobserve(e.target); } }), { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }); els.forEach((e) => io.observe(e)); }
function onScroll(fn) { let t = 0; const r = () => { t = 0; fn(); }; addEventListener("scroll", () => { if (!t) t = requestAnimationFrame(r); }, { passive: true }); addEventListener("resize", r, { passive: true }); fn(); }
function count(el, to, dur) { const n = parseFloat(String(to).replace(/,/g, "")), fmt = (v) => (String(to).includes(",") ? Math.round(v).toLocaleString("en-US") : Math.round(v)); if (reduced() || /[?&]qa\b/.test(location.search)) { el.textContent = fmt(n); return; } const t0 = performance.now(); const go = (now) => { const k = clamp((now - t0) / (dur || 1200), 0, 1); el.textContent = fmt(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(go); }; requestAnimationFrame(go); }
Object.assign(BD, { widgets: { fleet, board, scene, interlock, runFleet }, util: { clamp, progress, reveal, onScroll, count, reduced } });
})();
