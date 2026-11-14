import test from 'node:test';
import assert from 'node:assert/strict';
import { solution } from './load.js';
test('quantity: accept the smallest and largest allowed whole numbers', () => {
  assert.equal(solution.validQuantity(1), true); assert.equal(solution.validQuantity(100), true);
});
test('quantity: reject strings, fractions, excessive quantities and missing values', () => {
  for (const value of ['2', 1.5, 101, Infinity, NaN, null, undefined, 0, -1, true])
    assert.equal(solution.validQuantity(value), false, 'Must reject ' + String(value));
});
