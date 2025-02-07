import React from 'react';
import { isNil, omitBy, truncate } from 'lodash';
import type { IntlShape } from 'react-intl';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import type {
  ContainerProps,
  DropdownIndicatorProps,
  GroupHeadingProps,
  OptionProps,
  Props as ReactSelectProps,
  ValueContainerProps,
} from 'react-select';
import Select, { components as ReactSelectComponents } from 'react-select';
import styled from 'styled-components';
import type { BorderProps, BorderRadiusProps, LayoutProps, SpaceProps, TypographyProps } from 'styled-system';
import { layout, space, typography } from 'styled-system';

import Container from './Container';
import SearchIcon from './SearchIcon';
import StyledHr from './StyledHr';
import StyledTag from './StyledTag';
import { P } from './Text';

const Messages = defineMessages({
  loading: {
    id: 'Select.Loading',
    defaultMessage: 'Loading...',
  },
  noOptions: {
    id: 'Select.NoOptions',
    defaultMessage: 'Nothing found',
  },
  placeholder: {
    id: 'Select.Placeholder',
    defaultMessage: 'No selection',
  },
});

const Option = ({ innerProps, ...props }: OptionProps & { 'data-cy': string }) => (
  <ReactSelectComponents.Option
    {...props}
    innerProps={
      { ...innerProps, 'data-cy': 'select-option', title: props.data['title'] } as React.HTMLProps<HTMLDivElement>
    }
  />
);

const SelectContainer = ({ innerProps, ...props }: ContainerProps) => (
  <ReactSelectComponents.SelectContainer
    {...props}
    innerProps={
      { ...innerProps, 'data-cy': props.selectProps['data-cy'] || 'select' } as React.HTMLProps<HTMLDivElement>
    }
  />
);

const MultiValue = ({ children, removeProps, ...props }) => {
  let title;
  if (typeof children === 'string') {
    title = children;
    children = truncate(children, { length: 32 });
  }

  if (props.selectProps.useCompactMode) {
    return (
      <StyledTag m="4px" variant="rounded" maxHeight="24px" closeButtonProps={removeProps}>
        <Container maxWidth={16} overflow="hidden" title={props.data.label || title}>
          {children}
        </Container>
      </StyledTag>
    );
  } else {
    return (
      <StyledTag m="4px" variant="rounded-right" maxHeight="none" closeButtonProps={removeProps} title={title}>
        {children}
      </StyledTag>
    );
  }
};

const ValueContainer = ({ children, ...rest }: ValueContainerProps) => {
  const selectedCount = rest.getValue().length;
  const truncationThreshold = rest.selectProps['truncationThreshold'] || 3;
  const isTruncate = selectedCount > truncationThreshold;

  let firstChild = [];
  let elementNames;

  if (isTruncate) {
    firstChild = [children[0][0], children[1]];
    elementNames = children[0]
      .slice(1)
      .map(child => child.props.data.label)
      .join(', ');
  }

  return (
    <ReactSelectComponents.ValueContainer {...rest}>
      {!isTruncate ? children : firstChild}
      {isTruncate && (
        <span title={elementNames}>
          <u>
            <FormattedMessage
              defaultMessage="and {selectedCount} others"
              id="vpMxUJ"
              values={{ selectedCount: selectedCount - 1 }}
            />
          </u>
        </span>
      )}
    </ReactSelectComponents.ValueContainer>
  );
};
/* eslint-enable react/prop-types */

const STYLES_DISPLAY_NONE = { display: 'none' };

/**
 * Override the default "Caret Down" indicator to use a search icon instead
 */
const DropdownSearchIndicator = (props: DropdownIndicatorProps) => {
  return props.isDisabled ? null : (
    <ReactSelectComponents.DropdownIndicator {...props}>
      <SearchIcon size={16} fill="#aaaaaa" />
    </ReactSelectComponents.DropdownIndicator>
  );
};

const GroupHeading = ({ children, ...props }: GroupHeadingProps) => (
  <ReactSelectComponents.GroupHeading {...props}>
    <div className="mr-2 flex items-center justify-between">
      <P
        fontWeight="600"
        fontSize="9px"
        lineHeight="14px"
        textTransform="uppercase"
        letterSpacing="0.6px"
        whiteSpace="nowrap"
        pr={3}
      >
        {children}
      </P>
      <StyledHr flex="1" borderStyle="solid" borderColor="black.300" />
    </div>
  </ReactSelectComponents.GroupHeading>
);

/**
 * A map to override the default components of react-select
 */
const customComponents = { SelectContainer, Option, MultiValue, GroupHeading, ValueContainer };
const searchableCustomComponents = { ...customComponents, DropdownIndicator: DropdownSearchIndicator };

const getComponents = (components, useSearchIcon) => {
  const baseComponents = useSearchIcon ? searchableCustomComponents : customComponents;
  if (!components) {
    return baseComponents;
  } else {
    return omitBy({ ...baseComponents, ...components }, isNil);
  }
};

/**
 * Binds our custom theme and wordings to a regular `react-select`'s `Select`.
 * See https://react-select.com for more documentation.
 */
