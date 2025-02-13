import React from 'react';
import PropTypes from 'prop-types';
import { accountHasGST, accountHasVAT, TaxType } from '@opencollective/taxes';
import { filter, isEmpty, range, some } from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';

import expenseTypes from '../../lib/constants/expenseTypes';
import { formatErrorMessage } from '../../lib/errors';
import { ExpenseLockableFields } from '../../lib/graphql/types/v2/graphql';
import { i18nTaxType } from '../../lib/i18n/taxes';
import { attachmentDropzoneParams } from './lib/attachments';
import { expenseItemsMustHaveFiles, newExpenseItem } from './lib/items';
import { compareItemOCRValues, itemHasOCR, updateExpenseFormWithUploadResult } from './lib/ocr';
import { expenseTypeSupportsItemCurrency } from './lib/utils';

import Dropzone from '../Dropzone';
import { Box, Flex } from '../Grid';
import { I18nBold } from '../I18nFormatters';
import MessageBox from '../MessageBox';
import StyledCheckbox from '../StyledCheckbox';
import StyledHr from '../StyledHr';
import { TaxesFormikFields } from '../taxes/TaxesFormikFields';
import { P, Span } from '../Text';
import { toast } from '../ui/useToast';

import ExpenseAmountBreakdown from './ExpenseAmountBreakdown';
import ExpenseItemForm from './ExpenseItemForm';

/** Converts a list of filenames to expense item objects */
const filesListToItems = (files, expenseCurrency) => files.map(({ url }) => newExpenseItem({ url }, expenseCurrency));

class ExpenseFormItems extends React.PureComponent {
  static propTypes = {
    collective: PropTypes.object,
    /** @ignore from injectIntl */
    intl: PropTypes.object,
    /** Array helper as provided by formik */
    push: PropTypes.func.isRequired,
    /** Array helper as provided by formik */
    remove: PropTypes.func.isRequired,
    hasOCRFeature: PropTypes.bool,
    /** Formik */
    form: PropTypes.shape({
      values: PropTypes.object.isRequired,
      touched: PropTypes.object,
      errors: PropTypes.object,
      setFieldValue: PropTypes.func,
      setFieldTouched: PropTypes.func,
    }).isRequired,
    expense: PropTypes.shape({
      lockedFields: PropTypes.arrayOf(PropTypes.string),
    }),
  };

  componentDidMount() {
    const { values } = this.props.form;
    if ([expenseTypes.INVOICE, expenseTypes.GRANT].includes(values.type)) {
      this.addDefaultItem();
    }
  }

  componentDidUpdate(oldProps) {
    const { values, touched } = this.props.form;

    // Add or remove the default item when changing the expense type
    if (oldProps.form.values.type !== values.type) {
      if ([expenseTypes.INVOICE, expenseTypes.GRANT].includes(values.type)) {
        this.addDefaultItem();
      } else if (!touched.items && values.items?.length === 1) {
        const firstItem = values.items[0];
        if (!firstItem.url && !firstItem.description && !firstItem.amountV2?.valueInCents) {
          this.props.remove(0);
        }
      }
    }
  }

  addDefaultItem() {
    const { values } = this.props.form;
    if (isEmpty(values.items)) {
      this.props.push(newExpenseItem({}, values.currency));
    }
  }

  remove = item => {
    const idx = this.props.form.values.items.findIndex(a => a.id === item.id);
    if (idx !== -1) {
      this.props.remove(idx);
    }
  };

  reportErrors(errors) {
    if (errors?.length) {
      const firstMessage = typeof errors[0] === 'string' ? errors[0] : errors[0].message;
      toast({
        variant: 'error',
        title: (
          <FormattedMessage
            id="FilesUploadFailed"
            defaultMessage="{count, plural, one {The file} other {# files}} failed to upload"
            values={{ count: errors.length }}
          />
        ),
        message: formatErrorMessage(this.props.intl, firstMessage),
      });
    }
  }

