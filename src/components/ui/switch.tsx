'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center',
      'rounded-[var(--radius-full)]',
      'border-2 border-transparent',
      'bg-[var(--bg-soft)]',
      'shadow-[var(--inset-sm)]',
      'transition-all duration-200',
      // Focus
      'focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-void)]',
      // Disabled
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Checked state
      'data-[state=checked]:bg-[var(--accent-secondary)]',
      'data-[state=checked]:shadow-[var(--glow-sm)]',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5',
        'rounded-[var(--radius-full)]',
        'bg-[var(--text-muted)]',
        'shadow-[var(--shadow-sm)]',
        'transition-all duration-200',
        // Movement
        'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        // Color change
        'data-[state=checked]:bg-[var(--text-primary)]',
        'data-[state=checked]:shadow-[var(--shadow-md)]'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
