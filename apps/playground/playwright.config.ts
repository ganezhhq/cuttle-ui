import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  // Screenshots differ between operating systems. Baselines are created on Linux,
  // so CI only compares once they have been committed. See tests/README.md.
  ignoreSnapshots: !process.env.VISUAL_SNAPSHOTS,
  use: { baseURL: 'http://localhost:4173', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'pnpm build && pnpm preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
