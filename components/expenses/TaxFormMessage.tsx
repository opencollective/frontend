import React from 'react';
import { FilePenLine } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import useLoggedInUser from '@/lib/hooks/useLoggedInUser';

import { TaxInformationFormDialog } from '../dashboard/sections/tax-information/TaxInformationFormDialog';
import { getI18nLink } from '../I18nFormatters';
import MessageBox from '../MessageBox';
import { Button } from '../ui/Button';

export default function TaxFormMessage({ expense, refetch }) {
  const { LoggedInUser } = useLoggedInUser();
  const [hasTaxInformationForm, setHasTaxInformationForm] = React.useState(false);

  return (
    <MessageBox type="warning" withIcon={true} mb={4}>
      <div>
        {LoggedInUser?.isAdminOfCollective(expense.payee) ? (
          <div>
            <p className="text-base font-medium">
              <FormattedMessage defaultMessage="We need your tax information before we can pay you." id="a6tGTW" />
            </p>
            <p className="my-2 text-sm">
              <FormattedMessage
                defaultMessage="United States regulations require US entities to collect certain information from payees for tax reporting purposes, even if the payee is outside the US."
                id="H/ROIG"
              />
            </p>
            <Button size="xs" className="mt-2" onClick={() => setHasTaxInformationForm(true)}>
              <FilePenLine className="mr-1 inline-block" size={14} />
              <span>
                <FormattedMessage defaultMessage="Fill Tax Information" id="TxJpk1" />
              </span>
            </Button>
            <TaxInformationFormDialog
              account={expense.payee}
              open={hasTaxInformationForm}
              onOpenChange={setHasTaxInformationForm}
              onSuccess={refetch}
            />
          </div>
        ) : (
          <div>
            <strong>
              <FormattedMessage
                defaultMessage="This expense requires the payee to provide their tax information before it can be paid."
                id="XNW4Sq"
              />
            </strong>
            <p className="my-2">
              <FormattedMessage
                defaultMessage="United States regulations require US entities to collect certain information from payees for tax reporting purposes, even if the payee is outside the US."
                id="H/ROIG"
              />{' '}
              <FormattedMessage
                defaultMessage="See <HelpDocsLink>help docs</HelpDocsLink> for more information."
                id="f2Ypkz"
                values={{
                  HelpDocsLink: getI18nLink({
                    href: 'https://docs.opencollective.com/help/expenses-and-getting-paid/tax-information',
                    openInNewTab: true,
                  }),
                }}
              />
            </p>
          </div>
        )}
      </div>
    </MessageBox>
  );
}
