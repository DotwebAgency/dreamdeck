'use client';

import { useState } from 'react';
import {
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Maximize2,
  Lock,
  Unlock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { RESOLUTION_PRESETS, MAX_PIXELS, MAX_DIMENSION, MIN_DIMENSION } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const ASPECT_ICONS: Record<string, React.ElementType> = {
  '1:1': Square,
  '1:1 4K': Square,
  '16:9': RectangleHorizontal,
  '16:9 4K': RectangleHorizontal,
  '9:16': RectangleVertical,
  '9:16 4K': RectangleVertical,
  '4:3': RectangleHorizontal,
  '4:3 4K': RectangleHorizontal,
  '3:4': RectangleVertical,
  '3:4 4K': RectangleVertical,
  '3:2': RectangleHorizontal,
  '3:2 4K': RectangleHorizontal,
  '2:3': RectangleVertical,
  '2:3 4K': RectangleVertical,
  '21:9': RectangleHorizontal,
};

export function ResolutionPicker() {
  const { resolution, setResolution } = useGenerationStore();
  const [locked, setLocked] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [qualityTab, setQualityTab] = useState<'standard' | 'max'>('max'); // Default to 4K!

  const standardPresets = RESOLUTION_PRESETS.filter(p => p.category === 'standard');
  const maxPresets = RESOLUTION_PRESETS.filter(p => p.category === 'max');
  const currentPresets = qualityTab === 'max' ? maxPresets : standardPresets;

  const selectedPreset = RESOLUTION_PRESETS.find(
    (p) => p.width === resolution.width && p.height === resolution.height
  );

  const handlePresetSelect = (preset: { width: number; height: number; label: string }) => {
    setResolution({ width: preset.width, height: preset.height });
    setManualMode(false);
  };

  const currentAspectRatio = selectedPreset?.label.replace(' 4K', '') || 'Custom';
  
  const handleWidthChange = (value: number[]) => {
    const newWidth = Math.round(value[0] / 64) * 64;
    const clampedWidth = Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, newWidth));
    
    if (locked && selectedPreset) {
      const ratio = selectedPreset.height / selectedPreset.width;
      const newHeight = Math.round((clampedWidth * ratio) / 64) * 64;
      const clampedHeight = Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, newHeight));
      
      if (clampedWidth * clampedHeight <= MAX_PIXELS) {
        setResolution({ width: clampedWidth, height: clampedHeight });
      }
    } else {
      if (clampedWidth * resolution.height <= MAX_PIXELS) {
        setResolution({ width: clampedWidth, height: resolution.height });
      }
    }
    setManualMode(true);
  };

  const handleHeightChange = (value: number[]) => {
    const newHeight = Math.round(value[0] / 64) * 64;
    const clampedHeight = Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, newHeight));
    
    if (locked && selectedPreset) {
      const ratio = selectedPreset.width / selectedPreset.height;
      const newWidth = Math.round((clampedHeight * ratio) / 64) * 64;
      const clampedWidth = Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, newWidth));
      
      if (clampedWidth * clampedHeight <= MAX_PIXELS) {
        setResolution({ width: clampedWidth, height: clampedHeight });
      }
    } else {
      if (resolution.width * clampedHeight <= MAX_PIXELS) {
        setResolution({ width: resolution.width, height: clampedHeight });
      }
    }
    setManualMode(true);
  };

  const pixelCount = resolution.width * resolution.height;
  const pixelUsage = (pixelCount / MAX_PIXELS) * 100;
  const is4K = resolution.width >= 4000 || resolution.height >= 4000;

  return (
    <div className="space-y-4">
      {/* Quality tabs */}
      <Tabs value={qualityTab} onValueChange={(v) => setQualityTab(v as 'standard' | 'max')}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="standard" className="gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Standard
          </TabsTrigger>
          <TabsTrigger value="max" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            4K Max
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Preset Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {currentPresets.slice(0, 8).map((preset) => {
          const baseLabel = preset.label.replace(' 4K', '');
          const Icon = ASPECT_ICONS[preset.label] || ASPECT_ICONS[baseLabel] || Maximize2;
          const isSelected =
            !manualMode &&
            preset.width === resolution.width &&
            preset.height === resolution.height;

          return (
            <button
              key={preset.label}
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2.5 px-1',
                'rounded transition-all duration-150',
                'border',
                isSelected
                  ? 'bg-[var(--bg-soft)] border-[var(--border-strong)] text-[var(--text-primary)]'
                  : 'bg-transparent border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{baseLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Current dimensions display */}
      <div className="p-3 rounded bg-[var(--bg-mid)] border border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-mono text-[var(--text-primary)]">
            {resolution.width} × {resolution.height}
          </span>
          <div className="flex items-center gap-2">
            {is4K && (
              <span className="px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-amber-500 bg-amber-500/10 rounded">
                4K
              </span>
            )}
            <span className="text-[11px] text-[var(--text-muted)]">
              {(pixelCount / 1_000_000).toFixed(1)} MP
            </span>
          </div>
        </div>
        
        {/* Pixel usage bar */}
        <div className="h-1 bg-[var(--bg-soft)] rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-300',
              pixelUsage > 90 ? 'bg-amber-500' : 'bg-[var(--text-muted)]'
            )}
            style={{ width: `${Math.min(pixelUsage, 100)}%` }}
          />
        </div>
        <p className="text-[9px] text-[var(--text-subtle)] mt-1">
          {pixelUsage.toFixed(0)}% of 16.7MP limit
        </p>
      </div>

      {/* Manual sliders */}
      <div className="space-y-4 pt-2 border-t border-[var(--border-default)]">
        {/* Lock toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-[var(--text-muted)] text-[11px]">Manual Adjustment</Label>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setLocked(!locked)}
            className={cn(
              'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              locked && 'text-[var(--text-secondary)]'
            )}
          >
            {locked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        {/* Width slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">Width</span>
            <span className="text-[12px] font-mono text-[var(--text-secondary)]">
              {resolution.width}px
            </span>
          </div>
          <Slider
            value={[resolution.width]}
            onValueChange={handleWidthChange}
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            step={64}
          />
        </div>

        {/* Height slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">Height</span>
            <span className="text-[12px] font-mono text-[var(--text-secondary)]">
              {resolution.height}px
            </span>
          </div>
          <Slider
            value={[resolution.height]}
            onValueChange={handleHeightChange}
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            step={64}
          />
        </div>
      </div>
    </div>
  );
}
