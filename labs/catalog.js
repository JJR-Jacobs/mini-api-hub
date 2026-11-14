// Reference answers live here so you can compare after attempting the task.
export const labs = {
  validation: {
    goal: 'Reject invalid quantities instead of accepting anything JavaScript can compare.',
    hint: 'Check the type, Number.isInteger, and both ends of the allowed range (1 to 100).',
    broken: `export function validQuantity(quantity) {\n  return quantity > 0;\n}\n`,
    solution: `export function validQuantity(quantity) {\n  return typeof quantity === 'number' && Number.isInteger(quantity) && quantity >= 1 && quantity <= 100;\n}\n`,
  },
  authorization: {
    goal: 'Require the complete Bearer credential. A substring is not authentication.',
    hint: 'Build the exact expected header; compare equal byte lengths before timingSafeEqual.',
    broken: `export function authorized(header, key) {\n  return typeof header === 'string' && header.includes(key);\n}\n`,
    solution: `import { timingSafeEqual } from 'node:crypto';\n\nexport function authorized(header, key) {\n  if (typeof header !== 'string' || typeof key !== 'string' || !key) return false;\n  const actual = Buffer.from(header);\n  const expected = Buffer.from('Bearer ' + key);\n  return actual.length === expected.length && timingSafeEqual(actual, expected);\n}\n`,
  },
  secrets: {
    goal: 'Send a small allowlist to the browser instead of copying server configuration.',
    hint: 'Only appName and version are public. Construct a new object with those two properties.',
    broken: `export function publicConfig(config) {\n  return { ...config };\n}\n`,
    solution: `export function publicConfig(config) {\n  return { appName: config.appName, version: config.version };\n}\n`,
  },
  idempotency: {
    goal: 'Keep one stable delivery key per saved order, even after a retry or restart.',
    hint: 'An order already has a durable id. Do not generate a new key for each attempt.',
    broken: `import { randomUUID } from 'node:crypto';\n\nexport function deliveryKey(order) {\n  return randomUUID();\n}\n`,
    solution: `export function deliveryKey(order) {\n  return order.id;\n}\n`,
  },
  readiness: {
    goal: 'Check the database schema before claiming that the app is ready to serve orders.',
    hint: 'Try a query against orders. Catch a missing schema/unavailable database and return 503.',
    broken: `export function readiness(db) {\n  return { statusCode: 200, status: 'ready' };\n}\n`,
    solution: `export function readiness(db) {\n  try {\n    db.prepare('SELECT id FROM orders LIMIT 1').all();\n    return { statusCode: 200, status: 'ready' };\n  } catch {\n    return { statusCode: 503, status: 'not-ready' };\n  }\n}\n`,
  },
  'retry-policy': {
    goal: 'Tell a bad request, a rate limit and an uncertain write apart before choosing what to do.',
    hint: 'Timeouts and 5xx writes need reconciliation. 429 can wait. 4xx request/auth errors need correction.',
    broken: `export function nextAction({ status, timedOut = false }) {\n  return status >= 200 && status < 300 ? 'done' : 'retry-later';\n}\n`,
    solution: `export function nextAction({ status, timedOut = false }) {\n  if (timedOut || status == null || status >= 500) return 'reconcile';\n  if (status >= 200 && status < 300) return 'done';\n  if (status === 429) return 'retry-later';\n  return 'fix-request';\n}\n`,
  },
};
