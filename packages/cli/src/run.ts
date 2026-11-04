import { parseArgs } from 'node:util';
import { init } from './init';

export const HELP = `Usage: cuttle <command> [options]

Commands:
  init      Detect the framework, write cuttle.json and copy tokens.css
  add       Add a component (available from Phase 1)
  update    Update added components (available from Phase 1)

Options for init:
  --tokens <path>  Where to write tokens.css (default: src/styles/tokens.css)
  --force          Replace an existing cuttle.json
  -h, --help       Show this help
`;

export interface Io {
  cwd: string;
  log: (message: string) => void;
  error: (message: string) => void;
}

/** Runs the CLI and returns its exit code. */
export async function run(argv: string[], io: Io): Promise<number> {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        tokens: { type: 'string' },
        force: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (error) {
    io.error((error as Error).message);
    return 1;
  }

  const [command] = parsed.positionals;
  if (parsed.values.help || !command) {
    io.log(HELP);
    return 0;
  }

  switch (command) {
    case 'init':
      try {
        const result = await init({
          cwd: io.cwd,
          tokensPath: parsed.values.tokens,
          overwrite: parsed.values.force,
        });
        io.log(`Framework: ${result.framework ?? 'not detected'}`);
        io.log(`Wrote ${result.configPath}`);
        io.log(`Wrote ${result.tokensPath}`);
        return 0;
      } catch (error) {
        io.error((error as Error).message);
        return 1;
      }
    case 'add':
    case 'update':
      io.error(`"cuttle ${command}" is not available yet. It arrives in Phase 1.`);
      return 1;
    default:
      io.error(`Unknown command "${command}".\n\n${HELP}`);
      return 1;
  }
}
