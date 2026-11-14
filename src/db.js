import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path, { timeout: 3000 });
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');
  return db;
}

function apply(path, kind) {
  const db = openDatabase(path);
  try {
    // A schema change is explicit and atomic. Starting the server does not do this.
    db.exec('BEGIN IMMEDIATE');
    db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
    const name = `001-${kind}`;
    if (!db.prepare('SELECT name FROM schema_migrations WHERE name = ?').get(name)) {
      const sql = readFileSync(new URL(`../migrations/${name}.sql`, import.meta.url), 'utf8');
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)').run(name, new Date().toISOString());
    }
    db.exec('COMMIT');
  } catch (error) {
    if (db.isTransaction) db.exec('ROLLBACK');
    throw error;
  } finally { db.close(); }
}

export function migrate(path) { apply(path, 'hub'); }
export function migrateWarehouse(path) { apply(path, 'warehouse'); }

export function isReady(db, kind = 'hub') {
  try {
    const name = `001-${kind}`;
    const migration = db.prepare('SELECT name FROM schema_migrations WHERE name = ?').get(name);
    db.prepare(kind === 'hub' ? 'SELECT id FROM orders LIMIT 1' : 'SELECT id FROM warehouse_orders LIMIT 1').get();
    return Boolean(migration);
  } catch { return false; }
}
