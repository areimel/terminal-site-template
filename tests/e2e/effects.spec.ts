import { test, expect } from './fixtures';

/**
 * Effects gating: `~/lib/effects` resolves config defaults + `localStorage['terminal-effects']`
 * overrides + OS reduced-motion into `<html data-fx-<name>="on|off">`, applied
 * before paint by the inline script in `ThemeHead.astro`. CSS in the same
 * component hides `.terminal-overlay .noise/.scanline/.overlay` when their
 * attribute is "off".
 *
 * `effectNames` is duplicated here (rather than imported from `~/lib/effects`)
 * because that module imports the `astrowind:config` virtual module, which
 * only resolves inside Astro's own build -- not Playwright's Node runtime.
 * Keep this in sync with `EffectName` in `src/lib/effects.ts` per BRIEF.md.
 */
const effectNames = ['boot', 'noise', 'scanline', 'overlay', 'decoder'] as const;

test('disabling an effect via localStorage reflects on <html> and hides its overlay element', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('terminal-effects', JSON.stringify({ noise: false })));
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-fx-noise', 'off');
  await expect(page.locator('.terminal-overlay .noise')).toBeHidden();
});

test('OS-level reduced motion forces every effect off', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  // Make sure no leftover override could keep an effect on regardless of reduced motion.
  await page.addInitScript(() => localStorage.removeItem('terminal-effects'));
  await page.goto('/');

  for (const name of effectNames) {
    await expect(page.locator('html')).toHaveAttribute(`data-fx-${name}`, 'off');
  }

  await context.close();
});
