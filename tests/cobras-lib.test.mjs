/**
 * Unit tests for shipped cobras-lib.js pure helpers.
 * Run: node tests/cobras-lib.test.mjs
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const Lib = require(path.join(root, 'cobras-lib.js'));

const failures = [];
const pass = (name) => console.log(`PASS  ${name}`);
const fail = (name, err) => {
  failures.push(`${name}: ${err}`);
  console.error(`FAIL  ${name} — ${err}`);
};

function check(name, fn) {
  try {
    fn();
    pass(name);
  } catch (err) {
    fail(name, err.message || String(err));
  }
}

check('shouldCollapseNav false at top', () => {
  assert.equal(Lib.shouldCollapseNav(0), false);
  assert.equal(Lib.shouldCollapseNav(48), false);
});
check('shouldCollapseNav true after threshold', () => {
  assert.equal(Lib.shouldCollapseNav(49), true);
  assert.equal(Lib.shouldCollapseNav(200, 100), true);
  assert.equal(Lib.shouldCollapseNav(50, 100), false);
});

check('t en/ar lookup', () => {
  assert.equal(Lib.t('en', 'nav.home'), 'Home');
  assert.equal(Lib.t('ar', 'nav.home'), 'الرئيسية');
  assert.equal(Lib.normalizeLang('AR-ae'), 'ar');
});

check('countdownParts zero when past', () => {
  const parts = Lib.countdownParts(2_000_000_000_000, 1_000_000_000_000);
  assert.equal(parts.done, true);
  assert.equal(parts.days, 0);
});

check('countdownParts future day math', () => {
  const now = Date.parse('2026-01-01T00:00:00Z');
  const target = Date.parse('2026-01-03T00:00:00Z');
  const parts = Lib.countdownParts(now, target);
  assert.equal(parts.days, 2);
  assert.equal(parts.done, false);
});

check('buildScoreShareText includes mode and score', () => {
  const text = Lib.buildScoreShareText({ score: 1234, best: 5000, mode: 'f1', level: 3 });
  assert.match(text, /F1/);
  assert.match(text, /01234/);
  assert.match(text, /05000/);
  assert.match(text, /Level 3/);
  assert.match(text, /Cobra Circuit/);
});

check('checklistProgress percent', () => {
  const progress = Lib.checklistProgress([
    { done: true },
    { done: false },
    { done: true },
    { done: false }
  ]);
  assert.equal(progress.total, 4);
  assert.equal(progress.done, 2);
  assert.equal(progress.percent, 50);
  assert.equal(progress.remaining, 2);
});

check('resolveChatConfig prefers storage key', () => {
  const cfg = Lib.resolveChatConfig({
    storage: { CARGPT_ENDPOINT: 'https://example.test/chat', CARGPT_API_KEY: 'secret-test' },
    CARGPT_ENDPOINT: 'https://other.test'
  });
  assert.equal(cfg.endpoint, 'https://example.test/chat');
  assert.equal(cfg.hasKey, true);
  assert.equal(cfg.apiKey, 'secret-test');
});

check('resolveChatConfig empty key is offline-ready', () => {
  const cfg = Lib.resolveChatConfig({});
  assert.ok(cfg.endpoint.length > 8);
  assert.equal(cfg.hasKey, false);
});

check('localFaqReply sponsor path', () => {
  const reply = Lib.localFaqReply('How can I sponsor you?');
  assert.match(reply, /sponsor|email|package/i);
});

check('trackPageView increments', () => {
  const a = Lib.trackPageView({ total: 0, byPage: {}, byDay: {} }, '/members.html', Date.parse('2026-07-11T12:00:00Z'));
  assert.equal(a.total, 1);
  assert.equal(a.byPage['members.html'], 1);
  assert.equal(a.byDay['2026-07-11'], 1);
  const b = Lib.trackPageView(a, 'members.html', Date.parse('2026-07-11T13:00:00Z'));
  assert.equal(b.total, 2);
  assert.equal(b.byPage['members.html'], 2);
});

check('currentPageName + nav current', () => {
  assert.equal(Lib.currentPageName('/foo/news.html'), 'news.html');
  const news = Lib.NAV_ITEMS.find((i) => i.href === 'news.html');
  assert.ok(Lib.isCurrentNav(news, 'news.html'));
  assert.equal(Lib.isCurrentNav(news, 'index.html'), false);
});

if (failures.length) {
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log('\nAll cobras-lib tests passed.');
