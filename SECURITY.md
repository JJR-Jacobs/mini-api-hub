# Security scope

This is a local teaching app with fictional data and a single-operator key.
It is not a production integration product. Security lessons teach specific
controls, not a complete security certification.

The normal app requires a Hub key on every `/api/` route and a separate
warehouse key for server-to-server calls. It validates input, limits request
sizes, uses SQL parameters, serves scripts with a restrictive content security
policy, and avoids storing browser keys or logging credentials.

Use HTTPS when practising remote deployment. Keep the warehouse private.
Do not use real client data or reuse credentials from other projects.

Known boundaries: one SQLite writer per service, no user account system,
per-user roles, audit retention service, password recovery, distributed rate
limiter, tenant isolation or public registration. A shared classroom server
also needs separate instances/keys per learner and access controls.

Intentionally broken exercises are copied to ignored `.practice/` files;
they are not used by the running server.

If you find an issue, do not post credentials or private records in a public
issue. Contact the repository owner privately through an available verified
channel; there is no dedicated security mailbox configured for this new repo.
