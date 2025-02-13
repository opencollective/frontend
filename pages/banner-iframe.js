import React from 'react';
import PropTypes from 'prop-types';
import { Query } from '@apollo/client/react/components';
import { graphql } from '@apollo/client/react/hoc';
import { partition } from 'lodash';
import Head from 'next/head';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { CollectiveType } from '../lib/constants/collectives';
import { API_V2_CONTEXT, gql } from '../lib/graphql/helpers';
import { collectiveBannerIframeQuery } from '../lib/graphql/v1/queries';
import { getRequestIntl } from '../lib/i18n/request';
import { parseToBoolean } from '../lib/utils';

import TopContributors from '../components/collective-page/TopContributors';
import Loading from '../components/Loading';
import MembersWithData from '../components/MembersWithData';
import MessageBoxGraphqlError from '../components/MessageBoxGraphqlError';
import StyledLink from '../components/StyledLink';
import { H3 } from '../components/Text';

const topContributorsQuery = gql`
  query BannerTopContributors($collectiveSlug: String!) {
    account(slug: $collectiveSlug, throwIfMissing: false) {
      id
      currency
      slug
      ... on AccountWithContributions {
        contributors(limit: 150) {
          totalCount
          nodes {
            id
            name
            roles
            isAdmin
            isCore
            isBacker
            since
            image
            description
            collectiveSlug
            totalAmountDonated
            type
            publicMessage
            isIncognito
          }
        }
      }
    }
  }
`;

const ContributeButton = styled.div`
  width: 338px;
  height: 50px;
  overflow: hidden;
  margin: 0;
  padding: 0;
  background-repeat: no-repeat;
  float: left;
  border: none;
  background-color: transparent;
  cursor: pointer;
  background-image: url(/static/images/buttons/contribute-button-blue.svg);

  :hover {
    background-position: 0 -50px;
  }
  :active {
    background-position: 0 -100px;
  }
  :focus {
    outline: 0;
  }
`;

const IFrameContainer = styled.div`
  display: block;
  height: 100%;
  overflow: hidden;

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-Regular.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-Regular.woff') format('woff');
  }
  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 400;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-Italic.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-Italic.woff') format('woff');
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-Medium.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-Medium.woff') format('woff');
  }
  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 500;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-MediumItalic.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-MediumItalic.woff') format('woff');
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-SemiBold.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-SemiBold.woff') format('woff');
  }
  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 600;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-SemiBoldItalic.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-SemiBoldItalic.woff') format('woff');
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-Bold.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-Bold.woff') format('woff');
  }
  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 700;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-BoldItalic.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-BoldItalic.woff') format('woff');
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 800;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-ExtraBold.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-ExtraBold.woff') format('woff');
  }
  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 800;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-ExtraBoldItalic.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-ExtraBoldItalic.woff') format('woff');
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 900;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-Black.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-Black.woff') format('woff');
  }
  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 900;
    font-display: swap;
    src: url('/static/fonts/inter/Inter-BlackItalic.woff2') format('woff2'),
      url('/static/fonts/inter/Inter-BlackItalic.woff') format('woff');
  }

  a {
    text-decoration: none;
    color: ${style => (style.a && style.a.color) || '#46b0ed'}
    cursor: pointer;
    font-size: 14px;
  }

  .actions {
    text-align: center;
  }

  h2 {
    font-size: 16px;
    margin-bottom: 0;
    font-weight: 300;
    text-align: center;
  }

  ul {
    list-style: none;
    padding: 0;
  }
`;

class BannerIframe extends React.Component {
  static getInitialProps({ query: { collectiveSlug, id, style, useNewFormat }, req, res }) {
    // Allow to be embedded as Iframe everywhere
    if (res) {
      const { locale } = getRequestIntl(req);
      res.removeHeader('X-Frame-Options');
      if (locale === 'en') {
        res.setHeader('Cache-Control', 'public, s-maxage=7200');
      }
    }

    return { collectiveSlug, id, style, useNewFormat: parseToBoolean(useNewFormat) };
  }

  static propTypes = {
    collectiveSlug: PropTypes.string, // from getInitialProps, for addCollectiveBannerIframeData
    id: PropTypes.string, // from getInitialProps
    style: PropTypes.string, // from getInitialProps
    data: PropTypes.object.isRequired, // from withData
    useNewFormat: PropTypes.bool,
  };

  componentDidMount() {
    this.onSizeUpdate();
    window.addEventListener('resize', this.onSizeUpdate);
    this.updateSizeInterval = setInterval(this.onSizeUpdate, 1000);
  }

