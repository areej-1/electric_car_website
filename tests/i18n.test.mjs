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

// PAGES must carry the real per-page overrides extracted from arabic.js — assert against a
// known key/value pulled straight from the source data, not just that the object is non-empty.
// A bare `length > 0` check would still pass if the extraction silently mangled every value.
const membersOverrideKey = 'Nineteen student builders across mechanics, safety, innovation, media, and driving—each contributing to the Cobra race car.';
assert.equal(
  PAGES['members.html'][membersOverrideKey],
  'تسعة عشر طالبًا وطالبة يساهمون في سيارة سباق كوبرا عبر الميكانيكا والسلامة والابتكار والإعلام والقيادة.'
);

// TITLES must carry the real per-page document titles extracted from arabic.js.
assert.equal(TITLES['members.html'], 'الأعضاء | فريق كوبرا سيس الجادة');

// Page-specific entries win over COMMON in t(). No key in the current extracted data overlaps
// between COMMON and any PAGES[page] (checked directly against arabic.js's source objects —
// zero overlaps), so no real string exercises both branches of t()'s if/else-if on the same
// key. What real data lets us test is each branch independently: a page-only key resolves
// through the PAGES branch (below), and a COMMON-only key resolves through the COMMON branch
// ('Our Team' above, which no page overrides). Since t() checks perPage first and returns
// immediately on a hit — never falling through to COMMON — these two independently-verified
// branches establish the precedence by construction of the code, not by a real overlapping-key
// example.
assert.equal(
  t('ar', 'members', membersOverrideKey),
  'تسعة عشر طالبًا وطالبة يساهمون في سيارة سباق كوبرا عبر الميكانيكا والسلامة والابتكار والإعلام والقيادة.'
);

// The credit line is required by DESIGN.md section 5 and must survive the move.
assert.equal(t('ar', 'index', 'Made by Areej and Mirza'), 'تصميم وتطوير عريج وميرزا');

console.log('PASS i18n');
