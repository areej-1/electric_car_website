import * as THREE from './vendor/three.module.js';

// Procedural model of the SIS Al Jada Cobras kart.
//
// Traced from docs/car-reference/ — principally wiring.JPG (bare chassis, high 3/4),
// the testing-* frames (left side, driver seated) and the team's photograph of the
// bodied car. Nothing here is invented: every part corresponds to something visible
// in those images.
//
// The real car has two states, and so does this model:
//   bare    — brushed aluminium pan, exposed black tube frame, handlebar steering
//   bodied  — the same chassis under white composite bodywork with the cobra livery
// setBodywork() crossfades between them, which is what lets the Track Map show the
// car gaining its body as the build stages progress.

const C = {
  pan: 0xc3c7ca,        // brushed aluminium floor pan
  panTrim: 0xe6392b,    // red edge trim around the pan rim
  tube: 0x141414,       // black tubular frame
  tyre: 0x0d0d0d,
  rim: 0xd2d6da,        // chrome 5-spoke mag
  hub: 0xa9adb1,
  seat: 0x1b1b1b,
  harness: 0xe6392b,    // red 4-point harness
  controller: 0x2f5fa8, // blue component by the seat base
  body: 0xf2f0ec,       // white composite bodywork
  bodyTrim: 0xe6392b,
  livery: 0xc9a227,
};

// Overall proportions, metres. Wheelbase and track read off the side and 3/4 frames.
const R_REAR = 0.235;
const R_FRONT = 0.215;
const TRACK = 1.16;

function mat(color, o = {}) {
  const Ctor = o.clearcoat ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
  const p = {
    color,
    roughness: o.roughness ?? 0.6,
    metalness: o.metalness ?? 0.25,
    transparent: o.transparent ?? false,
    opacity: o.opacity ?? 1,
    side: o.side ?? THREE.FrontSide,
    envMapIntensity: o.envMapIntensity ?? 1.0,
  };
  if (o.clearcoat) { p.clearcoat = o.clearcoat; p.clearcoatRoughness = o.clearcoatRoughness ?? 0.08; }
  return new Ctor(p);
}

// Shapes are authored as [longitudinal z, half-width] pairs, but ExtrudeGeometry
// builds in XY and we lay it flat with rotation.x = -PI/2, which maps
// (shape.x, shape.y) -> (world.x, -world.z). So the shape must be emitted as
// (±halfWidth, -z) for the car's length to run along Z, matching where the wheels,
// seat and handlebars are placed. Emitting (z, ±halfWidth) puts the body across
// the wheelbase instead.
function outline(half, inset) {
  const s = new THREE.Shape();
  const pts = half.map(([z, hw]) => [z, Math.max(0.02, hw - inset)]);
  s.moveTo(-pts[0][1], -pts[0][0]);
  pts.forEach(([z, hw]) => s.lineTo(-hw, -z));
  for (let i = pts.length - 1; i >= 0; i--) s.lineTo(pts[i][1], -pts[i][0]);
  s.closePath();
  return s;
}

// Floor pan outline: rounded nose, widening to a square tail. From wiring.JPG.
function panProfile(inset = 0) {
  return outline([
    [-1.20, 0.10], [-1.14, 0.26], [-1.02, 0.38], [-0.84, 0.47],
    [-0.55, 0.54], [-0.15, 0.58], [0.30, 0.59], [0.75, 0.58],
    [1.00, 0.55], [1.14, 0.48], [1.18, 0.36],
  ], inset);
}

// Bodywork outline: markedly narrower than the pan so the wheels stand outboard
// on their stub axles, and longer and lower than the chassis. From the team's
// photograph of the bodied car.
function bodyProfile(inset = 0) {
  return outline([
    [-1.16, 0.05], [-1.08, 0.18], [-0.94, 0.28], [-0.70, 0.35],
    [-0.30, 0.39], [0.15, 0.40], [0.60, 0.39], [0.90, 0.35], [1.08, 0.27], [1.14, 0.16],
  ], inset);
}

function tube(points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.35,
  );
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 40, radius, 8, false), material);
}

