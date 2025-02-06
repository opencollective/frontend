import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { isNil } from 'lodash';
import { AlertTriangle, ArrowLeft, ArrowRight, InfoIcon, Undo } from 'lucide-react';
// eslint-disable-next-line no-restricted-imports -- components/Link does not currently accept a ref, which is required when used 'asChild' of HoverCardTrigger
import Link from 'next/link';
import { FormattedMessage, useIntl } from 'react-intl';

import type { GetActions } from '../../../../lib/actions/types';
import { API_V2_CONTEXT } from '../../../../lib/graphql/helpers';
import { usePrevious } from '../../../../lib/hooks/usePrevious';
import { i18nTransactionKind, i18nTransactionType } from '../../../../lib/i18n/transaction';
import { getDashboardRoute } from '../../../../lib/url-helpers';

import { AccountHoverCard, accountHoverCardFields } from '../../../AccountHoverCard';
import { getCategoryLabel } from '../../../AccountingCategorySelect';
import Avatar from '../../../Avatar';
import ExpenseBudgetItem from '../../../budget/ExpenseBudgetItem';
import OrderBudgetItem from '../../../budget/OrderBudgetItem';
import { CopyID } from '../../../CopyId';
import DateTime from '../../../DateTime';
import DrawerHeader from '../../../DrawerHeader';
import FormattedMoneyAmount from '../../../FormattedMoneyAmount';
import MessageBoxGraphqlError from '../../../MessageBoxGraphqlError';
import { PaymentMethodLabel } from '../../../PaymentMethodLabel';
import { Badge } from '../../../ui/Badge';
import { DataList, DataListItem, DataListItemLabel, DataListItemValue } from '../../../ui/DataList';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../../ui/HoverCard';
import { InfoList, InfoListItem } from '../../../ui/InfoList';
import { Sheet, SheetBody, SheetContent } from '../../../ui/Sheet';
import { Skeleton } from '../../../ui/Skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../ui/Tooltip';
import { DashboardContext } from '../../DashboardContext';

import type { TransactionDetailsQueryNode } from './types';

const transactionQuery = gql`
  query TransactionDetails($transaction: TransactionReferenceInput!) {
    transaction(transaction: $transaction) {
      id
      legacyId
      group
      amount {
        valueInCents
        currency
      }
      paymentProcessorFee(fetchPaymentProcessorFee: true) {
        valueInCents
        currency
      }
      hostFee {
        valueInCents
        currency
      }
      netAmount {
        valueInCents
        currency
      }
      taxAmount(fetchTax: true) {
        valueInCents
        currency
      }
      oppositeTransaction {
        id
        legacyId
      }
      paymentMethod {
        id
        type
        service
      }
      type
      kind
      description
      createdAt
      clearedAt
      isRefunded
      isRefund
      isInReview
      isDisputed
      isOrderRejected
      merchantId
      account {
        id
        name
        slug
        isIncognito
        description
        type
        ... on AccountWithHost {
          host {
            id
            name
            slug
          }
          approvedAt
        }
        ... on AccountWithParent {
          parent {
            id
            name
            slug
          }
        }
        ...AccountHoverCardFields
      }
      fromAccount {
        id
        ... on AccountWithParent {
          parent {
            id
          }
        }
      }
      toAccount {
        id
        ... on AccountWithHost {
          host {
            id
          }
        }
      }
      oppositeAccount {
        id
        name
        slug
        imageUrl
        type
        ...AccountHoverCardFields
      }

      permissions {
        id
        canRefund
        canDownloadInvoice
        canReject
      }
      order {
        id
        legacyId
        status
        description
        processedAt
        createdAt
        amount {
          valueInCents
          currency
        }
        toAccount {
          id
          slug
          ... on AccountWithHost {
            host {
              id
              slug
            }
          }
        }
        fromAccount {
          id
          slug
        }
        accountingCategory {
          id
          code
          name
          friendlyName
        }
      }
      expense {
        id
        status
        tags
        type
        feesPayer
        amount
        currency
        description
        legacyId
        # limit: 1 as current best practice to avoid the API fetching entries it doesn't need
        comments(limit: 1) {
          totalCount
        }
        payoutMethod {
          id
          type
        }
        account {
          id
          slug
        }
        createdByAccount {
          id
          slug
        }
        permissions {
          id
        }
        createdAt
        payee {
          id
          slug
          imageUrl
        }
        accountingCategory {
          id
          code
          name
          friendlyName
        }
        host {
          id
          slug
        }
      }
      refundTransaction {
        id
        group
        createdAt
      }
    }
  }
  ${accountHoverCardFields}
`;

