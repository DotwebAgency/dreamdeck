'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { X, Dices, Zap } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { RESOLUTION_PRESETS, MIN_DIMENSION, MAX_DIMENSION } from '@/lib/constants';
import type { GenerationMode } from '@/types';

interface MobileSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSettingsSheet({ isOpen, onClose }: MobileSettingsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);
  const touchStartRef = useRef<{ y: number } | null>(null);

  const {
    resolution,
    setResolution,
    seed,
    setSeed,
    numImages,
    setNumImages,
    mode,
    setMode,
    autoSave,
    setAutoSave,
  } = useGenerationStore();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { y: e.touches[0].clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (dy > 0) {
      setTranslateY(dy);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (translateY > 100) {
      onClose();
    }
    setTranslateY(0);
    touchStartRef.current = null;
  }, [translateY, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleRandomSeed = useCallback(() => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed);
  }, [setSeed]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50',
          'bg-black/60 backdrop-blur-sm',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${translateY}px)` }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-[var(--bg-deep)] rounded-t-2xl',
          'max-h-[85vh] overflow-hidden',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          'safe-area-inset-bottom'
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-[var(--border-default)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-medium text-default">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg-mid)] flex items-center justify-center"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-8 overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* Resolution Presets */}
          <div className="mb-6">
            <label className="text-[11px] uppercase tracking-[0.1em] text-muted mb-3 block">
              Resolution
            </label>
            <div className="grid grid-cols-4 gap-2">
              {RESOLUTION_PRESETS.slice(0, 8).map((preset) => {
                const isSelected = resolution.width === preset.width && resolution.height === preset.height;
                return (
                  <button
                    key={preset.label}
                    onClick={() => setResolution({ width: preset.width, height: preset.height })}
                    className={cn(
                      'py-2 px-3 rounded-lg text-center',
                      'border transition-all',
                      isSelected
                        ? 'border-white bg-white/10 text-[var(--text-primary)]'
                        : 'border-default text-muted active:bg-[var(--bg-mid)]'
                    )}
                  >
                    <span className="text-xs font-medium">{preset.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-subtle mt-2 text-center">
              {resolution.width}×{resolution.height}
            </p>
          </div>

          {/* Number of Images */}
          <div className="mb-6">
            <label className="text-[11px] uppercase tracking-[0.1em] text-muted mb-3 block">
              Number of Images
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumImages(num)}
                  className={cn(
                    'flex-1 py-3 rounded-lg',
                    'border transition-all',
                    numImages === num
                      ? 'border-white bg-white/10 text-[var(--text-primary)]'
                      : 'border-default text-muted active:bg-[var(--bg-mid)]'
                  )}
                >
                  <span className="text-sm font-medium">{num}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seed */}
          <div className="mb-6">
            <label className="text-[11px] uppercase tracking-[0.1em] text-muted mb-3 block">
              Seed
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={seed === -1 ? '' : seed}
                onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : -1)}
                placeholder="Random"
                className={cn(
                  'flex-1 px-4 py-3 rounded-lg',
                  'bg-[var(--bg-void)] border border-[var(--border-default)]',
                  'text-sm text-default font-mono',
                  'placeholder:text-[var(--text-subtle)]',
                  'focus:outline-none focus:border-muted'
                )}
              />
              <button
                onClick={handleRandomSeed}
                className={cn(
                  'w-12 h-12 rounded-lg',
                  'bg-[var(--bg-mid)] flex items-center justify-center',
                  'active:bg-[var(--bg-soft)]'
                )}
              >
                <Dices className="w-5 h-5 text-muted" />
              </button>
            </div>
          </div>

          {/* Mode */}
          <div className="mb-6">
            <label className="text-[11px] uppercase tracking-[0.1em] text-muted mb-3 block">
              Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('std' as GenerationMode)}
                className={cn(
                  'flex-1 py-3 rounded-lg',
                  'border transition-all',
                  mode === 'std'
                    ? 'border-white bg-white/10 text-[var(--text-primary)]'
                    : 'border-default text-muted active:bg-[var(--bg-mid)]'
                )}
              >
                <span className="text-sm font-medium">Standard</span>
              </button>
              <button
                onClick={() => setMode('turbo' as GenerationMode)}
                className={cn(
                  'flex-1 py-3 rounded-lg flex items-center justify-center gap-2',
                  'border transition-all',
                  mode === 'turbo'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-default text-muted active:bg-[var(--bg-mid)]'
                )}
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Turbo</span>
              </button>
            </div>
          </div>

          {/* Auto-Save */}
          <div className="flex items-center justify-between py-4 border-t border-default">
            <div>
              <p className="text-sm text-default">Auto-Save</p>
              <p className="text-[11px] text-muted">Save images automatically</p>
            </div>
            <Switch
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>

          {/* Done button */}
          <Button
            onClick={onClose}
            className="w-full mt-4"
            size="lg"
          >
            Done
          </Button>
        </div>
      </div>
    </>
  );
}
