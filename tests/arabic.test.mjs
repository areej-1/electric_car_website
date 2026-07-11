import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Arabic = require('../arabic.js');
const Lib = require('../cobras-lib.js');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pages = ['index.html','members.html','projects.html','game.html','101.html','specs.html','checklist.html','about.html','sponsors.html','news.html','sponsor-package.html','404.html'];

const checks = [
  ['projects.html', 'Design + planning', 'التصميم والتخطيط'],
  ['101.html', 'Battery', 'البطارية'],
  ['specs.html', 'Car Specifications', 'مواصفات السيارة'],
  ['about.html', 'Our Mission', 'مهمتنا'],
  ['sponsors.html', 'Want to sponsor us?', 'هل ترغب في رعايتنا؟'],
  ['checklist.html', 'Safety gear', 'معدات السلامة'],
  ['sponsor-package.html', 'Equipment partner', 'شريك المعدات'],
  ['404.html', 'Back home', 'العودة إلى الرئيسية']
];

for (const [page, english, expected] of checks) {
  assert.equal(Arabic.translateText(page, english), expected);
  console.log(`PASS  Arabic ${page}: ${english}`);
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.match(html, /<script src="arabic\.js"><\/script>/);
  console.log(`PASS  ${page} loads arabic.js`);
}

assert.equal(Arabic.translateText('members.html', 'Mechanic'), 'الميكانيكا');
assert.equal(Arabic.translateText('members.html', 'Areej Dridi'), 'Areej Dridi');
assert.match(Lib.localFaqReply('كيف يعمل نظام 48 فولت؟', 'ar'), /أربع بطاريات/);
console.log('PASS  Arabic offline CarGPT reply');
console.log('All Arabic coverage tests passed.');
