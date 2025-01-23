import React from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { withRouter } from 'next/router';
import { createGlobalStyle } from 'styled-components';

import { getCollectivePageMetadata } from '../lib/collective';
import { OPENCOLLECTIVE_FOUNDATION_ID } from '../lib/constants/collectives';
import { generateNotFoundError } from '../lib/errors';
import { API_V2_CONTEXT } from '../lib/graphql/helpers';
import { ssrGraphQLQuery } from '../lib/graphql/with-ssr-query';
import { getRequestIntl } from '../lib/i18n/request';
import { PREVIEW_FEATURE_KEYS } from '../lib/preview-features';
import { addParentToURLIfMissing, getCollectivePageCanonicalURL } from '../lib/url-helpers';

import CollectivePageContent from '../components/collective-page';
import CollectiveNotificationBar from '../components/collective-page/CollectiveNotificationBar';
import { preloadCollectivePageGraphqlQueries } from '../components/collective-page/graphql/preload';
import { collectivePageQuery, getCollectivePageQueryVariables } from '../components/collective-page/graphql/queries';
import {
  collectivePageQuery as collectivePageQueryV2,
  convertCollectiveToGraphqlV1,
} from '../components/collective-page/graphql/v2/queries';
import CollectiveThemeProvider from '../components/CollectiveThemeProvider';
import { CrowdfundingPreviewBanner } from '../components/crowdfunding-redesign/CrowdfundingPreviewBanner';
import ErrorPage from '../components/ErrorPage';
import Loading from '../components/Loading';
import Page from '../components/Page';
import { withUser } from '../components/UserProvider';

import Custom404 from './404';
/** A page rendered when collective is incognito */
const IncognitoUserCollective = dynamic(
  () => import(/* webpackChunkName: 'IncognitoUserCollective' */ '../components/IncognitoUserCollective'),
  { loading: Loading },
);

/** A page rendered when collective is guest */
const GuestUserProfile = dynamic(
  () => import(/* webpackChunkName: 'GuestUserProfile' */ '../components/GuestUserProfile'),
  { loading: Loading },
);

/** Load the onboarding modal dynamically since it's not used often */
const OnboardingModal = dynamic(
  () => import(/* webpackChunkName: 'OnboardingModal' */ '../components/onboarding-modal/OnboardingModal'),
  { loading: Loading },
);

const GlobalStyles = createGlobalStyle`
  section {
    margin: 0;
  }
`;

/**
 * The main page to display collectives. Wrap route parameters and GraphQL query
 * to render `components/collective-page` with everything needed.
 */
class CollectivePage extends React.Component {
  static getInitialProps(ctx) {
    const {
      req,
      res,
      query: { slug, status, step, mode, action },
    } = ctx;
    if (res && req) {
      const { locale } = getRequestIntl(req);
      if (locale === 'en') {
        res.setHeader('Cache-Control', 'public, s-maxage=300');
      }
    }

    return { slug, status, step, mode, action };
  }

  static propTypes = {
    slug: PropTypes.string.isRequired, // from getInitialProps
    /** A special status to show the notification bar (collective created, archived...etc) */
    status: PropTypes.oneOf([
      'collectiveCreated',
      'collectiveArchived',
      'fundCreated',
      'projectCreated',
      'eventCreated',
    ]),
    step: PropTypes.string,
    mode: PropTypes.string,
    action: PropTypes.string,
    LoggedInUser: PropTypes.object, // from withUser
    router: PropTypes.object,
    data: PropTypes.shape({
      loading: PropTypes.bool,
      error: PropTypes.any,
      previousData: PropTypes.object,
      account: PropTypes.object,
      Collective: PropTypes.shape({
        name: PropTypes.string,
        type: PropTypes.string.isRequired,
        description: PropTypes.string,
        twitterHandle: PropTypes.string,
        image: PropTypes.string,
        isApproved: PropTypes.bool,
        isArchived: PropTypes.bool,
        isHost: PropTypes.bool,
        isActive: PropTypes.bool,
        isIncognito: PropTypes.bool,
        isGuest: PropTypes.bool,
        parentCollective: PropTypes.shape({ slug: PropTypes.string, image: PropTypes.string }),
        host: PropTypes.object,
        stats: PropTypes.shape({
          backers: PropTypes.shape({
            all: PropTypes.number,
          }),
        }).isRequired,
        coreContributors: PropTypes.arrayOf(PropTypes.object),
        financialContributors: PropTypes.arrayOf(PropTypes.object),
        tiers: PropTypes.arrayOf(PropTypes.object),
        events: PropTypes.arrayOf(PropTypes.object),
        connectedCollectives: PropTypes.arrayOf(PropTypes.object),
        transactions: PropTypes.arrayOf(PropTypes.object),
        expenses: PropTypes.arrayOf(PropTypes.object),
        updates: PropTypes.arrayOf(PropTypes.object),
      }),
      refetch: PropTypes.func,
    }).isRequired, // from withData
  };

