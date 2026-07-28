import * as THREE from './vendor/three.module.js';

// Procedural model of the SIS Al Jada Cobras kart.
// Proportions traced from wiring.JPG, adjust.MP4 and home3.MP4:
// silver flat floor pan with a red edge stripe, black tubular frame,
// black bucket seat with a red 4-point harness, spoked wheels, blue battery.
// This is a model, not a photograph, and is captioned as such.

const C = {
  pan: 0xb9bdc1,
  panEdge: 0xe6392b,
  tube: 0x171717,
  tyre: 0x0e0e0e,
  rim: 0xc4c8cc,
  seat: 0x1c1c1c,
  harness: 0xe6392b,
  battery: 0x2f5fa8,
  steer: 0x232323,
};

const LEN = 2.35;
const WID = 1.18;

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.62,
    metalness: opts.metalness ?? 0.25,
  });
}

// Floor pan outline: narrow rounded nose widening to a square tail.
function panShape(inset = 0) {
  const profile = [
    [-1.18, 0.16], [-1.06, 0.30], [-0.88, 0.42], [-0.60, 0.52],
    [-0.20, 0.58], [0.30, 0.59], [0.78, 0.58], [1.02, 0.55], [1.17, 0.50],
  ];
  const s = new THREE.Shape();
  const pts = [];
  profile.forEach(([z, hw]) => pts.push([z, Math.max(0.02, hw - inset)]));
  s.moveTo(pts[0][0], -pts[0][1]);
  pts.forEach(([z, hw]) => s.lineTo(z, -hw));
  for (let i = pts.length - 1; i >= 0; i--) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}

function tube(points, radius, material, closed = false) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    closed,
    'catmullrom',
    0.4,
  );
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 42, radius, 8, closed), material);
}

function wheel(x, z, r, w) {
  const g = new THREE.Group();
  const tyre = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 22), mat(C.tyre, { roughness: 0.9, metalness: 0.05 }));
  tyre.rotation.z = Math.PI / 2;
  g.add(tyre);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.46, r * 0.46, w * 1.06, 18), mat(C.rim, { roughness: 0.35, metalness: 0.7 }));
  rim.rotation.z = Math.PI / 2;
  g.add(rim);
  // spokes — the real wheels are bicycle-style
  for (let i = 0; i < 6; i++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(w * 0.12, r * 0.86, 0.012), mat(C.rim, { metalness: 0.6 }));
    sp.rotation.x = (i / 6) * Math.PI;
    g.add(sp);
  }
  g.position.set(x, r, z);
  return g;
}

