import React from 'react';
import { useMutation } from '@apollo/client';
import type { ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import { compact } from 'lodash';
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
import { cn } from '@/lib/utils';

import { EmptyResults } from '@/components/dashboard/EmptyResults';
import Link from '@/components/Link';
import { useModal } from '@/components/ModalContext';
import { DataTable } from '@/components/table/DataTable';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { TableActionsButton, TableCell, TableRow } from '@/components/ui/Table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

import ConfirmationModal from '../../../NewConfirmationModal';
import StyledLink from '../../../StyledLink';
import { useToast } from '../../../ui/useToast';

type PaymentMethodItemProps = {
  paymentMethod: ManagePaymentMethodsQuery['account']['paymentMethods'][number];
  account: Pick<Account, 'slug'>;
};

const cols: Record<string, ColumnDef<any, any>> = {
  type: {
    accessorKey: 'type',
    meta: { className: 'w-[24px]' },
    cell: ({ row }) => {
      const paymentMethod = row.original;
      return getPaymentMethodIcon(paymentMethod, paymentMethod.account, 24);
    },
  },
  details: {
    accessorKey: 'id',
    cell: ({ row }) => {
      const paymentMethod = row.original;

      const hasRecurringContributions = paymentMethod.recurringContributions.totalCount > 0;
      return (
        <React.Fragment>
          <p className="text-xs font-semibold leading-5 text-black">
            {getPaymentMethodName(paymentMethod as any)}
            {getPaymentMethodMetadata(paymentMethod) && (
              <span className="ml-2 text-xs font-normal leading-4 text-gray-400">
                {getPaymentMethodMetadata(paymentMethod)}
              </span>
            )}
          </p>
          {hasRecurringContributions && (
            <p className="text-xs">
              <FormattedMessage
                id="paymentMethod.activeSubscriptions"
                defaultMessage="{n} active {n, plural, one {recurring financial contribution} other {recurring financial contributions}}"
                values={{ n: paymentMethod.recurringContributions.totalCount }}
              />
            </p>
          )}
        </React.Fragment>
      );
    },
  },
  actions: {
    accessorKey: 'actions',
    meta: { align: 'right' },
    cell: ({ row, table }) => {
      const paymentMethod = row.original;
      const { confirm, remove } = table.options.meta.actions as any;

      const requiresConfirmation = paymentMethod.recurringContributions.nodes.some(pm => pm.needsConfirmation);
      const hasRecurringContributions = paymentMethod.recurringContributions.totalCount > 0;
      const canBeRemoved = !hasRecurringContributions && paymentMethod.type !== PAYMENT_METHOD_TYPE.GIFTCARD;

      return (
        <div className="flex items-center justify-end gap-1">
          {requiresConfirmation && (
            <Button size="xs" variant="outlineApprove" onClick={confirm}>
              <FormattedMessage id="paymentMethod.confirm" defaultMessage="Confirm" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TableActionsButton>
                <MoreHorizontal className="relative h-3 w-3" aria-hidden="true" />
              </TableActionsButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link
                  href={`/dashboard/${paymentMethod.account.slug}/outgoing-contributions?paymentMethod=${paymentMethod.id}`}
                >
                  <FormattedMessage defaultMessage="See Contributions" id="2YK8RZ" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={remove} disabled={!canBeRemoved}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'flex items-center gap-1',
                        hasRecurringContributions ? 'text-muted-foreground' : 'text-destructive',
                      )}
                    >
                      <X className="shrink-0" size={16} />
                      <FormattedMessage id="Remove" defaultMessage="Remove" />
                    </div>
                  </TooltipTrigger>
                  {hasRecurringContributions && (
                    <TooltipContent>
                      <FormattedMessage
                        id="errors.PM.Remove.HasActiveSubscriptions"
                        defaultMessage="This payment method cannot be removed because it has active recurring financial contributions."
                      />
                    </TooltipContent>
                  )}
                </Tooltip>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
};

export default function PaymentMethodsTable({ paymentMethods, account, loading }) {
  const { toast } = useToast();
  const { showConfirmationModal } = useModal();
  const intl = useIntl();

  const [isConfirmingRemoval, setIsConfirmingRemoval] = React.useState(false);
  const [removePaymentMethod] = useMutation(
    gqlV1`
    mutation RemovePaymentMethod($paymentMethodId: Int!) {
      removePaymentMethod(id: $paymentMethodId) {
        id
      }
    }
  `,
    {
      refetchQueries: ['ManagePaymentMethods'],
    },
  );
  const [confirmOrder] = useMutation<ConfirmOrderMutation>(
    gql`
      mutation ConfirmOrder($order: OrderReferenceInput!) {
        confirmOrder(order: $order) {
          order {
            id
            status
            transactions {
              id
            }
            fromAccount {
              id
              slug
            }
          }
          stripeError {
            message
            account
            response
          }
        }
      }
    `,
    {
      context: API_V2_CONTEXT,
      refetchQueries: ['ManagePaymentMethods'],
    },
  );

  const confirmHandler = async ({ orderId }) => {
    try {
      const response = await confirmOrder({ variables: { order: { id: orderId } } });
      const stripeError = response.data?.confirmOrder?.stripeError;
      if (stripeError) {
        const stripeResponse = stripeError.response;
        const stripe = await getStripe(null, stripeError.account);
        const confirmationResult = await stripe.handleCardAction(stripeResponse.paymentIntent.client_secret);
        if (confirmationResult.paymentIntent && confirmationResult.paymentIntent.status === 'requires_confirmation') {
          await confirmOrder({ variables: { order: { id: orderId } } });
        } else if (confirmationResult.error) {
          throw new Error(confirmationResult.error.message);
        }
      }

      toast({
        variant: 'success',
        message: (
          <FormattedMessage
            id="Order.Confirm.Success"
            defaultMessage="Your payment method has now been confirmed and the payment successfully went through."
          />
        ),
      });
    } catch (e) {
      toast({ variant: 'error', message: i18nGraphqlException(intl, e) });
    }
  };

  const removeHandler = async ({ paymentMethodId }) => {
    showConfirmationModal({
      title: (
        <FormattedMessage
          id="paymentMethods.removeConfirm"
          defaultMessage="Do you really want to remove this payment method?"
        />
      ),
      type: 'remove',
      variant: 'destructive',
      async onConfirm() {
        try {
          await removePaymentMethod({ variables: { paymentMethodId } });
        } catch (e) {
          toast({ variant: 'error', message: i18nGraphqlException(intl, e) });
        }
        setIsConfirmingRemoval(false);
      },
    });
  };

  return !loading && !paymentMethods?.length ? (
    <EmptyResults entityType="PAYMENT_METHODS" hasFilters={false} />
  ) : (
    <DataTable
      data-cy="transactions-table"
      innerClassName="text-muted-foreground"
      columns={compact([cols.type, cols.details, cols.actions])}
      data={paymentMethods}
      loading={loading}
      meta={{
        intl,
        account,
        actions: {
          confirm: confirmHandler,
          remove: removeHandler,
        },
      }}
      getRowDataCy={row => `paymentMethod-${row.original.id}`}
      // getActions={getActions}
      compact
      hideHeader
      mobileTableView
    />
  );
}

export function PaymentMethodItem(props: PaymentMethodItemProps) {
  const { toast } = useToast();
  const intl = useIntl();
  const hasRecurringContributions = props.paymentMethod.recurringContributions.totalCount > 0;
  const removable = props.paymentMethod.type !== PAYMENT_METHOD_TYPE.GIFTCARD;
  const needsConfirmation = React.useMemo(
    () => props.paymentMethod.recurringContributions.nodes.some(pm => pm.needsConfirmation),
    [props.paymentMethod.recurringContributions.nodes],
  );
  const orderToConfirm = React.useMemo(() => {
    return props.paymentMethod?.recurringContributions?.nodes?.find(o => o.needsConfirmation);
  }, [props.paymentMethod?.recurringContributions?.nodes]);

  const [isConfirmingRemoval, setIsConfirmingRemoval] = React.useState(false);
  const [isConfirmingOrder, setIsConfirmingOrder] = React.useState(false);
  const [removePaymentMethod, { loading: loadingRemovalMutation }] = useMutation(
    gqlV1`
    mutation RemovePaymentMethod($paymentMethodId: Int!) {
      removePaymentMethod(id: $paymentMethodId) {
        id
      }
    }
  `,
    {
      variables: {
        paymentMethodId: props.paymentMethod.legacyId,
      },
      refetchQueries: ['ManagePaymentMethods'],
    },
  );
  const [confirmOrder] = useMutation<ConfirmOrderMutation>(
    gql`
      mutation ConfirmOrder($order: OrderReferenceInput!) {
        confirmOrder(order: $order) {
          order {
            id
            status
            transactions {
              id
            }
            fromAccount {
              id
              slug
            }
          }
          stripeError {
            message
            account
            response
          }
        }
      }
    `,
    {
      context: API_V2_CONTEXT,
      variables: {
        order: {
          id: orderToConfirm?.id,
        },
      },
      refetchQueries: ['ManagePaymentMethods'],
    },
  );

  const onConfirmOrder = React.useCallback(async () => {
    setIsConfirmingOrder(true);
    try {
      const response = await confirmOrder();
      const stripeError = response.data?.confirmOrder?.stripeError;
      if (stripeError) {
        const stripeResponse = stripeError.response;
        const stripe = await getStripe(null, stripeError.account);
        const confirmationResult = await stripe.handleCardAction(stripeResponse.paymentIntent.client_secret);
        if (confirmationResult.paymentIntent && confirmationResult.paymentIntent.status === 'requires_confirmation') {
          await confirmOrder();
        } else if (confirmationResult.error) {
          throw new Error(confirmationResult.error.message);
        }
      }

      toast({
        variant: 'success',
        message: (
          <FormattedMessage
            id="Order.Confirm.Success"
            defaultMessage="Your payment method has now been confirmed and the payment successfully went through."
          />
        ),
      });
    } catch (e) {
      toast({ variant: 'error', message: i18nGraphqlException(intl, e) });
    } finally {
      setIsConfirmingOrder(false);
    }
  }, [confirmOrder, toast, intl]);

  return (
    <TableRow>
      <TableCell>
        <label
          className={clsx('flex items-center', {
            grayscale: isPaymentMethodDisabled(props.paymentMethod),
          })}
        >
          <div className="mr-3 w-7 text-center">
            {getPaymentMethodIcon(props.paymentMethod, props.paymentMethod.account, 24)}
          </div>
          <div>
            <p className="text-xs font-semibold leading-5 text-black">
              {getPaymentMethodName(props.paymentMethod as any)}
              {getPaymentMethodMetadata(props.paymentMethod) && (
                <span className="ml-2 text-xs font-normal leading-4 text-gray-400">
                  {getPaymentMethodMetadata(props.paymentMethod)}
                </span>
              )}
            </p>

            {hasRecurringContributions && (
              <StyledLink
                className="text-xs font-normal leading-4 text-gray-400"
                href={`/dashboard/${props.account.slug}/outgoing-contributions?status=ACTIVE&status=ERROR&type=RECURRING&paymentMethod=${props.paymentMethod.id}`}
              >
                <FormattedMessage
                  id="paymentMethod.activeSubscriptions"
                  defaultMessage="{n} active {n, plural, one {recurring financial contribution} other {recurring financial contributions}}"
                  values={{ n: props.paymentMethod.recurringContributions.totalCount }}
                />
              </StyledLink>
            )}
          </div>
        </label>
      </TableCell>
      <TableCell className="flex items-center justify-end gap-1">
        {needsConfirmation && (
          <Button size="xs" variant="outlineApprove" onClick={onConfirmOrder} loading={isConfirmingOrder}>
            <FormattedMessage id="paymentMethod.confirm" defaultMessage="Confirm" />
          </Button>
        )}
        {isConfirmingRemoval && (
          <ConfirmationModal
            title={
              <FormattedMessage
                id="paymentMethods.removeConfirm"
                defaultMessage="Do you really want to remove this payment method?"
              />
            }
            type="remove"
            variant="destructive"
            onConfirm={async () => {
              try {
                await removePaymentMethod();
              } catch (e) {
                toast({ variant: 'error', message: i18nGraphqlException(intl, e) });
              }
              setIsConfirmingRemoval(false);
            }}
            open={isConfirmingRemoval}
            setOpen={setIsConfirmingRemoval}
          ></ConfirmationModal>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TableActionsButton>
              <MoreHorizontal className="relative h-3 w-3" aria-hidden="true" />
            </TableActionsButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link
                href={`/dashboard/${props.account.slug}/outgoing-contributions?paymentMethod=${props.paymentMethod.id}`}
              >
                <FormattedMessage defaultMessage="See Contributions" id="2YK8RZ" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setIsConfirmingRemoval(true)}
              disabled={loadingRemovalMutation || hasRecurringContributions}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'flex items-center gap-1',
                      hasRecurringContributions ? 'text-muted-foreground' : 'text-destructive',
                    )}
                  >
                    <X className="shrink-0" size={16} />
                    <FormattedMessage id="Remove" defaultMessage="Remove" />
                  </div>
                </TooltipTrigger>
                {hasRecurringContributions && (
                  <TooltipContent>
                    <FormattedMessage
                      id="errors.PM.Remove.HasActiveSubscriptions"
                      defaultMessage="This payment method cannot be removed because it has active recurring financial contributions."
                    />
                  </TooltipContent>
                )}
              </Tooltip>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
