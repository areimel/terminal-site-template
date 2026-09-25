import type { APIRequestContext, Page } from '@playwright/test';

/**
 * One entry per row of the spec's "Routes after the work" table
 * (`docs/superpowers/specs/2026-09-25-terminal-template-design.md`).
 *
 * Wave 3 landed every route in the table, so this list is exhaustive:
 * smoke/a11y specs iterate it directly with no fixme gating.
 */
export interface RouteSpec {
  /** Path used in the report/test title. For `dynamic` routes this is illustrative only. */
  path: string;
  /** Stable test name. */
  name: string;
  /** True for routes whose real path can only be known by discovering it from a listing page. */
  dynamic?: boolean;
  /** True for non-HTML routes (feeds, etc.) that skip the main/h1/title checks. */
  nonHtml?: boolean;
}

export const routes: RouteSpec[] = [
  { path: '/', name: 'home' },
  { path: '/projects', name: 'projects-list' },
  { path: '/projects/:slug', name: 'projects-detail', dynamic: true },
  { path: '/blog', name: 'blog-list' },
  { path: '/blog/:slug', name: 'blog-detail', dynamic: true },
  // `src/config.yaml`'s `template.blog.category.pathname: category` puts this at the site
  // root (`/category/<slug>`), not under `/blog/` -- see `CATEGORY_BASE` in permalinks.ts.
  { path: '/category/:category', name: 'blog-category', dynamic: true },
  { path: '/docs', name: 'docs' },
  { path: '/docs/getting-started', name: 'docs-slug' },
  { path: '/components', name: 'components' },
  { path: '/app', name: 'app' },
  { path: '/terminal', name: 'terminal' },
  { path: '/landing', name: 'landing' },
  { path: '/pricing', name: 'pricing' },
  { path: '/changelog', name: 'changelog' },
  { path: '/contact', name: 'contact' },
  { path: '/now', name: 'now' },
  { path: '/uses', name: 'uses' },
  // Exercised by requesting a path that can't match any route, not by visiting "/404" literally.
  { path: '/404', name: 'not-found' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/rss.xml', name: 'rss', nonHtml: true },
];

/** A path guaranteed not to match any real route, used to trigger the custom 404 page. */
export const notFoundProbePath = '/__e2e-route-that-does-not-exist__';

/**
 * Finds the first same-origin detail-page link on a listing page whose href
 * starts with `prefix` (e.g. `/blog/`), skipping pagination, category and
 * tag links. Used instead of hard-coding a content slug.
 */
export async function discoverDetailHref(page: Page, listPath: string, prefix: string): Promise<string | null> {
  await page.goto(listPath);
  const hrefs = await page.locator(`a[href^="${prefix}"]`).evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  const detail = hrefs.find(
    (href): href is string =>
      !!href &&
      href !== prefix &&
      !href.includes('/category/') &&
      !href.includes('/tag/') &&
      /^\/[a-z0-9/_-]+$/i.test(href) &&
      !/\/\d+$/.test(href) // pagination links like /blog/2
  );
  return detail ?? null;
}

/**
 * Finds the first same-origin category link on a listing page (e.g.
 * `/blog/category/design`), used instead of hard-coding a category slug.
 */
export async function discoverCategoryHref(page: Page, listPath: string, prefix: string): Promise<string | null> {
  await page.goto(listPath);
  const hrefs = await page.locator(`a[href^="${prefix}"]`).evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  return hrefs.find((href): href is string => !!href && href !== prefix) ?? null;
}

/** Same discovery, done over HTTP (no browser) for specs that only need the response. */
export async function discoverDetailHrefViaRequest(
  request: APIRequestContext,
  listPath: string,
  prefix: string
): Promise<string | null> {
  const res = await request.get(listPath);
  if (!res.ok()) return null;
  const html = await res.text();
  const matches = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const detail = matches.find(
    (href) =>
      href.startsWith(prefix) &&
      href !== prefix &&
      !href.includes('/category/') &&
      !href.includes('/tag/') &&
      /^\/[a-z0-9/_-]+$/i.test(href) &&
      !/\/\d+$/.test(href)
  );
  return detail ?? null;
}
