import { randomUUID, timingSafeEqual } from 'node:crypto';

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function authenticated(request, expected) {
  const actual = Buffer.from(request.headers.authorization ?? '');
  const wanted = Buffer.from(`Bearer ${expected}`);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}

export function requestContext(request, response, logger = console.log) {
  const requestId = randomUUID();
  response.setHeader('X-Request-Id', requestId);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  const started = Date.now();
  response.on('finish', () => {
    // No request bodies, query strings, cookies or Authorization headers in logs.
    // Unknown paths might themselves contain pasted secrets; log a route label.
    const path = request.url?.split('?')[0] ?? '';
    const known = ['/', '/app.js', '/styles.css', '/health/live', '/health/ready', '/api/orders', '/orders'];
    const route = known.includes(path) ? path : /^\/api\/orders\/[0-9a-f-]{36}(\/send)?$/.test(path) ? path.endsWith('/send') ? '/api/orders/:id/send' : '/api/orders/:id' : '/unmatched';
    logger(JSON.stringify({ requestId, method: request.method, path: route, status: response.statusCode, durationMs: Date.now() - started }));
  });
  return requestId;
}

export function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

export function failure(response, error, requestId) {
  const known = error instanceof HttpError;
  const status = known ? error.status : 500;
  json(response, status, { error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'Unexpected server error. Check the request ID and server logs.' }, requestId });
}

export async function readJson(request) {
  if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
    throw new HttpError(415, 'JSON_REQUIRED', 'Send Content-Type: application/json.');
  }
  const maxBytes = 16 * 1024;
  if (Number(request.headers['content-length']) > maxBytes) throw new HttpError(413, 'BODY_TOO_LARGE', 'JSON body must be at most 16 KiB.');
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new HttpError(413, 'BODY_TOO_LARGE', 'JSON body must be at most 16 KiB.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(400, 'INVALID_JSON', 'The request body is not valid JSON.'); }
}

export function validateOrder(body) {
  const valid = body && typeof body === 'object' && !Array.isArray(body)
    && Object.keys(body).length === 3
    && Object.keys(body).every(key => ['reference', 'sku', 'quantity'].includes(key))
    && typeof body.reference === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(body.reference)
    && typeof body.sku === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(body.sku)
    && Number.isInteger(body.quantity) && body.quantity >= 1 && body.quantity <= 100;
  if (!valid) throw new HttpError(400, 'INVALID_ORDER', 'Use reference and sku (1–64 letters, digits, dots, dashes or underscores), and quantity (whole number 1–100). No extra fields.');
  return { reference: body.reference, sku: body.sku, quantity: body.quantity };
}

export function sameOrder(a, b) {
  return a.reference === b.reference && a.sku === b.sku && a.quantity === b.quantity;
}

export async function closeService(server, db) {
  if (server.listening) {
    server.closeIdleConnections();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
  db.close();
}
