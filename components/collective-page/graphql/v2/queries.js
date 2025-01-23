import { isNil } from 'lodash';

import { gql } from '../../../../lib/graphql/helpers';

/**
 * Fields fetched for contributors
 */
const contributorsFieldsFragment = gql`
  fragment ContributorsFieldsV2 on Contributor {
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
    # TODO
    # isGuest
    # tiersIds
    # collectiveId
  }
`;

/**
 * Fields fetched for all possible collective page features
 */
const collectiveNavbarFieldsFragment = gql`
  fragment NavbarFieldsV2 on CollectiveFeatures {
    id
    ABOUT
    CONNECTED_ACCOUNTS
    RECEIVE_FINANCIAL_CONTRIBUTIONS
    RECURRING_CONTRIBUTIONS
    EVENTS
    PROJECTS
    USE_EXPENSES
    RECEIVE_EXPENSES
    COLLECTIVE_GOALS
    TOP_FINANCIAL_CONTRIBUTORS
    CONVERSATIONS
    UPDATES
    TEAM
    CONTACT_FORM
    RECEIVE_HOST_APPLICATIONS
    HOST_DASHBOARD
    TRANSACTIONS
    REQUEST_VIRTUAL_CARDS
  }
`;

const contributeCardContributorFieldsFragment = gql`
  fragment ContributeCardContributorFieldsV2 on Contributor {
    id
    image(height: 64)
    collectiveSlug
    name
    type
    # TODO
    # isGuest
  }
`;

/*
  tier: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    legacyId: PropTypes.number,
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    currency: PropTypes.string,
    useStandalonePage: PropTypes.bool,
    interval: PropTypes.string,
    amountType: PropTypes.string,
    endsAt: PropTypes.string,
    button: PropTypes.string,
    goal: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    minimumAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    maxQuantity: PropTypes.number,
    availableQuantity: PropTypes.number,
    stats: PropTypes.shape({
      totalRecurringDonations: PropTypes.number,
      totalDonated: PropTypes.number,
      contributors: PropTypes.object,
      availableQuantity: PropTypes.number,
    }),
    contributors: PropTypes.arrayOf(PropTypes.object),
  }),
  */

const contributeCardTierFieldsFragment = gql`
  fragment ContributeCardTierFieldsV2 on Tier {
    id
    legacyId
    slug
    name
    description
    currency
    useStandalonePage
    interval # deprecated
    # frequency
    amountType
    endsAt
    button
    goal {
      value
      valueInCents
      currency
    }
    minimumAmount {
      value
      valueInCents
      currency
    }
    amount {
      value
      valueInCents
      currency
    }
    maxQuantity
    availableQuantity
    type
    stats {
      id
      totalAmountReceived {
        valueInCents
      }
      recurringAmount {
        valueInCents
      }
      # TODO
      # totalRecurringDonations
      # totalDonated
      # contributors {
      #   id
      #   all
      #   users
      #   organizations
      # }
      # availableQuantity
    }
    contributors(limit: $nbContributorsPerContributeCard) {
      nodes {
        id
        ...ContributeCardContributorFieldsV2
      }
    }
  }
  ${contributeCardContributorFieldsFragment}
`;

/*
events: PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.number.isRequired,
    contributors: PropTypes.arrayOf(PropTypes.object),
  }),
),
event: PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  backgroundImageUrl: PropTypes.string,
  startsAt: PropTypes.string,
  endsAt: PropTypes.string,
  description: PropTypes.string,
  contributors: PropTypes.arrayOf(PropTypes.object),
  stats: PropTypes.shape({
    backers: PropTypes.object,
  }).isRequired,
}),
*/

const contributeCardEventFieldsFragment = gql`
  fragment ContributeCardEventFieldsV2 on Event {
    id
    legacyId
    name
    slug
    backgroundImageUrl(height: 208)
    startsAt
    endsAt
    description
    contributors(limit: $nbContributorsPerContributeCard, roles: [BACKER, ATTENDEE]) {
      totalCount
      nodes {
        id
        ...ContributeCardContributorFieldsV2
      }
    }
  }
  ${contributeCardContributorFieldsFragment}
`;

