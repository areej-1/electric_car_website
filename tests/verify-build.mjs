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

// Composition of the nav's <a> tags, all rendered by SiteNav.astro: brand (1) +
// NAV entries (5: Home, Members, Our Work, Specs, Sponsor Us) + RESOURCES entries
// (4: Race Day, News, Electric Cars 101, Race checklist) + language switch (1) = 11.
// Emptying NAV/RESOURCES — the exact mutation a previous review used to defeat this
// check — leaves `class="site-nav"` and `site-footer` intact while dropping every
// link, so a link count and specific routes are what actually prove real navigation
// shipped, not just a correctly-classed empty shell.
const EXPECTED_NAV_LINK_COUNT = 11;
const EXPECTED_NAV_ROUTES = [
  '/members', '/projects', '/specs', '/sponsors',
  '/race-day', '/news', '/101', '/checklist',
];

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

    const navMatch = html.match(/<nav\b[^>]*class="site-nav"[\s\S]*?<\/nav>/);
    assert.ok(navMatch, 'could not isolate <nav>...</nav> markup to inspect its links');
    const navHtml = navMatch[0];

    const linkCount = (navHtml.match(/<a\s/g) || []).length;
    assert.equal(linkCount, EXPECTED_NAV_LINK_COUNT,
      `expected ${EXPECTED_NAV_LINK_COUNT} links inside <nav> (brand + nav + resources ` +
      `+ language switch), got ${linkCount} — an emptied NAV or RESOURCES array lands here`);

    for (const route of EXPECTED_NAV_ROUTES) {
      assert.match(navHtml, new RegExp(`href="[^"]*${route}"`), `nav is missing a link to ${route}`);
    }
  });
  check(`${page} head`, () => {
    const html = read(page);
    assert.match(html, /<title>[^<]+<\/title>/, 'missing title');
    assert.match(html, /name="description"\s+content="[^"]+"/, 'missing description');
  });
  check(`${page} skip link`, () => {
    assert.match(read(page), /class="skip-link"/, 'missing skip link');
  });
  check(`${page} no runtime chrome or translation blobs shipped`, () => {
    const html = read(page);
    assert.doesNotMatch(html, /cobras-lib\.js/, 'cobras-lib.js must not ship');
    assert.doesNotMatch(html, /arabic\.js/, 'arabic.js must not ship');
  });
}

check('translation content survived the move', () => {
  assert.ok(Object.keys(COMMON).length >= 20, 'COMMON lost entries');
  assert.ok(Object.keys(PAGES).length >= 5, 'PAGES lost entries');
  assert.ok(Object.keys(TITLES).length >= 5, 'TITLES lost entries');
});

check('zero JavaScript in the build output', () => {
  // "Renders at build time, ships no JavaScript" is phase 1's headline property —
  // it's what replaced 62 KB of runtime nav construction (site.js) and 32 KB of
  // runtime DOM-walking translation (arabic.js's apply()). Nothing before this
  // check asserted it in the suite; every confirmation of a JS-free build was a
  // manual grep. Walk the whole tree, not just the two pages known today, so a
  // future page can't slip a script past this unnoticed.
  const scriptFiles = [];
  const pagesWithScriptTags = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (/\.m?js$/i.test(e.name)) scriptFiles.push(path.relative(dist, p));
      if (e.name.endsWith('.html')) {
        const html = fs.readFileSync(p, 'utf8');
        if (/<script\b/i.test(html)) pagesWithScriptTags.push(path.relative(dist, p));
      }
    }
  };
  walk(dist);
  assert.deepEqual(scriptFiles, [], `.js/.mjs file(s) shipped: ${scriptFiles.join(', ')}`);
  assert.deepEqual(pagesWithScriptTags, [], `<script> tag found in: ${pagesWithScriptTags.join(', ')}`);
});

