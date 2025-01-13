import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { getCollectivePageRoute } from '../lib/url-helpers';
import { cn } from '../lib/utils';

import { AccountHoverCard } from './AccountHoverCard';
import Link from './Link';

/**
 * Create a `Link` to the collective based on collective type.
 * It properly deals with type `EVENT` and `isIncognito`
 */
const LinkCollective = ({
  collective,
  target = undefined,
  title = undefined,
  noTitle = false,
  children = undefined,
  withHoverCard = false,
  className = undefined,
  hoverCardProps = undefined,
  ...props
}) => {
  if (!collective || collective.isIncognito || (collective.type === 'USER' && (!collective.name || !collective.slug))) {
    return children || <FormattedMessage id="profile.incognito" defaultMessage="Incognito" />;
  } else if (collective.isGuest) {
    if (children) {
      return children;
    } else if (collective.name === 'Guest') {
      return <FormattedMessage id="profile.guest" defaultMessage="Guest" />;
    } else {
      return collective.name;
    }
  } else if (!collective.slug || collective.type === 'VENDOR') {
    return children || collective.name;
  }

  const { slug, name } = collective;
  const link = (
    <Link
      href={getCollectivePageRoute(collective)}
      title={noTitle || withHoverCard ? null : title || name}
      target={target}
      className={cn('hover:underline', className)}
      {...props}
    >
      {children || name || slug}
    </Link>
  );

  if (withHoverCard) {
    return <AccountHoverCard {...hoverCardProps} account={collective} trigger={<span>{link}</span>} />;
  }

  return link;
};

LinkCollective.propTypes = {
  /** The collective to link to */
  collective: PropTypes.shape({
    name: PropTypes.string,
    slug: PropTypes.string,
    type: PropTypes.string,
    isIncognito: PropTypes.bool,
    isGuest: PropTypes.bool,
    parentCollective: PropTypes.shape({
      slug: PropTypes.string,
    }),
  }),
  /** If not given, will render the name of the collective */
  children: PropTypes.node,
  title: PropTypes.string,
  target: PropTypes.string,
  /** Set this to true to remove the `title` attribute from the link */
  noTitle: PropTypes.bool,
  className: PropTypes.string,
  /** If true, will display a hover card on mouse over */
  withHoverCard: PropTypes.bool,
  hoverCardProps: PropTypes.object,
};

export default LinkCollective;
