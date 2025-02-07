import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Avatar from '../../../Avatar';
import LinkCollective from '../../../LinkCollective';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/Dialog';

import { TaxInformationForm } from './TaxInformationForm';

export const TaxInformationFormDialog = ({ account, open, onOpenChange, onSuccess }) => {
  const intl = useIntl();
  const [isFormDirty, setIsFormDirty] = React.useState(false);

  // Reset the dirty state when opening the dialog
  React.useEffect(() => {
    if (open) {
      setIsFormDirty(false);
    }
  }, [open]);

  const handleOpenChange = isOpen => {
    if (isOpen) {
      onOpenChange(true);
    } else if (
      !isFormDirty ||
      confirm(
        intl.formatMessage({
          defaultMessage: 'You have unsaved changes. Are you sure you want to close this?',
          id: 'srNsR3',
        }),
      )
    ) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="fullscreen">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage defaultMessage="Update Tax Information" id="sVea7o" />
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-1">
              <FormattedMessage
                defaultMessage="for {account}"
                id="bKMsE/"
                values={{
                  account: (
                    <LinkCollective openInNewTab collective={account} className="flex items-center gap-1">
                      <Avatar collective={account} size={18} />
                      {account.legalName || account.name}
                    </LinkCollective>
                  ),
                }}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <TaxInformationForm
          accountId={account.id}
          setFormDirty={setIsFormDirty}
          onSuccess={() => {
            onOpenChange(false);
            onSuccess?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
