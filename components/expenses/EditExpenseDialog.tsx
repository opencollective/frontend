import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { DialogClose } from '@radix-ui/react-dialog';
import { Form, FormikProvider, useFormikContext } from 'formik';
import { pick } from 'lodash';
import { Pen } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { i18nGraphqlException } from '../../lib/errors';
import { API_V2_CONTEXT } from '../../lib/graphql/helpers';
import type { Currency, CurrencyExchangeRateInput } from '../../lib/graphql/types/v2/graphql';
import type { Expense } from '../../lib/graphql/types/v2/schema';
import { cn } from '../../lib/utils';

import { FormField } from '../FormField';
import { FormikZod } from '../FormikZod';
import { AdditionalAttachments, ExpenseItemsForm } from '../submit-expense/form/ExpenseItemsSection';
import { PayoutMethodFormContent } from '../submit-expense/form/PayoutMethodSection';
import { WhoIsGettingPaidForm } from '../submit-expense/form/WhoIsGettingPaidSection';
import { InviteeAccountType, useExpenseForm, YesNoOption } from '../submit-expense/useExpenseForm';
import { Button } from '../ui/Button';
import { Collapsible, CollapsibleContent } from '../ui/Collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { Label } from '../ui/Label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
import { toast } from '../ui/useToast';

import { expensePageExpenseFieldsFragment } from './graphql/fragments';

