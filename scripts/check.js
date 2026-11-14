import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname, join, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const ignored = new Set(['.git', 'node_modules', '.data', '.practice', '.backups', '.restore', 'coverage', '.postman']);
function walk(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name) || entry.name === '.env' || entry.name.endsWith('.log')) return [];
    const path = join(folder, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
const files = walk('.');
let checked = 0;
const errors = [];
for (const file of files) {
  if (file.endsWith('.js')) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) errors.push(file + ': ' + result.stderr);
    checked++;
  }
  if (extname(file) === '.json') {
    try { JSON.parse(readFileSync(file, 'utf8')); } catch (error) { errors.push(file + ': ' + error.message); }
    checked++;
  }
  if (file.endsWith('.md')) {
    const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      let target = match[1].split('#')[0].replace(/^<|>$/g, '');
      if (!target || /^[a-z]+:/i.test(target)) continue;
      target = decodeURIComponent(target);
      if (!existsSync(resolve(dirname(file), target))) errors.push(file + ': broken local link ' + target);
    }
    checked++;
  }
}
if (existsSync('api/openapi.json')) {
  const spec = JSON.parse(readFileSync('api/openapi.json', 'utf8'));
  if (!spec.openapi?.startsWith('3.1.')) errors.push('Expected OpenAPI 3.1 contract.');
  function refs(object) {
    if (!object || typeof object !== 'object') return;
    if (object.$ref?.startsWith('#/')) {
      let target = spec;
      for (const key of object.$ref.slice(2).split('/')) target = target?.[key.replaceAll('~1', '/').replaceAll('~0', '~')];
      if (!target) errors.push('Unresolved API reference: ' + object.$ref);
    }
    Object.values(object).forEach(refs);
  }
  refs(spec);
}
if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exitCode = 1;
} else {
  console.log('Checked ' + checked + ' JavaScript, JSON and Markdown files; syntax and local links pass.');
  console.log('Behavior is checked separately by npm test.');
}
