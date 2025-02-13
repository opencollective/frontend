import React from 'react';
import PropTypes from 'prop-types';
import { Field, useFormikContext } from 'formik';
import { compact, get, set } from 'lodash';
import { defineMessages, useIntl } from 'react-intl';
import { isEmail } from 'validator';

import { PayoutMethodType } from '../../lib/constants/payout-method';
import { createError, ERROR } from '../../lib/errors';

import CurrencyPicker from '../CurrencyPicker';
import { FormField } from '../FormField';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';

import PayoutBankInformationForm from './PayoutBankInformationForm';

const msg = defineMessages({
  paypalEmail: {
    id: 'Paypal.Email',
    defaultMessage: 'PayPal email',
  },
  content: {
    id: 'editCollective.menu.info',
    defaultMessage: 'Info',
  },
  savePayout: {
    id: 'ExpenseForm.SavePayout',
    defaultMessage: 'Save this info for future payouts',
  },
  currency: {
    id: 'Currency',
    defaultMessage: 'Currency',
  },
});

/** Use this function to validate the payout method */
export const validatePayoutMethod = payoutMethod => {
  const errors = {};

  if (!payoutMethod || !payoutMethod.type) {
    set(errors, 'type', createError(ERROR.FORM_FIELD_REQUIRED));
  } else if (payoutMethod.type === PayoutMethodType.PAYPAL) {
    const email = get(payoutMethod, 'data.email');
    if (!email) {
      set(errors, 'data.email', createError(ERROR.FORM_FIELD_REQUIRED));
    } else if (!isEmail(email)) {
      set(errors, 'data.email', createError(ERROR.FORM_FIELD_PATTERN));
    }
  } else if (payoutMethod.type === PayoutMethodType.BANK_ACCOUNT) {
    if (!payoutMethod.data?.accountHolderName) {
      set(errors, 'data.accountHolderName', createError(ERROR.FORM_FIELD_REQUIRED));
    }
  } else if (payoutMethod.type === PayoutMethodType.OTHER) {
    const content = get(payoutMethod, 'data.content');
    if (!content) {
      set(errors, 'data.content', createError(ERROR.FORM_FIELD_MIN_LENGTH));
    }
  }

  return errors;
};

/**
 * A form to fill infos for a new payout method or to edit an existing one.
 * This component is **fully controlled**, you need to call `validatePayoutMethod`
 * to proceed with the validation and pass the result with the `errors` prop.
 */
const PayoutMethodForm = ({ payoutMethod, fieldsPrefix, host, required, alwaysSave = false, disabled }) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const isNew = !payoutMethod.id;
  const form = useFormikContext();

  const getFieldName = React.useCallback(field => compact([fieldsPrefix, field]).join('.'), [fieldsPrefix]);
  const currencyFieldName = getFieldName('data.currency');

  const { setFieldValue } = form;
  const onCurrencyPickerChange = React.useCallback(
    currency => {
      setFieldValue(currencyFieldName, currency);
    },
    [currencyFieldName, setFieldValue],
  );

  return (
    <div className="space-y-3">
      {payoutMethod.type === PayoutMethodType.PAYPAL && (
        <React.Fragment>
          <FormField name={currencyFieldName} disabled={disabled} label={formatMessage(msg.currency)}>
            {({ field }) => (
              <CurrencyPicker
                disabled={disabled}
                inputId={field.id}
                name={field.name}
                onChange={onCurrencyPickerChange}
                value={field.value}
              />
            )}
          </FormField>
          <FormField
            type="email"
            name={getFieldName('data.email')}
            label={formatMessage(msg.paypalEmail)}
            disabled={!isNew || disabled}
            required={required !== false}
            placeholder="e.g., yourname@yourhost.com"
          />
          {alwaysSave && (
            <FormField
              disabled={disabled}
              name={getFieldName('name')}
              label={intl.formatMessage({ defaultMessage: 'Label', id: 'PayoutMethod.New.customLabel' })}
              hint={intl.formatMessage({
                defaultMessage: 'Give this payout method a label that will help you identify it',
                id: 'PayoutMethod.New.customLabel.hint',
              })}
              placeholder={intl.formatMessage({
                defaultMessage: 'e.g., PayPal Personal',
                id: 'PayoutMethod.New.customLabel.placeholder.paypal',
              })}
              required={false}
            />
          )}
        </React.Fragment>
      )}
      {payoutMethod.type === PayoutMethodType.OTHER && (
        <React.Fragment>
          <FormField name={currencyFieldName} disabled={disabled} label={formatMessage(msg.currency)}>
            {({ field }) => (
              <CurrencyPicker
                inputId={field.id}
                disabled={disabled}
                name={field.name}
                onChange={onCurrencyPickerChange}
                value={field.value}
              />
            )}
          </FormField>
          <FormField disabled={disabled} name={getFieldName('data.content')} label={formatMessage(msg.content)}>
            {({ field }) => <Textarea {...field} minHeight={100} disabled={!isNew} data-cy="payout-other-info" />}
          </FormField>
          {alwaysSave && (
            <FormField
              disabled={disabled}
              name={getFieldName('name')}
              label={intl.formatMessage({ defaultMessage: 'Label', id: 'PayoutMethod.New.customLabel' })}
              hint={intl.formatMessage({
                defaultMessage: 'Give this payout method a label that will help you identify it',
                id: 'PayoutMethod.New.customLabel.hint',
              })}
              placeholder={intl.formatMessage({
                defaultMessage: 'e.g., Main Bank Account',
                id: 'PayoutMethod.New.customLabel.placeholder.bankAccount',
              })}
              required={false}
            />
          )}
        </React.Fragment>
      )}
      {payoutMethod.type === PayoutMethodType.BANK_ACCOUNT && (
        <PayoutBankInformationForm
          disabled={disabled}
          isNew={isNew}
          getFieldName={getFieldName}
          host={host}
          optional={required === false}
          alwaysSave={alwaysSave}
        />
      )}
      {isNew && !alwaysSave && (
        <div className="mt-4">
          <Field name={getFieldName('isSaved')}>
            {({ field, form }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  {...field}
                  disabled={disabled}
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={val => form.setFieldValue(field.name, val)}
                />
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {formatMessage(msg.savePayout)}
                </label>
              </div>
            )}
          </Field>
        </div>
      )}
    </div>
  );
};

PayoutMethodForm.propTypes = {
  host: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }),
  /** Set this to nil to create a new one */
  payoutMethod: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    type: PropTypes.oneOf(Object.values(PayoutMethodType)).isRequired,
    data: PropTypes.object,
  }).isRequired,
  /** Base name of the field in the form */
  fieldsPrefix: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  alwaysSave: PropTypes.bool,
};

export default React.memo(PayoutMethodForm);
