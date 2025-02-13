import React from 'react';
import { CreditCard } from '@styled-icons/fa-solid/CreditCard';
import { find, get, pick, sortBy, uniqBy } from 'lodash';
import { defineMessages, FormattedMessage } from 'react-intl';

import { canContributeRecurring, getCollectivePageMetadata } from '../../lib/collective';
import { CollectiveType } from '../../lib/constants/collectives';
import INTERVALS from '../../lib/constants/intervals';
import {
  GQLV2_SUPPORTED_PAYMENT_METHOD_TYPES,
  PAYMENT_METHOD_SERVICE,
  PAYMENT_METHOD_TYPE,
} from '../../lib/constants/payment-methods';
import { TierTypes } from '../../lib/constants/tiers-types';
import { PaymentMethodService, PaymentMethodType } from '../../lib/graphql/types/v2/schema';
import { getPaymentMethodName } from '../../lib/payment_method_label';
import {
  getPaymentMethodIcon,
  getPaymentMethodMetadata,
  isPaymentMethodDisabled,
} from '../../lib/payment-method-utils';
import { StripePaymentMethodsLabels } from '../../lib/stripe/payment-methods';
import { getWebsiteUrl } from '../../lib/utils';

import CreditCardInactive from '../icons/CreditCardInactive';

export const NEW_CREDIT_CARD_KEY = 'newCreditCard';
export const STRIPE_PAYMENT_ELEMENT_KEY = 'stripe-payment-element';
const PAYPAL_MAX_AMOUNT = 999999999; // See MAX_VALUE_EXCEEDED https://developer.paypal.com/api/rest/reference/orders/v2/errors/#link-createorder

/*
 **Cannot use contributions for events and "Tickets" tiers, because we need the ticket holder's identity
 */
export const canUseIncognitoForContribution = tier => {
  return !tier || tier.type !== 'TICKET';
};