  getApplicableTaxType() {
    const { collective, form } = this.props;
    if (form.values.type === expenseTypes.INVOICE) {
      if (accountHasVAT(collective, collective.host)) {
        return TaxType.VAT;
      } else if (accountHasGST(collective.host || collective)) {
        return TaxType.GST;
      }
    }
  }

  hasTaxFields(taxType) {
    if (!taxType) {
      return false;
    }

    const { values } = this.props.form;
    if (!values.taxes) {
      // If tax is not initialized (create expense) we render the fields by default
      return true;
    } else {
      // If tax is initialized (edit expense) we render the fields only if there are values
      return values.taxes[0] && !values.taxes[0].isDisabled;
    }
  }

  getUploadingItemsIndexes() {
    const { items } = this.props.form.values;
    return filter(range(items.length), index => items[index].__isUploading);
  }

  getItemsOCRComparisons(items) {
    return items.reduce((comparisons, item) => {
      comparisons[item.id] = compareItemOCRValues(item);
      return comparisons;
    }, {});
  }

  removeMultiUploadingItems() {
    const isMultiUploadingItem = item => item.__isUploading && item.__fromInput === 'multi';
    const otherItems = this.props.form.values.items.filter(item => !isMultiUploadingItem(item));
    this.props.form.setFieldValue('items', otherItems);
  }

