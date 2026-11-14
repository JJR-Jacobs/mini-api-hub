# 02 — VS Code and extensions

**Time:** 20–25 minutes, excluding extension download time.

**Goal:** Set up VS Code, install and use a formatter, then connect source code with a browser request.

**Prerequisites:** [Lesson 01](01-tools-terminal.md), VS Code installed and the local application running.

## Useful distinctions

The **editor** changes files. The **terminal** runs commands. The browser's **developer tools** inspect a running page. An **extension** adds a capability to VS Code; it does not replace the project's actual commands or dependencies.

VS Code already includes JavaScript editing, search, Git integration and a terminal. For this exercise, install one formatter and observe exactly what it changes. An AI extension and a database extension are optional. See [VS Code's introduction](https://code.visualstudio.com/docs/getstarted/getting-started) for its basic interface.

## Install and use a formatter

1. Open Extensions with **Ctrl+Shift+X**. Search `@recommended` to see this repository's recommendations, or search the exact identifier `esbenp.prettier-vscode`.
2. Open **Prettier — Code formatter**. Check the extension identifier, publisher information and linked project before selecting **Install**. Recommendations are suggestions, not proof that an extension is required or safe.
3. Create a `.practice` folder in the repository, then a file `.practice/format-demo.js`. This folder is ignored by Git and reserved for practice.
4. Put this deliberately cramped but valid code in the file:

```javascript
const example={reference:'FORMAT-001',sku:'DESK-01',quantity:2};console.log(example);
```

5. Open the Command Palette with **Ctrl+Shift+P**. Run **Format Document With…** and select **Prettier**. Observe added whitespace and line breaks. Formatting changes presentation, not the intended order values.
6. Read [VS Code's extension instructions](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace) if installation is blocked. Do not install a similarly named substitute to work around an account or network restriction.

## Try a workspace setting

**User settings** apply across your VS Code work. **Workspace settings** apply to this project and can be shared through `.vscode/settings.json`.

Open `.vscode/settings.json`. Temporarily change `"editor.formatOnSave": false` to `true` and add `"editor.defaultFormatter": "esbenp.prettier-vscode"` as another property. Keep valid JSON commas between properties. Do not duplicate a setting if it already exists.

Make the practice file cramped again and save it. Prettier should format it on save. Inspect:

```powershell
git diff -- .vscode/settings.json
```

If you have not initialized Git yet, inspect the changed settings in the editor and revisit the command after lesson 03. Restore `formatOnSave` to `false` and remove only the default-formatter property you added for this exercise. Preserve other existing settings. Inspect the diff again. This teaching repository leaves automatic formatting off so a first code change does not accidentally reformat whole files.

**Expected observation:** You can explain the distinction between formatting a document once and changing how every save behaves. The ignored practice file is not a source change to publish.

## Follow a request through the tools

1. Open the whole repository with **File → Open Folder**. Opening just `server.js` hides useful project context.
2. Use **Ctrl+P** and type `package.json`. Find the `dev` and `test` scripts.
3. Use **Ctrl+Shift+F** to search for `/health/live`. Open the source match that handles the route.
4. Open the integrated terminal with **Terminal → New Terminal**. Confirm the current directory with `Get-Location` or `pwd`.
5. Open the Hub in your browser. Use **F12** or the browser's menu to open developer tools.
6. Select **Network**, reload the page and inspect a request. Record its method, URL and status.
7. In the browser's address bar, open `http://localhost:3000/health/live`. Compare its JSON response with the route you found.

Keep authorization headers out of screenshots. The browser may show a key in the request details after you authenticate.

**Expected observation:** You can find code using search and connect it to an actual request. Seeing an editor tab does not prove that the running process is using your latest edit; later lessons check that explicitly.

## Break and fix: a nonexistent route

Open `http://localhost:3000/health/lvie`. The spelling is deliberately wrong.

Inspect the result in Network. You should see a route failure, typically HTTP 404, rather than the connection error from the stopped-server exercise. Return to `/health/live` and observe the successful response.

Explain why installing an editor extension would not repair a misspelled URL.

## Choose extensions deliberately

If you already have an AI assistant, practice asking it to explain code before allowing it to edit. One extension solving one known problem is easier to understand than a collection of unexplained tools.

Do not use a static-page “live server” extension to run this application. Its backend must execute Node, access the database and call the warehouse. Serving the HTML alone cannot do that work.

## Evidence to keep

Keep the practice file's before-and-after formatting and an explanation of the temporary workspace setting. Record the file handling `/health/live`, the difference between 404 and a connection failure, and the npm command that starts the actual application. Save a sanitized Network screenshot if it helps.

## Optional AI prompt

> Explain my formatter and workspace-settings changes without installing additional extensions. Then help me locate the handler for this request and identify its status in browser Network. Ask me to explain what each tool actually does.

Next: [03 — Git](03-git.md).
