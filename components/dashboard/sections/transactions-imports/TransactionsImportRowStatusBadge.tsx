import React from 'react';
import { useIntl } from 'react-intl';

import type { TransactionsImportRow } from '../../../../lib/graphql/types/v2/schema';
import { TransactionsImportRowStatus } from '../../../../lib/graphql/types/v2/schema';
import { i18nTransactionsRowStatus } from '../../../../lib/i18n/transactions-import-row';

import { Badge } from '../../../ui/Badge';

export const TransactionsImportRowStatusBadge = ({
  row,
}: {
  row: Pick<TransactionsImportRow, 'status'> & {
    expense?: Pick<TransactionsImportRow['expense'], 'id'> | null | undefined;
    order?: Pick<TransactionsImportRow['order'], 'id'> | null | undefined;
  };
}) => {
  const intl = useIntl();
  if (row.status === TransactionsImportRowStatus.IGNORED) {
    return (
      <Badge className="whitespace-nowrap" size="sm">
        {i18nTransactionsRowStatus(intl, 'IGNORED')}
      </Badge>
    );
  } else if (row.expense || row.order) {
    return (
      <Badge type="success" size="sm">
        {i18nTransactionsRowStatus(intl, 'LINKED')}
      </Badge>
    );
  } else if (row.status === TransactionsImportRowStatus.ON_HOLD) {
    return (
      <Badge type="warning" size="sm">
        {i18nTransactionsRowStatus(intl, 'ON_HOLD')}
      </Badge>
    );
  } else {
    return (
      <Badge type="info" size="sm">
        {i18nTransactionsRowStatus(intl, 'PENDING')}
      </Badge>
    );
  }
};
