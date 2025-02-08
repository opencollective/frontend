import React from 'react';
import { getEmojiByCurrencyCode } from 'country-currency-emoji-flags';
import { truncate } from 'lodash';
import { useIntl } from 'react-intl';

import { Currency } from '../lib/constants/currency';
import { getIntlDisplayNames } from '../lib/i18n';

import { ComboSelect } from './ComboSelect';

const generateCurrencyOptions = (intl, availableCurrencies) => {
  const currencyDisplayNames = getIntlDisplayNames(intl.locale, 'currency');
  return availableCurrencies.map(currency => {
    const currencyName = currencyDisplayNames.of(currency);
    const emoji = getEmojiByCurrencyCode(currency);
    return {
      value: currency,
      label: (
        <div className="@container flex-1 overflow-hidden text-left" title={currencyName}>
          {emoji && <span>{emoji}</span>}
          &nbsp;
          <span className="ml-1 whitespace-nowrap">
            <span className="">{currency}</span>
            {` `}
            <span className="invisible align-middle text-xs text-muted-foreground @2xs:visible">
              {truncate(currencyName, { length: 30 })}
            </span>
          </span>
        </div>
      ),
    };
  });
};

const CurrencyPicker = React.memo(
  // eslint-disable-next-line prefer-arrow-callback
  function CurrencyPicker({
    availableCurrencies = Currency,
    value,
    onChange,
    ...props
  }: {
    /** A list of currencies presented in the currency picker */
    availableCurrencies: string[];
    onChange: (selectedCurrency: string) => void;
    value?: string;
    inputId?: string;
  } & Omit<React.ComponentProps<typeof ComboSelect>, 'options'>) {
    const intl = useIntl();
    const currencyOptions = React.useMemo(
      () => generateCurrencyOptions(intl, availableCurrencies),
      [intl, availableCurrencies],
    );
    return (
      <ComboSelect
        id={props.inputId || 'currency-picker'}
        data-cy="currency-picker"
        error={!value}
        isSearchable={availableCurrencies.length > 10}
        options={currencyOptions}
        value={value}
        onChange={onChange}
        {...props}
      />
    );
  },
);

export default CurrencyPicker;
