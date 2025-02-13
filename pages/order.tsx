import React from 'react';
import { themeGet } from '@styled-system/theme-get';
import { isEmpty, orderBy, partition, round, toNumber } from 'lodash';
import type { GetServerSideProps } from 'next';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';

import { getSSRQueryHelpers } from '../lib/apollo-client';
import { getCollectivePageMetadata } from '../lib/collective';
import dayjs from '../lib/dayjs';
import { API_V2_CONTEXT, gql } from '../lib/graphql/helpers';
import type { Account, AccountWithHost } from '../lib/graphql/types/v2/schema';
import useLoggedInUser from '../lib/hooks/useLoggedInUser';
import { usePrevious } from '../lib/hooks/usePrevious';
import { i18nPaymentMethodProviderType } from '../lib/i18n/payment-method-provider-type';
import { i18nTaxType } from '../lib/i18n/taxes';
import { getCollectivePageCanonicalURL } from '../lib/url-helpers';

import CollectiveNavbar from '../components/collective-navbar';
import { NAVBAR_CATEGORIES } from '../components/collective-navbar/constants';
import { accountNavbarFieldsFragment } from '../components/collective-navbar/fragments';
import Container from '../components/Container';
import { confirmContributionFieldsFragment } from '../components/contributions/ConfirmContributionForm';
import CreatePendingOrderModal from '../components/dashboard/sections/contributions/CreatePendingOrderModal';
import DateTime from '../components/DateTime';
import ErrorPage from '../components/ErrorPage';
import FormattedMoneyAmount from '../components/FormattedMoneyAmount';
import { Box, Flex, Grid } from '../components/Grid';
import HTMLContent from '../components/HTMLContent';
import PrivateInfoIcon from '../components/icons/PrivateInfoIcon';
import LinkCollective from '../components/LinkCollective';
import Loading from '../components/Loading';
import MessageBoxGraphqlError from '../components/MessageBoxGraphqlError';
import OrderStatusTag from '../components/orders/OrderStatusTag';
import ProcessOrderButtons, { hasProcessButtons } from '../components/orders/ProcessOrderButtons';
import Page from '../components/Page';
import PaymentMethodTypeWithIcon from '../components/PaymentMethodTypeWithIcon';
import StyledButton from '../components/StyledButton';
import StyledCard from '../components/StyledCard';
import StyledHr from '../components/StyledHr';
import StyledLink from '../components/StyledLink';
import StyledTag from '../components/StyledTag';
import StyledTooltip from '../components/StyledTooltip';
import Tags from '../components/Tags';
import { H1, H5, P, Span } from '../components/Text';
import { getDisplayedAmount } from '../components/transactions/TransactionItem';

import Custom404 from './404';

const orderPageQuery = gql`
  query OrderPage($legacyId: Int!, $collectiveSlug: String!) {
    order(order: { legacyId: $legacyId }) {
      id
      legacyId
      status
      description
      tags
      ...ConfirmContributionFields
      paymentMethod {
        id
        type
      }
      createdAt
      processedAt
      permissions {
        id
        canMarkAsExpired
        canMarkAsPaid
        canSetTags
        canEdit
      }
      transactions {
        id
        legacyId
        group
        description
        type
        kind
        createdAt
        order {
          id
        }
        amount {
          valueInCents
          currency
        }
        netAmount {
          valueInCents
          currency
        }
        taxAmount {
          valueInCents
          currency
        }
        taxInfo {
          id
          type
          rate
        }
        paymentProcessorFee {
          valueInCents
          currency
        }
        fromAccount {
          id
          slug
          type
          name
          imageUrl
          isIncognito
          ... on Individual {
            isGuest
          }
        }
        account {
          id
          slug
          type
          name
          imageUrl
        }
      }
    }
    account(slug: $collectiveSlug) {
      id
      legacyId
      slug
      name
      type
      isHost
      imageUrl
      backgroundImageUrl
      isActive
      description
      settings
      twitterHandle
      currency
      expensePolicy
      supportedExpenseTypes
      features {
        id
        ...NavbarFields
        MULTI_CURRENCY_EXPENSES
      }
      location {
        id
        address
        country
      }

      stats {
        id
        balanceWithBlockedFunds {
          valueInCents
          currency
        }
      }

      ... on AccountWithParent {
        parent {
          id
          slug
          name
          imageUrl
          backgroundImageUrl
          twitterHandle
        }
      }
      ... on AccountWithHost {
        host {
          id
          name
          slug
          imageUrl
          backgroundImageUrl
        }
      }
      ... on Organization {
        host {
          id
          name
          slug
          imageUrl
          backgroundImageUrl
        }
      }
    }
  }

  ${accountNavbarFieldsFragment}
  ${confirmContributionFieldsFragment}
`;

