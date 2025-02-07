import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { getCollectivePageMetadata } from '../lib/collective';
import { TierTypes } from '../lib/constants/tiers-types';
import { sortEvents } from '../lib/events';
import { gqlV1 } from '../lib/graphql/helpers';
import { ssrGraphQLQuery } from '../lib/graphql/with-ssr-query';
import { sortTiersForCollective } from '../lib/tier-utils';
import { getCollectivePageRoute } from '../lib/url-helpers';
import { getWebsiteUrl } from '../lib/utils';

import Body from '../components/Body';
import CollectiveNavbar from '../components/collective-navbar';
import { NAVBAR_CATEGORIES } from '../components/collective-navbar/constants';
import * as fragments from '../components/collective-page/graphql/fragments';
import CollectiveThemeProvider from '../components/CollectiveThemeProvider';
import Container from '../components/Container';
import { MAX_CONTRIBUTORS_PER_CONTRIBUTE_CARD } from '../components/contribute-cards/constants';
import ContributeCollective from '../components/contribute-cards/ContributeCollective';
import ContributeCustom from '../components/contribute-cards/ContributeCustom';
import ContributeEvent from '../components/contribute-cards/ContributeEvent';
import ContributeProject from '../components/contribute-cards/ContributeProject';
import ContributeTier from '../components/contribute-cards/ContributeTier';
import ErrorPage from '../components/ErrorPage';
import { Grid } from '../components/Grid';
import Header from '../components/Header';
import Link from '../components/Link';
import Loading from '../components/Loading';
import MessageBox from '../components/MessageBox';
import Footer from '../components/navigation/Footer';
import StyledButton from '../components/StyledButton';
import { H2, P } from '../components/Text';
import { withUser } from '../components/UserProvider';

const CardsContainer = styled(Grid).attrs({
  gridGap: '30px',
  justifyContent: ['center', 'space-between'],
  gridTemplateColumns: [
    'minmax(280px, 400px)',
    'repeat(2, minmax(280px, 350px))',
    'repeat(3, minmax(240px, 350px))',
    'repeat(3, minmax(280px, 350px))',
    'repeat(4, 280px)',
  ],
})`
  & > * {
    width: 100%;
  }
`;

class ContributePage extends React.Component {
  static getInitialProps({ query: { collectiveSlug, verb } }) {
    return { slug: collectiveSlug, verb };
  }

  static propTypes = {
    slug: PropTypes.string, // from getInitialProps, for addContributePageData
    verb: PropTypes.string, // from getInitialProps
    data: PropTypes.object.isRequired, // from withData
    LoggedInUser: PropTypes.object,
  };

  getFinancialContributorsWithoutTier = memoizeOne(contributors => {
    return contributors.filter(c => c.isBacker && (c.tiersIds.length === 0 || c.tiersIds[0] === null));
  });

  hasContributors = memoizeOne((collective, verb) => {
    const hasFinancial = collective.contributors.some(c => c.isBacker);
    const hasEventContributors = collective.events?.some(event => event.contributors.length > 0);
    const hasProjectContributors = collective.projects?.some(project => project.contributors.length > 0);
    const hasConnectedCollectiveContributors = collective.connectedCollectives?.some(
      connectedCollective => connectedCollective.collective.contributors.length > 0,
    );

    switch (verb) {
      case 'events':
        return hasEventContributors;
      case 'projects':
        return hasProjectContributors;
      case 'connected-collectives':
        return hasConnectedCollectiveContributors;
      case 'tiers':
        return hasFinancial;
      default:
        return hasFinancial || hasEventContributors || hasProjectContributors;
    }
  });

  getPageMetadata(collective) {
    const baseMetadata = getCollectivePageMetadata(collective);
    if (!collective) {
      return { ...baseMetadata, title: 'Contribute', description: 'All the ways to contribute', noRobots: false };
    } else {
      return {
        ...baseMetadata,
        title: `Contribute to ${collective.name}`,
        description: 'These are all the ways you can help make our community sustainable. ',
        canonicalURL: `${getWebsiteUrl()}/${collective.slug}/contribute`,
        noRobots: false,
      };
    }
  }

