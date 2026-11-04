import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './axe';

const URL = '/?view=components';

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test('has no accessibility violations', async ({ page }) => {
      await page.goto(URL);
      await expectNoAxeViolations(page);
    });

    test('matches the visual snapshot', async ({ page }) => {
      await page.goto(URL);
      await expect(page.locator('section[aria-labelledby="button"]')).toHaveScreenshot(
        `button-${colorScheme}.png`,
        { animations: 'disabled' },
      );
    });
  });
}

test('works right to left', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
  });
  await expectNoAxeViolations(page);
  const row = page.locator('.demo-row').first();
  const first = await row.getByRole('button', { name: 'solid sm' }).boundingBox();
  const second = await row.getByRole('button', { name: 'outline sm' }).boundingBox();
  expect(first?.x).toBeGreaterThan(second?.x ?? Infinity);
});

test('works with the keyboard', async ({ page }) => {
  await page.goto(`${URL}#button`);
  const button = page.getByRole('button', { name: 'Press me' });
  await button.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(page.getByRole('status', { name: 'Press count' })).toHaveText('2');
});

test('shows a focus ring for keyboard users', async ({ page }) => {
  await page.goto(URL);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'solid sm' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'solid sm' })).toHaveCSS('outline-style', 'solid');
});

test('a loading button stays focusable and is marked busy', async ({ page }) => {
  await page.goto(URL);
  const button = page.getByRole('button', { name: 'Saving', exact: true });
  await button.focus();
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-busy', 'true');
});

test('a disabled link does not navigate', async ({ page }) => {
  await page.goto(URL);
  await page.getByRole('link', { name: 'Disabled link' }).click({ force: true });
  expect(page.url()).not.toContain('#button');
});

test('respects reduced motion on the spinner', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL);
  const animation = await page
    .getByRole('button', { name: 'Saving', exact: true })
    .evaluate((element) => getComputedStyle(element, '::before').animationName);
  expect(animation).toBe('none');
});
