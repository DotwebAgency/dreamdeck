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
  const [quality, setQuality] = useState<'standard' | 'max'>('max'); // Default to 4K Max

  const presets = quality === 'max' ? VISUAL_PRESETS.max : VISUAL_PRESETS.standard;

  const currentPreset = presets.find(
    p => p.width === resolution.width && p.height === resolution.height
  );

  const handlePresetSelect = (preset: typeof presets[number]) => {
    setResolution({ width: preset.width, height: preset.height });
  };

  const megapixels = ((resolution.width * resolution.height) / 1_000_000).toFixed(1);

  return (
    <div 
      className={cn(
        'bg-[var(--bg-deep)]',
        'border-b border-[var(--border-subtle)]'
      )}
    >
      {/* Header Row - Quality toggle + Resolution info + Settings */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3">
        {/* Quality Toggle - Compact */}
        <div className="flex items-center gap-1 p-0.5 bg-[var(--bg-mid)] rounded-lg shrink-0">
          <button
            onClick={() => {
              setQuality('standard');
              if (!VISUAL_PRESETS.standard.find(p => p.width === resolution.width && p.height === resolution.height)) {
                setResolution({ width: 1024, height: 1024 });
              }
            }}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-md',
              'text-[10px] font-medium',
              'transition-all duration-150',
              quality === 'standard'
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)]'
            )}
          >
            <Zap className="w-3 h-3" />
            <span className="hidden xs:inline">Std</span>
          </button>
          <button
            onClick={() => {
              setQuality('max');
              if (!VISUAL_PRESETS.max.find(p => p.width === resolution.width && p.height === resolution.height)) {
                setResolution({ width: 4096, height: 4096 });
              }
            }}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-md',
              'text-[10px] font-medium',
              'transition-all duration-150',
              quality === 'max'
                ? 'bg-amber-500/20 text-amber-400 shadow-sm'
                : 'text-[var(--text-muted)]'
            )}
          >
            <Sparkles className="w-3 h-3" />
            <span>4K</span>
          </button>
        </div>
        
        {/* Center - Resolution + MP info */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          <span className="text-[11px] text-[var(--text-secondary)] tabular-nums font-medium">
            {resolution.width}×{resolution.height}
          </span>
          <span className={cn(
            'text-[9px] px-1.5 py-0.5 rounded',
            quality === 'max' 
              ? 'bg-amber-500/20 text-amber-400' 
              : 'bg-[var(--bg-soft)] text-[var(--text-muted)]'
          )}>
            {megapixels} MP
          </span>
        </div>
        
        {/* Right - Count + Settings */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Compact count */}
          <div className="flex items-center gap-0.5 bg-[var(--bg-mid)] rounded-lg p-0.5">
            <button
              onClick={() => setNumImages(Math.max(1, numImages - 1))}
              disabled={numImages <= 1}
              className={cn(
                'w-7 h-7 rounded-md',
                'flex items-center justify-center',
                'text-[12px] font-medium text-[var(--text-muted)]',
                'transition-all duration-150',
                'active:bg-[var(--bg-soft)]',
                'disabled:opacity-40'
              )}
            >
              −
            </button>
            <span className="w-5 text-center text-[12px] font-medium text-[var(--text-primary)] tabular-nums">
              {numImages}
            </span>
            <button
              onClick={() => setNumImages(Math.min(10, numImages + 1))}
              disabled={numImages >= 10}
              className={cn(
                'w-7 h-7 rounded-md',
                'flex items-center justify-center',
                'text-[12px] font-medium text-[var(--text-muted)]',
                'transition-all duration-150',
                'active:bg-[var(--bg-soft)]',
                'disabled:opacity-40'
              )}
            >
              +
            </button>
          </div>
          
          {/* Settings button */}
          <button
            onClick={onExpandSettings}
            className={cn(
              'w-9 h-9 rounded-lg',
              'bg-[var(--bg-soft)]',
              'flex items-center justify-center',
              'text-[var(--text-muted)]',
              'active:scale-95'
            )}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Aspect Ratio Cards */}
      <div className="px-2 pb-3 overflow-visible">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pt-1 pb-1 px-2 -mx-2 snap-x snap-mandatory">
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
    </div>
  );
}
