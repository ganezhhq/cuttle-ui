import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './axe';

const URL = '/?view=components';
// Floating layers sit at the end of the body, outside the page landmarks, by design.
const FLOATING_LAYER = ['region'];

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test('has no accessibility violations', async ({ page }) => {
      await page.goto(URL);
      await expectNoAxeViolations(page);
    });

    test('has no violations with each overlay open', async ({ page }) => {
      // Contrast is only meaningful once an overlay has finished fading in.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(URL);
      await page.getByRole('button', { name: 'Hover me' }).hover();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await expectNoAxeViolations(page, FLOATING_LAYER);
      await page.getByRole('combobox', { name: 'Fruit' }).click();
      await expect(page.getByRole('listbox')).toBeVisible();
      await expectNoAxeViolations(page, FLOATING_LAYER);
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Open popover' }).click();
      await expect(page.getByRole('dialog', { name: 'Share' })).toBeVisible();
      await expectNoAxeViolations(page, FLOATING_LAYER);
    });

    for (const section of ['forms', 'overlays', 'layout']) {
      test(`${section} matches the visual snapshot`, async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator(`section[aria-labelledby="${section}"]`)).toHaveScreenshot(
          `${section}-${colorScheme}.png`,
          { animations: 'disabled' },
        );
      });
    }
  });
}

test('has no violations right to left, and the switch thumb moves the other way', async ({
  page,
}) => {
  await page.goto(URL);
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
  });
  await expectNoAxeViolations(page);
  const control = page.getByRole('switch', { name: 'Email alerts' });
  const thumb = control.locator('[data-cuttle="switch-thumb"]');
  const before = await thumb.boundingBox();
  await control.click();
  await expect(thumb).toHaveCSS('margin-inline-start', '18px');
  await expect.poll(async () => (await thumb.boundingBox())?.x ?? 0).toBeLessThan(before?.x ?? 0);
});

test.describe('Field', () => {
  test('connects the label, description and error', async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole('textbox', { name: 'Name' })).toHaveAccessibleDescription(
      'As it appears on your account.',
    );
    const email = page.getByRole('textbox', { name: 'Email' });
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription('Enter a valid email address.');
    await email.fill('ada@example.com');
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Enter a valid email address.')).toBeHidden();
  });

  test('focuses the control when its label is pressed', async ({ page }) => {
    await page.goto(URL);
    await page.getByText('Name', { exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeFocused();
  });
});

test('Input shows a shimmer focus ring', async ({ page }) => {
  await page.goto(URL);
  const input = page.getByRole('textbox', { name: 'Name' });
  await input.focus();
  await expect(input).toHaveCSS('outline-style', 'solid');
  await expect(input).toHaveCSS('animation-name', 'cuttle-shimmer-focus');
});

test('Textarea grows with its text', async ({ page }) => {
  await page.goto(URL);
  const textarea = page.getByRole('textbox', { name: 'Bio' });
  const before = (await textarea.boundingBox())?.height ?? 0;
  await textarea.fill('one\ntwo\nthree\nfour\nfive\nsix\nseven\neight');
  await expect
    .poll(async () => (await textarea.boundingBox())?.height ?? 0)
    .toBeGreaterThan(before);
});

