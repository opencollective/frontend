import React from 'react';
import { FormattedMessage } from 'react-intl';

import StyledButton from '../../StyledButton';
import { DuplicateAccountModal } from '../DuplicateAccountModal';
import SettingsSectionTitle from '../sections/SettingsSectionTitle';

export const DuplicateAccount = ({ collective }) => {
  const [hasDuplicateModal, setHasDuplicateModal] = React.useState(false);
  return (
    <div>
      <SettingsSectionTitle>
        <FormattedMessage
          defaultMessage="Duplicate this {type, select, EVENT {Event} PROJECT {Project} FUND {Fund} COLLECTIVE {Collective} other {account}}"
          id="eHo37I"
          values={{ type: collective.type }}
        />
      </SettingsSectionTitle>
      <p className="mb-2 text-sm">
        <FormattedMessage
          defaultMessage="Create a copy of {accountName} with the same settings."
          id="vRAq2F"
          values={{ accountName: collective.name }}
        />
      </p>
      <StyledButton onClick={() => setHasDuplicateModal(true)}>
        <FormattedMessage
          defaultMessage="Duplicate {accountName}"
          id="DOhsfW"
          values={{ accountName: collective.name }}
        />
      </StyledButton>
      {hasDuplicateModal && (
        <DuplicateAccountModal
          accountSlug={collective.slug}
          accountName={collective.name}
          onClose={() => setHasDuplicateModal(false)}
        />
      )}
    </div>
  );
};