/*
projects: PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.number,
    isActive: PropTypes.bool,
    contributors: PropTypes.arrayOf(PropTypes.object),
  }),
),
project: PropTypes.shape({
  name: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  description: PropTypes.string,
  backgroundImageUrl: PropTypes.string,
  contributors: PropTypes.arrayOf(PropTypes.object),
  stats: PropTypes.shape({
    backers: PropTypes.object,
  }).isRequired,
  isArchived: PropTypes.bool,
}),
*/

const contributeCardProjectFieldsFragment = gql`
  fragment ContributeCardProjectFieldsV2 on Project {
    id
    legacyId
    name
    slug
    description
    backgroundImageUrl(height: 208)
    contributors(limit: $nbContributorsPerContributeCard, roles: [BACKER]) {
      totalCount
      nodes {
        id
        ...ContributeCardContributorFieldsV2
      }
    }
    isArchived
    isActive
  }
  ${contributeCardContributorFieldsFragment}
`;

export const collectivePageQuery = gql`
  query CollectivePage($slug: String!, $nbContributorsPerContributeCard: Int) {
    account(slug: $slug, throwIfMissing: false) {
      id
      legacyId
      slug
      name
      description
      longDescription
      # backgroundImage
      backgroundImageUrl
      twitterHandle
      repositoryUrl
      website
      socialLinks {
        type
        url
      }
      tags

      type
      currency
      settings
      isActive

      isArchived
      isFrozen
      isHost
      isIncognito

      permissions {
        contact {
          allowed
        }
      }

      imageUrl(height: 256)

      features {
        id
        ...NavbarFieldsV2
      }

      stats {
        id
        balance {
          valueInCents
        }
        yearlyBudget {
          valueInCents
        }
      }

      memberOf(limit: 1) {
        nodes {
          id
        }
      }

      updates(limit: 0) {
        totalCount
      }

      connectedTo: memberOf(role: CONNECTED_ACCOUNT, limit: 1) {
        nodes {
          id
          account {
            id
            name
            type
            slug
          }
        }
      }

      events: childrenAccounts(accountType: EVENT) {
        nodes {
          id
          ...ContributeCardEventFieldsV2
        }
      }

      projects: childrenAccounts(accountType: PROJECT) {
        nodes {
          id
          ...ContributeCardProjectFieldsV2
        }
      }

      admins: members(role: ADMIN) {
        nodes {
          id
        }
      }

      connectedCollectives: members(role: CONNECTED_ACCOUNT) {
        nodes {
          id
          account {
            id
            legacyId
            slug
            name
            type
            description
            backgroundImageUrl(height: 208)

            ... on AccountWithContributions {
              allBackers: totalFinancialContributors

              contributors(limit: $nbContributorsPerContributeCard) {
                nodes {
                  id
                  ...ContributeCardContributorFieldsV2
                }
              }
            }
          }
        }
      }

      ... on AccountWithContributions {
        tiers {
          nodes {
            id
            ...ContributeCardTierFieldsV2
          }
        }

        financialContributors: contributors(roles: [BACKER], limit: 150) {
          totalCount
          nodes {
            id
            ...ContributorsFieldsV2
          }
        }

        coreContributors: contributors(roles: [ADMIN, MEMBER], limit: 99) {
          nodes {
            id
            ...ContributorsFieldsV2
          }
        }

        allBackers: totalFinancialContributors
      }

      ... on AccountWithParent {
        parent {
          id
          name
          slug
          type
          imageUrl
          backgroundImageUrl
          twitterHandle
          ... on AccountWithContributions {
            coreContributors: contributors(roles: [ADMIN, MEMBER], limit: 99) {
              nodes {
                id
                ...ContributorsFieldsV2
              }
            }
          }
        }
      }

      ... on AccountWithHost {
        isApproved
        hostFeePercent
        platformFeePercent
        host {
          id
          name
          slug
          type
          settings
          plan {
            id
            hostFees
            hostFeeSharePercent
          }
          features {
            id
            VIRTUAL_CARDS
          }
          policies {
            id
            COLLECTIVE_MINIMUM_ADMINS {
              freeze
              numberOfAdmins
            }
          }
        }
      }

      ... on Individual {
        isGuest
        # TODO
        # company
      }

      ... on Host {
        hostFeePercent
        canApply: isOpenToApplications
      }

      ... on Event {
        timezone
        startsAt
        endsAt
        location {
          id
          name
          address
          country
          lat
          long
        }
        orders {
          nodes {
            id
            createdAt
            fromAccount {
              id
              legacyId
              name
              type
              imageUrl
              isIncognito
              description
            }
            tier {
              id
              name
            }
          }
        }
      }
    }
  }

  ${contributorsFieldsFragment}
  ${collectiveNavbarFieldsFragment}
  ${contributeCardTierFieldsFragment}
  ${contributeCardEventFieldsFragment}
  ${contributeCardProjectFieldsFragment}
`;

