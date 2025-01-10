import React from 'react';
import { gql, useQuery } from '@apollo/client';
import clsx from 'clsx';
import { isEmpty, pick } from 'lodash';
import { AlertTriangle, ArrowLeft, ArrowLeftRightIcon, ArrowRight, Undo } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { API_V2_CONTEXT } from '../../../../lib/graphql/helpers';
import type { Account } from '@/lib/graphql/types/v2/schema';
import { i18nExpenseType } from '@/lib/i18n/expense';
import { i18nTransactionKind } from '@/lib/i18n/transaction';

import StackedAvatars from '@/components/StackedAvatars';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/Badge';

import { AccountHoverCard } from '../../../AccountHoverCard';
import Avatar from '../../../Avatar';
import { CopyID } from '../../../CopyId';
import DateTime from '../../../DateTime';
import DrawerHeader from '../../../DrawerHeader';
import FormattedMoneyAmount from '../../../FormattedMoneyAmount';
import Link from '../../../Link';
import MessageBoxGraphqlError from '../../../MessageBoxGraphqlError';
import { Button } from '../../../ui/Button';
import { DataList, DataListItem, DataListItemLabel, DataListItemValue } from '../../../ui/DataList';
import { InfoList, InfoListItem } from '../../../ui/InfoList';
import { Sheet, SheetContent } from '../../../ui/Sheet';
import { Skeleton } from '../../../ui/Skeleton';

