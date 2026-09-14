/* ============ shared helpers ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

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
const GRAVITY = 0.15;
const MOUSE_FORCE = 0.9;
const MOUSE_RADIUS = 110;
const DAMPING = 0.97;
const ITERATIONS = 8;

function makeThread(anchorX, length) {
  const count = Math.max(3, Math.round(length / SEGMENT));
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({ x: anchorX, y: i * SEGMENT, prevX: anchorX, prevY: i * SEGMENT });
  }
  return {
    anchorX, nodes,
    sw: 0,
    swTarget: (Math.random() - 0.5) * 2,
    rewind: 120 + Math.random() * 240,
    amp: 0.5 + Math.random() * 0.9,
    swayScale: 0.6 + Math.random() * 0.8
  };
}

const threadCount = Math.max(60, Math.round(window.innerWidth / 16));
const threads = [];
const spacing = window.innerWidth / (threadCount + 1);
const cx = window.innerWidth / 2;
const lenMax = Math.max(window.innerHeight * 0.85, 420);
const edgeMax = lenMax * 0.6;
for (let i = 1; i <= threadCount; i++) {
  const x = spacing * i;
  const d = Math.min(1, Math.abs(x - cx) / (window.innerWidth / 2));
  const sideF = x > cx ? 1.25 : 1;
  const length = 50 + d * (30 + Math.random() * (edgeMax - 50) * sideF);
  threads.push(makeThread(x, length));
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
  thread.sw += (thread.swTarget - thread.sw) * 0.02 * dt;

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
    n.x += Math.sin((i * 0.5) + performance.now() * 0.001 * thread.swayScale) * thread.sw * 0.22;

    const dx = n.x - mouse.x;
    const dy = n.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < MOUSE_RADIUS && dist > 0.001) {
      const f = (1 - dist / MOUSE_RADIUS) * mf;
      n.x += (dx / dist) * f;
      n.y += (dy / dist) * f;
    }
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
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

function drawThread(thread) {
  const nodes = thread.nodes;
  const n = nodes.length;
  for (let i = 1; i < n; i++) {
    const prev = nodes[i - 1], cur = nodes[i];
    const t = i / n;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(cur.x, cur.y);
    const alpha = Math.max(0.35, 0.6 - t * 0.3);
    ctx.strokeStyle = `rgba(216,201,163,${alpha})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  const last = nodes[n - 1];
  const size = BUTTON_SIZE;
  if (btnImg.complete && btnImg.naturalWidth > 0) {
    ctx.drawImage(btnImg, last.x - size / 2, last.y - size / 2, size, size);
  }
}

const MOUSE_SPEED = 0.18;

const btnImg = new Image();
btnImg.src = 'button.png';
const BUTTON_SIZE = 8;
function render(t) {
  ctx.clearRect(0, 0, W, H);
  const dt = Math.min(1.6, Math.max(0.3, (t - last) / 16.667));
  last = t;
  for (const th of threads) updateThread(th, dt);
  for (const th of threads) drawThread(th);
  requestAnimationFrame(render);
}
let last = performance.now();
requestAnimationFrame(render);

window.addEventListener('pointermove', (e) => {
  // use lerper for muscle — smoother feel
  mouse.lx += (e.clientX - mouse.lx) * MOUSE_SPEED;
  mouse.ly += (e.clientY - mouse.ly) * MOUSE_SPEED;
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });

/* ============ scramble-on-hover title ============ */
const SCRAMBLE_CHARS = '$!<>-_\\/[]{}—=+*^?#';
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
  }, 26);
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
const tiltables = $$('[data-tilt]');
function tiltHandler(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(900px) rotateX(${-py * 8}deg) rotateY(${px * 10}deg) translateY(-4px)`;
}
function tiltReset(e) {
  e.currentTarget.style.transform = '';
}
tiltables.forEach((el) => {
  el.addEventListener('pointermove', tiltHandler);
  el.addEventListener('pointerleave', tiltReset);
});

/* ============ doll sway on scroll + parallax ============ */
const dolls = $$('.doll');
const sw = $$('.doll-sway');
const roundels = $$('.doll-roundel');
function dollDriver() {
  const vh = window.innerHeight;
  sw.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const center = r.top + r.height / 2 - vh / 2;
    const progress = Math.max(-1, Math.min(1, center / (vh * 0.55)));
    const rot = progress * 9;
    const sway = dolls[i]?.dataset.doll === 'pulse' ? rot * -0.4 : rot;
    const scale = 1 + (1 - Math.abs(progress)) * 0.06;
    el.style.transform = `rotate(${sway}deg) translateY(${progress * 14}px) scale(${scale})`;
  });
  roundels.forEach((el) => {
    const r = el.getBoundingClientRect();
    const center = r.top + r.height / 2 - vh / 2;
    const progress = Math.max(-1, Math.min(1, center / (vh * 0.6)));
    el.style.animationPlayState = 'running';
    el.style.transform = `rotate(${progress * -30}deg)`;
  });
}
window.addEventListener('scroll', dollDriver, { passive: true });
window.addEventListener('resize', dollDriver);
dollDriver();

/* reveal cards in viewport */
const revealEls = $$('.doll-card');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.style.opacity = 1;
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .8s ease, transform .8s ease';
  io.observe(el);
});

/* ============ gallery ============ */
const GALLERY = [
  "galery/20260909_194406_0_UTC_0.png",
  "galery/20260910_074122_0_UTC_0.jpeg",
  "galery/20260910_082355_0_UTC_0.png",
  "galery/20260910_085256_0_UTC_0.png",
  "galery/20260910_090019_0_UTC_0.png",
  "galery/20260910_093140_0_UTC_0.png",
  "galery/20260910_093143_0_UTC_0.png",
  "galery/20260910_093520_0_UTC_0.png",
  "galery/20260910_094159_0_UTC_0.png",
  "galery/20260910_094633_0_UTC_0.png",
  "galery/20260910_094814_0_UTC_0.png",
  "galery/20260910_100136_0_UTC_0.png",
  "galery/20260910_112837_0_UTC_0.png",
  "galery/20260910_174507_0_UTC_0.png",
  "galery/20260910_190406_0_UTC_0.png",
  "galery/20260910_190739_0_UTC_0.png",
  "galery/20260910_191047_0_UTC_0.png",
  "galery/20260911_115417_0_UTC_0.png"
];
const CAPS = [
  "the room, before the first chord",
  "who sold what to stand here?",
  "gold dust and feedback",
  "you can't outrun the doll",
  "the crowd does the screaming instead",
  "bass-thunder, front row",
  "stitches never show under strobe",
  "red phone. no one's home.",
  "sound check for the afterlife",
  "the second nome / second name",
  "hair pins and heartbeats",
  "four dolls, one heartbeat",
  "interval — nobody leaves",
  "the encore that wasn't",
  "amber light, rust voice",
  "last dollar, first amen",
  "the curtain is just fabric",
  "burned, not buried"
];

const track = $('#reelTrack');
GALLERY.forEach((src, i) => {
  const img = document.createElement('img');
  img.src = src;
  img.alt = `Dollars concert photo ${i + 1}`;
  img.loading = 'lazy';
  img.addEventListener('click', () => openLightbox(src, i));
  track.appendChild(img);
});

const reel = $('#reel');
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

function openLightbox(src, i) {
  $('#lightboxImg').src = src;
  $('#lightboxCaption').textContent = CAPS[i] || 'untitled night';
  $('#lightbox').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  $('#lightbox').hidden = true;
  document.body.style.overflow = '';
}
$('#lightbox').addEventListener('click', (e) => {
  if (e.target === $('#lightbox') || e.target.closest('.lightbox-close')) closeLightbox();
});
$('.lightbox-close').addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

/* ============ join form ============ */
$('#joinForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = $('.join-btn');
  btn.querySelector('span').textContent = 'STITCH SENT';
  $('#joinForm').style.display = 'none';
  $('#joinDone').hidden = false;
});

/* ============ doll thread marker follows scroll ============ */
const dollLine = $('.dolls-thread i');
function dollThreadDriver() {
  const dollsSel = $('.dolls');
  const r = dollsSel.getBoundingClientRect();
  const p = Math.max(0, Math.min(1, -r.top / (dollsSel.offsetHeight - window.innerHeight)));
  dollLine.style.marginTop = `${p * (dollsSel.offsetHeight - 20)}px`;
}
window.addEventListener('scroll', dollThreadDriver, { passive: true });
dollThreadDriver();

/* Safari / reduced motion respect */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  $$('.ticker-track').forEach((el) => { el.style.animation = 'none'; });
  $$('[data-tilt]').forEach((el) => { el.style.transition = 'none'; });
}