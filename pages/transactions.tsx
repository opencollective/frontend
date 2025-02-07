import React, { useEffect } from 'react';
import { omit } from 'lodash';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { getSSRQueryHelpers } from '../lib/apollo-client';
import { loggedInUserCanAccessFinancialData } from '../lib/collective';
import { CollectiveType } from '../lib/constants/collectives';
import { API_V2_CONTEXT, gql } from '../lib/graphql/helpers';
import useLoggedInUser from '../lib/hooks/useLoggedInUser';
import { addParentToURLIfMissing, getCollectivePageCanonicalURL } from '../lib/url-helpers';

import Body from '../components/Body';
import CollectiveNavbar from '../components/collective-navbar';
import { NAVBAR_CATEGORIES } from '../components/collective-navbar/constants';
import { accountNavbarFieldsFragment } from '../components/collective-navbar/fragments';
import { Sections } from '../components/collective-page/_constants';
import ErrorPage from '../components/ErrorPage';
import Header from '../components/Header';
import Footer from '../components/navigation/Footer';
import PageFeatureNotSupported from '../components/PageFeatureNotSupported';
import { transactionsQueryCollectionFragment } from '../components/transactions/graphql/fragments';
import Transactions, { getVariablesFromQuery } from '../components/transactions/TransactionsPageContent';

const processingOrderFragment = gql`
  fragment ProcessingOrderFields on Order {
    id
    legacyId
    nextChargeDate
    paymentMethod {
      id
      service
      name
      type
      expiryDate
      data
      balance {
        value
        valueInCents
        currency
      }
    }
    amount {
      value
      valueInCents
      currency
    }
    totalAmount {
      value
      valueInCents
      currency
    }
    status
    description
    createdAt
    frequency
    tier {
      id
      name
    }
    totalDonations {
      value
      valueInCents
      currency
    }
    fromAccount {
      id
      name
      slug
      isIncognito
      type
      ... on Individual {
        isGuest
      }
    }
    toAccount {
      id
      slug
      name
      type
      description
      tags
      imageUrl
      settings
      ... on AccountWithHost {
        host {
          id
          slug
          paypalClientId
          supportedPaymentMethods
        }
      }
      ... on Organization {
        host {
          id
          slug
          paypalClientId
          supportedPaymentMethods
        }
      }
    }
    platformTipAmount {
      value
      valueInCents
    }
  }
`;

const transactionsPageQuery = gql`
  query TransactionsPage(
    $slug: String!
    $limit: Int!
    $offset: Int!
    $type: TransactionType
    $paymentMethodType: [PaymentMethodType]
    $minAmount: Int
    $maxAmount: Int
    $dateFrom: DateTime
    $dateTo: DateTime
    $searchTerm: String
    $kind: [TransactionKind]
    $includeIncognitoTransactions: Boolean
    $includeGiftCardTransactions: Boolean
    $includeChildrenTransactions: Boolean
    $virtualCard: [VirtualCardReferenceInput]
    $orderBy: ChronologicalOrderInput
  ) {
    account(slug: $slug) {
      id
      legacyId
      slug
      name
      type
      createdAt
      imageUrl(height: 256)
      currency
      settings
      features {
        id
        ...NavbarFields
      }
      ... on AccountWithParent {
        parent {
          id
          slug
          name
        }
      }
      ... on AccountWithHost {
        host {
          id
          slug
        }
      }
      processingOrders: orders(filter: OUTGOING, includeIncognito: true, status: [PENDING, PROCESSING]) {
        totalCount
        nodes {
          id
          ...ProcessingOrderFields
        }
      }
    }
    transactions(
      account: { slug: $slug }
      limit: $limit
      offset: $offset
      type: $type
      paymentMethodType: $paymentMethodType
      minAmount: $minAmount
      maxAmount: $maxAmount
      dateFrom: $dateFrom
      dateTo: $dateTo
      searchTerm: $searchTerm
      kind: $kind
      includeIncognitoTransactions: $includeIncognitoTransactions
      includeGiftCardTransactions: $includeGiftCardTransactions
      includeChildrenTransactions: $includeChildrenTransactions
      includeDebts: true
      virtualCard: $virtualCard
      orderBy: $orderBy
    ) {
      ...TransactionsQueryCollectionFragment
      kinds
      paymentMethodTypes
      totalCount
    }
  }
  ${transactionsQueryCollectionFragment}
  ${accountNavbarFieldsFragment}
  ${processingOrderFragment}
`;

const TransactionPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  #footer {
    margin-top: auto;
  }
`;

type TransactionsPageProps = {
  query: {
    collectiveSlug: string;
    searchTerm?: string;
    offset?: string;
    ignoreIncognitoTransactions?: string;
    ignoreGiftCardsTransactions?: string;
    ignoreChildrenTransactions?: string;
    displayPendingContributions?: string;
  };
};

const transactionsPageQueryHelper = getSSRQueryHelpers<ReturnType<typeof getVariablesFromQuery>, TransactionsPageProps>(
  {
    query: transactionsPageQuery,
    getPropsFromContext: ctx => ({ query: ctx.query as TransactionsPageProps['query'] }),
    getVariablesFromContext: ctx => ({ ...getVariablesFromQuery(ctx.query), slug: ctx.query.collectiveSlug }),
    context: API_V2_CONTEXT,
    skipClientIfSSRThrows404: true,
  },
);

// next.js export
// ts-unused-exports:disable-next-line
export const getServerSideProps = transactionsPageQueryHelper.getServerSideProps;

// next.js export
// ts-unused-exports:disable-next-line
export default function TransactionsPage(props) {
  const { LoggedInUser } = useLoggedInUser();
  const { data, error, variables, refetch, loading } = transactionsPageQueryHelper.useQuery(props);
  const router = useRouter();

  useEffect(() => {
    const queryParameters = omit(props.query, ['offset', 'collectiveSlug', 'parentCollectiveSlug']);
    addParentToURLIfMissing(router, account, `/transactions`, queryParameters);
  });

  const account = data?.account;
  const accountType = account?.type;
  const transactions = data?.transactions;

  if (!loading) {
    if (!account) {
      return <ErrorPage data={data} error={error || transactionsPageQueryHelper.getSSRErrorFromPageProps(props)} />;
    } else if (!loggedInUserCanAccessFinancialData(LoggedInUser, account)) {
      // Hack for funds that want to keep their budget "private"
      return <PageFeatureNotSupported showContactSupportLink={false} />;
    }
  }

  return (
    <TransactionPageWrapper>
      <Header
        collective={account}
        LoggedInUser={LoggedInUser}
        canonicalURL={`${getCollectivePageCanonicalURL(account)}/transactions`}
        noRobots={['USER', 'INDIVIDUAL'].includes(accountType) && !account.isHost}
      />
      <Body>
        <CollectiveNavbar
          collective={account}
          isAdmin={LoggedInUser && LoggedInUser.isAdminOfCollective(account)}
          selectedCategory={NAVBAR_CATEGORIES.BUDGET}
          selectedSection={accountType === CollectiveType.COLLECTIVE ? Sections.BUDGET : Sections.TRANSACTIONS}
        />
        <div className="mx-auto my-4 max-w-[1260px] px-2 sm:my-5 sm:px-3 md:px-4" data-cy="transactions-page-content">
          <Transactions
            transactions={transactions}
            account={account}
            LoggedInUser={LoggedInUser}
            variables={variables}
            error={error}
            loading={loading}
            refetch={refetch}
            router={router}
          />
        </div>
      </Body>
      <Footer />
    </TransactionPageWrapper>
  );
}
