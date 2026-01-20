'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  ChevronUp, 
  History,
  RotateCcw,
  Trash2,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { triggerBalanceRefresh } from '@/lib/events';
import { COST_PER_IMAGE } from '@/lib/constants';

interface MobileBottomBarProps {
  onSettingsClick: () => void;
  onHistoryClick?: () => void;
}

export function MobileBottomBar({ onSettingsClick, onHistoryClick }: MobileBottomBarProps) {
  const {
    prompt,
    setPrompt,
    resolution,
    seed,
    numImages,
    mode,
    referenceSlots,
    isGenerating,
    setIsGenerating,
    addResults,
    results,
  } = useGenerationStore();

  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [lastSeed, setLastSeed] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (isGenerating) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGenerating]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt required',
        description: 'Please enter a prompt to generate images.',
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + Math.random() * 8;
        if (prev < 70) return prev + Math.random() * 5;
        if (prev < 90) return prev + Math.random() * 2;
        return prev;
      });
    }, 600);

    try {
      const validSlots = referenceSlots
        .map((slot, index) => ({ slot, index }))
        .filter((item) => item.slot !== null);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          width: resolution.width,
          height: resolution.height,
          seed: seed === -1 ? undefined : seed,
          num_images: numImages,
          mode,
          reference_images: validSlots.map((item) => ({
            url: item.slot!.url,
            priority: item.index,
          })),
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.images && data.images.length > 0) {
        const usedSeed = data.seed || seed;
        setLastSeed(usedSeed);

        const newResults = data.images.map((url: string, i: number) => ({
          id: `${Date.now()}-${i}`,
          url,
          prompt,
          width: resolution.width,
          height: resolution.height,
          seed: usedSeed,
          timestamp: Date.now(),
        }));

        addResults(newResults);

        toast({
          variant: 'success',
          title: `Generated ${data.images.length} image${data.images.length > 1 ? 's' : ''}`,
          description: `${resolution.width}×${resolution.height}`,
        });

        triggerBalanceRefresh();
      }
    } catch (err) {
      console.error('Generation error:', err);
      const message = err instanceof Error ? err.message : 'Generation failed';
      
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description: message,
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleRegenerate = () => {
    // Use the last seed for regeneration
    if (lastSeed !== null) {
      // Could set the seed in store here if needed
    }
    handleGenerate();
  };


  const handleClearAll = () => {
    setPrompt('');
    setShowActions(false);
  };

  const canGenerate = prompt.trim().length > 0 && !isGenerating;
  const hasResults = results.length > 0;
  const estimatedCost = numImages * COST_PER_IMAGE;

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
            ref={textareaRef}
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
              <Sparkles className="w-4 h-4" />
              Generate
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
              {hasResults && (
              <button
                onClick={() => {
                  // Use last used settings (prompt, resolution, etc)
                  setShowActions(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3.5',
                  'text-[13px] text-[var(--text-secondary)]',
                  'hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]',
                  'border-b border-[var(--border-subtle)]',
                  'rounded-t-xl'
                )}
              >
                <RotateCcw className="w-4 h-4" />
                Regenerate with Same Seed
              </button>
            )}
            {!hasResults && (
              <div className="h-0" /> // Ensure first visible item gets rounded corners
            )}
            <button
              onClick={onHistoryClick}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3.5',
                'text-[13px] text-[var(--text-secondary)]',
                'hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]',
                'border-b border-[var(--border-subtle)]'
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
            onClick={hasResults && !isGenerating ? handleRegenerate : handleGenerate}
            disabled={!canGenerate}
            className={cn(
              'relative h-12 px-5 rounded-lg',
              'font-medium text-[13px]',
              'flex items-center justify-center gap-2',
              'touch-target',
              'transition-all duration-150',
              'active:scale-[0.97]',
              'overflow-hidden',
              // Theme-aware gradients
              canGenerate
                ? 'dark:bg-gradient-to-b dark:from-[#f0f2f5] dark:via-[#e0e4ea] dark:to-[#c5cad5] dark:text-[#08080c] light:bg-gradient-to-b light:from-[#1a1a1a] light:via-[#2d2d2d] light:to-[#404040] light:text-white shadow-lg'
                : 'bg-[var(--bg-soft)] text-[var(--text-muted)] cursor-not-allowed'
            )}
            style={{
              background: canGenerate 
                ? 'linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 100%)'
                : undefined
            }}
          >
            {/* Progress overlay */}
            {isGenerating && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[var(--accent-brand)]/20 to-transparent"
                style={{ width: `${progress}%` }}
              />
            )}
            
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-mono text-[12px]">{formatTime(elapsedTime)}</span>
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
