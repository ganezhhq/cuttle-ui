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
export async function expectNoAxeViolations(
  page: Page,
  disabledRules: string[] = [],
): Promise<void> {
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async (rules) => {
    const { axe } = window as unknown as {
      axe: {
        run: (options: {
          rules: Record<string, { enabled: boolean }>;
        }) => Promise<{ violations: AxeViolation[] }>;
      };
    };
    const options = Object.fromEntries(rules.map((rule) => [rule, { enabled: false }]));
    return (await axe.run({ rules: options })).violations;
  }, disabledRules);
  expect(violations.map((v) => `${v.id}: ${v.help} ${JSON.stringify(v.nodes[0]?.target)}`)).toEqual(
    [],
  );
}
