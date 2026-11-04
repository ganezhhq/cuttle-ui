import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface RegistryFile {
  name: string;
  content: string;
}

export interface RegistryItem {
  /** Hidden items are only installed as a dependency of another item. */
  hidden?: boolean;
  files: RegistryFile[];
  /** Other registry items this one needs. */
  registryDependencies: string[];
  /** npm packages this one needs, with version ranges. */
  dependencies: Record<string, string>;
}

export interface Registry {
  version: string;
  items: Record<string, RegistryItem>;
}

interface ItemConfig {
  hidden?: boolean;
  /** Files from packages/react/src. */
  react?: string[];
  /** Files from packages/styles. */
  styles?: string[];
  registryDependencies?: string[];
}

/** What each component is made of. `buildRegistry` checks this against the imports. */
const ITEMS: Record<string, ItemConfig> = {
  primitives: { hidden: true, react: ['primitives.tsx'], styles: ['base.css', 'focus.css'] },
  layer: { hidden: true, react: ['layer.tsx'], registryDependencies: ['primitives'] },
  button: { react: ['button.tsx'], styles: ['button.css'], registryDependencies: ['primitives'] },
  dialog: { react: ['dialog.tsx'], styles: ['dialog.css'], registryDependencies: ['primitives'] },
  field: { react: ['field.tsx'], styles: ['forms.css'], registryDependencies: ['primitives'] },
  label: { registryDependencies: ['field'] },
  input: { react: ['input.tsx'], registryDependencies: ['field'] },
  textarea: { react: ['textarea.tsx'], registryDependencies: ['field', 'primitives'] },
  checkbox: { react: ['checkbox.tsx'], registryDependencies: ['field', 'primitives'] },
  'radio-group': { react: ['radio-group.tsx'], registryDependencies: ['field', 'primitives'] },
  switch: { react: ['switch.tsx'], registryDependencies: ['field', 'primitives'] },
  select: {
    react: ['select.tsx'],
    styles: ['overlays.css'],
    registryDependencies: ['field', 'layer', 'primitives'],
  },
  tooltip: {
    react: ['tooltip.tsx'],
    styles: ['overlays.css'],
    registryDependencies: ['layer', 'primitives'],
  },
  popover: {
    react: ['popover.tsx'],
    styles: ['overlays.css'],
    registryDependencies: ['layer', 'primitives'],
  },
  card: { react: ['card.tsx'], styles: ['layout.css'], registryDependencies: ['primitives'] },
  stack: { react: ['stack.tsx'], styles: ['layout.css'], registryDependencies: ['primitives'] },
  typography: {
    react: ['typography.tsx'],
    styles: ['layout.css'],
    registryDependencies: ['primitives'],
  },
};

const here = dirname(fileURLToPath(import.meta.url));
const PACKAGES = join(here, '..', '..');
const ALWAYS_AVAILABLE = new Set(['react', 'react-dom']);

/** Finds what a source file imports. */
function findImports(source: string): string[] {
  return [...source.matchAll(/from '([^']+)'/g)].map((match) => match[1] as string);
}

/** Reads the component sources, and fails if a file imports something the config misses. */
export async function buildRegistry(): Promise<Registry> {
  const core = JSON.parse(await readFile(join(PACKAGES, 'core/package.json'), 'utf8')) as {
    version: string;
  };
  const cli = JSON.parse(await readFile(join(PACKAGES, 'cli/package.json'), 'utf8')) as {
    version: string;
  };
  const items: Record<string, RegistryItem> = {};
  const owners = new Map<string, string>();
  for (const [name, config] of Object.entries(ITEMS)) {
    for (const file of config.react ?? []) owners.set(file.replace(/\.tsx$/, ''), name);
  }

  for (const [name, config] of Object.entries(ITEMS)) {
    const files: RegistryFile[] = [];
    const dependencies: Record<string, string> = {};

    for (const file of config.react ?? []) {
      const source = await readFile(join(PACKAGES, 'react/src', file), 'utf8');
      for (const specifier of findImports(source)) {
        if (specifier.startsWith('./')) {
          const owner = owners.get(specifier.slice(2));
          if (!owner) throw new Error(`${file} imports ${specifier}, which has no registry item.`);
          if (owner !== name && !config.registryDependencies?.includes(owner)) {
            throw new Error(`${name} needs "${owner}" in registryDependencies, for ${file}.`);
          }
        } else if (specifier === '@cuttle-ui/core') {
          dependencies[specifier] = `^${core.version}`;
        } else if (!ALWAYS_AVAILABLE.has(specifier)) {
          throw new Error(`${file} imports ${specifier}, which the registry does not handle.`);
        }
      }
      // Copied files are not bundled, so each one has to mark itself for Next.js.
      files.push({ name: file, content: `'use client';\n\n${source}` });
    }

    for (const file of config.styles ?? []) {
      files.push({ name: file, content: await readFile(join(PACKAGES, 'styles', file), 'utf8') });
    }

    items[name] = {
      ...(config.hidden ? { hidden: true } : {}),
      files,
      registryDependencies: config.registryDependencies ?? [],
      dependencies,
    };
  }

  return { version: cli.version, items };
}

/** Loads the registry that was written next to the built CLI. */
export async function loadRegistry(): Promise<Registry> {
  return JSON.parse(await readFile(join(here, 'registry.json'), 'utf8')) as Registry;
}

/** Lists an item and everything it depends on, without repeats. */
export function resolveItems(registry: Registry, names: string[]): string[] {
  const seen = new Set<string>();
  const visit = (name: string) => {
    if (seen.has(name)) return;
    const item = registry.items[name];
    if (!item) throw new Error(`Unknown component "${name}".`);
    seen.add(name);
    item.registryDependencies.forEach(visit);
  };
  names.forEach(visit);
  return [...seen];
}

/** The names a person can add. */
export function listComponents(registry: Registry): string[] {
  return Object.entries(registry.items)
    .filter(([, item]) => !item.hidden)
    .map(([name]) => name)
    .sort();
}
