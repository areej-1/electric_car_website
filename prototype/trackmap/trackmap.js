/* Loaded dynamically, and the failure is swallowed on purpose.

   kart.js imports Three at module load. As a static `import` at the top of this
   file, anything that stops kart.js resolving — a 404 on the vendored Three, a
   parse error, a blocked request — fails this module too, before a single line
   of it runs. That is not a hypothetical: vendor/ was gitignored, so Three was
   404 on the deployed site and the live track map was a satellite photograph
   with no markers, no pan and no zoom, while working perfectly on localhost off
   an untracked file.

   Awaiting it here costs one tick and buys the guarantee that the map itself
   cannot be taken down by the decoration on top of it. */
let mountMarker = null;
try {
  ({ mountMarker } = await import('./kart.js'));
} catch (error) {
  mountMarker = null;
}

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
    x: 0.7829, y: 0.2864, status: 'recorded',
    body: 'Set performance targets, study EVGP requirements, choose parts, and turn constraints into a buildable layout.',
    tags: ['Competition rules', 'Component selection', 'Safety planning'],
    media: { type: 'img', src: '../../design.JPG', alt: 'Cobras students at the project room noticeboard' },
  },
  {
    n: '2', name: 'Build + assembly', kicker: 'Make it physical',
    x: 0.896, y: 0.5033, status: 'recorded',
    body: 'Fit the frame, steering, seat, wheels, controls, and mechanical systems into one working machine.',
    tags: ['Chassis assembly', 'Driver ergonomics', 'Mechanical fit'],
    media: { type: 'video', src: '../../build.MP4', alt: 'Assembly work on the Cobra platform' },
  },
  {
    n: '3', name: 'Wiring + controls', kicker: 'Bring it to life',
    x: 0.7359, y: 0.8184, status: 'recorded',
    body: 'Connect batteries, controller, motor, kill switch, and driver inputs into an organized 48V system.',
    tags: ['Power distribution', 'Control wiring', 'Safe shutdown'],
    media: { type: 'img', src: '../../wiring.JPG', alt: 'Students reviewing the car during systems work' },
  },
  {
    n: '4', name: 'Testing + troubleshooting', kicker: 'Find the weak points',
    x: 0.5055, y: 0.7119, status: 'in progress',
    body: 'Run the car, observe its behavior, diagnose failures, and record what must change before the next session.',
    tags: ['Functional tests', 'Driver feedback', 'Fault diagnosis'],
    media: { type: 'video', src: '../../testing.MP4', alt: 'The kart being driven during a test session' },
  },
  {
    n: '5', name: 'Final adjustments', kicker: 'Prepare to compete',
    x: 0.1253, y: 0.3974, status: 'pending',
    body: 'Refine balance, reliability, safety, and presentation so the car and team are ready for EVGP.',
    tags: ['Weight balance', 'Reliability checks', 'Race preparation'],
    media: { type: 'video', src: '../../adjust.MP4', alt: 'Final adjustment work on the kart' },
  },
  {
    n: 'F', name: 'Race target', kicker: 'The grid', flag: true,
    x: 0.2643, y: 0.1596, status: 'pending',
    body: 'Race target: February 13, 2027. Venue, official timing, driver selection and results remain pending team confirmation.',
    tags: ['Venue pending', 'Timing pending', 'Driver pending'],
  },
];