export const generatePaymentMethodOptions = (
  intl,
  paymentMethods,
  stepProfile,
  stepDetails,
  stepSummary,
  collective,
  isEmbed,
  disabledPaymentMethodTypes,
  paymentIntent,
) => {
  const supportedPaymentMethods = get(collective, 'host.supportedPaymentMethods', []);
  const hostHasManual = supportedPaymentMethods.includes(GQLV2_SUPPORTED_PAYMENT_METHOD_TYPES.BANK_TRANSFER);
  const hostHasPaypal = supportedPaymentMethods.includes(GQLV2_SUPPORTED_PAYMENT_METHOD_TYPES.PAYPAL);
  const hostHasStripe = supportedPaymentMethods.includes(GQLV2_SUPPORTED_PAYMENT_METHOD_TYPES.CREDIT_CARD);
  const totalAmount = getTotalAmount(stepDetails, stepSummary);
  const interval = get(stepDetails, 'interval', null);

  const paymentMethodsOptions = paymentMethods.map(pm => ({
    id: pm.id,
    key: `pm-${pm.id}`,
    title: getPaymentMethodName(pm),
    subtitle: getPaymentMethodMetadata(pm, totalAmount),
    icon: getPaymentMethodIcon(pm, pm.account),
    disabled: isPaymentMethodDisabled(pm, totalAmount),
    paymentMethod: pm,
  }));

  let uniquePMs = uniqBy(paymentMethodsOptions, 'id');

  uniquePMs = uniquePMs.filter(
    ({ paymentMethod }) =>
      paymentMethod.type !== PAYMENT_METHOD_TYPE.COLLECTIVE || collective.host.id === stepProfile.host?.id,
  );

  if (paymentIntent) {
    const allowedStripeTypes = [...paymentIntent.payment_method_types];
    if (allowedStripeTypes.includes('card')) {
      allowedStripeTypes.push('creditcard'); // we store this type as creditcard
    }

    uniquePMs = uniquePMs.filter(({ paymentMethod }) => {
      if (paymentMethod.service !== PaymentMethodService.STRIPE) {
        return true;
      }

      return (
        allowedStripeTypes.includes(paymentMethod.type.toLowerCase()) &&
        (!paymentMethod.data?.stripeAccount || paymentMethod.data?.stripeAccount === paymentIntent.stripeAccount)
      );
    });
  } else {
    uniquePMs = uniquePMs.filter(({ paymentMethod }) => {
      if (paymentMethod.service !== PaymentMethodService.STRIPE) {
        return true;
      }

      return paymentMethod.type === PaymentMethodType.CREDITCARD && !paymentMethod.data?.stripeAccount;
    });
  }

  // prepaid budget: limited to a specific host
  const matchesHostCollectiveIdPrepaid = prepaid => {
    const hostCollectiveLegacyId = get(collective, 'host.legacyId');
    const prepaidLimitedToHostCollectiveIds = get(prepaid, 'limitedToHosts');
    if (prepaidLimitedToHostCollectiveIds?.length) {
      return find(prepaidLimitedToHostCollectiveIds, { legacyId: hostCollectiveLegacyId });
    } else {
      return prepaid.data?.HostCollectiveId && prepaid.data.HostCollectiveId === hostCollectiveLegacyId;
    }
  };

  // gift card: can be limited to a specific host, see limitedToHosts
  const matchesHostCollectiveId = giftcard => {
    const hostCollectiveId = get(collective, 'host.id');
    const giftcardLimitedToHostCollectiveIds = get(giftcard, 'limitedToHosts');
    return find(giftcardLimitedToHostCollectiveIds, { id: hostCollectiveId });
  };

  uniquePMs = uniquePMs.filter(({ paymentMethod }) => {
    const sourcePaymentMethod = paymentMethod.sourcePaymentMethod || paymentMethod;
    const sourceType = sourcePaymentMethod.type;

    const isGiftCard = paymentMethod.type === PAYMENT_METHOD_TYPE.GIFTCARD;
    const isSourcePrepaid = sourceType === PAYMENT_METHOD_TYPE.PREPAID;
    const isSourceCreditCard = sourceType === PAYMENT_METHOD_TYPE.CREDITCARD;

    if (disabledPaymentMethodTypes?.includes(paymentMethod.type)) {
      return false;
    } else if (isGiftCard && paymentMethod.limitedToHosts) {
      return matchesHostCollectiveId(paymentMethod);
    } else if (isSourcePrepaid) {
      return matchesHostCollectiveIdPrepaid(sourcePaymentMethod);
    } else if (!hostHasStripe && isSourceCreditCard) {
      return false;
    } else {
      return true;
    }
  });

  // Put disabled PMs at the end
  uniquePMs = sortBy(uniquePMs, ['disabled', 'paymentMethod.providerType', 'id']);

  const balanceOnlyCollectiveTypes = [
    CollectiveType.COLLECTIVE,
    CollectiveType.EVENT,
    CollectiveType.PROJECT,
    CollectiveType.FUND,
  ];

  // adding payment methods
  if (!balanceOnlyCollectiveTypes.includes(stepProfile.type)) {
    if (paymentIntent) {
      let availableMethodLabels = paymentIntent.payment_method_types.map(method => {
        return StripePaymentMethodsLabels[method] ? intl.formatMessage(StripePaymentMethodsLabels[method]) : method;
      });

      if (availableMethodLabels.length > 3) {
        availableMethodLabels = [...availableMethodLabels.slice(0, 3), 'etc'];
      }

      const title = (
        <FormattedMessage
          defaultMessage="New payment method: {methods}"
          id="jwtunf"
          values={{ methods: availableMethodLabels.join(', ') }}
        />
      );

      uniquePMs.unshift({
        key: STRIPE_PAYMENT_ELEMENT_KEY,
        title: title,
        icon: <CreditCard color="#c9ced4" size={'1.5em'} />,
        paymentMethod: {
          service: PAYMENT_METHOD_SERVICE.STRIPE,
          type: PAYMENT_METHOD_TYPE.STRIPE_ELEMENTS,
        },
      });
    }

    const paymentIntentIncludesCard = paymentIntent && paymentIntent.payment_method_types.includes('card');

    if (hostHasStripe && !paymentIntentIncludesCard) {
      // New credit card
      uniquePMs.push({
        key: NEW_CREDIT_CARD_KEY,
        title: <FormattedMessage id="contribute.newcreditcard" defaultMessage="New credit/debit card" />,
        icon: <CreditCardInactive />,
      });
    }

    // Paypal
    if (hostHasPaypal && !disabledPaymentMethodTypes?.includes(PAYMENT_METHOD_TYPE.PAYMENT)) {
      const isDisabled = totalAmount > PAYPAL_MAX_AMOUNT;
      uniquePMs.push({
        key: 'paypal',
        title: 'PayPal',
        disabled: isDisabled,
        subtitle: isDisabled ? 'Maximum amount exceeded' : null,
        paymentMethod: {
          service: PAYMENT_METHOD_SERVICE.PAYPAL,
          type: PAYMENT_METHOD_TYPE.PAYMENT,
        },
        icon: getPaymentMethodIcon({ service: PAYMENT_METHOD_SERVICE.PAYPAL, type: PAYMENT_METHOD_TYPE.PAYMENT }),
      });
    }

    if (
      interval === INTERVALS.oneTime &&
      !isEmbed &&
      supportedPaymentMethods.includes(GQLV2_SUPPORTED_PAYMENT_METHOD_TYPES.ALIPAY) &&
      !disabledPaymentMethodTypes?.includes(PAYMENT_METHOD_TYPE.ALIPAY)
    ) {
      uniquePMs.push({
        key: 'alipay',
        paymentMethod: {
          service: PAYMENT_METHOD_SERVICE.STRIPE,
          type: PAYMENT_METHOD_TYPE.ALIPAY,
        },
        title: <FormattedMessage id="Stripe.PaymentMethod.Label.alipay" defaultMessage="Alipay" />,
        icon: getPaymentMethodIcon({ service: PAYMENT_METHOD_SERVICE.STRIPE, type: PAYMENT_METHOD_TYPE.ALIPAY }),
      });
    }

    // Manual (bank transfer)
    if (
      hostHasManual &&
      stepDetails.interval === INTERVALS.oneTime &&
      !disabledPaymentMethodTypes?.includes(PAYMENT_METHOD_TYPE.MANUAL)
    ) {
      uniquePMs.push({
        key: 'manual',
        title: get(collective, 'host.settings.paymentMethods.manual.title', null) || (
          <FormattedMessage defaultMessage="Bank transfer (manual)" id="ycoJnS" />
        ),
        paymentMethod: {
          service: PAYMENT_METHOD_SERVICE.OPENCOLLECTIVE,
          type: PAYMENT_METHOD_TYPE.MANUAL,
        },
        icon: getPaymentMethodIcon({
          service: PAYMENT_METHOD_SERVICE.OPENCOLLECTIVE,
          type: PAYMENT_METHOD_TYPE.MANUAL,
        }),
        instructions: (
          <FormattedMessage
            id="NewContributionFlow.bankInstructions"
            defaultMessage="Instructions to make a transfer will be given on the next page."
          />
        ),
      });
    }
  }

  return uniquePMs;
};

