import { test, expect } from './fixtures';
import { routes } from './routes';

/**
 * No page may scroll horizontally on a small phone. Long words in the wide display font,
 * hidden tooltips and fixed-width ASCII art have all caused this before.
 */
for (const width of [320, 360]) {
  test.describe(`no horizontal overflow at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const route of routes) {
      if (route.dynamic || route.nonHtml || route.name === 'not-found') continue;

      test(`${route.name}: ${route.path}`, async ({ page }) => {
        await page.goto(route.path);
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, `page is ${scrollWidth - clientWidth}px wider than the viewport`).toBeLessThanOrEqual(
          clientWidth + 1
        );
      });
    }
  });
}
