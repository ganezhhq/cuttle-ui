import { execSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { appendFile, cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const fixtures = join(here, 'fixtures');

const REACT = '"react": "^19.3.1", "react-dom": "^19.3.1"';
const TYPES = '"@types/react": "^19.3.0", "@types/react-dom": "^19.3.0", "typescript": "~5.9.3"';
const COMPILER =
  '"target": "ES2022", "lib": ["ES2022", "DOM", "DOM.Iterable"], "module": "ESNext", "moduleResolution": "Bundler", "strict": true, "skipLibCheck": true, "noEmit": true';

const log = (message) => console.log(`[fresh-project] ${message}`);

function sh(command, cwd, env = {}) {
  log(`$ ${command}`);
  execSync(command, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, CI: '', NEXT_TELEMETRY_DISABLED: '1', ...env },
  });
}

async function write(root, files) {
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
}

/** Reads the code samples out of the guide, so that a broken sample fails this check. */
async function readGuide() {
  const source = await readFile(join(repo, 'apps/docs/src/pages/getting-started.astro'), 'utf8');
  const samples = Object.fromEntries(
    [...source.matchAll(/const (\w+) = `([\s\S]*?)`;/g)].map((match) => [match[1], match[2]]),
  );
  for (const name of ['viteMain', 'fontCss', 'app', 'nextLayout', 'nextPage']) {
    if (!samples[name]) throw new Error(`The guide no longer has the "${name}" sample.`);
  }
  return samples;
}

const viteFiles = {
  'package.json': `{ "name": "fresh-vite", "private": true, "type": "module", "dependencies": { ${REACT} }, "devDependencies": { ${TYPES}, "@vitejs/plugin-react": "^6.2.1", "vite": "^8.3.5" } }\n`,
  'tsconfig.json': `{ "compilerOptions": { ${COMPILER}, "jsx": "react-jsx", "noUncheckedIndexedAccess": true, "verbatimModuleSyntax": true, "types": ["vite/client"] }, "include": ["src"] }\n`,
  'vite.config.js': `import react from '@vitejs/plugin-react';\nexport default { plugins: [react()] };\n`,
  'index.html': `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Fresh</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`,
};

const nextFiles = {
  'package.json': `{ "name": "fresh-next", "private": true, "dependencies": { "next": "16.4.5", ${REACT} }, "devDependencies": { "@types/node": "^22.0.0", ${TYPES} } }\n`,
  'tsconfig.json': `{ "compilerOptions": { ${COMPILER}, "jsx": "preserve", "allowJs": true, "esModuleInterop": true, "resolveJsonModule": true, "isolatedModules": true, "incremental": true, "plugins": [{ "name": "next" }] }, "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], "exclude": ["node_modules"] }\n`,
};

async function install(app, files, packs) {
  await write(app, files);
  sh('npm install --no-audit --no-fund --loglevel=error', app);
  const tarballs = packs.map((pack) => `"${pack}"`).join(' ');
  sh(`npm install --no-audit --no-fund --loglevel=error ${tarballs}`, app);
}

