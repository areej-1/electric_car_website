# Cobras Phase 1 — Astro Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Astro foundation for the Cobras site — tokens, shared shell, EN/AR routing, image pipeline, CI — and delete the four assets that misrepresent the team, without touching any of the 14 content pages yet.

**Architecture:** An Astro static site whose shared chrome resolves at build time, replacing the 62 KB `cobras-lib.js` that currently rebuilds nav and footer in the browser on every page load. Arabic stops being a 32 KB runtime DOM-walk and becomes real `/ar/` routes generated from the same translation data. Images go through Astro's built-in optimizer. The 14 pages are ported in phases 2–4; phase 1 ships the foundation plus one proving page.

**Tech Stack:** Astro 5 (static output), sharp (bundled with Astro), Node 26.4.0, npm 11.17.0, GitHub Actions → GitHub Pages. Python/Pillow 11.3.0 retained only for the bespoke Silverstone colour grade.

## Global Constraints

- **Palette — no hex outside this set.** Ink `#0A0A0A`, Panel `#141414`, Raised `#1A1A1A`, Cobra red `#7C0A02`, Hot red `#E6392B`, Gold `#C9A227`, Soft gold `#E8B923`, Cream `#F5F0E8`, Steel `#9AA3A8`.
- **Typography:** Orbitron (display, labels, numbers) and Poppins (body, nav, buttons) only. No third family. Orbitron never for body copy or Arabic.
- **Honesty:** nothing may depict the product as something it is not. No invented venue, funding figure, sponsor, or contact address. Status is never conveyed by colour alone.
- **The car is a trike** — two front wheels, one centred rear. **Two liveries exist** — current white with hand-painted cobras, earlier black-and-red 010. Neither may be captioned as the other.
- **Budgets:** initial mobile page weight excluding 3D under **500 KB**; any three.js island under **200 KB** gzipped.
- **Deploy:** the site is live at `https://areej-1.github.io/electric_car_website/`. Pages currently serves `main` at root with `build_type: legacy`. Any change to that is one-time, needs its own PR, and needs a written rollback.
- **Base path:** the site is served from a subpath, `/electric_car_website`. Every internal link and asset URL must respect it.

### Deviation from the spec, and why

The spec (§7) called for a Pillow image pipeline. **Use Astro's built-in image optimization instead.** Pillow was chosen because the machine has no ImageMagick; but Astro bundles sharp, which does responsive `srcset`, format negotiation and resizing natively, and is a supported path rather than a bespoke script. Pillow is still used for the Silverstone grade, which is a bespoke duotone transform rather than a resize. Task 6 reflects this.

---

## File Structure

```
site/                                   # new Astro project, lives beside the legacy files
  astro.config.mjs                      # base path, i18n routing, static output
  package.json
  src/
    styles/
      tokens.css                        # palette + type scale as custom properties
      base.css                          # resets, element defaults, focus rings
    i18n/
      strings.js                        # COMMON/PAGES/TITLES lifted from arabic.js
      t.js                              # lookup helpers, build-time only
    components/
      SiteNav.astro                     # was cobras-lib.js NAV_ITEMS + RESOURCE_ITEMS
      SiteFooter.astro
      StatusBadge.astro                 # recorded / estimated / pending
      Portrait.astro                    # branded placeholder replacing the ducks
    layouts/
      BaseLayout.astro                  # <head>, skip link, nav, footer, lang/dir
    pages/
      index.astro                       # EN proving page
      ar/index.astro                    # AR proving page
tools/
  grade-plate.py                        # Pillow, Silverstone duotone only
tests/
  verify-build.mjs                      # replaces verify-site.mjs, asserts dist/
.github/workflows/
  deploy.yml                            # build + deploy to Pages
docs/
  DEPLOY.md                             # the Pages switch and its rollback
```

`site/` sits beside the existing HTML rather than replacing it, so the live site keeps building from `main` until the switch in Task 10. The 14 legacy pages are ported in phases 2–4.

---

### Task 1: Worktree and Astro scaffold

Another session has uncommitted work in the primary checkout. Work in an isolated worktree.

**Files:**
- Create: `site/` (Astro scaffold), `.gitignore` (modify)

**Interfaces:**
- Produces: an Astro project at `site/` that builds to `site/dist/`, and `npm --prefix site run build` as the build command every later task uses.

- [ ] **Step 1: Create the worktree off the last commit**

```bash
cd /Users/mirza/projects/electric_car_website
git worktree add ../cobras-phase1 -b feat/cobras-phase-1 af0ff6d
cd ../cobras-phase1
git log --oneline -1
```

Expected: `af0ff6d Fix spec section 1 to match the amended car ownership`. All work happens in `../cobras-phase1` from here.

- [ ] **Step 2: Scaffold Astro**

```bash
cd ../cobras-phase1
npm create astro@latest site -- --template minimal --no-install --no-git --skip-houston --typescript strict
npm --prefix site install
node -e "console.log(require('./site/package.json').dependencies.astro)"
```

Record the installed Astro version — it pins the project.

- [ ] **Step 3: Configure base path and static output**

Create `site/astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://areej-1.github.io',
  base: '/electric_car_website',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
```

- [ ] **Step 4: Keep the 59 MB HQ turntable and build output out of git**

Append to `.gitignore`:

```
# HQ turntable source frames — 59 MB, processed into responsive output instead
assets/car-turntable-hq/

# Astro
site/dist/
site/.astro/
site/node_modules/
```

- [ ] **Step 5: Verify the build produces output**

```bash
npm --prefix site run build
test -f site/dist/index.html && echo "BUILD OK" || echo "BUILD FAILED"
```

Expected: `BUILD OK`.

