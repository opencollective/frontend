/**
 * Makes use of but doesn't necessarily match opencollective-api/server/lib/allowed-features.ts
 */

import { get } from 'lodash';

export const FEATURES = {
  // Collective page features
  // Please refer to and update https://docs.google.com/spreadsheets/d/15ppKaZJCXBjvY7-AjjCj3w5D-4ebLQdEowynJksgDXE/edit#gid=0
  ABOUT: 'ABOUT',
  RECEIVE_FINANCIAL_CONTRIBUTIONS: 'RECEIVE_FINANCIAL_CONTRIBUTIONS',
  RECURRING_CONTRIBUTIONS: 'RECURRING_CONTRIBUTIONS',
  EVENTS: 'EVENTS',
  PROJECTS: 'PROJECTS',
  USE_EXPENSES: 'USE_EXPENSES',
  RECURRING_EXPENSES: 'RECURRING_EXPENSES',
  RECEIVE_EXPENSES: 'RECEIVE_EXPENSES',
  COLLECTIVE_GOALS: 'COLLECTIVE_GOALS',
  TOP_FINANCIAL_CONTRIBUTORS: 'TOP_FINANCIAL_CONTRIBUTORS',
  CONVERSATIONS: 'CONVERSATIONS',
  UPDATES: 'UPDATES',
  TEAM: 'TEAM',
  ADMIN_PANEL: 'ADMIN_PANEL',

  // Other
  TRANSFERWISE: 'TRANSFERWISE',
  TRANSFERWISE_OTT: 'TRANSFERWISE_OTT',
  TRANSACTIONS: 'TRANSACTIONS',
  PAYPAL_DONATIONS: 'PAYPAL_DONATIONS',
  PAYPAL_PAYOUTS: 'PAYPAL_PAYOUTS',
  VIRTUAL_CARDS: 'VIRTUAL_CARDS',
  MULTI_CURRENCY_EXPENSES: 'MULTI_CURRENCY_EXPENSES',
  COMMUNITY_DASHBOARD: 'COMMUNITY_DASHBOARD',
  // Not implemented in API features endpoint yet
  SUBMIT_EXPENSE_ON_BEHALF: 'SUBMIT_EXPENSE_ON_BEHALF',
  CONTACT_FORM: 'CONTACT_FORM',
  CONNECTED_ACCOUNTS: 'CONNECTED_ACCOUNTS',
};

/**
 * A map of paths to retrieve the value of a feature flag from a collective's settings.
 * 2020-11-19: deprecating: please use collective.features from now on! add it to your
 * page's GraphQL query if needed.
 */
const FEATURE_FLAGS = {
  // note: need to add collective.features to expenses query for PayExpenseModal
  [FEATURES.PAYPAL_PAYOUTS]: 'settings.features.paypalPayouts',
  [FEATURES.PAYPAL_DONATIONS]: 'settings.features.paypalDonations',
  // collective page features
  [FEATURES.COLLECTIVE_GOALS]: 'settings.collectivePage.showGoals',
  // other features
  [FEATURES.SUBMIT_EXPENSE_ON_BEHALF]: 'settings.features.submitExpenseOnBehalf',
  [FEATURES.VIRTUAL_CARDS]: 'settings.features.virtualCards',
  [FEATURES.TRANSFERWISE_OTT]: 'settings.transferwise.ott',
  [FEATURES.ADMIN_PANEL]: 'settings.features.adminPanel',
  [FEATURES.RECURRING_EXPENSES]: 'settings.features.recurringExpenses',
  [FEATURES.COMMUNITY_DASHBOARD]: 'settings.features.communityDashboard',
};

export const getFeatureStatus = (collective, feature) => {
  if (!collective || !collective.features) {
    return 'UNSUPPORTED';
  } else {
    return collective.features[feature];
  }
};

/**
 * Returns true if the given feature is supported for collective (even if disabled)
 */
export const isFeatureSupported = (collective, feature) => {
  return getFeatureStatus(collective, feature) !== 'UNSUPPORTED';
};

/**
 * Returns true if the feature is either active or available for collective
 */
export const isFeatureEnabled = (collective, feature) => {
  const featureStatus = getFeatureStatus(collective, feature);
  return featureStatus === 'ACTIVE' || featureStatus === 'AVAILABLE';
};

/**
 * Check if the given feature is activated for collective.
 * @deprecated Features flag should be checked using `account.features` explicitly, which this helper partially do,
 * but it also checks feature flags in settings. Prefer using `isFeatureEnabled` directly.
 */
const hasFeature = (collective, feature) => {
  if (!collective) {
    return false;
  }

  // Check opt-in flags - to be removed when all features using features endpoint?
  const activationFlag = FEATURE_FLAGS[feature];
  if (activationFlag) {
    return Boolean(get(collective, activationFlag, false));
  }

  // New approach: check collective.features
  const featureStatus = getFeatureStatus(collective, feature);
  if (featureStatus === 'ACTIVE' || featureStatus === 'AVAILABLE') {
    return true;
  } else if (featureStatus === 'DISABLED' || featureStatus === 'UNSUPPORTED') {
    return false;
  }

  return true;
};

export default hasFeature;
