import React from 'react';
import { useQuery } from '@apollo/client';
import { omit, omitBy } from 'lodash';
import { useRouter } from 'next/router';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import type { FilterComponentConfigs, FiltersToVariables, Views } from '../../../../lib/filters/filter-types';
import { isMulti, limit, offset } from '../../../../lib/filters/schemas';
import { API_V2_CONTEXT } from '../../../../lib/graphql/helpers';
import type { HostApplicationsQuery, HostApplicationsQueryVariables } from '../../../../lib/graphql/types/v2/graphql';
import { HostApplicationStatus, LastCommentBy } from '../../../../lib/graphql/types/v2/schema';
import useQueryFilter from '../../../../lib/hooks/useQueryFilter';
import i18nHostApplicationStatus from '../../../../lib/i18n/host-application-status';
import { LastCommentByFilterLabels } from '../../../../lib/i18n/last-comment-by-filter';
import { sortSelectOptions } from '../../../../lib/utils';

import MessageBoxGraphqlError from '../../../MessageBoxGraphqlError';
import DashboardHeader from '../../DashboardHeader';
import { EmptyResults } from '../../EmptyResults';
import ComboSelectFilter from '../../filters/ComboSelectFilter';
import { Filterbar } from '../../filters/Filterbar';
import { orderByFilter } from '../../filters/OrderFilter';
import { Pagination } from '../../filters/Pagination';
import { searchFilter } from '../../filters/SearchFilter';
import type { DashboardSectionProps } from '../../types';

import HostApplicationDrawer from './HostApplicationDrawer';
import HostApplicationsTable from './HostApplicationsTable';
import { hostApplicationsMetadataQuery, hostApplicationsQuery } from './queries';

enum HostApplicationLastCommentBy {
  COLLECTIVE_ADMIN = LastCommentBy.COLLECTIVE_ADMIN,
  HOST_ADMIN = LastCommentBy.HOST_ADMIN,
}

const schema = z.object({
  limit,
  offset,
  searchTerm: searchFilter.schema,
  orderBy: orderByFilter.schema,
  status: z.nativeEnum(HostApplicationStatus).optional(),
  hostApplicationId: z.string().nullable().optional(),
  lastCommentBy: isMulti(z.nativeEnum(HostApplicationLastCommentBy)).optional(),
});

const toVariables: FiltersToVariables<z.infer<typeof schema>, HostApplicationsQueryVariables> = {
  orderBy: orderByFilter.toVariables,
};

const filters: FilterComponentConfigs<z.infer<typeof schema>> = {
  orderBy: orderByFilter.filter,
  searchTerm: searchFilter.filter,
  status: {
    labelMsg: defineMessage({ defaultMessage: 'Status', id: 'tzMNF3' }),
    Component: ({ intl, ...props }) => (
      <ComboSelectFilter
        options={Object.values(HostApplicationStatus)
          .map(value => ({ label: i18nHostApplicationStatus(intl, value), value }))
          .sort(sortSelectOptions)}
        {...props}
      />
    ),
    valueRenderer: ({ value, intl }) => i18nHostApplicationStatus(intl, value),
  },
  lastCommentBy: {
    labelMsg: defineMessage({ id: 'expenses.lastCommentByFilter', defaultMessage: 'Last Comment By' }),
    Component: ({ valueRenderer, intl, ...props }) => {
      const options = React.useMemo(
        () =>
          Object.values(HostApplicationLastCommentBy).map(value => ({
            value,
            label: valueRenderer({ value, intl }),
          })),
        [valueRenderer, intl],
      );
      return <ComboSelectFilter options={options} isMulti {...props} />;
    },
    valueRenderer: ({ value, intl }) => intl.formatMessage(LastCommentByFilterLabels[value]),
  },
};

const ROUTE_PARAMS = ['hostCollectiveSlug', 'slug', 'section', 'view'];

const updateQuery = (router, newParams) => {
  const query = omitBy({ ...router.query, ...newParams }, (value, key) => !value || ROUTE_PARAMS.includes(key));
  const pathname = router.asPath.split('?')[0].split('#')[0];
  return router.push({ pathname, query });
};

