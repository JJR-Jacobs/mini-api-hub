import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { readConfig } from './config.js';
import { openDatabase, isReady } from './db.js';
import { authenticated, closeService, failure, HttpError, json, readJson, requestContext, sameOrder, validateOrder } from './http.js';

export function createWarehouse(config, { logger = console.log } = {}) {
  const db = openDatabase(config.warehouseDatabasePath);
  const server = createServer(async (request, response) => {
    const requestId = requestContext(request, response, logger);
    try {
      const path = new URL(request.url, 'http://localhost').pathname;
      if (request.method === 'GET' && path === '/health/live') return json(response, 200, { status: 'ok' });
      if (request.method === 'GET' && path === '/health/ready') {
        const ready = isReady(db, 'warehouse');
        return json(response, ready ? 200 : 503, { status: ready ? 'ready' : 'not-ready' });
      }
      if (path !== '/orders') throw new HttpError(404, 'NOT_FOUND', 'This route does not exist.');
      if (!authenticated(request, config.warehouseKey)) throw new HttpError(401, 'UNAUTHORIZED', 'A warehouse bearer key is required.');
      if (!isReady(db, 'warehouse')) throw new HttpError(503, 'DATABASE_NOT_READY', 'Run the warehouse database migration.');
      if (request.method === 'GET') return json(response, 200, { orders: db.prepare('SELECT * FROM warehouse_orders ORDER BY created_at, id').all() });
      if (request.method !== 'POST') throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'Use GET or POST.');
      const input = validateOrder(await readJson(request));
      const key = request.headers['idempotency-key'];
      if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(key)) throw new HttpError(400, 'KEY_REQUIRED', 'Supply a stable Idempotency-Key header (1–100 letters, digits, dashes or underscores).');
      const existing = db.prepare('SELECT * FROM warehouse_orders WHERE idempotency_key = ?').get(key);
      if (existing) {
        if (!sameOrder(existing, input)) throw new HttpError(409, 'IDEMPOTENCY_CONFLICT', 'This key already belongs to different order data.');
        // Replays return the original evidence promptly, even in timeout mode.
        return json(response, 200, { order: existing });
      }
      if (config.warehouseMode === 'reject') throw new HttpError(503, 'TEMPORARILY_UNAVAILABLE', 'Warehouse rejected this request before saving it.');
      if (config.warehouseMode === 'rate-limit') {
        response.setHeader('Retry-After', '1');
        throw new HttpError(429, 'RATE_LIMITED', 'Wait before trying again.');
      }
      const id = randomUUID();
      db.prepare('INSERT INTO warehouse_orders (id, idempotency_key, reference, sku, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, key, input.reference, input.sku, input.quantity, new Date().toISOString());
      const order = db.prepare('SELECT * FROM warehouse_orders WHERE id = ?').get(id);
      if (config.warehouseMode === 'accept-then-timeout') {
        // The side effect has committed before the delayed response. The caller
        // cannot infer “not saved” from its own timeout.
        await new Promise(resolve => setTimeout(resolve, Math.max(config.requestTimeoutMs * 3, 1000)));
      }
      if (!response.destroyed) json(response, 201, { order });
    } catch (error) {
      if (!response.headersSent && !response.destroyed) failure(response, error, requestId);
      else response.destroy();
    }
  });
  server.requestTimeout = 5000;
  server.headersTimeout = 5000;
  return { server, db, close: () => closeService(server, db) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const config = readConfig();
    const app = createWarehouse(config);
    app.server.on('error', error => {
      console.error(error.code === 'EADDRINUSE' ? 'Warehouse port is busy. Stop the other process or change WAREHOUSE_PORT in .env.' : 'Warehouse could not listen. Check HOST and WAREHOUSE_PORT.');
      process.exitCode = 1;
      app.db.close();
    });
    app.server.listen(config.warehousePort, config.host, () => console.log(`Fictional warehouse: http://${config.host}:${config.warehousePort} (${config.warehouseMode})`));
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => app.close().then(() => process.exit(0)));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
