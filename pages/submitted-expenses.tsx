import React from 'react';
import type { DataValue } from '@apollo/client/react/hoc';
import { graphql } from '@apollo/client/react/hoc';
import { has, omit, omitBy } from 'lodash';
import memoizeOne from 'memoize-one';
import type { NextRouter } from 'next/router';
import { withRouter } from 'next/router';
import type { IntlShape } from 'react-intl';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

import { getCollectivePageMetadata, isIndividualAccount } from '../lib/collective';
import expenseTypes from '../lib/constants/expenseTypes';
import { PayoutMethodType } from '../lib/constants/payout-method';
import { parseDateInterval } from '../lib/date-utils';
import { generateNotFoundError } from '../lib/errors';
import { API_V2_CONTEXT, gql } from '../lib/graphql/helpers';
import type { SubmittedExpensesPageQuery, SubmittedExpensesPageQueryVariables } from '../lib/graphql/types/v2/graphql';
import { ExpenseStatus } from '../lib/graphql/types/v2/schema';
import type LoggedInUser from '../lib/LoggedInUser';
import { getCollectivePageCanonicalURL } from '../lib/url-helpers';

import { parseAmountRange } from '../components/budget/filters/AmountFilter';
import CollectiveNavbar from '../components/collective-navbar';
import { NAVBAR_CATEGORIES } from '../components/collective-navbar/constants';
import { accountNavbarFieldsFragment } from '../components/collective-navbar/fragments';
import { Dimensions } from '../components/collective-page/_constants';
import Container from '../components/Container';
import ErrorPage from '../components/ErrorPage';
import ExpensesFilters from '../components/expenses/ExpensesFilters';
import ExpensesList from '../components/expenses/ExpensesList';
import { parseChronologicalOrderInput } from '../components/expenses/filters/ExpensesOrder';
import { expenseHostFields, expensesListFieldsFragment } from '../components/expenses/graphql/fragments';
import Link from '../components/Link';
import LoadingPlaceholder from '../components/LoadingPlaceholder';
import MessageBox from '../components/MessageBox';
import Page from '../components/Page';
import PageFeatureNotSupported from '../components/PageFeatureNotSupported';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import StyledHr from '../components/StyledHr';
import { H1 } from '../components/Text';
import { withUser } from '../components/UserProvider';

const messages = defineMessages({
  title: {
    id: 'ExpensesPage.title',
    defaultMessage: '{collectiveName} · Expenses',
  },
});

const EXPENSES_PER_PAGE = 10;

type SubmittedExpensesPageProps = {
  data: DataValue<SubmittedExpensesPageQuery, SubmittedExpensesPageQueryVariables>;
  query: Record<string, unknown>;
  router: NextRouter;
  LoggedInUser: LoggedInUser;
  intl: IntlShape;
  collectiveSlug: string;
};

class SubmittedExpensesPage extends React.Component<SubmittedExpensesPageProps> {
  static getInitialProps({ query }) {
    return {
      collectiveSlug: query.collectiveSlug,
      query: {
        offset: parseInt(query.offset) || undefined,
        limit: parseInt(query.limit) || undefined,
        type: has(expenseTypes, query.type) ? query.type : undefined,
        status: has(ExpenseStatus, query.status) || query.status === 'READY_TO_PAY' ? query.status : undefined,
        payout: has(PayoutMethodType, query.payout) ? query.payout : undefined,
        period: query.period,
        amount: query.amount,
        tag: query.tag,
        searchTerm: query.searchTerm,
        orderBy: query.orderBy,
      },
    };
  }

  async componentDidUpdate(oldProps) {
    const { LoggedInUser, data } = this.props;
    if (!oldProps.LoggedInUser && LoggedInUser) {
      if (LoggedInUser.isAdminOfCollectiveOrHost(data.account)) {
        data.refetch();
      }
    }
  }

  getPageMetaData(collective) {
    const baseMetadata = getCollectivePageMetadata(collective);
    if (collective) {
      return {
        ...baseMetadata,
        title: this.props.intl.formatMessage(messages.title, { collectiveName: collective.name }),
      };
    } else {
      return { ...baseMetadata, title: `Expenses` };
    }
  }

