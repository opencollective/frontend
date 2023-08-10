import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import styled, { css } from 'styled-components';

import { ContributionTypes } from '../../lib/constants/contribution-types';
import { adjustLuminance } from '../../lib/theme';

import { ContributorAvatar } from '../Avatar';
import Container from '../Container';
import { Box, Flex } from '../Grid';
import Link from '../Link';
import StyledButton from '../StyledButton';
import StyledHr from '../StyledHr';
import StyledTag from '../StyledTag';
import { P } from '../Text';

import {
  CONTRIBUTE_CARD_BORDER_RADIUS,
  CONTRIBUTE_CARD_WIDTH,
  MAX_CONTRIBUTORS_PER_CONTRIBUTE_CARD,
} from './constants';

/** The main container */
const StyledContributeCard = styled.div`
  display: flex;
  flex-direction: column;
  width: ${CONTRIBUTE_CARD_WIDTH}px;
  flex: 0 0 ${CONTRIBUTE_CARD_WIDTH}px;
  height: 100%;
  border-radius: ${CONTRIBUTE_CARD_BORDER_RADIUS}px;
  border: 1px solid #dcdee0;
  background: white;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    opacity 0.2s; // Opacity for DragNDrop

  &:hover {
    /* Primitives / OC Blue */
    border: 1px solid ${props => props.theme.colors.primary[600]};

    /* Drop Shadow / Z 300 */
    box-shadow: 0px 8px 12px rgba(20, 20, 20, 0.16);
  }
`;

/** Tier card banner */
const CoverImage = styled.div`
  height: 104px;
  background-repeat: no-repeat;
  background-size: cover;
  padding: 16px;
  position: relative;
  border-radius: 16px 16px 0 0;

  ${props => {
    const image = props.image ? `url(${props.image}), ` : '';
    const applyGrayscale = (isDisabled, contributionType) => {
      if (isDisabled) {
        return 'filter: grayscale(0.75);';
      } else if (contributionType === ContributionTypes.EVENT_PASSED) {
        return 'filter: grayscale(0.50);';
      }
    };

    if (props.customPrimaryColor) {
      const primary = props.customPrimaryColor;
      const radial = `radial-gradient(circle, ${adjustLuminance(primary, 0.65)} 0%, ${adjustLuminance(
        primary,
        0.2,
      )} 100%), `;
      return css`
        background: ${image} ${radial} ${props.customPrimaryColor};
        ${applyGrayscale(props.isDisabled, props.contributionType)}
      `;
    } else {
      const primary = props.theme.colors.primary;
      const radial = `radial-gradient(circle, ${primary[300]} 0%, ${primary[800]} 100%), `;
      return css`
        background: ${image} ${radial} ${primary[500]};
        ${applyGrayscale(props.isDisabled, props.contributionType)}
      `;
    }
  }};
`;

/** Tier's description */
const Description = styled.div`
  overflow-wrap: break-word;
  margin: 8px 0;
  font-size: 14px;
  letter-spacing: -0.2px;
  line-height: 20px;
  height: 100%;
  flex: 1 1;

  /* Neutral Tints / 700 */
  color: #4e5052;
`;

/** Translations */
const I18nContributionType = defineMessages({
  [ContributionTypes.FINANCIAL_CUSTOM]: {
    id: 'ContributionType.Custom',
    defaultMessage: 'Custom contribution',
  },
  [ContributionTypes.FINANCIAL_ONE_TIME]: {
    id: 'ContributionType.OneTime',
    defaultMessage: 'One-time contribution',
  },
  [ContributionTypes.FINANCIAL_RECURRING]: {
    id: 'ContributionType.Recurring',
    defaultMessage: 'Recurring contribution',
  },
  [ContributionTypes.FINANCIAL_GOAL]: {
    id: 'ContributionType.Goal',
    defaultMessage: 'Goal',
  },
  [ContributionTypes.EVENT_PARTICIPATE]: {
    id: 'ContributionType.Event',
    defaultMessage: 'Event',
  },
  [ContributionTypes.EVENT_PASSED]: {
    id: 'ContributionType.EventPassed',
    defaultMessage: 'Past event',
  },
  [ContributionTypes.TIER_PASSED]: {
    id: 'ContributionType.TierPassed',
    defaultMessage: 'Past tier',
  },
  [ContributionTypes.PRODUCT]: {
    id: 'ContributionType.Product',
    defaultMessage: 'Product',
  },
  [ContributionTypes.TICKET]: {
    id: 'ContributionType.Ticket',
    defaultMessage: 'Ticket',
  },
  [ContributionTypes.MEMBERSHIP]: {
    id: 'ContributionType.Membership',
    defaultMessage: 'Membership',
  },
  [ContributionTypes.CHILD_COLLECTIVE]: {
    id: 'ContributionType.ChildCollective',
    defaultMessage: 'Connected Collective',
  },
  [ContributionTypes.PROJECT]: {
    id: 'ContributionType.Project',
    defaultMessage: 'Project',
  },
  [ContributionTypes.ARCHIVED_PROJECT]: {
    id: 'ContributionType.ArchivedProject',
    defaultMessage: 'Archived Project',
  },
});

