# 00 — Start here

**Time:** 10–15 minutes, excluding tool installation.

**Goal:** Explain what the application does before asking an AI tool to change it.

**Prerequisites:** A copy of this repository and permission to install developer tools on your own computer. No programming experience is required for this orientation.

## Meet the application

A fictional shop wants to send an order to a fictional warehouse. The Hub sits between them. It accepts the order, saves it and makes a separate request to the warehouse.

```text
You → browser page → Hub API → local database
                            → mock warehouse API
```

An **API** is an interface software can call. A **server** is the program answering those calls. A **database** stores records so they can outlive a running program. A **mock** is a controllable substitute; this warehouse never ships anything.

The word “local” means this is running on your machine. `localhost:3000` is the Hub's address on that machine. The warehouse uses port 4000. Neither address is a published website.

## Look around before running commands

1. Open the repository folder in VS Code using **File → Open Folder**.
2. Open `README.md` and read its start instructions.
3. Open `public/index.html`, then `src/server.js`. The first describes the page; the second handles Hub requests.
4. Find `src/db.js` and `src/integration.js`. You do not need to understand every line yet. Write down which one owns stored records and which one owns the warehouse call.
5. Create a personal `learning-notes.md` file with the note template from [the course map](../COURSE.md).

Do not paste application keys or `.env` contents into that file. The course uses fake orders, but a key is still an access credential.

## Your first prediction

For this order:

```json
{"reference":"ORDER-001","sku":"DESK-01","quantity":2}
```

Write down what you expect to happen when it is created, then when it is sent. Which program receives each request? Where could a record survive a restart?

You will test the prediction after [lesson 01](01-tools-terminal.md) gets the program running.

## Break and fix: the wrong folder

A common beginner failure is running a valid command from the wrong directory.

On Windows, if PowerShell blocks `npm.ps1`, substitute `npm.cmd` for `npm` in this course, for example `npm.cmd run doctor`. Keep the current machine execution policy; changing it is unnecessary for these commands.

1. Open VS Code's **Terminal → New Terminal**.
2. Run `Get-Location` in PowerShell. In Bash, run `pwd`.
3. Check whether that directory contains `package.json` using `Get-ChildItem` in PowerShell or `ls` in Bash.
4. If you run `npm run doctor` from a different folder, npm cannot find this project's scripts. Do not create a new `package.json` to silence the error.
5. Use `cd` followed by the repository path in quotes to return to the correct folder, then run the command there.

For example, replace this path with your actual location:

```powershell
cd 'C:\Projects\mini-api-hub'
npm run doctor
```

In Bash, an example path is `cd ~/projects/mini-api-hub`. Installation problems are handled in the next lesson; this exercise is about identifying the correct folder.

**Expected observation:** The command's behavior changes when it runs in the directory containing the project. You can explain why without changing application code.

## Evidence to keep

Write three sentences in your notes: what the Hub does, what the mock warehouse does, and why local access does not mean public deployment. Add the names of the four source files you located.

## Optional AI prompt

> Explain the request flow in this repository using its actual files. Ask me to identify where the order is saved. Do not modify files or introduce additional services.

Before continuing, point to the relevant files yourself. Next: [01 — Tools and terminal](01-tools-terminal.md).
