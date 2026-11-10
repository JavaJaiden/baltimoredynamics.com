/* m01 Line Map. One map, twelve stops, every stop its own screen. */
(() => {
const C = BD.content, ch = C.chapters, O = C.origin, DZ = O.deadZone, TW = O.trashWheel, AE = C.aesv, HM = C.harbormaster, ST = C.status, PE = C.people;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sys = (id) => C.systems.items.find((m) => m.id === id);
const IMG = { tyler: [720, 912], dom: [522, 800], sophia: [800, 800], eyobed: [800, 800], mike: [200, 200], duck: [700, 934], dinghy: [747, 420], yacht: [558, 420], jar: [1100, 1754], bench: [1600, 1204], sensor: [1600, 2126], flagwall: [560, 420], nightdesk: [560, 420], aesv: [1200, 1706], mtw: [1600, 1066] };
const TAGS = { Designed: 'des', Simulated: 'sim', Calculated: 'cal', Target: 'tar', 'Software tested': 'sof', Next: 'nxt', 'Design rule': 'rul', Illustration: 'ill' };
const tag = (t) => `<span class="tag t-${TAGS[t] || 'rul'}">${t}</span>`;
const photo = (n, alt, cls = '') => `<img class="${cls}" src="${BD.img(n)}" width="${IMG[n][0]}" height="${IMG[n][1]}" alt="${alt}" loading="lazy">`;
const cut = (n, w, h, alt) => `<img src="shared/cut/${n}-linework.webp" width="${w}" height="${h}" alt="${alt}" loading="lazy">`;
const still = (n, alt) => `<img class="fill" src="shared/still/${n}.jpg" width="1600" height="1000" alt="${alt}" loading="lazy">`;
const pic = (html, t, cap) => `<figure class="pic${cap ? ' withcap' : ''}">${html}${t || cap ? `<figcaption>${t ? tag(t) : ''}${cap ? `<span>${cap}</span>` : ''}</figcaption>` : ''}</figure>`;
const sub = (t) => `<p class="sub">${t}</p>`;
const more = (label, html) => `<details class="more"><summary>${label}</summary><div>${html}</div></details>`;
const li = (t) => `<li>${t}</li>`;

/* Mounted once and moved between tabs, so their timers never stack up. */
const WID = {};
const widget = (name) => (r) => { const host = $('.wid', r); if (!WID[name]) { WID[name] = document.createElement('div'); host.append(WID[name]); BD.widgets[name](WID[name]); } else host.append(WID[name]); };

let BAY = '';
const paintBay = async (r) => {
  const w = $('.baysvg', r); if (!w) return;
  if (!BAY) BAY = await fetch('shared/map/bay-contours.svg').then((x) => x.text()).catch(() => '');
  if (!BAY || !w.isConnected) return;
  w.innerHTML = BAY;
  const s = w.firstElementChild; s.removeAttribute('stroke'); s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  s.insertAdjacentHTML('afterbegin', '<defs><pattern id="hx" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#ffb300" fill-opacity=".3"/><line x1="0" y1="0" x2="0" y2="5" stroke="#ffb300" stroke-width="1"/></pattern></defs>');
  s.insertAdjacentHTML('beforeend', '<path class="o2" d="M322 196c8 15 14 37 17 60 4 26 5 54 2 81-3 29-9 56-19 79-8 16-18 20-26 12-8-11-9-33-8-56 1-30 6-57 8-87 2-26 0-54 6-75 4-14 13-28 20-14z"/>');
};

function machine(id, l, c, line1, over, scene, exp) {
  const m = sys(id), st = c.label;
  return { id, l, name: m.name, place: m.role, line: c.title, tabs: [
    { t: 'Overview', left: sub(line1), right: pic(over, st) },
    { t: 'How it works', left: `<ol class="steps">${m.steps.map(li).join('')}</ol>`, right: pic(scene, st) },
    { t: 'Specs', left: `<table class="specs"><tbody>${m.specs.map(([a, b, t]) => `<tr><th scope="row">${a}</th><td>${b}</td><td>${tag(t)}</td></tr>`).join('')}</tbody></table>${more('Engineering note', `<p>${m.body}</p>`)}`, right: pic(exp, st) },
    { t: 'Still to prove', left: sub(m.prove), right: pic(over, st) },
  ] };
}

const BAYPIC = `<figure class="pic bay" role="img" aria-label="Contour map of the Chesapeake Bay from NOAA depth data with an illustrative low-oxygen area in the middle of the Bay"><div class="baysvg"></div><figcaption>${tag('Illustration')}</figcaption></figure>`;
const WHEEL = `<figure class="pano"><div class="stage">${photo('mtw', TW.photo.alt)}<span class="eye l" aria-hidden="true"><b></b></span><span class="eye r" aria-hidden="true"><b></b></span></div><figcaption>Mr. Trash Wheel, Inner Harbor. <a href="${TW.photo.href}" rel="noopener">Photo: Matthew Bellemare, CC BY-SA 2.0.</a> Cropped, converted to black and white, moving eyes added on this site.</figcaption></figure>`;

const STOPS = [
  { id: 'wheel', l: 'w', name: 'Mr. Trash Wheel', place: ch[0].place, line: ch[0].title, tabs: [{ left: sub('Mr. Trash Wheel backs our work. We helped directly on its mission to clean the harbor.'), right: WHEEL }] },
  { id: 'boat', l: 'w', name: 'The Boat', place: ch[1].place, line: ch[1].title, tabs: [
    { t: 'Overview', left: sub('Sophia Roberts-Weigert led the boat work. Mike Kardas ran the lab and put it on the water.'), right: pic(cut('yacht-3q', 1239, 1063, 'Rendering of the boat that became the floating workshop')) },
    { t: 'On the water', left: `<ul class="rows">${ch[1].callouts.map((c) => `<li><b>${c.name}</b><span>${c.text}</span></li>`).join('')}</ul>`, right: pic(cut('zodiac-3q', 1329, 869, 'Rendering of the AESV inflatable test hull')) },
    { t: 'The hull', left: `<p class="lab">${AE.title}</p><ul class="rows tight">${AE.parts.map(li).join('')}</ul><p class="lab">${tag(AE.label)} ${AE.cap}</p>`, right: pic(photo('aesv', O.photo.alt), '', O.photo.cap) },
  ] },
  { id: 'bay', l: 'w', name: 'The Bay', place: ch[2].place, line: ch[2].title, tabs: [
    { t: 'Overview', left: sub('Our first machines were built to find those places before they spread.') + `<p class="fine">${ch[2].note}</p>`, right: BAYPIC, after: paintBay },
    { t: 'What a dead zone is', left: sub('Fertilizer and stormwater runoff feed algae blooms. When the algae die, bacteria use up the oxygen in the water and fish can\'t stay.'), right: `<dl class="big">${DZ.stats.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>` },
  ] },
  machine('rover', 'r', ch[3], 'A tethered crawler for the pipes under the city.', still('pipe-mono', 'Rendering of FALLSWAY-R inside a brick pipe'), cut('rover-3q', 1127, 435, 'Rendering of FALLSWAY-R on its tether'), cut('rover-exploded', 1329, 561, 'Exploded rendering of FALLSWAY-R')),
  machine('swarm', 'n', ch[4], 'A supervised swarm of small aircraft for exterior fires near homes.', cut('swarm-3q', 1749, 817, 'Rendering of a SWARM-N aircraft'), still('street-mono', 'Simulated scene of SWARM-N aircraft at a rowhouse fire'), cut('swarm-exploded', 1815, 1167, 'Exploded rendering of a SWARM-N aircraft')),
  machine('overhead', 'h', ch[5], 'The pump and the water stay on the ground.', cut('overhead-3q', 813, 1233, 'Rendering of OVERHEAD-H holding a hose'), still('tank-fire-mono', 'Simulated scene of OVERHEAD-H at a tank fire'), cut('overhead-exploded', 817, 1401, 'Exploded rendering of OVERHEAD-H')),
  { id: 'harbormaster', l: 't', all: 1, wide: 1, name: 'Harbormaster', place: 'Fleet software', line: HM.title, tabs: [
    { t: 'Board', left: sub('Lose contact with an aircraft and its refill station stays reserved until a person confirms it\'s down.'), right: '<div class="wid"></div>', after: widget('board') },
    { t: 'Fleet', left: sub(HM.fleet.body), right: '<div class="wid"></div>', after: widget('fleet') },
    { t: 'Interlock', left: sub('Try to turn the water on when it shouldn\'t be. It runs here in the browser and isn\'t connected to any hardware.'), right: '<div class="wid"></div>', after: widget('interlock') },
    { t: 'Rules', left: sub('Assigns aircraft, pilots, zones and refill stations so nothing gets booked twice.'), right: `<ul class="rules">${HM.pillars.map(([t, b]) => `<li><h2>${t}</h2><p>${b}</p></li>`).join('')}</ul>` },
  ] },
  { id: 'status', l: 't', wide: 1, name: 'Status', place: 'Where things stand', line: ST.title, tabs: [
    { t: 'Today', left: sub('The rest of this site shows where we\'re going. This table shows where we are.'), right: `<table class="dep"><caption class="vh">What exists today</caption><thead class="vh"><tr><th scope="col">Item</th><th scope="col">Detail</th><th scope="col">Status</th></tr></thead><tbody>${ST.rows.map(([a, b, t]) => `<tr><th scope="row">${a}</th><td>${b}</td><td>${tag(t)}</td></tr>`).join('')}</tbody></table>` },
    { t: 'Numbers', right: `<dl class="big four">${ST.stats.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>` },
    { t: 'Next gates', left: sub(ST.gatesTitle), right: `<ol class="rules three">${ST.gates.map(([g, t, b]) => `<li><p class="lab">${g}</p><h2>${t}</h2><p>${b}</p></li>`).join('')}</ol>` },
  ] },
  { id: 'crew', l: 't', wide: 1, name: 'Crew', place: 'Station staff', crew: 1 },
  { id: 'origin', l: 't', wide: 1, name: 'Origin', place: 'How we got here', line: O.title, tabs: [
    { t: 'Timeline', left: sub('Baltimore Dynamics grew out of the Northrop Grumman Innovation Lab at the University of Maryland. Northrop Grumman backs the company.'), right: `<ol class="tt">${O.timeline.map(([d, t, b], i) => `<li class="${i === O.timeline.length - 1 ? 'on' : ''}"><button type="button"><time>${d}</time><b>${t}</b></button><p>${b}</p></li>`).join('')}</ol>`, after: (r) => $$('.tt button', r).forEach((b) => b.addEventListener('click', () => { $$('.tt li', r).forEach((x) => x.classList.remove('on')); b.parentNode.classList.add('on'); })) },
    { t: 'The story', right: `<div class="prose">${O.paras.map((p) => `<p>${p}</p>`).join('')}</div>` },
  ] },
  { id: 'log', l: 't', wide: 1, name: 'Field log', place: 'Real photographs', line: C.log.title, log: 1 },
  { id: 'contact', l: 't', name: 'Contact', place: C.contact.place, line: C.contact.title, tabs: [{ left: sub(C.contact.body), right: `<div class="legal"><span class="mk">${C.brand.mark}</span><p>${C.legal}</p><p>${C.credit}</p><p>Transit map styling is a format only. This company operates no transit service and uses no agency's marks.</p></div>` }] },
];
const num = (i) => String(i + 1).padStart(2, '0');
const hd = $('#hd'), view = $('#view'), root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LINE = C.hero.line1 + ' ' + C.hero.line2;

/* ---------- the map ---------- */
const XY = { wheel: [170, 190], boat: [430, 190], bay: [690, 190], rover: [520, 350], swarm: [520, 430], overhead: [520, 510], harbormaster: [980, 430], status: [1180, 430], crew: [1335, 430], origin: [1180, 240], log: [1335, 620], contact: [1500, 430] };
const LB = { wheel: [146, 146, 'start'], boat: [406, 146, 'start'], bay: [666, 146, 'start'], rover: [484, 361, 'end'], swarm: [484, 441, 'end'], overhead: [484, 521, 'end'], harbormaster: [918, 546, 'start'], status: [1180, 500, 'middle'], crew: [1335, 382, 'middle'], origin: [1216, 251, 'start'], log: [1371, 631, 'start'], contact: [1500, 378, 'middle'] };
const LP = { w: 'M170 190H740L980 430', r: 'M520 350H900L980 430', n: 'M520 430H980', h: 'M520 510H900L980 430' };
function mapSVG() {
  const train = (k, d, dur, b) => reduced ? '' : `<circle r="7" fill="#fff"><animateMotion dur="${dur}s" begin="-${b}s" repeatCount="indefinite" path="${d}H1500"/></circle>`;
  const nodes = STOPS.map((s, i) => { const [x, y] = XY[s.id], [lx, ly, a] = LB[s.id], hm = s.id === 'harbormaster', end = s.id === 'contact';
    return `<a class="st st-${s.l}" href="#${s.id}" data-i="${i}" aria-label="Stop ${i + 1}, ${s.name}">${hm ? `<rect class="ring" x="${x - 27}" y="${y - 50}" width="54" height="100" rx="27"/>` : `${end ? `<circle class="halo" cx="${x}" cy="${y}" r="34"/>` : ''}<circle class="ring" cx="${x}" cy="${y}" r="25"/>`}<text class="no" x="${x}" y="${y + 7}" text-anchor="middle">${num(i)}</text><text class="nm${hm ? ' big' : ''}" x="${lx}" y="${ly}" text-anchor="${a}">${s.name}</text></a>`; }).join('');
  return `<svg class="mp" viewBox="0 0 1600 820" preserveAspectRatio="xMidYMid meet" role="group" aria-label="BD Line map">
  <g class="eyes" aria-hidden="true"><circle cx="52" cy="190" r="29"/><circle cx="114" cy="190" r="29"/><circle class="pu" cx="52" cy="190" r="13"/><circle class="pu" cx="114" cy="190" r="13"/></g>
  <g class="ln ln-w"><path d="${LP.w}" stroke="var(--w)"/></g>
  <g class="ln ln-r"><path d="${LP.r}" stroke="var(--r)"/><path class="core" d="${LP.r}" stroke="var(--bg)"/></g>
  <g class="ln ln-n"><path d="${LP.n}" stroke="var(--n)" stroke-dasharray="28 13"/></g>
  <g class="ln ln-h"><path d="${LP.h}" stroke="var(--h)" stroke-dasharray="28 13"/></g>
  <g class="tr"><path d="M980 421H1500" stroke="var(--w)"/><path d="M980 427H1500" stroke="var(--r)"/><path d="M980 433H1500" stroke="var(--n)"/><path d="M980 439H1500" stroke="var(--h)"/></g>
  <g class="spur"><path d="M1180 430V240"/><path d="M1335 430V620"/></g>
  ${train('w', LP.w, 13, 0)}${train('r', LP.r, 11, 3)}${train('n', LP.n, 10, 5)}${train('h', LP.h, 11, 8)}
  ${nodes}</svg>`;
}
const LIST = () => `<ol class="lst">${STOPS.map((s, i) => `<li class="l-${s.l}"><a href="#${s.id}"><i>${num(i)}</i><b>${s.name}</b><span aria-hidden="true">→</span></a></li>`).join('')}</ol>`;

/* ---------- the ride: the line drawn down the home page, one screen per stop ---------- */
const PEOPLE = [{ ...PE.lead, name: 'Tyler “Duck” Duckett' }, ...PE.crew];
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = (t) => { t = clamp01(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const QA = root.classList.contains('qa');
const narrow = () => innerWidth <= 860;
const BACKERS = [
  { name: 'Northrop Grumman', href: 'https://www.northropgrumman.com/', src: 'shared/logos/northrop-grumman.svg', w: 1010, h: 231, cls: 'ng' },
  { name: 'Mr. Trash Wheel', href: 'https://www.mrtrashwheel.com/', src: 'shared/logos/mr-trash-wheel.webp', w: 440, h: 120, cls: 'mtw' },
];
const BACKED = `<div class="bk"><span>Backed by</span>${BACKERS.map((b) => `<a class="bk-${b.cls}" href="${b.href}" target="_blank" rel="noopener"><img src="${b.src}" width="${b.w}" height="${b.h}" alt="${b.name}"><span class="vh"> (opens their website)</span></a>`).join('')}</div>`;

/* The dead zone, as Noir drew it: runoff, bloom, die-off, the fish leave, then the boat comes to measure. */
const DZSTEPS = ['Fertilizer and stormwater runoff feed algae blooms.', 'When the algae die, bacteria use up the oxygen in the water and fish can\'t stay.', 'Our first machines were built to find those places before they spread: a boat that could hold its position against the current, sensors that didn\'t need a person standing over them, and a record that scientists could check.'];
const DZBG = '<canvas class="dzc" aria-hidden="true"></canvas><i class="dzsh" aria-hidden="true"></i>';
const DZFG = `<ol class="dzst">${DZSTEPS.map(li).join('')}</ol><aside class="o2" aria-hidden="true"><p class="o2h">Dissolved oxygen<br><em>Illustration</em></p><p class="o2r">~7 mg/L</p><div class="o2rail"><i></i><span style="bottom:87.5%">~7 mg/L</span><span class="lo" style="bottom:25%">2 mg/L</span></div></aside>`;
const FIG = (i, s) => `<div class="stg"><canvas aria-hidden="true"></canvas><svg class="lead" aria-hidden="true"></svg><div class="lead__labels" aria-hidden="true"></div><p class="fig"><span>Fig. ${i - 2}. ${s.name}, exploded <b data-exp>0%</b></span><span>Drawing. No hardware shown. ${tag(ch[i].label)}</span></p></div>`;

const RIDE = {
  wheel: { html: WHEEL },
  boat: { html: pic(cut('yacht-3q', 1239, 1063, 'Rendering of the boat that became the floating workshop')), fl: 1, cta: 'More on the boat' },
  bay: { pin: 'dz', cta: 'More on the Bay' },
  rover: { pin: 'ex' },
  swarm: { pin: 'ex' },
  overhead: { pin: 'ex' },
  harbormaster: { html: '<div class="wid"></div>', after: widget('board'), cta: 'Open Harbormaster' },
  status: { html: `<dl class="big four">${ST.stats.map(([a, b]) => `<div><dt data-n="${a.replace(/\D/g, '')}">${a}</dt><dd>${b}</dd></div>`).join('')}</dl>`, cta: 'See what exists today' },
  crew: { wide: 1, line: 'The people behind the work.', html: `<ul class="crw">${PEOPLE.map((p) => `<li><a href="#crew">${photo(p.photo.src, p.photo.alt)}<b>${p.name}</b><span>${p.role}</span></a></li>`).join('')}</ul>`, cta: 'Meet the crew' },
  origin: { wide: 1, html: `<ol class="otl">${O.timeline.map(([d, t]) => `<li><i></i><time>${d}</time><b>${t}</b></li>`).join('')}</ol>`, cta: 'Read the story' },
  log: { html: `<div class="mos">${C.log.photos.map((p) => `<a href="#log">${photo(p.src, p.alt)}</a>`).join('')}</div>`, cta: 'Open the field log' },
  contact: { extra: sub(C.contact.body) + BACKED, html: `<div class="legal"><span class="mk">${C.brand.mark}</span><p>${C.legal}</p><p>${C.credit}</p><p>Transit map styling is a format only. This company operates no transit service and uses no agency's marks.</p></div>`, cta: false },
};
const bullets = (s) => (s.all ? ['w', 'r', 'n', 'h'] : s.l === 't' ? [] : [s.l]).map((b) => `<i class="bu ${b}">${b.toUpperCase()}</i>`).join('');
const rideSec = (s, i) => {
  const V = RIDE[s.id], side = i < 6 && i % 2 ? 'R' : 'L', line = V.line || s.line;
  const txt = `<div class="txt"><p class="kick">${bullets(s)}<span class="n">${num(i)}</span><span>${s.place}</span></p>
  <h2 id="rh-${s.id}"><span class="stn${s.id === 'contact' ? ' term' : ''}" aria-hidden="true"><b>${num(i)}</b></span>${s.name}</h2>
  ${line ? `<p class="ln2">${line.replace(/(\w+-\w+)/g, '<span class="nw">$1</span>')}</p>` : ''}${V.extra || ''}
  ${V.cta === false ? '' : `<a class="go" href="#${s.id}">${V.cta || `More on ${s.name}`}<span aria-hidden="true">→</span></a>`}</div>`;
  const at = `class="rd ${side} l-${s.l} rd-${s.id}${V.wide ? ' wide' : ''}${V.fl ? ' fl' : ''}${V.pin ? ' pinned ' + V.pin : ''}" id="rd-${s.id}" aria-labelledby="rh-${s.id}"${s.id === 'harbormaster' ? ' data-hm' : ''}`;
  if (V.pin === 'dz') return `<section ${at}><div class="hold"><div class="pin">${DZBG}${txt}${DZFG}</div></div></section>`;
  if (V.pin === 'ex') return `<section ${at}><div class="hold"><div class="pin">${txt}<div class="vis">${FIG(i, s)}</div></div></div></section>`;
  return `<section ${at}>${txt}<div class="vis"><div class="vin">${V.html}</div></div></section>`;
};
const RIDEHTML = () => `<div class="ride" id="ride"><svg class="track" aria-hidden="true"></svg><p class="ride-cue"><i></i>Scroll to ride the line</p>${STOPS.map(rideSec).join('')}
  <footer class="end"><a class="totop" href="#map">Back to the map<span aria-hidden="true">↑</span></a><span>${C.contact.place}</span></footer></div>`;

/* Labels with leader lines that track points on a moving drawing. Ported from Noir. */
function leaders(host, M, stg) {
  const svg = $('.lead', host), box = $('.lead__labels', host), NS = 'http://www.w3.org/2000/svg';
  const items = M.labels.map((l) => { const el = document.createElement('div'); el.className = 'lead__l'; el.textContent = l.text; box.append(el); const p = document.createElementNS(NS, 'path'), d = document.createElementNS(NS, 'circle'); d.setAttribute('r', '2.5'); svg.append(p, d); return Object.assign({}, l, { el, p, d, side: 0, y: null, w: 0, h: 0 }); });
  const measure = () => items.forEach((it) => { it.w = it.el.offsetWidth; it.h = it.el.offsetHeight; });
  measure(); if (document.fonts) document.fonts.ready.then(measure); new ResizeObserver(measure).observe(host);
  return { layout(a) {
    const W = host.clientWidth, H = host.clientHeight, sm = W < 560, pad = sm ? 4 : 8, gap = sm ? 30 : 38, top = sm ? 8 : 24, bot = sm ? 40 : 70, cx = W / 2;
    items.forEach((it) => { it.pt = stg.project(it.at, it.part); if (!it.pt) return; if (!it.side) it.side = it.pt.x < cx ? -1 : 1; else if (Math.abs(it.pt.x - cx) > W * .12) it.side = it.pt.x < cx ? -1 : 1; });
    [-1, 1].forEach((side) => { const g = items.filter((x) => x.pt && x.side === side).sort((u, v) => u.pt.y - v.pt.y); let y = top; g.forEach((x) => { x.ty = Math.max(y, x.pt.y); y = x.ty + gap; }); let m = H - bot; for (let i = g.length - 1; i >= 0; i--) { if (g[i].ty > m) g[i].ty = m; m = g[i].ty - gap; } });
    items.forEach((it) => {
      if (!it.pt || a < .01) { it.el.style.opacity = '0'; it.p.style.opacity = '0'; it.d.style.opacity = '0'; return; }
      it.y = it.y === null ? it.ty : lerp(it.y, it.ty, QA ? 1 : .2);
      const lx = it.side < 0 ? pad : W - pad - it.w, edge = it.side < 0 ? lx + it.w : lx, ex = it.side < 0 ? edge + 22 : edge - 22, yc = it.y;
      it.el.style.transform = `translate3d(${lx.toFixed(1)}px,${(yc - it.h / 2).toFixed(1)}px,0)`; it.el.style.opacity = a.toFixed(3);
      it.p.setAttribute('d', `M${it.pt.x.toFixed(1)} ${it.pt.y.toFixed(1)}L${ex.toFixed(1)} ${yc.toFixed(1)}L${edge.toFixed(1)} ${yc.toFixed(1)}`);
      it.p.style.opacity = a.toFixed(3); it.d.setAttribute('cx', it.pt.x.toFixed(1)); it.d.setAttribute('cy', it.pt.y.toFixed(1)); it.d.style.opacity = a.toFixed(3);
    });
  } };
}
/* One exploded drawing per machine, on the shared hidden-line stage. */
const CAM = {
  rover: () => ({ camera: narrow() ? { dist: 19.5, yaw: .3, pitch: .14, target: [1.7, 1, 0] } : { dist: 15.5, yaw: .3, pitch: .14, target: [.6, 1, 0] }, distK: .14 }),
  swarm: () => ({ camera: { dist: narrow() ? 7.6 : 6.6, yaw: .72, pitch: .26 }, distK: .4 }),
  overhead: () => ({ camera: { dist: narrow() ? 12.6 : 11.2, yaw: .8, pitch: .16, target: [-.1, -.85, .1] }, distK: .28 }),
};
function machineStage(sec, id) {
  if (!BD.stage || !BD.models || !BD.models[id]) return null;
  const host = $('.stg', sec), canvas = $('canvas', host), exp = $('[data-exp]', host), M = BD.models[id](), cfg = CAM[id]();
  if (id === 'rover') {
    const pipe = new BD.Mesh(), Rp = 1.7, cy = 1.36;
    for (let x = -11; x <= 11; x += 1.1) pipe.ring(x, cy, 0, Rp, 44, 'yz');
    for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2, y = cy + Math.cos(a) * Rp, z = Math.sin(a) * Rp; if (z < .3) pipe.s(-11, y, z, 11, y, z); }
    M.parts.unshift({ name: 'pipe', mesh: pipe, color: 'dim', width: 1, opacity: .3, fill: null });
    const b = new BD.Mesh().loft([[2.95, -.33, 0, .04], [3.2, -.18, 0, .5], [3.7, .02, 0, .72], [4.3, -.1, 0, .62], [4.75, -.33, 0, .04]], 18);
    M.parts.push({ name: 'blockage', mesh: b, at: [0, 0, 0], color: 'ember', width: 1.1, opacity: .75 });
    M.labels.push({ part: 'blockage', at: [3.75, .72, 0], text: 'Defined obstruction' });
  }
  let s = null, L = null, e = 0, yawS = 0, yawLast = 0, pS = 0, shown = -1; const tgt = { e: 0, yaw: 0, pitch: 0 };
  const cam = Object.assign({}, M.camera, cfg.camera);
  s = BD.stage({ canvas, parts: M.parts, camera: cam, explode: 0, auto: 0, drag: !narrow(), reveal: false, onFrame() {
    if (!s) return; const k = QA ? 1 : .1;
    e = lerp(e, tgt.e, k); yawS = lerp(yawS, tgt.yaw, k); pS = lerp(pS, tgt.pitch, k);
    s.state.yaw += yawS - yawLast; yawLast = yawS;
    s.set({ explode: e, pitch: cam.pitch + pS, dist: cam.dist * (1 + cfg.distK * e) });
    if (L) L.layout(smooth(.12, .42, e));
    const pc = Math.round(e * 100); if (pc !== shown) { shown = pc; exp.textContent = pc + '%'; }
  } });
  if (M.labels && M.labels.length) L = leaders(host, M, s);
  return { set(v) { Object.assign(tgt, v); }, gone() { try { s.destroy(); const gl = canvas.getContext('webgl'); const x = gl && gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } catch (err) {} } };
}
function deadZone(sec) {
  const c = $('.dzc', sec), x = c.getContext('2d'), steps = $$('.dzst li', sec), read = $('.o2r', sec), fill = $('.o2rail i', sec), trk = $('.hold', sec);
  let W = 0, H = 0, D = 1, dots = [], fish = [], alg = [], flk = [], vis = false, sy = 0, wH = 0, raf = 0, T = 8, last = 0, P = 0;
  let seedN = 1; const R = () => { seedN = (seedN * 1664525 + 1013904223) % 4294967296; return seedN / 4294967296; };
  const seed = () => { seedN = 77; const sm = W < 700; dots = Array.from({ length: sm ? 200 : 460 }, () => ({ x: R() * W, y: R(), r: .8 + R() * 1.3, s: R() * 6.28, d: R() })); fish = Array.from({ length: sm ? 9 : 16 }, (_, i) => ({ x: R() * W, y: .16 + R() * .46, s: R() * 6.28, v: .5 + R() * .6, k: i })); alg = Array.from({ length: sm ? 80 : 170 }, () => ({ x: R() * W, l: 7 + R() * 30, s: R() * 6.28 })); flk = Array.from({ length: sm ? 80 : 180 }, () => ({ x: R() * W, d: R(), r: .8 + R() * 1.5, s: R() * 6.28 })); };
  const size = () => { D = Math.min(devicePixelRatio || 1, 1.5); W = c.clientWidth; H = c.clientHeight; if (!W || !H) return; c.width = Math.round(W * D); c.height = Math.round(H * D); sy = H * (narrow() ? .36 : .3); wH = H - sy; seed(); };
  const draw = (p, t) => {
    if (!W) return; x.setTransform(D, 0, 0, D, 0, 0);
    const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#02070a'); bg.addColorStop(sy / H, '#052027'); bg.addColorStop(.72, '#031217'); bg.addColorStop(1, '#010809'); x.fillStyle = bg; x.fillRect(0, 0, W, H);
    const runoff = smooth(.03, .16, p) * (1 - smooth(.34, .46, p)), bloom = smooth(.09, .32, p), dying = smooth(.34, .52, p), h = smooth(.36, .72, p), flee = smooth(.44, .7, p), boat = smooth(.7, .84, p), drop = smooth(.8, .97, p), front = 1 - h * .9;
    if (h > .003) { const g = x.createLinearGradient(0, sy + wH * front, 0, H); g.addColorStop(0, 'rgba(255,90,31,.05)'); g.addColorStop(1, 'rgba(255,90,31,.34)'); x.fillStyle = g; x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= W; i += 18) x.lineTo(i, sy + wH * front + Math.sin(i * .007 + t * .5) * 12 + Math.sin(i * .021 - t * .4) * 4); x.lineTo(W, H); x.closePath(); x.fill(); }
    x.lineWidth = 1;
    for (let j = 1; j < 16; j++) { const yn = j / 16, under = yn > front; x.strokeStyle = under ? 'rgba(255,120,60,.3)' : 'rgba(111,214,198,.17)'; x.beginPath(); for (let i = 0; i <= W; i += 24) { const y = sy + wH * yn + Math.sin(i * .006 + t * .32 + j) * (5 + h * 4) + Math.sin(i * .017 + j * 2.1) * 2; i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke(); }
    for (const d of dots) { const a = .62 * (1 - smooth(-.03, .09, d.y - front + (d.d - .5) * .16)); if (a < .02) continue; x.fillStyle = `rgba(160,240,226,${a.toFixed(3)})`; x.fillRect(d.x + Math.sin(t * .5 + d.s) * 7, sy + d.y * wH + Math.cos(t * .42 + d.s) * 4, d.r, d.r); }
    x.lineWidth = 1.3; x.strokeStyle = 'rgba(236,230,217,.82)';
    for (const f of fish) { const away = Math.pow(clamp01(flee * 1.5 - f.k * .02), 2), fx = ((f.x + t * 22 * f.v) % (W + 60)) - 30 + away * W * 1.25, fy = sy + wH * f.y + Math.sin(t * .9 + f.s) * 8; if (fx > W + 30) continue; x.beginPath(); x.moveTo(fx + 10, fy); x.lineTo(fx, fy - 4); x.lineTo(fx - 7, fy); x.lineTo(fx, fy + 4); x.closePath(); x.moveTo(fx - 7, fy); x.lineTo(fx - 12, fy - 3); x.moveTo(fx - 7, fy); x.lineTo(fx - 12, fy + 3); x.stroke(); }
    if (bloom > .003) { x.lineWidth = 1; for (const a of alg) { const alive = bloom * (1 - dying), len = a.l * clamp01(alive * 1.2); if (len < .5) continue; x.strokeStyle = `rgba(255,194,14,${(.34 + alive * .56).toFixed(3)})`; const wob = Math.sin(t * .8 + a.s) * 3; x.beginPath(); x.moveTo(a.x, sy + 1); x.quadraticCurveTo(a.x + wob, sy + len * .55, a.x + wob * 1.5, sy + len); x.stroke(); } }
    if (dying > .003 && drop < 1) { x.fillStyle = 'rgba(255,194,14,.72)'; for (const f of flk) { const fall = clamp01((p - .34 - f.d * .2) / .32); if (fall <= 0 || fall >= 1) continue; x.globalAlpha = Math.sin(fall * Math.PI); x.fillRect(f.x + Math.sin(t + f.s) * 7, sy + 4 + fall * wH * .9, f.r, f.r); } x.globalAlpha = 1; }
    if (runoff > .004) { x.strokeStyle = `rgba(255,194,14,${(runoff * .9).toFixed(3)})`; x.lineWidth = 1.2; x.setLineDash([9, 10]); x.lineDashOffset = -t * 42; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(W + 10, sy - 96 + i * 14); x.bezierCurveTo(W * .86, sy - 66 + i * 12, W * (.72 - i * .03), sy - 10, W * (.56 - i * .05), sy + 2); x.stroke(); } x.setLineDash([]); }
    x.strokeStyle = 'rgba(236,230,217,.72)'; x.lineWidth = 1.2; x.beginPath(); for (let i = 0; i <= W; i += 14) { const y = sy + Math.sin(i * .012 + t * .9) * 2.4; i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke();
    if (boat > .003) {
      const bx = W * (narrow() ? .62 : .56) + (1 - easeIO(boat)) * W * .5, by = sy + Math.sin(t * .9) * 2.2;
      x.strokeStyle = '#ffc20e'; x.fillStyle = '#031217'; x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(bx - 42, by - 8); x.lineTo(bx + 50, by - 8); x.lineTo(bx + 38, by + 5); x.lineTo(bx - 42, by + 5); x.closePath(); x.fill(); x.stroke();
      x.beginPath(); x.rect(bx - 22, by - 22, 34, 14); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(bx - 30, by - 8); x.lineTo(bx - 30, by - 44); x.moveTo(bx - 37, by - 36); x.lineTo(bx - 23, by - 36); x.stroke();
      if (drop > .003) {
        const len = drop * wH * .7, names = ['pH', 'Dissolved oxygen', 'Turbidity', 'Temperature'];
        x.strokeStyle = '#ffc20e'; x.lineWidth = 1; x.beginPath(); x.moveTo(bx + 14, by + 5); x.lineTo(bx + 14, by + 5 + len); x.stroke();
        x.font = "600 13px 'Inter Tight', sans-serif"; x.textBaseline = 'middle';
        names.forEach((n, i) => { const ny = by + 5 + wH * .7 * ((i + 1) / 4.3); if (ny > by + 5 + len) return; const pulse = (t * .7 + i * .3) % 1; x.strokeStyle = `rgba(111,214,198,${((1 - pulse) * .8).toFixed(3)})`; x.beginPath(); x.arc(bx + 14, ny, 5 + pulse * 26, 0, 7); x.stroke(); x.fillStyle = '#6fd6c6'; x.fillRect(bx + 11, ny - 3, 6, 6); const tw = x.measureText(n).width; x.fillStyle = 'rgba(2,9,12,.8)'; x.fillRect(bx + 26, ny - 11, tw + 14, 22); x.fillStyle = '#f4f2ec'; x.fillText(n, bx + 33, ny); });
      }
    }
  };
  const prog = () => { const r = trk.getBoundingClientRect(), hh = hd.offsetHeight; return clamp01(-(r.top - hh) / Math.max(1, r.height - (innerHeight - hh))); };
  const update = (t) => {
    P = QA && /[?&]dz=/.test(location.search) ? +/[?&]dz=([\d.]+)/.exec(location.search)[1] : reduced ? .95 : prog();
    steps.forEach((el, i) => { const w = [[-1, .3], [.3, .62], [.62, 2]][i], a = reduced ? 1 : smooth(w[0], w[0] + .05, P) * (1 - smooth(w[1] - .05, w[1], P)); el.style.opacity = a.toFixed(3); el.style.transform = `translate3d(0,${((1 - a) * 16).toFixed(1)}px,0)`; });
    const low = smooth(.36, .72, P), txt = low > .5 ? '<2 mg/L' : '~7 mg/L';
    if (read.textContent !== txt) { read.textContent = txt; read.classList.toggle('lo', low > .5); }
    fill.style.transform = `scaleY(${lerp(.875, .2, low).toFixed(3)})`; fill.classList.toggle('lo', low > .5);
    draw(P, t);
  };
  const loop = (now) => { raf = 0; if (!vis) return; raf = requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now; T += dt; update(T); };
  const io = new IntersectionObserver((e) => { vis = e[0].isIntersecting; if (vis && !raf && !reduced) { last = performance.now(); raf = requestAnimationFrame(loop); } }, { rootMargin: '10% 0px' });
  const ro = new ResizeObserver(() => { size(); update(T); }); ro.observe(c); io.observe(c);
  size(); update(T);
}

/* The home page is built once and kept, so going back to it never rebuilds the drawings. */
function makeRide(n) {
  const ride = $('#ride', n), svg = $('.track', ride), secs = $$('.rd', ride), byId = (id) => secs[STOPS.findIndex((s) => s.id === id)];
  let rails = [], railBox = null, A = [], segs = [], cps = [], flat = [], fcum = [], tops = [], pins = [], total = 0, raf = 0, live = false, lastOn = -2, head = null;
  const STG = {}, FX = {};
  const off = (p, d) => p.map((q, i) => {
    const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
    const n1 = i > 0 ? nrm(p[i - 1], q) : nrm(q, p[i + 1]), n2 = i < p.length - 1 ? nrm(q, p[i + 1]) : n1;
    let mx = n1[0] + n2[0], my = n1[1] + n2[1]; const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
    const k = d / Math.max(.4, mx * n1[0] + my * n1[1]); return [q[0] + mx * k, q[1] + my * k];
  });
  const len = (p) => p.reduce((t, q, i) => i ? t + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0, 0);
  const D = (p) => 'M' + p.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L');
  function layout() {
    if (!live || !ride.isConnected) return;
    const R = ride.getBoundingClientRect(), W = ride.clientWidth, H = ride.offsetHeight, ph = narrow(), vh = innerHeight;
    const lw = ph ? 10 : 14, tw = ph ? 3 : 4, c = ph ? 0 : 44, cue = $('.ride-cue i', ride).getBoundingClientRect();
    /* Stations inside a pinned screen are measured where they sit before the screen pins. */
    const P = secs.map((s) => { const b = $('.stn', s).getBoundingClientRect(), trk = $('.hold', s); const y = trk ? s.offsetTop + trk.offsetTop + (b.top - $('.pin', s).getBoundingClientRect().top) + b.height / 2 : b.top + b.height / 2 - R.top; return [Math.round(b.left + b.width / 2 - R.left), Math.round(y)]; });
    tops = secs.map((s) => [s.offsetTop, s.offsetHeight]);
    pins = secs.map((s) => { const t = $('.hold', s); return t ? [s.offsetTop + t.offsetTop, t.offsetHeight] : null; });
    const y0 = Math.round(cue.top + cue.height / 2 - R.top);
    segs = []; cps = [[y0 - vh * .5, 0]]; A = []; total = 0; flat = [];
    P.forEach(([xn, yn], k) => {
      const [xp, yp] = k ? P[k - 1] : [xn, y0];
      let p, c0 = 0, c1 = 0, yh = 0;
      if (Math.abs(xn - xp) < 3) p = [[xn, yp], [xn, yn]];
      else {
        const d = Math.sign(xn - xp); yh = secs[k].offsetTop;
        p = [[xp, yp], [xp, yh - c], [xp + d * c, yh], [xn - d * c, yh], [xn, yh + c], [xn, yn]];
        c0 = total + (yh - c - yp); c1 = c0 + len(p.slice(1, 5));
      }
      if (c1) { const B = Math.max(0, Math.min(Math.abs(xn - xp) * .4, 2 * Math.min(yh - c - yp, yn - yh - c) - 60)); cps.push([yh - B / 2, c0], [yh + B / 2, c1]); }
      /* While a held screen is on, the rail under it keeps that station's color. */
      const push = (pp, l) => { const L = len(pp); segs.push({ p: pp, l, a: total, L, el: [] }); total += L; };
      const hold = k && pins[k - 1] ? pins[k - 1][0] + pins[k - 1][1] : null;
      if (hold !== null && hold > yp + 1 && p[1][1] > hold + 1) { push([p[0], [p[0][0], hold]], STOPS[k - 1].l); push([[p[0][0], hold], ...p.slice(1)], STOPS[k].l); } else push(p, STOPS[k].l);
      A.push(total); cps.push([yn, total]);
      flat.push(...(k ? p.slice(1) : p));
    });
    fcum = flat.map((q, i) => i ? Math.hypot(q[0] - flat[i - 1][0], q[1] - flat[i - 1][1]) : 0); for (let i = 1; i < fcum.length; i++) fcum[i] += fcum[i - 1];
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.innerHTML = `<path class="gh" d="${D(flat)}" stroke-width="${lw}"/>` + segs.map((s) => {
      if (s.l === 't') return [-1.5, -.5, .5, 1.5].map((o, j) => `<path class="dr" pathLength="1000" d="${D(off(s.p, o * tw))}" stroke="var(--${'wrnh'[j]})" stroke-width="${tw + .6}"/>`).join('');
      let h = `<path class="dr" pathLength="1000" d="${D(s.p)}" stroke="var(--${s.l})" stroke-width="${lw}"/>`;
      if (s.l === 'r') h += `<path d="${D(s.p)}" stroke="var(--bg)" stroke-width="${Math.round(lw * .4)}"/>`;
      if (s.l === 'n' || s.l === 'h') h += `<path d="${D(s.p)}" stroke="var(--bg)" stroke-width="${lw + 2}" stroke-dasharray="0 26 11 0"/>`;
      return h;
    }).join('') + `<circle class="tn" r="${ph ? 7 : 9}" cx="-50" cy="-50"/>`;
    const dr = $$('.dr', svg); let j = 0; segs.forEach((s) => { s.el = dr.slice(j, j += s.l === 't' ? 4 : 1); s.f = -1; });
    head = $('.tn', svg); lastOn = -2; tick();
  }
  const at = (cy) => { if (cy <= cps[0][0]) return 0; for (let i = 1; i < cps.length; i++) if (cy < cps[i][0]) { const [y0, a0] = cps[i - 1], [y1, a1] = cps[i]; return a0 + (a1 - a0) * (cy - y0) / Math.max(1, y1 - y0); } return total; };
  const pt = (a) => { let i = 1; while (i < fcum.length - 1 && fcum[i] < a) i++; const t = (a - fcum[i - 1]) / Math.max(1e-6, fcum[i] - fcum[i - 1]); return [flat[i - 1][0] + (flat[i][0] - flat[i - 1][0]) * t, flat[i - 1][1] + (flat[i][1] - flat[i - 1][1]) * t]; };
  function tick() {
    raf = 0; if (!live || !segs.length) return;
    const top = ride.getBoundingClientRect().top, vh = innerHeight, hh = hd.offsetHeight, a = QA && /[?&]full\b/.test(location.search) ? total : at(vh * .5 - top);
    for (const s of segs) { const f = clamp01((a - s.a) / s.L); if (Math.abs(f - s.f) > .0005) { s.f = f; const o = (1000 * (1 - f)).toFixed(2); for (const e of s.el) e.style.strokeDashoffset = o; } }
    if (a > 0 && a < total - 1) { const [x, y] = pt(a); head.setAttribute('cx', x.toFixed(1)); head.setAttribute('cy', y.toFixed(1)); head.style.opacity = 1; } else head.style.opacity = 0;
    let on = -1; A.forEach((x, k) => { if (a >= x - 2) on = k; });
    if (on !== lastOn) { secs.forEach((s, k) => s.classList.toggle('on', k <= on)); rails.forEach((r, k) => r.classList.toggle('on', k === on)); lastOn = on; }
    if (railBox) railBox.classList.toggle('off', top > vh * .6);
    tops.forEach(([t, h], k) => {
      const y = t + top; if (y > vh * 2.2 || y + h < -vh * 1.2) return;
      const id = STOPS[k].id;
      if (pins[k]) {
        if (!FX[id]) FX[id] = RIDE[id].pin === 'dz' ? (deadZone(secs[k]), 1) : machineStage(secs[k], id) || 1;
        const st = FX[id]; if (st === 1) return;
        const [pt0, ph0] = pins[k], P = QA && /[?&]ex=/.test(location.search) ? +/[?&]ex=([\d.]+)/.exec(location.search)[1] : clamp01(-(pt0 + top - hh) / Math.max(1, ph0 - (vh - hh)));
        const e = reduced ? .6 : smooth(.04, .5, P) * (1 - .55 * smooth(.88, 1, P));
        st.set({ e, yaw: reduced ? 0 : (P - .3) * (id === 'rover' ? .5 : id === 'overhead' ? .9 : 1.1), pitch: Math.sin(P * Math.PI) * .08 });
      } else if (!reduced && y < vh * 1.5 && y + h > -vh * .5) secs[k].style.setProperty('--p', ((y + h / 2 - vh / 2) / vh).toFixed(3));
    });
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
  let rt = 0; const onResize = () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(layout); };
  const ro = new ResizeObserver(onResize);
  const count = (el) => $$('dt[data-n]', el).forEach((d) => { const n = +d.dataset.n, t0 = performance.now(); if (!n || reduced || QA) return; const step = (t) => { const k = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - k, 3); d.textContent = Math.round(n * e).toLocaleString('en-US'); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); count(e.target); } }), { rootMargin: '0px 0px -16% 0px' });
  if (document.fonts) document.fonts.ready.then(() => live && layout());
  return {
    on() {
      if (live) return; live = true; rails = $$('.hd .rs'); railBox = $('.hd .rail'); lastOn = -2;
      RIDE.harbormaster.after(byId('harbormaster'));
      addEventListener('scroll', onScroll, { passive: true }); ro.observe(ride);
      secs.forEach((s) => { if (!s.classList.contains('seen')) io.observe(s); });
      layout();
    },
    off() { live = false; removeEventListener('scroll', onScroll); ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); raf = 0; },
    jump(id) { const el = document.getElementById('rd-' + id); if (!el) return false; el.classList.add('seen'); scrollTo(0, el.getBoundingClientRect().top + scrollY - hd.offsetHeight); return true; },
  };
}

