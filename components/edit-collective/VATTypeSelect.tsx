import React from 'react';
import { useIntl } from 'react-intl';

import { VAT_OPTIONS } from '../../lib/constants/vat';

import StyledSelect from '../StyledSelect';

type VATTypeSelectProps = Omit<React.ComponentProps<typeof StyledSelect>, 'options'> & {
  isHost: boolean;
  value: string;
  onChange: any;
};

export const VATTypeSelect = ({ isHost, value, onChange, ...props }: VATTypeSelectProps) => {
  const intl = useIntl();
  const options = React.useMemo(() => {
    return [
      {
        value: null,
        label: intl.formatMessage({
          id: 'EditCollective.VAT.None',
          defaultMessage: 'Not subject to VAT',
        }),
      },
      {
        value: VAT_OPTIONS.OWN,
        label: intl.formatMessage({
          id: 'EditCollective.VAT.Own',
          defaultMessage: 'Use my own VAT number',
        }),
      },
      ...(!isHost && value !== VAT_OPTIONS.HOST
        ? []
        : [
            {
              value: VAT_OPTIONS.HOST,
              label: intl.formatMessage({
                id: 'EditCollective.VAT.Host',
                defaultMessage: 'Use the host VAT settings',
              }),
            },
          ]),
    ];
  }, [intl, isHost]);

  return (
    <StyledSelect
      {...props}
      options={options}
      value={options.find(option => option.value === value) || null}
      onChange={option => onChange(option?.value || null)}
    />
  );
};
