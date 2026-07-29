import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const BANNED = [
  'car.png',            // generic stock sedan clipart, not a race car
  'car-rear.png',       // stylised buggy render, not this team's car
  'home2.JPG',          // unrelated children; DESIGN.md section 7 forbids it
];
for (const file of BANNED) {
  assert.equal(fs.existsSync(new URL(file, root)), false, `${file} must be deleted`);
}

const ducks = fs.readdirSync(root).filter((f) => /duck/i.test(f));
assert.deepEqual(ducks, [], `duck images must be deleted: ${ducks.join(', ')}`);

console.log('PASS honesty');
