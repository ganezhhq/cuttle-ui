import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { planFile } from './components';
import { buildRegistry, listComponents, resolveItems } from './registry';
import type { Registry } from './registry';
import { run } from './run';

let cwd: string;
let output: string[];
let registry: Registry;

const cli = (...args: string[]) =>
  run(args, { cwd, registry, log: (m) => output.push(m), error: (m) => output.push(m) });
const read = (path: string) => readFile(join(cwd, path), 'utf8');
const DIR = 'src/components/cuttle';

const LINES = Array.from({ length: 12 }, (_, index) => `line ${index + 1}`);
const text = (lines: string[]) => `${lines.join('\n')}\n`;
const withLine = (index: number, value: string) =>
  text(LINES.map((line, i) => (i === index ? value : line)));

/** A small registry, so a test can publish a "new version" of a file. */
const fixture = (widget: string, version = '1.0.0', extra = false): Registry => ({
  version,
  items: {
    base: {
      hidden: true,
      files: [{ name: 'base.tsx', content: 'export const base = 1;\n' }],
      registryDependencies: [],
      dependencies: {},
    },
    widget: {
      files: [
        { name: 'widget.tsx', content: widget },
        { name: 'widget.css', content: '.widget {}\n' },
        ...(extra ? [{ name: 'extra.tsx', content: 'export const extra = 1;\n' }] : []),
      ],
      registryDependencies: ['base'],
      dependencies: { '@cuttle-ui/core': '^1.0.0' },
    },
    other: {
      files: [{ name: 'other.tsx', content: 'export const other = 1;\n' }],
      registryDependencies: ['base'],
      dependencies: {},
    },
  },
});