export function TransactionDrawer({ open, onOpenChange, onCloseAutoFocus, transactionId, getActions }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-cy="transactions-drawer" className="max-w-xl" onCloseAutoFocus={onCloseAutoFocus}>
        <TransactionDetails transactionId={transactionId} getActions={getActions} />
      </SheetContent>
    </Sheet>
  );
}

interface TransactionDetailsProps {
  transactionId: number;
  getActions: GetActions<TransactionDetailsQueryNode>;
}

const getExpenseUrl = (dashboardAccount, expense) => {
  if (dashboardAccount?.isHost && expense.host?.id === dashboardAccount.id) {
    return getDashboardRoute(expense.host, `host-expenses?openExpenseId=${expense.legacyId}`);
  } else if (dashboardAccount?.id === expense.account.id) {
    return getDashboardRoute(expense.account, `expenses?openExpenseId=${expense.legacyId}`);
  }
  return `/${expense.account.slug}/expenses/${expense.legacyId}`;
};

const getContributionUrl = (dashboardAccount, order) => {
  if (dashboardAccount?.isHost && order.toAccount.host?.id === dashboardAccount.id) {
    return getDashboardRoute(order.toAccount.host, `orders?orderId=${order.legacyId}`);
  } else if (dashboardAccount?.id === order.toAccount.id) {
    return getDashboardRoute(order.toAccount, `incoming-contributions?orderId=${order.legacyId}`);
  } else if (dashboardAccount?.id === order.fromAccount.id) {
    return getDashboardRoute(order.fromAccount, `outgoing-contributions?orderId=${order.legacyId}`);
  }
  return `/${order.toAccount.slug}/contributions/${order.legacyId}`;
};