test.describe('Checkbox', () => {
  test('toggles with Space and clears indeterminate', async ({ page }) => {
    await page.goto(URL);
    const box = page.getByRole('checkbox', { name: 'Accept terms' });
    await box.focus();
    await page.keyboard.press('Space');
    await expect(box).toBeChecked();
    const some = page.getByRole('checkbox', { name: 'Some items' });
    expect(await some.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(true);
    await some.click();
    await expect(some).toBeChecked();
    expect(await some.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(false);
  });

  test('shows a focus ring on the visible box', async ({ page }) => {
    await page.goto(URL);
    await page.getByRole('checkbox', { name: 'Accept terms' }).focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const box = page.locator('[data-cuttle="checkbox-box"]').first();
    await expect(box).toHaveCSS('outline-style', 'solid');
  });
});

test('RadioGroup moves with the arrow keys and skips disabled options', async ({ page }) => {
  await page.goto(URL);
  const group = page.getByRole('radiogroup', { name: 'Plan' });
  const free = group.getByRole('radio', { name: 'Free' });
  const team = group.getByRole('radio', { name: 'Team' });
  await expect(free).toBeChecked();
  await free.focus();
  await page.keyboard.press('ArrowDown');
  await expect(team).toBeChecked();
  await expect(team).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(free).toBeChecked();
});

test('Switch toggles with Space and Enter', async ({ page }) => {
  await page.goto(URL);
  const control = page.getByRole('switch', { name: 'Email alerts' });
  await control.focus();
  await page.keyboard.press('Space');
  await expect(control).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('Alerts are on.')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(control).toHaveAttribute('aria-checked', 'false');
});

test.describe('Select', () => {
  test('works with the keyboard while focus stays on the trigger', async ({ page }) => {
    await page.goto(URL);
    const trigger = page.getByRole('combobox', { name: 'Fruit' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.getByRole('option', { name: 'Apple' })).toHaveAttribute(
      'data-highlighted',
      '',
    );
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Cherry' })).toHaveAttribute(
      'data-highlighted',
      '',
    );
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(trigger).toHaveText('Cherry');
    await expect(trigger).toBeFocused();
  });

  test('selects with a press, and closes on an outside press', async ({ page }) => {
    await page.goto(URL);
    const trigger = page.getByRole('combobox', { name: 'Fruit' });
    await trigger.click();
    await page.getByRole('option', { name: 'Date' }).click();
    await expect(trigger).toHaveText('Date');
    await trigger.click();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(trigger).toHaveText('Date');
  });

  test('sits under its trigger', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(URL);
    const trigger = page.getByRole('combobox', { name: 'Fruit' });
    await trigger.click();
    const list = page.getByRole('listbox');
    await expect(list).toBeVisible();
    await expect(list).toHaveAttribute('data-placement', /.+/);
    const a = await trigger.boundingBox();
    const b = await list.boundingBox();
    expect(Math.abs((b?.x ?? 0) - (a?.x ?? 0))).toBeLessThan(2);
    expect(b?.width ?? 0).toBeGreaterThanOrEqual((a?.width ?? 0) - 1);
  });
});

test.describe('Popover', () => {
  test('moves focus in, and Esc returns it', async ({ page }) => {
    await page.goto(URL);
    const trigger = page.getByRole('button', { name: 'Open popover' });
    await trigger.click();
    const panel = page.getByRole('dialog', { name: 'Share' });
    await expect(panel.getByRole('textbox', { name: 'Link' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('closes when Tab leaves it, or on an outside press', async ({ page }) => {
    await page.goto(URL);
    const trigger = page.getByRole('button', { name: 'Open popover' });
    await trigger.click();
    const panel = page.getByRole('dialog', { name: 'Share' });
    await page.keyboard.press('Tab');
    await expect(panel.getByRole('button', { name: 'Done' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(panel).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(panel).toBeHidden();
  });
});

test.describe('Tooltip', () => {
  test('shows on hover and stays while the pointer is over it', async ({ page }) => {
    await page.goto(URL);
    const trigger = page.getByRole('button', { name: 'Hover me' });
    await trigger.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await expect(trigger).toHaveAccessibleDescription('Saves your work');
    await tooltip.hover();
    await page.waitForTimeout(200);
    await expect(tooltip).toBeVisible();
    await page.mouse.move(5, 5);
    await expect(tooltip).toBeHidden();
  });

  test('shows on focus and hides on Esc', async ({ page }) => {
    await page.goto(URL);
    const trigger = page.getByRole('button', { name: 'Hover me' });
    await trigger.focus();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tooltip).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe('overlays inside a Dialog', () => {
  test('Esc closes only the Select, then the Dialog', async ({ page }) => {
    await page.goto(URL);
    await page.getByRole('button', { name: 'Overlays in a dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Overlays in a dialog' });
    const trigger = dialog.getByRole('combobox', { name: 'Dialog fruit' });
    await expect(trigger).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('a Popover keeps focus, and its option is pressable', async ({ page }) => {
    await page.goto(URL);
    await page.getByRole('button', { name: 'Overlays in a dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Overlays in a dialog' });
    await dialog.getByRole('button', { name: 'Inner popover' }).click();
    const inner = page.getByRole('button', { name: 'Inner action' });
    await expect(inner).toBeFocused();
    await inner.click();
    await expect(inner).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(inner).toBeHidden();
    await expect(dialog).toBeVisible();
  });

  test('a Select option can be chosen with a press', async ({ page }) => {
    await page.goto(URL);
    await page.getByRole('button', { name: 'Overlays in a dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Overlays in a dialog' });
    const trigger = dialog.getByRole('combobox', { name: 'Dialog fruit' });
    await trigger.click();
    await page.getByRole('option', { name: 'Date' }).click();
    await expect(trigger).toHaveText('Date');
    await expect(dialog).toBeVisible();
  });
});

test('overlays skip their animation with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL);
  await page.getByRole('combobox', { name: 'Fruit' }).click();
  const duration = await page
    .getByRole('listbox')
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(duration).toBe('0s');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
});
