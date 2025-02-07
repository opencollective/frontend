import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import MessageBox from './MessageBox';
import ReplyToMemberInvitationCard from './ReplyToMemberInvitationCard';

/**
 * Displays a `ReplyToMemberInvitationCard` list, scrolling to the given selected
 * element on mount.
 */
const MemberInvitationsList = ({ invitations, selectedInvitationId }) => {
  React.useEffect(() => {
    if (selectedInvitationId) {
      const elem = document.getElementById(`invitation-${selectedInvitationId}`);
      if (elem) {
        const elemTop = elem.getBoundingClientRect().top + window.scrollY;
        window.scroll({ top: elemTop - 100, behavior: 'smooth' });
      }
    }
  }, []);

  if (invitations.length === 0) {
    return (
      <MessageBox type="info" withIcon>
        <FormattedMessage id="MemberInvitations.none" defaultMessage="No pending invitations" />
      </MessageBox>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {invitations.map(invitation => (
        <div key={invitation.id} className="mb-5">
          <ReplyToMemberInvitationCard
            invitation={invitation}
            isSelected={invitation.id === selectedInvitationId}
            redirectOnAccept={invitations.length === 1}
          />
        </div>
      ))}
    </div>
  );
};

MemberInvitationsList.propTypes = {
  invitations: PropTypes.array,
  selectedInvitationId: PropTypes.number,
};

export default MemberInvitationsList;
