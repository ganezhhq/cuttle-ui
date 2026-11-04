import { writeFile } from 'node:fs/promises';
import { buildRegistry } from './registry';

/** Runs after the build, and writes the registry next to the CLI. */
const url = new URL('./registry.json', import.meta.url);
await writeFile(url, `${JSON.stringify(await buildRegistry(), null, 2)}\n`);
