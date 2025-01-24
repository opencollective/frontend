import { expect, test } from '@playwright/test';

test('Can be accessed from "/collective/contribute" (default)', async ({ page }) => {
  await page.goto(`/apex/contribute`);
  await expect(page).toHaveTitle('Contribute to APEX - Open Collective');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/apex\/contribute$/);
});

test('Can be accessed from "/collective/tiers"', async ({ page }) => {
  await page.goto(`/apex/tiers`);
  await expect(page).toHaveTitle('Contribute to APEX - Open Collective');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/apex\/contribute$/);
});
