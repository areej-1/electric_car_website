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
