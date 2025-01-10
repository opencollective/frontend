import { defineMessages } from 'react-intl';

export const ROOT_PROFILE_KEY = 'root-actions';
export const ROOT_PROFILE_ACCOUNT = { slug: ROOT_PROFILE_KEY, type: 'ROOT', name: 'Platform Admin' };

export const SECTIONS = {
  OVERVIEW: 'overview',
  REPORTS: 'reports',
  EXPENSE_REPORTS: 'reports/expenses',
  TRANSACTION_REPORTS: 'reports/transactions',
  CHART_OF_ACCOUNTS: 'chart-of-accounts',
  HOST_EXPENSES: 'host-expenses',
  HOST_AGREEMENTS: 'host-agreements',
  HOST_FINANCIAL_CONTRIBUTIONS: 'orders',
  HOSTED_COLLECTIVES: 'hosted-collectives',
  HOST_VIRTUAL_CARDS: 'host-virtual-cards',
  HOST_VIRTUAL_CARD_REQUESTS: 'host-virtual-card-requests',
  HOST_APPLICATIONS: 'host-applications',
  HOST_TAX_FORMS: 'host-tax-forms',
  CONTRIBUTORS: 'contributors',
  HOST_COMMUNITY: 'host-community',
  INCOMING_CONTRIBUTIONS: 'incoming-contributions',
  OUTGOING_CONTRIBUTIONS: 'outgoing-contributions',
  HOST_EXPECTED_FUNDS: 'expected-funds',
  EXPENSES: 'expenses',
  SUBMITTED_EXPENSES: 'submitted-expenses',
  TRANSACTIONS: 'transactions',
  UPDATES: 'updates',
  HOST_TRANSACTIONS: 'host-transactions',
  VIRTUAL_CARDS: 'virtual-cards',
  TEAM: 'team',
  VENDORS: 'vendors',
  ACCOUNTS: 'accounts',
};

export const ROOT_SECTIONS = {
  ALL_COLLECTIVES: 'all-collectives',
  BAN_ACCOUNTS: 'ban-account',
  SEARCH_AND_BAN: 'search-and-ban',
  MOVE_AUTHORED_CONTRIBUTIONS: 'move-authored-contributions',
  MOVE_RECEIVED_CONTRIBUTIONS: 'move-received-contributions',
  MOVE_EXPENSES: 'move-expenses',
  CLEAR_CACHE: 'clear-cache',
  CONNECT_ACCOUNTS: 'connect-accounts',
  MERGE_ACCOUNTS: 'merge-accounts',
  UNHOST_ACCOUNTS: 'unhost-accounts',
  ACCOUNT_SETTINGS: 'account-settings',
  ACCOUNT_TYPE: 'account-type',
  ANONYMIZE_ACCOUNT: 'anonymize-account',
  RECURRING_CONTRIBUTIONS: 'recurring-contributions',
};

export const SETTINGS_SECTIONS = {
  NOTIFICATIONS: 'notifications',
  INVOICES_RECEIPTS: 'invoices-receipts',
  TAX_INFORMATION: 'tax-information',
};

// Sections using the AccountSettings component in /dashboard/DashboardSection
// (and expecting a Collective from gql v1)
export const LEGACY_SECTIONS = {
  TIERS: 'tiers',
  TICKETS: 'tickets',
};
export const LEGACY_SETTINGS_SECTIONS = {
  HOST: 'host',
  INFO: 'info',
  GIFT_CARDS: 'gift-cards',
  CREATE_GIFT_CARDS: 'gift-cards-create',
  PAYMENT_METHODS: 'payment-methods',
  PAYMENT_RECEIPTS: 'payment-receipts',
  FISCAL_HOSTING: 'fiscal-hosting',
  SECURITY: 'security',
  HOST_VIRTUAL_CARDS_SETTINGS: 'host-virtual-cards-settings',
  POLICIES: 'policies',
  RECEIVING_MONEY: 'receiving-money',
  SENDING_MONEY: 'sending-money',
  WEBHOOKS: 'webhooks',
  ADVANCED: 'advanced',
  AUTHORIZED_APPS: 'authorized-apps',
  COLLECTIVE_GOALS: 'goals',
  CONNECTED_ACCOUNTS: 'connected-accounts',
  EXPORT: 'export',
  FOR_DEVELOPERS: 'for-developers',
  USER_SECURITY: 'user-security',
  CUSTOM_EMAIL: 'custom-email',
  ACTIVITY_LOG: 'activity-log',
  COLLECTIVE_PAGE: 'collective-page',
};

