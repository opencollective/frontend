import React from 'react';
import { useQuery } from '@apollo/client';
import { FileUp, Landmark, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/router';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { integer } from '../../../../lib/filters/schemas';
import { API_V2_CONTEXT } from '../../../../lib/graphql/helpers';
import type { TransactionsImport } from '../../../../lib/graphql/types/v2/schema';
import useLoggedInUser from '../../../../lib/hooks/useLoggedInUser';
import { usePlaidConnectDialog } from '../../../../lib/hooks/usePlaidConnectDialog';
import useQueryFilter from '../../../../lib/hooks/useQueryFilter';
import { i18nTransactionsImportType } from '../../../../lib/i18n/transactions-import';
import { capitalize } from '../../../../lib/utils';
import { transactionsImportsQuery } from './lib/graphql';

import DateTime from '../../../DateTime';
import MessageBoxGraphqlError from '../../../MessageBoxGraphqlError';
import { DataTable } from '../../../table/DataTable';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { useToast } from '../../../ui/useToast';
import DashboardHeader from '../../DashboardHeader';
import { Pagination } from '../../filters/Pagination';

import { ImportProgressBadge } from './ImportProgressBadge';
import { NewCSVTransactionsImportDialog } from './NewCSVTransactionsImportDialog';
import { TransactionImportLastSyncAtBadge } from './TransactionImportLastSyncAtBadge';

const NB_IMPORTS_DISPLAYED = 20;

const schema = z.object({
  limit: integer.default(NB_IMPORTS_DISPLAYED),
  offset: integer.default(0),
});

export const TransactionsImportsTable = ({ accountSlug }) => {
  const intl = useIntl();
  const { toast } = useToast();
  const { LoggedInUser } = useLoggedInUser();
  const [hasNewImportDialog, setHasNewImportDialog] = React.useState(false);
  const router = useRouter();
  const queryFilter = useQueryFilter({ schema, filters: {} });
  const { data, loading, refetch, error } = useQuery(transactionsImportsQuery, {
    context: API_V2_CONTEXT,
    variables: { accountSlug, ...queryFilter.variables },
  });
  const onPlaidConnectSuccess = React.useCallback(
    async ({ transactionsImport }) => {
      refetch();
      toast({
        variant: 'success',
        title: intl.formatMessage({ defaultMessage: 'Bank account connected', id: 'fGNAg9' }),
        message: intl.formatMessage({
          defaultMessage: 'It might take a few minutes to import your transactions.',
          id: 'YZGI7N',
        }),
      });
      router.push(`/dashboard/${accountSlug}/host-transactions/import/${transactionsImport.id}?step=last`);
    },
    [intl, toast, accountSlug, refetch, router],
  );
  const plaidConnectDialog = usePlaidConnectDialog({ host: data?.host, onSuccess: onPlaidConnectSuccess });

  return (
    <div>
      <DashboardHeader
        title="Transactions"
        titleRoute={`/dashboard/${accountSlug}/host-transactions`}
        subpathTitle="Imports"
        className="mb-5"
        actions={
          <React.Fragment>
            {LoggedInUser.hasPreviewFeatureEnabled('PLAID_INTEGRATION') && (
              <Button
                size="sm"
                variant="outline"
                onClick={plaidConnectDialog.show}
                disabled={plaidConnectDialog.status !== 'idle'}
                loading={plaidConnectDialog.status === 'loading'}
              >
                <Landmark size={16} />
                <FormattedMessage defaultMessage="Connect Bank Account" id="2Le983" />
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setHasNewImportDialog(true)}>
              <FileUp size={16} />
              <FormattedMessage defaultMessage="Import CSV" id="2uzHxT" />
            </Button>
          </React.Fragment>
        }
      />
      {error ? (
        <MessageBoxGraphqlError error={error} />
      ) : (
        <div>
          <DataTable<TransactionsImport, unknown>
            loading={loading}
            data={data?.host?.transactionsImports?.nodes}
            onClickRow={({ id }) => router.push(`/dashboard/${accountSlug}/host-transactions/import/${id}?step=last`)}
            columns={[
              {
                header: intl.formatMessage({ defaultMessage: 'Source', id: 'AddFundsModal.source' }),
                accessorKey: 'source',
              },
              {
                header: intl.formatMessage({ defaultMessage: 'Name', id: 'Fields.name' }),
                accessorKey: 'name',
              },
              {
                header: intl.formatMessage({ defaultMessage: 'Type', id: 'Fields.type' }),
                accessorKey: 'type',
                cell: ({ cell }) => {
                  const type = cell.getValue() as TransactionsImport['type'];
                  return (
                    <Badge className="whitespace-nowrap" type="neutral">
                      {i18nTransactionsImportType(intl, type)}
                    </Badge>
                  );
                },
              },
              {
                id: 'stats',
                header: intl.formatMessage({ defaultMessage: 'Processed', id: 'TransactionsImport.processed' }),
                accessorKey: 'stats',
                cell: ({ cell }) => {
                  const stats = cell.getValue() as TransactionsImport['stats'];
                  return <ImportProgressBadge progress={!stats.total ? null : stats.processed / stats.total} />;
                },
              },
              {
                header: intl.formatMessage({ defaultMessage: 'Last sync', id: 'transactions.import.lastSync' }),
                accessorKey: 'lastSyncAt',
                cell: ({ row }) => {
                  const transactionsImport = row.original;
                  return <TransactionImportLastSyncAtBadge transactionsImport={transactionsImport} />;
                },
              },
              {
                id: 'summary',
                header: intl.formatMessage({ defaultMessage: 'Summary', id: 'Summary' }),
                accessorKey: 'stats',
                cell: ({ cell }) => {
                  const stats = cell.getValue() as TransactionsImport['stats'];
                  const parts = [
                    stats.ignored &&
                      intl.formatMessage(
                        { defaultMessage: 'Ignored {count} transactions', id: 'eGcduM' },
                        { count: stats.ignored },
                      ),
                    (stats.expenses || stats.orders) &&
                      intl.formatMessage(
                        {
                          defaultMessage:
                            'Imported {expensesCount, plural, =0 {} one {# expense} other {# expenses}}{both, plural, =0 {} other { and }}{ordersCount, plural, =0 {} one {# contribution} other {# contributions}}',
                          id: 'ImportTransactionsCount',
                        },
                        {
                          expensesCount: stats.expenses,
                          ordersCount: stats.orders,
                          both: stats.expenses && stats.orders,
                        },
                      ),
                  ];

                  return <span className="text-neutral-600">{capitalize(parts.filter(Boolean).join(', '))}</span>;
                },
              },
            ]}
          />
          <Pagination queryFilter={queryFilter} total={data?.host?.transactionsImports?.totalCount} />
        </div>
      )}

      <NewCSVTransactionsImportDialog
        accountSlug={accountSlug}
        onOpenChange={setHasNewImportDialog}
        open={hasNewImportDialog}
        onSuccess={refetch}
      />
    </div>
  );
};
