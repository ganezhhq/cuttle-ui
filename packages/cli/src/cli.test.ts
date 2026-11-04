import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { detectFramework } from './init';
import { run } from './run';

let cwd: string;
let output: string[];
const cli = (...args: string[]) =>
  run(args, { cwd, log: (m) => output.push(m), error: (m) => output.push(m) });

beforeEach(async () => {
  cwd = await mkdtemp(join(tmpdir(), 'cuttle-cli-'));
  output = [];
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

const writePackage = (dependencies: Record<string, string>) =>
  writeFile(join(cwd, 'package.json'), JSON.stringify({ dependencies }));

describe('detectFramework', () => {
  it('finds each framework, and prefers the specific one', async () => {
    await writePackage({ react: '19' });
    expect(await detectFramework(cwd)).toBe('react');
    await writePackage({ '@angular/core': '20', react: '19' });
    expect(await detectFramework(cwd)).toBe('angular');
  });

  it('returns null without a package.json or known framework', async () => {
    expect(await detectFramework(cwd)).toBeNull();
    await writePackage({ lodash: '4' });
    expect(await detectFramework(cwd)).toBeNull();
  });
});

describe('cuttle init', () => {
  it('writes the config and copies tokens', async () => {
    await writePackage({ vue: '3' });
    expect(await cli('init')).toBe(0);
    const config = JSON.parse(await readFile(join(cwd, 'cuttle.json'), 'utf8'));
    expect(config).toEqual({ framework: 'vue', tokens: 'src/styles/tokens.css' });
    const tokens = await readFile(join(cwd, 'src/styles/tokens.css'), 'utf8');
    expect(tokens).toContain('--cuttle-accent');
  });

  it('honors --tokens', async () => {
    expect(await cli('init', '--tokens', 'theme/t.css')).toBe(0);
    expect(await readFile(join(cwd, 'theme/t.css'), 'utf8')).toContain('--cuttle-accent');
  });

  it('refuses to replace a config without --force', async () => {
    await cli('init');
    expect(await cli('init')).toBe(1);
    expect(output.join()).toContain('already exists');
    expect(await cli('init', '--force')).toBe(0);
  });
});

describe('other commands', () => {
  it('shows help, and rejects unknown commands and options', async () => {
    expect(await cli()).toBe(0);
    expect(output.join()).toContain('Usage: cuttle');
    expect(await cli('nope')).toBe(1);
    expect(await cli('init', '--bad-flag')).toBe(1);
  });
});
