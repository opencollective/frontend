/* eslint-disable prefer-arrow-callback */
import React from 'react';
import { useFormikContext } from 'formik';
import { pick } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';

import { CollectiveType } from '../../../lib/constants/collectives';
import { ExpenseType } from '../../../lib/graphql/types/v2/schema';
import { attachmentDropzoneParams } from '../../expenses/lib/attachments';
import { ExpenseLockableFields } from '@/lib/graphql/types/v2/graphql';
import useLoggedInUser from '@/lib/hooks/useLoggedInUser';

import { FormField } from '@/components/FormField';

import { MemoizedDropzone } from '../../Dropzone';
import { Label } from '../../ui/Label';
import { RadioGroup, RadioGroupCard } from '../../ui/RadioGroup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { useToast } from '../../ui/useToast';
import { Step } from '../SubmitExpenseFlowSteps';
import type { ExpenseForm } from '../useExpenseForm';
import { YesNoOption } from '../useExpenseForm';

import { ExpensePolicyContainer } from './ExpensePolicyContainer';
import { FormSectionContainer } from './FormSectionContainer';
import { memoWithGetFormProps } from './helper';

type TypeOfExpenseSectionProps = {
  inViewChange: (inView: boolean, entry: IntersectionObserverEntry) => void;
} & ReturnType<typeof getFormProps>;

function getFormProps(form: ExpenseForm) {
  return {
    setFieldValue: form.setFieldValue,
    initialLoading: form.initialLoading,
    isSubmitting: form.isSubmitting,
    ...pick(form.options, ['isAdminOfPayee', 'account', 'host', 'payee', 'lockedFields']),
    ...pick(form.values, [
      'expenseTypeOption',
      'acknowledgedCollectiveReceiptExpensePolicy',
      'acknowledgedCollectiveInvoiceExpensePolicy',
      'acknowledgedHostInvoiceExpensePolicy',
      'acknowledgedHostReceiptExpensePolicy',
    ]),
  };
}

export const TypeOfExpenseSection = memoWithGetFormProps(function TypeOfExpenseSection(
  props: TypeOfExpenseSectionProps,
) {
  const expenseTypeOption = props.expenseTypeOption;

  const isTypeLocked = props.lockedFields?.includes?.(ExpenseLockableFields.TYPE);

  return (
    <FormSectionContainer
      step={Step.TYPE_OF_EXPENSE}
      inViewChange={props.inViewChange}
      title={<FormattedMessage defaultMessage="Select the type of expense" id="hT+uK/" />}
    >
      <React.Fragment>
        <RadioGroup
          disabled={isTypeLocked || props.isSubmitting}
          value={expenseTypeOption}
          onValueChange={newValue => props.setFieldValue('expenseTypeOption', newValue as ExpenseType)}
          className="flex"
        >
          <RadioGroupCard
            className="grow basis-0"
            value={ExpenseType.INVOICE}
            disabled={props.initialLoading || props.isSubmitting}
          >
            <div>
              <div className="mb-1 font-bold">
                <FormattedMessage defaultMessage="Invoice" id="Expense.Type.Invoice" />
              </div>
              <div className="text-muted-foreground">
                <FormattedMessage defaultMessage="I am submitting an invoice to get paid" id="plK07+" />
              </div>
            </div>
          </RadioGroupCard>

          <RadioGroupCard
            className="grow basis-0"
            value={ExpenseType.RECEIPT}
            disabled={props.initialLoading || props.isSubmitting}
          >
            <div>
              <div className="mb-1 font-bold">
                <FormattedMessage defaultMessage="Reimbursement" id="ExpenseForm.ReceiptLabel" />
              </div>
              <div className="text-muted-foreground">
                <FormattedMessage defaultMessage="I want a reimbursement for something I've paid for" id="ZQSnky" />
              </div>
            </div>
          </RadioGroupCard>
        </RadioGroup>

        {!props.initialLoading && expenseTypeOption === ExpenseType.INVOICE && (
          <div>
            {props.host?.slug !== props.account?.slug && props.host?.policies?.EXPENSE_POLICIES?.invoicePolicy && (
              <div className="mt-4">
                <ExpensePolicyContainer
                  title={<FormattedMessage defaultMessage="Host instructions to submit an invoice" id="jXsDtM" />}
                  policy={props.host?.policies?.EXPENSE_POLICIES?.invoicePolicy}
                  checked={props.acknowledgedHostInvoiceExpensePolicy}
                  onAcknowledgedChanged={v => props.setFieldValue('acknowledgedHostInvoiceExpensePolicy', v)}
                />
              </div>
            )}

            {props.account?.policies?.EXPENSE_POLICIES?.invoicePolicy && (
              <div className="mt-4">
                <ExpensePolicyContainer
                  title={<FormattedMessage defaultMessage="Collective instructions to submit an invoice" id="NeQw7m" />}
                  policy={props.account?.policies?.EXPENSE_POLICIES?.invoicePolicy}
                  checked={props.acknowledgedCollectiveInvoiceExpensePolicy}
                  onAcknowledgedChanged={v => props.setFieldValue('acknowledgedCollectiveInvoiceExpensePolicy', v)}
                />
              </div>
            )}
          </div>
        )}

        {!props.initialLoading && expenseTypeOption === ExpenseType.RECEIPT && (
          <div>
            {props.host?.slug !== props.account?.slug && props.host?.policies?.EXPENSE_POLICIES?.receiptPolicy && (
              <div className="mt-4">
                <ExpensePolicyContainer
                  title={<FormattedMessage defaultMessage="Host instructions to submit a receipt" id="YQgEUZ" />}
                  policy={props.host?.policies?.EXPENSE_POLICIES?.receiptPolicy}
                  checked={props.acknowledgedHostReceiptExpensePolicy}
                  onAcknowledgedChanged={v => props.setFieldValue('acknowledgedHostReceiptExpensePolicy', v)}
                />
              </div>
            )}

            {props.account?.policies?.EXPENSE_POLICIES?.receiptPolicy && (
              <div className="mt-4">
                <ExpensePolicyContainer
                  title={<FormattedMessage defaultMessage="Collective instructions to submit a receipt" id="cP95i8" />}
                  policy={props.host?.policies?.EXPENSE_POLICIES?.receiptPolicy}
                  checked={props.acknowledgedCollectiveReceiptExpensePolicy}
                  onAcknowledgedChanged={v => props.setFieldValue('acknowledgedCollectiveReceiptExpensePolicy', v)}
                />
              </div>
            )}
          </div>
        )}

        {!props.initialLoading && expenseTypeOption === ExpenseType.INVOICE && <InvoiceFormOptionWrapper />}
      </React.Fragment>
    </FormSectionContainer>
  );
}, getFormProps);

