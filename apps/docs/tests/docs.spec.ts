import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const BASE = '/cuttle-ui';
const PLAYGROUND = `${BASE}/theme-playground`;

const COMPONENTS = [
  'button',
  'dialog',
  'input',
  'textarea',
  'label',
  'field',
  'checkbox',
  'radio-group',
  'switch',
  'select',
  'tooltip',
  'popover',
  'card',
  'stack',
  'typography',
];
const PAGES = [
  '/',
  '/installation',
  '/getting-started',
  '/theming',
  '/theme-playground',
  '/tokens',
  ...COMPONENTS.map((name) => `/components/${name}`),
];

async function violations(page: Page): Promise<string[]> {
  await page.addScriptTag({ path: axePath });
  const found = await page.evaluate(async () => {
    const { axe } = window as unknown as {
      axe: {
        run: () => Promise<{
          violations: Array<{ id: string; nodes: Array<{ target: unknown }> }>;
        }>;
      };
    };
    return (await axe.run()).violations;
  });
  return found.map((v) => `${v.id} ${JSON.stringify(v.nodes[0]?.target)}`);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    for (const path of PAGES) {
      test(`${path} has no accessibility violations`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(`${BASE}${path}`);
        await page.locator('h1').waitFor();
        expect(await violations(page)).toEqual([]);
      });
    }
  });
}

test('every internal link leads to a page', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of PAGES) {
    await page.goto(`${BASE}${path}`);
    const links = await page
      .locator('a[href^="/"]')
      .evaluateAll((items) => items.map((item) => item.getAttribute('href') as string));
    links.forEach((link) => seen.add(link));
  }
  expect(seen.size).toBeGreaterThan(PAGES.length - 1);
  for (const link of seen) {
    expect(link.startsWith(`${BASE}/`), link).toBe(true);
    expect((await request.get(link)).status(), link).toBe(200);
  }
});

test('pages load without failed requests', async ({ page }) => {
  const failed: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
  });
  for (const path of PAGES) await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  expect(failed).toEqual([]);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const path of PAGES) {
    test(`${path} fits, with its content near the top`, async ({ page }) => {
      await page.goto(`${BASE}${path}`);
      const box = await page.locator('h1').boundingBox();
      expect(box?.y ?? Infinity).toBeLessThan(420);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });
  }

  test('a wide table scrolls by itself, and can be reached by keyboard', async ({ page }) => {
    await page.goto(`${BASE}/components/dialog`);
    const wide = page.locator('.table-scroll[tabindex="0"]').first();
    await expect(wide).toBeVisible();
    await wide.focus();
    await expect(wide).toBeFocused();
    expect(await wide.evaluate((box) => box.scrollWidth > box.clientWidth)).toBe(true);
    await expect(page.locator('main th', { hasText: 'Default' }).first()).toHaveCSS(
      'overflow-wrap',
      'normal',
    );
  });

  test('passes accessibility checks where things scroll', async ({ page }) => {
    await page.goto(`${BASE}/components/dialog`);
    expect(await violations(page)).toEqual([]);
    await page.goto(`${BASE}/getting-started`);
    expect(await violations(page)).toEqual([]);
  });
});

test('a table that fits does not add a tab stop', async ({ page }) => {
  await page.goto(`${BASE}/components/label`);
  await expect(page.locator('.table-scroll').first()).toBeVisible();
  await expect(page.locator('.table-scroll[tabindex]')).toHaveCount(0);
});