let HOME = null;
function home() {
  hd.innerHTML = `<a class="brand" href="#map" aria-label="${C.brand.name}, the map">${C.brand.mark}<span>${C.brand.name}</span></a>${rail(-1).replace('class="rail"', 'class="rail off"')}<span class="sp"></span>${location.hash === '#anime' ? '<a class="lnk" href="#anime">Replay the film</a>' : '<a class="lnk" href="#intro">Replay the intro</a>'}`;
  if (!HOME) {
    const n = document.createElement('div'); n.className = 'homev';
    n.innerHTML = `<section class="home"><h1 class="vh">${C.brand.name} line map</h1>${mapSVG()}${LIST()}<div class="hl"><p id="peek">${LINE}</p>${BACKED}</div>
  <div class="key"><p><span class="k k-w"></span>On the water<span class="k k-r"></span>Designed<span class="k k-n"></span>Simulated</p><p>${C.hero.note} <a href="#contact">Legal</a></p></div></section>${RIDEHTML()}`;
    view.replaceChildren(n); HOME = { n, r: makeRide(n) };
  } else view.replaceChildren(HOME.n);
  const p = $('#peek'); if (p) p.textContent = LINE;
  HOME.r.on();
  document.title = C.brand.name;
}
view.addEventListener('pointerover', (e) => { const a = e.target.closest && e.target.closest('.st'), p = $('#peek'); if (p) p.textContent = a ? (STOPS[a.dataset.i].line || STOPS[a.dataset.i].name) : LINE; });
view.addEventListener('focusin', (e) => { const a = e.target.closest && e.target.closest('.st'), p = $('#peek'); if (a && p) p.textContent = STOPS[a.dataset.i].line || STOPS[a.dataset.i].name; });

