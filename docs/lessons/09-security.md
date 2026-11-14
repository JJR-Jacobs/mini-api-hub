# 09 — Security basics

**Time:** 20–25 minutes.

**Goal:** Prove that an API enforces its own credential checks even when the browser page is bypassed.

**Prerequisites:** [Lesson 08](08-tests-debugging.md), the Hub running locally and familiarity with the authenticated requests in lesson 05.

## Authentication is not a hidden button

**Authentication** checks a caller's credential. **Authorization** decides what that caller may do. This application uses one Hub key and one warehouse key as small teaching examples. It does not implement individual accounts, roles, password reset or a complete session system.

The browser is under the caller's control. A person can call an API directly, change JavaScript or remove a disabled button. The server must enforce its own rules.

The Hub's `/api/` endpoints require `Authorization: Bearer ...`. Its health endpoints are intentionally public. Read `src/server.js` and locate the authentication check before inspecting order handling.

## Bypass the page

First call an orders endpoint without credentials:

```powershell
curl.exe -i http://localhost:3000/api/orders
```

On Bash, use `curl -i` instead of `curl.exe -i`. On Windows, specifying `curl.exe` avoids confusing curl with a shell alias. You should receive an unauthenticated response, normally HTTP 401.

Now attempt a write with an explicitly wrong key:

```powershell
curl.exe -i http://localhost:3000/api/orders -H "Authorization: Bearer deliberately-wrong" -H "Content-Type: application/json" --data-raw '{"reference":"SECURITY-REJECT-001","sku":"DESK-01","quantity":2}'
```

PowerShell 7 passes this JSON to native commands as shown. In Bash, use the same command beginning with `curl -i`. If your terminal changes quoting, use the `Invoke-RestMethod` body construction from lesson 05 rather than changing server parsing.

Read orders with your valid key and confirm `SECURITY-REJECT-001` was not created.

**Expected observation:** Direct calls do not bypass authentication. The error must come from the server; a disabled browser control alone would establish nothing.

## Break and fix: a stale client credential

1. In the browser's key entry, deliberately enter `deliberately-wrong`.
2. Try to read or create an order and inspect the failed request in Network.
3. Confirm the process still answers its public liveness request.
4. Restore the valid local Hub key privately and repeat the exact operation.

Explain why a healthy process can reject your access. Repair the caller's credential instead of removing the authentication check.

## Review another boundary

Repeat lesson 05's invalid quantity request using a valid key. Authentication proves who holds the credential; it does not make their payload valid. Read the validation code and identify how it rejects unexpected values.

Notice also that the warehouse has its own key. The browser should use the Hub key for Hub calls, while server integration code uses the warehouse key for warehouse calls. Do not place either value in committed browser JavaScript.

## Repair practice code

Run `npm run lab -- start authorization`, then `npm run lab -- check authorization`. Edit `.practice/authorization/solution.js` until the checker rejects unauthorized access and permits intended access. Next, try `start secrets` and `check secrets` using the same command format; its practice file is `.practice/secrets/solution.js`.

These exercises use fictional values and isolated files. Keep the checker intact, try your own repair, and use `hint <name>` before `fix <name>`. A passing practice exercise does not replace the direct HTTP checks above or establish complete application security.

## Evidence to keep

Record sanitized statuses for no key, wrong key and valid key, plus proof that the rejected write created no record. Keep authorization headers and `.env` out of screenshots. Name one security capability this tutorial does not provide.

## Optional AI prompt

> Trace how every protected Hub route checks credentials. Help me verify a direct unauthorized write fails and stores nothing. Explain the limits of this shared-key teaching model. Do not remove checks to resolve a 401.

Next: [10 — Integration failures](10-integration-failures.md), or revisit [the course map](../COURSE.md).