  render() {
    const { hasOCRFeature, collective, expense } = this.props;
    const { values, errors, setFieldValue } = this.props.form;
    const requireFile = expenseItemsMustHaveFiles(values.type);
    const isGrant = values.type === expenseTypes.GRANT;
    const isInvoice = values.type === expenseTypes.INVOICE;
    const isCreditCardCharge = values.type === expenseTypes.CHARGE;
    const itemsHaveCurrencyPicker = expenseTypeSupportsItemCurrency(values.type);
    const items = values.items || [];
    const hasItems = items.length > 0;
    const itemsWithOCR = items.filter(itemHasOCR);
    const itemsOCRComparisons = this.getItemsOCRComparisons(itemsWithOCR);
    const ocrMismatchWarningFields = ['amountV2', 'incurredAt'];
    const hasOCRWarnings = some(itemsOCRComparisons, comparison =>
      some(comparison, (value, field) => ocrMismatchWarningFields.includes(field) && value.hasMismatch),
    );
    const amountIsLocked = expense?.lockedFields?.includes(ExpenseLockableFields.AMOUNT);

    if (!hasItems && requireFile) {
      return (
        <React.Fragment>
          <Dropzone
            {...attachmentDropzoneParams}
            kind="EXPENSE_ITEM"
            data-cy="expense-multi-items-dropzone"
            onSuccess={files => filesListToItems(files).map(this.props.push)}
            onReject={uploadErrors => {
              this.reportErrors(uploadErrors);
              this.removeMultiUploadingItems();
            }}
            mockImageGenerator={index => `https://loremflickr.com/120/120/invoice?lock=${index}`}
            className="mb-4"
            useGraphQL={hasOCRFeature}
            parseDocument={hasOCRFeature}
            parsingOptions={{ currency: values.currency }}
            onDrop={files => {
              // Insert dummy items to display the loading states when uploading through GraphQL
              if (hasOCRFeature) {
                this.props.form.setFieldValue(
                  'items',
                  files.map(file =>
                    newExpenseItem({ __isUploading: true, __file: file, __fromInput: 'multi' }, values.currency),
                  ),
                );
              }
            }}
            onGraphQLSuccess={uploadResults => {
              const indexesToUpdate = this.getUploadingItemsIndexes();
              updateExpenseFormWithUploadResult(collective, this.props.form, uploadResults, indexesToUpdate);
            }}
          >
            <P color="black.700" mt={1} px={2}>
              <FormattedMessage
                id="MultipleAttachmentsDropzone.UploadWarning"
                defaultMessage="<i18n-bold>Important</i18n-bold>: Expenses will not be paid without a valid receipt."
                values={{ 'i18n-bold': I18nBold }}
              />
            </P>
          </Dropzone>
        </React.Fragment>
      );
    }

    const onRemove = requireFile || items.length > 1 ? this.remove : null;
    const taxType = this.getApplicableTaxType();
    const hasTaxFields = this.hasTaxFields(taxType);
    return (
      <Box>
        {items.map((attachment, index) => (
          <ExpenseItemForm
            key={`item-${attachment.id}`}
            attachment={attachment}
            itemIdx={index}
            errors={errors}
            onRemove={onRemove}
            requireFile={requireFile}
            requireDate={!isGrant}
            isRichText={isGrant}
            onUploadError={e => this.reportErrors([e])}
            isOptional={values.payee?.isInvite}
            editOnlyDescriptiveInfo={isCreditCardCharge}
            isInvoice={isInvoice}
            hasOCRFeature={hasOCRFeature}
            collective={collective}
            ocrComparison={itemsOCRComparisons[attachment.id]}
            hasCurrencyPicker={itemsHaveCurrencyPicker}
            amountIsLocked={amountIsLocked}
            isSubjectToTax={Boolean(taxType)}
          />
        ))}
        {/** Do not display OCR warnings for OCR charges since date/amount can't be changed */}
        {!isCreditCardCharge && itemsWithOCR.length > 0 && (
          <MessageBox type={hasOCRWarnings ? 'warning' : 'info'} withIcon mt={3}>
            <FormattedMessage
              defaultMessage="Please verify the {count,plural,one{date and amount} other{dates and amounts}} before proceeding."
              id="XoSnCy"
              values={{ count: itemsWithOCR.length }}
            />
          </MessageBox>
        )}
        {taxType && (
          <div>
            <Flex alignItems="center" mt={24}>
              <Span color="black.900" fontSize="16px" lineHeight="21px" fontWeight="bold">
                <FormattedMessage defaultMessage="Tax and Total" id="9WIrrf" />
              </Span>
              <StyledHr flex="1" borderColor="black.300" mx={2} />
            </Flex>
            <Box mt="8px" display="inline-block">
              <StyledCheckbox
                name={`tax-${taxType}`}
                checked={hasTaxFields}
                onChange={({ checked }) => {
                  // Using "isDisabled" flag rather than removing to preserve data when enabled/disabled
                  if (checked) {
                    const tax = { ...values.taxes?.[0], type: taxType, isDisabled: false };
                    setFieldValue('taxes', [tax]);
                  } else {
                    setFieldValue('taxes.0.isDisabled', true);
                  }
                }}
                label={
                  <FormattedMessage
                    defaultMessage="Apply {taxName}"
                    id="0JzeTD"
                    values={{ taxName: i18nTaxType(this.props.intl, taxType) }}
                  />
                }
              />
            </Box>
          </div>
        )}
        {taxType && !hasTaxFields && <StyledHr borderColor="black.300" borderStyle="dotted" mb={24} mt={24} />}
        <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" mt={24}>
          <Box flexBasis={['100%', null, null, '50%']} mb={3}>
            {hasTaxFields && (
              <TaxesFormikFields
                taxType={taxType}
                formik={this.props.form}
                formikValuePath="taxes.0"
                isOptional={Boolean(values.payee?.isInvite)}
                requireIdNumber={taxType === TaxType.GST ? values.type === expenseTypes.INVOICE : undefined}
              />
            )}
          </Box>
          <Box mb={3} ml={[0, null, null, 4]} flexBasis={['100%', null, null, 'auto']}>
            <ExpenseAmountBreakdown currency={values.currency} items={items} taxes={values.taxes} />
          </Box>
        </Flex>
      </Box>
    );
  }
}

export default injectIntl(ExpenseFormItems);
