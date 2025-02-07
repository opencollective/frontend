import React from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { FormattedMessage } from 'react-intl';

import { API_V2_CONTEXT, gql } from '../../../../lib/graphql/helpers';
import type {
  ManagePaymentMethodsQuery,
  ManagePaymentMethodsQueryVariables,
} from '../../../../lib/graphql/types/v2/graphql';
import type { Account } from '../../../../lib/graphql/types/v2/schema';

import StyledHr from '@/components/StyledHr';
import { Button } from '@/components/ui/Button';

import Loading from '../../../Loading';
import MessageBox from '../../../MessageBox';
import MessageBoxGraphqlError from '../../../MessageBoxGraphqlError';
import StyledButton from '../../../StyledButton';

import CreatePayoutMethodModal from './CreatePayoutMethodModal';
import { PaymentMethodFragment, PayoutMethodFragment } from './gql';
import PaymentMethodsTable from './PaymentMethodsTable';
import PayoutMethodsTable from './PayoutMethodsTable';

const managePaymentMethodsQuery = gql`
  query ManagePaymentMethods($accountSlug: String!) {
    account(slug: $accountSlug) {
      id
      legacyId
      type
      slug
      name
      currency
      isHost
      settings
      paymentMethods(type: [CREDITCARD, US_BANK_ACCOUNT, SEPA_DEBIT, BACS_DEBIT, GIFTCARD, PREPAID]) {
        id
        ...PaymentMethodFields
      }
      payoutMethods(includeArchived: true) {
        id
        ...PayoutMethodFields
      }
    }
  }

  ${PaymentMethodFragment}
  ${PayoutMethodFragment}
`;

type ManagePaymentMethodsProps = {
  account: Pick<Account, 'slug'>;
};

export default function PaymentInfoDashboard(props: ManagePaymentMethodsProps) {
  const router = useRouter();
  const query = useQuery<ManagePaymentMethodsQuery, ManagePaymentMethodsQueryVariables>(managePaymentMethodsQuery, {
    context: API_V2_CONTEXT,
    variables: {
      accountSlug: props.account.slug,
    },
  });
  const [isCreatePayoutMethodModalOpen, setIsCreatePayoutMethodModalOpen] = React.useState(false);

  const [orderedPaymentMethods, hasPaymentMethodsToConfirm] = React.useMemo(() => {
    if (!query?.data?.account?.paymentMethods) {
      return [[], false];
    }

    let someNeedsConfirmation = false;
    const ordered = query.data.account.paymentMethods.toSorted((a, b) => {
      const aNeedsConfirmation = a.recurringContributions.nodes.some(a => a.needsConfirmation);
      const bNeedsConfirmation = b.recurringContributions.nodes.some(b => b.needsConfirmation);

      if (aNeedsConfirmation || bNeedsConfirmation) {
        someNeedsConfirmation = true;
      }

      if (aNeedsConfirmation && !bNeedsConfirmation) {
        return -1;
      } else if (!aNeedsConfirmation && bNeedsConfirmation) {
        return 1;
      }

      return a.legacyId - b.legacyId;
    });

    return [ordered, someNeedsConfirmation];
  }, [query.data?.account?.paymentMethods]);

  const isOrderConfirmationRedirect = router.query.successType === 'payment';
  const dismissOrderConfirmationMessage = React.useCallback(() => {
    const newUrl = new URL(router.asPath, window.location.origin);
    newUrl.searchParams.delete('successType');
    router.replace(newUrl.toString(), undefined, { shallow: true });
  }, [router]);

  if (query.loading) {
    return <Loading />;
  }

  if (query.error) {
    return <MessageBoxGraphqlError error={query.error} />;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-1 flex items-center gap-2 text-lg font-semibold">
            <FormattedMessage defaultMessage="For Contributions" id="xf7EPu" />
            <StyledHr flex="1 1" borderColor="black.400" />
          </div>
          <p className="text-sm leading-none">
            <FormattedMessage
              defaultMessage="Associated payment methods used on contributions made on the platform."
              id="gCakR+"
            />
          </p>
        </div>

        {isOrderConfirmationRedirect && (
          <MessageBox type="success" display="flex" alignItems="center" withIcon>
            <div className="flex items-center justify-between">
              <FormattedMessage
                id="Order.Confirm.Success"
                defaultMessage="Your payment method has now been confirmed and the payment successfully went through."
              />
              <StyledButton ml={2} buttonSize="tiny" onClick={dismissOrderConfirmationMessage}>
                <FormattedMessage defaultMessage="Dismiss" id="TDaF6J" />
              </StyledButton>
            </div>
          </MessageBox>
        )}
        {hasPaymentMethodsToConfirm && (
          <MessageBox type="warning" withIcon>
            <FormattedMessage defaultMessage="You need to confirm at least one of your payment methods." id="bHYOPb" />
          </MessageBox>
        )}
        <PaymentMethodsTable account={props.account} paymentMethods={orderedPaymentMethods} loading={query.loading} />
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-1 flex items-center gap-2 text-lg font-semibold">
            <FormattedMessage defaultMessage="For Payouts" id="N4Mx25" />
            <StyledHr flex="1 1" borderColor="black.400" />
            <Button onClick={() => setIsCreatePayoutMethodModalOpen(true)} size="xs">
              Create
            </Button>
          </div>
          <p className="text-sm leading-none">
            <FormattedMessage defaultMessage="Associated account information used on expenses." id="LyzQUC" />
          </p>
        </div>

        <PayoutMethodsTable
          account={props.account}
          payoutMethods={query.data.account.payoutMethods}
          loading={query.loading}
          onUpdate={() => query.refetch()}
        />
      </div>
      {isCreatePayoutMethodModalOpen && (
        <CreatePayoutMethodModal
          account={props.account}
          open={isCreatePayoutMethodModalOpen}
          onOpenChange={setIsCreatePayoutMethodModalOpen}
          onUpdate={() => {
            query.refetch();
            setIsCreatePayoutMethodModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
