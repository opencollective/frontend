import React from 'react';
import { useQuery } from '@apollo/client';
import { omit, omitBy } from 'lodash';
import { useRouter } from 'next/router';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import type { FilterComponentConfigs, FiltersToVariables, Views } from '../../../../lib/filters/filter-types';
import { API_V2_CONTEXT } from '../../../../lib/graphql/helpers';
import type {
  AccountHoverCardFieldsFragment,
  HostDashboardExpensesQueryVariables,
} from '../../../../lib/graphql/types/v2/graphql';
import { ExpenseStatusFilter, LastCommentBy, PayoutMethodType } from '../../../../lib/graphql/types/v2/schema';
import {
  A,
  ARROW_DOWN_KEY,
  ARROW_LEFT_KEY,
  ARROW_RIGHT_KEY,
  ARROW_UP_KEY,
  B,
  useKeyboardSequence,
} from '../../../../lib/hooks/useKeyboardKey';
import { useLazyGraphQLPaginatedResults } from '../../../../lib/hooks/useLazyGraphQLPaginatedResults';
import useQueryFilter from '../../../../lib/hooks/useQueryFilter';

import ExpensesList from '../../../expenses/ExpensesList';
import LoadingPlaceholder from '../../../LoadingPlaceholder';
import MessageBox from '../../../MessageBox';
import MessageBoxGraphqlError from '../../../MessageBoxGraphqlError';
import StyledButton from '../../../StyledButton';
import DashboardHeader from '../../DashboardHeader';
import { EmptyResults } from '../../EmptyResults';
import { expenseTagFilter } from '../../filters/ExpenseTagsFilter';
import { Filterbar } from '../../filters/Filterbar';
import { hostedAccountFilter } from '../../filters/HostedAccountFilter';
import { Pagination } from '../../filters/Pagination';
import type { DashboardSectionProps } from '../../types';

import ExpensePipelineOverview from './ExpensePipelineOverview';
import type { FilterMeta as CommonFilterMeta } from './filters';
import { filters as commonFilters, schema as commonSchema, toVariables as commonToVariables } from './filters';
import { hostDashboardExpensesQuery, hostDashboardMetadataQuery } from './queries';
import ScheduledExpensesBanner from './ScheduledExpensesBanner';

