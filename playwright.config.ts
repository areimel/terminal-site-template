import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for the ARDA Terminal Framework.
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
  // `screens.spec.ts` (`@screens`) is a one-off screenshot capture for lead review, not part
  // of the regular suite: excluded by default. `grepInvert` and the CLI's own `--grep` both
  // have to match for a test to run, so excluding `@screens` here would make `--grep @screens`
  // (the way to run it on demand) match nothing; INCLUDE_SCREENS lifts the exclusion instead.
  // Run it with: `INCLUDE_SCREENS=1 pnpm exec playwright test --grep @screens`.
  grepInvert: process.env.INCLUDE_SCREENS ? undefined : /@screens/,
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
