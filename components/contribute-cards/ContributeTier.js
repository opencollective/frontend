import React from 'react';
import PropTypes from 'prop-types';
import { getApplicableTaxes } from '@opencollective/taxes';
import { truncate } from 'lodash';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

import { ContributionTypes } from '../../lib/constants/contribution-types';
import INTERVALS from '../../lib/constants/intervals';
import { TierTypes } from '../../lib/constants/tiers-types';
import { formatCurrency, getPrecisionFromAmount, graphqlAmountValueInCents } from '../../lib/currency-utils';
import { isPastEvent } from '../../lib/events';
import useLoggedInUser from '../../lib/hooks/useLoggedInUser';
import { isTierExpired } from '../../lib/tier-utils';
import { getCollectivePageRoute } from '../../lib/url-helpers';
import { capitalize } from '../../lib/utils';

import CollapsableText from '../CollapsableText';
import FormattedMoneyAmount from '../FormattedMoneyAmount';
import { Box, Flex } from '../Grid';
import Link from '../Link';
import StyledLink from '../StyledLink';
import StyledProgressBar from '../StyledProgressBar';
import StyledTooltip from '../StyledTooltip';
import { P, Span } from '../Text';

import Contribute from './Contribute';

const messages = defineMessages({
  fallbackDescription: {
    id: 'TierCard.DefaultDescription',
    defaultMessage:
      '{tierName, select, backer {Become a backer} sponsor {Become a sponsor} other {Join us}}{minAmount, select, 0 {} other { for {minAmountWithCurrency} {interval, select, month {per month} year {per year} other {}}}} and support us',
  },
});

const getContributionTypeFromTier = (tier, isPassed) => {
  if (isPassed) {
    return ContributionTypes.TIER_PASSED;
  } else if (graphqlAmountValueInCents(tier.goal) > 0) {
    return ContributionTypes.FINANCIAL_GOAL;
  } else if (tier.type === TierTypes.PRODUCT) {
    return ContributionTypes.PRODUCT;
  } else if (tier.type === TierTypes.TICKET) {
    return ContributionTypes.TICKET;
  } else if (tier.type === TierTypes.MEMBERSHIP) {
    return ContributionTypes.MEMBERSHIP;
  } else if (tier.interval) {
    if (tier.interval === INTERVALS.flexible) {
      return ContributionTypes.FINANCIAL_CUSTOM;
    } else {
      return ContributionTypes.FINANCIAL_RECURRING;
    }
  } else {
    return ContributionTypes.FINANCIAL_ONE_TIME;
  }
};

const TierTitle = ({ collective, tier }) => {
  const name = capitalize(tier.name);
  if (!tier.useStandalonePage) {
    return name;
  } else {
    return (
      <StyledTooltip
        content={() => <FormattedMessage id="ContributeTier.GoToPage" defaultMessage="Go to full details page" />}
      >
        <StyledLink
          as={Link}
          href={`${getCollectivePageRoute(collective)}/contribute/${tier.slug}-${tier.legacyId || tier.id}`}
          color="black.900"
          $hoverColor="black.900"
          $underlineOnHover
        >
          {name}
        </StyledLink>
      </StyledTooltip>
    );
  }
};

TierTitle.propTypes = {
  collective: PropTypes.shape({
    slug: PropTypes.string,
  }),
  tier: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    legacyId: PropTypes.number,
    slug: PropTypes.string,
    name: PropTypes.string,
    useStandalonePage: PropTypes.bool,
  }),
};

const canContribute = (collective, LoggedInUser) => {
  if (!collective.isActive) {
    return false;
  } else if (collective.type === 'EVENT') {
    return !isPastEvent(collective) || Boolean(LoggedInUser?.isAdminOfCollectiveOrHost(collective));
  } else {
    return true;
  }
};

