/* ---------- Arabic ----------
   This map runs in its own document inside an iframe on trackmap.html, so the
   site's translator never reaches it — a TreeWalker over the parent stops at the
   frame boundary. Reaching in would not be enough either: the turn panel is
   rebuilt from TURNS on every click, so anything swapped in once is gone the
   moment a reader opens a turn.

   Strings come from the site's own arabic.js, loaded by index.html, so a
   sentence that appears both here and on a normal page has exactly one Arabic
   translation. If that file is missing — this prototype opened straight from a
   checkout — T() is the identity function and everything stays English.

   Language follows the embedding page, or ?lang=ar when opened standalone. */
const LANG = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (q) return q.startsWith('ar') ? 'ar' : 'en';
  // localStorage first, and deliberately: it is the parent's own source of
  // truth for language and it is readable the instant this script runs. Reading
  // parent.document.documentElement.lang instead would be a race — site.js sits
  // at the end of the parent's body and sets that attribute, but this frame can
  // start parsing before it gets there, and then the map would render English on
  // an Arabic page depending on network timing.
  try {
    const stored = localStorage.getItem('cobras_lang');
    if (stored) return stored.startsWith('ar') ? 'ar' : 'en';
  } catch (error) { /* storage blocked: fall through */ }
  try {
    if (parent !== window && parent.document.documentElement.lang.startsWith('ar')) return 'ar';
  } catch (error) { /* cross-origin embed: fall through to the default */ }
  return document.documentElement.lang.startsWith('ar') ? 'ar' : 'en';
})();
const T = (text) => (LANG === 'ar' && globalThis.CobrasArabic
  ? globalThis.CobrasArabic.translateText('prototype/trackmap', text)
  : text);

/* The zoom hint names a key, and which key it is depends on the machine. ⌘ does
   not exist on a Windows keyboard and renders as a symbol nobody there can
   press; Ctrl exists on a Mac but ctrl+wheel is the system zoom gesture, so
   telling a Mac reader to use it is worse than saying nothing. The wheel handler
   accepts both regardless — this only corrects what the label claims. */
const APPLE = /Mac|iPhone|iPad|iPod/.test(navigator.platform || '')
  || /Mac OS X/.test(navigator.userAgent);
const zoomKey = (text) => text
  .replace('ctrl or ⌘', APPLE ? '⌘' : 'Ctrl')
  .replace('ctrl أو ⌘', APPLE ? '⌘' : 'Ctrl');

// Plate intrinsic size. The graded Silverstone derivative is rotated 90 degrees
// clockwise so the circuit's long axis runs horizontally and the whole lap fits
// a landscape viewport.
const PW = 2060;
const PH = 1220;

// Turn anchors, normalised against the plate. Traced against the visible ribbon.
const TURNS = [
  {
    n: '1', name: 'Design + planning', kicker: 'Start with the rules',
    x: 0.7918, y: 0.3002, status: 'recorded',
    body: 'Set performance targets, study EVGP requirements, choose parts, and turn constraints into a buildable layout.',
    tags: ['Competition rules', 'Component selection', 'Safety planning'],
    media: { type: 'img', src: '../../design.JPG', alt: 'Cobras students at the project room noticeboard' },
  },
  {
    n: '2', name: 'Build + assembly', kicker: 'Make it physical',
    x: 0.9249, y: 0.5032, status: 'recorded',
    body: 'Fit the frame, steering, seat, wheels, controls, and mechanical systems into one working machine.',
    tags: ['Chassis assembly', 'Driver ergonomics', 'Mechanical fit'],
    media: { type: 'video', src: '../../build.MP4', alt: 'Assembly work on the Cobra platform' },
  },
  {
    n: '3', name: 'Wiring + controls', kicker: 'Bring it to life',
    x: 0.7309, y: 0.8955, status: 'recorded',
    body: 'Connect batteries, controller, motor, kill switch, and driver inputs into an organized 48V system.',
    tags: ['Power distribution', 'Control wiring', 'Safe shutdown'],
    media: { type: 'img', src: '../../wiring.JPG', alt: 'Students reviewing the car during systems work' },
  },
  {
    n: '4', name: 'Testing + troubleshooting', kicker: 'Find the weak points',
    x: 0.5103, y: 0.752, status: 'in progress',
    body: 'Run the car, observe its behavior, diagnose failures, and record what must change before the next session.',
    tags: ['Functional tests', 'Driver feedback', 'Fault diagnosis'],
    media: { type: 'video', src: '../../testing.MP4', alt: 'The kart being driven during a test session' },
  },
  {
    n: '5', name: 'Final adjustments', kicker: 'Prepare to compete',
    x: 0.0955, y: 0.3472, status: 'pending',
    body: 'Refine balance, reliability, safety, and presentation so the car and team are ready for EVGP.',
    tags: ['Weight balance', 'Reliability checks', 'Race preparation'],
    media: { type: 'video', src: '../../adjust.MP4', alt: 'Final adjustment work on the kart' },
  },
  {
    n: 'F', name: 'Race target', kicker: 'The grid', flag: true,
    x: 0.2156, y: 0.1698, status: 'pending',
    body: 'Race target: February 13, 2027. Venue, official timing, driver selection and results remain pending team confirmation.',
    tags: ['Venue pending', 'Timing pending', 'Driver pending'],
  },
];

