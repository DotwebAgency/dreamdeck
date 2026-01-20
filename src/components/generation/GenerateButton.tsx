'use client';

import { useState, useCallback } from 'react';
import { Wand2, Zap, Plus, Layers, AlertCircle } from 'lucide-react';
import { useGenerationStore, useCanGenerate, useActiveJobCount, useQueueCapacityUsed, useQueueCapacityMax } from '@/store/useGenerationStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { COST_PER_IMAGE, MAX_QUEUED_JOBS } from '@/lib/constants';

export function GenerateButton() {
  const {
    prompt,
    resolution,
    numImages,
    mode,
    createJob,
  } = useGenerationStore();
  
  const canGenerate = useCanGenerate();
  const activeCount = useActiveJobCount();
  const queueUsed = useQueueCapacityUsed();
  const queueMax = useQueueCapacityMax();
  const [isAdding, setIsAdding] = useState(false);
  
  const isQueueFull = queueUsed >= queueMax;
  const hasPrompt = prompt.trim().length > 0;
  
  const handleGenerate = useCallback(() => {
    if (!hasPrompt) {
      toast({
        variant: 'destructive',
        title: 'Enter a prompt',
        description: 'Describe what you want to create',
      });
      return;
    }
    
    if (isQueueFull) {
      toast({
        variant: 'warning',
        title: 'Queue full',
        description: `Maximum ${MAX_QUEUED_JOBS} jobs allowed. Wait for some to complete.`,
      });
      return;
    }
    
    setIsAdding(true);
    
    const jobId = createJob();
    
    if (jobId) {
      const position = queueUsed + 1;
      toast({
        variant: 'success',
        title: activeCount > 0 ? `Added to queue (#${position})` : 'Generation started',
        description: `${resolution.width}×${resolution.height} • ${numImages} image${numImages > 1 ? 's' : ''}`,
      });
    }
    
    setTimeout(() => setIsAdding(false), 200);
  }, [hasPrompt, isQueueFull, createJob, queueUsed, activeCount, resolution, numImages]);

  const estimatedCost = numImages * COST_PER_IMAGE;
  const is4K = resolution.width >= 4000 || resolution.height >= 4000;

  return (
    <div className="space-y-4">
      {/* Generate button - Premium style */}
      <Button
        onClick={handleGenerate}
        disabled={!canGenerate}
        data-generate-button
        variant="premium"
        size="2xl"
        className={cn(
          'w-full relative overflow-hidden',
          isAdding && 'scale-[0.98]'
        )}
      >
        <span className="flex items-center gap-2">
          {activeCount > 0 ? (
            <>
              <Plus className="w-5 h-5" />
              <span>Add to Queue</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate</span>
            </>
          )}
          {numImages > 1 && (
            <span className="text-[var(--bg-void)]/60">({numImages})</span>
          )}
          {is4K && (
            <span 
              className={cn(
                'ml-1 px-1.5 py-0.5',
                'text-[10px] font-medium',
                'bg-amber-500/20 text-amber-600',
                'rounded-[var(--radius-xs)]'
              )}
            >
              4K
            </span>
          )}
          {mode === 'turbo' && (
            <Zap className="w-4 h-4 ml-1 text-amber-500" />
          )}
        </span>
        
        {/* Active job badge */}
        {activeCount > 0 && (
          <span 
            className={cn(
              'absolute top-2 right-2',
              'flex items-center gap-1',
              'px-2 py-0.5 rounded-full',
              'bg-[var(--bg-void)]/20 text-[var(--bg-void)]',
              'text-[10px] font-medium'
            )}
          >
            <Layers className="w-3 h-3" />
            {activeCount}
          </span>
        )}
      </Button>

      {/* Info row */}
      <div className="flex items-center justify-between text-[11px] text-[var(--text-subtle)]">
        <span className="tabular-nums">
          ~${estimatedCost.toFixed(3)} • {resolution.width}×{resolution.height}
        </span>
        <div className="flex items-center gap-3">
          {/* Queue capacity indicator */}
          {activeCount > 0 && (
            <span className={cn(
              'tabular-nums',
              isQueueFull && 'text-[var(--warning)]'
            )}>
              {queueUsed}/{queueMax} slots
            </span>
          )}
          <span className="flex items-center gap-1">
            <kbd 
              className={cn(
                'px-2 py-1',
                'rounded-[var(--radius-xs)]',
                'bg-[var(--bg-soft)]',
                'border border-[var(--border-default)]',
                'text-[var(--text-secondary)] font-mono text-[10px]',
                'shadow-[var(--shadow-xs)]'
              )}
            >
              ⌘
            </kbd>
            <span>+</span>
            <kbd 
              className={cn(
                'px-2 py-1',
                'rounded-[var(--radius-xs)]',
                'bg-[var(--bg-soft)]',
                'border border-[var(--border-default)]',
                'text-[var(--text-secondary)] font-mono text-[10px]',
                'shadow-[var(--shadow-xs)]'
              )}
            >
              ↵
            </kbd>
          </span>
        </div>
      </div>
      
      {/* Queue full warning */}
      {isQueueFull && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--warning-muted)] border border-[var(--warning)]/20">
          <AlertCircle className="w-4 h-4 text-[var(--warning)]" />
          <span className="text-[11px] text-[var(--warning)]">
            Queue full. Wait for jobs to complete.
          </span>
        </div>
      )}
    </div>
  );
}
