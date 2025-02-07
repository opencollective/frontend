import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { injectIntl, useIntl } from 'react-intl';
import styled from 'styled-components';

import { getCollectiveMainTag } from '../lib/collective';
import { getCountryDisplayName, getFlagEmoji } from '../lib/i18n/countries';

import Avatar from './Avatar';
import Container from './Container';
import I18nCollectiveTags from './I18nCollectiveTags';
import LinkCollective from './LinkCollective';
import StyledCard from './StyledCard';
import StyledLink from './StyledLink';
import StyledTag from './StyledTag';
import { P, Span } from './Text';

const MaskSVG = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="216"
    height="94"
    fill="none"
    version="1.1"
    viewBox="0 0 216 94"
    {...props}
  >
    <defs>
      <mask width="218" height="106" x="-1" y="-1" maskUnits="userSpaceOnUse">
        <path fill="#fff" d="M0 8a8 8 0 018-8h200a8 8 0 018 8v95.719H0V8z"></path>
        <path
          stroke="#141414"
          strokeOpacity="0.08"
          d="M216 104.219h.5V8A8.5 8.5 0 00208-.5H8A8.5 8.5 0 00-.5 8v96.219H216z"
        ></path>
      </mask>
    </defs>
    <g>
      <path
        fill="#fff"
        fillOpacity="1"
        strokeWidth="1.019"
        d="M-29.076-51.033V94.016h350.922v-145.05zm7.889 10.678h320.992v122.23l-30.217.016C148.917 81.89 42.4 33.48-21.188-40.355z"
        clipPath="none"
        opacity="1"
      ></path>
      <g fillRule="evenodd" stroke="#000" clipRule="evenodd" opacity="0.256" transform="translate(-.473 -2.219)">
        <path d="M154.819 85.253a1.097 1.097 0 10.242-2.18 1.097 1.097 0 10-.242 2.18z" opacity="0.4"></path>
        <path d="M136.433 82.941a.825.825 0 10.184-1.64.825.825 0 00-.184 1.64z" opacity="0.4"></path>
        <path
          d="M203.299 87.726a1.474 1.474 0 001.628-1.3 1.473 1.473 0 00-1.303-1.625 1.471 1.471 0 10-.325 2.925z"
          opacity="0.8"
        ></path>
        <path
          d="M114.367 70.557a1.883 1.883 0 002.08-1.66 1.881 1.881 0 00-1.665-2.076 1.88 1.88 0 10-.415 3.737z"
          opacity="0.56"
        ></path>
        <path d="M186.109 83.318a2.378 2.378 0 10.525-4.726 2.381 2.381 0 00-2.63 2.101 2.379 2.379 0 002.105 2.625z"></path>
        <path
          d="M143.791 80.918a2.919 2.919 0 003.224-2.574 2.916 2.916 0 00-2.58-3.217 2.919 2.919 0 00-3.224 2.575 2.916 2.916 0 002.58 3.216z"
          opacity="0.8"
        ></path>
        <path d="M212.607 84.193a3.386 3.386 0 003.74-2.987 3.382 3.382 0 00-2.993-3.732 3.385 3.385 0 00-3.74 2.987 3.382 3.382 0 002.993 3.732z"></path>
        <path d="M163.805 82.538c3.205.354 6.092-1.951 6.447-5.15a5.83 5.83 0 00-5.16-6.433c-3.205-.355-6.091 1.95-6.446 5.149a5.829 5.829 0 005.159 6.434z"></path>
        <path d="M128.729 71.28c3.205.355 6.092-1.95 6.447-5.149a5.83 5.83 0 00-5.16-6.434 5.837 5.837 0 00-6.447 5.15 5.83 5.83 0 005.16 6.433z"></path>
        <path
          d="M66.675 52.908a1.1 1.1 0 001.456-.543 1.1 1.1 0 00-2-.909 1.096 1.096 0 00.544 1.452z"
          opacity="0.4"
        ></path>
        <path d="M53.207 44.413a.824.824 0 10.685-1.5.824.824 0 10-.685 1.5z" opacity="0.4"></path>
        <path
          d="M91.587 58.032c.946.43 2.063.013 2.494-.931a1.878 1.878 0 00-.933-2.49 1.885 1.885 0 00-2.495.932 1.878 1.878 0 00.934 2.49z"
          opacity="0.8"
        ></path>
        <path
          d="M49.346 37.675c.947.43 2.064.013 2.495-.932a1.878 1.878 0 00-.933-2.49 1.885 1.885 0 00-2.495.932 1.878 1.878 0 00.933 2.49z"
          opacity="0.56"
        ></path>
        <path
          d="M78.377 55.988a3.142 3.142 0 004.158-1.553 3.13 3.13 0 00-1.556-4.149 3.142 3.142 0 00-4.158 1.553 3.13 3.13 0 001.556 4.15z"
          opacity="0.8"
        ></path>
        <path
          d="M60.83 44.779a2.922 2.922 0 003.867-1.444 2.911 2.911 0 00-1.447-3.86 2.922 2.922 0 00-3.867 1.445 2.911 2.911 0 001.447 3.859z"
          opacity="0.8"
        ></path>
        <path d="M101.667 57.106a4.87 4.87 0 006.445-2.407 4.853 4.853 0 00-2.412-6.432 4.87 4.87 0 00-6.445 2.407 4.852 4.852 0 002.412 6.432z"></path>
        <path d="M72.624 47.481a5.844 5.844 0 007.734-2.888 5.822 5.822 0 00-2.895-7.718 5.844 5.844 0 00-7.733 2.888 5.822 5.822 0 002.894 7.718z"></path>
        <path d="M49.527 30.937a5.844 5.844 0 007.734-2.889 5.822 5.822 0 00-2.894-7.718 5.844 5.844 0 00-7.734 2.889 5.822 5.822 0 002.894 7.718z"></path>
      </g>
      <path
        fill="#000"
        stroke="#d7dbe0"
        d="M299.255-21.884v-.6c-21.806-.021-46.554-.047-72.687-.075-83.118-.088-180.234-.191-241.156-.192C7.777 6.713 53.995 31.648 99.682 50.092c46.031 18.583 91.412 30.534 111.052 33.881 13.3 2.267 32.194 2.943 49.455 2.397 8.627-.273 16.833-.85 23.715-1.684 6.667-.808 12.04-1.85 15.351-3.068V-18.991z"
        opacity="0.063"
      ></path>
      <path
        fill="#000"
        stroke="#c0c5cc"
        d="M15.177 4.672c-12.039-9.276-19.48-21.62-16.53-37.18 12.985-.001 57.111-.049 108.753-.104l33.53-.037c65.42-.07 134.576-.14 164.911-.14v58.76c0 .942.247 2.058.644 3.295.4 1.243.963 2.642 1.62 4.158.513 1.185 1.08 2.438 1.675 3.75.937 2.067 1.942 4.283 2.904 6.614 3.141 7.611 5.693 16.147 3.643 23.681-2.028 7.45-8.62 14.098-24.231 17.838-15.628 3.744-40.181 4.537-77.885.323-37.237-4.162-66.277-17.735-90.837-31.272-5.346-2.946-10.491-5.898-15.464-8.75-6.43-3.688-12.57-7.211-18.484-10.344-10.503-5.563-20.374-9.944-30.062-11.925-15.249-3.119-32.031-9.301-44.187-18.667z"
        opacity="0.06"
      ></path>
    </g>
  </svg>
);

