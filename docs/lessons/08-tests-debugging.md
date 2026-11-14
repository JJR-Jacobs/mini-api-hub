# 08 — Tests and debugging

**Time:** 20–25 minutes.

**Goal:** Create one useful automated check and use a failure to learn about the system.

**Prerequisites:** [Lesson 07](07-databases.md) and a clean understanding of your existing uncommitted changes.

## What a test claims

A test runs a scenario and uses an **assertion** to compare the result with an expectation. A **regression test** catches a behavior that should keep working after future changes.

This project uses Node's built-in test runner. Tests do not need to be called by a paid service. Start with:

```powershell
npm test
npm run check
```

Read the test names and the actual `check` script in `package.json`. These commands establish only what their code checks. They do not prove that a deployment machine has the right secrets or that a browser interaction is usable.

## Read a meaningful test

Search `tests/` for an order-validation or authentication test. Identify:

- The starting conditions.
- The action being exercised.
- The expected result.
- The assertion that would fail if the behavior broke.

If a test calls the Hub, identify whether it starts isolated services or expects a running application. Do not point a test runner at real systems to discover this by trial and error.

## Add a tiny test of your own

Create `tests/learning.test.js` with:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrder } from '../src/http.js';

test('quantity 100 is allowed, but 101 is rejected', () => {
  const maximum = { reference: 'TEST-001', sku: 'DESK-01', quantity: 100 };
  assert.deepEqual(validateOrder(maximum), maximum);
  assert.throws(
    () => validateOrder({ ...maximum, quantity: 101 }),
    { code: 'INVALID_ORDER', status: 400 },
  );
});
```

Run `node --test tests/learning.test.js` and then `npm test`. This tests a business-rule boundary in the application's actual validator. It does not check HTTP routing, persistence or warehouse delivery. Those need tests at their actual boundaries.

## Break and fix: change the behavior, not the expectation

In the assertion expecting rejection, change `quantity: 101` to `quantity: 100` temporarily. Keep the assertion itself unchanged and run the test again.

**Expected observation:** The test fails because a valid maximum quantity does not throw an error. Read the failure's file and line rather than replacing assertions with `true`.

Restore `101`, run the test again, then explain why both sides of the boundary matter. You intentionally broke the test's scenario; a passing result establishes the original rule only if that scenario still represents it.

For a real repair exercise, run `npm run lab -- start validation`, then `npm run lab -- check validation`. The practice implementation is intentionally wrong. Read the instructions, edit `.practice/validation/solution.js` yourself, and repeat the check. Keep the checker's expectations intact. `npm run lab -- hint validation` can help; `fix validation` reveals a reference solution and backs up your work.

## Stop at a debugger breakpoint

A **breakpoint** pauses the running JavaScript at a chosen line so you can inspect values and follow execution. Pausing this local process can make browser requests wait; that is expected during this exercise.

1. Stop `npm run dev` with **Ctrl+C** so port 3000 is free.
2. In a terminal, run `npm run warehouse`. Leave that separate warehouse process running.
3. Open `src/http.js`. Find `export function validateOrder(body)` and click the margin beside its first executable line to add a red breakpoint.
4. Open VS Code's **Run and Debug** view, choose **Debug Hub (start warehouse separately)** and press **F5**. This uses the existing `.vscode/launch.json`; it starts only the Hub and reads local settings from `.env`.
5. Open the browser, connect with your local Hub key and submit a fresh fictional order.
6. When execution pauses, inspect the `body` parameter. Predict its reference, SKU and quantity. Use **Step Over (F10)** to advance, then **Continue (F5)** to let the request finish. Observe the saved order in the browser.
7. Remove the breakpoint, stop the debugger using its stop control, then stop the warehouse terminal with **Ctrl+C**. Resume normal development with `npm run dev`.

Do not capture secrets from variables, debug consoles or `.env` in screenshots. Inspect only the fictional order body for your evidence. If startup reports a used port, check for an earlier server copy rather than starting more copies. The separate **Debug tests** launch configuration can debug the existing application tests later.

## Investigate a real failure

Use a rejected request from lesson 05. Write down the request, expected result and actual result. Inspect the browser's Network response and the server output. Trace the handler and validation code.

A **log** is evidence of what code reported; it is not automatically the full truth about a different service. Keep logs focused and redact credentials before sharing them. Change one thing at a time and rerun the original failing operation after a repair.

## Evidence to keep

Keep your test diff, the failing assertion and the passing repair result. Record the breakpoint location and one fictional value you inspected. Write what the test proves and two things it does not prove. Review before committing your specific test file.

## Optional AI prompt

> Review this test's claim. Which behavior does it actually exercise? Suggest a regression scenario at the application's real boundary. Do not delete assertions, loosen authentication or change expected results merely to get green output.

Next: [09 — Security basics](09-security.md).
