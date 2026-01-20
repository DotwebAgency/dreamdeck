'use client';

import { useState } from 'react';
import { Settings, Sparkles, Zap } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { cn } from '@/lib/utils';
import { VisualAspectRatioCard, VISUAL_PRESETS } from './VisualAspectRatioCard';

interface MobileQuickSettingsProps {
  onExpandSettings: () => void;
}

export function MobileQuickSettings({ onExpandSettings }: MobileQuickSettingsProps) {
  const { resolution, setResolution, numImages, setNumImages } = useGenerationStore();
  const [quality, setQuality] = useState<'standard' | 'max'>('standard');

  const presets = quality === 'max' ? VISUAL_PRESETS.max : VISUAL_PRESETS.standard;

  const currentPreset = presets.find(
    p => p.width === resolution.width && p.height === resolution.height
  );

  const handlePresetSelect = (preset: typeof presets[number]) => {
    setResolution({ width: preset.width, height: preset.height });
  };

  return (
    <div 
      className={cn(
        'bg-[var(--bg-deep)]',
        'border-b border-[var(--border-subtle)]'
      )}
    >
      {/* Quality Toggle */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Resolution
        </span>
        <div className="flex items-center gap-1 p-0.5 bg-[var(--bg-mid)] rounded-lg">
          <button
            onClick={() => {
              setQuality('standard');
              // Reset to a standard preset if currently on max
              if (!VISUAL_PRESETS.standard.find(p => p.width === resolution.width && p.height === resolution.height)) {
                setResolution({ width: 1024, height: 1024 });
              }
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md',
              'text-[10px] font-medium',
              'transition-all duration-150',
              quality === 'standard'
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <Zap className="w-3 h-3" />
            Standard
          </button>
          <button
            onClick={() => {
              setQuality('max');
              // Reset to a 4K preset if currently on standard
              if (!VISUAL_PRESETS.max.find(p => p.width === resolution.width && p.height === resolution.height)) {
                setResolution({ width: 4096, height: 4096 });
              }
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md',
              'text-[10px] font-medium',
              'transition-all duration-150',
              quality === 'max'
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <Sparkles className="w-3 h-3" />
            4K Max
          </button>
        </div>
      </div>

      {/* Visual Aspect Ratio Cards */}
      <div className="px-2 pb-3 overflow-visible">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pt-2 pb-2 px-2 -mx-2 snap-x snap-mandatory">
          {presets.map((preset) => (
            <div key={preset.label} className="snap-start shrink-0">
              <VisualAspectRatioCard
                preset={preset}
                isSelected={currentPreset?.label === preset.label}
                onSelect={() => handlePresetSelect(preset)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Count & Settings Row */}
      <div className="px-4 pb-3 flex items-center justify-between">
        {/* Image count */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Count
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setNumImages(Math.max(1, numImages - 1))}
              disabled={numImages <= 1}
              className={cn(
                'w-8 h-8 rounded-lg',
                'bg-[var(--bg-soft)]',
                'flex items-center justify-center',
                'text-[14px] font-medium text-[var(--text-muted)]',
                'transition-all duration-150',
                'active:scale-95',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'touch-target'
              )}
            >
              −
            </button>
            <span 
              className={cn(
                'w-8 text-center',
                'text-[14px] font-medium text-[var(--text-primary)] tabular-nums'
              )}
            >
              {numImages}
            </span>
            <button
              onClick={() => setNumImages(Math.min(10, numImages + 1))}
              disabled={numImages >= 10}
              className={cn(
                'w-8 h-8 rounded-lg',
                'bg-[var(--bg-soft)]',
                'flex items-center justify-center',
                'text-[14px] font-medium text-[var(--text-muted)]',
                'transition-all duration-150',
                'active:scale-95',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'touch-target'
              )}
            >
              +
            </button>
          </div>
        </div>
        
        {/* Current resolution & settings */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-[var(--text-secondary)] tabular-nums">
              {resolution.width}×{resolution.height}
            </div>
            <div className="text-[9px] text-[var(--text-muted)]">
              {((resolution.width * resolution.height) / 1_000_000).toFixed(1)} MP
            </div>
          </div>
          
          {/* Full settings button */}
          <button
            onClick={onExpandSettings}
            className={cn(
              'w-10 h-10 rounded-lg',
              'bg-[var(--bg-soft)]',
              'border border-[var(--border-default)]',
              'flex items-center justify-center',
              'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              'transition-all duration-150',
              'active:scale-95',
              'touch-target'
            )}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
