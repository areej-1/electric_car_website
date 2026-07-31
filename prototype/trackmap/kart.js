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
// Catmull-Rom resample of a polyline. The authored profiles are a dozen points; run
// straight into ExtrudeGeometry they produce visibly faceted panel edges, which is the
// single loudest "this is CG" cue on the whole model.
function smooth(pts, perSeg = 9) {
  const n = pts.length;
  const P = (i) => pts[Math.min(n - 1, Math.max(0, i))];
  const out = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let j = 0; j < perSeg; j++) {
      const t = j / perSeg, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[n - 1]);
  return out;
}

function outline(half, inset) {
  const s = new THREE.Shape();
  const pts = smooth(half.map(([z, hw]) => [z, Math.max(0.02, hw - inset)]));
  s.moveTo(-pts[0][1], -pts[0][0]);
  pts.forEach(([z, hw]) => s.lineTo(-hw, -z));
  for (let i = pts.length - 1; i >= 0; i--) s.lineTo(pts[i][1], -pts[i][0]);
  s.closePath();
  return s;
}

// Procedural roughness variation. Perfectly uniform roughness is unphotographic —
// real paint has cloudiness, real tyres have wear. Cheap, and it breaks the plastic look.
function noiseTexture(size = 256, base = 0.5, amp = 0.22, scale = 5) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  let seed = 1337;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const grid = scale + 1;
  const lattice = Array.from({ length: grid * grid }, () => rnd());
  const at = (x, y) => lattice[(y % grid) * grid + (x % grid)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * scale, fy = (y / size) * scale;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = fx - x0, ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const v = (at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx) * (1 - sy)
              + (at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx) * sy;
      const g = Math.max(0, Math.min(255, (base + (v - 0.5) * amp) * 255));
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = g;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
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
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 72, radius, 16, false), material);
}

function closedTube(points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)), true, 'catmullrom', 0.35,
  );
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 96, radius, 16, true), material);
}

