import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { readConfig } from './config.js';
import { openDatabase, isReady } from './db.js';
import { deliverOrder } from './integration.js';
import { authenticated, closeService, failure, HttpError, json, readJson, requestContext, sameOrder, validateOrder } from './http.js';

const files = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
};

export function createHub(config, { logger = console.log } = {}) {
  const db = openDatabase(config.databasePath);
  // Coalesce double-clicks while one request is running. Upstream durable keys
  // remain the protection across server restarts and lost responses.
  const inFlight = new Map();

  async function sendOrder(id) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) throw new HttpError(404, 'ORDER_NOT_FOUND', 'That order does not exist.');
    if (order.status === 'sent') return { status: 200, body: { order } };
    const outcome = await deliverOrder(order, config);
    db.prepare('UPDATE orders SET status = ?, warehouse_id = ?, last_error = ? WHERE id = ?').run(outcome.status, outcome.warehouseId ?? null, outcome.code ?? null, id);
    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    return {
      status: outcome.httpStatus,
      body: outcome.status === 'sent' ? { order: updated } : { order: updated, error: { code: outcome.code, message: outcome.message } },
    };
  }

  const server = createServer(async (request, response) => {
    const requestId = requestContext(request, response, logger);
    try {
      const path = new URL(request.url, 'http://localhost').pathname;
      if (request.method === 'GET' && path === '/health/live') {
        return json(response, 200, { status: 'ok', version: '0.1.0' });
      }
      if (request.method === 'GET' && path === '/health/ready') {
        const ready = isReady(db);
        return json(response, ready ? 200 : 503, { status: ready ? 'ready' : 'not-ready' });
      }
      if (request.method === 'GET' && Object.hasOwn(files, path)) {
        const [name, contentType] = files[path];
        response.writeHead(200, { 'Content-Type': contentType });
        return response.end(readFileSync(new URL(`../public/${name}`, import.meta.url)));
      }
      if (path.startsWith('/api/')) {
        if (!authenticated(request, config.apiKey)) {
          response.setHeader('WWW-Authenticate', 'Bearer');
          throw new HttpError(401, 'UNAUTHORIZED', 'Enter your local API_KEY to use the API.');
        }
        if (!isReady(db)) throw new HttpError(503, 'DATABASE_NOT_READY', 'Database schema is missing. Stop and run npm run db:migrate.');
        if (path === '/api/orders') {
          if (request.method === 'GET') return json(response, 200, { orders: db.prepare('SELECT * FROM orders ORDER BY created_at DESC, id').all() });
          if (request.method === 'POST') {
            const input = validateOrder(await readJson(request));
            const existing = db.prepare('SELECT * FROM orders WHERE reference = ?').get(input.reference);
            if (existing) {
              if (!sameOrder(existing, input)) throw new HttpError(409, 'REFERENCE_CONFLICT', 'This reference already belongs to different order data.');
              return json(response, 200, { order: existing });
            }
            const id = randomUUID();
            db.prepare('INSERT INTO orders (id, reference, sku, quantity, created_at) VALUES (?, ?, ?, ?, ?)').run(id, input.reference, input.sku, input.quantity, new Date().toISOString());
            return json(response, 201, { order: db.prepare('SELECT * FROM orders WHERE id = ?').get(id) });
          }
          throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'Use GET to list orders or POST to create one.');
        }
        const match = /^\/api\/orders\/([0-9a-f-]{36})(\/send)?$/.exec(path);
        if (match) {
          if (!match[2] && request.method === 'GET') {
            const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(match[1]);
            if (!order) throw new HttpError(404, 'ORDER_NOT_FOUND', 'That order does not exist.');
            return json(response, 200, { order });
          }
          if (match[2] && request.method === 'POST') {
            const id = match[1];
            if (!inFlight.has(id)) {
              const work = sendOrder(id).finally(() => inFlight.delete(id));
              inFlight.set(id, work);
            }
            const result = await inFlight.get(id);
            return json(response, result.status, { ...result.body, requestId });
          }
          throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'Use GET for an order and POST for its /send action.');
        }
      }
      throw new HttpError(404, 'NOT_FOUND', 'This route does not exist.');
    } catch (error) {
      if (!response.headersSent) failure(response, error, requestId);
      else response.destroy();
    }
  });
  server.requestTimeout = 5000;
  server.headersTimeout = 5000;
  server.maxHeadersCount = 50;
  return { server, db, close: () => closeService(server, db) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const config = readConfig();
    const app = createHub(config);
    app.server.on('error', error => {
      console.error(error.code === 'EADDRINUSE' ? 'Hub port is busy. Stop the other process or change PORT in .env.' : 'Hub could not listen. Check HOST and PORT.');
      process.exitCode = 1;
      app.db.close();
    });
    app.server.listen(config.port, config.host, () => console.log(`Mini API Hub: http://${config.host}:${config.port}`));
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => app.close().then(() => process.exit(0)));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
