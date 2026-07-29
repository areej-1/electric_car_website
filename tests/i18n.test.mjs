import assert from 'node:assert/strict';
import { t, tk, LANGS } from '../site/src/i18n/t.js';
import { COMMON, PAGES, TITLES } from '../site/src/i18n/strings.js';
import { en as KEYS_EN, ar as KEYS_AR } from '../site/src/i18n/keys.js';

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
// zero overlaps), which is why the overlap is constructed here rather than found in real data.
// COMMON and PAGES are plain, unfrozen objects, so a synthetic key — one that cannot collide
// with real content — is injected into both, t() is called through the real page-resolution
// path, and both injected entries are removed again in a finally block so the suite leaves no
// residue whether the assertion passes or throws.
const precedenceKey = '__i18n_precedence_probe__';
COMMON[precedenceKey] = 'COMMON-VALUE';
PAGES['members.html'][precedenceKey] = 'PAGE-VALUE';
try {
  assert.equal(t('ar', 'members', precedenceKey), 'PAGE-VALUE');
} finally {
  delete COMMON[precedenceKey];
  delete PAGES['members.html'][precedenceKey];
}

// The credit line is required by DESIGN.md section 5 and must survive the move.
assert.equal(t('ar', 'index', 'Made by Areej and Mirza'), 'تصميم وتطوير عريج وميرزا');

// --- tk(lang, key): the key-based lookup against cobras-lib.js's STRINGS map ---
// A second, distinct translation source from COMMON/PAGES/TITLES above: STRINGS
// is keyed by dotted keys ('nav.home'), not English text, and it is what the
// site chrome (nav, skip link, footer) actually needs. Values below are pulled
// straight from the extracted site/src/i18n/keys.js data, not retyped from memory.

// English requests return the English string.
assert.equal(tk('en', 'nav.home'), 'Home');
assert.equal(tk('en', 'skip'), 'Skip to content');

// Arabic resolves real chrome strings — the exact keys SiteNav/SiteFooter/
// BaseLayout consume.
assert.equal(tk('ar', 'nav.home'), 'الرئيسية');
assert.equal(tk('ar', 'nav.members'), 'الأعضاء');
assert.equal(tk('ar', 'nav.work'), 'عملنا');
assert.equal(tk('ar', 'nav.specs'), 'المواصفات');
assert.equal(tk('ar', 'nav.sponsors'), 'الرعاة');
assert.equal(tk('ar', 'nav.resources'), 'الموارد');
assert.equal(tk('ar', 'nav.raceDay'), 'يوم السباق');
assert.equal(tk('ar', 'nav.news'), 'الأخبار');
assert.equal(tk('ar', 'nav.learn'), 'السيارات الكهربائية 101');
assert.equal(tk('ar', 'nav.checklist'), 'قائمة السباق');
assert.equal(tk('ar', 'nav.about'), 'من نحن');
assert.equal(tk('ar', 'nav.main'), 'التنقل الرئيسي');
assert.equal(tk('ar', 'skip'), 'تخطي إلى المحتوى');
assert.equal(tk('ar', 'footer.made'), 'تصميم وتطوير عريج وميرزا');
assert.equal(tk('ar', 'footer.rights'), 'حقوق النشر 2026 لفريق كوبرا سيس الجادة');

// An unknown key returns the key itself — never an empty string or a throw.
// This is tk()'s own last-resort branch (it has no COMMON/PAGES to fall
// through to, unlike t()).
assert.equal(tk('ar', 'nav.doesNotExist'), 'nav.doesNotExist');
assert.equal(tk('en', 'nav.doesNotExist'), 'nav.doesNotExist');

// tk() falls back to the English entry when the requested language lacks a
// key. No key in the real extracted data is en-only — en and ar both carry
// the same 365 keys (checked directly against cobras-lib.js's STRINGS: zero
// keys on either side without a counterpart) — so, as with the PAGES/COMMON
// precedence probe above, the fallback is exercised with a synthetic key
// injected into the live, unfrozen keys.js objects, resolved through the real
// tk() lookup path, and removed in a finally block regardless of outcome.
const fallbackKey = '__tk_fallback_probe__';
KEYS_EN[fallbackKey] = 'EN-ONLY-VALUE';
try {
  assert.equal(tk('ar', fallbackKey), 'EN-ONLY-VALUE');
} finally {
  delete KEYS_EN[fallbackKey];
}
assert.equal(KEYS_AR[fallbackKey], undefined, 'probe key must not leak into ar');

console.log('PASS i18n');