  getWaysToContribute = memoizeOne((collective, verb) => {
    if (!collective) {
      return [];
    }

    const waysToContribute = [];
    const canContribute = collective.isActive && collective.host;
    const hasContributors = this.hasContributors(collective, verb);
    const showAll = verb === 'contribute';

    // Financial contributions
    if ((showAll || verb === 'tiers') && canContribute) {
      // Tiers + custom contribution
      const sortedTiers = sortTiersForCollective(collective, collective.tiers);
      sortedTiers.forEach(tier => {
        if (tier === 'custom') {
          waysToContribute.push({
            ContributeCardComponent: ContributeCustom,
            key: 'contribute-tier-custom',
            props: {
              hideContributors: !hasContributors,
              collective: collective,
              contributors: this.getFinancialContributorsWithoutTier(collective.contributors),
              stats: collective.stats.backers,
            },
          });
        } else {
          waysToContribute.push({
            ContributeCardComponent: ContributeTier,
            key: `tier-${tier.id}`,
            props: {
              collective: collective,
              tier: tier,
              hideContributors: !hasContributors,
              'data-cy': 'contribute-tier',
            },
          });
        }
      });

      // Tickets
      const tickets = collective.tiers?.filter(t => t.type === TierTypes.TICKET);
      tickets?.forEach(ticket => {
        waysToContribute.push({
          ContributeCardComponent: ContributeTier,
          key: `ticket-${ticket.id}`,
          props: {
            collective: collective,
            tier: ticket,
            hideContributors: !hasContributors,
            'data-cy': 'contribute-ticket',
          },
        });
      });
    }

    // Projects
    if (showAll || verb === 'projects') {
      collective.projects?.forEach(project => {
        waysToContribute.push({
          ContributeCardComponent: ContributeProject,
          key: `project-${project.id}`,
          props: {
            collective: collective,
            project: project,
            disableCTA: !project.isActive,
            hideContributors: !hasContributors,
          },
        });
      });
    }

    // Events
    if (showAll || verb === 'events') {
      sortEvents(collective.events).forEach(event => {
        waysToContribute.push({
          ContributeCardComponent: ContributeEvent,
          key: `event-${event.id}`,
          props: {
            collective: collective,
            event: event,
            hideContributors: !hasContributors,
          },
        });
      });
    }

    // Connected collectives
    if (showAll || verb === 'connected-collectives') {
      collective.connectedCollectives?.forEach(connectedCollectiveMember => {
        waysToContribute.push({
          ContributeCardComponent: ContributeCollective,
          key: `connected-collective-${connectedCollectiveMember.id}`,
          props: {
            collective: connectedCollectiveMember.collective,
          },
        });
      });
    }

    return waysToContribute;
  });

  getTitle(verb, collectiveName) {
    switch (verb) {
      case 'events':
        return {
          title: (
            <FormattedMessage
              id="CollectiveEvents"
              defaultMessage="{collectiveName}'s events"
              values={{ collectiveName }}
            />
          ),
        };
      case 'projects':
        return {
          title: (
            <FormattedMessage
              id="CollectiveProjects"
              defaultMessage="{collectiveName}'s projects"
              values={{ collectiveName }}
            />
          ),
        };
      case 'connected-collectives':
        return {
          title: (
            <FormattedMessage
              id="CollectiveConnectedCollectives"
              defaultMessage="{collectiveName}'s connected collectives"
              values={{ collectiveName }}
            />
          ),
        };
      default:
        return {
          title: <FormattedMessage id="CP.Contribute.Title" defaultMessage="Become a contributor" />,
          subtitle: (
            <FormattedMessage
              id="ContributePage.Description"
              defaultMessage="These are all the ways you can help make our community sustainable. "
            />
          ),
        };
    }
  }

