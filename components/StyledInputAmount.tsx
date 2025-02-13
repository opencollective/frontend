// Deprecated, use components/InputAmount.tsx instead
import React from 'react';
import PropTypes from 'prop-types';
import { getEmojiByCurrencyCode } from 'country-currency-emoji-flags';
import { clamp, isNil, isUndefined, round } from 'lodash';
import { CurrencyInput } from 'react-currency-input-field';
import { useIntl } from 'react-intl';

import { Currency } from '../lib/constants/currency';
import {
  centsAmountToFloat,
  floatAmountToCents,
  getCurrencySymbol,
  getDefaultCurrencyPrecision,
} from '../lib/currency-utils';
import { cn } from '../lib/utils';

import { Separator } from './ui/Separator';
import { StyledCurrencyPicker } from './StyledCurrencyPicker';
import StyledSpinner from './StyledSpinner';

const formatCurrencyName = (currency, currencyDisplay) => {
  if (currencyDisplay === 'SYMBOL') {
    return getCurrencySymbol(currency);
  } else if (currencyDisplay === 'CODE') {
    return currency;
  } else {
    return `${getCurrencySymbol(currency)} ${currency}`;
  }
};

/** Returns the minimum width for an amount input, auto-adjusting to the number of digits */
const useAmountInputMinWidth = (value, max = 1000000000) => {
  const prevValue = React.useRef(value);

  // Do not change size if value becomes invalid (to prevent jumping)
  if (typeof value?.toFixed !== 'function') {
    return prevValue.current || '0.7em';
  }

  const maxLength = max.toString().length;
  const valueLength = clamp(value.toFixed(2).length, 1, maxLength);
  const result = `${valueLength * 0.7}em`;
  prevValue.current = result;
  return result;
};

const ConvertedAmountInput = ({ inputId, exchangeRate, onChange, baseAmount, minFxRate, maxFxRate }) => {
  const intl = useIntl();
  const precision = getDefaultCurrencyPrecision(exchangeRate.toCurrency);
  const targetAmount = round((baseAmount || 0) * exchangeRate.value, precision);
  const isBaseAmountInvalid = isNaN(baseAmount) || isNil(baseAmount);
  const [rawValue, setRawValue] = React.useState(centsAmountToFloat(targetAmount) || '');
  const minWidth = useAmountInputMinWidth(targetAmount / 100);
  const intlConfig = React.useMemo(() => {
    return { locale: intl.locale, currency: exchangeRate.toCurrency };
  }, [intl, exchangeRate.toCurrency]);

  const getLimitAmountFromFxRate = fxRate => {
    return round(((baseAmount || 0) * fxRate) / 100.0, precision);
  };

  return (
    <div className="flex flex-auto px-2 text-sm whitespace-nowrap text-neutral-500">
      <span className="mr-1 align-middle">= {exchangeRate.toCurrency} </span>
      <CurrencyInput
        className="w-full flex-auto [appearance:textfield] rounded px-[2px] focus:text-neutral-800 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        allowDecimals={precision !== 0}
        decimalScale={precision === 0 ? undefined : precision} // The `undefined` thingy can be removed once https://github.com/cchanxzy/react-currency-input-field/pull/385 is resolved
        decimalsLimit={precision}
        prefix="​" // Use a zero-width space, see https://github.com/cchanxzy/react-currency-input-field/issues/222
        intlConfig={intlConfig}
        style={{ minWidth }}
        name={inputId}
        id={inputId}
        step={1 / 10 ** precision} // Precision=2 -> 0.01, Precision=0 -> 1
        min={minFxRate ? getLimitAmountFromFxRate(minFxRate) : 1 / 10 ** precision}
        max={maxFxRate ? getLimitAmountFromFxRate(maxFxRate) : Number.MAX_SAFE_INTEGER / 100}
        value={
          isBaseAmountInvalid
            ? ''
            : typeof rawValue === 'string' && rawValue.match(/[,.]$/)
              ? rawValue
              : centsAmountToFloat(targetAmount)
        }
        required
        placeholder={!precision ? '--' : `--.${'-'.repeat(precision)}`}
        disabled={isBaseAmountInvalid}
        onValueChange={(_strValue, _formattedValue, values) => {
          setRawValue(values.value);
          if (!values.float) {
            onChange({ ...exchangeRate, value: null });
          } else {
            const newFxRate = round((values.float * 100) / (baseAmount || 1), 8);
            onChange({
              ...exchangeRate,
              value: newFxRate,
              source: 'USER',
              isApproximate: false,
              date: null,
            });
          }
        }}
      />
      <span className="ml-1">{getEmojiByCurrencyCode(exchangeRate.toCurrency)}</span>
    </div>
  );
};

ConvertedAmountInput.propTypes = {
  exchangeRate: PropTypes.object,
  onChange: PropTypes.func,
  baseAmount: PropTypes.number,
  minFxRate: PropTypes.number,
  maxFxRate: PropTypes.number,
};

/** Some custom styles to integrate the currency picker nicely */
const CURRENCY_PICKER_STYLES = {
  control: {
    border: 'none',
    background: '#F7F8FA',
    minHeight: '37px', // 39px - 2px border
  },
  menu: {
    width: '280px',
  },
  valueContainer: {
    padding: '0 0 0 8px',
  },
  input: {
    margin: '0',
  },
  dropdownIndicator: {
    paddingLeft: '0',
    paddingRight: '6px',
  },
};

