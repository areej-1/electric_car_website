import * as THREE from '../trackmap/vendor/three.module.js';
import { buildKart } from '../trackmap/kart.js';

const viewer = document.getElementById('viewer');
const stage = document.getElementById('stage');
const canvas = document.getElementById('carCanvas');
const loading = document.getElementById('loading');
const angleLabel = document.getElementById('angleLabel');
const spinBtn = document.getElementById('spinBtn');
const detail = document.getElementById('detail');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const details = {
  cockpit: {
    title: 'Open cockpit',
    body: 'Black bucket seat, bright red four-point harness, black tubular roll structure, and handlebar steering.',
    azimuth: -0.62,
    elevation: 0.68,
    radius: 2.72,
  },
  axle: {
    title: 'Twin-wheel front axle',
    body: 'Two chrome five-spoke wheels sit side-by-side across the front. The car has exactly three wheels.',
    azimuth: 0.08,
    elevation: 0.34,
    radius: 2.82,
  },
  shell: {
    title: 'Fully enclosed rear wheel',
    body: 'The one centered rear wheel is inside the continuous white tail shell and cannot be seen from any exterior angle.',
    azimuth: Math.PI,
    elevation: 0.46,
    radius: 2.72,
  },
};

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: false,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.16;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b0c0d, 0.042);

function makeStudioEnvironment() {
  const faces = Array.from({ length: 6 }, (_, face) => {
    const surface = document.createElement('canvas');
    surface.width = surface.height = 512;
    const ctx = surface.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, face === 2 ? '#f8f5ee' : '#858a91');
    gradient.addColorStop(0.42, face === 3 ? '#17191c' : '#363a40');
    gradient.addColorStop(1, '#090a0b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = face % 2 ? 'rgba(255,240,220,.70)' : 'rgba(225,239,255,.78)';
    const x = face % 2 ? 72 : 340;
    ctx.fillRect(x, 42, 92, 336);
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.fillRect(32, 34, 448, 18);
    return surface;
  });
  const cube = new THREE.CubeTexture(faces);
  cube.colorSpace = THREE.SRGBColorSpace;
  cube.needsUpdate = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromCubemap(cube).texture;
  pmrem.dispose();
  cube.dispose();
  return environment;
}
scene.environment = makeStudioEnvironment();

const camera = new THREE.PerspectiveCamera(31, 1, 0.08, 60);
const target = new THREE.Vector3(0, 0.34, 0.02);

const kart = buildKart();
kart.rotation.y = 0;
kart.position.y = 0.012;
kart.userData.setBodywork(true);
kart.userData.loadLivery('../trackmap/assets/livery-cobra.png');
kart.traverse((object) => {
  if (!object.isMesh) return;
  object.castShadow = true;
  object.receiveShadow = true;
  if (object.geometry && !object.geometry.attributes.normal) object.geometry.computeVertexNormals();
});
scene.add(kart);

const floorMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x17191b,
  roughness: 0.82,
  metalness: 0.08,
  clearcoat: 0.12,
  clearcoatRoughness: 0.72,
});
const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 128), floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.012;
floor.receiveShadow = true;
scene.add(floor);

const shadowCanvas = document.createElement('canvas');
shadowCanvas.width = shadowCanvas.height = 512;
const shadowContext = shadowCanvas.getContext('2d');
const shadowGradient = shadowContext.createRadialGradient(256, 256, 20, 256, 256, 245);
shadowGradient.addColorStop(0, 'rgba(0,0,0,.68)');
shadowGradient.addColorStop(0.48, 'rgba(0,0,0,.30)');
shadowGradient.addColorStop(1, 'rgba(0,0,0,0)');
shadowContext.fillStyle = shadowGradient;
shadowContext.fillRect(0, 0, 512, 512);
const contactShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(2.25, 2.85),
  new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(shadowCanvas),
    transparent: true,
    depthWrite: false,
    opacity: 0.72,
  }),
);
contactShadow.rotation.x = -Math.PI / 2;
contactShadow.position.set(0, 0.003, 0.04);
scene.add(contactShadow);