const getContributeCTA = type => {
  switch (type) {
    case ContributionTypes.TICKET:
      return <FormattedMessage id="ContributeCard.BtnEvent" defaultMessage="RSVP" />;
    case ContributionTypes.EVENT_PARTICIPATE:
    case ContributionTypes.EVENT_PASSED:
      return <FormattedMessage id="ContributeCard.BtnViewEvent" defaultMessage="View Event" />;
    case ContributionTypes.CHILD_COLLECTIVE:
      return <FormattedMessage id="ContributeCard.SeeCollective" defaultMessage="View Collective" />;
    case ContributionTypes.PROJECT:
      return <FormattedMessage id="ContributeCard.SeeMore" defaultMessage="See More" />;
    default:
      return <FormattedMessage id="Contribute" defaultMessage="Contribute" />;
  }
};

const getFooterHeading = type => {
  switch (type) {
    case ContributionTypes.TICKET:
    case ContributionTypes.EVENT_PARTICIPATE:
      return <FormattedMessage id="ContributeCard.footer.ticket" defaultMessage="Attending" />;
    case ContributionTypes.EVENT_PASSED:
      return <FormattedMessage id="ContributeCard.footer.pastEvent" defaultMessage="Attended by" />;
    default:
      return <FormattedMessage id="ContributeCard.latestActivity" defaultMessage="Latest activity by" />;
  }
};

const getFooterMessage = type => {
  switch (type) {
    case ContributionTypes.TICKET:
    case ContributionTypes.EVENT_PARTICIPATE:
      return <FormattedMessage defaultMessage="Be the first one to attend!" />;
    case ContributionTypes.EVENT_PASSED:
      return <FormattedMessage defaultMessage="No attendees" />;
    default:
      return <FormattedMessage defaultMessage="Be the first one to contribute!" />;
  }
};

const getCTAButtonStyle = type => {
  if (type === ContributionTypes.TICKET) {
    return 'secondary';
  } else if (type === ContributionTypes.EVENT_PASSED) {
    return 'standard';
  } else {
    return 'primary';
  }
};

/**
 * A contribute card with a "Contribute" call to action
 */