/* ---------- a stop ---------- */
const rail = (cur) => `<nav class="rail" aria-label="All stops">${STOPS.map((s, i) => `<a class="rs l-${s.l}${i === cur ? ' on' : ''}" href="#${s.id}" aria-label="${s.name}"${i === cur ? ' aria-current="page"' : ''}><i></i><span>${s.name}</span></a>`).join('')}</nav>`;
const fresh = (el) => { el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); };
function paintTab(s, k) {
  const t = s.tabs[k], l = $('#lft'), r = $('#rgt');
  l.innerHTML = t.left || ''; r.innerHTML = t.right || '';
  $$('.tab').forEach((b, i) => b.setAttribute('aria-selected', String(i === k)));
  fresh(l); fresh(r);
  if (t.after) t.after(r, l);
}
function crew() {
  const L = PE.lead, all = [{ ...L, body: L.paras[0], extra: L.paras.slice(1) }, ...PE.crew], l = $('#lft'), r = $('#rgt');
  const paint = (i) => {
    const p = all[i], lead = i === 0;
    r.innerHTML = `<figure class="portrait${p.photo.src === 'mike' ? ' low' : ''}">${photo(p.photo.src, p.photo.alt)}${lead ? photo(L.easter.src, L.easter.alt, 'duckimg') : ''}${lead ? `<figcaption>${L.easter.cap}</figcaption>` : ''}</figure>`;
    $('.who', l).innerHTML = `<h2>${lead ? `Tyler <button type="button" class="duck" aria-pressed="false" aria-label="Duck">“Duck”</button> Duckett` : p.name}</h2><p class="lab">${p.role}</p>${sub(p.body)}${p.extra ? more('More', p.extra.map((x) => `<p>${x}</p>`).join('')) : ''}`;
    $$('.thumb', l).forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    const d = $('.duck', l); if (d) d.addEventListener('click', () => { const on = $('.portrait', r).classList.toggle('is-duck'); d.setAttribute('aria-pressed', String(on)); });
    fresh(r);
  };
  l.innerHTML = `<div class="who"></div><div class="thumbs">${all.map((p, i) => `<button type="button" class="thumb" aria-label="${p.name}">${photo(p.photo.src, '')}</button>`).join('')}</div>`;
  $$('.thumb', l).forEach((b, i) => b.addEventListener('click', () => paint(i)));
  paint(0); fresh(l);
}
function log() {
  const P = C.log.photos, l = $('#lft'), r = $('#rgt');
  const paint = (i) => { r.innerHTML = pic(photo(P[i].src, P[i].alt), '', P[i].cap); $$('.thumb', l).forEach((b, j) => b.setAttribute('aria-pressed', String(j === i))); fresh(r); };
  l.innerHTML = `<div class="thumbs many">${P.map((p, i) => `<button type="button" class="thumb" aria-label="${p.cap}">${photo(p.src, '')}</button>`).join('')}</div>`;
  $$('.thumb', l).forEach((b, i) => b.addEventListener('click', () => paint(i)));
  paint(0); fresh(l);
}
function stop(i, dir) {
  const s = STOPS[i], p = STOPS[i - 1], n = STOPS[i + 1];
  hd.innerHTML = `<a class="brand" href="#map" aria-label="${C.brand.name}, back to the map">${C.brand.mark}<span>${C.brand.name}</span></a>${rail(i)}<span class="sp"></span><a class="lnk" href="#map">Map</a>`;
  const bullets = s.all ? ['w', 'r', 'n', 'h'] : s.l === 't' ? [] : [s.l];
  view.innerHTML = `<article class="stop l-${s.l}${s.wide ? ' wide' : ''} ${dir < 0 ? 'bwd' : 'fwd'}" data-id="${s.id}"${s.id === 'harbormaster' ? ' data-hm' : ''}>
    <header class="sign"><p class="sp2">${bullets.map((b) => `<i class="bu ${b}">${b.toUpperCase()}</i>`).join('')}<span>${num(i)}</span>${s.place ? `<span class="pl">${s.place}</span>` : ''}</p><h1>${s.name}</h1>${s.line ? `<p class="ln1">${s.line}</p>` : ''}</header>
    ${s.tabs && s.tabs.length > 1 ? `<div class="tabs" role="tablist">${s.tabs.map((t) => `<button type="button" class="tab" role="tab">${t.t}</button>`).join('')}</div>` : ''}
    <div class="lft" id="lft"></div><div class="rgt" id="rgt"></div>
  </article>
  <nav class="band l-${s.l}" aria-label="Along the line"><a class="bd prev" href="#${p ? p.id : 'map'}"><span aria-hidden="true">←</span>${p ? p.name : 'Map'}</a><span class="trk" aria-hidden="true"><b></b></span><a class="bd next" href="#${n ? n.id : 'map'}">${n ? n.name : 'Map'}<span aria-hidden="true">→</span></a></nav>`;
  if (s.tabs) { paintTab(s, 0); $$('.tab').forEach((b, k) => b.addEventListener('click', () => paintTab(s, k))); }
  else if (s.crew) crew(); else if (s.log) log();
  document.title = `${s.name} · ${C.brand.name}`;
  view.focus({ preventScroll: true });
  if (n && n.tabs) { const m = /src="([^"]+)"/.exec(n.tabs[0].right || ''); if (m) new Image().src = m[1]; }
}