export function buildKart() {
  const kart = new THREE.Group();
  const R = 0.235;

  // red edge stripe sits just under and just proud of the pan
  const stripe = new THREE.Mesh(
    new THREE.ExtrudeGeometry(panShape(0), { depth: 0.018, bevelEnabled: false }),
    mat(C.panEdge, { roughness: 0.5 }),
  );
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.y = R * 0.60;
  kart.add(stripe);

  const pan = new THREE.Mesh(
    new THREE.ExtrudeGeometry(panShape(0.045), { depth: 0.02, bevelEnabled: false }),
    mat(C.pan, { roughness: 0.42, metalness: 0.72 }),
  );
  pan.rotation.x = -Math.PI / 2;
  pan.position.y = R * 0.60 + 0.019;
  kart.add(pan);

  const tubeMat = mat(C.tube, { roughness: 0.55, metalness: 0.35 });
  const y0 = R * 0.62 + 0.04;

  // side rails
  [-1, 1].forEach((s) => {
    kart.add(tube([
      [s * 0.40, y0, -1.05], [s * 0.47, y0 + 0.02, -0.70],
      [s * 0.50, y0 + 0.03, -0.10], [s * 0.50, y0 + 0.03, 0.55], [s * 0.44, y0 + 0.02, 1.02],
    ], 0.026, tubeMat));
  });

  // roll hoop behind the seat
  kart.add(tube([
    [-0.46, y0, 0.60], [-0.44, y0 + 0.42, 0.66], [-0.34, y0 + 0.74, 0.70],
    [0, y0 + 0.84, 0.71], [0.34, y0 + 0.74, 0.70], [0.44, y0 + 0.42, 0.66], [0.46, y0, 0.60],
  ], 0.026, tubeMat));

  // hoop bracing back to the tail
  [-1, 1].forEach((s) => {
    kart.add(tube([
      [s * 0.40, y0 + 0.66, 0.70], [s * 0.42, y0 + 0.30, 0.92], [s * 0.43, y0 + 0.02, 1.00],
    ], 0.021, tubeMat));
  });

  // front hoop over the driver's legs
  kart.add(tube([
    [-0.46, y0, -0.36], [-0.38, y0 + 0.26, -0.44], [0, y0 + 0.32, -0.47],
    [0.38, y0 + 0.26, -0.44], [0.46, y0, -0.36],
  ], 0.022, tubeMat));

  // nose bumper
  kart.add(tube([
    [-0.30, y0 + 0.02, -1.02], [-0.16, y0 + 0.04, -1.14], [0.16, y0 + 0.04, -1.14], [0.30, y0 + 0.02, -1.02],
  ], 0.024, tubeMat));

  // bucket seat
  const seatMat = mat(C.seat, { roughness: 0.85, metalness: 0.05 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.09, 0.52), seatMat);
  base.position.set(0, y0 + 0.10, 0.30);
  kart.add(base);
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.11), seatMat);
  backrest.position.set(0, y0 + 0.40, 0.58);
  backrest.rotation.x = -0.20;
  kart.add(backrest);

  // red 4-point harness — the one saturated accent on the car
  const hMat = mat(C.harness, { roughness: 0.75, metalness: 0.05 });
  [-1, 1].forEach((s) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.56, 0.022), hMat);
    strap.position.set(s * 0.14, y0 + 0.42, 0.50);
    strap.rotation.x = -0.20;
    strap.rotation.z = s * 0.10;
    kart.add(strap);
  });
  const lap = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.07, 0.022), hMat);
  lap.position.set(0, y0 + 0.15, 0.14);
  kart.add(lap);

  // battery pack
  const batt = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.20, 0.30), mat(C.battery, { roughness: 0.6 }));
  batt.position.set(0, y0 + 0.14, 0.86);
  kart.add(batt);

  // steering column and bar
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.44, 10), mat(C.steer));
  col.position.set(0, y0 + 0.22, -0.30);
  col.rotation.x = 0.55;
  kart.add(col);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.46, 10), mat(C.steer));
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, y0 + 0.42, -0.38);
  kart.add(bar);

  kart.add(wheel(-(WID / 2 - 0.02), -0.78, R, 0.10));
  kart.add(wheel(WID / 2 - 0.02, -0.78, R, 0.10));
  kart.add(wheel(-(WID / 2 - 0.02), 0.80, R, 0.12));
  kart.add(wheel(WID / 2 - 0.02, 0.80, R, 0.12));

  kart.userData.length = LEN;
  return kart;
}

// Small self-contained renderer used as the moving lap marker.
export function mountMarker(canvas, size) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(size, size, false);

  const scene = new THREE.Scene();
  const kart = buildKart();
  scene.add(kart);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 3.1, 3.0);
  camera.lookAt(0, 0.30, 0);

  scene.add(new THREE.HemisphereLight(0xdfe6ee, 0x0a0a0a, 1.15));
  const key = new THREE.DirectionalLight(0xfff1e0, 1.5);
  key.position.set(2.5, 5, 2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe6392b, 0.7);
  rim.position.set(-3, 1.5, -2.5);
  scene.add(rim);

  return {
    setHeading(rad) { kart.rotation.y = rad; },
    render() { renderer.render(scene, camera); },
    dispose() { renderer.dispose(); },
  };
}
