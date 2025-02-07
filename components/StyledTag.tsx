import React from 'react';
import { Times } from '@styled-icons/fa-solid/Times';
import styled from 'styled-components';
import { background, border, color, layout, position, space, typography, variant } from 'styled-system';

import { textTransform } from '../lib/styled-system-custom-properties';

const defaultRoundedStyleProps = {
  backgroundColor: 'black.100',
  maxHeight: '24px',
  display: 'inline-flex',
  alignItems: 'center',
  color: 'black.700',
  fontSize: '12px',
  lineHeight: '18px',
};

const TAG_TYPE_VARIANTS = {
  white: {
    backgroundColor: 'white.full',
    borderColor: 'black.200',
  },
  dark: {
    backgroundColor: 'black.800',
    borderColor: 'black.900',
    color: 'white.full',
  },
  grey: {
    backgroundColor: 'black.300',
    borderColor: 'black.300',
    color: 'black.900',
  },
  info: {
    backgroundColor: 'blue.100',
    borderColor: 'blue.400',
    color: 'blue.600',
  },
  success: {
    backgroundColor: 'green.100',
    borderColor: 'green.500',
    color: 'green.800',
  },
  warning: {
    backgroundColor: 'yellow.300',
    borderColor: 'yellow.500',
    color: 'yellow.900',
  },
  error: {
    backgroundColor: 'red.100',
    borderColor: 'red.500',
    color: 'red.500',
  },
};

const StyledTagBase = styled.div<{
  variant: 'squared' | 'rounded-right' | 'rounded-left' | 'rounded';
}>`
  text-align: center;
  white-space: nowrap;
  letter-spacing: 0.06em;
  position: relative;
  overflow: hidden;

  ${variant({
    prop: 'variant',
    variants: {
      squared: {
        color: 'black.700',
        background: '#F0F2F5',
        borderRadius: '4px',
        padding: '6px 8px',
        fontSize: '9px',
        lineHeight: '12px',
      },
      'rounded-right': {
        ...defaultRoundedStyleProps,
        borderRadius: '2px 12px 12px 2px',
        padding: '3px 10px 3px 6px',
      },
      'rounded-left': {
        ...defaultRoundedStyleProps,
        borderRadius: '12px 2px 2px 12px',
        padding: '3px 6px 3px 10px',
      },
      rounded: {
        ...defaultRoundedStyleProps,
        borderRadius: '12px 12px 12px 12px',
        padding: '3px 6px 3px 10px',
      },
    },
  })}

  & > * {
    vertical-align: middle;
  }

  ${variant({ prop: 'type', variants: TAG_TYPE_VARIANTS })}

  ${background}
  ${color}
  ${space}
  ${border}
  ${typography}
  ${layout}
  ${position}
  ${textTransform}
`;

const CloseButton = styled.button.attrs({
  type: 'button',
  'data-cy': 'remove-btn',
})<{
  isFocused?: boolean;
}>`
  cursor: pointer;
  text-align: center;
  padding: 0 2px 0 0;
  width: 20px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: colors 0.1s;
  border: none;
  line-height: inherit;
  color: ${props => (props.isFocused ? props.theme.colors.black[900] : props.theme.colors.black[500])};
  background-color: ${props => (props.isFocused ? props.theme.colors.black[300] : 'transparent')};
  &:hover,
  &:focus {
    color: ${props => props.theme.colors.black[900]};
    background-color: ${props => props.theme.colors.black[300]};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export interface StyledTagProps extends React.ComponentProps<typeof StyledTagBase> {
  closeButtonProps?: React.ComponentProps<typeof CloseButton> | boolean;
  /** If defined, a close button will be displayed on the tag */
  onClose?: (...args: unknown[]) => unknown;
  backgroundColor?: string;
  variant?: 'squared' | 'rounded-right' | 'rounded-left' | 'rounded';
  children?: React.ReactNode;
  type?: 'white' | 'dark' | 'grey' | 'info' | 'success' | 'warning' | 'error';
  htmlType?: 'button' | 'submit' | 'reset';
}

/**
 * Simple tag to display a short string
 *
 * @deprecated Use `ui/Badge` instead
 */
const StyledTag = ({ closeButtonProps = null, children, variant = 'squared', htmlType, ...props }: StyledTagProps) => {
  return !closeButtonProps ? (
    <StyledTagBase variant={variant} type={htmlType} {...props}>
      {children}
    </StyledTagBase>
  ) : (
    <StyledTagBase type={htmlType} variant={variant} {...props}>
      <span className="tracking-inherit mr-3">{children}</span>
      <CloseButton {...(closeButtonProps === true ? null : closeButtonProps)}>
        <Times size="12px" />
      </CloseButton>
    </StyledTagBase>
  );
};

export default StyledTag;