/* ---------- the anime film, at #anime ---------- */
/* Times in seconds from the film's cut sheet. */
const BEATS = [
  { a: 1.8, b: 4.4, n: 'Mr. Trash Wheel', st: 'Inner Harbor', t: ch[0].title },
  { a: 5, b: 8.2, n: 'The boat', st: 'Fells Point', t: ch[1].title },
  { a: 8.9, b: 11.7, n: 'Chesapeake Bay', st: ch[2].label, t: ch[2].title },
  { a: 16.7, b: 19.9, n: ch[3].name, st: ch[3].label, t: ch[3].title },
  { a: 19.9, b: 24.7, n: ch[4].name, st: ch[4].label, t: ch[4].title },
  { a: 24.7, b: 99, n: ch[5].name, st: ch[5].label, t: ch[5].title },
];
let ani = null;
function film(on) {
  if (!on) { if (ani) { ani.sec.hidden = true; ani.on = false; } return; }
  if (!ani) {
    const sec = document.createElement('section'); sec.className = 'ani'; sec.setAttribute('aria-label', 'Animated film');
    sec.innerHTML = `<div class="ani-pin"><video muted playsinline preload="auto" poster="shared/anime/poster.jpg" aria-hidden="true"></video><i class="ani-load" aria-hidden="true"></i><div class="ani-bar"><span class="brand">${C.brand.mark}<span>${C.brand.name}</span></span><a href="#map">Skip the film</a></div><h1 class="ani-ttl">Fire above.<br>Water below.</h1><div class="ani-cap"><p><b></b><span></span></p><h2></h2></div></div>`;
    document.body.insertBefore(sec, $('#app'));
    const v = $('video', sec), ttl = $('.ani-ttl', sec), cap = $('.ani-cap', sec), nm = $('b', cap), st = $('p span', cap), tt = $('h2', cap);
    /* The whole file is held in memory so scrubbing never waits on the network. */
    const FILM = 'shared/anime/film.mp4', bar = $('.ani-load', sec);
    const direct = () => { v.src = FILM; bar.style.opacity = 0; };
    v.addEventListener('error', () => { if (v.src.startsWith('blob:')) direct(); });
    v.addEventListener('loadeddata', () => { bar.style.opacity = 0; v.play().then(() => v.pause()).catch(() => {}); }, { once: true });
    (async () => {
      const r = await fetch(FILM); if (!r.ok || !r.body) throw 0;
      const total = +r.headers.get('content-length') || 11729093, rd = r.body.getReader(), parts = []; let got = 0;
      for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; bar.style.transform = `scaleX(${Math.min(1, got / total).toFixed(3)})`; }
      v.src = URL.createObjectURL(new Blob(parts, { type: 'video/mp4' }));
    })().catch(direct);
    ani = { sec, on: false, t: 0, b: -2 };
    ani.tick = () => {
      if (!ani.on) return; requestAnimationFrame(ani.tick);
      const r = sec.getBoundingClientRect(); if (r.bottom < -40) return;
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight))), D = v.duration || 30;
      ani.t += (p * (D - .06) - ani.t) * .2;
      if (!v.seeking && v.readyState >= 1 && Math.abs(v.currentTime - ani.t) > .03) v.currentTime = ani.t;
      ttl.style.opacity = Math.max(0, 1 - ani.t / 1.6).toFixed(3);
      const b = BEATS.findIndex((x) => ani.t >= x.a && ani.t < x.b);
      if (b !== ani.b) { ani.b = b; cap.classList.toggle('on', b >= 0); if (b >= 0) { nm.textContent = BEATS[b].n; st.textContent = BEATS[b].st; tt.textContent = BEATS[b].t; } }
    };
  }
  ani.sec.hidden = false;
  if (!ani.on) { ani.on = true; requestAnimationFrame(ani.tick); }
}
hd.addEventListener('click', (e) => { if (e.target.closest('[href="#anime"]') && location.hash === '#anime') scrollTo(0, 0); });

