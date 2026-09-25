import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for the terminal site template.
 *
 * Reduced motion is emulated by default so the boot screen, CRT overlay and
 * decoder effects (all gated through `~/lib/effects`) don't interfere with
 * unrelated assertions. Specs that need to exercise those effects override
 * `reducedMotion` per-test or per-project.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4321',
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'pnpm run build && pnpm run preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
