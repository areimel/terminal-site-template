import { test, expect } from './fixtures';
import { routes, notFoundProbePath, discoverDetailHref, discoverCategoryHref } from './routes';

/**
 * Baseline smoke test: every route in the spec's route table returns 200,
 * renders a `<main>` landmark, exactly one `<h1>`, a non-empty `<title>`,
 * and produces no console errors or uncaught page errors.
 *
 * `/rss.xml` is not HTML and only gets the status/content-type check.
 * `/404` is exercised by requesting a path that can't match any route.
 */

async function assertHtmlPage(page: import('@playwright/test').Page, consoleErrors: string[]) {
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page).toHaveTitle(/.+/);
  expect(consoleErrors, `console/page errors: ${consoleErrors.join('\n')}`).toEqual([]);
}

for (const route of routes) {
  if (route.dynamic) continue; // handled separately below, path isn't known statically

  if (route.name === 'not-found') {
    test(`${route.name}: unmatched path renders the custom 404`, async ({ page, consoleErrors }) => {
      const response = await page.goto(notFoundProbePath);
      expect(response?.status()).toBe(404);
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page).toHaveTitle(/.+/);
      // The navigation itself is a 404 response, which Chromium logs as a "Failed to load
      // resource: 404" console error for the top-level document -- expected here (that's
      // the whole point of this test), unlike every other route's `assertHtmlPage` check.
      const unexpected = consoleErrors.filter((e) => !/404 \(Not Found\)/.test(e));
      expect(unexpected, `console/page errors: ${unexpected.join('\n')}`).toEqual([]);
    });
    continue;
  }

  if (route.nonHtml) {
    test(`${route.name}: ${route.path}`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
    });
    continue;
  }

  test(`${route.name}: ${route.path}`, async ({ page, consoleErrors }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await assertHtmlPage(page, consoleErrors);
  });
}

test('blog-detail: a real post discovered from /blog', async ({ page, consoleErrors }) => {
  const href = await discoverDetailHref(page, '/blog', '/blog/');
  expect(href, 'expected at least one post link on /blog').toBeTruthy();

  const response = await page.goto(href!);
  expect(response?.status()).toBe(200);
  await assertHtmlPage(page, consoleErrors);
});

test('projects-detail: a real project discovered from /projects', async ({ page, consoleErrors }) => {
  const href = await discoverDetailHref(page, '/projects', '/projects/');
  expect(href, 'expected at least one project link on /projects').toBeTruthy();

  const response = await page.goto(href!);
  expect(response?.status()).toBe(200);
  await assertHtmlPage(page, consoleErrors);
});

test('blog-category: a real category discovered from /blog', async ({ page, consoleErrors }) => {
  const href = await discoverCategoryHref(page, '/blog', '/category/');
  expect(href, 'expected at least one category link on /blog').toBeTruthy();

  const response = await page.goto(href!);
  expect(response?.status()).toBe(200);
  await assertHtmlPage(page, consoleErrors);
});