const RenderFormFields = ({ field, onSubmit, expense }) => {
  switch (field) {
    case 'title':
      return <EditExpenseTitle onSubmit={onSubmit} expense={expense} />;
    case 'expenseItems':
      return <EditExpenseItems onSubmit={onSubmit} expense={expense} />;
    case 'payoutMethod':
      return <EditPayoutMethod onSubmit={onSubmit} expense={expense} />;
    case 'payee':
      return <EditPayee onSubmit={onSubmit} expense={expense} />;
    case 'attachments':
      return <EditAttachments onSubmit={onSubmit} expense={expense} />;
  }
};
const EditPayee = ({ expense, onSubmit }) => {
  const formRef = React.useRef<HTMLFormElement>();
  const startOptions = React.useRef({
    expenseId: expense.legacyId,
    isInlineEdit: true,
    pickSchemaFields: { expenseItems: true, hasTax: true, tax: true, payoutMethodId: true, payeeSlug: true },
  });
  const transformedOnSubmit = React.useCallback(
    async (values, h, formOptions) => {
      const editValues = {
        payee: {
          slug: formOptions.payee?.slug,
        },
        ...(formOptions.payee?.slug !== expense.payee.slug && {
          payeeLocation: values.payeeLocation,
          currency: formOptions.expenseCurrency,
          items: values.expenseItems.map(ei => ({
            description: ei.description,
            amountV2: {
              valueInCents: ei.amount.valueInCents,
              currency: ei.amount.currency as Currency,
              exchangeRate: ei.amount.exchangeRate
                ? ({
                    ...pick(ei.amount.exchangeRate, ['source', 'rate', 'value', 'fromCurrency', 'toCurrency']),
                    date: ei.amount.exchangeRate.date || ei.incurredAt,
                  } as CurrencyExchangeRateInput)
                : null,
            },
            incurredAt: new Date(ei.incurredAt),
            url: typeof ei.attachment === 'string' ? ei.attachment : ei.attachment?.url,
          })),
          payoutMethod:
            !values.payoutMethodId || values.payoutMethodId === '__newPayoutMethod'
              ? { ...values.newPayoutMethod, isSaved: false }
              : {
                  id: values.payoutMethodId,
                },
        }),
      };
      return onSubmit(editValues);
    },
    [expense.payee.slug, onSubmit],
  );

  const expenseForm = useExpenseForm({
    formRef,
    initialValues: {
      inviteeAccountType: InviteeAccountType.INDIVIDUAL,
      expenseItems: [
        {
          amount: {
            valueInCents: 0,
            currency: 'USD',
          },
          description: '',
        },
      ],
      hasInvoiceOption: YesNoOption.YES,
      inviteeNewIndividual: {},
      inviteeNewOrganization: {
        organization: {},
      },
      newPayoutMethod: {
        data: {},
      },
    },
    startOptions: startOptions.current,
    onSubmit: transformedOnSubmit,
  });

  const hasChangedPayee =
    expenseForm.values.payeeSlug &&
    expenseForm.values.payeeSlug !== expense.payee.slug &&
    !expenseForm.values.payeeSlug.startsWith('__');
  return (
    <FormikProvider value={expenseForm}>
      <form className="space-y-6" ref={formRef} onSubmit={e => e.preventDefault()}>
        <WhoIsGettingPaidForm form={expenseForm} />
        <Collapsible open={hasChangedPayee}>
          <CollapsibleContent>
            <div className="space-y-3">
              <Label>
                <FormattedMessage defaultMessage="Pick new payout method" id="expense.pickPayoutMethod" />
              </Label>
              <PayoutMethodFormContent form={expenseForm} />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <EditExpenseActionButtons disabled={!hasChangedPayee} handleSubmit={expenseForm.handleSubmit} />
      </form>
    </FormikProvider>
  );
};
const EditPayoutMethod = ({ expense, onSubmit }) => {
  const formRef = React.useRef<HTMLFormElement>();
  const startOptions = React.useRef({
    expenseId: expense.legacyId,
    isInlineEdit: true,
    pickSchemaFields: {
      expenseItems: true,
      hasTax: true,
      tax: true,
      payoutMethodId: true,
      payee: true,
      payeeLocation: true,
    },
  });
  const transformedOnSubmit = React.useCallback(
    async (values, h, formOptions) => {
      const editValues = {
        payoutMethod:
          !values.payoutMethodId || values.payoutMethodId === '__newPayoutMethod'
            ? { ...values.newPayoutMethod, isSaved: false }
            : {
                id: values.payoutMethodId,
              },
        payee: {
          slug: formOptions.payee?.slug,
        },
        payeeLocation: values.payeeLocation,
        currency: formOptions.expenseCurrency,
        items: values.expenseItems.map(ei => ({
          description: ei.description,
          amountV2: {
            valueInCents: ei.amount.valueInCents,
            currency: ei.amount.currency as Currency,
            exchangeRate: ei.amount.exchangeRate
              ? ({
                  ...pick(ei.amount.exchangeRate, ['source', 'rate', 'value', 'fromCurrency', 'toCurrency']),
                  date: ei.amount.exchangeRate.date || ei.incurredAt,
                } as CurrencyExchangeRateInput)
              : null,
          },
          incurredAt: new Date(ei.incurredAt),
          url: typeof ei.attachment === 'string' ? ei.attachment : ei.attachment?.url,
        })),
      };
      return onSubmit(editValues);
    },
    [onSubmit],
  );

  const expenseForm = useExpenseForm({
    formRef,
    initialValues: {
      inviteeAccountType: InviteeAccountType.INDIVIDUAL,
      expenseItems: [
        {
          amount: {
            valueInCents: 0,
            currency: 'USD',
          },
          description: '',
        },
      ],
      inviteeNewIndividual: {},
      inviteeNewOrganization: {
        organization: {},
      },
      newPayoutMethod: {
        data: {},
      },
    },
    startOptions: startOptions.current,
    onSubmit: transformedOnSubmit,
  });

  return (
    <FormikProvider value={expenseForm}>
      <form className="space-y-4" ref={formRef} onSubmit={e => e.preventDefault()}>
        <PayoutMethodFormContent form={expenseForm} />
        <EditExpenseActionButtons handleSubmit={expenseForm.handleSubmit} />
      </form>
    </FormikProvider>
  );
};
const EditAttachments = ({ expense, onSubmit }) => {
  const formRef = React.useRef<HTMLFormElement>();
  const startOptions = React.useRef({
    expenseId: expense.legacyId,
    isInlineEdit: true,
    pickSchemaFields: { expenseAttachedFiles: true },
  });
  const transformedOnSubmit = values => {
    const editValues = {
      attachedFiles: values.additionalAttachments.map(a => ({
        url: typeof a === 'string' ? a : a?.url,
      })),
    };
    return onSubmit(editValues);
  };

  const expenseForm = useExpenseForm({
    formRef,
    initialValues: {
      inviteeAccountType: InviteeAccountType.INDIVIDUAL,
      expenseItems: [
        {
          amount: {
            valueInCents: 0,
            currency: 'USD',
          },
          description: '',
        },
      ],
      additionalAttachments: [],
      hasInvoiceOption: YesNoOption.YES,
      inviteeNewIndividual: {},
      inviteeNewOrganization: {
        organization: {},
      },
      newPayoutMethod: {
        data: {},
      },
    },
    startOptions: startOptions.current,
    onSubmit: transformedOnSubmit,
  });

  return (
    <FormikProvider value={expenseForm}>
      <form className="space-y-4" ref={formRef} onSubmit={e => e.preventDefault()}>
        <AdditionalAttachments form={expenseForm} />
        <EditExpenseActionButtons loading={expenseForm.initialLoading} handleSubmit={expenseForm.handleSubmit} />
      </form>
    </FormikProvider>
  );
};
const EditExpenseItems = ({ expense, onSubmit }) => {
  const formRef = React.useRef<HTMLFormElement>();
  const startOptions = React.useRef({
    expenseId: expense.legacyId,
    isInlineEdit: false,
    pickSchemaFields: { expenseItems: true, hasTax: true, tax: true },
  });
  const transformedOnSubmit = values => {
    const editValues = {
      items: values.expenseItems.map(ei => ({
        description: ei.description,
        amountV2: {
          valueInCents: ei.amount.valueInCents,
          currency: ei.amount.currency as Currency,
          exchangeRate: ei.amount.exchangeRate
            ? ({
                ...pick(ei.amount.exchangeRate, ['source', 'rate', 'value', 'fromCurrency', 'toCurrency']),
                date: ei.amount.exchangeRate.date || ei.incurredAt,
              } as CurrencyExchangeRateInput)
            : null,
        },
        incurredAt: new Date(ei.incurredAt),
        url: typeof ei.attachment === 'string' ? ei.attachment : ei.attachment?.url,
      })),
    };
    return onSubmit(editValues);
  };

  const expenseForm = useExpenseForm({
    formRef,
    initialValues: {
      inviteeAccountType: InviteeAccountType.INDIVIDUAL,
      expenseItems: [
        {
          amount: {
            valueInCents: 0,
            currency: 'USD',
          },
          description: '',
        },
      ],
      additionalAttachments: [],
      hasInvoiceOption: YesNoOption.YES,
      inviteeNewIndividual: {},
      inviteeNewOrganization: {
        organization: {},
      },
      newPayoutMethod: {
        data: {},
      },
    },
    startOptions: startOptions.current,
    onSubmit: transformedOnSubmit,
  });

  return (
    <FormikProvider value={expenseForm}>
      <form className="space-y-4" ref={formRef} onSubmit={e => e.preventDefault()}>
        <ExpenseItemsForm form={expenseForm} />
        <EditExpenseActionButtons handleSubmit={expenseForm.handleSubmit} />
      </form>
    </FormikProvider>
  );
};

