# The API contracts

[openapi.json](openapi.json) owns the Hub interface. [warehouse.openapi.json](warehouse.openapi.json)
owns the fictional warehouse interface. Both use OpenAPI 3.1 and contain no credentials.
Change the spec and behavioral tests together when changing an endpoint.

The real implementation is the code under `src/`. The contracts describe the
intended behavior; a specification alone does not prove the implementation.
`tests/app.test.js` exercises actual local HTTP and the resulting database records.

You can import either JSON file into an API client such as Postman. Set your
base URL to your own local service. Enter credentials only in a local secret
variable; do not save keys in this file, synced examples or screenshots.
Postman is optional for the course; the tests and browser work without it.

Warehouse modes are selected in the ignored `.env`, then restart both services:

| Mode | New delivery | Identical replay |
| --- | --- | --- |
| `normal` | Commits and answers 201 | Same saved record, 200 |
| `rate-limit` | 429, no write | Existing saved record, 200 |
| `reject` | 503 before writing | Existing saved record, 200 |
| `accept-then-timeout` | Commits, delays past caller timeout | Existing saved record promptly, 200 |

The Hub cannot know from a 503 or a timeout alone whether a remote write happened.
The stand-in's rejection mode is configured to reject before saving, but the Hub
still treats the unconfirmed remote outcome conservatively. An unchanged saved
order ID is reused on retry. A new ID would bypass the warehouse's deduplication.

A readiness response checks the local database; it does not certify external
service readiness or financial correctness. The warehouse is fictional, so
passing here establishes no guarantee about real vendors.
