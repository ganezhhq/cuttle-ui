import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { expectNoAxeViolations } from './axe';

const URL = '/?view=components';

const open = async (page: Page) => {
  await page.goto(URL);
  const trigger = page.getByRole('button', { name: 'Edit profile' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Edit profile' });
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
};

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test('has no accessibility violations while open', async ({ page }) => {
      await open(page);
      await expectNoAxeViolations(page);
    });

    test('matches the visual snapshot', async ({ page }) => {
      await open(page);
      await expect(page).toHaveScreenshot(`dialog-${colorScheme}.png`, { animations: 'disabled' });
    });
  });
}

test('works right to left', async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
  });
  await expectNoAxeViolations(page);
});

test('is named and described', async ({ page }) => {
  const { dialog } = await open(page);
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog).toHaveAccessibleDescription('Changes apply straight away.');
});

test('moves focus inside and keeps Tab there', async ({ page }) => {
  const { dialog } = await open(page);
  const name = dialog.getByRole('textbox', { name: 'Name' });
  const save = dialog.getByRole('button', { name: 'Save' });
  await expect(name).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(save).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(name).toBeFocused();
});

test('closes on Esc and returns focus', async ({ page }) => {
  const { trigger, dialog } = await open(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('closes on a press outside, but not inside', async ({ page }) => {
  const { dialog } = await open(page);
  await dialog.getByRole('heading', { name: 'Edit profile' }).click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
});

test('closes from a button inside', async ({ page }) => {
  const { trigger, dialog } = await open(page);
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('locks page scroll while open', async ({ page }) => {
  const { dialog } = await open(page);
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('a nested dialog keeps focus, and Esc closes only the top one', async ({ page }) => {
  const { dialog } = await open(page);
  await dialog.getByRole('button', { name: 'Delete profile' }).click();
  const nested = page.getByRole('dialog', { name: 'Delete this profile?' });
  await expect(nested).toBeVisible();
  const cancel = nested.getByRole('button', { name: 'Cancel' });
  await expect(cancel).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(cancel).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(nested).toBeHidden();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Delete profile' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('plays a spring on open and waits for the closing animation', async ({ page }) => {
  const { dialog } = await open(page);
  const animation = await dialog.evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toBe('cuttle-dialog-spring-in');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveAttribute('data-state', 'closed');
  await expect(dialog).toBeHidden();
});

test('closes at once with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { dialog } = await open(page);
  const duration = await dialog.evaluate((element) => getComputedStyle(element).animationDuration);
  expect(duration).toBe('0s');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
