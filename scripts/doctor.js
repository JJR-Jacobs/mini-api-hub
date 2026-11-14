import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';

let problems = 0;
function result(ok, message) {
  console.log(`${ok ? 'OK' : 'ACTION'} ${message}`);
  if (!ok) problems += 1;
}
const major = Number(process.versions.node.split('.')[0]);
result(major === 24, `Node ${process.versions.node}; this edition uses Node 24.x.`);
try {
  createRequire(import.meta.url)('node:sqlite');
  result(true, 'Built-in SQLite is available. A Node experimental warning is expected on some 24.x versions.');
} catch {
  result(false, 'SQLite module unavailable. Install Node 24, then open a new terminal.');
}
const git = spawnSync('git', ['--version'], { encoding: 'utf8' });
result(git.status === 0, 'Git is available (git --version).');
result(existsSync('package.json') && existsSync('scripts/doctor.js'), 'Terminal is in the mini-api-hub folder.');
console.log(`${existsSync('.env') ? 'OK' : 'NEXT'} Local .env ${existsSync('.env') ? 'exists.' : 'is not created yet; run npm run setup.'}`);
console.log('VS Code and Docker are optional for the first run. No cloud account or API subscription required.');
if (problems) process.exitCode = 1;
