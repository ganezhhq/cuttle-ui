import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

export type Framework = 'react' | 'vue' | 'angular' | 'svelte';

const MARKERS: Array<[string, Framework]> = [
  ['@angular/core', 'angular'],
  ['svelte', 'svelte'],
  ['vue', 'vue'],
  ['react', 'react'],
];

/** Detects the framework from a project's package.json. Returns null if none is found. */
export async function detectFramework(cwd: string): Promise<Framework | null> {
  let source: string;
  try {
    source = await readFile(join(cwd, 'package.json'), 'utf8');
  } catch {
    return null;
  }
  const pkg = JSON.parse(source) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
  return MARKERS.find(([name]) => name in dependencies)?.[1] ?? null;
}

export interface InitOptions {
  cwd: string;
  /** Destination for tokens.css, relative to the project. */
  tokensPath?: string;
  overwrite?: boolean;
}

export interface InitResult {
  framework: Framework | null;
  configPath: string;
  tokensPath: string;
}

/** Writes cuttle.json and copies tokens.css. Refuses to replace an existing config. */
export async function init(options: InitOptions): Promise<InitResult> {
  const { cwd, tokensPath = 'src/styles/tokens.css', overwrite = false } = options;
  const framework = await detectFramework(cwd);
  const configPath = join(cwd, 'cuttle.json');
  const config = { framework, tokens: tokensPath };

  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, {
    flag: overwrite ? 'w' : 'wx',
  }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'EEXIST') {
      throw new Error('cuttle.json already exists. Use --force to replace it.');
    }
    throw error;
  });

  const destination = join(cwd, tokensPath);
  await mkdir(dirname(destination), { recursive: true });
  const require = createRequire(import.meta.url);
  await copyFile(require.resolve('@cuttle-ui/styles/tokens.css'), destination);

  return { framework, configPath, tokensPath: destination };
}
