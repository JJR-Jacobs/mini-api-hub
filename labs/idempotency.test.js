import test from 'node:test';
import assert from 'node:assert/strict';
import { solution } from './load.js';
test('two attempts for one persisted order produce one warehouse write', () => {
  const warehouse = new Map();
  const order = { id: 'saved-order-123', reference: 'ORDER-001' };
  for (let attempt = 0; attempt < 2; attempt++) {
    const key = solution.deliveryKey(JSON.parse(JSON.stringify(order)));
    if (!warehouse.has(key)) warehouse.set(key, order);
  }
  assert.equal(warehouse.size, 1, 'The first attempt may have saved before its response timed out.');
});
test('different saved orders have different stable keys', () => {
  assert.equal(solution.deliveryKey({ id: 'a' }), 'a');
  assert.equal(solution.deliveryKey({ id: 'b' }), 'b');
});