export const makeStyledSelect = (SelectComponent, { alwaysSearchable = false } = {}) => styled(SelectComponent).attrs(
  ({
    theme,
    intl,
    placeholder,
    disabled,
    inputId,
    instanceId,
    isDisabled,
    useSearchIcon,
    hideDropdownIndicator,
    hideMenu,
    error,
    styles = {},
    components,
    isSearchable,
    menuPortalTarget,
    selectTheme,
    noOptionsMessage = () => intl.formatMessage(Messages.noOptions),
    options,
    fontSize = '14px',
    onBlur,
  }) => {
    isSearchable = alwaysSearchable || (isSearchable ?? options?.length > 8);
    return {
      isSearchable,
      menuPortalTarget:
        menuPortalTarget || (menuPortalTarget === null || typeof document === 'undefined' ? undefined : document.body),
      isDisabled: disabled || isDisabled,
      placeholder: placeholder || intl.formatMessage(Messages.placeholder),
      loadingMessage: () => intl.formatMessage(Messages.loading),
      noOptionsMessage,
      components: getComponents(components, useSearchIcon),
      instanceId: instanceId ? instanceId : inputId,
      theme: selectTheme,
      onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
        // Needed for Reect-select to work with Radix UI dialogs
        // https://github.com/JedWatson/react-select/issues/5732#issuecomment-1742107647
        const element = event.relatedTarget;
        if (element && (element.tagName === 'A' || element.tagName === 'BUTTON' || element.tagName === 'INPUT')) {
          (element as HTMLElement).focus();
        }

        onBlur?.(event);
      },
      styles: {
        valueContainer: baseStyles => {
          if (styles?.valueContainer) {
            return { ...baseStyles, ...styles.valueContainer };
          } else {
            return baseStyles;
          }
        },
        control: (baseStyles, state) => {
          const customStyles: Record<string, unknown> = { borderColor: theme.colors.black[300] };

          if (error) {
            customStyles.borderColor = theme.colors.red[500];
            customStyles['&:hover'] = { borderColor: theme.colors.red[300] };
          } else if (!state.isFocused) {
            customStyles['&:hover'] = { borderColor: theme.colors.primary[300] };
          } else if (state.isDisabled) {
            customStyles.boxShadow = 'none';
          } else {
            customStyles.borderColor = theme.colors.primary[500];
            customStyles.boxShadow = `inset 0px 2px 2px ${theme.colors.primary[50]}`;
          }

          if (isSearchable !== false) {
            customStyles.cursor = 'text';
          } else {
            customStyles.cursor = 'pointer';
          }

          if (fontSize) {
            customStyles.fontSize = fontSize;
          }

          if (typeof styles?.control === 'function') {
            return styles.control({ ...baseStyles, ...customStyles }, state);
          } else {
            return { ...baseStyles, ...customStyles, ...styles?.control };
          }
        },
        option: (baseStyles, state) => {
          const customStyles: Record<string, unknown> = { cursor: 'pointer' };

          if (state.data.__background__) {
            // Ability to force background by setting a special option prop
            customStyles.background = state.data.__background__;
          } else if (state.isSelected) {
            customStyles.backgroundColor = theme.colors.primary[200];
            customStyles.color = undefined;
          } else if (state.isFocused) {
            customStyles.backgroundColor = theme.colors.primary[100];
          } else {
            customStyles['&:hover'] = { backgroundColor: theme.colors.primary[100] };
          }

          if (fontSize) {
            customStyles.fontSize = fontSize;
          }

          return { ...baseStyles, ...customStyles, ...styles?.option };
        },
        singleValue: baseStyles => ({
          ...baseStyles,
          width: '100%',
        }),
        menu: baseStyles => {
          return hideMenu
            ? STYLES_DISPLAY_NONE
            : {
                ...baseStyles,
                ...styles?.menu,
                overflow: 'hidden', // for children border-radius to apply
                zIndex: 10,
              };
        },
        menuList: baseStyles => ({
          ...baseStyles,
          ...styles?.menuList,
          paddingTop: 0,
          paddingBottom: 0,
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        clearIndicator: baseStyles => ({
          ...baseStyles,
          cursor: 'pointer',
        }),
        dropdownIndicator: baseStyles => {
          if (hideDropdownIndicator) {
            return STYLES_DISPLAY_NONE;
          } else if (styles?.dropdownIndicator) {
            return { ...baseStyles, ...styles.dropdownIndicator };
          } else {
            return baseStyles;
          }
        },
        menuPortal: baseStyles => ({
          ...baseStyles,
          zIndex: 99999,
          pointerEvents: 'auto',
        }),
        input: baseStyles => {
          if (styles?.input) {
            return { ...baseStyles, ...styles.input };
          } else {
            return baseStyles;
          }
        },
      },
    };
  },
)`
  ${typography}
  ${layout}
  ${space}
`;

export type StyledSelectProps = LayoutProps &
  TypographyProps &
  BorderProps &
  BorderRadiusProps &
  SpaceProps &
  Omit<ReactSelectProps, 'styles' | 'components'> & {
    styles?: Record<string, unknown>;
    components?: Record<string, React.ReactNode | React.Component | React.FunctionComponent>;
    intl?: IntlShape;
    disabled?: boolean;
    error?: boolean;
    inputId?: string;
  };

export type StyledSelectCustomComponent = Select & React.ExoticComponent<StyledSelectProps>;

const StyledSelect: StyledSelectCustomComponent = makeStyledSelect(Select);

/**
 * @deprecated Use `ui/Select` instead
 */
export default injectIntl(StyledSelect) as undefined as StyledSelectCustomComponent;
