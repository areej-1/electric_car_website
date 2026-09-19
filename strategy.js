/* Beat the Battery — EVGP energy strategy simulator.
 *
 * The simulation runs lap-by-lap and completes instantly; the canvas then plays
 * the run back. Results are filled from the finished simulation, never from the
 * animation, so reduced motion or a skipped playback can never hide them.
 */
(() => {
  const canvas = document.getElementById('strategy-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const Lib = window.CobrasLib;
  const lang = () => (document.documentElement.lang === 'ar' ? 'ar' : 'en');
  const tr = (key) => (Lib ? Lib.t(lang(), key) : key);
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');

  /* Real team numbers: 48V (4 × 12V), 186 kg, ~30 km/h average, 1–3 h runtime.
     Battery = 100 energy units; consumption per lap below. */
  const STYLES = {
    aggressive: { units: 3.5, kmh: 36, key: 'strategy.agg' },
    balanced:   { units: 2.8, kmh: 30, key: 'strategy.bal' },
    eco:        { units: 2.2, kmh: 24, key: 'strategy.eco' }
  };
  const REGEN_BONUS = 0.3;

  const control = { style: 'balanced', charge: 100, track: 0.4, regen: false, ff: false };
  let best = 0;
  try { best = Number(localStorage.getItem('cobraStrategyBest')) || 0; } catch { /* ignore */ }

  const $ = (id) => document.getElementById(id);
  const lapNode = $('lap-count');
  const bestNode = $('best-laps');
  const styleStat = $('style-stat');
  const energyFill = $('strategy-energy-fill');
  const resultsSection = $('results');
  const resultLaps = $('result-laps');
  const resultVerdict = $('result-verdict');
  const resultTime = $('result-time');
  const resultAvg = $('result-avg');
  const resultEff = $('result-eff');
  const resultUsed = $('result-used');
  const bestLine = $('best-line-value');
  const shareBtn = $('share-btn');

  let lastResult = null;
  let playback = null; // { result, startedAt, lapMs }

  /* ---------- Simulation (instant, deterministic shape with ±10% noise) ---------- */
  function simulate() {
    const cfg = STYLES[control.style];
    let battery = control.charge;
    const startUnits = control.charge;
    let laps = 0;
    let hours = 0;
    const lapBattery = [];
    while (battery > 0) {
      let use = cfg.units * (0.9 + Math.random() * 0.2);
      if (control.regen) use -= REGEN_BONUS;
      if (use < 0.1) use = 0.1;
      if (battery - use <= 0) break; // lap not completed on fumes
      battery -= use;
      laps += 1;
      hours += control.track / cfg.kmh;
      lapBattery.push(battery);
    }
    const distanceKm = laps * control.track;
    const avgKmh = hours > 0 ? distanceKm / hours : 0;
    const used = startUnits - battery;
    const efficiency = used > 0 ? Math.round((laps / used) * 100) : 0;
    return { laps, hours, avgKmh, efficiency, used, lapBattery, startUnits };
  }

  function verdictKey(laps) {
    if (laps < 25) return 'strategy.verdict1';
    if (laps < 35) return 'strategy.verdict2';
    if (laps < 45) return 'strategy.verdict3';
    return 'strategy.verdict4';
  }

  function formatTime(hours) {
    const totalMin = Math.round(hours * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h > 0
      ? `${h} ${tr('strategy.timeH')} ${m} ${tr('strategy.timeMin')}`
      : `${m} ${tr('strategy.timeMin')}`;
  }

  /* ---------- Canvas ---------- */
  const W = 960;
  const H = 520;
  const CX = W / 2;
  const CY = H / 2;
  const RX = 360;
  const RY = 180;
  canvas.width = W;
  canvas.height = H;

  function pointAt(angle) {
    return { x: CX + RX * Math.cos(angle), y: CY + RY * Math.sin(angle) };
  }

  /* The scenery never changes, so it is painted once onto an offscreen canvas.
     Per-frame work is one drawImage plus the trail and the car. */
  const scene = document.createElement('canvas');
  scene.width = W;
  scene.height = H;
  (function paintScene() {
    const g = scene.getContext('2d');
    const bg = g.createRadialGradient(CX, CY, 80, CX, CY, 620);
    bg.addColorStop(0, '#121214');
    bg.addColorStop(1, '#060607');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    // infield
    g.beginPath();
    g.ellipse(CX, CY, RX - 46, RY - 46, 0, 0, Math.PI * 2);
    g.fillStyle = '#0b0d0b';
    g.fill();
    // asphalt
    g.beginPath();
    g.ellipse(CX, CY, RX, RY, 0, 0, Math.PI * 2);
    g.lineWidth = 46;
    g.strokeStyle = '#26262b';
    g.stroke();
    // centre dashes
    g.setLineDash([26, 30]);
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(201,162,39,.4)';
    g.beginPath();
    g.ellipse(CX, CY, RX, RY, 0, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
    // kerbs: alternating red / cream arcs on both edges
    const seg = Math.PI / 36;
    for (let i = 0; i < 72; i += 1) {
      g.lineWidth = 5;
      g.strokeStyle = i % 2 ? 'rgba(230,57,43,.8)' : 'rgba(245,240,232,.75)';
      g.beginPath();
      g.ellipse(CX, CY, RX + 25, RY + 25, 0, i * seg, (i + 1) * seg);
      g.stroke();
      g.beginPath();
      g.ellipse(CX, CY, RX - 25, RY - 25, 0, i * seg, (i + 1) * seg);
      g.stroke();
    }
    // start/finish: a flat checker strip across the track at angle 0 (right
    // side), perpendicular to travel like a real finish line — not rotated
    const sfX = CX + RX;
    const cell = 8;
    for (let i = 0; i < 7; i += 1) {
      for (let j = 0; j < 2; j += 1) {
        g.fillStyle = (i + j) % 2 ? '#f5f0e8' : '#141414';
        g.fillRect(sfX - 28 + i * cell, CY - cell + j * cell, cell, cell);
      }
    }
  })();

  const trail = [];
  const mark = new Image();
  let markReady = false;
  mark.onload = () => { markReady = true; drawIdle(); };
  mark.src = 'cobra-race-mark.png';

  function drawCar(angle) {
    const p = pointAt(angle);
    if (markReady) {
      // Face the direction of travel: the marker moves with decreasing angle.
      const tangent = Math.atan2(-Math.cos(angle) * RY, Math.sin(angle) * RX);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(tangent - Math.PI / 2); // the mark's fangs point down; align them with travel
      /* The mark PNG has no alpha; on this near-black track a 'screen' blend
         drops the black and keeps only the red/gold artwork. No shadowBlur —
         an opaque image would cast a square shadow. */
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(mark, -19, -19, 38, 38);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.shadowColor = '#e6392b';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#e6392b';
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c9a227';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f0e8';
    ctx.fill();
  }

  function drawFrame(angle) {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(scene, 0, 0);
    trail.push(pointAt(angle));
    if (trail.length > 14) trail.shift();
    trail.forEach((p, i) => {
      const t = i / trail.length;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 + t * 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,57,43,${(t * 0.35).toFixed(3)})`;
      ctx.fill();
    });
    drawCar(angle);
  }

  /* The grid slot sits just past the finish line so the mark never idles on
     top of the checker. Laps still count from the run, not the artwork. */
  const START_ANGLE = 0.45;

  function drawIdle() {
    trail.length = 0;
    drawFrame(START_ANGLE);
  }

  /* ---------- Playback ---------- */
  const LAP_MS = 900;
  const LAP_MS_FF = 120;

  const energyPct = $('energy-pct');
  const energyTrack = document.querySelector('.strategy-stage .energy-track');
  let lastShownLap = -1;
  function hud(lap, batteryUnits) {
    if (lap !== lastShownLap) {
      lastShownLap = lap;
      lapNode.textContent = String(lap);
      if (!REDUCED.matches) {
        lapNode.classList.remove('pop');
        void lapNode.offsetWidth; // restart the pop animation
        lapNode.classList.add('pop');
      }
    }
    const pct = Math.max(0, Math.min(100, batteryUnits));
    energyFill.style.width = `${pct}%`;
    energyPct.textContent = `${Math.round(pct)}%`;
    energyTrack.classList.toggle('is-low', pct <= 20);
  }

  function stopPlayback() {
    if (playback && playback.raf) cancelAnimationFrame(playback.raf);
    playback = null;
  }

  function startPlayback(result, onDone) {
    stopPlayback();
    trail.length = 0;
    lastShownLap = -1;
    if (REDUCED.matches || result.laps === 0) {
      const finalBattery = result.lapBattery[result.lapBattery.length - 1] ?? result.startUnits;
      drawIdle();
      hud(result.laps, finalBattery);
      onDone();
      return;
    }
    playback = { result, startedAt: performance.now(), raf: 0 };
    const step = (now) => {
      if (!playback) return;
      const lapMs = control.ff ? LAP_MS_FF : LAP_MS;
      const elapsed = now - playback.startedAt;
      const progress = Math.min(elapsed / lapMs, result.laps);
      const lapIndex = Math.min(Math.floor(progress), result.laps);
      drawFrame(START_ANGLE - progress * Math.PI * 2);
      const battery = lapIndex > 0 ? result.lapBattery[lapIndex - 1] : result.startUnits;
      hud(lapIndex, battery);
      if (progress < result.laps) {
        playback.raf = requestAnimationFrame(step);
      } else {
        hud(result.laps, result.lapBattery[result.lapBattery.length - 1]);
        playback = null;
        onDone();
      }
    };
    playback.raf = requestAnimationFrame(step);
  }

  /* ---------- Results ---------- */
  function countUp(target) {
    if (REDUCED.matches || target === 0) {
      resultLaps.textContent = String(target);
      return;
    }
    const t0 = performance.now();
    resultLaps.classList.add('counting');
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / 800);
      resultLaps.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(tick);
      else resultLaps.classList.remove('counting');
    };
    requestAnimationFrame(tick);
  }

  function renderResults(result) {
    countUp(result.laps);
    const tier = verdictKey(result.laps);
    resultVerdict.textContent = tr(tier);
    resultVerdict.className = `verdict ${tier.slice(-1) === '1' ? 'v1' : tier.slice(-1) === '2' ? 'v2' : tier.slice(-1) === '3' ? 'v3' : 'v4'}`;
    resultTime.textContent = formatTime(result.hours);
    resultAvg.textContent = `${result.avgKmh.toFixed(1)} ${tr('strategy.kmh')}`;
    resultEff.textContent = String(result.efficiency);
    resultUsed.textContent = `${result.used.toFixed(1)} / 100`;
    bestLine.textContent = `${best} ${tr('strategy.laps')}`;
    resultsSection.hidden = false;
  }

  function runSimulation() {
    const result = simulate();
    lastResult = result;
    if (result.laps > best) {
      best = result.laps;
      try { localStorage.setItem('cobraStrategyBest', String(best)); } catch { /* ignore */ }
      bestNode.textContent = String(best);
    }
    styleStat.textContent = tr(STYLES[control.style].key);
    // The summary is the podium moment: it waits for the run to finish playing.
    resultsSection.hidden = true;
    startPlayback(result, () => {
      renderResults(result);
      resultsSection.scrollIntoView({ behavior: REDUCED.matches ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- Controls ---------- */
  function seg(selector, attr, apply) {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll(selector).forEach((b) => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        apply(btn.getAttribute(attr));
      });
    });
  }

  seg('[data-style]', 'data-style', (value) => {
    control.style = value;
    styleStat.textContent = tr(STYLES[control.style].key);
  });
  seg('[data-track]', 'data-track', (value) => { control.track = Number(value); });

  const chargeRange = $('charge-range');
  const chargeValue = $('charge-value');
  chargeRange.addEventListener('input', () => {
    control.charge = Number(chargeRange.value);
    chargeValue.textContent = `${control.charge}%`;
  });

  const regenToggle = $('regen-toggle');
  regenToggle.addEventListener('click', () => {
    control.regen = !control.regen;
    regenToggle.setAttribute('aria-pressed', control.regen ? 'true' : 'false');
    regenToggle.querySelector('span').textContent = tr(control.regen ? 'strategy.on' : 'strategy.off');
  });

  const ffToggle = $('ff-toggle');
  ffToggle.addEventListener('click', () => {
    control.ff = !control.ff;
    ffToggle.setAttribute('aria-pressed', control.ff ? 'true' : 'false');
    ffToggle.classList.toggle('is-active', control.ff);
  });

  $('run-btn').addEventListener('click', runSimulation);

  /* ---------- Share ---------- */
  function showToast(message) {
    let toast = document.querySelector('.share-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'share-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  shareBtn.addEventListener('click', async () => {
    if (!lastResult) return;
    const url = location.href;
    const text = lang() === 'ar'
      ? `حققت ${lastResult.laps} ${tr('strategy.laps')} في تحدي بطارية كوبرا — هل تتغلب عليّ؟ 🐍⚡ ${url}`
      : `I got ${lastResult.laps} laps in the Cobra Battery Challenge — can you beat it? 🐍⚡ ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: tr('strategy.title'), text });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(tr('strategy.copied'));
      } else {
        window.prompt('Copy your result:', text);
      }
    } catch {
      /* user cancelled share */
    }
  });

  /* ---------- Boot ---------- */
  if (best > 0) {
    bestNode.textContent = String(best);
    bestLine.textContent = `${best} ${tr('strategy.laps')}`;
  }
  styleStat.textContent = tr(STYLES[control.style].key);
  drawIdle();
})();
