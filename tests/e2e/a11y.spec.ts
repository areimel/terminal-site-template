import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

import { test, expect } from './fixtures';
import { routes, discoverDetailHref, discoverCategoryHref } from './routes';

/**
 * Axe scan (wcag2a + wcag2aa) on every built HTML route. Only `serious`/
 * `critical` violations fail the test -- `moderate`/`minor` findings are
 * still visible via the attached JSON so they can be triaged without
 * blocking the suite.
 */

async function runAxe(page: Page, testInfo: TestInfo) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

  await testInfo.attach('axe-results.json', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });

  const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(blocking, blocking.map((v) => `${v.id} (${v.impact}): ${v.help}`).join('\n')).toEqual([]);
}

for (const route of routes) {
  if (route.dynamic || route.nonHtml) continue;

  test(`a11y ${route.name}: ${route.path}`, async ({ page }, testInfo) => {
    await page.goto(route.path);
    await runAxe(page, testInfo);
  });
}

test('a11y blog-detail: a real post discovered from /blog', async ({ page }, testInfo) => {
  const href = await discoverDetailHref(page, '/blog', '/blog/');
  expect(href, 'expected at least one post link on /blog').toBeTruthy();
  await page.goto(href!);
  await runAxe(page, testInfo);
});

test('a11y projects-detail: a real project discovered from /projects', async ({ page }, testInfo) => {
  const href = await discoverDetailHref(page, '/projects', '/projects/');
  expect(href, 'expected at least one project link on /projects').toBeTruthy();
  await page.goto(href!);
  await runAxe(page, testInfo);
});

test('a11y blog-category: a real category discovered from /blog', async ({ page }, testInfo) => {
  const href = await discoverCategoryHref(page, '/blog', '/category/');
  expect(href, 'expected at least one category link on /blog').toBeTruthy();
  await page.goto(href!);
  await runAxe(page, testInfo);
});

/**
 * Per-theme sweep: axe already covers the default (green) theme above, but each theme's
 * palette (`~/lib/themes`) has its own foreground/background combinations, so a violation
 * that's specific to one theme's colors (not the markup) wouldn't show up otherwise. Covers
 * the three routes the spec calls out (`/`, `/components`, `/app`) for all 5 themes.
 */
const THEME_IDS = ['green', 'amber', 'red', 'yellow', 'blue'];
const THEME_SWEEP_ROUTES = ['/', '/components', '/app'];

for (const themeId of THEME_IDS) {
  for (const path of THEME_SWEEP_ROUTES) {
    test(`a11y theme=${themeId} ${path}`, async ({ page }, testInfo) => {
      await page.addInitScript((id) => localStorage.setItem('terminal-theme', id), themeId);
      await page.goto(path);
      await expect(page.locator('html')).toHaveClass(new RegExp(`theme-${themeId}`));
      await runAxe(page, testInfo);
    });
  }
}
