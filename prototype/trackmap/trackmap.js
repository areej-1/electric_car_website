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
    x: 0.7764, y: 0.2583, status: 'recorded',
    body: 'Set performance targets, study EVGP requirements, choose parts, and turn constraints into a buildable layout.',
    tags: ['Competition rules', 'Component selection', 'Safety planning'],
    media: { type: 'img', src: '../../design.JPG', alt: 'Cobras students at the project room noticeboard' },
  },
  {
    n: '2', name: 'Build + assembly', kicker: 'Make it physical',
    x: 0.9413, y: 0.4877, status: 'recorded',
    body: 'Fit the frame, steering, seat, wheels, controls, and mechanical systems into one working machine.',
    tags: ['Chassis assembly', 'Driver ergonomics', 'Mechanical fit'],
    media: { type: 'video', src: '../../build.MP4', alt: 'Assembly work on the Cobra platform' },
  },
  {
    n: '3', name: 'Wiring + controls', kicker: 'Bring it to life',
    x: 0.7327, y: 0.7991, status: 'recorded',
    body: 'Connect batteries, controller, motor, kill switch, and driver inputs into an organized 48V system.',
    tags: ['Power distribution', 'Control wiring', 'Safe shutdown'],
    media: { type: 'img', src: '../../wiring.JPG', alt: 'Students reviewing the car during systems work' },
  },
  {
    n: '4', name: 'Testing + troubleshooting', kicker: 'Find the weak points',
    x: 0.4998, y: 0.7049, status: 'in progress',
    body: 'Run the car, observe its behavior, diagnose failures, and record what must change before the next session.',
    tags: ['Functional tests', 'Driver feedback', 'Fault diagnosis'],
    media: { type: 'video', src: '../../testing.MP4', alt: 'The kart being driven during a test session' },
  },
  {
    n: '5', name: 'Final adjustments', kicker: 'Prepare to compete',
    x: 0.1334, y: 0.3852, status: 'pending',
    body: 'Refine balance, reliability, safety, and presentation so the car and team are ready for EVGP.',
    tags: ['Weight balance', 'Reliability checks', 'Race preparation'],
    media: { type: 'video', src: '../../adjust.MP4', alt: 'Final adjustment work on the kart' },
  },
  {
    n: 'F', name: 'Race target', kicker: 'The grid', flag: true,
    x: 0.2863, y: 0.2008, status: 'pending',
    body: 'Race target: February 13, 2027. Venue, official timing, driver selection and results remain pending team confirmation.',
    tags: ['Venue pending', 'Timing pending', 'Driver pending'],
  },
];

