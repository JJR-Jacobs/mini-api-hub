# Course map

The goal is to take one tiny application from an unfamiliar folder to a change you can explain, verify, deploy and recover. You may use AI, but you remain responsible for understanding the result.

Work in order on your first pass. Each lesson takes roughly 10–25 minutes once the tools are installed. A first deployment can take longer because machines, networking and hosting accounts differ.

## Foundations

| Lesson | Learn | Evidence you produce |
| --- | --- | --- |
| [00 — Start here](lessons/00-start-here.md) | What this app does; where code, settings and data live. | An explanation of one fictional order's journey. |
| [01 — Tools and terminal](lessons/01-tools-terminal.md) | Working directories, commands, processes and exit codes. | A successful tool check and a stop/start health check. |
| [02 — VS Code and extensions](lessons/02-vscode-extensions.md) | Install a formatter, use workspace settings, navigate code and inspect requests. | A formatted practice file and an explained settings diff. |
| [03 — Git](lessons/03-git.md) | Branches, staged changes, commits and diffs. | A small local commit with a useful message. |
| [03b — GitHub and conflicts](lessons/03b-github-and-conflicts.md) | Remotes, PR review, conflict resolution and reverting. | A resolved local conflict; optionally your own reviewed PR. |
| [04 — Your first code change](lessons/04-first-code-change.md) | Add a live order count and inspect what changed. | A focused JavaScript diff and a browser behavior check. |
| [05 — HTTP and APIs](lessons/05-http-api.md) | Methods, routes, JSON, headers and status codes. | A valid order and a rejected invalid request. |
| [06 — Configuration and secrets](lessons/06-config-secrets.md) | Environment variables, `.env` and restart boundaries. | A configuration failure diagnosed without exposing a key. |
| [07 — Databases](lessons/07-databases.md) | Durable storage, schemas, migrations and transactions. | An order that survives an application restart. |
| [08 — Tests and debugging](lessons/08-tests-debugging.md) | Assertions, regression tests, logs and reproduction. | A meaningful failure, diagnosis and passing repair. |
| [09 — Security basics](lessons/09-security.md) | Authentication, validation and server-side enforcement. | Direct API calls proving writes require a valid key. |

## Integrations, deployment and operation

| Lesson | Learn | Evidence you produce |
| --- | --- | --- |
| [10 — Integration failures](lessons/10-integration-failures.md) | Timeouts, duplicate prevention and uncertain outcomes. | A retry that confirms one warehouse order. |
| [11 — Dependencies](lessons/11-dependencies.md) | Runtime and service dependencies; reproducible environments. | An explained dependency failure and repair. |
| [12 — Containers](lessons/12-containers.md) | Images, processes, ports and persistent volumes. | A working container journey with durable records. |
| [13 — CI](lessons/13-ci.md) | Automated checks and reviewing failures. | An intentionally failing check, then a passing repair. |
| [14 — Deployments](lessons/14-deployments.md) | Release artifacts, configuration and verification. | A supervised deployment rehearsal and smoke check. |
| [15 — Backup and recovery](lessons/15-backup-recovery.md) | Backing up records and proving an isolated restore. | Restored fictional records and a recovery explanation. |
| [16 — AI-assisted work](lessons/16-ai-assisted-work.md) | Focused prompts, diff review and independent verification. | A small reviewed change you can explain yourself. |
| [17 — Capstone](lessons/17-capstone.md) | Put the complete workflow together. | Evidence of a change, checks, release and recovery. |

Follow each lesson's exact commands. A local deployment rehearsal does not establish a live public deployment; label the environment in your evidence.

## The format of every lesson

1. Read the goal and prerequisites.
2. Learn the few terms needed for that task.
3. Make one concrete change or run one experiment.
4. Predict the result, then observe it.
5. Break something deliberately and diagnose the failure.
6. Restore it and verify the repair.
7. Save a short explanation and evidence.

Do not skip the prediction or explanation. They reveal whether you understand the system or are simply repeating commands.

## Your learning notes

Keep a `learning-notes.md` file or a private notebook with this small template:

```text
Lesson:
What I expected:
What actually happened:
What I changed and why:
How I verified it:
One thing I still do not understand:
```

Evidence can be a sanitized command result, a focused diff or a screenshot. A screenshot of a page opening is insufficient evidence for a database migration, authorization rule or recovery procedure. Match the evidence to the claim.

Do not record `.env` contents, authorization headers, personal email addresses or real client information. A key copied into learning notes is still a copied key.

## What completion means

You have completed the foundations when you can:

- Start and stop both local services and identify their ports.
- Trace a browser request to a server route and a stored record.
- Explain why a rejected request failed.
- Show a small Git diff and commit it intentionally.
- Explain where the application reads its configuration.
- Demonstrate data persistence and server-side authentication.
- Write or explain a test that would fail if the behavior regressed.

Later lessons add deployment and recovery evidence. Course completion is practice with these skills; it does not certify that you can securely operate every application or that this teaching app is ready for production.

## When you get stuck

Write down the exact command, the directory you ran it from, the expected result and the actual error. Remove secrets before sharing it. Check [the glossary](GLOSSARY.md), source code and the lesson's prerequisites before changing multiple things.

Ask AI or another developer for a hypothesis and one experiment. After a fix, repeat the original failing operation. A different successful operation does not prove the original problem was repaired.
