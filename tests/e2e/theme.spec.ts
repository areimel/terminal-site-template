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

  // Scoped to the sidebar (SidebarNav.astro's `<nav aria-label="Primary">`): "Projects" also
  // appears as a homepage CTA and in the footer nav.
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Projects' }).click();
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

  await settingsTrigger.click();
  const dialog = page.locator('dialog#settings');
  await expect(dialog).toBeVisible();

  await page.getByRole('radiogroup', { name: 'Terminal theme' }).getByRole('radio', { name: 'Cozy Amber' }).click();
  await expect(page.locator('html')).toHaveClass(/theme-amber/);
});

test('Esc closes the Settings modal and returns focus to the trigger', async ({ page }) => {
  await page.goto('/');
  const settingsTrigger = page.locator('[data-modal-open="settings"]');

  await settingsTrigger.click();
  const dialog = page.locator('dialog#settings');
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(settingsTrigger).toBeFocused();
});
