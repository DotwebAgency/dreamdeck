'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100]',
      'flex max-h-screen w-full flex-col-reverse p-4',
      'sm:flex-col md:max-w-[420px]',
      'safe-bottom',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  [
    'group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden',
    'rounded-[var(--radius-lg)] border p-4 pr-10',
    'shadow-[var(--shadow-xl)]',
    'transition-all duration-300',
    // Swipe
    'data-[swipe=cancel]:translate-x-0',
    'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
    'data-[swipe=move]:transition-none',
    // Animation
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[swipe=end]:animate-out',
    'data-[state=closed]:fade-out-80',
    'data-[state=open]:slide-in-from-bottom-full',
    'data-[state=closed]:slide-out-to-right-full',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'border-[var(--border-default)]',
          'bg-[var(--bg-elevated)]',
          'text-[var(--text-primary)]',
        ].join(' '),
        success: [
          'border-[var(--success)]/20',
          'bg-[var(--success-muted)]',
          'text-[var(--success)]',
        ].join(' '),
        destructive: [
          'border-[var(--error)]/20',
          'bg-[var(--error-muted)]',
          'text-[var(--error)]',
        ].join(' '),
        warning: [
          'border-[var(--warning)]/20',
          'bg-[var(--warning-muted)]',
          'text-[var(--warning)]',
        ].join(' '),
        info: [
          'border-[var(--info)]/20',
          'bg-[var(--info-muted)]',
          'text-[var(--info)]',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center',
      'rounded-[var(--radius-sm)] px-3',
      'border border-[var(--border-default)]',
      'bg-transparent',
      'text-[var(--text-sm)] font-medium text-[var(--text-secondary)]',
      'transition-all duration-150',
      'hover:bg-[var(--bg-hover)]',
      'focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]',
      'disabled:pointer-events-none disabled:opacity-50',
      // Variant-specific
      'group-[.success]:border-[var(--success)]/30 group-[.success]:text-[var(--success)]',
      'group-[.destructive]:border-[var(--error)]/30 group-[.destructive]:text-[var(--error)]',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2',
      'rounded-[var(--radius-sm)] p-1.5',
      'text-[var(--text-muted)]',
      'opacity-0 transition-all duration-150',
      'hover:text-[var(--text-primary)]',
      'focus:opacity-100 focus:outline-none',
      'focus:ring-2 focus:ring-[var(--border-focus)]',
      'group-hover:opacity-100',
      // Variant-specific
      'group-[.destructive]:text-[var(--error)]',
      'group-[.success]:text-[var(--success)]',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      'text-[var(--text-sm)] font-medium',
      'text-[var(--text-primary)]',
      'group-[.destructive]:text-[var(--error)]',
      'group-[.success]:text-[var(--success)]',
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
      'text-[var(--text-sm)]',
      'text-[var(--text-secondary)]',
      'group-[.destructive]:text-[var(--error)]/80',
      'group-[.success]:text-[var(--success)]/80',
      className
    )}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// Toast icon component for convenience
const ToastIcon = ({ variant }: { variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info' }) => {
  const icons = {
    default: null,
    success: <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />,
    destructive: <AlertCircle className="h-5 w-5 text-[var(--error)]" />,
    warning: <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />,
    info: <Info className="h-5 w-5 text-[var(--info)]" />,
  };
  return icons[variant || 'default'];
};

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
};