const ring = new THREE.Mesh(
  new THREE.RingGeometry(1.60, 1.615, 160),
  new THREE.MeshBasicMaterial({ color: 0xc9a227, transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
);
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.002;
scene.add(ring);

scene.add(new THREE.HemisphereLight(0xe9f0f6, 0x16100d, 1.55));

const key = new THREE.DirectionalLight(0xfff1df, 3.15);
key.position.set(-3.5, 6.8, -4.2);
key.castShadow = true;
key.shadow.mapSize.set(4096, 4096);
key.shadow.camera.left = -3;
key.shadow.camera.right = 3;
key.shadow.camera.top = 3;
key.shadow.camera.bottom = -3;
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 15;
key.shadow.bias = -0.00022;
key.shadow.normalBias = 0.018;
scene.add(key);

const fill = new THREE.DirectionalLight(0xb7d5ff, 1.55);
fill.position.set(4.5, 3.2, 1.2);
scene.add(fill);

const rimLight = new THREE.DirectionalLight(0xff4b38, 1.15);
rimLight.position.set(-3, 2.4, 4);
scene.add(rimLight);

const topLight = new THREE.PointLight(0xffffff, 18, 8, 2);
topLight.position.set(0, 4.2, 0.2);
scene.add(topLight);

const frontSoftbox = new THREE.PointLight(0xffead4, 7.5, 7, 1.65);
frontSoftbox.position.set(0, 1.55, -3.4);
scene.add(frontSoftbox);

const rearSoftbox = new THREE.PointLight(0xd9e9ff, 6.5, 7, 1.7);
rearSoftbox.position.set(0.8, 1.8, 3.25);
scene.add(rearSoftbox);

let azimuth = 0;
let targetAzimuth = 0;
let elevation = 0.42;
let targetElevation = 0.42;
let radius = 3.65;
let targetRadius = 3.65;
let velocityX = 0;
let velocityY = 0;
let dragging = false;
let pointerX = 0;
let pointerY = 0;
let lastMoveTime = 0;
let autoRotate = false;
let previousTime = performance.now();

const clampElevation = (value) => Math.max(0.20, Math.min(1.47, value));
const clampRadius = (value) => Math.max(2.45, Math.min(5.35, value));
const wrapDegrees = (radians) => ((THREE.MathUtils.radToDeg(radians) % 360) + 360) % 360;

function describeView() {
  const degrees = wrapDegrees(azimuth);
  const names = ['Front', 'Front right', 'Right side', 'Rear right', 'Rear', 'Rear left', 'Left side', 'Front left'];
  const index = Math.round(degrees / 45) % 8;
  const level = elevation > 1.30 ? 'top down' : elevation > 0.68 ? 'elevated' : 'eye level';
  angleLabel.textContent = `${names[index]} · ${level}`;
}

function updateCamera() {
  const horizontal = Math.cos(elevation) * radius;
  camera.position.set(
    Math.sin(azimuth) * horizontal,
    target.y + Math.sin(elevation) * radius,
    -Math.cos(azimuth) * horizontal,
  );
  camera.lookAt(target);
  describeView();
}

function resize() {
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.8 : 2.35);
  renderer.setPixelRatio(dpr);
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.updateProjectionMatrix();
}

function stopAuto() {
  autoRotate = false;
  spinBtn.setAttribute('aria-pressed', 'false');
}

function setView(nextAzimuth, nextElevation, nextRadius = targetRadius) {
  targetAzimuth = nextAzimuth;
  targetElevation = clampElevation(nextElevation);
  targetRadius = clampRadius(nextRadius);
  velocityX = 0;
  velocityY = 0;
  stopAuto();
}

stage.addEventListener('pointerdown', (event) => {
  dragging = true;
  pointerX = event.clientX;
  pointerY = event.clientY;
  lastMoveTime = performance.now();
  velocityX = 0;
  velocityY = 0;
  stage.classList.add('is-dragging');
  stage.setPointerCapture(event.pointerId);
  stopAuto();
});

stage.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  const now = performance.now();
  const dt = Math.max(8, now - lastMoveTime);
  const dx = event.clientX - pointerX;
  const dy = event.clientY - pointerY;
  const azimuthDelta = -dx * 0.0062;
  const elevationDelta = -dy * 0.0048;
  targetAzimuth += azimuthDelta;
  targetElevation = clampElevation(targetElevation + elevationDelta);
  velocityX = azimuthDelta / dt * 16.67;
  velocityY = elevationDelta / dt * 16.67;
  pointerX = event.clientX;
  pointerY = event.clientY;
  lastMoveTime = now;
  viewer.classList.add('has-dragged');
});