const ContributeCard = ({
  intl,
  title,
  type,
  route,
  buttonText,
  children,
  contributors,
  stats,
  hideContributors,
  image,
  color,
  disableCTA,
  hideCTA,
  onClickEdit,
  tier,
  isPreview,
  ...props
}) => {
  const totalContributors = (stats && stats.all) || (contributors && contributors.length) || 0;

  if (isPreview) {
    route = '#';
  }

  return (
    <StyledContributeCard customPrimaryColor={color} {...props}>
      <CoverImage image={image} isDisabled={disableCTA} contributionType={type} customPrimaryColor={color}>
        <StyledTag
          position="absolute"
          bottom="8px"
          left="16px"
          background="white"
          color="black.700"
          fontWeight="700"
          letterSpacing="0.06em"
          textTransform="uppercase"
          fontSize="12px"
        >
          {intl.formatMessage(I18nContributionType[type])}
        </StyledTag>
      </CoverImage>
      <Flex px={3} py={3} flexDirection="column" justifyContent="space-between" flex="1">
        <Flex flexDirection="column" flex="1 1">
          <Container fontSize="20px" mt={1} mb={2} fontWeight="bold" data-cy="contribute-title" color="black.900">
            {title}
          </Container>
          <Description data-cy="contribute-description">{children}</Description>
        </Flex>
        <Box>
          {!disableCTA && !hideCTA && (
            <Link href={route}>
              <StyledButton
                buttonStyle={getCTAButtonStyle(type)}
                width={1}
                mb={2}
                mt={3}
                truncateOverflow
                data-cy="contribute-btn"
              >
                {buttonText || getContributeCTA(type)}
              </StyledButton>
            </Link>
          )}
          {!hideContributors && (
            <Box mt={3} height={60}>
              <React.Fragment>
                <Flex alignItems="center" mt={3} mb={2}>
                  <P
                    color="black.700"
                    fontSize="12px"
                    lineHeight="16px"
                    fontWeight="500"
                    letterSpacing="0.06em"
                    pr={2}
                    textTransform="uppercase"
                    whiteSpace="nowrap"
                  >
                    {getFooterHeading(type)}
                  </P>
                  <StyledHr flex="1" borderStyle="solid" borderColor="#DCDEE0" />
                </Flex>
              </React.Fragment>
              {totalContributors === 0 ? (
                <React.Fragment>
                  <Container pt="0.7em" color="black.600">
                    {getFooterMessage(type)}
                  </Container>
                </React.Fragment>
              ) : (
                <Flex>
                  {contributors &&
                    contributors.length > 0 &&
                    contributors.slice(0, MAX_CONTRIBUTORS_PER_CONTRIBUTE_CARD).map(contributor => (
                      <Box key={contributor.id} mx={1}>
                        {contributor.collectiveSlug ? (
                          <Link href={`/${contributor.collectiveSlug}`} title={contributor.name}>
                            <ContributorAvatar contributor={contributor} radius={32} />
                          </Link>
                        ) : (
                          <ContributorAvatar contributor={contributor} radius={32} title={contributor.name} />
                        )}
                      </Box>
                    ))}
                  {totalContributors > MAX_CONTRIBUTORS_PER_CONTRIBUTE_CARD && (
                    <Container ml={2} pt="0.7em" fontSize="11px" fontWeight="bold" color="black.600">
                      + {totalContributors - MAX_CONTRIBUTORS_PER_CONTRIBUTE_CARD}
                    </Container>
                  )}
                </Flex>
              )}
            </Box>
          )}
          {onClickEdit && (
            <Box>
              <StyledButton buttonStyle="secondary" width={1} mb={2} mt={3} data-cy="edit-btn" onClick={onClickEdit}>
                <FormattedMessage
                  defaultMessage="Edit {type, select, TICKET {Ticket} other {Tier}}"
                  values={{ type: tier.type }}
                />
              </StyledButton>
            </Box>
          )}
        </Box>
      </Flex>
    </StyledContributeCard>
  );
};

ContributeCard.propTypes = {
  /** Contribution title */
  title: PropTypes.node.isRequired,
  /** Type of the contribution */
  type: PropTypes.oneOf(Object.values(ContributionTypes)).isRequired,
  /** Route for the contribute button */
  route: PropTypes.string.isRequired,
  /** A custom button text to override the default one */
  buttonText: PropTypes.string,
  /** An image to display on the card hero */
  image: PropTypes.string,
  /** The color for card */
  color: PropTypes.string,
  /** The card body */
  children: PropTypes.node,
  /** If true, the call to action will not be displayed */
  disableCTA: PropTypes.bool,
  hideCTA: PropTypes.bool,
  /** Contributors */
  contributors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string,
      collectiveSlug: PropTypes.string,
    }),
  ),
  /** Contributors stats */
  stats: PropTypes.shape({
    all: PropTypes.number,
    users: PropTypes.number,
    organizations: PropTypes.number,
  }),
  /** If true, contributors will not be displayed */
  hideContributors: PropTypes.bool,
  /** @ignore from injectIntl */
  intl: PropTypes.object.isRequired,
  router: PropTypes.object,
  tier: PropTypes.object,
  collective: PropTypes.object,
  isPreview: PropTypes.bool,
  onClickEdit: PropTypes.func,
};

export default injectIntl(ContributeCard);
