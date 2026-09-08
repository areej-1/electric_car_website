import { test, expect } from '@playwright/test';

for (const lang of ['en', 'ar']) test(`${lang} navigation settles at both collapse boundaries`, async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.fulfill({ status: 200, body: '' }));
  await context.addInitScript(language => localStorage.setItem('cobras_lang', language), lang);
  for (const width of [1381, 390]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('index.html');
    for (const [top, collapsed] of [[49, true], [16, false]]) {
      await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
      const samples = await page.evaluate(() => new Promise(resolve => {
        const frames = [];
        const nav = document.querySelector('.site-nav');
        function record() {
          frames.push({ scroll: scrollY, collapsed: nav.classList.contains('is-collapsed'), height: nav.getBoundingClientRect().height });
          if (frames.length < 60) requestAnimationFrame(record); else resolve(frames);
        }
        requestAnimationFrame(record);
      }));
      const tail = samples.slice(30);
      expect([...new Set(tail.map(frame => frame.collapsed))], `width=${width}, scroll=${top}: ${JSON.stringify(tail)}`).toEqual([collapsed]);
      expect(Math.max(...tail.map(frame => frame.height)) - Math.min(...tail.map(frame => frame.height))).toBeLessThan(1);
    }
  }
});

for (const lang of ['en', 'ar']) test(`${lang} homepage car moves forward with scroll and stays in frame`, async ({ page, context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.fulfill({ status: 200, body: '' }));
  await context.addInitScript(language => localStorage.setItem('cobras_lang', language), lang);
  await page.setViewportSize({ width: 1381, height: 812 });
  await page.goto('index.html');
  const car = page.locator('.hero-car img');
  const start = await car.evaluate(el => el.getBoundingClientRect().left);
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
  await expect.poll(async () => ((await car.evaluate(el => el.getBoundingClientRect().left)) - start) * (lang === 'ar' ? -1 : 1)).toBeGreaterThan(8);
  for (const width of [1381, 390, 320]) {
    await page.setViewportSize({ width, height: 812 });
    const fits = await car.evaluate(el => {
      const image = el.getBoundingClientRect();
      const figure = el.closest('figure').getBoundingClientRect();
      return image.left >= figure.left - 1 && image.right <= figure.right + 1;
    });
    expect(fits).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const resting = await car.evaluate(el => el.getBoundingClientRect().left);
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
  await expect.poll(() => car.evaluate(el => el.getBoundingClientRect().left)).toBeCloseTo(resting, 0);
});