  render() {
    const { LoggedInUser, data = {}, verb, slug } = this.props;

    if (!data || !data.Collective) {
      return <ErrorPage data={data} />;
    }

    const collective = data.Collective;
    const collectiveName = collective?.name || slug;
    const waysToContribute = this.getWaysToContribute(collective, verb);
    const { title, subtitle } = this.getTitle(verb, collectiveName);
    return (
      <div>
        <Header LoggedInUser={LoggedInUser} {...this.getPageMetadata(collective)} collective={collective} />
        <Body>
          {data.loading ? (
            <Loading />
          ) : (
            <CollectiveThemeProvider collective={data.Collective}>
              <Container pb={3}>
                <CollectiveNavbar collective={collective} selectedCategory={NAVBAR_CATEGORIES.CONTRIBUTE} />
                <Container maxWidth={1260} my={5} px={[15, 30]} mx="auto">
                  <div className="my-5">
                    <div className="flex flex-wrap justify-between">
                      <H2 fontWeight="normal" mb={2}>
                        {title}
                      </H2>
                      {LoggedInUser?.isAdminOfCollective(collective) && verb === 'events' && (
                        <Link href={`/${collective.slug}/events/new`}>
                          <StyledButton buttonStyle="primary">
                            <FormattedMessage id="event.create.btn" defaultMessage="Create Event" />
                          </StyledButton>
                        </Link>
                      )}
                      {LoggedInUser?.isAdminOfCollective(collective) && verb === 'projects' && (
                        <Link href={`/${collective.slug}/projects/new`}>
                          <StyledButton buttonStyle="primary">
                            <FormattedMessage id="SectionProjects.CreateProject" defaultMessage="Create Project" />
                          </StyledButton>
                        </Link>
                      )}
                    </div>
                    {subtitle && (
                      <P color="black.700" mt={3}>
                        {subtitle}
                      </P>
                    )}
                    {waysToContribute.length > 0 && (
                      <Link href={getCollectivePageRoute(collective)}>
                        <StyledButton buttonSize="small" mt={3}>
                          ←&nbsp;
                          <FormattedMessage
                            id="goBackToCollectivePage"
                            defaultMessage="Go back to {name}'s page"
                            values={{ name: collectiveName }}
                          />
                        </StyledButton>
                      </Link>
                    )}
                  </div>
                  {waysToContribute.length > 0 ? (
                    <CardsContainer>
                      {waysToContribute.map(({ ContributeCardComponent, key, props }) => (
                        <ContributeCardComponent key={key} {...props} />
                      ))}
                    </CardsContainer>
                  ) : (
                    <MessageBox type="info" withIcon>
                      <FormattedMessage
                        id="contribute.empty"
                        defaultMessage="There's nothing to display here at the moment."
                      />{' '}
                      <Link href={`/${slug}`}>
                        <FormattedMessage
                          id="goBackToCollectivePage"
                          defaultMessage="Go back to {name}'s page"
                          values={{ name: collectiveName }}
                        />
                      </Link>
                    </MessageBox>
                  )}
                </Container>
              </Container>
            </CollectiveThemeProvider>
          )}
        </Body>
        <Footer />
      </div>
    );
  }
}

const contributePageQuery = gqlV1/* GraphQL */ `
  query ContributePage(
    $slug: String!
    $nbContributorsPerContributeCard: Int
    $includeTiers: Boolean!
    $includeEvents: Boolean!
    $includeProjects: Boolean!
    $includeConnectedCollectives: Boolean!
  ) {
    Collective(slug: $slug) {
      id
      slug
      path
      name
      type
      currency
      settings
      isActive
      isHost
      backgroundImageUrl
      imageUrl
      location {
        id
        country
      }
      parentCollective {
        id
        name
        slug
        backgroundImageUrl
        imageUrl
      }
      features {
        id
        ...NavbarFields
      }
      host {
        id
        name
        slug
        type
        location {
          id
          country
        }
      }
      stats {
        id
        backers {
          id
          all
          users
          organizations
        }
      }
      contributors {
        id
        name
        roles
        isAdmin
        isCore
        isBacker
        since
        description
        collectiveSlug
        totalAmountDonated
        type
        publicMessage
        isIncognito
        tiersIds
      }
      tiers @include(if: $includeTiers) {
        id
        ...ContributeCardTierFields
      }
      events(includePastEvents: true, includeInactive: true) @include(if: $includeEvents) {
        id
        ...ContributeCardEventFields
      }
      projects @include(if: $includeProjects) {
        id
        ...ContributeCardProjectFields
      }
      connectedCollectives: members(role: "CONNECTED_COLLECTIVE") @include(if: $includeConnectedCollectives) {
        id
        collective: member {
          id
          slug
          name
          type
          description
          backgroundImageUrl(height: 208)
          stats {
            id
            backers {
              id
              all
              users
              organizations
            }
          }
          contributors(limit: $nbContributorsPerContributeCard) {
            id
            ...ContributeCardContributorFields
          }
        }
      }
    }
  }
  ${fragments.collectiveNavbarFieldsFragment}
  ${fragments.contributeCardTierFieldsFragment}
  ${fragments.contributeCardEventFieldsFragment}
  ${fragments.contributeCardProjectFieldsFragment}
`;

const addContributePageData = ssrGraphQLQuery({
  query: contributePageQuery,
  getVariablesFromProps: props => ({
    slug: props.slug,
    nbContributorsPerContributeCard: MAX_CONTRIBUTORS_PER_CONTRIBUTE_CARD,
    includeTiers: ['contribute', 'tiers'].includes(props.verb),
    includeEvents: ['contribute', 'events'].includes(props.verb),
    includeProjects: ['contribute', 'projects'].includes(props.verb),
    includeConnectedCollectives: ['contribute', 'connected-collectives'].includes(props.verb),
  }),
});

// next.js export
// ts-unused-exports:disable-next-line
export default withUser(addContributePageData(ContributePage));