// The racing line, traced from OpenStreetMap's Silverstone Grand Prix circuit.
//
// The circuit's raceway ways are stitched into one closed loop by shared
// endpoints, discarding the pit lanes and the other circuits on the site. The
// check that this is the Grand Prix layout and not one of its neighbours is the
// perimeter: 5,842 m against a published 5,891 m.
//
// Placing it on the plate is a rotation and a fit, and nothing more. Rotate 90
// degrees, because the imagery is turned to put the circuit's long axis across
// the frame — the loop's bounding box comes out at 1.625 against the plate's
// 1.689, so it very nearly fills it — then map that extent onto the plate's.
//
// There was an extra step here for a while that searched position, scale and
// angle to minimise the difference between the pixels under the path and the
// asphalt's tone. It reported an improvement and made the line visibly worse:
// it drove the scale to 0.90, the floor of its own search range, and pulled the
// whole loop inside the ribbon. Asphalt, grass and gravel are too close in a
// graded greyscale plate for that score to mean what it claims. The number said
// one thing and the picture said another, and the picture was right.
//
// Resampled by arc length so the corners keep their shape without carrying all
// 466 points.
const LINE = [
  [0.0748, 0.3646], [0.0955, 0.3472], [0.1152, 0.3265], [0.134, 0.3036],
  [0.1512, 0.2775], [0.1681, 0.2506], [0.1855, 0.2249], [0.2033, 0.1998],
  [0.2156, 0.1698], [0.2008, 0.1403], [0.2011, 0.1044], [0.2183, 0.0781],
  [0.2381, 0.0583], [0.2603, 0.0468], [0.2822, 0.0529], [0.3006, 0.0768],
  [0.319, 0.1005], [0.3374, 0.1242], [0.3559, 0.1479], [0.3743, 0.1717],
  [0.3927, 0.1954], [0.4111, 0.2191], [0.4296, 0.2429], [0.448, 0.2666],
  [0.4663, 0.2905], [0.4845, 0.3147], [0.4935, 0.3498], [0.4937, 0.3888],
  [0.4903, 0.4275], [0.4867, 0.4662], [0.4865, 0.5052], [0.4931, 0.5425],
  [0.5062, 0.5747], [0.5206, 0.6052], [0.5351, 0.6358], [0.5496, 0.6663],
  [0.5633, 0.6977], [0.5546, 0.7288], [0.5325, 0.7405], [0.5103, 0.752],
  [0.4985, 0.7801], [0.517, 0.802], [0.5389, 0.8147], [0.5615, 0.8227],
  [0.5847, 0.825], [0.6045, 0.8075], [0.6202, 0.7788], [0.6361, 0.7502],
  [0.6517, 0.7213], [0.6673, 0.6924], [0.6829, 0.6635], [0.6985, 0.6346],
  [0.7141, 0.6056], [0.7297, 0.5767], [0.7453, 0.5477], [0.7609, 0.5188],
  [0.7764, 0.4897], [0.7918, 0.4605], [0.8072, 0.4313], [0.8226, 0.402],
  [0.8331, 0.3677], [0.8312, 0.3293], [0.8148, 0.304], [0.7918, 0.3002],
  [0.7692, 0.293], [0.7548, 0.2635], [0.7585, 0.226], [0.7773, 0.2048],
  [0.7995, 0.2125], [0.8202, 0.2301], [0.841, 0.2472], [0.8616, 0.265],
  [0.8797, 0.2893], [0.8955, 0.3179], [0.9085, 0.3502], [0.9165, 0.3868],
  [0.9203, 0.4254], [0.9227, 0.4643], [0.9249, 0.5032], [0.9271, 0.5422],
  [0.9294, 0.5811], [0.9313, 0.6201], [0.9332, 0.6591], [0.9351, 0.6981],
  [0.9369, 0.7371], [0.9377, 0.7762], [0.9291, 0.8122], [0.912, 0.8382],
  [0.8904, 0.8522], [0.8682, 0.8632], [0.8458, 0.8732], [0.8231, 0.8812],
  [0.8002, 0.8873], [0.7772, 0.8908], [0.754, 0.8934], [0.7309, 0.8955],
  [0.7077, 0.897], [0.6846, 0.8984], [0.6618, 0.9049], [0.6409, 0.9216],
  [0.6205, 0.9395], [0.5978, 0.9345], [0.5761, 0.9209], [0.5541, 0.9087],
  [0.5311, 0.9075], [0.5106, 0.9245], [0.4922, 0.9483], [0.4696, 0.9545],
  [0.449, 0.9382], [0.4352, 0.9069], [0.4234, 0.8732], [0.4089, 0.843],
  [0.389, 0.8229], [0.3687, 0.8041], [0.3484, 0.7853], [0.3281, 0.7665],
  [0.3075, 0.7483], [0.287, 0.7302], [0.2665, 0.712], [0.246, 0.6938],
  [0.2255, 0.6755], [0.205, 0.6572], [0.1846, 0.6387], [0.1642, 0.6201],
  [0.1438, 0.6014], [0.1239, 0.5815], [0.1043, 0.5606], [0.0851, 0.5388],
  [0.0662, 0.5161], [0.0647, 0.4808], [0.0681, 0.442], [0.0714, 0.4033],
];

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const stage = document.getElementById('stage');
const world = document.getElementById('world');
const markersEl = document.getElementById('markers');
const panel = document.getElementById('panel');
const lineSvg = document.getElementById('line');

