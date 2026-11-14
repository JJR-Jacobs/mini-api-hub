# 10 — The other API can fail

**Time:** three 10-minute exercises. **Before:** [09 — Security](09-security.md), a migrated database and a working local app.

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd` wherever a command below says `npm`. You do not need to relax the machine's execution policy.

An **integration** is code that makes two systems work together. A **timeout** means our waiting time ended. It does not tell us whether the other system saved the order. **Idempotency** means repeating the same operation has the same effect as doing it once.

## Do: observe an ordinary transfer

1. Run `npm run dev`, open <http://127.0.0.1:3000>, and enter your local API key.
2. Create order `FAULT-001`, SKU `DESK-01`, quantity `2`.
3. Send it. Confirm it becomes `sent`. Find the matching request in the terminal.
4. Open `src/integration.js`. Find the timeout and `Idempotency-Key` header. Write down where that key comes from. It must identify this order consistently across retries.

## Break: the warehouse says “try later”

Stop both servers with **Ctrl+C**. In `.env`, set:

```dotenv
WAREHOUSE_MODE=rate-limit
```

Restart `npm run dev`. Create `FAULT-002` and send it. Read the error and look at the order status. Retrying immediately in a loop would increase the problem. Return the mode to `normal`, restart, and retry the same order. Confirm it becomes `sent`.

Repeat with `WAREHOUSE_MODE=reject`. This warehouse refuses the request before saving an order. Compare the error with rate limiting. A real integration needs the provider's contract to decide whether a specific response permits a retry.

## Break: the write succeeds but the reply arrives too late

Set `WAREHOUSE_MODE=accept-then-timeout`, then restart. Create `FAULT-003` and send it. The Hub should show an uncertain outcome: it cannot honestly claim the warehouse rejected the order.

Read the warehouse records from a second PowerShell terminal:

```powershell
$warehouseKey = ((Get-Content .env | Where-Object { $_ -like 'WAREHOUSE_KEY=*' }) -split '=', 2)[1]
$records = Invoke-RestMethod http://127.0.0.1:4000/orders -Headers @{ Authorization = "Bearer $warehouseKey" }
($records.orders | Where-Object reference -eq 'FAULT-003').Count
```

Expected: **1**. The warehouse saved it despite the timeout. Do not include keys in screenshots or committed evidence.

Now restore `WAREHOUSE_MODE=normal`, restart, and retry that same Hub order. Query the records again. Expected: still **1**, and the Hub now shows `sent`. Read the warehouse's idempotency handling in `src/warehouse.js` and explain why generating a fresh key on each attempt would break this guarantee.

## Code task and verification

Find the timeout regression test in `tests/app.test.js`. Change its order reference to `MY-TIMEOUT-TEST`, run `npm test`, and explain the side effect it counts. This is a real HTTP test against our fictional warehouse; it proves nothing about an unrelated real warehouse API.

Save: the original error, before/after warehouse count, the matching test name and your explanation of an uncertain result. Leave the mode `normal` when finished.

For isolated repair exercises, run `npm run lab -- start idempotency` and `npm run lab -- check idempotency`; edit `.practice/idempotency/solution.js`. Then use the same commands with `retry-policy` and edit `.practice/retry-policy/solution.js`. Checkers start red intentionally. Explain why each repair preserves the original operation's identity or changes a retry decision; do not weaken the expected results.

**AI prompt:** “Help me distinguish a failed request from an uncertain write. Ask me for the evidence before suggesting a retry. Do not edit tests to hide the failure.”

[Next: dependencies](11-dependencies.md)
