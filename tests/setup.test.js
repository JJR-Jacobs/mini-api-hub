import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import { readConfig } from '../src/config.js';

test('a beginner setup creates usable distinct keys once and keeps an existing environment', () => {
  const directory = mkdtempSync(join(tmpdir(), 'mini-hub-setup-'));
  const script = fileURLToPath(new URL('../scripts/setup.js', import.meta.url));
  const setup = () => spawnSync(process.execPath, [script], { cwd: directory, encoding: 'utf8' });
  try {
    const first = setup();
    assert.equal(first.status, 0, first.stderr);
    const original = readFileSync(join(directory, '.env'), 'utf8');
    const env = parseEnv(original);
    assert.notEqual(env.API_KEY, env.WAREHOUSE_KEY);
    assert.doesNotThrow(() => readConfig(env));
    assert.equal(first.stdout.includes(env.API_KEY), false);
    assert.equal(first.stdout.includes(env.WAREHOUSE_KEY), false);
    assert.equal(setup().status, 0);
    assert.equal(readFileSync(join(directory, '.env'), 'utf8'), original);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