const contributionPageQueryHelper = getSSRQueryHelpers<{ legacyId: number; collectiveSlug: string }>({
  query: orderPageQuery,
  context: API_V2_CONTEXT,
  fetchPolicy: 'network-only',
  getVariablesFromContext: ({ query }) => ({
    legacyId: toNumber(query.OrderId),
    collectiveSlug: query.collectiveSlug as string,
  }),
});

// next.js export
// ts-unused-exports:disable-next-line
export const getServerSideProps: GetServerSideProps = contributionPageQueryHelper.getServerSideProps;

const messages = defineMessages({
  title: {
    id: 'OrderPage.title',
    defaultMessage: '{title} · Contribution #{id}',
  },
});

const ButtonsContainer = styled(Flex).attrs({ 'data-cy': 'order-actions' })`
  flex-wrap: wrap;
  transition: opacity 0.05s;
  justify-content: flex-end;

  @media (max-width: 40em) {
    justify-content: center;
  }

  & > *:last-child {
    margin-right: 0;
  }
`;

const OrderDetails = ({ children: [field, value] }: { children: [React.ReactNode, React.ReactNode] }) => (
  <Box>
    <P
      fontWeight="500"
      fontSize="11px"
      lineHeight="12px"
      textTransform="uppercase"
      color="black.700"
      letterSpacing="0.06em"
    >
      {field}
    </P>
    <Container fontSize="12px" color="black.700" lineHeight="18px" mt={1}>
      {value}
    </Container>
  </Box>
);

const TransactionDetailsWrapper = styled(Flex)`
  padding-bottom: 16px;
  :not(:last-child) {
    border-bottom: 1px dotted #e6e8eb;
    margin-bottom: 24px;
  }
`;

const TransactionDetails = ({
  children: [title, value, fees, description],
  ...props
}: {
  children: [React.ReactNode, React.ReactNode, React.ReactNode?, React.ReactNode?];
  [key: string]: any;
}) => (
  <TransactionDetailsWrapper
    data-cy="transaction-details-wrapper"
    {...props}
    alignItems="center"
    justifyContent="space-between"
  >
    <Box>
      <Box fontWeight="400" fontSize="14px" lineHeight="20px" color="black.900">
        {title}
      </Box>
      <Box fontWeight="400" fontSize="12px" lineHeight="18px" color="black.700">
        {description}
      </Box>
    </Box>
    <Box textAlign="end">
      <Container fontWeight="700" fontSize="16px" lineHeight="24px" color="black.900">
        {value}
      </Container>
      {fees && (
        <Container fontWeight="400" fontSize="12px" lineHeight="18px" color="black.700">
          {fees}
        </Container>
      )}
    </Box>
  </TransactionDetailsWrapper>
);

const SummaryHeader = styled(H1)`
  > a {
    color: inherit;
    text-decoration: underline;

    :hover {
      color: ${themeGet('colors.black.600')};
    }
  }
`;

const OverdueTag = styled.span`
  padding: 2px 6px;
  background: ${themeGet('colors.yellow.300')};
  color: ${themeGet('colors.yellow.900')};
  border-radius: 4px;
`;

const getTransactionsToDisplay = (account, transactions) => {
  if (!transactions?.length) {
    return [];
  }

  const isTipTransaction = t => ['PLATFORM_TIP', 'PLATFORM_TIP_DEBT'].includes(t.kind);
  const isOwnAccount = t => t.account.id === account.id;

  const [tipTransactions, otherTransactions] = partition(transactions, isTipTransaction);
  const accountTransactions = otherTransactions.filter(t => t.account.id === account.id);
  let tipTransactionsToDisplay = tipTransactions.filter(isOwnAccount);
  if (tipTransactionsToDisplay.length === 0 && tipTransactions.length > 0) {
    tipTransactionsToDisplay = tipTransactions.filter(t => t.kind === 'PLATFORM_TIP' && t.type === 'DEBIT');
  }

  return [...accountTransactions, ...tipTransactionsToDisplay];
};

