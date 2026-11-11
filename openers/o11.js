/* o11 Still Water. The first thing you see is the real Mr. Trash Wheel on calm water. Scrolling draws a gold scan line across the screen; behind it the same wheel is the
   wireframe of the intro, on the same pixels, because the intro solves its camera from the photo (BD.wheelFit). The opener sits on top of the intro for the first --op-lead of scroll. */
(function () {
  'use strict';
  const O = window.BDO, html = document.documentElement, QA = /[?&]qa\b/.test(location.search);
  if (html.dataset.op !== 'o11') return; /* the page gave up waiting for this script and carried on without it */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const CUT = 'shared/img/mtw-cut.webp', ALT = 'Mr. Trash Wheel, a water wheel trash interceptor with large googly eyes, in the Baltimore Inner Harbor';
  const sec = document.createElement('section'); sec.className = 'op op-o11'; sec.setAttribute('aria-label', 'Mr. Trash Wheel, Inner Harbor');
  sec.innerHTML = `<div class="op-pin">
    <div class="o11-wipe"><div class="o11-stage">
      <canvas class="o11-sky" aria-hidden="true"></canvas>
      <div class="o11-fit">
      <div class="o11-wheel"><img class="o11-mirror" src="${CUT}" alt="" aria-hidden="true"><img class="o11-photo" src="${CUT}" width="1520" height="1040" alt="${ALT}" decoding="async"></div>
      <div class="o11-bar"><span class="o11-brand"><span class="o11-mark" aria-hidden="true">${O.mark}</span><span class="o11-name">${O.C.brand.name}</span></span><a class="o11-skip" href="#after-intro">Skip<span class="o11-skipx"> the intro</span></a></div>
      <div class="o11-copy"><p class="o11-eye">Mr. Trash Wheel, Inner Harbor</p><h1>We started on the water.</h1><p class="o11-sub">We're partnering with Mr. Trash Wheel to help give them their radar and sensors.</p></div>
      <div class="o11-lede">${O.BACKED}<p class="o11-note"><span class="o11-cue">Scroll</span></p></div>
      <span class="o11-phonecue"><span class="o11-cue">Scroll</span></span>
      <a class="o11-link" href="https://www.mrtrashwheel.com/" target="_blank" rel="noopener" title="Visit mrtrashwheel.com" aria-label="Mr. Trash Wheel's website (opens in a new tab)"></a>
      </div>
    </div></div>
    <i class="o11-beam" aria-hidden="true"></i>
  </div><i class="o11-edge" aria-hidden="true"></i>`;
  document.body.insertBefore(sec, document.getElementById('top'));
  const $ = (s) => sec.querySelector(s), pin = $('.op-pin'), fit = $('.o11-fit'), wipe = $('.o11-wipe'), stage = $('.o11-stage'), cv = $('.o11-sky'), wheel = $('.o11-wheel'), photo = $('.o11-photo'), beam = $('.o11-beam'), edge = $('.o11-edge'), link = $('.o11-link'), lede = $('.o11-lede'), copy = $('.o11-copy'), cues = [...sec.querySelectorAll('.o11-cue')];
  const still = () => O.reduced || html.classList.contains('bdi-static'), off = () => html.classList.contains('bdi-off');
  /* With this opener on top, its heading leads the page and the intro's becomes the second */
  const ih = document.querySelector('#top .bdi-hl'); if (ih) { ih.setAttribute('role', 'heading'); ih.setAttribute('aria-level', '2'); }
  /* The browser's own chrome (phone status bar, overscroll) follows the screen: sky while the photo shows, night after */
  const meta = document.querySelector('meta[name="theme-color"]'), night = meta ? meta.content : '', SKY = '#95bbd1'; let day = null;
  const chrome = (on) => { if (on === day) return; day = on; if (meta) meta.content = on ? SKY : night; html.classList.toggle('o11-night', !on); };
  /* While the photo covers it, the intro underneath is out of reach of the keyboard and screen readers */
  let shut = null; const cover = (on) => { if (on === shut) return; const p = document.querySelector('#top .bdi-descent__pin'); if (p) { p.inert = on; shut = on; } };

  /* Sky, water and the wheel's rippled reflection, in one small shader. */
  const FS = `precision highp float;
  uniform vec2 R; uniform float D,T,HOR,S,X0,Y0,BOB,HAS,RF,IN; uniform sampler2D TX;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float wl(float x){if(x<80.)return 392.;if(x<105.)return mix(392.,405.,(x-80.)/25.);if(x<258.)return mix(405.,408.,(x-105.)/153.);if(x<357.)return mix(408.,438.,(x-258.)/99.);if(x<528.)return mix(438.,440.,(x-357.)/171.);if(x<640.)return mix(440.,405.,(x-528.)/112.);return 405.;}
  void main(){
    vec2 Z=R/D, px=vec2(gl_FragCoord.x,R.y-gl_FragCoord.y)/D; vec3 c;
    vec3 haze=vec3(.905,.937,.925);
    vec2 g=(px-vec2(Z.x*.2,HOR))/vec2(Z.x*.6,HOR*.8); vec3 glow=vec3(.035,.02,-.006)*exp(-dot(g,g));
    if(px.y<HOR){
      float v=clamp(px.y/HOR,0.,1.);
      c=mix(vec3(.585,.733,.82),vec3(.77,.86,.895),smoothstep(0.,.72,v));
      c=mix(c,haze,smoothstep(.52,1.,v));
      float cl=n(vec2(px.x/430.+T*.004,px.y/86.))*.62+n(vec2(px.x/170.-T*.006,px.y/38.))*.38;
      c=mix(c,vec3(.955,.965,.955),smoothstep(.56,.86,cl)*.22*(1.-v*.6));
      c+=glow;
    }else{
      float d=(px.y-HOR)/max(1.,Z.y-HOR), z=1./(d+.035), xw=(px.x-Z.x*.5)/Z.x*z;
      c=mix(haze,vec3(.525,.668,.742),pow(d,.72))+glow;
      float a=n(vec2(xw*1.3+T*.03,z*13.+T*.3)), b=n(vec2(xw*3.1-T*.05,z*29.+T*.46)), r=(a-.5)+.5*(b-.5), amp=smoothstep(.03,.34,d);
      c+=r*.055*amp; c+=smoothstep(.7,.92,a)*.034*amp;
      if(HAS>.5){
        vec2 q=(vec2(px.x,px.y-BOB)-vec2(X0,Y0))/S; float w=wl(q.x), dep=q.y-w;
        if(dep>0.){
          float rip=r*(1.6+dep*.06);
          vec2 u=vec2(q.x+rip,w-dep+rip*.25);
          float ins=step(0.,u.x)*step(u.x,760.)*step(0.,u.y)*step(u.y,520.);
          vec4 t=texture2D(TX,clamp(u/vec2(760.,520.),0.,1.));
          float fade=1.-smoothstep(0.,RF,dep);
          c=mix(c,mix(t.rgb,c,.34),t.a*ins*fade*.8*IN);
          float e=smoothstep(66.,92.,q.x)*(1.-smoothstep(518.,544.,q.x));
          c*=1.-.3*IN*e*exp(-dep/9.);
        }
      }
    }
    c+=(h(gl_FragCoord.xy+T)-.5)/255.;
    gl_FragColor=vec4(c,1.);
  }`;
  let gl = null, U = null, has = 0;
  function initGL() {
    gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) return false;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}')); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { gl = null; return false; }
    gl.useProgram(p); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(p, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    U = {}; ['R', 'D', 'T', 'HOR', 'S', 'X0', 'Y0', 'BOB', 'HAS', 'RF', 'IN', 'TX'].forEach((k) => { U[k] = gl.getUniformLocation(p, k); });
    return true;
  }
  function upload() {
    if (!gl || has) return;
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, photo); } catch (e) { return; }
    [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
    has = 1;
  }

  let ilink = null;
  let fade = 0, shownAt = 0, W = 0, H = 0, PH = 0, s = 1, x0 = 0, y0 = 0, hor = 0, rf = 300, D = 1, lead = 1, t = 0, T = 0, last = performance.now(), raf = 0, hold = 0;
  function layout() {
    if (off()) return;
    /* The layout lives in the small viewport (what a phone shows with its toolbar out); the sky and water run to the bottom of the large one */
    W = pin.clientWidth; H = fit.clientHeight; PH = pin.clientHeight; if (!W || !H) return;
    const L = BD.wheelFit(W, H); s = L.s; x0 = L.mid[0] - 538.5 * s; y0 = L.mid[1] - 160 * s; hor = L.mid[1] + 0.1 * L.sep;
    sec.dataset.stack = L.stack ? 1 : 0;
    sec.style.setProperty('--hor', hor + 'px');
    wheel.style.width = 760 * s + 'px'; wheel.style.height = 520 * s + 'px';
    /* The wheel is a link to its own website: over the photo here, and over the animated wheel in the intro for as long as the camera holds it in the same place */
    [link, ilink].forEach((a) => { if (a) a.style.cssText = `left:${x0}px;top:${y0}px;width:${760 * s}px;height:${520 * s}px`; });
    lead = Math.max(1, sec.offsetHeight - PH);
    const pr = pin.getBoundingClientRect(), r = lede.getBoundingClientRect();
    sec.style.setProperty('--bk-top', (r.top - pr.top) + 'px');
    rf = L.stack ? Math.max(60, Math.min(300, (r.top - pr.top - (y0 + 440 * s)) / s)) : 300; /* upright screens: the reflection ends before the backers */
    const m = parseFloat(getComputedStyle(copy).left) || 16;
    sec.style.setProperty('--copy-w', Math.max(240, x0 + 85 * s - m - 32) + 'px');
    D = Math.min(devicePixelRatio || 1, W <= 820 ? 1.25 : 1);
    const cw = Math.round(W * D), ch = Math.round(PH * D);
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; if (gl) gl.viewport(0, 0, cw, ch); }
    hold = performance.now() + 700;
  }
  function draw(bob) {
    if (!gl) return;
    gl.uniform2f(U.R, cv.width, cv.height); gl.uniform1f(U.D, D); gl.uniform1f(U.T, T); gl.uniform1f(U.HOR, hor); gl.uniform1f(U.S, s); gl.uniform1f(U.X0, x0); gl.uniform1f(U.Y0, y0); gl.uniform1f(U.BOB, bob); gl.uniform1f(U.HAS, has); gl.uniform1f(U.RF, rf); gl.uniform1f(U.IN, fade);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function apply(now) {
    /* The wheel and its reflection arrive together, once, and then sit still: only the water moves */
    fade = !shownAt ? 0 : O.reduced ? 1 : smooth(0, 1, (now - shownAt) / 800); wheel.style.opacity = fade.toFixed(3);
    const k = clamp((t - 0.16) / 0.7, 0, 1), d = k * W, bob = 0;
    wipe.style.transform = `translate3d(${-d}px,0,0)`; stage.style.transform = `translate3d(${d}px,0,0)`;
    edge.style.transform = `translate3d(${-d}px,0,0)`;
    beam.style.transform = `translate3d(${W - d}px,0,0)`; beam.style.opacity = (smooth(0.12, 0.18, t) * (1 - smooth(0.84, 0.9, t))).toFixed(3);
    wheel.style.transform = `translate3d(${x0}px,${y0 + bob}px,0)`;
    const cue = (1 - smooth(0, 0.1, t)).toFixed(3); cues.forEach((c) => { c.style.opacity = cue; });
    pin.style.visibility = t >= 1 ? 'hidden' : '';
    window.BD_COVER = !still() && t <= 0.1 && now > hold;
    cover(!still() && t <= 0.1); chrome(still() ? (window.scrollY || 0) < H * 0.5 : t < 0.5);
    if (t < 1) draw(bob);
  }
  const rawT = () => (still() ? 0 : clamp((window.scrollY || 0) / lead, 0, 1));
  function frame(now) {
    raf = 0; if (off() || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
    const r = rawT(); t = QA || r >= 1 ? r : t + (r - t) * (1 - Math.exp(-dt * 10)); if (Math.abs(r - t) < 0.0005) t = r;
    apply(now);
    if ((t < 1 && !still()) || fade < 1) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf && !off()) { last = performance.now() - 16; raf = requestAnimationFrame(frame); } };
  addEventListener('scroll', wake, { passive: true });
  const ipin = document.querySelector('#top .bdi-descent__pin'), itrack = document.querySelector('#top .bdi-descent');
  if (ipin && itrack && !O.reduced) { ipin.insertAdjacentHTML('beforeend', `<a class="o11-link o11-link2" href="https://www.mrtrashwheel.com/" target="_blank" rel="noopener" title="Visit mrtrashwheel.com" aria-label="Mr. Trash Wheel's website (opens in a new tab)"></a>`); ilink = ipin.lastElementChild; }
  let lraf = 0; const linkSync = () => { lraf = 0; if (!ilink) return; const span = itrack.offsetHeight - lead - innerHeight, p = span > 0 ? ((window.scrollY || 0) - lead) / span : 1; ilink.hidden = still() || off() || p > 0.18; };
  addEventListener('scroll', () => { if (!lraf) lraf = requestAnimationFrame(linkSync); }, { passive: true });
  document.addEventListener('visibilitychange', wake);
  addEventListener('resize', () => { layout(); wake(); }, { passive: true });
  addEventListener('hashchange', () => setTimeout(() => { if (off()) { chrome(false); cover(false); } else { layout(); wake(); } }, 0));
  /* The words wait for their fonts (the backers' place depends on them too), but never longer than a moment */
  const typed = () => { if (sec.classList.contains('o11-type')) return; layout(); sec.classList.add('o11-type'); wake(); };
  if (document.fonts && document.fonts.load) Promise.all(['700 40px Archivo', '400 16px "IBM Plex Sans"', '500 13px "IBM Plex Mono"', '500 15px "Inter Tight"'].map((f) => document.fonts.load(f))).then(typed, typed); else typed();
  setTimeout(typed, 1600);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layout(); wake(); });

  if (!initGL()) sec.classList.add('no-gl');
  cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); gl = null; sec.classList.add('no-gl'); });
  layout(); t = rawT(); apply(performance.now()); wake(); linkSync();
  if (off()) chrome(false);
  const shown = () => { if (shownAt) return; upload(); shownAt = performance.now(); sec.classList.add('o11-in'); html.classList.add('o11-up'); apply(shownAt); wake(); };
  const decoded = photo.decode ? photo.decode() : Promise.resolve();
  decoded.then(shown, shown);
  setTimeout(() => html.classList.add('o11-up'), 1500);
})();