// Chrome 5-spoke mag on a stub axle. Front and rear differ in width and diameter.
function wheel(x, z, r, w) {
  const g = new THREE.Group();
  // torus reads as a tyre with a sidewall; a plain cylinder reads as a hockey puck
  const tyre = new THREE.Mesh(
    new THREE.TorusGeometry(r * 0.80, r * 0.22, 12, 30), mat(C.tyre, { roughness: 0.92, metalness: 0.04 }),
  );
  tyre.rotation.y = Math.PI / 2;
  tyre.scale.x = Math.max(0.5, w / (r * 0.44));
  g.add(tyre);

  const rimMat = mat(C.rim, { roughness: 0.14, metalness: 1.0, envMapIntensity: 1.5 });

  // Open 5-spoke mag: a rim ring, five spokes reaching it, and a small hub. The
  // spokes must reach PAST the barrel radius or they are buried inside it and the
  // wheel reads as a plain black disc.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.66, r * 0.075, 10, 28), rimMat);
  ring.rotation.y = Math.PI / 2;
  g.add(ring);

  const dish = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.20, r * 0.20, w * 0.70, 18), rimMat);
  dish.rotation.z = Math.PI / 2;
  g.add(dish);

  for (let i = 0; i < 5; i++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(w * 0.42, r * 1.36, r * 0.15), rimMat);
    sp.rotation.x = (i / 5) * Math.PI;
    g.add(sp);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.12, w * 1.30, 14), mat(C.hub, { metalness: 0.9, roughness: 0.28 }));
  hub.rotation.z = Math.PI / 2;
  g.add(hub);

  g.position.set(x, r, z);
  return g;
}

