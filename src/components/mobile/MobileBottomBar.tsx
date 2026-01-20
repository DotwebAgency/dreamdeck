'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  ChevronUp, 
  History,
  Trash2,
  MoreHorizontal,
  X,
  Plus,
  Layers
} from 'lucide-react';
import { useGenerationStore, useCanGenerate, useActiveJobCount, useQueueCapacity } from '@/store/useGenerationStore';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { COST_PER_IMAGE, MAX_QUEUED_JOBS } from '@/lib/constants';

interface MobileBottomBarProps {
  onSettingsClick: () => void;
  onHistoryClick?: () => void;
}

export function MobileBottomBar({ onSettingsClick, onHistoryClick }: MobileBottomBarProps) {
  const {
    prompt,
    setPrompt,
    resolution,
    numImages,
    createJob,
    results,
  } = useGenerationStore();

  const canGenerate = useCanGenerate();
  const activeJobCount = useActiveJobCount();
  const queueCapacity = useQueueCapacity();
  
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [lastSeed, setLastSeed] = useState<number | null>(null);
  
  const isQueueFull = queueCapacity.used >= queueCapacity.max;

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt required',
        description: 'Please enter a prompt to generate images.',
      });
      return;
    }
    
    if (isQueueFull) {
      toast({
        variant: 'warning',
        title: 'Queue full',
        description: `Maximum ${MAX_QUEUED_JOBS} jobs allowed.`,
      });
      return;
    }

    const jobId = createJob();
    
    if (jobId) {
      const position = queueCapacity.used + 1;
      toast({
        variant: 'success',
        title: activeJobCount > 0 ? `Queued (#${position})` : 'Generating',
        description: `${resolution.width}×${resolution.height} • ${numImages} image${numImages > 1 ? 's' : ''}`,
      });
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleClearAll = () => {
    setPrompt('');
    setShowActions(false);
  };

  const hasResults = results.length > 0;
  const activeCount = activeJobCount;
  const estimatedCost = numImages * COST_PER_IMAGE;
  const isQueueActive = activeCount > 0;

  return (
    <>
      {/* Expanded Prompt Overlay */}
      {isPromptExpanded && (
        <div 
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
          onClick={() => setIsPromptExpanded(false)}
        />
      )}

      {/* Expanded Prompt Sheet */}
      <div
        className={cn(
          'fixed left-0 right-0 z-[80] transition-all duration-300',
          'bg-[var(--bg-elevated)] border-t border-[var(--border-default)]',
          'rounded-t-2xl shadow-2xl',
          isPromptExpanded
            ? 'bottom-0 max-h-[60vh]'
            : '-bottom-full'
        )}
      >
        <div className="p-4 pb-safe">
          {/* Handle */}
          <div className="w-10 h-1 bg-[var(--border-strong)] rounded-full mx-auto mb-4" />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Prompt
            </span>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-[10px] tabular-nums',
                prompt.length > 1800 ? 'text-[var(--error)]' : 
                prompt.length > 1500 ? 'text-[var(--warning)]' : 
                'text-[var(--text-muted)]'
              )}>
                {prompt.length}/2000
              </span>
              <button
                onClick={() => setIsPromptExpanded(false)}
                className="p-2 -m-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your image in detail..."
            className={cn(
              'w-full h-40 p-4',
              'bg-[var(--bg-deep)]',
              'border border-[var(--border-default)]',
              'rounded-lg',
              'text-[14px] text-[var(--text-primary)]',
              'placeholder:text-[var(--text-subtle)]',
              'resize-none',
              'focus:outline-none focus:border-[var(--border-focus)]',
              'transition-colors'
            )}
            maxLength={2000}
            autoFocus
          />

          {/* Actions */}
          <div className="flex items-center justify-between mt-3">
            {prompt.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--error)]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={() => {
                setIsPromptExpanded(false);
                if (canGenerate) handleGenerate();
              }}
              disabled={!canGenerate}
              className={cn(
                'ml-auto px-5 py-2.5 rounded-lg',
                'text-[13px] font-medium',
                'flex items-center gap-2',
                'transition-all duration-150',
                canGenerate
                  ? 'bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] text-[var(--bg-void)] shadow-lg active:scale-[0.97]'
                  : 'bg-[var(--bg-soft)] text-[var(--text-muted)] cursor-not-allowed'
              )}
            >
              {isQueueActive ? <Plus className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {isQueueActive ? 'Add to Queue' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Sheet */}
      {showActions && (
        <>
          <div 
            className="fixed inset-0 z-[60]"
            onClick={() => setShowActions(false)}
          />
          <div className={cn(
            'fixed left-4 right-4 z-[65]',
            'bottom-[calc(80px+env(safe-area-inset-bottom)+8px)]',
            'bg-[var(--bg-elevated)]',
            'border border-[var(--border-default)]',
            'rounded-xl shadow-2xl',
            'animate-scale-in'
          )}>
            <button
              onClick={onHistoryClick}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3.5',
                'text-[13px] text-[var(--text-secondary)]',
                'hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]',
                'border-b border-[var(--border-subtle)]',
                'rounded-t-xl'
              )}
            >
              <History className="w-4 h-4" />
              Prompt History
            </button>
            <button
              onClick={handleClearAll}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3.5',
                'text-[13px] text-[var(--error)]',
                'hover:bg-[var(--error-muted)] active:bg-[var(--error-muted)]',
                'rounded-b-xl'
              )}
            >
              <Trash2 className="w-4 h-4" />
              Clear Prompt
            </button>
          </div>
        </>
      )}

      {/* Bottom Bar */}
      <div 
        className={cn(
          'fixed left-0 right-0 bottom-0 z-50',
          'bg-[var(--bg-deep)]/98 backdrop-blur-xl',
          'border-t border-[var(--border-default)]',
          'safe-bottom'
        )}
      >
        <div className="flex items-center gap-2 px-3 py-3">
          {/* Prompt Preview / Expand */}
          <button
            onClick={() => setIsPromptExpanded(true)}
            className={cn(
              'flex-1 flex items-center gap-2 px-3 py-2.5 h-12',
              'bg-[var(--bg-mid)]',
              'border border-[var(--border-default)]',
              'rounded-lg',
              'text-left',
              'touch-target',
              'transition-colors',
              'hover:border-[var(--border-strong)]'
            )}
          >
            <div className="flex-1 min-w-0">
              {prompt ? (
                <span className="text-[13px] text-[var(--text-secondary)] line-clamp-1">
                  {prompt}
                </span>
              ) : (
                <span className="text-[13px] text-[var(--text-muted)] italic">
                  Tap to write prompt...
                </span>
              )}
            </div>
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          </button>

          {/* Generate Button */}
          <button
            onClick={hasResults && !isQueueActive ? handleRegenerate : handleGenerate}
            disabled={!canGenerate}
            className={cn(
              'relative h-12 px-5 rounded-lg',
              'font-medium text-[13px]',
              'flex items-center justify-center gap-2',
              'touch-target',
              'transition-all duration-150',
              'active:scale-[0.97]',
              'overflow-hidden',
              canGenerate
                ? 'shadow-lg'
                : 'bg-[var(--bg-soft)] text-[var(--text-muted)] cursor-not-allowed'
            )}
            style={{
              background: canGenerate 
                ? 'linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 100%)'
                : undefined,
              color: canGenerate ? 'var(--bg-void)' : undefined
            }}
          >
            {isQueueActive ? (
              <>
                <Plus className="w-4 h-4" />
                <span>Queue</span>
                <span className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-[var(--bg-void)]/20 text-[10px]">
                  <Layers className="w-3 h-3" />
                  {activeCount}
                </span>
              </>
            ) : hasResults ? (
              <>
                <RefreshCw className="w-4 h-4" />
                <span className="hidden xs:inline">Regenerate</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate</span>
              </>
            )}
          </button>

          {/* Quick Actions */}
          <button
            onClick={() => setShowActions(!showActions)}
            className={cn(
              'h-12 w-12 flex items-center justify-center',
              'bg-[var(--bg-mid)]',
              'border border-[var(--border-default)]',
              'rounded-lg',
              'text-[var(--text-muted)]',
              'touch-target',
              'transition-colors',
              'hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]',
              showActions && 'border-[var(--border-strong)] text-[var(--text-secondary)]'
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Cost estimate */}
        {canGenerate && (
          <div className="px-4 pb-2 -mt-1">
            <span className="text-[10px] text-[var(--text-subtle)] tabular-nums">
              ~${estimatedCost.toFixed(3)} • {resolution.width}×{resolution.height}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
