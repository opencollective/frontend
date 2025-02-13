import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { formatCurrency } from '../../lib/currency-utils';

import { Flex } from '../Grid';
import { getI18nLink } from '../I18nFormatters';
import PrivateInfoIcon from '../icons/PrivateInfoIcon';
import Link from '../Link';
import MessageBox from '../MessageBox';
import StyledHr from '../StyledHr';
import StyledInput from '../StyledInput';
import StyledInputField from '../StyledInputField';
import StyledInputLocation from '../StyledInputLocation';
import { P, Span } from '../Text';

import ContributeProfilePicker from './ContributeProfilePicker';
import { getRequiredInformation } from './utils';

export const NEW_ORGANIZATION_KEY = 'newOrg';

const getProfileInfo = (stepProfile, profiles) => {
  if (stepProfile?.isIncognito) {
    const profileLocation = stepProfile.location || {};
    const isEmptyLocation = !profileLocation.address && !profileLocation.country && !profileLocation.structured;
    return {
      name: '', // Can't change name for incognito
      legalName: stepProfile.legalName ?? (profiles[0].legalName || profiles[0].name || ''), // Default to user's legal name
      location: (isEmptyLocation ? profiles[0].location : stepProfile.location) || {}, // Default to user's location
    };
  } else {
    return {
      name: stepProfile?.name || '',
      legalName: stepProfile?.legalName || '',
      location: stepProfile?.location || {},
    };
  }
};

const StepProfileLoggedInForm = ({ profiles, onChange, collective, tier, data, stepDetails }) => {
  const profileInfo = React.useMemo(() => getProfileInfo(data, profiles), [data, profiles]);
  const requiredInformation = React.useMemo(
    () => getRequiredInformation(data, stepDetails, collective, profiles, tier),
    [data, stepDetails, profiles, collective, tier],
  );
  const isContributingFromSameHost = data?.host?.id === collective.host.legacyId;

  return (
    <Fragment>
      <div className="flex flex-col gap-4">
        <MessageBox type="info">
          <h1 className="font-bold">
            <FormattedMessage defaultMessage="Privacy Information" id="AyQ5sz" />
          </h1>
          <p>
            <FormattedMessage
              defaultMessage="When you contribute to {collectiveName}, your email address will be visible to its administrators and by {hostName}, the legal entity collecting this contribution."
              id="ContributionFlow.StepProfileLoggedInForm.EmailInfo"
              values={{
                collectiveName: collective.name,
                hostName: collective.host.name,
              }}
            />
          </p>
          <p className="mt-2">
            <FormattedMessage
              defaultMessage="<PrivacyPolicyLink>Read our privacy policy</PrivacyPolicyLink>."
              id="ReadOurPrivacyPolicy"
              values={{
                PrivacyPolicyLink: getI18nLink({ href: '/privacypolicy', openInNewTab: true, as: Link }),
              }}
            />
          </p>
        </MessageBox>
        <ContributeProfilePicker
          profiles={profiles}
          tier={tier}
          selectedProfile={data}
          onChange={profile => onChange({ stepProfile: profile, stepPayment: null })}
        />
        {!isContributingFromSameHost && requiredInformation.legalName && (
          <React.Fragment>
            {!data?.isIncognito && (
              <StyledInputField
                htmlFor="name"
                label={<FormattedMessage defaultMessage="Your name" id="vlKhIl" />}
                labelFontSize="16px"
                labelFontWeight="700"
                hint={<FormattedMessage defaultMessage="This is your display name or alias." id="kFLEBd" />}
              >
                {inputProps => (
                  <StyledInput
                    {...inputProps}
                    value={profileInfo.name}
                    placeholder="Thomas Anderson"
                    onChange={e => onChange({ stepProfile: { ...data, name: e.target.value } })}
                    maxLength="255"
                  />
                )}
              </StyledInputField>
            )}
            <StyledInputField
              htmlFor="legalName"
              label={<FormattedMessage defaultMessage="Legal name" id="OozR1Y" />}
              required={!profileInfo.name || requiredInformation.legalName}
              hideOptionalLabel={requiredInformation.legalName}
              labelFontSize="16px"
              labelFontWeight="700"
              isPrivate
              hint={
                <FormattedMessage
                  defaultMessage="Required for legal purposes as your total anual contribution is more than {amount}. Your legal name is private and it can only be seen by {collectiveName} and {hostName}."
                  id="tLn/BI"
                  values={{
                    amount: formatCurrency(
                      collective.policies.CONTRIBUTOR_INFO_THRESHOLDS.legalName,
                      collective.currency,
                    ),
                    hostName: collective.host.name,
                    collectiveName: collective.name,
                  }}
                />
              }
            >
              {inputProps => (
                <StyledInput
                  {...inputProps}
                  value={profileInfo.legalName}
                  placeholder={profileInfo.name}
                  onChange={e => onChange({ stepProfile: { ...data, legalName: e.target.value } })}
                  maxLength="255"
                />
              )}
            </StyledInputField>
          </React.Fragment>
        )}
        {!isContributingFromSameHost && requiredInformation.address && (
          <React.Fragment>
            <Flex alignItems="center" mt={2}>
              <P fontSize="24px" lineHeight="32px" fontWeight="500" mr={2}>
                <FormattedMessage id="collective.address.label" defaultMessage="Address" />
              </P>
              <Span mr={2} lineHeight="0">
                <PrivateInfoIcon />
              </Span>
              <StyledHr my="16px" borderColor="black.300" width="100%" />
            </Flex>
            <MessageBox type="info">
              <h1 className="font-bold">
                <FormattedMessage defaultMessage="Address Requirement" id="Mc7YHZ" />
              </h1>
              <p>
                <FormattedMessage
                  defaultMessage="We require your physical address for legal purposes as your total anual contribution is more than {amount}. Your address is private and it can only be seen by {hostName}."
                  id="mp9ThO"
                  values={{
                    amount: formatCurrency(
                      collective.policies.CONTRIBUTOR_INFO_THRESHOLDS.address,
                      collective.currency,
                    ),
                    hostName: collective.host.name,
                  }}
                />
              </p>
              <p className="mt-2">
                <FormattedMessage
                  defaultMessage="<PrivacyPolicyLink>Read our privacy policy</PrivacyPolicyLink>."
                  id="ReadOurPrivacyPolicy"
                  values={{
                    PrivacyPolicyLink: getI18nLink({ href: '/privacypolicy', openInNewTab: true, as: Link }),
                  }}
                />
              </p>
            </MessageBox>
            <StyledInputLocation
              autoDetectCountry
              location={profileInfo.location}
              onChange={value => onChange({ stepProfile: { ...data, location: value } })}
              labelFontSize="16px"
              labelFontWeight="700"
            />
          </React.Fragment>
        )}
      </div>
    </Fragment>
  );
};

StepProfileLoggedInForm.propTypes = {
  data: PropTypes.object,
  stepDetails: PropTypes.object,
  tier: PropTypes.object,
  onChange: PropTypes.func,
  profiles: PropTypes.arrayOf(PropTypes.object),
  collective: PropTypes.shape({
    name: PropTypes.string,
    currency: PropTypes.string,
    host: PropTypes.shape({
      legacyId: PropTypes.number,
      name: PropTypes.string,
    }),
    policies: PropTypes.shape({
      CONTRIBUTOR_INFO_THRESHOLDS: PropTypes.shape({
        legalName: PropTypes.number,
        address: PropTypes.number,
      }),
    }),
  }),
};

export default StepProfileLoggedInForm;
