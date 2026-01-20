'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles, Zap, Clock, AlertCircle } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { COST_PER_IMAGE } from '@/lib/constants';
import { triggerBalanceRefresh } from '@/lib/events';

export function GenerateButton() {
  const {
    prompt,
    resolution,
    seed,
    numImages,
    mode,
    referenceSlots,
    isGenerating,
    setIsGenerating,
    addResults,
  } = useGenerationStore();

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showError, setShowError] = useState(false);
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGenerating]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setShowError(false);
    setProgress(0);

    // Simulate progress with more realistic timing
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + Math.random() * 8;
        if (prev < 70) return prev + Math.random() * 5;
        if (prev < 90) return prev + Math.random() * 2;
        return prev;
      });
    }, 600);

    try {
      // Filter out null slots and prepare images
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

      // Add results to store
      if (data.images && data.images.length > 0) {
        const newResults = data.images.map((url: string, i: number) => ({
          id: `${Date.now()}-${i}`,
          url,
          prompt,
          width: resolution.width,
          height: resolution.height,
          seed: data.seed || seed,
          timestamp: Date.now(),
        }));

        addResults(newResults);

        // Success toast
        toast({
          variant: 'success',
          title: `Generated ${data.images.length} image${data.images.length > 1 ? 's' : ''}`,
          description: `${resolution.width}×${resolution.height} • Seed: ${data.seed || 'random'}`,
        });

        // ✅ Trigger balance refresh after successful generation
        triggerBalanceRefresh();
      }
    } catch (err) {
      console.error('Generation error:', err);
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      setShowError(true);
      
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

  const canGenerate = prompt.trim().length > 0 && !isGenerating;
  const estimatedCost = numImages * COST_PER_IMAGE;
  const is4K = resolution.width >= 4000 || resolution.height >= 4000;

  return (
    <div className="space-y-4">
      {/* Progress bar with dramatic animation */}
      {isGenerating && (
        <div className="space-y-3">
          <Progress value={progress} variant="gradient" showGlow />
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">{formatTime(elapsedTime)}</span>
            </span>
            <span className="animate-pulse">
              {progress < 30
                ? 'Initializing model...'
                : progress < 70
                  ? 'Creating your vision...'
                  : 'Almost there...'}
            </span>
          </div>
        </div>
      )}

      {/* Error message with shake animation */}
      {error && showError && (
        <div 
          className={cn(
            'px-4 py-3 rounded-[var(--radius-md)]',
            'bg-[var(--error-muted)] border border-[var(--error)]/30',
            'animate-shake'
          )}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[var(--error)] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[var(--error)]">{error}</p>
          </div>
        </div>
      )}

      {/* Generate button - Premium style */}
      <Button
        onClick={handleGenerate}
        disabled={!canGenerate}
        data-generate-button
        variant="premium"
        size="2xl"
        className="w-full"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating...</span>
            <span className="font-mono tabular-nums">{formatTime(elapsedTime)}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>Generate</span>
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
        )}
      </Button>

      {/* Info row */}
      <div className="flex items-center justify-between text-[11px] text-[var(--text-subtle)]">
        <span className="tabular-nums">
          ~${estimatedCost.toFixed(3)} • {resolution.width}×{resolution.height}
        </span>
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
  );
}
