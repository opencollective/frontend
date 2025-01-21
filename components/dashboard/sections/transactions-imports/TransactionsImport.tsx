import React from 'react';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import { partition, size, truncate } from 'lodash';
import Lottie from 'lottie-react';
import {
  Calendar,
  CalendarClock,
  Download,
  FilePenLine,
  FileSliders,
  Info,
  RotateCcw,
  Settings,
  SquareSlashIcon,
  Target,
  Upload,
} from 'lucide-react';
import type { IntlShape } from 'react-intl';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { i18nGraphqlException } from '../../../../lib/errors';
import { formatFileSize } from '../../../../lib/file-utils';
import type { FilterConfig } from '../../../../lib/filters/filter-types';
import { integer } from '../../../../lib/filters/schemas';
import { API_V2_CONTEXT } from '../../../../lib/graphql/helpers';
import {
  type TransactionsImportQuery,
  type TransactionsImportQueryVariables,
} from '../../../../lib/graphql/types/v2/graphql';
import { type Amount, TransactionsImportRowStatus } from '../../../../lib/graphql/types/v2/schema';
import useQueryFilter from '../../../../lib/hooks/useQueryFilter';
import { i18nTransactionsRowStatus } from '../../../../lib/i18n/transactions-import-row';
import { cn, sortSelectOptions } from '../../../../lib/utils';
import { useTransactionsImportActions } from './lib/actions';
import { TransactionsImportRowFieldsFragment } from './lib/graphql';
import { usePlaidConnectDialog } from '@/lib/hooks/usePlaidConnectDialog';

import { accountingCategoryFields } from '@/components/expenses/graphql/fragments';

import * as SyncAnimation from '../../../../public/static/animations/sync-bank-oc.json';
import Avatar from '../../../Avatar';
import DateTime from '../../../DateTime';
import FormattedMoneyAmount from '../../../FormattedMoneyAmount';
import Link from '../../../Link';
import LoadingPlaceholder from '../../../LoadingPlaceholder';
import MessageBox from '../../../MessageBox';
import MessageBoxGraphqlError from '../../../MessageBoxGraphqlError';
import NotFound from '../../../NotFound';
import StyledLink from '../../../StyledLink';
import { actionsColumn, DataTable } from '../../../table/DataTable';
import {
  MultiPagesRowSelectionInitialState,
  multiPagesRowSelectionReducer,
} from '../../../table/multi-pages-selection';
import { Button } from '../../../ui/Button';
import { Checkbox } from '../../../ui/Checkbox';
import type { StepItem } from '../../../ui/Stepper';
import { Step, Stepper } from '../../../ui/Stepper';
import { useToast } from '../../../ui/useToast';
import DashboardHeader from '../../DashboardHeader';
import ComboSelectFilter from '../../filters/ComboSelectFilter';
import { Filterbar } from '../../filters/Filterbar';
import { Pagination } from '../../filters/Pagination';
import { searchFilter } from '../../filters/SearchFilter';

import { ImportProgressBadge } from './ImportProgressBadge';
import { StepMapCSVColumns } from './StepMapCSVColumns';
import { StepSelectCSV } from './StepSelectCSV';
import { SyncPlaidAccountButton } from './SyncPlaidAccountButton';
import { TransactionImportLastSyncAtBadge } from './TransactionImportLastSyncAtBadge';
import { TransactionsImportRowDrawer } from './TransactionsImportRowDrawer';
import { TransactionsImportRowStatusBadge } from './TransactionsImportRowStatusBadge';
import TransactionsImportSettingsModal from './TransactionsImportSettingsModal';

const getSteps = (intl: IntlShape): StepItem[] => {
  const getPrefix = stepNum => intl.formatMessage({ defaultMessage: 'Step {stepNum}:', id: 'Z9Dody' }, { stepNum });
  return [
    {
      id: 'import-csv',
      icon: Upload,
      label: `${getPrefix(1)} ${intl.formatMessage({ defaultMessage: 'Select CSV', id: '1s14km' })}`,
    },
    {
      id: 'map-csv',
      icon: FileSliders,
      label: `${getPrefix(2)} ${intl.formatMessage({ defaultMessage: 'Map columns', id: 'rcGwE8' })}`,
    },
    {
      id: 'process',
      icon: FilePenLine,
      label: `${getPrefix(3)} ${intl.formatMessage({ defaultMessage: 'Edit & process data', id: '06H44P' })}`,
    },
  ];
};