// Chrome 5-spoke mag on a stub axle. Front and rear differ in width and diameter.
function wheel(x, z, r, w) {
  const g = new THREE.Group();
  // torus reads as a tyre with a sidewall; a plain cylinder reads as a hockey puck
  const tyreMat = mat(C.tyre, { roughness: 0.92, metalness: 0.04 });
  const tyreRough = noiseTexture(128, 0.88, 0.26, 9);
  tyreRough.repeat.set(8, 2);
  tyreMat.roughnessMap = tyreRough;
  const tyre = new THREE.Mesh(new THREE.TorusGeometry(r * 0.80, r * 0.22, 22, 56), tyreMat);
  tyre.rotation.y = Math.PI / 2;
  tyre.scale.x = Math.max(0.5, w / (r * 0.44));
  g.add(tyre);

  const treadCount = 40;
  const tread = new THREE.InstancedMesh(
    new THREE.BoxGeometry(w * 1.04, r * 0.040, r * 0.115),
    mat(0x090909, { roughness: 0.96, metalness: 0.01 }),
    treadCount,
  );
  const treadMatrix = new THREE.Object3D();
  for (let i = 0; i < treadCount; i++) {
    const angle = (i / treadCount) * Math.PI * 2;
    treadMatrix.position.set(
      (i % 2 ? -1 : 1) * w * 0.055,
      Math.cos(angle) * r * 1.005,
      Math.sin(angle) * r * 1.005,
    );
    treadMatrix.rotation.set(angle, 0, 0);
    treadMatrix.updateMatrix();
    tread.setMatrixAt(i, treadMatrix.matrix);
  }
  tread.instanceMatrix.needsUpdate = true;
  g.add(tread);

  const rimMat = mat(C.rim, { roughness: 0.14, metalness: 1.0, envMapIntensity: 1.5 });

  // Open 5-spoke mag: a rim ring, five spokes reaching it, and a small hub. The
  // spokes must reach PAST the barrel radius or they are buried inside it and the
  // wheel reads as a plain black disc.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.66, r * 0.075, 16, 48), rimMat);
  ring.rotation.y = Math.PI / 2;
  g.add(ring);

  const dish = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.20, r * 0.20, w * 0.70, 40), rimMat);
  dish.rotation.z = Math.PI / 2;
  g.add(dish);

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const sp = new THREE.Mesh(
      new THREE.CapsuleGeometry(r * 0.052, r * 0.47, 8, 18),
      rimMat,
    );
    sp.position.set(0, Math.cos(angle) * r * 0.31, Math.sin(angle) * r * 0.31);
    sp.rotation.x = angle;
    sp.scale.x = 0.72;
    g.add(sp);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.12, w * 1.30, 28), mat(C.hub, { metalness: 0.9, roughness: 0.28 }));
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
  const base = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.24, 10, 24), seatMat);
  base.position.set(0, y0 + 0.09, 0.26);
  base.rotation.x = Math.PI / 2;
  base.scale.set(1.22, 1, 0.34);
  kart.add(base);
  const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.28, 10, 24), seatMat);
  back.position.set(0, y0 + 0.34, 0.54);
  back.rotation.x = -0.17;
  back.scale.set(1.18, 1, 0.30);
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
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.40, 24), barMat);
  stem.position.set(0, y0 + 0.22, -0.30);
  stem.rotation.x = 0.42;
  kart.add(stem);
  kart.add(tube([
    [-0.30, y0 + 0.38, -0.34], [-0.14, y0 + 0.42, -0.44], [0, y0 + 0.43, -0.46],
    [0.14, y0 + 0.42, -0.44], [0.30, y0 + 0.38, -0.34],
  ], 0.017, barMat));
  [-1, 1].forEach((s) => {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.13, 24), mat(0x0d0d0d, { roughness: 0.9 }));
    grip.position.set(s * 0.26, y0 + 0.39, -0.36);
    grip.rotation.set(0, 0, Math.PI / 2 - s * 0.32);
    kart.add(grip);
  });

  // ---- steering tie-rods along the pan ----
  [-1, 1].forEach((s) => {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.52, 16), mat(0xb6babe, { metalness: 0.85, roughness: 0.3 }));
    rod.position.set(s * 0.22, PAN_Y + 0.06, -0.66);
    rod.rotation.set(Math.PI / 2, 0, s * 0.30);
    kart.add(rod);
  });

  // ---- blue controller by the seat base ----
  const ctl = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.11, 0.13), mat(C.controller, { roughness: 0.55 }));
  ctl.position.set(-0.20, y0 + 0.10, 0.02);
  kart.add(ctl);

  // ---- wheels ----
  // Three wheels, confirmed by the team: two at the front on outboard stub axles,
  // one centred at the rear. The car is a trike, not a four-wheeler.
  kart.add(wheel(-(TRACK / 2), -0.72, R_FRONT, 0.09));
  kart.add(wheel(TRACK / 2, -0.72, R_FRONT, 0.09));
  const rearWheel = wheel(0, 0.94, R_REAR, 0.11);
  kart.add(rearWheel);

  // front stub axles bridging pan edge to hub
  [-1, 1].forEach((s) => {
    const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.18, 20), mat(0x2a2a2a, { metalness: 0.7, roughness: 0.4 }));
    ax.rotation.z = Math.PI / 2;
    ax.position.set(s * (TRACK / 2 - 0.10), R_FRONT, -0.72);
    kart.add(ax);
  });

  // rear swingarm carrying the single wheel behind the tapered tail
  [-1, 1].forEach((s) => {
    kart.add(tube([
      [s * 0.14, PAN_Y + 0.02, 0.62], [s * 0.10, R_REAR * 0.9, 0.82], [s * 0.055, R_REAR, 0.94],
    ], 0.020, tubeMat));
  });

  // ---- white composite bodywork (toggleable) ----
  const body = new THREE.Group();
  // Automotive paint: low-roughness base under a clearcoat, with cloudy roughness
  // variation so the panels aren't uniform plastic.
  const bodyMat = mat(C.body, { roughness: 0.35, metalness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 1.2 });
  const paintRough = noiseTexture(256, 0.42, 0.30, 4);
  paintRough.repeat.set(2, 2);
  bodyMat.roughnessMap = paintRough;
  bodyMat.clearcoatRoughnessMap = paintRough;

  // The fitted body is a single high-density loft rather than a collection of boxes.
  // This lets studio reflections flow continuously over the shell, which is the main
  // visual difference between a toy-like mesh and a photographic automotive surface.
  const widthProfile = [
    [-1.18, 0.06], [-1.10, 0.20], [-0.96, 0.33], [-0.72, 0.395],
    [-0.35, 0.425], [0.18, 0.435], [0.62, 0.415], [0.94, 0.365],
    [1.12, 0.285], [1.20, 0.18],
  ];
  const heightProfile = [
    [-1.18, PAN_Y + 0.15], [-1.04, PAN_Y + 0.225], [-0.76, PAN_Y + 0.285],
    [-0.30, PAN_Y + 0.305], [0.26, PAN_Y + 0.315], [0.58, PAN_Y + 0.405],
    [0.82, PAN_Y + 0.49], [1.05, PAN_Y + 0.46], [1.20, PAN_Y + 0.37],
  ];
  const sample = (profile, z) => {
    if (z <= profile[0][0]) return profile[0][1];
    for (let i = 0; i < profile.length - 1; i++) {
      const [z0, v0] = profile[i];
      const [z1, v1] = profile[i + 1];
      if (z <= z1) {
        let t = (z - z0) / (z1 - z0);
        t = t * t * (3 - 2 * t);
        return v0 + (v1 - v0) * t;
      }
    }
    return profile[profile.length - 1][1];
  };
  const cockpitHalfWidth = (z) => {
    const n = (z - 0.08) / 0.68;
    return Math.abs(n) < 1 ? 0.305 * Math.sqrt(1 - n * n) : 0;
  };
  const buildGrid = (rows, columns, point) => {
    const positions = [];
    const uvs = [];
    const indices = [];
    for (let row = 0; row <= rows; row++) {
      for (let column = 0; column <= columns; column++) {
        const [x, y, z] = point(row / rows, column / columns);
        positions.push(x, y, z);
        uvs.push(row / rows, column / columns);
      }
    }
    const stride = columns + 1;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const a = row * stride + column;
        const b = a + stride;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  };

  const Z_MIN = -1.18;
  const Z_MAX = 1.20;
  const bodyBottom = PAN_Y + 0.012;
  [-1, 1].forEach((side) => {
    const flank = new THREE.Mesh(buildGrid(112, 14, (u, v) => {
      const z = Z_MIN + (Z_MAX - Z_MIN) * u;
      const width = sample(widthProfile, z);
      const shoulder = sample(heightProfile, z);
      const round = Math.sin(v * Math.PI) * 0.018;
      return [
        side * (width - round),
        bodyBottom + (shoulder - bodyBottom) * v,
        z,
      ];
    }), bodyMat);
    flank.material.side = THREE.DoubleSide;
    body.add(flank);

    const deck = new THREE.Mesh(buildGrid(112, 18, (u, v) => {
      const z = Z_MIN + (Z_MAX - Z_MIN) * u;
      const width = sample(widthProfile, z) - 0.012;
      const inner = cockpitHalfWidth(z);
      const x = side * (inner + (width - inner) * v);
      const shoulder = sample(heightProfile, z);
      const camber = 0.052 * (1 - Math.pow(Math.abs(x) / Math.max(width, 0.01), 1.7));
      const cockpitDip = inner > 0 ? (1 - v) * 0.025 : 0;
      return [x, shoulder + camber - cockpitDip, z];
    }), bodyMat);
    deck.material.side = THREE.DoubleSide;
    body.add(deck);
  });

  // Ellipsoidal end caps merge into the loft and remove the hard, game-like tail.
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 40), bodyMat);
  nose.scale.set(0.385, 0.19, 0.235);
  nose.position.set(0, bodyBottom + 0.14, -1.08);
  body.add(nose);

  const rearPod = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 40), bodyMat);
  rearPod.scale.set(0.36, 0.29, 0.41);
  rearPod.position.set(0, bodyBottom + 0.25, 0.96);
  body.add(rearPod);

  const cockpitRimPoints = Array.from({ length: 64 }, (_, index) => {
    const a = (index / 64) * Math.PI * 2;
    const z = 0.08 + Math.cos(a) * 0.68;
    return [
      Math.sin(a) * 0.308,
      sample(heightProfile, z) + 0.012,
      z,
    ];
  });
  body.add(closedTube(cockpitRimPoints, 0.014, mat(0x151515, {
    roughness: 0.28,
    metalness: 0.55,
  })));

  // A continuous red lower bead follows the shell without squared-off trim blocks.
  [-1, 1].forEach((side) => {
    const edgePoints = Array.from({ length: 64 }, (_, index) => {
      const z = Z_MIN + (Z_MAX - Z_MIN) * (index / 63);
      return [side * (sample(widthProfile, z) + 0.002), bodyBottom + 0.008, z];
    });
    body.add(tube(edgePoints, 0.012, mat(C.bodyTrim, {
      roughness: 0.3,
      metalness: 0.08,
      clearcoat: 0.65,
      clearcoatRoughness: 0.12,
    })));
  });

  // Hand-painted livery. Applied as decal planes on each flank rather than as UVs on
  // the extruded shell, because the artwork IS a flat painted panel on a white body —
  // a decal is what it physically is, and it survives the geometry changing underneath.
  //
  // Until a perspective-corrected crop of the real panel exists, these show the gold
  // placeholder marks. setLivery() swaps in the real artwork.
  const decals = [];
  [-1, 1].forEach((s) => {
    const g = new THREE.Mesh(
      buildGrid(64, 8, (u, v) => {
        const z = -0.70 + u * 1.28;
        const width = sample(widthProfile, z);
        const shoulder = sample(heightProfile, z);
        const flankV = 0.16 + v * 0.68;
        return [
          s * (width - Math.sin(flankV * Math.PI) * 0.018 + 0.004),
          bodyBottom + (shoulder - bodyBottom) * flankV,
          z,
        ];
      }),
      mat(C.livery, { roughness: 0.5, side: THREE.DoubleSide, envMapIntensity: 0.4 }),
    );
    g.userData.side = s;
    body.add(g);
    decals.push(g);
  });

  const makeLiveryTexture = (image, mirrored) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 260;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    if (image) ctx.drawImage(image, 6, 18, 220, 220);
    ctx.lineJoin = 'round';
    ctx.font = 'bold 188px Georgia, serif';
    ctx.lineWidth = 13;
    ctx.strokeStyle = '#c9a227';
    ctx.strokeText('Cobras', 218, 205);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeText('Cobras', 218, 205);
    ctx.fillStyle = '#171717';
    ctx.fillText('Cobras', 218, 205);
    ctx.font = '700 30px Arial, sans-serif';
    ctx.letterSpacing = '7px';
    ctx.fillStyle = '#b52b23';
    ctx.fillText('SIS AL JADA', 245, 43);
    ctx.restore();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  };

  const applyLivery = (image = null) => {
    decals.forEach((decal) => {
      decal.material = new THREE.MeshPhysicalMaterial({
        map: makeLiveryTexture(image, decal.userData.side > 0),
        transparent: true,
        alphaTest: 0.02,
        roughness: 0.34,
        metalness: 0,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.7,
        side: THREE.DoubleSide,
      });
      decal.visible = true;
    });
  };
  applyLivery();

  // convenience: load the team's brand mark straight off the site
  kart.userData.loadLivery = (url = '../trackmap/assets/livery-cobra.png') => {
    new THREE.TextureLoader().load(url, (tex) => applyLivery(tex.image));
  };

  // texture: an RGBA image of the painted flank, straightened and cut out.
  // mirrorRight is honest about a real limitation — one photograph only shows one
  // flank, so until the other side is shot we either mirror it or leave it plain.
  kart.userData.setLivery = (texture, { mirrorRight = true } = {}) => {
    applyLivery(texture?.image ?? null);
    decals.forEach((d) => {
      if (d.userData.side > 0 && !mirrorRight) d.visible = false;
    });
  };

  kart.add(body);
  kart.userData.body = body;
  kart.userData.rearWheel = rearWheel;
  kart.userData.setBodywork = (visible) => {
    body.visible = visible;
    // The real single rear wheel is completely inside the tail shell. Hiding the mesh
    // while the body is fitted prevents leaks at grazing camera angles.
    rearWheel.visible = !visible;
  };
  kart.userData.setBodywork(true);
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
      if (on !== shown) { kart.userData.setBodywork(on); shown = on; }
    },
    render() { renderer.render(scene, camera); },
    dispose() { renderer.dispose(); },
  };
}
