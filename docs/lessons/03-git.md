# 03 — Git

**Time:** 20–25 minutes.

**Goal:** Save a small, intentional change and understand what the commit contains.

**Prerequisites:** [Lesson 02](02-vscode-extensions.md), Git installed and the repository folder open. No GitHub account is required for a local commit.

## Four terms

Git tracks a project's history. A **branch** names a line of development. The **staging area** selects changes for the next **commit**, which saves a snapshot and message. A **diff** shows the actual changed lines.

GitHub hosts repositories and collaboration tools. A commit on your laptop does not automatically appear on GitHub, and a push does not automatically deploy a website.

## Inspect before changing

```powershell
git status
git branch --show-current
```

If you obtained a ZIP and Git says this is not a repository, initialize your own copy once:

```powershell
git init -b main
```

Check that `.gitignore` excludes `.env` and local data before staging anything. Never use a broad `git add .` when you have not inspected the files it would include.

Create your learning branch:

```powershell
git switch -c learn/first-notes
```

Open `learning-notes.md` and add a short description of the Hub's order flow. If it already contains your orientation notes, add one new sentence explaining the difference between Git and GitHub.

## Review, stage and commit

```powershell
git diff -- learning-notes.md
git add learning-notes.md
git diff --cached -- learning-notes.md
git status
```

For a new untracked file, the first `git diff` can be empty; Git does not yet track its contents. The staged diff after `git add` shows what will enter the commit.

Read the staged content. If it contains a key or other private content, unstage and remove that content before committing. For a repository with existing commits:

```powershell
git restore --staged learning-notes.md
```

If you initialized a ZIP copy and have not made any commit yet, `restore --staged` has no previous commit to restore from. For this newly added file, use `git rm --cached -- learning-notes.md` instead; it removes the staged entry and keeps your file on disk. Confirm that with `git status` before continuing.

Then stage the corrected file and commit:

```powershell
git commit -m "docs: explain the local order flow"
git log -1 --oneline
```

If Git asks for an identity, configure your own name and intended commit email locally with `git config user.name` and `git config user.email`. Consult [Git's setup guide](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup). Public commit metadata may expose the email you choose; GitHub provides a private commit email in your account settings.

**Expected observation:** The new commit contains your chosen file, not `.env`, a database or unrelated edits.

## Break and fix: staged is not automatically current

1. Add a harmless sentence to `learning-notes.md` and stage the file.
2. Change that sentence again without staging it.
3. Compare `git diff` with `git diff --cached`. The working file and proposed commit now differ.
4. Decide which sentence belongs in your next commit, then stage that version deliberately.

Do not use `git reset --hard` to clean up this exercise. Editing or unstaging this one file is sufficient and preserves other work.

## Evidence to keep

Record your branch name, short commit ID and why you selected those files. Explain why staging, committing, pushing and deploying are separate actions.

## Optional AI prompt

> Review this sanitized Git diff. Explain every changed line, identify unrelated edits, and suggest a commit message. Do not run reset, force-push, commit or publish for me.

Next: [03b — GitHub, pull requests and conflicts](03b-github-and-conflicts.md), or continue with [04 — Your first code change](04-first-code-change.md) and return to the optional online exercise later.
