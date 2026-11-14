import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

if (existsSync('.env')) {
  console.log('.env already exists. Kept your current keys and settings.');
} else {
  const example = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
  const configured = example
    .replace('API_KEY=GENERATE_WITH_NPM_RUN_SETUP', `API_KEY=${randomBytes(24).toString('hex')}`)
    .replace('WAREHOUSE_KEY=GENERATE_WITH_NPM_RUN_SETUP', `WAREHOUSE_KEY=${randomBytes(24).toString('hex')}`);
  writeFileSync('.env', configured, { flag: 'wx', mode: 0o600 });
  console.log('Created .env with two different random keys. Keys were not printed.');
  console.log('Open .env in your editor; use API_KEY in the dashboard key field.');
}
console.log('Next: npm run db:migrate, then npm run dev.');
