# 06 — Configuration and secrets

**Time:** 15–25 minutes.

**Goal:** Find where settings enter the process and diagnose a configuration error without committing a secret.

**Prerequisites:** [Lesson 05](05-http-api.md), working local setup and no lab currently changing configuration.

## Code and settings have different jobs

Code describes behavior. Configuration selects the settings for a particular run, such as a port, database location or key. A **secret** is a setting that grants access. `.env` is a local text file containing settings; it is not protected merely because its name starts with a dot.

`API_KEY` authenticates callers to the Hub. `WAREHOUSE_KEY` authenticates calls to the mock warehouse. They are separate credentials for separate boundaries.

## Trace configuration

1. Open `src/config.js` and find where the application reads its settings.
2. Read the setup script referenced by `package.json` and identify how `.env` is created.
3. Inspect `.env` privately. Do not copy its contents into notes, chat or a screenshot.
4. Compare its setting names with those used in source. Use the actual source names when exploring other settings; do not invent an environment variable and assume it has an effect.
5. Ask Git whether the local file is ignored:

```powershell
git check-ignore .env
git status --short
```

An ignored file should not appear as a normal new file to commit. Ignore rules do not remove a secret that has already been committed. If a real secret enters history, removing the current file alone is insufficient; revoke or rotate that credential and investigate its exposure.

## Break and fix: an unusable key

1. Stop the development process with **Ctrl+C**.
2. In `.env`, temporarily rename the setting from `API_KEY` to `DISABLED_API_KEY`, preserving its value in that same private file. Change no other setting.
3. Run `npm run dev` again.
4. Read the configuration error. The application should reject unusable configuration instead of quietly granting access.
5. Rename the setting back to `API_KEY` and restart. `npm run setup` deliberately preserves an existing `.env`; it is not a command to reset a broken key.
6. Repeat the health and authenticated order-read requests from lesson 05.

Read the key from `.env` into a fresh terminal variable before reusing authenticated commands. A shell variable still holding an old key can cause a 401 even when the application is configured correctly.

**Expected observation:** Invalid startup configuration produces a clear failure. Restoring it and restarting restores the original journey. Changing a file does not automatically update a process that has already loaded its settings.

## Why environments matter

Your laptop's settings do not automatically exist on a deployment machine. Local development, CI and deployment each need explicit configuration. Putting a secret into JavaScript served to the browser exposes it to anyone who can read that file.

This tutorial asks the local operator to enter a key. That is a teaching boundary, not a complete public login system. Later deployment lessons explain the limited environment this app is suitable for.

## Evidence to keep

Record the source file reading configuration, the setting names you traced, a sanitized error category and the successful recovery check. Show neither the previous key nor the restored key.

## Optional AI prompt

> Help me trace these configuration names from setup to the running process. Do not ask for values. Explain why editing `.env` might require a restart and why an ignore rule does not erase Git history.

Next: [07 — Databases](07-databases.md).
