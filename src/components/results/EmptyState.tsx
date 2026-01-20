'use client';

import { Wand2, ImagePlus, Settings2, Loader2 } from 'lucide-react';
import { OrbitAnimation } from '@/components/ui/orbit-animation';
import { cn } from '@/lib/utils';
import { useActiveJobCount, useProcessingJobCount, useQueuedJobCount } from '@/store/useGenerationStore';

export function EmptyState() {
  const activeJobCount = useActiveJobCount();
  const processingCount = useProcessingJobCount();
  const queuedCount = useQueuedJobCount();
  
  // If jobs are active, show processing state instead
  if (activeJobCount > 0) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center',
          'min-h-[calc(100vh-56px-80px)]',
          'p-8',
          'animate-fade-in'
        )}
      >
        <div className="text-center max-w-lg w-full">
          {/* Processing animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <OrbitAnimation size="lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Status */}
          <h2 
            className={cn(
              'text-xl font-medium tracking-tight',
              'text-[var(--text-primary)]',
              'mb-3'
            )}
          >
            Creating your images
          </h2>

          <p 
            className={cn(
              'text-[13px] leading-relaxed',
              'text-[var(--text-muted)]',
              'mb-6 max-w-sm mx-auto'
            )}
          >
            {processingCount > 0 && `${processingCount} generating`}
            {processingCount > 0 && queuedCount > 0 && ' • '}
            {queuedCount > 0 && `${queuedCount} in queue`}
          </p>

          {/* Tip */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-soft)] border border-[var(--border-subtle)]">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-[12px] text-[var(--text-secondary)]">
              You can add more jobs while these process
            </span>
          </div>
        </div>
      </div>
    );
  }
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