- [ ] **Step 6: Commit**

```bash
git add .gitignore site
git commit -m "Scaffold Astro site with subpath base config

Lives at site/ beside the legacy pages so the live site keeps building
from main until the Pages switch. Base path is /electric_car_website
because Pages serves this repo from a subpath, not a domain root.

Also gitignores assets/car-turntable-hq/ — 59 MB of source frames,
heavier than the entire media problem this phase exists to fix."
```

---

### Task 2: Design tokens and typography

**Files:**
- Create: `site/src/styles/tokens.css`, `site/src/styles/base.css`
- Test: `tests/tokens.test.mjs`

**Interfaces:**
- Produces: CSS custom properties `--ink --panel --raised --cobra --hot --gold --soft-gold --cream --steel`, `--font-display`, `--font-body`, and the type scale `--step--1` through `--step-4`. Every later component reads these and never hardcodes a hex.

- [ ] **Step 1: Write the failing test**

Create `tests/tokens.test.mjs`:

```js
import fs from 'node:fs';
import assert from 'node:assert/strict';

const css = fs.readFileSync(new URL('../site/src/styles/tokens.css', import.meta.url), 'utf8');

const REQUIRED = {
  '--ink': '#0A0A0A', '--panel': '#141414', '--raised': '#1A1A1A',
  '--cobra': '#7C0A02', '--hot': '#E6392B', '--gold': '#C9A227',
  '--soft-gold': '#E8B923', '--cream': '#F5F0E8', '--steel': '#9AA3A8',
};
for (const [name, value] of Object.entries(REQUIRED)) {
  assert.match(css, new RegExp(`${name}\\s*:\\s*${value}`, 'i'), `${name} must be ${value}`);
}

// No hex outside the approved palette.
const allowed = new Set(Object.values(REQUIRED).map((v) => v.toLowerCase()));
const hexes = (css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).map((h) => h.toLowerCase());
const stray = [...new Set(hexes)].filter((h) => !allowed.has(h));
assert.deepEqual(stray, [], `unapproved hex values: ${stray.join(', ')}`);

assert.match(css, /--font-display:\s*['"]?Orbitron/i, 'Orbitron must be the display face');
assert.match(css, /--font-body:\s*['"]?Poppins/i, 'Poppins must be the body face');
console.log('PASS tokens');
```

- [ ] **Step 2: Run it and watch it fail**

```bash
node tests/tokens.test.mjs
```

Expected: FAIL — `ENOENT ... tokens.css`.

- [ ] **Step 3: Write the tokens**

Create `site/src/styles/tokens.css`:

```css
:root {
  --ink: #0A0A0A;
  --panel: #141414;
  --raised: #1A1A1A;
  --cobra: #7C0A02;
  --hot: #E6392B;
  --gold: #C9A227;
  --soft-gold: #E8B923;
  --cream: #F5F0E8;
  --steel: #9AA3A8;

  --font-display: 'Orbitron', system-ui, sans-serif;
  --font-body: 'Poppins', system-ui, sans-serif;

  --step--1: clamp(0.78rem, 0.76rem + 0.1vw, 0.85rem);
  --step-0: clamp(0.95rem, 0.92rem + 0.15vw, 1rem);
  --step-1: clamp(1.1rem, 1rem + 0.5vw, 1.35rem);
  --step-2: clamp(1.35rem, 1.1rem + 1.2vw, 2.35rem);
  --step-3: clamp(1.8rem, 1.2rem + 2.6vw, 3.4rem);
  --step-4: clamp(2.5rem, 1.4rem + 6vw, 5.6rem);

  --measure: 62ch;
  --gutter: clamp(1rem, 4vw, 2.5rem);
  --shell: 1180px;
}
```

- [ ] **Step 4: Run the test and watch it pass**

```bash
node tests/tokens.test.mjs
```

Expected: `PASS tokens`.

- [ ] **Step 5: Write the base stylesheet**

Create `site/src/styles/base.css`:

```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--ink);
  color: var(--cream);
  font-family: var(--font-body);
  font-size: var(--step-0);
  line-height: 1.65;
  overflow-x: clip;
}
h1, h2, h3 { font-family: var(--font-display); font-weight: 700; line-height: 1.15; }
h1 { font-size: var(--step-4); font-weight: 900; }
h2 { font-size: var(--step-2); }
h3 { font-size: var(--step-1); }
p { max-width: var(--measure); }
a { color: var(--cream); }
img, video { max-width: 100%; height: auto; }

:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--soft-gold);
  outline-offset: 3px;
}

.shell { width: min(100% - var(--gutter) * 2, var(--shell)); margin-inline: auto; }

.skip-link {
  position: absolute; left: -9999px;
  background: var(--hot); color: var(--cream); padding: 12px 18px; z-index: 100;
}
.skip-link:focus { left: var(--gutter); top: 12px; }

/* Arabic keeps Orbitron off body copy — it is unreadable at length in Arabic. */
[lang="ar"] body, [lang="ar"] h1, [lang="ar"] h2, [lang="ar"] h3 { font-family: var(--font-body); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important; scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add site/src/styles tests/tokens.test.mjs
git commit -m "Add design tokens and base stylesheet

Palette and type scale from DESIGN.md as custom properties. The test
asserts every required token AND fails on any hex outside the approved
set, so palette drift is caught at build rather than in review.

Arabic overrides the display face for headings — Orbitron has no Arabic
coverage and DESIGN.md rules it out for Arabic body copy."
```

---

### Task 3: Translation data, extracted and testable

`arabic.js` holds real translated content worth keeping. What must die is applying it by walking the DOM at runtime.

