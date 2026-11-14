# Working on Mini API Hub

This is an independent educational project. Do not copy code, data, keys or
configuration from any production Hub or other private repository.

Use Node.js 24 and readable JavaScript. Prefer a short explicit function over
another abstraction. Explain new vocabulary where a learner first needs it.

Keep the normal app working. Intentionally faulty code belongs in `labs/`
fixtures and generated, ignored `.practice/` folders. Do not weaken a test to
make a faulty exercise pass. Exercises should require a learner to edit code,
observe evidence and explain the result.

Never commit `.env`, database files, backups or learner work. Never print keys
in logs. All examples use fictional orders. There are no real vendor services.

When changing behavior, update `api/openapi.json`, the matching lessons and
behavioral tests. Run `npm run check` and `npm test`. Use real local HTTP for
integration behavior, including a write whose response times out.

Describe local evidence accurately. Container files, a CI workflow or a runbook
do not establish a successful Docker build, hosted CI run or deployment.

Publishing a repository or deploying an internet-facing service is a separate
action from local development. Do not add credentials or automatic deployment.
