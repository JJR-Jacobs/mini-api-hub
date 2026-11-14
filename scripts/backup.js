import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { backup, DatabaseSync } from 'node:sqlite';

export function snapshotName() {
  return new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function verifyIntegrity(filename) {
  const db = new DatabaseSync(filename, { readOnly: true });
  try {
    const rows = db.prepare('PRAGMA integrity_check').all();
    if (rows.length !== 1 || rows[0].integrity_check !== 'ok') {
      throw new Error('SQLite integrity check failed.');
    }
  } finally {
    db.close();
  }
}

// SQLite's backup API includes committed WAL data; copying a live .sqlite file may not.
// The two services are backed up separately. Pause writers for a matched business snapshot.
export async function createBackup(paths, targetDirectory) {
  const sources = [
    { name: 'hub.sqlite', source: path.resolve(paths.hub) },
    { name: 'warehouse.sqlite', source: path.resolve(paths.warehouse) },
  ];
  for (const { source } of sources) {
    if (!(await stat(source)).isFile()) throw new Error('A source database is not a file.');
  }
  const target = path.resolve(targetDirectory);
  // An existing backup is never silently replaced.
  await mkdir(target);
  const files = [];
  for (const { name, source } of sources) {
    const db = new DatabaseSync(source, { readOnly: true });
    const destination = path.join(target, name);
    try {
      await backup(db, destination);
    } finally {
      db.close();
    }
    verifyIntegrity(destination);
    files.push({ name, sha256: sha256(await readFile(destination)) });
  }
  const manifest = { format: 1, createdAt: new Date().toISOString(), files };
  // A missing manifest means an incomplete backup, never a successful snapshot.
  await writeFile(path.join(target, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, {
    flag: 'wx',
  });
  return { directory: target, ...manifest };
}

async function main() {
  const parent = path.resolve('.backups');
  await mkdir(parent, { recursive: true });
  const result = await createBackup(
    {
      hub: process.env.DATABASE_PATH || '.data/hub.sqlite',
      warehouse: process.env.WAREHOUSE_DATABASE_PATH || '.data/warehouse.sqlite',
    },
    process.argv[2] || path.join(parent, snapshotName()),
  );
  console.log(`Backup created: ${result.directory}`);
  console.log('Both SQLite integrity checks passed; manifest includes SHA256 checksums.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`Backup failed: ${error.message}`);
    process.exitCode = 1;
  });
}
