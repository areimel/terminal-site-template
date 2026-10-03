import { test, expect } from './fixtures';

/**
 * /contact form behavior (`~/components/forms/ContactForm.astro`, built on
 * `Form` + `~/lib/forms.ts`): validation on an empty submit, and a
 * demo-mode status message when `template.integrations.forms.accessKey` is
 * unset (it is `null` by default in config.yaml).
 */

test('submitting the empty form shows validation messages', async ({ page }) => {
  await page.goto('/contact');
  const form = page.locator('form[data-provider="true"]');

  await form.locator('button[type="submit"]').click();

  // The browser's own constraint validation intercepts the submit before the `submit` event
  // (and this form's custom handler in `~/lib/forms.ts`) ever fires, so it's the native
  // validation UI that's exercised here: the first required, empty field is marked `:invalid`
  // and receives focus.
  await expect(page.locator(':invalid')).not.toHaveCount(0);
  await expect(form.locator('input[name="name"]')).toBeFocused();
});

test('submitting a valid form with no access key shows the demo-mode notice', async ({ page }) => {
  await page.goto('/contact');
  const form = page.locator('form[data-provider="true"]');

  await form.locator('input[name="name"]').fill('Field Agent');
  await form.locator('input[name="email"]').fill('agent@example.com');
  await form.locator('textarea[name="message"]').fill('Hello from the e2e suite.');
  await form.locator('button[type="submit"]').click();

  await expect(form.locator('[data-form-status]')).toContainText(/demo mode/i);
});
