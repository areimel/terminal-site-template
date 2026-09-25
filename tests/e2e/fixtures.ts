import { test as base, expect } from '@playwright/test';

/**
 * `consoleErrors` collects `console.error` messages and uncaught page
 * errors for the lifetime of a test's `page`. Specs assert it's empty at
 * the end of a test rather than wiring up listeners by hand each time.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await use(errors);
  },
});

export { expect };