**Files:**
- Create: `site/src/i18n/strings.js`, `site/src/i18n/t.js`
- Test: `tests/i18n.test.mjs`
- Read: `arabic.js` (source of the content)

**Interfaces:**
- Produces: `strings.js` exporting `COMMON`, `PAGES`, `TITLES` (same shapes as `arabic.js`); `t.js` exporting `t(lang, page, text)` returning the translated string or the input unchanged, and `LANGS = ['en', 'ar']`.

- [ ] **Step 1: Write the failing test**

Create `tests/i18n.test.mjs`:

```js
import assert from 'node:assert/strict';
import { t, LANGS } from '../site/src/i18n/t.js';
import { COMMON, PAGES, TITLES } from '../site/src/i18n/strings.js';

assert.deepEqual(LANGS, ['en', 'ar']);

// English is the source language — it returns input untouched.
assert.equal(t('en', 'members', 'Our Team'), 'Our Team');

// Arabic resolves from COMMON.
assert.equal(t('ar', 'members', 'Our Team'), 'فريقنا');

// Unknown strings pass through rather than throwing or emitting empty text.
assert.equal(t('ar', 'members', 'Not A Known String'), 'Not A Known String');

// Page-specific entries win over COMMON.
assert.ok(Object.keys(PAGES).length > 0, 'PAGES must carry per-page entries');
assert.ok(Object.keys(TITLES).length > 0, 'TITLES must carry page titles');

// The credit line is required by DESIGN.md section 5 and must survive the move.
assert.equal(t('ar', 'index', 'Made by Areej and Mirza'), 'تصميم وتطوير عريج وميرزا');

console.log('PASS i18n');
```

- [ ] **Step 2: Run it and watch it fail**

```bash
node tests/i18n.test.mjs
```

Expected: FAIL — cannot find module `t.js`.

- [ ] **Step 3: Extract the data**

Run this once to lift the three objects out of the IIFE in `arabic.js` into an ES module:

```bash
node --input-type=module -e "
import fs from 'node:fs';
import vm from 'node:vm';
const src = fs.readFileSync('arabic.js', 'utf8');
const sandbox = { globalThis: {}, module: { exports: {} } };
sandbox.global = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const api = sandbox.CobrasArabic || sandbox.globalThis.CobrasArabic;
const out = 'export const COMMON = ' + JSON.stringify(api.COMMON, null, 2) +
  ';\n\nexport const PAGES = ' + JSON.stringify(api.PAGES, null, 2) +
  ';\n\nexport const TITLES = ' + JSON.stringify(api.TITLES, null, 2) + ';\n';
fs.mkdirSync('site/src/i18n', { recursive: true });
fs.writeFileSync('site/src/i18n/strings.js', out);
console.log('COMMON', Object.keys(api.COMMON).length, 'PAGES', Object.keys(api.PAGES).length, 'TITLES', Object.keys(api.TITLES).length);
"
```

Record the three counts — Task 8 asserts none were lost.

- [ ] **Step 4: Write the lookup helper**

Create `site/src/i18n/t.js`:

```js
import { COMMON, PAGES, TITLES } from './strings.js';

export const LANGS = ['en', 'ar'];
export const DEFAULT_LANG = 'en';

// Page keys in the source data carry a .html suffix; routes do not.
function pageKey(page) {
  return page.endsWith('.html') ? page : `${page}.html`;
}

/**
 * English is the source language, so `text` IS the key. Unknown strings pass
 * through unchanged — a missing translation must degrade to readable English,
 * never to an empty node.
 */
export function t(lang, page, text) {
  if (lang === DEFAULT_LANG) return text;
  const perPage = PAGES[pageKey(page)];
  if (perPage && perPage[text] != null) return perPage[text];
  if (COMMON[text] != null) return COMMON[text];
  return text;
}

export function title(lang, page) {
  if (lang === DEFAULT_LANG) return null;
  return TITLES[pageKey(page)] ?? null;
}

export function dirFor(lang) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
```

- [ ] **Step 5: Run the test and watch it pass**

```bash
node tests/i18n.test.mjs
```

Expected: `PASS i18n`.

- [ ] **Step 6: Commit**

```bash
git add site/src/i18n tests/i18n.test.mjs
git commit -m "Extract Arabic content into a build-time i18n module

arabic.js holds real translated content; what has to go is applying it
by walking every text node in the browser on each page load. The data is
lifted verbatim into an ES module and consumed at build time instead.

Unknown strings pass through as English by design — a missing translation
must degrade to readable text, never an empty node."
```

---

### Task 4: BaseLayout with language routing

**Files:**
- Create: `site/src/layouts/BaseLayout.astro`
- Modify: `site/astro.config.mjs`

**Interfaces:**
- Consumes: `t`, `title`, `dirFor`, `LANGS` from Task 3; `base.css` from Task 2.
- Produces: `BaseLayout` accepting props `{ lang, page, title, description }`, emitting `<html lang dir>`, the skip link, `<SiteNav>`, `<slot />`, `<SiteFooter>`.

- [ ] **Step 1: Add i18n routing to the config**

Modify `site/astro.config.mjs` — add to the `defineConfig` object:

```js
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    routing: { prefixDefaultLocale: false },
  },
```

English serves at `/`, Arabic at `/ar/`.

- [ ] **Step 2: Write the layout**

