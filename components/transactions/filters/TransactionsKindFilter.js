import React from 'react';
import PropTypes from 'prop-types';
import { intersection, size } from 'lodash';
import { useIntl } from 'react-intl';

import { TransactionKind } from '../../../lib/constants/transactions';
import { i18nTransactionKind } from '../../../lib/i18n/transaction';

import { StyledSelectFilter, TruncatedValueContainer } from '../../StyledSelectFilter';

// (!) Remember that any changes made here should be applied to the cache in API > `getCacheKeyForBudgetOrTransactionsSections`
export const getDefaultKinds = () => {
  return [
    TransactionKind.ADDED_FUNDS,
    TransactionKind.BALANCE_TRANSFER,
    TransactionKind.CONTRIBUTION,
    TransactionKind.EXPENSE,
    TransactionKind.PLATFORM_TIP,
    TransactionKind.HOST_FEE,
  ];
};

const optionsToQueryString = options => {
  if (!options || options.length === size(TransactionKind)) {
    return null;
  } else {
    return options.map(({ value }) => value).join(',');
  }
};

export const parseTransactionKinds = str => {
  if (str === 'ALL') {
    return Object.values(TransactionKind);
  }

  const result = str?.split(',');
  if (!result?.length || result.length === size(TransactionKind)) {
    return null;
  } else {
    return result?.length ? result : null;
  }
};

const REACT_SELECT_COMPONENT_OVERRIDE = {
  ValueContainer: TruncatedValueContainer,
  MultiValue: () => null, // Items will be displayed as a truncated string in `TruncatedValueContainer `
};

const TransactionsKindFilter = ({ onChange, value, kinds, ...props }) => {
  const intl = useIntl();
  const getOption = (value, idx) => ({ label: i18nTransactionKind(intl, value), value, idx });
  const displayedKinds = kinds && kinds.length ? kinds : getDefaultKinds();
  const options = displayedKinds.map(getOption);
  const selectedOptions = React.useMemo(
    () => (!value ? intersection(getDefaultKinds(), displayedKinds) : parseTransactionKinds(value)).map(getOption),
    [value],
  );
  return (
    <StyledSelectFilter
      isSearchable={false}
      isClearable={false}
      onChange={options => onChange(optionsToQueryString(options))}
      value={selectedOptions}
      options={options}
      components={REACT_SELECT_COMPONENT_OVERRIDE}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      isMulti
      maxWidth={['100%']}
      minWidth={150}
      styles={{
        control: { flexWrap: 'nowrap' },
      }}
      {...props}
    />
  );
};

TransactionsKindFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  kinds: PropTypes.array,
};

export default TransactionsKindFilter;