const filterSchema = commonSchema.extend({
  account: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

type FilterMeta = CommonFilterMeta & {
  hostSlug: string;
  hostedAccounts?: Array<AccountHoverCardFieldsFragment>;
  expenseTags?: string[];
  includeUncategorized?: boolean;
};

const toVariables: FiltersToVariables<FilterValues, HostDashboardExpensesQueryVariables, FilterMeta> = {
  ...commonToVariables,
  limit: (value, key) => ({ [key]: value * 2 }), // Times two for the lazy pagination
  account: hostedAccountFilter.toVariables,
};

const filters: FilterComponentConfigs<FilterValues, FilterMeta> = {
  ...commonFilters,
  account: hostedAccountFilter.filter,
  tag: expenseTagFilter.filter,
};

/**
 * Remove the expense from the query cache if we're filtering by status and the expense status has changed.
 */
const onExpenseUpdate = ({ updatedExpense, cache, variables, refetchMetaData }) => {
  refetchMetaData(); // Refetch the metadata to update the view counts
  if (variables.status && updatedExpense.status !== variables.status) {
    cache.updateQuery({ query: hostDashboardExpensesQuery, variables }, data => {
      return {
        ...data,
        expenses: {
          ...data.expenses,
          totalCount: data.expenses.totalCount - 1,
          nodes: data.expenses.nodes?.filter(expense => updatedExpense.id !== expense.id),
        },
      };
    });
  }
};

const ROUTE_PARAMS = ['slug', 'section'];

const HostExpenses = ({ accountSlug: hostSlug }: DashboardSectionProps) => {
  const router = useRouter();
  const intl = useIntl();
  const query = router.query;
  const [paypalPreApprovalError, setPaypalPreApprovalError] = React.useState(null);
  const pageRoute = `/dashboard/${hostSlug}/host-expenses`;

  // Konami Code
  useKeyboardSequence({
    sequence: [
      ARROW_UP_KEY,
      ARROW_UP_KEY,
      ARROW_DOWN_KEY,
      ARROW_DOWN_KEY,
      ARROW_LEFT_KEY,
      ARROW_RIGHT_KEY,
      ARROW_LEFT_KEY,
      ARROW_RIGHT_KEY,
      B,
      A,
    ],
    callback: () => {
      new Audio('/static/sounds/super.mp3').play();
    },
  });

  const {
    data: metaData,
    error: errorMetaData,
    refetch: refetchMetaData,
  } = useQuery(hostDashboardMetadataQuery, {
    variables: { hostSlug, withHoverCard: true },
    context: API_V2_CONTEXT,
  });

  const views: Views<FilterValues> = [
    {
      label: intl.formatMessage({ defaultMessage: 'All', id: 'zQvVDJ' }),
      filter: {},
      id: 'all',
    },
    {
      label: intl.formatMessage({ id: 'expenses.ready', defaultMessage: 'Ready to pay' }),
      filter: { status: [ExpenseStatusFilter.READY_TO_PAY], sort: { field: 'CREATED_AT', direction: 'ASC' } },
      id: 'ready_to_pay',
      count: metaData?.ready_to_pay?.totalCount,
    },
    {
      label: intl.formatMessage({ defaultMessage: 'Unreplied', id: 'k9Y5So' }),
      filter: {
        lastCommentBy: [LastCommentBy.NON_HOST_ADMIN],
        status: [
          ExpenseStatusFilter.APPROVED,
          ExpenseStatusFilter.ERROR,
          ExpenseStatusFilter.INCOMPLETE,
          ExpenseStatusFilter.ON_HOLD,
        ],
      },
      id: 'unreplied',
      count: metaData?.unreplied?.totalCount,
    },
    {
      label: intl.formatMessage({ id: 'expense.batched', defaultMessage: 'Batched' }),
      filter: {
        status: [ExpenseStatusFilter.SCHEDULED_FOR_PAYMENT],
        sort: { field: 'CREATED_AT', direction: 'ASC' },
      },
      id: 'scheduled_for_payment',
      count: metaData?.scheduled_for_payment?.totalCount,
    },
    {
      label: intl.formatMessage({ defaultMessage: 'On hold', id: '0Hhe6f' }),
      filter: { status: [ExpenseStatusFilter.ON_HOLD], sort: { field: 'CREATED_AT', direction: 'ASC' } },
      id: 'on_hold',
      count: metaData?.on_hold?.totalCount,
    },
    {
      label: intl.formatMessage({ defaultMessage: 'Incomplete', id: 'kHwKVg' }),
      filter: { status: [ExpenseStatusFilter.INCOMPLETE], sort: { field: 'CREATED_AT', direction: 'ASC' } },
      id: 'incomplete',
      count: metaData?.incomplete?.totalCount,
    },
    {
      label: intl.formatMessage({ id: 'Error', defaultMessage: 'Error' }),
      filter: { status: [ExpenseStatusFilter.ERROR], sort: { field: 'CREATED_AT', direction: 'ASC' } },
      id: 'error',
      count: metaData?.error?.totalCount,
    },
    {
      label: intl.formatMessage({ defaultMessage: 'Paid', id: 'u/vOPu' }),
      filter: { status: [ExpenseStatusFilter.PAID] },
      id: 'paid',
    },
  ];

  const meta: FilterMeta = {
    currency: metaData?.host?.currency,
    hostSlug: hostSlug,
    hostedAccounts: metaData?.hostedAccounts.nodes,
    expenseTags: metaData?.expenseTags.nodes?.map(t => t.tag),
    includeUncategorized: true,
  };

  const queryFilter = useQueryFilter({
    schema: filterSchema,
    toVariables,
    defaultFilterValues: views[1].filter,
    filters,
    meta,
    views,
  });

  const variables = {
    hostSlug,
    ...queryFilter.variables,
  };

  const expenses = useQuery(hostDashboardExpensesQuery, {
    variables,
    context: API_V2_CONTEXT,
  });

  const paginatedExpenses = useLazyGraphQLPaginatedResults(expenses, 'expenses');
  React.useEffect(() => {
    if (query.paypalApprovalError && !paypalPreApprovalError) {
      setPaypalPreApprovalError(query.paypalApprovalError);
      router.replace(pageRoute, omit(query, 'paypalApprovalError'), { shallow: true });
    }
  }, [query.paypalApprovalError]);

  const { data, error, loading } = expenses;

  const getQueryParams = newParams => {
    return omitBy({ ...query, ...newParams }, (value, key) => !value || ROUTE_PARAMS.includes(key));
  };

  return (
    <div className="flex max-w-(--breakpoint-lg) flex-col gap-4">
      <DashboardHeader title={<FormattedMessage id="Expenses" defaultMessage="Expenses" />} />
      {paypalPreApprovalError && (
        <MessageBox type="warning" mb={3} withIcon>
          {paypalPreApprovalError === 'PRE_APPROVAL_EMAIL_CHANGED' ? (
            <FormattedMessage
              id="paypal.preApproval.emailWarning"
              defaultMessage="Warning: the associated PayPal email was changed from {oldEmail} to {newEmail}. If this was not intentional, click {refillBalance} and use the correct account."
              values={{
                oldEmail: <strong>{query.oldPaypalEmail}</strong>,
                newEmail: <strong>{query.newPaypalEmail}</strong>,
                refillBalance: (
                  <q>
                    <FormattedMessage id="ConnectPaypal.refill" defaultMessage="Refill balance" />
                  </q>
                ),
              }}
            />
          ) : (
            paypalPreApprovalError
          )}
        </MessageBox>
      )}

      {!metaData?.host ? (
        <LoadingPlaceholder height={150} />
      ) : errorMetaData ? (
        <MessageBoxGraphqlError error={errorMetaData} />
      ) : (
        <ExpensePipelineOverview className="pt-4" host={metaData.host} />
      )}
      <ScheduledExpensesBanner
        hostSlug={hostSlug}
        onSubmit={() => {
          expenses.refetch();
          refetchMetaData();
        }}
        secondButton={
          !(
            queryFilter.values.status?.includes(ExpenseStatusFilter.SCHEDULED_FOR_PAYMENT) &&
            queryFilter.values.status?.length === 1 &&
            queryFilter.values.payout === PayoutMethodType.BANK_ACCOUNT
          ) ? (
            <StyledButton
              buttonSize="tiny"
              buttonStyle="successSecondary"
              onClick={() =>
                queryFilter.resetFilters({
                  status: [ExpenseStatusFilter.SCHEDULED_FOR_PAYMENT],
                  payout: PayoutMethodType.BANK_ACCOUNT,
                })
              }
            >
              <FormattedMessage id="expenses.list" defaultMessage="List Expenses" />
            </StyledButton>
          ) : null
        }
      />
      <Filterbar {...queryFilter} />

      {error ? (
        <MessageBoxGraphqlError error={error} />
      ) : !loading && !data.expenses?.nodes.length ? (
        <EmptyResults
          entityType="EXPENSES"
          onResetFilters={() => queryFilter.resetFilters({})}
          hasFilters={queryFilter.hasFilters}
        />
      ) : (
        <React.Fragment>
          <ExpensesList
            isLoading={loading}
            host={data?.host}
            nbPlaceholders={paginatedExpenses.limit}
            expenses={paginatedExpenses.nodes}
            view="admin"
            onProcess={(expense, cache) => {
              onExpenseUpdate({ updatedExpense: expense, cache, variables, refetchMetaData });
            }}
            useDrawer
            openExpenseLegacyId={Number(router.query.openExpenseId)}
            setOpenExpenseLegacyId={(legacyId, attachmentUrl) => {
              router.push(
                {
                  pathname: pageRoute,
                  query: getQueryParams({ ...query, openExpenseId: legacyId, attachmentUrl }),
                },
                undefined,
                { shallow: true },
              );
            }}
          />
          <Pagination queryFilter={queryFilter} total={data?.expenses?.totalCount} />
        </React.Fragment>
      )}
    </div>
  );
};

export default HostExpenses;
