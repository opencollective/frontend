import React, { useState } from 'react';
import { find, isUndefined } from 'lodash';
import styled from 'styled-components';
import { size } from 'styled-system';

import Container from './Container';

/**
 * Returns a function that will return a unique key from iteratee. As we rely on
 * <input/> only a string key is valid.
 *
 * @param {array|object} options: an options iterable
 * @param {string|function} keyGetter: a key to get value from, or an extract func
 */
const getKeyExtractor = (options, keyGetter) => {
  if (typeof keyGetter === 'function') {
    return item => keyGetter(item).toString();
  } else if (typeof keyGetter === 'string') {
    return item => item[keyGetter].toString();
  } else if (Array.isArray(options)) {
    return item => item.toString();
  } else {
    return (_item, key) => key.toString();
  }
};

const RadioInput = styled.input`
  ${size}
  &[type='radio'] {
    margin: 0;
    cursor: pointer;
    &:focus {
      outline: none;
      filter: drop-shadow(0px 0px 4px ${props => props.theme.colors.primary[500]});
    }
  }
`;

/**
 * Convert a list of items to an object like {key, value} to be used in selects
 * and other lists.
 *
 * @param {object[] | string[]} options a list of items to transform to be used in list
 * @param {string | func} key a string to get the unique key from objects, or
 *  a function that get passed the object and returns a key. If not passed, the
 *  JSON representation of the item will be used. This can have very bad performances
 *  impact, so we should avoid using it.
 */
const getItems = (options, keyGetter) => {
  const keyExtractor = getKeyExtractor(options, keyGetter);

  return Object.keys(options).reduce(
    (items, key) =>
      items.concat({
        key: keyExtractor(options[key], key),
        value: options[key],
      }),
    [],
  );
};

const RadioListContainer = styled(Container)`
  & > *:first-child > * {
    border-radius: 15px 15px 0 0;
  }

  & > *:last-child > * {
    border-radius: 0 0 15px 15px;
  }
`;

/**
 * Component for controlling a list of radio inputs
 */
type RadioListProps = {
  /** Id for the container */
  id?: string;
  /** Name for the radio inputs */
  name: string;
  /** A function that returns the content of each radio item */
  children: ({
    checked,
    index,
    key,
    value,
    radio,
  }: {
    checked: boolean;
    index: number;
    key: string;
    value: any;
    radio: React.ReactNode;
  }) => React.ReactNode;
  /** A function that returns the key to use for each item */
  keyGetter?: string | ((item: any) => string);
  /** A list of options to use */
  options: any[];
  /** Called when the selected item change */
  onChange: (value: any) => void;
  /** The default value to use */
  defaultValue?: any;
  /** The current value */
  value?: any;
  /** If true, all radio buttons will be disabled */
  disabled?: boolean;
  /** Container props */
  containerProps?: any;
  /** Label props */
  labelProps?: any;
  /** Radio size */
  radioSize?: number;
  /** Data-cy */
  'data-cy'?: string;
};

interface DefaultChildProps {
  value?: string;
  radio?: React.ReactNode;
}

const DefaultChild = ({ value, radio }: DefaultChildProps) => (
  <div className="mb-2">
    <span className="mr-2">{radio}</span>
    {value}
  </div>
);

const StyledRadioList = ({
  children = DefaultChild,
  id,
  name,
  onChange = () => {},
  options,
  keyGetter,
  disabled,
  containerProps,
  labelProps,
  radioSize,
  'data-cy': dataCy,
  ...props
}: RadioListProps) => {
  const [localStateSelected, setSelected] = useState(props.defaultValue);
  const keyExtractor = getKeyExtractor(options, keyGetter);
  const items = getItems(options, keyExtractor);
  const defaultValueStr = props.defaultValue !== undefined && props.defaultValue.toString();
  const checkedItem = !isUndefined(props.value) ? props.value : localStateSelected;

  return (
    <RadioListContainer id={id} as="fieldset" border="none" m={0} p={0} data-cy={dataCy} {...containerProps}>
      {items.map(({ value, key }, index) => {
        const isDisabled = disabled || (value && value.disabled); // disable a specific option or entire options
        return (
          <Container
            as="label"
            cursor={isDisabled ? 'not-allowed' : 'pointer'}
            htmlFor={id && key + id}
            key={key}
            width={1}
            m={0}
            disabled={isDisabled}
            {...labelProps}
          >
            {children({
              checked: key === checkedItem,
              index,
              key,
              value,
              radio: (
                <RadioInput
                  type="radio"
                  name={name}
                  id={id && key + id}
                  value={key}
                  size={radioSize}
                  defaultChecked={isUndefined(props.defaultValue) ? undefined : defaultValueStr === key}
                  checked={isUndefined(props.value) ? undefined : props.value === key}
                  disabled={isDisabled} // disable a specific option or entire options
                  data-cy="radio-select"
                  onChange={event => {
                    event.stopPropagation();
                    const target = event.target;
                    const selectedItem = find(items, item => item.key === target.value);
                    onChange({ type: 'fieldset', name, key: selectedItem.key, value: selectedItem.value });
                    setSelected(target.value);
                  }}
                />
              ),
            })}
          </Container>
        );
      })}
    </RadioListContainer>
  );
};

StyledRadioList.displayName = 'StyledRadioList';

/**
 * @deprecated Use `ui/RadioGroup` instead
 */
export default StyledRadioList;
