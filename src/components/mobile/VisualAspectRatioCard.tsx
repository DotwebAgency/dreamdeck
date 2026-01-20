'use client';

import { cn } from '@/lib/utils';

interface AspectRatioPreset {
  width: number;
  height: number;
  label: string;
  name: string;
  category?: 'standard' | 'max';
}

interface VisualAspectRatioCardProps {
  preset: AspectRatioPreset;
  isSelected: boolean;
  onSelect: () => void;
}

export function VisualAspectRatioCard({ preset, isSelected, onSelect }: VisualAspectRatioCardProps) {
  // Calculate visual proportions (max 40px on longest side)
  const maxSize = 32;
  const aspectRatio = preset.width / preset.height;
  let visualWidth: number;
  let visualHeight: number;
  
  if (aspectRatio >= 1) {
    visualWidth = maxSize;
    visualHeight = maxSize / aspectRatio;
  } else {
    visualHeight = maxSize;
    visualWidth = maxSize * aspectRatio;
  }

  const is4K = preset.width >= 4000 || preset.height >= 4000;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-center gap-2 p-3',
        'min-w-[72px]',
        'rounded-lg',
        'border-2 transition-all duration-150',
        'active:scale-[0.97]',
        isSelected
          ? 'bg-[var(--bg-soft)] border-[var(--text-secondary)] shadow-lg'
          : 'bg-[var(--bg-deep)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
      )}
    >
      {/* 4K Badge */}
      {is4K && (
        <span className={cn(
          'absolute -top-1.5 -right-1.5',
          'px-1 py-0.5',
          'text-[8px] font-bold uppercase tracking-wide',
          'bg-amber-500 text-amber-950',
          'rounded'
        )}>
          4K
        </span>
      )}

      {/* Visual Preview */}
      <div 
        className={cn(
          'flex items-center justify-center',
          'w-10 h-10'
        )}
      >
        <div
          className={cn(
            'rounded-sm transition-colors',
            isSelected
              ? 'bg-[var(--text-primary)]'
              : 'bg-[var(--text-muted)]'
          )}
          style={{
            width: visualWidth,
            height: visualHeight,
          }}
        />
      </div>

      {/* Label */}
      <div className="text-center">
        <div className={cn(
          'text-[11px] font-medium leading-none',
          isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
        )}>
          {preset.name}
        </div>
        <div className={cn(
          'text-[9px] mt-0.5',
          isSelected ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
        )}>
          {preset.label}
        </div>
      </div>
    </button>
  );
}

// Preset definitions with human-readable names
export const VISUAL_PRESETS = {
  standard: [
    { width: 1024, height: 1024, label: '1:1', name: 'Square', category: 'standard' as const },
    { width: 1024, height: 1536, label: '2:3', name: 'Portrait', category: 'standard' as const },
    { width: 1536, height: 1024, label: '3:2', name: 'Landscape', category: 'standard' as const },
    { width: 1024, height: 1820, label: '9:16', name: 'Story', category: 'standard' as const },
    { width: 1820, height: 1024, label: '16:9', name: 'Wide', category: 'standard' as const },
    { width: 1024, height: 1366, label: '3:4', name: 'Photo', category: 'standard' as const },
    { width: 1366, height: 1024, label: '4:3', name: 'Classic', category: 'standard' as const },
    { width: 2048, height: 880, label: '21:9', name: 'Cinema', category: 'standard' as const },
  ],
  max: [
    { width: 4096, height: 4096, label: '1:1', name: 'Square', category: 'max' as const },
    { width: 2730, height: 4096, label: '2:3', name: 'Portrait', category: 'max' as const },
    { width: 4096, height: 2730, label: '3:2', name: 'Landscape', category: 'max' as const },
    { width: 2304, height: 4096, label: '9:16', name: 'Story', category: 'max' as const },
    { width: 4096, height: 2304, label: '16:9', name: 'Wide', category: 'max' as const },
  ],
};
