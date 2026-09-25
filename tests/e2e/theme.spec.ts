import { test, expect } from './fixtures';

/**
 * Theme persistence: `~/lib/theme-runtime` reads `localStorage['terminal-theme']`
 * before paint (via the inline script in `ThemeHead.astro`) and reflects it
 * as a `theme-<id>` class on `<html>`. See docs/agents/BRIEF.md's "Themes"
 * contract and `src/config.yaml`'s `template.themes.default` (currently `green`).
 */

const DEFAULT_THEME = 'green';

test('applying a theme via localStorage sets the html class before paint', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('terminal-theme', 'amber'));
  await page.goto('/');

  await expect(page.locator('html')).toHaveClass(/theme-amber/);
});

test('a theme set via localStorage persists across navigation', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('terminal-theme', 'amber'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/theme-amber/);

  // Scoped to the sidebar: "Projects" also appears as a homepage CTA and in the footer nav.
  await page.locator('#sidebar-nav').getByRole('link', { name: 'Projects' }).click();
  await expect(page).toHaveURL(/\/projects\/?$/);
  await expect(page.locator('html')).toHaveClass(/theme-amber/);
});

test('an invalid theme id falls back to the default theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('terminal-theme', 'not-a-real-theme'));
  await page.goto('/');

  await expect(page.locator('html')).toHaveClass(new RegExp(`theme-${DEFAULT_THEME}`));
  await expect(page.locator('html')).not.toHaveClass(/theme-not-a-real-theme/);
});

test('applying a theme via the Settings UI', async ({ page }) => {
  await page.goto('/');
  const settingsTrigger = page.locator('[data-modal-open="settings"]');

  test.fixme(
    (await settingsTrigger.count()) === 0,
    'Settings modal trigger ([data-modal-open="settings"]) is not wired up yet -- see B3/lead in BRIEF.md'
  );

  await settingsTrigger.click();
  await page.getByRole('button', { name: /amber/i }).click();
  await expect(page.locator('html')).toHaveClass(/theme-amber/);
});
