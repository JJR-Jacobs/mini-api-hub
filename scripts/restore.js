import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { sha256, snapshotName, verifyIntegrity } from './backup.js';

export async function restoreBackup(snapshotDirectory, destinationDirectory) {
  const source = path.resolve(snapshotDirectory);
  const destination = path.resolve(destinationDirectory);
  if (destination === source) throw new Error('Restore destination must differ from the backup.');
  const manifest = JSON.parse(await readFile(path.join(source, 'manifest.json'), 'utf8'));
  const names = ['hub.sqlite', 'warehouse.sqlite'];
  if (
    manifest.format !== 1 ||
    !Array.isArray(manifest.files) ||
    manifest.files.length !== names.length ||
    names.some((name) => manifest.files.filter((file) => file.name === name).length !== 1)
  ) {
    throw new Error('Unsupported or incomplete backup manifest.');
  }
  // Validate every source before creating the destination. Manifest names are not trusted paths.
  for (const name of names) {
    const expected = manifest.files.find((file) => file.name === name).sha256;
    const bytes = await readFile(path.join(source, name));
    if (!/^[a-f0-9]{64}$/.test(expected) || sha256(bytes) !== expected) {
      throw new Error(`Checksum mismatch: ${name}. Nothing has been restored.`);
    }
    verifyIntegrity(path.join(source, name));
  }
  // mkdir refuses an existing directory, so this command cannot overwrite active databases.
  await mkdir(destination);
  for (const name of names) {
    await copyFile(path.join(source, name), path.join(destination, name), constants.COPYFILE_EXCL);
    // Check the copy as well, so a successful result establishes the restored bytes.
    const expected = manifest.files.find((file) => file.name === name).sha256;
    if (sha256(await readFile(path.join(destination, name))) !== expected) {
      throw new Error(`Restored file checksum mismatch: ${name}.`);
    }
    verifyIntegrity(path.join(destination, name));
  }
  await writeFile(
    path.join(destination, 'RESTORED.json'),
    `${JSON.stringify({ restoredAt: new Date().toISOString(), backupCreatedAt: manifest.createdAt }, null, 2)}\n`,
    { flag: 'wx' },
  );
  return { directory: destination, files: names };
}

async function main() {
  if (!process.argv[2]) {
    throw new Error('Usage: npm run restore -- <backup-directory> [new-rehearsal-directory]');
  }
  const parent = path.resolve('.restore');
  await mkdir(parent, { recursive: true });
  const result = await restoreBackup(
    process.argv[2],
    process.argv[3] || path.join(parent, snapshotName()),
  );
  console.log(`Rehearsal restore created: ${result.directory}`);
  console.log('Active database files were not replaced. Inspect the restored records next.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`Restore failed: ${error.message}`);
    process.exitCode = 1;
  });
}
