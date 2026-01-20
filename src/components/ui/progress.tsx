'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: 'default' | 'gradient' | 'success' | 'error';
  showGlow?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = 'default', showGlow = false, ...props }, ref) => {
  const variants = {
    default: 'bg-gradient-to-r from-[var(--text-secondary)] to-[var(--text-primary)]',
    gradient: 'bg-gradient-to-r from-[var(--accent-secondary)] via-[var(--accent-primary)] to-[var(--accent-secondary)]',
    success: 'bg-gradient-to-r from-neutral-500 to-neutral-400',
    error: 'bg-gradient-to-r from-[var(--error)] to-red-300',
  };

  const isComplete = value === 100;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-1.5 w-full overflow-hidden',
        'rounded-[var(--radius-full)]',
        'bg-[var(--bg-soft)]',
        showGlow && 'shadow-[var(--glow-sm)]',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1',
          variants[variant],
          'transition-transform duration-500 ease-out',
          // Shimmer effect when in progress
          !isComplete && 'relative overflow-hidden',
          !isComplete && 'after:absolute after:inset-0 after:bg-[var(--gradient-shimmer)] after:animate-[shimmer_1.5s_infinite]'
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
      {/* Glow effect at progress tip */}
      {showGlow && value && value > 0 && value < 100 && (
        <div
          className={cn(
            'absolute top-0 h-full w-4',
            'bg-gradient-to-r from-transparent to-white/20',
            'blur-sm',
            'transition-all duration-500 ease-out'
          )}
          style={{ left: `calc(${value}% - 8px)` }}
        />
      )}
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
