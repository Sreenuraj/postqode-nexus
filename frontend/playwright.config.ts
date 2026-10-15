import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for WebMCP E2E Testing
 * Specification: https://developer.chrome.com/docs/ai/webmcp
 */
const slowMo = process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 0;

export default defineConfig({
  testDir: './e2e',
  timeout: slowMo > 0 ? 60000 : 30000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-webmcp',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo,
          args: [
            '--enable-features=WebMCPTesting',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        },
      },
    },
  ],
});
