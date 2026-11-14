import { resolve } from 'node:path';

function integer(env, name, fallback, min, max) {
  const value = env[name] ?? String(fallback);
  if (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max) {
    throw new Error(`${name} must be a whole number between ${min} and ${max}.`);
  }
  return Number(value);
}

function secret(env, name) {
  const value = env[name];
  if (!value || value.length < 24 || /\s/.test(value) || /^(GENERATE_WITH_NPM_RUN_SETUP|CHANGE_ME|REPLACE_ME)$/i.test(value)) {
    throw new Error(`${name} is missing or too short. Run npm run setup; use at least 24 non-space characters.`);
  }
  return value;
}

// Configuration is checked once, before accepting requests. Never print its values.
export function readConfig(env = process.env) {
  const warehouseUrl = env.WAREHOUSE_URL ?? 'http://127.0.0.1:4000';
  let parsed;
  try { parsed = new URL(warehouseUrl); } catch { throw new Error('WAREHOUSE_URL must be an HTTP or HTTPS URL.'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('WAREHOUSE_URL must be an HTTP or HTTPS URL without credentials, query or fragment.');
  }
  const warehouseMode = env.WAREHOUSE_MODE ?? 'normal';
  if (!['normal', 'reject', 'rate-limit', 'accept-then-timeout'].includes(warehouseMode)) {
    throw new Error('WAREHOUSE_MODE must be normal, reject, rate-limit or accept-then-timeout.');
  }
  const host = env.HOST ?? '127.0.0.1';
  if (!['127.0.0.1', 'localhost', '0.0.0.0', '::1', '::'].includes(host)) {
    throw new Error('HOST must be a loopback or container listening address.');
  }
  const apiKey = secret(env, 'API_KEY');
  const warehouseKey = secret(env, 'WAREHOUSE_KEY');
  if (apiKey === warehouseKey) throw new Error('API_KEY and WAREHOUSE_KEY must be different. Each service needs its own key.');
  const databasePath = resolve(env.DATABASE_PATH ?? '.data/hub.sqlite');
  const warehouseDatabasePath = resolve(env.WAREHOUSE_DATABASE_PATH ?? '.data/warehouse.sqlite');
  if (databasePath.toLowerCase() === warehouseDatabasePath.toLowerCase()) throw new Error('DATABASE_PATH and WAREHOUSE_DATABASE_PATH must name separate database files.');
  return {
    host,
    port: integer(env, 'PORT', 3000, 1, 65535),
    warehousePort: integer(env, 'WAREHOUSE_PORT', 4000, 1, 65535),
    warehouseUrl: warehouseUrl.replace(/\/$/, ''),
    databasePath,
    warehouseDatabasePath,
    requestTimeoutMs: integer(env, 'REQUEST_TIMEOUT_MS', 500, 50, 30000),
    warehouseMode,
    apiKey,
    warehouseKey,
  };
}
