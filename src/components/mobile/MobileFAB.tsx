'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Loader2, Sliders } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { triggerBalanceRefresh } from '@/lib/events';

interface MobileFABProps {
  onSettingsClick: () => void;
}

export function MobileFAB({ onSettingsClick }: MobileFABProps) {
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
  const [showMenu, setShowMenu] = useState(false);

  const canGenerate = prompt.trim().length > 0 && !isGenerating;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setProgress(0);
    
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 10, 90));
    }, 800);

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
        throw new Error(errorData.error || `Generation failed`);
      }

      const data = await response.json();

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
        
        if (navigator.vibrate) {
          navigator.vibrate([30, 50, 30]);
        }

        toast({
          title: `Created ${data.images.length} image${data.images.length > 1 ? 's' : ''}`,
        });

        triggerBalanceRefresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      toast({
        variant: 'destructive',
        title: message,
      });
      
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, [
    canGenerate,
    prompt,
    resolution,
    seed,
    numImages,
    mode,
    referenceSlots,
    setIsGenerating,
    addResults,
  ]);

  const handleLongPress = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    setShowMenu(true);
  }, []);

  return (
    <>
      {/* FAB Container */}
      <div className={cn(
        'fixed bottom-6 right-4 z-40',
        'safe-area-inset-bottom'
      )}>
        {/* Settings mini FAB */}
        {showMenu && (
          <button
            onClick={() => {
              setShowMenu(false);
              onSettingsClick();
            }}
            className={cn(
              'absolute -top-16 right-0',
              'w-12 h-12 rounded-full',
              'bg-[var(--bg-mid)] border border-[var(--border-default)]',
              'flex items-center justify-center',
              'shadow-lg',
              'animate-fade-in'
            )}
          >
            <Sliders className="w-5 h-5 text-secondary" />
          </button>
        )}

        {/* Main FAB */}
        <button
          onClick={isGenerating ? undefined : handleGenerate}
          onContextMenu={(e) => {
            e.preventDefault();
            handleLongPress();
          }}
          disabled={!canGenerate && !isGenerating}
          className={cn(
            'relative',
            'w-16 h-16 rounded-full',
            'flex items-center justify-center',
            'shadow-xl',
            'transition-all duration-200',
            canGenerate && !isGenerating
              ? 'bg-white active:scale-95'
              : 'bg-[var(--bg-soft)]',
            isGenerating && 'animate-pulse'
          )}
        >
          {/* Progress ring */}
          {isGenerating && progress > 0 && (
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="30"
                strokeWidth="4"
                stroke="rgba(255,255,255,0.2)"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="30"
                strokeWidth="4"
                stroke="var(--bg-void)"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
                className="transition-all duration-300"
              />
            </svg>
          )}

          {/* Icon */}
          {isGenerating ? (
            <Loader2 className="w-7 h-7 text-[var(--bg-void)] animate-spin" />
          ) : (
            <Sparkles className={cn(
              'w-7 h-7',
              canGenerate ? 'text-[var(--bg-void)]' : 'text-[var(--text-muted)]'
            )} />
          )}
        </button>

        {/* Pulse animation */}
        {canGenerate && !isGenerating && (
          <div className={cn(
            'absolute inset-0 rounded-full',
            'bg-white/30',
            'animate-ping'
          )} />
        )}
      </div>

      {/* Backdrop for menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}
