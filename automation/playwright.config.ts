import { defineConfig, devices } from '@playwright/test';

/**
 * PostQode Nexus — UI E2E configuration.
 * Conventions: .postqode/rules/ui-automation-playwright.md
 * Test catalogue: docs/e2e-test-cases.md (branch feature/e2e-test-cases)
 *
 * Defaults: PARALLEL workers, HEADED Chrome, Allure results.
 * The Allure report is NEVER opened automatically — run `npm run report`
 * (scripts/open-allure-report.sh) after a run to view it.
 */
export default defineConfig({
  testDir: './ui-tests',
  testIgnore: ['**/pages/**', '**/fixtures/**'],
  fullyParallel: true,
  workers: process.env.CI ? 4 : 3,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    channel: 'chrome',
    headless: false, // headed runs by default; CI may override via env
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
