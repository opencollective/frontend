import { Page } from 'playwright/test';

export const mockNow = async (page: Page, now: number) => {
  await page.addInitScript(`{
    // Extend Date constructor to default to now
    Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          super(${now});
        } else {
          super(...args);
        }
      }
    }
    
    // Override Date.now() to start from now
    Date.__DateNowOffset = ${now} - Date.now();
    Date.__originalDateNow = Date.now;
    Date.now = () => Date.__originalDateNow() + Date.__DateNowOffset;
  }`);
};

export const restoreNow = async (page: Page) => {
  await page.evaluate(`
    Date.now = Date.__originalDateNow;
    delete Date.__originalDateNow;
    delete Date.__DateNowOffset;
  `);
};