export function buildKart() {
  const kart = new THREE.Group();
  const PAN_Y = R_REAR * 0.56;

  // ---- floor pan + red edge trim ----
  const trim = new THREE.Mesh(
    new THREE.ExtrudeGeometry(panProfile(0), { depth: 0.016, bevelEnabled: false }),
    mat(C.panTrim, { roughness: 0.45 }),
  );
  trim.rotation.x = -Math.PI / 2;
  trim.position.y = PAN_Y;
  kart.add(trim);

  const pan = new THREE.Mesh(
    new THREE.ExtrudeGeometry(panProfile(0.035), { depth: 0.018, bevelEnabled: false }),
    mat(C.pan, { roughness: 0.34, metalness: 0.82 }),
  );
  pan.rotation.x = -Math.PI / 2;
  pan.position.y = PAN_Y + 0.017;
  kart.add(pan);

  // ---- black tubular frame ----
  const tubeMat = mat(C.tube, { roughness: 0.5, metalness: 0.32 });
  const y0 = PAN_Y + 0.06;

  [-1, 1].forEach((s) => {
    kart.add(tube([
      [s * 0.38, y0, -1.02], [s * 0.45, y0 + 0.02, -0.66],
      [s * 0.48, y0 + 0.03, -0.05], [s * 0.48, y0 + 0.03, 0.58], [s * 0.42, y0 + 0.02, 1.02],
    ], 0.024, tubeMat));
  });

  // seat-back hoop
  kart.add(tube([
    [-0.44, y0, 0.56], [-0.42, y0 + 0.40, 0.64], [-0.30, y0 + 0.70, 0.68],
    [0, y0 + 0.78, 0.69], [0.30, y0 + 0.70, 0.68], [0.42, y0 + 0.40, 0.64], [0.44, y0, 0.56],
  ], 0.024, tubeMat));

  [-1, 1].forEach((s) => {
    kart.add(tube([
      [s * 0.36, y0 + 0.62, 0.68], [s * 0.40, y0 + 0.26, 0.90], [s * 0.41, y0 + 0.02, 1.00],
    ], 0.019, tubeMat));
    // diagonal brace forward, visible in wiring.JPG
    kart.add(tube([
      [s * 0.46, y0 + 0.02, 0.10], [s * 0.30, y0 + 0.16, -0.30], [s * 0.10, y0 + 0.20, -0.62],
    ], 0.018, tubeMat));
  });

  // ---- seat + harness ----
  const seatMat = mat(C.seat, { roughness: 0.88, metalness: 0.04 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.50), seatMat);
  base.position.set(0, y0 + 0.09, 0.26);
  kart.add(base);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.09), seatMat);
  back.position.set(0, y0 + 0.34, 0.54);
  back.rotation.x = -0.17;
  kart.add(back);

  const hMat = mat(C.harness, { roughness: 0.78, metalness: 0.04 });
  [-1, 1].forEach((s) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.60, 0.02), hMat);
    strap.position.set(s * 0.13, y0 + 0.44, 0.485);
    strap.rotation.set(-0.17, 0, s * 0.09);
    kart.add(strap);
  });
  const lap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.02), hMat);
  lap.position.set(0, y0 + 0.14, 0.10);
  kart.add(lap);

  // ---- handlebar steering (NOT a wheel) ----
  const barMat = mat(0x1e1e1e, { roughness: 0.45, metalness: 0.4 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.40, 12), barMat);
  stem.position.set(0, y0 + 0.22, -0.30);
  stem.rotation.x = 0.42;
  kart.add(stem);
  kart.add(tube([
    [-0.30, y0 + 0.38, -0.34], [-0.14, y0 + 0.42, -0.44], [0, y0 + 0.43, -0.46],
    [0.14, y0 + 0.42, -0.44], [0.30, y0 + 0.38, -0.34],
  ], 0.017, barMat));
  [-1, 1].forEach((s) => {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.13, 12), mat(0x0d0d0d, { roughness: 0.9 }));
    grip.position.set(s * 0.26, y0 + 0.39, -0.36);
    grip.rotation.set(0, 0, Math.PI / 2 - s * 0.32);
    kart.add(grip);
  });

  // ---- steering tie-rods along the pan ----
  [-1, 1].forEach((s) => {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.52, 8), mat(0xb6babe, { metalness: 0.85, roughness: 0.3 }));
    rod.position.set(s * 0.22, PAN_Y + 0.06, -0.66);
    rod.rotation.set(Math.PI / 2, 0, s * 0.30);
    kart.add(rod);
  });

  // ---- blue controller by the seat base ----
  const ctl = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.11, 0.13), mat(C.controller, { roughness: 0.55 }));
  ctl.position.set(-0.20, y0 + 0.10, 0.02);
  kart.add(ctl);

  // ---- wheels ----
  // Wheels sit outboard of the bodywork on stub axles — clear of the shell, as in
  // the photographs, not tucked under it.
  kart.add(wheel(-(TRACK / 2), -0.72, R_FRONT, 0.09));
  kart.add(wheel(TRACK / 2, -0.72, R_FRONT, 0.09));
  kart.add(wheel(-(TRACK / 2), 0.80, R_REAR, 0.13));
  kart.add(wheel(TRACK / 2, 0.80, R_REAR, 0.13));

  // stub axles bridging pan edge to hub
  [[-1, -0.72, R_FRONT], [1, -0.72, R_FRONT], [-1, 0.80, R_REAR], [1, 0.80, R_REAR]].forEach(([s, z, r]) => {
    const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.18, 10), mat(0x2a2a2a, { metalness: 0.7, roughness: 0.4 }));
    ax.rotation.z = Math.PI / 2;
    ax.position.set(s * (TRACK / 2 - 0.10), r, z);
    kart.add(ax);
  });

  // ---- white composite bodywork (toggleable) ----
  const body = new THREE.Group();
  // automotive paint: low roughness base under a clearcoat
  const bodyMat = mat(C.body, { roughness: 0.35, metalness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 1.2 });

  // Low bathtub shell: narrow outline with the cockpit cut out of it. Thin walls —
  // this is a composite shell, not a moulded block.
  const shell = bodyProfile(0);
  const inner = [
    [-0.72, 0.22], [-0.40, 0.29], [0.05, 0.31], [0.50, 0.30], [0.82, 0.24],
  ];
  const cockpit = new THREE.Path();
  cockpit.moveTo(-inner[0][1], -inner[0][0]);
  inner.forEach(([z, hw]) => cockpit.lineTo(-hw, -z));
  for (let i = inner.length - 1; i >= 0; i--) cockpit.lineTo(inner[i][1], -inner[i][0]);
  cockpit.closePath();
  shell.holes.push(cockpit);

  const shellMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shell, { depth: 0.25, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 1 }),
    bodyMat,
  );
  shellMesh.rotation.x = -Math.PI / 2;
  shellMesh.position.y = PAN_Y + 0.024;
  body.add(shellMesh);

  // red trim strip along the lower body edge
  const strip = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bodyProfile(-0.012), { depth: 0.024, bevelEnabled: false }),
    mat(C.bodyTrim, { roughness: 0.4 }),
  );
  strip.rotation.x = -Math.PI / 2;
  strip.position.y = PAN_Y + 0.022;
  body.add(strip);

  // Hand-painted livery. Applied as decal planes on each flank rather than as UVs on
  // the extruded shell, because the artwork IS a flat painted panel on a white body —
  // a decal is what it physically is, and it survives the geometry changing underneath.
  //
  // Until a perspective-corrected crop of the real panel exists, these show the gold
  // placeholder marks. setLivery() swaps in the real artwork.
  const decals = [];
  [-1, 1].forEach((s) => {
    const g = new THREE.Mesh(
      new THREE.PlaneGeometry(0.215, 0.215),
      mat(C.livery, { roughness: 0.5, side: THREE.DoubleSide, envMapIntensity: 0.4 }),
    );
    g.position.set(s * 0.404, PAN_Y + 0.145, -0.34);
    g.rotation.y = s * Math.PI / 2;
    g.visible = false;
    g.userData.side = s;
    body.add(g);
    decals.push(g);
  });

  // placeholder marks, retired the moment artwork is supplied
  const placeholders = [];
  [-1, 1].forEach((s) => {
    const mark = new THREE.Mesh(
      new THREE.CircleGeometry(0.085, 24),
      mat(C.livery, { roughness: 0.5, side: THREE.DoubleSide }),
    );
    mark.position.set(s * 0.398, PAN_Y + 0.15, -0.34);
    mark.rotation.y = s * Math.PI / 2;
    body.add(mark);
    placeholders.push(mark);
  });

  // convenience: load the team's brand mark straight off the site
  kart.userData.loadLivery = (url = '../trackmap/assets/livery-cobra.png') => {
    new THREE.TextureLoader().load(url, (tex) => kart.userData.setLivery(tex));
  };

  // texture: an RGBA image of the painted flank, straightened and cut out.
  // mirrorRight is honest about a real limitation — one photograph only shows one
  // flank, so until the other side is shot we either mirror it or leave it plain.
  kart.userData.setLivery = (texture, { mirrorRight = true } = {}) => {
    if (!texture) {
      decals.forEach((d) => { d.visible = false; });
      placeholders.forEach((p) => { p.visible = true; });
      return;
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    decals.forEach((d) => {
      if (d.userData.side > 0 && !mirrorRight) { d.visible = false; return; }
      const t = d.userData.side > 0 ? texture.clone() : texture;
      if (d.userData.side > 0) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; t.needsUpdate = true; }
      d.material = new THREE.MeshStandardMaterial({
        map: t, transparent: true, alphaTest: 0.04,
        roughness: 0.32, metalness: 0.0, envMapIntensity: 0.5,
        side: THREE.DoubleSide,
      });
      d.visible = true;
    });
    placeholders.forEach((p) => { p.visible = false; });
  };

  kart.add(body);
  kart.userData.body = body;
  return kart;
}

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

  scene.add(new THREE.HemisphereLight(0xdfe6ee, 0x0a0a0a, 1.2));
  const key = new THREE.DirectionalLight(0xfff1e0, 1.5);
  key.position.set(2.5, 5, 2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe6392b, 0.65);
  rim.position.set(-3, 1.5, -2.5);
  scene.add(rim);

  const body = kart.userData.body;
  let shown = true;

  return {
    setHeading(rad) { kart.rotation.y = rad; },
    // t = 0 bare chassis, t = 1 fully bodied. Discrete for now; the production
    // module crossfades opacity across the build stages.
    setBodywork(t) {
      const on = t > 0.7;
      if (on !== shown) { body.visible = on; shown = on; }
    },
    render() { renderer.render(scene, camera); },
    dispose() { renderer.dispose(); },
  };
}
