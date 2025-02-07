import React from 'react';
import PropTypes from 'prop-types';
import { ExclamationCircle } from '@styled-icons/fa-solid/ExclamationCircle';
import { Question } from '@styled-icons/remix-line/Question';
import { FormattedMessage } from 'react-intl';

import PrivateInfoIcon from './icons/PrivateInfoIcon';
import StyledTooltip from './StyledTooltip';
import { P, Span } from './Text';

const PrivateIconWithSpace = () => (
  <React.Fragment>
    &nbsp;
    <PrivateInfoIcon />
  </React.Fragment>
);

// eslint-disable-next-line react/prop-types
const QuestionMarkIconWithSpace = ({ helpText, labelFontSize, labelColor }) => (
  <StyledTooltip content={helpText}>
    &nbsp;
    <Question size={labelFontSize} color={labelColor} />
  </StyledTooltip>
);

/**
 * Form field to display an input element with a label and errors. Uses [renderProps](https://reactjs.org/docs/render-props.html#using-props-other-than-render) to pass field props like 'name' and 'id' to child input.
 */
const StyledInputField = ({
  children,
  label = undefined,
  htmlFor = undefined,
  name = undefined,
  error = undefined,
  hint = undefined,
  hintPosition = 'below',
  success = undefined,
  disabled = undefined,
  required = undefined,
  inputType = undefined,
  labelFontSize = undefined,
  labelFontWeight = '700',
  labelColor = 'black.800',
  labelProps = undefined,
  hideOptionalLabel = undefined,
  useRequiredLabel = undefined,
  requiredIndicator = '*',
  isPrivate = undefined,
  helpText = undefined,
  flexDirection = undefined,
  justifyContent = undefined,
  alignItems = undefined,
  placeholder = undefined,
  ...props
}) => {
  const isCheckbox = inputType === 'checkbox';
  htmlFor = htmlFor || (name ? `input-${name}` : undefined);
  const displayOptionalLabel = hideOptionalLabel ? false : required === false;
  const displayRequiredLabel = useRequiredLabel ? required === true : false;
  labelFontWeight = labelProps?.fontWeight || labelFontWeight;
  labelFontSize = labelProps?.labelFontSize || labelFontSize;
  const labelContent = label && (
    <Span color={labelColor} fontSize={labelFontSize} fontWeight={labelFontWeight}>
      {label}
    </Span>
  );

  const containerFlexDirection = flexDirection ?? (isCheckbox ? 'flex-row-reverse' : 'flex-col');
  const containerJustifyContent = justifyContent ?? 'justify-end';
  const containerAlignItems = alignItems ? `items-${alignItems}` : '';

  return (
    <div data-cy={`InputField-${name || htmlFor || 'unknown'}`} {...props}>
      <div className={`flex ${containerFlexDirection} ${containerJustifyContent} ${containerAlignItems}`}>
        {label && (
          <P
            as="label"
            htmlFor={htmlFor}
            display="flex"
            alignItems="center"
            fontSize={labelFontSize}
            fontWeight={labelFontWeight}
            mb={isCheckbox ? 0 : 2}
            mr={2}
            ml={isCheckbox ? 2 : undefined}
            cursor={isCheckbox ? 'pointer' : undefined}
            {...labelProps}
          >
            {displayOptionalLabel && !isCheckbox ? (
              <Span color="black.700" fontWeight="normal">
                <FormattedMessage
                  id="OptionalFieldLabel"
                  defaultMessage="{field} (optional)"
                  values={{ field: labelContent }}
                />
                {isPrivate && <PrivateIconWithSpace />}
              </Span>
            ) : displayRequiredLabel ? (
              <Span color="black.700" fontWeight={requiredIndicator === 'label' ? 'normal' : undefined}>
                {requiredIndicator === 'label' ? (
                  <FormattedMessage
                    id="RequiredFieldLabel"
                    defaultMessage="{field} (required)"
                    values={{ field: labelContent }}
                  />
                ) : (
                  <React.Fragment>{labelContent} *</React.Fragment>
                )}{' '}
                {isPrivate && <PrivateIconWithSpace />}
              </Span>
            ) : (
              <React.Fragment>
                {labelContent}
                {isPrivate && <PrivateIconWithSpace />}
              </React.Fragment>
            )}
            {helpText && (
              <QuestionMarkIconWithSpace helpText={helpText} labelColor={labelColor} labelFontSize={labelFontSize} />
            )}
          </P>
        )}
        {hint && hintPosition === 'above' && <div className="mb-2 text-xs font-light text-gray-600">{hint}</div>}
        {typeof children === 'function'
          ? children({
              name: name || htmlFor,
              id: htmlFor,
              type: inputType,
              error: Boolean(error) || undefined,
              success,
              disabled,
              required,
              placeholder,
            })
          : children}
      </div>
      {error && typeof error === 'string' && (
        <div className="pt-2 leading-none">
          <ExclamationCircle color="#E03F6A" size={16} />
          <Span ml={1} color="black.700" fontSize="0.9em" css={{ verticalAlign: 'middle' }}>
            {error}
          </Span>
        </div>
      )}
      {hint && hintPosition === 'below' && <div className="mt-1 text-xs font-light text-gray-600">{hint}</div>}
    </div>
  );
};

StyledInputField.propTypes = {
  /** React component to wrap with the label and errors */
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
  /** Show disabled state for field */
  disabled: PropTypes.bool,
  /** If true, a "Private" lock icon will be displayed next to the label */
  isPrivate: PropTypes.bool,
  /** text to display below the input or error status */
  error: PropTypes.any,
  /** text to display below the input when there's no error */
  hint: PropTypes.any,
  /** Whether hints should appear above or below the input. Defaults to below. */
  hintPosition: PropTypes.oneOf(['above', 'below']),
  /** the label's 'for' attribute to be used as the 'name' and 'id' for the input */
  htmlFor: PropTypes.string,
  /** By default name is equal to htmlFor, but you can use this prop to override it */
  name: PropTypes.string,
  /** text to display above the input */
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  /** Passed to input as `type`. Adapts layout for checkboxes */
  inputType: PropTypes.string,
  /** Show success state for field */
  success: PropTypes.bool,
  /** If set to false, the field will be marked as optional */
  required: PropTypes.bool,
  /** If set to true, will hide the (optional) label tag even if required is false and display "*" if required */
  useRequiredLabel: PropTypes.bool,
  /** Font size for the label */
  labelFontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  /** Font weight for the label */
  labelFontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  /** Color for the label */
  labelColor: PropTypes.string,
  /** Anything here will be passed down to label */
  labelProps: PropTypes.object,
  /** Help text that will appear next to the label (a small question mark with help text shown when hovered) */
  helpText: PropTypes.node,
  /** If true, will hide the (optional) label tag */
  hideOptionalLabel: PropTypes.bool,
  /** The indicator to use for required fields ('*' or 'label') */
  requiredIndicator: PropTypes.oneOf(['*', 'label']),
  /** The flex direction for the container */
  flexDirection: PropTypes.string,
  /** The justify content value for the container */
  justifyContent: PropTypes.string,
  /** The align items value for the container */
  alignItems: PropTypes.string,
  /** Placeholder text for the input */
  placeholder: PropTypes.string,
};

export default StyledInputField;
