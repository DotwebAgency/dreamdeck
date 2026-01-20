'use client';

import { Wand2, ImagePlus, Settings2 } from 'lucide-react';
import { OrbitAnimation } from '@/components/ui/orbit-animation';
import { cn } from '@/lib/utils';

export function EmptyState() {
  return (
    <div 
      className={cn(
        'flex items-center justify-center',
        'min-h-[calc(100vh-56px-80px)]', // viewport - header - reference rack
        'p-8',
        'animate-fade-in'
      )}
    >
      <div className="text-center max-w-lg w-full">
        {/* Jarvis-style animated orbit */}
        <div className="flex justify-center mb-8">
          <OrbitAnimation size="lg" />
        </div>

        {/* Title - properly sized for SaaS */}
        <h2 
          className={cn(
            'text-xl font-medium tracking-tight',
            'text-[var(--text-primary)]',
            'mb-3'
          )}
        >
          Ready to create
        </h2>

        {/* Description */}
        <p 
          className={cn(
            'text-[13px] leading-relaxed',
            'text-[var(--text-muted)]',
            'mb-8 max-w-sm mx-auto'
          )}
        >
          Describe your vision in the prompt field and generate stunning images. 
          Add references to guide the style.
        </p>

        {/* Quick tips with staggered animation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left stagger-children">
          <div 
            className={cn(
              'p-3.5 rounded-lg',
              'bg-[var(--bg-deep)]',
              'border border-[var(--border-subtle)]',
              'shadow-sm',
              'transition-all duration-200',
              'hover:border-[var(--border-default)]',
              'hover:shadow-md',
              'group'
            )}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div 
                className={cn(
                  'w-7 h-7 rounded flex items-center justify-center',
                  'bg-[var(--bg-soft)]',
                  'text-[var(--text-muted)]',
                  'transition-colors duration-200',
                  'group-hover:text-[var(--text-secondary)]'
                )}
              >
                <Wand2 className="w-3.5 h-3.5" />
              </div>
              <span 
                className={cn(
                  'text-[10px] font-medium uppercase tracking-[0.08em]',
                  'text-[var(--text-subtle)]'
                )}
              >
                Step 1
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Write a detailed prompt
            </p>
          </div>

          <div 
            className={cn(
              'p-3.5 rounded-lg',
              'bg-[var(--bg-deep)]',
              'border border-[var(--border-subtle)]',
              'shadow-sm',
              'transition-all duration-200',
              'hover:border-[var(--border-default)]',
              'hover:shadow-md',
              'group'
            )}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div 
                className={cn(
                  'w-7 h-7 rounded flex items-center justify-center',
                  'bg-[var(--bg-soft)]',
                  'text-[var(--text-muted)]',
                  'transition-colors duration-200',
                  'group-hover:text-[var(--text-secondary)]'
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </div>
              <span 
                className={cn(
                  'text-[10px] font-medium uppercase tracking-[0.08em]',
                  'text-[var(--text-subtle)]'
                )}
              >
                Step 2
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Choose your resolution
            </p>
          </div>

          <div 
            className={cn(
              'p-3.5 rounded-lg',
              'bg-[var(--bg-deep)]',
              'border border-[var(--border-subtle)]',
              'shadow-sm',
              'transition-all duration-200',
              'hover:border-[var(--border-default)]',
              'hover:shadow-md',
              'group'
            )}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div 
                className={cn(
                  'w-7 h-7 rounded flex items-center justify-center',
                  'bg-[var(--bg-soft)]',
                  'text-[var(--text-muted)]',
                  'transition-colors duration-200',
                  'group-hover:text-[var(--text-secondary)]'
                )}
              >
                <ImagePlus className="w-3.5 h-3.5" />
              </div>
              <span 
                className={cn(
                  'text-[10px] font-medium uppercase tracking-[0.08em]',
                  'text-[var(--text-subtle)]'
                )}
              >
                Step 3
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Click Generate
            </p>
          </div>
        </div>

        {/* Keyboard shortcut */}
        <div className="mt-8 pt-5 border-t border-[var(--border-subtle)]">
          <p className="text-[12px] text-[var(--text-subtle)]">
            Pro tip: Press{' '}
            <kbd 
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 mx-0.5',
                'rounded',
                'bg-[var(--bg-soft)]',
                'border border-[var(--border-default)]',
                'text-[var(--text-secondary)] font-mono text-[10px]',
                'shadow-sm'
              )}
            >
              ⌘
            </kbd>
            {' + '}
            <kbd 
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 mx-0.5',
                'rounded',
                'bg-[var(--bg-soft)]',
                'border border-[var(--border-default)]',
                'text-[var(--text-secondary)] font-mono text-[10px]',
                'shadow-sm'
              )}
            >
              Enter
            </kbd>
            {' '}to generate instantly
          </p>
        </div>
      </div>
    </div>
  );
}