function InvoiceFormOptionWrapper() {
  const form = useFormikContext() as ExpenseForm;

  return <InvoiceFormOption {...InvoiceFormOption.getFormProps(form)} />;
}

function getInvoiceFormProps(form: ExpenseForm) {
  return {
    setFieldValue: form.setFieldValue,
    initialLoading: form.initialLoading,
    isSubmitting: form.isSubmitting,
    ...pick(form.options, ['isAdminOfPayee', 'payee']),
    ...pick(form.values, ['invoiceFile', 'hasInvoiceOption']),
  };
}

type InvoiceFormOptionProps = ReturnType<typeof getInvoiceFormProps>;

export const InvoiceFormOption = memoWithGetFormProps(function InvoiceFormOption(props: InvoiceFormOptionProps) {
  const intl = useIntl();
  const { LoggedInUser } = useLoggedInUser();

  const { toast } = useToast();

  const { setFieldValue } = props;

  const onGraphQLSuccess = React.useCallback(
    uploadResults => {
      setFieldValue('invoiceFile', uploadResults[0].file);
    },
    [setFieldValue],
  );

  const onSuccess = React.useCallback(
    files => {
      setFieldValue('invoiceFile', files ? files[0] : null);
    },
    [setFieldValue],
  );

  const onReject = React.useCallback(
    msg => {
      toast({ variant: 'error', message: msg });
    },
    [toast],
  );

  const attachInvoiceLabel = React.useMemo(
    () => intl.formatMessage({ defaultMessage: 'Attach your invoice file', id: 'Oa/lhY' }),
    [intl],
  );

  return (
    <div className="mt-4 rounded-md border border-gray-300 p-4">
      <Label>
        {props.isAdminOfPayee || !LoggedInUser ? (
          <FormattedMessage defaultMessage="An invoice is required. Do you have one?" id="O+LW+y" />
        ) : (
          <FormattedMessage
            defaultMessage="The person you are inviting to submit this expense will be asked to provide an invoice. Do you have one?"
            id="Sioe6W"
          />
        )}
      </Label>
      <Tabs
        value={props.hasInvoiceOption}
        onValueChange={newValue => props.setFieldValue('hasInvoiceOption', newValue as YesNoOption)}
        className="space-y-4"
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value={YesNoOption.YES} disabled={props.isSubmitting || props.initialLoading}>
            <FormattedMessage defaultMessage="Yes, I have an invoice" id="woKQYE" />
          </TabsTrigger>
          <TabsTrigger value={YesNoOption.NO} disabled={props.isSubmitting || props.initialLoading}>
            <FormattedMessage defaultMessage="No, generate an invoice for me" id="67idHB" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value={YesNoOption.YES}>
          <div className="flex items-start gap-4">
            <div className="h-16 grow basis-0">
              <div>
                <FormField
                  required={props.isAdminOfPayee || props.payee?.type === CollectiveType.VENDOR}
                  disabled={props.isSubmitting || props.initialLoading}
                  name="invoiceFile"
                  isPrivate
                  label={attachInvoiceLabel}
                >
                  {({ field }) => (
                    <MemoizedDropzone
                      {...field}
                      {...attachmentDropzoneParams}
                      kind="EXPENSE_ATTACHED_FILE"
                      name="invoice"
                      className="min-h-16"
                      minHeight={64}
                      showActions
                      useGraphQL={true}
                      parseDocument={false}
                      isMulti={false}
                      value={typeof props.invoiceFile === 'string' ? props.invoiceFile : props.invoiceFile?.url}
                      onGraphQLSuccess={onGraphQLSuccess}
                      onSuccess={onSuccess}
                      onReject={onReject}
                    />
                  )}
                </FormField>
              </div>
            </div>
            <div className="grow basis-0">
              <FormField
                required={props.isAdminOfPayee || props.payee?.type === CollectiveType.VENDOR}
                disabled={props.isSubmitting || props.initialLoading}
                name="invoiceNumber"
                isPrivate
                label={intl.formatMessage({ defaultMessage: 'Invoice number', id: 'ijDMrP' })}
                placeholder="e.g. INV 001"
                hint={intl.formatMessage({
                  defaultMessage: 'The unique identifier mentioned on your invoice',
                  id: 'lct/39',
                })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}, getInvoiceFormProps);
