import { test, expect } from '@playwright/test';

test('viewer sleeps, wakes on interaction and pauses outside the viewport', async ({ page, context }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.fulfill({ status: 200, body: '' }));
  await context.addInitScript(() => {
    if (!location.pathname.endsWith('/photo.html')) return;
    const request = window.requestAnimationFrame.bind(window);
    const cancel = window.cancelAnimationFrame.bind(window);
    const pending = new Set();
    window.viewerFrames = { calls: 0, pending: () => pending.size };
    window.requestAnimationFrame = callback => {
      const id = request(time => {
        pending.delete(id);
        window.viewerFrames.calls++;
        callback(time);
      });
      pending.add(id);
      return id;
    };
    window.cancelAnimationFrame = id => { pending.delete(id); cancel(id); };
  });
  await page.setViewportSize({ width: 1280, height: 844 });
  await page.goto('car.html');
  const frame = page.frameLocator('iframe');
  const viewer = frame.locator('#viewer');
  const stage = frame.locator('#stage');
  await expect.poll(() => frame.locator('.frame').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  const pending = () => viewer.evaluate(() => window.viewerFrames.pending());
  const calls = () => viewer.evaluate(() => window.viewerFrames.calls);
  const sleeps = async () => {
    await expect.poll(pending).toBe(0);
    const before = await calls();
    // Observe an actual quiet period, not a gap between two scheduled callbacks.
    await page.waitForTimeout(150);
    expect(await calls()).toBe(before);
  };
  await sleeps();
  const before = await stage.getAttribute('aria-label');
  await stage.press('ArrowRight');
  await expect(stage).not.toHaveAttribute('aria-label', before);
  await sleeps();
  await frame.locator('#spinBtn').click();
  await expect.poll(pending).toBe(1);
  const rotating = await calls();
  await expect.poll(calls).toBeGreaterThan(rotating + 3);
  // This is real iframe intersection, not a mocked visibility callback.
  await page.setViewportSize({ width: 320, height: 500 });
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('iframe').evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThan(0);
  await sleeps();
  await page.locator('iframe').scrollIntoViewIfNeeded();
  await expect.poll(pending).toBe(1);
  const resumed = await calls();
  await expect.poll(calls).toBeGreaterThan(resumed + 3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(frame.locator('#spinBtn')).toBeDisabled();
  await expect(frame.locator('#spinBtn')).toHaveAttribute('aria-pressed', 'false');
  await sleeps();
  await frame.locator('#topBtn').click();
  await expect(frame.locator('.top-frame')).toHaveClass(/is-active/);
  await sleeps();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(frame.locator('#spinBtn')).toBeEnabled();
  expect(errors).toEqual([]);
});

test('late component image wakes a settled viewer and copy reports success', async ({ page, context }) => {
  let releaseFrame;
  const delayedFrame = new Promise(resolve => { releaseFrame = resolve; });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') return route.fulfill({ status: 200, body: '' });
    if (url.pathname.endsWith('/eye-236.avif')) await delayedFrame;
    return route.continue();
  });
  await context.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: async text => { window.copiedComponentLink = text; } },
  }));
  await page.goto('car.html', { waitUntil: 'domcontentloaded' });
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('#loading')).toHaveClass(/is-ready/);
  await expect(frame.locator('.ring-low.is-active')).toBeVisible();
  await frame.locator('#componentSelect').selectOption('controller');
  await frame.locator('#componentMenu button').click();
  await expect(frame.locator('#detail')).toBeVisible();
  await expect(frame.locator('.hotspot.is-visible')).toHaveCount(0);
  releaseFrame();
  await expect(frame.locator('.ring-low.is-active')).toHaveAttribute('data-index', '21');
  await frame.locator('#copyLink').click();
  await expect(frame.locator('#shareStatus')).toHaveText('Link copied.');
  expect(await frame.locator('#viewer').evaluate(() => window.copiedComponentLink)).toMatch(/\/car\.html#component=controller$/);
  await expect(frame.locator('#shareLink')).toBeHidden();
});
