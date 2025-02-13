import React from 'react';
import { truncate } from 'lodash';
import { defineMessages, FormattedMessage } from 'react-intl';

import type { PayoutMethod } from '../lib/graphql/types/v2/schema';
import { PayoutMethodType } from '../lib/graphql/types/v2/schema';

import { PayoutMethodIcon } from './PayoutMethodIcon';

const MAX_PAYOUT_OPTION_DATA_LENGTH = 20;

export const I18nPayoutMethodLabels = defineMessages({
  [PayoutMethodType.ACCOUNT_BALANCE]: {
    id: 'PayoutMethod.AccountBalance',
    defaultMessage: 'Open Collective (Account Balance)',
  },
  [PayoutMethodType.BANK_ACCOUNT]: {
    id: 'BankAccount',
    defaultMessage: 'Bank account',
  },
  [PayoutMethodType.PAYPAL]: {
    id: 'PayoutMethod.Type.Paypal',
    defaultMessage: 'PayPal',
  },
  [PayoutMethodType.OTHER]: {
    id: 'PayoutMethod.Type.Other',
    defaultMessage: 'Other',
  },
});

type PayoutMethodLabelProps = {
  showIcon?: boolean;
  payoutMethod?: Omit<PayoutMethod, 'id'>;
};

export function PayoutMethodLabel(props: PayoutMethodLabelProps) {
  if (!props.payoutMethod) {
    return null;
  }

  const pm = props.payoutMethod;
  const customLabel = pm.name;
  let defaultLabel: React.ReactNode;

  switch (pm.type) {
    case PayoutMethodType.PAYPAL:
      defaultLabel = pm.data?.email;
      break;
    case PayoutMethodType.ACCOUNT_BALANCE:
      break;
    case PayoutMethodType.BANK_ACCOUNT: {
      if (pm.data?.details?.IBAN) {
        defaultLabel = `IBAN ${pm.data.details.IBAN}`;
      } else if (pm.data?.details?.accountNumber) {
        defaultLabel = `A/N ${pm.data.details.accountNumber}`;
      } else if (pm.data?.details?.clabe) {
        defaultLabel = `Clabe ${pm.data.details.clabe}`;
      } else if (pm.data?.details?.bankgiroNumber) {
        defaultLabel = `Bankgiro ${pm.data.details.bankgiroNumber}`;
      } else if (pm.data?.accountHolderName && pm.data?.currency) {
        defaultLabel = `${pm.data.accountHolderName} (${pm.data.currency})`;
      }
      break;
    }
    case PayoutMethodType.OTHER: {
      const content = truncate(pm.data?.content, { length: MAX_PAYOUT_OPTION_DATA_LENGTH }).replace(/\n|\t/g, ' ');
      if (content) {
        defaultLabel = (
          <span>
            <FormattedMessage {...I18nPayoutMethodLabels[PayoutMethodType.OTHER]} /> - {content}
          </span>
        );
      }
      break;
    }
  }

  if (!defaultLabel) {
    defaultLabel = <FormattedMessage {...I18nPayoutMethodLabels[pm.type]} />;
  }

  return (
    <div className="flex min-h-8 items-center gap-2 whitespace-nowrap">
      {props.showIcon && <PayoutMethodIcon payoutMethod={pm} />}
      {defaultLabel} {customLabel ? <span className="text-muted-foreground">{customLabel}</span> : null}
    </div>
  );
}