// The racing line, traced from OpenStreetMap's Silverstone Grand Prix circuit
// rather than drawn by eye.
//
// What was here before was 24 points picked off the picture by hand, and its own
// comment admitted as much. It read as a rough oval that crossed fields and
// buildings and missed every corner the circuit is known for.
//
// These are the real circuit ways from OSM, stitched into one closed loop —
// 5,842 m against the published 5,891 m, which is the check that the geometry is
// the Grand Prix layout and not one of the other circuits on the site. The loop
// is then placed on the plate by rotating it 90 degrees, since the imagery is
// turned to put the long axis across the frame, fitting its extent to the
// plate's, and finally nudging position, scale and angle to minimise the
// difference between the pixels under the path and the asphalt's own luminance.
// That last step is what puts it on the ribbon rather than merely near it: mean
// deviation from the asphalt tone fell from 22.9 to 14.1.
//
// Resampled to a manageable number of points by arc length, so the corners keep
// their shape without carrying all 466.
const LINE = [
  [0.133, 0.3282], [0.1518, 0.3132], [0.1697, 0.2952], [0.187, 0.2755],
  [0.2028, 0.2527], [0.2184, 0.2293], [0.2344, 0.2067], [0.2507, 0.1848],
  [0.2643, 0.1596], [0.2526, 0.1315], [0.2511, 0.0994], [0.2665, 0.0758],
  [0.2843, 0.0577], [0.3041, 0.0471], [0.3243, 0.0495], [0.3405, 0.0715],
  [0.3568, 0.0935], [0.373, 0.1155], [0.3893, 0.1375], [0.4055, 0.1595],
  [0.4218, 0.1815], [0.438, 0.2036], [0.4543, 0.2256], [0.4705, 0.2476],
  [0.4867, 0.2698], [0.5028, 0.2922], [0.5101, 0.3242], [0.5094, 0.3593],
  [0.5055, 0.3938], [0.5015, 0.4284], [0.5004, 0.4633], [0.5056, 0.4973],
  [0.5167, 0.5268], [0.5292, 0.5549], [0.5418, 0.5831], [0.5543, 0.6112],
  [0.5657, 0.6404], [0.5559, 0.6667], [0.5359, 0.6767], [0.5159, 0.6864],
  [0.5055, 0.7119], [0.5221, 0.7318], [0.5417, 0.7437], [0.562, 0.7511],
  [0.5828, 0.7533], [0.6006, 0.7372], [0.6151, 0.7121], [0.6298, 0.6871],
  [0.6442, 0.6617], [0.6587, 0.6364], [0.6732, 0.6111], [0.6877, 0.5858],
  [0.7021, 0.5605], [0.7166, 0.5351], [0.731, 0.5098], [0.7454, 0.4844],
  [0.7598, 0.4589], [0.7742, 0.4334], [0.7885, 0.4078], [0.8027, 0.3822],
  [0.8143, 0.3533], [0.8154, 0.3187], [0.8034, 0.2915], [0.7829, 0.2864],
  [0.7623, 0.2812], [0.7482, 0.2568], [0.7496, 0.2229], [0.7652, 0.2011],
  [0.7853, 0.2043], [0.8037, 0.2208], [0.8223, 0.2369], [0.8408, 0.253],
  [0.857, 0.2749], [0.8711, 0.3008], [0.8826, 0.33], [0.8895, 0.3631],
  [0.8923, 0.3979], [0.8936, 0.4331], [0.8948, 0.4682], [0.896, 0.5033],
  [0.8971, 0.5384], [0.8981, 0.5736], [0.8989, 0.6087], [0.8998, 0.6439],
  [0.9006, 0.679], [0.9007, 0.7142], [0.8931, 0.7466], [0.8781, 0.7705],
  [0.8587, 0.7831], [0.8387, 0.7928], [0.8185, 0.8014], [0.798, 0.8082],
  [0.7775, 0.8137], [0.7567, 0.8165], [0.7359, 0.8184], [0.7151, 0.8198],
  [0.6942, 0.8208], [0.6734, 0.8215], [0.6528, 0.8254], [0.6335, 0.8387],
  [0.6153, 0.8556], [0.5949, 0.8545], [0.5755, 0.8417], [0.556, 0.8295],
  [0.5353, 0.8257], [0.516, 0.8376], [0.4993, 0.8588], [0.4796, 0.868],
  [0.4602, 0.8568], [0.4475, 0.8293], [0.4373, 0.7986], [0.4257, 0.7696],
  [0.4085, 0.7499], [0.3904, 0.7323], [0.3724, 0.7148], [0.3543, 0.6972],
  [0.3361, 0.6802], [0.3178, 0.6633], [0.2995, 0.6464], [0.2813, 0.6293],
  [0.2631, 0.6123], [0.2449, 0.5952], [0.2267, 0.578], [0.2086, 0.5606],
  [0.1905, 0.5432], [0.1728, 0.5247], [0.1554, 0.5052], [0.1384, 0.485],
  [0.1217, 0.4639], [0.1215, 0.4319], [0.1253, 0.3974], [0.1292, 0.3628],
];

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const stage = document.getElementById('stage');
const world = document.getElementById('world');
const markersEl = document.getElementById('markers');
const panel = document.getElementById('panel');
const lineSvg = document.getElementById('line');
const kartCanvas = document.getElementById('kart');

