# Practice without breaking the reference app

These are deliberately faulty **learning fixtures**. They are not loaded by the running Hub.
Each exercise isolates one decision made in the real app.

1. Run `npm run lab -- list`.
2. Run `npm run lab -- start validation`.
3. Run `npm run lab -- check validation`. The initial failure is expected.
4. Open `.practice/validation/solution.js`, predict the bug, and edit it yourself.
5. Run the checker again. Explain the failed cases and your fix.
6. Compare with the real validation code in `src/`.

`hint <name>` gives a nudge. `fix <name>` reveals the reference answer and
keeps a backup of your attempt. `reset <name>` restores the broken starter and
also backs up your work. These commands only change ignored practice files.

The tests are kept outside your practice folder so an accidental edit cannot
silently turn a broken answer green. Passing the exercise is one piece of
evidence; you should also explain it and try another input.

The deployment, editor and Git lessons have hands-on exercises in their lesson
files. They involve real settings and commands, not just these function drills.

| Exercise | Pair with |
| --- | --- |
| `validation` | [08 — Tests and debugging](../docs/lessons/08-tests-debugging.md) |
| `authorization` | [09 — Security basics](../docs/lessons/09-security.md) |
| `secrets` | [06 — Configuration and secrets](../docs/lessons/06-config-secrets.md) |
| `idempotency` | [10 — Integration failures](../docs/lessons/10-integration-failures.md) |
| `readiness` | [07 — Databases](../docs/lessons/07-databases.md) |
| `retry-policy` | [10 — Integration failures](../docs/lessons/10-integration-failures.md) |