// ---- view state -------------------------------------------------------
const view = { s: 1, tx: 0, ty: 0 };
const target = { s: 1, tx: 0, ty: 0 };
let minScale = 1;
let active = -1;

// Cover-fit, not contain: the plate fills the viewport and the surplus axis is
// pannable. A letterboxed portrait plate in a landscape window reads as a picture,
// not a place.
function fit() {
  const r = stage.getBoundingClientRect();
  if (!r.width || !r.height) return;
  minScale = Math.max(r.width / PW, r.height / PH);
  const s = minScale;
  Object.assign(target, { s, tx: (r.width - PW * s) / 2, ty: (r.height - PH * s) / 2 });
  if (view.s === 1 && view.tx === 0) Object.assign(view, target);
}

function clamp() {
  const r = stage.getBoundingClientRect();
  target.s = Math.min(Math.max(target.s, minScale), minScale * 6);
  const w = PW * target.s;
  const h = PH * target.s;
  target.tx = w <= r.width ? (r.width - w) / 2 : Math.min(0, Math.max(r.width - w, target.tx));
  target.ty = h <= r.height ? (r.height - h) / 2 : Math.min(0, Math.max(r.height - h, target.ty));
}

// Centre on the visible area, not the whole stage: with the detail panel open the
// right of the viewport is occluded, and centring there hides the turn behind it.
function flyTo(nx, ny, scale, panelOpen = false) {
  const r = stage.getBoundingClientRect();
  const occluded = panelOpen ? panel.getBoundingClientRect().width : 0;
  target.s = scale;
  target.tx = (r.width - occluded) / 2 - nx * PW * scale;
  target.ty = r.height / 2 - ny * PH * scale;
  clamp();
}

