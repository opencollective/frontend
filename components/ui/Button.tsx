import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { mergeRefs } from '../../lib/react-utils';
import { cn } from '../../lib/utils';

import StyledSpinner from '../StyledSpinner';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        outlineDestructive:
          'border border-destructive bg-background text-destructive hover:bg-destructive hover:text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        approve: 'bg-green-600 text-green-900 hover:bg-green-600/90',
        outlineApprove:
          'border border-green-600 bg-background text-green-600 hover:bg-green-600/90 hover:text-primary-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        xs: 'h-8 px-2.5 tracking-tight',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8 text-lg',
        xl: 'h-14 rounded-lg px-8 text-xl',
        icon: 'h-10 w-10',
        'icon-xs': 'h-8 w-8',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, onClick, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const allRefs = mergeRefs([ref, internalRef]);
    const baseSize = React.useMemo(() => {
      if (loading) {
        return {
          width: internalRef.current?.offsetWidth,
          height: internalRef.current?.offsetHeight,
        };
      }
    }, [loading]);
    const realChildren = loading ? (
      <span>
        <StyledSpinner size={16} />
      </span>
    ) : (
      children
    );
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={allRefs}
        {...props}
        type={props.type === 'submit' && loading ? 'button' : props.type || 'button'}
        onClick={loading || props.disabled ? null : onClick}
        style={!loading ? undefined : { width: baseSize?.width, height: baseSize?.height }}
      >
        {realChildren}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