// ---- view state -------------------------------------------------------
const view = { s: 1, tx: 0, ty: 0 };
const target = { s: 1, tx: 0, ty: 0 };
let minScale = 1;
let active = -1;
let lapT = 0;
let lapTarget = 0;

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
  lapTarget = i / (TURNS.length - 1);
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

// ---- kart marker ------------------------------------------------------
const MK = 78;
/* The kart marker is the one part of this map that needs WebGL, and WebGL is not
   everywhere: an old phone, a blocked or blacklisted GPU, software rendering
   turned off, a headless browser. Three throws "Error creating WebGL context"
   when it cannot get one, and unguarded that exception escapes at module top
   level and takes the entire rest of the file with it — fit() never runs, the
   plate never scales, pan and zoom are never wired, and the reader gets a dead
   page instead of a map. The lap marker is decoration; the circuit is the point.

   So a failure here costs the moving kart and nothing else. The stub keeps the
   three methods the frame loop calls, so the loop does not need to know. */
const marker = (() => {
  try {
    if (!mountMarker) throw new Error('kart.js unavailable');
    return mountMarker(kartCanvas, MK);
  } catch (error) {
    kartCanvas.hidden = true;
    return { setHeading() {}, setBodywork() {}, render() {} };
  }
})();

function pointAt(t) {
  const n = LINE.length;
  const f = ((t % 1) + 1) % 1 * n;
  const i = Math.floor(f), frac = f - i;
  const a = LINE[i % n], b = LINE[(i + 1) % n];
  return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac,
    (b[0] - a[0]) * PW, (b[1] - a[1]) * PH];
}

// ---- one RAF loop, direct DOM writes, dirty-checked --------------------
let prev = performance.now();
let lastTransform = '';
let lastScale = -1;
let lastKart = '';

function frame(now) {
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;
  const k = REDUCED ? 1 : 1 - Math.exp(-dt * 7.5);

  view.s += (target.s - view.s) * k;
  view.tx += (target.tx - view.tx) * k;
  view.ty += (target.ty - view.ty) * k;
  lapT += (lapTarget - lapT) * (REDUCED ? 1 : 1 - Math.exp(-dt * 3.2));

  const tf = `translate(${view.tx.toFixed(2)}px,${view.ty.toFixed(2)}px) scale(${view.s.toFixed(5)})`;
  if (tf !== lastTransform) { world.style.transform = tf; lastTransform = tf; }

  if (Math.abs(view.s - lastScale) > 0.0002) {
    const inv = (1 / view.s).toFixed(4);
    markersEl.style.setProperty('--inv', inv);
    kartCanvas.style.setProperty('--inv', inv);
    lastScale = view.s;
  }

  const [px, py, dx, dy] = pointAt(lapT * 0.999);
  const kt = `translate(${(px * PW).toFixed(1)}px,${(py * PH).toFixed(1)}px)`;
  if (kt !== lastKart) { kartCanvas.style.translate = `${(px * PW - MK / 2).toFixed(1)}px ${(py * PH - MK / 2).toFixed(1)}px`; lastKart = kt; }
  marker.setHeading(Math.atan2(-dx, -dy));
  // the car gains its white bodywork as the build stages progress
  marker.setBodywork(lapT);
  marker.render();

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