Create `site/src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/base.css';
import SiteNav from '../components/SiteNav.astro';
import SiteFooter from '../components/SiteFooter.astro';
import { dirFor, title as trTitle } from '../i18n/t.js';

const { lang = 'en', page = 'index', title, description } = Astro.props;
const dir = dirFor(lang);
const resolvedTitle = trTitle(lang, page) ?? title;
const base = import.meta.env.BASE_URL;
---
<!doctype html>
<html lang={lang} dir={dir}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>{resolvedTitle}</title>
  <meta name="description" content={description} />
  <link rel="icon" href={`${base}/favicon.png`} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Poppins:wght@400;500;600&display=swap" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <SiteNav lang={lang} page={page} />
  <main id="main"><slot /></main>
  <SiteFooter lang={lang} page={page} />
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add site/src/layouts site/astro.config.mjs
git commit -m "Add BaseLayout with EN/AR routing

English at /, Arabic at /ar/. lang and dir are set on the document rather
than swapped by script after load, so Arabic is correct in view-source and
to crawlers instead of only after JavaScript runs."
```

---

### Task 5: Shared chrome at build time

Replaces the runtime nav/footer construction in `cobras-lib.js`.

**Files:**
- Create: `site/src/components/SiteNav.astro`, `site/src/components/SiteFooter.astro`
- Read: `cobras-lib.js:750-770` for `RESOURCE_ITEMS` and `NAV_ITEMS`

**Interfaces:**
- Consumes: `t` from Task 3.
- Produces: `SiteNav` and `SiteFooter`, both accepting `{ lang, page }`.

- [ ] **Step 1: Read the existing nav data**

```bash
sed -n '748,772p' cobras-lib.js
```

Copy `NAV_ITEMS` and `RESOURCE_ITEMS` verbatim into the component below — same labels, same hrefs, same order. Do not redesign the information architecture in this task.

- [ ] **Step 2: Write SiteNav**

Create `site/src/components/SiteNav.astro`:

```astro
---
import { t } from '../i18n/t.js';
const { lang = 'en', page = 'index' } = Astro.props;
const base = import.meta.env.BASE_URL;
const prefix = lang === 'ar' ? `${base}/ar` : base;

// Mirrors NAV_ITEMS / RESOURCE_ITEMS in cobras-lib.js. Kept identical in phase 1;
// information architecture changes belong to phases 3 and 4.
const NAV = [
  { key: 'index', label: 'Home', href: '/' },
  { key: 'members', label: 'Members', href: '/members' },
  { key: 'projects', label: 'Our Work', href: '/projects' },
  { key: 'specs', label: 'Specs', href: '/specs' },
  { key: 'sponsors', label: 'Sponsor Us', href: '/sponsors' },
];
const RESOURCES = [
  { key: 'race-day', label: 'Race Day', href: '/race-day' },
  { key: 'news', label: 'News', href: '/news' },
  { key: '101', label: 'Electric Cars 101', href: '/101' },
  { key: 'checklist', label: 'Race checklist', href: '/checklist' },
];
const other = lang === 'ar' ? 'English' : 'العربية';
const otherHref = lang === 'ar' ? `${base}/` : `${base}/ar/`;
---
<nav class="site-nav" aria-label={t(lang, page, 'Main')}>
  <div class="shell nav-inner">
    <a class="brand" href={prefix || '/'}>
      <img src={`${base}/cobra-race-mark.png`} alt="SIS Al Jada Cobras" width="36" height="36" />
    </a>
    <ul class="nav-list">
      {NAV.map((item) => (
        <li>
          <a href={`${prefix}${item.href}`} aria-current={item.key === page ? 'page' : undefined}>
            {t(lang, page, item.label)}
          </a>
        </li>
      ))}
      <li class="has-sub">
        <span>{t(lang, page, 'Resources')}</span>
        <ul>
          {RESOURCES.map((item) => (
            <li><a href={`${prefix}${item.href}`}>{t(lang, page, item.label)}</a></li>
          ))}
        </ul>
      </li>
    </ul>
    <a class="lang-switch" href={otherHref} lang={lang === 'ar' ? 'en' : 'ar'}>{other}</a>
  </div>
</nav>

<style>
  .site-nav { position: sticky; top: 0; z-index: 40; background: rgba(10,10,10,.88);
              backdrop-filter: blur(8px); border-bottom: 1px solid rgba(154,163,168,.18); }
  .nav-inner { display: flex; align-items: center; gap: 1.5rem; min-height: 60px; }
  .nav-list { display: flex; gap: 1.25rem; list-style: none; margin: 0; padding: 0; flex: 1; }
  .nav-list a { text-decoration: none; font-size: var(--step--1); }
  .nav-list a[aria-current='page'] { color: var(--hot); }
  .lang-switch { font-family: var(--font-display); font-size: var(--step--1);
                 border: 1px solid var(--gold); padding: 6px 12px; text-decoration: none; }
  .brand img { display: block; }
  @media (max-width: 760px) { .nav-list { display: none; } }
</style>
```

The mobile menu is deliberately not built here — it needs the full page set to be worth designing, and lands in phase 3.

- [ ] **Step 3: Write SiteFooter**

Create `site/src/components/SiteFooter.astro`:

```astro
---
import { t } from '../i18n/t.js';
const { lang = 'en', page = 'index' } = Astro.props;
const base = import.meta.env.BASE_URL;
const prefix = lang === 'ar' ? `${base}/ar` : base;
const year = 2026;
---
<footer class="site-footer">
  <div class="shell foot-inner">
    <p class="credit">{t(lang, page, 'Made by Areej and Mirza')}</p>
    <ul>
      <li><a href={`${prefix}/about`}>{t(lang, page, 'About')}</a></li>
      <li><a href={`${prefix}/sponsors`}>{t(lang, page, 'Sponsor Us')}</a></li>
      <li><a href={`${prefix}/race-day`}>{t(lang, page, 'Race Day')}</a></li>
    </ul>
    <p class="copy">{t(lang, page, `Copyright ${year} SIS Al Jada Cobras`)}</p>
  </div>
</footer>

<style>
  .site-footer { border-top: 1px solid rgba(154,163,168,.18); background: var(--panel);
                 margin-top: 4rem; padding: 2rem 0; }
  .foot-inner { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: baseline;
                justify-content: space-between; }
  .site-footer ul { display: flex; gap: 1rem; list-style: none; margin: 0; padding: 0; }
  .site-footer a { font-size: var(--step--1); }
  .credit { font-family: var(--font-display); font-size: var(--step--1); margin: 0; }
  .copy { color: var(--steel); font-size: var(--step--1); margin: 0; }
</style>
```

