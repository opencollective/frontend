import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { isEmpty, omit } from 'lodash';
import { useRouter } from 'next/router';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import type { FilterConfig } from '../../../../lib/filters/filter-types';
import { integer, isMulti } from '../../../../lib/filters/schemas';
import { API_V2_CONTEXT } from '../../../../lib/graphql/helpers';
import type { Contributor } from '../../../../lib/graphql/types/v2/schema';
import { MemberRole } from '../../../../lib/graphql/types/v2/schema';
import useQueryFilter from '../../../../lib/hooks/useQueryFilter';
import { sortSelectOptions } from '../../../../lib/utils';
import formatMemberRole from '@/lib/i18n/member-role';

import StackedAvatars from '@/components/StackedAvatars';

import Avatar from '../../../Avatar';
import MessageBoxGraphqlError from '../../../MessageBoxGraphqlError';
import { DataTable } from '../../../table/DataTable';
import { Span } from '../../../Text';
import DashboardHeader from '../../DashboardHeader';
import { EmptyResults } from '../../EmptyResults';
import ComboSelectFilter from '../../filters/ComboSelectFilter';
import { emailFilter } from '../../filters/EmailFilter';
import { Filterbar } from '../../filters/Filterbar';
import { Pagination } from '../../filters/Pagination';
import type { DashboardSectionProps } from '../../types';
import { makePushSubpath } from '../../utils';

import { ContributorDrawer } from './ContributorDrawer';

const FilterableRoles = omit(MemberRole, [
  MemberRole.CONNECTED_ACCOUNT,
  MemberRole.CONTRIBUTOR,
  MemberRole.FUNDRAISER,
  MemberRole.HOST,
]);
const MemberRoleSchema = isMulti(z.nativeEnum(FilterableRoles)).optional();
const memberRoleFilter: FilterConfig<z.infer<typeof MemberRoleSchema>> = {
  schema: MemberRoleSchema,
  filter: {
    labelMsg: defineMessage({ id: 'members.role.label', defaultMessage: 'Role' }),
    Component: ({ valueRenderer, intl, ...props }) => (
      <ComboSelectFilter
        isMulti
        options={Object.values(FilterableRoles)
          .map(value => ({ label: valueRenderer({ intl, value }), value }))
          .sort(sortSelectOptions)}
        {...props}
      />
    ),
    valueRenderer: ({ intl, value }) => {
      const message = { id: `Member.Role.${value}` };
      return intl.formatMessage(message);
    },
  },
};

enum ContributorsTab {
  ALL = 'ALL',
  FOLLOWERS = 'FOLLOWERS',
  BACKERS = 'BACKERS',
}

const PAGE_SIZE = 15;

const dashboardHostCommunityQuery = gql`
  query DashboardHostCommunity($slug: String!, $offset: Int, $limit: Int, $role: [MemberRole!], $email: EmailAddress) {
    contributors(host: { slug: $slug }, role: $role, email: $email, offset: $offset, limit: $limit) {
      totalCount
      limit
      offset
      nodes {
        id
        roles
        account {
          id
          legacyId
          slug
          name
          type
          imageUrl(height: 64)
        }
        accountsContributedTo {
          id
          slug
          name
          type
          imageUrl(height: 64)
        }
      }
    }
  }
`;

const getColumns = ({ intl }) => {
  const account = {
    accessorKey: 'account',
    header: intl.formatMessage({ defaultMessage: 'Account', id: 'TwyMau' }),
    cell: ({ cell }) => {
      const account = cell.getValue();
      return (
        <div className="flex max-w-[200px] items-center">
          <Avatar size={24} collective={account} mr={2} />
          <Span as="span" truncateOverflow>
            {account?.name}
          </Span>
        </div>
      );
    },
  };

  const accountsContributedTo = {
    accessorKey: 'accountsContributedTo',
    header: intl.formatMessage({ defaultMessage: 'Accounts Contributed To', id: 'aJC5lz' }),
    cell: ({ cell }) => {
      const accounts = cell.getValue();
      return (
        <StackedAvatars
          accounts={accounts}
          imageSize={24}
          maxDisplayedAvatars={15}
          withHoverCard={{ includeAdminMembership: true }}
        />
      );
    },
  };

  const roles = {
    accessorKey: 'roles',
    header: intl.formatMessage({ defaultMessage: 'Roles', id: 'c35gM5' }),
    cell: ({ cell }) => {
      const roles = cell.getValue();
      return roles.map(role => formatMemberRole(intl, role)).join(', ');
    },
  };

  return [account, roles, accountsContributedTo];
};

type ContributorsProps = DashboardSectionProps;

const HostCommunity = ({ accountSlug, subpath }: ContributorsProps) => {
  const intl = useIntl();
  const router = useRouter();
  const pushSubpath = makePushSubpath(router);

  const views = [
    {
      id: ContributorsTab.ALL,
      label: intl.formatMessage({ defaultMessage: 'All', id: 'zQvVDJ' }),
      filter: {},
    },
  ];

  const queryFilter = useQueryFilter({
    views,
    schema: z.object({
      limit: integer.default(PAGE_SIZE),
      offset: integer.default(0),
      role: memberRoleFilter.schema,
      email: emailFilter.schema,
    }),
    toVariables: {
      email: emailFilter.toVariables,
    },
    filters: {
      role: memberRoleFilter.filter,
      email: emailFilter.filter,
    },
  });

  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQuery(dashboardHostCommunityQuery, {
    variables: {
      slug: accountSlug,
      ...queryFilter.variables,
    },
    context: API_V2_CONTEXT,
  });

  const contributors = data?.contributors?.nodes || [];
  const loading = queryLoading;
  const error = queryError;

  const columns = React.useMemo(() => getColumns({ intl }), [intl, queryFilter.activeViewId]);

  return (
    <div className="flex max-w-screen-lg flex-col gap-4">
      <DashboardHeader
        title={<FormattedMessage id="community" defaultMessage="Community" />}
        description={
          <FormattedMessage id="HostCommunity.Description" defaultMessage="Contributors to all accounts you host" />
        }
      />

      <Filterbar {...queryFilter} />

      {error ? (
        <MessageBoxGraphqlError error={error} />
      ) : !loading && contributors.length === 0 ? (
        <EmptyResults hasFilters={queryFilter.hasFilters} onResetFilters={() => queryFilter.resetFilters({})} />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable<Contributor, Contributor>
            loading={loading}
            columns={columns}
            data={contributors}
            nbPlaceholders={queryFilter.values?.limit || 10}
            onClickRow={row => {
              pushSubpath(row.original.account.id as string);
            }}
            mobileTableView
          />
          <Pagination queryFilter={queryFilter} total={data?.contributors?.totalCount} />
        </div>
      )}
      {!isEmpty(subpath[0]) && (
        <ContributorDrawer
          account={{ id: subpath[0] }}
          host={{ slug: accountSlug }}
          onClose={() => pushSubpath('')}
          open
        />
      )}
    </div>
  );
};

export default HostCommunity;