const ContributeTier = ({ intl, collective, tier, isPreview, ...props }) => {
  const { LoggedInUser } = useLoggedInUser();
  const { stats } = tier;
  const currency = tier.currency || collective.currency;
  const isFlexibleAmount = tier.amountType === 'FLEXIBLE';
  const isFlexibleInterval = tier.interval === INTERVALS.flexible;
  const minAmount = isFlexibleAmount ? tier.minimumAmount : tier.amount;
  const amountRaised = stats?.[tier.interval && !isFlexibleInterval ? 'totalRecurringDonations' : 'totalDonated'] || 0;
  const tierIsExpired = isTierExpired(tier);
  const tierType = getContributionTypeFromTier(tier, tierIsExpired);
  const hasNoneLeft = stats?.availableQuantity === 0;
  const canContributeToCollective = canContribute(collective, LoggedInUser);
  const isDisabled = !canContributeToCollective || tierIsExpired || hasNoneLeft;
  const tierLegacyId = tier.legacyId || tier.id;
  const taxes = getApplicableTaxes(collective, collective.host, tier.type);

  let description = tier.description;
  if (!tier.description) {
    description = intl.formatMessage(messages.fallbackDescription, {
      minAmount: minAmount || 0,
      tierName: tier.name,
      minAmountWithCurrency: minAmount && formatCurrency(minAmount, currency, { locale: intl.locale }),
      interval: tier.interval ?? '',
    });
  }

  return (
    <Contribute
      route={`${getCollectivePageRoute(collective)}/contribute/${tier.slug}-${tierLegacyId}/checkout`}
      title={<TierTitle collective={collective} tier={tier} />}
      type={tierType}
      buttonText={tier.button}
      contributors={tier.contributors}
      stats={stats?.contributors}
      data-cy="contribute-card-tier"
      isPreview={isPreview}
      disableCTA={!isPreview && isDisabled}
      tier={tier}
      collective={collective}
      {...props}
    >
      <Flex flexDirection="column" justifyContent="space-between" height="100%">
        <Box>
          {tier.maxQuantity > 0 && (
            <P fontSize="0.7rem" color="#e69900" textTransform="uppercase" fontWeight="500" letterSpacing="1px" mb={2}>
              <FormattedMessage
                id="tier.limited"
                values={{
                  maxQuantity: tier.maxQuantity,
                  availableQuantity: (stats?.availableQuantity ?? tier.availableQuantity) || 0,
                }}
                defaultMessage="LIMITED: {availableQuantity} LEFT OUT OF {maxQuantity}"
              />
            </P>
          )}
          <P mb={2} lineHeight="22px">
            {tier.useStandalonePage ? (
              <React.Fragment>
                {truncate(description, { length: 150 })}{' '}
                <StyledLink
                  as={Link}
                  whiteSpace="nowrap"
                  href={
                    isPreview ? '#' : `${getCollectivePageRoute(collective)}/contribute/${tier.slug}-${tierLegacyId}`
                  }
                >
                  <FormattedMessage id="ContributeCard.ReadMore" defaultMessage="Read more" />
                </StyledLink>
              </React.Fragment>
            ) : (
              <CollapsableText text={description} maxLength={150} />
            )}
          </P>
          {tierType === ContributionTypes.FINANCIAL_GOAL && (
            <Box mb={1} mt={3}>
              <P fontSize="12px" color="black.600" fontWeight="400">
                <FormattedMessage
                  id="Tier.AmountRaised"
                  defaultMessage="{amount} of {goalWithInterval} raised"
                  values={{
                    amount: (
                      <FormattedMoneyAmount
                        amountClassName="font-bold text-foreground"
                        amount={graphqlAmountValueInCents(amountRaised)}
                        currency={currency}
                        precision={getPrecisionFromAmount(graphqlAmountValueInCents(amountRaised))}
                      />
                    ),
                    goalWithInterval: (
                      <FormattedMoneyAmount
                        amountClassName="font-bold text-foreground"
                        amount={graphqlAmountValueInCents(tier.goal)}
                        currency={currency}
                        interval={tier.interval !== INTERVALS.flexible ? tier.interval : null}
                        precision={getPrecisionFromAmount(graphqlAmountValueInCents(tier.goal))}
                      />
                    ),
                  }}
                />
                {` (${Math.round((amountRaised / graphqlAmountValueInCents(tier.goal)) * 100)}%)`}
              </P>
              <Box mt={1}>
                <StyledProgressBar percentage={amountRaised / graphqlAmountValueInCents(tier.goal)} />
              </Box>
            </Box>
          )}
        </Box>
        {!isDisabled && graphqlAmountValueInCents(minAmount) > 0 && (
          <div className="mt-3 text-neutral-700">
            {isFlexibleAmount && (
              <Span display="block" fontSize="10px" textTransform="uppercase">
                <FormattedMessage id="ContributeTier.StartsAt" defaultMessage="Starts at" />
              </Span>
            )}

            <div className="flex min-h-[36px] flex-col">
              <Span data-cy="amount">
                <FormattedMoneyAmount
                  amount={graphqlAmountValueInCents(minAmount)}
                  interval={tier.interval && tier.interval !== INTERVALS.flexible ? tier.interval : null}
                  currency={currency}
                  amountClassName="text-2xl font-bold text-foreground"
                  precision={getPrecisionFromAmount(graphqlAmountValueInCents(minAmount))}
                />
                {taxes.length > 0 && ' *'}
              </Span>
              {taxes.length > 0 && (
                <Span fontSize="10px" lineHeight="12px">
                  *{' '}
                  {taxes.length > 1 ? (
                    <FormattedMessage id="ContributeTier.Taxes" defaultMessage="Taxes may apply" />
                  ) : (
                    <FormattedMessage
                      defaultMessage="{taxName} may apply"
                      id="N9TNT7"
                      values={{ taxName: taxes[0].type }}
                    />
                  )}
                </Span>
              )}
            </div>
          </div>
        )}
      </Flex>
    </Contribute>
  );
};

ContributeTier.propTypes = {
  collective: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    host: PropTypes.object,
    parentCollective: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }),
  }),
  tier: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    legacyId: PropTypes.number,
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
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
  /** @ignore */
  intl: PropTypes.object.isRequired,
  isPreview: PropTypes.bool,
};

export default injectIntl(ContributeTier);
