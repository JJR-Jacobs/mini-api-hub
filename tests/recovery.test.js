import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { createBackup } from '../scripts/backup.js';
import { restoreBackup } from '../scripts/restore.js';

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'mini-hub-recovery-'));
  const paths = { hub: path.join(directory, 'live-hub.sqlite'), warehouse: path.join(directory, 'live-warehouse.sqlite') };
  const connections = Object.values(paths).map((filename) => {
    const db = new DatabaseSync(filename);
    db.exec('PRAGMA journal_mode=WAL; CREATE TABLE orders (reference TEXT);');
    db.prepare('INSERT INTO orders (reference) VALUES (?)').run('ORDER-BEFORE-BACKUP');
    return db;
  });
  t.after(async () => {
    connections.forEach((db) => db.close());
    await rm(directory, { recursive: true, force: true });
  });
  return { directory, paths, connections };
}

test('online backup includes committed WAL data and restores both databases without changing live data', async (t) => {
  const { directory, paths, connections } = await fixture(t);
  const snapshot = path.join(directory, 'snapshot');
  const rehearsal = path.join(directory, 'rehearsal');
  await createBackup(paths, snapshot);
  connections.forEach((db) => db.prepare('INSERT INTO orders VALUES (?)').run('ORDER-AFTER-BACKUP'));
  await restoreBackup(snapshot, rehearsal);
  for (const name of ['hub.sqlite', 'warehouse.sqlite']) {
    const restored = new DatabaseSync(path.join(rehearsal, name), { readOnly: true });
    try {
      assert.deepEqual(restored.prepare('SELECT reference FROM orders').all().map((row) => row.reference), ['ORDER-BEFORE-BACKUP']);
    } finally {
      restored.close();
    }
  }
  assert.equal(connections[0].prepare('SELECT COUNT(*) AS count FROM orders').get().count, 2);
  await assert.rejects(restoreBackup(snapshot, rehearsal), /EEXIST/);
  await assert.rejects(createBackup(paths, snapshot), /EEXIST/);
});

test('tampered snapshot is refused before a destination directory is created', async (t) => {
  const { directory, paths } = await fixture(t);
  const snapshot = path.join(directory, 'snapshot');
  const rehearsal = path.join(directory, 'refused');
  await createBackup(paths, snapshot);
  const filename = path.join(snapshot, 'hub.sqlite');
  const bytes = await readFile(filename);
  bytes[bytes.length - 1] ^= 1;
  await writeFile(filename, bytes);
  await assert.rejects(restoreBackup(snapshot, rehearsal), /Checksum mismatch/);
  await assert.rejects(readFile(path.join(rehearsal, 'hub.sqlite')), /ENOENT/);
});

test('untrusted manifest paths cannot select files outside the snapshot', async (t) => {
  const { directory, paths } = await fixture(t);
  const snapshot = path.join(directory, 'snapshot');
  await createBackup(paths, snapshot);
  const manifestPath = path.join(snapshot, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.files[0].name = '../live-hub.sqlite';
  await writeFile(manifestPath, JSON.stringify(manifest));
  await assert.rejects(restoreBackup(snapshot, path.join(directory, 'refused')), /manifest/);
});
