import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { compact, isString, omit } from 'lodash';
import { useRouter } from 'next/router';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { CollectiveType, HostedCollectiveTypes } from '../../../../lib/constants/collectives';
import type { FilterComponentConfigs, FiltersToVariables } from '../../../../lib/filters/filter-types';
import { integer, isMulti } from '../../../../lib/filters/schemas';
import { API_V2_CONTEXT } from '../../../../lib/graphql/helpers';
import type { HostedCollectivesQueryVariables } from '../../../../lib/graphql/types/v2/graphql';
import type { Account, Collective } from '../../../../lib/graphql/types/v2/schema';
import { HostFeeStructure } from '../../../../lib/graphql/types/v2/schema';
import useQueryFilter from '../../../../lib/hooks/useQueryFilter';
import formatCollectiveType from '../../../../lib/i18n/collective-type';
import { formatHostFeeStructure } from '../../../../lib/i18n/host-fee-structure';

import { Drawer } from '../../../Drawer';
import MessageBoxGraphqlError from '../../../MessageBoxGraphqlError';
import { DataTable } from '../../../table/DataTable';
import { Button } from '../../../ui/Button';
import DashboardHeader from '../../DashboardHeader';
import { EmptyResults } from '../../EmptyResults';
import ExportHostedCollectivesCSVModal from '../../ExportHostedCollectivesCSVModal';
import { consolidatedBalanceFilter } from '../../filters/BalanceFilter';
import {
  COLLECTIVE_STATUS,
  collectiveStatusFilter,
  CollectiveStatusMessages,
} from '../../filters/CollectiveStatusFilter';
import ComboSelectFilter from '../../filters/ComboSelectFilter';
import { currencyFilter } from '../../filters/CurrencyFilter';
import { Filterbar } from '../../filters/Filterbar';
import { Pagination } from '../../filters/Pagination';
import { searchFilter } from '../../filters/SearchFilter';
import { buildSortFilter } from '../../filters/SortFilter';
import type { DashboardSectionProps } from '../../types';
import { makePushSubpath } from '../../utils';

import CollectiveDetails from './CollectiveDetails';
import type { HostedCollectivesDataTableMeta } from './common';
import { cols } from './common';
import { hostedCollectivesMetadataQuery, hostedCollectivesQuery } from './queries';

const sortFilter = buildSortFilter({
  fieldSchema: z.enum(['CREATED_AT', 'BALANCE', 'NAME']),
  defaultValue: {
    field: 'CREATED_AT',
    direction: 'DESC',
  },
  i18nCustomLabels: {
    CREATED_AT: defineMessage({
      defaultMessage: 'Hosted since',
      id: 'HostedSince',
    }),
  },
});

const COLLECTIVES_PER_PAGE = 20;

const schema = z.object({
  limit: integer.default(COLLECTIVES_PER_PAGE),
  offset: integer.default(0),
  searchTerm: searchFilter.schema,
  sort: sortFilter.schema,
  hostFeesStructure: z.nativeEnum(HostFeeStructure).optional(),
  type: isMulti(z.nativeEnum(HostedCollectiveTypes)).optional(),
  status: collectiveStatusFilter.schema,
  consolidatedBalance: consolidatedBalanceFilter.schema,
  currencies: currencyFilter.schema,
});

const toVariables: FiltersToVariables<z.infer<typeof schema>, HostedCollectivesQueryVariables> = {
  status: collectiveStatusFilter.toVariables,
  consolidatedBalance: consolidatedBalanceFilter.toVariables,
};

const filters: FilterComponentConfigs<z.infer<typeof schema>> = {
  sort: sortFilter.filter,
  searchTerm: searchFilter.filter,
  hostFeesStructure: {
    labelMsg: defineMessage({ id: 'FeeStructure', defaultMessage: 'Fee structure' }),
    Component: ({ intl, ...props }) => {
      const options = useMemo(
        () =>
          Object.values(omit(HostFeeStructure, HostFeeStructure.MONTHLY_RETAINER)).map(value => ({
            label: formatHostFeeStructure(intl, value),
            value,
          })),
        [intl],
      );
      return <ComboSelectFilter options={options} {...props} />;
    },
    valueRenderer: ({ value, intl }) => formatHostFeeStructure(intl, value),
  },
  type: {
    labelMsg: defineMessage({ id: 'Type', defaultMessage: 'Type' }),
    Component: ({ intl, ...props }) => {
      const options = useMemo(
        () =>
          Object.values(HostedCollectiveTypes).map(value => ({
            label: formatCollectiveType(intl, value),
            value,
          })),
        [intl],
      );
      return <ComboSelectFilter options={options} isMulti {...props} />;
    },
    valueRenderer: ({ value, intl }) => formatCollectiveType(intl, value),
  },
  currencies: currencyFilter.filter,
  status: collectiveStatusFilter.filter,
  consolidatedBalance: consolidatedBalanceFilter.filter,
};