/**
 * An input for amount inputs. Accepts all props from [StyledInputGroup](/#!/StyledInputGroup).
 */
const StyledInputAmount = ({
  id = 'amount',
  currency,
  currencyDisplay = 'SYMBOL',
  name = 'amount',
  min = 0,
  max = Number.MAX_SAFE_INTEGER / 100,
  required = false,
  disabled = false,
  precision = getDefaultCurrencyPrecision(currency),
  step = 1 / 10 ** precision,
  defaultValue = undefined,
  value,
  onChange,
  hasCurrencyPicker = false,
  onCurrencyChange = undefined,
  availableCurrencies = Currency,
  exchangeRate = undefined,
  loadingExchangeRate = false,
  onExchangeRateChange = undefined,
  minFxRate = undefined,
  maxFxRate = undefined,
  className = null,
  suffix = null,
  error = false,
}) => {
  const intl = useIntl();
  const [rawValue, setRawValue] = React.useState(
    () => centsAmountToFloat(value) || centsAmountToFloat(defaultValue) || '',
  );
  const minAmount = precision !== 0 ? min / 10 ** precision : min / 100;
  const canUseExchangeRate = Boolean(!loadingExchangeRate && exchangeRate && exchangeRate.fromCurrency === currency);
  const minWidth = useAmountInputMinWidth(value, max);

  const intlConfig = React.useMemo(() => {
    return { locale: intl.locale, currency: currency };
  }, [intl, currency]);

  const roundedMaxAmount = Math.floor(centsAmountToFloat(max));
  return (
    <div
      className={cn(
        'flex flex-wrap items-center overflow-hidden rounded border border-neutral-200 focus-within:border-blue-500 focus-within:bg-blue-100 hover:border-blue-300',
        className,
        { 'border-red-500': error },
      )}
    >
      <div className="flex flex-auto basis-1/2">
        {!hasCurrencyPicker ? (
          <div className="flex items-center bg-neutral-50 p-2 text-sm whitespace-nowrap text-neutral-800">
            {formatCurrencyName(currency, currencyDisplay)}
          </div>
        ) : (
          <div className="bg-neutral-50 text-neutral-800">
            <StyledCurrencyPicker
              data-cy={`${id}-currency-picker`}
              inputId={`${id}-currency-picker`}
              onChange={onCurrencyChange}
              value={currency}
              availableCurrencies={availableCurrencies}
              disabled={disabled || loadingExchangeRate}
              minWidth="95px"
              styles={CURRENCY_PICKER_STYLES}
            />
          </div>
        )}
        <CurrencyInput
          allowDecimals={precision !== 0}
          decimalScale={precision === 0 ? undefined : precision} // The `undefined` thingy can be removed once https://github.com/cchanxzy/react-currency-input-field/pull/385 is resolved
          decimalsLimit={precision}
          disabled={disabled || loadingExchangeRate}
          className={cn(
            'w-full flex-auto self-stretch rounded-none pl-2 outline-0',
            canUseExchangeRate ? 'pr-1' : 'pr-2',
          )}
          step={step ?? 1 / 10 ** precision}
          style={{ minWidth }}
          required={required}
          name={name}
          min={minAmount}
          max={roundedMaxAmount}
          maxLength={roundedMaxAmount.toString().length}
          prefix="​" // Use a zero-width space, see https://github.com/cchanxzy/react-currency-input-field/issues/222
          intlConfig={intlConfig}
          defaultValue={isUndefined(defaultValue) ? undefined : centsAmountToFloat(defaultValue)}
          value={typeof rawValue === 'string' && rawValue.match(/[,.]$/) ? rawValue : centsAmountToFloat(value)} // Fallback to rawValue if it's an unterminated string (ending with a separator)
          onKeyDown={e => {
            // Increase/Decrease the amount by a custom non-round  instead of $0.01 when using the arrows
            // This functions is called AFTER
            if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && step < 1 && step !== 1 / 10 ** precision) {
              // We use value in cents, 1 cent is already increased/decreased by the input field itself when arrow was clicked
              // so we need to increase/decrease the value by 49 cents to get the desired increment/decrement of $0.5
              if (e.key === 'ArrowUp') {
                onChange(Math.round((value + 49) / 50) * 50);
              } else if (e.key === 'ArrowDown') {
                onChange(Math.round((value - 49) / 50) * 50);
              }
            }
          }}
          onValueChange={(_strValue, _formattedValue, values) => {
            console.log('values', values);
            setRawValue(values.value);
            if (onChange) {
              onChange(floatAmountToCents(values.float));
            }
          }}
        />
      </div>
      {canUseExchangeRate && (
        <div className="flex h-[38px] flex-auto basis-1/2 items-center" data-cy={`${id}-converted`}>
          <Separator orientation="vertical" className="h-6" />
          <ConvertedAmountInput
            inputId={`${id}-converted-input`}
            exchangeRate={exchangeRate}
            onChange={onExchangeRateChange}
            baseAmount={value}
            minFxRate={minFxRate}
            maxFxRate={maxFxRate}
          />
        </div>
      )}
      {loadingExchangeRate && <StyledSpinner size={16} color="black.700" className="absolute right-8" />}
      {suffix && (
        <div className="pointer-events-none mx-2 flex h-[38px] grow-0 items-center text-xs text-muted-foreground">
          {suffix}
        </div>
      )}
    </div>
  );
};

export default StyledInputAmount;
