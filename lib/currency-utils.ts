import getSymbolFromCurrency from 'currency-symbol-map';
import { isNil, round } from 'lodash';

import { ZERO_DECIMAL_CURRENCIES } from './constants/currency';
import { CurrencyPrecision } from './constants/currency-precision';
import type { Amount, CurrencyExchangeRate, CurrencyExchangeRateInput } from './graphql/types/v2/schema';
import { Currency } from './graphql/types/v2/schema';

export type Options = {
  locale?: string;
  minimumFractionDigits?: number;
  precision?: number;
  style?: 'currency' | 'decimal';
  currencyDisplay?: Intl.NumberFormatOptions['currencyDisplay'];
  absolute?: boolean;
};

function getCurrencySymbolFallback(currency: Currency): string {
  return Number(0)
    .toLocaleString('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/(^0\s?)|(\s?0$)/, '');
}

export function getCurrencySymbol(currency: Currency): string {
  return getSymbolFromCurrency(currency) || getCurrencySymbolFallback(currency);
}

export const getPrecisionFromAmount = (amount: number): number => {
  return amount.toString().slice(-2) === '00' ? 0 : CurrencyPrecision.DEFAULT;
};

export function graphqlAmountValueInCents(amount: Amount | number | null): number | null {
  if (isNil(amount)) {
    return amount;
  }

  // GQLV2 is an object
  if (typeof amount === 'object') {
    return amount?.valueInCents;
  }
  // GQLV2 is already a value in cents
  return amount;
}

export const getDefaultCurrencyPrecision = (currency: Currency): number => {
  return ZERO_DECIMAL_CURRENCIES.includes(currency) ? 0 : 2;
};

export function formatCurrency(
  amount: Amount | number | null,
  currency: Currency = Currency.USD,
  options: Options = {},
): string {
  if (isNil(amount)) {
    return '--';
  }

  // Compatibility with amounts from GQLV2
  if (typeof amount === 'object') {
    currency = amount.currency || currency;
    if (!isNil(amount.valueInCents)) {
      amount = amount.valueInCents;
    } else if (!isNil(amount.value)) {
      amount = Math.round(amount.value * 100);
    } else {
      return '--';
    }
  }

  if (options.absolute) {
    amount = Math.abs(amount);
  }

  amount = amount / 100;
  const defaultPrecision = getDefaultCurrencyPrecision(currency);
  let minimumFractionDigits = defaultPrecision;
  let maximumFractionDigits = defaultPrecision;
  if (Object.prototype.hasOwnProperty.call(options, 'minimumFractionDigits')) {
    minimumFractionDigits = options.minimumFractionDigits;
  } else if (Object.prototype.hasOwnProperty.call(options, 'precision')) {
    minimumFractionDigits = options.precision;
    maximumFractionDigits = options.precision;
  } else if (ZERO_DECIMAL_CURRENCIES.includes(currency)) {
    minimumFractionDigits = 0;
    maximumFractionDigits = 0;
  }

  const formatAmount = (currencyDisplay: Options['currencyDisplay']): string => {
    return amount.toLocaleString(options.locale, {
      style: options.style || 'currency',
      currency,
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits,
      currencyDisplay,
    });
  };

  try {
    // We manually add the exact currency (e.g. "$10 USD") in many places. This is to prevent
    // showing the currency twice is some locales ($US10 USD)
    return formatAmount(options.currencyDisplay ?? 'narrowSymbol');
  } catch (e) {
    // ... unfortunately, some old versions of Safari doesn't support it, so we need a fallback
    return formatAmount('symbol');
  }
}

export const formatValueAsCurrency = (value: Amount, options: Options): string => {
  if (!value) {
    return '--.--';
  }

  return formatCurrency(value.valueInCents || value.value * 100, value.currency, options);
};

export const floatAmountToCents = (floatAmount: number | null): number | null => {
  if (isNaN(floatAmount) || floatAmount === null) {
    return floatAmount;
  } else {
    return Math.round(floatAmount * 100);
  }
};

export const centsAmountToFloat = (amount: number | null): number | null => {
  if (isNaN(amount) || isNil(amount)) {
    return null;
  } else {
    return round(amount / 100, 2);
  }
};

/**
 * Small helper to get the value in cents from an amount, works with GQLV1 & GQLV2
 */
export const getAmountInCents = (amount: Amount | number | null): number | null => {
  if (amount === null) {
    return null;
  } else if (typeof amount === 'number') {
    return amount;
  } else if (typeof amount === 'object') {
    if (!isNil(amount.valueInCents)) {
      return amount.valueInCents;
    } else if (!isNil(amount.value)) {
      return Math.round(amount.value * 100);
    }
  }

  return null;
};

/**
 * Calculates the difference between the exchange rate provided by the user and the one provided by the platform.
 * @returns {number} The difference between the exchange rates as a percentage, or null if the exchange rates are not comparable.
 */
export const diffExchangeRates = (
  exchangeRate: CurrencyExchangeRate | CurrencyExchangeRateInput,
  referenceExchangeRate: CurrencyExchangeRate | CurrencyExchangeRateInput,
) => {
  if (
    exchangeRate &&
    referenceExchangeRate &&
    exchangeRate.source === 'USER' && // Only show warnings for user-provided exchange rates
    exchangeRate.fromCurrency === referenceExchangeRate.fromCurrency &&
    exchangeRate.toCurrency === referenceExchangeRate.toCurrency
  ) {
    return Math.abs((exchangeRate.value - referenceExchangeRate.value) / referenceExchangeRate.value);
  }

  return null;
};