export const ALL_SECTIONS = {
  ...SECTIONS,
  ...LEGACY_SECTIONS,
  ...LEGACY_SETTINGS_SECTIONS,
  ...SETTINGS_SECTIONS,
} as const;

export const SECTIONS_ACCESSIBLE_TO_ACCOUNTANTS = [
  ALL_SECTIONS.REPORTS,
  ALL_SECTIONS.TRANSACTION_REPORTS,
  ALL_SECTIONS.EXPENSE_REPORTS,
  ALL_SECTIONS.PAYMENT_RECEIPTS,
  ALL_SECTIONS.HOST_EXPENSES,
  ALL_SECTIONS.HOST_FINANCIAL_CONTRIBUTIONS,
  ALL_SECTIONS.TRANSACTIONS,
  ALL_SECTIONS.EXPENSES,
  ALL_SECTIONS.HOST_AGREEMENTS,
  ALL_SECTIONS.HOST_TAX_FORMS,
  ALL_SECTIONS.SUBMITTED_EXPENSES,
  ALL_SECTIONS.CHART_OF_ACCOUNTS,
  ALL_SECTIONS.HOST_TRANSACTIONS,
  ALL_SECTIONS.INCOMING_CONTRIBUTIONS,
  ALL_SECTIONS.OUTGOING_CONTRIBUTIONS,
  ALL_SECTIONS.CONTRIBUTORS,
];