check('no translation module reaches the browser', () => {
  // keys.js (cobras-lib.js's STRINGS — 365 keys per language) and strings.js
  // (arabic.js's COMMON/PAGES/TITLES) are meant to be build-time-only ES modules:
  // imported only from .astro frontmatter, which Astro/Vite executes while
  // building and never ships. Two independent signals, over every shipped
  // text-ish file (not just the two known HTML pages, and not just HTML — a
  // reintroduced client bundle would land in a .js chunk, not the markup):
  //   1. the module filenames, referenced by name — cheap, but a bundler
  //      renames/hashes chunks, so this alone would miss a renamed leak;
  //   2. content unique to the maps themselves, which survives renaming.
  const TEXT_EXT = /\.(html|js|mjs|css)$/i;

  // Distinctive values belonging to pages phase 1 has not built yet — today
  // dist/ only has index.html and ar/index.html. Deliberately NOT a nav/footer/
  // skip string: those are shared chrome, rendered via tk() on every page by
  // design, so they'd fire on legitimate future pages and make useless probes.
  // Each probe below is long and page-specific enough that no legitimate page
  // could contain it by coincidence. If a later phase genuinely builds the Game
  // or Members page, this check should start failing on real content — when
  // that happens, point the probe at a still-unbuilt page rather than deleting
  // the check.
  const PROBES = [
    // keys.js: the Game page's hero title. SiteNav.astro's own comment says
    // `game` "has no phase-1 home yet."
    { source: 'keys.js (game.title)', text: 'دائرة الكوبرا' },
    // strings.js: Members page hero body, arabic.js PAGES['members.html'].
    // No members page exists under site/src/pages yet.
    { source: "strings.js (PAGES['members.html'])",
      text: 'تسعة عشر طالبًا وطالبة يساهمون في سيارة سباق كوبرا عبر الميكانيكا والسلامة والابتكار والإعلام والقيادة.' },
  ];

  const filenameOffenders = [];
  const contentOffenders = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!TEXT_EXT.test(e.name)) continue;
      const text = fs.readFileSync(p, 'utf8');
      const rel = path.relative(dist, p);
      if (/keys\.js|strings\.js/.test(text)) filenameOffenders.push(rel);
      for (const probe of PROBES) {
        if (text.includes(probe.text)) contentOffenders.push(`${rel} contains ${probe.source}`);
      }
    }
  };
  walk(dist);

  assert.deepEqual(filenameOffenders, [],
    `keys.js/strings.js referenced by name in: ${filenameOffenders.join(', ')}`);
  assert.deepEqual(contentOffenders, [],
    `translation content for an unbuilt page leaked into shipped output: ${contentOffenders.join('; ')}`);
});

check('no unapproved hex in built CSS', () => {
  const allowed = new Set(['#0a0a0a','#141414','#1a1a1a','#7c0a02','#e6392b',
                           '#c9a227','#e8b923','#f5f0e8','#9aa3a8']);
  const strayHexIn = (css) => {
    // Match 3- and 6-digit hex with one pattern, normalise 3-digit shorthand to its 6-digit
    // form by doubling each character, and run every match through the same allow-list
    // comparison — one path, not a second parallel branch for shorthand. Every approved
    // value's three character-pairs are non-doubled (e.g. #0a0a0a is 0a,0a,0a — 0 != a), so
    // no approved colour can ever collapse to shorthand and normalising can't produce a
    // false positive against the allow-list.
    const matches = css.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) || [];
    const byNormalized = new Map(); // normalised 6-digit value -> original hex as typed
    for (const raw of matches) {
      const original = raw.toLowerCase();
      const digits = original.slice(1);
      const normalized = digits.length === 3
        ? `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`
        : original;
      if (!byNormalized.has(normalized)) byNormalized.set(normalized, original);
    }
    return [...byNormalized.entries()]
      .filter(([normalized]) => !allowed.has(normalized))
      .map(([normalized, original]) => (original === normalized ? normalized : `${original} (expands to ${normalized})`));
  };

  // Path 1: CSS Astro emitted as separate stylesheet chunks.
  const cssDir = path.join(dist, '_astro');
  if (fs.existsSync(cssDir)) {
    for (const f of fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'))) {
      const stray = strayHexIn(fs.readFileSync(path.join(cssDir, f), 'utf8'));
      assert.deepEqual(stray, [], `${f} has unapproved hex: ${stray.join(', ')}`);
    }
  }

  // Path 2: CSS Astro inlined into <style> tags. Astro's inlineStylesheets: 'auto' default
  // inlines a page's CSS straight into the HTML when the chunk is small (true for both
  // phase-1 pages today), so dist/_astro/*.css can be empty while real CSS still ships in
  // the HTML. Walk every built page and scan only inside <style> element contents — not
  // the whole document — so hex-like strings elsewhere in the markup can't trip this check.
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) {
        const html = fs.readFileSync(p, 'utf8');
        const styleContent = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
          .map((m) => m[1]).join('\n');
        const stray = strayHexIn(styleContent);
        assert.deepEqual(stray, [], `${path.relative(dist, p)} inline <style> has unapproved hex: ${stray.join(', ')}`);
      }
    }
  };
  walk(dist);
});

check('mobile page weight budget', () => {
  // Covers HTML, CSS, JS *and* images. A budget that stops at markup and code
  // is blind to exactly the kind of asset most likely to blow it — a 778 KB
  // logo sitting in public/ once passed this check reporting 13 KB, because
  // public/ bypasses the Astro optimizer and .png wasn't in the extension
  // list. Every file actually shipped to the browser counts now.
  let total = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(html|css|js|png|jpe?g|webp|avif|gif|svg|ico)$/i.test(e.name)) total += fs.statSync(p).size;
    }
  };
  walk(dist);
  const kb = Math.round(total / 1024);
  console.log(`      Total shipped (HTML+CSS+JS+images): ${kb} KB`);
  assert.ok(kb < 500, `budget is 500 KB, got ${kb} KB`);
});

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log('\nAll build checks passed');