const transactionsImportHostFieldsFragment = gql`
  fragment TransactionsImportHostFields on Host {
    id
    name
    legalName
    imageUrl
    legacyId
    slug
    currency
    type

    accountingCategories {
      totalCount
      nodes {
        id
        ...AccountingCategoryFields
      }
    }
  }
  ${accountingCategoryFields}
`;

const transactionsImportQuery = gql`
  query TransactionsImport(
    $importId: String!
    $limit: Int = 50
    $offset: Int = 0
    $status: TransactionsImportRowStatus
    $searchTerm: String
  ) {
    transactionsImport(id: $importId) {
      id
      source
      name
      lastSyncAt
      isSyncing
      lastSyncCursor
      file {
        id
        url
        name
        type
        size
      }
      stats {
        total
        ignored
        expenses
        orders
        processed
      }
      type
      csvConfig
      createdAt
      updatedAt
      connectedAccount {
        id
      }
      account {
        id
        slug
        ... on AccountWithHost {
          host {
            ...TransactionsImportHostFields
          }
        }
        ... on Organization {
          host {
            ...TransactionsImportHostFields
          }
        }
      }
      rows(limit: $limit, offset: $offset, status: $status, searchTerm: $searchTerm) {
        totalCount
        offset
        limit
        nodes {
          ...TransactionsImportRowFields
        }
      }
    }
  }
  ${TransactionsImportRowFieldsFragment}
  ${transactionsImportHostFieldsFragment}
`;

const transactionsImportLasSyncAtPollQuery = gql`
  query TransactionsImportLastSyncAt($importId: String!) {
    transactionsImport(id: $importId) {
      id
      lastSyncAt
      isSyncing
      lastSyncCursor
    }
  }
`;

const DEFAULT_PAGE_SIZE = 50;

const getViews = intl => [
  {
    id: 'PENDING',
    label: intl.formatMessage({ defaultMessage: 'Pending', id: 'eKEL/g' }),
    filter: { status: TransactionsImportRowStatus.PENDING },
  },
  {
    id: 'IGNORED',
    label: intl.formatMessage({ defaultMessage: 'No action', id: 'zue9QR' }),
    filter: { status: TransactionsImportRowStatus.IGNORED },
  },
  {
    id: 'LINKED',
    label: intl.formatMessage({ defaultMessage: 'Imported', id: 'transaction.imported' }),
    filter: { status: TransactionsImportRowStatus.LINKED },
  },
  {
    id: 'ALL',
    label: intl.formatMessage({ defaultMessage: 'All', id: 'all' }),
    filter: {},
  },
];

const rowStatusFilterSchema = z.nativeEnum(TransactionsImportRowStatus).optional();

const rowStatusFilter: FilterConfig<z.infer<typeof rowStatusFilterSchema>> = {
  schema: rowStatusFilterSchema,
  filter: {
    labelMsg: defineMessage({ defaultMessage: 'Status', id: 'tzMNF3' }),
    Component: ({ valueRenderer, intl, ...props }) => (
      <ComboSelectFilter
        options={Object.values(TransactionsImportRowStatus)
          .map(value => ({ label: valueRenderer({ intl, value }), value }))
          .sort(sortSelectOptions)}
        {...props}
      />
    ),
    valueRenderer: ({ intl, value }) => i18nTransactionsRowStatus(intl, value),
  },
};

const queryFilterSchema = z.object({
  limit: integer.default(DEFAULT_PAGE_SIZE),
  offset: integer.default(0),
  searchTerm: searchFilter.schema,
  status: rowStatusFilter.schema,
});

const filters = {
  searchTerm: searchFilter.filter,
  status: rowStatusFilter.filter,
};

