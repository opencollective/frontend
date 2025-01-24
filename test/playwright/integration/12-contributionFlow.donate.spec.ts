import { expect, test } from '@playwright/test';

import { signup } from '../commands/authentication';
import { checkStepsProgress } from '../commands/contribution-flow';
import { fillStripeInput } from '../commands/stripe';

test('Can donate as new user', async ({ page }) => {
  const userParams = { name: 'Donate Tester' };
  const user = await signup(page, { redirect: `/apex/donate`, user: userParams });
  // General checks
  await expect(page).toHaveTitle('Contribute to APEX - Open Collective');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/apex\/donate$/);

  // ---- Step Details ----
  // Has default amount selected
  await page.waitForSelector('#amount button.selected');

  // Change amount
  await page.click('[data-cy="amount-picker-btn-other"]');
  await page.fill('input[type=number][name=custom-amount]', '1337');
  await page.waitForSelector('[data-cy="progress-step-details"] :text("1,337.00")');

  // Change frequency - monthly
  await page.click('text="Monthly"');
  await page.waitForSelector('[data-cy="progress-step-details"] :text("1,337.00 USD / mo.")');
  // await page.waitForSelector(':has-text("the next charge will be on July 1, 2042")');

  // Change frequency - yearly
  await page.click('text="Yearly"');
  await page.waitForSelector('[data-cy="progress-step-details"] :text("1,337.00 USD / yr.")');
  await page.waitForSelector('text="Today\'s charge"');
  // await page.waitForSelector(':has-text("the next charge will be on May 1, 2043")');

  // Click the button
  await page.click('button[data-cy="cf-next-step"]');

  // ---- Step profile ----
  await checkStepsProgress(page, { enabled: ['profile', 'details'], disabled: 'payment' });

  // Personal account must be the first entry, and it must be checked
  await page.waitForSelector(`[data-cy="contribute-profile-picker"] :text("${user.collective.name}")`);
  await page.waitForSelector('[data-cy="contribute-profile-picker"] :text("Personal")');
  await page.click('[data-cy="contribute-profile-picker"]');
  await page.waitForSelector(`[data-cy="select-option"]:first-of-type :text("${user.collective.name}")`);
  await page.waitForSelector('[data-cy="select-option"]:first-of-type :text("Personal")');
  await page.keyboard.press('Escape');

  // User profile is shown on step, all other steps must be disabled
  await page.waitForSelector(`[data-cy="progress-step-profile"] :text("${user.collective.name}")`);
  await page.click('button[data-cy="cf-next-step"]');

  // ---- Step Payment ----
  await checkStepsProgress(page, { enabled: ['profile', 'details', 'payment'] });

  // As this is a new account, no payment method is configured yet, so
  // we should have the credit card form selected by default.
  await page.waitForSelector('input[type=checkbox][name=save]:checked', { state: 'hidden' }); // Our checkbox has custom styles and the input is hidden

  // Ensure we display errors
  await fillStripeInput(page, { card: { creditCardNumber: '123' } });
  await page.click('button:has-text("Contribute $1,337")');
  await page.waitForSelector('text="Credit card ZIP code and CVC are required"');

  // Submit with valid credit card
  await fillStripeInput(page);
  await page.click('button:has-text("Contribute $1,337")');
  await page.waitForURL(`**/apex/donate/success**`, { timeout: 10000 });
  await page.waitForSelector('text="You are now supporting APEX."');
});