const HostedCollectives = ({ accountSlug: hostSlug, subpath }: DashboardSectionProps) => {
  const intl = useIntl();
  const router = useRouter();
  const [displayExportCSVModal, setDisplayExportCSVModal] = React.useState(false);
  const [showCollectiveOverview, setShowCollectiveOverview] = React.useState<Account | undefined | string>(subpath[0]);
  const { data: metadata, refetch: refetchMetadata } = useQuery(hostedCollectivesMetadataQuery, {
    variables: { hostSlug },
    fetchPolicy: typeof window !== 'undefined' ? 'cache-and-network' : 'cache-first',
    context: API_V2_CONTEXT,
  });

  const pushSubpath = makePushSubpath(router);

  const views = [
    {
      id: 'all',
      label: intl.formatMessage({ defaultMessage: 'All', id: 'zQvVDJ' }),
      filter: {
        type: [CollectiveType.COLLECTIVE, CollectiveType.FUND],
      },
      count: metadata?.host?.all?.totalCount,
    },
    {
      id: 'active',
      label: intl.formatMessage(CollectiveStatusMessages[COLLECTIVE_STATUS.ACTIVE]),
      filter: { status: COLLECTIVE_STATUS.ACTIVE, type: [CollectiveType.COLLECTIVE, CollectiveType.FUND] },
      count: metadata?.host?.active?.totalCount,
    },
    {
      id: 'frozen',
      label: intl.formatMessage(CollectiveStatusMessages[COLLECTIVE_STATUS.FROZEN]),
      filter: { status: COLLECTIVE_STATUS.FROZEN, type: [CollectiveType.COLLECTIVE, CollectiveType.FUND] },
      count: metadata?.host?.frozen?.totalCount,
    },
    {
      id: 'unhosted',
      label: intl.formatMessage(CollectiveStatusMessages[COLLECTIVE_STATUS.UNHOSTED]),
      filter: { status: COLLECTIVE_STATUS.UNHOSTED, type: [CollectiveType.COLLECTIVE, CollectiveType.FUND] },
      count: metadata?.host?.unhosted?.totalCount,
    },
  ];

  const queryFilter = useQueryFilter({
    filters,
    schema,
    toVariables,
    views,
    meta: { currency: metadata?.host?.currency, currencies: metadata?.host?.all?.currencies },
  });

  const { data, error, loading, refetch } = useQuery(hostedCollectivesQuery, {
    variables: { hostSlug, ...queryFilter.variables },
    context: API_V2_CONTEXT,
    fetchPolicy: typeof window !== 'undefined' ? 'cache-and-network' : 'cache-first',
  });

  useEffect(() => {
    if (subpath[0] !== ((showCollectiveOverview as Collective)?.id || showCollectiveOverview)) {
      handleDrawer(subpath[0]);
    }
  }, [subpath[0]]);

  const handleDrawer = (collective: Collective | string | undefined) => {
    if (collective) {
      pushSubpath(typeof collective === 'string' ? collective : collective.id);
    } else {
      pushSubpath(undefined);
    }
    setShowCollectiveOverview(collective);
  };

  const handleEdit = () => {
    refetchMetadata();
    refetch();
  };
  const isUnhosted = queryFilter.values?.status === COLLECTIVE_STATUS.UNHOSTED;
  const hostedAccounts = data?.host?.hostedAccounts;
  const onClickRow = row => handleDrawer(row.original);
  return (
    <div className="flex max-w-screen-lg flex-col gap-4">
      <DashboardHeader
        title={<FormattedMessage id="HostedCollectives" defaultMessage="Hosted Collectives" />}
        actions={
          <ExportHostedCollectivesCSVModal
            open={displayExportCSVModal}
            setOpen={setDisplayExportCSVModal}
            queryFilter={queryFilter}
            account={data?.host}
            isHostReport
            trigger={
              <Button size="sm" variant="outline" onClick={() => setDisplayExportCSVModal(true)}>
                <FormattedMessage id="Export.Format" defaultMessage="Export {format}" values={{ format: 'CSV' }} />
              </Button>
            }
          />
        }
      />
      <Filterbar {...queryFilter} />
      {error && <MessageBoxGraphqlError error={error} mb={2} />}
      {!error && !loading && !hostedAccounts?.nodes.length ? (
        <EmptyResults
          hasFilters={queryFilter.hasFilters}
          entityType="COLLECTIVES"
          onResetFilters={() => queryFilter.resetFilters({})}
        />
      ) : (
        <React.Fragment>
          <DataTable
            data-cy="transactions-table"
            innerClassName="text-muted-foreground"
            columns={compact([
              cols.collective,
              cols.team,
              !isUnhosted && cols.fee,
              !isUnhosted && cols.hostedSince,
              cols.consolidatedBalance,
              cols.actions,
            ])}
            data={hostedAccounts?.nodes || []}
            loading={loading}
            mobileTableView
            compact
            meta={
              {
                intl,
                onClickRow,
                onEdit: handleEdit,
                host: data?.host,
                openCollectiveDetails: handleDrawer,
              } as HostedCollectivesDataTableMeta
            }
            onClickRow={onClickRow}
            getRowDataCy={row => `collective-${row.original.slug}`}
          />
          <Pagination queryFilter={queryFilter} total={hostedAccounts?.totalCount} />
        </React.Fragment>
      )}

      <Drawer
        open={Boolean(showCollectiveOverview)}
        onClose={() => handleDrawer(null)}
        className={'max-w-2xl'}
        showActionsContainer
        showCloseButton
      >
        {showCollectiveOverview && (
          <CollectiveDetails
            collective={isString(showCollectiveOverview) ? null : showCollectiveOverview}
            collectiveId={isString(showCollectiveOverview) ? showCollectiveOverview : null}
            host={data?.host}
            onCancel={() => handleDrawer(null)}
            openCollectiveDetails={handleDrawer}
            loading={loading}
            onEdit={handleEdit}
          />
        )}
      </Drawer>
    </div>
  );
};

export default HostedCollectives;
