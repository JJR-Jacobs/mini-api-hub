import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { labs } from '../labs/catalog.js';

test('every exercise starts red, preserves work, and the reference answer goes green', () => {
  const root = mkdtempSync(join(tmpdir(), 'mini-hub-labs-'));
  const cli = fileURLToPath(new URL('../scripts/lab.js', import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], {
    env: { ...process.env, MINI_HUB_PRACTICE_ROOT: root }, encoding: 'utf8',
  });
  try {
    for (const name of Object.keys(labs)) {
      assert.equal(run('start', name).status, 0, name);
      const file = join(root, name, 'solution.js');
      const before = readFileSync(file, 'utf8');
      assert.equal(run('start', name).status, 1, 'Do not overwrite an existing attempt.');
      assert.equal(readFileSync(file, 'utf8'), before);
      const red = run('check', name);
      assert.equal(red.status, 1, name + ' must expose an observable bug: ' + red.stdout + red.stderr);
      assert.equal(run('fix', name).status, 0);
      const green = run('check', name);
      assert.equal(green.status, 0, name + ': ' + green.stdout + green.stderr);
    }
    assert.equal(run('start', '../../outside').status, 1, 'Only known exercise names may become paths.');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
