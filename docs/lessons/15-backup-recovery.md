# 15 — A backup is useful after you restore it

**Time:** two 15-minute chunks. **Before:** [14 — Deployments](14-deployments.md), local `.data` databases and at least one order. This lesson uses the `npm run dev` databases, not the Docker volumes.

A **backup** is a separate copy for recovery. A **restore** creates usable data from that copy. A **checksum** detects changed bytes; it does not encrypt files or stop someone from replacing both a file and its checksum.

## Do: make a snapshot

If you were running Docker, stop it with `docker compose down`. Start `npm run dev`, create and send `BACKUP-001`, then stop the servers. Pausing writers gives the two database snapshots a matched quiet point. Each SQLite backup is internally consistent, but two different services are not one distributed database transaction.

```powershell
npm run backup -- .backups/my-first-backup
```

Expected: a new directory with `hub.sqlite`, `warehouse.sqlite` and `manifest.json`. Read the manifest in VS Code. It lists the SHA256 checksum of each database. A directory without a completed manifest is not a successful backup. The command refuses to overwrite an existing backup.

Restart the app, create `BACKUP-002`, and stop it again. That new record should not appear in the older snapshot.

## Restore to a new rehearsal directory

```powershell
npm run restore -- .backups/my-first-backup .restore/my-first-rehearsal
```

The restore validates both checksums and SQLite integrity, then writes into the new rehearsal directory. It refuses an existing destination. It does not replace your active databases.

Inspect the restored Hub with Node:

```powershell
node --input-type=module -e "import {DatabaseSync} from 'node:sqlite'; const db=new DatabaseSync('.restore/my-first-rehearsal/hub.sqlite',{readOnly:true}); console.log(db.prepare('SELECT reference FROM orders ORDER BY reference').all()); db.close();"
```

Expected: `BACKUP-001` is present; `BACKUP-002` is absent. Restart the normal app and confirm both remain in the active database. You have demonstrated a restoration without destroying your newer work.

## Break and fix

Run the same restore command again. Read the existing-destination error. Choose a new directory name to fix it. Do not turn off the protection to make the command pass.

Run the tampering exercise implemented in the recovery tests:

```powershell
node --test tests/recovery.test.js
```

Read the test that changes backup bytes. Explain why the checksum mismatch must fail before a destination is created. Add a sentence explaining this rule above the corresponding assertion, then rerun it.

**You are done when:** you can show the older restored records and newer active records, explain why copying a live SQLite file may miss WAL data, and explain why a local backup still needs a separate off-machine copy for machine-loss recovery. These tutorial backups are not encrypted; keep all records fictional.

**AI prompt:** “Help me plan a restore rehearsal. Require a separate destination and a record comparison. Explain what a checksum does and does not prove.”

[Node's SQLite backup API](https://nodejs.org/download/release/v24.11.0/docs/api/sqlite.html#sqlitebackupsourceDb-path-options) · [Next: AI-assisted work](16-ai-assisted-work.md)