// The Silverstone Grand Prix centreline, normalised against the rotated plate.
// Taken verbatim from the Astro build (site/src/scripts/track-map-geometry.js),
// which georeferenced it properly. The plate here is the same file, byte for
// byte, so the coordinates carry across unchanged.
//
// Source     27 `highway=raceway` ways forming the only closed cycle through the
//            GP layout, in racing order from the Hamilton Straight: Abbey, Farm
//            Curve, Village, The Loop, Aintree, Brooklands, Luffield, Woodcote,
//            Copse, Maggotts, Becketts, Chapel, Stowe, Vale, Club. The chain
//            measures 5887 m against the official 5891 m, which is what confirms
//            it is the GP layout and not the National, International or Stowe
//            circuits, and not the pit lane.
// Transform  lat/lon to plate pixels as a similarity, found by maximising the
//            plate's own black-top-hat asphalt response under the projected loop
//            and then polished with ICP against the ribbon: scale 1.00971 px/m,
//            rotation -1.4714 degrees, offset (1815.03, 630.81) px. A full affine
//            was tried and rejected — 0.29% anisotropy and no better residual, so
//            the plate really is conformal. Anchors land a median 0.5 px and a
//            mean 1.7 px from the ribbon's own centre ridge, and all 240 fall
//            inside a mask of the visible asphalt.
// Sampling   uniform arc length, 24.8 px apart, so the spline's curvature stays
//            even rather than bunching through close anchors. Index 0 is the
//            start/finish line, in the racing direction.
//
// This replaces two of my own attempts. The first rotated the OSM loop and fitted
// its bounding box to the plate's, which was close but drifted. The second tried
// to polish that by minimising the difference between the pixels under the path
// and the asphalt's tone — it reported an improvement, drove the scale to the
// floor of its own search range, and pulled the whole loop inside the ribbon. In
// a graded greyscale plate, asphalt, grass and gravel are too close for that
// score to mean anything. A black-top-hat response and ICP, which is what the
// Astro build used, measure the ribbon itself instead of its brightness.
//
// The six turn markers are placed by eye and are NOT anchors of this line. Three
// sit on the circuit's shoulder, three on adjacent asphalt, the flag deliberately
// on the pit straight.
const LINE = [
  [0.2929, 0.0892], [0.3027, 0.1011], [0.3124, 0.113], [0.3222, 0.1248],
  [0.3319, 0.1367], [0.3416, 0.1486], [0.3514, 0.1605], [0.3611, 0.1724],
  [0.3709, 0.1843], [0.3806, 0.1962], [0.3904, 0.2081], [0.4001, 0.22],
  [0.4099, 0.2319], [0.4196, 0.2438], [0.4293, 0.2556], [0.4391, 0.2675],
  [0.4488, 0.2795], [0.4585, 0.2914], [0.4682, 0.3034], [0.4778, 0.3157],
  [0.4842, 0.3326], [0.4868, 0.3524], [0.4875, 0.3727], [0.4866, 0.3929],
  [0.4851, 0.413], [0.4835, 0.4332], [0.4819, 0.4533], [0.4809, 0.4735],
  [0.482, 0.4937], [0.4851, 0.5133], [0.4899, 0.5318], [0.4968, 0.5484],
  [0.5045, 0.564], [0.5123, 0.5795], [0.5201, 0.595], [0.5278, 0.6105],
  [0.5356, 0.626], [0.5433, 0.6415], [0.5511, 0.657], [0.5573, 0.6741],
  [0.555, 0.6932], [0.5445, 0.7025], [0.5332, 0.709], [0.5218, 0.7154],
  [0.5104, 0.7219], [0.4998, 0.7309], [0.497, 0.7496], [0.5056, 0.763],
  [0.5167, 0.7711], [0.528, 0.7776], [0.5397, 0.7826], [0.5515, 0.7863],
  [0.5635, 0.7883], [0.5755, 0.7888], [0.5872, 0.7851], [0.5963, 0.7722],
  [0.6041, 0.7567], [0.6123, 0.7418], [0.6203, 0.7266], [0.6281, 0.7113],
  [0.636, 0.6959], [0.6439, 0.6806], [0.6517, 0.6653], [0.6596, 0.6499],
  [0.6675, 0.6346], [0.6754, 0.6193], [0.6833, 0.6039], [0.6911, 0.5886],
  [0.699, 0.5732], [0.7068, 0.5578], [0.7147, 0.5424], [0.7225, 0.527],
  [0.7304, 0.5117], [0.7383, 0.4964], [0.7461, 0.4809], [0.7539, 0.4655],
  [0.7617, 0.4501], [0.7695, 0.4346], [0.7772, 0.4191], [0.785, 0.4036],
  [0.7927, 0.388], [0.8, 0.3719], [0.8042, 0.353], [0.8048, 0.3328],
  [0.8017, 0.3133], [0.7943, 0.2976], [0.783, 0.2914], [0.7711, 0.29],
  [0.7591, 0.2886], [0.7472, 0.2859], [0.737, 0.2755], [0.7303, 0.2588],
  [0.7288, 0.2389], [0.7331, 0.2201], [0.7417, 0.2063], [0.753, 0.1996],
  [0.7648, 0.2023], [0.7757, 0.2108], [0.7866, 0.2195], [0.7975, 0.2279],
  [0.8084, 0.2364], [0.8194, 0.2449], [0.8301, 0.254], [0.8399, 0.2656],
  [0.8491, 0.2786], [0.8577, 0.2929], [0.8654, 0.3084], [0.8724, 0.3249],
  [0.8782, 0.3427], [0.8822, 0.3618], [0.885, 0.3816], [0.8868, 0.4016],
  [0.8885, 0.4217], [0.89, 0.4419], [0.8914, 0.462], [0.8929, 0.4822],
  [0.8943, 0.5023], [0.8958, 0.5225], [0.8972, 0.5426], [0.8986, 0.5628],
  [0.8999, 0.583], [0.9012, 0.6032], [0.9025, 0.6234], [0.9037, 0.6435],
  [0.905, 0.6637], [0.9063, 0.6839], [0.9075, 0.7041], [0.9082, 0.7244],
  [0.9059, 0.7442], [0.9007, 0.7624], [0.8929, 0.7778], [0.8831, 0.7894],
  [0.872, 0.7971], [0.8607, 0.8041], [0.8492, 0.8103], [0.8377, 0.8163],
  [0.8262, 0.8219], [0.8146, 0.827], [0.8028, 0.8313], [0.791, 0.8353],
  [0.7792, 0.8386], [0.7672, 0.8409], [0.7553, 0.843], [0.7433, 0.8449],
  [0.7313, 0.8466], [0.7193, 0.8482], [0.7073, 0.8496], [0.6953, 0.8509],
  [0.6833, 0.8521], [0.6713, 0.8534], [0.6595, 0.8565], [0.6481, 0.8629],
  [0.6372, 0.8717], [0.6272, 0.8828], [0.6168, 0.8927], [0.6049, 0.8955],
  [0.5932, 0.8911], [0.5819, 0.8843], [0.5705, 0.8779], [0.5591, 0.8714],
  [0.5474, 0.8673], [0.5354, 0.8665], [0.5237, 0.871], [0.5133, 0.8809],
  [0.504, 0.8938], [0.4947, 0.9066], [0.4834, 0.9136], [0.4715, 0.9142],
  [0.4601, 0.908], [0.4505, 0.896], [0.4432, 0.88], [0.4365, 0.8631],
  [0.4301, 0.8459], [0.4235, 0.829], [0.4153, 0.8142], [0.4053, 0.8031],
  [0.3946, 0.7939], [0.3839, 0.7846], [0.3732, 0.7753], [0.3625, 0.766],
  [0.3518, 0.7567], [0.3411, 0.7474], [0.3303, 0.7384], [0.3195, 0.7294],
  [0.3088, 0.7205], [0.298, 0.7116], [0.2872, 0.7026], [0.2764, 0.6936],
  [0.2656, 0.6846], [0.2548, 0.6756], [0.2441, 0.6666], [0.2333, 0.6576],
  [0.2225, 0.6485], [0.2118, 0.6395], [0.201, 0.6303], [0.1903, 0.6211],
  [0.1796, 0.612], [0.1689, 0.6028], [0.1583, 0.5932], [0.1477, 0.5834],
  [0.1374, 0.5731], [0.127, 0.5627], [0.1169, 0.5519], [0.1067, 0.541],
  [0.0968, 0.5297], [0.0868, 0.5183], [0.0773, 0.506], [0.0692, 0.4909],
  [0.0642, 0.4726], [0.0623, 0.4526], [0.0638, 0.4325], [0.0683, 0.4138],
  [0.0756, 0.3978], [0.0853, 0.3857], [0.0962, 0.3774], [0.1069, 0.3682],
  [0.1173, 0.358], [0.1274, 0.3468], [0.1372, 0.3351], [0.1467, 0.3227],
  [0.1558, 0.3094], [0.1643, 0.2952], [0.1729, 0.2809], [0.1815, 0.2666],
  [0.1902, 0.2528], [0.1992, 0.2392], [0.2082, 0.2258], [0.2172, 0.2123],
  [0.2241, 0.1965], [0.2191, 0.1789], [0.2104, 0.165], [0.2058, 0.1469],
  [0.21, 0.1285], [0.2185, 0.1141], [0.2276, 0.1009], [0.2378, 0.0901],
  [0.2486, 0.0814], [0.2601, 0.0753], [0.2719, 0.0718], [0.2833, 0.0771],
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