  hasFilter = memoizeOne(query => {
    return Object.entries(query).some(([key, value]) => key !== 'offset' && key !== 'limit' && value);
  });

  buildFilterLinkParams(params) {
    const queryParameters = {
      ...omit(this.props.query, ['offset', 'collectiveSlug']),
      ...params,
    };

    return omitBy(queryParameters, value => !value);
  }

  updateFilters = (queryParams, collective) => {
    return this.props.router.push({
      pathname: `${getCollectivePageCanonicalURL(collective)}/submitted-expenses`,
      query: this.buildFilterLinkParams({ ...queryParams, offset: null }),
    });
  };

  handleSearch = (searchTerm, collective) => {
    const params = this.buildFilterLinkParams({ searchTerm, offset: null });
    this.props.router.push({
      pathname: `${getCollectivePageCanonicalURL(collective)}/submitted-expenses`,
      query: params,
    });
  };

  getTagProps = tag => {
    if (tag === this.props.query.tag) {
      return { type: 'info', closeButtonProps: true };
    }
  };

  getShouldDisplayFeatureNotSupported = account => {
    if (!account) {
      return true;
    }
  };

  render() {
    const { collectiveSlug, data, query } = this.props;
    const searchTerm = Array.isArray(query.searchTerm) ? query.searchTerm[0] : query.searchTerm;
    const hasFilters = this.hasFilter(query);
    const pageUrl = `${getCollectivePageCanonicalURL(data.account)}/submitted-expenses`;

    if (!data.loading) {
      if (data.error) {
        return <ErrorPage data={data} />;
      } else if (!data.account || !data.expenses?.nodes) {
        return <ErrorPage error={generateNotFoundError(collectiveSlug)} log={false} />;
      } else if (!isIndividualAccount(data.account)) {
        // Hack for funds that want to keep their budget "private"
        return <PageFeatureNotSupported showContactSupportLink={false} />;
      }
    }

    return (
      <Page collective={data.account} canonicalURL={pageUrl} {...this.getPageMetaData(data.account)}>
        <CollectiveNavbar
          collective={data.account}
          isLoading={!data.account}
          selectedCategory={NAVBAR_CATEGORIES.BUDGET}
        />
        <Container position="relative" minHeight={[null, 800]}>
          <div
            style={{ maxWidth: Dimensions.MAX_SECTION_WIDTH }}
            className="mx-auto mt-3 max-w-[1200px] px-2 py-0 sm:px-3 sm:py-5 md:px-4"
          >
            <div className="flex flex-wrap justify-between">
              <div className="mb-5 mr-0 min-w-[300px] flex-1 basis-[500px]">
                <div className="flex">
                  <H1 fontSize="32px" lineHeight="40px" py={2} fontWeight="normal">
                    <FormattedMessage defaultMessage="Submitted Expenses" id="NpGb+x" />
                  </H1>
                  <div className="mx-auto" />
                  <div className="w-full min-w-[6.25rem] max-w-[278px]">
                    <SearchBar
                      defaultValue={searchTerm}
                      onSubmit={searchTerm => this.handleSearch(searchTerm, data.account)}
                      placeholder={undefined}
                    />
                  </div>
                </div>
                <StyledHr my={24} mx="8px" borderWidth="0.5px" />
                <div className="mx-2">
                  {data.account ? (
                    <ExpensesFilters
                      collective={data.account}
                      filters={this.props.query}
                      onChange={queryParams => this.updateFilters(queryParams, data.account)}
                      ignoredExpenseStatus={null}
                      wrap={false}
                    />
                  ) : (
                    <LoadingPlaceholder height={70} width="100%" />
                  )}
                </div>
                <div className="mt-4 sm:mt-[46px]">
                  {!data.loading && !data.expenses?.nodes.length ? (
                    <MessageBox type="info" withIcon data-cy="zero-expense-message">
                      {hasFilters ? (
                        <FormattedMessage
                          id="ExpensesList.Empty"
                          defaultMessage="No expense matches the given filters, <ResetLink>reset them</ResetLink> to see all expenses."
                          values={{
                            ResetLink: text => (
                              <Link data-cy="reset-expenses-filters" href={pageUrl}>
                                <span>{text}</span>
                              </Link>
                            ),
                          }}
                        />
                      ) : (
                        <FormattedMessage id="expenses.empty" defaultMessage="No expenses" />
                      )}
                    </MessageBox>
                  ) : (
                    <React.Fragment>
                      <ExpensesList
                        isLoading={Boolean(data.loading)}
                        collective={data.account}
                        expenses={data.expenses?.nodes}
                        nbPlaceholders={data.variables.limit}
                        isInverted
                        view="submitter"
                        expenseFieldForTotalAmount="amountInCreatedByAccountCurrency"
                      />
                      <div className="mt-5 flex justify-center">
                        <Pagination
                          route={pageUrl}
                          total={data.expenses?.totalCount}
                          limit={data.variables.limit}
                          offset={data.variables.offset}
                          ignoredQueryParams={['collectiveSlug']}
                        />
                      </div>
                    </React.Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Page>
    );
  }
}

const submittedExpensesPageQuery = gql`
  query SubmittedExpensesPage(
    $collectiveSlug: String!
    $limit: Int!
    $offset: Int!
    $type: ExpenseType
    $tags: [String]
    $status: [ExpenseStatusFilter]
    $minAmount: Int
    $maxAmount: Int
    $payoutMethodType: PayoutMethodType
    $dateFrom: DateTime
    $dateTo: DateTime
    $searchTerm: String
    $orderBy: ChronologicalOrderInput
  ) {
    account(slug: $collectiveSlug) {
      id
      legacyId
      slug
      type
      imageUrl
      backgroundImageUrl
      twitterHandle
      name
      currency
      isArchived
      isActive
      settings
      createdAt
      supportedExpenseTypes
      isHost
      features {
        id
        ...NavbarFields
      }
    }
    expenses(
      createdByAccount: { slug: $collectiveSlug }
      limit: $limit
      offset: $offset
      type: $type
      tag: $tags
      status: $status
      minAmount: $minAmount
      maxAmount: $maxAmount
      payoutMethodType: $payoutMethodType
      dateFrom: $dateFrom
      dateTo: $dateTo
      searchTerm: $searchTerm
      orderBy: $orderBy
    ) {
      totalCount
      offset
      limit
      nodes {
        id
        ...ExpensesListFieldsFragment
        amountInCreatedByAccountCurrency: amountV2(currencySource: CREATED_BY_ACCOUNT) {
          value
          valueInCents
          currency
          exchangeRate {
            date
            value
            source
            isApproximate
          }
        }
        host {
          id
          ...ExpenseHostFields
        }
      }
    }
  }

  ${expensesListFieldsFragment}
  ${accountNavbarFieldsFragment}
  ${expenseHostFields}
`;

const addExpensesPageData = graphql<SubmittedExpensesPageProps>(submittedExpensesPageQuery, {
  options: props => {
    const amountRange = parseAmountRange(props.query.amount as string);
    const { from: dateFrom, to: dateTo } = parseDateInterval(props.query.period);
    const orderBy = props.query.orderBy && parseChronologicalOrderInput(props.query.orderBy);
    return {
      context: API_V2_CONTEXT,
      variables: {
        collectiveSlug: props.collectiveSlug,
        offset: props.query.offset || 0,
        limit: props.query.limit || EXPENSES_PER_PAGE,
        type: props.query.type,
        status: props.query.status,
        tags: props.query.tag ? (props.query.tag === 'untagged' ? null : [props.query.tag]) : undefined,
        minAmount: amountRange[0] && amountRange[0] * 100,
        maxAmount: amountRange[1] && amountRange[1] * 100,
        payoutMethodType: props.query.payout,
        dateFrom,
        dateTo,
        orderBy,
        searchTerm: props.query.searchTerm,
      },
    };
  },
});

// next.js export
// ts-unused-exports:disable-next-line
export default injectIntl(addExpensesPageData(withUser(withRouter(SubmittedExpensesPage))));
