import test from 'node:test';
import assert from 'node:assert/strict';
import { solution } from './load.js';
test('success finishes and rate limiting waits', () => {
  assert.equal(solution.nextAction({ status: 201 }), 'done');
  assert.equal(solution.nextAction({ status: 429 }), 'retry-later');
});
test('bad input and denied access need correction rather than a retry loop', () => {
  for (const status of [400, 401, 403, 404, 409, 422])
    assert.equal(solution.nextAction({ status }), 'fix-request', 'Status ' + status);
});
test('a timeout or 5xx does not prove a write failed', () => {
  for (const state of [{ status: null, timedOut: true }, { status: 500 }, { status: 503 }])
    assert.equal(solution.nextAction(state), 'reconcile');
});
