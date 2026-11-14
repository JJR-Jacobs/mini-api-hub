# What was checked in the first local edition

Validation date: 14 November 2026. Environment: Windows, Node.js 24.11.1,
Git 2.52.0. The Node built-in SQLite module emits its experimental warning on
this version; the module was used successfully in the checks below.

## Observed locally

- Dependency-free `npm ci`, setup, explicit migration and the setup doctor ran.
- All 18 automated tests passed. The suite includes a check that repeated setup
  preserves the existing keys and settings instead of silently replacing them.
- The HTTP tests ran real Hub and warehouse servers on temporary local ports.
  They exercised authentication, invalid/oversized inputs, duplicate creation,
  concurrent sends, readiness without a migration and untrusted upstream data.
- The timeout test observed an actual committed warehouse order, restarted the
  warehouse using its saved database, then retried the same order and confirmed
  exactly one warehouse record.
- All six practice starters fail their fixed checker tests. Each reference fix
  passes. Starting an exercise again preserves the learner's current file.
- SQLite backup/restore tests include committed WAL data, checksum tampering,
  invalid manifest paths and refusal to overwrite an existing destination.
- Syntax, JSON parsing and local Markdown links were checked.
- Base and optional HTTPS Compose configurations pass Docker's configuration
  parsing. No real external service is contacted by the application or tests.

## Still to exercise in another environment

Docker's engine was stopped, so image build, container startup, volume ownership
and HTTPS were not run here. The authored CI workflow has not run on GitHub yet.
Linux and macOS learner walkthroughs have not been performed. The optional npm
package-install exercise requires network access and was not run in this session.

The browser walkthrough was stopped by Computer Use because it could not
confidently determine the current browser URL. The browser UI has HTTP/static
asset checks; its interactive form journey has not been visually verified.

The Postman CLI was not available on this session's PATH or in the likely local
installation locations checked. The OpenAPI files can be imported into an API
client; no Postman collection or simulated vendor verification is claimed.

There has been no public deployment or real-vendor acceptance. Re-run the checks
for subsequent changes and record the actual environment. These observations
cover the small fictional system and the named scenarios.
