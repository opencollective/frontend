import { gql } from '../../../../lib/graphql/helpers';

export const PayoutMethodFragment = gql`
  fragment PayoutMethodFields on PayoutMethod {
    id
    type
    name
    isSaved
    data
  }
`;

export const PaymentMethodFragment = gql`
  fragment PaymentMethodFields on PaymentMethod {
    id
    legacyId
    name
    data
    service
    type
    balance {
      valueInCents
      currency
    }
    expiryDate
    monthlyLimit {
      valueInCents
    }
    account {
      id
      slug
      name
    }
    recurringContributions: orders(
      onlyActiveSubscriptions: true
      status: [ACTIVE, ERROR, PENDING, REQUIRE_CLIENT_CONFIRMATION]
    ) {
      totalCount
      nodes {
        id
        legacyId
        needsConfirmation
      }
    }
  }
`;