beforeEach(async () => {
  cwd = await mkdtemp(join(tmpdir(), 'cuttle-cli-'));
  output = [];
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify({ dependencies: { react: '19' } }, null, 2),
  );
  registry = fixture(text(LINES));
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

describe('the real registry', () => {
  it('builds, and its config matches what the files import', async () => {
    const real = await buildRegistry();
    expect(listComponents(real)).toHaveLength(15);
    expect(listComponents(real)).not.toContain('primitives');
  });

  it('marks copied React files as client code', async () => {
    const real = await buildRegistry();
    expect(real.items.button?.files[0]?.content.startsWith("'use client';")).toBe(true);
  });

  it('brings in what a component depends on', async () => {
    const real = await buildRegistry();
    expect(resolveItems(real, ['select']).sort()).toEqual([
      'field',
      'layer',
      'primitives',
      'select',
    ]);
    expect(resolveItems(real, ['field'])).toContain('primitives');
    expect(real.items.select?.dependencies).toHaveProperty(['@cuttle-ui/core']);
  });

  it('gives label the field file, and all components add together', async () => {
    registry = await buildRegistry();
    await cli('init');
    expect(await cli('add', 'label')).toBe(0);
    expect(await read(`${DIR}/field.tsx`)).toContain('export function Label');
    expect(await cli('add', '--all')).toBe(0);
    const index = await read(`${DIR}/index.ts`);
    expect(index).toContain("export * from './select';");
    expect(index).not.toContain('layer');
    const css = await read(`${DIR}/cuttle.css`);
    expect(css.indexOf('tokens.css')).toBeLessThan(css.indexOf('base.css'));
    expect(css.indexOf('base.css')).toBeLessThan(css.indexOf('button.css'));
    expect(css).toContain("@import '../../styles/tokens.css';");
  });
});

describe('cuttle add', () => {
  it('needs init first', async () => {
    expect(await cli('add', 'widget')).toBe(1);
    expect(output.join()).toContain('cuttle init');
  });

  it('lists components without a name, hiding internal ones', async () => {
    await cli('init');
    expect(await cli('add')).toBe(0);
    expect(output.join()).toContain('widget');
    expect(output.join()).not.toContain('base');
  });

  it('copies files and dependencies, and records them', async () => {
    await cli('init');
    expect(await cli('add', 'widget')).toBe(0);
    expect(await read(`${DIR}/widget.tsx`)).toBe(text(LINES));
    expect(await read(`${DIR}/base.tsx`)).toContain('base');
    expect(await read('.cuttle/base/widget.tsx')).toBe(text(LINES));
    const config = JSON.parse(await read('cuttle.json'));
    expect(config.installed).toEqual({ widget: '1.0.0', base: '1.0.0' });
    const pkg = JSON.parse(await read('package.json'));
    expect(pkg.dependencies).toEqual({ '@cuttle-ui/core': '^1.0.0', react: '19' });
  });

  it('honors --dir, and remembers it', async () => {
    await cli('init');
    await cli('add', 'widget', '--dir', 'ui');
    expect(await read('ui/widget.tsx')).toBe(text(LINES));
    await cli('add', 'other');
    expect(await read('ui/other.tsx')).toContain('other');
  });

  it('rejects an unknown component without writing anything', async () => {
    await cli('init');
    expect(await cli('add', 'nope')).toBe(1);
    expect(output.join()).toContain('Unknown component "nope"');
    expect(JSON.parse(await read('cuttle.json')).installed).toBeUndefined();
  });

  it('refuses to replace a different file, unless forced', async () => {
    await cli('init');
    await cli('add', 'other');
    await writeFile(join(cwd, DIR, 'widget.tsx'), 'mine\n');
    expect(await cli('add', 'widget')).toBe(1);
    expect(output.join()).toContain('already exists');
    expect(await read(`${DIR}/widget.tsx`)).toBe('mine\n');
    expect(JSON.parse(await read('cuttle.json')).installed.widget).toBeUndefined();
    expect(await cli('add', 'widget', '--force')).toBe(0);
    expect(await read(`${DIR}/widget.tsx`)).toBe(text(LINES));
  });

  it('leaves changes alone when a shared file is already added', async () => {
    await cli('init');
    await cli('add', 'widget');
    await writeFile(join(cwd, DIR, 'base.tsx'), 'export const base = 2;\n');
    expect(await cli('add', 'other')).toBe(0);
    expect(await read(`${DIR}/base.tsx`)).toBe('export const base = 2;\n');
  });

  it('does not change a project on a framework it cannot serve', async () => {
    await writeFile(join(cwd, 'package.json'), JSON.stringify({ dependencies: { vue: '3' } }));
    await cli('init');
    expect(await cli('add', 'widget')).toBe(1);
    expect(output.join()).toContain('Only React');
  });
});

describe('cuttle update', () => {
  const setUp = async () => {
    await cli('init');
    await cli('add', 'widget');
    output = [];
  };
  const publish = (widget: string, extra = false) => {
    registry = fixture(widget, '2.0.0', extra);
  };

  it('says when everything is up to date', async () => {
    await setUp();
    expect(await cli('update')).toBe(0);
    expect(output.join()).toContain(`Up to date: ${DIR}/widget.tsx`);
  });

  it('replaces a file you did not change', async () => {
    await setUp();
    publish(withLine(1, 'new'));
    expect(await cli('update', 'widget')).toBe(0);
    expect(await read(`${DIR}/widget.tsx`)).toBe(withLine(1, 'new'));
    expect(output.join()).toContain(`Updated: ${DIR}/widget.tsx`);
    expect(JSON.parse(await read('cuttle.json')).installed.widget).toBe('2.0.0');
  });

  it('keeps your changes when the new version did not touch the file', async () => {
    await setUp();
    await writeFile(join(cwd, DIR, 'widget.tsx'), withLine(1, 'mine'));
    registry = fixture(text(LINES), '2.0.0');
    expect(await cli('update')).toBe(0);
    expect(await read(`${DIR}/widget.tsx`)).toBe(withLine(1, 'mine'));
    expect(output.join()).toContain('Kept your changes');
  });

  it('merges changes in different places', async () => {
    await setUp();
    await writeFile(join(cwd, DIR, 'widget.tsx'), withLine(1, 'mine'));
    publish(withLine(9, 'new'));
    expect(await cli('update')).toBe(0);
    const merged = await read(`${DIR}/widget.tsx`);
    expect(merged).toContain('mine');
    expect(merged).toContain('new');
    expect(merged).not.toContain('<<<<<<<');
    expect(output.join()).toContain('Merged with your changes');
  });

  it('reports a conflict, keeps both sides, and fails until it is resolved', async () => {
    await setUp();
    await writeFile(join(cwd, DIR, 'widget.tsx'), withLine(4, 'mine'));
    publish(withLine(4, 'new'));
    expect(await cli('update')).toBe(1);
    const conflicted = await read(`${DIR}/widget.tsx`);
    expect(conflicted).toContain('<<<<<<< your changes');
    expect(conflicted).toContain('mine');
    expect(conflicted).toContain('new');
    expect(conflicted).toContain('>>>>>>> cuttle update');
    expect(output.join()).toContain('CONFLICT');

    output = [];
    expect(await cli('update')).toBe(1);
    expect(output.join()).toContain('still unresolved');
    expect(await read(`${DIR}/widget.tsx`)).toBe(conflicted);

    await writeFile(join(cwd, DIR, 'widget.tsx'), withLine(4, 'resolved'));
    output = [];
    expect(await cli('update')).toBe(0);
    expect(await read(`${DIR}/widget.tsx`)).toBe(withLine(4, 'resolved'));
  });

  it('accepts the same change on both sides without a conflict', async () => {
    await setUp();
    await writeFile(join(cwd, DIR, 'widget.tsx'), withLine(4, 'same'));
    publish(withLine(4, 'same'));
    expect(await cli('update')).toBe(0);
    expect(output.join()).toContain('Up to date');
  });

  it('changes nothing in a dry run', async () => {
    await setUp();
    await writeFile(join(cwd, DIR, 'widget.tsx'), withLine(4, 'mine'));
    publish(withLine(4, 'new'));
    expect(await cli('update', '--dry-run')).toBe(1);
    expect(output.join()).toContain('Dry run');
    expect(await read(`${DIR}/widget.tsx`)).toBe(withLine(4, 'mine'));
    expect(await read('.cuttle/base/widget.tsx')).toBe(text(LINES));
    expect(JSON.parse(await read('cuttle.json')).installed.widget).toBe('1.0.0');
  });

  it('restores a deleted file, and adds a new one', async () => {
    await setUp();
    await rm(join(cwd, DIR, 'widget.css'));
    publish(text(LINES), true);
    expect(await cli('update')).toBe(0);
    expect(await read(`${DIR}/widget.css`)).toContain('.widget');
    expect(await read(`${DIR}/extra.tsx`)).toContain('extra');
    expect(output.join()).toContain('Restored');
    expect(await read(`${DIR}/index.ts`)).toContain("'./extra'");
  });

  it('only touches what you name, and what it depends on', async () => {
    await cli('init');
    await cli('add', 'widget', 'other');
    registry = {
      ...fixture(withLine(1, 'new'), '2.0.0'),
    };
    const items = registry.items;
    if (items.other) items.other.files = [{ name: 'other.tsx', content: 'changed\n' }];
    expect(await cli('update', 'other')).toBe(0);
    expect(await read(`${DIR}/other.tsx`)).toBe('changed\n');
    expect(await read(`${DIR}/widget.tsx`)).toBe(text(LINES));
  });

  it('rejects what was never added', async () => {
    await setUp();
    expect(await cli('update', 'other')).toBe(1);
    expect(output.join()).toContain('has not been added');
    expect(await cli('update', 'nope')).toBe(1);
    expect(output.join()).toContain('Unknown component');
  });
});

describe('planFile', () => {
  it('keeps Windows line endings when it updates a file', () => {
    const base = 'a\nb\n';
    const { status, content } = planFile('a\r\nb\r\n', base, 'a\nc\n');
    expect(status).toBe('updated');
    expect(content).toBe('a\r\nc\r\n');
  });

  it('does not treat line endings as a local change', () => {
    expect(planFile('a\r\nb\r\n', 'a\nb\n', 'a\nb\n').status).toBe('up-to-date');
  });

  it('flags a conflict when the starting point is missing', () => {
    expect(planFile('mine\n', null, 'theirs\n').status).toBe('conflict');
  });
});
