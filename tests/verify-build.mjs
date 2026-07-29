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
