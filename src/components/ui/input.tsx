'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'ghost' | 'outline';
  inputSize?: 'sm' | 'default' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', inputSize = 'default', ...props }, ref) => {
    // FLAT UI — No shadows or glows on inputs
    const variants = {
      default: [
        'bg-[var(--bg-deep)]',
        'border border-[var(--border-default)]',
        // Hover
        'hover:border-[var(--border-strong)]',
        // Focus
        'focus:border-[var(--border-focus)]',
        'focus:bg-[var(--bg-mid)]',
      ].join(' '),
      ghost: [
        'bg-transparent',
        'border border-transparent',
        // Hover
        'hover:bg-[var(--bg-deep)]',
        // Focus
        'focus:bg-[var(--bg-deep)]',
        'focus:border-[var(--border-default)]',
      ].join(' '),
      outline: [
        'bg-transparent',
        'border border-[var(--border-default)]',
        // Hover
        'hover:border-[var(--border-strong)]',
        // Focus
        'focus:border-[var(--border-focus)]',
      ].join(' '),
    };

    const sizes = {
      sm: 'h-8 px-3 text-[12px] rounded-[var(--radius-xs)]',
      default: 'h-10 px-4 text-[14px] rounded-[var(--radius-sm)]',
      lg: 'h-12 px-5 text-[15px] rounded-[var(--radius-md)]',
    };

    return (
      <input
        type={type}
        className={cn(
          'flex w-full',
          'text-[var(--text-primary)]',
          'placeholder:text-[var(--text-subtle)]',
          'transition-all duration-150',
          'focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          variants[variant],
          sizes[inputSize],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