// ---- markers ----------------------------------------------------------
TURNS.forEach((t, i) => {
  const b = document.createElement('button');
  b.className = 'marker' + (t.flag ? ' is-flag' : '') + (t.x > 0.6 ? ' is-left' : '');
  b.type = 'button';
  b.style.left = t.x * PW + 'px';
  b.style.top = t.y * PH + 'px';
  b.setAttribute('aria-label', `${t.flag ? T('Race target') : T('Turn') + ' ' + t.n}: ${T(t.name)}`);
  b.innerHTML = `<span class="dot">${t.flag ? '' : t.n}</span><span class="lbl">${T(t.name)}</span>`;
  b.addEventListener('click', (e) => { e.stopPropagation(); select(i); });
  markersEl.appendChild(b);
});

// Catmull-Rom through the anchors, emitted as cubic beziers so the line reads
// as a racing line rather than a chain of chords.
function smoothClosedPath(pts) {
  const n = pts.length;
  const P = (i) => pts[((i % n) + n) % n];
  let d = `M ${(P(0)[0] * PW).toFixed(1)} ${(P(0)[1] * PH).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${(c1[0] * PW).toFixed(1)} ${(c1[1] * PH).toFixed(1)},` +
         ` ${(c2[0] * PW).toFixed(1)} ${(c2[1] * PH).toFixed(1)},` +
         ` ${(p2[0] * PW).toFixed(1)} ${(p2[1] * PH).toFixed(1)}`;
  }
  return d + ' Z';
}
lineSvg.innerHTML =
  `<path d="${smoothClosedPath(LINE)}" fill="none" stroke="#E6392B" stroke-opacity=".42"
     stroke-width="7" stroke-linecap="round"/>`;
lineSvg.setAttribute('viewBox', `0 0 ${PW} ${PH}`);

// ---- panel ------------------------------------------------------------
function select(i) {
  active = i;
  const t = TURNS[i];
  flyTo(t.x, t.y, minScale * 2.2, true);

  panel.innerHTML = `
    <button class="close" type="button" aria-label="${T('Close')}">&times;</button>
    <p class="kicker">${t.flag ? T('Chequered flag') : T('Turn') + ' ' + t.n} · ${T(t.kicker)}</p>
    <h2>${T(t.name)}</h2>
    <p class="status s-${t.status.replace(' ', '-')}">
      <span class="pip" aria-hidden="true"></span>${T(t.status)}</p>
    <p class="body">${T(t.body)}</p>
    <ul class="tags">${t.tags.map((x) => `<li>${T(x)}</li>`).join('')}</ul>
    ${t.media ? (t.media.type === 'video'
      ? `<video src="${t.media.src}" muted loop autoplay playsinline aria-label="${T(t.media.alt)}"></video>`
      : `<img src="${t.media.src}" alt="${T(t.media.alt)}">`) : ''}`;
  panel.classList.add('open');
  panel.querySelector('.close').addEventListener('click', close);
  [...markersEl.children].forEach((m, j) => m.classList.toggle('is-active', j === i));
}

function close() {
  active = -1;
  panel.classList.remove('open');
  [...markersEl.children].forEach((m) => m.classList.remove('is-active'));
  fit();
}

stage.addEventListener('click', (e) => { if (e.target === stage || e.target === world) close(); });
panel.addEventListener('click', (e) => e.stopPropagation());

