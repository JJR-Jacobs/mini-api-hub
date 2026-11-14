# 03b — GitHub, pull requests and conflicts

**Time:** 20–25 minutes for local conflict practice; allow another 10–20 minutes for the optional GitHub exercise.

**Goal:** Review a proposed change, resolve a small merge conflict and undo a commit without erasing history.

**Prerequisites:** [Lesson 03](03-git.md), at least one local commit, and no unexpected uncommitted changes. GitHub publishing requires your own account and a repository you control. Local conflict practice works without either.

## A remote and a pull request

A **remote** is a named repository address. A **push** uploads commits. A **pull request** proposes a branch change for review. **Merge** combines histories. None of those actions proves a deployed application works.

For the optional online exercise, use your own repository. Do not push course exercises to the original project's default branch. Preserve the original project's MIT license when copying its source.

1. On GitHub, create an empty repository you control. Choose its visibility intentionally. Do not initialize another README or license there because this local copy already has them.
2. Run `git status`. Save and commit only your intended changes before switching branches.
3. Run `git branch --list main`. If it prints nothing and you already have a local commit, run `git branch main` to give your current commit that branch name.
4. Run `git remote -v` and inspect existing addresses. Add a separately named remote pointing to your own empty repository:

```powershell
git remote add personal https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
git remote -v
```

Replace the capitalized account and repository placeholders with your own values. Do not type the example unchanged. If `personal` already exists, inspect it instead of overwriting its address.

5. Only after verifying that address and your chosen visibility, publish the base branch:

```powershell
git push personal main
git switch -c learn/review-note main
```

6. Add one non-secret sentence to `learning-notes.md`, then review and publish that focused change:

```powershell
git diff -- learning-notes.md
git add learning-notes.md
git commit -m "docs: record my request-flow explanation"
git push -u personal learn/review-note
```

7. Open your own repository on GitHub. Create a pull request with base `main` and compare branch `learn/review-note`. Read **Files changed**, write what changed and how you checked it, and inspect any automated checks. A PR without a changed line does not exercise review; add a new sentence on the feature branch if necessary.
8. Merge it in your own repository when satisfied. Back locally:

```powershell
git switch main
git pull --ff-only personal main
```

GitHub authentication may require its official sign-in or credential manager. Do not paste a token into a remote URL or commit it. If authentication is unavailable, complete the local exercise below and label the online part uncompleted.

**Expected observation:** Your PR shows a small intended diff, and your local `main` receives the reviewed change after the pull. See [GitHub's pull-request guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests).

## Break and fix: a real merge conflict

Use a separate local practice repository. It has no remote and will not alter the course application's Git history. Start from the course root and choose a fresh folder name if this practice folder already exists.

```powershell
$taskCourseRoot = (Get-Location).Path
git init -b main .practice/git-conflict-demo
Set-Location .practice/git-conflict-demo
git config user.name 'Local course practice'
git config user.email 'practice@example.invalid'
Set-Content -LiteralPath note.txt -Value 'delivery=standard'
git add note.txt
git commit -m "docs: record initial delivery choice"
git switch -c feature/delivery
Set-Content -LiteralPath note.txt -Value 'delivery=express'
git add note.txt
git commit -m "docs: choose express delivery"
git switch main
Set-Content -LiteralPath note.txt -Value 'delivery=collection'
git add note.txt
git commit -m "docs: choose collection on main"
git merge feature/delivery
```

The synthetic identity is configured only inside this disposable local practice repository. Use your intended identity for public work.

**Expected observation:** The merge stops with a conflict because both branches changed the same line differently. A nonzero exit here is the intended exercise, not a reason to reinstall Git.

Run `git status`, then open `.practice/git-conflict-demo/note.txt` in VS Code. Git marks the competing content with `<<<<<<<`, `=======` and `>>>>>>>`. Read both sides and decide the desired result. For this exercise, replace the entire marked section with just `delivery=express`, then save.

```powershell
git diff -- note.txt
git add note.txt
git commit -m "merge: resolve delivery preference"
git log --oneline --graph --all
```

Confirm no conflict markers remain. In real work, the correct resolution depends on the intended behavior; accepting one side automatically can silently discard another person's change.

If you want to abandon the conflicted merge **before completing it**, use `git merge --abort`. It returns this clean-started practice repository to its pre-merge state. Do not use `git reset --hard` to repair unfamiliar work.

## Undo with a new commit

Still inside the local practice repository, make one ordinary change and then revert it:

```powershell
Set-Content -LiteralPath note.txt -Value 'delivery=scheduled'
git add note.txt
git commit -m "docs: try scheduled delivery"
git revert --no-edit HEAD
Get-Content -LiteralPath note.txt
git log -2 --oneline
Set-Location $taskCourseRoot
```

The file returns to `delivery=express`, and the history contains both the trial commit and a new undo commit. Reverting a merge commit has additional rules; this exercise deliberately reverts an ordinary single-parent commit.

In Bash, use `taskCourseRoot="$PWD"` for the saved directory, `cd` for `Set-Location`, `cat note.txt` for `Get-Content`, and `printf '%s\n' 'delivery=standard' > note.txt` for each `Set-Content` operation, substituting the appropriate text. Git commands stay the same.

## Evidence to keep

Keep the local graph, a short explanation of how you chose the conflict resolution, and the two commits showing a change and its revert. If you completed the online exercise, keep your own PR link and label the repository visibility. Otherwise record that publishing was not exercised.

## Optional AI prompt

> Explain the two sides of this sanitized merge conflict and ask what behavior I intend. Suggest a minimal resolution, then explain how to inspect it. Do not force-push, discard unrelated changes or publish anything.

Next: [04 — Your first code change](04-first-code-change.md).
