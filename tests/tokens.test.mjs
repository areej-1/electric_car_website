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
