import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const rootPath = fileURLToPath(root);

const BANNED = [
  'car.png',            // generic stock sedan clipart, not a race car
  'car-rear.png',       // stylised buggy render, not this team's car
  'home2.JPG',          // unrelated children; DESIGN.md section 7 forbids it
];
for (const file of BANNED) {
  assert.equal(fs.existsSync(new URL(file, root)), false, `${file} must be deleted`);
}

// Recursive: a duck image dropped anywhere in the tree must fail this, not only
// one dropped at the repository root. .git and node_modules are excluded by name
// at any depth; site/dist is build output; docs/car-reference holds legitimate
// reference photographs of the real car and must never be swept by this scan.
const EXCLUDED_DIR_NAMES = new Set(['.git', 'node_modules']);
const EXCLUDED_REL_PATHS = new Set(['site/dist', 'docs/car-reference']);
const ducks = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const rel = path.relative(rootPath, full);
      if (EXCLUDED_DIR_NAMES.has(entry.name) || EXCLUDED_REL_PATHS.has(rel)) continue;
      walk(full);
      continue;
    }
    if (/duck/i.test(entry.name)) ducks.push(path.relative(rootPath, full));
  }
};
walk(rootPath);
assert.deepEqual(ducks, [], `duck images must be deleted: ${ducks.join(', ')}`);

console.log('PASS honesty');