- [ ] **Step 4: Build both locales as a proving page**

Create `site/src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout lang="en" page="index" title="SIS Al Jada Cobras"
            description="Student-built electric race team at SABIS Al Jada, Sharjah.">
  <div class="shell"><h1>SIS Al Jada Cobras</h1></div>
</BaseLayout>
```

Create `site/src/pages/ar/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout lang="ar" page="index" title="فريق كوبرا سيس الجادة"
            description="فريق سيارات كهربائية طلابي في سيس الجادة، الشارقة.">
  <div class="shell"><h1>فريق كوبرا سيس الجادة</h1></div>
</BaseLayout>
```

- [ ] **Step 5: Verify both render with correct direction**

```bash
npm --prefix site run build
grep -o 'dir="[a-z]*"' site/dist/index.html
grep -o 'dir="[a-z]*"' site/dist/ar/index.html
grep -c 'site-nav' site/dist/index.html
```

Expected: `dir="ltr"`, `dir="rtl"`, and at least one `site-nav` — proving the chrome is in the HTML rather than assembled by script.

- [ ] **Step 6: Commit**

```bash
git add site/src/components site/src/pages
git commit -m "Render shared chrome at build time

Nav and footer are components resolved during the build, replacing the
runtime chrome construction in cobras-lib.js. The markup is now in the
HTML a crawler sees, which is the point for a site whose job is being
credible to sponsors and judges who search for the team.

Mobile menu is deliberately deferred to phase 3, when the full page set
exists to design it against."
```

---

### Task 6: Image pipeline

**Files:**
- Create: `site/src/components/Img.astro`, `tools/grade-plate.py`
- Test: `tests/images.test.mjs`

**Interfaces:**
- Produces: `Img` accepting `{ src, alt, widths, sizes, loading }`, emitting a responsive `<picture>` via Astro's optimizer.

- [ ] **Step 1: Write the failing test**

Create `tests/images.test.mjs`:

```js
import fs from 'node:fs';
import assert from 'node:assert/strict';

const dist = new URL('../site/dist/', import.meta.url);
const html = fs.readFileSync(new URL('index.html', dist), 'utf8');

assert.match(html, /srcset=/, 'images must ship a srcset');
assert.match(html, /\.webp/, 'images must offer webp');
assert.match(html, /loading="lazy"/, 'below-fold images must lazy-load');
assert.match(html, /width="\d+"\s+height="\d+"|width="\d+" height="\d+"/,
  'images must carry intrinsic dimensions to avoid layout shift');

console.log('PASS images');
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm --prefix site run build && node tests/images.test.mjs
```

Expected: FAIL — no `srcset` in the proving page yet.

- [ ] **Step 3: Write the component**

Create `site/src/components/Img.astro`:

```astro
---
import { Image } from 'astro:assets';
const {
  src, alt, widths = [640, 1024, 1600],
  sizes = '(max-width: 760px) 100vw, 1180px',
  loading = 'lazy', class: className,
} = Astro.props;
if (alt == null) throw new Error('Img requires alt. Decorative images must pass alt="".');
---
<Image src={src} alt={alt} widths={widths} sizes={sizes}
       loading={loading} decoding="async" format="webp" class={className} />
```

Throwing on missing `alt` is deliberate: it makes the accessibility requirement a build failure rather than a review note.

- [ ] **Step 4: Use it on the proving page**

In `site/src/pages/index.astro`, add the import and the image inside the `shell` div:

```astro
import Img from '../components/Img.astro';
import wiring from '../../../wiring.JPG';
```

```astro
  <Img src={wiring} alt="Cobras students wiring the 48V system" loading="lazy" />
```

- [ ] **Step 5: Run the test and watch it pass**

```bash
npm --prefix site run build && node tests/images.test.mjs
```

Expected: `PASS images`.

- [ ] **Step 6: Move the Silverstone grade into a tool**

Create `tools/grade-plate.py` — this is the one transform Astro cannot do, a bespoke duotone rather than a resize:

```python
#!/usr/bin/env python3
"""Grade the Silverstone SkySat plate to the Cobra palette.

Not a resize — Astro handles those. This is a crop, a 90-degree rotation and a
duotone ramp, documented in prototype/trackmap/assets/LICENSE-imagery.md.
Output is CC BY-SA 4.0, same as the source.
"""
import sys
from PIL import Image, ImageEnhance

CROP = (1180, 60, 3080, 2249)
BOX = (100, 200, 2160, 1420)
INK, TOP = (10, 10, 10), (214, 206, 196)

def grade(src_path, out_path):
    im = Image.open(src_path).convert("RGB").crop(CROP)
    im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(0.06)).enhance(1.18)
    lum = im.convert("L")
    lut = [[], [], []]
    for v in range(256):
        t = (v / 255.0) ** 1.55 * 0.82 + 0.02
        for c in range(3):
            lut[c].append(int(INK[c] + (TOP[c] - INK[c]) * t))
    duo = Image.merge("RGB", (lum.point(lut[0]), lum.point(lut[1]), lum.point(lut[2])))
    duo.transpose(Image.ROTATE_270).crop(BOX).save(out_path, quality=88)
    print(f"wrote {out_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("usage: grade-plate.py <master.jpg> <out.jpg>")
    grade(sys.argv[1], sys.argv[2])
```

