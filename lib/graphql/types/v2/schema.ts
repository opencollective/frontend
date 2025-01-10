export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Values that can be edited in Account's settings */
  AccountSettingsKey: { input: any; output: any; }
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** A field whose value conforms to the standard internet email address format as specified in RFC822: https://www.w3.org/Protocols/rfc822/. */
  EmailAddress: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
  /** A string that cannot be passed as an empty value */
  NonEmptyString: { input: any; output: any; }
  /** A positive float value between 0 and 100 */
  StrictPercentage: { input: any; output: any; }
  /** A field whose value conforms to the standard URL format as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt. */
  URL: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type Account = {
  /** List of activities that the logged-in user is subscribed for this collective */
  activitySubscriptions?: Maybe<Array<Maybe<ActivitySubscription>>>;
  backgroundImageUrl?: Maybe<Scalars['String']['output']>;
  /** Whether this account can have changelog updates */
  canHaveChangelogUpdates: Scalars['Boolean']['output'];
  /** Categories set by Open Collective to help moderation. */
  categories: Array<Maybe<Scalars['String']['output']>>;
  childrenAccounts: AccountCollection;
  /** The list of connected accounts (Stripe, Twitter, etc ...) */
  connectedAccounts?: Maybe<Array<Maybe<ConnectedAccount>>>;
  conversations: ConversationCollection;
  /** Returns conversation's tags for collective sorted by popularity */
  conversationsTags?: Maybe<Array<Maybe<TagStat>>>;
  /** The time of creation */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The currency of the account */
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  /** If this account was duplicated, the accounts that were created from it */
  duplicatedAccounts: AccountCollection;
  /** If created by duplication, the account from which this one was duplicated */
  duplicatedFromAccount?: Maybe<Account>;
  /** Returns the emails of the account. Individuals only have one, but organizations can have multiple emails. */
  emails?: Maybe<Array<Scalars['EmailAddress']['output']>>;
  /** @deprecated 2024-11-04: Please use policies.EXPENSE_POLICIES */
  expensePolicy?: Maybe<Scalars['String']['output']>;
  expenses: ExpenseCollection;
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<TagStat>>>;
  /** Describes the features enabled and available for this account */
  features: CollectiveFeatures;
  feed?: Maybe<Array<Maybe<Activity>>>;
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: Maybe<Scalars['String']['output']>;
  /** Host application requests */
  hostApplicationRequests: HostApplicationCollection;
  /** The public id identifying the account (ie: 5v08jk63-w4g9nbpz-j7qmyder-p7ozax5g) */
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Returns whether the account accepts financial contributions. */
  isActive?: Maybe<Scalars['Boolean']['output']>;
  /** Returns true if the remote user is an admin of this account */
  isAdmin: Scalars['Boolean']['output'];
  /** Returns whether this account is archived */
  isArchived: Scalars['Boolean']['output'];
  /** Whether this account is frozen */
  isFrozen: Scalars['Boolean']['output'];
  /** Returns whether the account is setup to Host collectives. */
  isHost: Scalars['Boolean']['output'];
  /** Defines if the contributors wants to be incognito (name not displayed) */
  isIncognito: Scalars['Boolean']['output'];
  /**
   * The internal database identifier of the collective (ie: 580)
   * @deprecated 2020-01-01: should only be used during the transition to GraphQL API v2.
   */
  legacyId: Scalars['Int']['output'];
  /** The legal documents associated with this account */
  legalDocuments?: Maybe<Array<Maybe<LegalDocument>>>;
  /** Private, legal name. Used for expense receipts, taxes, etc. Scope: "account". */
  legalName?: Maybe<Scalars['String']['output']>;
  /** The address associated to this account. This field is always public for collectives and events. */
  location?: Maybe<Location>;
  longDescription?: Maybe<Scalars['String']['output']>;
  /** Get pending member invitations for this account */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  memberOf?: Maybe<MemberOfCollection>;
  members: MemberCollection;
  /** Public name */
  name?: Maybe<Scalars['String']['output']>;
  /** The list of applications created by this account. Admin only. Scope: "applications". */
  oAuthApplications?: Maybe<OAuthApplicationCollection>;
  orders: OrderCollection;
  /** @deprecated 2022-12-16: use parent on AccountWithParent instead */
  parentAccount?: Maybe<Account>;
  /** The list of payment methods that this account can use to pay for Orders */
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payment methods for this account that are pending a client confirmation (3D Secure / SCA) */
  paymentMethodsWithPendingConfirmation?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payout methods that this account can use to get paid */
  payoutMethods?: Maybe<Array<Maybe<PayoutMethod>>>;
  /** Logged-in user permissions on an account */
  permissions: AccountPermissions;
  /** Policies for the account. To see non-public policies you need to be admin and have the scope: "account". */
  policies: Policies;
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  settings: Scalars['JSON']['output'];
  /** The slug identifying the account (ie: babel) */
  slug: Scalars['String']['output'];
  socialLinks: Array<SocialLink>;
  stats?: Maybe<AccountStats>;
  /** The list of expense types supported by this account */
  supportedExpenseTypes: Array<ExpenseType>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  transactionReports?: Maybe<TransactionReports>;
  transactions: TransactionCollection;
  transferwise?: Maybe<TransferWise>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  twitterHandle?: Maybe<Scalars['String']['output']>;
  /** The type of the account (BOT/COLLECTIVE/EVENT/ORGANIZATION/INDIVIDUAL/VENDOR) */
  type: AccountType;
  /** Date of unhosting by a given Fiscal Host. */
  unhostedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The time of last update */
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Updates published by the account. To see unpublished updates, you need to be an admin and have the scope "updates". */
  updates: UpdateCollection;
  /** Virtual Cards Merchants used by the account. Admin only. Scope: "virtualCards". */
  virtualCardMerchants?: Maybe<AccountCollection>;
  /** Virtual Cards attached to the account. Admin only. Scope: "virtualCards". */
  virtualCards?: Maybe<VirtualCardCollection>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  website?: Maybe<Scalars['String']['output']>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountActivitySubscriptionsArgs = {
  channel?: InputMaybe<ActivityChannel>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountBackgroundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountChildrenAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountConversationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountConversationsTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountDuplicatedAccountsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<ExpenseDirection>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountExpensesTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountFeedArgs = {
  classes?: InputMaybe<Array<InputMaybe<ActivityClassType>>>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountHostApplicationRequestsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<HostApplicationStatus>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountLegalDocumentsArgs = {
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountMemberInvitationsArgs = {
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountMemberOfArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: OrderByInput;
  orderByRoles?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountMembersArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountOAuthApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountPaymentMethodsArgs = {
  enumType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  includeExpired?: InputMaybe<Scalars['Boolean']['input']>;
  service?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  type?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountTransactionGroupsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountTransactionReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountTransactionsArgs = {
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountUnhostedAtArgs = {
  host: AccountReferenceInput;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountUpdatesArgs = {
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublishedUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** Account interface shared by all kind of accounts (Bot, Collective, Event, User, Organization) */
export type AccountVirtualCardsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
};

export enum AccountCacheType {
  CLOUDFLARE = 'CLOUDFLARE',
  CONTRIBUTORS = 'CONTRIBUTORS',
  GRAPHQL_QUERIES = 'GRAPHQL_QUERIES'
}

/** A collection of "Accounts" */
export type AccountCollection = Collection & {
  __typename?: 'AccountCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Account>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export enum AccountFreezeAction {
  FREEZE = 'FREEZE',
  UNFREEZE = 'UNFREEZE'
}

/** Account orders filter (INCOMING or OUTGOING) */
export enum AccountOrdersFilter {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING'
}

/** Fields for the user permissions on an account */
export type AccountPermissions = {
  __typename?: 'AccountPermissions';
  /** Whether the current user can add funds to this account */
  addFunds: Permission;
  /** Whether the current user can download this account's payment receipts */
  canDownloadPaymentReceipts: Permission;
  /** Whether the current user can contact this account */
  contact: Permission;
  id: Scalars['String']['output'];
};

export type AccountReferenceInput = {
  /** The public id identifying the account (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /**
   * The internal id of the account (ie: 580)
   * @deprecated 2020-01-01: should only be used during the transition to GraphQL API v2.
   */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
  /** The slug identifying the account (ie: babel for https://opencollective.com/babel) */
  slug?: InputMaybe<Scalars['String']['input']>;
};

/** Stats for the Account */
export type AccountStats = {
  __typename?: 'AccountStats';
  /** @deprecated 2022-10-21: Use activeRecurringContributionsV2 while we migrate to better semantics. */
  activeRecurringContributions?: Maybe<Scalars['JSON']['output']>;
  /** Returns some statistics about active recurring contributions, broken down by frequency */
  activeRecurringContributionsBreakdown: Array<AmountStats>;
  /** @deprecated 2024-03-04: Use activeRecurringContributionsBreakdown while we migrate to better semantics. */
  activeRecurringContributionsV2?: Maybe<Amount>;
  /** Amount pledged time series */
  amountPledgedTimeSeries: TimeSeriesAmount;
  /** Amount of money in cents in the currency of the collective */
  balance: Amount;
  /** Balance time series */
  balanceTimeSeries: TimeSeriesAmount;
  /**
   * Amount of money in cents in the currency of the collective currently available to spend
   * @deprecated 2022-12-13: Use balance + withBlockedFunds instead
   */
  balanceWithBlockedFunds: Amount;
  /**
   * The consolidated amount of all the events and projects combined.
   * @deprecated 2022-09-02: Use balance + includeChildren instead
   */
  consolidatedBalance: Amount;
  /** Return amount stats for contributions (default, and only for now: one-time vs recurring) */
  contributionsAmount?: Maybe<Array<Maybe<AmountStats>>>;
  /** Return amount time series for contributions (default, and only for now: one-time vs recurring) */
  contributionsAmountTimeSeries: TimeSeriesAmount;
  contributionsCount: Scalars['Int']['output'];
  contributorsCount: Scalars['Int']['output'];
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<AmountStats>>>;
  /** History of the expense tags used by this collective. */
  expensesTagsTimeSeries: TimeSeriesAmount;
  id?: Maybe<Scalars['String']['output']>;
  /** Average amount spent per month based on the last 90 days */
  monthlySpending: Amount;
  /** Total amount received */
  totalAmountReceived: Amount;
  /** Total amount received time series */
  totalAmountReceivedTimeSeries: TimeSeriesAmount;
  /** Total amount spent */
  totalAmountSpent: Amount;
  /**
   * Total net amount received
   * @deprecated 2022-12-13: Use totalAmountReceived + net=true instead
   */
  totalNetAmountReceived: Amount;
  /**
   * Total net amount received time series
   * @deprecated 2022-12-13: Use totalAmountReceivedTimeSeries + net=true instead
   */
  totalNetAmountReceivedTimeSeries: TimeSeriesAmount;
  /** Total of paid expenses to the account, filter per expense type */
  totalPaidExpenses: Amount;
  yearlyBudget: Amount;
  /** @deprecated 2023-03-01: This field will be removed soon, please use totalMoneyManaged */
  yearlyBudgetManaged: Amount;
};


/** Stats for the Account */
export type AccountStatsActiveRecurringContributionsBreakdownArgs = {
  frequency?: InputMaybe<ContributionFrequency>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Stats for the Account */
export type AccountStatsActiveRecurringContributionsV2Args = {
  frequency?: ContributionFrequency;
};


/** Stats for the Account */
export type AccountStatsAmountPledgedTimeSeriesArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeExpectedFunds?: InputMaybe<Scalars['Boolean']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** Stats for the Account */
export type AccountStatsBalanceArgs = {
  currency?: InputMaybe<Currency>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  withBlockedFunds?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Stats for the Account */
export type AccountStatsBalanceTimeSeriesArgs = {
  currency?: InputMaybe<Currency>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  net?: InputMaybe<Scalars['Boolean']['input']>;
  periodInMonths?: InputMaybe<Scalars['Int']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** Stats for the Account */
export type AccountStatsContributionsAmountArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
};


/** Stats for the Account */
export type AccountStatsContributionsAmountTimeSeriesArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** Stats for the Account */
export type AccountStatsContributionsCountArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Stats for the Account */
export type AccountStatsContributorsCountArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Stats for the Account */
export type AccountStatsExpensesTagsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  truncate?: InputMaybe<Scalars['Int']['input']>;
};


/** Stats for the Account */
export type AccountStatsExpensesTagsTimeSeriesArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** Stats for the Account */
export type AccountStatsTotalAmountReceivedArgs = {
  currency?: InputMaybe<Currency>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  net?: InputMaybe<Scalars['Boolean']['input']>;
  periodInMonths?: InputMaybe<Scalars['Int']['input']>;
  useCache?: Scalars['Boolean']['input'];
};


/** Stats for the Account */
export type AccountStatsTotalAmountReceivedTimeSeriesArgs = {
  currency?: InputMaybe<Currency>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  net?: InputMaybe<Scalars['Boolean']['input']>;
  periodInMonths?: InputMaybe<Scalars['Int']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** Stats for the Account */
export type AccountStatsTotalAmountSpentArgs = {
  currency?: InputMaybe<Currency>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  includeGiftCards?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  net?: InputMaybe<Scalars['Boolean']['input']>;
  periodInMonths?: InputMaybe<Scalars['Int']['input']>;
};


/** Stats for the Account */
export type AccountStatsTotalNetAmountReceivedArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  periodInMonths?: InputMaybe<Scalars['Int']['input']>;
};


/** Stats for the Account */
export type AccountStatsTotalNetAmountReceivedTimeSeriesArgs = {
  currency?: InputMaybe<Currency>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  periodInMonths?: InputMaybe<Scalars['Int']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** Stats for the Account */
export type AccountStatsTotalPaidExpensesArgs = {
  currency?: InputMaybe<Currency>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
};

/** All account types */
export enum AccountType {
  BOT = 'BOT',
  COLLECTIVE = 'COLLECTIVE',
  EVENT = 'EVENT',
  FUND = 'FUND',
  INDIVIDUAL = 'INDIVIDUAL',
  ORGANIZATION = 'ORGANIZATION',
  PROJECT = 'PROJECT',
  VENDOR = 'VENDOR'
}

export type AccountUpdateInput = {
  currency?: InputMaybe<Currency>;
  /** The public id identifying the account (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id: Scalars['String']['input'];
};

/** An account that can receive financial contributions */
export type AccountWithContributions = {
  /** [!] Warning: this query is currently in beta and the API might change */
  activeContributors: AccountCollection;
  /** Returns true if the remote user can start the process to resume contributions for account */
  canStartResumeContributionsProcess: Scalars['Boolean']['output'];
  contributionPolicy?: Maybe<Scalars['String']['output']>;
  /** All the persons and entities that contribute to this account */
  contributors: ContributorCollection;
  /** Returns true if the account has started the process to resume contributions */
  hasResumeContributionsProcessStarted: Scalars['Boolean']['output'];
  /** Returns true if a custom contribution to Open Collective can be submitted for contributions made to this account */
  platformContributionAvailable: Scalars['Boolean']['output'];
  /** How much platform fees are charged for this account */
  platformFeePercent: Scalars['Float']['output'];
  tiers: TierCollection;
  /** Number of unique financial contributors. */
  totalFinancialContributors: Scalars['Int']['output'];
};


/** An account that can receive financial contributions */
export type AccountWithContributionsActiveContributorsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeActiveRecurringContributions?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** An account that can receive financial contributions */
export type AccountWithContributionsContributorsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  roles?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** An account that can receive financial contributions */
export type AccountWithContributionsTiersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** An account that can receive financial contributions */
export type AccountWithContributionsTotalFinancialContributorsArgs = {
  accountType?: InputMaybe<AccountType>;
};

/** An account that can be hosted by a Host */
export type AccountWithHost = {
  /** Date of approval by the Fiscal Host. */
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Returns the Fiscal Host */
  host?: Maybe<Host>;
  /** Returns agreements this account has with its host, or null if not enough permissions. */
  hostAgreements?: Maybe<AgreementCollection>;
  /** Returns the Fiscal Host application */
  hostApplication?: Maybe<HostApplication>;
  /** Fees percentage that the host takes for this collective */
  hostFeePercent?: Maybe<Scalars['Float']['output']>;
  /** Describe how the host charges the collective */
  hostFeesStructure?: Maybe<HostFeeStructure>;
  /** Returns whether it's active: can accept financial contributions and pay expenses. */
  isActive: Scalars['Boolean']['output'];
  /** Returns whether it's approved by the Fiscal Host */
  isApproved: Scalars['Boolean']['output'];
  /** Fees percentage that the platform takes for this collective */
  platformFeePercent?: Maybe<Scalars['Float']['output']>;
  summary?: Maybe<HostedAccountSummary>;
  /** Date when the collective was last unfrozen by current Fiscal Host */
  unfrozenAt?: Maybe<Scalars['DateTime']['output']>;
};


/** An account that can be hosted by a Host */
export type AccountWithHostHostAgreementsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** An account that can be hosted by a Host */
export type AccountWithHostHostFeePercentArgs = {
  paymentMethodService?: InputMaybe<PaymentMethodService>;
  paymentMethodType?: InputMaybe<PaymentMethodType>;
};


/** An account that can be hosted by a Host */
export type AccountWithHostSummaryArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
};

/** An account that has a parent account */
export type AccountWithParent = {
  /** The Account parenting this account */
  parent?: Maybe<Account>;
};

/** Fields for an accounting category */
export type AccountingCategory = {
  __typename?: 'AccountingCategory';
  /** The account this category belongs to */
  account: Host;
  /** If the category is applicable to the Host or Hosted Collectives */
  appliesTo: AccountingCategoryAppliesTo;
  /** The code of the accounting category */
  code: Scalars['String']['output'];
  /** The time of creation of this accounting category */
  createdAt: Scalars['DateTime']['output'];
  /** If meant for expenses, the types of expenses this category applies to */
  expensesTypes?: Maybe<Array<Maybe<ExpenseType>>>;
  /** A friendly name for non-accountants (i.e. expense submitters and collective admins) */
  friendlyName?: Maybe<Scalars['String']['output']>;
  /** Whether this category is only meant for the host admins */
  hostOnly: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  /** Instructions for the expense submitters */
  instructions?: Maybe<Scalars['String']['output']>;
  /** The kind of transactions this category applies to */
  kind?: Maybe<AccountingCategoryKind>;
  /** The technical name of the accounting category */
  name: Scalars['String']['output'];
};

export enum AccountingCategoryAppliesTo {
  HOST = 'HOST',
  HOSTED_COLLECTIVES = 'HOSTED_COLLECTIVES'
}

/** A collection of "Accounting Categories" */
export type AccountingCategoryCollection = Collection & {
  __typename?: 'AccountingCategoryCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  /** The Accounting Categories */
  nodes: Array<AccountingCategory>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Input for creating or updating an account category */
export type AccountingCategoryInput = {
  /** If the category is applicable to the Host or Hosted Collectives */
  appliesTo?: AccountingCategoryAppliesTo;
  /** The code of the accounting category */
  code?: InputMaybe<Scalars['NonEmptyString']['input']>;
  /** If meant for expenses, the types of expenses this category applies to */
  expensesTypes?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  /** A friendly name for non-accountants (i.e. expense submitters and collective admins) */
  friendlyName?: InputMaybe<Scalars['String']['input']>;
  /** Whether this category is only meant for the host admins */
  hostOnly?: Scalars['Boolean']['input'];
  /** The ID of the accounting category to edit */
  id?: InputMaybe<Scalars['NonEmptyString']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  kind?: AccountingCategoryKind;
  /** The technical name of the accounting category */
  name?: InputMaybe<Scalars['NonEmptyString']['input']>;
};

export enum AccountingCategoryKind {
  ADDED_FUNDS = 'ADDED_FUNDS',
  CONTRIBUTION = 'CONTRIBUTION',
  EXPENSE = 'EXPENSE'
}

/** Reference to an accounting category */
export type AccountingCategoryReferenceInput = {
  /** The ID of the accounting category */
  id: Scalars['NonEmptyString']['input'];
};

/** An activity describing something that happened on the platform */
export type Activity = {
  __typename?: 'Activity';
  /** The account targeted by this activity, if any */
  account?: Maybe<Account>;
  /** The conversation related to this activity, if any */
  conversation?: Maybe<Conversation>;
  /** The date on which the ConnectedAccount was created */
  createdAt: Scalars['DateTime']['output'];
  /** Data attached to this activity (if any) */
  data: Scalars['JSON']['output'];
  /** The expense related to this activity, if any */
  expense?: Maybe<Expense>;
  /** The account that authored by this activity, if any */
  fromAccount?: Maybe<Account>;
  /** The host under which this activity happened, if any */
  host?: Maybe<Host>;
  /** Unique identifier for this activity */
  id: Scalars['String']['output'];
  /** The person who triggered the action, if any */
  individual?: Maybe<Individual>;
  /** Specifies whether this is a system generated activity */
  isSystem: Scalars['Boolean']['output'];
  /** The order related to this activity, if any */
  order?: Maybe<Order>;
  /** The transaction related to this activity, if any */
  transaction?: Maybe<Transaction>;
  /** The type of the activity */
  type: ActivityType;
  /** The update related to this activity, if any */
  update?: Maybe<Update>;
};

export enum ActivityAndClassesType {
  ACCOUNTING_CATEGORIES_EDITED = 'ACCOUNTING_CATEGORIES_EDITED',
  ACTIVATED_COLLECTIVE_AS_HOST = 'ACTIVATED_COLLECTIVE_AS_HOST',
  ACTIVATED_COLLECTIVE_AS_INDEPENDENT = 'ACTIVATED_COLLECTIVE_AS_INDEPENDENT',
  ACTIVITIES_UPDATES = 'ACTIVITIES_UPDATES',
  ACTIVITY_ALL = 'ACTIVITY_ALL',
  ADDED_FUNDS_EDITED = 'ADDED_FUNDS_EDITED',
  ADDED_FUND_TO_ORG = 'ADDED_FUND_TO_ORG',
  AGREEMENT_CREATED = 'AGREEMENT_CREATED',
  AGREEMENT_DELETED = 'AGREEMENT_DELETED',
  AGREEMENT_EDITED = 'AGREEMENT_EDITED',
  BACKYOURSTACK_DISPATCH_CONFIRMED = 'BACKYOURSTACK_DISPATCH_CONFIRMED',
  COLLECTIVE = 'COLLECTIVE',
  COLLECTIVE_APPLY = 'COLLECTIVE_APPLY',
  COLLECTIVE_APPROVED = 'COLLECTIVE_APPROVED',
  COLLECTIVE_COMMENT_CREATED = 'COLLECTIVE_COMMENT_CREATED',
  COLLECTIVE_CONTACT = 'COLLECTIVE_CONTACT',
  COLLECTIVE_CONVERSATION_CREATED = 'COLLECTIVE_CONVERSATION_CREATED',
  COLLECTIVE_CORE_MEMBER_ADDED = 'COLLECTIVE_CORE_MEMBER_ADDED',
  COLLECTIVE_CORE_MEMBER_EDITED = 'COLLECTIVE_CORE_MEMBER_EDITED',
  COLLECTIVE_CORE_MEMBER_INVITATION_DECLINED = 'COLLECTIVE_CORE_MEMBER_INVITATION_DECLINED',
  COLLECTIVE_CORE_MEMBER_INVITED = 'COLLECTIVE_CORE_MEMBER_INVITED',
  COLLECTIVE_CORE_MEMBER_REMOVED = 'COLLECTIVE_CORE_MEMBER_REMOVED',
  COLLECTIVE_CREATED = 'COLLECTIVE_CREATED',
  COLLECTIVE_CREATED_GITHUB = 'COLLECTIVE_CREATED_GITHUB',
  COLLECTIVE_DELETED = 'COLLECTIVE_DELETED',
  COLLECTIVE_EDITED = 'COLLECTIVE_EDITED',
  COLLECTIVE_EXPENSE_APPROVED = 'COLLECTIVE_EXPENSE_APPROVED',
  COLLECTIVE_EXPENSE_CREATED = 'COLLECTIVE_EXPENSE_CREATED',
  COLLECTIVE_EXPENSE_DELETED = 'COLLECTIVE_EXPENSE_DELETED',
  COLLECTIVE_EXPENSE_ERROR = 'COLLECTIVE_EXPENSE_ERROR',
  COLLECTIVE_EXPENSE_INVITE_DECLINED = 'COLLECTIVE_EXPENSE_INVITE_DECLINED',
  COLLECTIVE_EXPENSE_INVITE_DRAFTED = 'COLLECTIVE_EXPENSE_INVITE_DRAFTED',
  COLLECTIVE_EXPENSE_MARKED_AS_INCOMPLETE = 'COLLECTIVE_EXPENSE_MARKED_AS_INCOMPLETE',
  COLLECTIVE_EXPENSE_MARKED_AS_SPAM = 'COLLECTIVE_EXPENSE_MARKED_AS_SPAM',
  COLLECTIVE_EXPENSE_MARKED_AS_UNPAID = 'COLLECTIVE_EXPENSE_MARKED_AS_UNPAID',
  COLLECTIVE_EXPENSE_MISSING_RECEIPT = 'COLLECTIVE_EXPENSE_MISSING_RECEIPT',
  COLLECTIVE_EXPENSE_MOVED = 'COLLECTIVE_EXPENSE_MOVED',
  COLLECTIVE_EXPENSE_PAID = 'COLLECTIVE_EXPENSE_PAID',
  COLLECTIVE_EXPENSE_PROCESSING = 'COLLECTIVE_EXPENSE_PROCESSING',
  COLLECTIVE_EXPENSE_PUT_ON_HOLD = 'COLLECTIVE_EXPENSE_PUT_ON_HOLD',
  COLLECTIVE_EXPENSE_RECURRING_DRAFTED = 'COLLECTIVE_EXPENSE_RECURRING_DRAFTED',
  COLLECTIVE_EXPENSE_REJECTED = 'COLLECTIVE_EXPENSE_REJECTED',
  COLLECTIVE_EXPENSE_RELEASED_FROM_HOLD = 'COLLECTIVE_EXPENSE_RELEASED_FROM_HOLD',
  COLLECTIVE_EXPENSE_RE_APPROVAL_REQUESTED = 'COLLECTIVE_EXPENSE_RE_APPROVAL_REQUESTED',
  COLLECTIVE_EXPENSE_SCHEDULED_FOR_PAYMENT = 'COLLECTIVE_EXPENSE_SCHEDULED_FOR_PAYMENT',
  COLLECTIVE_EXPENSE_UNAPPROVED = 'COLLECTIVE_EXPENSE_UNAPPROVED',
  COLLECTIVE_EXPENSE_UNSCHEDULED_FOR_PAYMENT = 'COLLECTIVE_EXPENSE_UNSCHEDULED_FOR_PAYMENT',
  COLLECTIVE_EXPENSE_UPDATED = 'COLLECTIVE_EXPENSE_UPDATED',
  COLLECTIVE_FROZEN = 'COLLECTIVE_FROZEN',
  COLLECTIVE_MEMBER_CREATED = 'COLLECTIVE_MEMBER_CREATED',
  COLLECTIVE_MEMBER_INVITED = 'COLLECTIVE_MEMBER_INVITED',
  COLLECTIVE_MONTHLY_REPORT = 'COLLECTIVE_MONTHLY_REPORT',
  COLLECTIVE_REJECTED = 'COLLECTIVE_REJECTED',
  COLLECTIVE_TRANSACTION_CREATED = 'COLLECTIVE_TRANSACTION_CREATED',
  COLLECTIVE_TRANSACTION_PAID = 'COLLECTIVE_TRANSACTION_PAID',
  COLLECTIVE_UNFROZEN = 'COLLECTIVE_UNFROZEN',
  COLLECTIVE_UNHOSTED = 'COLLECTIVE_UNHOSTED',
  COLLECTIVE_UPDATE_CREATED = 'COLLECTIVE_UPDATE_CREATED',
  COLLECTIVE_UPDATE_PUBLISHED = 'COLLECTIVE_UPDATE_PUBLISHED',
  COLLECTIVE_USER_ADDED = 'COLLECTIVE_USER_ADDED',
  COLLECTIVE_VIRTUAL_CARD_ADDED = 'COLLECTIVE_VIRTUAL_CARD_ADDED',
  COLLECTIVE_VIRTUAL_CARD_ASSIGNED = 'COLLECTIVE_VIRTUAL_CARD_ASSIGNED',
  COLLECTIVE_VIRTUAL_CARD_CREATED = 'COLLECTIVE_VIRTUAL_CARD_CREATED',
  COLLECTIVE_VIRTUAL_CARD_DELETED = 'COLLECTIVE_VIRTUAL_CARD_DELETED',
  COLLECTIVE_VIRTUAL_CARD_MISSING_RECEIPTS = 'COLLECTIVE_VIRTUAL_CARD_MISSING_RECEIPTS',
  COLLECTIVE_VIRTUAL_CARD_REQUEST_APPROVED = 'COLLECTIVE_VIRTUAL_CARD_REQUEST_APPROVED',
  COLLECTIVE_VIRTUAL_CARD_REQUEST_REJECTED = 'COLLECTIVE_VIRTUAL_CARD_REQUEST_REJECTED',
  COLLECTIVE_VIRTUAL_CARD_RESUMED = 'COLLECTIVE_VIRTUAL_CARD_RESUMED',
  COLLECTIVE_VIRTUAL_CARD_SUSPENDED = 'COLLECTIVE_VIRTUAL_CARD_SUSPENDED',
  COLLECTIVE_VIRTUAL_CARD_SUSPENDED_DUE_TO_INACTIVITY = 'COLLECTIVE_VIRTUAL_CARD_SUSPENDED_DUE_TO_INACTIVITY',
  CONNECTED_ACCOUNT_CREATED = 'CONNECTED_ACCOUNT_CREATED',
  CONNECTED_ACCOUNT_ERROR = 'CONNECTED_ACCOUNT_ERROR',
  CONTRIBUTIONS = 'CONTRIBUTIONS',
  CONTRIBUTION_REJECTED = 'CONTRIBUTION_REJECTED',
  CONVERSATION_COMMENT_CREATED = 'CONVERSATION_COMMENT_CREATED',
  DEACTIVATED_COLLECTIVE_AS_HOST = 'DEACTIVATED_COLLECTIVE_AS_HOST',
  EXPENSES = 'EXPENSES',
  EXPENSE_COMMENT_CREATED = 'EXPENSE_COMMENT_CREATED',
  FUND_EVENTS = 'FUND_EVENTS',
  HOST_APPLICATION_COMMENT_CREATED = 'HOST_APPLICATION_COMMENT_CREATED',
  HOST_APPLICATION_CONTACT = 'HOST_APPLICATION_CONTACT',
  OAUTH_APPLICATION_AUTHORIZED = 'OAUTH_APPLICATION_AUTHORIZED',
  ORDERS_SUSPICIOUS = 'ORDERS_SUSPICIOUS',
  ORDER_CANCELED_ARCHIVED_COLLECTIVE = 'ORDER_CANCELED_ARCHIVED_COLLECTIVE',
  ORDER_COMMENT_CREATED = 'ORDER_COMMENT_CREATED',
  ORDER_DISPUTE_CLOSED = 'ORDER_DISPUTE_CLOSED',
  ORDER_DISPUTE_CREATED = 'ORDER_DISPUTE_CREATED',
  ORDER_PAYMENT_FAILED = 'ORDER_PAYMENT_FAILED',
  ORDER_PENDING = 'ORDER_PENDING',
  ORDER_PENDING_CONTRIBUTION_NEW = 'ORDER_PENDING_CONTRIBUTION_NEW',
  ORDER_PENDING_CONTRIBUTION_REMINDER = 'ORDER_PENDING_CONTRIBUTION_REMINDER',
  ORDER_PENDING_CREATED = 'ORDER_PENDING_CREATED',
  ORDER_PENDING_CRYPTO = 'ORDER_PENDING_CRYPTO',
  ORDER_PENDING_EXPIRED = 'ORDER_PENDING_EXPIRED',
  ORDER_PENDING_FOLLOWUP = 'ORDER_PENDING_FOLLOWUP',
  ORDER_PENDING_RECEIVED = 'ORDER_PENDING_RECEIVED',
  ORDER_PROCESSING = 'ORDER_PROCESSING',
  ORDER_REVIEW_CLOSED = 'ORDER_REVIEW_CLOSED',
  ORDER_REVIEW_OPENED = 'ORDER_REVIEW_OPENED',
  ORDER_THANKYOU = 'ORDER_THANKYOU',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORGANIZATION_COLLECTIVE_CREATED = 'ORGANIZATION_COLLECTIVE_CREATED',
  PAYMENT_CREDITCARD_CONFIRMATION = 'PAYMENT_CREDITCARD_CONFIRMATION',
  PAYMENT_CREDITCARD_EXPIRING = 'PAYMENT_CREDITCARD_EXPIRING',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REPORTS = 'REPORTS',
  SUBSCRIPTION_ACTIVATED = 'SUBSCRIPTION_ACTIVATED',
  SUBSCRIPTION_CANCELED = 'SUBSCRIPTION_CANCELED',
  SUBSCRIPTION_CONFIRMED = 'SUBSCRIPTION_CONFIRMED',
  SUBSCRIPTION_PAUSED = 'SUBSCRIPTION_PAUSED',
  SUBSCRIPTION_READY_TO_BE_RESUMED = 'SUBSCRIPTION_READY_TO_BE_RESUMED',
  SUBSCRIPTION_RESUMED = 'SUBSCRIPTION_RESUMED',
  TAXFORM_INVALIDATED = 'TAXFORM_INVALIDATED',
  TAXFORM_RECEIVED = 'TAXFORM_RECEIVED',
  TAXFORM_REQUEST = 'TAXFORM_REQUEST',
  TICKET_CONFIRMED = 'TICKET_CONFIRMED',
  TRANSACTIONS_IMPORT_CREATED = 'TRANSACTIONS_IMPORT_CREATED',
  TWO_FACTOR_CODE_REQUESTED = 'TWO_FACTOR_CODE_REQUESTED',
  TWO_FACTOR_METHOD_ADDED = 'TWO_FACTOR_METHOD_ADDED',
  TWO_FACTOR_METHOD_DELETED = 'TWO_FACTOR_METHOD_DELETED',
  UPDATE_COMMENT_CREATED = 'UPDATE_COMMENT_CREATED',
  USER_CARD_CLAIMED = 'USER_CARD_CLAIMED',
  USER_CARD_INVITED = 'USER_CARD_INVITED',
  USER_CHANGE_EMAIL = 'USER_CHANGE_EMAIL',
  USER_CREATED = 'USER_CREATED',
  USER_NEW_TOKEN = 'USER_NEW_TOKEN',
  USER_PASSWORD_SET = 'USER_PASSWORD_SET',
  USER_PAYMENT_METHOD_CREATED = 'USER_PAYMENT_METHOD_CREATED',
  USER_RESET_PASSWORD = 'USER_RESET_PASSWORD',
  USER_SIGNIN = 'USER_SIGNIN',
  VENDOR_CREATED = 'VENDOR_CREATED',
  VENDOR_DELETED = 'VENDOR_DELETED',
  VENDOR_EDITED = 'VENDOR_EDITED',
  VIRTUAL_CARDS = 'VIRTUAL_CARDS',
  VIRTUAL_CARD_CHARGE_DECLINED = 'VIRTUAL_CARD_CHARGE_DECLINED',
  VIRTUAL_CARD_PURCHASE = 'VIRTUAL_CARD_PURCHASE',
  VIRTUAL_CARD_REQUESTED = 'VIRTUAL_CARD_REQUESTED',
  WEBHOOK_PAYPAL_RECEIVED = 'WEBHOOK_PAYPAL_RECEIVED',
  WEBHOOK_STRIPE_RECEIVED = 'WEBHOOK_STRIPE_RECEIVED'
}

/** All supported Activity channels we can broadcast to */
export enum ActivityChannel {
  email = 'email',
  slack = 'slack',
  twitter = 'twitter',
  webhook = 'webhook'
}

export enum ActivityClassType {
  ACTIVITIES_UPDATES = 'ACTIVITIES_UPDATES',
  COLLECTIVE = 'COLLECTIVE',
  CONTRIBUTIONS = 'CONTRIBUTIONS',
  EXPENSES = 'EXPENSES',
  FUND_EVENTS = 'FUND_EVENTS',
  REPORTS = 'REPORTS',
  VIRTUAL_CARDS = 'VIRTUAL_CARDS'
}

/** A collection of "Activities" */
export type ActivityCollection = Collection & {
  __typename?: 'ActivityCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Activity>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ActivitySubscription = {
  __typename?: 'ActivitySubscription';
  /** The account which this notification setting is applied to */
  account?: Maybe<Account>;
  /** Wheter this notification setting is active or not */
  active: Scalars['Boolean']['output'];
  /** The channel this setting is notifying through */
  channel: ActivityChannel;
  createdAt: Scalars['DateTime']['output'];
  /** Unique identifier for this notification setting */
  id: Scalars['String']['output'];
  /** The user who defined the setting */
  individual: Individual;
  /** The type of Activity this setting is notifying about */
  type: Scalars['String']['output'];
  /** If channel supports, this is the webhook URL we submit the notification to */
  webhookUrl?: Maybe<Scalars['String']['output']>;
};

export enum ActivityType {
  ACCOUNTING_CATEGORIES_EDITED = 'ACCOUNTING_CATEGORIES_EDITED',
  ACTIVATED_COLLECTIVE_AS_HOST = 'ACTIVATED_COLLECTIVE_AS_HOST',
  ACTIVATED_COLLECTIVE_AS_INDEPENDENT = 'ACTIVATED_COLLECTIVE_AS_INDEPENDENT',
  ACTIVITY_ALL = 'ACTIVITY_ALL',
  ADDED_FUNDS_EDITED = 'ADDED_FUNDS_EDITED',
  ADDED_FUND_TO_ORG = 'ADDED_FUND_TO_ORG',
  AGREEMENT_CREATED = 'AGREEMENT_CREATED',
  AGREEMENT_DELETED = 'AGREEMENT_DELETED',
  AGREEMENT_EDITED = 'AGREEMENT_EDITED',
  BACKYOURSTACK_DISPATCH_CONFIRMED = 'BACKYOURSTACK_DISPATCH_CONFIRMED',
  COLLECTIVE_APPLY = 'COLLECTIVE_APPLY',
  COLLECTIVE_APPROVED = 'COLLECTIVE_APPROVED',
  COLLECTIVE_COMMENT_CREATED = 'COLLECTIVE_COMMENT_CREATED',
  COLLECTIVE_CONTACT = 'COLLECTIVE_CONTACT',
  COLLECTIVE_CONVERSATION_CREATED = 'COLLECTIVE_CONVERSATION_CREATED',
  COLLECTIVE_CORE_MEMBER_ADDED = 'COLLECTIVE_CORE_MEMBER_ADDED',
  COLLECTIVE_CORE_MEMBER_EDITED = 'COLLECTIVE_CORE_MEMBER_EDITED',
  COLLECTIVE_CORE_MEMBER_INVITATION_DECLINED = 'COLLECTIVE_CORE_MEMBER_INVITATION_DECLINED',
  COLLECTIVE_CORE_MEMBER_INVITED = 'COLLECTIVE_CORE_MEMBER_INVITED',
  COLLECTIVE_CORE_MEMBER_REMOVED = 'COLLECTIVE_CORE_MEMBER_REMOVED',
  COLLECTIVE_CREATED = 'COLLECTIVE_CREATED',
  COLLECTIVE_CREATED_GITHUB = 'COLLECTIVE_CREATED_GITHUB',
  COLLECTIVE_DELETED = 'COLLECTIVE_DELETED',
  COLLECTIVE_EDITED = 'COLLECTIVE_EDITED',
  COLLECTIVE_EXPENSE_APPROVED = 'COLLECTIVE_EXPENSE_APPROVED',
  COLLECTIVE_EXPENSE_CREATED = 'COLLECTIVE_EXPENSE_CREATED',
  COLLECTIVE_EXPENSE_DELETED = 'COLLECTIVE_EXPENSE_DELETED',
  COLLECTIVE_EXPENSE_ERROR = 'COLLECTIVE_EXPENSE_ERROR',
  COLLECTIVE_EXPENSE_INVITE_DECLINED = 'COLLECTIVE_EXPENSE_INVITE_DECLINED',
  COLLECTIVE_EXPENSE_INVITE_DRAFTED = 'COLLECTIVE_EXPENSE_INVITE_DRAFTED',
  COLLECTIVE_EXPENSE_MARKED_AS_INCOMPLETE = 'COLLECTIVE_EXPENSE_MARKED_AS_INCOMPLETE',
  COLLECTIVE_EXPENSE_MARKED_AS_SPAM = 'COLLECTIVE_EXPENSE_MARKED_AS_SPAM',
  COLLECTIVE_EXPENSE_MARKED_AS_UNPAID = 'COLLECTIVE_EXPENSE_MARKED_AS_UNPAID',
  COLLECTIVE_EXPENSE_MISSING_RECEIPT = 'COLLECTIVE_EXPENSE_MISSING_RECEIPT',
  COLLECTIVE_EXPENSE_MOVED = 'COLLECTIVE_EXPENSE_MOVED',
  COLLECTIVE_EXPENSE_PAID = 'COLLECTIVE_EXPENSE_PAID',
  COLLECTIVE_EXPENSE_PROCESSING = 'COLLECTIVE_EXPENSE_PROCESSING',
  COLLECTIVE_EXPENSE_PUT_ON_HOLD = 'COLLECTIVE_EXPENSE_PUT_ON_HOLD',
  COLLECTIVE_EXPENSE_RECURRING_DRAFTED = 'COLLECTIVE_EXPENSE_RECURRING_DRAFTED',
  COLLECTIVE_EXPENSE_REJECTED = 'COLLECTIVE_EXPENSE_REJECTED',
  COLLECTIVE_EXPENSE_RELEASED_FROM_HOLD = 'COLLECTIVE_EXPENSE_RELEASED_FROM_HOLD',
  COLLECTIVE_EXPENSE_RE_APPROVAL_REQUESTED = 'COLLECTIVE_EXPENSE_RE_APPROVAL_REQUESTED',
  COLLECTIVE_EXPENSE_SCHEDULED_FOR_PAYMENT = 'COLLECTIVE_EXPENSE_SCHEDULED_FOR_PAYMENT',
  COLLECTIVE_EXPENSE_UNAPPROVED = 'COLLECTIVE_EXPENSE_UNAPPROVED',
  COLLECTIVE_EXPENSE_UNSCHEDULED_FOR_PAYMENT = 'COLLECTIVE_EXPENSE_UNSCHEDULED_FOR_PAYMENT',
  COLLECTIVE_EXPENSE_UPDATED = 'COLLECTIVE_EXPENSE_UPDATED',
  COLLECTIVE_FROZEN = 'COLLECTIVE_FROZEN',
  COLLECTIVE_MEMBER_CREATED = 'COLLECTIVE_MEMBER_CREATED',
  COLLECTIVE_MEMBER_INVITED = 'COLLECTIVE_MEMBER_INVITED',
  COLLECTIVE_MONTHLY_REPORT = 'COLLECTIVE_MONTHLY_REPORT',
  COLLECTIVE_REJECTED = 'COLLECTIVE_REJECTED',
  COLLECTIVE_TRANSACTION_CREATED = 'COLLECTIVE_TRANSACTION_CREATED',
  COLLECTIVE_TRANSACTION_PAID = 'COLLECTIVE_TRANSACTION_PAID',
  COLLECTIVE_UNFROZEN = 'COLLECTIVE_UNFROZEN',
  COLLECTIVE_UNHOSTED = 'COLLECTIVE_UNHOSTED',
  COLLECTIVE_UPDATE_CREATED = 'COLLECTIVE_UPDATE_CREATED',
  COLLECTIVE_UPDATE_PUBLISHED = 'COLLECTIVE_UPDATE_PUBLISHED',
  COLLECTIVE_USER_ADDED = 'COLLECTIVE_USER_ADDED',
  COLLECTIVE_VIRTUAL_CARD_ADDED = 'COLLECTIVE_VIRTUAL_CARD_ADDED',
  COLLECTIVE_VIRTUAL_CARD_ASSIGNED = 'COLLECTIVE_VIRTUAL_CARD_ASSIGNED',
  COLLECTIVE_VIRTUAL_CARD_CREATED = 'COLLECTIVE_VIRTUAL_CARD_CREATED',
  COLLECTIVE_VIRTUAL_CARD_DELETED = 'COLLECTIVE_VIRTUAL_CARD_DELETED',
  COLLECTIVE_VIRTUAL_CARD_MISSING_RECEIPTS = 'COLLECTIVE_VIRTUAL_CARD_MISSING_RECEIPTS',
  COLLECTIVE_VIRTUAL_CARD_REQUEST_APPROVED = 'COLLECTIVE_VIRTUAL_CARD_REQUEST_APPROVED',
  COLLECTIVE_VIRTUAL_CARD_REQUEST_REJECTED = 'COLLECTIVE_VIRTUAL_CARD_REQUEST_REJECTED',
  COLLECTIVE_VIRTUAL_CARD_RESUMED = 'COLLECTIVE_VIRTUAL_CARD_RESUMED',
  COLLECTIVE_VIRTUAL_CARD_SUSPENDED = 'COLLECTIVE_VIRTUAL_CARD_SUSPENDED',
  COLLECTIVE_VIRTUAL_CARD_SUSPENDED_DUE_TO_INACTIVITY = 'COLLECTIVE_VIRTUAL_CARD_SUSPENDED_DUE_TO_INACTIVITY',
  CONNECTED_ACCOUNT_CREATED = 'CONNECTED_ACCOUNT_CREATED',
  CONNECTED_ACCOUNT_ERROR = 'CONNECTED_ACCOUNT_ERROR',
  CONTRIBUTION_REJECTED = 'CONTRIBUTION_REJECTED',
  CONVERSATION_COMMENT_CREATED = 'CONVERSATION_COMMENT_CREATED',
  DEACTIVATED_COLLECTIVE_AS_HOST = 'DEACTIVATED_COLLECTIVE_AS_HOST',
  EXPENSE_COMMENT_CREATED = 'EXPENSE_COMMENT_CREATED',
  HOST_APPLICATION_COMMENT_CREATED = 'HOST_APPLICATION_COMMENT_CREATED',
  HOST_APPLICATION_CONTACT = 'HOST_APPLICATION_CONTACT',
  OAUTH_APPLICATION_AUTHORIZED = 'OAUTH_APPLICATION_AUTHORIZED',
  ORDERS_SUSPICIOUS = 'ORDERS_SUSPICIOUS',
  ORDER_CANCELED_ARCHIVED_COLLECTIVE = 'ORDER_CANCELED_ARCHIVED_COLLECTIVE',
  ORDER_COMMENT_CREATED = 'ORDER_COMMENT_CREATED',
  ORDER_DISPUTE_CLOSED = 'ORDER_DISPUTE_CLOSED',
  ORDER_DISPUTE_CREATED = 'ORDER_DISPUTE_CREATED',
  ORDER_PAYMENT_FAILED = 'ORDER_PAYMENT_FAILED',
  ORDER_PENDING = 'ORDER_PENDING',
  ORDER_PENDING_CONTRIBUTION_NEW = 'ORDER_PENDING_CONTRIBUTION_NEW',
  ORDER_PENDING_CONTRIBUTION_REMINDER = 'ORDER_PENDING_CONTRIBUTION_REMINDER',
  ORDER_PENDING_CREATED = 'ORDER_PENDING_CREATED',
  ORDER_PENDING_CRYPTO = 'ORDER_PENDING_CRYPTO',
  ORDER_PENDING_EXPIRED = 'ORDER_PENDING_EXPIRED',
  ORDER_PENDING_FOLLOWUP = 'ORDER_PENDING_FOLLOWUP',
  ORDER_PENDING_RECEIVED = 'ORDER_PENDING_RECEIVED',
  ORDER_PROCESSING = 'ORDER_PROCESSING',
  ORDER_REVIEW_CLOSED = 'ORDER_REVIEW_CLOSED',
  ORDER_REVIEW_OPENED = 'ORDER_REVIEW_OPENED',
  ORDER_THANKYOU = 'ORDER_THANKYOU',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORGANIZATION_COLLECTIVE_CREATED = 'ORGANIZATION_COLLECTIVE_CREATED',
  PAYMENT_CREDITCARD_CONFIRMATION = 'PAYMENT_CREDITCARD_CONFIRMATION',
  PAYMENT_CREDITCARD_EXPIRING = 'PAYMENT_CREDITCARD_EXPIRING',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_ACTIVATED = 'SUBSCRIPTION_ACTIVATED',
  SUBSCRIPTION_CANCELED = 'SUBSCRIPTION_CANCELED',
  SUBSCRIPTION_CONFIRMED = 'SUBSCRIPTION_CONFIRMED',
  SUBSCRIPTION_PAUSED = 'SUBSCRIPTION_PAUSED',
  SUBSCRIPTION_READY_TO_BE_RESUMED = 'SUBSCRIPTION_READY_TO_BE_RESUMED',
  SUBSCRIPTION_RESUMED = 'SUBSCRIPTION_RESUMED',
  TAXFORM_INVALIDATED = 'TAXFORM_INVALIDATED',
  TAXFORM_RECEIVED = 'TAXFORM_RECEIVED',
  TAXFORM_REQUEST = 'TAXFORM_REQUEST',
  TICKET_CONFIRMED = 'TICKET_CONFIRMED',
  TRANSACTIONS_IMPORT_CREATED = 'TRANSACTIONS_IMPORT_CREATED',
  TWO_FACTOR_CODE_REQUESTED = 'TWO_FACTOR_CODE_REQUESTED',
  TWO_FACTOR_METHOD_ADDED = 'TWO_FACTOR_METHOD_ADDED',
  TWO_FACTOR_METHOD_DELETED = 'TWO_FACTOR_METHOD_DELETED',
  UPDATE_COMMENT_CREATED = 'UPDATE_COMMENT_CREATED',
  USER_CARD_CLAIMED = 'USER_CARD_CLAIMED',
  USER_CARD_INVITED = 'USER_CARD_INVITED',
  USER_CHANGE_EMAIL = 'USER_CHANGE_EMAIL',
  USER_CREATED = 'USER_CREATED',
  USER_NEW_TOKEN = 'USER_NEW_TOKEN',
  USER_PASSWORD_SET = 'USER_PASSWORD_SET',
  USER_PAYMENT_METHOD_CREATED = 'USER_PAYMENT_METHOD_CREATED',
  USER_RESET_PASSWORD = 'USER_RESET_PASSWORD',
  USER_SIGNIN = 'USER_SIGNIN',
  VENDOR_CREATED = 'VENDOR_CREATED',
  VENDOR_DELETED = 'VENDOR_DELETED',
  VENDOR_EDITED = 'VENDOR_EDITED',
  VIRTUAL_CARD_CHARGE_DECLINED = 'VIRTUAL_CARD_CHARGE_DECLINED',
  VIRTUAL_CARD_PURCHASE = 'VIRTUAL_CARD_PURCHASE',
  VIRTUAL_CARD_REQUESTED = 'VIRTUAL_CARD_REQUESTED',
  WEBHOOK_PAYPAL_RECEIVED = 'WEBHOOK_PAYPAL_RECEIVED',
  WEBHOOK_STRIPE_RECEIVED = 'WEBHOOK_STRIPE_RECEIVED'
}

/** Response for the addTwoFactorAuthTokenToIndividual mutation */
export type AddTwoFactorAuthTokenToIndividualResponse = {
  __typename?: 'AddTwoFactorAuthTokenToIndividualResponse';
  /** The Individual that the 2FA has been enabled for */
  account: Individual;
  /** The recovery codes for the Individual to write down */
  recoveryCodes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

/** An agreement */
export type Agreement = {
  __typename?: 'Agreement';
  account: Account;
  attachment?: Maybe<FileInfo>;
  /** The time of creation of this agreement */
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Account>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  host: Host;
  id?: Maybe<Scalars['String']['output']>;
  /** Additional notes about the agreement for the host admins */
  notes?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

/** A collection of "Agreement" */
export type AgreementCollection = Collection & {
  __typename?: 'AgreementCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Agreement>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type AgreementReferenceInput = {
  /** The public id identifying the agreement (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The internal id of the agreement (ie: 580) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** A financial amount. */
export type Amount = {
  __typename?: 'Amount';
  currency?: Maybe<Currency>;
  /** If the amount was generated from a currency conversion, this field contains details about the conversion */
  exchangeRate?: Maybe<CurrencyExchangeRate>;
  value?: Maybe<Scalars['Float']['output']>;
  valueInCents?: Maybe<Scalars['Float']['output']>;
};

/** Input type for an amount with the value and currency */
export type AmountInput = {
  /** The currency string */
  currency?: InputMaybe<Currency>;
  /** If the amount was generated from a currency conversion, this field can be used to provide details about the conversion */
  exchangeRate?: InputMaybe<CurrencyExchangeRateInput>;
  /** The value in plain */
  value?: InputMaybe<Scalars['Float']['input']>;
  /** The value in cents */
  valueInCents?: InputMaybe<Scalars['Int']['input']>;
};

/** Input type for an amount range with the value and currency */
export type AmountRangeInput = {
  /** The minimum amount (inclusive) */
  gte?: InputMaybe<AmountInput>;
  /** The maximum amount (inclusive) */
  lte?: InputMaybe<AmountInput>;
};

/** Statistics with amounts */
export type AmountStats = {
  __typename?: 'AmountStats';
  /** Total amount for this label */
  amount: Amount;
  /** Number of entries for this label */
  count?: Maybe<Scalars['Int']['output']>;
  /** Name/Label for the amount */
  label: Scalars['String']['output'];
};

/** An OAuth application. */
export type Application = {
  __typename?: 'Application';
  account: Account;
  /** @deprecated 2022-06-16: This Application object will only be used for OAuth tokens. Use PersonalToken for user tokens */
  apiKey?: Maybe<Scalars['String']['output']>;
  clientId?: Maybe<Scalars['String']['output']>;
  clientSecret?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  legacyId: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  oAuthAuthorization?: Maybe<OAuthAuthorization>;
  /** Whether this application is allowed to directly use operations that would normally require 2FA */
  preAuthorize2FA: Scalars['Boolean']['output'];
  redirectUri?: Maybe<Scalars['URL']['output']>;
  /** @deprecated 2022-06-16: This Application object will only be used for OAuth tokens. Use PersonalToken for user tokens */
  type?: Maybe<ApplicationType>;
};

/** Input type for Application */
export type ApplicationCreateInput = {
  /** The account to use as the owner of the application. Defaults to currently logged in user. */
  account?: InputMaybe<AccountReferenceInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  redirectUri?: InputMaybe<Scalars['URL']['input']>;
  type?: ApplicationType;
};

export type ApplicationReferenceInput = {
  /** The clientId for the application. */
  clientId?: InputMaybe<Scalars['String']['input']>;
  /** The public id identifying the application (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The legacy public id identifying the application (ie: 4242) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** All application types */
export enum ApplicationType {
  API_KEY = 'API_KEY',
  OAUTH = 'OAUTH'
}

/** Input type for Application */
export type ApplicationUpdateInput = {
  /** The clientId for the application. */
  clientId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  /** The public id identifying the application (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The legacy public id identifying the application (ie: 4242) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  redirectUri?: InputMaybe<Scalars['URL']['input']>;
};

/** The period over which the average is calculated */
export enum AveragePeriod {
  MONTH = 'MONTH',
  YEAR = 'YEAR'
}

export type BanAccountResponse = {
  __typename?: 'BanAccountResponse';
  /** The accounts impacted by the mutation */
  accounts: Array<Account>;
  /** Whether the accounts can be banned */
  isAllowed: Scalars['Boolean']['output'];
  /** A summary of the changes */
  message?: Maybe<Scalars['String']['output']>;
};

/** This represents a Bot account */
export type Bot = Account & {
  __typename?: 'Bot';
  /** List of activities that the logged-in user is subscribed for this collective */
  activitySubscriptions?: Maybe<Array<Maybe<ActivitySubscription>>>;
  backgroundImageUrl?: Maybe<Scalars['String']['output']>;
  /** Whether this account can have changelog updates */
  canHaveChangelogUpdates: Scalars['Boolean']['output'];
  categories: Array<Maybe<Scalars['String']['output']>>;
  childrenAccounts: AccountCollection;
  /** The list of connected accounts (Stripe, Twitter, etc ...). Admin only. Scope: "connectedAccounts". */
  connectedAccounts?: Maybe<Array<Maybe<ConnectedAccount>>>;
  conversations: ConversationCollection;
  /** Returns conversation's tags for collective sorted by popularity */
  conversationsTags?: Maybe<Array<Maybe<TagStat>>>;
  /** The time of creation */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The currency of the account */
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  /** If this account was duplicated, the accounts that were created from it */
  duplicatedAccounts: AccountCollection;
  /** If created by duplication, the account from which this one was duplicated */
  duplicatedFromAccount?: Maybe<Account>;
  /** Returns the emails of the account. Individuals only have one, but organizations can have multiple emails. */
  emails?: Maybe<Array<Scalars['EmailAddress']['output']>>;
  /** @deprecated 2024-11-04: Please use policies.EXPENSE_POLICIES */
  expensePolicy?: Maybe<Scalars['String']['output']>;
  expenses: ExpenseCollection;
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<TagStat>>>;
  /** Describes the features enabled and available for this account */
  features: CollectiveFeatures;
  feed?: Maybe<Array<Maybe<Activity>>>;
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: Maybe<Scalars['String']['output']>;
  /** Host application requests */
  hostApplicationRequests: HostApplicationCollection;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Returns whether the account accepts financial contributions. */
  isActive?: Maybe<Scalars['Boolean']['output']>;
  /** Returns true if the remote user is an admin of this account */
  isAdmin: Scalars['Boolean']['output'];
  /** Returns whether this account is archived */
  isArchived: Scalars['Boolean']['output'];
  /** Whether this account is frozen */
  isFrozen: Scalars['Boolean']['output'];
  /** Returns whether the account is setup to Host collectives. */
  isHost: Scalars['Boolean']['output'];
  /** Defines if the contributors wants to be incognito (name not displayed) */
  isIncognito: Scalars['Boolean']['output'];
  legacyId: Scalars['Int']['output'];
  /** The legal documents associated with this account */
  legalDocuments?: Maybe<Array<Maybe<LegalDocument>>>;
  /** Private, legal name. Used for expense receipts, taxes, etc. Scope: "account". */
  legalName?: Maybe<Scalars['String']['output']>;
  /** The address associated to this account. This field is always public for collectives and events. */
  location?: Maybe<Location>;
  longDescription?: Maybe<Scalars['String']['output']>;
  /** [AUTHENTICATED] Returns the pending invitations */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  memberOf: MemberOfCollection;
  /** Get all members (admins, members, backers, followers) */
  members: MemberCollection;
  /** Public name */
  name?: Maybe<Scalars['String']['output']>;
  /** The list of applications created by this account. Admin only. Scope: "applications". */
  oAuthApplications?: Maybe<OAuthApplicationCollection>;
  orders: OrderCollection;
  /** @deprecated 2022-12-16: use parent on AccountWithParent instead */
  parentAccount?: Maybe<Account>;
  /** The list of payment methods that this collective can use to pay for Orders. Admin or Host only. Scope: "orders". */
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payment methods for this account that are pending a client confirmation (3D Secure / SCA) */
  paymentMethodsWithPendingConfirmation?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payout methods that this collective can use to get paid. In most cases, admin only and scope: "expenses". */
  payoutMethods?: Maybe<Array<Maybe<PayoutMethod>>>;
  /** Logged-in user permissions on an account */
  permissions: AccountPermissions;
  /** Policies for the account. To see non-public policies you need to be admin and have the scope: "account". */
  policies: Policies;
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  settings: Scalars['JSON']['output'];
  /** The slug identifying the account (ie: babel) */
  slug: Scalars['String']['output'];
  socialLinks: Array<SocialLink>;
  stats?: Maybe<AccountStats>;
  /** The list of expense types supported by this account */
  supportedExpenseTypes: Array<ExpenseType>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  transactionReports?: Maybe<TransactionReports>;
  transactions: TransactionCollection;
  transferwise?: Maybe<TransferWise>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  twitterHandle?: Maybe<Scalars['String']['output']>;
  type: AccountType;
  /** Date of unhosting by a given Fiscal Host. */
  unhostedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Updates published by the account. To see unpublished updates, you need to be an admin and have the scope "updates". */
  updates: UpdateCollection;
  /** Virtual Cards Merchants used by the account. Admin only. Scope: "virtualCards". */
  virtualCardMerchants?: Maybe<AccountCollection>;
  /** Virtual Cards attached to the account. Admin only. Scope: "virtualCards". */
  virtualCards?: Maybe<VirtualCardCollection>;
  webhooks: WebhookCollection;
  /** @deprecated 2023-01-16: Please use socialLinks */
  website?: Maybe<Scalars['String']['output']>;
};


/** This represents a Bot account */
export type BotActivitySubscriptionsArgs = {
  channel?: InputMaybe<ActivityChannel>;
};


/** This represents a Bot account */
export type BotBackgroundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents a Bot account */
export type BotChildrenAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Bot account */
export type BotConversationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Bot account */
export type BotConversationsTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents a Bot account */
export type BotDuplicatedAccountsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Bot account */
export type BotExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<ExpenseDirection>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents a Bot account */
export type BotExpensesTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents a Bot account */
export type BotFeedArgs = {
  classes?: InputMaybe<Array<InputMaybe<ActivityClassType>>>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents a Bot account */
export type BotHostApplicationRequestsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<HostApplicationStatus>;
};


/** This represents a Bot account */
export type BotImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents a Bot account */
export type BotLegalDocumentsArgs = {
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents a Bot account */
export type BotMemberInvitationsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  memberAccount?: InputMaybe<AccountReferenceInput>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents a Bot account */
export type BotMemberOfArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  hostFeesStructure?: InputMaybe<HostFeeStructure>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isHostAccount?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: OrderByInput;
  orderByRoles?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Bot account */
export type BotMembersArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents a Bot account */
export type BotOAuthApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Bot account */
export type BotOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Bot account */
export type BotPaymentMethodsArgs = {
  enumType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  includeExpired?: InputMaybe<Scalars['Boolean']['input']>;
  service?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  type?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
};


/** This represents a Bot account */
export type BotTransactionGroupsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** This represents a Bot account */
export type BotTransactionReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents a Bot account */
export type BotTransactionsArgs = {
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents a Bot account */
export type BotUnhostedAtArgs = {
  host: AccountReferenceInput;
};


/** This represents a Bot account */
export type BotUpdatesArgs = {
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublishedUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Bot account */
export type BotVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Bot account */
export type BotVirtualCardsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
};


/** This represents a Bot account */
export type BotWebhooksArgs = {
  account: AccountReferenceInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type Collective_Minimum_Admins = {
  __typename?: 'COLLECTIVE_MINIMUM_ADMINS';
  applies?: Maybe<PolicyApplication>;
  freeze?: Maybe<Scalars['Boolean']['output']>;
  numberOfAdmins?: Maybe<Scalars['Int']['output']>;
};

/** Captcha related information */
export type CaptchaInput = {
  /** Catpcha provider */
  provider: CaptchaProvider;
  /** Captcha validation token */
  token: Scalars['String']['input'];
};

/** Implemented Captcha Providers */
export enum CaptchaProvider {
  HCAPTCHA = 'HCAPTCHA',
  RECAPTCHA = 'RECAPTCHA',
  TURNSTILE = 'TURNSTILE'
}

/** Input to order results chronologically */
export type ChronologicalOrderInput = {
  /** Ordering direction. */
  direction?: OrderDirection;
  /** Field to chronologically order by. */
  field?: DateTimeField;
};

/** Collection interface shared by all collection types */
export type Collection = {
  limit?: Maybe<Scalars['Int']['output']>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** This represents a Collective account */
export type Collective = Account & AccountWithContributions & AccountWithHost & {
  __typename?: 'Collective';
  /** [!] Warning: this query is currently in beta and the API might change */
  activeContributors: AccountCollection;
  /** List of activities that the logged-in user is subscribed for this collective */
  activitySubscriptions?: Maybe<Array<Maybe<ActivitySubscription>>>;
  /** Date of approval by the Fiscal Host. */
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  backgroundImageUrl?: Maybe<Scalars['String']['output']>;
  /** Whether this account can have changelog updates */
  canHaveChangelogUpdates: Scalars['Boolean']['output'];
  /** Returns true if the remote user can start the process to resume contributions for account */
  canStartResumeContributionsProcess: Scalars['Boolean']['output'];
  categories: Array<Maybe<Scalars['String']['output']>>;
  childrenAccounts: AccountCollection;
  /** The list of connected accounts (Stripe, Twitter, etc ...). Admin only. Scope: "connectedAccounts". */
  connectedAccounts?: Maybe<Array<Maybe<ConnectedAccount>>>;
  contributionPolicy?: Maybe<Scalars['String']['output']>;
  /** All the persons and entities that contribute to this account */
  contributors: ContributorCollection;
  conversations: ConversationCollection;
  /** Returns conversation's tags for collective sorted by popularity */
  conversationsTags?: Maybe<Array<Maybe<TagStat>>>;
  /** The time of creation */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The currency of the account */
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  /** If this account was duplicated, the accounts that were created from it */
  duplicatedAccounts: AccountCollection;
  /** If created by duplication, the account from which this one was duplicated */
  duplicatedFromAccount?: Maybe<Account>;
  /** Returns the emails of the account. Individuals only have one, but organizations can have multiple emails. */
  emails?: Maybe<Array<Scalars['EmailAddress']['output']>>;
  /** @deprecated 2024-11-04: Please use policies.EXPENSE_POLICIES */
  expensePolicy?: Maybe<Scalars['String']['output']>;
  expenses: ExpenseCollection;
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<TagStat>>>;
  /** Describes the features enabled and available for this account */
  features: CollectiveFeatures;
  feed?: Maybe<Array<Maybe<Activity>>>;
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: Maybe<Scalars['String']['output']>;
  /** Returns true if the account has started the process to resume contributions */
  hasResumeContributionsProcessStarted: Scalars['Boolean']['output'];
  /** Returns the Fiscal Host */
  host?: Maybe<Host>;
  /** Returns agreements this account has with its host, or null if not enough permissions. */
  hostAgreements?: Maybe<AgreementCollection>;
  /** Returns the Fiscal Host application */
  hostApplication?: Maybe<HostApplication>;
  /** Host application requests */
  hostApplicationRequests: HostApplicationCollection;
  /** Fees percentage that the host takes for this collective */
  hostFeePercent?: Maybe<Scalars['Float']['output']>;
  /** Describe how the host charges the collective */
  hostFeesStructure?: Maybe<HostFeeStructure>;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Returns whether it's active: can accept financial contributions and pay expenses. */
  isActive: Scalars['Boolean']['output'];
  /** Returns true if the remote user is an admin of this account */
  isAdmin: Scalars['Boolean']['output'];
  /** Returns whether it's approved by the Fiscal Host */
  isApproved: Scalars['Boolean']['output'];
  /** Returns whether this account is archived */
  isArchived: Scalars['Boolean']['output'];
  /** Whether this account is frozen */
  isFrozen: Scalars['Boolean']['output'];
  /** Returns whether the account is setup to Host collectives. */
  isHost: Scalars['Boolean']['output'];
  /** Defines if the contributors wants to be incognito (name not displayed) */
  isIncognito: Scalars['Boolean']['output'];
  legacyId: Scalars['Int']['output'];
  /** The legal documents associated with this account */
  legalDocuments?: Maybe<Array<Maybe<LegalDocument>>>;
  /** Private, legal name. Used for expense receipts, taxes, etc. Scope: "account". */
  legalName?: Maybe<Scalars['String']['output']>;
  /** The address associated to this account. This field is always public for collectives and events. */
  location?: Maybe<Location>;
  longDescription?: Maybe<Scalars['String']['output']>;
  /** [AUTHENTICATED] Returns the pending invitations */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  memberOf: MemberOfCollection;
  /** Get all members (admins, members, backers, followers) */
  members: MemberCollection;
  /** Public name */
  name?: Maybe<Scalars['String']['output']>;
  /** The list of applications created by this account. Admin only. Scope: "applications". */
  oAuthApplications?: Maybe<OAuthApplicationCollection>;
  orders: OrderCollection;
  /** @deprecated 2022-12-16: use parent on AccountWithParent instead */
  parentAccount?: Maybe<Account>;
  /** The list of payment methods that this collective can use to pay for Orders. Admin or Host only. Scope: "orders". */
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payment methods for this account that are pending a client confirmation (3D Secure / SCA) */
  paymentMethodsWithPendingConfirmation?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payout methods that this collective can use to get paid. In most cases, admin only and scope: "expenses". */
  payoutMethods?: Maybe<Array<Maybe<PayoutMethod>>>;
  /** Logged-in user permissions on an account */
  permissions: AccountPermissions;
  /** Returns true if a custom contribution to Open Collective can be submitted for contributions made to this account */
  platformContributionAvailable: Scalars['Boolean']['output'];
  /** How much platform fees are charged for this account */
  platformFeePercent: Scalars['Float']['output'];
  /** Policies for the account. To see non-public policies you need to be admin and have the scope: "account". */
  policies: Policies;
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  settings: Scalars['JSON']['output'];
  /** The slug identifying the account (ie: babel) */
  slug: Scalars['String']['output'];
  socialLinks: Array<SocialLink>;
  stats?: Maybe<AccountStats>;
  summary?: Maybe<HostedAccountSummary>;
  /** The list of expense types supported by this account */
  supportedExpenseTypes: Array<ExpenseType>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tiers: TierCollection;
  /** Number of unique financial contributors. */
  totalFinancialContributors: Scalars['Int']['output'];
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  transactionReports?: Maybe<TransactionReports>;
  transactions: TransactionCollection;
  transferwise?: Maybe<TransferWise>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  twitterHandle?: Maybe<Scalars['String']['output']>;
  type: AccountType;
  /** Date when the collective was last unfrozen by current Fiscal Host */
  unfrozenAt?: Maybe<Scalars['DateTime']['output']>;
  /** Date of unhosting by a given Fiscal Host. */
  unhostedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Updates published by the account. To see unpublished updates, you need to be an admin and have the scope "updates". */
  updates: UpdateCollection;
  /** Virtual Cards Merchants used by the account. Admin only. Scope: "virtualCards". */
  virtualCardMerchants?: Maybe<AccountCollection>;
  /** Virtual Cards attached to the account. Admin only. Scope: "virtualCards". */
  virtualCards?: Maybe<VirtualCardCollection>;
  webhooks: WebhookCollection;
  /** @deprecated 2023-01-16: Please use socialLinks */
  website?: Maybe<Scalars['String']['output']>;
};


/** This represents a Collective account */
export type CollectiveActiveContributorsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeActiveRecurringContributions?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Collective account */
export type CollectiveActivitySubscriptionsArgs = {
  channel?: InputMaybe<ActivityChannel>;
};


/** This represents a Collective account */
export type CollectiveBackgroundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents a Collective account */
export type CollectiveChildrenAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Collective account */
export type CollectiveContributorsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  roles?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents a Collective account */
export type CollectiveConversationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Collective account */
export type CollectiveConversationsTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents a Collective account */
export type CollectiveDuplicatedAccountsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Collective account */
export type CollectiveExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<ExpenseDirection>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents a Collective account */
export type CollectiveExpensesTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents a Collective account */
export type CollectiveFeedArgs = {
  classes?: InputMaybe<Array<InputMaybe<ActivityClassType>>>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents a Collective account */
export type CollectiveHostAgreementsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Collective account */
export type CollectiveHostApplicationRequestsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<HostApplicationStatus>;
};


/** This represents a Collective account */
export type CollectiveHostFeePercentArgs = {
  paymentMethodService?: InputMaybe<PaymentMethodService>;
  paymentMethodType?: InputMaybe<PaymentMethodType>;
};


/** This represents a Collective account */
export type CollectiveImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents a Collective account */
export type CollectiveLegalDocumentsArgs = {
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents a Collective account */
export type CollectiveMemberInvitationsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  memberAccount?: InputMaybe<AccountReferenceInput>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents a Collective account */
export type CollectiveMemberOfArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  hostFeesStructure?: InputMaybe<HostFeeStructure>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isHostAccount?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: OrderByInput;
  orderByRoles?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Collective account */
export type CollectiveMembersArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents a Collective account */
export type CollectiveOAuthApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Collective account */
export type CollectiveOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Collective account */
export type CollectivePaymentMethodsArgs = {
  enumType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  includeExpired?: InputMaybe<Scalars['Boolean']['input']>;
  service?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  type?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
};


/** This represents a Collective account */
export type CollectiveSummaryArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
};


/** This represents a Collective account */
export type CollectiveTiersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Collective account */
export type CollectiveTotalFinancialContributorsArgs = {
  accountType?: InputMaybe<AccountType>;
};


/** This represents a Collective account */
export type CollectiveTransactionGroupsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** This represents a Collective account */
export type CollectiveTransactionReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents a Collective account */
export type CollectiveTransactionsArgs = {
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents a Collective account */
export type CollectiveUnhostedAtArgs = {
  host: AccountReferenceInput;
};


/** This represents a Collective account */
export type CollectiveUpdatesArgs = {
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublishedUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Collective account */
export type CollectiveVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Collective account */
export type CollectiveVirtualCardsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
};


/** This represents a Collective account */
export type CollectiveWebhooksArgs = {
  account: AccountReferenceInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type CollectiveCreateInput = {
  /** The profile background image, for the banner and social media sharing */
  backgroundImage?: InputMaybe<Scalars['Upload']['input']>;
  description: Scalars['String']['input'];
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: InputMaybe<Scalars['String']['input']>;
  /** The profile avatar image */
  image?: InputMaybe<Scalars['Upload']['input']>;
  location?: InputMaybe<LocationInput>;
  name: Scalars['String']['input'];
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: InputMaybe<Scalars['String']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
  slug: Scalars['String']['input'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum CollectiveFeatureStatus {
  /** The feature is enabled and is actively used */
  ACTIVE = 'ACTIVE',
  /** The feature is enabled, but there is no data for it */
  AVAILABLE = 'AVAILABLE',
  /** The feature is disabled, but can be enabled by an admin */
  DISABLED = 'DISABLED',
  /** The feature is disabled and cannot be activated for this account */
  UNSUPPORTED = 'UNSUPPORTED'
}

/** Describes the features enabled and available for this account */
export type CollectiveFeatures = {
  __typename?: 'CollectiveFeatures';
  ABOUT?: Maybe<CollectiveFeatureStatus>;
  ALIPAY?: Maybe<CollectiveFeatureStatus>;
  ALL?: Maybe<CollectiveFeatureStatus>;
  COLLECTIVE_GOALS?: Maybe<CollectiveFeatureStatus>;
  CONNECTED_ACCOUNTS?: Maybe<CollectiveFeatureStatus>;
  CONTACT_COLLECTIVE?: Maybe<CollectiveFeatureStatus>;
  CONTACT_FORM?: Maybe<CollectiveFeatureStatus>;
  CONVERSATIONS?: Maybe<CollectiveFeatureStatus>;
  CREATE_COLLECTIVE?: Maybe<CollectiveFeatureStatus>;
  EMAIL_NOTIFICATIONS_PANEL?: Maybe<CollectiveFeatureStatus>;
  EMIT_GIFT_CARDS?: Maybe<CollectiveFeatureStatus>;
  EVENTS?: Maybe<CollectiveFeatureStatus>;
  HOST_DASHBOARD?: Maybe<CollectiveFeatureStatus>;
  MULTI_CURRENCY_EXPENSES?: Maybe<CollectiveFeatureStatus>;
  ORDER?: Maybe<CollectiveFeatureStatus>;
  PAYPAL_DONATIONS?: Maybe<CollectiveFeatureStatus>;
  PAYPAL_PAYOUTS?: Maybe<CollectiveFeatureStatus>;
  PROJECTS?: Maybe<CollectiveFeatureStatus>;
  RECEIVE_EXPENSES?: Maybe<CollectiveFeatureStatus>;
  RECEIVE_FINANCIAL_CONTRIBUTIONS?: Maybe<CollectiveFeatureStatus>;
  RECEIVE_HOST_APPLICATIONS?: Maybe<CollectiveFeatureStatus>;
  RECURRING_CONTRIBUTIONS?: Maybe<CollectiveFeatureStatus>;
  REQUEST_VIRTUAL_CARDS?: Maybe<CollectiveFeatureStatus>;
  STRIPE_PAYMENT_INTENT?: Maybe<CollectiveFeatureStatus>;
  TEAM?: Maybe<CollectiveFeatureStatus>;
  TOP_FINANCIAL_CONTRIBUTORS?: Maybe<CollectiveFeatureStatus>;
  TRANSACTIONS?: Maybe<CollectiveFeatureStatus>;
  TRANSFERWISE?: Maybe<CollectiveFeatureStatus>;
  UPDATES?: Maybe<CollectiveFeatureStatus>;
  USE_EXPENSES?: Maybe<CollectiveFeatureStatus>;
  USE_PAYMENT_METHODS?: Maybe<CollectiveFeatureStatus>;
  VIRTUAL_CARDS?: Maybe<CollectiveFeatureStatus>;
  /** The id of the account */
  id: Scalars['String']['output'];
};

/** This represents an Comment */
export type Comment = {
  __typename?: 'Comment';
  account?: Maybe<Account>;
  conversation?: Maybe<Conversation>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  expense?: Maybe<Expense>;
  fromAccount?: Maybe<Account>;
  hostApplication?: Maybe<HostApplication>;
  html?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Order>;
  /** Returns a map of reactions counts for this comment */
  reactions?: Maybe<Scalars['JSON']['output']>;
  /** The type of this comment */
  type: CommentType;
  update?: Maybe<Update>;
  /** Returns the list of reactions added to this comment by logged in user */
  userReactions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

/** A collection of "Comments" */
export type CommentCollection = Collection & {
  __typename?: 'CommentCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Comment>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Input to create a comment. You can only specify one entity type: expense, conversation, update or host application */
export type CommentCreateInput = {
  /** @deprecated 2022-08-26: Please use "conversation" */
  ConversationId?: InputMaybe<Scalars['String']['input']>;
  conversation?: InputMaybe<ConversationReferenceInput>;
  /** If your comment is linked to an expense, set it here */
  expense?: InputMaybe<ExpenseReferenceInput>;
  /** If your comment is linked to an host application, set it here */
  hostApplication?: InputMaybe<HostApplicationReferenceInput>;
  html?: InputMaybe<Scalars['String']['input']>;
  /** If your comment is linked to an order, set it here */
  order?: InputMaybe<OrderReferenceInput>;
  /** The type of the comment */
  type?: InputMaybe<CommentType>;
  update?: InputMaybe<UpdateReferenceInput>;
};

export type CommentReferenceInput = {
  /** The public id identifying the comment */
  id?: InputMaybe<Scalars['String']['input']>;
};

/** All supported comment contexts */
export enum CommentType {
  /** Default regular comment */
  COMMENT = 'COMMENT',
  /** Comment is visible only to host admins */
  PRIVATE_NOTE = 'PRIVATE_NOTE'
}

export type CommentUpdateInput = {
  html?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};

/** Response for the confirmGuestAccount mutation */
export type ConfirmGuestAccountResponse = {
  __typename?: 'ConfirmGuestAccountResponse';
  /** A token that can be used to sign in */
  accessToken: Scalars['String']['output'];
  /** The validated account */
  account: Account;
};

/** This represents a Connected Account */
export type ConnectedAccount = {
  __typename?: 'ConnectedAccount';
  /** The date on which the ConnectedAccount was created */
  createdAt: Scalars['DateTime']['output'];
  /** Unique identifier for this connected account */
  id: Scalars['String']['output'];
  /**
   * The internal database identifier of the Connected Account (ie: 580)
   * @deprecated 2020-05-01: should only be used during the transition to GraphQL API v2.
   */
  legacyId?: Maybe<Scalars['Int']['output']>;
  service: ConnectedAccountService;
  settings?: Maybe<Scalars['JSON']['output']>;
  /** The date on which the ConnectedAccount was last updated */
  updatedAt: Scalars['DateTime']['output'];
};

export type ConnectedAccountCreateInput = {
  /** Optional Client ID for the token or secret */
  clientId?: InputMaybe<Scalars['String']['input']>;
  /** Private data related to the connected account */
  data?: InputMaybe<Scalars['JSON']['input']>;
  /** Refresh token for the connected account */
  refreshToken?: InputMaybe<Scalars['String']['input']>;
  /** Service which the connected account belongs to */
  service?: InputMaybe<ConnectedAccountService>;
  /** Public data related to the connected account */
  settings?: InputMaybe<Scalars['JSON']['input']>;
  /** Secret token used to call service */
  token?: InputMaybe<Scalars['String']['input']>;
  /** Optional username for the connected account */
  username?: InputMaybe<Scalars['String']['input']>;
};

export type ConnectedAccountReferenceInput = {
  /** The public id identifying the connected account (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The internal id of the account (ie: 580) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** All supported services a user can connect with */
export enum ConnectedAccountService {
  github = 'github',
  /** @deprecated Not using this service anymore */
  meetup = 'meetup',
  paypal = 'paypal',
  plaid = 'plaid',
  /** @deprecated Not using this service anymore */
  privacy = 'privacy',
  stripe = 'stripe',
  stripe_customer = 'stripe_customer',
  thegivingblock = 'thegivingblock',
  transferwise = 'transferwise',
  twitter = 'twitter'
}

export enum ContributionFrequency {
  MONTHLY = 'MONTHLY',
  ONETIME = 'ONETIME',
  YEARLY = 'YEARLY'
}

/** Contribution statistics related to the given accounts */
export type ContributionStats = {
  __typename?: 'ContributionStats';
  /** The total number of contributions */
  contributionsCount: Scalars['Int']['output'];
  /** The daily average income */
  dailyAverageIncomeAmount: Amount;
  /** Number of one time contributions */
  oneTimeContributionsCount: Scalars['Int']['output'];
  /** Number of recurring contributions */
  recurringContributionsCount: Scalars['Int']['output'];
};

/**
 *
 *     A person or an entity that contributes financially or by any other mean to the mission
 *     of the collective. While "Member" is dedicated to permissions, this type is meant
 *     to surface all the public contributors and properly groups contributors who are part of
 *     multiple tiers.
 *
 */
export type Contributor = {
  __typename?: 'Contributor';
  account?: Maybe<Account>;
  /** List of accounts the contributor has contributed to */
  accountsContributedTo?: Maybe<Array<Maybe<Account>>>;
  /**
   * If the contributor has a page on Open Collective, this is the slug to link to it. Always null for incognito contributors
   * @deprecated 2024-08-26: Use account.slug instead
   */
  collectiveSlug?: Maybe<Scalars['String']['output']>;
  /** Description of how the member contribute. Will usually be a tier name, or "design" or "code". */
  description?: Maybe<Scalars['String']['output']>;
  /** A unique identifier for this member */
  id: Scalars['String']['output'];
  /**
   * Contributor avatar or logo
   * @deprecated 2024-08-26: Use account.image instead
   */
  image?: Maybe<Scalars['String']['output']>;
  /** True if the contributor is a collective admin */
  isAdmin: Scalars['Boolean']['output'];
  /** True if the contributor is a financial contributor */
  isBacker: Scalars['Boolean']['output'];
  /** True if the contributor is a core contributor */
  isCore: Scalars['Boolean']['output'];
  /**
   * Defines if the contributors wants to be incognito (name not displayed)
   * @deprecated 2024-08-26: Use account.isIncognito instead
   */
  isIncognito: Scalars['Boolean']['output'];
  /**
   * Name of the contributor
   * @deprecated 2024-08-26: Use account.name instead
   */
  name: Scalars['String']['output'];
  /** A public message from contributors to describe their contributions */
  publicMessage?: Maybe<Scalars['String']['output']>;
  /** All the roles for a given contributor */
  roles?: Maybe<Array<Maybe<MemberRole>>>;
  /** Member join date */
  since: Scalars['DateTime']['output'];
  /** How much money the user has contributed */
  totalAmountContributed: Amount;
  /**
   * How much money the user has contributed for this (in cents, using collective currency)
   * @deprecated 2024-08-26: Use totalAmountContributed instead
   */
  totalAmountDonated: Scalars['Int']['output'];
  /**
   * Whether the contributor is an individual, an organization...
   * @deprecated 2024-08-26: Use account.type instead
   */
  type: Scalars['String']['output'];
};


/**
 *
 *     A person or an entity that contributes financially or by any other mean to the mission
 *     of the collective. While "Member" is dedicated to permissions, this type is meant
 *     to surface all the public contributors and properly groups contributors who are part of
 *     multiple tiers.
 *
 */
export type ContributorImageArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};

/** A collection of "Contributor" */
export type ContributorCollection = Collection & {
  __typename?: 'ContributorCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Contributor>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** A conversation thread */
export type Conversation = {
  __typename?: 'Conversation';
  account?: Maybe<Account>;
  /** The root comment / starter for this conversation */
  body?: Maybe<Comment>;
  /** List the comments for this conversation. Not backed by a loader, don't use this in lists. */
  comments: CommentCollection;
  createdAt: Scalars['DateTime']['output'];
  followers: AccountCollection;
  fromAccount?: Maybe<Account>;
  id: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  stats?: Maybe<ConversationStats>;
  summary: Scalars['String']['output'];
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};


/** A conversation thread */
export type ConversationCommentsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** A conversation thread */
export type ConversationFollowersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

/** A collection of "Conversations" */
export type ConversationCollection = Collection & {
  __typename?: 'ConversationCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Conversation>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ConversationReferenceInput = {
  /** The public id identifying the conversation */
  id?: InputMaybe<Scalars['String']['input']>;
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

export type ConversationStats = {
  __typename?: 'ConversationStats';
  /** Total number of comments for this conversation */
  commentsCount?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
};

/** Two-letters country code following ISO3166_1 */
export enum CountryIso {
  /** Andorra */
  AD = 'AD',
  /** The United Arab Emirates */
  AE = 'AE',
  /** Afghanistan */
  AF = 'AF',
  /** Antigua and Barbuda */
  AG = 'AG',
  /** Anguilla */
  AI = 'AI',
  /** Albania */
  AL = 'AL',
  /** Armenia */
  AM = 'AM',
  /** Angola */
  AO = 'AO',
  /** Antarctica */
  AQ = 'AQ',
  /** Argentina */
  AR = 'AR',
  /** American Samoa */
  AS = 'AS',
  /** Austria */
  AT = 'AT',
  /** Australia */
  AU = 'AU',
  /** Aruba */
  AW = 'AW',
  /** Åland Islands */
  AX = 'AX',
  /** Azerbaijan */
  AZ = 'AZ',
  /** Bosnia and Herzegovina */
  BA = 'BA',
  /** Barbados */
  BB = 'BB',
  /** Bangladesh */
  BD = 'BD',
  /** Belgium */
  BE = 'BE',
  /** Burkina */
  BF = 'BF',
  /** Bulgaria */
  BG = 'BG',
  /** Bahrain */
  BH = 'BH',
  /** Burundi */
  BI = 'BI',
  /** Benin */
  BJ = 'BJ',
  /** Saint Barthélemy */
  BL = 'BL',
  /** Bermuda */
  BM = 'BM',
  /** Brunei */
  BN = 'BN',
  /** Bolivia */
  BO = 'BO',
  /** Bonaire, Sint Eustatius and Saba */
  BQ = 'BQ',
  /** Brazil */
  BR = 'BR',
  /** The Bahamas */
  BS = 'BS',
  /** Bhutan */
  BT = 'BT',
  /** Bouvet Island */
  BV = 'BV',
  /** Botswana */
  BW = 'BW',
  /** Belarus */
  BY = 'BY',
  /** Belize */
  BZ = 'BZ',
  /** Canada */
  CA = 'CA',
  /** Cocos Islands */
  CC = 'CC',
  /** The Democratic Republic of the Congo */
  CD = 'CD',
  /** The Central African Republic */
  CF = 'CF',
  /** The Congo */
  CG = 'CG',
  /** Switzerland */
  CH = 'CH',
  /** Côte d'Ivoire */
  CI = 'CI',
  /** Cook Islands */
  CK = 'CK',
  /** Chile */
  CL = 'CL',
  /** Cameroon */
  CM = 'CM',
  /** China */
  CN = 'CN',
  /** Colombia */
  CO = 'CO',
  /** Costa Rica */
  CR = 'CR',
  /** Cuba */
  CU = 'CU',
  /** Cape Verde */
  CV = 'CV',
  /** Curaçao */
  CW = 'CW',
  /** Christmas Island */
  CX = 'CX',
  /** Cyprus */
  CY = 'CY',
  /** The Czech Republic */
  CZ = 'CZ',
  /** Germany */
  DE = 'DE',
  /** Djibouti */
  DJ = 'DJ',
  /** Denmark */
  DK = 'DK',
  /** Dominica */
  DM = 'DM',
  /** The Dominican Republic */
  DO = 'DO',
  /** Algeria */
  DZ = 'DZ',
  /** Ecuador */
  EC = 'EC',
  /** Estonia */
  EE = 'EE',
  /** Egypt */
  EG = 'EG',
  /** Western Sahara */
  EH = 'EH',
  /** Eritrea */
  ER = 'ER',
  /** Spain */
  ES = 'ES',
  /** Ethiopia */
  ET = 'ET',
  /** Finland */
  FI = 'FI',
  /** Fiji */
  FJ = 'FJ',
  /** Falkland Islands */
  FK = 'FK',
  /** Micronesia */
  FM = 'FM',
  /** Faroe Islands */
  FO = 'FO',
  /** France */
  FR = 'FR',
  /** Gabon */
  GA = 'GA',
  /** The United Kingdom */
  GB = 'GB',
  /** Grenada */
  GD = 'GD',
  /** Georgia */
  GE = 'GE',
  /** French Guiana */
  GF = 'GF',
  /** Guernsey */
  GG = 'GG',
  /** Ghana */
  GH = 'GH',
  /** Gibraltar */
  GI = 'GI',
  /** Greenland */
  GL = 'GL',
  /** The Gambia */
  GM = 'GM',
  /** Guinea */
  GN = 'GN',
  /** Guadeloupe */
  GP = 'GP',
  /** Equatorial Guinea */
  GQ = 'GQ',
  /** Greece */
  GR = 'GR',
  /** South Georgia and The South Sandwich Islands */
  GS = 'GS',
  /** Guatemala */
  GT = 'GT',
  /** Guam */
  GU = 'GU',
  /** Guinea-Bissau */
  GW = 'GW',
  /** Guyana */
  GY = 'GY',
  /** Hong Kong */
  HK = 'HK',
  /** Heard Island and McDonald Islands */
  HM = 'HM',
  /** Honduras */
  HN = 'HN',
  /** Croatia */
  HR = 'HR',
  /** Haiti */
  HT = 'HT',
  /** Hungary */
  HU = 'HU',
  /** Indonesia */
  ID = 'ID',
  /** Ireland */
  IE = 'IE',
  /** Israel */
  IL = 'IL',
  /** Isle of Man */
  IM = 'IM',
  /** India */
  IN = 'IN',
  /** The British Indian Ocean Territory */
  IO = 'IO',
  /** Iraq */
  IQ = 'IQ',
  /** Iran */
  IR = 'IR',
  /** Iceland */
  IS = 'IS',
  /** Italy */
  IT = 'IT',
  /** Jersey */
  JE = 'JE',
  /** Jamaica */
  JM = 'JM',
  /** Jordan */
  JO = 'JO',
  /** Japan */
  JP = 'JP',
  /** Kenya */
  KE = 'KE',
  /** Kyrgyzstan */
  KG = 'KG',
  /** Cambodia */
  KH = 'KH',
  /** Kiribati */
  KI = 'KI',
  /** The Comoros */
  KM = 'KM',
  /** Saint Kitts and Nevis */
  KN = 'KN',
  /** The Democratic People's Republic of Korea */
  KP = 'KP',
  /** The Republic of Korea */
  KR = 'KR',
  /** Kuwait */
  KW = 'KW',
  /** Cayman Islands */
  KY = 'KY',
  /** Kazakhstan */
  KZ = 'KZ',
  /** Laos */
  LA = 'LA',
  /** Lebanon */
  LB = 'LB',
  /** Saint Lucia */
  LC = 'LC',
  /** Liechtenstein */
  LI = 'LI',
  /** Sri Lanka */
  LK = 'LK',
  /** Liberia */
  LR = 'LR',
  /** Lesotho */
  LS = 'LS',
  /** Lithuania */
  LT = 'LT',
  /** Luxembourg */
  LU = 'LU',
  /** Latvia */
  LV = 'LV',
  /** Libya */
  LY = 'LY',
  /** Morocco */
  MA = 'MA',
  /** Monaco */
  MC = 'MC',
  /** Moldova */
  MD = 'MD',
  /** Montenegro */
  ME = 'ME',
  /** Saint Martin */
  MF = 'MF',
  /** Madagascar */
  MG = 'MG',
  /** The Marshall Islands */
  MH = 'MH',
  /** Macedonia */
  MK = 'MK',
  /** Mali */
  ML = 'ML',
  /** Myanmar */
  MM = 'MM',
  /** Mongolia */
  MN = 'MN',
  /** Macao */
  MO = 'MO',
  /** Northern Mariana Islands */
  MP = 'MP',
  /** Martinique */
  MQ = 'MQ',
  /** Mauritania */
  MR = 'MR',
  /** Montserrat */
  MS = 'MS',
  /** Malta */
  MT = 'MT',
  /** Mauritius */
  MU = 'MU',
  /** Maldives */
  MV = 'MV',
  /** Malawi */
  MW = 'MW',
  /** Mexico */
  MX = 'MX',
  /** Malaysia */
  MY = 'MY',
  /** Mozambique */
  MZ = 'MZ',
  /** Namibia */
  NA = 'NA',
  /** New Caledonia */
  NC = 'NC',
  /** The Niger */
  NE = 'NE',
  /** Norfolk Island */
  NF = 'NF',
  /** Nigeria */
  NG = 'NG',
  /** Nicaragua */
  NI = 'NI',
  /** The Netherlands */
  NL = 'NL',
  /** Norway */
  NO = 'NO',
  /** Nepal */
  NP = 'NP',
  /** Nauru */
  NR = 'NR',
  /** Niue */
  NU = 'NU',
  /** New Zealand */
  NZ = 'NZ',
  /** Oman */
  OM = 'OM',
  /** Panama */
  PA = 'PA',
  /** Peru */
  PE = 'PE',
  /** French Polynesia */
  PF = 'PF',
  /** Papua New Guinea */
  PG = 'PG',
  /** The Philippines */
  PH = 'PH',
  /** Pakistan */
  PK = 'PK',
  /** Poland */
  PL = 'PL',
  /** Saint Pierre and Miquelon */
  PM = 'PM',
  /** Pitcairn */
  PN = 'PN',
  /** Puerto Rico */
  PR = 'PR',
  /** The Occupied Palestinian Territory */
  PS = 'PS',
  /** Portugal */
  PT = 'PT',
  /** Palau */
  PW = 'PW',
  /** Paraguay */
  PY = 'PY',
  /** Qatar */
  QA = 'QA',
  /** Réunion */
  RE = 'RE',
  /** Romania */
  RO = 'RO',
  /** Serbia */
  RS = 'RS',
  /** Russia */
  RU = 'RU',
  /** Rwanda */
  RW = 'RW',
  /** Saudi Arabia */
  SA = 'SA',
  /** Solomon Islands */
  SB = 'SB',
  /** Seychelles */
  SC = 'SC',
  /** The Sudan */
  SD = 'SD',
  /** Sweden */
  SE = 'SE',
  /** Singapore */
  SG = 'SG',
  /** Saint Helena */
  SH = 'SH',
  /** Slovenia */
  SI = 'SI',
  /** Svalbard and Jan Mayen */
  SJ = 'SJ',
  /** Slovakia */
  SK = 'SK',
  /** Sierra Leone */
  SL = 'SL',
  /** San Marino */
  SM = 'SM',
  /** Senegal */
  SN = 'SN',
  /** Somalia */
  SO = 'SO',
  /** Suriname */
  SR = 'SR',
  /** South Sudan */
  SS = 'SS',
  /** Sao Tome and Principe */
  ST = 'ST',
  /** El Salvador */
  SV = 'SV',
  /** Sint Maarten */
  SX = 'SX',
  /** Syria */
  SY = 'SY',
  /** Swaziland */
  SZ = 'SZ',
  /** Turks and Caicos Islands */
  TC = 'TC',
  /** Chad */
  TD = 'TD',
  /** The French Southern Territories */
  TF = 'TF',
  /** Togo */
  TG = 'TG',
  /** Thailand */
  TH = 'TH',
  /** Tajikistan */
  TJ = 'TJ',
  /** Tokelau */
  TK = 'TK',
  /** Timor-Leste */
  TL = 'TL',
  /** Turkmenistan */
  TM = 'TM',
  /** Tunisia */
  TN = 'TN',
  /** Tonga */
  TO = 'TO',
  /** Turkey */
  TR = 'TR',
  /** Trinidad and Tobago */
  TT = 'TT',
  /** Tuvalu */
  TV = 'TV',
  /** Taiwan */
  TW = 'TW',
  /** Tanzania */
  TZ = 'TZ',
  /** Ukraine */
  UA = 'UA',
  /** Uganda */
  UG = 'UG',
  /** United States Minor Outlying Islands */
  UM = 'UM',
  /** The United States */
  US = 'US',
  /** Uruguay */
  UY = 'UY',
  /** Uzbekistan */
  UZ = 'UZ',
  /** The Holy See */
  VA = 'VA',
  /** Saint Vincent and The Grenadines */
  VC = 'VC',
  /** Venezuela */
  VE = 'VE',
  /** British Virgin Islands */
  VG = 'VG',
  /** US Virgin Islands */
  VI = 'VI',
  /** Viet Nam */
  VN = 'VN',
  /** Vanuatu */
  VU = 'VU',
  /** Wallis and Futuna */
  WF = 'WF',
  /** Samoa */
  WS = 'WS',
  /** Yemen */
  YE = 'YE',
  /** Mayotte */
  YT = 'YT',
  /** South Africa */
  ZA = 'ZA',
  /** Zambia */
  ZM = 'ZM',
  /** Zimbabwe */
  ZW = 'ZW'
}

/** This represents a Credit transaction */
export type Credit = Transaction & {
  __typename?: 'Credit';
  /** The account on the main side of the transaction (CREDIT -> recipient, DEBIT -> sender) */
  account?: Maybe<Account>;
  amount: Amount;
  amountInHostCurrency: Amount;
  balanceInHostCurrency?: Maybe<Amount>;
  clearedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  expense?: Maybe<Expense>;
  fromAccount?: Maybe<Account>;
  /** Account that emitted the gift card used for this transaction (if any) */
  giftCardEmitterAccount?: Maybe<Account>;
  group: Scalars['String']['output'];
  host?: Maybe<Account>;
  /** Exchange rate between the currency of the transaction and the currency of the host (transaction.amount * transaction.hostCurrencyFxRate = transaction.amountInHostCurrency) */
  hostCurrencyFxRate?: Maybe<Scalars['Float']['output']>;
  hostFee: Amount;
  id: Scalars['String']['output'];
  invoiceTemplate?: Maybe<Scalars['String']['output']>;
  isDisputed?: Maybe<Scalars['Boolean']['output']>;
  isInReview?: Maybe<Scalars['Boolean']['output']>;
  isOrderRejected: Scalars['Boolean']['output'];
  isRefund?: Maybe<Scalars['Boolean']['output']>;
  isRefunded?: Maybe<Scalars['Boolean']['output']>;
  kind?: Maybe<TransactionKind>;
  legacyId: Scalars['Int']['output'];
  /** Merchant ID related to the Transaction (Stripe, PayPal, Wise, Privacy) */
  merchantId?: Maybe<Scalars['String']['output']>;
  netAmount: Amount;
  netAmountInHostCurrency: Amount;
  /** The account on the opposite side of the transaction (CREDIT -> sender, DEBIT -> recipient) */
  oppositeAccount?: Maybe<Account>;
  /** The opposite transaction (CREDIT -> DEBIT, DEBIT -> CREDIT) */
  oppositeTransaction?: Maybe<Transaction>;
  order?: Maybe<Order>;
  paymentMethod?: Maybe<PaymentMethod>;
  /** Payment Processor Fee (usually in host currency) */
  paymentProcessorFee: Amount;
  paymentProcessorUrl?: Maybe<Scalars['String']['output']>;
  payoutMethod?: Maybe<PayoutMethod>;
  /** The permissions given to current logged in user for this transaction */
  permissions: TransactionPermissions;
  platformFee: Amount;
  refundTransaction?: Maybe<Transaction>;
  relatedTransactions: Array<Maybe<Transaction>>;
  taxAmount: Amount;
  /** If a tax is set, this field will contain more info about the tax */
  taxInfo?: Maybe<TaxInfo>;
  toAccount?: Maybe<Account>;
  type: TransactionType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** @deprecated 2021-08-15: Use id instead. */
  uuid: Scalars['String']['output'];
};


/** This represents a Credit transaction */
export type CreditDescriptionArgs = {
  dynamic?: InputMaybe<Scalars['Boolean']['input']>;
  full?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This represents a Credit transaction */
export type CreditHostFeeArgs = {
  fetchHostFee?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This represents a Credit transaction */
export type CreditNetAmountArgs = {
  fetchHostFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchPaymentProcessorFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchTax?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This represents a Credit transaction */
export type CreditNetAmountInHostCurrencyArgs = {
  fetchHostFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchPaymentProcessorFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchTax?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This represents a Credit transaction */
export type CreditPaymentProcessorFeeArgs = {
  fetchPaymentProcessorFee?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This represents a Credit transaction */
export type CreditRelatedTransactionsArgs = {
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
};


/** This represents a Credit transaction */
export type CreditTaxAmountArgs = {
  fetchTax?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreditCardCreateInput = {
  /** @deprecated 2022-11-22: the `token` parameter is sufficient */
  brand?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated 2022-11-22: the `token` parameter is sufficient */
  country?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated 2022-11-22: the `token` parameter is sufficient */
  expMonth?: InputMaybe<Scalars['Int']['input']>;
  /** @deprecated 2022-11-22: the `token` parameter is sufficient */
  expYear?: InputMaybe<Scalars['Int']['input']>;
  /** @deprecated 2022-11-22: the field was not used since 2017 */
  fullName?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated 2022-11-22: the `token` parameter is sufficient */
  funding?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
  zip?: InputMaybe<Scalars['String']['input']>;
};

export type CreditCardWithStripeError = {
  __typename?: 'CreditCardWithStripeError';
  /** The payment method created */
  paymentMethod: PaymentMethod;
  /** This field will be set if there was an error with Stripe during strong customer authentication */
  stripeError?: Maybe<StripeError>;
};

/** All supported currencies */
export enum Currency {
  /** UAE Dirham */
  AED = 'AED',
  /** Afghani */
  AFN = 'AFN',
  /** Lek */
  ALL = 'ALL',
  /** Armenian Dram */
  AMD = 'AMD',
  /** Netherlands Antillean Guilder */
  ANG = 'ANG',
  /** Kwanza */
  AOA = 'AOA',
  /** Argentine Peso */
  ARS = 'ARS',
  /** Australian Dollar */
  AUD = 'AUD',
  /** Aruban Florin */
  AWG = 'AWG',
  /** Azerbaijanian Manat */
  AZN = 'AZN',
  /** Convertible Mark */
  BAM = 'BAM',
  /** Barbados Dollar */
  BBD = 'BBD',
  /** Taka */
  BDT = 'BDT',
  /** Bulgarian Lev */
  BGN = 'BGN',
  /** Burundi Franc */
  BIF = 'BIF',
  /** Bermudian Dollar */
  BMD = 'BMD',
  /** Brunei Dollar */
  BND = 'BND',
  /** Boliviano */
  BOB = 'BOB',
  /** Brazilian Real */
  BRL = 'BRL',
  /** Bahamian Dollar */
  BSD = 'BSD',
  /** Pula */
  BWP = 'BWP',
  /** Belarussian Ruble */
  BYN = 'BYN',
  /** Belize Dollar */
  BZD = 'BZD',
  /** Canadian Dollar */
  CAD = 'CAD',
  /** Congolese Franc */
  CDF = 'CDF',
  /** Swiss Franc */
  CHF = 'CHF',
  /** Chilean Peso */
  CLP = 'CLP',
  /** Yuan Renminbi */
  CNY = 'CNY',
  /** Colombian Peso */
  COP = 'COP',
  /** Costa Rican Colon */
  CRC = 'CRC',
  /** Cabo Verde Escudo */
  CVE = 'CVE',
  /** Czech Koruna */
  CZK = 'CZK',
  /** Djibouti Franc */
  DJF = 'DJF',
  /** Danish Krone */
  DKK = 'DKK',
  /** Dominican Peso */
  DOP = 'DOP',
  /** Algerian Dinar */
  DZD = 'DZD',
  /** Egyptian Pound */
  EGP = 'EGP',
  /** Ethiopian Birr */
  ETB = 'ETB',
  /** Euro */
  EUR = 'EUR',
  /** Fiji Dollar */
  FJD = 'FJD',
  /** Falkland Islands Pound */
  FKP = 'FKP',
  /** Pound Sterling */
  GBP = 'GBP',
  /** Lari */
  GEL = 'GEL',
  /** Gibraltar Pound */
  GIP = 'GIP',
  /** Dalasi */
  GMD = 'GMD',
  /** Guinea Franc */
  GNF = 'GNF',
  /** Quetzal */
  GTQ = 'GTQ',
  /** Guyana Dollar */
  GYD = 'GYD',
  /** Hong Kong Dollar */
  HKD = 'HKD',
  /** Lempira */
  HNL = 'HNL',
  /** Kuna */
  HRK = 'HRK',
  /** Gourde */
  HTG = 'HTG',
  /** Forint */
  HUF = 'HUF',
  /** Rupiah */
  IDR = 'IDR',
  /** New Israeli Sheqel */
  ILS = 'ILS',
  /** Indian Rupee */
  INR = 'INR',
  /** Iceland Krona */
  ISK = 'ISK',
  /** Jamaican Dollar */
  JMD = 'JMD',
  /** Yen */
  JPY = 'JPY',
  /** Kenyan Shilling */
  KES = 'KES',
  /** Som */
  KGS = 'KGS',
  /** Riel */
  KHR = 'KHR',
  /** Comoro Franc */
  KMF = 'KMF',
  /** Won */
  KRW = 'KRW',
  /** Cayman Islands Dollar */
  KYD = 'KYD',
  /** Tenge */
  KZT = 'KZT',
  /** Kip */
  LAK = 'LAK',
  /** Lebanese Pound */
  LBP = 'LBP',
  /** Sri Lanka Rupee */
  LKR = 'LKR',
  /** Liberian Dollar */
  LRD = 'LRD',
  /** Loti */
  LSL = 'LSL',
  /** Moroccan Dirham */
  MAD = 'MAD',
  /** Moldovan Leu */
  MDL = 'MDL',
  /** Malagasy Ariary */
  MGA = 'MGA',
  /** Denar */
  MKD = 'MKD',
  /** Kyat */
  MMK = 'MMK',
  /** Tugrik */
  MNT = 'MNT',
  /** Pataca */
  MOP = 'MOP',
  /** Mauritius Rupee */
  MUR = 'MUR',
  /** Rufiyaa */
  MVR = 'MVR',
  /** Kwacha */
  MWK = 'MWK',
  /** Mexican Peso */
  MXN = 'MXN',
  /** Malaysian Ringgit */
  MYR = 'MYR',
  /** Mozambique Metical */
  MZN = 'MZN',
  /** Namibia Dollar */
  NAD = 'NAD',
  /** Naira */
  NGN = 'NGN',
  /** Cordoba Oro */
  NIO = 'NIO',
  /** Norwegian Krone */
  NOK = 'NOK',
  /** Nepalese Rupee */
  NPR = 'NPR',
  /** New Zealand Dollar */
  NZD = 'NZD',
  /** Balboa */
  PAB = 'PAB',
  /** Nuevo Sol */
  PEN = 'PEN',
  /** Kina */
  PGK = 'PGK',
  /** Philippine Peso */
  PHP = 'PHP',
  /** Pakistan Rupee */
  PKR = 'PKR',
  /** Zloty */
  PLN = 'PLN',
  /** Guarani */
  PYG = 'PYG',
  /** Qatari Rial */
  QAR = 'QAR',
  /** Romanian Leu */
  RON = 'RON',
  /** Serbian Dinar */
  RSD = 'RSD',
  /** Russian Ruble */
  RUB = 'RUB',
  /** Rwanda Franc */
  RWF = 'RWF',
  /** Saudi Riyal */
  SAR = 'SAR',
  /** Solomon Islands Dollar */
  SBD = 'SBD',
  /** Seychelles Rupee */
  SCR = 'SCR',
  /** Swedish Krona */
  SEK = 'SEK',
  /** Singapore Dollar */
  SGD = 'SGD',
  /** Saint Helena Pound */
  SHP = 'SHP',
  /** Leone */
  SLL = 'SLL',
  /** Somali Shilling */
  SOS = 'SOS',
  /** Surinam Dollar */
  SRD = 'SRD',
  /** Lilangeni */
  SZL = 'SZL',
  /** Baht */
  THB = 'THB',
  /** Somoni */
  TJS = 'TJS',
  /** Pa’anga */
  TOP = 'TOP',
  /** Turkish Lira */
  TRY = 'TRY',
  /** Trinidad and Tobago Dollar */
  TTD = 'TTD',
  /** New Taiwan Dollar */
  TWD = 'TWD',
  /** Tanzanian Shilling */
  TZS = 'TZS',
  /** Hryvnia */
  UAH = 'UAH',
  /** Uganda Shilling */
  UGX = 'UGX',
  /** US Dollar */
  USD = 'USD',
  /** Peso Uruguayo */
  UYU = 'UYU',
  /** Uzbekistan Sum */
  UZS = 'UZS',
  /** Dong */
  VND = 'VND',
  /** Vatu */
  VUV = 'VUV',
  /** Tala */
  WST = 'WST',
  /** CFA Franc BEAC */
  XAF = 'XAF',
  /** East Caribbean Dollar */
  XCD = 'XCD',
  /** CFA Franc BCEAO */
  XOF = 'XOF',
  /** CFP Franc */
  XPF = 'XPF',
  /** Yemeni Rial */
  YER = 'YER',
  /** Rand */
  ZAR = 'ZAR',
  /** Zambian Kwacha */
  ZMW = 'ZMW'
}

/** Fields for a currency fx rate */
export type CurrencyExchangeRate = {
  __typename?: 'CurrencyExchangeRate';
  /** Date of the FX rate */
  date: Scalars['DateTime']['output'];
  fromCurrency: Currency;
  /** Is the FX rate approximate or a fixed value? */
  isApproximate: Scalars['Boolean']['output'];
  /** Where does the FX rate comes from */
  source: CurrencyExchangeRateSourceType;
  toCurrency: Currency;
  /** Exchange rate value as a scalar (e.g 1.15 or 0.86) */
  value: Scalars['Float']['output'];
};

/** Fields for a currency exchange rate */
export type CurrencyExchangeRateInput = {
  /** Date of the FX rate */
  date: Scalars['DateTime']['input'];
  fromCurrency: Currency;
  /** Where does the FX rate comes from */
  source: CurrencyExchangeRateSourceType;
  toCurrency: Currency;
  /** Exchange rate value as a float (e.g 1.15 or 0.86) */
  value: Scalars['Float']['input'];
};

/** Request for a currency exchange rate */
export type CurrencyExchangeRateRequest = {
  /** Date of the exchange rate. Defaults to now. */
  date?: InputMaybe<Scalars['DateTime']['input']>;
  /** Currency to convert from */
  fromCurrency: Currency;
  /** Currency to convert to */
  toCurrency: Currency;
};

/** Where does the FX rate come from */
export enum CurrencyExchangeRateSourceType {
  /** Open Collective internal system, relying on caching and 3rd party APIs */
  OPENCOLLECTIVE = 'OPENCOLLECTIVE',
  /** PayPal API */
  PAYPAL = 'PAYPAL',
  /** User-provided exchange rate */
  USER = 'USER',
  /** Wise API */
  WISE = 'WISE'
}

/** All possible DateTime fields for a resource */
export enum DateTimeField {
  /** The creation time of a resource */
  CREATED_AT = 'CREATED_AT',
  /** Transactions only: The date when a transaction was cleared by the payment processor */
  EFFECTIVE_DATE = 'EFFECTIVE_DATE',
  /** Orders only: The date when an order was last charged, defaults to createdAt if never charged */
  LAST_CHARGED_AT = 'LAST_CHARGED_AT'
}

/** This represents a Debit transaction */
export type Debit = Transaction & {
  __typename?: 'Debit';
  /** The account on the main side of the transaction (CREDIT -> recipient, DEBIT -> sender) */
  account?: Maybe<Account>;
  amount: Amount;
  amountInHostCurrency: Amount;
  balanceInHostCurrency?: Maybe<Amount>;
  clearedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  expense?: Maybe<Expense>;
  fromAccount?: Maybe<Account>;
  /** Account that emitted the gift card used for this transaction (if any) */
  giftCardEmitterAccount?: Maybe<Account>;
  group: Scalars['String']['output'];
  host?: Maybe<Account>;
  /** Exchange rate between the currency of the transaction and the currency of the host (transaction.amount * transaction.hostCurrencyFxRate = transaction.amountInHostCurrency) */
  hostCurrencyFxRate?: Maybe<Scalars['Float']['output']>;
  hostFee: Amount;
  id: Scalars['String']['output'];
  invoiceTemplate?: Maybe<Scalars['String']['output']>;
  isDisputed?: Maybe<Scalars['Boolean']['output']>;
  isInReview?: Maybe<Scalars['Boolean']['output']>;
  isOrderRejected: Scalars['Boolean']['output'];
  isRefund?: Maybe<Scalars['Boolean']['output']>;
  isRefunded?: Maybe<Scalars['Boolean']['output']>;
  kind?: Maybe<TransactionKind>;
  legacyId: Scalars['Int']['output'];
  /** Merchant ID related to the Transaction (Stripe, PayPal, Wise, Privacy) */
  merchantId?: Maybe<Scalars['String']['output']>;
  netAmount: Amount;
  netAmountInHostCurrency: Amount;
  /** The account on the opposite side of the transaction (CREDIT -> sender, DEBIT -> recipient) */
  oppositeAccount?: Maybe<Account>;
  /** The opposite transaction (CREDIT -> DEBIT, DEBIT -> CREDIT) */
  oppositeTransaction?: Maybe<Transaction>;
  order?: Maybe<Order>;
  paymentMethod?: Maybe<PaymentMethod>;
  /** Payment Processor Fee (usually in host currency) */
  paymentProcessorFee: Amount;
  paymentProcessorUrl?: Maybe<Scalars['String']['output']>;
  payoutMethod?: Maybe<PayoutMethod>;
  /** The permissions given to current logged in user for this transaction */
  permissions: TransactionPermissions;
  platformFee: Amount;
  refundTransaction?: Maybe<Transaction>;
  relatedTransactions: Array<Maybe<Transaction>>;
  taxAmount: Amount;
  /** If a tax is set, this field will contain more info about the tax */
  taxInfo?: Maybe<TaxInfo>;
  toAccount?: Maybe<Account>;
  type: TransactionType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** @deprecated 2021-08-15: Use id instead. */
  uuid: Scalars['String']['output'];
};


/** This represents a Debit transaction */
export type DebitDescriptionArgs = {
  dynamic?: InputMaybe<Scalars['Boolean']['input']>;
  full?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This represents a Debit transaction */
export type DebitHostFeeArgs = {
  fetchHostFee?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This represents a Debit transaction */
export type DebitNetAmountArgs = {
  fetchHostFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchPaymentProcessorFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchTax?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This represents a Debit transaction */
export type DebitNetAmountInHostCurrencyArgs = {
  fetchHostFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchPaymentProcessorFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchTax?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This represents a Debit transaction */
export type DebitPaymentProcessorFeeArgs = {
  fetchPaymentProcessorFee?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This represents a Debit transaction */
export type DebitRelatedTransactionsArgs = {
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
};


/** This represents a Debit transaction */
export type DebitTaxAmountArgs = {
  fetchTax?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Which data should be copied when duplicating the account */
export type DuplicateAccountDataTypeInput = {
  admins?: Scalars['Boolean']['input'];
  events?: Scalars['Boolean']['input'];
  projects?: Scalars['Boolean']['input'];
  tiers?: Scalars['Boolean']['input'];
};

export type Expense_Author_Cannot_Approve = {
  __typename?: 'EXPENSE_AUTHOR_CANNOT_APPROVE';
  amountInCents?: Maybe<Scalars['Int']['output']>;
  appliesToHostedCollectives?: Maybe<Scalars['Boolean']['output']>;
  appliesToSingleAdminCollectives?: Maybe<Scalars['Boolean']['output']>;
  enabled?: Maybe<Scalars['Boolean']['output']>;
};

export type Expense_Categorization = {
  __typename?: 'EXPENSE_CATEGORIZATION';
  requiredForCollectiveAdmins?: Maybe<Scalars['Boolean']['output']>;
  requiredForExpenseSubmitters?: Maybe<Scalars['Boolean']['output']>;
};

export type Expense_Policies = {
  __typename?: 'EXPENSE_POLICIES';
  invoicePolicy?: Maybe<Scalars['String']['output']>;
  receiptPolicy?: Maybe<Scalars['String']['output']>;
  titlePolicy?: Maybe<Scalars['String']['output']>;
};

export type EmojiReactionResponse = {
  __typename?: 'EmojiReactionResponse';
  /** Reference to the comment corresponding to the emojis */
  comment?: Maybe<Comment>;
  /** Reference to the update corresponding to the emojis */
  update?: Maybe<Update>;
};

/** This represents an Event account */
export type Event = Account & AccountWithContributions & AccountWithHost & AccountWithParent & {
  __typename?: 'Event';
  /** [!] Warning: this query is currently in beta and the API might change */
  activeContributors: AccountCollection;
  /** List of activities that the logged-in user is subscribed for this collective */
  activitySubscriptions?: Maybe<Array<Maybe<ActivitySubscription>>>;
  /** Date of approval by the Fiscal Host. */
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  backgroundImageUrl?: Maybe<Scalars['String']['output']>;
  /** Whether this account can have changelog updates */
  canHaveChangelogUpdates: Scalars['Boolean']['output'];
  /** Returns true if the remote user can start the process to resume contributions for account */
  canStartResumeContributionsProcess: Scalars['Boolean']['output'];
  categories: Array<Maybe<Scalars['String']['output']>>;
  childrenAccounts: AccountCollection;
  /** The list of connected accounts (Stripe, Twitter, etc ...). Admin only. Scope: "connectedAccounts". */
  connectedAccounts?: Maybe<Array<Maybe<ConnectedAccount>>>;
  contributionPolicy?: Maybe<Scalars['String']['output']>;
  /** All the persons and entities that contribute to this account */
  contributors: ContributorCollection;
  conversations: ConversationCollection;
  /** Returns conversation's tags for collective sorted by popularity */
  conversationsTags?: Maybe<Array<Maybe<TagStat>>>;
  /** The time of creation */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The currency of the account */
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  /** If this account was duplicated, the accounts that were created from it */
  duplicatedAccounts: AccountCollection;
  /** If created by duplication, the account from which this one was duplicated */
  duplicatedFromAccount?: Maybe<Account>;
  /** Returns the emails of the account. Individuals only have one, but organizations can have multiple emails. */
  emails?: Maybe<Array<Scalars['EmailAddress']['output']>>;
  /** The Event end date and time */
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  /** @deprecated 2024-11-04: Please use policies.EXPENSE_POLICIES */
  expensePolicy?: Maybe<Scalars['String']['output']>;
  expenses: ExpenseCollection;
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<TagStat>>>;
  /** Describes the features enabled and available for this account */
  features: CollectiveFeatures;
  feed?: Maybe<Array<Maybe<Activity>>>;
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: Maybe<Scalars['String']['output']>;
  /** Returns true if the account has started the process to resume contributions */
  hasResumeContributionsProcessStarted: Scalars['Boolean']['output'];
  /** Returns the Fiscal Host */
  host?: Maybe<Host>;
  /** Returns agreements this account has with its host, or null if not enough permissions. */
  hostAgreements?: Maybe<AgreementCollection>;
  /** Returns the Fiscal Host application */
  hostApplication?: Maybe<HostApplication>;
  /** Host application requests */
  hostApplicationRequests: HostApplicationCollection;
  /** Fees percentage that the host takes for this collective */
  hostFeePercent?: Maybe<Scalars['Float']['output']>;
  /** Describe how the host charges the collective */
  hostFeesStructure?: Maybe<HostFeeStructure>;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Returns whether it's active: can accept financial contributions and pay expenses. */
  isActive: Scalars['Boolean']['output'];
  /** Returns true if the remote user is an admin of this account */
  isAdmin: Scalars['Boolean']['output'];
  /** Returns whether it's approved by the Fiscal Host */
  isApproved: Scalars['Boolean']['output'];
  /** Returns whether this account is archived */
  isArchived: Scalars['Boolean']['output'];
  /** Whether this account is frozen */
  isFrozen: Scalars['Boolean']['output'];
  /** Returns whether the account is setup to Host collectives. */
  isHost: Scalars['Boolean']['output'];
  /** Defines if the contributors wants to be incognito (name not displayed) */
  isIncognito: Scalars['Boolean']['output'];
  legacyId: Scalars['Int']['output'];
  /** The legal documents associated with this account */
  legalDocuments?: Maybe<Array<Maybe<LegalDocument>>>;
  /** Private, legal name. Used for expense receipts, taxes, etc. Scope: "account". */
  legalName?: Maybe<Scalars['String']['output']>;
  /** The address associated to this account. This field is always public for collectives and events. */
  location?: Maybe<Location>;
  longDescription?: Maybe<Scalars['String']['output']>;
  /** [AUTHENTICATED] Returns the pending invitations */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  memberOf: MemberOfCollection;
  /** Get all members (admins, members, backers, followers) */
  members: MemberCollection;
  /** Public name */
  name?: Maybe<Scalars['String']['output']>;
  /** The list of applications created by this account. Admin only. Scope: "applications". */
  oAuthApplications?: Maybe<OAuthApplicationCollection>;
  orders: OrderCollection;
  /** The Account parenting this account */
  parent?: Maybe<Account>;
  /** @deprecated 2022-12-16: use parent on AccountWithParent instead */
  parentAccount?: Maybe<Account>;
  /** The list of payment methods that this collective can use to pay for Orders. Admin or Host only. Scope: "orders". */
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payment methods for this account that are pending a client confirmation (3D Secure / SCA) */
  paymentMethodsWithPendingConfirmation?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payout methods that this collective can use to get paid. In most cases, admin only and scope: "expenses". */
  payoutMethods?: Maybe<Array<Maybe<PayoutMethod>>>;
  /** Logged-in user permissions on an account */
  permissions: AccountPermissions;
  /** Returns true if a custom contribution to Open Collective can be submitted for contributions made to this account */
  platformContributionAvailable: Scalars['Boolean']['output'];
  /** How much platform fees are charged for this account */
  platformFeePercent: Scalars['Float']['output'];
  /** Policies for the account. To see non-public policies you need to be admin and have the scope: "account". */
  policies: Policies;
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  settings: Scalars['JSON']['output'];
  /** The slug identifying the account (ie: babel) */
  slug: Scalars['String']['output'];
  socialLinks: Array<SocialLink>;
  /** The Event start date and time */
  startsAt?: Maybe<Scalars['DateTime']['output']>;
  stats?: Maybe<AccountStats>;
  summary?: Maybe<HostedAccountSummary>;
  /** The list of expense types supported by this account */
  supportedExpenseTypes: Array<ExpenseType>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tiers: TierCollection;
  /** Timezone of the Event (TZ database format, e.g. UTC or Europe/Berlin) */
  timezone?: Maybe<Scalars['String']['output']>;
  /** Number of unique financial contributors. */
  totalFinancialContributors: Scalars['Int']['output'];
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  transactionReports?: Maybe<TransactionReports>;
  transactions: TransactionCollection;
  transferwise?: Maybe<TransferWise>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  twitterHandle?: Maybe<Scalars['String']['output']>;
  type: AccountType;
  /** Date when the collective was last unfrozen by current Fiscal Host */
  unfrozenAt?: Maybe<Scalars['DateTime']['output']>;
  /** Date of unhosting by a given Fiscal Host. */
  unhostedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Updates published by the account. To see unpublished updates, you need to be an admin and have the scope "updates". */
  updates: UpdateCollection;
  /** Virtual Cards Merchants used by the account. Admin only. Scope: "virtualCards". */
  virtualCardMerchants?: Maybe<AccountCollection>;
  /** Virtual Cards attached to the account. Admin only. Scope: "virtualCards". */
  virtualCards?: Maybe<VirtualCardCollection>;
  webhooks: WebhookCollection;
  /** @deprecated 2023-01-16: Please use socialLinks */
  website?: Maybe<Scalars['String']['output']>;
};


/** This represents an Event account */
export type EventActiveContributorsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeActiveRecurringContributions?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Event account */
export type EventActivitySubscriptionsArgs = {
  channel?: InputMaybe<ActivityChannel>;
};


/** This represents an Event account */
export type EventBackgroundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Event account */
export type EventChildrenAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Event account */
export type EventContributorsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  roles?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Event account */
export type EventConversationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Event account */
export type EventConversationsTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Event account */
export type EventDuplicatedAccountsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Event account */
export type EventExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<ExpenseDirection>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Event account */
export type EventExpensesTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Event account */
export type EventFeedArgs = {
  classes?: InputMaybe<Array<InputMaybe<ActivityClassType>>>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Event account */
export type EventHostAgreementsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Event account */
export type EventHostApplicationRequestsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<HostApplicationStatus>;
};


/** This represents an Event account */
export type EventHostFeePercentArgs = {
  paymentMethodService?: InputMaybe<PaymentMethodService>;
  paymentMethodType?: InputMaybe<PaymentMethodType>;
};


/** This represents an Event account */
export type EventImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Event account */
export type EventLegalDocumentsArgs = {
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents an Event account */
export type EventMemberInvitationsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  memberAccount?: InputMaybe<AccountReferenceInput>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Event account */
export type EventMemberOfArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  hostFeesStructure?: InputMaybe<HostFeeStructure>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isHostAccount?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: OrderByInput;
  orderByRoles?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Event account */
export type EventMembersArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Event account */
export type EventOAuthApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Event account */
export type EventOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Event account */
export type EventPaymentMethodsArgs = {
  enumType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  includeExpired?: InputMaybe<Scalars['Boolean']['input']>;
  service?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  type?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
};


/** This represents an Event account */
export type EventSummaryArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
};


/** This represents an Event account */
export type EventTiersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Event account */
export type EventTotalFinancialContributorsArgs = {
  accountType?: InputMaybe<AccountType>;
};


/** This represents an Event account */
export type EventTransactionGroupsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** This represents an Event account */
export type EventTransactionReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Event account */
export type EventTransactionsArgs = {
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Event account */
export type EventUnhostedAtArgs = {
  host: AccountReferenceInput;
};


/** This represents an Event account */
export type EventUpdatesArgs = {
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublishedUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Event account */
export type EventVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Event account */
export type EventVirtualCardsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
};


/** This represents an Event account */
export type EventWebhooksArgs = {
  account: AccountReferenceInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type EventCreateInput = {
  /** The profile background image, for the banner and social media sharing */
  backgroundImage?: InputMaybe<Scalars['Upload']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  /** The Event end date and time */
  endsAt: Scalars['DateTime']['input'];
  /** The profile avatar image */
  image?: InputMaybe<Scalars['Upload']['input']>;
  name: Scalars['String']['input'];
  settings?: InputMaybe<Scalars['JSON']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  /** The Event start date and time */
  startsAt: Scalars['DateTime']['input'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Timezone of the Event (TZ database format, e.g. UTC or Europe/Berlin) */
  timezone: Scalars['String']['input'];
};

/** Expected funds filter (ALL_EXPECTED_FUNDS, ONLY_PENDING, ONLY_MANUAL) */
export enum ExpectedFundsFilter {
  ALL_EXPECTED_FUNDS = 'ALL_EXPECTED_FUNDS',
  ONLY_MANUAL = 'ONLY_MANUAL',
  ONLY_PENDING = 'ONLY_PENDING'
}

/** This represents an Expense */
export type Expense = {
  __typename?: 'Expense';
  /** The account where the expense was submitted */
  account: Account;
  /**
   * The exchange rate between the expense currency and the account currency
   * @deprecated 2022-02-09: Please use amountV2
   */
  accountCurrencyFxRate: Scalars['Float']['output'];
  /** The accounting category attached to this expense */
  accountingCategory?: Maybe<AccountingCategory>;
  /** The list of activities (ie. approved, edited, etc) for this expense ordered by date ascending */
  activities: Array<Activity>;
  /**
   * Total amount of the expense (sum of the item's amounts).
   * @deprecated 2022-02-09: Please use amountV2
   */
  amount: Scalars['Int']['output'];
  /** Total amount of the expense */
  amountV2?: Maybe<Amount>;
  /** The accounts who approved this expense */
  approvedBy: Array<Maybe<Account>>;
  /** (Optional) files attached to the expense */
  attachedFiles?: Maybe<Array<ExpenseAttachedFile>>;
  /** Returns the list of comments for this expense, or `null` if user is not allowed to see them */
  comments?: Maybe<CommentCollection>;
  /** The time of creation */
  createdAt: Scalars['DateTime']['output'];
  /** The account who created this expense */
  createdByAccount?: Maybe<Account>;
  /** Currency that should be used for the payout */
  currency: Currency;
  /** Custom data for this expense */
  customData?: Maybe<Scalars['JSON']['output']>;
  /** Title/main description for this expense */
  description: Scalars['String']['output'];
  /** Drafted field values that were still not persisted */
  draft?: Maybe<Scalars['JSON']['output']>;
  /** [Host Admin only] Key to access the draft of this expense */
  draftKey?: Maybe<Scalars['String']['output']>;
  /** The fees payer for this expense */
  feesPayer: FeesPayer;
  /** The account from where the expense was paid */
  host?: Maybe<Host>;
  id: Scalars['String']['output'];
  /** Information to display on the invoice. Only visible to user and admins. */
  invoiceInfo?: Maybe<Scalars['String']['output']>;
  items?: Maybe<Array<Maybe<ExpenseItem>>>;
  /** Legacy ID as returned by API V1. Avoid relying on this field as it may be removed in the future. */
  legacyId: Scalars['Int']['output'];
  /** Returns the list of legal documents attached to this expense. Must be logged in as a host admin. */
  legalDocuments?: Maybe<LegalDocumentCollection>;
  /** Fields that cannot be edited on this expense */
  lockedFields?: Maybe<Array<Maybe<ExpenseLockableFields>>>;
  /** Longer description for this expense */
  longDescription?: Maybe<Scalars['String']['output']>;
  /** The merchant ID for this expense */
  merchantId?: Maybe<Scalars['String']['output']>;
  /** Whether this expense is on hold */
  onHold?: Maybe<Scalars['Boolean']['output']>;
  /** The account who paid this expense */
  paidBy?: Maybe<Account>;
  /** The account being paid by this expense */
  payee: Account;
  /** The address of the payee */
  payeeLocation?: Maybe<Location>;
  paymentMethod?: Maybe<PaymentMethod>;
  /** The payout method to use for this expense */
  payoutMethod?: Maybe<PayoutMethod>;
  /** The permissions given to current logged in user for this expense */
  permissions: ExpensePermissions;
  /** Additional information about the payment as HTML. Only visible to user and admins. */
  privateMessage?: Maybe<Scalars['String']['output']>;
  quote?: Maybe<ExpenseQuote>;
  recurringExpense?: Maybe<RecurringExpense>;
  /** User-provided reference number or any other identifier that references the invoice */
  reference?: Maybe<Scalars['String']['output']>;
  /** The account that requested this expense to be submitted */
  requestedByAccount?: Maybe<Account>;
  /** Returns the list of legal documents required from the payee before the expense can be payed. Must be logged in. */
  requiredLegalDocuments?: Maybe<Array<Maybe<LegalDocumentType>>>;
  /** [Admin only] Security checks for this expense. Only available to expenses under trusted hosts. */
  securityChecks?: Maybe<Array<Maybe<SecurityCheck>>>;
  /** The state of the expense (pending, approved, paid, rejected...etc) */
  status: ExpenseStatus;
  tags: Array<Maybe<Scalars['String']['output']>>;
  /** Taxes applied to this expense */
  taxes: Array<Maybe<TaxInfo>>;
  /** The reference text used in the payment transfer */
  transferReference?: Maybe<Scalars['String']['output']>;
  /** Whether this expense is a receipt or an invoice */
  type: ExpenseType;
  validateTransferRequirements?: Maybe<Array<Maybe<TransferWiseRequiredField>>>;
  /** If available, this field will contain a breakdown of the expense values depending on who edited it */
  valuesByRole?: Maybe<ExpenseValuesByRole>;
  /** The virtual card used to pay for this charge */
  virtualCard?: Maybe<VirtualCard>;
};


/** This represents an Expense */
export type ExpenseAmountV2Args = {
  currencySource?: InputMaybe<ExpenseCurrencySource>;
};


/** This represents an Expense */
export type ExpenseCommentsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
};


/** This represents an Expense */
export type ExpenseLegalDocumentsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<Array<InputMaybe<LegalDocumentRequestStatus>>>;
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents an Expense */
export type ExpenseValidateTransferRequirementsArgs = {
  details?: InputMaybe<Scalars['JSON']['input']>;
};

/** Fields for an expense's attached file */
export type ExpenseAttachedFile = {
  __typename?: 'ExpenseAttachedFile';
  /** Unique identifier for this file */
  id: Scalars['String']['output'];
  /** The file info associated with this item (if any) */
  info?: Maybe<FileInfo>;
  /**
   * The original filename
   * @deprecated 2023-01-23: We're moving this field to "file.name"
   */
  name?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['URL']['output']>;
};

export type ExpenseAttachedFileInput = {
  /** ID of the file */
  id?: InputMaybe<Scalars['String']['input']>;
  /**
   * Original filename
   * @deprecated 2023-02-02: This must now be provided when uploading the file. This parameter will be ignored.
   */
  name?: InputMaybe<Scalars['String']['input']>;
  /** URL of the file */
  url: Scalars['URL']['input'];
};

/** A collection of "Expenses" */
export type ExpenseCollection = Collection & {
  __typename?: 'ExpenseCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Expense>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalAmount?: Maybe<ExpenseCollectionTotalAmount>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ExpenseCollectionTotalAmount = {
  __typename?: 'ExpenseCollectionTotalAmount';
  amount?: Maybe<Amount>;
  amountsByCurrency?: Maybe<Array<Maybe<Amount>>>;
};


export type ExpenseCollectionTotalAmountAmountArgs = {
  currency?: InputMaybe<Currency>;
};

export type ExpenseCreateInput = {
  /** The accounting category this expense belongs to */
  accountingCategory?: InputMaybe<AccountingCategoryReferenceInput>;
  /** (Optional) A list of files that you want to attach to this expense */
  attachedFiles?: InputMaybe<Array<ExpenseAttachedFileInput>>;
  /** Currency that should be used for the payout. Defaults to the account currency */
  currency?: InputMaybe<Currency>;
  /** Custom data to be stored in the expense */
  customData?: InputMaybe<Scalars['JSON']['input']>;
  /** Main title of the expense */
  description: Scalars['String']['input'];
  /** Custom information to print on the invoice */
  invoiceInfo?: InputMaybe<Scalars['String']['input']>;
  /** The list of items for this expense. Total amount will be computed from them. */
  items?: InputMaybe<Array<InputMaybe<ExpenseItemCreateInput>>>;
  /** Longer text to attach to the expense */
  longDescription?: InputMaybe<Scalars['String']['input']>;
  /** Account to reimburse */
  payee: AccountReferenceInput;
  /** The address of the payee */
  payeeLocation?: InputMaybe<LocationInput>;
  /** The payout method that will be used to reimburse the expense */
  payoutMethod: PayoutMethodInput;
  /** A private note that will be attached to your invoice, as HTML. Only visible to the payee and the collective/host admins. */
  privateMessage?: InputMaybe<Scalars['String']['input']>;
  /** User-provided reference number or any other identifier that references the invoice */
  reference?: InputMaybe<Scalars['String']['input']>;
  /** Tags associated to the expense (ie. Food, Engineering...) */
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** The list of taxes that should be applied to the expense (VAT, GST, etc...) */
  tax?: InputMaybe<Array<InputMaybe<ExpenseTaxInput>>>;
  /** The type of the expense */
  type: ExpenseType;
};

/** All supported expense currency sources */
export enum ExpenseCurrencySource {
  /** The expense currency expressed as the account currency */
  ACCOUNT = 'ACCOUNT',
  /** The expense currency expressed as the expense currency */
  CREATED_BY_ACCOUNT = 'CREATED_BY_ACCOUNT',
  /** The expense currency expressed as the expense currency */
  EXPENSE = 'EXPENSE',
  /** The expense currency expressed as the host currency */
  HOST = 'HOST'
}

/** Describes the role in which an account is involved in an expense. This is used to filter */
export enum ExpenseDirection {
  /** Received: The account is the one who received the expense and the one who's paying for it. */
  RECEIVED = 'RECEIVED',
  /** Submitted: The account is the one who submitted the expense and possibly the beneficiary. */
  SUBMITTED = 'SUBMITTED'
}

export type ExpenseInviteDraftInput = {
  /** The accounting category this expense belongs to */
  accountingCategory?: InputMaybe<AccountingCategoryReferenceInput>;
  /** (Optional) A list of files that you want to attach to this expense */
  attachedFiles?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  /** Currency that should be used for the payout. Defaults to the account currency */
  currency?: InputMaybe<Currency>;
  /** Custom data to be stored in the expense */
  customData?: InputMaybe<Scalars['JSON']['input']>;
  /** Main title of the expense */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Custom information to print on the invoice */
  invoiceInfo?: InputMaybe<Scalars['String']['input']>;
  /** The list of items for this expense. Total amount will be computed from them. */
  items?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  /** Longer text to attach to the expense */
  longDescription?: InputMaybe<Scalars['String']['input']>;
  /** Account to reimburse */
  payee: ExpenseInvitee;
  /** The address of the payee */
  payeeLocation?: InputMaybe<LocationInput>;
  /** The payout method that will be used to reimburse the expense */
  payoutMethod?: InputMaybe<PayoutMethodInput>;
  /** A private note that will be attached to your invoice, as HTML. Only visible to the payee and the collective/host admins. */
  privateMessage?: InputMaybe<Scalars['String']['input']>;
  /** Note to be sent to the invited user through email. */
  recipientNote?: InputMaybe<Scalars['String']['input']>;
  /** User-provided reference number or any other identifier that references the invoice */
  reference?: InputMaybe<Scalars['String']['input']>;
  /** Tags associated to the expense (ie. Food, Engineering...) */
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** The list of taxes that should be applied to the expense (VAT, GST, etc...) */
  tax?: InputMaybe<Array<InputMaybe<ExpenseTaxInput>>>;
  /** The type of the expense */
  type: ExpenseType;
};

export type ExpenseInvitee = {
  email?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated 2023-04-12: Please use legacyId */
  id?: InputMaybe<Scalars['Int']['input']>;
  isInvite?: InputMaybe<Scalars['Boolean']['input']>;
  legacyId?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<ExpenseInviteeOrganizationInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type ExpenseInviteeOrganizationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** Fields for an expense item */
export type ExpenseItem = {
  __typename?: 'ExpenseItem';
  /**
   * Amount of this item
   * @deprecated Please use `amountV2`
   */
  amount: Scalars['Int']['output'];
  /** Amount of this item */
  amountV2: Amount;
  /** The date on which the item was created */
  createdAt: Scalars['DateTime']['output'];
  /** A description for this item. Enforced for new items, but old expenses may not have one. */
  description?: Maybe<Scalars['String']['output']>;
  /** The file associated with this item (if any) */
  file?: Maybe<FileInfo>;
  /** Unique identifier for this expense item */
  id: Scalars['String']['output'];
  /** The date on which the expense took place */
  incurredAt: Scalars['DateTime']['output'];
  /** If the item currency is different than the expense currency, this field will expose the average exchange rate for this date as recorded by Open Collective. Used to decide whether the value in `amountV2.exchangeRate` looks correct. */
  referenceExchangeRate?: Maybe<CurrencyExchangeRate>;
  /** The date on which the item was last updated */
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['URL']['output']>;
};

export type ExpenseItemCreateInput = {
  /**
   * Amount in cents
   * @deprecated Please use `amountV2`
   */
  amount?: InputMaybe<Scalars['Int']['input']>;
  /** Amount */
  amountV2?: InputMaybe<AmountInput>;
  /** What is this item about? */
  description: Scalars['String']['input'];
  /** When was the money spent? */
  incurredAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** URL of the file linked to this item. Must be provided if the expense type is RECEIPT. */
  url?: InputMaybe<Scalars['URL']['input']>;
};

export type ExpenseItemInput = {
  /**
   * Amount in cents
   * @deprecated Please use `amountV2`
   */
  amount?: InputMaybe<Scalars['Int']['input']>;
  /** Amount */
  amountV2?: InputMaybe<AmountInput>;
  /** What is this item about? */
  description?: InputMaybe<Scalars['String']['input']>;
  /** ID of the item */
  id?: InputMaybe<Scalars['String']['input']>;
  /** When was the money spent? */
  incurredAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** URL of the file linked to this item. Must be provided if the expense type is RECEIPT. */
  url?: InputMaybe<Scalars['URL']['input']>;
};

export type ExpenseItemParsedFileInfo = {
  __typename?: 'ExpenseItemParsedFileInfo';
  amount?: Maybe<Amount>;
  description?: Maybe<Scalars['String']['output']>;
  incurredAt?: Maybe<Scalars['Date']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

/** All fields that can be locked on an expense draft */
export enum ExpenseLockableFields {
  /** Locks items' amount and currency, and it also blocks the hability to add new items. */
  AMOUNT = 'AMOUNT',
  /** Locks the description field. */
  DESCRIPTION = 'DESCRIPTION',
  /** Locks the payee field, if the user is not on the platform it locks its email. */
  PAYEE = 'PAYEE',
  /** Locks the type field. */
  TYPE = 'TYPE'
}

export type ExpenseParsedFileInfo = {
  __typename?: 'ExpenseParsedFileInfo';
  amount?: Maybe<Amount>;
  confidence?: Maybe<Scalars['StrictPercentage']['output']>;
  date?: Maybe<Scalars['Date']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  items: Array<ExpenseItemParsedFileInfo>;
};

/** Fields for the user permissions on an expense */
export type ExpensePermissions = {
  __typename?: 'ExpensePermissions';
  approve: Permission;
  /** Whether the current user can approve this expense */
  canApprove: Scalars['Boolean']['output'];
  /** Whether the current user can comment and see comments for this expense */
  canComment: Scalars['Boolean']['output'];
  /** Whether the user or the given draft key is allowed decline the expense invite */
  canDeclineExpenseInvite: Scalars['Boolean']['output'];
  /** Whether the current user can edit the expense */
  canDelete: Scalars['Boolean']['output'];
  canDownloadTaxForm: Scalars['Boolean']['output'];
  /** Whether the current user can edit the expense */
  canEdit: Scalars['Boolean']['output'];
  /** Whether the current user can edit the expense accounting category */
  canEditAccountingCategory: Scalars['Boolean']['output'];
  /** Tags permissions are a bit different, and can be edited by admins even if the expense has already been paid */
  canEditTags: Scalars['Boolean']['output'];
  canHold: Scalars['Boolean']['output'];
  /** Whether the current user can mark this expense as incomplete */
  canMarkAsIncomplete: Scalars['Boolean']['output'];
  /** Whether the current user can mark this expense as spam */
  canMarkAsSpam: Scalars['Boolean']['output'];
  /** Whether the current user can mark this expense as unpaid */
  canMarkAsUnpaid: Scalars['Boolean']['output'];
  /** Whether the current user can trigger the payment for this expense */
  canPay: Scalars['Boolean']['output'];
  /** Whether the current user can reject this expense */
  canReject: Scalars['Boolean']['output'];
  canRelease: Scalars['Boolean']['output'];
  /** Whether the current user can the the invoice info for this expense */
  canSeeInvoiceInfo: Scalars['Boolean']['output'];
  /** Whether the current user can see the private details of the payout method of this expense */
  canSeePayoutMethodPrivateDetails: Scalars['Boolean']['output'];
  /** Whether the current user can unapprove this expense */
  canUnapprove: Scalars['Boolean']['output'];
  /** Whether the current user can unschedule this expense payment */
  canUnschedulePayment: Scalars['Boolean']['output'];
  canUsePrivateNote: Scalars['Boolean']['output'];
  /** Whether the current user can verify this draft expense */
  canVerifyDraftExpense: Scalars['Boolean']['output'];
  comment: Permission;
  delete: Permission;
  downloadTaxForm: Permission;
  edit: Permission;
  /** Whether the current user can edit the expense accounting category */
  editAccountingCategory: Scalars['Boolean']['output'];
  editTags: Permission;
  hold: Permission;
  id: Scalars['String']['output'];
  markAsSpam: Permission;
  markAsUnpaid: Permission;
  pay: Permission;
  reject: Permission;
  release: Permission;
  seeInvoiceInfo: Permission;
  unapprove: Permission;
  unschedulePayment: Permission;
  usePrivateNote: Permission;
  verifyDraftExpense: Permission;
};


/** Fields for the user permissions on an expense */
export type ExpensePermissionsCanDeclineExpenseInviteArgs = {
  draftKey?: InputMaybe<Scalars['String']['input']>;
};

/** All supported expense types */
export enum ExpenseProcessAction {
  /** To mark the expense as approved */
  APPROVE = 'APPROVE',
  /** To decline an invited expense */
  DECLINE_INVITED_EXPENSE = 'DECLINE_INVITED_EXPENSE',
  /** To put the expense on hold */
  HOLD = 'HOLD',
  /** To mark the expense as incomplete and notify the payee it requires more information */
  MARK_AS_INCOMPLETE = 'MARK_AS_INCOMPLETE',
  /** To mark the expense as spam */
  MARK_AS_SPAM = 'MARK_AS_SPAM',
  /** To mark the expense as unpaid (marks the transaction as refunded) */
  MARK_AS_UNPAID = 'MARK_AS_UNPAID',
  /** To trigger the payment */
  PAY = 'PAY',
  /** To mark the expense as rejected */
  REJECT = 'REJECT',
  /** To release the expense from hold */
  RELEASE = 'RELEASE',
  /** To request re-approval of the expense, marking it as pending. */
  REQUEST_RE_APPROVAL = 'REQUEST_RE_APPROVAL',
  /** To schedule the expense for payment */
  SCHEDULE_FOR_PAYMENT = 'SCHEDULE_FOR_PAYMENT',
  /** To mark the expense as pending after it has been approved */
  UNAPPROVE = 'UNAPPROVE',
  /** To unschedule the expense payment */
  UNSCHEDULE_PAYMENT = 'UNSCHEDULE_PAYMENT'
}

/** Fields for an expense quote */
export type ExpenseQuote = {
  __typename?: 'ExpenseQuote';
  /** The date on which the item was created */
  estimatedDeliveryAt?: Maybe<Scalars['DateTime']['output']>;
  /** Amount of payment processor fee */
  paymentProcessorFeeAmount: Amount;
  /** Amount of this item */
  sourceAmount: Amount;
};

export type ExpenseReferenceInput = {
  /** The public id identifying the expense (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The internal id of the expense (ie: 580) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** Expense statistics related to the given accounts */
export type ExpenseStats = {
  __typename?: 'ExpenseStats';
  /** The daily average paid in expenses */
  dailyAverageAmount: Amount;
  /** The total number of expenses */
  expensesCount: Scalars['Int']['output'];
  /** Number of grants */
  grantsCount: Scalars['Int']['output'];
  /** Number of invoices */
  invoicesCount: Scalars['Int']['output'];
  /** Number of reimbursements */
  reimbursementsCount: Scalars['Int']['output'];
};

export enum ExpenseStatus {
  APPROVED = 'APPROVED',
  CANCELED = 'CANCELED',
  DRAFT = 'DRAFT',
  ERROR = 'ERROR',
  INCOMPLETE = 'INCOMPLETE',
  INVITE_DECLINED = 'INVITE_DECLINED',
  PAID = 'PAID',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  REJECTED = 'REJECTED',
  SCHEDULED_FOR_PAYMENT = 'SCHEDULED_FOR_PAYMENT',
  SPAM = 'SPAM',
  UNVERIFIED = 'UNVERIFIED'
}

/** Describes the values allowed to filter expenses, namely all the expense statuses and the special "READY_TO_PAY" value. */
export enum ExpenseStatusFilter {
  APPROVED = 'APPROVED',
  CANCELED = 'CANCELED',
  DRAFT = 'DRAFT',
  ERROR = 'ERROR',
  INCOMPLETE = 'INCOMPLETE',
  INVITE_DECLINED = 'INVITE_DECLINED',
  /** Only expenses that are on hold */
  ON_HOLD = 'ON_HOLD',
  PAID = 'PAID',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  /** Only expenses that are ready to be paid (must be approved, have the sufficiant balance and have the tax forms completed) */
  READY_TO_PAY = 'READY_TO_PAY',
  REJECTED = 'REJECTED',
  SCHEDULED_FOR_PAYMENT = 'SCHEDULED_FOR_PAYMENT',
  SPAM = 'SPAM',
  UNVERIFIED = 'UNVERIFIED'
}

/** Input to set taxes for an expense */
export type ExpenseTaxInput = {
  /** Tax identification number, if any */
  idNumber?: InputMaybe<Scalars['String']['input']>;
  /** Tax rate as a float number between 0 and 1 */
  rate: Scalars['Float']['input'];
  type: TaxType;
};

/** All supported expense types */
export enum ExpenseType {
  /** Credit Card Charge: Payment done using an issued (virtual) credit card issued by your Fiscal Host. */
  CHARGE = 'CHARGE',
  /** Funding Request: Request funding for a project or initiative. */
  FUNDING_REQUEST = 'FUNDING_REQUEST',
  /** Grant: Request funding for a project or initiative. */
  GRANT = 'GRANT',
  /** Invoice: Charge for your time or get paid in advance. */
  INVOICE = 'INVOICE',
  /** Receipt: Get paid back for a purchase already made. */
  RECEIPT = 'RECEIPT',
  /** Settlement: expense generated by Open Collective to collect money owed by Fiscal Hosts. */
  SETTLEMENT = 'SETTLEMENT',
  /** Unclassified expense */
  UNCLASSIFIED = 'UNCLASSIFIED'
}

export type ExpenseUpdateInput = {
  /** The accounting category this expense belongs to */
  accountingCategory?: InputMaybe<AccountingCategoryReferenceInput>;
  /** (Optional) A list of files that you want to attach to this expense */
  attachedFiles?: InputMaybe<Array<ExpenseAttachedFileInput>>;
  /** @deprecated 2020-04-08: Please use the items field - The list of items for this expense. Total amount will be computed from them. */
  attachments?: InputMaybe<Array<InputMaybe<ExpenseItemInput>>>;
  /** Currency that should be used for the payout. Defaults to the account currency */
  currency?: InputMaybe<Currency>;
  /** Custom data to be stored in the expense */
  customData?: InputMaybe<Scalars['JSON']['input']>;
  /** Main title of the expense */
  description?: InputMaybe<Scalars['String']['input']>;
  /** ID of the expense that you are trying to edit */
  id: Scalars['String']['input'];
  /** Tax ID, VAT number...etc This information will be printed on your invoice. */
  invoiceInfo?: InputMaybe<Scalars['String']['input']>;
  /** The list of items for this expense. Total amount will be computed from them. */
  items?: InputMaybe<Array<InputMaybe<ExpenseItemInput>>>;
  /** Longer text to attach to the expense */
  longDescription?: InputMaybe<Scalars['String']['input']>;
  /** Account to reimburse */
  payee?: InputMaybe<NewAccountOrReferenceInput>;
  /** The address of the payee */
  payeeLocation?: InputMaybe<LocationInput>;
  /** The payout method that will be used to reimburse the expense */
  payoutMethod?: InputMaybe<PayoutMethodInput>;
  /** A private note that will be attached to your invoice, as HTML */
  privateMessage?: InputMaybe<Scalars['String']['input']>;
  /** User-provided reference number or any other identifier that references the invoice */
  reference?: InputMaybe<Scalars['String']['input']>;
  /** Tags associated to the expense (ie. Food, Engineering...) */
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** The list of taxes that should be applied to the expense (VAT, GST, etc...) */
  tax?: InputMaybe<Array<InputMaybe<ExpenseTaxInput>>>;
  /** The type of the expense */
  type?: InputMaybe<ExpenseType>;
};

export type ExpenseValuesByRole = {
  __typename?: 'ExpenseValuesByRole';
  /** The values provided by the account admin(s) */
  accountAdmin?: Maybe<ExpenseValuesRoleDetails>;
  /** The values provided by the host admin(s) */
  hostAdmin?: Maybe<ExpenseValuesRoleDetails>;
  id: Scalars['NonEmptyString']['output'];
  /** The values provided by the expense submitter(s) */
  submitter?: Maybe<ExpenseValuesRoleDetails>;
};

export type ExpenseValuesRoleDetails = {
  __typename?: 'ExpenseValuesRoleDetails';
  accountingCategory?: Maybe<AccountingCategory>;
};

/** All supported expense types */
export enum FeesPayer {
  /** The collective will be responsible for paying the fees */
  COLLECTIVE = 'COLLECTIVE',
  /** The payee will be responsible for paying the fees (they'll be deduced from the total amount) */
  PAYEE = 'PAYEE'
}

/** Exposes information about an uploaded file (image, pdf, etc.) */
export type FileInfo = {
  /** Unique identifier for the file */
  id: Scalars['String']['output'];
  /** Name of the file */
  name?: Maybe<Scalars['String']['output']>;
  /** Size of the file in bytes */
  size?: Maybe<Scalars['Int']['output']>;
  /** Mime type of the file */
  type: Scalars['String']['output'];
  /** URL to access the file */
  url: Scalars['URL']['output'];
};

export type FollowAccountResult = {
  __typename?: 'FollowAccountResult';
  individual: Individual;
  member: Member;
};

/** This represents an Project account */
export type Fund = Account & AccountWithContributions & AccountWithHost & {
  __typename?: 'Fund';
  /** [!] Warning: this query is currently in beta and the API might change */
  activeContributors: AccountCollection;
  /** List of activities that the logged-in user is subscribed for this collective */
  activitySubscriptions?: Maybe<Array<Maybe<ActivitySubscription>>>;
  /** Date of approval by the Fiscal Host. */
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  backgroundImageUrl?: Maybe<Scalars['String']['output']>;
  /** Whether this account can have changelog updates */
  canHaveChangelogUpdates: Scalars['Boolean']['output'];
  /** Returns true if the remote user can start the process to resume contributions for account */
  canStartResumeContributionsProcess: Scalars['Boolean']['output'];
  categories: Array<Maybe<Scalars['String']['output']>>;
  childrenAccounts: AccountCollection;
  /** The list of connected accounts (Stripe, Twitter, etc ...). Admin only. Scope: "connectedAccounts". */
  connectedAccounts?: Maybe<Array<Maybe<ConnectedAccount>>>;
  contributionPolicy?: Maybe<Scalars['String']['output']>;
  /** All the persons and entities that contribute to this account */
  contributors: ContributorCollection;
  conversations: ConversationCollection;
  /** Returns conversation's tags for collective sorted by popularity */
  conversationsTags?: Maybe<Array<Maybe<TagStat>>>;
  /** The time of creation */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The currency of the account */
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  /** If this account was duplicated, the accounts that were created from it */
  duplicatedAccounts: AccountCollection;
  /** If created by duplication, the account from which this one was duplicated */
  duplicatedFromAccount?: Maybe<Account>;
  /** Returns the emails of the account. Individuals only have one, but organizations can have multiple emails. */
  emails?: Maybe<Array<Scalars['EmailAddress']['output']>>;
  /** @deprecated 2024-11-04: Please use policies.EXPENSE_POLICIES */
  expensePolicy?: Maybe<Scalars['String']['output']>;
  expenses: ExpenseCollection;
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<TagStat>>>;
  /** Describes the features enabled and available for this account */
  features: CollectiveFeatures;
  feed?: Maybe<Array<Maybe<Activity>>>;
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: Maybe<Scalars['String']['output']>;
  /** Returns true if the account has started the process to resume contributions */
  hasResumeContributionsProcessStarted: Scalars['Boolean']['output'];
  /** Returns the Fiscal Host */
  host?: Maybe<Host>;
  /** Returns agreements this account has with its host, or null if not enough permissions. */
  hostAgreements?: Maybe<AgreementCollection>;
  /** Returns the Fiscal Host application */
  hostApplication?: Maybe<HostApplication>;
  /** Host application requests */
  hostApplicationRequests: HostApplicationCollection;
  /** Fees percentage that the host takes for this collective */
  hostFeePercent?: Maybe<Scalars['Float']['output']>;
  /** Describe how the host charges the collective */
  hostFeesStructure?: Maybe<HostFeeStructure>;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Returns whether it's active: can accept financial contributions and pay expenses. */
  isActive: Scalars['Boolean']['output'];
  /** Returns true if the remote user is an admin of this account */
  isAdmin: Scalars['Boolean']['output'];
  /** Returns whether it's approved by the Fiscal Host */
  isApproved: Scalars['Boolean']['output'];
  /** Returns whether this account is archived */
  isArchived: Scalars['Boolean']['output'];
  /** Whether this account is frozen */
  isFrozen: Scalars['Boolean']['output'];
  /** Returns whether the account is setup to Host collectives. */
  isHost: Scalars['Boolean']['output'];
  /** Defines if the contributors wants to be incognito (name not displayed) */
  isIncognito: Scalars['Boolean']['output'];
  legacyId: Scalars['Int']['output'];
  /** The legal documents associated with this account */
  legalDocuments?: Maybe<Array<Maybe<LegalDocument>>>;
  /** Private, legal name. Used for expense receipts, taxes, etc. Scope: "account". */
  legalName?: Maybe<Scalars['String']['output']>;
  /** The address associated to this account. This field is always public for collectives and events. */
  location?: Maybe<Location>;
  longDescription?: Maybe<Scalars['String']['output']>;
  /** [AUTHENTICATED] Returns the pending invitations */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  memberOf: MemberOfCollection;
  /** Get all members (admins, members, backers, followers) */
  members: MemberCollection;
  /** Public name */
  name?: Maybe<Scalars['String']['output']>;
  /** The list of applications created by this account. Admin only. Scope: "applications". */
  oAuthApplications?: Maybe<OAuthApplicationCollection>;
  orders: OrderCollection;
  /** @deprecated 2022-12-16: use parent on AccountWithParent instead */
  parentAccount?: Maybe<Account>;
  /** The list of payment methods that this collective can use to pay for Orders. Admin or Host only. Scope: "orders". */
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payment methods for this account that are pending a client confirmation (3D Secure / SCA) */
  paymentMethodsWithPendingConfirmation?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payout methods that this collective can use to get paid. In most cases, admin only and scope: "expenses". */
  payoutMethods?: Maybe<Array<Maybe<PayoutMethod>>>;
  /** Logged-in user permissions on an account */
  permissions: AccountPermissions;
  /** Returns true if a custom contribution to Open Collective can be submitted for contributions made to this account */
  platformContributionAvailable: Scalars['Boolean']['output'];
  /** How much platform fees are charged for this account */
  platformFeePercent: Scalars['Float']['output'];
  /** Policies for the account. To see non-public policies you need to be admin and have the scope: "account". */
  policies: Policies;
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  settings: Scalars['JSON']['output'];
  /** The slug identifying the account (ie: babel) */
  slug: Scalars['String']['output'];
  socialLinks: Array<SocialLink>;
  stats?: Maybe<AccountStats>;
  summary?: Maybe<HostedAccountSummary>;
  /** The list of expense types supported by this account */
  supportedExpenseTypes: Array<ExpenseType>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tiers: TierCollection;
  /** Number of unique financial contributors. */
  totalFinancialContributors: Scalars['Int']['output'];
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  transactionReports?: Maybe<TransactionReports>;
  transactions: TransactionCollection;
  transferwise?: Maybe<TransferWise>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  twitterHandle?: Maybe<Scalars['String']['output']>;
  type: AccountType;
  /** Date when the collective was last unfrozen by current Fiscal Host */
  unfrozenAt?: Maybe<Scalars['DateTime']['output']>;
  /** Date of unhosting by a given Fiscal Host. */
  unhostedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Updates published by the account. To see unpublished updates, you need to be an admin and have the scope "updates". */
  updates: UpdateCollection;
  /** Virtual Cards Merchants used by the account. Admin only. Scope: "virtualCards". */
  virtualCardMerchants?: Maybe<AccountCollection>;
  /** Virtual Cards attached to the account. Admin only. Scope: "virtualCards". */
  virtualCards?: Maybe<VirtualCardCollection>;
  webhooks: WebhookCollection;
  /** @deprecated 2023-01-16: Please use socialLinks */
  website?: Maybe<Scalars['String']['output']>;
};


/** This represents an Project account */
export type FundActiveContributorsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeActiveRecurringContributions?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type FundActivitySubscriptionsArgs = {
  channel?: InputMaybe<ActivityChannel>;
};


/** This represents an Project account */
export type FundBackgroundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Project account */
export type FundChildrenAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Project account */
export type FundContributorsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  roles?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Project account */
export type FundConversationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Project account */
export type FundConversationsTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type FundDuplicatedAccountsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type FundExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<ExpenseDirection>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Project account */
export type FundExpensesTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type FundFeedArgs = {
  classes?: InputMaybe<Array<InputMaybe<ActivityClassType>>>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Project account */
export type FundHostAgreementsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type FundHostApplicationRequestsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<HostApplicationStatus>;
};


/** This represents an Project account */
export type FundHostFeePercentArgs = {
  paymentMethodService?: InputMaybe<PaymentMethodService>;
  paymentMethodType?: InputMaybe<PaymentMethodType>;
};


/** This represents an Project account */
export type FundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Project account */
export type FundLegalDocumentsArgs = {
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents an Project account */
export type FundMemberInvitationsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  memberAccount?: InputMaybe<AccountReferenceInput>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Project account */
export type FundMemberOfArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  hostFeesStructure?: InputMaybe<HostFeeStructure>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isHostAccount?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: OrderByInput;
  orderByRoles?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Project account */
export type FundMembersArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Project account */
export type FundOAuthApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type FundOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Project account */
export type FundPaymentMethodsArgs = {
  enumType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  includeExpired?: InputMaybe<Scalars['Boolean']['input']>;
  service?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  type?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
};


/** This represents an Project account */
export type FundSummaryArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
};


/** This represents an Project account */
export type FundTiersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type FundTotalFinancialContributorsArgs = {
  accountType?: InputMaybe<AccountType>;
};


/** This represents an Project account */
export type FundTransactionGroupsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** This represents an Project account */
export type FundTransactionReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Project account */
export type FundTransactionsArgs = {
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Project account */
export type FundUnhostedAtArgs = {
  host: AccountReferenceInput;
};


/** This represents an Project account */
export type FundUpdatesArgs = {
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublishedUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Project account */
export type FundVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type FundVirtualCardsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
};


/** This represents an Project account */
export type FundWebhooksArgs = {
  account: AccountReferenceInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type FundCreateInput = {
  /** The profile background image, for the banner and social media sharing */
  backgroundImage?: InputMaybe<Scalars['Upload']['input']>;
  description: Scalars['String']['input'];
  /** The profile avatar image */
  image?: InputMaybe<Scalars['Upload']['input']>;
  name: Scalars['String']['input'];
  settings?: InputMaybe<Scalars['JSON']['input']>;
  slug: Scalars['String']['input'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type GenericFileInfo = FileInfo & {
  __typename?: 'GenericFileInfo';
  /** Unique identifier for the file */
  id: Scalars['String']['output'];
  /** Name of the file */
  name?: Maybe<Scalars['String']['output']>;
  /** Size of the file in bytes */
  size?: Maybe<Scalars['Int']['output']>;
  /** Mime type of the file */
  type: Scalars['String']['output'];
  /** URL to access the file */
  url: Scalars['URL']['output'];
};

/** Input type for guest contributions */
export type GuestInfoInput = {
  /** Captcha validation for creating an order */
  captcha?: InputMaybe<CaptchaInput>;
  /** Contributor's email */
  email: Scalars['EmailAddress']['input'];
  /** Legal name of the user */
  legalName?: InputMaybe<Scalars['String']['input']>;
  /** Address of the user, mandatory when amount is above $5000. */
  location?: InputMaybe<LocationInput>;
  /** Display name of the user */
  name?: InputMaybe<Scalars['String']['input']>;
};

/** This represents an Host account */
export type Host = Account & AccountWithContributions & {
  __typename?: 'Host';
  /** List of accounting categories for this host */
  accountingCategories: AccountingCategoryCollection;
  /** [!] Warning: this query is currently in beta and the API might change */
  activeContributors: AccountCollection;
  /** List of activities that the logged-in user is subscribed for this collective */
  activitySubscriptions?: Maybe<Array<Maybe<ActivitySubscription>>>;
  backgroundImageUrl?: Maybe<Scalars['String']['output']>;
  bankAccount?: Maybe<PayoutMethod>;
  /** Whether this account can have changelog updates */
  canHaveChangelogUpdates: Scalars['Boolean']['output'];
  /** Returns true if the remote user can start the process to resume contributions for account */
  canStartResumeContributionsProcess: Scalars['Boolean']['output'];
  categories: Array<Maybe<Scalars['String']['output']>>;
  childrenAccounts: AccountCollection;
  /** The list of connected accounts (Stripe, Twitter, etc ...). Admin only. Scope: "connectedAccounts". */
  connectedAccounts?: Maybe<Array<Maybe<ConnectedAccount>>>;
  contributionPolicy?: Maybe<Scalars['String']['output']>;
  contributionStats: ContributionStats;
  /** All the persons and entities that contribute to this account */
  contributors: ContributorCollection;
  conversations: ConversationCollection;
  /** Returns conversation's tags for collective sorted by popularity */
  conversationsTags?: Maybe<Array<Maybe<TagStat>>>;
  /** The time of creation */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The currency of the account */
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  /** If this account was duplicated, the accounts that were created from it */
  duplicatedAccounts: AccountCollection;
  /** If created by duplication, the account from which this one was duplicated */
  duplicatedFromAccount?: Maybe<Account>;
  /** Returns the emails of the account. Individuals only have one, but organizations can have multiple emails. */
  emails?: Maybe<Array<Scalars['EmailAddress']['output']>>;
  /** @deprecated 2024-11-04: Please use policies.EXPENSE_POLICIES */
  expensePolicy?: Maybe<Scalars['String']['output']>;
  expenseStats: ExpenseStats;
  expenses: ExpenseCollection;
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<TagStat>>>;
  /** Describes the features enabled and available for this account */
  features: CollectiveFeatures;
  feed?: Maybe<Array<Maybe<Activity>>>;
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: Maybe<Scalars['String']['output']>;
  /** Returns whether the host has any Stripe disputed orders */
  hasDisputedOrders?: Maybe<Scalars['Boolean']['output']>;
  /** Returns whether the host has any Stripe in review orders */
  hasInReviewOrders?: Maybe<Scalars['Boolean']['output']>;
  /** Returns true if the account has started the process to resume contributions */
  hasResumeContributionsProcessStarted: Scalars['Boolean']['output'];
  /** Host application requests */
  hostApplicationRequests: HostApplicationCollection;
  /** Applications for this host */
  hostApplications: HostApplicationCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  hostExpensesReport?: Maybe<HostExpensesReports>;
  hostFeePercent?: Maybe<Scalars['Float']['output']>;
  hostMetrics: HostMetrics;
  hostMetricsTimeSeries: HostMetricsTimeSeries;
  /** EXPERIMENTAL (this may change or be removed) */
  hostTransactionsReports?: Maybe<HostTransactionReports>;
  /** Returns agreements with Hosted Accounts */
  hostedAccountAgreements: AgreementCollection;
  /** Returns a list of accounts hosted by this host */
  hostedAccounts: HostedAccountCollection;
  /** Returns legal documents hosted by this host */
  hostedLegalDocuments: LegalDocumentCollection;
  hostedVirtualCardCollectives: AccountCollection;
  hostedVirtualCardMerchants: AccountCollection;
  hostedVirtualCards: VirtualCardCollection;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Returns whether the account accepts financial contributions. */
  isActive?: Maybe<Scalars['Boolean']['output']>;
  /** Returns true if the remote user is an admin of this account */
  isAdmin: Scalars['Boolean']['output'];
  /** Returns whether this account is archived */
  isArchived: Scalars['Boolean']['output'];
  /** Whether this account is frozen */
  isFrozen: Scalars['Boolean']['output'];
  /** Returns whether the account is setup to Host collectives. */
  isHost: Scalars['Boolean']['output'];
  /** Defines if the contributors wants to be incognito (name not displayed) */
  isIncognito: Scalars['Boolean']['output'];
  isOpenToApplications?: Maybe<Scalars['Boolean']['output']>;
  /** Returns whether the host is trusted or not */
  isTrustedHost: Scalars['Boolean']['output'];
  legacyId: Scalars['Int']['output'];
  /** The legal documents associated with this account */
  legalDocuments?: Maybe<Array<Maybe<LegalDocument>>>;
  /** Private, legal name. Used for expense receipts, taxes, etc. Scope: "account". */
  legalName?: Maybe<Scalars['String']['output']>;
  /** The address associated to this account. This field is always public for collectives and events. */
  location?: Maybe<Location>;
  longDescription?: Maybe<Scalars['String']['output']>;
  /** [AUTHENTICATED] Returns the pending invitations */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  memberOf: MemberOfCollection;
  /** Get all members (admins, members, backers, followers) */
  members: MemberCollection;
  /** Public name */
  name?: Maybe<Scalars['String']['output']>;
  /** The list of applications created by this account. Admin only. Scope: "applications". */
  oAuthApplications?: Maybe<OAuthApplicationCollection>;
  orders: OrderCollection;
  /** @deprecated 2022-12-16: use parent on AccountWithParent instead */
  parentAccount?: Maybe<Account>;
  /** The list of payment methods that this collective can use to pay for Orders. Admin or Host only. Scope: "orders". */
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payment methods for this account that are pending a client confirmation (3D Secure / SCA) */
  paymentMethodsWithPendingConfirmation?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payout methods that this collective can use to get paid. In most cases, admin only and scope: "expenses". */
  payoutMethods?: Maybe<Array<Maybe<PayoutMethod>>>;
  /** If the host supports PayPal, this will contain the client ID to use in the frontend */
  paypalClientId?: Maybe<Scalars['String']['output']>;
  /** Paypal preapproval info. Returns null if PayPal account is not connected. */
  paypalPreApproval?: Maybe<PaymentMethod>;
  /**
   * Pending applications for this host
   * @deprecated 2023-08-25: Deprecated in favour of host.hostApplications(status: PENDING).
   */
  pendingApplications: HostApplicationCollection;
  /** Logged-in user permissions on an account */
  permissions: AccountPermissions;
  plan: HostPlan;
  /** Returns true if a custom contribution to Open Collective can be submitted for contributions made to this account */
  platformContributionAvailable: Scalars['Boolean']['output'];
  /** How much platform fees are charged for this account */
  platformFeePercent: Scalars['Float']['output'];
  /** Policies for the account. To see non-public policies you need to be admin and have the scope: "account". */
  policies: Policies;
  /** Returns a list of organizations that only transacted with this host and all its admins are also admins of this host. */
  potentialVendors: AccountCollection;
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  /** Returns the legal documents required by this host */
  requiredLegalDocuments: Array<LegalDocumentType>;
  settings: Scalars['JSON']['output'];
  /** The slug identifying the account (ie: babel) */
  slug: Scalars['String']['output'];
  socialLinks: Array<SocialLink>;
  stats?: Maybe<AccountStats>;
  /** Stripe connected account */
  stripe?: Maybe<StripeConnectedAccount>;
  /** The list of expense types supported by this account */
  supportedExpenseTypes: Array<ExpenseType>;
  /** The list of payment methods (Stripe, Paypal, manual bank transfer, etc ...) the Host can accept for its Collectives */
  supportedPaymentMethods?: Maybe<Array<Maybe<PaymentMethodLegacyType>>>;
  /** The list of payout methods this Host accepts for its expenses */
  supportedPayoutMethods?: Maybe<Array<Maybe<PayoutMethodType>>>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  termsUrl?: Maybe<Scalars['URL']['output']>;
  tiers: TierCollection;
  /** Number of unique financial contributors. */
  totalFinancialContributors: Scalars['Int']['output'];
  totalHostedAccounts?: Maybe<Scalars['Int']['output']>;
  /** @deprecated 2023-03-20: Renamed to totalHostedAccounts */
  totalHostedCollectives?: Maybe<Scalars['Int']['output']>;
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  transactionReports?: Maybe<TransactionReports>;
  transactions: TransactionCollection;
  /** Returns a list of transactions imports for this host */
  transactionsImports: TransactionsImportsCollection;
  /** Returns a list of transactions imports sources for this host */
  transactionsImportsSources: Array<Maybe<Scalars['NonEmptyString']['output']>>;
  transferwise?: Maybe<TransferWise>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  twitterHandle?: Maybe<Scalars['String']['output']>;
  type: AccountType;
  /** Date of unhosting by a given Fiscal Host. */
  unhostedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Updates published by the account. To see unpublished updates, you need to be an admin and have the scope "updates". */
  updates: UpdateCollection;
  /** Returns a list of vendors that works with this host */
  vendors: VendorCollection;
  /** Virtual Cards Merchants used by the account. Admin only. Scope: "virtualCards". */
  virtualCardMerchants?: Maybe<AccountCollection>;
  /** Virtual Cards attached to the account. Admin only. Scope: "virtualCards". */
  virtualCards?: Maybe<VirtualCardCollection>;
  webhooks: WebhookCollection;
  /** @deprecated 2023-01-16: Please use socialLinks */
  website?: Maybe<Scalars['String']['output']>;
};


/** This represents an Host account */
export type HostAccountingCategoriesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  kind?: InputMaybe<Array<AccountingCategoryKind>>;
};


/** This represents an Host account */
export type HostActiveContributorsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeActiveRecurringContributions?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostActivitySubscriptionsArgs = {
  channel?: InputMaybe<ActivityChannel>;
};


/** This represents an Host account */
export type HostBackgroundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Host account */
export type HostChildrenAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Host account */
export type HostContributionStatsArgs = {
  account?: InputMaybe<Array<AccountReferenceInput>>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Host account */
export type HostContributorsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  roles?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Host account */
export type HostConversationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Host account */
export type HostConversationsTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostDuplicatedAccountsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostExpenseStatsArgs = {
  account?: InputMaybe<Array<AccountReferenceInput>>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Host account */
export type HostExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<ExpenseDirection>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Host account */
export type HostExpensesTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostFeedArgs = {
  classes?: InputMaybe<Array<InputMaybe<ActivityClassType>>>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Host account */
export type HostHostApplicationRequestsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<HostApplicationStatus>;
};


/** This represents an Host account */
export type HostHostApplicationsArgs = {
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<HostApplicationStatus>;
};


/** This represents an Host account */
export type HostHostExpensesReportArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Host account */
export type HostHostMetricsArgs = {
  account?: InputMaybe<Array<AccountReferenceInput>>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
};


/** This represents an Host account */
export type HostHostMetricsTimeSeriesArgs = {
  account?: InputMaybe<Array<AccountReferenceInput>>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Host account */
export type HostHostTransactionsReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Host account */
export type HostHostedAccountAgreementsArgs = {
  accounts?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostHostedAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  balance?: InputMaybe<AmountRangeInput>;
  consolidatedBalance?: InputMaybe<AmountRangeInput>;
  currencies?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hostFeesStructure?: InputMaybe<HostFeeStructure>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isFrozen?: InputMaybe<Scalars['Boolean']['input']>;
  isUnhosted?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<OrderByInput>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Host account */
export type HostHostedLegalDocumentsArgs = {
  account?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  requestedAtFrom?: InputMaybe<Scalars['DateTime']['input']>;
  requestedAtTo?: InputMaybe<Scalars['DateTime']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<LegalDocumentRequestStatus>>>;
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents an Host account */
export type HostHostedVirtualCardCollectivesArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostHostedVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostHostedVirtualCardsArgs = {
  collectiveAccountIds?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  hasMissingReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  spentAmountFrom?: InputMaybe<AmountInput>;
  spentAmountTo?: InputMaybe<AmountInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
  withExpensesDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  withExpensesDateTo?: InputMaybe<Scalars['DateTime']['input']>;
};


/** This represents an Host account */
export type HostImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Host account */
export type HostLegalDocumentsArgs = {
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents an Host account */
export type HostMemberInvitationsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  memberAccount?: InputMaybe<AccountReferenceInput>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Host account */
export type HostMemberOfArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  hostFeesStructure?: InputMaybe<HostFeeStructure>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isHostAccount?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: OrderByInput;
  orderByRoles?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Host account */
export type HostMembersArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Host account */
export type HostOAuthApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Host account */
export type HostPaymentMethodsArgs = {
  enumType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  includeExpired?: InputMaybe<Scalars['Boolean']['input']>;
  service?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  type?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
};


/** This represents an Host account */
export type HostPendingApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Host account */
export type HostPotentialVendorsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostTiersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostTotalFinancialContributorsArgs = {
  accountType?: InputMaybe<AccountType>;
};


/** This represents an Host account */
export type HostTransactionGroupsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** This represents an Host account */
export type HostTransactionReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Host account */
export type HostTransactionsArgs = {
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Host account */
export type HostTransactionsImportsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
};


/** This represents an Host account */
export type HostUnhostedAtArgs = {
  host: AccountReferenceInput;
};


/** This represents an Host account */
export type HostUpdatesArgs = {
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublishedUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Host account */
export type HostVendorsArgs = {
  forAccount?: InputMaybe<AccountReferenceInput>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Host account */
export type HostVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Host account */
export type HostVirtualCardsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
};


/** This represents an Host account */
export type HostWebhooksArgs = {
  account: AccountReferenceInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type HostApplication = {
  __typename?: 'HostApplication';
  /** The account who applied to this host */
  account: Account;
  /** Returns the list of comments for this host application, or `null` if user is not allowed to see them */
  comments?: Maybe<CommentCollection>;
  /** The date on which the item was created */
  createdAt: Scalars['DateTime']['output'];
  customData?: Maybe<Scalars['JSON']['output']>;
  /** The host the collective applied to */
  host: Host;
  id: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  status?: Maybe<HostApplicationStatus>;
  /** The date on which the item was updated */
  updatedAt: Scalars['DateTime']['output'];
};


export type HostApplicationCommentsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
};

/** A collection of "HostApplication" */
export type HostApplicationCollection = Collection & {
  __typename?: 'HostApplicationCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<HostApplication>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type HostApplicationReferenceInput = {
  /** The public id identifying the host application (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
};

export enum HostApplicationStatus {
  APPROVED = 'APPROVED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

/** A collection of "Hosts" */
export type HostCollection = Collection & {
  __typename?: 'HostCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Host>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type HostExpensesReportNode = {
  __typename?: 'HostExpensesReportNode';
  accountingCategory?: Maybe<AccountingCategory>;
  amount: Amount;
  count: Scalars['Int']['output'];
  date: Scalars['DateTime']['output'];
  isHost: Scalars['Boolean']['output'];
};

/** EXPERIMENTAL (this may change or be deleted): Host expenses report */
export type HostExpensesReports = {
  __typename?: 'HostExpensesReports';
  /** The start date of the time series */
  dateFrom?: Maybe<Scalars['DateTime']['output']>;
  /** The end date of the time series */
  dateTo?: Maybe<Scalars['DateTime']['output']>;
  nodes?: Maybe<Array<HostExpensesReportNode>>;
  /** The interval between two data points */
  timeUnit: TimeUnit;
};

/** All supported expense types */
export enum HostFeeStructure {
  /** Custom fee for this Collective only */
  CUSTOM_FEE = 'CUSTOM_FEE',
  /** Use global host fees */
  DEFAULT = 'DEFAULT',
  /** Set a monthly retainer for this Collective */
  MONTHLY_RETAINER = 'MONTHLY_RETAINER'
}

/** Host metrics related to collected and pending fees/tips. */
export type HostMetrics = {
  __typename?: 'HostMetrics';
  /** Amount in host fee shared with the platform */
  hostFeeShare?: Maybe<Amount>;
  /** Host fee sharing percent */
  hostFeeSharePercent?: Maybe<Scalars['Float']['output']>;
  /** Amount collected in host fees for given period */
  hostFees?: Maybe<Amount>;
  /** Amount in host fee shared  requiring settlement */
  pendingHostFeeShare?: Maybe<Amount>;
  /** Amount collected in platform fees requiring settlement */
  pendingPlatformFees?: Maybe<Amount>;
  /** Amount collected in platform tips requiring settlement */
  pendingPlatformTips?: Maybe<Amount>;
  /** Amount collected in platform fees for given period */
  platformFees?: Maybe<Amount>;
  /** Amount collected in platform tips for given period */
  platformTips?: Maybe<Amount>;
  /** Amount in host fee shared not requiring settlement */
  settledHostFeeShare?: Maybe<Amount>;
  /** Total amount managed on behalf of hosted collectives */
  totalMoneyManaged?: Maybe<Amount>;
};

/** Host metrics time series */
export type HostMetricsTimeSeries = {
  __typename?: 'HostMetricsTimeSeries';
  /** The start date of the time series */
  dateFrom?: Maybe<Scalars['DateTime']['output']>;
  /** The end date of the time series */
  dateTo?: Maybe<Scalars['DateTime']['output']>;
  /** History of the share of host fees collected owed to Open Collective Inc. */
  hostFeeShare: TimeSeriesAmountWithSettlement;
  /** History of the host fees collected */
  hostFees: TimeSeriesAmount;
  /** History of the collected platform tips */
  platformTips: TimeSeriesAmount;
  /** The interval between two data points */
  timeUnit: TimeUnit;
  /** History of the total money managed by this host */
  totalMoneyManaged: TimeSeriesAmount;
  /** History of the total money received by this host */
  totalReceived: TimeSeriesAmountWithKind;
  /** History of the total money spent by this host */
  totalSpent: TimeSeriesAmountWithKind;
};

/** The name of the current plan and its characteristics. */
export type HostPlan = {
  __typename?: 'HostPlan';
  /** Whether this plan allows to use the added funds feature */
  addedFunds?: Maybe<Scalars['Int']['output']>;
  /** Amount limit for the added funds feature under this plan */
  addedFundsLimit?: Maybe<Scalars['Int']['output']>;
  /** Whether this plan allows to use the bank transfers feature */
  bankTransfers?: Maybe<Scalars['Int']['output']>;
  /** Amount limit for the bank transfers feature under this plan */
  bankTransfersLimit?: Maybe<Scalars['Int']['output']>;
  /** Whether this plan allows to use the host dashboard */
  hostDashboard?: Maybe<Scalars['Boolean']['output']>;
  /** Charge on revenues made through Host Fees. */
  hostFeeSharePercent?: Maybe<Scalars['Float']['output']>;
  /** Ability to charge Host Fees. */
  hostFees?: Maybe<Scalars['Boolean']['output']>;
  /** Number of collectives hosted */
  hostedCollectives?: Maybe<Scalars['Int']['output']>;
  /** Max number of collectives than can be hosted */
  hostedCollectivesLimit?: Maybe<Scalars['Int']['output']>;
  /** The public id identifying the account (ie: 5v08jk63-w4g9nbpz-j7qmyder-p7ozax5g) */
  id?: Maybe<Scalars['String']['output']>;
  /** Whether this plan allows to use the manual payments feature */
  manualPayments?: Maybe<Scalars['Boolean']['output']>;
  /** The name of the plan */
  name?: Maybe<Scalars['String']['output']>;
  /** Ability to collect Platform Tips. */
  platformTips?: Maybe<Scalars['Boolean']['output']>;
  /** Whether this plan allows to use the transferwise payouts feature */
  transferwisePayouts?: Maybe<Scalars['Int']['output']>;
  /** Amount limit for the transferwise payouts feature under this plan */
  transferwisePayoutsLimit?: Maybe<Scalars['Int']['output']>;
};

export type HostTransactionReportNode = {
  __typename?: 'HostTransactionReportNode';
  date: Scalars['DateTime']['output'];
  managedFunds: TransactionReport;
  operationalFunds: TransactionReport;
};

/** EXPERIMENTAL (this may change or be deleted): Host transaction report */
export type HostTransactionReports = {
  __typename?: 'HostTransactionReports';
  /** The start date of the time series */
  dateFrom?: Maybe<Scalars['DateTime']['output']>;
  /** The end date of the time series */
  dateTo?: Maybe<Scalars['DateTime']['output']>;
  nodes?: Maybe<Array<HostTransactionReportNode>>;
  /** The interval between two data points */
  timeUnit: TimeUnit;
};

/** A collection of hosted "Accounts" */
export type HostedAccountCollection = Collection & {
  __typename?: 'HostedAccountCollection';
  currencies?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Account>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Return a summary of transaction info about a given account within the context of its current fiscal host */
export type HostedAccountSummary = {
  __typename?: 'HostedAccountSummary';
  /** Average calculated over the number of months/years the collective was approved or the number of months since dateFrom, whichever is less */
  contributionAverageCount?: Maybe<Scalars['Float']['output']>;
  /** Average calculated over the number of months the collective was approved or the number of months since dateFrom, whichever is less */
  contributionAverageTotal?: Maybe<Amount>;
  contributionCount?: Maybe<Scalars['Int']['output']>;
  contributionRefundedTotal?: Maybe<Amount>;
  contributionTotal?: Maybe<Amount>;
  /** Average calculated over the number of months the collective was approved or the number of months since dateFrom, whichever is less */
  expenseAverageCount?: Maybe<Scalars['Float']['output']>;
  /** Average calculated over the number of months the collective was approved or the number of months since dateFrom, whichever is less */
  expenseAverageTotal?: Maybe<Amount>;
  expenseCount?: Maybe<Scalars['Int']['output']>;
  expenseDistinctPayee?: Maybe<Scalars['Int']['output']>;
  expenseMaxValue?: Maybe<Amount>;
  expenseTotal?: Maybe<Amount>;
  hostFeeTotal?: Maybe<Amount>;
  receivedTotal?: Maybe<Amount>;
  receivedTotalAverage?: Maybe<Amount>;
  spentTotal?: Maybe<Amount>;
  spentTotalAverage?: Maybe<Amount>;
};


/** Return a summary of transaction info about a given account within the context of its current fiscal host */
export type HostedAccountSummaryContributionAverageCountArgs = {
  period?: InputMaybe<AveragePeriod>;
};


/** Return a summary of transaction info about a given account within the context of its current fiscal host */
export type HostedAccountSummaryContributionAverageTotalArgs = {
  period?: InputMaybe<AveragePeriod>;
};


/** Return a summary of transaction info about a given account within the context of its current fiscal host */
export type HostedAccountSummaryExpenseAverageCountArgs = {
  period?: InputMaybe<AveragePeriod>;
};


/** Return a summary of transaction info about a given account within the context of its current fiscal host */
export type HostedAccountSummaryExpenseAverageTotalArgs = {
  period?: InputMaybe<AveragePeriod>;
};


/** Return a summary of transaction info about a given account within the context of its current fiscal host */
export type HostedAccountSummaryReceivedTotalAverageArgs = {
  period?: InputMaybe<AveragePeriod>;
};


/** Return a summary of transaction info about a given account within the context of its current fiscal host */
export type HostedAccountSummarySpentTotalAverageArgs = {
  period?: InputMaybe<AveragePeriod>;
};

/** Exposes information about an uploaded image file */
export type ImageFileInfo = FileInfo & {
  __typename?: 'ImageFileInfo';
  /** Blurhash of the image */
  blurHash?: Maybe<Scalars['String']['output']>;
  /** If the file is an image, this will be the height of the image in pixels */
  height?: Maybe<Scalars['Int']['output']>;
  /** Unique identifier for the file */
  id: Scalars['String']['output'];
  /** Name of the file */
  name?: Maybe<Scalars['String']['output']>;
  /** Size of the file in bytes */
  size?: Maybe<Scalars['Int']['output']>;
  /** Mime type of the file */
  type: Scalars['String']['output'];
  /** URL to access the file */
  url: Scalars['URL']['output'];
  /** If the file is an image, this will be the width of the image in pixels */
  width?: Maybe<Scalars['Int']['output']>;
};

export enum ImageFormat {
  gif = 'gif',
  jpg = 'jpg',
  png = 'png',
  svg = 'svg',
  txt = 'txt'
}

/** This represents an Individual account */
export type Individual = Account & {
  __typename?: 'Individual';
  /** List of activities that the logged-in user is subscribed for this collective */
  activitySubscriptions?: Maybe<Array<Maybe<ActivitySubscription>>>;
  backgroundImageUrl?: Maybe<Scalars['String']['output']>;
  /** Whether this account can have changelog updates */
  canHaveChangelogUpdates: Scalars['Boolean']['output'];
  categories: Array<Maybe<Scalars['String']['output']>>;
  childrenAccounts: AccountCollection;
  /** The list of connected accounts (Stripe, Twitter, etc ...). Admin only. Scope: "connectedAccounts". */
  connectedAccounts?: Maybe<Array<Maybe<ConnectedAccount>>>;
  conversations: ConversationCollection;
  /** Returns conversation's tags for collective sorted by popularity */
  conversationsTags?: Maybe<Array<Maybe<TagStat>>>;
  /** The time of creation */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The currency of the account */
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  /** If this account was duplicated, the accounts that were created from it */
  duplicatedAccounts: AccountCollection;
  /** If created by duplication, the account from which this one was duplicated */
  duplicatedFromAccount?: Maybe<Account>;
  /** Email for the account. For authenticated user: scope: "email". */
  email?: Maybe<Scalars['String']['output']>;
  /** Returns the emails of the account. Individuals only have one, but organizations can have multiple emails. */
  emails?: Maybe<Array<Scalars['EmailAddress']['output']>>;
  /** @deprecated 2024-11-04: Please use policies.EXPENSE_POLICIES */
  expensePolicy?: Maybe<Scalars['String']['output']>;
  expenses: ExpenseCollection;
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<TagStat>>>;
  /** Describes the features enabled and available for this account */
  features: CollectiveFeatures;
  feed?: Maybe<Array<Maybe<Activity>>>;
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: Maybe<Scalars['String']['output']>;
  /** Has the account a password set? For authenticated user: scope: "account". */
  hasPassword?: Maybe<Scalars['Boolean']['output']>;
  hasSeenLatestChangelogEntry?: Maybe<Scalars['Boolean']['output']>;
  hasTwoFactorAuth?: Maybe<Scalars['Boolean']['output']>;
  /** If the individual is a host account, this will return the matching Host object */
  host?: Maybe<Host>;
  /** Host application requests */
  hostApplicationRequests: HostApplicationCollection;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Returns whether the account accepts financial contributions. */
  isActive?: Maybe<Scalars['Boolean']['output']>;
  /** Returns true if the remote user is an admin of this account */
  isAdmin: Scalars['Boolean']['output'];
  /** Returns whether this account is archived */
  isArchived: Scalars['Boolean']['output'];
  isFollowingConversation: Scalars['Boolean']['output'];
  /** Whether this account is frozen */
  isFrozen: Scalars['Boolean']['output'];
  isGuest: Scalars['Boolean']['output'];
  /** Returns whether the account is setup to Host collectives. */
  isHost: Scalars['Boolean']['output'];
  /** Defines if the contributors wants to be incognito (name not displayed) */
  isIncognito: Scalars['Boolean']['output'];
  legacyId: Scalars['Int']['output'];
  /** The legal documents associated with this account */
  legalDocuments?: Maybe<Array<Maybe<LegalDocument>>>;
  /** Private, legal name. Used for expense receipts, taxes, etc. Scope: "account". */
  legalName?: Maybe<Scalars['String']['output']>;
  /**
   *
   *           Address. This field is public for hosts, otherwise:
   *             - Users can see their own address
   *             - Hosts can see the address of users submitting expenses to their collectives
   *
   */
  location?: Maybe<Location>;
  longDescription?: Maybe<Scalars['String']['output']>;
  /** [AUTHENTICATED] Returns the pending invitations */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  memberOf: MemberOfCollection;
  /** Get all members (admins, members, backers, followers) */
  members: MemberCollection;
  /** Public name */
  name?: Maybe<Scalars['String']['output']>;
  newsletterOptIn?: Maybe<Scalars['Boolean']['output']>;
  /** The list of applications created by this account. Admin only. Scope: "applications". */
  oAuthApplications?: Maybe<OAuthApplicationCollection>;
  oAuthAuthorizations?: Maybe<OAuthAuthorizationCollection>;
  orders: OrderCollection;
  /** @deprecated 2022-12-16: use parent on AccountWithParent instead */
  parentAccount?: Maybe<Account>;
  /** The list of payment methods that this collective can use to pay for Orders. Admin or Host only. Scope: "orders". */
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payment methods for this account that are pending a client confirmation (3D Secure / SCA) */
  paymentMethodsWithPendingConfirmation?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payout methods that this collective can use to get paid. In most cases, admin only and scope: "expenses". */
  payoutMethods?: Maybe<Array<Maybe<PayoutMethod>>>;
  /** Logged-in user permissions on an account */
  permissions: AccountPermissions;
  /** The list of personal tokens created by this account. Admin only. Scope: "applications". */
  personalTokens?: Maybe<PersonalTokenCollection>;
  /** Policies for the account. To see non-public policies you need to be admin and have the scope: "account". */
  policies: Policies;
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  settings: Scalars['JSON']['output'];
  /** The slug identifying the account (ie: babel) */
  slug: Scalars['String']['output'];
  socialLinks: Array<SocialLink>;
  stats?: Maybe<AccountStats>;
  /** The list of expense types supported by this account */
  supportedExpenseTypes: Array<ExpenseType>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  transactionReports?: Maybe<TransactionReports>;
  transactions: TransactionCollection;
  transferwise?: Maybe<TransferWise>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  twitterHandle?: Maybe<Scalars['String']['output']>;
  /** User two factor methods */
  twoFactorMethods?: Maybe<Array<Maybe<UserTwoFactorMethod>>>;
  type: AccountType;
  /** Date of unhosting by a given Fiscal Host. */
  unhostedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Updates published by the account. To see unpublished updates, you need to be an admin and have the scope "updates". */
  updates: UpdateCollection;
  /** Virtual Cards Merchants used by the account. Admin only. Scope: "virtualCards". */
  virtualCardMerchants?: Maybe<AccountCollection>;
  /** Virtual Cards attached to the account. Admin only. Scope: "virtualCards". */
  virtualCards?: Maybe<VirtualCardCollection>;
  webhooks: WebhookCollection;
  /** @deprecated 2023-01-16: Please use socialLinks */
  website?: Maybe<Scalars['String']['output']>;
};


/** This represents an Individual account */
export type IndividualActivitySubscriptionsArgs = {
  channel?: InputMaybe<ActivityChannel>;
};


/** This represents an Individual account */
export type IndividualBackgroundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Individual account */
export type IndividualChildrenAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Individual account */
export type IndividualConversationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Individual account */
export type IndividualConversationsTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Individual account */
export type IndividualDuplicatedAccountsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Individual account */
export type IndividualExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<ExpenseDirection>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Individual account */
export type IndividualExpensesTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Individual account */
export type IndividualFeedArgs = {
  classes?: InputMaybe<Array<InputMaybe<ActivityClassType>>>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Individual account */
export type IndividualHostApplicationRequestsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<HostApplicationStatus>;
};


/** This represents an Individual account */
export type IndividualImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Individual account */
export type IndividualIsFollowingConversationArgs = {
  id: Scalars['String']['input'];
};


/** This represents an Individual account */
export type IndividualLegalDocumentsArgs = {
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents an Individual account */
export type IndividualMemberInvitationsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  memberAccount?: InputMaybe<AccountReferenceInput>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Individual account */
export type IndividualMemberOfArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  hostFeesStructure?: InputMaybe<HostFeeStructure>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isHostAccount?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: OrderByInput;
  orderByRoles?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Individual account */
export type IndividualMembersArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Individual account */
export type IndividualOAuthApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Individual account */
export type IndividualOAuthAuthorizationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Individual account */
export type IndividualOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Individual account */
export type IndividualPaymentMethodsArgs = {
  enumType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  includeExpired?: InputMaybe<Scalars['Boolean']['input']>;
  service?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  type?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
};


/** This represents an Individual account */
export type IndividualPersonalTokensArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Individual account */
export type IndividualTransactionGroupsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** This represents an Individual account */
export type IndividualTransactionReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Individual account */
export type IndividualTransactionsArgs = {
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Individual account */
export type IndividualUnhostedAtArgs = {
  host: AccountReferenceInput;
};


/** This represents an Individual account */
export type IndividualUpdatesArgs = {
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublishedUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Individual account */
export type IndividualVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Individual account */
export type IndividualVirtualCardsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
};


/** This represents an Individual account */
export type IndividualWebhooksArgs = {
  account: AccountReferenceInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type IndividualConfirmEmailResponse = {
  __typename?: 'IndividualConfirmEmailResponse';
  /** The account that was confirmed */
  individual: Individual;
  /** A new session token to use for the account. Only returned if user is signed in already. */
  sessionToken?: Maybe<Scalars['String']['output']>;
};

export type IndividualCreateInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type InviteMemberInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  /** Reference to an account for the invitee */
  memberAccount?: InputMaybe<AccountReferenceInput>;
  /** Email and name of the invitee if no reference. */
  memberInfo?: InputMaybe<IndividualCreateInput>;
  /** Role of the invitee */
  role: MemberRole;
  since?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Defines role of the last comment author */
export enum LastCommentBy {
  /** Collective Admin */
  COLLECTIVE_ADMIN = 'COLLECTIVE_ADMIN',
  /** Fiscal Host Admin */
  HOST_ADMIN = 'HOST_ADMIN',
  /** Not a Fiscal Host Admin */
  NON_HOST_ADMIN = 'NON_HOST_ADMIN',
  /** Expense Submitter */
  USER = 'USER'
}

/** A legal document (e.g. W9, W8BEN, W8BEN-E) */
export type LegalDocument = {
  __typename?: 'LegalDocument';
  /** The account this legal document is for */
  account: Account;
  /** URL to download the file. Must be logged in as a host with access to the document. The returned URL will be protected by authentication + 2FA. */
  documentLink?: Maybe<Scalars['URL']['output']>;
  /** Unique identifier for this legal document */
  id: Scalars['String']['output'];
  /** Whether this legal document is expired */
  isExpired: Scalars['Boolean']['output'];
  /** The date and time the request for this legal document was created */
  requestedAt: Scalars['DateTime']['output'];
  /** The service that provided this legal document */
  service: LegalDocumentService;
  /** The status of the request for this legal document */
  status: LegalDocumentRequestStatus;
  /** The type of legal document */
  type: LegalDocumentType;
  /** The date and time this legal document was last updated */
  updatedAt: Scalars['DateTime']['output'];
  /** The year this legal document is for */
  year: Scalars['Int']['output'];
};

/** A collection of "LegalDocument" */
export type LegalDocumentCollection = Collection & {
  __typename?: 'LegalDocumentCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<LegalDocument>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Status for a legal document */
export enum LegalDocumentRequestStatus {
  ERROR = 'ERROR',
  INVALID = 'INVALID',
  NOT_REQUESTED = 'NOT_REQUESTED',
  RECEIVED = 'RECEIVED',
  REQUESTED = 'REQUESTED'
}

/** Type for a required legal document */
export enum LegalDocumentService {
  DROPBOX_FORMS = 'DROPBOX_FORMS',
  OPENCOLLECTIVE = 'OPENCOLLECTIVE'
}

/** Type for a required legal document */
export enum LegalDocumentType {
  /** US tax form (W9, W8BEN, W8BEN-E) */
  US_TAX_FORM = 'US_TAX_FORM'
}

/** Type for Geographic location */
export type Location = {
  __typename?: 'Location';
  /** Postal address without country (eg. 12 opensource avenue, 7500 Paris) */
  address?: Maybe<Scalars['String']['output']>;
  /** Two letters country code (eg. FR, BE...etc) */
  country?: Maybe<Scalars['String']['output']>;
  /** Unique identifier for this location */
  id?: Maybe<Scalars['String']['output']>;
  /** Latitude */
  lat?: Maybe<Scalars['Float']['output']>;
  /** Longitude */
  long?: Maybe<Scalars['Float']['output']>;
  /** A short name for the location (eg. Open Collective Headquarters) */
  name?: Maybe<Scalars['String']['output']>;
  /** Structured JSON address */
  structured?: Maybe<Scalars['JSON']['output']>;
};

/** Input type for Geographic location */
export type LocationInput = {
  /** Postal address without country (eg. 12 opensource avenue, 7500 Paris) */
  address?: InputMaybe<Scalars['String']['input']>;
  /** Two letters country code (eg. FR, BE...etc) */
  country?: InputMaybe<CountryIso>;
  /** Latitude */
  lat?: InputMaybe<Scalars['Float']['input']>;
  /** Longitude */
  long?: InputMaybe<Scalars['Float']['input']>;
  /** A short name for the location (eg. Open Collective Headquarters) */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Structured JSON address */
  structured?: InputMaybe<Scalars['JSON']['input']>;
};

export type Maximum_Virtual_Card_Limit_Amount_For_Interval = {
  __typename?: 'MAXIMUM_VIRTUAL_CARD_LIMIT_AMOUNT_FOR_INTERVAL';
  ALL_TIME?: Maybe<Amount>;
  DAILY?: Maybe<Amount>;
  MONTHLY?: Maybe<Amount>;
  PER_AUTHORIZATION?: Maybe<Amount>;
  WEEKLY?: Maybe<Amount>;
  YEARLY?: Maybe<Amount>;
};

export enum MarkAsUnPaidExpenseStatus {
  APPROVED = 'APPROVED',
  ERROR = 'ERROR',
  INCOMPLETE = 'INCOMPLETE'
}

/** This represents a Member relationship (ie: Organization backing a Collective) */
export type Member = {
  __typename?: 'Member';
  account?: Maybe<Account>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** Custom user description */
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  /** If membership is inherited from parent collective */
  inherited?: Maybe<Scalars['Boolean']['output']>;
  /** Custom user message from member to the collective */
  publicMessage?: Maybe<Scalars['String']['output']>;
  role?: Maybe<MemberRole>;
  since?: Maybe<Scalars['DateTime']['output']>;
  tier?: Maybe<Tier>;
  /** Total amount donated */
  totalDonations: Amount;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** A collection of "Members" (ie: Organization backing a Collective) */
export type MemberCollection = Collection & {
  __typename?: 'MemberCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Member>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An invitation to join the members of a collective */
export type MemberInvitation = {
  __typename?: 'MemberInvitation';
  account: Account;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  /** The person who invited the member, if any */
  inviter?: Maybe<Individual>;
  memberAccount: Account;
  role: MemberRole;
  since?: Maybe<Scalars['DateTime']['output']>;
  tier?: Maybe<Tier>;
};

export type MemberInvitationReferenceInput = {
  /** The public id identifying the member invitation (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The internal id of the invitation (ie: 580) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** This represents a MemberOf relationship (ie: Collective backed by an Organization) */
export type MemberOf = {
  __typename?: 'MemberOf';
  account?: Maybe<Account>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** Custom user description */
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  /** If membership is inherited from parent collective */
  inherited?: Maybe<Scalars['Boolean']['output']>;
  /** Custom user message from member to the collective */
  publicMessage?: Maybe<Scalars['String']['output']>;
  role?: Maybe<MemberRole>;
  since?: Maybe<Scalars['DateTime']['output']>;
  tier?: Maybe<Tier>;
  /** Total amount donated */
  totalDonations: Amount;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** A collection of "MemberOf" (ie: Collective backed by an Organization) */
export type MemberOfCollection = Collection & {
  __typename?: 'MemberOfCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<MemberOf>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  roles?: Maybe<Array<Maybe<MemberOfCollectionRoles>>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An existing member role and account type combination used used to filter collections */
export type MemberOfCollectionRoles = {
  __typename?: 'MemberOfCollectionRoles';
  role: MemberRole;
  type: AccountType;
};

/** All member roles */
export enum MemberRole {
  ACCOUNTANT = 'ACCOUNTANT',
  ADMIN = 'ADMIN',
  ATTENDEE = 'ATTENDEE',
  BACKER = 'BACKER',
  CONNECTED_ACCOUNT = 'CONNECTED_ACCOUNT',
  CONTRIBUTOR = 'CONTRIBUTOR',
  FOLLOWER = 'FOLLOWER',
  /** @deprecated 2022-09-12: This role does not exist anymore */
  FUNDRAISER = 'FUNDRAISER',
  HOST = 'HOST',
  MEMBER = 'MEMBER'
}

export type MergeAccountsResponse = {
  __typename?: 'MergeAccountsResponse';
  /** The resulting account */
  account: Account;
  /** A message to display to the user about the result */
  message?: Maybe<Scalars['String']['output']>;
};

/** This is the root mutation */
export type Mutation = {
  __typename?: 'Mutation';
  /** Add an agreement for the given host account. Scope: "host". */
  addAgreement: Agreement;
  /** Add a new payment method to be used with an Order. Scope: "orders". */
  addCreditCard: CreditCardWithStripeError;
  /** Add an emoji reaction. Scope: "conversations", "expenses" or "updates". */
  addEmojiReaction: EmojiReactionResponse;
  /** Add funds to the given account. Scope: "host". */
  addFunds: Order;
  /** Adds a Stripe payment method */
  addStripePaymentMethodFromSetupIntent: PaymentMethod;
  /** Add 2FA to the Individual if it does not have it. Scope: "account". */
  addTwoFactorAuthTokenToIndividual: AddTwoFactorAuthTokenToIndividualResponse;
  /** Apply to an host with a collective. Scope: "account". */
  applyToHost: Account;
  /** Assign Virtual Card information to existing hosted collective. Scope: "virtualCards". */
  assignNewVirtualCard: VirtualCard;
  /** [Root only] Ban accounts */
  banAccount: BanAccountResponse;
  /** Cancel an order. Scope: "orders". */
  cancelOrder?: Maybe<Order>;
  /** [Root only] Clears the cache for a given account */
  clearCacheForAccount: Account;
  /** Confirm a credit card is ready for use after strong customer authentication. Scope: "orders". */
  confirmCreditCard: CreditCardWithStripeError;
  /** Confirm email for Individual. Scope: "account". */
  confirmEmail: IndividualConfirmEmailResponse;
  /** Mark an account as confirmed */
  confirmGuestAccount: ConfirmGuestAccountResponse;
  /** Confirm an order (strong customer authentication). Scope: "orders". */
  confirmOrder: OrderWithPayment;
  /** Connect a Plaid account */
  connectPlaidAccount: PlaidConnectAccountResponse;
  /** Convert an organization to a vendor */
  convertOrganizationToVendor: Vendor;
  createApplication?: Maybe<Application>;
  /** Create a Collective. Scope: "account". */
  createCollective?: Maybe<Collective>;
  /** Create a comment. Scope: "conversations", "expenses" or "updates". */
  createComment?: Maybe<Comment>;
  /** Connect external account to Open Collective Account. Scope: "connectedAccounts". */
  createConnectedAccount?: Maybe<ConnectedAccount>;
  /** Create a conversation. Scope: "conversations". */
  createConversation?: Maybe<Conversation>;
  /** Create an Event. Scope: "account". */
  createEvent?: Maybe<Event>;
  /** Submit an expense to a collective. Scope: "expenses". */
  createExpense: Expense;
  /** Create a Fund. Scope: "account". */
  createFund?: Maybe<Fund>;
  /** [Root only] Create a member entry directly. For non-root users, use `inviteMember` */
  createMember: Member;
  /** To submit a new order. Scope: "orders". */
  createOrder: OrderWithPayment;
  /** Create an Organization. Scope: "account". */
  createOrganization?: Maybe<Organization>;
  /** Creates a Stripe payment intent */
  createPaymentIntent: PaymentIntent;
  /** Create a new Payout Method to get paid through the platform. Scope: "expenses". */
  createPayoutMethod?: Maybe<PayoutMethod>;
  /** To submit a new order. Scope: "orders". */
  createPendingOrder: Order;
  createPersonalToken: PersonalToken;
  /** Create a Project. Scope: "account". */
  createProject?: Maybe<Project>;
  /** Creates a Stripe setup intent */
  createSetupIntent: SetupIntent;
  /** Create a tier. */
  createTier: Tier;
  /** Create a new import. To manually add transactions to it, use `importTransactions`. */
  createTransactionsImport: TransactionsImport;
  /** Create update. Scope: "updates". */
  createUpdate: Update;
  /** Create a new vendor for given host */
  createVendor: Vendor;
  /** Create new Stripe Virtual Card for existing hosted collective. Scope: "virtualCards". */
  createVirtualCard: VirtualCard;
  /** Create WebAuthn public key registration request options */
  createWebAuthnRegistrationOptions: Scalars['JSON']['output'];
  /** Create webhook. Scope: "webhooks". */
  createWebhook?: Maybe<Webhook>;
  /** Adds or removes a policy on a given account. Scope: "account". */
  deleteAccount?: Maybe<Account>;
  /** Delete an agreement for the given host account. Scope: "host". */
  deleteAgreement: Agreement;
  deleteApplication?: Maybe<Application>;
  deleteComment?: Maybe<Comment>;
  /** Delete ConnectedAccount. Scope: "connectedAccounts". */
  deleteConnectedAccount?: Maybe<ConnectedAccount>;
  /** Delete an expense. Only work if the expense is rejected - please check permissions.canDelete. Scope: "expenses". */
  deleteExpense: Expense;
  deletePersonalToken?: Maybe<PersonalToken>;
  /** Delete a tier. */
  deleteTier: Tier;
  /** Delete an import and all its associated rows */
  deleteTransactionsImport: Scalars['Boolean']['output'];
  /** Delete update. Scope: "updates". */
  deleteUpdate: Update;
  /** Delete a vendor */
  deleteVendor: Scalars['Boolean']['output'];
  /** Delete Virtual Card. Scope: "virtualCards". */
  deleteVirtualCard?: Maybe<Scalars['Boolean']['output']>;
  /** Delete webhook. Scope: "webhooks". */
  deleteWebhook?: Maybe<Webhook>;
  /** Persist an Expense as a draft and invite someone to edit and submit it. Scope: "expenses". */
  draftExpenseAndInviteUser: Expense;
  /** Duplicate an account. Scope: "account". */
  duplicateAccount: Account;
  /** Edit key properties of an account. Scope: "account". */
  editAccount: Host;
  /** An endpoint for hosts to edit the fees structure of their hosted accounts. Scope: "host". */
  editAccountFeeStructure: Account;
  /** [Root only] Edits account flags (deleted, banned, archived, trusted host) */
  editAccountFlags: Account;
  /** An endpoint for hosts to edit the freeze status of their hosted accounts. Scope: "host". */
  editAccountFreezeStatus: Account;
  /** Edit the settings for the given account. Scope: "account" or "host". */
  editAccountSetting: Account;
  /** [Root only] Edits account type from User to Organization */
  editAccountType: Account;
  /** Edit an accounting category. Returns the account with the updated categories. */
  editAccountingCategories: Account;
  /** Add funds to the given account. Scope: "host". */
  editAddedFunds: Order;
  /** Edit an agreement for the given host account. Scope: "host". */
  editAgreement: Agreement;
  /** Edit a comment. Scope: "conversations", "expenses" or "updates". */
  editComment?: Maybe<Comment>;
  /** Edit a conversation. Scope: "conversations". */
  editConversation?: Maybe<Conversation>;
  /** To update an existing expense */
  editExpense: Expense;
  /** Edit the status of a legal document */
  editLegalDocumentStatus: LegalDocument;
  /** Edit an existing member of the Collective. Scope: "account". */
  editMember: Member;
  /** Edit an existing member invitation of the Collective. Scope: "account". */
  editMemberInvitation?: Maybe<MemberInvitation>;
  /** To edit a pending order. Scope: "orders". */
  editPendingOrder: Order;
  /** Edit the public message for the given Member of a Collective. Scope: "account". */
  editPublicMessage: Member;
  /** Edit a tier. */
  editTier: Tier;
  /** Edit an import */
  editTransactionsImport: TransactionsImport;
  /** Edit 2FA method */
  editTwoFactorAuthenticationMethod: Individual;
  /** Edit update. Scope: "updates". */
  editUpdate: Update;
  /** Edit an existing vendor */
  editVendor: Vendor;
  /** Edit existing Virtual Card information. Scope: "virtualCards". */
  editVirtualCard: VirtualCard;
  /** Follows a given Collective. Scope: "account" */
  followAccount: FollowAccountResult;
  /** Returns true if user is following, false otherwise. Must be authenticated. Scope: "conversations". */
  followConversation?: Maybe<Scalars['Boolean']['output']>;
  /** Generate a Plaid Link token */
  generatePlaidLinkToken: PlaidLinkTokenCreateResponse;
  /** Import transactions, manually or from a CSV file */
  importTransactions: TransactionsImport;
  /** Invite a new member to the Collective. Scope: "account". */
  inviteMember: MemberInvitation;
  /** [Root only] Merge two accounts, returns the result account */
  mergeAccounts: MergeAccountsResponse;
  /** [Root only] A mutation to move expenses from one account to another */
  moveExpenses: Array<Maybe<Expense>>;
  /** [Root only] A mutation to move orders from one account to another */
  moveOrders: Array<Maybe<Order>>;
  /** Pause active Virtual Card. Scope: "virtualCards". */
  pauseVirtualCard: VirtualCard;
  /** Process the expense with the given action. Scope: "expenses". */
  processExpense: Expense;
  /** Reply to a host application. Scope: "host". */
  processHostApplication: ProcessHostApplicationResponse;
  /** A mutation for the host to approve or reject an order. Scope: "orders". */
  processPendingOrder: Order;
  /** Publish update. Scope: "updates". */
  publishUpdate: Update;
  /** Refunds a transaction. Scope: "transactions". */
  refundTransaction?: Maybe<Transaction>;
  /** Regenerate two factor authentication recovery codes */
  regenerateRecoveryCodes?: Maybe<Array<Scalars['String']['output']>>;
  /** Rejects transaction, removes member from Collective, and sends a message to the contributor. Scope: "transactions". */
  rejectTransaction: Transaction;
  /** Reject a virtual card request. Scope: "virtualCards" */
  rejectVirtualCardRequest: VirtualCardRequest;
  /** Remove an emoji reaction. Scope: "conversations", "expenses" or "updates". */
  removeEmojiReaction: EmojiReactionResponse;
  /** Removes the host for an account */
  removeHost: Account;
  /** Remove a member from the Collective. Scope: "account". */
  removeMember?: Maybe<Scalars['Boolean']['output']>;
  /** Remove the given payout method. Scope: "expenses". */
  removePayoutMethod: PayoutMethod;
  /** Remove 2FA from the Individual if it has been enabled. Scope: "account". */
  removeTwoFactorAuthTokenFromIndividual: Individual;
  /** Endpoint to accept or reject an invitation to become a member. Scope: "account". */
  replyToMemberInvitation: Scalars['Boolean']['output'];
  /** Request Virtual Card to host. Scope: "virtualCards". */
  requestVirtualCard?: Maybe<Scalars['Boolean']['output']>;
  /** To re-send the invitation to complete a draft expense. Scope: "expenses". */
  resendDraftExpenseInvite: Expense;
  /** Resume paused Virtual Card. Scope: "virtualCards". */
  resumeVirtualCard: VirtualCard;
  /** Revoke an OAuth authorization. Scope: "account". */
  revokeOAuthAuthorization: OAuthAuthorization;
  /** [Root only] Anonymizes an account */
  rootAnonymizeAccount: Account;
  /** Sends an email for guest to confirm their emails and create their Open Collective account */
  sendGuestConfirmationEmail: Scalars['Boolean']['output'];
  /** Send a message to an account. Scope: "account" */
  sendMessage?: Maybe<SendMessageResult>;
  /** Send In-App Survey response */
  sendSurveyResponse?: Maybe<Scalars['Boolean']['output']>;
  /** Update the time which the user viewed the changelog updates. Scope: "account". */
  setChangelogViewDate: Individual;
  /** Set email notification subscription for requesting logged-in user */
  setEmailNotification?: Maybe<ActivitySubscription>;
  /** Update newsletter opt-in preference. Scope: "account". */
  setNewsletterOptIn: Individual;
  /** Set password to Individual. Scope: "account". 2FA. */
  setPassword: SetPasswordResponse;
  /** Adds or removes a policy on a given account. Scope: "account". */
  setPolicies: Account;
  setTags: TagResponse;
  /** Starts or resumes the process of notifying contributors for their PAUSED contributions */
  startResumeOrdersProcess: Account;
  /** Submit a legal document */
  submitLegalDocument: LegalDocument;
  /** Manually request a sync for Plaid account */
  syncPlaidAccount: TransactionsImport;
  /** Unfollows a given Collective. Scope: "account" */
  unfollowAccount: UnfollowAccountResult;
  /** Unpublish update. Scope: "updates". */
  unpublishUpdate: Update;
  updateApplication?: Maybe<Application>;
  /** Update an Order's amount, tier, or payment method. Scope: "orders". */
  updateOrder?: Maybe<Order>;
  /** Update the accounting category of an order. Scope: "orders". */
  updateOrderAccountingCategory: Order;
  updatePersonalToken: PersonalToken;
  /** Updates collective social links */
  updateSocialLinks: Array<SocialLink>;
  /** Update transactions import rows to set new values or mark them as dismissed */
  updateTransactionsImportRows: TransactionsImport;
  /** Update webhook. Scope: "webhooks". */
  updateWebhook?: Maybe<Webhook>;
  uploadFile: Array<UploadFileResult>;
};


/** This is the root mutation */
export type MutationAddAgreementArgs = {
  account: AccountReferenceInput;
  attachment?: InputMaybe<Scalars['Upload']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  host: AccountReferenceInput;
  notes?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['NonEmptyString']['input'];
};


/** This is the root mutation */
export type MutationAddCreditCardArgs = {
  account: AccountReferenceInput;
  creditCardInfo: CreditCardCreateInput;
  isSavedForLater?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};


/** This is the root mutation */
export type MutationAddEmojiReactionArgs = {
  comment?: InputMaybe<CommentReferenceInput>;
  emoji: Scalars['String']['input'];
  update?: InputMaybe<UpdateReferenceInput>;
};


/** This is the root mutation */
export type MutationAddFundsArgs = {
  account: AccountReferenceInput;
  accountingCategory?: InputMaybe<AccountingCategoryReferenceInput>;
  amount: AmountInput;
  description: Scalars['String']['input'];
  fromAccount: AccountReferenceInput;
  hostFeePercent?: InputMaybe<Scalars['Float']['input']>;
  invoiceTemplate?: InputMaybe<Scalars['String']['input']>;
  memo?: InputMaybe<Scalars['String']['input']>;
  paymentProcessorFee?: InputMaybe<AmountInput>;
  processedAt?: InputMaybe<Scalars['DateTime']['input']>;
  tax?: InputMaybe<TaxInput>;
  tier?: InputMaybe<TierReferenceInput>;
  transactionsImportRow?: InputMaybe<TransactionsImportRowReferenceInput>;
};


/** This is the root mutation */
export type MutationAddStripePaymentMethodFromSetupIntentArgs = {
  account: AccountReferenceInput;
  setupIntent: SetupIntentInput;
};


/** This is the root mutation */
export type MutationAddTwoFactorAuthTokenToIndividualArgs = {
  account: AccountReferenceInput;
  token: Scalars['String']['input'];
  type?: InputMaybe<TwoFactorMethod>;
};


/** This is the root mutation */
export type MutationApplyToHostArgs = {
  applicationData?: InputMaybe<Scalars['JSON']['input']>;
  collective: AccountReferenceInput;
  host: AccountReferenceInput;
  inviteMembers?: InputMaybe<Array<InputMaybe<InviteMemberInput>>>;
  message?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root mutation */
export type MutationAssignNewVirtualCardArgs = {
  account: AccountReferenceInput;
  assignee: AccountReferenceInput;
  virtualCard: VirtualCardInput;
};


/** This is the root mutation */
export type MutationBanAccountArgs = {
  account: Array<AccountReferenceInput>;
  dryRun: Scalars['Boolean']['input'];
  includeAssociatedAccounts: Scalars['Boolean']['input'];
};


/** This is the root mutation */
export type MutationCancelOrderArgs = {
  order: OrderReferenceInput;
  reason?: InputMaybe<Scalars['String']['input']>;
  reasonCode?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root mutation */
export type MutationClearCacheForAccountArgs = {
  account: AccountReferenceInput;
  type?: Array<InputMaybe<AccountCacheType>>;
};


/** This is the root mutation */
export type MutationConfirmCreditCardArgs = {
  paymentMethod: PaymentMethodReferenceInput;
};


/** This is the root mutation */
export type MutationConfirmEmailArgs = {
  token: Scalars['NonEmptyString']['input'];
};


/** This is the root mutation */
export type MutationConfirmGuestAccountArgs = {
  email: Scalars['EmailAddress']['input'];
  emailConfirmationToken: Scalars['String']['input'];
};


/** This is the root mutation */
export type MutationConfirmOrderArgs = {
  guestToken?: InputMaybe<Scalars['String']['input']>;
  order: OrderReferenceInput;
};


/** This is the root mutation */
export type MutationConnectPlaidAccountArgs = {
  host: AccountReferenceInput;
  name?: InputMaybe<Scalars['String']['input']>;
  publicToken: Scalars['String']['input'];
  sourceName?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root mutation */
export type MutationConvertOrganizationToVendorArgs = {
  host: AccountReferenceInput;
  organization: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationCreateApplicationArgs = {
  application: ApplicationCreateInput;
};


/** This is the root mutation */
export type MutationCreateCollectiveArgs = {
  applicationData?: InputMaybe<Scalars['JSON']['input']>;
  collective: CollectiveCreateInput;
  host?: InputMaybe<AccountReferenceInput>;
  inviteMembers?: InputMaybe<Array<InputMaybe<InviteMemberInput>>>;
  message?: InputMaybe<Scalars['String']['input']>;
  skipApprovalTestOnly?: InputMaybe<Scalars['Boolean']['input']>;
  skipDefaultAdmin?: InputMaybe<Scalars['Boolean']['input']>;
  testPayload?: InputMaybe<Scalars['JSON']['input']>;
  user?: InputMaybe<IndividualCreateInput>;
};


/** This is the root mutation */
export type MutationCreateCommentArgs = {
  comment: CommentCreateInput;
};


/** This is the root mutation */
export type MutationCreateConnectedAccountArgs = {
  account: AccountReferenceInput;
  connectedAccount: ConnectedAccountCreateInput;
};


/** This is the root mutation */
export type MutationCreateConversationArgs = {
  CollectiveId?: InputMaybe<Scalars['String']['input']>;
  account?: InputMaybe<AccountReferenceInput>;
  html: Scalars['String']['input'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title: Scalars['String']['input'];
};


/** This is the root mutation */
export type MutationCreateEventArgs = {
  account: AccountReferenceInput;
  event: EventCreateInput;
};


/** This is the root mutation */
export type MutationCreateExpenseArgs = {
  account: AccountReferenceInput;
  expense: ExpenseCreateInput;
  privateComment?: InputMaybe<Scalars['String']['input']>;
  recurring?: InputMaybe<RecurringExpenseInput>;
  transactionsImportRow?: InputMaybe<TransactionsImportRowReferenceInput>;
};


/** This is the root mutation */
export type MutationCreateFundArgs = {
  fund: FundCreateInput;
  host?: InputMaybe<AccountReferenceInput>;
};


/** This is the root mutation */
export type MutationCreateMemberArgs = {
  account: AccountReferenceInput;
  description?: InputMaybe<Scalars['String']['input']>;
  memberAccount: AccountReferenceInput;
  role: MemberRole;
  since?: InputMaybe<Scalars['DateTime']['input']>;
};


/** This is the root mutation */
export type MutationCreateOrderArgs = {
  order: OrderCreateInput;
};


/** This is the root mutation */
export type MutationCreateOrganizationArgs = {
  inviteMembers?: InputMaybe<Array<InputMaybe<InviteMemberInput>>>;
  organization: OrganizationCreateInput;
};


/** This is the root mutation */
export type MutationCreatePaymentIntentArgs = {
  guestInfo?: InputMaybe<GuestInfoInput>;
  paymentIntent: PaymentIntentInput;
};


/** This is the root mutation */
export type MutationCreatePayoutMethodArgs = {
  account: AccountReferenceInput;
  payoutMethod: PayoutMethodInput;
};


/** This is the root mutation */
export type MutationCreatePendingOrderArgs = {
  order: PendingOrderCreateInput;
};


/** This is the root mutation */
export type MutationCreatePersonalTokenArgs = {
  personalToken: PersonalTokenCreateInput;
};


/** This is the root mutation */
export type MutationCreateProjectArgs = {
  disableContributions?: Scalars['Boolean']['input'];
  disableExpenses?: Scalars['Boolean']['input'];
  parent?: InputMaybe<AccountReferenceInput>;
  project: ProjectCreateInput;
};


/** This is the root mutation */
export type MutationCreateSetupIntentArgs = {
  account: AccountReferenceInput;
  host: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationCreateTierArgs = {
  account: AccountReferenceInput;
  tier: TierCreateInput;
};


/** This is the root mutation */
export type MutationCreateTransactionsImportArgs = {
  account: AccountReferenceInput;
  name: Scalars['NonEmptyString']['input'];
  source: Scalars['NonEmptyString']['input'];
  type: TransactionsImportType;
};


/** This is the root mutation */
export type MutationCreateUpdateArgs = {
  update: UpdateCreateInput;
};


/** This is the root mutation */
export type MutationCreateVendorArgs = {
  host: AccountReferenceInput;
  vendor: VendorCreateInput;
};


/** This is the root mutation */
export type MutationCreateVirtualCardArgs = {
  account: AccountReferenceInput;
  assignee: AccountReferenceInput;
  limitAmount: AmountInput;
  limitInterval: VirtualCardLimitInterval;
  name: Scalars['String']['input'];
  virtualCardRequest?: InputMaybe<VirtualCardRequestReferenceInput>;
};


/** This is the root mutation */
export type MutationCreateWebAuthnRegistrationOptionsArgs = {
  account: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationCreateWebhookArgs = {
  webhook: WebhookCreateInput;
};


/** This is the root mutation */
export type MutationDeleteAccountArgs = {
  account: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationDeleteAgreementArgs = {
  agreement: AgreementReferenceInput;
};


/** This is the root mutation */
export type MutationDeleteApplicationArgs = {
  application: ApplicationReferenceInput;
};


/** This is the root mutation */
export type MutationDeleteCommentArgs = {
  id: Scalars['String']['input'];
};


/** This is the root mutation */
export type MutationDeleteConnectedAccountArgs = {
  connectedAccount: ConnectedAccountReferenceInput;
};


/** This is the root mutation */
export type MutationDeleteExpenseArgs = {
  expense: ExpenseReferenceInput;
};


/** This is the root mutation */
export type MutationDeletePersonalTokenArgs = {
  personalToken: PersonalTokenReferenceInput;
};


/** This is the root mutation */
export type MutationDeleteTierArgs = {
  stopRecurringContributions?: Scalars['Boolean']['input'];
  tier: TierReferenceInput;
};


/** This is the root mutation */
export type MutationDeleteTransactionsImportArgs = {
  id: Scalars['NonEmptyString']['input'];
};


/** This is the root mutation */
export type MutationDeleteUpdateArgs = {
  id: Scalars['String']['input'];
};


/** This is the root mutation */
export type MutationDeleteVendorArgs = {
  vendor: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationDeleteVirtualCardArgs = {
  virtualCard: VirtualCardReferenceInput;
};


/** This is the root mutation */
export type MutationDeleteWebhookArgs = {
  webhook: WebhookReferenceInput;
};


/** This is the root mutation */
export type MutationDraftExpenseAndInviteUserArgs = {
  account: AccountReferenceInput;
  expense: ExpenseInviteDraftInput;
  lockedFields?: InputMaybe<Array<InputMaybe<ExpenseLockableFields>>>;
  skipInvite?: Scalars['Boolean']['input'];
};


/** This is the root mutation */
export type MutationDuplicateAccountArgs = {
  account: AccountReferenceInput;
  connect?: Scalars['Boolean']['input'];
  include?: InputMaybe<DuplicateAccountDataTypeInput>;
  newName?: InputMaybe<Scalars['String']['input']>;
  newSlug?: InputMaybe<Scalars['String']['input']>;
  oldName?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root mutation */
export type MutationEditAccountArgs = {
  account: AccountUpdateInput;
};


/** This is the root mutation */
export type MutationEditAccountFeeStructureArgs = {
  account: AccountReferenceInput;
  hostFeePercent: Scalars['Float']['input'];
  isCustomFee: Scalars['Boolean']['input'];
};


/** This is the root mutation */
export type MutationEditAccountFlagsArgs = {
  account: AccountReferenceInput;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isTrustedHost?: InputMaybe<Scalars['Boolean']['input']>;
  isTwoFactorAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This is the root mutation */
export type MutationEditAccountFreezeStatusArgs = {
  account: AccountReferenceInput;
  action: AccountFreezeAction;
  message?: InputMaybe<Scalars['String']['input']>;
  messageForAccountAdmins?: InputMaybe<Scalars['String']['input']>;
  messageForContributors?: InputMaybe<Scalars['String']['input']>;
  pauseExistingRecurringContributions?: Scalars['Boolean']['input'];
};


/** This is the root mutation */
export type MutationEditAccountSettingArgs = {
  account: AccountReferenceInput;
  key: Scalars['AccountSettingsKey']['input'];
  value: Scalars['JSON']['input'];
};


/** This is the root mutation */
export type MutationEditAccountTypeArgs = {
  account: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationEditAccountingCategoriesArgs = {
  account: AccountReferenceInput;
  categories: Array<AccountingCategoryInput>;
};


/** This is the root mutation */
export type MutationEditAddedFundsArgs = {
  account: AccountReferenceInput;
  accountingCategory?: InputMaybe<AccountingCategoryReferenceInput>;
  amount: AmountInput;
  description: Scalars['String']['input'];
  fromAccount: AccountReferenceInput;
  hostFeePercent?: InputMaybe<Scalars['Float']['input']>;
  invoiceTemplate?: InputMaybe<Scalars['String']['input']>;
  memo?: InputMaybe<Scalars['String']['input']>;
  order: OrderReferenceInput;
  paymentProcessorFee?: InputMaybe<AmountInput>;
  processedAt?: InputMaybe<Scalars['DateTime']['input']>;
  tax?: InputMaybe<TaxInput>;
  tier?: InputMaybe<TierReferenceInput>;
};


/** This is the root mutation */
export type MutationEditAgreementArgs = {
  agreement: AgreementReferenceInput;
  attachment?: InputMaybe<Scalars['Upload']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['NonEmptyString']['input']>;
};


/** This is the root mutation */
export type MutationEditCommentArgs = {
  comment: CommentUpdateInput;
};


/** This is the root mutation */
export type MutationEditConversationArgs = {
  id: Scalars['String']['input'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title: Scalars['String']['input'];
};


/** This is the root mutation */
export type MutationEditExpenseArgs = {
  draftKey?: InputMaybe<Scalars['String']['input']>;
  expense: ExpenseUpdateInput;
};


/** This is the root mutation */
export type MutationEditLegalDocumentStatusArgs = {
  file?: InputMaybe<Scalars['Upload']['input']>;
  host: AccountReferenceInput;
  id: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  status: LegalDocumentRequestStatus;
};


/** This is the root mutation */
export type MutationEditMemberArgs = {
  account: AccountReferenceInput;
  description?: InputMaybe<Scalars['String']['input']>;
  memberAccount: AccountReferenceInput;
  role?: InputMaybe<MemberRole>;
  since?: InputMaybe<Scalars['DateTime']['input']>;
};


/** This is the root mutation */
export type MutationEditMemberInvitationArgs = {
  account: AccountReferenceInput;
  description?: InputMaybe<Scalars['String']['input']>;
  memberAccount: AccountReferenceInput;
  role?: InputMaybe<MemberRole>;
  since?: InputMaybe<Scalars['DateTime']['input']>;
};


/** This is the root mutation */
export type MutationEditPendingOrderArgs = {
  order: PendingOrderEditInput;
};


/** This is the root mutation */
export type MutationEditPublicMessageArgs = {
  fromAccount: AccountReferenceInput;
  message?: InputMaybe<Scalars['String']['input']>;
  toAccount: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationEditTierArgs = {
  tier: TierUpdateInput;
};


/** This is the root mutation */
export type MutationEditTransactionsImportArgs = {
  id: Scalars['NonEmptyString']['input'];
  name?: InputMaybe<Scalars['NonEmptyString']['input']>;
  source?: InputMaybe<Scalars['NonEmptyString']['input']>;
};


/** This is the root mutation */
export type MutationEditTwoFactorAuthenticationMethodArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
  userTwoFactorMethod: UserTwoFactorMethodReferenceInput;
};


/** This is the root mutation */
export type MutationEditUpdateArgs = {
  update: UpdateUpdateInput;
};


/** This is the root mutation */
export type MutationEditVendorArgs = {
  archive?: InputMaybe<Scalars['Boolean']['input']>;
  vendor: VendorEditInput;
};


/** This is the root mutation */
export type MutationEditVirtualCardArgs = {
  assignee?: InputMaybe<AccountReferenceInput>;
  limitAmount?: InputMaybe<AmountInput>;
  limitInterval?: InputMaybe<VirtualCardLimitInterval>;
  name?: InputMaybe<Scalars['String']['input']>;
  virtualCard: VirtualCardReferenceInput;
};


/** This is the root mutation */
export type MutationFollowAccountArgs = {
  account: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationFollowConversationArgs = {
  id: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This is the root mutation */
export type MutationImportTransactionsArgs = {
  csvConfig?: InputMaybe<Scalars['JSONObject']['input']>;
  data: Array<TransactionsImportRowCreateInput>;
  file?: InputMaybe<Scalars['Upload']['input']>;
  id: Scalars['NonEmptyString']['input'];
};


/** This is the root mutation */
export type MutationInviteMemberArgs = {
  account: AccountReferenceInput;
  description?: InputMaybe<Scalars['String']['input']>;
  memberAccount: AccountReferenceInput;
  role: MemberRole;
  since?: InputMaybe<Scalars['DateTime']['input']>;
};


/** This is the root mutation */
export type MutationMergeAccountsArgs = {
  dryRun?: Scalars['Boolean']['input'];
  fromAccount: AccountReferenceInput;
  toAccount: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationMoveExpensesArgs = {
  destinationAccount: AccountReferenceInput;
  expenses: Array<ExpenseReferenceInput>;
};


/** This is the root mutation */
export type MutationMoveOrdersArgs = {
  fromAccount?: InputMaybe<AccountReferenceInput>;
  makeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  orders: Array<OrderReferenceInput>;
  tier?: InputMaybe<TierReferenceInput>;
};


/** This is the root mutation */
export type MutationPauseVirtualCardArgs = {
  virtualCard: VirtualCardReferenceInput;
};


/** This is the root mutation */
export type MutationProcessExpenseArgs = {
  action: ExpenseProcessAction;
  draftKey?: InputMaybe<Scalars['String']['input']>;
  expense: ExpenseReferenceInput;
  message?: InputMaybe<Scalars['String']['input']>;
  paymentParams?: InputMaybe<ProcessExpensePaymentParams>;
};


/** This is the root mutation */
export type MutationProcessHostApplicationArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  action: ProcessHostApplicationAction;
  host?: InputMaybe<AccountReferenceInput>;
  hostApplication?: InputMaybe<HostApplicationReferenceInput>;
  message?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root mutation */
export type MutationProcessPendingOrderArgs = {
  action: ProcessOrderAction;
  order: OrderUpdateInput;
};


/** This is the root mutation */
export type MutationPublishUpdateArgs = {
  id: Scalars['String']['input'];
  notificationAudience?: InputMaybe<UpdateAudience>;
};


/** This is the root mutation */
export type MutationRefundTransactionArgs = {
  ignoreBalanceCheck?: InputMaybe<Scalars['Boolean']['input']>;
  transaction: TransactionReferenceInput;
};


/** This is the root mutation */
export type MutationRejectTransactionArgs = {
  message?: InputMaybe<Scalars['String']['input']>;
  transaction: TransactionReferenceInput;
};


/** This is the root mutation */
export type MutationRejectVirtualCardRequestArgs = {
  virtualCardRequest?: InputMaybe<VirtualCardRequestReferenceInput>;
};


/** This is the root mutation */
export type MutationRemoveEmojiReactionArgs = {
  comment?: InputMaybe<CommentReferenceInput>;
  emoji: Scalars['String']['input'];
  update?: InputMaybe<UpdateReferenceInput>;
};


/** This is the root mutation */
export type MutationRemoveHostArgs = {
  account: AccountReferenceInput;
  message?: InputMaybe<Scalars['String']['input']>;
  messageForContributors?: InputMaybe<Scalars['String']['input']>;
  pauseContributions?: Scalars['Boolean']['input'];
};


/** This is the root mutation */
export type MutationRemoveMemberArgs = {
  account: AccountReferenceInput;
  isInvitation?: InputMaybe<Scalars['Boolean']['input']>;
  memberAccount: AccountReferenceInput;
  role: MemberRole;
};


/** This is the root mutation */
export type MutationRemovePayoutMethodArgs = {
  payoutMethodId: Scalars['String']['input'];
};


/** This is the root mutation */
export type MutationRemoveTwoFactorAuthTokenFromIndividualArgs = {
  account: AccountReferenceInput;
  code?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<TwoFactorMethod>;
  userTwoFactorMethod?: InputMaybe<UserTwoFactorMethodReferenceInput>;
};


/** This is the root mutation */
export type MutationReplyToMemberInvitationArgs = {
  accept: Scalars['Boolean']['input'];
  invitation: MemberInvitationReferenceInput;
};


/** This is the root mutation */
export type MutationRequestVirtualCardArgs = {
  account: AccountReferenceInput;
  budget?: InputMaybe<Scalars['Int']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  spendingLimitAmount?: InputMaybe<AmountInput>;
  spendingLimitInterval?: InputMaybe<VirtualCardLimitInterval>;
};


/** This is the root mutation */
export type MutationResendDraftExpenseInviteArgs = {
  expense: ExpenseReferenceInput;
};


/** This is the root mutation */
export type MutationResumeVirtualCardArgs = {
  virtualCard: VirtualCardReferenceInput;
};


/** This is the root mutation */
export type MutationRevokeOAuthAuthorizationArgs = {
  oAuthAuthorization: OAuthAuthorizationReferenceInput;
};


/** This is the root mutation */
export type MutationRootAnonymizeAccountArgs = {
  account: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationSendGuestConfirmationEmailArgs = {
  email: Scalars['EmailAddress']['input'];
};


/** This is the root mutation */
export type MutationSendMessageArgs = {
  account: AccountReferenceInput;
  message: Scalars['NonEmptyString']['input'];
  subject?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root mutation */
export type MutationSendSurveyResponseArgs = {
  okToContact?: InputMaybe<Scalars['Boolean']['input']>;
  responseId: Scalars['String']['input'];
  score: Scalars['Int']['input'];
  surveyKey: Scalars['String']['input'];
  text?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root mutation */
export type MutationSetChangelogViewDateArgs = {
  changelogViewDate: Scalars['DateTime']['input'];
};


/** This is the root mutation */
export type MutationSetEmailNotificationArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  active: Scalars['Boolean']['input'];
  type: ActivityAndClassesType;
};


/** This is the root mutation */
export type MutationSetNewsletterOptInArgs = {
  newsletterOptIn: Scalars['Boolean']['input'];
};


/** This is the root mutation */
export type MutationSetPasswordArgs = {
  currentPassword?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};


/** This is the root mutation */
export type MutationSetPoliciesArgs = {
  account: AccountReferenceInput;
  policies: PoliciesInput;
};


/** This is the root mutation */
export type MutationSetTagsArgs = {
  expense?: InputMaybe<ExpenseReferenceInput>;
  order?: InputMaybe<OrderReferenceInput>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


/** This is the root mutation */
export type MutationStartResumeOrdersProcessArgs = {
  account: AccountReferenceInput;
  message?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root mutation */
export type MutationSubmitLegalDocumentArgs = {
  account: AccountReferenceInput;
  formData: Scalars['JSON']['input'];
  type: LegalDocumentType;
};


/** This is the root mutation */
export type MutationSyncPlaidAccountArgs = {
  connectedAccount: ConnectedAccountReferenceInput;
};


/** This is the root mutation */
export type MutationUnfollowAccountArgs = {
  account: AccountReferenceInput;
};


/** This is the root mutation */
export type MutationUnpublishUpdateArgs = {
  id: Scalars['String']['input'];
};


/** This is the root mutation */
export type MutationUpdateApplicationArgs = {
  application: ApplicationUpdateInput;
};


/** This is the root mutation */
export type MutationUpdateOrderArgs = {
  amount?: InputMaybe<AmountInput>;
  order: OrderReferenceInput;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paypalSubscriptionId?: InputMaybe<Scalars['String']['input']>;
  tier?: InputMaybe<TierReferenceInput>;
};


/** This is the root mutation */
export type MutationUpdateOrderAccountingCategoryArgs = {
  accountingCategory?: InputMaybe<AccountingCategoryReferenceInput>;
  order: OrderReferenceInput;
};


/** This is the root mutation */
export type MutationUpdatePersonalTokenArgs = {
  personalToken: PersonalTokenUpdateInput;
};


/** This is the root mutation */
export type MutationUpdateSocialLinksArgs = {
  account: AccountReferenceInput;
  socialLinks: Array<SocialLinkInput>;
};


/** This is the root mutation */
export type MutationUpdateTransactionsImportRowsArgs = {
  dismissAll?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['NonEmptyString']['input'];
  restoreAll?: InputMaybe<Scalars['Boolean']['input']>;
  rows?: InputMaybe<Array<TransactionsImportRowUpdateInput>>;
};


/** This is the root mutation */
export type MutationUpdateWebhookArgs = {
  webhook: WebhookUpdateInput;
};


/** This is the root mutation */
export type MutationUploadFileArgs = {
  files: Array<UploadFileInput>;
};

export type NewAccountOrReferenceInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  /** The public id identifying the account (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /**
   * The internal id of the account (ie: 580)
   * @deprecated 2020-01-01: should only be used during the transition to GraphQL API v2.
   */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  newsletterOptIn?: InputMaybe<Scalars['Boolean']['input']>;
  organization?: InputMaybe<NewAccountOrganizationInput>;
  /** The slug identifying the account (ie: babel for https://opencollective.com/babel) */
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type NewAccountOrganizationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** A collection of "Application" */
export type OAuthApplicationCollection = Collection & {
  __typename?: 'OAuthApplicationCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Application>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An OAuth authorization */
export type OAuthAuthorization = {
  __typename?: 'OAuthAuthorization';
  account: Individual;
  application: Application;
  /** The time of creation */
  createdAt: Scalars['DateTime']['output'];
  /** The time of expiration */
  expiresAt: Scalars['DateTime']['output'];
  id?: Maybe<Scalars['String']['output']>;
  /** The last time of token was used */
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Whether this OAuth token is allowed to directly use operations that would normally require 2FA */
  preAuthorize2FA: Scalars['Boolean']['output'];
  /** The attached scopes. */
  scope?: Maybe<Array<Maybe<OAuthScope>>>;
  /** The time of last update */
  updatedAt: Scalars['DateTime']['output'];
};

/** A collection of "OAuth Authorizations" */
export type OAuthAuthorizationCollection = Collection & {
  __typename?: 'OAuthAuthorizationCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<OAuthAuthorization>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type OAuthAuthorizationReferenceInput = {
  /** The id identifying the OAuth Authorization (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
};

/** All supported OAuth scopes */
export enum OAuthScope {
  /** Manage your account, collectives and organizations. */
  account = 'account',
  /** Create and manage OAuth applications. */
  applications = 'applications',
  /** Create and manage connected accounts. */
  connectedAccounts = 'connectedAccounts',
  /** Create and manage conversations. */
  conversations = 'conversations',
  /** Access your email address. */
  email = 'email',
  /** Create and manage expenses, payout methods. */
  expenses = 'expenses',
  /** Administrate fiscal hosts. */
  host = 'host',
  /** Access your incognito account. */
  incognito = 'incognito',
  /** Create and manage contributions, payment methods. */
  orders = 'orders',
  /** Perform critical administrative operations. */
  root = 'root',
  /** Refund and reject recorded transactions. */
  transactions = 'transactions',
  /** Create and manage updates. */
  updates = 'updates',
  /** Create and manage virtual cards. */
  virtualCards = 'virtualCards',
  /** Create and manage webhooks */
  webhooks = 'webhooks'
}

/** To configure the OCR parsing */
export type OcrParsingOptionsInput = {
  /** The currency that you'd like to use for the amounts */
  currency?: InputMaybe<Currency>;
};

/** Order model */
export type Order = {
  __typename?: 'Order';
  /** The accounting category attached to this order */
  accountingCategory?: Maybe<AccountingCategory>;
  /** The list of activities (ie. approved, edited, etc) for this Order ordered by date ascending */
  activities: ActivityCollection;
  /** Base order amount (without platform tip) */
  amount: Amount;
  /** Returns the list of comments for this order, or `null` if user is not allowed to see them */
  comments?: Maybe<CommentCollection>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The account who created this order */
  createdByAccount?: Maybe<Account>;
  /** Custom data related to the order, based on the fields described by tier.customFields. Must be authenticated as an admin of the fromAccount or toAccount (returns null otherwise) */
  customData?: Maybe<Scalars['JSON']['output']>;
  /** Data related to the order */
  data?: Maybe<Scalars['JSON']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  frequency?: Maybe<ContributionFrequency>;
  fromAccount?: Maybe<Account>;
  /** Host fee percent attached to the Order. */
  hostFeePercent?: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  lastChargedAt?: Maybe<Scalars['DateTime']['output']>;
  legacyId: Scalars['Int']['output'];
  /** This represents a MemberOf relationship (ie: Collective backed by an Individual) attached to the Order. */
  membership?: Maybe<MemberOf>;
  /** Memo field which adds additional details about the order. For example in added funds this can be a note to mark what method (cheque, money order) the funds were received. */
  memo?: Maybe<Scalars['String']['output']>;
  /** Whether the order needs confirmation (3DSecure/SCA) */
  needsConfirmation?: Maybe<Scalars['Boolean']['output']>;
  nextChargeDate?: Maybe<Scalars['DateTime']['output']>;
  paymentMethod?: Maybe<PaymentMethod>;
  /** Payment processor fee attached to manually Added Funds. */
  paymentProcessorFee?: Maybe<Amount>;
  paymentProcessorUrl?: Maybe<Scalars['String']['output']>;
  /** Data about the pending contribution */
  pendingContributionData?: Maybe<PendingOrderData>;
  /** The permissions given to current logged in user for this order */
  permissions: OrderPermissions;
  /** Platform Tip attached to the Order. */
  platformTipAmount?: Maybe<Amount>;
  platformTipEligible?: Maybe<Scalars['Boolean']['output']>;
  /** Date the funds were received. */
  processedAt?: Maybe<Scalars['DateTime']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<OrderStatus>;
  tags: Array<Maybe<Scalars['String']['output']>>;
  tax?: Maybe<TaxInfo>;
  /** Tax amount */
  taxAmount?: Maybe<Amount>;
  /** @deprecated 2023-04-13: Please use `tax` instead. */
  taxes: Array<Maybe<OrderTax>>;
  tier?: Maybe<Tier>;
  toAccount?: Maybe<Account>;
  /** Total order amount, including all taxes and platform tip */
  totalAmount: Amount;
  /** Total amount contributed with this order. */
  totalContributed: Amount;
  /** WARNING: Total amount donated between collectives, though there will be edge cases especially when looking on the Order level, as the order id is not used in calculating this. */
  totalDonations: Amount;
  /** Transactions for this order ordered by createdAt ASC */
  transactions: Array<Maybe<Transaction>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


/** Order model */
export type OrderCommentsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
};

/** Possible fields you can use to order by */
export enum OrderByFieldType {
  /** The financial activity of the collective (number of transactions) */
  ACTIVITY = 'ACTIVITY',
  BALANCE = 'BALANCE',
  CREATED_AT = 'CREATED_AT',
  HOSTED_COLLECTIVES_COUNT = 'HOSTED_COLLECTIVES_COUNT',
  HOST_RANK = 'HOST_RANK',
  LAST_CHARGED_AT = 'LAST_CHARGED_AT',
  MEMBER_COUNT = 'MEMBER_COUNT',
  NAME = 'NAME',
  RANK = 'RANK',
  TOTAL_CONTRIBUTED = 'TOTAL_CONTRIBUTED'
}

/** Input to order collection */
export type OrderByInput = {
  /** Ordering direction. */
  direction: OrderDirection;
  /** Field to order by. */
  field: OrderByFieldType;
};

/** A collection of "Orders" */
export type OrderCollection = Collection & {
  __typename?: 'OrderCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Order>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Some context about how an order was created */
export type OrderContextInput = {
  /** Whether this order was created using the embedded contribution flow */
  isEmbed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether this order was created using the new platform tip flow */
  isNewPlatformTipFlow?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Input to create a new order */
export type OrderCreateInput = {
  /** The contribution amount for 1 quantity, without platform contribution and taxes */
  amount: AmountInput;
  /** Some context about how this order was created */
  context?: InputMaybe<OrderContextInput>;
  /** If the tier has some "customFields", use this field to set their values */
  customData?: InputMaybe<Scalars['JSON']['input']>;
  /** Data related to this order */
  data?: InputMaybe<Scalars['JSON']['input']>;
  frequency: ContributionFrequency;
  /** The profile making the order. Can be null for guest contributions. */
  fromAccount?: InputMaybe<AccountReferenceInput>;
  /** Additional information about the contributing profile */
  fromAccountInfo?: InputMaybe<OrderFromAccountInfo>;
  /** Use this when fromAccount is null to pass the guest info */
  guestInfo?: InputMaybe<GuestInfoInput>;
  /** Whether this is transferring the remaining balance from a project/event/collective */
  isBalanceTransfer?: InputMaybe<Scalars['Boolean']['input']>;
  /** The payment method used for this order */
  paymentMethod?: InputMaybe<PaymentMethodInput>;
  /** Platform tip attached to this order */
  platformTipAmount?: InputMaybe<AmountInput>;
  quantity?: Scalars['Int']['input'];
  /** Tags associated to the order */
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** The tax to apply to the order */
  tax?: InputMaybe<TaxInput>;
  /**
   * Use this field to set the taxes associated to this order
   * @deprecated 2023-04-11: Please use `tax` instead
   */
  taxes?: InputMaybe<Array<InputMaybe<OrderTaxInput>>>;
  /** The tier you are contributing to */
  tier?: InputMaybe<TierReferenceInput>;
  /** The profile you want to contribute to */
  toAccount: AccountReferenceInput;
};

/** Possible directions in which to order a list of items */
export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

/** Some context about how an order was created */
export type OrderFromAccountInfo = {
  email?: InputMaybe<Scalars['String']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  /** The location of the contributor. Account location will be updated with this address if different from the existing one. */
  location?: InputMaybe<LocationInput>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** The user or system that paused the order */
export enum OrderPausedBy {
  /** The collective */
  COLLECTIVE = 'COLLECTIVE',
  /** The host of the collective */
  HOST = 'HOST',
  /** The platform */
  PLATFORM = 'PLATFORM',
  /** Individual who administers the account for this contribution */
  USER = 'USER'
}

/** Fields for the user permissions on an order */
export type OrderPermissions = {
  __typename?: 'OrderPermissions';
  /** Whether the current user can comment on this order */
  canComment: Scalars['Boolean']['output'];
  /** Whether the current user can edit this pending order */
  canEdit: Scalars['Boolean']['output'];
  /** Whether the current user can mark this order as expired */
  canMarkAsExpired: Scalars['Boolean']['output'];
  /** Whether the current user can mark this order as unpaid */
  canMarkAsPaid: Scalars['Boolean']['output'];
  /** If paused, whether the current user can resume this order */
  canResume: Scalars['Boolean']['output'];
  /** Whether the current user can see private activities for this order */
  canSeePrivateActivities: Scalars['Boolean']['output'];
  /** Whether the current user can set tags on this order */
  canSetTags: Scalars['Boolean']['output'];
  /** Whether the current user can update the accounting category of this order */
  canUpdateAccountingCategory: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
};

export type OrderReferenceInput = {
  /** The public id identifying the order (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The legacy public id identifying the order (ie: 4242) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** All order statuses */
export enum OrderStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  ERROR = 'ERROR',
  EXPIRED = 'EXPIRED',
  IN_REVIEW = 'IN_REVIEW',
  NEW = 'NEW',
  PAID = 'PAID',
  PAUSED = 'PAUSED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  REFUNDED = 'REFUNDED',
  REJECTED = 'REJECTED',
  REQUIRE_CLIENT_CONFIRMATION = 'REQUIRE_CLIENT_CONFIRMATION'
}

export type OrderTax = {
  __typename?: 'OrderTax';
  /** @deprecated Please use `rate` instead */
  percentage: Scalars['Int']['output'];
  /** Percentage applied, between 0-1 */
  rate: Scalars['Float']['output'];
  type: TaxType;
};

/** Input to set taxes for an order */
export type OrderTaxInput = {
  amount: AmountInput;
  /** Country of the account ordering, to know from where to apply the tax */
  country?: InputMaybe<CountryIso>;
  /** Tax identification number, if any */
  idNumber?: InputMaybe<Scalars['String']['input']>;
  type: TaxType;
};

export type OrderUpdateInput = {
  /** Amount received by collective, excluding any tips, taxes or fees */
  amount?: InputMaybe<AmountInput>;
  /** Host fee percent to be applied to the order */
  hostFeePercent?: InputMaybe<Scalars['Float']['input']>;
  /** The public id identifying the order (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The legacy public id identifying the order (ie: 4242) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
  /** Amount paid in fees for the payment processor */
  paymentProcessorFee?: InputMaybe<AmountInput>;
  /** Amount intended as tip for the platform */
  platformTip?: InputMaybe<AmountInput>;
  /** Date the funds were received */
  processedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** The tax to apply to the order */
  tax?: InputMaybe<TaxInput>;
  /** Reference to the transaction import row to link the order to */
  transactionsImportRow?: InputMaybe<TransactionsImportRowReferenceInput>;
};

export type OrderWithPayment = {
  __typename?: 'OrderWithPayment';
  /** If donating as a guest, this will contain your guest token to confirm your order */
  guestToken?: Maybe<Scalars['String']['output']>;
  /** The order created */
  order: Order;
  /** This field will be set if the order was created but there was an error with Stripe during the payment */
  stripeError?: Maybe<StripeError>;
};

/** This represents an Organization account */
export type Organization = Account & AccountWithContributions & {
  __typename?: 'Organization';
  /** [!] Warning: this query is currently in beta and the API might change */
  activeContributors: AccountCollection;
  /** List of activities that the logged-in user is subscribed for this collective */
  activitySubscriptions?: Maybe<Array<Maybe<ActivitySubscription>>>;
  backgroundImageUrl?: Maybe<Scalars['String']['output']>;
  /** Whether this account can have changelog updates */
  canHaveChangelogUpdates: Scalars['Boolean']['output'];
  /** Returns true if the remote user can start the process to resume contributions for account */
  canStartResumeContributionsProcess: Scalars['Boolean']['output'];
  categories: Array<Maybe<Scalars['String']['output']>>;
  childrenAccounts: AccountCollection;
  /** The list of connected accounts (Stripe, Twitter, etc ...). Admin only. Scope: "connectedAccounts". */
  connectedAccounts?: Maybe<Array<Maybe<ConnectedAccount>>>;
  contributionPolicy?: Maybe<Scalars['String']['output']>;
  /** All the persons and entities that contribute to this account */
  contributors: ContributorCollection;
  conversations: ConversationCollection;
  /** Returns conversation's tags for collective sorted by popularity */
  conversationsTags?: Maybe<Array<Maybe<TagStat>>>;
  /** The time of creation */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The currency of the account */
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  /** If this account was duplicated, the accounts that were created from it */
  duplicatedAccounts: AccountCollection;
  /** If created by duplication, the account from which this one was duplicated */
  duplicatedFromAccount?: Maybe<Account>;
  /** @deprecated 2022-07-18: This field is deprecated and will return null */
  email?: Maybe<Scalars['String']['output']>;
  /** Returns the emails of the account. Individuals only have one, but organizations can have multiple emails. */
  emails?: Maybe<Array<Scalars['EmailAddress']['output']>>;
  /** @deprecated 2024-11-04: Please use policies.EXPENSE_POLICIES */
  expensePolicy?: Maybe<Scalars['String']['output']>;
  expenses: ExpenseCollection;
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<TagStat>>>;
  /** Describes the features enabled and available for this account */
  features: CollectiveFeatures;
  feed?: Maybe<Array<Maybe<Activity>>>;
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: Maybe<Scalars['String']['output']>;
  /** Returns true if the account has started the process to resume contributions */
  hasResumeContributionsProcessStarted: Scalars['Boolean']['output'];
  /** If the organization is a host account, this will return the matching Host object */
  host?: Maybe<Host>;
  /** Host application requests */
  hostApplicationRequests: HostApplicationCollection;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Returns whether the account accepts financial contributions. */
  isActive?: Maybe<Scalars['Boolean']['output']>;
  /** Returns true if the remote user is an admin of this account */
  isAdmin: Scalars['Boolean']['output'];
  /** Returns whether this account is archived */
  isArchived: Scalars['Boolean']['output'];
  /** Whether this account is frozen */
  isFrozen: Scalars['Boolean']['output'];
  /** Returns whether the account is setup to Host collectives. */
  isHost: Scalars['Boolean']['output'];
  /** Defines if the contributors wants to be incognito (name not displayed) */
  isIncognito: Scalars['Boolean']['output'];
  legacyId: Scalars['Int']['output'];
  /** The legal documents associated with this account */
  legalDocuments?: Maybe<Array<Maybe<LegalDocument>>>;
  /** Private, legal name. Used for expense receipts, taxes, etc. Scope: "account". */
  legalName?: Maybe<Scalars['String']['output']>;
  /**
   *
   *           Address. This field is public for hosts, otherwise:
   *             - Users can see the addresses of the collectives they're admin of; if they are not an admin they can only see the country that the org belong to.
   *             - Hosts can see the address of organizations submitting expenses to their collectives.
   *
   */
  location?: Maybe<Location>;
  longDescription?: Maybe<Scalars['String']['output']>;
  /** [AUTHENTICATED] Returns the pending invitations */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  memberOf: MemberOfCollection;
  /** Get all members (admins, members, backers, followers) */
  members: MemberCollection;
  /** Public name */
  name?: Maybe<Scalars['String']['output']>;
  /** The list of applications created by this account. Admin only. Scope: "applications". */
  oAuthApplications?: Maybe<OAuthApplicationCollection>;
  orders: OrderCollection;
  /** @deprecated 2022-12-16: use parent on AccountWithParent instead */
  parentAccount?: Maybe<Account>;
  /** The list of payment methods that this collective can use to pay for Orders. Admin or Host only. Scope: "orders". */
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payment methods for this account that are pending a client confirmation (3D Secure / SCA) */
  paymentMethodsWithPendingConfirmation?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payout methods that this collective can use to get paid. In most cases, admin only and scope: "expenses". */
  payoutMethods?: Maybe<Array<Maybe<PayoutMethod>>>;
  /** Logged-in user permissions on an account */
  permissions: AccountPermissions;
  /** Returns true if a custom contribution to Open Collective can be submitted for contributions made to this account */
  platformContributionAvailable: Scalars['Boolean']['output'];
  /** How much platform fees are charged for this account */
  platformFeePercent: Scalars['Float']['output'];
  /** Policies for the account. To see non-public policies you need to be admin and have the scope: "account". */
  policies: Policies;
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  settings: Scalars['JSON']['output'];
  /** The slug identifying the account (ie: babel) */
  slug: Scalars['String']['output'];
  socialLinks: Array<SocialLink>;
  stats?: Maybe<AccountStats>;
  /** The list of expense types supported by this account */
  supportedExpenseTypes: Array<ExpenseType>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tiers: TierCollection;
  /** Number of unique financial contributors. */
  totalFinancialContributors: Scalars['Int']['output'];
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  transactionReports?: Maybe<TransactionReports>;
  transactions: TransactionCollection;
  transferwise?: Maybe<TransferWise>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  twitterHandle?: Maybe<Scalars['String']['output']>;
  type: AccountType;
  /** Date of unhosting by a given Fiscal Host. */
  unhostedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Updates published by the account. To see unpublished updates, you need to be an admin and have the scope "updates". */
  updates: UpdateCollection;
  /** Virtual Cards Merchants used by the account. Admin only. Scope: "virtualCards". */
  virtualCardMerchants?: Maybe<AccountCollection>;
  /** Virtual Cards attached to the account. Admin only. Scope: "virtualCards". */
  virtualCards?: Maybe<VirtualCardCollection>;
  webhooks: WebhookCollection;
  /** @deprecated 2023-01-16: Please use socialLinks */
  website?: Maybe<Scalars['String']['output']>;
};


/** This represents an Organization account */
export type OrganizationActiveContributorsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeActiveRecurringContributions?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Organization account */
export type OrganizationActivitySubscriptionsArgs = {
  channel?: InputMaybe<ActivityChannel>;
};


/** This represents an Organization account */
export type OrganizationBackgroundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Organization account */
export type OrganizationChildrenAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Organization account */
export type OrganizationContributorsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  roles?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Organization account */
export type OrganizationConversationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Organization account */
export type OrganizationConversationsTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Organization account */
export type OrganizationDuplicatedAccountsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Organization account */
export type OrganizationExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<ExpenseDirection>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Organization account */
export type OrganizationExpensesTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Organization account */
export type OrganizationFeedArgs = {
  classes?: InputMaybe<Array<InputMaybe<ActivityClassType>>>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Organization account */
export type OrganizationHostApplicationRequestsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<HostApplicationStatus>;
};


/** This represents an Organization account */
export type OrganizationImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Organization account */
export type OrganizationLegalDocumentsArgs = {
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents an Organization account */
export type OrganizationMemberInvitationsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  memberAccount?: InputMaybe<AccountReferenceInput>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Organization account */
export type OrganizationMemberOfArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  hostFeesStructure?: InputMaybe<HostFeeStructure>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isHostAccount?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: OrderByInput;
  orderByRoles?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Organization account */
export type OrganizationMembersArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Organization account */
export type OrganizationOAuthApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Organization account */
export type OrganizationOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Organization account */
export type OrganizationPaymentMethodsArgs = {
  enumType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  includeExpired?: InputMaybe<Scalars['Boolean']['input']>;
  service?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  type?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
};


/** This represents an Organization account */
export type OrganizationTiersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Organization account */
export type OrganizationTotalFinancialContributorsArgs = {
  accountType?: InputMaybe<AccountType>;
};


/** This represents an Organization account */
export type OrganizationTransactionGroupsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** This represents an Organization account */
export type OrganizationTransactionReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Organization account */
export type OrganizationTransactionsArgs = {
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Organization account */
export type OrganizationUnhostedAtArgs = {
  host: AccountReferenceInput;
};


/** This represents an Organization account */
export type OrganizationUpdatesArgs = {
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublishedUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Organization account */
export type OrganizationVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Organization account */
export type OrganizationVirtualCardsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
};


/** This represents an Organization account */
export type OrganizationWebhooksArgs = {
  account: AccountReferenceInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type OrganizationCreateInput = {
  /** The profile background image, for the banner and social media sharing */
  backgroundImage?: InputMaybe<Scalars['Upload']['input']>;
  description: Scalars['String']['input'];
  /** The profile avatar image */
  image?: InputMaybe<Scalars['Upload']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  settings?: InputMaybe<Scalars['JSON']['input']>;
  slug: Scalars['String']['input'];
  /** @deprecated 2024-11-12: Please use socialLinks */
  website?: InputMaybe<Scalars['String']['input']>;
};

export type ParseUploadedFileResult = {
  __typename?: 'ParseUploadedFileResult';
  /** The parsed expense information */
  expense?: Maybe<ExpenseParsedFileInfo>;
  /** A message describing the parsing result, usually an error message (if parsing failed) or some warnings */
  message?: Maybe<Scalars['String']['output']>;
  /** Whether the parsing was successful */
  success: Scalars['Boolean']['output'];
};

/** A Stripe payment intent */
export type PaymentIntent = {
  __typename?: 'PaymentIntent';
  id: Scalars['String']['output'];
  paymentIntentClientSecret: Scalars['String']['output'];
  stripeAccount: Scalars['String']['output'];
  stripeAccountPublishableSecret: Scalars['String']['output'];
};

/** Input to create a Stripe payment intent */
export type PaymentIntentInput = {
  amount: AmountInput;
  frequency?: InputMaybe<ContributionFrequency>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  toAccount: AccountReferenceInput;
};

/** PaymentMethod model */
export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  account?: Maybe<Account>;
  /** Returns the balance amount and the currency of this paymentMethod */
  balance: Amount;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  data?: Maybe<Scalars['JSON']['output']>;
  expiryDate?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  legacyId?: Maybe<Scalars['Int']['output']>;
  limitedToHosts?: Maybe<Array<Maybe<Host>>>;
  /** For monthly gift cards, this field will return the monthly limit */
  monthlyLimit?: Maybe<Amount>;
  name?: Maybe<Scalars['String']['output']>;
  /** Get all the orders associated with this payment method */
  orders?: Maybe<OrderCollection>;
  /**
   * Defines the type of the payment method. Meant to be moved to "type" in the future.
   * @deprecated 2021-03-02: Please use service + type
   */
  providerType?: Maybe<PaymentMethodLegacyType>;
  service?: Maybe<PaymentMethodService>;
  /** For gift cards, this field will return to the source payment method */
  sourcePaymentMethod?: Maybe<PaymentMethod>;
  type?: Maybe<PaymentMethodType>;
};


/** PaymentMethod model */
export type PaymentMethodOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};

/** An input to use for creating or retrieving payment methods */
export type PaymentMethodInput = {
  /** When creating a credit card, use this field to set its info */
  creditCardInfo?: InputMaybe<CreditCardCreateInput>;
  /** The id assigned to the payment method */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Whether this payment method should be saved for future payments */
  isSavedForLater?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Type of this payment method
   * @deprecated 2021-03-02: Please use service + type
   */
  legacyType?: InputMaybe<PaymentMethodLegacyType>;
  /** Name of this payment method */
  name?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated 2021-08-20: Please use type instead */
  newType?: InputMaybe<PaymentMethodType>;
  /** The Payment Intent ID used in this checkout */
  paymentIntentId?: InputMaybe<Scalars['String']['input']>;
  /** To pass when type is PAYPAL */
  paypalInfo?: InputMaybe<PaypalPaymentInput>;
  /** Service of this payment method */
  service?: InputMaybe<PaymentMethodService>;
  /** Type of this payment method */
  type?: InputMaybe<PaymentMethodType>;
};

export enum PaymentMethodLegacyType {
  ACCOUNT_BALANCE = 'ACCOUNT_BALANCE',
  ADDED_FUNDS = 'ADDED_FUNDS',
  ALIPAY = 'ALIPAY',
  BACS_DEBIT = 'BACS_DEBIT',
  BANCONTACT = 'BANCONTACT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  CRYPTO = 'CRYPTO',
  GIFT_CARD = 'GIFT_CARD',
  PAYMENT_INTENT = 'PAYMENT_INTENT',
  PAYPAL = 'PAYPAL',
  PREPAID_BUDGET = 'PREPAID_BUDGET',
  SEPA_DEBIT = 'SEPA_DEBIT',
  US_BANK_ACCOUNT = 'US_BANK_ACCOUNT'
}

export type PaymentMethodReferenceInput = {
  /** The id assigned to the payment method */
  id?: InputMaybe<Scalars['String']['input']>;
};

export enum PaymentMethodService {
  OPENCOLLECTIVE = 'OPENCOLLECTIVE',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  THEGIVINGBLOCK = 'THEGIVINGBLOCK',
  WISE = 'WISE'
}

export enum PaymentMethodType {
  ADAPTIVE = 'ADAPTIVE',
  ALIPAY = 'ALIPAY',
  BACS_DEBIT = 'BACS_DEBIT',
  BANCONTACT = 'BANCONTACT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  COLLECTIVE = 'COLLECTIVE',
  CREDITCARD = 'CREDITCARD',
  CRYPTO = 'CRYPTO',
  DEFAULT = 'DEFAULT',
  GIFTCARD = 'GIFTCARD',
  HOST = 'HOST',
  LINK = 'LINK',
  MANUAL = 'MANUAL',
  PAYMENT = 'PAYMENT',
  PAYMENT_INTENT = 'PAYMENT_INTENT',
  PAYOUT = 'PAYOUT',
  PREPAID = 'PREPAID',
  SEPA_DEBIT = 'SEPA_DEBIT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  SWISH = 'SWISH',
  US_BANK_ACCOUNT = 'US_BANK_ACCOUNT',
  VIRTUAL_CARD = 'VIRTUAL_CARD',
  /** @deprecated Please use uppercase values */
  adaptive = 'adaptive',
  /** @deprecated Please use uppercase values */
  alipay = 'alipay',
  /** @deprecated Please use uppercase values */
  bacs_debit = 'bacs_debit',
  /** @deprecated Please use uppercase values */
  bancontact = 'bancontact',
  /** @deprecated Please use uppercase values */
  bank_transfer = 'bank_transfer',
  /** @deprecated Please use uppercase values */
  collective = 'collective',
  /** @deprecated Please use uppercase values */
  creditcard = 'creditcard',
  /** @deprecated Please use uppercase values */
  crypto = 'crypto',
  /** @deprecated Please use uppercase values */
  default = 'default',
  /** @deprecated Please use uppercase values */
  giftcard = 'giftcard',
  /** @deprecated Please use uppercase values */
  host = 'host',
  /** @deprecated Please use uppercase values */
  link = 'link',
  /** @deprecated Please use uppercase values */
  manual = 'manual',
  /** @deprecated Please use uppercase values */
  payment = 'payment',
  /** @deprecated Please use uppercase values */
  paymentintent = 'paymentintent',
  /** @deprecated Please use uppercase values */
  payout = 'payout',
  /** @deprecated Please use uppercase values */
  prepaid = 'prepaid',
  /** @deprecated Please use uppercase values */
  sepa_debit = 'sepa_debit',
  /** @deprecated Please use uppercase values */
  subscription = 'subscription',
  /** @deprecated Please use uppercase values */
  swish = 'swish',
  /** @deprecated Please use uppercase values */
  us_bank_account = 'us_bank_account',
  /** @deprecated Please use uppercase values */
  virtual_card = 'virtual_card'
}

/** A payout method */
export type PayoutMethod = {
  __typename?: 'PayoutMethod';
  /** The actual data for this payout method. Content depends on the type. */
  data?: Maybe<Scalars['JSON']['output']>;
  /** Unique identifier for this payout method */
  id: Scalars['String']['output'];
  /** Whether this payout method has been saved to be used for future payouts */
  isSaved?: Maybe<Scalars['Boolean']['output']>;
  /** A friendly name for users to easily find their payout methods */
  name?: Maybe<Scalars['String']['output']>;
  /** The type of this payout method (usually the payment provider) */
  type?: Maybe<PayoutMethodType>;
};

export type PayoutMethodInput = {
  data?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  isSaved?: InputMaybe<Scalars['Boolean']['input']>;
  legacyId?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<PayoutMethodType>;
};

export enum PayoutMethodType {
  ACCOUNT_BALANCE = 'ACCOUNT_BALANCE',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CREDIT_CARD = 'CREDIT_CARD',
  OTHER = 'OTHER',
  PAYPAL = 'PAYPAL'
}

export type PaypalPaymentInput = {
  data?: InputMaybe<Scalars['JSON']['input']>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  subscriptionId?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
};

/** A PayPal plan to associate with a contribution */
export type PaypalPlan = {
  __typename?: 'PaypalPlan';
  id: Scalars['String']['output'];
};

/** Input to create a new pending order */
export type PendingOrderCreateInput = {
  /** The accounting category of this order */
  accountingCategory?: InputMaybe<AccountingCategoryReferenceInput>;
  /** The contribution amount, without platform contribution and taxes */
  amount: AmountInput;
  /** Public order description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** When is the money expected? */
  expectedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** The profile making the contribution. */
  fromAccount: AccountReferenceInput;
  /** Additional information about the contributing profile */
  fromAccountInfo?: InputMaybe<OrderFromAccountInfo>;
  /** Custom Host fee percent for this order */
  hostFeePercent?: InputMaybe<Scalars['Float']['input']>;
  /** Private memo for the host */
  memo?: InputMaybe<Scalars['String']['input']>;
  /** Payment method expected for this order */
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  /** External identifier for the order */
  ponumber?: InputMaybe<Scalars['String']['input']>;
  /** The tax to apply to the order */
  tax?: InputMaybe<TaxInput>;
  /** The tier you are contributing to */
  tier?: InputMaybe<TierReferenceInput>;
  /** The collective you want to contribute to */
  toAccount: AccountReferenceInput;
};

export type PendingOrderData = {
  __typename?: 'PendingOrderData';
  expectedAt?: Maybe<Scalars['DateTime']['output']>;
  fromAccountInfo?: Maybe<PendingOrderFromAccountInfo>;
  memo?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  ponumber?: Maybe<Scalars['String']['output']>;
};

/** Input to edit an existing pending order */
export type PendingOrderEditInput = {
  /** The accounting category of this order */
  accountingCategory?: InputMaybe<AccountingCategoryReferenceInput>;
  /** The contribution amount, without platform contribution and taxes */
  amount: AmountInput;
  /** Public order description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** When is the money expected? */
  expectedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** The profile making the contribution. */
  fromAccount?: InputMaybe<AccountReferenceInput>;
  /** Additional information about the contributing profile */
  fromAccountInfo?: InputMaybe<OrderFromAccountInfo>;
  /** Custom Host fee percent for this order */
  hostFeePercent?: InputMaybe<Scalars['Float']['input']>;
  /** The public id identifying the order (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The legacy public id identifying the order (ie: 4242) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
  /** Private memo for the host */
  memo?: InputMaybe<Scalars['String']['input']>;
  /** Payment method expected for this order */
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  /** Platform tip attached to this order */
  platformTipAmount?: InputMaybe<AmountInput>;
  /** External identifier for the order */
  ponumber?: InputMaybe<Scalars['String']['input']>;
  /** The tax to apply to the order */
  tax?: InputMaybe<TaxInput>;
  /** The tier you are contributing to */
  tier?: InputMaybe<TierReferenceInput>;
};

export type PendingOrderFromAccountInfo = {
  __typename?: 'PendingOrderFromAccountInfo';
  email?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Permission = {
  __typename?: 'Permission';
  allowed: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  reasonDetails?: Maybe<Scalars['JSON']['output']>;
};

/** A personal token */
export type PersonalToken = {
  __typename?: 'PersonalToken';
  /** The account that owns this personal token */
  account: Individual;
  /** The date on which the personal token was created */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The date on which the personal token expires */
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  /** Unique identifier for this personal token */
  id: Scalars['String']['output'];
  /** A friendly name for users to easily find their personal tokens */
  name?: Maybe<Scalars['String']['output']>;
  /** Whether this token is allowed to directly use operations that would normally require 2FA */
  preAuthorize2FA: Scalars['Boolean']['output'];
  /** The scopes of the personal token */
  scope?: Maybe<Array<Maybe<OAuthScope>>>;
  /** The personal token */
  token?: Maybe<Scalars['String']['output']>;
  /** The date on which the personal token was last updated */
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** A collection of "PersonalToken" */
export type PersonalTokenCollection = Collection & {
  __typename?: 'PersonalTokenCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<PersonalToken>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Input type for PersonalToken */
export type PersonalTokenCreateInput = {
  /** The account to use as the owner of the application. Defaults to currently logged in user. */
  account?: InputMaybe<AccountReferenceInput>;
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** Whether this token is allowed to directly use operations that would normally require 2FA */
  preAuthorize2FA?: InputMaybe<Scalars['Boolean']['input']>;
  scope?: InputMaybe<Array<InputMaybe<OAuthScope>>>;
};

export type PersonalTokenReferenceInput = {
  /** The public id identifying the personal-token (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The legacy public id identifying the personal-token (ie: 4242) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** Input type for PersonalToken */
export type PersonalTokenUpdateInput = {
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  /** The public id identifying the personal-token (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The legacy public id identifying the personal-token (ie: 4242) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** Whether this token is allowed to directly use operations that would normally require 2FA */
  preAuthorize2FA?: InputMaybe<Scalars['Boolean']['input']>;
  scope?: InputMaybe<Array<InputMaybe<OAuthScope>>>;
};

export type PlaidConnectAccountResponse = {
  __typename?: 'PlaidConnectAccountResponse';
  /** The connected account that was created */
  connectedAccount: ConnectedAccount;
  /** The transactions import that was created */
  transactionsImport: TransactionsImport;
};

export type PlaidLinkTokenCreateResponse = {
  __typename?: 'PlaidLinkTokenCreateResponse';
  /** The expiration date for the link token in ISO 8601 format. */
  expiration: Scalars['String']['output'];
  /** A URL of a Plaid-hosted Link flow that will use the Link token returned by this request. Only present if the client is enabled for Host */
  hostedLinkUrl?: Maybe<Scalars['String']['output']>;
  /** The link token that will be used to initialize the Plaid Link flow. */
  linkToken: Scalars['String']['output'];
  /** A unique identifier for the request, which can be used for troubleshooting. */
  requestId: Scalars['String']['output'];
};

export type Policies = {
  __typename?: 'Policies';
  COLLECTIVE_ADMINS_CAN_REFUND?: Maybe<Scalars['Boolean']['output']>;
  COLLECTIVE_ADMINS_CAN_SEE_PAYOUT_METHODS?: Maybe<Scalars['Boolean']['output']>;
  COLLECTIVE_MINIMUM_ADMINS?: Maybe<Collective_Minimum_Admins>;
  EXPENSE_AUTHOR_CANNOT_APPROVE?: Maybe<Expense_Author_Cannot_Approve>;
  EXPENSE_CATEGORIZATION?: Maybe<Expense_Categorization>;
  EXPENSE_POLICIES?: Maybe<Expense_Policies>;
  EXPENSE_PUBLIC_VENDORS?: Maybe<Scalars['Boolean']['output']>;
  MAXIMUM_VIRTUAL_CARD_LIMIT_AMOUNT_FOR_INTERVAL?: Maybe<Maximum_Virtual_Card_Limit_Amount_For_Interval>;
  REQUIRE_2FA_FOR_ADMINS?: Maybe<Scalars['Boolean']['output']>;
  id?: Maybe<Scalars['String']['output']>;
};

export type PoliciesCollectiveExpenseAuthorCannotApprove = {
  amountInCents?: InputMaybe<Scalars['Int']['input']>;
  appliesToHostedCollectives?: InputMaybe<Scalars['Boolean']['input']>;
  appliesToSingleAdminCollectives?: InputMaybe<Scalars['Boolean']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
};

export type PoliciesCollectiveMinimumAdminsInput = {
  applies?: InputMaybe<PolicyApplication>;
  freeze?: InputMaybe<Scalars['Boolean']['input']>;
  numberOfAdmins?: InputMaybe<Scalars['Int']['input']>;
};

export type PoliciesExpenseCategorizationInput = {
  requiredForCollectiveAdmins?: InputMaybe<Scalars['Boolean']['input']>;
  requiredForExpenseSubmitters?: InputMaybe<Scalars['Boolean']['input']>;
};

export type PoliciesExpensePolicies = {
  invoicePolicy?: InputMaybe<Scalars['String']['input']>;
  receiptPolicy?: InputMaybe<Scalars['String']['input']>;
  titlePolicy?: InputMaybe<Scalars['String']['input']>;
};

export type PoliciesInput = {
  COLLECTIVE_ADMINS_CAN_REFUND?: InputMaybe<Scalars['Boolean']['input']>;
  COLLECTIVE_ADMINS_CAN_SEE_PAYOUT_METHODS?: InputMaybe<Scalars['Boolean']['input']>;
  COLLECTIVE_MINIMUM_ADMINS?: InputMaybe<PoliciesCollectiveMinimumAdminsInput>;
  EXPENSE_AUTHOR_CANNOT_APPROVE?: InputMaybe<PoliciesCollectiveExpenseAuthorCannotApprove>;
  EXPENSE_CATEGORIZATION?: InputMaybe<PoliciesExpenseCategorizationInput>;
  EXPENSE_POLICIES?: InputMaybe<PoliciesExpensePolicies>;
  EXPENSE_PUBLIC_VENDORS?: InputMaybe<Scalars['Boolean']['input']>;
  REQUIRE_2FA_FOR_ADMINS?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Defines how the policy is applied */
export enum PolicyApplication {
  ALL_COLLECTIVES = 'ALL_COLLECTIVES',
  NEW_COLLECTIVES = 'NEW_COLLECTIVES'
}

/** Parameters for paying an expense */
export type ProcessExpensePaymentParams = {
  /** Date funds were cleared on the fiscal host bank, Wise, PayPal, Stripe or any other external account holding these funds. */
  clearedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** Who is responsible for paying any due fees. */
  feesPayer?: InputMaybe<FeesPayer>;
  /** Bypass automatic integrations (ie. PayPal, Transferwise) to process the expense manually */
  forceManual?: InputMaybe<Scalars['Boolean']['input']>;
  /** New expense status when triggering MARK_AS_UNPAID */
  markAsUnPaidStatus?: InputMaybe<MarkAsUnPaidExpenseStatus>;
  /** Payment method using for paying the expense */
  paymentMethodService?: InputMaybe<PaymentMethodService>;
  /** The fee charged by payment processor in host currency */
  paymentProcessorFeeInHostCurrency?: InputMaybe<Scalars['Int']['input']>;
  /** Whether the payment processor fees should be refunded when triggering MARK_AS_UNPAID */
  shouldRefundPaymentProcessorFee?: InputMaybe<Scalars['Boolean']['input']>;
  /** The total amount paid in host currency */
  totalAmountPaidInHostCurrency?: InputMaybe<Scalars['Int']['input']>;
  /** Transfer details for fulfilling the expense */
  transfer?: InputMaybe<ProcessExpenseTransferParams>;
};

export type ProcessExpenseTransferParams = {
  /** Wise transfer details */
  details?: InputMaybe<WiseTransferDetails>;
};

/** Action taken for an account application to the host */
export enum ProcessHostApplicationAction {
  /** Approve the account request to be hosted */
  APPROVE = 'APPROVE',
  /** Rejects the account request to be hosted */
  REJECT = 'REJECT',
  /** Sends a private message to the admins of the account */
  SEND_PRIVATE_MESSAGE = 'SEND_PRIVATE_MESSAGE',
  /** Creates a public conversation */
  SEND_PUBLIC_MESSAGE = 'SEND_PUBLIC_MESSAGE'
}

export type ProcessHostApplicationResponse = {
  __typename?: 'ProcessHostApplicationResponse';
  /** The account that applied to the host */
  account: Account;
  /** When sending a public message, this field will have the info about the conversation created */
  conversation?: Maybe<Conversation>;
  hostApplication?: Maybe<HostApplication>;
};

/** Action to apply on the order */
export enum ProcessOrderAction {
  /** To mark the order as expired */
  MARK_AS_EXPIRED = 'MARK_AS_EXPIRED',
  /** To mark the order as paid */
  MARK_AS_PAID = 'MARK_AS_PAID'
}

/** This represents an Project account */
export type Project = Account & AccountWithContributions & AccountWithHost & AccountWithParent & {
  __typename?: 'Project';
  /** [!] Warning: this query is currently in beta and the API might change */
  activeContributors: AccountCollection;
  /** List of activities that the logged-in user is subscribed for this collective */
  activitySubscriptions?: Maybe<Array<Maybe<ActivitySubscription>>>;
  /** Date of approval by the Fiscal Host. */
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  backgroundImageUrl?: Maybe<Scalars['String']['output']>;
  /** Whether this account can have changelog updates */
  canHaveChangelogUpdates: Scalars['Boolean']['output'];
  /** Returns true if the remote user can start the process to resume contributions for account */
  canStartResumeContributionsProcess: Scalars['Boolean']['output'];
  categories: Array<Maybe<Scalars['String']['output']>>;
  childrenAccounts: AccountCollection;
  /** The list of connected accounts (Stripe, Twitter, etc ...). Admin only. Scope: "connectedAccounts". */
  connectedAccounts?: Maybe<Array<Maybe<ConnectedAccount>>>;
  contributionPolicy?: Maybe<Scalars['String']['output']>;
  /** All the persons and entities that contribute to this account */
  contributors: ContributorCollection;
  conversations: ConversationCollection;
  /** Returns conversation's tags for collective sorted by popularity */
  conversationsTags?: Maybe<Array<Maybe<TagStat>>>;
  /** The time of creation */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The currency of the account */
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  /** If this account was duplicated, the accounts that were created from it */
  duplicatedAccounts: AccountCollection;
  /** If created by duplication, the account from which this one was duplicated */
  duplicatedFromAccount?: Maybe<Account>;
  /** Returns the emails of the account. Individuals only have one, but organizations can have multiple emails. */
  emails?: Maybe<Array<Scalars['EmailAddress']['output']>>;
  /** @deprecated 2024-11-04: Please use policies.EXPENSE_POLICIES */
  expensePolicy?: Maybe<Scalars['String']['output']>;
  expenses: ExpenseCollection;
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<TagStat>>>;
  /** Describes the features enabled and available for this account */
  features: CollectiveFeatures;
  feed?: Maybe<Array<Maybe<Activity>>>;
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: Maybe<Scalars['String']['output']>;
  /** Returns true if the account has started the process to resume contributions */
  hasResumeContributionsProcessStarted: Scalars['Boolean']['output'];
  /** Returns the Fiscal Host */
  host?: Maybe<Host>;
  /** Returns agreements this account has with its host, or null if not enough permissions. */
  hostAgreements?: Maybe<AgreementCollection>;
  /** Returns the Fiscal Host application */
  hostApplication?: Maybe<HostApplication>;
  /** Host application requests */
  hostApplicationRequests: HostApplicationCollection;
  /** Fees percentage that the host takes for this collective */
  hostFeePercent?: Maybe<Scalars['Float']['output']>;
  /** Describe how the host charges the collective */
  hostFeesStructure?: Maybe<HostFeeStructure>;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Returns whether it's active: can accept financial contributions and pay expenses. */
  isActive: Scalars['Boolean']['output'];
  /** Returns true if the remote user is an admin of this account */
  isAdmin: Scalars['Boolean']['output'];
  /** Returns whether it's approved by the Fiscal Host */
  isApproved: Scalars['Boolean']['output'];
  /** Returns whether this account is archived */
  isArchived: Scalars['Boolean']['output'];
  /** Whether this account is frozen */
  isFrozen: Scalars['Boolean']['output'];
  /** Returns whether the account is setup to Host collectives. */
  isHost: Scalars['Boolean']['output'];
  /** Defines if the contributors wants to be incognito (name not displayed) */
  isIncognito: Scalars['Boolean']['output'];
  legacyId: Scalars['Int']['output'];
  /** The legal documents associated with this account */
  legalDocuments?: Maybe<Array<Maybe<LegalDocument>>>;
  /** Private, legal name. Used for expense receipts, taxes, etc. Scope: "account". */
  legalName?: Maybe<Scalars['String']['output']>;
  /** The address associated to this account. This field is always public for collectives and events. */
  location?: Maybe<Location>;
  longDescription?: Maybe<Scalars['String']['output']>;
  /** [AUTHENTICATED] Returns the pending invitations */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  memberOf: MemberOfCollection;
  /** Get all members (admins, members, backers, followers) */
  members: MemberCollection;
  /** Public name */
  name?: Maybe<Scalars['String']['output']>;
  /** The list of applications created by this account. Admin only. Scope: "applications". */
  oAuthApplications?: Maybe<OAuthApplicationCollection>;
  orders: OrderCollection;
  /** The Account parenting this account */
  parent?: Maybe<Account>;
  /** @deprecated 2022-12-16: use parent on AccountWithParent instead */
  parentAccount?: Maybe<Account>;
  /** The list of payment methods that this collective can use to pay for Orders. Admin or Host only. Scope: "orders". */
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payment methods for this account that are pending a client confirmation (3D Secure / SCA) */
  paymentMethodsWithPendingConfirmation?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payout methods that this collective can use to get paid. In most cases, admin only and scope: "expenses". */
  payoutMethods?: Maybe<Array<Maybe<PayoutMethod>>>;
  /** Logged-in user permissions on an account */
  permissions: AccountPermissions;
  /** Returns true if a custom contribution to Open Collective can be submitted for contributions made to this account */
  platformContributionAvailable: Scalars['Boolean']['output'];
  /** How much platform fees are charged for this account */
  platformFeePercent: Scalars['Float']['output'];
  /** Policies for the account. To see non-public policies you need to be admin and have the scope: "account". */
  policies: Policies;
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  settings: Scalars['JSON']['output'];
  /** The slug identifying the account (ie: babel) */
  slug: Scalars['String']['output'];
  socialLinks: Array<SocialLink>;
  stats?: Maybe<AccountStats>;
  summary?: Maybe<HostedAccountSummary>;
  /** The list of expense types supported by this account */
  supportedExpenseTypes: Array<ExpenseType>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tiers: TierCollection;
  /** Number of unique financial contributors. */
  totalFinancialContributors: Scalars['Int']['output'];
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  transactionReports?: Maybe<TransactionReports>;
  transactions: TransactionCollection;
  transferwise?: Maybe<TransferWise>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  twitterHandle?: Maybe<Scalars['String']['output']>;
  type: AccountType;
  /** Date when the collective was last unfrozen by current Fiscal Host */
  unfrozenAt?: Maybe<Scalars['DateTime']['output']>;
  /** Date of unhosting by a given Fiscal Host. */
  unhostedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Updates published by the account. To see unpublished updates, you need to be an admin and have the scope "updates". */
  updates: UpdateCollection;
  /** Virtual Cards Merchants used by the account. Admin only. Scope: "virtualCards". */
  virtualCardMerchants?: Maybe<AccountCollection>;
  /** Virtual Cards attached to the account. Admin only. Scope: "virtualCards". */
  virtualCards?: Maybe<VirtualCardCollection>;
  webhooks: WebhookCollection;
  /** @deprecated 2023-01-16: Please use socialLinks */
  website?: Maybe<Scalars['String']['output']>;
};


/** This represents an Project account */
export type ProjectActiveContributorsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeActiveRecurringContributions?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type ProjectActivitySubscriptionsArgs = {
  channel?: InputMaybe<ActivityChannel>;
};


/** This represents an Project account */
export type ProjectBackgroundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Project account */
export type ProjectChildrenAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Project account */
export type ProjectContributorsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  roles?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Project account */
export type ProjectConversationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Project account */
export type ProjectConversationsTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type ProjectDuplicatedAccountsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type ProjectExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<ExpenseDirection>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Project account */
export type ProjectExpensesTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type ProjectFeedArgs = {
  classes?: InputMaybe<Array<InputMaybe<ActivityClassType>>>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Project account */
export type ProjectHostAgreementsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type ProjectHostApplicationRequestsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<HostApplicationStatus>;
};


/** This represents an Project account */
export type ProjectHostFeePercentArgs = {
  paymentMethodService?: InputMaybe<PaymentMethodService>;
  paymentMethodType?: InputMaybe<PaymentMethodType>;
};


/** This represents an Project account */
export type ProjectImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents an Project account */
export type ProjectLegalDocumentsArgs = {
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents an Project account */
export type ProjectMemberInvitationsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  memberAccount?: InputMaybe<AccountReferenceInput>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Project account */
export type ProjectMemberOfArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  hostFeesStructure?: InputMaybe<HostFeeStructure>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isHostAccount?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: OrderByInput;
  orderByRoles?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Project account */
export type ProjectMembersArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents an Project account */
export type ProjectOAuthApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type ProjectOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Project account */
export type ProjectPaymentMethodsArgs = {
  enumType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  includeExpired?: InputMaybe<Scalars['Boolean']['input']>;
  service?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  type?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
};


/** This represents an Project account */
export type ProjectSummaryArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
};


/** This represents an Project account */
export type ProjectTiersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type ProjectTotalFinancialContributorsArgs = {
  accountType?: InputMaybe<AccountType>;
};


/** This represents an Project account */
export type ProjectTransactionGroupsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** This represents an Project account */
export type ProjectTransactionReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents an Project account */
export type ProjectTransactionsArgs = {
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents an Project account */
export type ProjectUnhostedAtArgs = {
  host: AccountReferenceInput;
};


/** This represents an Project account */
export type ProjectUpdatesArgs = {
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublishedUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents an Project account */
export type ProjectVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents an Project account */
export type ProjectVirtualCardsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
};


/** This represents an Project account */
export type ProjectWebhooksArgs = {
  account: AccountReferenceInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type ProjectCreateInput = {
  /** The profile background image, for the banner and social media sharing */
  backgroundImage?: InputMaybe<Scalars['Upload']['input']>;
  description: Scalars['String']['input'];
  /** The profile avatar image */
  image?: InputMaybe<Scalars['Upload']['input']>;
  name: Scalars['String']['input'];
  settings?: InputMaybe<Scalars['JSON']['input']>;
  slug: Scalars['String']['input'];
  /** The social links in order of preference */
  socialLinks?: InputMaybe<Array<SocialLinkInput>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** This is the root query */
export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  accounts: AccountCollection;
  activities: ActivityCollection;
  application?: Maybe<Application>;
  collective?: Maybe<Collective>;
  /** Get Contributors grouped by their profiles */
  contributor: Contributor;
  /** Get Contributors grouped by their profiles */
  contributors: ContributorCollection;
  conversation?: Maybe<Conversation>;
  /** Get exchange rates from Open Collective */
  currencyExchangeRate: Array<CurrencyExchangeRate>;
  event?: Maybe<Event>;
  expense?: Maybe<Expense>;
  expenseTagStats: TagStatsCollection;
  expenses: ExpenseCollection;
  fund?: Maybe<Fund>;
  host?: Maybe<Host>;
  hostApplication?: Maybe<HostApplication>;
  hosts?: Maybe<HostCollection>;
  individual?: Maybe<Individual>;
  loggedInAccount?: Maybe<Individual>;
  me?: Maybe<Individual>;
  /** [AUTHENTICATED] Returns the pending invitations */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  /** Get all members (admins, members, backers, followers) */
  members: MemberCollection;
  order?: Maybe<Order>;
  orders: OrderCollection;
  organization?: Maybe<Organization>;
  paypalPlan: PaypalPlan;
  /** Get a personal token by reference */
  personalToken?: Maybe<PersonalToken>;
  project?: Maybe<Project>;
  /** [!] Warning: this query is currently in beta and the API might change */
  search: SearchResponse;
  tagStats: TagStatsCollection;
  tier?: Maybe<Tier>;
  /** Fetch a single transaction */
  transaction?: Maybe<Transaction>;
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroup?: Maybe<TransactionGroup>;
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  transactions: TransactionCollection;
  /** Fetch a transactions import */
  transactionsImport?: Maybe<TransactionsImport>;
  update?: Maybe<Update>;
  /** This query currently returns only published updates */
  updates: UpdateCollection;
  virtualCard?: Maybe<VirtualCard>;
  virtualCardRequest?: Maybe<VirtualCardRequest>;
  virtualCardRequests: VirtualCardRequestCollection;
};


/** This is the root query */
export type QueryAccountArgs = {
  githubHandle?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  throwIfMissing?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This is the root query */
export type QueryAccountsArgs = {
  consolidatedBalance?: InputMaybe<AmountRangeInput>;
  country?: InputMaybe<Array<InputMaybe<CountryIso>>>;
  hasCustomContributionsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  includeVendorsForHost?: InputMaybe<AccountReferenceInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isHost?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<OrderByInput>;
  parent?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  skipGuests?: InputMaybe<Scalars['Boolean']['input']>;
  skipRecentAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tagSearchOperator?: TagSearchOperator;
  type?: InputMaybe<Array<InputMaybe<AccountType>>>;
};


/** This is the root query */
export type QueryActivitiesArgs = {
  account: Array<AccountReferenceInput>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeParentAccount?: Scalars['Boolean']['input'];
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  timeline?: Scalars['Boolean']['input'];
  type?: InputMaybe<Array<ActivityAndClassesType>>;
};


/** This is the root query */
export type QueryApplicationArgs = {
  clientId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};


/** This is the root query */
export type QueryCollectiveArgs = {
  githubHandle?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  throwIfMissing?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This is the root query */
export type QueryContributorArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
};


/** This is the root query */
export type QueryContributorsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
  type?: InputMaybe<Array<InputMaybe<AccountType>>>;
};


/** This is the root query */
export type QueryConversationArgs = {
  id: Scalars['String']['input'];
};


/** This is the root query */
export type QueryCurrencyExchangeRateArgs = {
  requests: Array<CurrencyExchangeRateRequest>;
};


/** This is the root query */
export type QueryEventArgs = {
  githubHandle?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  throwIfMissing?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This is the root query */
export type QueryExpenseArgs = {
  draftKey?: InputMaybe<Scalars['String']['input']>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  id?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root query */
export type QueryExpenseTagStatsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tagSearchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root query */
export type QueryExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This is the root query */
export type QueryFundArgs = {
  githubHandle?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  throwIfMissing?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This is the root query */
export type QueryHostArgs = {
  githubHandle?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  throwIfMissing?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This is the root query */
export type QueryHostApplicationArgs = {
  hostApplication?: InputMaybe<HostApplicationReferenceInput>;
};


/** This is the root query */
export type QueryHostsArgs = {
  country?: InputMaybe<Array<InputMaybe<CountryIso>>>;
  currency?: InputMaybe<Scalars['String']['input']>;
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  skipGuests?: InputMaybe<Scalars['Boolean']['input']>;
  skipRecentAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tagSearchOperator?: TagSearchOperator;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


/** This is the root query */
export type QueryIndividualArgs = {
  githubHandle?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  throwIfMissing?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This is the root query */
export type QueryMemberInvitationsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  memberAccount?: InputMaybe<AccountReferenceInput>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This is the root query */
export type QueryMembersArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This is the root query */
export type QueryOrderArgs = {
  order: OrderReferenceInput;
};


/** This is the root query */
export type QueryOrdersArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root query */
export type QueryOrganizationArgs = {
  githubHandle?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  throwIfMissing?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This is the root query */
export type QueryPaypalPlanArgs = {
  account: AccountReferenceInput;
  amount: AmountInput;
  frequency: ContributionFrequency;
  order?: InputMaybe<OrderReferenceInput>;
  tier?: InputMaybe<TierReferenceInput>;
};


/** This is the root query */
export type QueryPersonalTokenArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};


/** This is the root query */
export type QueryProjectArgs = {
  githubHandle?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  throwIfMissing?: InputMaybe<Scalars['Boolean']['input']>;
};


/** This is the root query */
export type QuerySearchArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  defaultLimit?: Scalars['Int']['input'];
  host?: InputMaybe<AccountReferenceInput>;
  searchTerm: Scalars['String']['input'];
  timeout?: Scalars['Int']['input'];
};


/** This is the root query */
export type QueryTagStatsArgs = {
  host?: InputMaybe<AccountReferenceInput>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tagSearchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root query */
export type QueryTierArgs = {
  throwIfMissing?: Scalars['Boolean']['input'];
  tier: TierReferenceInput;
};


/** This is the root query */
export type QueryTransactionArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  transaction?: InputMaybe<TransactionReferenceInput>;
};


/** This is the root query */
export type QueryTransactionGroupArgs = {
  account: AccountReferenceInput;
  groupId: Scalars['String']['input'];
};


/** This is the root query */
export type QueryTransactionGroupsArgs = {
  account: AccountReferenceInput;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** This is the root query */
export type QueryTransactionsArgs = {
  account?: InputMaybe<Array<AccountReferenceInput>>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This is the root query */
export type QueryTransactionsImportArgs = {
  id: Scalars['String']['input'];
};


/** This is the root query */
export type QueryUpdateArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


/** This is the root query */
export type QueryUpdatesArgs = {
  accountTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  host?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
};


/** This is the root query */
export type QueryVirtualCardArgs = {
  throwIfMissing?: Scalars['Boolean']['input'];
  virtualCard: VirtualCardReferenceInput;
};


/** This is the root query */
export type QueryVirtualCardRequestArgs = {
  throwIfMissing?: Scalars['Boolean']['input'];
  virtualCardRequest: VirtualCardRequestReferenceInput;
};


/** This is the root query */
export type QueryVirtualCardRequestsArgs = {
  collective?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  host: AccountReferenceInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  status?: InputMaybe<Array<InputMaybe<VirtualCardRequestStatus>>>;
};

/** A recurring expense object */
export type RecurringExpense = {
  __typename?: 'RecurringExpense';
  account: Account;
  /** The time this expense will cease to be recurring */
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  fromAccount: Account;
  /** Unique identifier for this recurring expense */
  id: Scalars['String']['output'];
  /** The interval in which this recurring expense is created */
  interval: RecurringExpenseInterval;
  /** The last time this recurring expense was paid for */
  lastDraftedAt: Scalars['DateTime']['output'];
  /** The last expense created by this recurring expense record paid for */
  lastExpenseCreated?: Maybe<Expense>;
};

export type RecurringExpenseInput = {
  /** The date when this recurring expense should cease */
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** The interval in which this recurring expense is created */
  interval: RecurringExpenseInterval;
};

/** All supported intervals for recurring expenses */
export enum RecurringExpenseInterval {
  day = 'day',
  month = 'month',
  quarter = 'quarter',
  week = 'week',
  year = 'year'
}

export type SearchResponse = {
  __typename?: 'SearchResponse';
  /** Search results */
  results: SearchResults;
};

/** Search results for all types */
export type SearchResults = {
  __typename?: 'SearchResults';
  /** Search results for Accounts */
  accounts?: Maybe<SearchResultsAccounts>;
  /** Search results for Comments */
  comments?: Maybe<SearchResultsComments>;
  /** Search results for Expenses */
  expenses?: Maybe<SearchResultsExpenses>;
  /** Search results for HostApplications */
  hostApplications?: Maybe<SearchResultsHostApplications>;
  /** Search results for Orders */
  orders?: Maybe<SearchResultsOrders>;
  /** Search results for Tiers */
  tiers?: Maybe<SearchResultsTiers>;
  /** Search results for Transactions */
  transactions?: Maybe<SearchResultsTransactions>;
  /** Search results for Updates */
  updates?: Maybe<SearchResultsUpdates>;
};


/** Search results for all types */
export type SearchResultsAccountsArgs = {
  isHost?: InputMaybe<Scalars['Boolean']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<AccountType>;
};

export type SearchResultsAccounts = {
  __typename?: 'SearchResultsAccounts';
  collection: AccountCollection;
  /** Details about the matches typed as: { [id]: { score: number, fields: { [field]: [highlight] } } } */
  highlights?: Maybe<Scalars['JSONObject']['output']>;
  maxScore: Scalars['Float']['output'];
};

export type SearchResultsComments = {
  __typename?: 'SearchResultsComments';
  collection: CommentCollection;
  /** Details about the matches typed as: { [id]: { score: number, fields: { [field]: [highlight] } } } */
  highlights?: Maybe<Scalars['JSONObject']['output']>;
  maxScore: Scalars['Float']['output'];
};

export type SearchResultsExpenses = {
  __typename?: 'SearchResultsExpenses';
  collection: ExpenseCollection;
  /** Details about the matches typed as: { [id]: { score: number, fields: { [field]: [highlight] } } } */
  highlights?: Maybe<Scalars['JSONObject']['output']>;
  maxScore: Scalars['Float']['output'];
};

export type SearchResultsHostApplications = {
  __typename?: 'SearchResultsHostApplications';
  collection: HostApplicationCollection;
  /** Details about the matches typed as: { [id]: { score: number, fields: { [field]: [highlight] } } } */
  highlights?: Maybe<Scalars['JSONObject']['output']>;
  maxScore: Scalars['Float']['output'];
};

export type SearchResultsOrders = {
  __typename?: 'SearchResultsOrders';
  collection: OrderCollection;
  /** Details about the matches typed as: { [id]: { score: number, fields: { [field]: [highlight] } } } */
  highlights?: Maybe<Scalars['JSONObject']['output']>;
  maxScore: Scalars['Float']['output'];
};

export type SearchResultsTiers = {
  __typename?: 'SearchResultsTiers';
  collection: TierCollection;
  /** Details about the matches typed as: { [id]: { score: number, fields: { [field]: [highlight] } } } */
  highlights?: Maybe<Scalars['JSONObject']['output']>;
  maxScore: Scalars['Float']['output'];
};

export type SearchResultsTransactions = {
  __typename?: 'SearchResultsTransactions';
  collection: TransactionCollection;
  /** Details about the matches typed as: { [id]: { score: number, fields: { [field]: [highlight] } } } */
  highlights?: Maybe<Scalars['JSONObject']['output']>;
  maxScore: Scalars['Float']['output'];
};

export type SearchResultsUpdates = {
  __typename?: 'SearchResultsUpdates';
  collection: UpdateCollection;
  /** Details about the matches typed as: { [id]: { score: number, fields: { [field]: [highlight] } } } */
  highlights?: Maybe<Scalars['JSONObject']['output']>;
  maxScore: Scalars['Float']['output'];
};

export type SecurityCheck = {
  __typename?: 'SecurityCheck';
  /** SecurityCheck details */
  details?: Maybe<Scalars['String']['output']>;
  /** The SecurityCheck level */
  level: SecurityCheckLevel;
  /** SecurityCheck description message */
  message: Scalars['String']['output'];
  /** The SecurityCheck scope */
  scope: SecurityCheckScope;
};

/** All supported SecurityCheck levels */
export enum SecurityCheckLevel {
  HIGH = 'HIGH',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  PASS = 'PASS'
}

/** All supported SecurityCheck scopes */
export enum SecurityCheckScope {
  COLLECTIVE = 'COLLECTIVE',
  PAYEE = 'PAYEE',
  PAYOUT_METHOD = 'PAYOUT_METHOD',
  USER = 'USER'
}

export type SendMessageResult = {
  __typename?: 'SendMessageResult';
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type SetPasswordResponse = {
  __typename?: 'SetPasswordResponse';
  individual: Individual;
  token?: Maybe<Scalars['String']['output']>;
};

/** A Stripe setup intent */
export type SetupIntent = {
  __typename?: 'SetupIntent';
  id: Scalars['String']['output'];
  setupIntentClientSecret: Scalars['String']['output'];
  stripeAccount: Scalars['String']['output'];
  stripeAccountPublishableSecret: Scalars['String']['output'];
};

/** A Stripe setup intent */
export type SetupIntentInput = {
  id: Scalars['String']['input'];
  stripeAccount: Scalars['String']['input'];
};

/** A social link */
export type SocialLink = {
  __typename?: 'SocialLink';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  type: SocialLinkType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  url: Scalars['URL']['output'];
};

export type SocialLinkInput = {
  type: SocialLinkType;
  url: Scalars['URL']['input'];
};

/** The type of social link */
export enum SocialLinkType {
  BLUESKY = 'BLUESKY',
  DISCORD = 'DISCORD',
  DISCOURSE = 'DISCOURSE',
  FACEBOOK = 'FACEBOOK',
  GHOST = 'GHOST',
  GIT = 'GIT',
  GITHUB = 'GITHUB',
  GITLAB = 'GITLAB',
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  MASTODON = 'MASTODON',
  MATTERMOST = 'MATTERMOST',
  MEETUP = 'MEETUP',
  PEERTUBE = 'PEERTUBE',
  PIXELFED = 'PIXELFED',
  SLACK = 'SLACK',
  THREADS = 'THREADS',
  TIKTOK = 'TIKTOK',
  TUMBLR = 'TUMBLR',
  TWITCH = 'TWITCH',
  TWITTER = 'TWITTER',
  WEBSITE = 'WEBSITE',
  YOUTUBE = 'YOUTUBE'
}

/** Stripe connected account properties */
export type StripeConnectedAccount = {
  __typename?: 'StripeConnectedAccount';
  issuingBalance?: Maybe<Amount>;
  username?: Maybe<Scalars['String']['output']>;
};

export type StripeError = {
  __typename?: 'StripeError';
  account?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  response?: Maybe<Scalars['JSON']['output']>;
};

export type TagResponse = {
  __typename?: 'TagResponse';
  expense?: Maybe<Expense>;
  order?: Maybe<Order>;
};

/** The operator to use when searching with tags */
export enum TagSearchOperator {
  AND = 'AND',
  OR = 'OR'
}

/** Statistics for a given tag */
export type TagStat = {
  __typename?: 'TagStat';
  /** Total amount for this tag */
  amount?: Maybe<Amount>;
  /** Number of entries for this tag */
  count: Scalars['Int']['output'];
  /** An unique identifier for this tag */
  id: Scalars['String']['output'];
  /** Name/Label of the tag */
  tag: Scalars['String']['output'];
};

/** A collection of "Tags" */
export type TagStatsCollection = Collection & {
  __typename?: 'TagStatsCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<TagStat>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Information about a tax */
export type TaxInfo = {
  __typename?: 'TaxInfo';
  /** An unique identifier for this tax (GST, VAT, etc) */
  id: Scalars['String']['output'];
  /** Tax ID number of the 3rd party receiving/paying the tax */
  idNumber?: Maybe<Scalars['String']['output']>;
  /**
   * Percentage applied, between 0-100
   * @deprecated Please use `rate` instead
   */
  percentage: Scalars['Int']['output'];
  /** Percentage applied, between 0-1 */
  rate: Scalars['Float']['output'];
  /** Identifier for this tax (GST, VAT, etc) */
  type: TaxType;
};

/** Input to set taxes for an expense */
export type TaxInput = {
  /** An optional tax amount to make sure the tax displayed in your frontend matches the one calculated by the API */
  amount?: InputMaybe<AmountInput>;
  /** Country ISO code of the entity paying the tax */
  country?: InputMaybe<CountryIso>;
  /** Tax identification number, if any */
  idNumber?: InputMaybe<Scalars['String']['input']>;
  /** Tax rate as a float number between 0 and 1 */
  rate: Scalars['Float']['input'];
  /** Tax type */
  type: TaxType;
};

/** The type of a tax like GST, VAT, etc */
export enum TaxType {
  /** New Zealand Good and Services Tax */
  GST = 'GST',
  /** European Value Added Tax */
  VAT = 'VAT'
}

/** Tier model */
export type Tier = {
  __typename?: 'Tier';
  amount: Amount;
  amountType: TierAmountType;
  /** Number of tickets available. Returns null if there is no limit. */
  availableQuantity?: Maybe<Scalars['Int']['output']>;
  button?: Maybe<Scalars['String']['output']>;
  /** Returns a list of all the contributors for this tier */
  contributors: ContributorCollection;
  currency?: Maybe<Scalars['String']['output']>;
  customFields?: Maybe<Scalars['JSON']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  frequency: TierFrequency;
  goal: Amount;
  id: Scalars['String']['output'];
  /** @deprecated 2020-08-24: Please use "frequency" */
  interval?: Maybe<TierInterval>;
  invoiceTemplate?: Maybe<Scalars['String']['output']>;
  legacyId: Scalars['Int']['output'];
  /** A long, html-formatted description. */
  longDescription?: Maybe<Scalars['String']['output']>;
  maxQuantity?: Maybe<Scalars['Int']['output']>;
  minimumAmount: Amount;
  name?: Maybe<Scalars['String']['output']>;
  /** Get all orders */
  orders: OrderCollection;
  presets?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  requireAddress: Scalars['Boolean']['output'];
  singleTicket?: Maybe<Scalars['Boolean']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  stats?: Maybe<TierStats>;
  type: TierType;
  useStandalonePage?: Maybe<Scalars['Boolean']['output']>;
  /** Link to a video (YouTube, Vimeo). */
  videoUrl?: Maybe<Scalars['String']['output']>;
};


/** Tier model */
export type TierContributorsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** Tier model */
export type TierOrdersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
};

export enum TierAmountType {
  FIXED = 'FIXED',
  FLEXIBLE = 'FLEXIBLE'
}

/** A collection of "Tiers" */
export type TierCollection = Collection & {
  __typename?: 'TierCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Tier>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TierCreateInput = {
  amount?: InputMaybe<AmountInput>;
  amountType: TierAmountType;
  button?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  frequency: TierFrequency;
  goal?: InputMaybe<AmountInput>;
  invoiceTemplate?: InputMaybe<Scalars['String']['input']>;
  maxQuantity?: InputMaybe<Scalars['Int']['input']>;
  minimumAmount?: InputMaybe<AmountInput>;
  name: Scalars['NonEmptyString']['input'];
  presets?: InputMaybe<Array<Scalars['Int']['input']>>;
  singleTicket?: InputMaybe<Scalars['Boolean']['input']>;
  type: TierType;
  useStandalonePage?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum TierFrequency {
  FLEXIBLE = 'FLEXIBLE',
  MONTHLY = 'MONTHLY',
  ONETIME = 'ONETIME',
  YEARLY = 'YEARLY'
}

export enum TierInterval {
  flexible = 'flexible',
  month = 'month',
  year = 'year'
}

export type TierReferenceInput = {
  /** The id assigned to the Tier */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Pass this flag to reference the custom tier (/donate) */
  isCustom?: InputMaybe<Scalars['Boolean']['input']>;
  /** The DB id assigned to the Tier */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** Stats about a tier */
export type TierStats = {
  __typename?: 'TierStats';
  id: Scalars['String']['output'];
  /** How much money is given for this tier for each tier.interval (monthly/yearly). For flexible tiers, this amount is a monthly average of contributions amount, taking into account both yearly and monthly subscriptions. */
  recurringAmount: Amount;
  /** Total amount donated for this tier, in cents. */
  totalAmountReceived: Amount;
};

export enum TierType {
  DONATION = 'DONATION',
  MEMBERSHIP = 'MEMBERSHIP',
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  TICKET = 'TICKET',
  TIER = 'TIER'
}

export type TierUpdateInput = {
  amount?: InputMaybe<AmountInput>;
  amountType?: InputMaybe<TierAmountType>;
  button?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  frequency?: InputMaybe<TierFrequency>;
  goal?: InputMaybe<AmountInput>;
  /** The public id identifying the tier (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id: Scalars['String']['input'];
  invoiceTemplate?: InputMaybe<Scalars['String']['input']>;
  longDescription?: InputMaybe<Scalars['String']['input']>;
  maxQuantity?: InputMaybe<Scalars['Int']['input']>;
  minimumAmount?: InputMaybe<AmountInput>;
  name?: InputMaybe<Scalars['NonEmptyString']['input']>;
  presets?: InputMaybe<Array<Scalars['Int']['input']>>;
  singleTicket?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<TierType>;
  useStandalonePage?: InputMaybe<Scalars['Boolean']['input']>;
  videoUrl?: InputMaybe<Scalars['URL']['input']>;
};

export type TimeSeries = {
  /** The start date of the time series */
  dateFrom?: Maybe<Scalars['DateTime']['output']>;
  /** The end date of the time series */
  dateTo?: Maybe<Scalars['DateTime']['output']>;
  /** The interval between two data points */
  timeUnit: TimeUnit;
};

/** Amount time series */
export type TimeSeriesAmount = TimeSeries & {
  __typename?: 'TimeSeriesAmount';
  /** The start date of the time series */
  dateFrom?: Maybe<Scalars['DateTime']['output']>;
  /** The end date of the time series */
  dateTo?: Maybe<Scalars['DateTime']['output']>;
  /** Time series data points */
  nodes: Array<TimeSeriesAmountNode>;
  /** The interval between two data points */
  timeUnit: TimeUnit;
};

export type TimeSeriesAmountNode = {
  __typename?: 'TimeSeriesAmountNode';
  amount: Amount;
  count?: Maybe<Scalars['Int']['output']>;
  date: Scalars['DateTime']['output'];
  label?: Maybe<Scalars['String']['output']>;
};

/** Amounts with settlements time series */
export type TimeSeriesAmountWithKind = TimeSeries & {
  __typename?: 'TimeSeriesAmountWithKind';
  /** The start date of the time series */
  dateFrom?: Maybe<Scalars['DateTime']['output']>;
  /** The end date of the time series */
  dateTo?: Maybe<Scalars['DateTime']['output']>;
  /** Time series data points */
  nodes: Array<TimeSeriesAmountWithKindNode>;
  /** The interval between two data points */
  timeUnit: TimeUnit;
};

export type TimeSeriesAmountWithKindNode = {
  __typename?: 'TimeSeriesAmountWithKindNode';
  amount: Amount;
  date: Scalars['DateTime']['output'];
  kind: TransactionKind;
};

/** Amounts with settlements time series */
export type TimeSeriesAmountWithSettlement = TimeSeries & {
  __typename?: 'TimeSeriesAmountWithSettlement';
  /** The start date of the time series */
  dateFrom?: Maybe<Scalars['DateTime']['output']>;
  /** The end date of the time series */
  dateTo?: Maybe<Scalars['DateTime']['output']>;
  /** Time series data points */
  nodes: Array<TimeSeriesAmountWithSettlementNode>;
  /** The interval between two data points */
  timeUnit: TimeUnit;
};

export type TimeSeriesAmountWithSettlementNode = {
  __typename?: 'TimeSeriesAmountWithSettlementNode';
  amount: Amount;
  date: Scalars['DateTime']['output'];
  settlementStatus: TransactionSettlementStatus;
};

export enum TimeUnit {
  DAY = 'DAY',
  HOUR = 'HOUR',
  MINUTE = 'MINUTE',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  SECOND = 'SECOND',
  WEEK = 'WEEK',
  YEAR = 'YEAR'
}

/** Transaction interface shared by all kind of transactions (Debit, Credit) */
export type Transaction = {
  account?: Maybe<Account>;
  amount: Amount;
  amountInHostCurrency: Amount;
  /** The balance after the Transaction has run. Only for financially active accounts. */
  balanceInHostCurrency?: Maybe<Amount>;
  clearedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  expense?: Maybe<Expense>;
  /** The sender of a transaction (on CREDIT = oppositeAccount, DEBIT = account) */
  fromAccount?: Maybe<Account>;
  giftCardEmitterAccount?: Maybe<Account>;
  group: Scalars['String']['output'];
  host?: Maybe<Account>;
  /** Exchange rate between the currency of the transaction and the currency of the host (transaction.amount * transaction.hostCurrencyFxRate = transaction.amountInHostCurrency) */
  hostCurrencyFxRate?: Maybe<Scalars['Float']['output']>;
  hostFee?: Maybe<Amount>;
  id: Scalars['String']['output'];
  invoiceTemplate?: Maybe<Scalars['String']['output']>;
  isDisputed?: Maybe<Scalars['Boolean']['output']>;
  isInReview?: Maybe<Scalars['Boolean']['output']>;
  isOrderRejected: Scalars['Boolean']['output'];
  isRefund?: Maybe<Scalars['Boolean']['output']>;
  isRefunded?: Maybe<Scalars['Boolean']['output']>;
  kind?: Maybe<TransactionKind>;
  legacyId: Scalars['Int']['output'];
  /** Merchant id related to the Transaction (Stripe, PayPal, Wise, Privacy) */
  merchantId?: Maybe<Scalars['String']['output']>;
  netAmount: Amount;
  netAmountInHostCurrency: Amount;
  oppositeAccount?: Maybe<Account>;
  /** The opposite transaction (CREDIT -> DEBIT, DEBIT -> CREDIT) */
  oppositeTransaction?: Maybe<Transaction>;
  order?: Maybe<Order>;
  paymentMethod?: Maybe<PaymentMethod>;
  paymentProcessorFee?: Maybe<Amount>;
  paymentProcessorUrl?: Maybe<Scalars['String']['output']>;
  payoutMethod?: Maybe<PayoutMethod>;
  permissions?: Maybe<TransactionPermissions>;
  platformFee: Amount;
  refundTransaction?: Maybe<Transaction>;
  relatedTransactions: Array<Maybe<Transaction>>;
  taxAmount: Amount;
  /** If a tax is set, this field will contain more info about the tax */
  taxInfo?: Maybe<TaxInfo>;
  /** The recipient of a transaction (on CREDIT = account, DEBIT = oppositeAccount) */
  toAccount?: Maybe<Account>;
  type: TransactionType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** @deprecated 2021-08-15: Use id instead. */
  uuid: Scalars['String']['output'];
};


/** Transaction interface shared by all kind of transactions (Debit, Credit) */
export type TransactionDescriptionArgs = {
  dynamic?: InputMaybe<Scalars['Boolean']['input']>;
  full?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Transaction interface shared by all kind of transactions (Debit, Credit) */
export type TransactionHostFeeArgs = {
  fetchHostFee?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Transaction interface shared by all kind of transactions (Debit, Credit) */
export type TransactionNetAmountArgs = {
  fetchHostFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchPaymentProcessorFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchTax?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Transaction interface shared by all kind of transactions (Debit, Credit) */
export type TransactionNetAmountInHostCurrencyArgs = {
  fetchHostFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchPaymentProcessorFee?: InputMaybe<Scalars['Boolean']['input']>;
  fetchTax?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Transaction interface shared by all kind of transactions (Debit, Credit) */
export type TransactionPaymentProcessorFeeArgs = {
  fetchPaymentProcessorFee?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Transaction interface shared by all kind of transactions (Debit, Credit) */
export type TransactionRelatedTransactionsArgs = {
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
};


/** Transaction interface shared by all kind of transactions (Debit, Credit) */
export type TransactionTaxAmountArgs = {
  fetchTax?: InputMaybe<Scalars['Boolean']['input']>;
};

/** A collection of Transactions (Debit or Credit) */
export type TransactionCollection = Collection & {
  __typename?: 'TransactionCollection';
  kinds?: Maybe<Array<Maybe<TransactionKind>>>;
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Transaction>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  /** The types of payment methods used in this collection, regardless of the pagination */
  paymentMethodTypes: Array<Maybe<PaymentMethodType>>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Transaction group */
export type TransactionGroup = {
  __typename?: 'TransactionGroup';
  /** The account on the main side of the transaction (CREDIT -> recipient, DEBIT -> sender) */
  account?: Maybe<Account>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  host?: Maybe<Account>;
  id: Scalars['String']['output'];
  /** The primary transaction in the group */
  primaryTransaction?: Maybe<Transaction>;
  totalAmount: Amount;
  /** The transactions in the group */
  transactions?: Maybe<Array<Maybe<Transaction>>>;
};

/** A collection of Transactions groups */
export type TransactionGroupCollection = Collection & {
  __typename?: 'TransactionGroupCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes: Array<TransactionGroup>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export enum TransactionKind {
  ADDED_FUNDS = 'ADDED_FUNDS',
  BALANCE_TRANSFER = 'BALANCE_TRANSFER',
  CONTRIBUTION = 'CONTRIBUTION',
  EXPENSE = 'EXPENSE',
  HOST_FEE = 'HOST_FEE',
  HOST_FEE_SHARE = 'HOST_FEE_SHARE',
  HOST_FEE_SHARE_DEBT = 'HOST_FEE_SHARE_DEBT',
  PAYMENT_PROCESSOR_COVER = 'PAYMENT_PROCESSOR_COVER',
  PAYMENT_PROCESSOR_DISPUTE_FEE = 'PAYMENT_PROCESSOR_DISPUTE_FEE',
  PAYMENT_PROCESSOR_FEE = 'PAYMENT_PROCESSOR_FEE',
  PLATFORM_FEE = 'PLATFORM_FEE',
  PLATFORM_TIP = 'PLATFORM_TIP',
  PLATFORM_TIP_DEBT = 'PLATFORM_TIP_DEBT',
  PREPAID_PAYMENT_METHOD = 'PREPAID_PAYMENT_METHOD',
  TAX = 'TAX'
}

/** Fields for the user permissions on an transaction */
export type TransactionPermissions = {
  __typename?: 'TransactionPermissions';
  /** Whether the current user can download this transaction's invoice */
  canDownloadInvoice: Scalars['Boolean']['output'];
  /** Whether the current user can edit the transaction */
  canRefund: Scalars['Boolean']['output'];
  /** Whether the current user can reject the transaction */
  canReject: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
};

export type TransactionReferenceInput = {
  /** The public id identifying the transaction (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The internal id of the transaction (ie: 580) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** EXPERIMENTAL (this may change or be deleted) */
export type TransactionReport = {
  __typename?: 'TransactionReport';
  date?: Maybe<Scalars['DateTime']['output']>;
  endingBalance: Amount;
  groups: Array<Maybe<TransactionsAmountGroup>>;
  startingBalance: Amount;
  totalChange: Amount;
};

/** EXPERIMENTAL (this may change or be deleted): Host transaction report */
export type TransactionReports = {
  __typename?: 'TransactionReports';
  /** The start date of the time series */
  dateFrom?: Maybe<Scalars['DateTime']['output']>;
  /** The end date of the time series */
  dateTo?: Maybe<Scalars['DateTime']['output']>;
  nodes?: Maybe<Array<TransactionReport>>;
  /** The interval between two data points */
  timeUnit: TimeUnit;
};

export enum TransactionSettlementStatus {
  INVOICED = 'INVOICED',
  OWED = 'OWED',
  SETTLED = 'SETTLED'
}

/** All transaction types */
export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

/** EXPERIMENTAL (this may change or be deleted): Transaction amounts grouped by type, kind, isRefund, isHost, expenseType */
export type TransactionsAmountGroup = {
  __typename?: 'TransactionsAmountGroup';
  amount?: Maybe<Amount>;
  expenseType?: Maybe<ExpenseType>;
  hostFee?: Maybe<Amount>;
  isHost?: Maybe<Scalars['Boolean']['output']>;
  isRefund?: Maybe<Scalars['Boolean']['output']>;
  kind?: Maybe<TransactionKind>;
  netAmount?: Maybe<Amount>;
  paymentProcessorFee?: Maybe<Amount>;
  platformFee?: Maybe<Amount>;
  taxAmount?: Maybe<Amount>;
  type?: Maybe<TransactionType>;
};

export type TransactionsImport = {
  __typename?: 'TransactionsImport';
  /** Account that holds the import */
  account: Account;
  /** Connected account linked to the import */
  connectedAccount?: Maybe<ConnectedAccount>;
  /** When the import was created */
  createdAt: Scalars['DateTime']['output'];
  /** Configuration for the CSV import */
  csvConfig?: Maybe<Scalars['JSON']['output']>;
  /** URL of the import (e.g. link to the CSV file) */
  file?: Maybe<FileInfo>;
  /** The public id of the import */
  id: Scalars['String']['output'];
  /** Whether the import is currently syncing */
  isSyncing: Scalars['Boolean']['output'];
  /** When the import was last synced */
  lastSyncAt?: Maybe<Scalars['DateTime']['output']>;
  /** Cursor that defines where the last sync left off. Useful to know if there is new data to sync */
  lastSyncCursor?: Maybe<Scalars['String']['output']>;
  /** Name of the import (e.g. "Contributions May 2021", "Tickets for Mautic Conference 2024") */
  name: Scalars['NonEmptyString']['output'];
  /** List of rows in the import */
  rows: TransactionsImportRowCollection;
  /** Source of the import (e.g. "Bank of America", "Eventbrite", etc...) */
  source: Scalars['NonEmptyString']['output'];
  stats?: Maybe<TransactionsImportStats>;
  /** Type of the import */
  type: TransactionsImportType;
  /** When the import was last updated */
  updatedAt: Scalars['DateTime']['output'];
};


export type TransactionsImportRowsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TransactionsImportRowStatus>;
};

/** A row in a transactions import */
export type TransactionsImportRow = {
  __typename?: 'TransactionsImportRow';
  /** The amount of the row */
  amount: Amount;
  /** The date of the row */
  date: Scalars['DateTime']['output'];
  /** The description of the row */
  description: Scalars['String']['output'];
  /** The expense associated with the row */
  expense?: Maybe<Expense>;
  /** The public id of the imported row */
  id: Scalars['String']['output'];
  /** Whether the row has been dismissed */
  isDismissed: Scalars['Boolean']['output'];
  /** The order associated with the row */
  order?: Maybe<Order>;
  /** The raw data of the row */
  rawValue?: Maybe<Scalars['JSONObject']['output']>;
  /** The source id of the row */
  sourceId: Scalars['NonEmptyString']['output'];
};

/** A collection of "TransactionsImportRow" */
export type TransactionsImportRowCollection = Collection & {
  __typename?: 'TransactionsImportRowCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<TransactionsImportRow>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TransactionsImportRowCreateInput = {
  /** The amount of the row */
  amount: AmountInput;
  /** The date of the row */
  date: Scalars['DateTime']['input'];
  /** The description of the row */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Whether the row is dismissed */
  isDismissed?: Scalars['Boolean']['input'];
  /** The raw value of the row */
  rawValue?: InputMaybe<Scalars['JSONObject']['input']>;
  /** The source id of the row */
  sourceId: Scalars['NonEmptyString']['input'];
};

export type TransactionsImportRowReferenceInput = {
  /** The id of the row */
  id: Scalars['NonEmptyString']['input'];
};

/** The status of a row in a transactions import */
export enum TransactionsImportRowStatus {
  /** The row has been ignored */
  IGNORED = 'IGNORED',
  /** The row has been linked to an existing expense or order */
  LINKED = 'LINKED',
  /** The row has not been processed yet */
  PENDING = 'PENDING'
}

export type TransactionsImportRowUpdateInput = {
  /** The amount of the row */
  amount?: InputMaybe<AmountInput>;
  /** The date of the row */
  date?: InputMaybe<Scalars['DateTime']['input']>;
  /** The description of the row */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The id of the row */
  id: Scalars['NonEmptyString']['input'];
  /** Whether the row is dismissed */
  isDismissed?: InputMaybe<Scalars['Boolean']['input']>;
  /** The order associated with the row */
  order?: InputMaybe<OrderReferenceInput>;
  /** The source id of the row */
  sourceId?: InputMaybe<Scalars['NonEmptyString']['input']>;
};

export type TransactionsImportStats = {
  __typename?: 'TransactionsImportStats';
  /** Number of rows that have been converted to expenses */
  expenses: Scalars['Int']['output'];
  /** Number of rows that have been ignored */
  ignored: Scalars['Int']['output'];
  /** Number of rows that have been converted to orders */
  orders: Scalars['Int']['output'];
  /** Number of rows that have been processed (either dismissed or converted to expenses or orders) */
  processed: Scalars['Int']['output'];
  /** Total number of rows in the import */
  total: Scalars['Int']['output'];
};

/** Type of the import */
export enum TransactionsImportType {
  CSV = 'CSV',
  MANUAL = 'MANUAL',
  PLAID = 'PLAID'
}

/** A collection of "TransactionsImports" */
export type TransactionsImportsCollection = Collection & {
  __typename?: 'TransactionsImportsCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<TransactionsImport>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** TransferWise related properties for bank transfer. */
export type TransferWise = {
  __typename?: 'TransferWise';
  amountBatched?: Maybe<Amount>;
  availableCurrencies?: Maybe<Array<Maybe<Scalars['JSONObject']['output']>>>;
  /** Transferwise balances. Returns null if Transferwise account is not connected. */
  balances?: Maybe<Array<Maybe<Amount>>>;
  /** Unique identifier for this Wise object */
  id: Scalars['String']['output'];
  requiredFields?: Maybe<Array<Maybe<TransferWiseRequiredField>>>;
};


/** TransferWise related properties for bank transfer. */
export type TransferWiseAvailableCurrenciesArgs = {
  ignoreBlockedCurrencies?: InputMaybe<Scalars['Boolean']['input']>;
};


/** TransferWise related properties for bank transfer. */
export type TransferWiseRequiredFieldsArgs = {
  accountDetails?: InputMaybe<Scalars['JSON']['input']>;
  currency: Scalars['String']['input'];
};

export type TransferWiseField = {
  __typename?: 'TransferWiseField';
  group?: Maybe<Array<Maybe<TransferWiseFieldGroup>>>;
  name?: Maybe<Scalars['String']['output']>;
};

export type TransferWiseFieldGroup = {
  __typename?: 'TransferWiseFieldGroup';
  displayFormat?: Maybe<Scalars['String']['output']>;
  example?: Maybe<Scalars['String']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  maxLength?: Maybe<Scalars['Int']['output']>;
  minLength?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  refreshRequirementsOnChange?: Maybe<Scalars['Boolean']['output']>;
  required?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  validationAsync?: Maybe<Scalars['String']['output']>;
  validationRegexp?: Maybe<Scalars['String']['output']>;
  valuesAllowed?: Maybe<Array<Maybe<TransferWiseFieldVatvkluesAllowed>>>;
};

export type TransferWiseFieldVatvkluesAllowed = {
  __typename?: 'TransferWiseFieldVatvkluesAllowed';
  key?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type TransferWiseRequiredField = {
  __typename?: 'TransferWiseRequiredField';
  fields?: Maybe<Array<Maybe<TransferWiseField>>>;
  title?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

/** A two factor authentication method */
export enum TwoFactorMethod {
  TOTP = 'TOTP',
  WEBAUTHN = 'WEBAUTHN',
  YUBIKEY_OTP = 'YUBIKEY_OTP'
}

export type UnfollowAccountResult = {
  __typename?: 'UnfollowAccountResult';
  individual: Individual;
  member?: Maybe<Member>;
};

/** This represents an Update */
export type Update = {
  __typename?: 'Update';
  account?: Maybe<Account>;
  /** Some stats about the target audience. Will be null if the update is already published or if you don't have enough permissions so see this information. Not backed by a loader, avoid using this field in lists. */
  audienceStats?: Maybe<UpdateAudienceStats>;
  /** List the comments for this update. Not backed by a loader, don't use this in lists. */
  comments?: Maybe<CommentCollection>;
  createdAt: Scalars['DateTime']['output'];
  fromAccount?: Maybe<Account>;
  html?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isChangelog: Scalars['Boolean']['output'];
  isPrivate: Scalars['Boolean']['output'];
  legacyId?: Maybe<Scalars['Int']['output']>;
  makePublicOn?: Maybe<Scalars['DateTime']['output']>;
  notificationAudience?: Maybe<UpdateAudience>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Returns a map of reactions counts for this update */
  reactions?: Maybe<Scalars['JSON']['output']>;
  slug: Scalars['String']['output'];
  summary?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** Indicates whether or not the user is allowed to publish this update */
  userCanPublishUpdate: Scalars['Boolean']['output'];
  /** Indicates whether or not the user is allowed to see the content of this update */
  userCanSeeUpdate: Scalars['Boolean']['output'];
  /** Returns the list of reactions added to this update by logged in user */
  userReactions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};


/** This represents an Update */
export type UpdateAudienceStatsArgs = {
  audience?: InputMaybe<UpdateAudience>;
};


/** This represents an Update */
export type UpdateCommentsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

/** Defines targets for an update */
export enum UpdateAudience {
  /** Will be sent to collective admins and financial contributors */
  ALL = 'ALL',
  /** Will be sent to collective admins */
  COLLECTIVE_ADMINS = 'COLLECTIVE_ADMINS',
  /** Will be sent to financial contributors */
  FINANCIAL_CONTRIBUTORS = 'FINANCIAL_CONTRIBUTORS',
  /** Will be sent to no one */
  NO_ONE = 'NO_ONE'
}

/** Stats about the potential audience of an update */
export type UpdateAudienceStats = {
  __typename?: 'UpdateAudienceStats';
  collectives: Scalars['Int']['output'];
  coreContributors: Scalars['Int']['output'];
  hosted: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  individuals: Scalars['Int']['output'];
  organizations: Scalars['Int']['output'];
  /** The total number of emails to send */
  total: Scalars['Int']['output'];
};

/** Input to order updates chronologically */
export type UpdateChronologicalOrderInput = {
  /** Ordering direction. */
  direction?: OrderDirection;
  /** Field to chronologically order by. */
  field?: UpdateDateTimeField;
};

/** A collection of "Updates" */
export type UpdateCollection = Collection & {
  __typename?: 'UpdateCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Update>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Input type for UpdateType */
export type UpdateCreateInput = {
  account: AccountReferenceInput;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  html: Scalars['String']['input'];
  isChangelog?: InputMaybe<Scalars['Boolean']['input']>;
  isPrivate?: InputMaybe<Scalars['Boolean']['input']>;
  makePublicOn?: InputMaybe<Scalars['DateTime']['input']>;
  notificationAudience?: InputMaybe<UpdateAudience>;
  title: Scalars['String']['input'];
};

/** All possible DateTime fields for an update */
export enum UpdateDateTimeField {
  /** The creation time */
  CREATED_AT = 'CREATED_AT',
  /** The creation time */
  PUBLISHED_AT = 'PUBLISHED_AT'
}

export type UpdateReferenceInput = {
  /** The public id identifying the update */
  id?: InputMaybe<Scalars['String']['input']>;
};

/** Input type for UpdateType */
export type UpdateUpdateInput = {
  fromAccount?: InputMaybe<AccountReferenceInput>;
  html?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isChangelog?: InputMaybe<Scalars['Boolean']['input']>;
  isPrivate?: InputMaybe<Scalars['Boolean']['input']>;
  makePublicOn?: InputMaybe<Scalars['DateTime']['input']>;
  notificationAudience?: InputMaybe<UpdateAudience>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UploadFileInput = {
  /** The file to upload */
  file: Scalars['Upload']['input'];
  /** The kind of file to uploaded */
  kind: UploadedFileKind;
  /** Whether to run OCR on the document. Note that this feature is only available to selected accounts. */
  parseDocument?: Scalars['Boolean']['input'];
  /** If `parseDocument` is true, you can use this field to pass options to the OCR parser. */
  parsingOptions?: InputMaybe<OcrParsingOptionsInput>;
};

export type UploadFileResult = {
  __typename?: 'UploadFileResult';
  file: FileInfo;
  parsingResult?: Maybe<ParseUploadedFileResult>;
};

/** The kind of file that was uploaded */
export enum UploadedFileKind {
  ACCOUNT_AVATAR = 'ACCOUNT_AVATAR',
  ACCOUNT_BANNER = 'ACCOUNT_BANNER',
  ACCOUNT_CUSTOM_EMAIL = 'ACCOUNT_CUSTOM_EMAIL',
  ACCOUNT_LONG_DESCRIPTION = 'ACCOUNT_LONG_DESCRIPTION',
  AGREEMENT_ATTACHMENT = 'AGREEMENT_ATTACHMENT',
  COMMENT = 'COMMENT',
  EXPENSE_ATTACHED_FILE = 'EXPENSE_ATTACHED_FILE',
  EXPENSE_ITEM = 'EXPENSE_ITEM',
  TIER_LONG_DESCRIPTION = 'TIER_LONG_DESCRIPTION',
  TRANSACTIONS_IMPORT = 'TRANSACTIONS_IMPORT',
  UPDATE = 'UPDATE'
}

/** User two factor authentication method */
export type UserTwoFactorMethod = {
  __typename?: 'UserTwoFactorMethod';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  method: TwoFactorMethod;
  name: Scalars['String']['output'];
};

export type UserTwoFactorMethodReferenceInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** This represents a Vendor account */
export type Vendor = Account & AccountWithContributions & {
  __typename?: 'Vendor';
  /** [!] Warning: this query is currently in beta and the API might change */
  activeContributors: AccountCollection;
  /** List of activities that the logged-in user is subscribed for this collective */
  activitySubscriptions?: Maybe<Array<Maybe<ActivitySubscription>>>;
  backgroundImageUrl?: Maybe<Scalars['String']['output']>;
  /** Whether this account can have changelog updates */
  canHaveChangelogUpdates: Scalars['Boolean']['output'];
  /** Returns true if the remote user can start the process to resume contributions for account */
  canStartResumeContributionsProcess: Scalars['Boolean']['output'];
  categories: Array<Maybe<Scalars['String']['output']>>;
  childrenAccounts: AccountCollection;
  /** The list of connected accounts (Stripe, Twitter, etc ...). Admin only. Scope: "connectedAccounts". */
  connectedAccounts?: Maybe<Array<Maybe<ConnectedAccount>>>;
  contributionPolicy?: Maybe<Scalars['String']['output']>;
  /** All the persons and entities that contribute to this account */
  contributors: ContributorCollection;
  conversations: ConversationCollection;
  /** Returns conversation's tags for collective sorted by popularity */
  conversationsTags?: Maybe<Array<Maybe<TagStat>>>;
  /** The time of creation */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** The account who created this order */
  createdByAccount?: Maybe<Account>;
  /** The currency of the account */
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  /** If this account was duplicated, the accounts that were created from it */
  duplicatedAccounts: AccountCollection;
  /** If created by duplication, the account from which this one was duplicated */
  duplicatedFromAccount?: Maybe<Account>;
  /** Returns the emails of the account. Individuals only have one, but organizations can have multiple emails. */
  emails?: Maybe<Array<Scalars['EmailAddress']['output']>>;
  /** @deprecated 2024-11-04: Please use policies.EXPENSE_POLICIES */
  expensePolicy?: Maybe<Scalars['String']['output']>;
  expenses: ExpenseCollection;
  /** Returns expense tags for collective sorted by popularity */
  expensesTags?: Maybe<Array<Maybe<TagStat>>>;
  /** Describes the features enabled and available for this account */
  features: CollectiveFeatures;
  feed?: Maybe<Array<Maybe<Activity>>>;
  /** @deprecated 2022-06-03: Please use repositoryUrl */
  githubHandle?: Maybe<Scalars['String']['output']>;
  /** Returns whether this account has any payout methods saved */
  hasPayoutMethod?: Maybe<Scalars['Boolean']['output']>;
  /** Returns true if the account has started the process to resume contributions */
  hasResumeContributionsProcessStarted: Scalars['Boolean']['output'];
  /** Host application requests */
  hostApplicationRequests: HostApplicationCollection;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Returns whether the account accepts financial contributions. */
  isActive?: Maybe<Scalars['Boolean']['output']>;
  /** Returns true if the remote user is an admin of this account */
  isAdmin: Scalars['Boolean']['output'];
  /** Returns whether this account is archived */
  isArchived: Scalars['Boolean']['output'];
  /** Whether this account is frozen */
  isFrozen: Scalars['Boolean']['output'];
  /** Returns whether the account is setup to Host collectives. */
  isHost: Scalars['Boolean']['output'];
  /** Defines if the contributors wants to be incognito (name not displayed) */
  isIncognito: Scalars['Boolean']['output'];
  legacyId: Scalars['Int']['output'];
  /** The legal documents associated with this account */
  legalDocuments?: Maybe<Array<Maybe<LegalDocument>>>;
  /** Private, legal name. Used for expense receipts, taxes, etc. Scope: "account". */
  legalName?: Maybe<Scalars['String']['output']>;
  /** The address associated to this account. This field is always public for collectives and events. */
  location?: Maybe<Location>;
  longDescription?: Maybe<Scalars['String']['output']>;
  /** [AUTHENTICATED] Returns the pending invitations */
  memberInvitations?: Maybe<Array<Maybe<MemberInvitation>>>;
  memberOf: MemberOfCollection;
  /** Get all members (admins, members, backers, followers) */
  members: MemberCollection;
  /** Public name */
  name?: Maybe<Scalars['String']['output']>;
  /** The list of applications created by this account. Admin only. Scope: "applications". */
  oAuthApplications?: Maybe<OAuthApplicationCollection>;
  orders: OrderCollection;
  /** @deprecated 2022-12-16: use parent on AccountWithParent instead */
  parentAccount?: Maybe<Account>;
  /** The list of payment methods that this collective can use to pay for Orders. Admin or Host only. Scope: "orders". */
  paymentMethods?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payment methods for this account that are pending a client confirmation (3D Secure / SCA) */
  paymentMethodsWithPendingConfirmation?: Maybe<Array<Maybe<PaymentMethod>>>;
  /** The list of payout methods that this collective can use to get paid. In most cases, admin only and scope: "expenses". */
  payoutMethods?: Maybe<Array<Maybe<PayoutMethod>>>;
  /** Logged-in user permissions on an account */
  permissions: AccountPermissions;
  /** Returns true if a custom contribution to Open Collective can be submitted for contributions made to this account */
  platformContributionAvailable: Scalars['Boolean']['output'];
  /** How much platform fees are charged for this account */
  platformFeePercent: Scalars['Float']['output'];
  /** Policies for the account. To see non-public policies you need to be admin and have the scope: "account". */
  policies: Policies;
  /** @deprecated 2023-01-16: Please use socialLinks */
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  settings: Scalars['JSON']['output'];
  /** The slug identifying the account (ie: babel) */
  slug: Scalars['String']['output'];
  socialLinks: Array<SocialLink>;
  stats?: Maybe<AccountStats>;
  /** The list of expense types supported by this account */
  supportedExpenseTypes: Array<ExpenseType>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tiers: TierCollection;
  /** Number of unique financial contributors. */
  totalFinancialContributors: Scalars['Int']['output'];
  /** [!] Warning: this query is currently in beta and the API might change */
  transactionGroups: TransactionGroupCollection;
  /** EXPERIMENTAL (this may change or be removed) */
  transactionReports?: Maybe<TransactionReports>;
  transactions: TransactionCollection;
  transferwise?: Maybe<TransferWise>;
  /** @deprecated 2023-01-16: Please use socialLinks */
  twitterHandle?: Maybe<Scalars['String']['output']>;
  type: AccountType;
  /** Date of unhosting by a given Fiscal Host. */
  unhostedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Updates published by the account. To see unpublished updates, you need to be an admin and have the scope "updates". */
  updates: UpdateCollection;
  vendorInfo?: Maybe<VendorInfo>;
  /** Virtual Cards Merchants used by the account. Admin only. Scope: "virtualCards". */
  virtualCardMerchants?: Maybe<AccountCollection>;
  /** Virtual Cards attached to the account. Admin only. Scope: "virtualCards". */
  virtualCards?: Maybe<VirtualCardCollection>;
  webhooks: WebhookCollection;
  /** @deprecated 2023-01-16: Please use socialLinks */
  website?: Maybe<Scalars['String']['output']>;
};


/** This represents a Vendor account */
export type VendorActiveContributorsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  includeActiveRecurringContributions?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Vendor account */
export type VendorActivitySubscriptionsArgs = {
  channel?: InputMaybe<ActivityChannel>;
};


/** This represents a Vendor account */
export type VendorBackgroundImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents a Vendor account */
export type VendorChildrenAccountsArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Vendor account */
export type VendorContributorsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  roles?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents a Vendor account */
export type VendorConversationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Vendor account */
export type VendorConversationsTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents a Vendor account */
export type VendorDuplicatedAccountsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Vendor account */
export type VendorExpensesArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chargeHasReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  createdByAccount?: InputMaybe<AccountReferenceInput>;
  customData?: InputMaybe<Scalars['JSON']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  direction?: InputMaybe<ExpenseDirection>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenExpenses?: Scalars['Boolean']['input'];
  lastCommentBy?: InputMaybe<Array<InputMaybe<LastCommentBy>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  payoutMethodType?: InputMaybe<PayoutMethodType>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<ExpenseStatusFilter>>>;
  tag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<ExpenseType>;
  types?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  virtualCards?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents a Vendor account */
export type VendorExpensesTagsArgs = {
  limit?: Scalars['Int']['input'];
};


/** This represents a Vendor account */
export type VendorFeedArgs = {
  classes?: InputMaybe<Array<InputMaybe<ActivityClassType>>>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents a Vendor account */
export type VendorHostApplicationRequestsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  status?: InputMaybe<HostApplicationStatus>;
};


/** This represents a Vendor account */
export type VendorImageUrlArgs = {
  format?: InputMaybe<ImageFormat>;
  height?: InputMaybe<Scalars['Int']['input']>;
};


/** This represents a Vendor account */
export type VendorLegalDocumentsArgs = {
  type?: InputMaybe<Array<InputMaybe<LegalDocumentType>>>;
};


/** This represents a Vendor account */
export type VendorMemberInvitationsArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  memberAccount?: InputMaybe<AccountReferenceInput>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents a Vendor account */
export type VendorMemberOfArgs = {
  account?: InputMaybe<AccountReferenceInput>;
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  hostFeesStructure?: InputMaybe<HostFeeStructure>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isHostAccount?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: OrderByInput;
  orderByRoles?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Vendor account */
export type VendorMembersArgs = {
  accountType?: InputMaybe<Array<InputMaybe<AccountType>>>;
  email?: InputMaybe<Scalars['EmailAddress']['input']>;
  includeInherited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: ChronologicalOrderInput;
  role?: InputMaybe<Array<InputMaybe<MemberRole>>>;
};


/** This represents a Vendor account */
export type VendorOAuthApplicationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Vendor account */
export type VendorOrdersArgs = {
  chargedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  chargedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  expectedDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  expectedFundsFilter?: InputMaybe<ExpectedFundsFilter>;
  filter?: InputMaybe<AccountOrdersFilter>;
  frequency?: InputMaybe<Array<InputMaybe<ContributionFrequency>>>;
  includeChildrenAccounts?: Scalars['Boolean']['input'];
  includeHostedAccounts?: InputMaybe<Scalars['Boolean']['input']>;
  includeIncognito?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  onlyActiveSubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  onlySubscriptions?: InputMaybe<Scalars['Boolean']['input']>;
  oppositeAccount?: InputMaybe<AccountReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  pausedBy?: InputMaybe<Array<InputMaybe<OrderPausedBy>>>;
  paymentMethod?: InputMaybe<PaymentMethodReferenceInput>;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<OrderStatus>>>;
  tier?: InputMaybe<Array<InputMaybe<TierReferenceInput>>>;
  tierSlug?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Vendor account */
export type VendorPaymentMethodsArgs = {
  enumType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  includeExpired?: InputMaybe<Scalars['Boolean']['input']>;
  service?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  type?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
};


/** This represents a Vendor account */
export type VendorTiersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Vendor account */
export type VendorTotalFinancialContributorsArgs = {
  accountType?: InputMaybe<AccountType>;
};


/** This represents a Vendor account */
export type VendorTransactionGroupsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  kind?: InputMaybe<TransactionKind>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  type?: InputMaybe<TransactionType>;
};


/** This represents a Vendor account */
export type VendorTransactionReportsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  timeUnit?: InputMaybe<TimeUnit>;
};


/** This represents a Vendor account */
export type VendorTransactionsArgs = {
  accountingCategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clearedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  clearedTo?: InputMaybe<Scalars['DateTime']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  excludeAccount?: InputMaybe<Array<InputMaybe<AccountReferenceInput>>>;
  expense?: InputMaybe<ExpenseReferenceInput>;
  expenseType?: InputMaybe<Array<InputMaybe<ExpenseType>>>;
  fromAccount?: InputMaybe<AccountReferenceInput>;
  group?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  hasExpense?: InputMaybe<Scalars['Boolean']['input']>;
  hasOrder?: InputMaybe<Scalars['Boolean']['input']>;
  host?: InputMaybe<AccountReferenceInput>;
  includeChildrenTransactions?: Scalars['Boolean']['input'];
  includeDebts?: Scalars['Boolean']['input'];
  includeGiftCardTransactions?: Scalars['Boolean']['input'];
  includeHost?: Scalars['Boolean']['input'];
  includeIncognitoTransactions?: Scalars['Boolean']['input'];
  includeRegularTransactions?: Scalars['Boolean']['input'];
  isRefund?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<Array<InputMaybe<TransactionKind>>>;
  limit?: Scalars['Int']['input'];
  maxAmount?: InputMaybe<Scalars['Int']['input']>;
  merchantId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  minAmount?: InputMaybe<Scalars['Int']['input']>;
  offset?: Scalars['Int']['input'];
  order?: InputMaybe<OrderReferenceInput>;
  orderBy?: ChronologicalOrderInput;
  paymentMethodService?: InputMaybe<Array<InputMaybe<PaymentMethodService>>>;
  paymentMethodType?: InputMaybe<Array<InputMaybe<PaymentMethodType>>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<TransactionType>;
  virtualCard?: InputMaybe<Array<InputMaybe<VirtualCardReferenceInput>>>;
};


/** This represents a Vendor account */
export type VendorUnhostedAtArgs = {
  host: AccountReferenceInput;
};


/** This represents a Vendor account */
export type VendorUpdatesArgs = {
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  onlyChangelogUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublishedUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: UpdateChronologicalOrderInput;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


/** This represents a Vendor account */
export type VendorVirtualCardMerchantsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/** This represents a Vendor account */
export type VendorVirtualCardsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  merchantAccount?: InputMaybe<AccountReferenceInput>;
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ChronologicalOrderInput>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<InputMaybe<VirtualCardStatus>>>;
};


/** This represents a Vendor account */
export type VendorWebhooksArgs = {
  account: AccountReferenceInput;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

/** A collection of Vendors */
export type VendorCollection = Collection & {
  __typename?: 'VendorCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Vendor>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Some context about the vendor contact person */
export type VendorContact = {
  __typename?: 'VendorContact';
  email?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

/** Some context about the vendor contact person */
export type VendorContactInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type VendorCreateInput = {
  /** The profile background image, for the banner and social media sharing */
  backgroundImage?: InputMaybe<Scalars['Upload']['input']>;
  /** The profile avatar image */
  image?: InputMaybe<Scalars['Upload']['input']>;
  /** @deprecated 2024-11-26: Please use image + backgroundImage fields */
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationInput>;
  name: Scalars['NonEmptyString']['input'];
  payoutMethod?: InputMaybe<PayoutMethodInput>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['NonEmptyString']['input']>>>;
  vendorInfo?: InputMaybe<VendorInfoInput>;
};

export type VendorEditInput = {
  /** The profile background image, for the banner and social media sharing */
  backgroundImage?: InputMaybe<Scalars['Upload']['input']>;
  /** The public id identifying the account (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The profile avatar image */
  image?: InputMaybe<Scalars['Upload']['input']>;
  /** @deprecated 2024-11-26: Please use image + backgroundImage fields */
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  /**
   * The internal id of the account (ie: 580)
   * @deprecated 2020-01-01: should only be used during the transition to GraphQL API v2.
   */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationInput>;
  name?: InputMaybe<Scalars['NonEmptyString']['input']>;
  payoutMethod?: InputMaybe<PayoutMethodInput>;
  /** The slug identifying the account (ie: babel for https://opencollective.com/babel) */
  slug?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['NonEmptyString']['input']>>>;
  vendorInfo?: InputMaybe<VendorInfoInput>;
};

/** Some context about the vendor */
export type VendorInfo = {
  __typename?: 'VendorInfo';
  contact?: Maybe<VendorContact>;
  notes?: Maybe<Scalars['String']['output']>;
  taxFormRequired?: Maybe<Scalars['Boolean']['output']>;
  taxFormUrl?: Maybe<Scalars['String']['output']>;
  taxId?: Maybe<Scalars['String']['output']>;
  taxType?: Maybe<Scalars['String']['output']>;
};

/** Some context about the vendor */
export type VendorInfoInput = {
  contact?: InputMaybe<VendorContactInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  taxFormRequired?: InputMaybe<Scalars['Boolean']['input']>;
  taxFormUrl?: InputMaybe<Scalars['String']['input']>;
  taxId?: InputMaybe<Scalars['String']['input']>;
  taxType?: InputMaybe<Scalars['String']['input']>;
};

/** A Virtual Card used to pay expenses */
export type VirtualCard = {
  __typename?: 'VirtualCard';
  account?: Maybe<Account>;
  assignee?: Maybe<Individual>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  currency?: Maybe<Currency>;
  data?: Maybe<Scalars['JSONObject']['output']>;
  host?: Maybe<Host>;
  id?: Maybe<Scalars['String']['output']>;
  last4?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  privateData?: Maybe<Scalars['JSONObject']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  remainingLimit?: Maybe<Scalars['Int']['output']>;
  spendingLimitAmount?: Maybe<Scalars['Int']['output']>;
  spendingLimitInterval?: Maybe<VirtualCardLimitInterval>;
  spendingLimitRenewsOn?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<VirtualCardStatus>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  virtualCardRequest?: Maybe<VirtualCardRequest>;
};

/** A collection of Virtual Cards */
export type VirtualCardCollection = Collection & {
  __typename?: 'VirtualCardCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<VirtualCard>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type VirtualCardInput = {
  data?: InputMaybe<Scalars['JSONObject']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  last4?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  privateData?: InputMaybe<Scalars['JSONObject']['input']>;
  provider?: InputMaybe<VirtualCardProvider>;
};

export enum VirtualCardLimitInterval {
  ALL_TIME = 'ALL_TIME',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  PER_AUTHORIZATION = 'PER_AUTHORIZATION',
  WEEKLY = 'WEEKLY',
  YEARLY = 'YEARLY'
}

export enum VirtualCardProvider {
  PRIVACY = 'PRIVACY',
  STRIPE = 'STRIPE'
}

export type VirtualCardReferenceInput = {
  id?: InputMaybe<Scalars['String']['input']>;
};

/** A Virtual Card request */
export type VirtualCardRequest = {
  __typename?: 'VirtualCardRequest';
  account?: Maybe<Account>;
  assignee?: Maybe<Individual>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  currency?: Maybe<Currency>;
  host?: Maybe<Host>;
  id: Scalars['String']['output'];
  legacyId?: Maybe<Scalars['Int']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  purpose?: Maybe<Scalars['String']['output']>;
  spendingLimitAmount?: Maybe<Amount>;
  spendingLimitInterval?: Maybe<VirtualCardLimitInterval>;
  status?: Maybe<VirtualCardRequestStatus>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** A collection of "VirtualCardRequest" */
export type VirtualCardRequestCollection = Collection & {
  __typename?: 'VirtualCardRequestCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<VirtualCardRequest>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type VirtualCardRequestReferenceInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** The status of a virtual card request */
export enum VirtualCardRequestStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

/** The status of a virtual card */
export enum VirtualCardStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  INACTIVE = 'INACTIVE'
}

/** An webhook attached to an account */
export type Webhook = {
  __typename?: 'Webhook';
  account: Account;
  activityType?: Maybe<ActivityType>;
  id: Scalars['String']['output'];
  legacyId: Scalars['Int']['output'];
  webhookUrl?: Maybe<Scalars['URL']['output']>;
};

/** A collection of webhooks */
export type WebhookCollection = Collection & {
  __typename?: 'WebhookCollection';
  limit?: Maybe<Scalars['Int']['output']>;
  nodes?: Maybe<Array<Maybe<Webhook>>>;
  offset?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Input type for Webhooks */
export type WebhookCreateInput = {
  /** The account to attach the Webhook */
  account: AccountReferenceInput;
  activityType?: ActivityType;
  webhookUrl: Scalars['URL']['input'];
};

export type WebhookReferenceInput = {
  /** The public id identifying the webhook (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The legacy public id identifying the webhook (ie: 4242) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
};

/** Input type to update a Webhook */
export type WebhookUpdateInput = {
  activityType?: ActivityType;
  /** The public id identifying the webhook (ie: dgm9bnk8-0437xqry-ejpvzeol-jdayw5re) */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The legacy public id identifying the webhook (ie: 4242) */
  legacyId?: InputMaybe<Scalars['Int']['input']>;
  webhookUrl: Scalars['URL']['input'];
};

export type WiseTransferDetails = {
  reference?: InputMaybe<Scalars['String']['input']>;
  sourceOfFunds?: InputMaybe<Scalars['String']['input']>;
  transferNature?: InputMaybe<Scalars['String']['input']>;
  transferPurpose?: InputMaybe<Scalars['String']['input']>;
};