export const getTotalAmount = (stepDetails, stepSummary = null) => {
  const quantity = get(stepDetails, 'quantity', 1);
  const amount = get(stepDetails, 'amount', 0);
  const taxAmount = get(stepSummary, 'amount', 0);
  const platformFeeAmount = get(stepDetails, 'platformTip', 0);
  return quantity * amount + platformFeeAmount + taxAmount;
};

export const getGQLV2AmountInput = (valueInCents, defaultValue) => {
  if (valueInCents) {
    return { valueInCents };
  } else if (typeof defaultValue === 'number') {
    return { valueInCents: defaultValue };
  } else {
    return defaultValue;
  }
};

const getCanonicalURL = (collective, tier) => {
  if (!tier) {
    return `${getWebsiteUrl()}/${collective.slug}/donate`;
  } else if (collective.type === CollectiveType.EVENT) {
    const parentSlug = get(collective.parent, 'slug', collective.slug);
    return `${getWebsiteUrl()}/${parentSlug}/events/${collective.slug}/order/${tier.id}`;
  } else {
    return `${getWebsiteUrl()}/${collective.slug}/contribute/${tier.slug}-${tier.id}/checkout`;
  }
};

const PAGE_META_MSGS = defineMessages({
  collectiveTitle: {
    id: 'CreateOrder.Title',
    defaultMessage: 'Contribute to {collective}',
  },
  eventTitle: {
    id: 'CreateOrder.TitleForEvent',
    defaultMessage: 'Order tickets for {event}',
  },
});

export const getContributionFlowMetadata = (intl, account, tier) => {
  const baseMetadata = getCollectivePageMetadata(account);
  if (!account) {
    return { ...baseMetadata, title: 'Contribute' };
  }

  return {
    ...baseMetadata,
    canonicalURL: getCanonicalURL(account, tier),
    noRobots: false,
    title:
      account.type === CollectiveType.EVENT
        ? intl.formatMessage(PAGE_META_MSGS.eventTitle, { event: account.name })
        : intl.formatMessage(PAGE_META_MSGS.collectiveTitle, { collective: account.name }),
  };
};

export const isSupportedInterval = (collective, tier, user, interval) => {
  // Interval must be set
  if (!interval) {
    return false;
  }

  // Enforce for fixed interval tiers
  const isFixedInterval = tier?.interval && tier.interval !== INTERVALS.flexible;
  if (isFixedInterval && tier.interval !== interval) {
    return false;
  }

  // If not fixed, one time is always supported
  if (interval === INTERVALS.oneTime) {
    return true;
  }

  // Enforce for recurring
  return canContributeRecurring(collective, user);
};

const getTotalYearlyAmount = stepDetails => {
  const totalAmount = getTotalAmount(stepDetails);
  return totalAmount && stepDetails?.interval === INTERVALS.month ? totalAmount * 12 : totalAmount;
};

/**
 * Get the required information for the current contribution based on Host policies and total contributed to host
 * @returns {{ legalName?: boolean, address?: boolean }}
 */
export const getRequiredInformation = (stepProfile, stepDetails, collective, profiles = [], tier) => {
  let totalAmount = getTotalYearlyAmount(stepDetails);
  let selectedProfile = profiles.find(p => p.account.id === stepProfile?.id);
  if (selectedProfile) {
    // If incognito, use the user individual profile
    if (stepProfile.isIncognito) {
      selectedProfile = profiles[0];
    }
    totalAmount += selectedProfile.totalContributedToHost?.valueInCents || 0;
  }
  const thresholds = collective?.policies?.CONTRIBUTOR_INFO_THRESHOLDS;
  return {
    legalName:
      tier?.requireAddress || tier?.type === TierTypes.TICKET || thresholds?.legalName
        ? totalAmount >= thresholds?.legalName
        : false,
    address: tier?.requireAddress || thresholds?.address ? totalAmount >= thresholds?.address : false,
  };
};

export function getGuestInfoFromStepProfile(stepProfile) {
  return pick(stepProfile, ['email', 'name', 'legalName', 'location', 'captcha']);
}
