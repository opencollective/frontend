import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { get, omit, pick } from 'lodash';
import { withRouter } from 'next/router';
import { injectIntl } from 'react-intl';

import { generateNotFoundError, getErrorFromGraphqlException } from '../../lib/errors';
import { API_V2_CONTEXT } from '../../lib/graphql/helpers';
import { PaymentMethodLegacyType } from '../../lib/graphql/types/v2/schema';
import { addParentToURLIfMissing } from '../../lib/url-helpers';

import CollectiveThemeProvider from '../../components/CollectiveThemeProvider';
import Container from '../../components/Container';
import ContributionBlocker, { getContributionBlocker } from '../../components/contribution-flow/ContributionBlocker';
import { contributionFlowAccountQuery } from '../../components/contribution-flow/graphql/queries';
import ContributionFlowContainer from '../../components/contribution-flow/index';
import { EmbedContributionFlowUrlQueryHelper } from '../../components/contribution-flow/query-parameters';
import { getContributionFlowMetadata } from '../../components/contribution-flow/utils';
import EmbeddedPage from '../../components/EmbeddedPage';
import ErrorPage from '../../components/ErrorPage';
import Loading from '../../components/Loading';
import { withStripeLoader } from '../../components/StripeProvider';
import { withUser } from '../../components/UserProvider';

class EmbedContributionFlowPage extends React.Component<{
  router: any;
  collectiveSlug: string;
  tierId: number;
  error: string;
  queryParams: Record<string, unknown>;
  loadStripe: () => void;
  intl: any;
  LoggedInUser: any;
  data: Record<string, any>;
}> {
  static getInitialProps({ query, res }) {
    if (res) {
      res.removeHeader('X-Frame-Options');
    }

    return {
      // Route parameters
      collectiveSlug: query.eventSlug || query.collectiveSlug,
      tierId: parseInt(query.tierId) || null,
      // Query parameters
      error: query.error,
      queryParams: EmbedContributionFlowUrlQueryHelper.decode(query),
    };
  }

  componentDidMount() {
    this.loadExternalScripts();
    const { router, data } = this.props;
    const account = data?.account;
    const path = router.asPath;
    const rawPath = path.replace(new RegExp(`^/embed/${account?.slug}/`), '/');
    addParentToURLIfMissing(router, account, rawPath, undefined, { prefix: '/embed' });
    this.postMessage('initialized');
    window.addEventListener('resize', this.onResize);
  }

  componentDidUpdate(prevProps) {
    const hostPath = 'data.account.host';
    if (get(this.props, hostPath) !== get(prevProps, hostPath)) {
      this.loadExternalScripts();
    }
    if (this.props.LoggedInUser && !prevProps.LoggedInUser) {
      this.props.data.refetch();
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.postMessage('resized');
  };

  postMessage(event, payload = null) {
    if (window.parent) {
      try {
        const size = { height: document.body.scrollHeight, width: document.body.scrollWidth };
        const message = { event, size };
        if (payload) {
          message['payload'] = payload;
        }

        window.parent.postMessage(message, '*');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Post message failed', e);
      }
    }
  }

  loadExternalScripts() {
    const supportedPaymentMethods = get(this.props.data, 'account.host.supportedPaymentMethods', []);
    if (supportedPaymentMethods.includes(PaymentMethodLegacyType.CREDIT_CARD)) {
      this.props.loadStripe();
    }
  }

  getPageMetadata() {
    const { intl, data } = this.props;
    return {
      ...getContributionFlowMetadata(intl, data?.account, data?.tier),
      canonicalURL: null,
    };
  }

  renderPageContent() {
    const { data, LoggedInUser } = this.props;
    const { account, tier, loading, me } = data || {};

    if (loading) {
      return (
        <Container py={[5, 6]}>
          <Loading />
        </Container>
      );
    }

    const contributionBlocker = getContributionBlocker(LoggedInUser, account, tier, Boolean(this.props.tierId));
    if (contributionBlocker) {
      return <ContributionBlocker blocker={contributionBlocker} account={account} />;
    } else {
      return (
        <div className="h-full pt-3">
          <ContributionFlowContainer
            isEmbed
            collective={account}
            host={account.host}
            tier={tier}
            error={this.props.error}
            contributorProfiles={me?.contributorProfiles || []}
            onStepChange={step =>
              this.postMessage('stepChange', {
                step,
                height: document.body.scrollHeight,
                width: document.body.scrollWidth,
              })
            }
            onSuccess={order =>
              this.postMessage('success', {
                order: {
                  id: order.id,
                  legacyId: order.legacyId,
                  status: order.status,
                  frequency: order.frequency,
                  amount: omit(order.amount, ['__typename']),
                  platformTipAmount: omit(order.platformTipAmount, ['__typename']),
                  tier: order.tier ? pick(order.tier, ['id']) : null,
                  fromAccount: pick(order.fromAccount, ['id']),
                  toAccount: pick(order.toAccount, ['id']),
                },
              })
            }
          />
        </div>
      );
    }
  }

  render() {
    const { data, queryParams } = this.props;
    if (!data.loading && !data.account) {
      const error = data.error
        ? getErrorFromGraphqlException(data.error)
        : generateNotFoundError(this.props.collectiveSlug);

      return <ErrorPage error={error} />;
    } else {
      return (
        <CollectiveThemeProvider collective={queryParams.useTheme ? data.account : null}>
          <EmbeddedPage backgroundColor={queryParams.backgroundColor}>{this.renderPageContent()}</EmbeddedPage>
        </CollectiveThemeProvider>
      );
    }
  }
}

const addContributionFlowData = graphql(contributionFlowAccountQuery, {
  options: (props: { collectiveSlug: string; tierId: number }) => ({
    variables: { collectiveSlug: props.collectiveSlug, tierId: props.tierId, includeTier: Boolean(props.tierId) },
    context: API_V2_CONTEXT,
  }),
});

// next.js export
// ts-unused-exports:disable-next-line
export default addContributionFlowData(withUser(injectIntl(withStripeLoader(withRouter(EmbedContributionFlowPage)))));
