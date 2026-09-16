/* ============ shared helpers ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ============ preloader: embroider the logo in thread ============ */
(function preloader() {
  const box = $('.preloader');
  if (!box) return;
  const wrap = $('.preloader-box');
  const canvas = $('#preloaderCanvas');
  const ctx = canvas.getContext('2d');
  const pct = $('#preloaderPct');

  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  if (sbw > 0) {
    document.body.style.paddingRight = sbw + 'px';
    const navEl = document.querySelector('.nav');
    if (navEl) navEl.style.right = sbw + 'px';
  }

  const img = new Image();
  img.src = 'Logo.webp?v=389';
  img.onload = () => start();
  img.onerror = () => { box.classList.add('done'); unlock(); };

  let done = false;
  let raf = 0;
  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    setTimeout(() => {
      box.classList.add('done');
      unlock();
    }, 320);
  };
  function unlock() {
    setTimeout(() => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      const navEl = document.querySelector('.nav');
      if (navEl) navEl.style.right = '';
    }, 520);
  }

  function start() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = wrap.getBoundingClientRect().width;
    const ch = (img.naturalHeight / img.naturalWidth) * cw;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const t0 = performance.now();
    const MIN_MS = 1800;
    const SAFE_MS = 2800;

    function frame(now) {
      const elapsed = now - t0;
      const p = Math.min(1, elapsed / MIN_MS);
      const fillX = p * cw;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, img.naturalWidth * p, img.naturalHeight, 0, 0, fillX, ch);

      pct.textContent = Math.round(p * 100) + '%';

      if (elapsed >= SAFE_MS || (fillX >= cw && elapsed >= MIN_MS)) {
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, 0, cw, ch);
        pct.textContent = '100%';
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }
})();

/* ============ verlet thread field ============ */
const canvas = $('#threads');
const ctx = canvas.getContext('2d');
const mouse = { x: -9999, y: -9999, lx: -9999, ly: -9999 };

let W = 0, H = 0;
function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const SEGMENT = 12;
const GRAVITY = 0.12;
const MOUSE_FORCE = 0.3;
const MOUSE_RADIUS = 96;
const DAMPING = 0.97;

function makeThread(anchorX, length, iterations = 8) {
  const count = Math.max(3, Math.round(length / SEGMENT));
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({ x: anchorX, y: i * SEGMENT, prevX: anchorX, prevY: i * SEGMENT });
  }
  return {
    anchorX, nodes, iterations,
    sw: 0,
    swTarget: (Math.random() - 0.5) * 2,
    rewind: 120 + Math.random() * 240,
    amp: 0.5 + Math.random() * 0.9,
    swayScale: 0.6 + Math.random() * 0.8
  };
}

const threadCount = Math.min(130, Math.max(80, Math.round(window.innerWidth / 10)));
const threads = [];
const spacing = window.innerWidth / (threadCount + 1);
const cx = window.innerWidth / 2;
const lenMax = Math.max(window.innerHeight * 0.85, 420);
const edgeMax = lenMax * 0.6;
for (let i = 1; i <= threadCount; i++) {
  const x = spacing * i;
  const d = Math.min(1, Math.abs(x - cx) / (window.innerWidth / 2));
  const sideF = x > cx ? 1.25 : 1.1;
  let length = 50 + d * (30 + Math.random() * (edgeMax - 50) * sideF);
  if (Math.abs(x - cx) < window.innerWidth * 0.12) length += 30;
  threads.push(makeThread(x, length));
}

/* faint background layer — the same threads, 3x longer, barely visible */
const bgThreads = [];
const BG_LEN_MULT = 3;
const bgCount = Math.min(220, Math.max(130, Math.round(threadCount * 2.2)));
const bgSpacing = window.innerWidth / (bgCount + 1);
for (let i = 1; i <= bgCount; i++) {
  const x = bgSpacing * (i + 0.25);
  const length = 50 + Math.random() * (lenMax * BG_LEN_MULT - 50);
  bgThreads.push(makeThread(x, length, 3));
}

