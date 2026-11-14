# 07 — Databases

**Time:** 20–25 minutes.

**Goal:** Demonstrate persistence and explain why a schema migration differs from starting the server.

**Prerequisites:** [Lesson 06](06-config-secrets.md), setup and migration already completed, and at least one fictional order.

## Three terms, one distinction

A **database** stores structured records. A **schema** defines their shape, such as tables and columns. A **migration** deliberately prepares or changes that schema.

SQLite stores the database in a file. A running process can also hold values in memory, but those values disappear when the process ends unless they were saved. Having a JavaScript object in a route is not proof that the order has been persisted.

## Find the storage boundary

1. Open `src/db.js` and find the database-opening code.
2. Trace how the database path comes from configuration.
3. Find the migration command in `package.json` and read the script it runs.
4. Locate the schema creation code and identify a stored order field.
5. Read the order-create route and trace where it writes the record.

Do not open a live SQLite file in a text editor and save it. It is a database format, not a JSON document. You do not need a database extension for this exercise.

## Prove a record survives

Create an order with reference `PERSIST-001`, or a fresh reference if that one exists. Read it back using the browser or the authenticated API call from lesson 05.

Stop the development process, restart it with `npm run dev`, authenticate again if necessary and read the orders.

**Expected observation:** The saved order remains after the process restarts. Explain which file or directory owns the data using the actual configuration you inspected.

## Break and fix: a missing schema

Keep your original database. This experiment points the Hub at a separate, fresh practice file.

1. Stop the development process.
2. In your private `.env`, record the original `DATABASE_PATH` path without copying any keys. Change only that setting to `.data/lesson07-unmigrated.sqlite`. Use another new filename if you have already completed this exercise.
3. Start with `npm run dev`. In another terminal, call both health endpoints from lesson 01.
4. Observe that liveness answers successfully while readiness returns HTTP 503. The process is running, but the new database has no prepared schema. The original orders still belong to your original database.
5. Stop the process and prepare the practice database:

```powershell
npm run db:migrate
```

6. Restart and repeat the readiness check. It should now succeed. This fresh practice database has an empty order list.
7. Stop again, restore the original `DATABASE_PATH` value in `.env`, and restart. Confirm that `PERSIST-001` is still there.

**Expected observation:** Changing the configured database changes which records and schema you see. Starting the server does not automatically create its tables. The migration repairs readiness for the new practice database without deleting the original one.

The unused practice file can remain in ignored `.data/` storage. Do not commit it. Never apply an unfamiliar migration to a real database because a tutorial command worked locally.

For an isolated code repair, run `npm run lab -- start readiness`, then `npm run lab -- check readiness`. Edit `.practice/readiness/solution.js` so readiness reflects the required dependency checks. Use `npm run lab -- hint readiness` if needed. The checker should fail before your repair and pass afterward; do not change its expectations.

## A transaction has a boundary

A database **transaction** groups local changes so they succeed or fail together. It does not automatically include an HTTP request to another service. The warehouse might accept an order just before the Hub loses the response. Later lessons explore that uncertain outcome and why retries need care.

Likewise, a backup is not proved by the presence of a file. Restoring it and checking the intended records provides stronger evidence; that exercise belongs to recovery.

## Evidence to keep

Record the configured database location without keys, your fictional reference before and after restart, and one sentence explaining what a migration changes. Explain why restarting a process is different from deleting its data.

## Optional AI prompt

> Trace where this fictional order is persisted. Explain the difference between memory, database file and schema. Help me verify persistence without deleting data or assuming an external HTTP call belongs to a local transaction.

Next: [08 — Tests and debugging](08-tests-debugging.md).
