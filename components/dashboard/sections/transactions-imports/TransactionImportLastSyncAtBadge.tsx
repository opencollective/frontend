import React from 'react';
import { RefreshCw } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import type { TransactionsImport } from '@/lib/graphql/types/v2/schema';

import DateTime from '@/components/DateTime';
import { Badge } from '@/components/ui/Badge';

export const TransactionImportLastSyncAtBadge = ({
  transactionsImport,
}: {
  transactionsImport: Pick<TransactionsImport, 'isSyncing' | 'lastSyncAt'> & {
    connectedAccount?: Pick<TransactionsImport['connectedAccount'], 'id'>;
  };
}) => {
  const intl = useIntl();
  if (transactionsImport.isSyncing || (!transactionsImport.lastSyncAt && transactionsImport.connectedAccount)) {
    return (
      <Badge type="info" className="whitespace-nowrap">
        {intl.formatMessage({ defaultMessage: 'In progress', id: 'syncInProgress' })}&nbsp;
        <RefreshCw size={12} className="animate-spin duration-1500" />
      </Badge>
    );
  } else if (transactionsImport.lastSyncAt) {
    return <DateTime value={new Date(transactionsImport.lastSyncAt)} timeStyle="short" />;
  } else {
    return <FormattedMessage defaultMessage="Never" id="du1laW" />;
  }
};
