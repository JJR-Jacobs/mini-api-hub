import { pathToFileURL } from 'node:url';
if (!process.env.MINI_HUB_SOLUTION) throw new Error('Use npm run lab -- check <name>, not node --test labs.');
export const solution = await import(pathToFileURL(process.env.MINI_HUB_SOLUTION).href);