const transactionsTableColumns = [
  {
    accessorKey: 'clearedAt',
    header: () => <FormattedMessage defaultMessage="Effective Date" id="Gh3Obs" />,
    cell: ({ cell, row }) => {
      const clearedAt = cell.getValue();
      if (!clearedAt) {
        return (
          <div className="whitespace-nowrap text-green-500">
            <DateTime dateStyle="medium" timeStyle="short" value={row.original.createdAt} />
          </div>
        );
      }
      return (
        <div className="whitespace-nowrap">
          <DateTime dateStyle="medium" timeStyle="short" value={clearedAt} />
        </div>
      );
    },
  },
  {
    accessorKey: 'account',
    header: () => <FormattedMessage defaultMessage="Recipient/Sender" id="YT2bNN" />,
    cell: ({ cell, row }) => {
      const account = cell.getValue();
      const transaction = row.original;
      return (
        <AccountHoverCard
          account={account}
          trigger={
            <div className="flex items-center gap-1 truncate">
              {transaction.type === 'DEBIT' ? (
                <ArrowLeft className="inline-block shrink-0 text-green-600" size={16} />
              ) : (
                <ArrowRight className="inline-block shrink-0" size={16} />
              )}
              <Avatar collective={account} radius={20} />
              <span className="truncate">{account?.name}</span>
            </div>
          }
        />
      );
    },
  },
  {
    accessorKey: 'kind',
    header: () => <FormattedMessage defaultMessage="Kind" id="Transaction.Kind" />,
    cell: ({ cell, table, row }) => {
      const { intl } = table.options.meta;
      const kind = cell.getValue();
      const kindLabel = i18nTransactionKind(intl, kind);
      const isExpense = kind === 'EXPENSE';
      const { isRefund, isRefunded, isInReview, isDisputed, expense, isOrderRejected } = row.original;

      return (
        <div className="flex justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate">{kindLabel}</span>
            {isExpense && expense?.type && <Badge size="xs">{i18nExpenseType(intl, expense.type)}</Badge>}
          </div>
          <div>
            {isRefunded && !isOrderRejected && (
              <Badge size="xs" type={'warning'} className="items-center gap-1">
                <Undo size={12} />
                <FormattedMessage defaultMessage="Refunded" id="Gs86nL" />
              </Badge>
            )}
            {isRefund && (
              <Badge size="xs" type={'success'} className="items-center gap-1">
                <FormattedMessage id="Refund" defaultMessage="Refund" />
              </Badge>
            )}
            {isDisputed && (
              <Badge size="xs" type={'error'} className="items-center gap-1">
                <AlertTriangle size={12} />
                <FormattedMessage defaultMessage="Disputed" id="X1pwhF" />
              </Badge>
            )}
            {isOrderRejected && isRefunded && (
              <Badge size="xs" type={'error'} className="items-center gap-1">
                <AlertTriangle size={12} />
                <FormattedMessage defaultMessage="Rejected" id="5qaD7s" />
              </Badge>
            )}
            {isInReview && (
              <Badge size="xs" type={'warning'} className="items-center gap-1">
                <AlertTriangle size={12} />
                <FormattedMessage id="order.in_review" defaultMessage="In Review" />
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'netAmount',
    header: () => <FormattedMessage defaultMessage="Amount" id="Fields.amount" />,
    cell: ({ cell, row }) => {
      const netAmount = cell.getValue();
      const transaction = row.original;

      return (
        <div
          className={clsx(
            'truncate font-semibold antialiased',
            transaction.type === 'CREDIT' ? 'text-green-600' : 'text-slate-700',
          )}
        >
          <FormattedMoneyAmount
            amount={netAmount.valueInCents}
            currency={netAmount.currency}
            precision={2}
            showCurrencyCode={false}
          />
        </div>
      );
    },
  },
];

const contributorDrawerQuery = gql`
  query ContributorDrawer($account: AccountReferenceInput!, $host: AccountReferenceInput!) {
    contributor(account: $account, host: $host) {
      id
      roles
      account {
        id
        legacyId
        slug
        name
        legalName
        type
        imageUrl(height: 64)
        ... on Individual {
          email
        }
        admins: members(role: ADMIN) {
          nodes {
            id
            account {
              id
              slug
              name
              type
              imageUrl(height: 64)
            }
          }
        }
      }
      accountsContributedTo {
        id
        slug
        name
        type
        imageUrl(height: 64)
      }
    }
    transactions(fromAccount: $account, host: $host, limit: 10, offset: 0, kind: [ADDED_FUNDS, CONTRIBUTION, EXPENSE]) {
      nodes {
        id
        clearedAt
        createdAt
        type
        kind
        description
        isRefund
        isRefunded
        isInReview
        isDisputed
        isOrderRejected
        amount {
          valueInCents
          currency
        }
        netAmount {
          valueInCents
          currency
        }
        account {
          id
          slug
          name
          imageUrl
        }
      }
    }
  }
`;

type ContributionDrawerProps = {
  open: boolean;
  onClose: () => void;
  account?: Partial<Account>;
  host?: Partial<Account>;
};

export function ContributorDrawer(props: ContributionDrawerProps) {
  const intl = useIntl();

  const query = useQuery(contributorDrawerQuery, {
    context: API_V2_CONTEXT,
    variables: {
      account: pick(props.account, ['slug', 'id']),
      host: props.host,
    },
  });

  const isLoading = !query.called || query.loading || !query.data;
  const dropdownTriggerRef = React.useRef();
  const account = query.data?.contributor?.account;

  const admins = query.data?.contributor?.account?.admins?.nodes || [];
  const actions = {};

  return (
    <Sheet open={props.open} onOpenChange={isOpen => !isOpen && props.onClose()}>
      <SheetContent className="flex max-w-2xl flex-col overflow-hidden">
        <DrawerHeader
          actions={actions}
          dropdownTriggerRef={dropdownTriggerRef}
          entityName={<FormattedMessage defaultMessage="Account" id="TwyMau" />}
          forceMoreActions
          entityIdentifier={
            <CopyID
              value={props.account.id}
              tooltipLabel={<FormattedMessage defaultMessage="Copy Account ID" id="D+P5Yx" />}
            >
              #{props.account.id}
            </CopyID>
          }
          entityLabel={
            isLoading ? (
              <Skeleton className="h-6 w-56" />
            ) : (
              <div className="flex items-center gap-1 text-base font-semibold text-foreground">
                <Avatar radius={24} collective={account} />
                {account.name}
              </div>
            )
          }
        />
        <div className="flex-grow overflow-auto px-8 py-4">
          {query.error ? (
            <MessageBoxGraphqlError error={query.error} />
          ) : (
            <React.Fragment>
              <div className="text-sm">
                <InfoList className="mb-6">
                  <InfoListItem
                    className="border-b border-t-0"
                    title={<FormattedMessage defaultMessage="Accounts Contributed To" id="aJC5lz" />}
                    value={
                      isLoading ? (
                        <Skeleton className="h-6 w-48" />
                      ) : (
                        <StackedAvatars
                          accounts={query.data.contributor.accountsContributedTo}
                          imageSize={24}
                          maxDisplayedAvatars={15}
                          withHoverCard={{ includeAdminMembership: true }}
                        />
                      )
                    }
                  />
                  {!isEmpty(admins) && (
                    <InfoListItem
                      className="border-b border-t-0"
                      title={<FormattedMessage defaultMessage="Administrators" id="administrators" />}
                      value={
                        isLoading ? (
                          <Skeleton className="h-6 w-48" />
                        ) : (
                          <StackedAvatars
                            accounts={admins.map(admin => admin.account)}
                            imageSize={24}
                            maxDisplayedAvatars={15}
                            withHoverCard={{ includeAdminMembership: true }}
                          />
                        )
                      }
                    />
                  )}
                </InfoList>

                <DataList className="mb-4">
                  {account?.legalName && (
                    <DataListItem>
                      <DataListItemLabel>
                        <FormattedMessage defaultMessage="Legal Name" id="LegalName" />
                      </DataListItemLabel>
                      <DataListItemValue>{account.legalName}</DataListItemValue>
                    </DataListItem>
                  )}
                  {account?.email && (
                    <DataListItem>
                      <DataListItemLabel>
                        <FormattedMessage defaultMessage="Email" id="Email" />
                      </DataListItemLabel>
                      <DataListItemValue>{account.email}</DataListItemValue>
                    </DataListItem>
                  )}
                </DataList>

                <div>
                  <div className="flex items-center justify-between gap-2 py-4">
                    <div className="text-slate-80 w-fit text-base font-bold leading-6">
                      <FormattedMessage id="menu.transactions" defaultMessage="Transactions" />
                    </div>
                    <hr className="flex-grow border-neutral-300" />
                    <Button
                      asChild
                      variant="outline"
                      size="xs"
                      disabled={isLoading}
                      loading={isLoading}
                      data-cy="view-transactions-button"
                    >
                      <Link
                        href={`dashboard/${props.host.slug}/host-transactions?searchTerm=@${account?.slug}`}
                        className="flex flex-row items-center gap-2.5"
                      >
                        <ArrowLeftRightIcon size={16} className="text-muted-foreground" />
                        <FormattedMessage defaultMessage="View transactions" id="DfQJQ6" />
                      </Link>
                    </Button>
                  </div>

                  <DataTable
                    innerClassName="text-xs text-muted-foreground"
                    columns={transactionsTableColumns}
                    data={query.data?.transactions?.nodes || []}
                    mobileTableView
                    loading={isLoading}
                    compact
                    meta={{ intl }}
                  />
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