/* ---------- routing ---------- */
let cur = -1, fromRide = false, rideOff = null;
const goHome = () => { home(); rideOff = HOME.r.off; };
function route() {
  const h = location.hash.slice(1), i = STOPS.findIndex((s) => s.id === h);
  if (rideOff) { const r = $('#ride'); if (i >= 0) fromRide = !!r && r.getBoundingClientRect().top < innerHeight * .5; rideOff(); rideOff = null; }
  if (h === 'anime') { if (reduced || window.BD_FILM === false) { location.hash = 'map'; return; } const back = cur >= 0; root.classList.add('bdi-off'); cur = -1; film(true); goHome(); if (back) $('#app').scrollIntoView(); else scrollTo(0, 0); return; }
  film(false);
  if (i >= 0) { const dir = cur < 0 || i >= cur ? 1 : -1; root.classList.add('bdi-off'); stop(i, dir); cur = i; scrollTo(0, 0); return; }
  if (h === 'map' || (!h && cur >= 0)) {
    if (!h) { try { history.replaceState(null, '', '#map'); } catch (e) {} }
    /* Back from a stop you reached from the line: land on that stop's screen, not the top. */
    const ret = cur >= 0 && fromRide ? STOPS[cur].id : null;
    root.classList.add('bdi-off'); cur = -1; fromRide = false; goHome();
    if (!(ret && HOME.r.jump(ret))) scrollTo(0, 0);
    return;
  }
  const wasOff = root.classList.contains('bdi-off');
  root.classList.remove('bdi-off'); cur = -1; goHome();
  if (wasOff) dispatchEvent(new Event('resize'));
  if (h === 'intro') scrollTo(0, 0);
  if (h === 'after-intro') { const a = document.getElementById('after-intro'); if (a) a.scrollIntoView(); }
}
/* "Map" links when you are already on the map go back to the top of it. */
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href="#map"]');
  if (a && cur < 0 && location.hash === '#map') { e.preventDefault(); scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }
});
addEventListener('hashchange', route);
addEventListener('keydown', (e) => {
  if (cur < 0 || e.metaKey || e.ctrlKey || e.altKey || (e.target.closest && e.target.closest('input,select,textarea,summary'))) return;
  if (e.key === 'ArrowRight') location.hash = (STOPS[cur + 1] || { id: 'map' }).id;
  else if (e.key === 'ArrowLeft') location.hash = (STOPS[cur - 1] || { id: 'map' }).id;
  else if (e.key === 'Escape') location.hash = 'map';
});
/* Both sets of eyes watch the pointer. */
addEventListener('pointermove', (e) => {
  $$('.eyes .pu').forEach((p) => { const cx = +p.getAttribute('cx'), s = p.ownerSVGElement, m = s.getScreenCTM(); if (!m) return; const x = (e.clientX - m.e) / m.a - cx, y = (e.clientY - m.f) / m.d - 190, l = Math.hypot(x, y) || 1, k = Math.min(10, l); p.setAttribute('transform', `translate(${(x / l * k).toFixed(1)} ${(y / l * k).toFixed(1)})`); });
  $$('.eye b').forEach((b) => { const r = b.parentNode.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2, l = Math.hypot(x, y) || 1, k = Math.min(r.width * .17, l); b.style.transform = `translate(${(x / l * k).toFixed(1)}px,${(y / l * k).toFixed(1)}px)`; });
}, { passive: true });
route();
})();
