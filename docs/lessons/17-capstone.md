# 17 — Make and operate a small change yourself

**Time:** four 15-minute chunks. **Before:** the earlier lessons. Local completion is sufficient; a remote server is optional.

Your task is to add a protected read-only order summary:

```text
GET /api/summary
```

It should return counts of orders by status. Use the statuses that actually exist in `src/db.js`; first inspect the schema and order lifecycle. This endpoint is an exercise to implement, not an existing feature.

## Chunk 1: define the behaviour

Create `lesson/order-summary`. In a short design note, write one example JSON response and answer:

- Is an empty database a valid response?
- Who can call the endpoint?
- Which error is returned without a valid API key?
- What happens when an uncertain order becomes sent?

Read [the API guide](../../api/README.md) and the authoritative Hub contract in [api/openapi.json](../../api/openapi.json). Add your proposed endpoint to that contract before writing the handler. Reuse existing error and authentication conventions.

## Chunk 2: code and test

Add the query and route in small edits. Use SQL counts and the existing database connection, not a second hidden database. Write tests for an empty database, mixed statuses and denied access. Keep the earlier duplicate-order regression tests.

Run `npm run check` and `npm test`. Make an actual HTTP request to the running endpoint; compare its counts with the dashboard's orders. If you add a dashboard summary, render values as text.

## Chunk 3: break and diagnose

Temporarily omit one status from your query. Create an order in that status and demonstrate the incorrect count. Add a test that catches the omission, fix the query, and rerun the suite. Save the request ID and the failing assertion that helped you.

Review your Git diff. Open a PR in your own repo and wait for the checks on the final revision.

## Chunk 4: release and recover

Build an image tagged with your commit. Deploy locally with Docker, check readiness, create an order and verify the summary. Make a backup of the corresponding database storage using the runbook's Docker instructions. Restore to a rehearsal directory and compare records.

Write a short release note: what changed, how it was verified, where data lives, and how to return to the earlier compatible image. Explain why rolling code back cannot undo an incompatible database migration.

## Your evidence

Keep a short learner portfolio: the PR, contract example, meaningful test output, one diagnosed failure, selected image revision and restore comparison. Exclude keys, `.env` and database files. Someone else should be able to follow your note without reading this conversation.

You have completed the first learning journey when you can independently set up the repo, explain a request, make a small change, review it in Git, test it, package it and demonstrate recovery. Future repos can apply the same habits to other apps and platforms.