function TransactionDetails({ transactionId, getActions }: TransactionDetailsProps) {
  const intl = useIntl();
  const prevTransactionId = usePrevious(transactionId);
  const id = transactionId || prevTransactionId;
  const { data, refetch, loading, error } = useQuery(transactionQuery, {
    variables: { transaction: { legacyId: Number(id) } },
    context: API_V2_CONTEXT,
  });
  const { account } = React.useContext(DashboardContext);
  const { transaction } = data || { transaction: null };
  const dropdownTriggerRef = React.useRef();
  const actions = getActions(transaction, dropdownTriggerRef, refetch);
  const accountingCategory = transaction?.expense?.accountingCategory || transaction?.order?.accountingCategory;

  let expenseUrl, contributionUrl;

  if (transaction?.expense) {
    expenseUrl = getExpenseUrl(account, transaction.expense);
  }
  if (transaction?.order) {
    contributionUrl = getContributionUrl(account, transaction.order);
  }
  return (
    <React.Fragment>
      <DrawerHeader
        actions={actions}
        dropdownTriggerRef={dropdownTriggerRef}
        entityName={<FormattedMessage defaultMessage="Transaction" id="1+ROfp" />}
        entityIdentifier={
          <CopyID value={id} tooltipLabel={<FormattedMessage defaultMessage="Copy transaction ID" id="zzd7ZI" />}>
            #{id}
          </CopyID>
        }
        entityLabel={
          <React.Fragment>
            {loading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              transaction?.netAmount && (
                <span className={'text-2xl font-bold text-foreground'}>
                  <FormattedMoneyAmount
                    amount={transaction?.netAmount.valueInCents}
                    currency={transaction?.netAmount.currency}
                    precision={2}
                    currencyCodeClassName="text-muted-foreground font-normal"
                    showCurrencyCode={true}
                  />
                </span>
              )
            )}
            {transaction?.isRefunded && !transaction?.isOrderRejected && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge size="sm" type="warning" className="gap-1">
                    <Undo size={16} />
                    <FormattedMessage defaultMessage="Refunded" id="Gs86nL" />
                  </Badge>
                </TooltipTrigger>

                <TooltipContent>
                  <FormattedMessage
                    defaultMessage="Refunded on {date}"
                    id="CE7lQu"
                    values={{
                      date: (
                        <DateTime
                          dateStyle="medium"
                          timeStyle="short"
                          value={transaction?.refundTransaction?.createdAt}
                        />
                      ),
                    }}
                  />
                </TooltipContent>
              </Tooltip>
            )}
            {transaction?.isRefunded && transaction?.isOrderRejected && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge size="sm" type="error" className="gap-1">
                    <AlertTriangle size={16} />
                    <FormattedMessage defaultMessage="Rejected" id="5qaD7s" />
                  </Badge>
                </TooltipTrigger>

                <TooltipContent>
                  <FormattedMessage
                    defaultMessage="Rejected and refunded on {date}"
                    id="4n+cMX"
                    values={{
                      date: (
                        <DateTime
                          dateStyle="medium"
                          timeStyle="short"
                          value={transaction?.refundTransaction?.createdAt}
                        />
                      ),
                    }}
                  />
                </TooltipContent>
              </Tooltip>
            )}
          </React.Fragment>
        }
      />
      <SheetBody className="pt-0">
        <div className="text-sm">
          <div className="flex flex-col gap-3 sm:gap-2">
            {loading ? (
              <Skeleton className="mt-6 h-8 w-1/2" />
            ) : error ? (
              <MessageBoxGraphqlError error={error} />
            ) : transaction ? (
              <React.Fragment>
                <InfoList className="mb-6 sm:grid-cols-2">
                  <InfoListItem
                    className="border-t-0 border-b"
                    title={<FormattedMessage defaultMessage="Account" id="TwyMau" />}
                    value={
                      <AccountHoverCard
                        account={transaction?.account}
                        trigger={
                          <Link
                            className="flex items-center gap-1 font-medium hover:text-primary hover:underline"
                            href={`/${transaction?.account.slug}`}
                          >
                            <Avatar radius={20} collective={transaction?.account} />
                            {transaction?.account.name}
                          </Link>
                        }
                      />
                    }
                  />

                  <InfoListItem
                    className="border-t-0 border-b"
                    title={
                      transaction.type === 'CREDIT' ? (
                        <FormattedMessage defaultMessage="Sender" id="nbwXXN" />
                      ) : (
                        <FormattedMessage defaultMessage="Recipient" id="8Rkoyb" />
                      )
                    }
                    value={
                      <AccountHoverCard
                        account={transaction?.oppositeAccount}
                        trigger={
                          <Link
                            className="flex items-center gap-1 font-medium hover:text-primary hover:underline"
                            href={`/${transaction?.oppositeAccount?.slug}`}
                          >
                            {transaction.type === 'CREDIT' ? (
                              <ArrowLeft className="inline-block shrink-0 text-green-600" size={16} />
                            ) : (
                              <ArrowRight className="inline-block shrink-0" size={16} />
                            )}
                            <Avatar radius={20} collective={transaction?.oppositeAccount} />
                            {transaction?.oppositeAccount?.name}
                          </Link>
                        }
                      />
                    }
                  />
                </InfoList>

                <DataList>
                  <DataListItem>
                    <DataListItemLabel>
                      <FormattedMessage id="expense.incurredAt" defaultMessage="Date" />
                    </DataListItemLabel>
                    <DataListItemValue>
                      <DateTime dateStyle="medium" timeStyle="short" value={transaction.createdAt} />
                    </DataListItemValue>
                  </DataListItem>

                  <DataListItem>
                    <DataListItemLabel>
                      <div className="flex items-center gap-1">
                        <FormattedMessage defaultMessage="Effective Date" id="Gh3Obs" />
                        <Tooltip>
                          <TooltipTrigger className="cursor-help" onClick={e => e.preventDefault()}>
                            <InfoIcon size={16} />
                          </TooltipTrigger>
                          <TooltipContent onPointerDownOutside={e => e.preventDefault()}>
                            <FormattedMessage
                              defaultMessage="The date funds were cleared on your bank, Wise, PayPal, Stripe or any other external account holding these funds."
                              id="s3O6iq"
                            />
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </DataListItemLabel>
                    <DataListItemValue>
                      <DateTime dateStyle="medium" timeStyle="short" value={transaction.clearedAt} />
                    </DataListItemValue>
                  </DataListItem>

                  <DataListItem
                    label={<FormattedMessage defaultMessage="Type" id="+U6ozc" />}
                    value={i18nTransactionType(intl, transaction?.type)}
                  />

                  <DataListItem
                    label={<FormattedMessage id="Transaction.Kind" defaultMessage="Kind" />}
                    value={
                      <div className="flex items-center gap-1">
                        {i18nTransactionKind(intl, transaction?.kind)}{' '}
                        {transaction?.isRefund && (
                          <Badge size="xs" type="success" className="gap-1">
                            <FormattedMessage id="Refund" defaultMessage="Refund" />
                          </Badge>
                        )}
                      </div>
                    }
                  />
                  <DataListItem
                    label={<FormattedMessage id="Fields.amount" defaultMessage="Amount" />}
                    value={
                      <FormattedMoneyAmount
                        amount={transaction.amount.valueInCents}
                        currency={transaction.amount.currency}
                        precision={2}
                        showCurrencyCode={false}
                      />
                    }
                  />
                  {!isNil(transaction?.paymentProcessorFee?.valueInCents) &&
                    transaction?.paymentProcessorFee?.valueInCents !== 0 && (
                      <DataListItem
                        label={<FormattedMessage id="contribution.paymentFee" defaultMessage="Payment processor fee" />}
                        value={
                          <FormattedMoneyAmount
                            amount={transaction?.paymentProcessorFee.valueInCents}
                            currency={transaction?.paymentProcessorFee.currency}
                            precision={2}
                            showCurrencyCode={false}
                          />
                        }
                      />
                    )}
                  {!isNil(transaction?.hostFee?.valueInCents) && transaction?.hostFee?.valueInCents !== 0 && (
                    <DataListItem
                      label={<FormattedMessage id="HostFee" defaultMessage="Host fee" />}
                      value={
                        <FormattedMoneyAmount
                          amount={transaction?.hostFee.valueInCents}
                          currency={transaction?.hostFee.currency}
                          precision={2}
                          showCurrencyCode={false}
                        />
                      }
                    />
                  )}
                  {!isNil(transaction?.taxAmount?.valueInCents) && transaction?.taxAmount?.valueInCents !== 0 && (
                    <DataListItem
                      label={<FormattedMessage defaultMessage="Taxes" id="r+dgiv" />}
                      value={
                        <FormattedMoneyAmount
                          amount={transaction?.taxAmount.valueInCents}
                          currency={transaction?.taxAmount.currency}
                          precision={2}
                          showCurrencyCode={false}
                        />
                      }
                    />
                  )}
                  {transaction?.netAmount?.valueInCents !== transaction?.amount.valueInCents && (
                    <DataListItem
                      label={<FormattedMessage defaultMessage="Net Amount" id="FxUka3" />}
                      value={
                        <FormattedMoneyAmount
                          amount={transaction?.netAmount.valueInCents}
                          currency={transaction?.netAmount.currency}
                          precision={2}
                          showCurrencyCode={false}
                        />
                      }
                    />
                  )}
                  <DataListItem
                    label={<FormattedMessage defaultMessage="Payment method" id="Fields.paymentMethod" />}
                    value={
                      transaction.paymentMethod ? (
                        <PaymentMethodLabel {...transaction.paymentMethod} />
                      ) : (
                        <span className="text-muted-foreground">
                          <FormattedMessage defaultMessage="None" id="450Fty" />
                        </span>
                      )
                    }
                  />
                  <DataListItem
                    label={<FormattedMessage defaultMessage="Merchant ID" id="EvIfQD" />}
                    value={
                      transaction.merchantId ? (
                        <CopyID value={transaction.merchantId}>{transaction.merchantId}</CopyID>
                      ) : (
                        <span className="text-muted-foreground">
                          <FormattedMessage defaultMessage="None" id="450Fty" />
                        </span>
                      )
                    }
                  />
                  <DataListItem
                    label={<FormattedMessage defaultMessage="Accounting Category" id="ckcrQ7" />}
                    value={
                      accountingCategory ? (
                        getCategoryLabel(intl, accountingCategory, true)
                      ) : (
                        <span className="text-muted-foreground">
                          <FormattedMessage defaultMessage="Not set" id="p5LNtB" />
                        </span>
                      )
                    }
                  />
                  <DataListItem
                    label={<FormattedMessage defaultMessage="Group ID" id="nBKj/i" />}
                    value={
                      <CopyID
                        value={transaction?.group}
                        tooltipLabel={<FormattedMessage defaultMessage="Copy transaction group ID" id="IFjSNc" />}
                      >
                        {transaction?.group}
                      </CopyID>
                    }
                  />

                  <DataListItem
                    label={
                      <div className="flex items-center gap-1">
                        <FormattedMessage defaultMessage="Opposite transaction ID" id="Cqy0IH" />

                        <Tooltip>
                          <TooltipTrigger className="cursor-help" onClick={e => e.preventDefault()}>
                            <InfoIcon size={16} />
                          </TooltipTrigger>
                          <TooltipContent onPointerDownOutside={e => e.preventDefault()}>
                            <FormattedMessage
                              defaultMessage="All transactions have an opposite debit or credit transaction"
                              id="Evzo/s"
                            />
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    }
                    value={
                      <CopyID
                        value={transaction?.oppositeTransaction?.legacyId}
                        tooltipLabel={<FormattedMessage defaultMessage="Copy opposite transaction ID" id="WgAGHq" />}
                      >
                        #{transaction?.oppositeTransaction?.legacyId}
                      </CopyID>
                    }
                  />

                  {transaction?.isRefund && transaction?.refundTransaction && (
                    <DataListItem
                      label={<FormattedMessage defaultMessage="Refund of transaction" id="OwAzRN" />}
                      value={
                        <CopyID
                          value={transaction?.refundTransaction?.id}
                          tooltipLabel={<FormattedMessage defaultMessage="Copy refund transaction ID" id="WRKLHX" />}
                        >
                          {transaction?.refundTransaction?.id}
                        </CopyID>
                      }
                    />
                  )}

                  {transaction?.expense?.account?.slug && (
                    <DataListItem
                      label={<FormattedMessage defaultMessage="Related expense" id="iuxiAF" />}
                      value={
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Link href={expenseUrl} className="underline hover:text-primary">
                              {transaction?.expense.description}
                            </Link>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-[420px] overflow-hidden p-0">
                            <ExpenseBudgetItem isInverted expense={transaction?.expense} showAmountSign />
                          </HoverCardContent>
                        </HoverCard>
                      }
                    />
                  )}
                  {transaction?.order && (
                    <DataListItem
                      label={<FormattedMessage defaultMessage="Related contribution" id="ySzqZN" />}
                      value={
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Link href={contributionUrl} className="underline hover:text-primary">
                              {transaction?.order.description}
                            </Link>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-[420px] p-0">
                            <OrderBudgetItem order={transaction?.order} showPlatformTip showAmountSign />
                          </HoverCardContent>
                        </HoverCard>
                      }
                    />
                  )}
                </DataList>
              </React.Fragment>
            ) : null}
          </div>
        </div>
      </SheetBody>
    </React.Fragment>
  );
}