- [ ] **Step 7: Commit**

```bash
git add site/src/components/Img.astro site/src/pages/index.astro tools/grade-plate.py tests/images.test.mjs
git commit -m "Add responsive image component and plate grading tool

Uses Astro's built-in optimizer rather than the bespoke Pillow pipeline
the spec called for. Pillow was chosen only because the machine has no
ImageMagick; Astro bundles sharp, which does srcset, format negotiation
and sizing as a supported path. Pillow keeps the Silverstone duotone,
which is a bespoke colour transform rather than a resize.

Img throws when alt is missing, so the accessibility rule is a build
failure rather than something to catch in review."
```

---

### Task 7: The honesty deletions

Removes the four assets that misrepresent the team. 7.3 MB, and the ducks are referenced by exactly one page.

**Files:**
- Delete: `car.png`, `car-rear.png`, `home2.JPG`, 21 `*duck*` files
- Create: `site/src/components/Portrait.astro`
- Test: `tests/honesty.test.mjs`

**Interfaces:**
- Produces: `Portrait` accepting `{ name, role, photo }`, rendering a branded placeholder when `photo` is absent.

- [ ] **Step 1: Write the failing test**

Create `tests/honesty.test.mjs`:

```js
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const BANNED = [
  'car.png',            // generic stock sedan clipart, not a race car
  'car-rear.png',       // stylised buggy render, not this team's car
  'home2.JPG',          // unrelated children; DESIGN.md section 7 forbids it
];
for (const file of BANNED) {
  assert.equal(fs.existsSync(new URL(file, root)), false, `${file} must be deleted`);
}

const ducks = fs.readdirSync(root).filter((f) => /duck/i.test(f));
assert.deepEqual(ducks, [], `duck images must be deleted: ${ducks.join(', ')}`);

console.log('PASS honesty');
```

- [ ] **Step 2: Run it and watch it fail**

```bash
node tests/honesty.test.mjs
```

Expected: FAIL — `car.png must be deleted`.

- [ ] **Step 3: Write the portrait placeholder**

Create `site/src/components/Portrait.astro`:

```astro
---
const { name, role, photo } = Astro.props;
const initials = String(name || '')
  .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
---
<figure class="portrait">
  {photo
    ? <img src={photo} alt={`${name}, ${role}`} width="320" height="400" loading="lazy" />
    : <div class="ph" role="img" aria-label={`${name}, ${role}. Photograph pending.`}>
        <span class="initials">{initials}</span>
      </div>}
  <figcaption>
    <span class="name">{name}</span>
    <span class="role">{role}</span>
  </figcaption>
</figure>

<style>
  .portrait { margin: 0; }
  .ph { aspect-ratio: 4 / 5; display: grid; place-items: center;
        background: var(--panel); border: 1px solid rgba(201,162,39,.28);
        border-top: 2px solid var(--hot); }
  .initials { font-family: var(--font-display); font-weight: 900;
              font-size: var(--step-2); color: var(--gold); letter-spacing: .06em; }
  figcaption { display: flex; flex-direction: column; padding-top: 10px; }
  .name { font-family: var(--font-display); font-size: var(--step--1); }
  .role { color: var(--steel); font-size: var(--step--1); }
</style>
```

A consistent branded placeholder with the member's initials — intentional-looking, and honest that the photograph is pending. It replaces 6.6 MB of novelty duck images.

- [ ] **Step 4: Delete the assets**

```bash
git rm car.png car-rear.png home2.JPG
git rm batman_duck.png blueglitter_duck.png chef_duck.png clownfish_duck.png \
       coffee_duck.png dolphin_duck.png duck.jpg golf_duck.png hat_duck.png \
       hedgehog_duck.png holland_duck.png influencer_duck.png leopard_duck.png \
       minion_duck.png muslce_duck.png photo_duck.png selfie_duck.png \
       singer_duck.png smoking_duck.png stewardess_duck.png vacation_duck.png
```

- [ ] **Step 5: Run the test and watch it pass**

```bash
node tests/honesty.test.mjs
```

Expected: `PASS honesty`.

- [ ] **Step 6: Confirm nothing still points at them**

```bash
grep -rlE 'car\.png|car-rear\.png|home2\.JPG|duck' --include='*.html' --include='*.js' --include='*.css' . \
  | grep -v node_modules | grep -v docs/ | grep -v prototype/
```

Expected: only `members.html`, which phase 3 rebuilds on `Portrait`. If anything else appears, note it for that phase — do not patch legacy pages here.

- [ ] **Step 7: Commit**

```bash
git add site/src/components/Portrait.astro tests/honesty.test.mjs
git commit -m "Delete assets that misrepresent the team; add portrait placeholder

Removes 7.3 MB: car.png is generic stock sedan clipart, car-rear.png is a
stylised buggy render that is not this team's car, home2.JPG shows
unrelated children which DESIGN.md section 7 forbids, and 21 duck images
stood in for member portraits.

Portrait renders a branded initials placeholder when no photograph exists
— deliberately unfinished rather than broken, and honest that the photo is
pending. The test fails the build if any of them return."
```

---

### Task 8: Build verification suite

Replaces `tests/verify-site.mjs`, which asserts against source HTML files that phases 3–4 delete.

**Files:**
- Create: `tests/verify-build.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `site/dist/` from the build; translation counts recorded in Task 3.
- Produces: `npm run verify` covering tokens, i18n, images, honesty and build output.

- [ ] **Step 1: Write the verification suite**

Create `tests/verify-build.mjs`:

```js
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { COMMON, PAGES, TITLES } from '../site/src/i18n/strings.js';

