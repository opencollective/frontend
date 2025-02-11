/* eslint-disable prefer-arrow-callback */
import React, { useId } from 'react';
import { TaxType } from '@opencollective/taxes';
import type { CheckedState } from '@radix-ui/react-checkbox';
import dayjs from 'dayjs';
import { useFormikContext } from 'formik';
import { get, pick, round } from 'lodash';
import { Lock, Trash2 } from 'lucide-react';
import type { IntlShape } from 'react-intl';
import { FormattedMessage, useIntl } from 'react-intl';

import type { Currency, CurrencyExchangeRateInput } from '../../../lib/graphql/types/v2/schema';
import { CurrencyExchangeRateSourceType, ExpenseLockableFields } from '../../../lib/graphql/types/v2/schema';
import { i18nTaxType } from '../../../lib/i18n/taxes';
import { attachmentDropzoneParams } from '../../expenses/lib/attachments';
import {
  FX_RATE_ERROR_THRESHOLD,
  getExpenseExchangeRateWarningOrError,
  getTaxAmount,
  isTaxRateValid,
} from '../../expenses/lib/utils';

import { FormField } from '@/components/FormField';
import InputAmount from '@/components/InputAmount';
import { Checkbox } from '@/components/ui/Checkbox';

import Dropzone, { MemoizedDropzone } from '../../Dropzone';
import { ExchangeRate } from '../../ExchangeRate';
import FormattedMoneyAmount from '../../FormattedMoneyAmount';
import LoadingPlaceholder from '../../LoadingPlaceholder';
import StyledSelect from '../../StyledSelect';
import { Button } from '../../ui/Button';
import { Input, InputGroup } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { useToast } from '../../ui/useToast';
import { Step } from '../SubmitExpenseFlowSteps';
import { type ExpenseForm } from '../useExpenseForm';

import { FormSectionContainer } from './FormSectionContainer';
import { memoWithGetFormProps } from './helper';

type ExpenseItemsSectionProps = {
  form: ExpenseForm;
  inViewChange: (inView: boolean, entry: IntersectionObserverEntry) => void;
};

export function ExpenseItemsSection(props: ExpenseItemsSectionProps) {
  return (
    <FormSectionContainer
      step={Step.EXPENSE_ITEMS}
      inViewChange={props.inViewChange}
      subtitle={
        <div className="flex items-center gap-2">
          <FormattedMessage defaultMessage="Add the expense items that you’d like to be paid for" id="ox+mWM" />
          <Lock size={14} />
        </div>
      }
    >
      <React.Fragment>
        <ExpenseItemsForm {...ExpenseItemsForm.getFormProps(props.form)} />

        <div className="my-4 border-t border-gray-200" />
        <AdditionalAttachments {...AdditionalAttachments.getFormProps(props.form)} />
      </React.Fragment>
    </FormSectionContainer>
  );
}

function getExpenseItemFormProps(form: ExpenseForm) {
  return {
    ...pick(form, ['setFieldValue', 'initialLoading', 'isSubmitting']),
    ...pick(form.options, ['expenseCurrency', 'totalInvoicedInExpenseCurrency', 'taxType', 'lockedFields']),
    ...pick(form.values, ['tax', 'hasTax', 'expenseItems']),
    expenseItemCount: form.values.expenseItems?.length || 0,
  };
}

