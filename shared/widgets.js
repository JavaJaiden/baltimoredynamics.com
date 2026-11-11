/* Interactive pieces shared by every version. Plain DOM, themed entirely through CSS variables and .bdw-* classes (see widgets.css). */
(function () {
"use strict";
window.BD = window.BD || {};
const cv = (el, n, fb) => (getComputedStyle(el).getPropertyValue(n).trim() || fb);
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const palette = (el) => ({ bg: cv(el, "--bd-panel", cv(el, "--bd-bg", "#0a0c0a")), fg: cv(el, "--bd-fg", "#ece6d9"), dim: cv(el, "--bd-dim", "#a8a396"), rule: cv(el, "--bd-rule", "rgba(236,230,217,.2)"), accent: cv(el, "--bd-accent", "#f5b800"), water: cv(el, "--bd-water", "#6fd6c6"), ember: cv(el, "--bd-ember", "#ff5a1f"), land: cv(el, "--bd-land", "rgba(111,214,198,.12)"), wait: cv(el, "--bd-wait", "rgba(128,128,128,.35)"), fly: cv(el, "--bd-fly", cv(el, "--bd-dim", "#8a8678")), mono: cv(el, "--bd-font-mono", "ui-monospace,Menlo,monospace"), sans: cv(el, "--bd-font-body", "system-ui,sans-serif") });

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
const DOING = { out: "Flying to the fire", spray: "Spraying", back: "Flying back", queue: "Waiting", refill: "Refilling", lost: "No signal", down: "Landed" };
const START = "Six aircraft share three refill stations. Each one waits its turn for a free station, and no station is ever given to two aircraft at once.", WATCH = "Watch aircraft 3. It goes in as soon as a station is free.";
const sat = (v) => Math.max(0, Math.min(1, v)), ease = (t) => { const k = sat(t); return k * k * (3 - 2 * k); };
function fresh() {
  /* The model's steady state: an aircraft takes off every 30 seconds and every station has one aircraft in it. */
  const units = [0, 1, 2, 3, 4, 5].map((i) => { const c = 12 + i * 30, phase = c < 24 ? "out" : c < 36 ? "spray" : c < 60 ? "back" : c < 90 ? "queue" : "refill", t = c - { out: 0, spray: 24, back: 36, queue: 60, refill: 90 }[phase]; return { id: i + 1, phase, t, bay: 2 - (i % 3), tank: phase === "out" ? 1 : phase === "refill" ? sat((t - ROLL) / (SVC - ROLL)) : 0, q: phase === "back" ? 1 : 0, from: 0 }; });
  return { units, busy: [6, 5, 4], held: [0, 0, 0], say: START, log: WATCH, pend: false };
}
const airborne = (s) => { const U = s.units; return U.find((u) => u.phase === "out" && u.t > 8 && u.t < OUT - 1) || U.find((u) => u.phase === "back" && u.t < 9) || U.find((u) => u.phase === "spray") || U.find((u) => u.phase === "out" && u.t > 8); };
function cut(s, u) {
  s.pend = false; u.was = u.phase; u.phase = "lost";
  let k = s.busy.findIndex((b, i) => !b && !s.held[i]);
  if (k < 0) { let most = -1; s.units.forEach((v) => { if (v.phase === "refill" && !s.held[v.bay] && v.t > most) { most = v.t; k = v.bay; } }); }
  if (k < 0) k = u.bay;
  s.held[k] = u.id; u.keep = k;
  s.say = `Aircraft ${u.id} has gone quiet. Harbormaster keeps a refill station reserved for it, shown in red. No other aircraft is sent there until a person confirms it has landed.`;
}
function land(s) { const u = s.units.find((v) => v.phase === "lost"); if (!u) return; u.phase = "down"; s.held[u.keep] = 0; s.say = `Aircraft ${u.id} is confirmed on the ground. Its refill station is back in use.`; }
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
  for (const u of U.filter((v) => v.phase === "queue").sort(turn)) { const k = s.busy.findIndex((b, i) => !b && !s.held[i]); if (k < 0) break; s.busy[k] = u.id; u.bay = k; u.phase = "refill"; u.t = 0; u.from = u.q; s.log = `A station is free. Aircraft ${u.id} takes its turn.`; }
  U.filter((v) => v.phase === "queue").sort(turn).concat(U.filter((v) => v.phase === "back").sort(turn)).forEach((u, i) => { u.q += (i - u.q) * (1 - Math.exp(-dt / 2.5)); });
  if (s.pend) { const u = airborne(s); if (u) cut(s, u); }
}
/* Where everything sits for a canvas of w by h. The loop: stations on the left, the fire inside the turn on the right. */
function lay(w, h) {
  const sm = w < 430 || h < 190, pad = sm ? 14 : 22, r = sm ? 9 : 11, box = 2 * r + (sm ? 12 : 14), sp = box + (sm ? 10 : 16), R = Math.max(24, Math.min((h - 2 * (pad + r + 6)) / 2, w * 0.26)), cy = h / 2, bx = [0, 1, 2].map((k) => pad + box / 2 + 2 + k * sp);
  return { sm, r, box, R, cy, yT: cy - R, yB: cy + R, fx: w - pad - R - r - 5, bx, q0: bx[2] + sp * 0.95, qs: 2 * r + (sm ? 10 : 12) };
}
const rnd = (p, c) => { const o = [p[0]]; for (let i = 1; i < p.length - 1; i++) { const [ax, ay] = p[i - 1], [px, py] = p[i], [bx, by] = p[i + 1], da = Math.hypot(ax - px, ay - py) || 1, db = Math.hypot(bx - px, by - py) || 1, ca = Math.min(c, da / 2), cb = Math.min(c, db / 2), A = [px + ((ax - px) / da) * ca, py + ((ay - py) / da) * ca], B = [px + ((bx - px) / db) * cb, py + ((by - py) / db) * cb]; for (let k = 0; k <= 4; k++) { const t = k / 4, m = 1 - t; o.push([m * m * A[0] + 2 * m * t * px + t * t * B[0], m * m * A[1] + 2 * m * t * py + t * t * B[1]]); } } o.push(p[p.length - 1]); return o; };
const along = (p, f) => { const seg = []; let L = 0; for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); seg.push(d); L += d; } let d = sat(f) * L; for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? Math.min(1, d / seg[i]) : 0; return [p[i][0] + (p[i + 1][0] - p[i][0]) * k, p[i][1] + (p[i + 1][1] - p[i][1]) * k]; } d -= seg[i]; } return p[0]; };
function place(u, L) {
  const ph = u.phase === "lost" ? u.was : u.phase, xs = L.q0 + u.q * L.qs, b = L.bx[u.bay], c = L.r + 3;
  if (ph === "out") { const k = sat(u.t / OUT), a = 0.3, v = 1 / (1 - a / 2); return along(rnd([[b, L.cy], [b, L.yT], [L.fx, L.yT]], c), k < a ? (v * k * k) / (2 * a) : v * (a / 2 + k - a)); }
  if (ph === "spray") { const th = -Math.PI / 2 + Math.PI * sat(u.t / SPRAY); return [L.fx + L.R * Math.cos(th), L.cy + L.R * Math.sin(th)]; }
  if (ph === "back") { const k = sat(u.t / BACK); return [L.fx + (xs - L.fx) * k * (2 - k), L.yB]; }
  if (ph === "queue") return [xs, L.yB];
  return along(rnd([[L.q0 + u.from * L.qs, L.yB], [b, L.yB], [b, L.cy]], c), ease(u.t / ROLL));
}
function drawBoard(c, s, T, P) {
  const dpr = Math.min(devicePixelRatio || 1, 3), w = c.clientWidth || 600, h = c.clientHeight || 280; if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const x = c.getContext("2d"), L = lay(w, h), { sm, r, box, R, cy, yT, yB, fx, bx } = L, TAU = Math.PI * 2, cr = r + 3, bs = box / 2, slot = (i) => L.q0 + i * L.qs;
  const font = (px, wt) => { x.font = `${wt || 600} ${px}px ${P.sans}`; }, text = (t, px, py, al, col) => { x.textAlign = al || "left"; x.fillStyle = col || P.dim; x.fillText(t, px, py); };
  const box4 = (px, py, sz, rad) => { x.beginPath(); x.moveTo(px + rad, py); x.arcTo(px + sz, py, px + sz, py + sz, rad); x.arcTo(px + sz, py + sz, px, py + sz, rad); x.arcTo(px, py + sz, px, py, rad); x.arcTo(px, py, px + sz, py, rad); x.closePath(); };
  x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = P.bg; x.fillRect(0, 0, w, h); x.lineCap = "round"; x.lineJoin = "round"; x.textBaseline = "middle";
  const lost = s.units.find((u) => u.phase === "lost");
  /* the track */
  x.strokeStyle = P.fg; x.globalAlpha = 0.26; x.lineWidth = sm ? 2 : 2.5; x.beginPath(); x.moveTo(bx[0] + cr, yT); x.lineTo(fx, yT); x.arc(fx, cy, R, -Math.PI / 2, Math.PI / 2); x.lineTo(bx[0] + cr, yB);
  bx.forEach((b) => { x.moveTo(b + cr, yB); x.arcTo(b, yB, b, yB - cr, cr); x.lineTo(b, yT + cr); x.arcTo(b, yT, b + cr, yT, cr); }); x.stroke();
  /* which way it runs, and where the line forms */
  const mid = (bx[2] + cr + fx) / 2, backX = (slot(2) + r + fx) / 2; x.globalAlpha = 0.6; x.lineWidth = 1.6;
  [[mid, yT, 1], [backX, yB, -1]].forEach(([px, py, d]) => { x.beginPath(); x.moveTo(px - 4 * d, py - 5); x.lineTo(px + 3 * d, py); x.lineTo(px - 4 * d, py + 5); x.stroke(); });
  x.globalAlpha = 1; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(slot(i), yB, r - 1.5, 0, TAU); x.fillStyle = P.bg; x.fill(); x.globalAlpha = 0.3; x.lineWidth = 1.2; x.setLineDash([2, 3]); x.stroke(); x.setLineDash([]); x.globalAlpha = 1; }
  /* labels, all inside the loop */
  font(sm ? 11 : 12.5); const topY = yT + r + 15, botY = yB - r - 13, waitW = x.measureText("Waiting for a turn").width, waitX = slot(0) - r;
  const roomy = R >= 46; if (roomy && !(lost && lost.was === "out")) text(sm ? "To the fire" : "Flying to the fire", mid, topY, "center");
  text("Waiting for a turn", waitX, botY);
  if (roomy && fx - (waitX + waitW) > x.measureText("Flying back").width + 40) text("Flying back", (waitX + waitW + fx) / 2 + 6, botY, "center");
  const refill = sm ? "Refill" : "Refill stations", refX = bx[2] + bs + (sm ? 9 : 12), refEnd = refX + x.measureText(refill).width; text(refill, refX, cy);
  /* the fire */
  const fr = Math.max(8, Math.min(22, R * 0.2)), pulse = (Math.sin(T * 1.7) + 1) / 2; x.strokeStyle = P.ember; x.lineWidth = 1.5;
  [fr, fr * 1.75 + pulse * 2].forEach((rad, i) => { x.globalAlpha = i ? 0.3 + (1 - pulse) * 0.25 : 1; x.beginPath(); x.arc(fx, cy, rad, 0, TAU); x.stroke(); }); x.globalAlpha = 1; x.fillStyle = P.ember; x.beginPath(); x.arc(fx, cy, 4 + pulse, 0, TAU); x.fill();
  font(sm ? 11 : 12.5); const fireX = fx - fr * 1.75 - (sm ? 8 : 11); if (fireX - x.measureText("Fire").width - refEnd > 28) text("Fire", fireX, cy, "right", P.ember); else if (R >= 50) text("Fire", fx, cy + fr * 1.75 + 13, "center", P.ember);
  /* the stations */
  bx.forEach((b, k) => {
    const hd = s.held[k]; x.fillStyle = P.bg; box4(b - bs, cy - bs, box, 7); x.fill();
    if (hd) { x.save(); box4(b - bs, cy - bs, box, 7); x.clip(); x.strokeStyle = P.ember; x.globalAlpha = 0.34; x.lineWidth = 1; x.beginPath(); for (let d = -box; d < box; d += 6) { x.moveTo(b - bs + d, cy + bs); x.lineTo(b - bs + d + box, cy - bs); } x.stroke(); x.restore(); }
    x.globalAlpha = hd ? 1 : 0.75; x.strokeStyle = hd ? P.ember : P.fg; x.lineWidth = hd ? 2 : 1.5; if (hd) x.setLineDash([5, 4]); box4(b - bs, cy - bs, box, 7); x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
    if (hd && !s.busy[k]) { x.beginPath(); x.arc(b, cy, r, 0, TAU); x.fillStyle = P.bg; x.fill(); x.strokeStyle = P.ember; x.lineWidth = 1.6; x.setLineDash([3, 3]); x.stroke(); x.setLineDash([]); font(sm ? 11 : 12.5, 800); text(String(hd), b, cy + 0.5, "center", P.ember); }
  });
  /* the aircraft */
  const dots = s.units.filter((u) => u.phase !== "down").sort((a, b) => (b.phase === "lost") - (a.phase === "lost"));
  dots.forEach((u) => {
    const [X, Y] = place(u, L), gone = u.phase === "lost";
    if (u.phase === "spray") { const dx = fx - X, dy = cy - Y, d = Math.hypot(dx, dy) || 1, a = r + 7, b = d - fr * 1.75 - 4; if (b > a) { x.strokeStyle = P.water; x.lineWidth = 2; x.setLineDash([2, 6]); x.lineDashOffset = -T * 26; x.beginPath(); x.moveTo(X + (dx / d) * a, Y + (dy / d) * a); x.lineTo(X + (dx / d) * b, Y + (dy / d) * b); x.stroke(); x.setLineDash([]); x.lineDashOffset = 0; } }
    if (gone) {
      const beat = (Math.sin(T * 2.4) + 1) / 2; x.strokeStyle = P.ember; x.globalAlpha = 0.18 + beat * 0.3; x.lineWidth = 1.5; x.beginPath(); x.arc(X, Y, r + 5 + beat * 2, 0, TAU); x.stroke(); x.globalAlpha = 1;
      x.beginPath(); x.arc(X, Y, r, 0, TAU); x.fillStyle = P.bg; x.fill(); x.lineWidth = 2; x.setLineDash([3, 3]); x.stroke(); x.setLineDash([]);
      font(sm ? 11 : 12.5, 800); text(String(u.id), X, Y + 0.5, "center", P.ember);
      if (u.was !== "spray") { font(sm ? 11 : 12.5); const tw = x.measureText("No signal").width / 2 + 4; text("No signal", Math.max(tw, Math.min(w - tw, X)), u.was === "out" ? Y + r + 15 : Y + r + 12, "center", P.ember); }
      return;
    }
    x.lineWidth = 2.5; x.strokeStyle = P.fg; x.globalAlpha = 0.18; x.beginPath(); x.arc(X, Y, r + 3.5, 0, TAU); x.stroke(); x.globalAlpha = 1;
    if (u.tank > 0.01) { x.strokeStyle = P.water; x.beginPath(); x.arc(X, Y, r + 3.5, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, u.tank)); x.stroke(); }
    x.beginPath(); x.arc(X, Y, r, 0, TAU); x.fillStyle = P.fg; x.fill(); font(sm ? 11 : 12.5, 800); text(String(u.id), X, Y + 0.5, "center", P.bg);
  });
}
function board(root, o) {
  o = o || {}; root.classList.add("bdw", "bdw-board"); let s = fresh();
  root.innerHTML = `<div class="bdw-board__bar"><span>Harbormaster <b>Practice run</b></span><span class="bdw-tag--sim">Simulation, ${SPEED}× speed</span></div>
  <div class="bdw-board__map"><canvas role="img" aria-label="Diagram: six numbered aircraft loop from three refill stations to a fire and back. The list below says what each one is doing."></canvas></div>
  <ul class="bdw-board__list">${s.units.map((u) => `<li class="bdw-ac"><i class="bdw-dot" aria-hidden="true"><b>${u.id}</b></i><span><span class="bdw-sr">Aircraft ${u.id}: </span><span data-st></span></span></li>`).join("")}</ul>
  <div class="bdw-board__foot"><p class="bdw-say" data-say></p><p class="bdw-log" data-log></p><div class="bdw-btns"><button type="button" class="bdw-btn bdw-btn--primary" data-drop>Cut an aircraft's radio link</button><button type="button" class="bdw-btn" data-confirm disabled>Confirm it has landed</button><button type="button" class="bdw-btn bdw-btn--quiet" data-reset>Start over</button></div><p class="bdw-sr" data-live aria-live="polite"></p></div>`;
  const c = root.querySelector("canvas"), q = (x) => root.querySelector(x), cells = [...root.querySelectorAll(".bdw-ac")], P = palette(root), still = reduced();
  const put = (el, t) => { if (el.textContent !== t) el.textContent = t; };
  const dom = () => {
    s.units.forEach((u, i) => { const el = cells[i]; put(el.querySelector("[data-st]"), DOING[u.phase]); el.classList.toggle("is-lost", u.phase === "lost"); el.classList.toggle("is-down", u.phase === "down"); el.firstElementChild.style.setProperty("--lv", u.phase === "lost" || u.phase === "down" ? 0 : u.tank.toFixed(2)); });
    put(q("[data-say]"), s.say); put(q("[data-log]"), s.log);
    const lost = s.units.some((u) => u.phase === "lost"), up = s.units.filter((u) => u.phase !== "lost" && u.phase !== "down").length;
    q("[data-drop]").disabled = lost || s.pend || up < 4; q("[data-confirm]").disabled = !lost; q("[data-confirm]").classList.toggle("bdw-btn--primary", lost); q("[data-drop]").classList.toggle("bdw-btn--primary", !lost);
  };
  let T = 1; const paint = () => drawBoard(c, s, T, P);
  /* With motion turned off the picture stands still, so each press jumps ahead to show what the press changed. */
  const act = (fn) => () => { fn(); if (still) for (let i = 0; i < 220; i++) stepBoard(s, 0.2); dom(); paint(); q("[data-live]").textContent = s.say; };
  q("[data-drop]").onclick = act(() => { const u = airborne(s); if (u) cut(s, u); else { s.pend = true; s.say = "The next aircraft to take off will lose its radio link."; } });
  q("[data-confirm]").onclick = act(() => land(s));
  q("[data-reset]").onclick = () => { s = fresh(); dom(); paint(); q("[data-live]").textContent = "Started over."; };
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
Object.assign(BD, { widgets: { fleet, board, interlock, runFleet }, util: { clamp, progress, reveal, onScroll, count, reduced } });
})();
