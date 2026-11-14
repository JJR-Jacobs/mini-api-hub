# 01 — Tools and terminal

**Time:** 20–25 minutes after installation.

**Goal:** Start the application deliberately, understand the running processes and stop them cleanly.

**Prerequisites:** [Lesson 00](00-start-here.md) and access to install development tools on your own machine.

## Install the tools on Windows

1. Open [Node's official download page](https://nodejs.org/en/download), select **Node.js 24**, Windows and your machine's architecture, then download its installer. Run it with npm and PATH support included. Node is the runtime; npm runs this repository's named scripts. You do not need to add unrelated build tools for this dependency-free project.
2. Open [Git's official downloads](https://git-scm.com/downloads), choose Windows and run the installer. Its standard command-line option lets PowerShell find `git`. Follow your organization's installation policy if the device is managed.
3. Download [VS Code](https://code.visualstudio.com/), run the Windows installer and enable its PATH option if offered. Launch it and use **File → Open Folder** to open this repository. Close old terminals and open a new one after installation.

The official pages also offer macOS and Linux installation instructions. The exercises below use Windows PowerShell first and show Bash differences where needed.

If PowerShell blocks `npm.ps1`, use `npm.cmd` wherever the course says `npm`, for example `npm.cmd run doctor`. You do not need to relax the machine's execution policy.

## The few terms you need

A **terminal** is the window where you run commands. A **shell**, such as PowerShell or Bash, interprets them. A **process** is a running program. An **exit code** reports how a command ended; zero normally means success.

Node runs JavaScript outside the browser. npm runs the named scripts defined in `package.json`. `npm run dev` means “run this project's development script”; the meaning comes from this repository, not from a universal npm server command.

## Check your tools

Open a terminal in the repository and run each command separately:

```powershell
node --version
npm --version
git --version
npm run doctor
```

Check that Node reports version 24. If a command is not found, fix the installation or terminal environment before editing application code. Read `package.json` and find the `doctor` script.

In PowerShell, run `Get-Command node, npm, git` to see which installed commands your terminal resolves. In Bash, use `command -v node`, `command -v npm` and `command -v git`. If an old version is selected, reopen the terminal and inspect these paths instead of installing packages into the application to compensate.

In PowerShell, inspect a native command's last exit code immediately with:

```powershell
$LASTEXITCODE
```

In Bash, use `echo $?` immediately after the command. A later command can replace that result.

## Prepare and run

```powershell
npm run setup
npm run db:migrate
npm run dev
```

Setup writes local configuration and generated keys. Migration prepares the local database. Development starts the Hub and warehouse and keeps the terminal occupied. A command staying open is expected for a server.

The built-in SQLite API may print an experimental warning. Read the rest of the output and check the health endpoints; do not edit out the warning as a repair.

Open `http://localhost:3000` in your browser. Keep the server terminal open and create a second terminal:

```powershell
Invoke-RestMethod http://localhost:3000/health/live
Invoke-RestMethod http://localhost:3000/health/ready
```

In Bash:

```bash
curl http://localhost:3000/health/live
curl http://localhost:3000/health/ready
```

**Expected observation:** Both checks answer successfully after setup and migration. Liveness checks whether the process answers; this Hub's readiness check verifies its database schema. It does not contact the warehouse, so successful readiness is not proof that sending an order will work.

## Break and fix: no running server

1. Select the terminal running `npm run dev` and press **Ctrl+C**. Wait for it to stop.
2. Repeat the liveness request in the second terminal.
3. Observe the connection failure. There is no HTTP status code from the Hub because the request did not reach a listening server.
4. Restart with `npm run dev` and repeat the same request.

Do not install another framework to fix a stopped process. If startup says a port is already in use, look for your existing development terminal and stop that copy first. Do not kill an unfamiliar process just to free a port.

## Evidence to keep

Record your Node major version, the directory containing `package.json`, the two service ports and the difference between the stopped-server result and a successful health response. Exclude keys and `.env` contents.

## Optional AI prompt

> I ran this command from this directory and got this sanitized error. Suggest one check to distinguish an installation problem, a wrong directory and a stopped server. Explain the check before proposing code edits.

Next: [02 — VS Code and extensions](02-vscode-extensions.md).
