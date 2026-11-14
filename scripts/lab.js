import { mkdirSync, existsSync, writeFileSync, copyFileSync, constants } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { labs } from '../labs/catalog.js';

const [command = 'list', name] = process.argv.slice(2);
const practiceRoot = resolve(process.env.MINI_HUB_PRACTICE_ROOT || '.practice');

function run() {
  if (command === 'list') {
    for (const [key, lab] of Object.entries(labs)) console.log(key + ': ' + lab.goal);
    console.log('\nUse: npm run lab -- start validation');
    return;
  }
  if (!Object.hasOwn(labs, name)) throw new Error('Choose a lab from: npm run lab -- list');
  const lab = labs[name];
  const directory = join(practiceRoot, name);
  const file = join(directory, 'solution.js');
  if (command === 'start') {
    if (existsSync(file)) throw new Error('Practice already exists. Your work was kept. Use check, hint, fix or reset.');
    mkdirSync(directory, { recursive: true });
    // A local package marker keeps these files ESM even in a temporary test directory.
    writeFileSync(join(directory, 'package.json'), '{"type":"module"}\n');
    writeFileSync(file, lab.broken, { flag: 'wx' });
    console.log('Exercise: ' + lab.goal);
    console.log('Edit: ' + file);
    console.log('First run npm run lab -- check ' + name + ' and observe the expected failing tests.');
    console.log('Change the code yourself, check again, then explain the cause in your own words.');
  } else if (command === 'hint') {
    console.log(lab.hint);
  } else if (command === 'check') {
    if (!existsSync(file)) throw new Error('Start this lab before checking it.');
    const testFile = new URL('../labs/' + name + '.test.js', import.meta.url);
    const childEnvironment = { ...process.env, MINI_HUB_SOLUTION: file };
    // A checker started by our own regression tests still needs a fresh test runner.
    delete childEnvironment.NODE_TEST_CONTEXT;
    const result = spawnSync(process.execPath, ['--test', fileURLToPath(testFile)], {
      stdio: 'inherit', env: childEnvironment,
    });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
    if (result.status === 0) console.log('Green. Save your diff and explain why the original code failed.');
  } else if (command === 'fix' || command === 'reset') {
    if (!existsSync(file)) throw new Error('Start this lab first.');
    const backup = file + '.before-' + Date.now();
    copyFileSync(file, backup, constants.COPYFILE_EXCL);
    writeFileSync(file, command === 'fix' ? lab.solution : lab.broken);
    console.log(command === 'fix' ? 'Reference answer revealed. Compare it with your attempt.' : 'Broken starter restored.');
    console.log('Previous attempt kept at: ' + backup);
  } else {
    throw new Error('Commands: list, start, check, hint, fix, reset');
  }
}

try { run(); } catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
