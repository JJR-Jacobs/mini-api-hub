# 04 — Your first code change

**Time:** 20–25 minutes.

**Goal:** Add an order count to the page and prove it updates when records change.

**Prerequisites:** [Lesson 03](03-git.md). Keep the application running and preserve any uncommitted learning notes.

## A small change is easier to understand

HTML describes the page structure. The browser loads `public/index.html` from the Hub. For your first edit, change only the text inside the visible main heading. Leave the element's tags, attributes and surrounding code in place.

1. Run `git status` and note existing changes.
2. Open `public/index.html`.
3. Find the main heading, normally an `<h1>` element.
4. Replace the words `Follow an order.` with `My learning order hub.` Keep the `<h1>`, `<br>` and closing tags in place.
5. Save the file and reload `http://localhost:3000`.
6. Confirm the new text appears.

**Expected observation:** The heading changes, while the order journey still works. The purpose is to connect a specific file edit with a specific visible effect.

## Add a small behavior

Now make a real JavaScript change. Open `public/app.js` and find `async function refresh()`. Immediately after `const data = await api('/api/orders');`, add:

```javascript
document.querySelector('#orders-heading').textContent =
  `3. Send and inspect (${data.orders.length})`;
```

Do not replace the rest of the function. `querySelector` finds an element on the page; `#orders-heading` matches its HTML `id`. `textContent` sets visible text. `data.orders.length` is the number of orders returned by the API, and `${...}` inserts that value into the text.

Save, reload and connect with your local key again. The heading should include the current count. Create a new fictional order with a fresh reference and observe the count increase. Press **Refresh orders** and verify that the displayed count still matches the list.

## Review what actually changed

```powershell
git diff -- public/index.html public/app.js
npm run check
```

Read the diff. It should show your intended heading and count changes, apart from changes you already knew about. If an AI tool reformatted the entire file, identify that extra work before accepting it.

Create a fictional order and inspect it in the browser. A source check can catch certain mistakes; it cannot establish that your chosen heading is useful or that every browser interaction works.

When satisfied, stage these specific files and commit them:

```powershell
git add public/index.html public/app.js
git diff --cached -- public/index.html public/app.js
git commit -m "ui: show the current order count"
```

## Break and fix: the wrong selector

Temporarily remove `#` from your new selector so it reads `'orders-heading'`. Save, reload and try to connect again. The API may answer successfully while the page reports an error: the selector did not find the expected element, so there is no element whose text can be set.

Run `npm run check`. The JavaScript is still syntactically valid. This is why a syntax check cannot replace running the affected behavior in the browser.

Restore `'#orders-heading'`, save, reload, reconnect and repeat the count check. Run `git diff -- public/app.js` to confirm your deliberate fault is gone. If an edit never appears at all, first confirm you saved the file and are visiting the correct server and port.

## Explain the limit

Changing a page locally does not change a public website. The browser, source folder, server process and deployment environment must line up. Later lessons make that relationship explicit for a deployed release.

## Evidence to keep

Keep the small diff and a sanitized screenshot of the count after creating a new order. Explain what `querySelector`, `textContent` and `length` do, and why `npm run check` did not catch the broken selector.

## Optional AI prompt

> Explain this small HTML and JavaScript diff and predict when the order count updates. Do not redesign the page. Ask me what happens if the selector matches nothing, then give me one browser check and one source check.

Next: [05 — HTTP and APIs](05-http-api.md).
