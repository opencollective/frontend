import React from 'react';
import { useMutation } from '@apollo/client';
import type { ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import { Formik } from 'formik';
import { compact, noop, orderBy, sortBy } from 'lodash';
import { MoreHorizontal, X } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { PAYMENT_METHOD_TYPE } from '../../../../lib/constants/payment-methods';
import { i18nGraphqlException } from '../../../../lib/errors';
import { API_V2_CONTEXT, gql, gqlV1 } from '../../../../lib/graphql/helpers';
import type { ConfirmOrderMutation, ManagePaymentMethodsQuery } from '../../../../lib/graphql/types/v2/graphql';
import type { Account } from '../../../../lib/graphql/types/v2/schema';
import { getPaymentMethodName } from '../../../../lib/payment_method_label';
import {
  getPaymentMethodIcon,
  getPaymentMethodMetadata,
  isPaymentMethodDisabled,
} from '../../../../lib/payment-method-utils';
import { getStripe } from '../../../../lib/stripe';
import i18nPayoutMethodType from '@/lib/i18n/payout-method-type';
import { cn } from '@/lib/utils';

import { EmptyResults } from '@/components/dashboard/EmptyResults';
import Link from '@/components/Link';
import { useModal } from '@/components/ModalContext';
import { PayoutMethodIcon } from '@/components/PayoutMethodIcon';
import {
  generatePayoutMethodName,
  PayoutMethodRadioGroupItem,
  PayoutMethodRadioGroupItemWrapper,
} from '@/components/submit-expense/form/PayoutMethodSection';
import { DataTable } from '@/components/table/DataTable';
import { Button } from '@/components/ui/Button';
import { Collapsible, CollapsibleContent } from '@/components/ui/Collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { TableActionsButton, TableCell, TableRow } from '@/components/ui/Table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

import ConfirmationModal from '../../../NewConfirmationModal';
import StyledLink from '../../../StyledLink';
import { useToast } from '../../../ui/useToast';

import { PayoutMethodFragment } from './gql';

const cols: Record<string, ColumnDef<any, any>> = {
  type: {
    accessorKey: 'type',
    meta: { className: 'w-[24px]' },
    cell: ({ row }) => {
      const payoutMethod = row.original;
      return (
        <p className="data-[disabled=true]:opacity-40" data-disabled={!payoutMethod.isSaved}>
          {' '}
          <PayoutMethodIcon payoutMethod={payoutMethod} />
        </p>
      );
    },
  },
  details: {
    accessorKey: 'id',
    cell: ({ row, table }) => {
      const payoutMethod = row.original;

      return (
        <p
          className="text-xs leading-5 font-semibold text-black data-[disabled=true]:text-black/40"
          data-disabled={!payoutMethod.isSaved}
        >
          {generatePayoutMethodName(payoutMethod.type, payoutMethod.data)}
        </p>
      );
    },
  },
  actions: {
    accessorKey: 'actions',
    meta: { align: 'right' },
    cell: ({ row, table }) => {
      const payoutMethod = row.original;
      const { account, actions } = table.options.meta;
      const isArchived = !payoutMethod.isSaved;

      return (
        <div className="gap flex items-center justify-end gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TableActionsButton>
                <MoreHorizontal className="relative h-3 w-3" aria-hidden="true" />
              </TableActionsButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {isArchived ? (
                <DropdownMenuItem onClick={() => actions.restore(payoutMethod.id)}>
                  <FormattedMessage defaultMessage="Restore" id="zz6ObK" />
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => actions.archive(payoutMethod.id)}>
                  <FormattedMessage defaultMessage="Archive" id="hrgo+E" />
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
};

export default function PayoutMethodsTable({ payoutMethods, account, loading, onUpdate }) {
  const { toast } = useToast();
  const intl = useIntl();

  const [removePayoutMethod] = useMutation(
    gql`
      mutation RemovePayoutMethod($payoutMethodId: String!) {
        removePayoutMethod(payoutMethodId: $payoutMethodId) {
          id
          ...PayoutMethodFields
        }
      }
      ${PayoutMethodFragment}
    `,
    {
      context: API_V2_CONTEXT,
    },
  );
  const [restorePayoutMethod] = useMutation(
    gql`
      mutation RestorePayoutMethod($payoutMethodId: String!) {
        restorePayoutMethod(payoutMethodId: $payoutMethodId) {
          id
          ...PayoutMethodFields
        }
      }
      ${PayoutMethodFragment}
    `,
    {
      context: API_V2_CONTEXT,
    },
  );

  const actions = React.useMemo(
    () => ({
      archive: async (payoutMethodId: string) => {
        try {
          await removePayoutMethod({ variables: { payoutMethodId } });
          toast({
            variant: 'success',
            message: intl.formatMessage({ defaultMessage: 'Payment method Archived', id: 'v6++yS' }),
          });
        } catch (error) {
          toast({ variant: 'error', message: i18nGraphqlException(intl, error) });
        }
      },
      restore: async (payoutMethodId: string) => {
        try {
          await restorePayoutMethod({ variables: { payoutMethodId } });
          toast({
            variant: 'success',
            message: intl.formatMessage({ defaultMessage: 'Payment method Restored', id: '9/9dt8' }),
          });
        } catch (error) {
          toast({ variant: 'error', message: i18nGraphqlException(intl, error) });
        }
      },
    }),
    [account],
  );

  const orderedPayoutMethods = orderBy(payoutMethods, ['isSaved'], ['desc']);

  return !loading && !payoutMethods?.length ? (
    <EmptyResults entityType="PAYMENT_METHODS" hasFilters={false} />
  ) : (
    <Formik initialValues={{ newPayoutMethod: { data: {} } }} onSubmit={noop}>
      <React.Fragment>
        {orderedPayoutMethods?.map(p => (
          <PayoutMethodRadioGroupItemWrapper
            key={p.id}
            payoutMethod={p}
            payeeSlug={account.slug}
            isChecked
            isEditable
            setFieldValue={noop}
            setFieldTouched={noop}
            Component={PayoutMethodCard}
            onPaymentMethodDeleted={noop}
            onPaymentMethodEdited={noop}
            disabled={!p.isSaved}
          />
        ))}
      </React.Fragment>
    </Formik>
    // <DataTable
    //   data-cy="transactions-table"
    //   innerClassName="text-muted-foreground"
    //   columns={compact([cols.type, cols.details, cols.actions])}
    //   data={orderedPayoutMethods}
    //   loading={loading}
    //   meta={{
    //     intl,
    //     actions,
    //     account,
    //   }}
    //   getRowDataCy={row => `paymentMethod-${row.original.id}`}
    //   // getActions={getActions}
    //   compact
    //   hideHeader
    //   mobileTableView
    // />
  );
}

const PayoutMethodCard = ({ children, showSubcontent, subContent, ...props }) => {
  return (
    <div
      className='rounded-lg bg-card text-sm text-card-foreground ring-1 shadow-xs ring-border has-data-[state=checked]:ring-2 has-data-[state=checked]:ring-ring data-[disabled=true]:opacity-40 [&:has([role="radio"]:focus-visible)]:bg-primary/5'
      {...props}
    >
      <div className="flex w-full items-center gap-4 p-4">{children}</div>
      {subContent && (
        <Collapsible open={showSubcontent}>
          <CollapsibleContent className="p-4 pt-0">{subContent}</CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