const HostApplications = ({ accountSlug: hostSlug }: DashboardSectionProps) => {
  const router = useRouter();
  const intl = useIntl();
  const { data: metadata, refetch: refetchMetadata } = useQuery(hostApplicationsMetadataQuery, {
    variables: { hostSlug },
    fetchPolicy: 'network-only',
    context: API_V2_CONTEXT,
  });

  const views: Views<z.infer<typeof schema>> = [
    {
      id: 'unreplied',
      label: intl.formatMessage({ defaultMessage: 'Unreplied', id: 'k9Y5So' }),
      filter: {
        lastCommentBy: [HostApplicationLastCommentBy.COLLECTIVE_ADMIN],
        status: HostApplicationStatus.PENDING,
      },
      count: metadata?.host?.unreplied?.totalCount,
    },
    {
      id: 'pending',
      label: intl.formatMessage({ defaultMessage: 'Pending', id: 'eKEL/g' }),
      filter: {
        status: HostApplicationStatus.PENDING,
      },
      count: metadata?.host?.pending?.totalCount,
    },
    {
      id: 'approved',
      label: intl.formatMessage({ defaultMessage: 'Approved', id: '6XFO/C' }),
      filter: { status: HostApplicationStatus.APPROVED },
      count: metadata?.host?.approved?.totalCount,
    },
    {
      id: 'rejected',
      label: intl.formatMessage({ defaultMessage: 'Rejected', id: '5qaD7s' }),
      filter: { status: HostApplicationStatus.REJECTED },
      count: metadata?.host?.rejected?.totalCount,
    },
  ];
  const queryFilter = useQueryFilter<typeof schema, HostApplicationsQueryVariables>({
    schema,
    filters,
    toVariables,
    views,
  });

  const { data, error, loading } = useQuery<HostApplicationsQuery, HostApplicationsQueryVariables>(
    hostApplicationsQuery,
    {
      variables: { hostSlug, ...omit(queryFilter.variables, 'hostApplicationId') },
      fetchPolicy: 'cache-and-network',
      context: API_V2_CONTEXT,
      onCompleted() {
        refetchMetadata();
      },
    },
  );

  // Open application account id, checking hash for backwards compatibility
  const accountId = Number(
    router.query.accountId || (typeof window !== 'undefined' ? window?.location.hash.split('application-')[1] : null),
  );

  const hostApplications = data?.host?.hostApplications;
  const drawerApplicationId = accountId
    ? hostApplications?.nodes?.find(a => a.account.legacyId === accountId)?.id
    : queryFilter.values.hostApplicationId;

  const currentViewCount = views.find(v => v.id === queryFilter.activeViewId)?.count;
  const nbPlaceholders = currentViewCount < queryFilter.values.limit ? currentViewCount : queryFilter.values.limit;

  return (
    <div className="flex max-w-screen-lg flex-col gap-4">
      <DashboardHeader title={<FormattedMessage id="Menu.HostApplications" defaultMessage="Host Applications" />} />

      <Filterbar {...queryFilter} />

      {error ? (
        <MessageBoxGraphqlError error={error} mb={2} />
      ) : !loading && !hostApplications?.nodes.length ? (
        <EmptyResults
          hasFilters={queryFilter.hasFilters}
          entityType="HOST_APPLICATIONS"
          onResetFilters={() => queryFilter.resetFilters({})}
        />
      ) : (
        <React.Fragment>
          <HostApplicationsTable
            hostApplications={hostApplications?.nodes}
            nbPlaceholders={nbPlaceholders}
            loading={loading}
            openApplication={application => queryFilter.setFilter('hostApplicationId', application.id)}
          />
          <Pagination queryFilter={queryFilter} total={hostApplications?.totalCount} />
        </React.Fragment>
      )}

      <HostApplicationDrawer
        open={!!drawerApplicationId}
        onClose={() => {
          updateQuery(router, { accountId: null });
          queryFilter.setFilter('hostApplicationId', null);
        }}
        applicationId={drawerApplicationId}
      />
    </div>
  );
};

export default HostApplications;
