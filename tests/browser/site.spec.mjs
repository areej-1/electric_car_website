import { test, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:4327';
const copy = {
  en: { dir: 'ltr', language: 'Language', menu: 'Open menu', members: 'Members', resources: 'Resources', innovation: 'Innovation', testing: 'Testing + troubleshooting', brake: 'Brakes', close: 'Close detail', top: 'Top', eye: 'Eye level', zoom: 'Zoom in' },
  ar: { dir: 'rtl', language: 'اللغة', menu: 'فتح القائمة', members: 'الأعضاء', resources: 'الموارد', innovation: 'الابتكار', testing: 'الاختبار واستكشاف الأعطال', brake: 'المكابح', close: 'إغلاق التفاصيل', top: 'علوي', eye: 'مستوى النظر', zoom: 'تكبير' },
};

async function fitsViewport(page) {
  const overflow = await page.locator('main').evaluate(main => [...main.querySelectorAll('*')].filter(el => {
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return box.width && box.height && style.visibility !== 'hidden' && style.display !== 'none' && (box.left < -1 || box.right > innerWidth + 1);
  }).map(el => `${el.tagName}.${el.className}`));
  expect(overflow, 'Visible main content must stay within the viewport').toEqual([]);
}

for (const lang of ['en', 'ar']) {
  test.describe(lang, () => {
    const label = copy[lang];
    let errors = [];
    test.beforeEach(async ({ page, context }) => {
      errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(origin + '/') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      // Isolate tests from public fonts, chat services and third-party outages.
      // Local images and scripts remain real; missing local assets fail the test.
      await context.route('**/*', route => new URL(route.request().url()).origin === origin
        ? route.continue()
        : route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
      await context.addInitScript(language => {
        if (!localStorage.getItem('cobras_lang')) localStorage.setItem('cobras_lang', language);
      }, lang);
    });
    test.afterEach(() => expect(errors, 'No browser exceptions or failed local resources').toEqual([]));

    test('mobile navigation, language switch and member filtering', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('index.html');
      await expect(page.locator('html')).toHaveAttribute('dir', label.dir);
      await expect(page.locator('.build-status')).toBeVisible();
      await fitsViewport(page);

      const menu = page.locator('.nav-toggle');
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await page.getByRole('button', { name: label.resources, exact: true }).click();
      await expect(page.locator('.nav-submenu')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.nav-submenu')).toBeHidden();
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).toBeFocused();

      // Exercise the real language toggle and persistence through its reload.
      await page.getByRole('button', { name: label.language, exact: true }).click();
      const other = copy[lang === 'en' ? 'ar' : 'en'];
      await expect(page.locator('html')).toHaveAttribute('dir', other.dir);
      await page.getByRole('button', { name: other.language, exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('dir', label.dir);

      await menu.click();
      await page.getByRole('navigation').getByRole('link', { name: label.members, exact: true }).click();
      await expect(page).toHaveURL(/\/members\.html$/);
      await page.getByRole('button', { name: label.innovation, exact: true }).click();
      await expect(page.locator('.members-grid > section:visible h2')).toHaveText(['Joud Hassan', 'Yas Shahriari']);
      await fitsViewport(page);
    });

    test('narrow build stages and keyboard jumps', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 844 });
      await page.goto('projects.html');
      await expect(page.locator('.build-jumps a')).toHaveCount(5);
      await expect(page.locator('html')).toHaveAttribute('dir', label.dir);
      await fitsViewport(page);
      const links = await page.locator('.build-jumps a').evaluateAll(els => els.map(el => el.getBoundingClientRect().height));
      expect(links.every(height => height >= 44)).toBe(true);
      await page.getByRole('link', { name: label.testing, exact: true }).press('Enter');
      await expect(page.locator('#stage-testing')).toBeFocused();
      await expect.poll(async () => page.locator('#stage-testing h2').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(400);
      const belowNav = await page.locator('#stage-testing h2').evaluate(el => el.getBoundingClientRect().top > document.querySelector('.site-nav').getBoundingClientRect().bottom);
      expect(belowNav).toBe(true);
      for (const stage of await page.locator('.timeline-step').all()) await expect(stage).toHaveCSS('opacity', '1');
      if (lang === 'ar') {
        const labels = await page.locator('.timeline-step img, .timeline-step video').evaluateAll(els => els.map(el => el.getAttribute('alt') || el.getAttribute('aria-label')));
        expect(labels.every(text => /[\u0600-\u06ff]/.test(text))).toBe(true);
      }
    });

    test('car controls, dialog focus and responsive overhead view', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 844 });
      await page.goto('car.html');
      const frame = page.frameLocator('iframe');
      await expect(frame.locator('.frame.is-active')).toBeVisible();
      await expect(frame.locator('html')).toHaveAttribute('lang', lang);
      await expect(frame.locator('#loading')).toHaveClass(/is-ready/);
      await fitsViewport(page);
      const controlLayout = async () => frame.locator('.viewer-footer').evaluate(footer => {
        const controls = footer.querySelector('.controls').getBoundingClientRect();
        const disclosure = footer.querySelector('.disclosure').getBoundingClientRect();
        return { fits: footer.getBoundingClientRect().bottom <= innerHeight + 1, separated: controls.bottom <= disclosure.top, buttons: [...footer.querySelectorAll('button')].every(button => { const b = button.getBoundingClientRect(); return b.width >= 44 && b.height >= 44 && b.left >= 0 && b.right <= innerWidth; }) };
      });
      expect(await controlLayout()).toEqual({ fits: true, separated: true, buttons: true });

      const component = frame.getByRole('button', { name: label.brake, exact: true });
      await component.press('Enter');
      const dialog = frame.getByRole('dialog', { name: label.brake, exact: true });
      const close = dialog.getByRole('button', { name: label.close, exact: true });
      await expect(dialog).toBeVisible();
      await expect(close).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(close).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(component).toBeFocused();

      const stage = frame.locator('#stage');
      const before = await stage.getAttribute('aria-label');
      await stage.press('ArrowRight');
      await expect(stage).not.toHaveAttribute('aria-label', before);
      await frame.getByRole('button', { name: label.top, exact: true }).click();
      await expect(frame.locator('.top-frame')).toHaveClass(/is-active/);

      // Check painted-image bounds, not the larger transparent <img> box.
      for (const width of [320, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        await expect.poll(controlLayout).toEqual({ fits: true, separated: true, buttons: true });
        await expect.poll(async () => frame.locator('.top-frame').evaluate(img => {
          const stage = img.parentElement.getBoundingClientRect();
          const matrix = new DOMMatrix(getComputedStyle(img).transform);
          const fit = Math.min(stage.width / img.naturalWidth, stage.height / img.naturalHeight);
          const width = fit * (img.naturalWidth * Math.abs(matrix.a) + img.naturalHeight * Math.abs(matrix.c));
          const height = fit * (img.naturalWidth * Math.abs(matrix.b) + img.naturalHeight * Math.abs(matrix.d));
          return width <= stage.width + 1 && height <= stage.height + 1;
        })).toBe(true);
        await fitsViewport(page);
      }
      await frame.getByRole('button', { name: label.zoom, exact: true }).click();
      await expect(frame.locator('#viewer')).toHaveAttribute('style', /--zoom: 1\.12/);
      await frame.getByRole('button', { name: label.eye, exact: true }).click();
      await expect(frame.locator('.ring-low.is-active')).toBeVisible();
    });
  });
}