function finishDrag(event) {
  if (!dragging) return;
  dragging = false;
  stage.classList.remove('is-dragging');
  try { stage.releasePointerCapture(event.pointerId); } catch {}
}

stage.addEventListener('pointerup', finishDrag);
stage.addEventListener('pointercancel', finishDrag);
stage.addEventListener('wheel', (event) => {
  event.preventDefault();
  targetRadius = clampRadius(targetRadius * Math.exp(event.deltaY * 0.00075));
  stopAuto();
}, { passive: false });

stage.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); targetAzimuth -= Math.PI / 8; stopAuto(); }
  if (event.key === 'ArrowRight') { event.preventDefault(); targetAzimuth += Math.PI / 8; stopAuto(); }
  if (event.key === 'ArrowUp') { event.preventDefault(); targetElevation = clampElevation(targetElevation + 0.14); stopAuto(); }
  if (event.key === 'ArrowDown') { event.preventDefault(); targetElevation = clampElevation(targetElevation - 0.14); stopAuto(); }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); targetRadius = clampRadius(targetRadius - 0.22); }
  if (event.key === '-') { event.preventDefault(); targetRadius = clampRadius(targetRadius + 0.22); }
});

document.getElementById('prevBtn').addEventListener('click', () => setView(targetAzimuth - Math.PI / 4, targetElevation));
document.getElementById('nextBtn').addEventListener('click', () => setView(targetAzimuth + Math.PI / 4, targetElevation));
document.getElementById('eyeBtn').addEventListener('click', () => setView(targetAzimuth, 0.38, 3.65));
document.getElementById('topBtn').addEventListener('click', () => setView(targetAzimuth, 1.44, 4.15));
document.getElementById('zoomIn').addEventListener('click', () => { targetRadius = clampRadius(targetRadius - 0.28); });
document.getElementById('zoomOut').addEventListener('click', () => { targetRadius = clampRadius(targetRadius + 0.28); });
spinBtn.addEventListener('click', () => {
  if (reducedMotion) return;
  autoRotate = !autoRotate;
  spinBtn.setAttribute('aria-pressed', String(autoRotate));
});

document.querySelectorAll('.hotspot').forEach((button) => {
  button.addEventListener('click', () => {
    const view = details[button.dataset.view];
    setView(view.azimuth, view.elevation, view.radius);
    detailTitle.textContent = view.title;
    detailBody.textContent = view.body;
    detail.classList.add('is-open');
  });
});
document.querySelector('.detail-close').addEventListener('click', () => detail.classList.remove('is-open'));
addEventListener('keydown', (event) => {
  if (event.key === 'Escape') detail.classList.remove('is-open');
});

function animate(now) {
  const delta = Math.min(0.04, (now - previousTime) / 1000);
  previousTime = now;
  if (autoRotate && !dragging) targetAzimuth += delta * 0.42;
  if (!dragging && !autoRotate && !reducedMotion) {
    targetAzimuth += velocityX;
    targetElevation = clampElevation(targetElevation + velocityY);
    const inertia = Math.exp(-delta * 8.6);
    velocityX *= inertia;
    velocityY *= inertia;
  }
  const smoothing = reducedMotion ? 1 : 1 - Math.exp(-delta * 11.5);
  azimuth += (targetAzimuth - azimuth) * smoothing;
  elevation += (targetElevation - elevation) * smoothing;
  radius += (targetRadius - radius) * smoothing;
  updateCamera();
  ring.material.opacity = 0.16 + Math.sin(now * 0.0007) * 0.035;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

addEventListener('resize', resize, { passive: true });
resize();
updateCamera();
renderer.compile(scene, camera);
loading.classList.add('is-ready');
requestAnimationFrame(animate);