export const ExpenseItemsForm = memoWithGetFormProps(function ExpenseItemsForm(
  props: ReturnType<typeof getExpenseItemFormProps>,
) {
  const intl = useIntl();
  const expenseItems = props.expenseItems;
  const { setFieldValue } = props;

  const isAmountLocked = props.lockedFields?.includes?.(ExpenseLockableFields.AMOUNT);

  return (
    <React.Fragment>
      <div role="list">
        {!props.initialLoading &&
          expenseItems?.map((ei, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} role="listitem" className="flex gap-4">
              <div className="grow">
                <ExpenseItemWrapper index={i} isAmountLocked={isAmountLocked} isSubjectToTax={Boolean(props.taxType)} />
              </div>
              <div>
                <Button
                  onClick={() => {
                    setFieldValue('expenseItems', [...expenseItems.slice(0, i), ...expenseItems.slice(i + 1)]);
                  }}
                  disabled={expenseItems.length === 1 || isAmountLocked || props.isSubmitting}
                  variant="outline"
                  size="icon-sm"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
      </div>

      {props.initialLoading && (
        <div className="mb-4">
          <LoadingPlaceholder width={1} height={120} />
        </div>
      )}
      <div className="flex justify-between pr-12">
        <Button
          variant="outline"
          disabled={props.initialLoading || isAmountLocked || props.isSubmitting}
          onClick={() =>
            setFieldValue('expenseItems', [
              ...expenseItems,
              {
                amount: { valueInCents: 0, currency: props.expenseCurrency },
                description: '',
                incurredAt: new Date().toISOString(),
                attachment: null,
              },
            ])
          }
        >
          <FormattedMessage defaultMessage="Add item" id="KDO3hW" />
        </Button>
        <div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right">
            {props.hasTax && props.tax && (
              <React.Fragment>
                <div>
                  <FormattedMessage defaultMessage="Subtotal:" id="WWhVAU" />
                </div>
                <div>
                  <FormattedMoneyAmount
                    amount={props.totalInvoicedInExpenseCurrency}
                    precision={2}
                    currency={props.expenseCurrency}
                    showCurrencyCode
                  />
                </div>
              </React.Fragment>
            )}
            {props.hasTax && props.tax && (
              <React.Fragment>
                <span className="captilize">
                  {i18nTaxType(intl, props.taxType, 'short')}
                  {isTaxRateValid(props.tax.rate) && ` (${round(props.tax.rate * 100, 2)}%)`}:
                </span>
                <div>
                  <FormattedMoneyAmount
                    amount={
                      !isTaxRateValid(props.tax.rate)
                        ? null
                        : getTaxAmount(props.totalInvoicedInExpenseCurrency, props.tax)
                    }
                    precision={2}
                    currency={props.expenseCurrency}
                    showCurrencyCode
                  />
                </div>
              </React.Fragment>
            )}

            <div className="col-span-2 text-right">
              <FormattedMoneyAmount
                amount={
                  props.hasTax && props.tax && isTaxRateValid(props.tax.rate)
                    ? getTaxAmount(props.totalInvoicedInExpenseCurrency, props.tax) +
                      props.totalInvoicedInExpenseCurrency
                    : props.totalInvoicedInExpenseCurrency
                }
                precision={2}
                currency={props.expenseCurrency}
                showCurrencyCode
                amountClassName="font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {props.taxType && (
        <React.Fragment>
          <div className="my-4 border-t border-gray-200" />
          <Taxes
            hasTax={props.hasTax}
            taxType={props.taxType}
            setFieldValue={setFieldValue}
            tax={props.tax}
            isSubmitting={props.isSubmitting}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}, getExpenseItemFormProps);

type ExpenseItemProps = {
  index: number;
  isAmountLocked?: boolean;
  isSubjectToTax: boolean;
  item: ExpenseForm['values']['expenseItems'][number];
} & ReturnType<typeof getExpenseItemProps>;

function getExpenseItemProps(form: ExpenseForm) {
  return {
    ...pick(form, ['setFieldValue', 'isSubmitting']),
    ...pick(form.options, ['allowExpenseItemAttachment', 'isAdminOfPayee', 'expenseCurrency']),
  };
}

function ExpenseItemWrapper(props: { index: number; isAmountLocked?: boolean; isSubjectToTax: boolean }) {
  const form = useFormikContext() as ExpenseForm;
  return (
    <ExpenseItem
      index={props.index}
      item={get(form.values, `expenseItems.${props.index}`)}
      isAmountLocked={props.isAmountLocked}
      isSubjectToTax={props.isSubjectToTax}
      {...ExpenseItem.getFormProps(form)}
    />
  );
}

const ExpenseItem = memoWithGetFormProps(function ExpenseItem(props: ExpenseItemProps) {
  const { toast } = useToast();
  const intl = useIntl();
  const item = props.item;

  const hasAttachment = props.allowExpenseItemAttachment;

  const attachmentId = useId();

  const { setFieldValue } = props;

  const onCurrencyChange = React.useCallback(
    v => setFieldValue(`expenseItems.${props.index}.amount.currency`, v),
    [props.index, setFieldValue],
  );

  const onGraphQLSuccess = React.useCallback(
    uploadResults => {
      setFieldValue(`expenseItems.${props.index}.attachment`, uploadResults[0].file);
    },
    [setFieldValue, props.index],
  );

  const onSuccess = React.useCallback(
    file => {
      setFieldValue(`expenseItems.${props.index}.attachment`, file);
    },
    [setFieldValue, props.index],
  );

  const onReject = React.useCallback(
    msg => {
      toast({ variant: 'error', message: msg });
    },
    [toast],
  );

  const onAmountChange = React.useCallback(
    v => {
      setFieldValue(`expenseItems.${props.index}.amount.valueInCents`, v);
    },
    [setFieldValue, props.index],
  );

  const onExchangeRateChange = React.useCallback(
    exchangeRate => {
      setFieldValue(`expenseItems.${props.index}.amount.exchangeRate`, exchangeRate);
    },
    [setFieldValue, props.index],
  );

  if (!item) {
    return null;
  }

  return (
    <div className="mb-4 rounded-md border border-slate-300 p-4">
      <div className="flex flex-wrap gap-4">
        {hasAttachment && (
          <div className="flex flex-col">
            <div className="flex grow justify-center">
              <FormField
                disabled={props.isSubmitting}
                label={intl.formatMessage({ defaultMessage: 'Upload file', id: '6oOCCL' })}
                name={`expenseItems.${props.index}.attachment`}
              >
                {({ field }) => {
                  return (
                    <MemoizedDropzone
                      {...attachmentDropzoneParams}
                      {...field}
                      disabled={props.isSubmitting}
                      kind="EXPENSE_ITEM"
                      id={attachmentId}
                      name={attachmentId}
                      value={typeof item.attachment === 'string' ? item.attachment : item.attachment?.url}
                      isMulti={false}
                      showActions
                      className="size-28"
                      useGraphQL={true}
                      parseDocument={false}
                      onGraphQLSuccess={onGraphQLSuccess}
                      onSuccess={onSuccess}
                      onReject={onReject}
                    />
                  );
                }}
              </FormField>
            </div>
          </div>
        )}
        <div className="grow">
          <div className="mb-2">
            <FormField
              required={props.isAdminOfPayee}
              disabled={props.isSubmitting}
              label={intl.formatMessage({ defaultMessage: 'Item Description', id: 'xNL/oy' })}
              placeholder={intl.formatMessage({ defaultMessage: 'Enter what best describes the item', id: '/eapvj' })}
              name={`expenseItems.${props.index}.description`}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="grow basis-0">
              <FormField
                required={props.isAdminOfPayee}
                disabled={props.isSubmitting}
                label={intl.formatMessage({ defaultMessage: 'Date', id: 'expense.incurredAt' })}
                name={`expenseItems.${props.index}.incurredAt`}
              >
                {({ field }) => {
                  const value = field.value ? dayjs.utc(field.value).format('YYYY-MM-DD') : undefined;
                  return <Input type="date" {...field} value={value} />;
                }}
              </FormField>
            </div>

            <div className="grow basis-0">
              <div className="flex flex-col">
                <FormField
                  disabled={props.isAmountLocked || props.isSubmitting}
                  label={
                    props.isSubjectToTax
                      ? intl.formatMessage({ defaultMessage: 'Gross Amount', id: 'bwZInO' })
                      : intl.formatMessage({ defaultMessage: 'Amount', id: 'Fields.amount' })
                  }
                  name={`expenseItems.${props.index}.amount.valueInCents`}
                >
                  {({ field }) => (
                    <InputAmount
                      {...field}
                      currencyDisplay="FULL"
                      hasCurrencyPicker
                      currency={item.amount.currency || 'USD'}
                      onCurrencyChange={onCurrencyChange}
                      value={item.amount.valueInCents}
                      onChange={onAmountChange}
                      exchangeRate={
                        item.amount.currency !== props.expenseCurrency && get(item, `amount.exchangeRate`, 0)
                      }
                      minFxRate={
                        (item.amount?.referenceExchangeRate && 'value' in item.amount.referenceExchangeRate
                          ? item.amount.referenceExchangeRate.value || 0
                          : 0) *
                          (1 - FX_RATE_ERROR_THRESHOLD) || undefined
                      }
                      maxFxRate={
                        (item.amount?.referenceExchangeRate && 'value' in item.amount.referenceExchangeRate
                          ? item.amount.referenceExchangeRate.value || 0
                          : 0) *
                          (1 + FX_RATE_ERROR_THRESHOLD) || undefined
                      }
                      onExchangeRateChange={onExchangeRateChange}
                    />
                  )}
                </FormField>

                <div className="self-end">
                  {Boolean(item.amount?.currency && props.expenseCurrency !== item.amount?.currency) && (
                    <ExchangeRate
                      className="mt-2 text-muted-foreground"
                      {...getExpenseExchangeRateWarningOrError(
                        intl,
                        item.amount.exchangeRate,
                        item.amount.referenceExchangeRate,
                      )}
                      exchangeRate={
                        (item.amount.exchangeRate || {
                          source: CurrencyExchangeRateSourceType.USER,
                          fromCurrency: item.amount.currency as Currency,
                          toCurrency: props.expenseCurrency,
                        }) as CurrencyExchangeRateInput
                      }
                      approximateCustomMessage={
                        <FormattedMessage
                          defaultMessage="This value is an estimate. Please set the exact amount received if known."
                          id="zNBAqh"
                        />
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, getExpenseItemProps);

type AdditionalAttachmentsProps = ReturnType<typeof getAdditionalAttachmentFormProps>;

function getAdditionalAttachmentFormProps(form: ExpenseForm) {
  return {
    ...pick(form, ['initialLoading', 'setFieldValue', 'isSubmitting']),
    ...pick(form.values, ['additionalAttachments']),
  };
}

export const AdditionalAttachments = memoWithGetFormProps(function AdditionalAttachments(
  props: AdditionalAttachmentsProps,
) {
  const { toast } = useToast();
  const { additionalAttachments, setFieldValue } = props;

  const onGraphQLSuccess = React.useCallback(
    uploadResults => {
      setFieldValue('additionalAttachments', [...(additionalAttachments || []), ...uploadResults.map(up => up.file)]);
    },
    [setFieldValue, additionalAttachments],
  );

  const onReject = React.useCallback(
    msg => {
      toast({ variant: 'error', message: msg });
    },
    [toast],
  );

  const onSuccessEmpty = React.useCallback(() => {}, []);

  return (
    <div>
      <Label htmlFor="additionalAttachments">
        <FormattedMessage defaultMessage="Additional Attachments (Optional)" id="n3evmu" />
      </Label>
      <div className="flex flex-wrap gap-4 pt-2">
        <div>
          <Dropzone
            {...attachmentDropzoneParams}
            id="additionalAttachments"
            name="additionalAttachments"
            kind="EXPENSE_ATTACHED_FILE"
            className="size-28"
            isMulti
            disabled={props.initialLoading || props.isSubmitting}
            isLoading={props.initialLoading}
            useGraphQL={true}
            parseDocument={false}
            onGraphQLSuccess={onGraphQLSuccess}
            onSuccess={onSuccessEmpty}
            onReject={onReject}
          />
        </div>

        {additionalAttachments?.map(at => (
          <div key={typeof at === 'string' ? at : at.id}>
            <Dropzone
              {...attachmentDropzoneParams}
              disabled={props.isSubmitting}
              name={typeof at === 'string' ? at : at.name}
              className="size-28"
              value={typeof at === 'string' ? at : at?.url}
              collectFilesOnly
              showActions
              showReplaceAction={false}
              onSuccess={() => {
                setFieldValue(
                  'additionalAttachments',
                  additionalAttachments.filter(f => f !== at),
                );
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}, getAdditionalAttachmentFormProps);

const i18nTaxRate = (intl: IntlShape, taxType: TaxType, rate: number) => {
  if (rate) {
    return `${rate * 100}%`;
  } else {
    return intl.formatMessage(
      { defaultMessage: 'No {taxName}', id: 'lTGBvW' },
      { taxName: i18nTaxType(intl, taxType, 'short') },
    );
  }
};

const Taxes = React.memo(function Taxes(props: {
  setFieldValue: ExpenseForm['setFieldValue'];
  isSubmitting: ExpenseForm['isSubmitting'];
  tax: ExpenseForm['values']['tax'];
  hasTax: ExpenseForm['values']['hasTax'];
  taxType: ExpenseForm['options']['taxType'];
}) {
  const intl = useIntl();
  const { setFieldValue } = props;
  const onHasTaxChange = React.useCallback(
    (checked: CheckedState) => {
      setFieldValue('hasTax', Boolean(checked));
    },
    [setFieldValue],
  );

  return (
    <div>
      <FormField label={intl.formatMessage({ defaultMessage: 'Taxes', id: 'r+dgiv' })} name="hasTax">
        {() => (
          <div className="items-top mt-1 flex space-x-2">
            <Checkbox
              id="hasTax"
              disabled={props.isSubmitting}
              checked={props.hasTax}
              onCheckedChange={onHasTaxChange}
            />
            <Label className="font-normal" htmlFor="hasTax">
              <FormattedMessage
                defaultMessage="Apply {taxName}"
                id="0JzeTD"
                values={{
                  taxName: i18nTaxType(intl, props.taxType),
                }}
              />
            </Label>
          </div>
        )}
      </FormField>

      <div className="items-top mt-4 flex gap-4">
        <div>
          {props.hasTax && props.taxType === TaxType.GST && (
            <FormField
              name="tax.rate"
              disabled={props.isSubmitting}
              htmlFor={`input-${props.taxType}-rate`}
              label={intl.formatMessage(
                { defaultMessage: '{taxName} rate', id: 'Gsyrfa' },
                { taxName: i18nTaxType(intl, props.taxType, 'short') },
              )}
              inputType="number"
            >
              {({ field }) => (
                <StyledSelect
                  disabled={props.isSubmitting}
                  inputId={`input-${props.taxType}-rate`}
                  value={{
                    value: round(field.value * 100, 2),
                    label: i18nTaxRate(intl, props.taxType, field.value),
                  }}
                  onChange={({ value }) => props.setFieldValue('tax.rate', value)}
                  options={[0, 0.15].map(rate => ({
                    value: rate,
                    label: i18nTaxRate(intl, props.taxType, rate),
                  }))}
                />
              )}
            </FormField>
          )}

          {props.hasTax && props.taxType === TaxType.VAT && (
            <FormField
              name="tax.rate"
              disabled={props.isSubmitting}
              htmlFor={`input-${props.taxType}-rate`}
              label={intl.formatMessage(
                { defaultMessage: '{taxName} rate', id: 'Gsyrfa' },
                { taxName: i18nTaxType(intl, props.taxType, 'short') },
              )}
              inputType="number"
            >
              {({ field }) => (
                <InputGroup
                  {...field}
                  value={field.value ? round(field.value * 100, 2) : 0}
                  onChange={e => props.setFieldValue('tax.rate', round((e.target.value as any) / 100, 4))}
                  minWidth={65}
                  append="%"
                  min={0}
                  max={100}
                  step="0.01"
                />
              )}
            </FormField>
          )}
        </div>

        {props.hasTax && (
          <FormField
            name="tax.idNumber"
            htmlFor={`input-${props.taxType}-idNumber`}
            label={intl.formatMessage(
              { defaultMessage: '{taxName} identifier', id: 'Byg+S/' },
              { taxName: i18nTaxType(intl, props.taxType, 'short') },
            )}
            placeholder={intl.formatMessage(
              { id: 'examples', defaultMessage: 'e.g., {examples}' },
              { examples: props.taxType === TaxType.VAT ? 'EU000011111' : '123456789' },
            )}
            disabled={props.isSubmitting}
          />
        )}
      </div>
    </div>
  );
});