function updateThread(thread, dt) {
  const nodes = thread.nodes;
  const g = GRAVITY * dt;
  const mf = MOUSE_FORCE * dt;

  thread.rewind -= dt;
  if (thread.rewind <= 0) {
    thread.rewind = 120 + Math.random() * 240;
    thread.swTarget = (Math.random() - 0.5) * 2;
  }
  thread.sw += (thread.swTarget - thread.sw) * 0.012 * dt;

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const vx = (n.x - n.prevX);
    const vy = (n.y - n.prevY);
    n.prevX = n.x; n.prevY = n.y;
    n.x += vx * DAMPING;
    n.y += vy * DAMPING + g;
  }

  nodes[0].x = thread.anchorX;
  nodes[0].y = 0;
  nodes[0].prevX = thread.anchorX;
  nodes[0].prevY = 0;

  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    n.x += Math.sin((i * 0.5) + NOW * 0.001 * thread.swayScale) * thread.sw * 0.1;

    const dx = n.x - mouse.x;
    const dy = n.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < MOUSE_RADIUS && dist > 0.001) {
      const f = (1 - dist / MOUSE_RADIUS) * mf;
      n.x += (dx / dist) * f;
      n.y += (dy / dist) * f;
    }
  }

  for (let iter = 0; iter < thread.iterations; iter++) {
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1], b = nodes[i];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const diff = (dist - SEGMENT) / dist;
      if (i > 1) { a.x += dx * diff * 0.5; a.y += dy * diff * 0.5; }
      b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5;
    }
  }
}

