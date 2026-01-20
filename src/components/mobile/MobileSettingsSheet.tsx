'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { X, Dices, Zap, Sparkles } from 'lucide-react';
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

// Separate presets by category
const standardPresets = RESOLUTION_PRESETS.filter(p => p.category === 'standard');
const maxPresets = RESOLUTION_PRESETS.filter(p => p.category === 'max');

export function MobileSettingsSheet({ isOpen, onClose }: MobileSettingsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);
  const touchStartRef = useRef<{ y: number } | null>(null);
  const [qualityTab, setQualityTab] = useState<'standard' | 'max'>('max');

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
  
  // Determine current quality tab based on selected resolution
  useEffect(() => {
    const isMax = resolution.width >= 4000 || resolution.height >= 4000;
    setQualityTab(isMax ? 'max' : 'standard');
  }, [resolution]);

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
            
            {/* Quality Toggle */}
            <div className="flex rounded-lg bg-[var(--bg-void)] p-1 mb-4">
              <button
                onClick={() => setQualityTab('standard')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-md text-[12px] font-medium',
                  'transition-all duration-200',
                  qualityTab === 'standard'
                    ? 'bg-[var(--bg-soft)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)]'
                )}
              >
                Standard
              </button>
              <button
                onClick={() => setQualityTab('max')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-md text-[12px] font-medium',
                  'flex items-center justify-center gap-1.5',
                  'transition-all duration-200',
                  qualityTab === 'max'
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 shadow-sm'
                    : 'text-[var(--text-muted)]'
                )}
              >
                <Sparkles className="w-3 h-3" />
                4K Ultra
              </button>
            </div>
            
            {/* Resolution Grid */}
            <div className="grid grid-cols-4 gap-2">
              {(qualityTab === 'standard' ? standardPresets : maxPresets).map((preset) => {
                const isSelected = resolution.width === preset.width && resolution.height === preset.height;
                const aspectRatio = preset.width / preset.height;
                return (
                  <button
                    key={preset.label}
                    onClick={() => setResolution({ width: preset.width, height: preset.height })}
                    className={cn(
                      'relative py-3 px-2 rounded-lg text-center',
                      'border transition-all',
                      'flex flex-col items-center gap-1.5',
                      isSelected
                        ? qualityTab === 'max' 
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                          : 'border-white bg-white/10 text-[var(--text-primary)]'
                        : 'border-default text-muted active:bg-[var(--bg-mid)]'
                    )}
                  >
                    {/* Aspect ratio visual preview */}
                    <div 
                      className={cn(
                        'rounded-sm transition-colors',
                        isSelected 
                          ? qualityTab === 'max' ? 'bg-amber-500/30' : 'bg-white/30'
                          : 'bg-[var(--text-muted)]/20'
                      )}
                      style={{
                        width: aspectRatio >= 1 ? '20px' : `${20 * aspectRatio}px`,
                        height: aspectRatio <= 1 ? '20px' : `${20 / aspectRatio}px`,
                      }}
                    />
                    <span className="text-[11px] font-medium">{preset.label.replace(' 4K', '')}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] text-subtle">
                {resolution.width}×{resolution.height}
              </p>
              {qualityTab === 'max' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  ~16MP
                </span>
              )}
            </div>
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
