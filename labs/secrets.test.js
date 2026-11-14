import test from 'node:test';
import assert from 'node:assert/strict';
import { solution } from './load.js';
test('public configuration includes only the two documented fields', () => {
  const original = { appName: 'Mini API Hub', version: '0.1.0', apiKey: 'fake-hub-secret',
    warehouseKey: 'fake-warehouse-secret', databasePath: '/private/orders.sqlite',
    futurePrivateSetting: 'must-stay-private' };
  const result = solution.publicConfig(original);
  assert.deepEqual(result, { appName: 'Mini API Hub', version: '0.1.0' });
  assert.equal(original.apiKey, 'fake-hub-secret', 'Do not delete settings from the running server.');
});
