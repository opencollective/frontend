import React from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import { Field, useFormikContext } from 'formik';
import { escape, get, isEmpty, omit, pick, unescape } from 'lodash';
import Lottie from 'lottie-react';
import { AlertTriangle } from 'lucide-react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import expenseTypes from '../../lib/constants/expenseTypes';
import { formatCurrency, formatValueAsCurrency, getDefaultCurrencyPrecision } from '../../lib/currency-utils';
import { createError, ERROR } from '../../lib/errors';
import { standardizeExpenseItemIncurredAt } from '../../lib/expenses';
import { formatFormErrorMessage, requireFields } from '../../lib/form-utils';
import { API_V2_CONTEXT } from '../../lib/graphql/helpers';
import { cn, isValidUrl } from '../../lib/utils';
import { attachmentDropzoneParams } from './lib/attachments';
import { expenseItemsMustHaveFiles } from './lib/items';
import { updateExpenseFormWithUploadResult } from './lib/ocr';
import { FX_RATE_ERROR_THRESHOLD, getExpenseExchangeRateWarningOrError } from './lib/utils';

import * as ScanningAnimationJSON from '../../public/static/animations/scanning.json';
import Container from '../Container';
import Dropzone from '../Dropzone';
import { ExchangeRate } from '../ExchangeRate';
import { Box, Flex } from '../Grid';
import PrivateInfoIcon from '../icons/PrivateInfoIcon';
import RichTextEditor from '../RichTextEditor';
import StyledButton from '../StyledButton';
import StyledHr from '../StyledHr';
import StyledInput from '../StyledInput';
import StyledInputAmount from '../StyledInputAmount';
import StyledInputField from '../StyledInputField';
import { P, Span } from '../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';

import { ExpenseAccountingCategoryPill } from './ExpenseAccountingCategoryPill';
import { ExpenseItemDescriptionHint } from './ItemDescriptionHint';

const msg = defineMessages({
  previewImgAlt: {
    id: 'ExpenseReceiptImagePreview.Alt',
    defaultMessage: 'Expense receipt preview',
  },
  descriptionLabel: {
    id: 'Fields.description',
    defaultMessage: 'Description',
  },
  amountLabel: {
    id: 'Fields.amount',
    defaultMessage: 'Amount',
  },
  dateLabel: {
    id: 'expense.incurredAt',
    defaultMessage: 'Date',
  },
  removeReceipt: {
    id: 'expense.RemoveReceipt',
    defaultMessage: 'Remove receipt',
  },
  removeItem: {
    id: 'expense.RemoveItem',
    defaultMessage: 'Remove item',
  },
  receiptRequired: {
    id: 'expense.ReceiptRequired',
    defaultMessage: 'Receipt required',
  },
});

/** Validates a single expense item, one field at a time (doesn't return multiple errors) */
export const validateExpenseItem = (expense, item) => {
  const requiredFields = ['description'];
  if (expense.type !== expenseTypes.GRANT) {
    requiredFields.push('incurredAt');
  }
  const errors = requireFields(item, requiredFields);

  if (!item.amountV2?.valueInCents) {
    errors.amountV2 = createError(ERROR.FORM_FIELD_REQUIRED);
  } else if (isNaN(item.amountV2.valueInCents)) {
    errors.amountV2 = createError(ERROR.FORM_FIELD_PATTERN);
  }

  if (!isEmpty(errors)) {
    return errors;
  }

  // Attachment URL
  if (expenseItemsMustHaveFiles(expense.type)) {
    if (!item.url) {
      errors.url = createError(ERROR.FORM_FIELD_REQUIRED);
    } else if (!isValidUrl(item.url)) {
      errors.url = createError(ERROR.FORM_FIELD_PATTERN);
    } else if (item.__isUploading) {
      errors.url = createError(ERROR.FORM_FILE_UPLOADING);
    }
  }

  // Show the expense currency errors on the amount field, since it's displayed next to it
  if (!expense.currency) {
    errors.amountV2 = createError(ERROR.FORM_FIELD_REQUIRED);
  }

  return errors;
};