export const convertCollectiveToGraphqlV1 = account => {
  const collective = { ...account };

  collective.id = collective.legacyId;

  if (collective.parent) {
    collective.parentCollective = convertCollectiveToGraphqlV1(collective.parent);
  }

  collective.stats = { ...(collective.stats || {}) };
  const allBackers = collective.allBackers ?? collective.contributors?.totalCount;
  if (!isNil(allBackers)) {
    collective.stats = { ...collective.stats, backers: { all: allBackers } };
  }

  collective.stats.balance = collective.stats.balance?.valueInCents;
  collective.stats.yearlyBudget = collective.stats.yearlyBudget?.valueInCents;

  if (collective.updates) {
    collective.stats.updates = collective.updates.totalCount;
    delete collective.updates;
  }

  collective.canContact = collective.permissions?.contact?.allowed || false;

  collective.contributors = collective.contributors?.nodes || [];
  collective.coreContributors = collective.coreContributors?.nodes || [];
  collective.financialContributors = collective.financialContributors?.nodes || [];
  collective.tiers = collective.tiers?.nodes || [];
  collective.events = collective.events?.nodes || [];
  collective.projects = collective.projects?.nodes || [];
  collective.connectedTo = collective.connectedTo?.nodes || [];
  collective.admins = collective.admins?.nodes || [];
  collective.connectedCollectives = collective.connectedCollectives?.nodes || [];
  collective.orders = collective.orders?.nodes || [];
  collective.memberOf = collective.memberOf?.nodes || [];

  collective.tiers = collective.tiers.map(tier => {
    const tierData = { ...tier };
    tierData.id = tierData.legacyId;
    tierData.currency = tierData.amount.currency;
    tierData.amount = tierData.amount?.valueInCents;
    tierData.minimumAmount = tierData.minimumAmount?.valueInCents;
    tierData.contributors = tierData.contributors?.nodes || [];
    tierData.totalDonated = tierData.totalAmountReceived?.valueInCents;
    tierData.totalRecurringDonations = tierData.recurringAmount?.valueInCents;
    return tierData;
  });

  collective.events = collective.events.map(event => {
    return convertCollectiveToGraphqlV1(event);
    // const eventData = { ...event };
    // eventData.id = eventData.legacyId;
    // eventData.stats = { backers: { all: eventData.contributors.totalCount } };
    // eventData.contributors = eventData.contributors?.nodes || [];
    // eventData.orders = eventData.orders?.nodes || [];
    // return eventData;
  });

  collective.projects = collective.projects.map(project => {
    return convertCollectiveToGraphqlV1(project);
    // const projectData = { ...project };
    // projectData.id = projectData.legacyId;
    // projectData.stats = { backers: { all: projectData.contributors.totalCount } };
    // projectData.contributors = projectData.contributors?.nodes || [];
    // return projectData;
  });

  collective.coreContributors = collective.coreContributors.map(contributor => {
    const contributorData = { ...contributor };
    return contributorData;
  });

  collective.orders = collective.orders.map(order => {
    return { ...order, fromCollective: { ...order.fromAccount, id: order.fromAccount.legacyId } };
  });

  collective.connectedCollectives = collective.connectedCollectives.map(cc => {
    const ccData = { ...cc };
    ccData.collective = convertCollectiveToGraphqlV1(ccData.account);
    return ccData;
  });

  return collective;
};
