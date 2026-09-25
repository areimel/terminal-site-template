import { test, expect } from './fixtures';

/**
 * /contact form behavior (BRIEF.md, B1's `ContactForm`): validation on an
 * empty submit, and a demo-mode status message when
 * `template.integrations.forms.accessKey` is unset (it is `null` by
 * default in config.yaml).
 *
 * The page currently still renders the pre-Wave-1 `ContactFormFull`
 * component (a bare `<form id="contact-form-full">` with a hidden
 * `access_key` input, no `data-access-key` attribute on the `<form>`
 * itself), so these are `fixme` until B1's replacement lands.
 */

async function skipUntilNewFormExists(page: import('@playwright/test').Page) {
  const form = page.locator('form[data-access-key]');
  test.fixme((await form.count()) === 0, 'ContactForm still uses the old markup (no form[data-access-key])');
  return form;
}

test('submitting the empty form shows validation messages', async ({ page }) => {
  await page.goto('/contact');
  const form = await skipUntilNewFormExists(page);

  await form.locator('button[type="submit"], input[type="submit"]').click();

  await expect(page.locator(':invalid')).not.toHaveCount(0);
});

test('submitting a valid form with no access key shows the demo-mode notice', async ({ page }) => {
  await page.goto('/contact');
  const form = await skipUntilNewFormExists(page);

  await form.locator('input[name="name"]').fill('Ada Operator');
  await form.locator('input[name="email"]').fill('ada@example.com');
  await form.locator('textarea[name="message"]').fill('Hello from the e2e suite.');
  await form.locator('button[type="submit"], input[type="submit"]').click();

  await expect(page.getByText(/demo mode/i)).toBeVisible();
});