export const prepareExpenseItemForSubmit = (expenseData, item) => {
  // The frontend currently ignores the time part of the date, we default to midnight UTC
  const incurredAtFullDate = item.incurredAt || new Date().toISOString().split('T')[0];
  const incurredAt = standardizeExpenseItemIncurredAt(incurredAtFullDate);
  return {
    id: item.__isNew ? undefined : item.id, // Omit item's ids that were created for keying purposes
    incurredAt,
    description: item.description,
    url: expenseItemsMustHaveFiles(expenseData.type) ? item.url : null, // never submit URLs for invoices or requests
    amountV2: {
      ...pick(item.amountV2, ['valueInCents', 'currency']),
      exchangeRate: item.amountV2.exchangeRate && {
        ...omit(item.amountV2.exchangeRate, ['__typename', 'isApproximate']),
        date: item.amountV2.exchangeRate.date || incurredAt,
      },
    },
  };
};

const AttachmentLabel = () => (
  <Span fontSize="13px" whiteSpace="nowrap">
    <FormattedMessage id="Expense.Attachment" defaultMessage="Attachment" />
    &nbsp;&nbsp;
    <PrivateInfoIcon />
  </Span>
);

const WithOCRComparisonWarning = ({ comparison, formatValue, children, mrClass = 'mr-10' }) => (
  <div className="relative flex grow">
    {children}
    {Boolean(comparison?.hasMismatch) && (
      <div className={cn('absolute top-0 right-0 mt-[9px]', mrClass)} data-cy="mismatch-warning">
        <Tooltip>
          <TooltipTrigger>
            <AlertTriangle size={16} color="#CB9C03" />
          </TooltipTrigger>
          <TooltipContent data-cy="mismatch-warning-tooltip">
            {comparison.hasCurrencyMismatch ? (
              <FormattedMessage
                defaultMessage="This currency does not match the one scanned from the document ({value})"
                id="mNqW2+"
                values={{ value: comparison.ocrValue?.currency }}
              />
            ) : comparison.hasAmountMismatch ? (
              <FormattedMessage
                defaultMessage="The amount does not match the one scanned from the document ({value})"
                id="PlRIcN"
                values={{ value: formatValue ? formatValue(comparison.ocrValue) : comparison.ocrValue.toString() }}
              />
            ) : (
              <FormattedMessage
                defaultMessage="This value does not match the one scanned from the document ({value})"
                id="uMuuUg"
                values={{ value: formatValue ? formatValue(comparison.ocrValue) : comparison.ocrValue.toString() }}
              />
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    )}
  </div>
);

WithOCRComparisonWarning.propTypes = {
  children: PropTypes.node,
  mrClass: PropTypes.string,
  formatValue: PropTypes.func,
  comparison: PropTypes.shape({
    hasMismatch: PropTypes.bool,
    ocrValue: PropTypes.any,
    hasCurrencyMismatch: PropTypes.bool,
    hasAmountMismatch: PropTypes.bool,
  }),
};

const currencyExchangeRateQuery = gql`
  query ExpenseFormCurrencyExchangeRate($requests: [CurrencyExchangeRateRequest!]!) {
    currencyExchangeRate(requests: $requests) {
      value
      source
      fromCurrency
      toCurrency
      date
      isApproximate
    }
  }
`;

const getDefaultExchangeRate = (itemCurrency, expenseCurrency) => ({
  value: null,
  source: 'USER',
  fromCurrency: itemCurrency,
  toCurrency: expenseCurrency,
  date: null,
});

const isValidExchangeRate = (exchangeRate, itemCurrency, expenseCurrency) => {
  return Boolean(
    exchangeRate &&
      exchangeRate.source === 'USER' &&
      exchangeRate.fromCurrency === itemCurrency &&
      exchangeRate.toCurrency === expenseCurrency &&
      exchangeRate.value,
  );
};

const extractFormValues = (form, itemPath) => ({
  expenseCurrency: get(form.values, 'currency'),
  item: get(form.values, itemPath) || {},
});

/**
 * A hook that queries the exchange rate if needed and updates the form with the result.
 */
const useExpenseItemExchangeRate = (form, itemPath) => {
  // We use a ref as `useQuery` callbacks are not guaranteed to be called with the latest values
  const formValues = React.useRef(extractFormValues(form, itemPath));
  React.useEffect(() => {
    formValues.current = extractFormValues(form, itemPath);
  });

  // Do not query exchange rate...
  const shouldSkipExchangeRateQuery = () => {
    const { expenseCurrency, item } = formValues.current;
    const itemCurrency = get(item, 'amountV2.currency') || expenseCurrency;
    // ...if expense currency is not set or if item currency is the same as expense currency
    if (!expenseCurrency || !itemCurrency || expenseCurrency === itemCurrency) {
      return true;
    }

    // ...if we already have a valid exchange rate from Open Collective
    const existingExchangeRate = get(item, 'amountV2.exchangeRate');
    return Boolean(
      existingExchangeRate &&
        existingExchangeRate.source === 'OPENCOLLECTIVE' &&
        existingExchangeRate.fromCurrency === itemCurrency &&
        existingExchangeRate.toCurrency === expenseCurrency &&
        existingExchangeRate.value &&
        dayjs(existingExchangeRate?.date).isSame(dayjs(standardizeExpenseItemIncurredAt(get(item, 'incurredAt')))),
    );
  };

  // If the item exchange rate isn't valid anymore, let's make sure we invalidate it
  React.useEffect(() => {
    const newItemValues = {};
    const { expenseCurrency, item } = formValues.current;
    const existingExchangeRate = get(item, 'amountV2.exchangeRate');
    if (existingExchangeRate && existingExchangeRate.toCurrency !== expenseCurrency) {
      newItemValues.amountV2 = { ...item.amountV2, exchangeRate: null };
    }
    if (item.referenceExchangeRate && item.referenceExchangeRate.toCurrency !== expenseCurrency) {
      newItemValues.referenceExchangeRate = null;
    }

    if (!isEmpty(newItemValues)) {
      form.setFieldValue(itemPath, { ...item, ...newItemValues });
    }
  }, [form, itemPath]);

  const { loading } = useQuery(currencyExchangeRateQuery, {
    skip: shouldSkipExchangeRateQuery(),
    context: API_V2_CONTEXT,
    variables: {
      requests: [
        {
          fromCurrency: formValues.current.item.amountV2?.currency,
          toCurrency: formValues.current.expenseCurrency,
          date: standardizeExpenseItemIncurredAt(formValues.current.item.incurredAt),
        },
      ],
    },
    onCompleted: data => {
      // Re-check condition in case it changed since triggering the query
      const { expenseCurrency, item } = formValues.current;
      const itemCurrency = get(item, 'amountV2.currency') || expenseCurrency;
      const existingExchangeRate = get(item, 'amountV2.exchangeRate');
      if (!shouldSkipExchangeRateQuery() && !isValidExchangeRate(existingExchangeRate, itemCurrency, expenseCurrency)) {
        const exchangeRate = get(data, 'currencyExchangeRate[0]');
        if (exchangeRate && exchangeRate.fromCurrency === itemCurrency && exchangeRate.toCurrency === expenseCurrency) {
          form.setFieldValue(itemPath, {
            ...item,
            amountV2: { ...item.amountV2, exchangeRate },
            referenceExchangeRate: exchangeRate,
          });
        } else {
          // If we're not able to find an exchange rate, we'll ask the user to provide one manually
          form.setFieldValue(itemPath, {
            ...item,
            amountV2: { ...item.amountV2, exchangeRate: getDefaultExchangeRate(itemCurrency, expenseCurrency) },
            referenceExchangeRate: null,
          });
        }
      }
    },
    onError: () => {
      // If the API fails (e.g. network error), we'll ask the user to provide an exchange rate manually
      const { expenseCurrency, item } = formValues.current;
      form.setFieldValue(`${itemPath}.amountV2.exchangeRate`, getDefaultExchangeRate(item.currency, expenseCurrency));
    },
  });

  // Not returning data as we don't want to encourage using it directly (values are set directly in the form)
  return { loading };
};

const UploadAnimation = () => <Lottie animationData={ScanningAnimationJSON} loop autoPlay />;

/**
 * Form for a single attachment. Must be used with Formik.
 */
const ExpenseItemForm = ({
  collective,
  attachment,
  errors,
  onRemove,
  onUploadError,
  requireFile,
  requireDate,
  isRichText,
  itemIdx,
  isOptional = false,
  editOnlyDescriptiveInfo,
  isInvoice,
  hasOCRFeature,
  ocrComparison,
  hasCurrencyPicker,
  amountIsLocked,
}) => {
  const intl = useIntl();
  const form = useFormikContext();
  const { formatMessage } = intl;
  const attachmentKey = `attachment-${attachment.id || attachment.url}`;
  const itemPath = `items[${itemIdx}]`;
  const getFieldName = field => `${itemPath}.${field}`;
  const getError = field => formatFormErrorMessage(intl, get(errors, getFieldName(field)));
  const isLoading = Boolean(attachment.__isUploading);
  const hasAccountingCategory = Boolean(form.values.accountingCategory);
  const expenseCurrency = get(form.values, 'currency');
  const itemCurrency = get(form.values, getFieldName('amountV2.currency')) || expenseCurrency;
  const { loading: loadingExchangeRate } = useExpenseItemExchangeRate(form, itemPath);
  const exchangeRate = get(form.values, `${itemPath}.amountV2.exchangeRate`);
  const referenceExchangeRate = get(form.values, `${itemPath}.referenceExchangeRate`);

  // Store a ref to the form to make sure we can always access the latest values in async callbacks
  const formRef = React.useRef(form);
  formRef.current = form;

  return (
    <Box mb={18} data-cy="expense-attachment-form">
      <Flex flexWrap="wrap" gap="32px" mt={2}>
        {requireFile && (
          <Field name={getFieldName('url')}>
            {({ field, meta }) => {
              const hasValidUrl = field.value && isValidUrl(field.value);
              return (
                <StyledInputField
                  flex="0 0 112px"
                  htmlFor={attachmentKey}
                  label={<AttachmentLabel />}
                  data-cy="attachment-url-field"
                  required={!isOptional}
                  error={meta.error?.type !== ERROR.FORM_FIELD_REQUIRED && formatFormErrorMessage(intl, meta.error)}
                >
                  <Dropzone
                    {...attachmentDropzoneParams}
                    kind="EXPENSE_ITEM"
                    data-cy={`${field.name}-dropzone`}
                    name={field.name}
                    isMulti={false}
                    error={
                      meta.error?.type === ERROR.FORM_FIELD_REQUIRED ? formatMessage(msg.receiptRequired) : meta.error
                    }
                    onSuccess={({ url }) =>
                      formRef.current.setFieldValue(itemPath, { ...attachment, url, __isUploading: false })
                    }
                    mockImageGenerator={() => `https://loremflickr.com/120/120/invoice?lock=${attachmentKey}`}
                    className="size-20 sm:size-28"
                    value={hasValidUrl && field.value}
                    onReject={(...args) => {
                      formRef.current.setFieldValue(itemPath, { ...attachment, __isUploading: false });
                      onUploadError(...args);
                    }}
                    useGraphQL={hasOCRFeature}
                    parseDocument={hasOCRFeature}
                    parsingOptions={{ currency: form.values.currency }}
                    onGraphQLSuccess={uploadResults => {
                      updateExpenseFormWithUploadResult(collective, formRef.current, uploadResults, [itemIdx]);
                    }}
                    isLoading={isLoading}
                    UploadingComponent={UploadAnimation}
                    onDrop={() => form.setFieldValue(itemPath, { ...attachment, __isUploading: true })}
                  />
                </StyledInputField>
              );
            }}
          </Field>
        )}
        <Box flex="1 1">
          <Field name={getFieldName('description')}>
            {({ field, form }) => (
              <StyledInputField
                name={field.name}
                error={getError('description')}
                hint={<ExpenseItemDescriptionHint item={attachment} isInvoice={isInvoice} form={form} field={field} />}
                htmlFor={`${attachmentKey}-description`}
                label={formatMessage(msg.descriptionLabel)}
                labelFontSize="13px"
                required={!isOptional}
              >
                {inputProps =>
                  isRichText ? (
                    <RichTextEditor
                      inputName={inputProps.name}
                      error={inputProps.error}
                      withBorders
                      version="simplified"
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      value={field.value}
                    />
                  ) : (
                    <StyledInput
                      {...inputProps}
                      value={unescape(field.value)}
                      onChange={e => form.setFieldValue(field.name, escape(e.target.value))}
                      placeholder={get(attachment, '__file.name') || get(attachment, '__file.path')}
                    />
                  )
                }
              </StyledInputField>
            )}
          </Field>
          <Flex flexWrap="wrap" gap="16px">
            {requireDate && (
              <StyledInputField
                name={getFieldName('incurredAt')}
                error={getError('incurredAt')}
                htmlFor={`${attachmentKey}-incurredAt`}
                inputType="date"
                required={!isOptional}
                label={formatMessage(msg.dateLabel)}
                labelFontSize="13px"
                flex="1 1 170px"
                mt={3}
                disabled={editOnlyDescriptiveInfo}
              >
                {inputProps => (
                  <Field maxHeight={39} {...inputProps}>
                    {({ field }) => (
                      <WithOCRComparisonWarning comparison={ocrComparison?.['incurredAt']}>
                        <StyledInput
                          {...inputProps}
                          {...field}
                          py="7px"
                          width="100%"
                          minHeight="39px"
                          value={typeof field.value === 'string' ? field.value.split('T')[0] : field.value}
                          placeholder="YYYY-MM-DD"
                        />
                      </WithOCRComparisonWarning>
                    )}
                  </Field>
                )}
              </StyledInputField>
            )}
            <div className={cn('grow', exchangeRate ? 'basis-[330px]' : 'basis-[200px]')}>
              <StyledInputField
                name={getFieldName('amountV2')}
                error={getError('amountV2')}
                htmlFor={`${getFieldName('amountV2')}-amount`}
                label={formatMessage(msg.amountLabel)}
                required
                labelFontSize="13px"
                inputType="number"
                flexGrow={1}
                minWidth={200}
                mt={3}
                disabled={editOnlyDescriptiveInfo || amountIsLocked}
              >
                {inputProps => (
                  <Field name={inputProps.name}>
                    {({ field, form: { setFieldValue } }) => (
                      <WithOCRComparisonWarning
                        mrClass="mr-[30px]"
                        comparison={ocrComparison?.['amountV2']}
                        formatValue={amount =>
                          `${amount?.currency} ${formatValueAsCurrency(amount, { locale: intl.locale })}`
                        }
                      >
                        <StyledInputAmount
                          {...field}
                          {...inputProps}
                          className="grow"
                          value={field.value?.valueInCents}
                          currency={itemCurrency}
                          currencyDisplay="CODE"
                          min={isOptional ? undefined : 10 ** (2 - getDefaultCurrencyPrecision(itemCurrency))} // Precision is 2 for USD, 0 for JPY, so min is 0.01 for USD, 1 for JPY
                          maxWidth="100%"
                          placeholder={formatCurrency(0, itemCurrency, { style: 'decimal' })}
                          hasCurrencyPicker={hasCurrencyPicker}
                          loadingExchangeRate={loadingExchangeRate}
                          exchangeRate={field.value?.exchangeRate}
                          minFxRate={referenceExchangeRate?.value * (1 - FX_RATE_ERROR_THRESHOLD) || undefined}
                          maxFxRate={referenceExchangeRate?.value * (1 + FX_RATE_ERROR_THRESHOLD) || undefined}
                          onExchangeRateChange={exchangeRate => {
                            setFieldValue(field.name, {
                              ...field.value,
                              exchangeRate,
                            });
                          }}
                          onChange={valueInCents => {
                            setFieldValue(field.name, {
                              ...field.value,
                              valueInCents,
                              currency: itemCurrency, // Make sure we encode the currency here (it case it was defaulted from the expense currency)
                            });
                          }}
                          onCurrencyChange={currency => {
                            const exchangeRate = field.value?.exchangeRate;
                            setFieldValue(field.name, {
                              ...field.value,
                              exchangeRate: exchangeRate?.fromCurrency === currency ? field.value.exchangeRate : null, // Drop exchange rate when switching currency
                              currency,
                            });
                          }}
                        />
                      </WithOCRComparisonWarning>
                    )}
                  </Field>
                )}
              </StyledInputField>
              {Boolean(itemCurrency && expenseCurrency !== itemCurrency) && (
                <ExchangeRate
                  data-cy={`${getFieldName('amountV2')}-exchange-rate`}
                  className="mt-2 text-neutral-600"
                  loading={loadingExchangeRate}
                  {...getExpenseExchangeRateWarningOrError(intl, exchangeRate, referenceExchangeRate)}
                  exchangeRate={
                    exchangeRate || {
                      source: 'USER',
                      fromCurrency: itemCurrency,
                      toCurrency: expenseCurrency,
                    }
                  }
                  approximateCustomMessage={intl.formatMessage({
                    defaultMessage: 'This value is an estimate. Please set the exact amount received if known.',
                    id: 'zNBAqh',
                  })}
                />
              )}
            </div>
            {hasAccountingCategory && (
              <Container display="flex" flexDirection="column" fontSize="12px" flex="1 1 33%" mt={3}>
                <P fontSize="13px" lineHeight="1.15em" fontWeight="normal" mr="8px" mb="8px">
                  <FormattedMessage defaultMessage="Expense category" id="I4c3ke" />
                </P>
                <div className="flex max-h-[38px] grow items-center">
                  <ExpenseAccountingCategoryPill
                    expense={form.values}
                    host={collective.host}
                    account={collective}
                    canEdit={false}
                    showEmpty
                  />
                </div>
              </Container>
            )}
          </Flex>
        </Box>
      </Flex>
      <Flex alignItems="center" mt={3}>
        {onRemove && !editOnlyDescriptiveInfo && !amountIsLocked && (
          <StyledButton
            type="button"
            buttonStyle="dangerSecondary"
            buttonSize="tiny"
            isBorderless
            ml={-10}
            onClick={() => onRemove(attachment)}
          >
            {formatMessage(requireFile ? msg.removeReceipt : msg.removeItem)}
          </StyledButton>
        )}
        <StyledHr flex="1" borderStyle="dashed" borderColor="black.200" />
      </Flex>
    </Box>
  );
};

ExpenseItemForm.propTypes = {
  collective: PropTypes.object,
  /** Called when clicking on remove */
  onRemove: PropTypes.func,
  /** A map of errors for this object */
  errors: PropTypes.object,
  /** Whether a file is required for this attachment type */
  requireFile: PropTypes.bool,
  /** Whether a date is required for this expense type */
  requireDate: PropTypes.bool,
  /** Whether this whole item is optional */
  isOptional: PropTypes.bool,
  /** Whether the OCR feature is enabled */
  hasOCRFeature: PropTypes.bool,
  /** True if description is HTML */
  isRichText: PropTypes.bool,
  /** Called when an attachment upload fails */
  onUploadError: PropTypes.func.isRequired,
  /** Is it an invoice */
  isInvoice: PropTypes.bool,
  /** the item data. TODO: Rename to "item" */
  attachment: PropTypes.shape({
    id: PropTypes.string,
    url: PropTypes.string,
    description: PropTypes.string,
    incurredAt: PropTypes.string,
    amount: PropTypes.number,
    __parsingResult: PropTypes.object,
    __isUploading: PropTypes.bool,
  }).isRequired,
  editOnlyDescriptiveInfo: PropTypes.bool,
  itemIdx: PropTypes.number.isRequired,
  ocrComparison: PropTypes.object,
  hasCurrencyPicker: PropTypes.bool,
  amountIsLocked: PropTypes.bool,
};

export default React.memo(ExpenseItemForm);
