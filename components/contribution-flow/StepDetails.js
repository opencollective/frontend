import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, isNil } from 'lodash';
import { withRouter } from 'next/router';
import { FormattedMessage, useIntl } from 'react-intl';

import { AnalyticsEvent } from '../../lib/analytics/events';
import { track } from '../../lib/analytics/plausible';
import { AnalyticsProperty } from '../../lib/analytics/properties';
import { canContributeRecurring, hostIsTaxDeductibleInTheUs } from '../../lib/collective';
import INTERVALS from '../../lib/constants/intervals';
import { AmountTypes, TierTypes } from '../../lib/constants/tiers-types';
import { formatCurrency } from '../../lib/currency-utils';
import useLoggedInUser from '../../lib/hooks/useLoggedInUser';
import { i18nInterval } from '../../lib/i18n/interval';
import { getTierMinAmount, getTierPresets } from '../../lib/tier-utils';

import StyledButtonSet from '../../components/StyledButtonSet';
import StyledInputAmount from '../../components/StyledInputAmount';
import StyledInputField from '../../components/StyledInputField';

import { AutoCollapse } from '../AutoCollapse';
import Container from '../Container';
import FormattedMoneyAmount from '../FormattedMoneyAmount';
import { Box, Flex } from '../Grid';
import StyledAmountPicker, { OTHER_AMOUNT_KEY } from '../StyledAmountPicker';
import StyledHr from '../StyledHr';
import StyledInput from '../StyledInput';
import { H5, P, Span } from '../Text';

import ChangeTierWarningModal from './ChangeTierWarningModal';
import CustomFields, { buildCustomFieldsConfig } from './CustomFields';
import PlatformTipInput from './PlatformTipInput';
import { getTotalAmount } from './utils';