const dist = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../site/dist');
const failures = [];
const check = (name, fn) => {
  try { fn(); console.log(`PASS  ${name}`); }
  catch (e) { failures.push(name); console.error(`FAIL  ${name}\n      ${e.message}`); }
};
const read = (p) => fs.readFileSync(path.join(dist, p), 'utf8');

check('build output exists', () => {
  assert.ok(fs.existsSync(path.join(dist, 'index.html')), 'missing dist/index.html');
  assert.ok(fs.existsSync(path.join(dist, 'ar/index.html')), 'missing dist/ar/index.html');
});

for (const [page, lang, dir] of [['index.html', 'en', 'ltr'], ['ar/index.html', 'ar', 'rtl']]) {
  check(`${page} document language`, () => {
    const html = read(page);
    assert.match(html, new RegExp(`lang="${lang}"`), `expected lang="${lang}"`);
    assert.match(html, new RegExp(`dir="${dir}"`), `expected dir="${dir}"`);
  });
  check(`${page} chrome is server-rendered`, () => {
    const html = read(page);
    assert.match(html, /class="site-nav"/, 'nav missing from HTML');
    assert.match(html, /site-footer/, 'footer missing from HTML');
  });
  check(`${page} head`, () => {
    const html = read(page);
    assert.match(html, /<title>[^<]+<\/title>/, 'missing title');
    assert.match(html, /name="description"\s+content="[^"]+"/, 'missing description');
  });
  check(`${page} skip link`, () => {
    assert.match(read(page), /class="skip-link"/, 'missing skip link');
  });
}

check('no runtime chrome or translation blobs shipped', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /cobras-lib\.js/, 'cobras-lib.js must not ship');
  assert.doesNotMatch(html, /arabic\.js/, 'arabic.js must not ship');
});

check('translation content survived the move', () => {
  assert.ok(Object.keys(COMMON).length >= 20, 'COMMON lost entries');
  assert.ok(Object.keys(PAGES).length >= 5, 'PAGES lost entries');
  assert.ok(Object.keys(TITLES).length >= 5, 'TITLES lost entries');
});

check('no unapproved hex in built CSS', () => {
  const allowed = new Set(['#0a0a0a','#141414','#1a1a1a','#7c0a02','#e6392b',
                           '#c9a227','#e8b923','#f5f0e8','#9aa3a8']);
  const cssDir = path.join(dist, '_astro');
  if (!fs.existsSync(cssDir)) return;
  for (const f of fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'))) {
    const hexes = (fs.readFileSync(path.join(cssDir, f), 'utf8').match(/#[0-9a-fA-F]{6}\b/g) || [])
      .map((h) => h.toLowerCase());
    const stray = [...new Set(hexes)].filter((h) => !allowed.has(h));
    assert.deepEqual(stray, [], `${f} has unapproved hex: ${stray.join(', ')}`);
  }
});

check('mobile page weight budget', () => {
  let total = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(html|css|js)$/.test(e.name)) total += fs.statSync(p).size;
    }
  };
  walk(dist);
  const kb = Math.round(total / 1024);
  console.log(`      HTML+CSS+JS total: ${kb} KB`);
  assert.ok(kb < 500, `budget is 500 KB, got ${kb} KB`);
});

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log('\nAll build checks passed');
```

- [ ] **Step 2: Wire it into package.json**

Replace the `scripts` block in `package.json`:

```json
  "scripts": {
    "start": "npx --yes serve -l 3000",
    "dev": "npm --prefix site run dev",
    "build": "npm --prefix site run build",
    "test:legacy": "node tests/cobras-lib.test.mjs && node tests/arabic.test.mjs",
    "test:unit": "node tests/tokens.test.mjs && node tests/i18n.test.mjs && node tests/honesty.test.mjs",
    "test:build": "node tests/verify-build.mjs && node tests/images.test.mjs",
    "test": "npm run test:legacy && npm run test:unit && npm run build && npm run test:build",
    "verify": "npm test"
  }
```

**`test:legacy` is deliberately retained.** `cobras-lib.js` and `arabic.js` are still
referenced by 13 legacy pages that phase 1 does not touch — they stop shipping only when
phase 4 removes the last of those pages. Dropping their tests now would leave live code
unguarded for three phases.

**Do not add `build:viewer`.** It and `tools/build-kart-viewer.mjs` belong to a concurrent
session and are uncommitted on another working tree; they do not exist at this branch's
base. Adding the script here would point npm at a missing file. It arrives on its own when
the two branches merge.

- [ ] **Step 3: Run the whole suite**

```bash
npm test
```

Expected: all checks pass, with the KB figure printed.

- [ ] **Step 4: Retire the old harness**

```bash
git mv tests/verify-site.mjs tests/legacy-verify-site.mjs.bak
```

Kept rather than deleted — phases 3 and 4 port its page-level assertions as each page moves across. It is out of `npm test` because it asserts against source HTML that those phases delete.

**Merge note:** a concurrent session has uncommitted modifications to `tests/verify-site.mjs` on another working tree. This rename will collide with those edits when the branches merge. Resolve by taking their modified file and re-applying the rename — their added assertions belong to the car viewer and must not be lost to this rename.

- [ ] **Step 5: Commit**

```bash
git add tests package.json
git commit -m "Replace site verification with build-output verification

verify-site.mjs asserts against source HTML files that phases 3 and 4
delete, so it is renamed to .bak and kept as the checklist to port from
rather than deleted outright.

