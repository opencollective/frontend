import { Page } from 'playwright/test';

import { CreditCards } from '../../stripe-helpers';

type FillStripeInputOptions = {
  card?: {
    creditCardNumber?: string;
    expirationDate?: string;
    cvcCode?: string;
    postalCode?: string;
  };
};

export const fillStripeInput = async (page: Page, { card = CreditCards.CARD_DEFAULT }: FillStripeInputOptions = {}) => {
  const stripeIframeSelector = '.__PrivateStripeElement iframe';
  const stripeFrame = page.frameLocator(stripeIframeSelector).first();
  card.creditCardNumber && (await stripeFrame.locator('[placeholder="Card number"]').fill(card.creditCardNumber));
  card.expirationDate && (await stripeFrame.locator('[placeholder="MM / YY"]').fill(card.expirationDate));
  card.cvcCode && (await stripeFrame.locator('[placeholder="CVC"]').fill(card.cvcCode));
  card.postalCode && (await stripeFrame.locator('[placeholder="ZIP"]').fill(card.postalCode));
};