  constructor(props) {
    super(props);
    this.state = {
      smooth: false,
      showOnboardingModal: true,
    };
  }

  componentDidMount() {
    this.setState({ smooth: true });

    const { router, data } = this.props;
    const collective = data?.Collective;
    addParentToURLIfMissing(router, collective);
  }

  setShowOnboardingModal = bool => {
    this.setState({ showOnboardingModal: bool });
  };

  render() {
    const { slug, data, LoggedInUser, status, step, mode, action } = this.props;
    const { showOnboardingModal } = this.state;
    const collective =
      data?.account || data?.previousData?.account
        ? convertCollectiveToGraphqlV1(data?.account || data?.previousData?.account)
        : data?.Collective || data?.previousData?.Collective;
    const loading = data?.loading && !collective;
    if (!loading) {
      if (!data || data.error) {
        return <ErrorPage data={data} />;
      } else if (!collective || collective.type === 'VENDOR') {
        return <ErrorPage error={generateNotFoundError(slug)} log={false} />;
      } else if (collective.isIncognito) {
        return <IncognitoUserCollective collective={collective} />;
      } else if (collective.isGuest) {
        return <GuestUserProfile account={collective} />;
      }
    }

    // Don't allow /collective/apply
    if (action === 'apply' && collective && !collective.isHost) {
      return <Custom404 />;
    }

    const showCrowdfundingPreviewBanner =
      !['ORGANIZATION', 'FUND', 'INDIVIDUAL', 'USER'].includes(collective?.type) &&
      LoggedInUser?.hasPreviewFeatureEnabled(PREVIEW_FEATURE_KEYS.CROWDFUNDING_REDESIGN) &&
      LoggedInUser?.isAdminOfCollective(collective) &&
      collective?.host?.id !== OPENCOLLECTIVE_FOUNDATION_ID;

    return (
      <Page
        collective={collective}
        canonicalURL={getCollectivePageCanonicalURL(collective)}
        {...getCollectivePageMetadata(collective)}
        loading={loading}
      >
        <GlobalStyles />
        {loading ? (
          <div className="py-16 sm:py-32">
            <Loading />
          </div>
        ) : (
          <React.Fragment>
            {showCrowdfundingPreviewBanner && <CrowdfundingPreviewBanner account={collective} />}

            <CollectiveNotificationBar
              collective={collective}
              host={collective.host}
              status={status}
              LoggedInUser={LoggedInUser}
              refetch={data.refetch}
            />
            <CollectiveThemeProvider collective={collective}>
              {({ onPrimaryColorChange }) => (
                <CollectivePageContent
                  collective={collective}
                  host={collective.host}
                  coreContributors={collective.coreContributors}
                  financialContributors={collective.financialContributors}
                  tiers={collective.tiers}
                  events={collective.events}
                  projects={collective.projects}
                  connectedCollectives={collective.connectedCollectives}
                  transactions={collective.transactions}
                  expenses={collective.expenses}
                  stats={collective.stats}
                  updates={collective.updates}
                  conversations={collective.conversations}
                  LoggedInUser={LoggedInUser}
                  isAdmin={Boolean(LoggedInUser && LoggedInUser.isAdminOfCollective(collective))}
                  isHostAdmin={Boolean(LoggedInUser && LoggedInUser.isHostAdmin(collective))}
                  isRoot={Boolean(LoggedInUser && LoggedInUser.isRoot)}
                  onPrimaryColorChange={onPrimaryColorChange}
                  step={step}
                  mode={mode}
                  refetch={data.refetch}
                />
              )}
            </CollectiveThemeProvider>
            {mode === 'onboarding' && LoggedInUser?.isAdminOfCollective(collective) && (
              <OnboardingModal
                showOnboardingModal={showOnboardingModal}
                setShowOnboardingModal={this.setShowOnboardingModal}
                step={step}
                mode={mode}
                collective={collective}
                LoggedInUser={LoggedInUser}
              />
            )}
          </React.Fragment>
        )}
      </Page>
    );
  }
}

const GRAPHQL_V2 = true;

const addCollectivePageData = ssrGraphQLQuery({
  query: GRAPHQL_V2 ? collectivePageQueryV2 : collectivePageQuery,
  context: GRAPHQL_V2 ? API_V2_CONTEXT : null,
  getVariablesFromProps: ({ slug }) => getCollectivePageQueryVariables(slug),
  useLegacyDataStructure: true,
  preload: (client, result) => preloadCollectivePageGraphqlQueries(client, result?.data?.Collective),
});

// next.js export
// ts-unused-exports:disable-next-line
export default withRouter(withUser(addCollectivePageData(CollectivePage)));
