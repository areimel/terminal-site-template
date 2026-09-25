import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

import { test, expect } from './fixtures';
import { routes, discoverDetailHref } from './routes';

/**
 * Axe scan (wcag2a + wcag2aa) on every built HTML route. Only `serious`/
 * `critical` violations fail the test -- `moderate`/`minor` findings are
 * still visible via the attached JSON so they can be triaged without
 * blocking the suite. Routes not built yet are `test.fixme`.
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

  if (!route.exists) {
    test.fixme(`a11y ${route.name}: ${route.path}`, async () => {});
    continue;
  }

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
