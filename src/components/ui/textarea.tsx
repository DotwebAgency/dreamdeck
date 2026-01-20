'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'ghost';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    // FLAT UI — No shadows or glows
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
        // Focus
        'focus:bg-[var(--bg-deep)]',
        'focus:border-[var(--border-default)]',
      ].join(' '),
    };

    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full px-4 py-3',
          'text-[var(--text-base)] text-[var(--text-primary)]',
          'leading-relaxed',
          'rounded-[var(--radius-md)]',
          'placeholder:text-[var(--text-subtle)]',
          'resize-none',
          'transition-all duration-150',
          'focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