const StyledBackgroundMask = styled(MaskSVG)`
  /** Dimensions are a bit more than 100% to resolve a strange background overlap issue */
  width: 101%;
  height: 102%;
  top: 0;
  left: -1px;
  position: absolute;
`;

const getBackground = collective => {
  const parent = collective.parentCollective || collective.parent;
  const backgroundImage = collective.backgroundImageUrl || parent?.backgroundImageUrl;
  const primaryColor = get(collective.settings, 'collectivePage.primaryColor', '#1776E1');
  return backgroundImage ? `url(${backgroundImage}) 0 0 / cover no-repeat, ${primaryColor}` : primaryColor;
};

const CollectiveContainer = ({ useLink, collective, children }) => {
  if (useLink) {
    return <LinkCollective collective={collective}>{children}</LinkCollective>;
  } else {
    return children;
  }
};

CollectiveContainer.propTypes = {
  useLink: PropTypes.bool,
  collective: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

/**
 * A card to show a collective that supports including a custom body.
 */
const StyledCollectiveCard = ({
  collective,
  tag,
  bodyHeight = 260,
  children,
  borderRadius = 16,
  showWebsite,
  useLink = true,
  ...props
}) => {
  const intl = useIntl();
  return (
    <StyledCard
      data-cy={`${collective.slug}-collective-card`}
      {...props}
      position="relative"
      borderRadius={borderRadius}
    >
      <Container
        position="absolute"
        width="95%"
        right="0"
        pt="41.25%"
        style={{ background: getBackground(collective), filter: collective.isFrozen ? 'grayscale(1)' : undefined }}
      >
        <StyledBackgroundMask />
      </Container>
      <Container position="relative" {...props.bodyProps}>
        <Container height={74} px={3} pt={26} style={{ filter: collective.isFrozen ? 'grayscale(1)' : undefined }}>
          <Container borderRadius={borderRadius} background="white" width={48} border="3px solid white">
            <CollectiveContainer useLink={useLink} collective={collective}>
              <Avatar data-cy="collective-avatar" collective={collective} radius={48} />
            </CollectiveContainer>
          </Container>
        </Container>
        <Container
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          height={bodyHeight}
          {...props.childrenContainerProps}
        >
          <Container p={3}>
            <CollectiveContainer useLink={useLink} collective={collective}>
              <P mt={3} fontSize="16px" fontWeight="bold" color="black.800" title={collective.name} truncateOverflow>
                {collective.name}
              </P>
            </CollectiveContainer>
            {showWebsite && collective.website && (
              <P fontSize="11px" fontWeight="400" title={collective.website} truncateOverflow mt={1}>
                <StyledLink color="black.600" href={collective.website} openInNewTabNoFollow>
                  {collective.website}
                </StyledLink>
              </P>
            )}

            <div className="my-2 flex items-center">
              {collective.location?.country && (
                <div className="mr-1">
                  {getFlagEmoji(collective.location?.country)}
                  <Span ml={1}></Span>
                  {getCountryDisplayName(intl, collective.location?.country)}
                </div>
              )}
              {collective.isFrozen ? (
                <StyledTag display="inline-block" variant="rounded-right">
                  <I18nCollectiveTags
                    tags={intl.formatMessage({ defaultMessage: 'This Collective is frozen', id: 'gDbURz' })}
                  />
                </StyledTag>
              ) : tag === undefined ? (
                <StyledTag display="inline-block" variant="rounded-right">
                  <I18nCollectiveTags
                    tags={getCollectiveMainTag(get(collective, 'host.id'), collective.tags, collective.type)}
                  />
                </StyledTag>
              ) : (
                tag
              )}
            </div>
          </Container>
          {children}
        </Container>
      </Container>
    </StyledCard>
  );
};

StyledCollectiveCard.propTypes = {
  /** Displayed below the top header of the card */
  children: PropTypes.node,
  /** To replace the default tag. Set to `null` to hide tag */
  tag: PropTypes.node,
  /** A fixed height for the content */
  bodyHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** The collective to display */
  collective: PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    backgroundImageUrl: PropTypes.string,
    website: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    settings: PropTypes.object,
    host: PropTypes.shape({
      // TODO: getCollectiveMainTag should be based on slug
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
    parentCollective: PropTypes.shape({
      backgroundImageUrl: PropTypes.string,
    }),
    parent: PropTypes.shape({
      backgroundImageUrl: PropTypes.string,
    }),
    location: PropTypes.shape({
      country: PropTypes.string,
    }),
    isFrozen: PropTypes.bool,
  }).isRequired,
  borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showWebsite: PropTypes.bool,
  useLink: PropTypes.bool,
  childrenContainerProps: PropTypes.object,
  bodyProps: PropTypes.object,
};

export default injectIntl(StyledCollectiveCard);
