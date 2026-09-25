import { test, expect } from './fixtures';

/**
 * /app keyboard operability (`~/components/navigation/Tabs.astro`'s
 * `<terminal-tabs>`, `~/components/app/NodesPanel.astro`'s health check
 * control, and `~/components/app/RestartNodeModal.astro`).
 *
 * Tabs use "automatic activation": arrow keys move focus *and* select the
 * panel immediately (no Enter/Space needed), matching the WAI-ARIA tabs
 * pattern's automatic-activation variant.
 */

test('Tab reaches the tab list and ArrowRight switches panels', async ({ page }) => {
  await page.goto('/app');

  const processesTab = page.getByRole('tab', { name: /processes/i });
  const jobsTab = page.getByRole('tab', { name: /jobs/i });

  // Tab through the page's own focus order until it lands on the console's first tab.
  let reached = false;
  for (let i = 0; i < 60 && !reached; i++) {
    await page.keyboard.press('Tab');
    reached = await processesTab.evaluate((el) => el === document.activeElement);
  }
  expect(reached, 'expected Tab key traversal to reach the "Processes" tab').toBe(true);
  await expect(processesTab).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('ArrowRight');

  await expect(jobsTab).toBeFocused();
  await expect(jobsTab).toHaveAttribute('aria-selected', 'true');
  await expect(processesTab).toHaveAttribute('aria-selected', 'false');

  const jobsPanel = page.locator(`#${await jobsTab.getAttribute('aria-controls')}`);
  await expect(jobsPanel).toBeVisible();
});

test('Run health check shows a toast confirming the result', async ({ page }) => {
  await page.goto('/app');

  const processesTab = page.getByRole('tab', { name: /processes/i });
  await processesTab.focus();
  await page.keyboard.press('End'); // jumps to and selects the last tab: Nodes

  const nodesTab = page.getByRole('tab', { name: /nodes/i });
  await expect(nodesTab).toHaveAttribute('aria-selected', 'true');

  const healthCheckBtn = page.getByRole('button', { name: /run health check/i });
  await healthCheckBtn.focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('.core-toast-message')).toContainText(/health check passed/i, { timeout: 8000 });
});

test('Restart node opens a confirm dialog and Cancel closes it', async ({ page }) => {
  await page.goto('/app');

  const processesTab = page.getByRole('tab', { name: /processes/i });
  await processesTab.focus();
  await page.keyboard.press('End'); // Nodes tab

  const restartTrigger = page.getByRole('button', { name: /restart node/i }).first();
  await restartTrigger.focus();
  await page.keyboard.press('Enter');

  const dialog = page.locator('dialog#restart-node');
  await expect(dialog).toBeVisible();

  const cancelBtn = dialog.getByRole('button', { name: /cancel/i });
  await cancelBtn.focus();
  await page.keyboard.press('Enter');

  await expect(dialog).not.toBeVisible();
});
