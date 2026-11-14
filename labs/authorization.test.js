import test from 'node:test';
import assert from 'node:assert/strict';
import { solution } from './load.js';
const key = 'fictional-practice-key-1234';
test('only the complete Bearer credential grants access', () => {
  assert.equal(solution.authorized('Bearer ' + key, key), true);
  for (const header of [key, 'prefix Bearer ' + key, 'Bearer ' + key + '-wrong', 'Basic ' + key, undefined, ''])
    assert.equal(solution.authorized(header, key), false, 'Header must not grant access: ' + header);
});
test('an empty configured key never grants access', () => {
  assert.equal(solution.authorized('Bearer ', ''), false);
});
