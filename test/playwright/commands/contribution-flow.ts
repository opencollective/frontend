import { Page } from 'playwright/test';

export const checkStepsProgress = async (
  page: Page,
  {
    enabled = [],
    disabled = [],
  }: {
    enabled?: string | string[];
    disabled?: string | string[];
  },
) => {
  const isEnabled = step => page.waitForSelector(`[data-cy="progress-step-${step}"][data-disabled=false]`);
  const isDisabled = step => page.waitForSelector(`[data-cy="progress-step-${step}"][data-disabled=true]`);

  await Promise.all([
    ...(Array.isArray(enabled) ? enabled.map(isEnabled) : [isEnabled(enabled)]),
    ...(Array.isArray(disabled) ? disabled.map(isDisabled) : [isDisabled(disabled)]),
  ]);
};
