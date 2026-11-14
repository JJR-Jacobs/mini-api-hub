import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { readConfig } from '../src/config.js';
import { migrate, migrateWarehouse } from '../src/db.js';
import { createHub } from '../src/server.js';
import { createWarehouse } from '../src/warehouse.js';

const hubKey = 'test-hub-key-01234567890123456789';
const warehouseKey = 'test-warehouse-key-01234567890123456789';
const sample = { reference: 'ORDER-001', sku: 'DESK-01', quantity: 2 };

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return `http://127.0.0.1:${server.address().port}`;
}

async function fixture(t, { mode = 'normal', migrated = true } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'mini-hub-test-'));
  const logs = [];
  const config = readConfig({ API_KEY: hubKey, WAREHOUSE_KEY: warehouseKey, DATABASE_PATH: join(directory, 'hub.sqlite'), WAREHOUSE_DATABASE_PATH: join(directory, 'warehouse.sqlite'), WAREHOUSE_MODE: mode, REQUEST_TIMEOUT_MS: mode === 'accept-then-timeout' ? '100' : '1000' });
  if (migrated) { migrate(config.databasePath); migrateWarehouse(config.warehouseDatabasePath); }
  let warehouse = createWarehouse(config, { logger: line => logs.push(line) });
  config.warehouseUrl = await listen(warehouse.server);
  const hub = createHub(config, { logger: line => logs.push(line) });
  const hubUrl = await listen(hub.server);
  t.after(async () => {
    await hub.close();
    await warehouse.close();
    rmSync(directory, { recursive: true, force: true });
  });
  async function hubRequest(path, { method = 'GET', body, key = hubKey, headers = {} } = {}) {
    const response = await fetch(`${hubUrl}${path}`, { method, headers: { ...(key ? { Authorization: `Bearer ${key}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
    return { status: response.status, data: await response.json(), headers: response.headers };
  }
  async function warehouseRequest(path = '/orders', options = {}) {
    const response = await fetch(`${config.warehouseUrl}${path}`, { ...options, headers: { Authorization: `Bearer ${warehouseKey}`, ...options.headers } });
    return { status: response.status, data: await response.json() };
  }
  const create = (input = sample) => hubRequest('/api/orders', { method: 'POST', body: input });
  const send = id => hubRequest(`/api/orders/${id}/send`, { method: 'POST' });
  async function restartWarehouse() {
    await warehouse.close();
    warehouse = createWarehouse(config, { logger: line => logs.push(line) });
    config.warehouseUrl = await listen(warehouse.server);
  }
  return { config, hub, warehouse, logs, hubUrl, hubRequest, warehouseRequest, create, send, restartWarehouse };
}

test('configuration rejects missing secrets and unsafe values without printing secrets', () => {
  assert.throws(() => readConfig({}), /API_KEY/);
  assert.throws(() => readConfig({ API_KEY: hubKey, WAREHOUSE_KEY: 'tiny' }), /WAREHOUSE_KEY/);
  assert.throws(() => readConfig({ API_KEY: hubKey, WAREHOUSE_KEY: warehouseKey, REQUEST_TIMEOUT_MS: '0' }), /REQUEST_TIMEOUT_MS/);
  assert.throws(() => readConfig({ API_KEY: hubKey, WAREHOUSE_KEY: warehouseKey, WAREHOUSE_URL: 'http://user:password@example.com' }), /without credentials/);
  assert.throws(() => readConfig({ API_KEY: 'GENERATE_WITH_NPM_RUN_SETUP', WAREHOUSE_KEY: warehouseKey }), /API_KEY/);
  assert.throws(() => readConfig({ API_KEY: hubKey, WAREHOUSE_KEY: hubKey }), /must be different/);
  assert.throws(() => readConfig({ API_KEY: hubKey, WAREHOUSE_KEY: warehouseKey, DATABASE_PATH: 'same.sqlite', WAREHOUSE_DATABASE_PATH: 'same.sqlite' }), /separate database/);
  const config = readConfig({ API_KEY: hubKey, WAREHOUSE_KEY: warehouseKey });
  assert.equal(config.host, '127.0.0.1');
});

test('liveness is independent from a missing migration; startup does not create tables', async t => {
  const f = await fixture(t, { migrated: false });
  assert.equal((await f.hubRequest('/health/live', { key: null })).status, 200);
  assert.equal((await f.hubRequest('/health/ready', { key: null })).status, 503);
  assert.equal((await f.hubRequest('/api/orders')).status, 503);
  assert.equal(f.hub.db.prepare("SELECT count(*) AS n FROM sqlite_master WHERE type = 'table'").get().n, 0);
  migrate(f.config.databasePath);
  migrate(f.config.databasePath);
  assert.equal((await f.hubRequest('/health/ready', { key: null })).status, 200);
  assert.equal(f.hub.db.prepare('SELECT count(*) AS n FROM schema_migrations').get().n, 1);
});

test('all order access requires the server-side bearer key', async t => {
  const f = await fixture(t);
  for (const method of ['GET', 'POST']) {
    assert.equal((await f.hubRequest('/api/orders', { method, key: null })).status, 401);
    assert.equal((await f.hubRequest('/api/orders', { method, key: 'wrong-key' })).status, 401);
  }
  assert.equal((await f.hubRequest('/api/orders')).status, 200);
  assert.equal((await f.warehouseRequest('/orders', { headers: { Authorization: 'Bearer wrong' } })).status, 401);
});

test('validation rejects bad JSON, incorrect types, extra fields and oversized bodies', async t => {
  const f = await fixture(t);
  assert.equal((await f.create('{broken')).status, 400);
  assert.equal((await f.create({ ...sample, quantity: '2' })).status, 400);
  assert.equal((await f.create({ ...sample, quantity: 0 })).status, 400);
  assert.equal((await f.create({ ...sample, quantity: 1.5 })).status, 400);
  assert.equal((await f.create({ ...sample, admin: true })).status, 400);
  assert.equal((await f.create({ ...sample, reference: "'; DROP TABLE orders; --" })).status, 400);
  assert.equal((await f.hubRequest('/api/orders', { method: 'POST', body: sample, headers: { 'Content-Type': 'text/plain' } })).status, 415);
  assert.equal((await f.create(JSON.stringify({ value: 'x'.repeat(17000) }))).status, 413);
  assert.deepEqual((await f.hubRequest('/api/orders')).data.orders, []);
});

test('duplicate creation reuses the same order; changed payload conflicts', async t => {
  const f = await fixture(t);
  const first = await f.create();
  const replay = await f.create();
  assert.equal(first.status, 201);
  assert.equal(first.data.order.status, 'pending');
  assert.equal(replay.status, 200);
  assert.equal(replay.data.order.id, first.data.order.id);
  assert.equal((await f.create({ ...sample, quantity: 3 })).status, 409);
  assert.equal((await f.hubRequest('/api/orders')).data.orders.length, 1);
});

test('dispatch confirms matching data and concurrent sends create one warehouse order', async t => {
  const f = await fixture(t);
  const { data } = await f.create();
  const responses = await Promise.all([f.send(data.order.id), f.send(data.order.id)]);
  assert.ok(responses.every(result => result.status === 200 && result.data.order.status === 'sent'));
  assert.equal(responses[0].data.order.warehouse_id, responses[1].data.order.warehouse_id);
  const sentAgain = await f.send(data.order.id);
  assert.equal(sentAgain.status, 200);
  const warehouseOrders = (await f.warehouseRequest()).data.orders;
  assert.equal(warehouseOrders.length, 1);
  assert.equal(warehouseOrders[0].idempotency_key, data.order.id);
  assert.equal(warehouseOrders[0].quantity, 2);
  await fetch(`${f.hubUrl}/${hubKey}?key=${warehouseKey}`);
  const log = f.logs.join('\n');
  assert.ok(!log.includes(hubKey));
  assert.ok(!log.includes(warehouseKey));
  assert.ok(!log.includes('DESK-01'));
  assert.ok(f.logs.every(line => typeof JSON.parse(line).requestId === 'string'));
});

test('timeout after warehouse commit stays uncertain; retry after warehouse restart confirms one order', async t => {
  const f = await fixture(t, { mode: 'accept-then-timeout' });
  const { data } = await f.create();
  const first = await f.send(data.order.id);
  assert.equal(first.status, 504);
  assert.equal(first.data.order.status, 'uncertain');
  assert.equal(first.data.error.code, 'WAREHOUSE_TIMEOUT');
  const afterTimeout = (await f.warehouseRequest()).data.orders;
  assert.equal(afterTimeout.length, 1, 'the upstream side effect happened even though the caller timed out');
  await f.restartWarehouse();
  const retry = await f.send(data.order.id);
  assert.equal(retry.status, 200);
  assert.equal(retry.data.order.status, 'sent');
  assert.equal(retry.data.order.warehouse_id, afterTimeout[0].id);
  assert.equal((await f.warehouseRequest()).data.orders.length, 1);
});

test('warehouse idempotency rejects changed payload and survives a new database connection', async t => {
  const f = await fixture(t);
  const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': 'persistent-key-001' };
  const first = await f.warehouseRequest('/orders', { method: 'POST', headers, body: JSON.stringify(sample) });
  assert.equal(first.status, 201);
  const conflict = await f.warehouseRequest('/orders', { method: 'POST', headers, body: JSON.stringify({ ...sample, quantity: 4 }) });
  assert.equal(conflict.status, 409);
  const reopened = createWarehouse(f.config, { logger: () => {} });
  const url = await listen(reopened.server);
  try {
    const response = await fetch(`${url}/orders`, { method: 'POST', headers: { ...headers, Authorization: `Bearer ${warehouseKey}` }, body: JSON.stringify(sample) });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).order.id, first.data.order.id);
  } finally { await reopened.close(); }
});

test('rate limit and rejected upstream create no warehouse records', async t => {
  for (const [mode, status] of [['rate-limit', 'failed'], ['reject', 'uncertain']]) {
    await t.test(mode, async child => {
      const f = await fixture(child, { mode });
      const { data } = await f.create();
      const result = await f.send(data.order.id);
      assert.equal(result.status, 502);
      assert.equal(result.data.order.status, status);
      assert.equal((await f.warehouseRequest()).data.orders.length, 0);
    });
  }
});

test('a 200 response with mismatched upstream data is not treated as success', async t => {
  const f = await fixture(t);
  const fake = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ order: { id: 'fake-order', ...sample, quantity: 99 } }));
  });
  f.config.warehouseUrl = await listen(fake);
  t.after(async () => { fake.closeIdleConnections(); await new Promise(resolve => fake.close(resolve)); });
  const { data } = await f.create();
  const result = await f.send(data.order.id);
  assert.equal(result.status, 502);
  assert.equal(result.data.order.status, 'uncertain');
  assert.equal(result.data.order.warehouse_id, null);
});

test('public files have security headers and never embed keys or permit arbitrary file paths', async t => {
  const f = await fixture(t);
  const response = await fetch(f.hubUrl);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(!html.includes(hubKey));
  assert.ok(!html.includes(warehouseKey));
  assert.equal((await fetch(`${f.hubUrl}/.env`)).status, 404);
  assert.equal((await fetch(`${f.hubUrl}/src/config.js`)).status, 404);
  assert.equal((await fetch(`${f.hubUrl}/app.js`)).status, 200);
});
