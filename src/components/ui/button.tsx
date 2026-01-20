'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    // Base styles
    'relative inline-flex items-center justify-center gap-2',
    'font-medium tracking-wide whitespace-nowrap',
    'select-none cursor-pointer touch-response touch-target',
    // Transitions
    'transition-all duration-150',
    // Focus
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-void)]',
    // Disabled
    'disabled:pointer-events-none disabled:opacity-40',
    // Overflow for ripple
    'overflow-hidden',
  ].join(' '),
  {
    variants: {
      variant: {
        // FLAT UI — Solid colors, no gradients
        default: [
          'bg-[var(--text-primary)]',
          'text-[var(--bg-void)]',
          // Hover
          'hover:bg-[var(--text-secondary)]',
          // Active
          'active:scale-[0.98]',
        ].join(' '),
        secondary: [
          'bg-[var(--bg-elevated)]',
          'text-[var(--text-secondary)]',
          'border border-[var(--border-default)]',
          // Hover
          'hover:bg-[var(--bg-hover)]',
          'hover:text-[var(--text-primary)]',
          'hover:border-[var(--border-strong)]',
          // Active
          'active:bg-[var(--bg-active)]',
          'active:scale-[0.98]',
        ].join(' '),
        ghost: [
          'bg-transparent',
          'text-[var(--text-muted)]',
          // Hover
          'hover:bg-[var(--bg-hover)]',
          'hover:text-[var(--text-primary)]',
          // Active
          'active:bg-[var(--bg-active)]',
          'active:scale-[0.98]',
        ].join(' '),
        outline: [
          'bg-transparent',
          'text-[var(--text-secondary)]',
          'border border-[var(--border-default)]',
          // Hover
          'hover:bg-[var(--bg-deep)]',
          'hover:border-[var(--border-strong)]',
          'hover:text-[var(--text-primary)]',
          // Active
          'active:bg-[var(--bg-mid)]',
        ].join(' '),
        destructive: [
          'bg-[var(--error)]',
          'text-white',
          // Hover
          'hover:bg-[var(--error)]/90',
          // Active
          'active:scale-[0.98]',
        ].join(' '),
        success: [
          'bg-[var(--success)]',
          'text-[var(--bg-void)]',
          // Hover
          'hover:bg-[var(--success)]/90',
          // Active
          'active:scale-[0.98]',
        ].join(' '),
        link: [
          'bg-transparent',
          'text-[var(--text-muted)]',
          'underline-offset-4',
          // Hover
          'hover:text-[var(--text-primary)]',
          'hover:underline',
        ].join(' '),
        premium: [
          // FLAT — Solid colors, no gradients
          // Dark mode: light solid
          'dark:bg-[#E8EAED]',
          'dark:text-[#08080c]',
          'dark:hover:bg-white',
          // Light mode: dark solid
          'bg-[#1a1a1a]',
          'text-white',
          'hover:bg-[#2a2a2a]',
          // Common
          'font-medium',
          // Active
          'active:scale-[0.97]',
        ].join(' '),
      },
      size: {
        xs: 'h-7 px-2 text-[11px] rounded-[var(--radius-xs)]',
        sm: 'h-8 px-3 text-[12px] rounded-[var(--radius-sm)]',
        default: 'h-10 px-4 text-[13px] rounded-[var(--radius-sm)]',
        lg: 'h-11 px-5 text-[14px] rounded-[var(--radius-md)]',
        xl: 'h-12 px-6 text-[15px] rounded-[var(--radius-md)]',
        '2xl': 'h-14 px-8 text-[16px] rounded-[var(--radius-lg)]',
        icon: 'h-10 w-10 p-0 rounded-[var(--radius-sm)]',
        'icon-xs': 'h-7 w-7 p-0 rounded-[var(--radius-xs)]',
        'icon-sm': 'h-8 w-8 p-0 rounded-[var(--radius-sm)]',
        'icon-lg': 'h-11 w-11 p-0 rounded-[var(--radius-md)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Ripple effect hook
function useRipple() {
  const [ripples, setRipples] = React.useState<
    Array<{ x: number; y: number; id: number }>
  >([]);

  const addRipple = React.useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  return { ripples, addRipple };
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ripple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, onClick, children, ...props }, ref) => {
    const { ripples, addRipple } = useRipple();
    const Comp = asChild ? Slot : 'button';

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && variant !== 'link' && variant !== 'ghost') {
        addRipple(e);
      }
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
        {/* Ripple effects */}
        {ripple && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-current opacity-20 animate-[ripple_0.6s_ease-out]"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
              width: '200%',
              paddingBottom: '200%',
            }}
          />
        ))}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
