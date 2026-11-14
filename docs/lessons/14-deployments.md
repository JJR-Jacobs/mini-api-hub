# 14 — Rehearse a release, then choose a server

**Time:** 20 minutes locally; a separate optional 20-minute server exercise after prerequisites. **Before:** [13 — CI](13-ci.md), Docker and a clean, tested commit.

A **deployment** puts a chosen version into a running environment. A **release** names the version you intend to distribute. **Staging** is a separate environment used to practise changes. **HTTPS** encrypts traffic between a browser and the server.

## Do: package an exact local revision

Stop the local servers. Run:

```powershell
npm run check
npm test
git status --short
git rev-parse --short HEAD
```

`git status --short` must print nothing. Commit the intended source changes first; do not label an uncommitted tree with a commit's identity. Save the short commit ID. In PowerShell set an image tag for this terminal:

```powershell
$env:APP_VERSION = git rev-parse --short HEAD
docker compose build
docker compose up -d
docker compose images
Invoke-RestMethod http://127.0.0.1:3000/health/ready
```

In bash use `export APP_VERSION=$(git rev-parse --short HEAD)` instead. The tag ties your local image to the chosen source revision. A tag can still be overwritten, so production release systems also record the image digest.

Create and send `RELEASE-001`, restart the Hub, and confirm the record remains. Record the image tag and test result. A running container and a healthy endpoint are useful observations; the order exercise checks the actual journey too.

## Break: deploy the wrong configuration

On your lesson branch, temporarily change the Hub's `WAREHOUSE_URL` in Compose to `http://not-a-service:4000`. Run `docker compose up -d hub`, create `RELEASE-002` and try sending it. Read the Hub logs. The Hub can be alive while its dependency connection fails.

Restore the service URL, recreate the Hub and retry the same order. Verify there is one warehouse order. Review the configuration diff before committing.

## Optional: an actual remote server

Use the [deployment runbook](../DEPLOYMENT.md) only when you have a disposable Linux server, a domain, a budget and permission to use them. The runbook explains DNS, firewall ports, private app ports, HTTPS, secrets, persistent volumes, smoke checks and rollback. No cloud account is required for the local lessons.

This single-operator classroom app uses an API key and SQLite. Use fictional records on a learning server; public commercial operation needs a separate threat review, access policy, monitoring, resource limits and recovery work.

**You are done when:** another person can identify which commit/image is running, repeat the smoke check, and explain where data survives. Write down the difference between deploying code, migrating a database and restoring data.

**AI prompt:** “Review this deployment plan. Identify the selected revision, where secrets and data live, which ports are public, and what evidence would show the deployment succeeded.”

[Next: backup and recovery](15-backup-recovery.md)
