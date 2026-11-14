# 11 — Add a dependency deliberately

**Time:** 15–20 minutes. **Before:** [10 — Integration failures](10-integration-failures.md), a clean Git working tree. Internet access is needed for this optional package exercise.

A **dependency** is someone else's code that your program uses. An editor **extension** changes VS Code; an npm dependency changes this project. Installing one does not install the other. This app starts with no external JavaScript packages so your first run has fewer moving parts.

## Do: inspect before adding

Create a branch:

```powershell
git switch -c lesson/add-a-package
npm view picocolors name version description repository.url license
```

Read the [package's own repository](https://github.com/alexeyraspopov/picocolors). We will use this small package only to color a terminal message. It is not necessary for the Hub. Package popularity and a clean audit are evidence, not a guarantee of safety.

```powershell
npm install --save-exact picocolors
```

Open `package.json` and `package-lock.json`. The first declares what we asked for; the lockfile records the resolved dependency tree. `node_modules` holds installed files and stays out of Git.

Create `scripts/colors.js` in the editor:

```javascript
import pc from 'picocolors';

console.log(pc.green('I installed and imported a dependency.'));
```

Run it:

```powershell
node scripts/colors.js
git diff -- package.json package-lock.json
npm test
```

## Break, investigate, fix

Change the import to `'picocolor'`. Run the script and read `ERR_MODULE_NOT_FOUND`. Compare the import with the installed package name. Fix the spelling and rerun. Do not solve an import typo by installing a similarly named package.

Use `npm ci` to reinstall exactly the locked dependency tree. It removes and rebuilds `node_modules`; it is appropriate for a clean checkout or CI, not for making up a new dependency version.

## Remove what you do not need

```powershell
npm uninstall picocolors
```

Delete only `scripts/colors.js` using the editor, since its import now refers to a package we removed. Check `git diff` and `git status`. Run `npm ci`, `npm run check` and `npm test`. The original app should work without that package.

**You are done when:** you can explain the three roles of `package.json`, `package-lock.json` and `node_modules`, and show the import failure and its fix. Save that explanation in your private learning notes. Do not commit `node_modules`.

**AI prompt:** “Review my reason for adding this package. Explain the install and lockfile changes, and ask me whether the standard library already does what I need.”

[npm's explanation of `npm ci`](https://docs.npmjs.com/cli/v11/commands/npm-ci) · [Next: containers](12-containers.md)
