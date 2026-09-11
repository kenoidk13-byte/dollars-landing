const canvas = document.getElementById('threads');
const ctx = canvas.getContext('2d');
const mouse = { x: -9999, y: -9999 };

let W = 0, H = 0;
function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const SEGMENT = 12;
const GRAVITY = 0.15;
const MOUSE_FORCE = 0.6;
const MOUSE_RADIUS = 80;
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

const threadCount = Math.max(32, Math.round(window.innerWidth / 30));
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
  const t = makeThread(x, length);
  t.lane = spacing * 0.74;
  threads.push(t);
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
  thread.sw += (thread.swTarget - thread.sw) * 0.003 * dt;

  nodes[0].x = thread.anchorX;
  nodes[0].y = 2;
  nodes[0].prevX = nodes[0].x;
  nodes[0].prevY = nodes[0].y;

  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    const sway = thread.sw * thread.amp * thread.swayScale * 0.04 * (i / (nodes.length - 1));
    const vx = (n.x - n.prevX) * DAMPING;
    const vy = (n.y - n.prevY) * DAMPING;
    n.prevX = n.x;
    n.prevY = n.y;
    n.x += vx + sway;
    n.y += vy + g;

    const dx = mouse.x - n.x;
    const dy = mouse.y - n.y;
    const dist = Math.hypot(dx, dy);
    if (dist < MOUSE_RADIUS && dist > 0.01) {
      const pull = (1 - dist / MOUSE_RADIUS) * mf;
      n.x += (dx / dist) * pull;
      n.y += (dy / dist) * pull;
    }
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1], b = nodes[i];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1;
      const diff = (d - SEGMENT) / d * 0.5;
      const ox = dx * diff;
      const oy = dy * diff;
      if (i !== 1) { a.x += ox; a.y += oy; }
      b.x -= ox; b.y -= oy;
    }
  }

  const halfLane = thread.lane / 2;
  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.x < thread.anchorX - halfLane) n.x = thread.anchorX - halfLane;
    if (n.x > thread.anchorX + halfLane) n.x = thread.anchorX + halfLane;
  }
}

const FADE_START = 230;
const FADE_END = 430;

function curveBetween(a, b, c, steps) {
  const out = [];
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0];
    const y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1];
    out.push([x, y]);
  }
  return out;
}

function drawThread(thread) {
  const nodes = thread.nodes;
  if (nodes.length < 2) return;

  const pts = [[nodes[0].x, nodes[0].y]];
  for (let i = 1; i < nodes.length - 1; i++) {
    const c = nodes[i], n = nodes[i + 1];
    const a = pts[pts.length - 1];
    const mid = [(c.x + n.x) / 2, (c.y + n.y) / 2];
    pts.push(...curveBetween(a, [c.x, c.y], mid, 5));
  }
  const last = [nodes[nodes.length - 1].x, nodes[nodes.length - 1].y];
  pts.push(...curveBetween(pts[pts.length - 1], pts[pts.length - 1], last, 5));

  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  let curAlpha = -1;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const y = (a[1] + b[1]) / 2;
    let alpha = 0.14;
    if (Math.abs(a[0] - cx) < 380 && y > FADE_START) {
      alpha = 0.14 * (1 - Math.min(1, (y - FADE_START) / (FADE_END - FADE_START)));
    }
    if (alpha < 0.002) alpha = 0;
    const bucket = Math.round(alpha / 0.02) * 0.02;
    if (bucket !== curAlpha) {
      if (i > 0) { ctx.globalAlpha = curAlpha; ctx.stroke(); }
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      curAlpha = bucket;
    }
    ctx.lineTo(b[0], b[1]);
  }
  if (curAlpha > 0.002) { ctx.globalAlpha = curAlpha; ctx.stroke(); }
  ctx.globalAlpha = 1;
}

let lastT = performance.now();
function updateThreads(now) {
  const dt = Math.min((now - lastT) / 16.667, 2);
  lastT = now;
  ctx.clearRect(0, 0, W, H);
  for (const t of threads) {
    updateThread(t, dt);
    drawThread(t);
  }
}

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
window.addEventListener('touchmove', (e) => {
  if (e.touches.length) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
}, { passive: true });

const scenes = document.querySelectorAll('.scene');
const anims = [];

scenes.forEach(scene => {
    anims.push({
      scene,
      img: scene.querySelector('.character-img'),
      text: scene.querySelector('.character-text'),
      cur: 0,
      target: 0
    });
  });

function computeTargets() {
  const vh = window.innerHeight;
  for (const a of anims) {
    const top = a.scene.offsetTop;
    const range = a.scene.offsetHeight - vh;
    a.target = Math.max(0, Math.min(1, (window.scrollY - top) / range));
  }
}

window.addEventListener('scroll', computeTargets, { passive: true });
window.addEventListener('resize', computeTargets);
computeTargets();

function easeInOut(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

let lastTick = performance.now();
function tick(now) {
  updateThreads(now);
  const dt = Math.min((now - lastTick) / 16.667, 2);
  lastTick = now;

  for (const a of anims) {
    a.cur += (a.target - a.cur) * (1 - Math.exp(-7 * dt));
    if (Math.abs(a.target - a.cur) < 0.0005) a.cur = a.target;
    const p = easeInOut(a.cur);

    const nw = a.img.naturalWidth || 80;
    const nh = a.img.naturalHeight || 80;
    const contain = Math.min(80 / nw, 80 / nh);
    const rw = nw * contain;
    const rh = nh * contain;
    const finalScale = Math.min((window.innerWidth * 0.92) / rw, (window.innerHeight * 0.92) / rh);

    const scale = 0.85 + p * p * (finalScale - 0.85);

    const opacity = p < 0.15 ? p / 0.15 : 1;

    a.img.style.transform = `scale(${scale})`;
    a.img.style.opacity = opacity;

    let textOpacity;
    if (p < 0.15) textOpacity = 0;
    else if (p < 0.3) textOpacity = (p - 0.15) / 0.15;
    else textOpacity = 1;
    textOpacity = Math.max(0, Math.min(1, textOpacity));

    a.text.style.opacity = textOpacity;
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);