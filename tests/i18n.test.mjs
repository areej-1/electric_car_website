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
