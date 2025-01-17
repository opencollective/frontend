import React from 'react';

import type { Account } from '../lib/graphql/types/v2/schema';

import Avatar from './Avatar';
import LinkCollective from './LinkCollective';

const StackedAvatars = ({
  accounts = [],
  imageSize,
  maxDisplayedAvatars = 3,
  withHoverCard,
  gapPercentage = 0.33,
}: {
  accounts: Partial<Account>[];
  imageSize: number;
  maxDisplayedAvatars?: number;
  withHoverCard?: boolean | { includeAdminMembership: boolean };
  /** The negative gap between overlaying image, calculated as a percentage of the imageSize */
  gapPercentage?: number;
}) => {
  const width = `${imageSize}px`;
  const marginLeft = `-${imageSize * gapPercentage}px`;
  const displayed = accounts.length > maxDisplayedAvatars ? accounts.slice(0, maxDisplayedAvatars - 1) : accounts;
  const left = accounts.length - displayed.length;
  return (
    <div className="flex items-center">
      {displayed.map(account => (
        <div key={account.id || account.slug} className="flex items-center first:!ml-0" style={{ marginLeft }}>
          <LinkCollective
            collective={account}
            withHoverCard={Boolean(withHoverCard)}
            hoverCardProps={{
              includeAdminMembership:
                typeof withHoverCard === 'object' && withHoverCard.includeAdminMembership ? account.slug : false,
            }}
          >
            <Avatar
              collective={account}
              radius={imageSize}
              displayTitle={true}
              className="border border-solid border-white bg-white"
            />
          </LinkCollective>
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

export default StackedAvatars;
