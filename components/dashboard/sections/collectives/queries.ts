import { gql } from '../../../../lib/graphql/helpers';

import { accountHoverCardFields } from '../../../AccountHoverCard';

export const HostApplicationFields = gql`
  fragment HostApplicationFields on HostApplication {
    id
    message
    customData
    status
    createdAt
    comments {
      totalCount
    }

    host {
      id
      legacyId
      name
      slug
      website
      description
      type
      imageUrl
      createdAt
      policies {
        id
        COLLECTIVE_MINIMUM_ADMINS {
          numberOfAdmins
        }
      }
    }

    account {
      id
      legacyId
      name
      slug
      website
      description
      type
      imageUrl
      createdAt
      ... on AccountWithHost {
        isActive
        approvedAt
        isApproved
        host {
          id
        }
      }
      memberInvitations(role: [ADMIN]) {
        id
        role
      }
      admins: members(role: ADMIN) {
        totalCount
        nodes {
          id
          account {
            id
            type
            slug
            name
            imageUrl
            ...AccountHoverCardFields
            emails
          }
        }
      }
      ...AccountHoverCardFields
    }
  }

  ${accountHoverCardFields}
`;

const processApplicationAccountFields = gql`
  fragment ProcessHostApplicationFields on AccountWithHost {
    isActive
    approvedAt
    isApproved
    host {
      id
    }
  }
`;
export const hostApplicationsMetadataQuery = gql`
  query HostApplicationsMetadata($hostSlug: String!) {
    host(slug: $hostSlug) {
      id
      slug
      name
      type
      settings
      policies {
        id
        COLLECTIVE_MINIMUM_ADMINS {
          numberOfAdmins
        }
      }

      unreplied: hostApplications(limit: 0, offset: 0, lastCommentBy: COLLECTIVE_ADMIN, status: PENDING) {
        totalCount
      }
      pending: hostApplications(limit: 0, offset: 0, status: PENDING) {
        totalCount
      }
      approved: hostApplications(limit: 0, offset: 0, status: APPROVED) {
        totalCount
      }
      rejected: hostApplications(limit: 0, offset: 0, status: REJECTED) {
        totalCount
      }
    }
  }
`;

export const hostApplicationsQuery = gql`
  query HostApplications(
    $hostSlug: String!
    $limit: Int
    $offset: Int
    $orderBy: ChronologicalOrderInput
    $searchTerm: String
    $status: HostApplicationStatus
    $lastCommentBy: [LastCommentBy]
  ) {
    host(slug: $hostSlug) {
      id

      hostApplications(
        limit: $limit
        offset: $offset
        orderBy: $orderBy
        status: $status
        searchTerm: $searchTerm
        lastCommentBy: $lastCommentBy
      ) {
        offset
        limit
        totalCount
        nodes {
          ...HostApplicationFields
        }
      }
    }
  }
  ${HostApplicationFields}
`;

export const processApplicationMutation = gql`
  mutation ProcessHostApplication(
    $host: AccountReferenceInput
    $account: AccountReferenceInput
    $hostApplication: HostApplicationReferenceInput
    $action: ProcessHostApplicationAction!
    $message: String
  ) {
    processHostApplication(
      host: $host
      account: $account
      hostApplication: $hostApplication
      action: $action
      message: $message
    ) {
      account {
        id
        ... on AccountWithHost {
          ...ProcessHostApplicationFields
        }
      }
      conversation {
        id
        slug
      }
      hostApplication {
        ...HostApplicationFields
      }
    }
  }
  ${processApplicationAccountFields}
  ${HostApplicationFields}
`;

const hostedCollectiveFields = gql`
  fragment HostedCollectiveFields on Account {
    id
    legacyId
    name
    slug
    website
    type
    currency
    imageUrl(height: 96)
    isFrozen
    isHost
    tags
    settings
    createdAt
    stats {
      id
      balance {
        valueInCents
        currency
      }
      consolidatedBalance: balance(includeChildren: true) {
        valueInCents
        currency
      }
    }
    policies {
      id
      COLLECTIVE_ADMINS_CAN_SEE_PAYOUT_METHODS
    }
    ... on AccountWithHost {
      hostFeesStructure
      hostFeePercent
      approvedAt
      hostAgreements {
        totalCount
        nodes {
          id
          title
          attachment {
            id
            url
            name
            type
          }
        }
      }
      host {
        id
        legacyId
        name
        slug
        imageUrl(height: 96)
      }
    }
    ... on AccountWithContributions {
      totalFinancialContributors
    }
    childrenAccounts {
      nodes {
        id
        slug
        name
        type
        stats {
          id
          balance {
            valueInCents
            currency
          }
        }
        ... on AccountWithHost {
          hostFeesStructure
          hostFeePercent
          approvedAt
        }
        members(role: [ADMIN]) {
          nodes {
            id
            account {
              id
              ...AccountHoverCardFields
              emails
            }
          }
        }
      }
    }
    members(role: [ADMIN]) {
      nodes {
        id
        account {
          id
          ...AccountHoverCardFields
          emails
        }
      }
    }
    ... on AccountWithParent {
      parent {
        id
        slug
        name
        ...AccountHoverCardFields
      }
    }
  }
  ${accountHoverCardFields}
`;

