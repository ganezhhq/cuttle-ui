import { createRequire } from 'node:module';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

interface AxeViolation {
  id: string;
  help: string;
  nodes: Array<{ target: unknown }>;
}

/** Runs axe-core on the current page and fails the test on any violation. */
export async function expectNoAxeViolations(page: Page): Promise<void> {
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => {
    const { axe } = window as unknown as {
      axe: { run: () => Promise<{ violations: AxeViolation[] }> };
    };
    return (await axe.run()).violations;
  });
  expect(violations.map((v) => `${v.id}: ${v.help} ${JSON.stringify(v.nodes[0]?.target)}`)).toEqual(
    [],
  );
}