  componentDidUpdate() {
    this.onSizeUpdate();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onSizeUpdate);
    clearInterval(this.updateSizeInterval);
  }

  onSizeUpdate = () => {
    // Wait for the render to be completed by the browser
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const { height, width } = this.node?.getBoundingClientRect() || {};
        if (height && width) {
          this.sendMessageToParentWindow(height, width);
        }
      });
    }
  };

  sendMessageToParentWindow = (height, width) => {
    if (!window.parent) {
      return;
    }

    const message = `oc-${JSON.stringify({ id: this.props.id, height, width })}`;
    window.parent.postMessage(message, '*');
  };

  renderTopContributors = collective => {
    const [orgs, individuals] = partition(collective.contributors.nodes, c => c.type !== CollectiveType.USER);
    return <TopContributors organizations={orgs} individuals={individuals} currency={collective.currency} />;
  };

  renderNewFormat = () => {
    return (
      <div ref={node => (this.node = node)}>
        <Query
          query={topContributorsQuery}
          variables={{ collectiveSlug: this.props.collectiveSlug }}
          context={API_V2_CONTEXT}
          onCompleted={this.onSizeUpdate}
        >
          {({ data, error, loading }) =>
            loading ? (
              <Loading />
            ) : error ? (
              <MessageBoxGraphqlError error={error} />
            ) : (
              <div>
                <div className="mb-3 flex flex-col items-center">
                  <H3 fontSize="18px" lineHeight="28px">
                    <FormattedMessage
                      id="NewContributionFlow.Join"
                      defaultMessage="Join {numberOfContributors} other fellow contributors"
                      values={{ numberOfContributors: data.account.contributors.totalCount }}
                    />
                  </H3>
                  <StyledLink openInNewTab href={`https://opencollective.com/${this.props.collectiveSlug}`}>
                    <FormattedMessage
                      id="widget.contributeOnOpenCollective"
                      defaultMessage="Contribute on Open Collective"
                    />
                  </StyledLink>
                </div>
                {this.renderTopContributors(data.account)}
              </div>
            )
          }
        </Query>
      </div>
    );
  };

  render() {
    const { collectiveSlug, data, useNewFormat } = this.props;

    if (useNewFormat) {
      return this.renderNewFormat();
    }

    let style;
    try {
      style = JSON.parse(this.props.style || '{}');
    } catch (e) {
      style = {};
    }

    if (data.loading) {
      return (
        <div ref={node => (this.node = node)}>
          <FormattedMessage id="loading" defaultMessage="loading" />
        </div>
      );
    }

    const collective = data.Collective;
    if (!collective) {
      return (
        <div ref={node => (this.node = node)}>
          <FormattedMessage id="notFound" defaultMessage="Not found" />
        </div>
      );
    }

    const { backers } = collective.stats;

    return (
      <IFrameContainer linkColor={style} ref={node => (this.node = node)}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{`${collectiveSlug} collectives`}</title>
        </Head>
        {backers.organizations + backers.collectives + backers.users === 0 && (
          <a target="_blank" rel="noopener noreferrer" href={`https://opencollective.com/${collectiveSlug}`}>
            <ContributeButton />
          </a>
        )}

        {backers.organizations + backers.collectives > 0 && (
          <section id="organizations" className="tier">
            <h2 style={style.h2}>
              <FormattedMessage
                id="collective.section.backers.organizations.title"
                values={{
                  n: backers.organizations + backers.collectives,
                  collective: collective.name,
                }}
                defaultMessage="{n} {n, plural, one {organization is} other {organizations are}} supporting {collective}"
              />
            </h2>
            <div className="actions">
              <a
                href={`https://opencollective.com/${collectiveSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={style.a}
              >
                <FormattedMessage
                  id="widget.contributeOnOpenCollective"
                  defaultMessage="Contribute on Open Collective"
                />
              </a>
            </div>
            <MembersWithData
              collective={collective}
              onChange={this.onSizeUpdate}
              type="ORGANIZATION,COLLECTIVE"
              memberRole="BACKER"
              limit={100}
              orderBy="totalDonations"
            />
          </section>
        )}

        {backers.users > 0 && (
          <section id="backers" className="tier">
            <h2 style={style.h2}>
              <FormattedMessage
                id="collective.section.backers.users.title"
                values={{ n: backers.users, collective: collective.name }}
                defaultMessage="{n} {n, plural, one {individual is} other {individuals are}} supporting {collective}"
              />
            </h2>

            <div className="actions">
              <a
                href={`https://opencollective.com/${collectiveSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={style.a}
              >
                <FormattedMessage
                  id="widget.contributeOnOpenCollective"
                  defaultMessage="Contribute on Open Collective"
                />
              </a>
            </div>
            <MembersWithData
              collective={collective}
              onChange={this.onSizeUpdate}
              type="USER"
              memberRole="BACKER"
              limit={100}
              orderBy="totalDonations"
            />
          </section>
        )}
      </IFrameContainer>
    );
  }
}

const addCollectiveBannerIframeData = graphql(collectiveBannerIframeQuery, {
  options({ collectiveSlug, useNewFormat }) {
    return { skip: !collectiveSlug || useNewFormat };
  },
});

// next.js export
// ts-unused-exports:disable-next-line
export default addCollectiveBannerIframeData(BannerIframe);
