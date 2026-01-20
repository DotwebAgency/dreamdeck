'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showValue?: boolean;
  unit?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showValue, unit = '', ...props }, ref) => (
  <div className="relative flex items-center gap-3 w-full">
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        'group',
        className
      )}
      {...props}
    >
      {/* Track - FLAT design */}
      <SliderPrimitive.Track 
        className={cn(
          'relative h-1 w-full grow overflow-hidden',
          'rounded-[var(--radius-full)]',
          'bg-[var(--bg-soft)]'
        )}
      >
        {/* Range - FLAT solid color */}
        <SliderPrimitive.Range 
          className={cn(
            'absolute h-full',
            'bg-[var(--text-muted)]',
            'group-hover:bg-[var(--text-secondary)]',
            'transition-colors duration-200'
          )} 
        />
      </SliderPrimitive.Track>
      
      {/* Thumb - FLAT solid */}
      <SliderPrimitive.Thumb 
        className={cn(
          'block h-4 w-4',
          'rounded-[var(--radius-xs)]',
          'bg-[var(--text-secondary)]',
          'border border-[var(--border-strong)]',
          'transition-all duration-150',
          // Hover
          'hover:bg-[var(--text-primary)]',
          'hover:scale-110',
          // Focus
          'focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-void)]',
          // Disabled
          'disabled:pointer-events-none disabled:opacity-50',
          // Cursor
          'cursor-grab active:cursor-grabbing',
          // Active state
          'active:scale-95'
        )} 
      />
    </SliderPrimitive.Root>
    
    {/* Value display */}
    {showValue && props.value !== undefined && (
      <span className={cn(
        'min-w-[48px] text-right',
        'text-[var(--text-xs)] font-mono',
        'text-[var(--text-secondary)]',
        'tabular-nums'
      )}>
        {Array.isArray(props.value) ? props.value[0] : props.value}{unit}
      </span>
    )}
  </div>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
