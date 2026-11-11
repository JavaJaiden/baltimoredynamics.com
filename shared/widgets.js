/* Interactive pieces shared by every version. Plain DOM, themed entirely through CSS variables and .bdw-* classes (see widgets.css). */
(function () {
"use strict";
window.BD = window.BD || {};
const cv = (el, n, fb) => (getComputedStyle(el).getPropertyValue(n).trim() || fb);
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const palette = (el) => ({ bg: cv(el, "--bd-panel", cv(el, "--bd-bg", "#0a0c0a")), fg: cv(el, "--bd-fg", "#ece6d9"), dim: cv(el, "--bd-dim", "#a8a396"), rule: cv(el, "--bd-rule", "rgba(236,230,217,.2)"), accent: cv(el, "--bd-accent", "#f5b800"), water: cv(el, "--bd-water", "#6fd6c6"), ember: cv(el, "--bd-ember", "#ff5a1f"), land: cv(el, "--bd-land", "rgba(111,214,198,.12)"), wait: cv(el, "--bd-wait", "rgba(128,128,128,.35)"), fly: cv(el, "--bd-fly", cv(el, "--bd-dim", "#8a8678")), mono: cv(el, "--bd-font-mono", "ui-monospace,Menlo,monospace") });

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

/* Harbormaster board: canvas map plus roster with the reservation-hold rule. */
const OUT = 24, SPRAY = 12, BACK = 24, SVC = 90, SPEED = 6;
const STATIONS = [{ x: 0.17, y: 0.72, name: "S1" }, { x: 0.3, y: 0.24, name: "S2" }], FIRE = { x: 0.66, y: 0.42 };
const NAMES = { out: "Outbound", spray: "Applying", back: "Returning", queue: "Waiting", refill: "Refilling", lost: "Link lost", grounded: "Grounded" };
const ease = (t) => { const k = Math.max(0, Math.min(1, t)); return k * k * (3 - 2 * k); };
function fresh() { return { units: [0, 1, 2, 3, 4, 5].map((i) => ({ id: "A" + (i + 1), phase: "out", t: -i * 4, home: i % 2, tank: 1, x: 0, y: 0 })), busy: [null, null], held: [null, null], litres: 0, log: ["Board live. 6 aircraft, 2 refill stations."] }; }
const say = (s, m) => { s.log.unshift(m); s.log.length = Math.min(s.log.length, 6); };
function stepBoard(s, dt) {
  s.units.forEach((u, i) => {
    if (u.phase === "lost" || u.phase === "grounded") return; u.t += dt;
    if (u.phase === "out" && u.t >= OUT) { u.phase = "spray"; u.t = 0; }
    else if (u.phase === "spray") { u.tank = Math.max(0, 1 - u.t / SPRAY); s.litres += dt * FLOW; if (u.t >= SPRAY) { u.phase = "back"; u.t = 0; u.tank = 0; } }
    else if (u.phase === "back" && u.t >= BACK) { u.phase = "queue"; u.t = 0; }
    else if (u.phase === "queue") { const free = [0, 1].find((k) => !s.busy[k] && !s.held[k]); if (free !== undefined) { s.busy[free] = u.id; u.home = free; u.phase = "refill"; u.t = 0; say(s, u.id + " assigned to " + STATIONS[free].name + "."); } }
    else if (u.phase === "refill") { u.tank = Math.min(1, u.t / SVC); if (u.t >= SVC) { u.phase = "out"; u.t = 0; u.tank = 1; s.busy[u.home] = null; } }
    const h = STATIONS[u.home], a = (i / 6) * Math.PI * 2, tx = FIRE.x + Math.cos(a) * 0.055, ty = FIRE.y + Math.sin(a) * 0.075;
    if (u.phase === "out") { const k = ease(u.t / OUT); u.x = h.x + (tx - h.x) * k; u.y = h.y + (ty - h.y) * k; } else if (u.phase === "spray") { u.x = tx; u.y = ty; } else if (u.phase === "back") { const k = ease(u.t / BACK); u.x = tx + (h.x - tx) * k; u.y = ty + (h.y - ty) * k; } else { u.x = h.x + Math.cos(a) * 0.02; u.y = h.y + Math.sin(a) * 0.03; }
  });
}
function drawBoard(c, s, t, P) {
  const dpr = Math.min(devicePixelRatio || 1, 2), w = c.clientWidth || 600, h = c.clientHeight || 400; if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = P.bg; x.fillRect(0, 0, w, h);
  x.fillStyle = P.land; x.beginPath(); x.moveTo(w * 0.62, h); x.bezierCurveTo(w * 0.7, h * 0.82, w * 0.78, h * 0.76, w * 0.86, h * 0.72); x.bezierCurveTo(w * 0.93, h * 0.68, w, h * 0.62, w, h * 0.55); x.lineTo(w, h); x.closePath(); x.fill();
  x.strokeStyle = P.rule; x.globalAlpha = 0.45; x.lineWidth = 1; for (let i = 1; i < 26; i++) { const px = (w / 26) * i; x.beginPath(); x.moveTo(px, 0); x.lineTo(px - h * 0.08, h); x.stroke(); } for (let i = 1; i < 16; i++) { const py = (h / 16) * i; x.beginPath(); x.moveTo(0, py); x.lineTo(w, py + w * 0.03); x.stroke(); } x.globalAlpha = 1;
  const px = (u) => u.x * w, py = (u) => u.y * h;
  x.setLineDash([3, 5]); x.strokeStyle = P.accent; x.globalAlpha = 0.55; STATIONS.forEach((st) => { x.beginPath(); x.moveTo(px(st), py(st)); x.lineTo(px(FIRE), py(FIRE)); x.stroke(); }); x.setLineDash([]); x.globalAlpha = 1;
  const pulse = (Math.sin(t * 3) + 1) / 2; x.strokeStyle = P.ember; [0.09, 0.13 + pulse * 0.02].forEach((r, i) => { x.globalAlpha = i ? 0.45 : 1; x.beginPath(); x.ellipse(px(FIRE), py(FIRE), r * w * 0.8, r * h, 0, 0, 7); x.stroke(); }); x.globalAlpha = 1; x.fillStyle = P.ember; x.beginPath(); x.arc(px(FIRE), py(FIRE), 4 + pulse * 2, 0, 7); x.fill();
  x.font = "12px " + P.mono; x.textBaseline = "middle";
  const placed = [], lab = (txt, lx, ly) => { const tw = x.measureText(txt).width; let yy = ly, n = 0; while (n++ < 7 && placed.some((r) => lx < r[0] + r[2] + 4 && lx + tw + 4 > r[0] && Math.abs(yy - r[1]) < 13)) yy += 13; placed.push([lx, yy, tw]); x.fillText(txt, lx, yy); };
  STATIONS.forEach((st, i) => { const on = s.held[i], C = on ? P.ember : P.accent; x.strokeStyle = C; x.globalAlpha = 0.2; x.fillStyle = C; x.fillRect(px(st) - 11, py(st) - 11, 22, 22); x.globalAlpha = 1; x.strokeRect(px(st) - 11, py(st) - 11, 22, 22); lab(st.name + (on ? " HELD" : ""), px(st) + 16, py(st)); });
  s.units.forEach((u) => { if (u.phase === "grounded") return; const lost = u.phase === "lost", X = px(u), Y = py(u); x.strokeStyle = lost ? P.ember : P.accent; x.lineWidth = 1.6; x.beginPath(); x.moveTo(X - 6, Y - 6); x.lineTo(X + 6, Y + 6); x.moveTo(X + 6, Y - 6); x.lineTo(X - 6, Y + 6); x.stroke(); x.lineWidth = 1; [[-6, -6], [6, 6], [6, -6], [-6, 6]].forEach((o) => { x.beginPath(); x.arc(X + o[0], Y + o[1], 3, 0, 7); x.stroke(); }); x.fillStyle = lost ? P.ember : P.fg; lab(u.id, X + 12, Y - 8); if (u.phase === "spray") { x.strokeStyle = P.water; x.beginPath(); x.moveTo(X, Y); x.lineTo(px(FIRE), py(FIRE)); x.stroke(); } });
}
function board(root, o) {
  o = o || {}; root.classList.add("bdw", "bdw-board"); let s = fresh();
  root.innerHTML = `<div class="bdw-board__bar"><span>Harbormaster board <b>Sector: Demo</b></span><span class="bdw-tag--sim">Illustrative scenario, time ×${SPEED}</span></div>
  <div class="bdw-board__main"><div class="bdw-board__map"><canvas role="img" aria-label="Map of aircraft moving between two refill stations and a fire"></canvas></div><div class="bdw-board__roster"><div class="bdw-label bdw-board__rh"><span>Unit</span><span>State</span><span>Tank</span></div><div data-rows></div><div class="bdw-label bdw-board__rel">Released <b data-rel></b></div></div></div>
  <div class="bdw-board__foot"><div class="bdw-btns"><button type="button" class="bdw-btn bdw-btn--primary" data-drop>Drop an aircraft's link</button><button type="button" class="bdw-btn" data-confirm disabled>Confirm it's grounded</button><button type="button" class="bdw-btn" data-reset>Reset</button></div><div class="bdw-log" data-log aria-live="polite"></div></div>`;
  const c = root.querySelector("canvas"), q = (x) => root.querySelector(x), rows = q("[data-rows]"), P = palette(root);
  const dom = () => {
    rows.innerHTML = s.units.map((u) => `<div class="bdw-board__row${u.phase === "lost" ? " is-lost" : ""}"><span>${u.id}</span><span>${NAMES[u.phase]}</span><span>${Math.round(u.tank * 100)}%</span></div>`).join("");
    q("[data-rel]").textContent = s.litres.toFixed(0) + " L"; q("[data-log]").innerHTML = s.log.slice(0, 3).map((m, i) => `<div class="${i ? "" : "is-new"}">${m}</div>`).join("");
    const lost = s.units.find((u) => u.phase === "lost"); q("[data-drop]").disabled = !!lost; q("[data-confirm]").disabled = !lost; q("[data-confirm]").classList.toggle("bdw-btn--primary", !!lost); q("[data-drop]").classList.toggle("bdw-btn--primary", !lost);
  };
  const warm = () => { stepBoard(s, 0.01); for (let i = 0; i < 300; i++) stepBoard(s, 0.4); s.log = ["Board live. 6 aircraft, 2 refill stations."]; };
  warm();
  q("[data-drop]").onclick = () => { const u = s.units.find((k) => k.phase === "out" || k.phase === "spray" || k.phase === "back") || s.units.find((k) => k.phase === "refill" || k.phase === "queue"); if (!u) return; const st = u.home; if (s.busy[st] === u.id) s.busy[st] = null; u.phase = "lost"; u.t = 0; s.held[st] = u.id; say(s, u.id + " link lost. Zone and " + STATIONS[st].name + " stay reserved until someone confirms it's down."); dom(); };
  q("[data-confirm]").onclick = () => { const lost = s.units.find((u) => u.phase === "lost"); if (!lost) return; lost.phase = "grounded"; const k = s.held.indexOf(lost.id); if (k >= 0) s.held[k] = null; say(s, lost.id + " confirmed on the ground by operator. Reservation released."); dom(); };
  q("[data-reset]").onclick = () => { s = fresh(); warm(); dom(); };
  dom(); drawBoard(c, s, 1, P);
  const api = { destroy() {} };
  if (reduced()) { new ResizeObserver(() => drawBoard(c, s, 1, palette(root))).observe(c); return api; }
  let raf = 0, last = performance.now(), visible = true, acc = 0, T = 0; const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting)); io.observe(c);
  const loop = (now) => { raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!visible) return; T += dt; stepBoard(s, dt * SPEED); drawBoard(c, s, T, P); acc += dt; if (acc > 0.25) { acc = 0; dom(); } };
  raf = requestAnimationFrame(loop); api.destroy = () => { cancelAnimationFrame(raf); io.disconnect(); };
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