The new suite asserts what phase 1 is actually for: both locales build
with correct lang and dir, chrome is in the HTML rather than assembled by
script, cobras-lib.js and arabic.js no longer ship, no translation content
was lost in the move, no unapproved hex reached the built CSS, and the
500 KB budget holds."
```

---

### Task 9: GitHub Actions build and deploy

This task builds and verifies the workflow but does **not** switch Pages over. That is Task 10, on its own.

**Files:**
- Create: `.github/workflows/deploy.yml`, `docs/DEPLOY.md`

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '26'
      - run: npm --prefix site ci || npm --prefix site install
      - run: npm test
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`npm test` runs before the artifact uploads, so a failing honesty or budget check blocks the deploy rather than shipping.

- [ ] **Step 2: Write the deploy documentation and rollback**

Create `docs/DEPLOY.md`:

```markdown
# Deploying

The site is live at https://areej-1.github.io/electric_car_website/

## How it works now

GitHub Actions builds `site/` on every push to `main` and deploys `site/dist`
to GitHub Pages. `npm test` runs first — a failing check blocks the deploy.

## How it worked before

Pages served the repository root of `main` directly, with `build_type: legacy`.
No build step; committed HTML was the site.

## Rolling back

If the Actions deploy is broken and the site must be restored immediately:

1. Repository Settings → Pages → Build and deployment
2. Set Source back to **Deploy from a branch**
3. Branch `main`, folder `/ (root)`
4. Save

The legacy HTML files are still in the repository root until phase 4 removes
them, so this restores the previous site exactly. Do not delete those files
until Actions deploys have been stable for at least a week.

## Verifying a deploy

```bash
curl -sI https://areej-1.github.io/electric_car_website/ | head -1   # expect 200
curl -s  https://areej-1.github.io/electric_car_website/ | grep -o 'lang="[a-z]*"'
curl -sI https://areej-1.github.io/electric_car_website/ar/ | head -1
```
```

- [ ] **Step 3: Validate the workflow parses**

```bash
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/deploy.yml')); print('workflow YAML OK')"
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml docs/DEPLOY.md
git commit -m "Add Pages build workflow and deploy documentation

Does not switch Pages over — that is a separate change against a live
site. This lands the workflow and the rollback procedure first so the
switch is a one-line settings change with a documented way back.

npm test runs before the artifact uploads, so a failing honesty or budget
check blocks the deploy instead of shipping."
```

---

### Task 10: Switch Pages to the workflow

**Its own PR.** This is the only step in phase 1 that changes what the public sees.

**Files:** none — a repository settings change plus verification.

- [ ] **Step 1: Confirm the workflow succeeded on main first**

```bash
gh run list --workflow=deploy.yml --limit 3
```

Do not proceed unless the most recent run is green. If it has never run, merge Task 9 to `main` and wait for it.

- [ ] **Step 2: Record the current setting so rollback is exact**

```bash
gh api repos/areej-1/electric_car_website/pages | python3 -m json.tool
```

Expected to include `"build_type": "legacy"` and `"source": {"branch": "main", "path": "/"}`. Save this output into the PR description.

- [ ] **Step 3: Make the switch**

```bash
gh api -X PUT repos/areej-1/electric_car_website/pages -f build_type=workflow
gh api repos/areej-1/electric_car_website/pages --jq '.build_type'
```

Expected: `workflow`.

- [ ] **Step 4: Trigger and watch a deploy**

```bash
gh workflow run deploy.yml
sleep 45
gh run list --workflow=deploy.yml --limit 1
```

- [ ] **Step 5: Verify the live site**

```bash
curl -sI https://areej-1.github.io/electric_car_website/ | head -1
curl -s  https://areej-1.github.io/electric_car_website/ | grep -o 'lang="[a-z]*"'
curl -sI https://areej-1.github.io/electric_car_website/ar/ | head -1
```

Expected: `HTTP/2 200`, `lang="en"`, and `HTTP/2 200` for the Arabic route.

If any of these fail, roll back immediately using `docs/DEPLOY.md` before debugging. The live site takes priority over the diagnosis.

- [ ] **Step 6: Commit the record**

```bash
git commit --allow-empty -m "Switch GitHub Pages from legacy to workflow builds

Pages served main's repository root directly with build_type legacy.
It now deploys the Actions artifact from site/dist.

The previous configuration is recorded in the PR description and the
rollback is in docs/DEPLOY.md — Settings, Pages, Deploy from a branch,
main, / (root). The legacy HTML stays in the repository root until
phase 4, so that rollback restores the previous site exactly."
```

---

## Self-Review

**Spec coverage.** §3 palette and typography → Task 2. §6 provenance states → `StatusBadge` is listed in the file structure but has no task; it is **deferred to phase 3**, where the first page that displays a measured value needs it — building it now would be untested scaffolding. §7 architecture and i18n → Tasks 3–5. §7 deployment → Tasks 9–10. §9 budgets → asserted in Task 8. §2 deletions → Task 7. §11 accessibility → skip link and focus rings in Task 2, `dir`/`lang` in Task 4, `alt` enforcement in Task 6, `aria-label` on the portrait placeholder in Task 7.

**Deliberate deferrals**, so a reviewer does not read them as gaps: the mobile navigation menu (phase 3, needs the full page set), `StatusBadge` (phase 3, needs real data to display), and the 14 content pages (phases 3–4). The Track Map moves to phase 2.

**Known risks.** Task 6 Step 4 imports `wiring.JPG` from outside `site/` — if Astro rejects the parent-directory import, move the file into `site/src/assets/` and update the path; do not disable the optimizer. Task 8's 500 KB budget covers HTML, CSS and JS only, not images, which are lazy-loaded and responsive. Task 1's worktree branches from `af0ff6d`, deliberately excluding the concurrent session's uncommitted car work — that merges separately.
