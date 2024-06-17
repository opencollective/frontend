import React from 'react';
import PropTypes from 'prop-types';
import { themeGet } from '@styled-system/theme-get';
import { Calendar, TestTube2, UserCog } from 'lucide-react';
import styled from 'styled-components';
import type { BorderProps } from 'styled-system';
import { border, color, layout, space } from 'styled-system';

import { CollectiveType, defaultImage } from '../lib/constants/collectives';
import type { Account } from '../lib/graphql/types/v2/graphql';
import { getAvatarBorderRadius, getCollectiveImage } from '../lib/image-utils';

import type { FlexProps } from './Grid';
import { Flex } from './Grid';

const getInitials = name => name.split(' ').reduce((result, value) => (result += value.slice(0, 1).toUpperCase()), '');

const COLLECTIVE_TYPE_ICON = {
  [CollectiveType.EVENT]: Calendar,
  [CollectiveType.PROJECT]: TestTube2,
  ROOT: UserCog,
};

type StyledAvatarProps = FlexProps &
  BorderProps & {
    src?: string;
    type?: string;
    size?: number;
    title?: string;
    backgroundSize?: string;
  };

const StyledAvatar = styled(Flex).attrs<StyledAvatarProps>(props => ({
  style: {
    backgroundImage: props.src ? `url(${props.src})` : null,
    backgroundSize: props.backgroundSize || 'cover',
    backgroundColor: props.backgroundColor,
  },
}))<StyledAvatarProps>`
  align-items: center;
  background-color: ${({ theme, type }) =>
    type === 'USER' || type === 'INDIVIDUAL' ? themeGet('colors.black.100')({ theme }) : 'none'};
  color: ${themeGet('colors.black.400')};
  background-position: center center;
  background-repeat: no-repeat;
  border-radius: ${({ type }) => getAvatarBorderRadius(type)};
  ${border}
  font-weight: 600;
  justify-content: center;
  overflow: hidden;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  ${color}
  ${space}
  ${layout}
`;

/**
 * Returns the max avatar height multiplied by 2 (for retina screens)
 */
const getImageHeightFromRadius = (radius: string | number | string[] | number[]): number | undefined => {
  const normalizeValue = (value: string | number) => (typeof value === 'string' ? parseInt(value, 10) : value);
  if (Array.isArray(radius)) {
    return !radius.length ? undefined : Math.max(...radius.map(normalizeValue)) * 2;
  } else {
    return normalizeValue(radius) * 2;
  }
};

const Avatar = ({
  collective = null,
  src = undefined,
  type = 'USER',
  radius = 42,
  name = undefined,
  useIcon = false,
  children = null,
  displayTitle = true,
  ...styleProps
}) => {
  let child = children;
  if (collective?.type === 'ROOT') {
    useIcon = true;
  }
  // Use collective object instead of props
  if (collective) {
    type = collective.type;
    name = collective.name;
    if (collective.isIncognito) {
      src = defaultImage.ANONYMOUS;
    } else if (collective.isGuest && shouldUseDefaultGuestAvatar(collective.name)) {
      src = defaultImage.GUEST;
    } else if (useIcon) {
      const Icon = COLLECTIVE_TYPE_ICON[type];
      if (Icon) {
        child = <Icon size={radius} />;
      }
    } else {
      src = getCollectiveImage(collective, { height: getImageHeightFromRadius(radius) });
    }

    if (!src && !child) {
      if ((type === 'USER' || type === 'INDIVIDUAL') && name) {
        child = <span>{getInitials(name)}</span>;
      }
    }
  }
  return (
    <StyledAvatar size={radius} type={type} src={src} title={displayTitle ? name : undefined} {...styleProps}>
      {child}
    </StyledAvatar>
  );
};

Avatar.propTypes = {
  /** Collective object */
  collective: PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string,
    slug: PropTypes.string,
    image: PropTypes.string,
    isIncognito: PropTypes.bool,
    isGuest: PropTypes.bool,
  }),
  /** Collective name */
  name: PropTypes.string,
  /** Collective image url */
  src: PropTypes.string,
  /** Collective type */
  type: PropTypes.oneOf(Object.keys(CollectiveType)),
  /**
   Avatar size.
   TODO: This prop name is confusing. It's not a radius, it's a diameter. We should call it "size"
   */
  radius: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  /** Duration to transition size. Disabled if 0, null or undefined */
  animationDuration: PropTypes.number,
  /* Size of the avatar image */
  backgroundSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /* Color of the background */
  backgroundColor: PropTypes.string,
  /* If true, will display a default icon instead of image */
  useIcon: PropTypes.bool,
  displayTitle: PropTypes.bool,
};

const shouldUseDefaultGuestAvatar = name => {
  return !name || name === 'Guest';
};

/**
 * Similar to `Avatar`, but builds from a Contributor instead of a collective
 */
export const ContributorAvatar = ({ contributor, radius, ...styleProps }) => {
  let image = null;
  if (contributor.isIncognito) {
    image = defaultImage.ANONYMOUS;
  } else if (contributor.isGuest && shouldUseDefaultGuestAvatar(contributor.name)) {
    image = defaultImage.GUEST;
  } else {
    image = getCollectiveImage({ slug: contributor.collectiveSlug, imageUrl: contributor.image });
  }

  return <StyledAvatar size={radius} type={contributor.type} src={image} title={contributor.name} {...styleProps} />;
};

ContributorAvatar.propTypes = {
  /** Collective object */
  contributor: PropTypes.shape({
    name: PropTypes.string,
    image: PropTypes.string,
    collectiveSlug: PropTypes.string,
    isIncognito: PropTypes.bool,
    isGuest: PropTypes.bool,
    type: PropTypes.oneOf(Object.keys(CollectiveType)),
  }).isRequired,
  radius: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
};

/** A simple avatar for incognito users */
export const IncognitoAvatar = avatarProps => {
  return <StyledAvatar {...avatarProps} type={CollectiveType.USER} src={defaultImage.ANONYMOUS} />;
};

/** A simple avatar for guest users */
export const GuestAvatar = avatarProps => {
  return <StyledAvatar {...avatarProps} type={CollectiveType.USER} src={defaultImage.GUEST} />;
};

export const StackedAvatars = ({
  accounts = [],
  imageSize,
  maxDisplayedAvatars = 3,
}: {
  accounts: Partial<Account>[];
  imageSize: number;
  maxDisplayedAvatars?: number;
}) => {
  const width = `${imageSize}px`;
  const marginLeft = `-${imageSize / 3}px`;
  const displayed = accounts.length > maxDisplayedAvatars ? accounts.slice(0, maxDisplayedAvatars - 1) : accounts;
  const left = accounts.length - displayed.length;
  return (
    <div className="flex items-center">
      {displayed.map(account => (
        <div key={account.id || account.slug} className="flex items-center first:!ml-0" style={{ marginLeft }}>
          <Avatar
            collective={account}
            radius={imageSize}
            displayTitle={true}
            className="border border-solid border-white"
          />
        </div>
      ))}
      {left ? (
        <div
          className="flex items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-400 first:ml-0"
          style={{ width, height: width, marginLeft }}
        >
          +{left}
        </div>
      ) : null}
    </div>
  );
};

/** @component */
export default Avatar;
