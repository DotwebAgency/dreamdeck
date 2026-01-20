'use client';

import { Wand2, ImagePlus, Settings2, Loader2, Sparkles, Type, Sliders, Image as ImageIcon } from 'lucide-react';
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
          'p-6 sm:p-8',
          'animate-fade-in'
        )}
      >
        <div className="text-center max-w-lg w-full">
          {/* Processing animation */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <OrbitAnimation size="lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Monochrome pulse indicator */}
                <div className="w-3 h-3 rounded-full bg-[var(--text-secondary)] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Status */}
          <h2 
            className={cn(
              'text-lg sm:text-xl font-medium tracking-tight',
              'text-[var(--text-primary)]',
              'mb-2 sm:mb-3'
            )}
          >
            Creating your images
          </h2>

          <p 
            className={cn(
              'text-[13px] leading-relaxed',
              'text-[var(--text-muted)]',
              'mb-4 sm:mb-6 max-w-sm mx-auto'
            )}
          >
            {processingCount > 0 && `${processingCount} generating`}
            {processingCount > 0 && queuedCount > 0 && ' • '}
            {queuedCount > 0 && `${queuedCount} in queue`}
          </p>

          {/* Tip - monochrome styling */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-soft)] border border-[var(--border-subtle)]">
            <Loader2 className="w-4 h-4 text-[var(--text-secondary)] animate-spin" />
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
        'min-h-[calc(100vh-56px-80px)]',
        'p-4 sm:p-8',
        'animate-fade-in'
      )}
    >
      <div className="text-center w-full max-w-lg">
        {/* Mobile: Simple icon, Desktop: Orbit animation */}
        <div className="flex justify-center mb-6 sm:mb-8">
          {/* Mobile version - simpler */}
          <div className="sm:hidden">
            <div className={cn(
              'w-20 h-20 rounded-2xl',
              'bg-gradient-to-br from-[var(--bg-soft)] to-[var(--bg-deep)]',
              'border border-[var(--border-subtle)]',
              'flex items-center justify-center',
              'shadow-lg'
            )}>
              <Sparkles className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
          </div>
          {/* Desktop version - orbit animation */}
          <div className="hidden sm:block">
            <OrbitAnimation size="lg" />
          </div>
        </div>

        {/* Title */}
        <h2 
          className={cn(
            'text-lg sm:text-xl font-medium tracking-tight',
            'text-[var(--text-primary)]',
            'mb-2 sm:mb-3'
          )}
        >
          Ready to create
        </h2>

        {/* Description - shorter on mobile */}
        <p 
          className={cn(
            'text-[13px] leading-relaxed',
            'text-[var(--text-muted)]',
            'mb-6 sm:mb-8 max-w-sm mx-auto px-4 sm:px-0'
          )}
        >
          <span className="sm:hidden">Write a prompt below to generate images</span>
          <span className="hidden sm:inline">Describe your vision in the prompt field and generate stunning images. Add references to guide the style.</span>
        </p>

        {/* Mobile: Simplified single-column steps */}
        <div className="sm:hidden px-2">
          <div className="flex flex-col gap-3">
            {[
              { icon: Type, label: 'Write prompt', desc: 'Describe what you want' },
              { icon: Sliders, label: 'Pick resolution', desc: 'Choose image size' },
              { icon: ImageIcon, label: 'Generate', desc: 'Create your images' },
            ].map((step, i) => (
              <div 
                key={i}
                className={cn(
                  'flex items-center gap-4 p-4',
                  'bg-[var(--bg-deep)]',
                  'rounded-xl',
                  'border border-[var(--border-subtle)]'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex-shrink-0',
                  'bg-[var(--bg-soft)]',
                  'flex items-center justify-center',
                  'text-[var(--text-muted)]'
                )}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-[13px] font-medium text-[var(--text-primary)]">
                    {step.label}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {step.desc}
                  </div>
                </div>
                <div className={cn(
                  'ml-auto w-6 h-6 rounded-full',
                  'bg-[var(--bg-soft)]',
                  'flex items-center justify-center',
                  'text-[10px] font-medium text-[var(--text-subtle)]'
                )}>
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Original 3-column grid */}
        <div className="hidden sm:grid grid-cols-3 gap-3 text-left stagger-children">
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

        {/* Keyboard shortcut - desktop only */}
        <div className="hidden sm:block mt-8 pt-5 border-t border-[var(--border-subtle)]">
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

        {/* Mobile: Simple tap instruction */}
        <div className="sm:hidden mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <p className="text-[11px] text-[var(--text-subtle)]">
            Tap the prompt bar below to get started
          </p>
        </div>
      </div>
    </div>
  );
}