test.describe('theme playground', () => {
  const accent = (page: Page) =>
    page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--cuttle-accent').trim(),
    );

  test('changes real components when the accent changes', async ({ page }) => {
    await page.goto(PLAYGROUND);
    const input = page.getByRole('textbox', { name: 'Accent color', exact: true });
    await input.fill('#0f766e');
    await expect.poll(() => accent(page)).toBe('#0f766e');
    await expect(page.getByRole('button', { name: 'Solid' })).toHaveCSS(
      'background-color',
      'rgb(15, 118, 110)',
    );
    await expect(page.getByLabel('Generated CSS')).toContainText('--cuttle-accent: #0f766e;');
  });

  test('applies the same theme to dialogs, which render outside the preview', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PLAYGROUND);
    await page.getByRole('slider', { name: /Radius/ }).fill('20');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('dialog', { name: 'Your theme' })).toHaveCSS(
      'border-radius',
      '28px',
    );
  });

  test('changes the radius', async ({ page }) => {
    await page.goto(PLAYGROUND);
    await page.getByRole('slider', { name: /Radius/ }).fill('0');
    await expect(page.getByRole('button', { name: 'Solid' })).toHaveCSS('border-radius', '0px');
    await expect(page.getByLabel('Generated CSS')).toContainText('--cuttle-radius: 0px;');
  });

  test('keeps the last valid theme while the color is invalid', async ({ page }) => {
    await page.goto(PLAYGROUND);
    const input = page.getByRole('textbox', { name: 'Accent color', exact: true });
    await input.fill('#0f766e');
    await expect.poll(() => accent(page)).toBe('#0f766e');
    await input.fill('#0f');
    await expect(page.getByText('Enter a hex color')).toBeVisible();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(await accent(page)).toBe('#0f766e');
    await expect(page.getByLabel('Generated CSS')).toContainText('--cuttle-accent: #0f766e;');
  });

  test('warns about a color that is hard to read', async ({ page }) => {
    await page.goto(PLAYGROUND);
    await page.getByRole('textbox', { name: 'Accent color', exact: true }).fill('#facc15');
    await expect(page.getByText('hard to read')).toBeVisible();
  });

  test('previews each mode, and uses the dark colors there', async ({ page }) => {
    await page.goto(PLAYGROUND);
    await page.getByRole('textbox', { name: 'Accent color', exact: true }).fill('#0f766e');
    await page.getByRole('radio', { name: 'dark' }).check();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => accent(page)).not.toBe('#0f766e');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 15, 18)');
    await page.getByRole('radio', { name: 'light' }).check();
    await expect.poll(() => accent(page)).toBe('#0f766e');
  });

  test('copies exactly what it shows', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(PLAYGROUND);
    await page.getByRole('button', { name: 'Teal' }).click();
    await page.getByRole('button', { name: 'Copy CSS' }).click();
    await expect(page.getByText('Copied.')).toBeVisible();
    // Windows returns clipboard text with its own line endings.
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    const copied = clipboard.replace(/\r\n/g, '\n');
    const shown = await page.getByLabel('Generated CSS').textContent();
    expect(copied).toBe(shown);
    expect(copied).toContain('--cuttle-accent: #0f766e;');
  });

  test('says so when copying fails', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('blocked')) },
      });
    });
    await page.goto(PLAYGROUND);
    await page.getByRole('button', { name: 'Copy CSS' }).click();
    await expect(page.getByText('Could not copy')).toBeVisible();
  });

  test('leaves no theme behind on other pages', async ({ page }) => {
    await page.goto(PLAYGROUND);
    await page.getByRole('textbox', { name: 'Accent color', exact: true }).fill('#0f766e');
    await page.getByRole('link', { name: 'Tokens' }).click();
    await page.locator('h1', { hasText: 'Tokens' }).waitFor();
    expect(await accent(page)).toBe('#4f46e5');
  });
});

test.describe('live demos', () => {
  test('a Dialog demo opens and closes', async ({ page }) => {
    await page.goto(`${BASE}/components/dialog`);
    await page.getByRole('button', { name: 'Edit profile' }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit profile' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('a Select demo chooses an option', async ({ page }) => {
    await page.goto(`${BASE}/components/select`);
    const trigger = page.getByRole('combobox', { name: 'Fruit' });
    await trigger.click();
    await page.getByRole('option', { name: 'Cherry' }).click();
    await expect(trigger).toHaveText('Cherry');
  });
});
