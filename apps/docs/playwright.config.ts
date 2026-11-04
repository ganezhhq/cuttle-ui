import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  use: { baseURL: 'http://localhost:4174', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'pnpm build && pnpm preview --port 4174',
    url: 'http://localhost:4174/cuttle-ui/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
