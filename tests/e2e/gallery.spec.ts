import { test, expect } from './fixtures';

/**
 * /components (`src/pages/components.astro`): auto-discovers one section per
 * `src/components/<group>/_demo/<Group>Demo.astro`, each rendered as
 * `<section id="<group>">` by `~/components/gallery/GroupSection.astro`. The
 * Palette section (`~/components/gallery/Palette.astro`) reads swatch colors
 * live from `--theme-*` CSS vars, so switching the theme re-colors them with
 * no client script of its own.
 */

const GROUPS = ['core', 'content', 'media', 'effects', 'forms', 'feedback', 'data', 'navigation', 'sections', 'shell'];

test('renders a section per component group', async ({ page }) => {
  await page.goto('/components');

  for (const group of GROUPS) {
    await expect(page.locator(`section#${group}`)).toBeVisible();
  }
});

test('switching theme updates a swatch computed background color', async ({ page }) => {
  await page.goto('/components');

  const swatch = page.locator('#palette span[style*="--theme-500"]').first();
  await expect(swatch).toBeVisible();
  const before = await swatch.evaluate((el) => getComputedStyle(el).backgroundColor);

  await page
    .locator('#palette')
    .getByRole('radiogroup', { name: 'Terminal theme' })
    .getByRole('radio', { name: 'Hacker Red' })
    .click();

  await expect(page.locator('html')).toHaveClass(/theme-red/);
  await expect.poll(async () => swatch.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
});