const EditExpenseTitle = ({ expense, onSubmit }) => {
  const schema = z.object({
    description: z.string().min(1),
  });

  return (
    <FormikZod schema={schema} initialValues={expense} onSubmit={values => onSubmit(schema.parse(values))}>
      <Form className="space-y-4">
        <FormField name="description" label="Title" />
        <EditExpenseActionButtons />
      </Form>
    </FormikZod>
  );
};

function EditExpenseActionButtons({
  handleSubmit,
  disabled,
  loading,
}: {
  handleSubmit?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const formik = useFormikContext();

  return (
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">
          <FormattedMessage defaultMessage="Cancel" id="actions.cancel" />
        </Button>
      </DialogClose>

      <Button disabled={disabled || loading} type="submit" loading={formik.isSubmitting} onClick={handleSubmit}>
        <FormattedMessage defaultMessage="Save" id="save" />
      </Button>
    </DialogFooter>
  );
}

export default function EditExpenseDialog({
  expense,
  field,
  title,
  description,
  dialogContentClassName,
  triggerClassName,
  goToLegacyEdit,
}: {
  expense: Expense;
  field: 'title' | 'expenseItems' | 'payoutMethod' | 'payee' | 'type' | 'attachments';
  title: string;
  description?: string;
  dialogContentClassName?: string;
  triggerClassName?: string;
  goToLegacyEdit?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const intl = useIntl();
  const [editExpense] = useMutation(
    gql`
      mutation EditExpenseDialog($expenseEditInput: ExpenseUpdateInput!) {
        expense: editExpense(expense: $expenseEditInput) {
          id
          ...ExpensePageExpenseFields
        }
      }
      ${expensePageExpenseFieldsFragment}
    `,
    {
      context: API_V2_CONTEXT,
    },
  );

  const onSubmit = React.useCallback(
    async values => {
      try {
        const editInput = {
          ...values,
          id: expense.id,
        };
        await editExpense({
          variables: {
            expenseEditInput: editInput,
          },
        });
        setOpen(false);
        toast({
          variant: 'success',
          message: <FormattedMessage defaultMessage="Expense edited" id="yTblGN" />,
        });
      } catch (err) {
        // track(AnalyticsEvent.EXPENSE_SUBMISSION_SUBMITTED_ERROR);
        toast({ variant: 'error', message: i18nGraphqlException(intl, err) });
      }
    },
    [editExpense, intl, expense.id],
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon-xs" variant="outline" className={cn('h-7 w-7', triggerClassName)}>
              <Pen size={16} />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>

      <DialogContent className={dialogContentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {field === 'type' ? (
          <Button
            variant="outline"
            onClick={() => {
              goToLegacyEdit?.();
              setOpen(false);
            }}
          >
            <FormattedMessage defaultMessage="Go to edit" id="expense.goToEdit" />
          </Button>
        ) : (
          <RenderFormFields expense={expense} field={field} onSubmit={onSubmit} />
        )}
      </DialogContent>
    </Dialog>
  );
}