// ---- pan + zoom -------------------------------------------------------
let dragging = false, lastX = 0, lastY = 0, moved = 0;
stage.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.marker') || e.target.closest('#panel')) return;
  dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY;
  stage.setPointerCapture(e.pointerId); stage.classList.add('grabbing');
});
stage.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
  target.tx += dx; target.ty += dy;
  view.tx += dx; view.ty += dy;
  clamp();
});
stage.addEventListener('pointerup', (e) => {
  dragging = false; stage.classList.remove('grabbing');
  try { stage.releasePointerCapture(e.pointerId); } catch {}
});
// Zoom only with a modifier. This runs inside an iframe on trackmap.html and
// car.html, so cancelling every wheel event does not merely stop this element
// scrolling — it stops the PARENT page scrolling too, with no way out but to
// move the pointer off the frame. ctrlKey also covers the trackpad pinch
// gesture, which browsers report as ctrl+wheel, so pinch still zooms.
stage.addEventListener('wheel', (e) => {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  const r = stage.getBoundingClientRect();
  const cx = e.clientX - r.left, cy = e.clientY - r.top;
  const wx = (cx - target.tx) / target.s, wy = (cy - target.ty) / target.s;
  target.s *= Math.exp(-e.deltaY * 0.0016);
  target.s = Math.min(Math.max(target.s, minScale), minScale * 6);
  target.tx = cx - wx * target.s; target.ty = cy - wy * target.s;
  clamp();
}, { passive: false });

addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return close();
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(Math.min(TURNS.length - 1, active + 1)); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(Math.max(0, active <= 0 ? 0 : active - 1)); }
  if (e.key === 'Home') { e.preventDefault(); select(0); }
  if (e.key === 'End') { e.preventDefault(); select(TURNS.length - 1); }
});
// Window resize alone misses the case where the stage is laid out after first
// paint, which silently locks in a wrong fit scale.
new ResizeObserver(() => {
  const before = minScale;
  if (active < 0) fit();
  else { fit(); const t = TURNS[active]; flyTo(t.x, t.y, minScale * 2.2, true); }
  if (before !== minScale && active < 0) Object.assign(view, target);
}).observe(stage);

// ---- one RAF loop, direct DOM writes, dirty-checked --------------------
let prev = performance.now();
let lastTransform = '';
let lastScale = -1;

function frame(now) {
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;
  const k = REDUCED ? 1 : 1 - Math.exp(-dt * 7.5);

  view.s += (target.s - view.s) * k;
  view.tx += (target.tx - view.tx) * k;
  view.ty += (target.ty - view.ty) * k;

  const tf = `translate(${view.tx.toFixed(2)}px,${view.ty.toFixed(2)}px) scale(${view.s.toFixed(5)})`;
  if (tf !== lastTransform) { world.style.transform = tf; lastTransform = tf; }

  if (Math.abs(view.s - lastScale) > 0.0002) {
    const inv = (1 / view.s).toFixed(4);
    markersEl.style.setProperty('--inv', inv);
    lastScale = view.s;
  }


  requestAnimationFrame(frame);
}

/* The static chrome, done once. The turn panel above is rebuilt per click and
   translates itself; these nodes are written in the markup and never touched
   again. dir/lang go on <html> so Arabic reads right-to-left, which is safe here
   because the plate is positioned by explicit transforms in pixel space, not by
   the inline direction. */
if (LANG === 'ar') {
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  const hud = document.getElementById('hud');
  hud.querySelector('h1').textContent = T('TRACK MAP');
  hud.querySelector('p').textContent = T('Five turns from first sketch to the grid · SIS Al Jada Cobras');
  const hint = document.getElementById('hint');
  hint.textContent = T(hint.textContent.trim());
  const plate = document.getElementById('plate');
  plate.alt = T(plate.alt);
  document.querySelectorAll('#credit [data-tm]').forEach((node) => {
    node.textContent = T(node.textContent.trim());
  });
}

// Outside the Arabic branch, because the English hint is written in the markup
// rather than set above and still names the wrong key on Windows.
function hintKeyPass() {
  const hint = document.getElementById('hint');
  if (hint) hint.textContent = zoomKey(hint.textContent);
}
hintKeyPass();

const img = document.getElementById('plate');
function start() { fit(); requestAnimationFrame(frame); }
if (img.complete) start(); else img.addEventListener('load', start);