/** Runs a server until `use` finishes, then stops it and everything it started. */
async function withServer(command, cwd, url, use) {
  log(`$ ${command}`);
  const server = spawn(command, {
    cwd,
    shell: true,
    stdio: 'ignore',
    detached: process.platform !== 'win32',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60 && !ready; attempt += 1) {
      ready = await fetch(url).then(
        (response) => response.ok,
        () => false,
      );
      if (!ready) await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (!ready) throw new Error(`${command} did not start.`);
    await use(url);
  } finally {
    if (process.platform === 'win32') {
      try {
        execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' });
      } catch {
        // The server has already stopped.
      }
    } else {
      try {
        process.kill(-server.pid);
      } catch {
        // The server has already stopped.
      }
    }
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/** Opens a page, runs the checks, and fails on any error the page reports. */
async function inBrowser(browser, url, check) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.includes('favicon')) {
      errors.push(message.text());
    }
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await check(page);
  await page.close();
  assert(errors.length === 0, `The page reported errors:\n${errors.join('\n')}`);
}

/** Copied components have no reset, so this is where a missing style shows up. */
async function checkLayout(page) {
  const layout = await page.evaluate(() => {
    const box = (selector) => document.querySelector(selector).getBoundingClientRect();
    const style = (selector) => getComputedStyle(document.querySelector(selector));
    const card = box('[data-cuttle="card"]');
    const stack = box('main [data-cuttle="stack"]');
    return {
      inputFits:
        box('[data-cuttle="input"]').right <=
        card.right - parseFloat(style('[data-cuttle="card"]').paddingRight) + 0.5,
      textareaFits: box('[data-cuttle="textarea"]').right <= stack.right + 0.5,
      headingMargin: style('[data-cuttle="heading"]').marginTop,
      descriptionMargin: style('[data-cuttle="field-description"]').marginTop,
      accent: getComputedStyle(document.documentElement).getPropertyValue('--cuttle-accent').trim(),
    };
  });
  assert(layout.inputFits, 'The input overflows its card.');
  assert(layout.textareaFits, 'The textarea overflows its stack.');
  assert(layout.headingMargin === '0px', 'A heading keeps the browser margin.');
  assert(layout.descriptionMargin === '0px', 'A description keeps the browser margin.');
  assert(layout.accent === '#4f46e5', `The tokens did not load. The accent is "${layout.accent}".`);
}

/** Only works if React has taken over the page, so it also proves hydration. */
async function checkBehavior(page) {
  const control = page.getByRole('switch', { name: 'Alerts' });
  await control.click();
  assert((await control.getAttribute('aria-checked')) === 'true', 'The switch did not toggle.');

  const select = page.getByRole('combobox', { name: 'Fruit' });
  await select.click();
  await page.getByRole('option', { name: 'Apple' }).click();
  assert((await select.textContent()) === 'Apple', 'The select did not choose an option.');

  const trigger = page.getByRole('button', { name: 'Open dialog' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Hello' });
  await dialog.waitFor();
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
}

const useDemo = async (path) =>
  (await readFile(join(fixtures, 'demo.tsx'), 'utf8')).replace('__COMPONENTS__', path);

const setups = {
  async 'vite-cli'({ app, packs, browser }) {
    await install(app, viteFiles, packs);
    sh('npx cuttle init', app);
    sh('npx cuttle add --all', app);
    await write(app, {
      'src/demo.tsx': await useDemo('./components/cuttle'),
      'src/main.tsx': `import { createRoot } from 'react-dom/client';\nimport './components/cuttle/cuttle.css';\nimport { Demo } from './demo';\n\ncreateRoot(document.getElementById('root') as HTMLElement).render(<Demo />);\n`,
    });
    sh('npx tsc', app);
    sh('npx vite build', app);

    // A local edit has to survive an update.
    const button = join(app, 'src/components/cuttle/button.tsx');
    await appendFile(button, '// A local change.\n');
    sh('npx cuttle update', app);
    assert(
      (await readFile(button, 'utf8')).includes('// A local change.'),
      'cuttle update lost a local change.',
    );

    await withServer(
      'npx vite preview --port 4311 --strictPort',
      app,
      'http://localhost:4311',
      (url) =>
        inBrowser(browser, url, async (page) => {
          await checkLayout(page);
          await checkBehavior(page);
        }),
    );
  },

  async 'next-cli'({ app, packs, browser }) {
    await install(app, nextFiles, packs);
    sh('npx cuttle init --tokens styles/tokens.css', app);
    sh('npx cuttle add --all --dir components/cuttle', app);
    await write(app, {
      'app/layout.tsx': `import type { ReactNode } from 'react';\nimport '../components/cuttle/cuttle.css';\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`,
      'app/demo.tsx': `'use client';\n\n${await useDemo('../components/cuttle')}`,
      'app/page.tsx': `import { Button } from '../components/cuttle';\nimport { Demo } from './demo';\n\n// A server component, using a copied component directly.\nexport default function Page() {\n  return (\n    <>\n      <Button>Server button</Button>\n      <Demo />\n    </>\n  );\n}\n`,
    });
    sh('npx next build', app);
    await withServer('npx next start -p 4312', app, 'http://localhost:4312', (url) =>
      inBrowser(browser, url, async (page) => {
        await page.getByRole('button', { name: 'Server button' }).waitFor();
        await checkLayout(page);
        await checkBehavior(page);
      }),
    );
  },

  async 'vite-package'({ app, packs, browser, guide }) {
    await install(app, viteFiles, packs);
    await write(app, {
      'src/main.tsx': guide.viteMain,
      'src/main.css': guide.fontCss,
      'src/App.tsx': guide.app,
    });
    sh('npx tsc', app);
    sh('npx vite build', app);
    await withServer(
      'npx vite preview --port 4313 --strictPort',
      app,
      'http://localhost:4313',
      (url) =>
        inBrowser(browser, url, async (page) => {
          await page.getByRole('button', { name: 'Open' }).click();
          const dialog = page.getByRole('dialog', { name: 'Hello' });
          await dialog.waitFor();
          await dialog.getByRole('button', { name: 'Close' }).click();
          await dialog.waitFor({ state: 'hidden' });
        }),
    );
  },

  async 'next-package'({ app, packs, browser, guide }) {
    await install(app, nextFiles, packs);
    await write(app, {
      'app/layout.tsx': guide.nextLayout,
      'app/globals.css': guide.fontCss,
      'app/page.tsx': guide.nextPage,
    });
    sh('npx next build', app);
    await withServer('npx next start -p 4314', app, 'http://localhost:4314', (url) =>
      inBrowser(browser, url, async (page) => {
        await page.getByRole('heading', { name: 'Hello' }).waitFor();
        await page.getByRole('button', { name: 'Save' }).waitFor();
      }),
    );
  },
};

const requested = process.argv.slice(2);
const names = requested.length > 0 ? requested : Object.keys(setups);
for (const name of names) {
  if (!setups[name])
    throw new Error(`Unknown setup "${name}". Use: ${Object.keys(setups).join(', ')}.`);
}

const work = await mkdtemp(join(tmpdir(), 'cuttle-fresh-'));
const packDir = join(work, 'packs');
await mkdir(packDir);
for (const name of ['core', 'styles', 'icons', 'react', 'cli']) {
  assert(
    existsSync(join(repo, 'packages', name, name === 'styles' ? 'tokens.css' : 'dist')),
    `Run "pnpm build" first. ${name} is not built.`,
  );
  sh(`pnpm --filter @cuttle-ui/${name} pack --pack-destination "${packDir}"`, repo);
}
const packs = (await readdir(packDir)).map((file) => join(packDir, file));
const guide = await readGuide();
const browser = await chromium.launch();

const results = [];
try {
  for (const name of names) {
    log(`=== ${name}`);
    const app = join(work, name);
    await mkdir(app);
    const started = Date.now();
    try {
      await setups[name]({ app, packs, browser, guide });
      results.push(`PASS ${name} (${Math.round((Date.now() - started) / 1000)}s)`);
    } catch (error) {
      results.push(`FAIL ${name}: ${error.message}`);
    }
  }
} finally {
  await browser.close();
  // Windows can hold files briefly after a server stops, which should not fail the check.
  await rm(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }).catch(() => {});
}

console.log(`\n${results.join('\n')}`);
process.exitCode = results.some((line) => line.startsWith('FAIL')) ? 1 : 0;