export const hostedCollectivesMetadataQuery = gql`
  query HostedCollectivesMetadata($hostSlug: String!) {
    host(slug: $hostSlug) {
      id
      currency
      all: hostedAccounts(limit: 1, accountType: [COLLECTIVE, FUND]) {
        totalCount
        currencies
      }
      active: hostedAccounts(limit: 1, accountType: [COLLECTIVE, FUND], isFrozen: false) {
        totalCount
      }
      frozen: hostedAccounts(limit: 1, isFrozen: true) {
        totalCount
      }
      unhosted: hostedAccounts(limit: 1, accountType: [COLLECTIVE, FUND], isUnhosted: true) {
        totalCount
      }
    }
  }
`;

// TODO: This query is using `legacyId` for host and member.account to interface with the
// legacy `AddFundsForm`. Once the new add funds form will be implemented, we can remove these fields.
export const hostedCollectivesQuery = gql`
  query HostedCollectives(
    $hostSlug: String!
    $limit: Int!
    $offset: Int!
    $sort: OrderByInput
    $hostFeesStructure: HostFeeStructure
    $searchTerm: String
    $type: [AccountType]
    $isApproved: Boolean
    $isFrozen: Boolean
    $isUnhosted: Boolean
    $balance: AmountRangeInput
    $consolidatedBalance: AmountRangeInput
    $currencies: [String]
  ) {
    host(slug: $hostSlug) {
      id
      legacyId
      slug
      name
      currency
      isHost
      type
      settings
      hostFeePercent
      plan {
        id
        hostFees
        hostFeeSharePercent
      }
      hostedAccounts(
        limit: $limit
        offset: $offset
        searchTerm: $searchTerm
        hostFeesStructure: $hostFeesStructure
        accountType: $type
        orderBy: $sort
        isApproved: $isApproved
        isFrozen: $isFrozen
        isUnhosted: $isUnhosted
        balance: $balance
        consolidatedBalance: $consolidatedBalance
        currencies: $currencies
      ) {
        offset
        limit
        totalCount
        nodes {
          id
          ...HostedCollectiveFields
        }
      }
    }
  }

  ${hostedCollectiveFields}
`;

export const hostedCollectiveDetailQuery = gql`
  query HostedCollectiveDetail($id: String!) {
    account(id: $id) {
      id
      ...HostedCollectiveFields
      transactions(limit: 10, offset: 0, kind: [ADDED_FUNDS, CONTRIBUTION, EXPENSE]) {
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
          oppositeAccount {
            id
            slug
            name
            imageUrl
          }
        }
      }
    }
    activities(account: { id: $id }, limit: 5, offset: 0, type: [COLLECTIVE]) {
      nodes {
        id
        type
        createdAt
        data
        isSystem
        account {
          id
          slug
          name
          imageUrl
        }
        fromAccount {
          id
          slug
          name
          imageUrl
        }
        individual {
          id
          slug
          name
          imageUrl
        }
        host {
          id
          name
          slug
          type
        }
      }
    }
  }

  ${hostedCollectiveFields}
`;

export const allCollectivesQuery = gql`
  query AllCollectives(
    $limit: Int!
    $offset: Int!
    $sort: OrderByInput
    $searchTerm: String
    $type: [AccountType]
    $isHost: Boolean
    $host: [AccountReferenceInput]
    $isActive: Boolean
    $consolidatedBalance: AmountRangeInput
  ) {
    accounts(
      limit: $limit
      offset: $offset
      searchTerm: $searchTerm
      type: $type
      orderBy: $sort
      isHost: $isHost
      isActive: $isActive
      host: $host
      consolidatedBalance: $consolidatedBalance
      skipGuests: false
    ) {
      offset
      limit
      totalCount
      nodes {
        id
        ...HostedCollectiveFields
      }
    }
  }

  ${hostedCollectiveFields}
`;
