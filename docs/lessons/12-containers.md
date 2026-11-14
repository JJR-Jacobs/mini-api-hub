# 12 — Run the same app in containers

**Time:** two 15-minute chunks. **Before:** [11 — Dependencies](11-dependencies.md), Docker Desktop installed and its Linux engine running. Docker is optional until this lesson.

An **image** is a packaged filesystem and startup instructions. A **container** runs an image. A **port mapping** forwards a port on your computer to a port inside a container. A **volume** keeps data outside the container's replaceable filesystem.

## Do: inspect, then run

Stop `npm run dev` with **Ctrl+C** so port 3000 is free. Read `Dockerfile` and identify the Node version, copied files, working directory and `USER node`. Read `compose.yaml`; find the migration job, Hub, warehouse and two data volumes.

```powershell
docker version
docker compose config --quiet
docker compose up --build -d
docker compose ps
docker compose logs --tail 30 hub warehouse
```

Expected: the migration job exits successfully, and Hub and warehouse become healthy. Open <http://127.0.0.1:3000>. Enter your API key from `.env`. Create `CONTAINER-001` and send it. These databases live in Docker volumes, separate from the `.data` files used by `npm run dev`.

If Docker reports a missing engine or named pipe, start Docker Desktop and wait for the engine to become ready. A working `docker` command alone does not mean the engine is running.

## Break: a wrong port

On a lesson branch, change the Hub mapping in `compose.yaml` from `127.0.0.1:3000:3000` to `127.0.0.1:3001:3000`. Recreate the Hub:

```powershell
docker compose up -d hub
```

Port 3000 no longer answers; <http://127.0.0.1:3001> does. The final `3000` is the application's container port. The middle number is the host port. Restore the original mapping and rerun the command.

Do not change the warehouse URL to `localhost:4000` inside the Hub container. There, `localhost` means the Hub container itself. The service name `warehouse` resolves on Compose's private network.

## Verify persistence

```powershell
docker compose down
docker compose up -d
```

Refresh the dashboard. `CONTAINER-001` must remain. `down` removes containers but keeps the named volumes. The `-v` flag would remove those volumes and their data; it is deliberately not part of this exercise.

**Code task:** add a comment beside one volume mount explaining the path inside its container. Run `docker compose config --quiet` again and inspect your diff.

**You are done when:** you can identify the host port, container port, volume and container user; prove the order survived container replacement; and explain why an image rollback does not restore database contents.

**AI prompt:** “Help me diagnose this Compose error. First ask whether the engine is running and which port and filesystem I am inspecting. Explain each proposed command before I run it.”

[Docker's Compose tutorial](https://docs.docker.com/compose/gettingstarted/) · [Next: CI](13-ci.md)