let NOW = performance.now();
const THR_BUCKETS = 12;
const thrBX = [], thrBY = [], thrCnt = [];
for (let i = 0; i < THR_BUCKETS; i++) { thrBX.push(new Float32Array(1024)); thrBY.push(new Float32Array(1024)); thrCnt.push(0); }
function drawThread(thread, faint) {
  const nodes = thread.nodes;
  const n = nodes.length;
  for (let b = 0; b < THR_BUCKETS; b++) thrCnt[b] = 0;
  for (let i = 1; i < n; i++) {
    const b = Math.min(THR_BUCKETS - 1, ((i * THR_BUCKETS) / n) | 0);
    const c = thrCnt[b];
    thrBX[b][c] = nodes[i - 1].x;
    thrBY[b][c] = nodes[i - 1].y;
    thrBX[b][c + 1] = nodes[i].x;
    thrBY[b][c + 1] = nodes[i].y;
    thrCnt[b] = c + 2;
  }
  ctx.lineWidth = faint ? 1 : 1.2;
  for (let b = 0; b < THR_BUCKETS; b++) {
    const c = thrCnt[b];
    if (!c) continue;
    const tm = (b + 0.5) / THR_BUCKETS;
    const alpha = faint
      ? Math.max(0.032, 0.082 - tm * 0.032)
      : Math.max(0.35, 0.6 - tm * 0.3);
    ctx.strokeStyle = `rgba(216,201,163,${alpha.toFixed(3)})`;
    ctx.beginPath();
    for (let k = 0; k < c; k += 2) {
      ctx.moveTo(thrBX[b][k], thrBY[b][k]);
      ctx.lineTo(thrBX[b][k + 1], thrBY[b][k + 1]);
    }
    ctx.stroke();
  }

  const last = nodes[n - 1];
  if (faint) return;
  const r = BUTTON_SIZE / 2;
  const cx = last.x, cy = last.y;

  ctx.save();

  // outer rim
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  grad.addColorStop(0, '#dbd3c0');
  grad.addColorStop(0.45, '#a59d89');
  grad.addColorStop(1, '#655d50');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#3a3f3a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // bevel highlight (top-left)
  ctx.beginPath();
  ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.62, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,244,214,0.3)';
  ctx.fill();

  // inner ring (bevel depression)
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(70,62,48,0.55)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // four thread holes (2×2)
  const holeR = r * 0.14;
  const holeOff = r * 0.26;
  ctx.fillStyle = '#000';
  ctx.globalCompositeOperation = 'destination-out';
  const holes = [[-1,-1],[1,-1],[-1,1],[1,1]];
  for (const [hx, hy] of holes) {
    ctx.beginPath();
    ctx.arc(cx + hx * holeOff, cy + hy * holeOff, holeR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  ctx.restore();
}

const MOUSE_SPEED = 0.18;

const BUTTON_SIZE = 8.8;
let rafId = null;
let isMobile = window.innerWidth <= 720;
window.addEventListener('resize', () => { isMobile = window.innerWidth <= 720; });
function render(t) {
  rafId = requestAnimationFrame(render);
  if (document.hidden) return;
  ctx.clearRect(0, 0, W, H);
  NOW = t;
  const dt = Math.min(1.6, Math.max(0.3, (t - last) / 16.667));
  last = t;
  for (const th of bgThreads) updateThread(th, dt);
  for (const th of bgThreads) drawThread(th, true);
  if (!isMobile) {
    for (const th of threads) updateThread(th, dt);
    for (const th of threads) drawThread(th, false);
  }
}
let last = performance.now();
rafId = requestAnimationFrame(render);

window.addEventListener('pointermove', (e) => {
  // use lerper for muscle — smoother feel
  mouse.lx += (e.clientX - mouse.lx) * MOUSE_SPEED;
  mouse.ly += (e.clientY - mouse.ly) * MOUSE_SPEED;
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });

/* ============ scramble-on-hover title ============ */
const SCRAMBLE_CHARS = '$!<>-_\\/[]{}—=+*^?#FUCK';
function scrambleIt(el) {
  const clean = el.dataset.clean || '';
  const final = el.dataset.final || el.textContent;
  let revealed = 0;
  const tick = setInterval(() => {
    let str = '';
    for (let i = 0; i < final.length; i++) {
      if (i < revealed || final[i] === ' ') str += final[i];
      else if (i === revealed) str += final[i];
      else str += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    el.textContent = str;
    revealed++;
    if (revealed > final.length) {
      clearInterval(tick);
      el.textContent = final;
    }
  }, 46);
  void clean;
}
$$('[data-scramble]').forEach((el) => {
  el.dataset.final = el.textContent;
  let t = null;
  el.addEventListener('pointerenter', () => {
    if (t) clearInterval(t);
    scrambleIt(el);
  });
});

/* ============ 3D tilt ============ */
/* driven on window so it also works on pointer-events:none
   decorative buttons (big faint circles) without stealing clicks */
const tiltables = $$('[data-tilt]');
function tiltHandler(e) {
  for (const el of tiltables) {
    const r = el.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-py * 8}deg) rotateY(${px * 10}deg) translateY(-4px)`;
    } else {
      el.style.transform = '';
    }
  }
}
window.addEventListener('pointermove', tiltHandler, { passive: true });
window.addEventListener('pointerleave', () => {
  tiltables.forEach((el) => { el.style.transform = ''; });
});

/* ============ doll sway on scroll + parallax ============ */
const dolls = $$('.doll');
const sw = $$('.doll-sway');
const roundels = $$('.doll-roundel');

const swayState = sw.map(() => ({ rot: 0, ty: 0, sc: 1 }));
function dollDriver() {
  const vh = window.innerHeight;
  const swCenters = new Array(sw.length);
  for (let i = 0; i < sw.length; i++) {
    const r = sw[i].getBoundingClientRect();
    swCenters[i] = r.top + r.height / 2 - vh / 2;
  }
  const rCenters = new Array(roundels.length);
  for (let i = 0; i < roundels.length; i++) {
    const r = roundels[i].getBoundingClientRect();
    rCenters[i] = r.top + r.height / 2 - vh / 2;
  }
  for (let i = 0; i < sw.length; i++) {
    const progress = Math.max(-1, Math.min(1, swCenters[i] / (vh * 0.55)));
    const rot = progress * 9;
    const sway = dolls[i]?.dataset.doll === 'pulse' ? rot * -0.4 : rot;
    const scale = 1 + (1 - Math.abs(progress)) * 0.06;
    swayState[i].rot = sway;
    swayState[i].ty = progress * 14;
    swayState[i].sc = scale;
  }
  for (let i = 0; i < roundels.length; i++) {
    const progress = Math.max(-1, Math.min(1, rCenters[i] / (vh * 0.6)));
    const span = roundels[i].querySelector('span');
    if (span) span.style.setProperty('--rr', `${progress * -30}deg`);
  }
}

/* gentle jelly float — dolls drift slowly like in syrup */
const FLOAT = sw.map(() => ({
  p: Math.random() * Math.PI * 2,
  aRot: 0.6 + Math.random() * 0.4,
  aY: 3 + Math.random() * 2,
  aS: 0.008 + Math.random() * 0.006,
  sp: 0.001 + Math.random() * 0.0007,
  sp2: 0.0008 + Math.random() * 0.0005
}));
let rafFloat = null;
let _dollsPaused = false;
window._dollsPaused = (v) => { _dollsPaused = v; };
function applyFloat(t) {
  rafFloat = requestAnimationFrame(applyFloat);
  if (_dollsPaused || document.hidden) return;
  if (document.hidden) return;
  for (let i = 0; i < sw.length; i++) {
    const f = FLOAT[i];
    const fr = f.aRot * Math.sin(t * f.sp + f.p);
    const fy = f.aY * Math.sin(t * f.sp2 + f.p * 1.7);
    const fs = 1 + f.aS * Math.sin(t * f.sp * 0.8 + f.p * 3);
    const s = swayState[i];
    sw[i].style.transform = `rotate(${s.rot + fr}deg) translateY(${s.ty + fy}px) scale(${s.sc * fs})`;
  }
}
rafFloat = requestAnimationFrame(applyFloat);

/* doll thread marker follows scroll */
const dollLine = $('.dolls-thread i');
function dollThreadDriver() {
  const dollsSel = $('.dolls');
  const r = dollsSel.getBoundingClientRect();
  const p = Math.max(0, Math.min(1, -r.top / (dollsSel.offsetHeight - window.innerHeight)));
  dollLine.style.marginTop = `${p * (dollsSel.offsetHeight - 20)}px`;
}

let scrollTicking = false;
function onScrollBatch() {
  scrollTicking = false;
  dollDriver();
  dollThreadDriver();
}
function scheduleScroll() {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(onScrollBatch);
  }
}

dolls.forEach((el) => {
  el.addEventListener('pointerenter', () => el.classList.add('hovering'));
  el.addEventListener('pointerleave', () => el.classList.remove('hovering'));
});

/* ============ doll ember particles ============ */
function dollFxInit() {
  const accentOf = (d) => {
    const v = getComputedStyle(d).getPropertyValue('--acc').trim();
    return v ? v : '#d8a84e';
  };
  const accs = $$('.doll').map(accentOf);
  $$('.doll-fx').forEach((cv, idx) => {
    const ctx = cv.getContext('2d');
    const acc = accs[idx] || '#d8a84e';
    let W = 0, H = 0;
    function hexA(hex, a) {
      const m = (hex || '').replace('#', '');
      if (!m) return `rgba(216,168,78,${a})`;
      const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    function fit() {
      const r = cv.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      if (cv.width !== W) cv.width = W;
      if (cv.height !== H) cv.height = H;
    }
    const P = [];
    function spawn(initial) {
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * (H * 0.65) + H * 0.1 : H + 8,
        r: 0.7 + Math.random() * 1.7,
        vy: -(0.15 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * 0.25,
        wv: Math.random() * Math.PI * 2,
        wf: 0.01 + Math.random() * 0.02,
        ov: 0.3 + Math.random() * 0.45
      };
    }
    function resize() {
      const had = W * H;
      fit();
      const want = Math.max(10, Math.round((W * H) / 26000));
      const grown = W * H > had + 4;
      while (P.length < want) P.push(spawn(true));
      if (P.length > want) P.length = want;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        if (grown || p.y > H + 8 || p.y < -12 || p.x > W + 12 || p.x < -12) P[i] = spawn(true);
      }
    }
    resize();
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(() => resize()).observe(cv);
    } else {
      window.addEventListener('resize', resize);
    }
    if (typeof IntersectionObserver === 'function') {
      const fobs = new IntersectionObserver((ents) => {
        for (const en of ents) en.target._paused = !en.isIntersecting;
      }, { rootMargin: '150px 0px' });
      fobs.observe(cv);
      /* pause the float/step loops too whenever the dolls leave the viewport */
      const fab = new IntersectionObserver((ents) => {
        const on = ents.some((e) => e.isIntersecting);
        if (typeof window._dollsPaused === 'function') window._dollsPaused(!on);
      }, { rootMargin: '120px 0px' });
      try { fab.observe($('.dolls') || cv); } catch (_) {}
    }
    (function step() {
      requestAnimationFrame(step);
      if (cv._paused || document.hidden) return;
      const now = performance.now();
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.wv += p.wf) * 0.22;
        if (p.y < -12 || p.x < -12 || p.x > W + 12) { P[i] = spawn(false); continue; }
        const tw = 0.55 + 0.45 * Math.sin(p.wv * 6 + p.x * 0.013);
        const core = `rgba(255,240,210,${0.85 * p.ov * tw})`;
        if (p.r > 1.1) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          g.addColorStop(0, core);
          g.addColorStop(0.4, hexA(acc, 0.34 * p.ov * tw));
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    })();
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dollFxInit);
else dollFxInit();

/* random equalizer bars */
$$('.hero-eq i').forEach((bar) => {
  const tick = () => {
    const h = 25 + Math.random() * 75;
    bar.style.height = h + '%';
    bar.style.transition = `height ${0.08 + Math.random() * 0.2}s ease-out`;
    setTimeout(tick, 70 + Math.random() * 220);
  };
  tick();
});

window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', () => { dollDriver(); dollThreadDriver(); parallaxBtns(); });
dollDriver();
dollThreadDriver();

/* ============ gallery ============ */
const GALLERY = [
  "galery/20260910_074122_0_UTC_0.webp",
  "galery/20260910_082355_0_UTC_0.webp",
  "galery/20260910_085256_0_UTC_0.webp",
  "galery/20260910_094159_0_UTC_0.webp",
  "galery/20260910_100136_0_UTC_0.webp",
  "galery/20260910_112837_0_UTC_0.webp",
  "galery/20260910_174507_0_UTC_0.webp",
  "galery/20260910_190406_0_UTC_0.webp",
  "galery/20260910_190739_0_UTC_0.webp",
  "galery/20260910_191047_0_UTC_0.webp"
];
const CAPS = [
  "who sold what to stand here?",
  "gold dust and feedback",
  "you can't outrun the doll",
  "sound check for the afterlife",
  "four dolls, one heartbeat",
  "interval — nobody leaves",
  "the encore that wasn't",
  "amber light, rust voice",
  "last dollar, first amen",
  "the curtain is just fabric"
];

const track = $('#reelTrack');
GALLERY.forEach((src, i) => {
  const img = document.createElement('img');
  img.src = src;
  img.alt = `Dollars concert photo ${i + 1}`;
  img.decoding = 'async';
  img.loading = 'lazy';
  img.addEventListener('load', syncReelArrows, { once: true });
  img.addEventListener('click', () => openLightbox(src, i));
  track.appendChild(img);
});

const reel = $('#reel');
const reelPrev = $('.reel-prev');
const reelNext = $('.reel-next');
const reelPrevBottom = $('.reel-prev-bottom');
const reelNextBottom = $('.reel-next-bottom');
function pageReel(dir) {
  reel.scrollBy({ left: dir * reel.clientWidth * 0.85, behavior: 'smooth' });
}
let reelTimer = null;
function startReelScroll(dir) {
  stopScroll();
  pageReel(dir);
  reelTimer = setInterval(() => pageReel(dir), 420);
}
function stopScroll() {
  if (reelTimer) { clearInterval(reelTimer); reelTimer = null; }
}
reelPrev.addEventListener('pointerdown', (e) => { e.preventDefault(); startReelScroll(-1); });
reelNext.addEventListener('pointerdown', (e) => { e.preventDefault(); startReelScroll(1); });
reelPrev.addEventListener('pointerup', stopScroll);
reelNext.addEventListener('pointerup', stopScroll);
reelPrev.addEventListener('pointerleave', stopScroll);
reelNext.addEventListener('pointerleave', stopScroll);
reelNext.addEventListener('click', (e) => e.preventDefault());
reelPrev.addEventListener('click', (e) => e.preventDefault());
reelPrevBottom.addEventListener('pointerdown', (e) => { e.preventDefault(); startReelScroll(-1); });
reelNextBottom.addEventListener('pointerdown', (e) => { e.preventDefault(); startReelScroll(1); });
reelPrevBottom.addEventListener('pointerup', stopScroll);
reelNextBottom.addEventListener('pointerup', stopScroll);
reelPrevBottom.addEventListener('pointerleave', stopScroll);
reelNextBottom.addEventListener('pointerleave', stopScroll);
reelNextBottom.addEventListener('click', (e) => e.preventDefault());
reelPrevBottom.addEventListener('click', (e) => e.preventDefault());
function syncReelArrows() {
  reelPrev.disabled = reel.scrollLeft <= 0;
  reelNext.disabled = reel.scrollLeft + reel.clientWidth >= reel.scrollWidth - 1;
}
reel.addEventListener('scroll', syncReelArrows, { passive: true });
window.addEventListener('resize', syncReelArrows);
syncReelArrows();
let isDown = false, startX = 0, startScroll = 0, moved = 0;
reel.addEventListener('pointerdown', (e) => {
  isDown = true; moved = 0;
  startX = e.clientX; startScroll = reel.scrollLeft;
  reel.classList.add('dragging');
});
window.addEventListener('pointermove', (e) => {
  if (!isDown) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 5) moved += Math.abs(dx - moved);
  reel.scrollLeft = startScroll - dx;
});
window.addEventListener('pointerup', () => {
  isDown = false;
  reel.classList.remove('dragging');
});
reel.addEventListener('click', (e) => {
  if (moved > 8) e.stopPropagation();
  moved = 0;
}, true);

let lightboxIndex = 0;
function lightboxShow(i) {
  lightboxIndex = (i + GALLERY.length) % GALLERY.length;
  $('#lightboxImg').src = GALLERY[lightboxIndex];
  $('#lightbox').hidden = false;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  if (window.lenis) window.lenis.stop();
}
function openLightbox(src, i) {
  lightboxShow(i);
}
function closeLightbox() {
  $('#lightbox').hidden = true;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  if (window.lenis) window.lenis.start();
}
$('.lightbox-prev').addEventListener('click', (e) => {
  e.stopPropagation();
  lightboxShow(lightboxIndex - 1);
});
$('.lightbox-next').addEventListener('click', (e) => {
  e.stopPropagation();
  lightboxShow(lightboxIndex + 1);
});
$('#lightbox').addEventListener('click', (e) => {
  if (e.target === $('#lightbox')) closeLightbox();
});
$('.lightbox-close').addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if ($('#lightbox').hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxShow(lightboxIndex - 1);
  if (e.key === 'ArrowRight') lightboxShow(lightboxIndex + 1);
});

/* ============ track list player ============ */
const SONG_FILES = [
  'Anthem.mp3',
  'Below the Tread.mp3',
  'Fuck the System.mp3',
  'Gods and Monsters.mp3',
  'Iron.mp3',
  'Pay the Price.mp3',
  'Redacted assets.mp3',
  'Ronin (The Empty Blade).mp3',
  'Self-Entombed.mp3',
  'War.mp3',
  'Without You.mp3'
];

const trackAudio = $('#trackAudio');
const trackList = $('#trackList');
const trackRows = [];
let currentTrack = -1;
let seekActive = false;

function fmtTime(s) {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function setTrackPlaying(i, playing) {
  trackRows.forEach((r, idx) => {
    r.li.classList.toggle('playing', idx === i && playing);
    r.li.classList.toggle('paused', idx === i && !playing);
  });
}

SONG_FILES.forEach((file, i) => {
  const title = file.replace(/\.mp3$/i, '');
  const li = document.createElement('li');
  li.className = 'track-row';

  const btn = document.createElement('button');
  btn.className = 'track-play';
  btn.type = 'button';
  btn.setAttribute('aria-label', `Play ${title}`);
  btn.innerHTML = '<span class="track-play-ic"><svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M2.6 2.2 V9.8 L9.4 6 Z"/></svg></span>';

  li.innerHTML = `
    <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
    <span class="track-title">${title}</span>
    <span class="track-meta">
      <span class="track-eq" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="track-time-lab">0:00</span>
    </span>
    <span class="track-bar"><span class="track-bar-fill"></span></span>
  `;
  li.appendChild(btn);
  li.addEventListener('click', () => toggleTrack(i));
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggleTrack(i); });
  trackList.appendChild(li);
  trackRows.push({ li, title, file });

  const bar = li.querySelector('.track-bar');
  const barFill = bar.querySelector('.track-bar-fill');
  const seekTo = (clientX) => {
    const rect = bar.getBoundingClientRect();
    if (!rect.width) return;
    let r = (clientX - rect.left) / rect.width;
    r = Math.max(0, Math.min(1, r));
    barFill.style.width = (r * 100) + '%';
    bar.classList.add('dragging');
    seekActive = true;
    if (Number.isFinite(trackAudio.duration) && trackAudio.duration > 0) {
      trackAudio.currentTime = r * trackAudio.duration;
    }
  };
  bar.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentTrack !== i) return;
    seekTo(e.clientX);
    const move = (ev) => seekTo(ev.clientX);
    const up = () => {
      bar.classList.remove('dragging');
      seekActive = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (trackAudio.paused) trackAudio.play().catch(() => {});
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
  bar.addEventListener('click', (e) => e.stopPropagation());

  const probe = new Audio('songs/' + encodeURI(file));
  probe.preload = 'metadata';
  probe.addEventListener('loadedmetadata', () => {
    const lab = li.querySelector('.track-time-lab');
    if (lab) lab.textContent = fmtTime(probe.duration);
  }, { once: true });
});

function toggleTrack(i) {
  if (currentTrack === i) {
    if (trackAudio.paused) { trackAudio.currentTime = 0; trackAudio.play(); }
    else trackAudio.pause();
    return;
  }
  trackAudio.src = 'songs/' + encodeURI(trackRows[i].file);
  currentTrack = i;
  setTrackPlaying(i, true);
  trackAudio.play();
}

const heroEq = $('#heroEq');
const navEq = $('#navEq');
function navPlaySync() {
  if (!navEq) return;
  navEq.classList.toggle('visible', currentTrack >= 0);
  navEq.classList.toggle('playing', currentTrack >= 0 && !trackAudio.paused);
}
if (heroEq) {
  heroEq.addEventListener('click', () => toggleTrack(0));
}
if (navEq) {
  navEq.addEventListener('click', () => {
    if (currentTrack < 0) toggleTrack(0);
    else toggleTrack(currentTrack);
  });
}

trackAudio.addEventListener('play', () => {
  setTrackPlaying(currentTrack, true);
  const eq = $('#heroEq');
  if (eq) eq.classList.add('playing');
  navPlaySync();
});
trackAudio.addEventListener('pause', () => {
  setTrackPlaying(currentTrack, false);
  const eq = $('#heroEq');
  if (eq) eq.classList.remove('playing');
  navPlaySync();
});
trackAudio.addEventListener('timeupdate', () => {
  const row = trackRows[currentTrack];
  if (!row || seekActive) return;
  const fill = row.li.querySelector('.track-bar-fill');
  if (fill) fill.style.width = trackAudio.duration ? (trackAudio.currentTime / trackAudio.duration) * 100 + '%' : '0%';
});
trackAudio.addEventListener('durationchange', () => {
  const row = trackRows[currentTrack];
  if (!row) return;
  const lab = row.li.querySelector('.track-time-lab');
  if (lab) lab.textContent = fmtTime(trackAudio.duration);
});
trackAudio.addEventListener('ended', () => {
  if (currentTrack < trackRows.length - 1) toggleTrack(currentTrack + 1);
  else {
    setTrackPlaying(currentTrack, false);
    trackAudio.pause();
    navPlaySync();
  }
});

/* Safari / reduced motion respect */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  $$('.ticker-track').forEach((el) => { el.style.animation = 'none'; });
  $$('.hero-logo').forEach((el) => { el.style.animation = 'none'; });
  $$('.track-eq i').forEach((el) => { el.style.animation = 'none'; });
  $$('[data-tilt]').forEach((el) => { el.style.transition = 'none'; });
  $$('.doll-roundel').forEach((el) => { el.style.animation = 'none'; });
  sw.forEach((el, i) => {
    const s = swayState[i];
    el.style.transform = `rotate(${s.rot}deg) translateY(${s.ty}px) scale(${s.sc})`;
  });
  if (rafId) cancelAnimationFrame(rafId);
  if (rafFloat) cancelAnimationFrame(rafFloat);
}

/* ============ buttons parallax on scroll ============ */
const tracksBtn = document.querySelector('.tracks-btn');
const manifestoBtn = document.querySelector('.manifesto-btn');
function parallaxBtns() {
  const vh = window.innerHeight;
  const cy = vh / 2;
  if (tracksBtn) {
    const r = tracksBtn.getBoundingClientRect();
    const elY = r.top + r.height / 2;
    const off = ((elY - cy) / vh) * -260;
    tracksBtn.style.translate = `0 ${off}px`;
  }
  if (manifestoBtn) {
    const r = manifestoBtn.getBoundingClientRect();
    const elY = r.top + r.height / 2;
    const off = ((elY - cy) / vh) * -120;
    manifestoBtn.style.translate = `-50% calc(-50% + ${off}px)`;
  }
}
window.addEventListener('scroll', parallaxBtns, { passive: true });
parallaxBtns();

/* ============ scroll reveal ============ */
const revTargets = '.reveal';
const revEls = $$(revTargets);
if (typeof IntersectionObserver === 'function') {
  const revObs = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        en.target.classList.add('in-view');
        revObs.unobserve(en.target);
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  revEls.forEach((el) => revObs.observe(el));
}
(function fallbackReveal() {
  if (!revEls.length) return;
  const vh = () => window.innerHeight || document.documentElement.clientHeight;
  let timer;
  const check = () => {
    const lim = vh() - 60;
    let all = true;
    for (let i = 0; i < revEls.length; i++) {
      const el = revEls[i];
      if (el.classList.contains('in-view')) continue;
      if (el.getBoundingClientRect().top < lim) el.classList.add('in-view');
      else all = false;
    }
    if (all && timer) { clearInterval(timer); timer = null; }
  };
  timer = setInterval(check, 200);
  window.addEventListener('load', check, { once: true });
  check();
})();
/* ============ Lenis smooth scroll (same as hobro.digital) ============ */
(function () {
  if (typeof Lenis === 'undefined') return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = new Lenis({
    lerp: reduce ? 1 : 0.09,
    wheelMultiplier: 1,
    smoothWheel: !reduce,
    syncTouch: false
  });
  window.lenis = lenis;
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* smooth anchor jumps instead of native instant jumps */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { duration: 1.2 });
        }
      }
    });
  });
})();
