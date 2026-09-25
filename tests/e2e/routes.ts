import type { APIRequestContext, Page } from '@playwright/test';

/**
 * One entry per row of the spec's "Routes after the work" table
 * (`docs/superpowers/specs/2026-09-25-terminal-template-design.md`).
 *
 * `exists` reflects what is actually built in *this* worktree right now,
 * not the final state of the template. Routes owned by later waves are
 * `exists: false` so smoke/a11y specs can `test.fixme` them instead of
 * failing on work nobody has done yet. Flip an entry to `true` as its page
 * lands.
 */
export interface RouteSpec {
  /** Path used in the report/test title. For `dynamic` routes this is illustrative only. */
  path: string;
  /** Stable test name. */
  name: string;
  /** Whether the route is reachable in the current build. */
  exists: boolean;
  /** True for routes whose real path can only be known by discovering it from a listing page. */
  dynamic?: boolean;
  /** True for non-HTML routes (feeds, etc.) that skip the main/h1/title checks. */
  nonHtml?: boolean;
}

export const routes: RouteSpec[] = [
  { path: '/', name: 'home', exists: true },
  { path: '/projects', name: 'projects-list', exists: true },
  { path: '/projects/:slug', name: 'projects-detail', exists: true, dynamic: true },
  { path: '/blog', name: 'blog-list', exists: true },
  { path: '/blog/:slug', name: 'blog-detail', exists: true, dynamic: true },
  // No content currently sets a `category`, so no category page is actually generated.
  { path: '/blog/category/:category', name: 'blog-category', exists: false },
  { path: '/docs', name: 'docs', exists: false },
  { path: '/components', name: 'components', exists: false },
  { path: '/app', name: 'app', exists: false },
  { path: '/terminal', name: 'terminal', exists: false },
  { path: '/landing', name: 'landing', exists: false },
  { path: '/pricing', name: 'pricing', exists: false },
  { path: '/changelog', name: 'changelog', exists: false },
  { path: '/contact', name: 'contact', exists: true },
  { path: '/now', name: 'now', exists: false },
  { path: '/uses', name: 'uses', exists: false },
  // Exercised by requesting a path that can't match any route, not by visiting "/404" literally.
  { path: '/404', name: 'not-found', exists: true },
  { path: '/privacy', name: 'privacy', exists: true },
  { path: '/terms', name: 'terms', exists: true },
  { path: '/rss.xml', name: 'rss', exists: true, nonHtml: true },
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
