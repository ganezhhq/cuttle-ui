import { parseArgs } from 'node:util';
import { add, update } from './components';
import type { UpdateStatus } from './components';
import { init } from './init';
import { listComponents, loadRegistry } from './registry';
import type { Registry } from './registry';

export const HELP = `Usage: cuttle <command> [options]

Commands:
  init                  Detect the framework, write cuttle.json and copy tokens.css
  add <component...>    Copy components into your project. Run it without a name to list them
  update [component...] Update added components, keeping your changes. Updates all by default

Options for init:
  --tokens <path>  Where to write tokens.css (default: src/styles/tokens.css)
  --force          Replace an existing cuttle.json

Options for add:
  --dir <path>     Where to copy components (default: src/components/cuttle)
  --all            Add every component
  --force          Replace files that already exist with different content

Options for update:
  --dry-run        Show what would change without writing anything

  -h, --help       Show this help
`;

export interface Io {
  cwd: string;
  log: (message: string) => void;
  error: (message: string) => void;
  /** Replaces the built-in registry. Used by tests. */
  registry?: Registry;
}

const STATUS_TEXT: Record<UpdateStatus, string> = {
  'up-to-date': 'Up to date',
  'kept-changes': 'Kept your changes',
  updated: 'Updated',
  merged: 'Merged with your changes',
  added: 'Added',
  restored: 'Restored a missing file',
  conflict: 'CONFLICT, resolve the markers in the file',
  unresolved: 'CONFLICT still unresolved, skipped',
};

/** Runs the CLI and returns its exit code. */
export async function run(argv: string[], io: Io): Promise<number> {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        tokens: { type: 'string' },
        dir: { type: 'string' },
        all: { type: 'boolean', default: false },
        'dry-run': { type: 'boolean', default: false },
        force: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (error) {
    io.error((error as Error).message);
    return 1;
  }

  const [command, ...names] = parsed.positionals;
  if (parsed.values.help || !command) {
    io.log(HELP);
    return 0;
  }

  try {
    switch (command) {
      case 'init': {
        const result = await init({
          cwd: io.cwd,
          tokensPath: parsed.values.tokens,
          overwrite: parsed.values.force,
        });
        io.log(`Framework: ${result.framework ?? 'not detected'}`);
        io.log(`Wrote ${result.configPath}`);
        io.log(`Wrote ${result.tokensPath}`);
        return 0;
      }
      case 'add': {
        const registry = io.registry ?? (await loadRegistry());
        const components = listComponents(registry);
        const chosen = parsed.values.all ? components : names;
        if (chosen.length === 0) {
          io.log(`Available components:\n  ${components.join('\n  ')}`);
          return 0;
        }
        const result = await add({
          cwd: io.cwd,
          registry,
          names: chosen,
          dir: parsed.values.dir,
          overwrite: parsed.values.force,
        });
        if (result.added.length > 0) io.log(`Added to ${result.dir}: ${result.added.join(', ')}`);
        if (result.skipped.length > 0) io.log(`Already added: ${result.skipped.join(', ')}`);
        if (result.dependencies.length > 0) {
          io.log(`Added to package.json: ${result.dependencies.join(', ')}. Run your installer.`);
        }
        io.log(`Import the styles once, from ${result.dir}/cuttle.css`);
        return 0;
      }
      case 'update': {
        const registry = io.registry ?? (await loadRegistry());
        const dryRun = parsed.values['dry-run'];
        const result = await update({ cwd: io.cwd, registry, names, dryRun });
        for (const { file, status } of result.entries) {
          io.log(`${STATUS_TEXT[status]}: ${file}`);
        }
        if (result.dependencies.length > 0) {
          io.log(`Added to package.json: ${result.dependencies.join(', ')}. Run your installer.`);
        }
        if (dryRun) io.log('Dry run, so nothing was written.');
        return result.hasConflicts ? 1 : 0;
      }
      default:
        io.error(`Unknown command "${command}".\n\n${HELP}`);
        return 1;
    }
  } catch (error) {
    io.error((error as Error).message);
    return 1;
  }
}
