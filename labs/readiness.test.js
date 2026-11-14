import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { solution } from './load.js';
test('a live process with no orders schema is not ready', () => {
  const db = new DatabaseSync(':memory:');
  try { assert.deepEqual(solution.readiness(db), { statusCode: 503, status: 'not-ready' }); }
  finally { db.close(); }
});
test('a migrated database is ready; a closed database is not', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE orders (id TEXT PRIMARY KEY)');
  assert.deepEqual(solution.readiness(db), { statusCode: 200, status: 'ready' });
  db.close();
  assert.deepEqual(solution.readiness(db), { statusCode: 503, status: 'not-ready' });
});
