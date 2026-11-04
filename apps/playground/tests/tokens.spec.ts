import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { expectNoAxeViolations } from './axe';

const token = (page: Page, name: string) =>
  page.evaluate(
    (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim(),
    name,
  );

test.describe('light system preference', () => {
  test.use({ colorScheme: 'light' });

  test('uses light tokens and the dark override applies', async ({ page }) => {
    await page.goto('/');
    expect(await token(page, '--cuttle-accent')).toBe('#4f46e5');
    await page.getByRole('button', { name: 'dark' }).click();
    expect(await token(page, '--cuttle-accent')).toBe('#818cf8');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 15, 18)');
  });

  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await expectNoAxeViolations(page);
  });
});

test.describe('dark system preference', () => {
  test.use({ colorScheme: 'dark' });

  test('uses dark tokens and the light override applies', async ({ page }) => {
    await page.goto('/');
    expect(await token(page, '--cuttle-accent')).toBe('#818cf8');
    await page.getByRole('button', { name: 'light' }).click();
    expect(await token(page, '--cuttle-accent')).toBe('#4f46e5');
  });

  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await expectNoAxeViolations(page);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('zeroes motion tokens', async ({ page }) => {
    await page.goto('/');
    expect(await token(page, '--cuttle-duration')).toBe('0ms');
  });
});

test('matches the visual snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('tokens.png', { fullPage: true });
});
