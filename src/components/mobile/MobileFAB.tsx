'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Plus, Sliders, Layers } from 'lucide-react';
import { useGenerationStore, useCanGenerate, useActiveJobCount } from '@/store/useGenerationStore';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { MAX_QUEUED_JOBS } from '@/lib/constants';

interface MobileFABProps {
  onSettingsClick: () => void;
}

export function MobileFAB({ onSettingsClick }: MobileFABProps) {
  const {
    prompt,
    resolution,
    numImages,
    createJob,
  } = useGenerationStore();

  const canGenerate = useCanGenerate();
  const activeCount = useActiveJobCount(); // Use count (number) instead of array
  const [showMenu, setShowMenu] = useState(false);
  
  const isQueueActive = activeCount > 0;

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt required',
        description: 'Please enter a prompt first.',
      });
      return;
    }
    
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    const jobId = createJob();
    
    if (jobId) {
      toast({
        title: 'Added to queue',
        description: `${resolution.width}×${resolution.height} • ${numImages} image${numImages > 1 ? 's' : ''}`,
      });
      
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Queue full',
        description: `Maximum ${MAX_QUEUED_JOBS} jobs allowed.`,
      });
      
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }
  }, [prompt, resolution, numImages, createJob]);

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
          onClick={handleGenerate}
          onContextMenu={(e) => {
            e.preventDefault();
            handleLongPress();
          }}
          disabled={!canGenerate}
          className={cn(
            'relative',
            'w-16 h-16 rounded-full',
            'flex items-center justify-center',
            'shadow-xl',
            'transition-all duration-200',
            canGenerate
              ? 'bg-white active:scale-95'
              : 'bg-[var(--bg-soft)]'
          )}
        >
          {/* Active jobs badge */}
          {activeCount > 0 && (
            <div className={cn(
              'absolute -top-1 -right-1',
              'w-6 h-6 rounded-full',
              'bg-neutral-600 text-white',
              'flex items-center justify-center',
              'text-[10px] font-semibold',
              'shadow-lg',
              'animate-pulse'
            )}>
              {activeCount}
            </div>
          )}

          {/* Icon */}
          {isQueueActive ? (
            <Plus className={cn(
              'w-7 h-7',
              canGenerate ? 'text-[var(--bg-void)]' : 'text-[var(--text-muted)]'
            )} />
          ) : (
            <Sparkles className={cn(
              'w-7 h-7',
              canGenerate ? 'text-[var(--bg-void)]' : 'text-[var(--text-muted)]'
            )} />
          )}
        </button>

        {/* Pulse animation */}
        {canGenerate && !isQueueActive && (
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