const StepDetails = ({ onChange, stepDetails, collective, tier, showPlatformTip, router, isEmbed }) => {
  const intl = useIntl();
  const amount = stepDetails?.amount;
  const currency = tier?.amount.currency || collective.currency;
  const presets = getTierPresets(tier, collective.type, currency);
  const getDefaultOtherAmountSelected = () => isNil(amount) || !presets?.includes(amount);
  const [isOtherAmountSelected, setOtherAmountSelected] = React.useState(getDefaultOtherAmountSelected);
  const [temporaryInterval, setTemporaryInterval] = React.useState(undefined);
  const { LoggedInUser } = useLoggedInUser();
  const tierCustomFields = tier?.customFields;
  const hostCustomFields = collective.host?.settings?.contributionFlow?.customFields;
  const customFieldsConfig = React.useMemo(
    () => buildCustomFieldsConfig(tierCustomFields, hostCustomFields),
    [tierCustomFields, hostCustomFields],
  );

  const minAmount = getTierMinAmount(tier, currency);
  const noIntervalBecauseFreeContribution = minAmount === 0 && amount === 0;
  const selectedInterval = noIntervalBecauseFreeContribution ? INTERVALS.oneTime : stepDetails?.interval;
  const hasQuantity = (tier?.type === TierTypes.TICKET && !tier.singleTicket) || tier?.type === TierTypes.PRODUCT;
  const isFixedContribution = tier?.amountType === AmountTypes.FIXED;
  const supportsRecurring = canContributeRecurring(collective, LoggedInUser) && (!tier || tier?.interval);
  const isFixedInterval = tier?.interval && tier.interval !== INTERVALS.flexible;

  const dispatchChange = (field, value) => {
    // Assumption: we only have restrictions related to payment method types on recurring contributions
    onChange({
      stepDetails: { ...stepDetails, [field]: value },
      ...(field === 'interval' && value !== INTERVALS.oneTime && { stepPayment: null }),
      stepSummary: null,
    });
  };

  // If an interval has been set (either from the tier defaults, or form an URL param) and the
  // collective doesn't support it, we reset the interval
  React.useEffect(() => {
    if (selectedInterval && ((!isFixedInterval && !supportsRecurring) || amount === 0)) {
      dispatchChange('interval', INTERVALS.oneTime);
    }
  }, [selectedInterval, isFixedInterval, supportsRecurring, amount]);

  React.useEffect(() => {
    track(AnalyticsEvent.CONTRIBUTION_STARTED, {
      props: {
        [AnalyticsProperty.CONTRIBUTION_STEP]: 'details',
      },
    });
  }, []);

  return (
    <Box width={1}>
      {tier?.type === 'TICKET' && tier.description && (
        <Container mb={4} whiteSpace="pre-line">
          <AutoCollapse maxCollapsedHeight={125}>{tier.description}</AutoCollapse>
        </Container>
      )}

      {isFixedInterval ? (
        <P fontSize="20px" fontWeight="500" color="black.800" mb={3}>
          {i18nInterval(intl, tier.interval)}
        </P>
      ) : supportsRecurring ? (
        <StyledButtonSet
          id="interval"
          justifyContent="center"
          mt={[4, 0]}
          mb="30px"
          items={[INTERVALS.oneTime, INTERVALS.month, INTERVALS.year]}
          selected={selectedInterval || null}
          buttonProps={{ px: 2, py: '5px' }}
          role="group"
          aria-label="Amount types"
          disabled={noIntervalBecauseFreeContribution}
          onChange={interval => {
            if (tier && tier.interval !== INTERVALS.flexible) {
              setTemporaryInterval(interval);
            } else {
              dispatchChange('interval', interval);
            }
          }}
        >
          {({ item, isSelected }) => (
            <Span fontSize={isSelected ? '20px' : '18px'} lineHeight="28px" fontWeight={isSelected ? 500 : 400}>
              {i18nInterval(intl, item)}
            </Span>
          )}
        </StyledButtonSet>
      ) : null}

      {!isFixedContribution ? (
        <Box mb="30px">
          {typeof amount === 'number' && !isNaN(amount) && amount < minAmount && (
            <div className="mb-2 text-red-400">
              <FormattedMessage
                id="amount.belowMinimum"
                defaultMessage="Please enter an amount of {minAmount} or more"
                values={{
                  minAmount: formatCurrency(minAmount, currency, { locale: intl.locale }),
                }}
              />
            </div>
          )}
          <StyledAmountPicker
            currency={currency}
            presets={presets}
            value={isOtherAmountSelected ? OTHER_AMOUNT_KEY : stepDetails?.amount}
            onChange={value => {
              if (value === OTHER_AMOUNT_KEY) {
                setOtherAmountSelected(true);
              } else {
                setOtherAmountSelected(false);
                dispatchChange('amount', value);
              }
            }}
          />
          {isOtherAmountSelected && (
            <Flex justifyContent="space-between" alignItems="center" mt={2} gap="8px" flexDirection={['column', 'row']}>
              <StyledInputAmount
                name="custom-amount"
                currency={currency}
                value={stepDetails?.amount}
                width={1}
                min={minAmount}
                currencyDisplay="full"
                prependProps={{ color: 'black.500' }}
                className="sm:max-w-[50%]"
                required
                step={0.5}
                onChange={value => {
                  dispatchChange('amount', value);
                }}
              />
              {Boolean(minAmount) && (
                <Flex fontSize="14px" color="black.800" flexDirection="column" alignItems="flex-end" mt={1}>
                  <FormattedMessage
                    id="contribution.minimumAmount"
                    defaultMessage="Minimum amount: {minAmount} {currency}"
                    values={{
                      minAmount: formatCurrency(minAmount, currency, { locale: intl.locale }),
                      currency,
                    }}
                  />
                </Flex>
              )}
            </Flex>
          )}
        </Box>
      ) : tier.amount.valueInCents ? (
        <Box mb={3}>
          <FormattedMessage
            id="contribute.tierDetails"
            defaultMessage="You’ll contribute {amount}{interval, select, month { monthly} year { yearly} other {}}."
            values={{
              interval: tier.interval ?? '',
              amount: <FormattedMoneyAmount amount={getTotalAmount(stepDetails)} currency={currency} />,
            }}
          />
        </Box>
      ) : !hasQuantity ? (
        <FormattedMessage id="contribute.freeTier" defaultMessage="This is a free tier." />
      ) : null}

      {hasQuantity && (
        <Box mb="30px">
          <StyledInputField
            htmlFor="quantity"
            label={<FormattedMessage id="contribution.quantity" defaultMessage="Quantity" />}
            labelFontSize="16px"
            labelColor="black.800"
            labelProps={{ fontWeight: 500, lineHeight: '28px', mb: 1 }}
            error={Boolean(tier.availableQuantity !== null && stepDetails?.quantity > tier.availableQuantity)}
            data-cy="contribution-quantity"
            required
          >
            {fieldProps => (
              <div>
                {tier.availableQuantity !== null && (
                  <P
                    fontSize="11px"
                    color="#e69900"
                    textTransform="uppercase"
                    fontWeight="500"
                    letterSpacing="1px"
                    mb={2}
                  >
                    <FormattedMessage
                      id="tier.limited"
                      defaultMessage="LIMITED: {availableQuantity} LEFT OUT OF {maxQuantity}"
                      values={tier}
                    />
                  </P>
                )}
                <StyledInput
                  {...fieldProps}
                  type="number"
                  min={1}
                  step={1}
                  max={tier.availableQuantity}
                  value={stepDetails?.quantity}
                  maxWidth={80}
                  fontSize="15px"
                  minWidth={100}
                  onChange={e => {
                    const newValue = parseInt(e.target.value);
                    dispatchChange('quantity', isNaN(newValue) ? null : newValue);
                  }}
                />
              </div>
            )}
          </StyledInputField>
        </Box>
      )}
      {hostIsTaxDeductibleInTheUs(collective.host) && (
        <React.Fragment>
          <StyledHr borderColor="black.300" mb={16} mt={32} />
          <P fontSize="14px" lineHeight="20px" fontStyle="italic" color="black.500" letterSpacing="0em">
            <FormattedMessage
              id="platformFee.taxDeductible"
              defaultMessage="This Collective's Fiscal Host is a registered 501(c)(3) non-profit organization. Your contribution will be tax-deductible in the US, to the extent allowed by the law."
            />
          </P>
          <StyledHr borderColor="black.300" mt={16} mb={32} />
        </React.Fragment>
      )}
      {showPlatformTip && (
        <Box mt={28}>
          <PlatformTipInput
            currency={currency}
            amount={stepDetails?.amount}
            value={stepDetails?.platformTip}
            quantity={stepDetails?.quantity}
            onChange={value => dispatchChange('platformTip', value)}
            isEmbed={isEmbed}
          />
        </Box>
      )}
      {!isEmpty(customFieldsConfig?.fields) && (
        <Box mt={28}>
          <H5 fontSize="20px" fontWeight="normal" color="black.800">
            <FormattedMessage id="OtherInfo" defaultMessage="Other information" />
          </H5>
          <CustomFields
            config={customFieldsConfig}
            data={stepDetails?.customData}
            onChange={customData => dispatchChange('customData', customData)}
          />
        </Box>
      )}
      {temporaryInterval !== undefined && (
        <ChangeTierWarningModal
          tierName={tier.name}
          onClose={() => setTemporaryInterval(undefined)}
          onConfirm={() => {
            dispatchChange('interval', temporaryInterval);
            setTemporaryInterval(undefined);
            router.push(`/${collective.slug}/donate/details`);
          }}
        />
      )}
    </Box>
  );
};

StepDetails.propTypes = {
  onChange: PropTypes.func,
  showPlatformTip: PropTypes.bool,
  isEmbed: PropTypes.bool,
  LoggedInUser: PropTypes.object,
  stepDetails: PropTypes.shape({
    amount: PropTypes.number,
    platformTip: PropTypes.number,
    quantity: PropTypes.number,
    interval: PropTypes.string,
    customData: PropTypes.object,
  }),
  collective: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    type: PropTypes.string,
    host: PropTypes.object,
  }).isRequired,
  tier: PropTypes.shape({
    amountType: PropTypes.string,
    interval: PropTypes.string,
    description: PropTypes.string,
    name: PropTypes.string,
    maxQuantity: PropTypes.number,
    availableQuantity: PropTypes.number,
    type: PropTypes.oneOf(Object.values(TierTypes)),
    customFields: PropTypes.array,
    amount: PropTypes.shape({
      currency: PropTypes.string,
      valueInCents: PropTypes.number,
    }),
    minAmount: PropTypes.shape({
      valueInCents: PropTypes.number,
    }),
    singleTicket: PropTypes.bool,
  }),
  router: PropTypes.object,
};

export default withRouter(StepDetails);
