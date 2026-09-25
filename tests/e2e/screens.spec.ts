import fs from 'node:fs';
import path from 'node:path';

import { test } from '@playwright/test';
import { routes, discoverDetailHref, discoverCategoryHref } from './routes';

/**
 * One-off screenshot capture for lead review: every route, at 360px (mobile) and 1280px
 * (desktop), in the green and amber themes, with reduced motion so the boot screen/CRT/decoder
 * effects don't show up mid-capture.
 *
 * Tagged `@screens` and excluded from the default `pnpm run test:e2e` run via
 * `grepInvert` in `playwright.config.ts`. Run explicitly with:
 *
 *   pnpm exec playwright test tests/e2e/screens.spec.ts --grep @screens --project=chromium
 *
 * Files land at `<OUTPUT_DIR>/<theme>-<width>-<route-slug>.png`.
 */

const OUTPUT_DIR = 'C:/Users/Alec/Documents/Dev/Personal-Repos/terminal-site-template/.playwright-mcp/screens';
const THEMES = ['green', 'amber'] as const;
const WIDTHS = [360, 1280] as const;

interface ScreenRoute {
  path: string;
  slug: string;
}

test('@screens capture every route at 360px/1280px in green/amber', async ({ browser }) => {
  test.setTimeout(10 * 60 * 1000);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const staticRoutes: ScreenRoute[] = routes
    .filter((route) => !route.dynamic && !route.nonHtml)
    .map((route) => ({ path: route.path, slug: route.name }));

  // Discover the dynamic routes' real paths once (theme/viewport don't affect which
  // post/project/category exist), using a throwaway context.
  const discoveryContext = await browser.newContext();
  const discoveryPage = await discoveryContext.newPage();
  const blogHref = await discoverDetailHref(discoveryPage, '/blog', '/blog/');
  const projectHref = await discoverDetailHref(discoveryPage, '/projects', '/projects/');
  const categoryHref = await discoverCategoryHref(discoveryPage, '/blog', '/category/');
  await discoveryContext.close();

  const dynamicRoutes: ScreenRoute[] = [
    blogHref && { path: blogHref, slug: 'blog-detail' },
    projectHref && { path: projectHref, slug: 'projects-detail' },
    categoryHref && { path: categoryHref, slug: 'blog-category' },
  ].filter((route): route is ScreenRoute => Boolean(route));

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: 'reduce',
      });
      await context.addInitScript((id) => localStorage.setItem('terminal-theme', id), theme);
      const page = await context.newPage();

      for (const route of allRoutes) {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle').catch(() => {
          // Some pages (e.g. the shell/log-stream demos) never go fully idle; a timed-out
          // wait here just means the screenshot is taken a little earlier than ideal.
        });
        const filePath = path.join(OUTPUT_DIR, `${theme}-${width}-${route.slug}.png`);
        await page.screenshot({ path: filePath, fullPage: true });
      }

      await context.close();
    }
  }
});
