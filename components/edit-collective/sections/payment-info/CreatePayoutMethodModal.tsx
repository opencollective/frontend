import React from 'react';
import { DialogTitle } from '@radix-ui/react-dialog';
import { Formik } from 'formik';
import { noop } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { PayoutMethodType } from '@/lib/constants/payout-method';

import { NewPayoutMethodOptionWrapper } from '@/components/submit-expense/form/PayoutMethodSection';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/Dialog';

export default function CreatePayoutMethodModal({ account, open, onOpenChange, onUpdate }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-2">
        <DialogHeader>
          <DialogTitle className="text-xl">
            <FormattedMessage defaultMessage="Add a new payout method" id="vuU49U" />
          </DialogTitle>
        </DialogHeader>
        <Formik initialValues={{ newPayoutMethod: { data: {} } }} onSubmit={noop}>
          <NewPayoutMethodOptionWrapper
            supportedPayoutMethods={[PayoutMethodType.BANK_ACCOUNT, PayoutMethodType.PAYPAL, PayoutMethodType.OTHER]}
            loggedInAccount={account}
            payeeSlug={account.slug}
            refresh={onUpdate}
          />
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
