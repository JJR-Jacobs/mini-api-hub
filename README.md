# Mini API Hub

**Learn to understand, change, test and run a small application—even when AI helps you write it.**

This is the first runnable teaching edition of a deliberately small API Hub. A fictional shop creates an order, the Hub saves it, and a fictional warehouse receives it. You can follow a request through the browser, server, database and another API without needing a paid service or real customer records.

The course starts with terminals, VS Code and Git. It then covers HTTP, configuration, databases, tests, authentication, unreliable integrations, containers, CI, deployment and recovery. Each section includes something to break, diagnose and repair.

This repository is an original educational project. It is separate from CloudPrac Hub and contains no CloudPrac source, client records or vendor credentials. It is a learning application, not a production system or a complete security course.

## What you will build confidence doing

- Explain where a request goes and where its data is saved.
- Make a small change and review the actual Git diff.
- Keep configuration and secrets out of commits.
- Use an API directly, including requests that should fail.
- Recognize the difference between a test passing and a deployment working.
- Investigate a failed integration without blindly creating a duplicate order.
- Run checks before a release, then verify and recover the deployed application.

## The whole application

```text
Browser → Hub API → SQLite database
                 → mock warehouse API
```

The Hub listens on `http://localhost:3000`. The mock warehouse listens on `http://localhost:4000`. All orders are fictional. Neither service connects to an actual warehouse, accounting platform or shop.

| Part | Where to look | Purpose |
| --- | --- | --- |
| Browser page | `public/index.html`, `public/app.js` | Enter a key, create an order and inspect its outcome. |
| Hub routes | `src/server.js` | Accept and validate HTTP requests. |
| Configuration | `src/config.js` | Read settings and reject unusable configuration. |
| Persistence | `src/db.js` | Store records in a local SQLite database. |
| External call | `src/integration.js` | Send an order to the mock warehouse. |
| Mock warehouse | `src/warehouse.js` | Provide a controllable dependency for learning. |
| Tests | `tests/` | Check behavior using Node's built-in test runner. |

The project uses Node.js 24, JavaScript modules and built-in HTTP, SQLite and testing APIs. It has no runtime package dependencies. Built-in SQLite may print an experimental-feature warning on supported Node versions; a warning alone does not establish that startup failed. Read the following output and check the health endpoint.

## Start locally

Install [Node.js 24](https://nodejs.org/en/download), [Git](https://git-scm.com/downloads) and [VS Code](https://code.visualstudio.com/). If these tools or terminals are new, start at [lesson 00](docs/lessons/00-start-here.md), which takes this more slowly.

Open a terminal in this repository, then run each command separately:

On Windows, if PowerShell reports that `npm.ps1` cannot be loaded, use `npm.cmd` wherever the course says `npm`, for example `npm.cmd run doctor`. You do not need to change the machine's execution policy.

```powershell
node --version
npm run doctor
npm run setup
npm run db:migrate
npm run dev
```

`setup` creates local configuration with generated API keys. Read `.env` on your own computer when the browser asks for the Hub key. Keep its contents private. Migration prepares the database. The development command keeps running until you press **Ctrl+C**.

Open [the Hub](http://localhost:3000). In a second terminal, check Hub liveness and database readiness:

```powershell
Invoke-RestMethod http://localhost:3000/health/live
Invoke-RestMethod http://localhost:3000/health/ready
```

In Bash, use `curl http://localhost:3000/health/live` and `curl http://localhost:3000/health/ready` instead. The `npm run` commands are the same in both shells.

The Hub readiness endpoint checks its migrated database. It does not prove that a warehouse call will succeed; verify that separate journey by sending a fictional order.

Create a fictional order such as:

```json
{"reference":"ORDER-001","sku":"DESK-01","quantity":2}
```

Check the order in the Hub, then send it to the mock warehouse. Inspect the result before sending anything again. Your first objective is to explain that journey, not to memorize the commands.

## Follow the course

Read the [course map](docs/COURSE.md). There are 19 lesson files, including the optional GitHub-and-conflicts extension to lesson 03. Lessons 00–09 provide the foundations; the later lessons apply them to integrations, operations and deployment. The [glossary](docs/GLOSSARY.md) explains terms as you encounter them.

Allow roughly 10–25 minutes per lesson, with extra time for tool installation and deployment. Complete one lesson at a time. Keep your own short notes and evidence; do not include keys, `.env`, database files or personal information in screenshots or commits.

The lab helper supports:

```powershell
npm run lab -- list
npm run lab -- start <name>
npm run lab -- check <name>
npm run lab -- hint <name>
npm run lab -- fix <name>
npm run lab -- reset <name>
```

`<name>` means choose a name printed by `list`; do not type the angle brackets. For example, run `npm run lab -- start validation` and `npm run lab -- check validation`.

`start` places buggy exercise code in `.practice/<name>/solution.js`; an initial failing check is intentional. Edit that practice file yourself. `hint` offers a nudge. `fix` reveals a reference repair and backs up your edits; try your own repair first. `reset` returns that practice exercise to its starting state, keeping a backup. These commands do not deliberately break the application source or restore your normal order database.

## Check your changes

```powershell
npm test
npm run check
git diff
```

Tests establish only the behavior they exercise. Also run the application and check the affected user journey. A local check does not establish that HTTPS, secrets, storage or networking work on a different machine.

## Using AI during the course

AI assistance is welcome. Ask it to explain a route, suggest a focused experiment or review a small diff. Before accepting a change, you should be able to say what changed, why it works, what might break and how you checked it.

Do not paste real secrets or customer records into prompts. Do not accept deleted assertions or weakened authorization as a way to make a failing check pass. If a response introduces an unfamiliar tool, ask what problem it solves before installing it.

A useful prompt is:

> Help me investigate this one failure. Ask me to inspect the relevant code and predict the result before suggesting a patch. Keep the change small. Explain how I can verify it myself.

## Scope

This first edition teaches one complete application and one deployment path. It deliberately avoids adding queues, multiple databases, real payment systems or several cloud providers before the fundamentals are clear. Future platform examples can live in separate repositories using the same lesson format.

This original teaching project is available under the [MIT License](LICENSE). No public hosting, publishing or production operation is implied by running the local course.