export const TransactionsImport = ({ accountSlug, importId }) => {
  const intl = useIntl();
  const { toast } = useToast();
  const steps = React.useMemo(() => getSteps(intl), [intl]);
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [drawerRowId, setDrawerRowId] = React.useState<string | null>(null);
  const [hasNewData, setHasNewData] = React.useState(false);
  const [isDeleted, setIsDeleted] = React.useState(false);
  const [hasRequestedSync, setHasRequestedSync] = React.useState(false);
  const [hasSettingsModal, setHasSettingsModal] = React.useState(false);
  const apolloClient = useApolloClient();
  const [selection, dispatchSelection] = React.useReducer(
    multiPagesRowSelectionReducer,
    MultiPagesRowSelectionInitialState,
  );

  const queryFilterViews = React.useMemo(() => getViews(intl), [intl]);
  const queryFilter = useQueryFilter<typeof queryFilterSchema, TransactionsImportQueryVariables>({
    schema: queryFilterSchema,
    views: queryFilterViews,
    filters,
  });

  const { data, previousData, loading, error, refetch } = useQuery<
    TransactionsImportQuery,
    TransactionsImportQueryVariables
  >(transactionsImportQuery, {
    context: API_V2_CONTEXT,
    variables: { importId, ...queryFilter.variables },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  const importData = data?.transactionsImport || previousData?.transactionsImport;
  const importType = importData?.type;
  const hasStepper = importType === 'CSV' && !importData?.file;
  const importRows = importData?.rows?.nodes ?? [];
  const selectedRowIdx = importRows.findIndex(row => row.id === drawerRowId);

  const { show: showPlaidDialog, status: plaidStatus } = usePlaidConnectDialog({
    transactionImportId: importId,
    host: importData?.account['host'],
    disabled: importType !== 'PLAID',
    onOpen: () => {
      setHasSettingsModal(false); // The two modals don't play well with each others when opened at the same time
    },
    onSuccess: () => {
      setTimeout(() => refetch(), 5_000);
      toast({
        variant: 'success',
        message: intl.formatMessage({ defaultMessage: 'Bank account reconnected.', id: 'HuLtwm' }),
      });
    },
  });

  // Polling to check if the import has new data
  useQuery(transactionsImportLasSyncAtPollQuery, {
    context: API_V2_CONTEXT,
    variables: { importId },
    pollInterval: !importData?.lastSyncAt || importData.isSyncing || hasRequestedSync ? 2_000 : 20_000, // Poll every 2 seconds if syncing, otherwise every 20 seconds
    fetchPolicy: 'no-cache', // We want to always fetch the latest data, and make sure we don't update the cache
    notifyOnNetworkStatusChange: true, // To make sure `onCompleted` is called when the query is polled
    skip: !importData || hasNewData || !importData.connectedAccount || hasSettingsModal, // We can stop polling if we already know there's new data
    onCompleted(pollData) {
      if (!pollData.transactionsImport) {
        setIsDeleted(true);
        return;
      }

      // Update the `isSyncing` status
      if (importData.isSyncing !== pollData.transactionsImport.isSyncing) {
        const newValue = pollData.transactionsImport.isSyncing;
        apolloClient.cache.modify({
          id: apolloClient.cache.identify(importData),
          fields: { isSyncing: () => newValue },
        });
      }

      // If we've manually requested a sync and a new one is registered
      if (hasRequestedSync && importData.lastSyncAt !== pollData.transactionsImport.lastSyncAt) {
        setHasRequestedSync(false);
        apolloClient.cache.modify({
          id: apolloClient.cache.identify(importData),
          fields: { lastSyncAt: () => pollData.transactionsImport.lastSyncAt },
        });
      }

      // Handle new sync data
      if (importData.lastSyncCursor !== pollData.transactionsImport.lastSyncCursor) {
        if (!importData.rows?.totalCount) {
          refetch(); // The first transaction(s) have been imported, we can directly refresh the view
        } else {
          setHasNewData(true); // We add a message without refetching the data, to not break the user's flow
        }
      }
    },
  });

  const { getActions, setRowsDismissed } = useTransactionsImportActions({
    transactionsImport: importData,
    host: importData?.account?.['host'],
  });

  // Clear selection whenever the pagination changes
  React.useEffect(() => {
    dispatchSelection({ type: 'CLEAR' });
  }, [queryFilter.variables]);

  const hasPagination = data?.transactionsImport?.rows.totalCount > queryFilter.values.limit;
  const isInitialSync = Boolean(!importData?.lastSyncAt && importData?.connectedAccount);
  return (
    <div>
      <DashboardHeader
        className="mb-6"
        title="Transactions Imports"
        titleRoute={`/dashboard/${accountSlug}/host-transactions/import`}
        subpathTitle={
          importData
            ? `${truncate(importData.source, { length: 25 })} - ${truncate(importData.name, { length: 25 })}`
            : `#${importId.split('-')[0]}`
        }
      />
      {loading && !importData ? (
        <LoadingPlaceholder height={300} />
      ) : isDeleted ? (
        <MessageBox type="error" withIcon>
          <FormattedMessage defaultMessage="This import has been deleted." id="forMcN" />
        </MessageBox>
      ) : error ? (
        <MessageBoxGraphqlError error={error} />
      ) : !importData || importData.account.slug !== accountSlug ? (
        <NotFound />
      ) : (
        <React.Fragment>
          {hasStepper && (
            <Stepper initialStep={0} steps={steps} orientation="vertical" className="mb-4">
              {steps.map(stepProps => {
                return (
                  <Step key={stepProps.id} {...stepProps}>
                    {stepProps.id === 'import-csv' ? (
                      <StepSelectCSV onFileSelected={setCsvFile} />
                    ) : stepProps.id === 'map-csv' ? (
                      <StepMapCSVColumns
                        importId={importId}
                        file={csvFile}
                        currency={importData.account.currency}
                        onSuccess={refetch}
                      />
                    ) : null}
                  </Step>
                );
              })}
            </Stepper>
          )}
          {!hasStepper && (
            <div>
              {/** Import details (creation date, last update, file info) */}
              <div
                className={cn(
                  'border border-neutral-200 bg-white p-4 text-base shadow-sm',
                  hasNewData ? 'rounded-tl-lg rounded-tr-lg border-b-0' : 'rounded-lg',
                )}
              >
                <div className="flex justify-between">
                  <div className="flex flex-col gap-2">
                    {importData.type === 'PLAID' ? (
                      <div className="flex min-h-7 flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                          <CalendarClock size={16} />
                          <div className="text-sm font-bold sm:text-base">
                            <FormattedMessage defaultMessage="Last sync" id="transactions.import.lastSync" />
                          </div>
                        </div>
                        <TransactionImportLastSyncAtBadge transactionsImport={importData} />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                          <CalendarClock size={16} />
                          <div className="text-sm font-bold sm:text-base">
                            <FormattedMessage defaultMessage="Last update" id="transactions.import.lastUpdate" />
                          </div>
                        </div>
                        <DateTime value={new Date(importData.updatedAt)} timeStyle="short" />
                      </div>
                    )}

                    <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <div className="font-bold">
                          <FormattedMessage defaultMessage="Created on" id="transactions.import.createdOn" />
                        </div>
                      </div>
                      <DateTime value={new Date(importData.createdAt)} timeStyle="short" />
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <Target size={16} />
                        <div className="font-bold">
                          <FormattedMessage defaultMessage="Processed" id="TransactionsImport.processed" />
                        </div>
                      </div>
                      <ImportProgressBadge
                        progress={!importData.stats.total ? null : importData.stats.processed / importData.stats.total}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      {importData.type === 'PLAID' && importData.connectedAccount && (
                        <SyncPlaidAccountButton
                          hasRequestedSync={hasRequestedSync}
                          setHasRequestedSync={setHasRequestedSync}
                          connectedAccountId={importData.connectedAccount.id}
                          isSyncing={importData.isSyncing}
                        />
                      )}
                      {importData.file && (
                        <Link
                          className="flex gap-1 align-middle hover:underline"
                          openInNewTab
                          href={importData.file.url}
                          title={importData.file.name}
                        >
                          <Button size="xs" variant="outline">
                            <Download size={16} />
                            <span className="inline-block max-w-52 truncate">{importData.file.name}</span> (
                            {formatFileSize(importData.file.size)})
                          </Button>
                        </Link>
                      )}
                      <Button size="xs" variant="outline" onClick={() => setHasSettingsModal(true)}>
                        <Settings size={16} />
                        <span className="hidden sm:inline">
                          <FormattedMessage defaultMessage="Settings" id="Settings" />
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/** "Refresh data" action bar */}
              {!hasNewData ? (
                <div className="h-[51px]" />
              ) : (
                <div className="sticky top-0 z-50 flex items-center justify-between rounded-none rounded-bl-lg rounded-br-lg bg-blue-500 px-4 py-2 text-sm text-white animate-in fade-in">
                  <span className="flex items-center gap-2">
                    <Info size={18} className="text-info" />
                    <FormattedMessage
                      defaultMessage="New transactions have been synchronized."
                      id="transactions.import.newData"
                    />
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={loading}
                    onClick={async () => {
                      try {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        await refetch();
                        setHasNewData(false);
                      } catch (e) {
                        toast({
                          variant: 'error',
                          title: intl.formatMessage({
                            defaultMessage: 'An error occurred while refreshing the data',
                            id: '7XHoRS',
                          }),
                          message: i18nGraphqlException(intl, e),
                        });
                      }
                    }}
                  >
                    <RotateCcw size={16} />
                    &nbsp;
                    <FormattedMessage defaultMessage="Refresh" id="refresh" />
                  </Button>
                </div>
              )}

              <div className="px-2">
                {/** Tabs & filters */}
                <Filterbar className="mb-4" {...queryFilter} />

                {/** Select all message */}
                {size(selection.rows) === importRows.length && hasPagination && (
                  <div className="flex items-center justify-center rounded-lg bg-neutral-100 p-2 text-sm text-neutral-600">
                    {!selection.includeAllPages ? (
                      <React.Fragment>
                        <FormattedMessage
                          defaultMessage="All {count} rows on this page are selected."
                          id="qMKhWs"
                          values={{ count: importRows.length }}
                        />
                        <Button
                          variant="link"
                          size="xs"
                          onClick={() => dispatchSelection({ type: 'SELECT_ALL_PAGES' })}
                        >
                          <FormattedMessage
                            defaultMessage="Select all {count} rows."
                            id="vbHaiI"
                            values={{ count: importData.rows.totalCount }}
                          />
                        </Button>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <FormattedMessage
                          defaultMessage="All {count} rows are selected."
                          id="1bUrqi"
                          values={{ count: importData.rows.totalCount }}
                        />
                        <Button variant="link" size="xs" onClick={() => dispatchSelection({ type: 'CLEAR' })}>
                          <FormattedMessage defaultMessage="Clear selection" id="EYIw2M" />
                        </Button>
                      </React.Fragment>
                    )}
                  </div>
                )}

                {/** Import data table */}
                <div className="relative mt-2">
                  {isInitialSync && (
                    <div className="absolute z-50 flex h-full w-full items-center justify-center">
                      <Lottie animationData={SyncAnimation} loop autoPlay className="max-w-[600px]" />
                    </div>
                  )}
                  <DataTable<TransactionsImportQuery['transactionsImport']['rows']['nodes'][number], unknown>
                    loading={loading || isInitialSync}
                    getRowClassName={row =>
                      row.original.isDismissed ? '[&>td:nth-child(n+2):nth-last-child(n+3)]:opacity-30' : ''
                    }
                    enableMultiRowSelection
                    rowSelection={selection.rows}
                    setRowSelection={rows =>
                      dispatchSelection({ type: 'SET', rows: typeof rows === 'function' ? rows(selection.rows) : rows })
                    }
                    data={importRows}
                    getActions={getActions}
                    openDrawer={row => setDrawerRowId(row.original.id)}
                    emptyMessage={() => (
                      <FormattedMessage id="SectionTransactions.Empty" defaultMessage="No transactions yet." />
                    )}
                    columns={[
                      {
                        id: 'select',
                        header: ({ table }) =>
                          importRows.some(row => !row.expense && !row.order) ? (
                            <Checkbox
                              aria-label="Select all"
                              className="translate-y-[2px] border-neutral-500"
                              checked={
                                table.getIsAllPageRowsSelected() ||
                                (table.getIsSomePageRowsSelected() && 'indeterminate') ||
                                false
                              }
                              onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                            />
                          ) : null,
                        cell: ({ row }) =>
                          !row.original.expense &&
                          !row.original.order && (
                            <Checkbox
                              checked={row.getIsSelected()}
                              aria-label="Select row"
                              className="translate-y-[2px] border-neutral-500"
                              onCheckedChange={value => row.toggleSelected(!!value)}
                            />
                          ),
                      },
                      {
                        header: 'Date',
                        accessorKey: 'date',
                        cell: ({ cell }) => {
                          const date = cell.getValue() as string;
                          return <DateTime value={new Date(date)} />;
                        },
                      },
                      {
                        header: 'Amount',
                        accessorKey: 'amount',
                        cell: ({ cell }) => {
                          const amount = cell.getValue() as Amount;
                          return <FormattedMoneyAmount amount={amount.valueInCents} currency={amount.currency} />;
                        },
                      },
                      {
                        header: 'Description',
                        accessorKey: 'description',
                        cell: ({ cell }) => <p className="max-w-xs">{cell.getValue() as string}</p>,
                      },
                      {
                        header: 'Match',
                        cell: ({ row }) => {
                          if (row.original.expense) {
                            return (
                              <StyledLink
                                className="flex items-center gap-1"
                                href={`/${row.original.expense.account.slug}/expenses/${row.original.expense.legacyId}`}
                              >
                                <Avatar collective={row.original.expense.account} size={24} />
                                <FormattedMessage
                                  id="E9pJQz"
                                  defaultMessage="Expense #{id}"
                                  values={{ id: row.original.expense.legacyId }}
                                />
                              </StyledLink>
                            );
                          } else if (row.original.order) {
                            return (
                              <StyledLink
                                className="flex items-center gap-1"
                                href={`/${row.original.order.toAccount.slug}/contributions/${row.original.order.legacyId}`}
                              >
                                <Avatar collective={row.original.order.toAccount} size={24} />
                                <FormattedMessage
                                  id="Siv4wU"
                                  defaultMessage="Contribution #{id}"
                                  values={{ id: row.original.order.legacyId }}
                                />
                              </StyledLink>
                            );
                          } else {
                            return '-';
                          }
                        },
                      },
                      {
                        header: 'Status',
                        cell: ({ row }) => {
                          return <TransactionsImportRowStatusBadge row={row.original} />;
                        },
                      },
                      {
                        id: 'actions',
                        ...actionsColumn,
                        header: ({ table }) => {
                          const selectedRows = table.getSelectedRowModel().rows;
                          const unprocessedRows = selectedRows.filter(
                            ({ original }) => !original.expense && !original.order,
                          );
                          const [ignoredRows, nonIgnoredRows] = partition(
                            unprocessedRows,
                            row => row.original.isDismissed,
                          );
                          return (
                            <div className="flex min-w-36 justify-end">
                              {ignoredRows.length && !nonIgnoredRows.length ? (
                                //  If all non-processed rows are dismissed, show restore button
                                <Button
                                  variant="outline"
                                  size="xs"
                                  className="whitespace-nowrap text-xs"
                                  onClick={async () => {
                                    const ignoredIds = ignoredRows.map(row => row.original.id);
                                    await setRowsDismissed(ignoredIds, false, {
                                      includeAllRows: selection.includeAllPages,
                                    });
                                    table.setRowSelection({});
                                  }}
                                >
                                  <SquareSlashIcon size={12} />
                                  {selection.includeAllPages ? (
                                    <FormattedMessage defaultMessage="Restore all rows" id="8uECrb" />
                                  ) : (
                                    <FormattedMessage
                                      defaultMessage="Restore {selectedCount}"
                                      id="restore"
                                      values={{ selectedCount: ignoredRows.length }}
                                    />
                                  )}
                                </Button>
                              ) : nonIgnoredRows.length || selection.includeAllPages ? (
                                // Otherwise, show ignore button
                                <Button
                                  variant="outline"
                                  size="xs"
                                  className="whitespace-nowrap text-xs"
                                  onClick={() => {
                                    const ignoredIds = nonIgnoredRows.map(row => row.original.id);
                                    setRowsDismissed(ignoredIds, true, { includeAllRows: selection.includeAllPages });
                                    table.setRowSelection({});
                                  }}
                                >
                                  <SquareSlashIcon size={12} />
                                  {selection.includeAllPages ? (
                                    <FormattedMessage defaultMessage="No action (all)" id="UFhJFs" />
                                  ) : (
                                    <FormattedMessage
                                      defaultMessage="No action ({selectedCount})"
                                      id="B2eNk+"
                                      values={{ selectedCount: nonIgnoredRows.length }}
                                    />
                                  )}
                                </Button>
                              ) : (
                                <div>
                                  <FormattedMessage
                                    defaultMessage="Actions"
                                    id="CollectivePage.NavBar.ActionMenu.Actions"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        },
                      },
                    ]}
                  />
                  <div className="mt-8">
                    <Pagination queryFilter={queryFilter} total={data?.transactionsImport?.rows.totalCount} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      )}
      <TransactionsImportRowDrawer
        row={importRows?.[selectedRowIdx]}
        open={Boolean(selectedRowIdx !== -1)}
        onOpenChange={() => setDrawerRowId(null)}
        getActions={getActions}
        rowIndex={selectedRowIdx}
      />
      {hasSettingsModal && (
        <TransactionsImportSettingsModal
          transactionsImport={importData}
          onOpenChange={setHasSettingsModal}
          isOpen
          plaidStatus={plaidStatus}
          onReconnectClick={showPlaidDialog}
        />
      )}
    </div>
  );
};
