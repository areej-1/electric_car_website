import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkCacheVersion } from './check-cache-version.mjs';

// Real temporary Git histories exercise additions, deletions, renames and merges.
const root = mkdtempSync(path.join(tmpdir(), 'cobras-cache-guard-'));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = (file, text) => {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
};
const commit = () => { git('add', '-A'); git('commit', '-qm', 'fixture'); return git('rev-parse', 'HEAD'); };
const cache = version => write('sw.js', `const CACHE = 'cobras-shell-v${version}';\n`);
try {
  git('init', '-q', '-b', 'main');
  git('config', 'user.name', 'Cache guard fixture');
  git('config', 'user.email', 'cache-guard@example.invalid');
  cache(19); write('index.html', 'base'); write('assets/car.avif', 'image');
  const base = commit();
  write('HANDOFF.md', 'documentation'); write('tests/new.mjs', '// test'); write('package.json', '{}');
  const docs = commit();
  assert.equal(checkCacheVersion(base, docs, root).changed.length, 0);

  write('index.html', 'changed');
  let head = commit();
  assert.throws(() => checkCacheVersion(base, head, root), /without a newer CACHE/);
  cache(20); head = commit();
  assert.equal(checkCacheVersion(base, head, root).changed.length, 2);

  for (const kind of ['add', 'delete', 'rename', 'worker']) {
    git('checkout', '-q', '--detach', base);
    if (kind === 'add') write('assets/new.dat', 'new asset');
    if (kind === 'delete') rmSync(path.join(root, 'assets/car.avif'));
    if (kind === 'rename') renameSync(path.join(root, 'assets/car.avif'), path.join(root, 'car.md'));
    if (kind === 'worker') write('sw.js', "const CACHE = 'cobras-shell-v19';\n// worker logic changed\n");
    head = commit();
    assert.throws(() => checkCacheVersion(base, head, root), /without a newer CACHE/, kind);
  }

  // Two PRs both choose v20: the second must increase again after main advances.
  git('checkout', '-q', '-B', 'feature', base);
  cache(20); write('index.html', 'feature'); commit();
  git('checkout', '-q', '-B', 'main', base);
  cache(20); write('styles.css', 'body {}'); const newerBase = commit();
  git('checkout', '-q', 'feature'); git('merge', '-q', '--no-edit', 'main');
  assert.throws(() => checkCacheVersion(newerBase, 'HEAD', root), /without a newer CACHE/);
  cache(21); commit();
  assert.match(checkCacheVersion(newerBase, 'HEAD', root).message, /v20 → v21/);
  cache(18); commit();
  assert.throws(() => checkCacheVersion(newerBase, 'HEAD', root), /without a newer CACHE/);
  write('sw.js', '// accidentally removed CACHE'); commit();
  assert.throws(() => checkCacheVersion(base, 'HEAD', root), /Cannot read/);
  assert.throws(() => checkCacheVersion('missing-ref', 'HEAD', root));
  console.log('PASS cache guard: docs, content, assets, renames, deletion, worker changes and concurrent version bumps');
} finally {
  rmSync(root, { recursive: true, force: true });
}
