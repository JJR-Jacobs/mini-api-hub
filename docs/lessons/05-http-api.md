# 05 — HTTP and APIs

**Time:** 20–25 minutes.

**Goal:** Call the Hub directly and distinguish a valid request from an invalid one.

**Prerequisites:** [Lesson 04](04-first-code-change.md), the local services running and `.env` created by setup.

## Anatomy of a request

An HTTP request has a **method**, a **path**, **headers** and sometimes a **body**. `GET` reads information. `POST` asks the server to perform an operation such as creating an order. JSON is the text format used for this order body.

The response has a status code and may contain a JSON body. A successful health request does not prove that order creation works, and a successful create does not prove the warehouse received the order.

The order shape is:

```json
{"reference":"ORDER-001","sku":"DESK-01","quantity":2}
```

All Hub routes beginning `/api/` require the Hub API key. The two public health routes do not.

## Call it from PowerShell

Read the key into a variable without printing it:

```powershell
$taskHubKey = (Get-Content -LiteralPath .env | Where-Object { $_ -like 'API_KEY=*' } | Select-Object -First 1) -replace '^API_KEY=', ''
$taskHeaders = @{ Authorization = "Bearer $taskHubKey" }
Invoke-RestMethod http://localhost:3000/api/orders -Headers $taskHeaders
```

Create an order with a fresh reference if you have already used this one:

```powershell
$taskOrder = @{ reference = 'HTTP-001'; sku = 'DESK-01'; quantity = 2 } | ConvertTo-Json
Invoke-RestMethod http://localhost:3000/api/orders -Method Post -Headers $taskHeaders -ContentType 'application/json' -Body $taskOrder
Invoke-RestMethod http://localhost:3000/api/orders -Headers $taskHeaders
```

Do not paste authorization headers into notes. Inspect the result: creation and sending are separate steps. Find the `POST /api/orders/:id/send` handler in `src/server.js` and locate the browser action that calls it.

In Bash, obtain the generated key from your local `.env` privately, then set `taskHubKey` interactively using `read -r -s -p 'Hub API key: ' taskHubKey`. Call:

```bash
curl -i http://localhost:3000/api/orders -H "Authorization: Bearer $taskHubKey"
curl -i http://localhost:3000/api/orders -H "Authorization: Bearer $taskHubKey" -H 'Content-Type: application/json' --data '{"reference":"HTTP-002","sku":"DESK-01","quantity":2}'
```

**Expected observation:** A valid order appears in a subsequent read. The server returns an HTTP result rather than requiring you to click the page.

## Break and fix: invalid quantity

Send another create request with quantity `-2` and a different reference. Predict the result before running it.

In PowerShell, reuse the create command after making this body:

```powershell
$taskOrder = @{ reference = 'HTTP-INVALID-001'; sku = 'DESK-01'; quantity = -2 } | ConvertTo-Json
```

The API should reject invalid input with a client-error status. PowerShell may present non-success HTTP responses as errors; inspect their status and response details. The server should continue running, and the invalid order should not appear in the order list.

Repair the request by using a positive integer and a new reference. Do not weaken server validation to accept a quantity that makes no sense.

## Evidence to keep

Record the method and path used to create an order, a sanitized valid response, the invalid request's status and proof that it did not create a record. Explain the difference between creating locally and sending to the warehouse.

## Optional AI prompt

> Explain this HTTP request in terms of method, path, headers and body. Predict how a negative quantity should behave and help me verify that no invalid record was stored. Keep credentials out of the answer.

Next: [06 — Configuration and secrets](06-config-secrets.md).
