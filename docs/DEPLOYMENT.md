# Deploy and recover a learning server

Start with [lesson 14](lessons/14-deployments.md). This runbook is an optional extension for a **disposable single-server learning environment with fictional data**. The local course needs no paid service. Renting a server or domain can incur charges; choose those yourself before following the remote portion.

The app uses one operator API key, one Hub process, one fictional warehouse and SQLite files. It has no user accounts, tenant isolation, high availability or automatic background recovery. A commercial deployment needs a separate design and review. These instructions prepare a small learning installation, not an operational guarantee.

## 1. Understand what runs where

```text
Browser -- HTTPS:443 --> Caddy -- private network --> Hub:3000
                                                --> Warehouse:4000
                                                      |
                                      separate persistent SQLite volumes
```

Only Caddy's ports 80 and 443 are published publicly. The base Compose file maps Hub port 3000 to host loopback for local checks. Warehouse port 4000 is not published. Docker networking can bypass a host UFW policy for published ports; keep the explicit loopback binding and check the cloud firewall too. See [Docker's firewall documentation](https://docs.docker.com/engine/network/packet-filtering-firewalls/).

## 2. Prepare your server and DNS

Use a fresh Linux server you control. Install Git, Node.js **24** and Docker Engine with the Compose plugin from their official installation guides. Confirm:

```bash
git --version
node --version
npm --version
docker version
docker compose version
```

Your user must be permitted to run Docker. Membership in the Docker group grants powerful host access; use it only for trusted administrators. If you use `sudo docker` instead, keep that choice consistent when following commands.

Create a DNS **A** record for a subdomain pointing to the server's IPv4 address. Add an **AAAA** record only if IPv6 is configured and reachable. Allow inbound TCP 80 and 443 in the provider firewall; restrict SSH to your own access route. Do not expose 3000, 4000 or Docker's remote API.

[Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) · [Compose plugin installation](https://docs.docker.com/compose/install/linux/) · [Node downloads](https://nodejs.org/en/download)

## 3. Fetch a selected revision and create server secrets

Clone **your own repo** using its GitHub “Code → HTTPS” URL. Replace `YOUR_REPOSITORY_URL` before running the first command; it is a placeholder, not an address.

```bash
git clone YOUR_REPOSITORY_URL mini-api-hub
cd mini-api-hub
git log -1 --oneline
npm ci --ignore-scripts
npm run check
npm test
npm run setup
chmod 600 .env
```

The setup command generates new random server keys. Keep the server's `.env` on that server; do not reuse a key from a public example or commit it. Edit `.env` and add a line with your actual DNS name, such as `HUB_DOMAIN=learn.example.org`. That sample domain is illustrative and must be replaced. Keep `WAREHOUSE_MODE=normal`.

Record the full selected commit with `git rev-parse HEAD`. Run `git status --short` and require no output before building; commit the intended changes first if the tree is dirty. Ignored server configuration remains local. A commit tag does not identify uncommitted source edits. If you are deploying a release tag, check it out before installing or building. A branch name alone changes over time.

## 4. Build and inspect before opening the site

```bash
export APP_VERSION=$(git rev-parse --short HEAD)
docker compose -f compose.yaml -f deploy/compose.https.yaml config --quiet
docker compose build
docker compose -f compose.yaml -f deploy/compose.https.yaml up -d
docker compose -f compose.yaml -f deploy/compose.https.yaml ps
docker compose -f compose.yaml -f deploy/compose.https.yaml logs --tail 40 migrate hub warehouse caddy
```

The migration job must finish successfully before either service starts. Images run as the non-root `node` user; Docker volumes are initialized from directories owned by that user. If a reused volume has different ownership, investigate its contents and ownership before changing anything. Do not “fix” it by making all files world-writable.

Caddy requests a certificate when it has your real domain and can answer on ports 80/443. DNS propagation, closed ports and an existing service on those ports are common reasons this step fails. Diagnose logs instead of repeatedly recreating certificates. See [Caddy's HTTPS quick-start](https://caddyserver.com/docs/quick-starts/https).

The base images use major-version tags to receive patches when rebuilt. For a reproducible public release, record the built image's ID/digest and review base-image updates; a Git commit does not freeze a mutable upstream image tag.

## 5. Verify the deployed journey

From the server:

```bash
curl --fail http://127.0.0.1:3000/health/ready
docker compose images
```

From another computer, open `https://` followed by **your actual domain**. Confirm a valid certificate, unlock with the server's API key, create `SERVER-SMOKE-001` and send it. Verify it is sent and remains after `docker compose restart hub`. Check the logs without publishing secret headers or `.env`.

An unauthenticated call to `/api/orders` must be denied. From outside the server, direct ports 3000 and 4000 must not answer. Record the selected commit, image tag/ID, readiness result and successful order. No remote deployment was performed by creating this repository; these are checks for the learner to execute.

## 6. Back up the Docker volumes

The local `npm run backup` uses `.data` by default; it does **not** automatically see Docker's data volumes. Use the migration service, which mounts both volume directories. Stop writers first so Hub and warehouse snapshots describe the same quiet point:

```bash
mkdir -p .backups .restore
docker compose stop hub warehouse
docker compose run --rm --no-deps --volume "$PWD/.backups:/backups" migrate node scripts/backup.js /backups/pre-release-001
docker compose up -d hub warehouse
```

Choose a fresh snapshot name each time. On Linux the `node` user inside the container is UID 1000; the mounted backup directory must be writable by that identity. Check `ls -ldn .backups` if access is denied, and arrange ownership on this project directory deliberately. Do not grant broad permissions to unrelated paths.

Expected files are `.backups/pre-release-001/{hub.sqlite,warehouse.sqlite,manifest.json}`. Each SQLite backup is internally consistent and includes committed WAL data. The pair is not an atomic transaction across services, hence the paused writers. Resume services even if the backup fails, then investigate before relying on the snapshot.

Backups contain data and are not encrypted by this tutorial. Keep fictional records. For machine-loss recovery, keep a protected copy on a separate machine or storage service and rehearse recovering from that copy. A checksum detects changed bytes; it is not encryption or proof of who created them.

## 7. Rehearse restoration without replacing live data

```bash
docker compose run --rm --no-deps --volume "$PWD/.backups:/backups:ro" --volume "$PWD/.restore:/restore" migrate node scripts/restore.js /backups/pre-release-001 /restore/rehearsal-001
docker compose run --rm --no-deps --volume "$PWD/.restore:/restore:ro" migrate node --input-type=module -e "import {DatabaseSync} from 'node:sqlite'; const db=new DatabaseSync('/restore/rehearsal-001/hub.sqlite',{readOnly:true}); console.log(db.prepare('SELECT reference FROM orders ORDER BY reference').all()); db.close();"
```

The command verifies checksums and database integrity, and refuses an existing destination. Compare restored records with your expected smoke order. It does not point the running app at the restored files. Promoting a restore over live data is a separate, deliberate maintenance operation: pause writers, preserve the current volumes, select the correct paired snapshot, validate schema compatibility, replace the selected files with correct ownership, restart and verify. Do not practise that operation on data you need.

## 8. Rehearse an update and code rollback

Before updating, record the current `APP_VERSION` value and image ID, make a backup and check the new revision's schema changes. Build a new image under its new commit tag. Run checks before recreating containers, then repeat the deployed journey.

If the new code has a bug and the database schema remains compatible, set `APP_VERSION` back to the earlier recorded tag and recreate Hub and warehouse with the already built images:

```bash
# Replace EARLIER_IMAGE_TAG with the value you recorded, then verify the images exist.
export APP_VERSION=EARLIER_IMAGE_TAG
docker image inspect mini-api-hub:$APP_VERSION
docker compose up -d --no-build hub warehouse
```

Check readiness and the order journey again. Keep the older image until the new release is accepted. `--no-build` avoids rebuilding the old tag from the new working tree.

An older image cannot undo a migration or recreate deleted records. For incompatible schema changes, plan a forward fix or a compatible paired restore with an explicit decision about newer records. This first edition uses additive initial schemas; it does not provide an automatic downgrade engine.

## 9. Stop a disposable installation

```bash
docker compose -f compose.yaml -f deploy/compose.https.yaml down
```

This stops the services and keeps named data and certificate volumes. Deleting a server, a volume or a DNS record is a separate action; decide whether evidence and backup copies are still needed before doing it. Remove provider resources you rented when you finish so they do not continue incurring charges.
