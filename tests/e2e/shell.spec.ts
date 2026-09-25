import { test, expect } from './fixtures';

/**
 * `/terminal` renders a fullscreen `<terminal-shell>` custom element (see
 * `src/components/shell/TerminalShell.astro`): a `.terminal-shell-input`
 * text input, a `role="log"` `aria-live` output, and a builtins set from
 * `src/lib/shell/builtins.ts` (help, ls, cd, open, theme, effects, clear,
 * whoami, echo, date, history).
 */

test('help lists available commands', async ({ page }) => {
  await page.goto('/terminal');
  const input = page.locator('.terminal-shell-input');
  await input.fill('help');
  await input.press('Enter');

  const output = page.locator('.terminal-shell-output');
  await expect(output).toContainText('Available commands:');
  await expect(output).toContainText('theme');
  await expect(output).toContainText('cd');
  await expect(output).toContainText('whoami');
});

test('theme amber switches the active theme and prints confirmation', async ({ page }) => {
  await page.goto('/terminal');
  const input = page.locator('.terminal-shell-input');
  await input.fill('theme amber');
  await input.press('Enter');

  await expect(page.locator('html')).toHaveClass(/theme-amber/);
  await expect(page.locator('.terminal-shell-output')).toContainText('Theme set to amber.');
});

test('Tab completes a partial route alias', async ({ page }) => {
  await page.goto('/terminal');
  const input = page.locator('.terminal-shell-input');
  await input.fill('cd pro');
  await input.press('Tab');

  await expect(input).toHaveValue('cd projects ');
});

test('cd projects navigates to /projects', async ({ page }) => {
  await page.goto('/terminal');
  const input = page.locator('.terminal-shell-input');
  await input.fill('cd projects');
  await input.press('Enter');

  await expect(page).toHaveURL(/\/projects\/?$/);
});
