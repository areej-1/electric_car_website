// Forward travel follows normal page scrolling. There is no pinned strip,
// automatic playback or idle animation loop.
(() => {
  const hero = document.querySelector('.home-hero');
  const drive = hero?.querySelector('.hero-drive');
  const car = drive?.querySelector('img');
  if (!car) return;

  // Use the opposite photographed/rendered side, never mirrored lettering.
  if (document.documentElement.dir === 'rtl' && car.dataset.carRtl) {
    car.addEventListener('error', () => { car.src = car.dataset.carRtlFallback; }, { once: true });
    car.src = car.dataset.carRtl;
  }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let pending = null;
  let visible = true;

  function render() {
    pending = null;
    if (document.hidden || !visible) return;
    const end = Math.max(1, hero.getBoundingClientRect().bottom + scrollY - 96);
    const progress = motion.matches ? .5 : Math.min(1, Math.max(0, scrollY / end));
    drive.style.setProperty('--drive-progress', progress.toFixed(4));
  }
  function schedule() {
    if (pending === null && visible && !document.hidden) pending = requestAnimationFrame(render);
  }
  function pause() {
    if (pending !== null) cancelAnimationFrame(pending);
    pending = null;
  }
  /* The MQL change event can lag the actual flip (it is dispatched as a task),
     so a scroll right after reduced motion turns on would otherwise leave the
     car at the pre-flip position until the event arrives. Pin the rest position
     on any reduced-motion scroll as well. */
  addEventListener('scroll', () => {
    if (motion.matches) { pause(); drive.style.setProperty('--drive-progress', '0.5'); return; }
    schedule();
  }, { passive: true });
  new ResizeObserver(schedule).observe(hero);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule(); else pause();
  }).observe(hero);
  /* A media flip must land synchronously: scheduling a frame instead lets a
     reader (or a test) observe the pre-change position and catch the car moving
     after reduced motion was already on. render() is one layout read — fine at
     event frequency, which is why the scroll path goes through schedule().
     The reduced case sets the rest position directly: render() no-ops while the
     hero is off-screen, which would leave the pre-flip position stuck. */
  motion.addEventListener('change', () => {
    pause();
    if (motion.matches) drive.style.setProperty('--drive-progress', '0.5');
    else render();
  });
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : schedule());
  addEventListener('pagehide', pause);
  addEventListener('pageshow', schedule);
  render();
})();
