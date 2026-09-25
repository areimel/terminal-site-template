import { test, expect } from './fixtures';

/**
 * `/terminal` (fullscreen `<terminal-shell>`, see BRIEF.md's shell contract)
 * doesn't exist yet -- C1/C2 haven't landed. Each test dynamically checks
 * for the route via a request and marks itself `fixme` until it's built,
 * rather than hard-coding `exists: false` in routes.ts up front (per the
 * task brief: "fixme until /terminal exists -- detect via a request").
 *
 * Selectors below are best-effort against the shell contract in BRIEF.md
 * (a `<terminal-shell>` custom element with a text input and an `aria-live`
 * output log) and may need adjusting once C2's markup lands.
 */

async function skipUntilTerminalExists(request: import('@playwright/test').APIRequestContext) {
  const res = await request.get('/terminal');
  test.fixme(!res.ok(), '/terminal does not exist yet');
}

test('help lists available commands including theme', async ({ page, request }) => {
  await skipUntilTerminalExists(request);

  await page.goto('/terminal');
  const input = page.locator('terminal-shell input');
  await input.fill('help');
  await input.press('Enter');

  await expect(page.locator('terminal-shell')).toContainText(/theme/i);
});

test('theme amber switches the active theme', async ({ page, request }) => {
  await skipUntilTerminalExists(request);

  await page.goto('/terminal');
  const input = page.locator('terminal-shell input');
  await input.fill('theme amber');
  await input.press('Enter');

  await expect(page.locator('html')).toHaveClass(/theme-amber/);
});

test('cd projects navigates to /projects', async ({ page, request }) => {
  await skipUntilTerminalExists(request);

  await page.goto('/terminal');
  const input = page.locator('terminal-shell input');
  await input.fill('cd projects');
  await input.press('Enter');

  await expect(page).toHaveURL(/\/projects\/?$/);
});
