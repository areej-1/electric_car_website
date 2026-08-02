/* Send a crew member out to walk around the page.
 *
 * Each card on the members page gets a button. Press it and that person's chibi
 * walks out along the bottom of the viewport; press it again, or click the chibi,
 * and they go home. Whoever is out is remembered, so they come with you to the
 * rest of the site rather than vanishing on the next click.
 *
 * Opt-in on purpose. An earlier plan had the whole crew permanently walking a
 * strip on every page, which is the same shape as the thing that cost this site
 * 30 fps on the homepage — a scroll-linked animation nobody asked for, running
 * whether or not it is being looked at. Here nothing runs until someone presses
 * a button, and the frame loop stops the moment the last chibi leaves.
 *
 * The discipline inside the loop, for the same reason:
 *   - one rAF for every chibi, not one each
 *   - the loop writes `transform` and nothing else
 *   - no getBoundingClientRect, no layout reads; viewport size is cached and
 *     refreshed on resize
 *   - the walk frame is a background-position swap on a timer, ~5 times a
 *     second, not per frame
 */

import { CREW, byName } from './crew-roster.js';

const STORE = 'cobras_crew_out';
const CHIBI_W = 72;        // the box each sprite is drawn into; see .crew-chibi
const SPEED = 34;          // px per second — a stroll, not a commute
const STEP_MS = 190;       // walk-frame swap
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');

const walking = new Map(); // name -> state
let layer = null;
let raf = 0;
let last = 0;
let viewportW = window.innerWidth;

function ensureLayer() {
  if (layer) return layer;
  layer = document.createElement('div');
  layer.className = 'crew-layer';
  layer.setAttribute('aria-hidden', 'true');   // decorative; the buttons carry the meaning
  document.body.appendChild(layer);
  return layer;
}

function remember() {
  try {
    localStorage.setItem(STORE, JSON.stringify([...walking.keys()]));
  } catch (error) { /* private mode: they just will not follow you between pages */ }
}

export function isOut(name) {
  return walking.has(name);
}

export function send(member) {
  if (walking.has(member.name)) return;
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'crew-chibi';
  el.style.backgroundImage = `url(${member.sprite})`;
  el.title = `${member.name} — click to send home`;
  el.setAttribute('aria-label', `${member.name}, walking. Click to send home.`);
  el.addEventListener('click', () => recall(member.name));
  ensureLayer().appendChild(el);

  walking.set(member.name, {
    el,
    x: Math.random() * Math.max(1, viewportW - CHIBI_W),
    dir: Math.random() < 0.5 ? -1 : 1,
    frame: 0,
    nextStep: 0,
    // A pause every so often, so nineteen of them are not one marching column.
    idleUntil: 0,
    nextIdle: 1500 + Math.random() * 6000,
  });
  remember();
  start();
  return el;
}

export function recall(name) {
  const state = walking.get(name);
  if (!state) return;
  state.el.remove();
  walking.delete(name);
  remember();
  document.dispatchEvent(new CustomEvent('crew:change', { detail: { name, out: false } }));
  if (!walking.size) stop();
}

export function toggle(member) {
  if (walking.has(member.name)) recall(member.name);
  else {
    send(member);
    document.dispatchEvent(new CustomEvent('crew:change', { detail: { name: member.name, out: true } }));
  }
}

function frameLoop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  for (const state of walking.values()) {
    if (now < state.idleUntil) {
      // standing still: no transform write, nothing to do
    } else {
      state.x += state.dir * SPEED * dt;
      if (state.x <= 0) { state.x = 0; state.dir = 1; }
      else if (state.x >= viewportW - CHIBI_W) { state.x = viewportW - CHIBI_W; state.dir = -1; }

      if (now >= state.nextStep) {
        state.nextStep = now + STEP_MS;
        state.frame ^= 1;
      }
      if (now >= state.nextIdle) {
        state.idleUntil = now + 600 + Math.random() * 1800;
        state.nextIdle = state.idleUntil + 3000 + Math.random() * 9000;
        if (Math.random() < 0.5) state.dir *= -1;
      }
    }
    // The artwork is a single standing pose, so the walk is a one-pixel bob
    // rather than a leg swap. The bob is folded into the transform rather than
    // written separately, so the loop still touches exactly one property. The
    // pose faces right; scaleX turns it round rather than needing a second file.
    const bob = now >= state.idleUntil && state.frame ? -1 : 0;
    state.el.style.transform = `translate3d(${state.x.toFixed(1)}px,${bob}px,0) scaleX(${state.dir})`;
  }
  raf = requestAnimationFrame(frameLoop);
}

function start() {
  if (raf || REDUCED.matches) {
    // Reduced motion: they still come out and are still dismissable, they just
    // stand where they are put. Position them once and leave them alone.
    if (REDUCED.matches) {
      for (const state of walking.values()) {
        state.el.style.transform = `translate3d(${state.x.toFixed(1)}px,0,0)`;
      }
    }
    return;
  }
  last = performance.now();
  raf = requestAnimationFrame(frameLoop);
}

function stop() {
  cancelAnimationFrame(raf);
  raf = 0;
}

addEventListener('resize', () => {
  viewportW = window.innerWidth;
  for (const state of walking.values()) {
    state.x = Math.min(state.x, Math.max(0, viewportW - CHIBI_W));
  }
}, { passive: true });

/* Anyone who was out when you left the last page walks back on. */
export function restore() {
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (error) { /* ignore */ }
  for (const name of saved) {
    const member = byName(name);
    if (member) send(member);
  }
}

/* The buttons. Built from the cards already on the page rather than from the
   roster, so a card the roster does not know about is skipped instead of
   throwing, and the roster cannot silently add a button for someone who is not
   on the page. */
export function mountButtons(root = document) {
  const cards = root.querySelectorAll('.members-grid section');
  if (!cards.length) return 0;
  let mounted = 0;

  for (const card of cards) {
    const name = card.querySelector('h2')?.textContent.trim();
    const member = name && byName(name);
    if (!member) continue;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'crew-send';
    const first = member.name.split(' ')[0];
    const label = () => (isOut(member.name)
      ? `Send ${first} back`
      : `Send ${first} for a walk`);
    button.textContent = label();
    button.setAttribute('aria-pressed', String(isOut(member.name)));
    button.addEventListener('click', () => {
      toggle(member);
      button.textContent = label();
      button.setAttribute('aria-pressed', String(isOut(member.name)));
    });
    // A chibi dismissed by clicking it has to update its card's button too.
    document.addEventListener('crew:change', (event) => {
      if (event.detail.name !== member.name) return;
      button.textContent = label();
      button.setAttribute('aria-pressed', String(isOut(member.name)));
    });
    card.appendChild(button);
    mounted++;
  }
  return mounted;
}

export { CREW };
