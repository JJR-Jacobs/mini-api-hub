# 16 — Use AI while keeping ownership of the change

**Time:** 20 minutes. **Before:** [15 — Backup and recovery](15-backup-recovery.md). AI access is optional: you can perform the same review with a partner or use the sample suggestion below.

A useful AI-assisted change is one you can explain, review and verify. The lesson is a repeatable working habit, not a particular AI product.

## Do: give a small task with evidence

Create a branch, then ask your assistant:

> In this learning repo, add a short helper message below the order form explaining that quantity must be a whole number from 1 to 100. Read the existing validation first. Propose the smallest change, name the files, and explain how I can check it. Keep the API rules the same. Do not add packages or copy secrets.

Before applying the result, read the files it names. Explain the difference between a browser hint and server validation. Edit the HTML yourself or inspect every generated line in the diff.

Run `npm run check` and `npm test`. Start the app and inspect the helper text. Try quantity `0`, `101` and a normal value. A browser can reject one invalid entry; a direct API call must still be rejected by the server.

## Break: review a plausible bad fix

Imagine a suggestion says:

> “The timeout test is flaky. Remove its warehouse-count assertion and raise the timeout to 60 seconds.”

Do not apply it yet. Open the timeout test and identify the requirement it protects. Explain why a longer wait does not establish whether the first write succeeded. Describe the duplicate-order bug that could now pass unnoticed.

Now review another suggestion:

> “Store the API key in `public/app.js` so beginners do not have to paste it.”

Find how the browser downloads that file. Explain who could obtain the key. Keep the server secret outside the public files. Convenience is not evidence that access is restricted.

## Verify and leave an understandable record

```powershell
git diff
git status --short
npm run check
npm test
```

Commit the helper-text change with a message describing what the learner sees. In your PR description record the changed behaviour, checks and one suggestion you rejected with a reason. Never paste `.env`, authorization headers, customer records or tokens into public issues or prompts.

**You are done when:** you can explain every changed line, distinguish a failing requirement from an inconvenient test, and name the evidence that would make you revise your decision.

[Next: capstone](17-capstone.md)
