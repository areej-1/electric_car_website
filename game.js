(() => {
  const canvas = document.getElementById('race-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Cobra Circuit: 2D canvas unsupported');
    return;
  }

  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null || raw === '') return fallback;
      return JSON.parse(raw);
    } catch {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
      return fallback;
    }
  };
  const writeJson = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  };
  const readNumber = (key, fallback = 0) => {
    const n = Number(localStorage.getItem(key));
    return Number.isFinite(n) ? n : fallback;
  };

  const overlay = document.getElementById('race-overlay');
  const overlayTitle = document.getElementById('race-overlay-title');
  const overlayCopy = document.getElementById('race-overlay-copy');
  const startButton = document.getElementById('start-btn');
  const scoreNode = document.getElementById('race-score');
  const levelNode = document.getElementById('race-level');
  const bestNode = document.getElementById('race-best');
  const energyFill = document.getElementById('energy-fill');
  if (!overlay || !overlayTitle || !overlayCopy || !scoreNode || !levelNode || !bestNode || !energyFill) {
    console.error('Cobra Circuit: missing HUD nodes');
    return;
  }

  const W = 960;
  const H = 600;
  const HORIZON = 326;
  const ROAD_TOP = 88;
  const ROAD_BOTTOM = 760;
  const PLAYER_Y = 466;
  canvas.width = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false;

  const images = {};
  [
    ['car', 'car-rear.png'],
    ['snake', 'cobra-front.png'],
    ['battery', 'battery-perspective.png'],
    ['skyline', 'dubai-pixel-skyline.png']
  ].forEach(([key, source]) => {
    const image = new Image();
    image.src = source;
    images[key] = image;
  });

  const state = {
    running: false,
    score: 0,
    level: 1,
    energy: 100,
    best: readNumber('cobraRaceBest', 0),
    elapsed: 0,
    stripeOffset: 0,
    spawnClock: 0,
    batteryClock: 0,
    entities: [],
    particles: [],
    lastTime: 0,
    shake: 0,
    mode: 'f2',
    playerLane: -.5,
    targetLane: -.5
  };
  // F3 easiest → F2 default → F1 hardest (legacy keys kept for cached pages)
  const modeSpeed = { f3: .78, f2: 1, f1: 1.28, rookie: .78, race: 1, elite: 1.28 };
  const modeLabel = { f3: 'F3', f2: 'F2', f1: 'F1', rookie: 'F3', race: 'F2', elite: 'F1' };

  const laneValues = [-1.5, -.5, .5, 1.5];
  bestNode.textContent = String(state.best).padStart(5, '0');

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const speedForMode = (mode) => modeSpeed[mode] || modeSpeed.f2;
  const roadWidthAt = progress => ROAD_TOP + (ROAD_BOTTOM - ROAD_TOP) * Math.pow(progress, .88);
  const roadYAt = progress => HORIZON + (H - HORIZON) * Math.pow(progress, 1.22);
  const laneXAt = (lane, progress) => W / 2 + lane * roadWidthAt(progress) / 4;

  // Keep the race stage LTR even when the site is Arabic, so controls/canvas stay correct.
  const raceShell = document.querySelector('.race-shell');
  if (raceShell) raceShell.setAttribute('dir', 'ltr');

  function updateHud() {
    scoreNode.textContent = Math.floor(state.score).toString().padStart(5, '0');
    levelNode.textContent = state.level;
    energyFill.style.width = `${clamp(state.energy, 0, 100)}%`;
  }

  function steer(direction) {
    if (!state.running) return;
    const index = laneValues.indexOf(state.targetLane);
    state.targetLane = laneValues[clamp(index + direction, 0, laneValues.length - 1)];
  }

  function spawn(type) {
    let lane = laneValues[Math.floor(Math.random() * laneValues.length)];
    const blocked = state.entities.filter(entity => entity.progress < .18).map(entity => entity.lane);
    if (blocked.includes(lane) && blocked.length < laneValues.length) {
      do lane = laneValues[Math.floor(Math.random() * laneValues.length)]; while (blocked.includes(lane));
    }
    state.entities.push({ type, lane, progress: 0, hit: false, wobble: Math.random() * Math.PI * 2 });
  }

  function burst(x, y, color, count = 18) {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x, y, color,
        vx: (Math.random() - .5) * 260,
        vy: -40 - Math.random() * 180,
        life: .55 + Math.random() * .45,
        size: 3 + Math.floor(Math.random() * 5)
      });
    }
  }

  function tr(key, fallback) {
    const t = window.CobrasSite && window.CobrasSite.t;
    if (typeof t === 'function') {
      const value = t(key);
      if (value && value !== key) return value;
    }
    return fallback;
  }

  function beginRace() {
    // Preserve selected difficulty mode across restarts.
    const mode = state.mode in modeSpeed ? state.mode : 'f2';
    Object.assign(state, {
      running: true, score: 0, level: 1, energy: 100, elapsed: 0,
      stripeOffset: 0, spawnClock: .6, batteryClock: 2.4,
      entities: [], particles: [], playerLane: -.5, targetLane: -.5, shake: 0,
      mode
    });
    overlay.classList.add('hidden');
    if (startButton) startButton.textContent = tr('game.restart', 'Restart race');
    updateHud();
  }

  function finishRace(reason) {
    if (!state.running) return;
    state.running = false;
    state.shake = 18;
    const finalScore = Math.floor(state.score);
    const scores = readJson('cobraRaceScores', []);
    if (Array.isArray(scores)) {
      scores.push(finalScore);
      writeJson('cobraRaceScores', scores.sort((a, b) => b - a).slice(0, 5));
    } else {
      writeJson('cobraRaceScores', [finalScore]);
    }
    renderLeaderboard();
    burst(laneXAt(state.playerLane, 1), PLAYER_Y + 55, '#E6392B', 34);

    if (finalScore > state.best) {
      state.best = finalScore;
      try { localStorage.setItem('cobraRaceBest', String(finalScore)); } catch { /* ignore */ }
      bestNode.textContent = String(finalScore).padStart(5, '0');
      overlayTitle.textContent = tr('game.record', 'New track record');
    } else {
      overlayTitle.textContent = reason === 'energy'
        ? tr('game.empty', 'Battery empty')
        : tr('game.over', 'Race over');
    }
    const mode = modeLabel[state.mode] || String(state.mode).toUpperCase();
    overlayCopy.textContent = tr('game.finishCopy', `Score ${finalScore} · ${mode}. Best ${state.best}. Race again.`)
      .replace('{score}', String(finalScore))
      .replace('{mode}', mode)
      .replace('{best}', String(state.best));
    setTimeout(() => overlay.classList.remove('hidden'), 450);
  }

  function update(dt) {
    state.stripeOffset = (state.stripeOffset + dt * (.52 + state.level * .035)) % 1;
    state.shake *= .85;
    state.playerLane += (state.targetLane - state.playerLane) * Math.min(1, dt * 12);

    state.particles.forEach(particle => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 340 * dt;
      particle.life -= dt;
    });
    state.particles = state.particles.filter(particle => particle.life > 0);
    if (!state.running) return;

    state.elapsed += dt;
    state.score += dt * (22 + state.level * 4);
    state.energy -= dt * (1.45 + state.level * .13);
    state.level = clamp(1 + Math.floor(state.score / 260), 1, 9);
    state.spawnClock -= dt;
    state.batteryClock -= dt;

    if (state.spawnClock <= 0) {
      spawn('snake');
      state.spawnClock = Math.max(.48, 1.28 - state.level * .075) + Math.random() * .35;
    }
    if (state.batteryClock <= 0) {
      spawn('battery');
      state.batteryClock = 2.4 + Math.random() * 1.8;
    }

    const approachSpeed = (.25 + state.level * .025) * speedForMode(state.mode);
    for (const entity of state.entities) {
      entity.progress += dt * approachSpeed * (entity.type === 'battery' ? .92 : 1);
      entity.wobble += dt * 3;

      if (!entity.hit && entity.progress > .82 && entity.progress < 1.02 && Math.abs(entity.lane - state.playerLane) < .58) {
        entity.hit = true;
        if (entity.type === 'snake') {
          finishRace('crash');
          break;
        }
        state.energy = clamp(state.energy + 30, 0, 100);
        state.score += 85;
        burst(laneXAt(entity.lane, entity.progress), roadYAt(entity.progress), '#C9A227');
      }
    }
    state.entities = state.entities.filter(entity => !entity.hit && entity.progress < 1.13);
    if (state.energy <= 0) finishRace('energy');
    updateHud();
  }

  function drawSky() {
    const skyline = images.skyline;
    if (skyline.complete && skyline.naturalWidth) {
      const cropY = skyline.naturalHeight * .05;
      const cropH = skyline.naturalHeight * .82;
      ctx.drawImage(skyline, 0, cropY, skyline.naturalWidth, cropH, 0, 0, W, HORIZON + 12);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
      sky.addColorStop(0, '#0A0A0A');
      sky.addColorStop(1, '#7C0A02');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, HORIZON + 12);
    }
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, HORIZON - 2, W, 18);
  }

  function drawRoad() {
    ctx.fillStyle = '#181818';
    ctx.beginPath();
    ctx.moveTo(W / 2 - ROAD_TOP / 2, HORIZON);
    ctx.lineTo(W / 2 + ROAD_TOP / 2, HORIZON);
    ctx.lineTo(W / 2 + ROAD_BOTTOM / 2, H);
    ctx.lineTo(W / 2 - ROAD_BOTTOM / 2, H);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#E6392B';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(W / 2 - ROAD_TOP / 2, HORIZON);
    ctx.lineTo(W / 2 - ROAD_BOTTOM / 2, H);
    ctx.moveTo(W / 2 + ROAD_TOP / 2, HORIZON);
    ctx.lineTo(W / 2 + ROAD_BOTTOM / 2, H);
    ctx.stroke();

    for (let segment = -1; segment < 12; segment++) {
      const p1 = ((segment / 11) + state.stripeOffset) % 1;
      const p2 = Math.min(1, p1 + .045 + p1 * .04);
      if (p1 < 0 || p1 > .98) continue;
      ctx.fillStyle = 'rgba(245,240,232,.78)';
      [-1, 0, 1].forEach(divider => {
        const x1 = laneXAt(divider, p1);
        const x2 = laneXAt(divider, p2);
        const width = 1 + p1 * 5;
        ctx.beginPath();
        ctx.moveTo(x1 - width, roadYAt(p1));
        ctx.lineTo(x1 + width, roadYAt(p1));
        ctx.lineTo(x2 + width * 1.3, roadYAt(p2));
        ctx.lineTo(x2 - width * 1.3, roadYAt(p2));
        ctx.fill();
      });
    }
  }

  function drawEntity(entity) {
    const p = entity.progress;
    const x = laneXAt(entity.lane, p);
    const y = roadYAt(p);
    const scale = .12 + Math.pow(p, 1.45) * 1.05;
    const baseW = entity.type === 'battery' ? 54 : 90;
    const baseH = entity.type === 'battery' ? 54 : 104;
    const w = baseW * scale;
    const h = baseH * scale;
    const image = images[entity.type];

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y - h));
    if (entity.type === 'battery') ctx.rotate(Math.sin(entity.wobble) * .08);
    ctx.shadowColor = entity.type === 'battery' ? '#C9A227' : '#E6392B';
    ctx.shadowBlur = 4 + p * 16;
    if (image.complete && image.naturalWidth) ctx.drawImage(image, -w / 2, 0, w, h);
    else { ctx.fillStyle = entity.type === 'battery' ? '#C9A227' : '#E6392B'; ctx.fillRect(-w / 2, 0, w, h); }
    ctx.restore();
  }

  function drawPlayer() {
    const x = laneXAt(state.playerLane, 1);
    const image = images.car;
    const w = 188;
    const h = 126;
    ctx.save();
    ctx.translate(Math.round(x), PLAYER_Y);
    ctx.shadowColor = '#E6392B';
    ctx.shadowBlur = 22;
    if (image.complete && image.naturalWidth) ctx.drawImage(image, -w / 2, 0, w, h);
    else { ctx.fillStyle = '#E6392B'; ctx.fillRect(-w / 2, 0, w, h); }
    ctx.fillStyle = '#C9A227';
    ctx.fillRect(-55, 106, 28, 5);
    ctx.fillRect(27, 106, 28, 5);
    ctx.restore();
  }

  function drawSpeedReadout() {
    const speed = state.running ? 74 + state.level * 11 : 0;
    ctx.fillStyle = 'rgba(10,10,10,.8)';
    ctx.fillRect(18, H - 76, 150, 58);
    ctx.strokeStyle = '#C9A227';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, H - 76, 150, 58);
    ctx.fillStyle = '#C9A227';
    ctx.font = '700 12px Orbitron, monospace';
    ctx.fillText('SPEED', 30, H - 52);
    ctx.fillStyle = '#F5F0E8';
    ctx.font = '900 23px Orbitron, monospace';
    ctx.fillText(`${speed} KM/H`, 30, H - 27);
  }

  function draw() {
    ctx.save();
    if (state.shake > .3) ctx.translate((Math.random() - .5) * state.shake, (Math.random() - .5) * state.shake);
    ctx.clearRect(-30, -30, W + 60, H + 60);
    drawSky();
    drawRoad();
    [...state.entities].sort((a, b) => a.progress - b.progress).forEach(drawEntity);
    drawPlayer();
    drawSpeedReadout();
    state.particles.forEach(particle => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
    });
    ctx.globalAlpha = .09;
    ctx.fillStyle = '#F5F0E8';
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
    ctx.restore();
  }

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  function loop(timestamp) {
    const dt = Math.min(.033, (timestamp - state.lastTime) / 1000 || 0);
    state.lastTime = timestamp;
    // Keep gameplay responsive, but dampen shake/particles when user prefers less motion.
    if (reduceMotion) state.shake = 0;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  document.addEventListener('keydown', event => {
    if (['ArrowLeft', 'a', 'A'].includes(event.key)) { event.preventDefault(); steer(-1); }
    if (['ArrowRight', 'd', 'D'].includes(event.key)) { event.preventDefault(); steer(1); }
    if ([' ', 'Enter'].includes(event.key) && !state.running) beginRace();
  });
  document.querySelector('[data-steer="left"]')?.addEventListener('pointerdown', () => steer(-1));
  document.querySelector('[data-steer="right"]')?.addEventListener('pointerdown', () => steer(1));
  document.querySelectorAll('[data-mode]').forEach(button => {
    button.setAttribute('aria-pressed', button.classList.contains('is-active') ? 'true' : 'false');
    button.addEventListener('click', () => {
      const next = button.dataset.mode;
      state.mode = next in modeSpeed ? next : 'f2';
      document.querySelectorAll('[data-mode]').forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    });
  });
  // Normalize legacy active mode buttons if HTML/SW cache is mixed.
  const activeModeBtn = document.querySelector('[data-mode].is-active');
  if (activeModeBtn?.dataset.mode) state.mode = activeModeBtn.dataset.mode in modeSpeed ? activeModeBtn.dataset.mode : 'f2';

  startButton?.addEventListener('click', (event) => {
    event.preventDefault();
    beginRace();
  });
  overlay.querySelector('button')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    beginRace();
  });
  // Click empty overlay chrome to start; ignore mode/steer controls elsewhere.
  overlay.addEventListener('click', event => {
    if (event.target.closest('button')) return;
    beginRace();
  });

  let touchX = null;
  canvas.addEventListener('pointerdown', event => touchX = event.clientX);
  canvas.addEventListener('pointerup', event => {
    if (touchX === null) return;
    const delta = event.clientX - touchX;
    steer(Math.abs(delta) > 18 ? (delta > 0 ? 1 : -1) : (event.offsetX > canvas.clientWidth / 2 ? 1 : -1));
    touchX = null;
  });

  function renderLeaderboard() {
    const list = document.getElementById('race-leaderboard');
    if (!list) return;
    const raw = readJson('cobraRaceScores', []);
    const scores = Array.isArray(raw) ? raw : [];
    while (list.firstChild) list.removeChild(list.firstChild);
    for (let index = 0; index < 5; index++) {
      const item = document.createElement('li');
      const rank = document.createElement('span');
      const score = document.createElement('strong');
      rank.textContent = String(index + 1).padStart(2, '0');
      score.textContent = String(Number(scores[index]) || 0).padStart(5, '0');
      item.appendChild(rank);
      item.appendChild(score);
      list.appendChild(item);
    }
  }

  function sharePayload() {
    const scores = readJson('cobraRaceScores', []);
    const top = Array.isArray(scores) && scores.length ? Number(scores[0]) || 0 : 0;
    return {
      score: Math.floor(state.score) || top,
      best: state.best,
      mode: state.mode,
      level: state.level
    };
  }

  async function shareScore() {
    const build = (window.CobrasSite && window.CobrasSite.buildScoreShareText)
      || (window.CobrasLib && window.CobrasLib.buildScoreShareText);
    const text = build ? build(sharePayload()) : `Cobra Circuit score ${Math.floor(state.score)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Cobra Circuit', text });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(tr('game.shareCopied', 'Score copied — paste anywhere to share'));
      } else {
        window.prompt('Copy your score share text:', text);
      }
    } catch {
      /* user cancelled share */
    }
  }

  function showToast(message) {
    let toast = document.querySelector('.share-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'share-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  const shareBtn = document.getElementById('share-score-btn');
  if (shareBtn) shareBtn.addEventListener('click', shareScore);

  try {
    updateHud();
    renderLeaderboard();
    requestAnimationFrame(loop);
  } catch (err) {
    console.error('Cobra Circuit failed to start', err);
    if (overlayCopy) {
      overlayCopy.textContent = 'Game failed to start. Press Ctrl+F5 to hard-refresh, then try Start race again.';
    }
    overlay?.classList.remove('hidden');
  }
})();