// next.js export
// ts-unused-exports:disable-next-line
export default function OrderPage(props) {
  const { LoggedInUser } = useLoggedInUser();
  const prevLoggedInUser = usePrevious(LoggedInUser);
  const [showCreatePendingOrderModal, setShowCreatePendingOrderModal] = React.useState(false);
  const queryResult = contributionPageQueryHelper.useQuery(props);
  const variables = contributionPageQueryHelper.getVariablesFromPageProps(props);
  const baseMetadata = getCollectivePageMetadata(queryResult.data?.account);

  const data = queryResult.data;
  const account = data?.account as Account & AccountWithHost;
  const order = data?.order;
  const error = queryResult.error;

  const isPending = order?.status === 'PENDING';
  const isOverdue =
    isPending &&
    order?.pendingContributionData?.expectedAt &&
    dayjs().isAfter(dayjs(order?.pendingContributionData.expectedAt));
  const intl = useIntl();

  // Refetch when users logs in
  React.useEffect(() => {
    if (!prevLoggedInUser && LoggedInUser) {
      queryResult.refetch();
    }
  }, [LoggedInUser, prevLoggedInUser]);

  if (!order && error) {
    return <ErrorPage loading={queryResult.loading} data={queryResult.data} error={error} />;
  } else if (!queryResult.loading && (!order || order.toAccount?.slug !== variables.collectiveSlug)) {
    return <Custom404 />;
  }

  const displayedTransactions = getTransactionsToDisplay(account, order?.transactions);
  return (
    <Page
      collective={account}
      canonicalURL={`${getCollectivePageCanonicalURL(account)}/contributions/${queryResult.variables.legacyId}`}
      {...baseMetadata}
      title={intl.formatMessage(messages.title, {
        title: order?.description || 'Contribution',
        id: queryResult.variables.legacyId,
      })}
    >
      <CollectiveNavbar collective={account} isLoading={!account} selectedCategory={NAVBAR_CATEGORIES.BUDGET} />
      <Flex justifyContent="center" data-cy="contribution-page-content">
        {!order ? (
          <div className="p-20">
            <Loading />
          </div>
        ) : (
          <Flex
            maxWidth="1200px"
            py={[0, 5]}
            px={[2, 3, 4]}
            mt={2}
            mb={5}
            flexDirection={['column', null, null, 'row']}
            justifyContent={'space-between'}
          >
            <Box flex="1 0" flexBasis={['initial', null, null, 'min(832px, 70%)']} width="100%" mr={[null, 2, 3, 4]}>
              {error && <MessageBoxGraphqlError error={error} my={4} />}
              <SummaryHeader fontWeight="700" fontSize="24px" lineHeight="32px">
                <FormattedMessage
                  id="PendingContributionSummary"
                  defaultMessage="{status, select, PENDING {Pending Contribution} other {Contribution}} to {account}"
                  values={{
                    status: order.status,
                    account: (
                      <LinkCollective collective={order.toAccount} textDecoration="underline">
                        {order.toAccount.name}
                      </LinkCollective>
                    ),
                  }}
                />
              </SummaryHeader>
              <StyledCard mt="24px" p={[16, 24, 32]}>
                <div
                  className="mb-1 flex flex-col-reverse items-stretch justify-between md:flex-row md:items-center"
                  data-cy="contribution-title"
                >
                  <div className="mr-0 md:mr-2">
                    <h4 className="text-xl font-medium" data-cy="contribution-description">
                      {order.description}
                    </h4>
                  </div>
                  <div className="mb-3 items-center justify-between md:mb-0 md:justify-end">
                    <OrderStatusTag status={order.status} />
                  </div>
                </div>
                <div className="flex">
                  <StyledTag
                    variant="rounded-left"
                    fontSize="10px"
                    fontWeight="500"
                    mr={1}
                    textTransform="uppercase"
                    closeButtonProps={undefined}
                  >
                    <FormattedMessage defaultMessage="Contribution" id="0LK5eg" /> #{order.legacyId}
                  </StyledTag>
                  <Tags order={order} canEdit={order.permissions.canSetTags} />
                </div>
                <Flex alignItems="center" mt={1}>
                  <P mt="5px" fontSize="12px" color="black.600">
                    <FormattedMessage
                      defaultMessage="From {contributor} to {account}"
                      id="nqRBcp"
                      values={{
                        contributor: <LinkCollective collective={order.fromAccount} />,
                        account: <LinkCollective collective={order.toAccount} />,
                      }}
                    />
                    {' • '}
                    <DateTime
                      value={order.processedAt || order.createdAt}
                      dateStyle={undefined}
                      timeStyle={undefined}
                    />
                  </P>
                </Flex>
                <Grid mt="24px" gridGap="20px 50px" gridTemplateColumns={['1fr', '1fr 1fr', `repeat(4, 1fr)`]}>
                  {order.pendingContributionData?.ponumber && (
                    <OrderDetails>
                      <StyledTooltip
                        content={
                          <FormattedMessage
                            defaultMessage="External reference code for this contribution. This is usually a reference number from the contributor accounting system."
                            id="LqD2Po"
                          />
                        }
                        containerCursor="default"
                      >
                        <FormattedMessage id="Fields.PONumber" defaultMessage="PO Number" />
                      </StyledTooltip>
                      {`#${order.pendingContributionData.ponumber}`}
                    </OrderDetails>
                  )}
                  {order.pendingContributionData?.expectedAt && (
                    <OrderDetails>
                      <FormattedMessage defaultMessage="Expected" id="6srLb2" />
                      {isOverdue ? (
                        <OverdueTag>
                          <DateTime
                            value={order.pendingContributionData.expectedAt}
                            dateStyle={'medium'}
                            timeStyle={undefined}
                          />
                          <Span textTransform="uppercase" fontWeight="bold" letterSpacing="0.06em">
                            &nbsp;
                            <FormattedMessage defaultMessage="Overdue" id="M0vCGv" />
                          </Span>
                        </OverdueTag>
                      ) : (
                        <DateTime
                          value={order.pendingContributionData.expectedAt}
                          dateStyle={'medium'}
                          timeStyle={undefined}
                        />
                      )}
                    </OrderDetails>
                  )}
                  {order.paymentMethod ? (
                    <OrderDetails>
                      <FormattedMessage id="PaidWith" defaultMessage="Paid With" />
                      <PaymentMethodTypeWithIcon type={order.paymentMethod?.type} iconSize={16} />
                    </OrderDetails>
                  ) : (
                    <OrderDetails>
                      <FormattedMessage id="paymentmethod.label" defaultMessage="Payment Method" />
                      {i18nPaymentMethodProviderType(
                        intl,
                        order.pendingContributionData?.paymentMethod || 'BANK_TRANSFER',
                      )}
                    </OrderDetails>
                  )}

                  {!isEmpty(order.pendingContributionData?.fromAccountInfo) && (
                    <OrderDetails>
                      <FormattedMessage id="Contact" defaultMessage="Contact" />
                      <span>
                        {order.pendingContributionData.fromAccountInfo.name}

                        {order.pendingContributionData.fromAccountInfo.email && (
                          <React.Fragment>
                            &nbsp;(
                            <StyledLink
                              href={`mailto:${order.pendingContributionData.fromAccountInfo.email}`}
                              openInNewTab
                            >
                              {order.pendingContributionData.fromAccountInfo.email}
                            </StyledLink>
                            )
                          </React.Fragment>
                        )}
                      </span>
                    </OrderDetails>
                  )}
                </Grid>

                <Box mt={4}>
                  <P fontWeight="700" fontSize="16px" lineHeight="24px" color="black.900">
                    {isPending ? (
                      <FormattedMessage defaultMessage="Contribution Details" id="tijsiA" />
                    ) : (
                      <FormattedMessage defaultMessage="Related Transactions" id="Sz+Qhv" />
                    )}
                  </P>
                </Box>

                <Box mt={4}>
                  {isPending ? (
                    <React.Fragment>
                      <TransactionDetails>
                        <FormattedMessage defaultMessage="Expected Total Amount" id="PEp9t9" />
                        <FormattedMoneyAmount
                          currency={order.totalAmount.currency}
                          precision={2}
                          amount={order.totalAmount.valueInCents}
                        />

                        <FormattedMessage defaultMessage="Payment Fees not Considered" id="ysc4k/" />
                        <FormattedMessage
                          id="contribution.createdAt"
                          defaultMessage="Created on {date}"
                          values={{
                            date: <DateTime value={order.createdAt} dateStyle={'medium'} timeStyle="short" />,
                          }}
                        />
                      </TransactionDetails>
                      {Boolean(order.taxAmount?.valueInCents) && (
                        <TransactionDetails>
                          <FormattedMessage
                            defaultMessage="Expected {taxType} ({rate}%)"
                            id="U5Xeen"
                            values={{
                              taxType: i18nTaxType(intl, order.tax?.type || 'Tax', 'long'),
                              rate: order.tax?.rate * 100,
                            }}
                          />
                          <FormattedMoneyAmount
                            currency={order.amount.currency}
                            precision={2}
                            amount={-order.taxAmount.valueInCents}
                          />
                        </TransactionDetails>
                      )}
                      {Boolean(order.hostFeePercent) && (
                        <TransactionDetails>
                          <FormattedMessage defaultMessage="Expected Host Fees" id="+UwJxq" />
                          <FormattedMoneyAmount
                            currency={order.amount.currency}
                            precision={2}
                            amount={
                              (order.amount.valueInCents - (order.taxAmount?.valueInCents || 0)) *
                              (order.hostFeePercent / -100)
                            }
                          />
                          <FormattedMessage
                            defaultMessage="Based on default host fees, can be changed at settling time"
                            id="b8rZxx"
                          />
                        </TransactionDetails>
                      )}
                      {Boolean(order.platformTipAmount?.valueInCents) && (
                        <TransactionDetails>
                          <FormattedMessage defaultMessage="Expected Platform Tip" id="20RyRD" />
                          <FormattedMoneyAmount
                            currency={order.platformTipAmount.currency}
                            amount={-order.platformTipAmount.valueInCents}
                          />
                        </TransactionDetails>
                      )}
                    </React.Fragment>
                  ) : (
                    orderBy(displayedTransactions, ['legacyId'], ['desc']).map(transaction => {
                      const displayedAmount = getDisplayedAmount(transaction, account);
                      const displayPaymentFees =
                        transaction.type === 'CREDIT' &&
                        transaction.netAmount?.valueInCents !== displayedAmount.valueInCents &&
                        transaction.paymentProcessorFee?.valueInCents !== 0;

                      return (
                        <TransactionDetails key={transaction.id}>
                          <span>{transaction.description}</span>
                          <FormattedMoneyAmount
                            currency={displayedAmount.currency}
                            precision={2}
                            amount={displayedAmount.valueInCents}
                          />
                          <div>
                            {Boolean(transaction.taxAmount?.valueInCents) && (
                              <Span display="block">
                                <FormattedMoneyAmount
                                  currency={transaction.taxAmount.currency}
                                  precision={2}
                                  amount={transaction.taxAmount.valueInCents}
                                />{' '}
                                ({round(transaction.taxInfo.rate * 100, 2)}%{' '}
                                {i18nTaxType(intl, transaction.taxInfo.type, 'long')})
                              </Span>
                            )}
                            {displayPaymentFees && (
                              <Span display="block">
                                <FormattedMessage
                                  defaultMessage="{value} (Payment Processor Fee)"
                                  id="ijvoto"
                                  values={{
                                    value: (
                                      <FormattedMoneyAmount
                                        currency={transaction.paymentProcessorFee.currency}
                                        amount={transaction.paymentProcessorFee.valueInCents}
                                      />
                                    ),
                                  }}
                                />
                              </Span>
                            )}
                          </div>
                          <span>
                            <FormattedMessage
                              defaultMessage="{type, select, CREDIT {Received by} DEBIT {Paid by} other {}} {account} on {date}"
                              id="XhoJIl"
                              values={{
                                type: transaction.type,
                                date: <DateTime value={transaction.createdAt} dateStyle={'short'} timeStyle="short" />,
                                account: <LinkCollective collective={transaction.account} />,
                              }}
                            />
                          </span>
                        </TransactionDetails>
                      );
                    })
                  )}
                </Box>
                {hasProcessButtons(order?.permissions) && (
                  <Box mt="40px">
                    <StyledHr />
                    <Flex
                      justifyContent={['stretch', 'space-between']}
                      flexDirection={['column-reverse', 'row']}
                      mt="8px"
                    >
                      <ButtonsContainer flexDirection={['column', 'row']}>
                        {order.permissions.canEdit && (
                          <React.Fragment>
                            <StyledButton
                              data-cy="edit-order-button"
                              buttonSize="tiny"
                              minWidth="130px"
                              mx={2}
                              mt={2}
                              py="9px"
                              height="34px"
                              onClick={() => setShowCreatePendingOrderModal(true)}
                            >
                              <FormattedMessage id="contribution.edit" defaultMessage="Edit Contribution" />
                            </StyledButton>
                            {showCreatePendingOrderModal && (
                              <CreatePendingOrderModal
                                hostSlug={account.host.slug}
                                onClose={() => setShowCreatePendingOrderModal(false)}
                                onSuccess={() => queryResult.refetch()}
                                edit={order}
                              />
                            )}{' '}
                          </React.Fragment>
                        )}
                      </ButtonsContainer>
                      <ButtonsContainer flexDirection={['column', 'row']}>
                        <ProcessOrderButtons
                          order={order}
                          permissions={order.permissions}
                          onSuccess={() => queryResult.refetch()}
                        />
                      </ButtonsContainer>
                    </Flex>
                  </Box>
                )}
              </StyledCard>

              {order?.memo && (
                <div className="mt-4">
                  <P fontWeight="700" fontSize="16px" lineHeight="24px" color="black.900">
                    <FormattedMessage defaultMessage="Additional Details" id="DgTPfL" />
                  </P>

                  <Span fontSize="12px" color="black.700" fontWeight="bold">
                    <FormattedMessage id="Expense.PrivateNote" defaultMessage="Private note" />
                    &nbsp;&nbsp;
                    <PrivateInfoIcon className="text-muted-foreground" size={12} />
                  </Span>
                  <HTMLContent color="black.700" mt={1} fontSize="13px" content={order.memo} />
                </div>
              )}
            </Box>
            <Flex
              minWidth="270px"
              display={['none', 'block']}
              justifyContent={['center', null, 'flex-start', 'flex-end']}
              pt={[4, null, 80]}
            >
              {account.isActive && (
                <Box px={2}>
                  <H5 mb={3} textTransform="capitalize">
                    <FormattedMessage
                      id="CollectiveBalance"
                      defaultMessage="{type, select, COLLECTIVE {Collective balance} EVENT {Event balance} ORGANIZATION {Organization balance} FUND {Fund balance} PROJECT {Project balance} other {Account balance}}"
                      values={{ type: account.type || '' }}
                    />
                  </H5>
                  <Container
                    borderLeft="1px solid"
                    borderColor="black.300"
                    pl={3}
                    fontSize="20px"
                    color="black.500"
                    data-cy="collective-balance"
                  >
                    <Box>
                      <FormattedMoneyAmount
                        currency={account.stats.balanceWithBlockedFunds.currency}
                        amount={account.stats.balanceWithBlockedFunds.valueInCents}
                        amountClassName="text-foreground"
                      />
                      {account.host && (
                        <P fontSize="11px" color="black.600" mt={2}>
                          <Span
                            fontSize="9px"
                            fontWeight="600"
                            textTransform="uppercase"
                            color="black.500"
                            letterSpacing="0.06em"
                          >
                            <FormattedMessage id="Fiscalhost" defaultMessage="Fiscal Host" />
                          </Span>
                          <br />
                          <LinkCollective collective={account.host} />
                        </P>
                      )}
                    </Box>
                  </Container>
                </Box>
              )}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Page>
  );
}