export const SECTION_LABELS = defineMessages({
  [ALL_SECTIONS.EXPENSES]: {
    id: 'Expenses',
    defaultMessage: 'Expenses',
  },
  [ALL_SECTIONS.TRANSACTIONS]: {
    id: 'menu.transactions',
    defaultMessage: 'Transactions',
  },
  [ALL_SECTIONS.ACTIVITY_LOG]: {
    id: 't0lUqz',
    defaultMessage: 'Activity log',
  },
  [ALL_SECTIONS.HOST_FINANCIAL_CONTRIBUTIONS]: {
    id: 'FinancialContributions',
    defaultMessage: 'Financial Contributions',
  },
  [ALL_SECTIONS.HOST_APPLICATIONS]: {
    id: 'Menu.HostApplications',
    defaultMessage: 'Host Applications',
  },
  [ALL_SECTIONS.OVERVIEW]: {
    id: 'AdminPanel.Menu.Overview',
    defaultMessage: 'Overview',
  },
  [ALL_SECTIONS.REPORTS]: {
    defaultMessage: 'Transactions',
    id: 'menu.transactions',
  },
  [ALL_SECTIONS.ADVANCED]: {
    id: 'editCollective.menu.advanced',
    defaultMessage: 'Advanced',
  },
  [ALL_SECTIONS.COLLECTIVE_GOALS]: {
    id: 'Goals',
    defaultMessage: 'Goals',
  },
  [ALL_SECTIONS.COLLECTIVE_PAGE]: {
    id: 'editCollective.menu.collectivePage',
    defaultMessage: 'Profile Sections',
  },
  [ALL_SECTIONS.CONNECTED_ACCOUNTS]: {
    id: 'H/VkpN',
    defaultMessage: 'Social Accounts',
  },
  [ALL_SECTIONS.EXPORT]: {
    id: 'editCollective.menu.export',
    defaultMessage: 'Export',
  },
  [ALL_SECTIONS.POLICIES]: {
    id: 'editCollective.menu.policies',
    defaultMessage: 'Policies',
  },
  [ALL_SECTIONS.CUSTOM_EMAIL]: {
    id: 'aw01NT',
    defaultMessage: 'Custom Email',
  },
  [ALL_SECTIONS.HOST]: {
    id: 'Fiscalhost',
    defaultMessage: 'Fiscal Host',
  },
  [ALL_SECTIONS.INFO]: {
    id: 'editCollective.menu.info',
    defaultMessage: 'Info',
  },
  [ALL_SECTIONS.INVOICES_RECEIPTS]: {
    id: 'becomeASponsor.invoiceReceipts',
    defaultMessage: 'Invoices & Receipts',
  },
  [ALL_SECTIONS.RECEIVING_MONEY]: {
    id: 'editCollective.receivingMoney',
    defaultMessage: 'Receiving Money',
  },
  [ALL_SECTIONS.SENDING_MONEY]: {
    id: 'editCollective.sendingMoney',
    defaultMessage: 'Sending Money',
  },
  [ALL_SECTIONS.FISCAL_HOSTING]: {
    id: 'editCollective.fiscalHosting',
    defaultMessage: 'Fiscal Hosting',
  },
  [ALL_SECTIONS.CHART_OF_ACCOUNTS]: {
    id: 'IzFWHI',
    defaultMessage: 'Chart of Accounts',
  },
  [ALL_SECTIONS.TEAM]: {
    id: 'Team',
    defaultMessage: 'Team',
  },
  [ALL_SECTIONS.PAYMENT_METHODS]: {
    id: 'editCollective.menu.paymentMethods',
    defaultMessage: 'Payment Methods',
  },
  [ALL_SECTIONS.TIERS]: {
    id: 'Tiers',
    defaultMessage: 'Tiers',
  },
  [ALL_SECTIONS.GIFT_CARDS]: {
    id: 'editCollective.menu.giftCards',
    defaultMessage: 'Gift Cards',
  },
  [ALL_SECTIONS.WEBHOOKS]: {
    id: 'editCollective.menu.webhooks',
    defaultMessage: 'Webhooks',
  },
  [ALL_SECTIONS.AUTHORIZED_APPS]: {
    id: '+o/Xal',
    defaultMessage: 'Authorized Apps',
  },
  [ALL_SECTIONS.FOR_DEVELOPERS]: {
    id: 'o0kPeK',
    defaultMessage: 'For developers',
  },
  [ALL_SECTIONS.TICKETS]: {
    id: 'section.tickets.title',
    defaultMessage: 'Tickets',
  },
  [ALL_SECTIONS.USER_SECURITY]: {
    id: 'Security',
    defaultMessage: 'Security',
  },
  [ALL_SECTIONS.PAYMENT_RECEIPTS]: {
    id: 'editCollective.menu.paymentReceipts',
    defaultMessage: 'Payment Receipts',
  },
  [ALL_SECTIONS.SECURITY]: {
    id: 'Security',
    defaultMessage: 'Security',
  },
  [ALL_SECTIONS.HOST_VIRTUAL_CARDS]: {
    id: 'VirtualCards.Title',
    defaultMessage: 'Virtual Cards',
  },
  [ALL_SECTIONS.HOST_VIRTUAL_CARD_REQUESTS]: {
    id: 'VirtualCardRequests.Title',
    defaultMessage: 'Virtual Card Requests',
  },
  [ALL_SECTIONS.HOST_VIRTUAL_CARDS_SETTINGS]: {
    id: 'VirtualCards.Title',
    defaultMessage: 'Virtual Cards',
  },
  [ALL_SECTIONS.VIRTUAL_CARDS]: {
    id: 'VirtualCards.Title',
    defaultMessage: 'Virtual Cards',
  },
  [ALL_SECTIONS.HOSTED_COLLECTIVES]: {
    id: 'HostedCollectives',
    defaultMessage: 'Hosted Collectives',
  },
  [ALL_SECTIONS.NOTIFICATIONS]: {
    id: 'NotificationsSettings.Title',
    defaultMessage: 'Notification Settings',
  },
  [ALL_SECTIONS.CONTRIBUTORS]: {
    id: 'Contributors',
    defaultMessage: 'Contributors',
  },
  [ALL_SECTIONS.HOST_COMMUNITY]: {
    id: 'HostContributors',
    defaultMessage: 'Host Contributors',
  },
  [ALL_SECTIONS.OUTGOING_CONTRIBUTIONS]: {
    id: 'OutgoingContributions',
    defaultMessage: 'Outgoing Contributions',
  },
  [ALL_SECTIONS.INCOMING_CONTRIBUTIONS]: {
    id: 'IncomingContributions',
    defaultMessage: 'Incoming Contributions',
  },
  [ALL_SECTIONS.VENDORS]: {
    id: 'RilevA',
    defaultMessage: 'Vendors',
  },
  [ALL_SECTIONS.TAX_INFORMATION]: {
    defaultMessage: 'Tax Information',
    id: 'r/dTTe',
  },
  [ALL_SECTIONS.UPDATES]: {
    id: 'updates',
    defaultMessage: 'Updates',
  },
  [ALL_SECTIONS.ACCOUNTS]: {
    defaultMessage: 'Accounts',
    id: 'FvanT6',
  },
});
