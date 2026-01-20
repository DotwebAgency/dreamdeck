'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'elevated' | 'glass' | 'outlined';
    interactive?: boolean;
  }
>(({ className, variant = 'default', interactive = false, ...props }, ref) => {
  // FLAT UI — No shadows on cards, borders only
  const variants = {
    default: [
      'bg-[var(--bg-elevated)]',
      'border border-[var(--border-default)]',
    ].join(' '),
    elevated: [
      'bg-[var(--bg-elevated)]',
      'border border-[var(--border-strong)]',
    ].join(' '),
    glass: [
      'bg-[var(--surface-glass)]',
      'border border-[var(--border-default)]',
      'backdrop-blur-sm',
    ].join(' '),
    outlined: [
      'bg-transparent',
      'border border-[var(--border-default)]',
    ].join(' '),
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden',
        'rounded-[var(--radius-lg)]',
        'transition-all duration-200',
        variants[variant],
        // Interactive hover effect (flat — border change only)
        interactive && [
          'cursor-pointer',
          'hover:border-[var(--border-strong)]',
          'hover:bg-[var(--bg-hover)]',
          'active:bg-[var(--bg-active)]',
          'active:scale-[0.99]',
        ].join(' '),
        className
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col gap-1.5 p-6',
      'border-b border-[var(--border-subtle)]',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-[var(--text-sm)] font-medium uppercase tracking-[var(--tracking-caps)]',
      'text-[var(--text-secondary)]',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-[var(--text-sm)]',
      'text-[var(--text-muted)]',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn('p-6', className)} 
    {...props} 
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-2 p-6 pt-0',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
