import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// The worker can cache any same-origin response, not only entries in SHELL.
// Treat public files conservatively; exclude only development and documentation.
export function isPublicFile(file) {
  if (/(^|\/)\./.test(file) || /\.md$/i.test(file)) return false;
  if (/^(tests|scripts|node_modules|test-results|playwright-report)\//.test(file)) return false;
  return !/^(package(?:-lock)?\.json|playwright\.config\.[cm]?[jt]s|LICENSE(?:\..*)?|groq-worker\.js|cargpt\.config\.example\.js)$/.test(file);
}

export function checkCacheVersion(baseRef, headRef = 'HEAD', cwd = process.cwd()) {
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const revision = ref => {
    if (!ref || ref.startsWith('-')) throw new Error('Supply a valid base revision, for example origin/main.');
    return git('rev-parse', '--verify', `${ref}^{commit}`).trim();
  };
  const base = revision(baseRef), head = revision(headRef);
  // --no-renames keeps both sides of renames visible, including moves into docs.
  const files = git('diff', '--name-only', '--no-renames', '-z', base, head).split('\0').filter(Boolean);
  const changed = files.filter(isPublicFile);
  if (!changed.length) return { changed, message: 'No public files changed; cache bump not needed.' };
  const version = ref => {
    const source = git('show', `${ref}:sw.js`);
    const match = source.match(/^const CACHE = ['"]cobras-shell-v(\d+)['"];?$/m);
    if (!match) throw new Error(`Cannot read a cobras-shell-vN CACHE constant in ${ref}:sw.js.`);
    const value = Number(match[1]);
    if (!Number.isSafeInteger(value)) throw new Error('CACHE version must be a safe integer.');
    return value;
  };
  const before = version(base), after = version(head);
  if (after <= before) {
    throw new Error(`Public files changed without a newer CACHE in sw.js (v${before} → v${after}).\nBump to at least cobras-shell-v${before + 1}.\n${changed.join('\n')}`);
  }
  return { changed, message: `Cache version increased: v${before} → v${after} (${changed.length} public files changed).` };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(checkCacheVersion(process.argv[2], process.argv[3]).message);
  } catch (error) {
    console.error(`Cache guard failed: ${error.message}`);
    process.exitCode = 1;
  }
}
