import React from 'react';
import PropTypes from 'prop-types';
import { omitBy } from 'lodash';
import { defineMessage, useIntl } from 'react-intl';

import { isIndividualAccount } from '../../../../lib/collective';
import { ActivityTypes } from '../../../../lib/constants/activities';
import { ActivityTypeI18n } from '../../../../lib/i18n/activities';

import { StyledSelectFilter } from '../../../StyledSelectFilter';

const ActivityCategories = {
  HOST: {
    title: defineMessage({ id: 'Member.Role.HOST', defaultMessage: 'Host' }),
    activities: [
      'COLLECTIVE_APPLY',
      'COLLECTIVE_APPROVED',
      'COLLECTIVE_REJECTED',
      'COLLECTIVE_CREATED_GITHUB',
      'COLLECTIVE_UNHOSTED',
    ],
  },
  EXPENSES: {
    title: defineMessage({ id: 'Expenses', defaultMessage: 'Expenses' }),
    activities: [
      'COLLECTIVE_EXPENSE_CREATED',
      'COLLECTIVE_EXPENSE_DELETED',
      'COLLECTIVE_EXPENSE_UPDATED',
      'COLLECTIVE_EXPENSE_REJECTED',
      'COLLECTIVE_EXPENSE_APPROVED',
      'COLLECTIVE_EXPENSE_UNAPPROVED',
      'COLLECTIVE_EXPENSE_PAID',
      'COLLECTIVE_EXPENSE_MARKED_AS_UNPAID',
      'COLLECTIVE_EXPENSE_MARKED_AS_SPAM',
      'COLLECTIVE_EXPENSE_MARKED_AS_INCOMPLETE',
      'COLLECTIVE_EXPENSE_PROCESSING',
      'COLLECTIVE_EXPENSE_SCHEDULED_FOR_PAYMENT',
      'COLLECTIVE_EXPENSE_ERROR',
      'COLLECTIVE_EXPENSE_INVITE_DRAFTED',
      'COLLECTIVE_EXPENSE_RECURRING_DRAFTED',
      'COLLECTIVE_EXPENSE_MOVED',
      'EXPENSE_COMMENT_CREATED',
      'TAXFORM_REQUEST',
    ],
  },
  ACCOUNTS: {
    title: defineMessage({ defaultMessage: 'Accounts' }),
    activities: [
      'COLLECTIVE_CREATED',
      'COLLECTIVE_EDITED',
      'COLLECTIVE_FROZEN',
      'COLLECTIVE_UNFROZEN',
      'COLLECTIVE_CONTACT',
      'CONNECTED_ACCOUNT_CREATED',
    ],
  },
  CONTRIBUTIONS: {
    title: defineMessage({ id: 'Contributions', defaultMessage: 'Contributions' }),
    activities: [
      'SUBSCRIPTION_CANCELED',
      'SUBSCRIPTION_ACTIVATED',
      'SUBSCRIPTION_CONFIRMED',
      'CONTRIBUTION_REJECTED',
      'TICKET_CONFIRMED',
      'ORDER_CANCELED_ARCHIVED_COLLECTIVE',
      'ORDER_PROCESSING',
      'ORDER_PROCESSING_CRYPTO',
      'ORDER_PENDING_CONTRIBUTION_NEW',
      'ORDER_CONFIRMED',
      'ORDERS_SUSPICIOUS',
      'PAYMENT_FAILED',
    ],
  },
  UPDATES: {
    title: defineMessage({ defaultMessage: 'Updates & Conversations' }),
    activities: [
      'COLLECTIVE_UPDATE_CREATED',
      'COLLECTIVE_UPDATE_PUBLISHED',
      'UPDATE_COMMENT_CREATED',
      'CONVERSATION_COMMENT_CREATED',
      'COLLECTIVE_CONVERSATION_CREATED',
    ],
  },
  MEMBERS: {
    title: defineMessage({ defaultMessage: 'Members' }),
    activities: [
      'COLLECTIVE_MEMBER_INVITED',
      'COLLECTIVE_CORE_MEMBER_ADDED',
      'COLLECTIVE_CORE_MEMBER_INVITED',
      'COLLECTIVE_CORE_MEMBER_INVITATION_DECLINED',
      'COLLECTIVE_CORE_MEMBER_REMOVED',
      'COLLECTIVE_CORE_MEMBER_EDITED',
    ],
  },
  VIRTUAL_CARDS: {
    title: defineMessage({ id: 'VirtualCards.Title', defaultMessage: 'Virtual Cards' }),
    activities: [
      'COLLECTIVE_VIRTUAL_CARD_SUSPENDED',
      'COLLECTIVE_VIRTUAL_CARD_ADDED',
      'VIRTUAL_CARD_REQUESTED',
      'VIRTUAL_CARD_CHARGE_DECLINED',
    ],
  },
  GIFT_CARDS: {
    title: defineMessage({ id: 'editCollective.menu.giftCards', defaultMessage: 'Gift Cards' }),
    activities: ['USER_CARD_CLAIMED', 'USER_CARD_INVITED'],
  },
  USER: {
    title: defineMessage({ defaultMessage: 'User Account' }),
    activities: ['USER_CREATED', 'USER_NEW_TOKEN', 'USER_CHANGE_EMAIL'],
  },
};

export const isSupportedActivityTypeFilter = (account, value) => {
  const allowedValues = new Set(Object.keys(ActivityTypes));
  if (account) {
    if (account.slug !== 'opensource') {
      allowedValues.delete('COLLECTIVE_CREATED_GITHUB');
    }
    if (!isIndividualAccount(account)) {
      ActivityCategories.USER.activities.forEach(activity => allowedValues.delete(activity));
    }
  }

  return !value || allowedValues.has(value);
};

const getOption = (intl, activityType) => ({
  label: ActivityTypeI18n[activityType] ? intl.formatMessage(ActivityTypeI18n[activityType]) : activityType,
  value: activityType,
});

const getOptions = (intl, account) => {
  // Uncomment the code below to see unclassified activities
  // const allClassified = flatten(Object.values(ActivityCategories).map(c => c.activities));
  // const unclassified = difference(Object.keys(ActivityTypes), allClassified);
  // console.log(unclassified);

  const categories = !account
    ? ActivityCategories
    : omitBy(ActivityCategories, (_, category) => {
        if (category === 'HOST' && !account.isHost) {
          return true;
        } else if (category === 'USER' && !isIndividualAccount(account)) {
          return true;
        }
      });

  return [
    { label: intl.formatMessage({ id: 'WebhookEvents.All', defaultMessage: 'All' }) },
    ...Object.values(categories).map(({ title, activities }) => {
      return {
        label: intl.formatMessage(title),
        options: activities
          .filter(activity => isSupportedActivityTypeFilter(account, activity))
          .map(activity => getOption(intl, activity)),
      };
    }),
  ];
};

const ActivityTypeFilter = ({ account, onChange, value, ...props }) => {
  const intl = useIntl();
  const options = React.useMemo(() => getOptions(intl, account), [account]);
  return (
    <StyledSelectFilter
      inputId="activity-type-filter"
      onChange={({ value }) => onChange(value)}
      isLoading={!account}
      disabled={!account}
      options={options}
      value={value ? getOption(intl, value) : options[0]}
      isSearchable
      {...props}
    />
  );
};

ActivityTypeFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  account: PropTypes.shape({ type: PropTypes.string }),
};

export default ActivityTypeFilter;
