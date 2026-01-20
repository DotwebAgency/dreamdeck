'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { MobileImageCard } from './MobileImageCard';
import { MobileViewer } from './MobileViewer';
import { Sparkles, Wand2, Settings2, ImagePlus, Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

// Local storage key for grid columns preference
const GRID_COLS_KEY = 'dreamdeck-grid-cols';

export function MobileResultsGrid() {
  const { results, removeResult } = useGenerationStore();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [gridCols, setGridCols] = useState(2);

  // Load saved grid preference
  useEffect(() => {
    const saved = localStorage.getItem(GRID_COLS_KEY);
    if (saved) {
      setGridCols(parseInt(saved, 10));
    }
  }, []);

  // Save grid preference
  const handleGridColsChange = useCallback((cols: number) => {
    setGridCols(cols);
    localStorage.setItem(GRID_COLS_KEY, cols.toString());
  }, []);

  const handleOpenViewer = useCallback((index: number) => {
    setViewerIndex(index);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (viewerIndex === null) return;
    if (direction === 'prev' && viewerIndex > 0) {
      setViewerIndex(viewerIndex - 1);
    } else if (direction === 'next' && viewerIndex < results.length - 1) {
      setViewerIndex(viewerIndex + 1);
    }
  }, [viewerIndex, results.length]);

  if (results.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* FLAT icon container */}
        <div className={cn(
          'w-14 h-14 mb-5 rounded-lg',
          'bg-[var(--bg-mid)]',
          'border border-[var(--border-default)]',
          'flex items-center justify-center'
        )}>
          <Sparkles className="w-6 h-6 text-[var(--text-muted)]" />
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
          Ready to create
        </h3>
        
        {/* Subtitle */}
        <p className="text-[12px] text-[var(--text-muted)] mb-6 max-w-[220px] leading-relaxed">
          Describe your vision in the prompt field and generate stunning images.
        </p>

        {/* Quick steps - simplified for mobile */}
        <div className="flex flex-col gap-2 w-full max-w-[260px]">
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-lg',
            'bg-[var(--bg-deep)]',
            'border border-[var(--border-subtle)]'
          )}>
            <div className={cn(
              'w-7 h-7 rounded flex items-center justify-center shrink-0',
              'bg-[var(--bg-soft)]'
            )}>
              <Wand2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </div>
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--text-subtle)]">Step 1</span>
              <p className="text-[11px] text-[var(--text-secondary)]">Write your prompt</p>
            </div>
          </div>

          <div className={cn(
            'flex items-center gap-3 p-3 rounded-lg',
            'bg-[var(--bg-deep)]',
            'border border-[var(--border-subtle)]'
          )}>
            <div className={cn(
              'w-7 h-7 rounded flex items-center justify-center shrink-0',
              'bg-[var(--bg-soft)]'
            )}>
              <Settings2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </div>
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--text-subtle)]">Step 2</span>
              <p className="text-[11px] text-[var(--text-secondary)]">Pick resolution</p>
            </div>
          </div>

          <div className={cn(
            'flex items-center gap-3 p-3 rounded-lg',
            'bg-[var(--bg-deep)]',
            'border border-[var(--border-subtle)]'
          )}>
            <div className={cn(
              'w-7 h-7 rounded flex items-center justify-center shrink-0',
              'bg-[var(--bg-soft)]'
            )}>
              <ImagePlus className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </div>
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--text-subtle)]">Step 3</span>
              <p className="text-[11px] text-[var(--text-secondary)]">Tap Generate</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-3">
        {/* Header with grid toggle */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] font-medium">
            {results.length} {results.length === 1 ? 'image' : 'images'}
          </span>
          
          {/* Grid columns selector */}
          <div className="flex items-center gap-0.5 p-0.5 bg-[var(--bg-mid)] rounded-lg">
            <button
              onClick={() => handleGridColsChange(1)}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center',
                'transition-all duration-150',
                gridCols === 1 
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' 
                  : 'text-[var(--text-muted)]'
              )}
              title="1 per row"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleGridColsChange(2)}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center',
                'transition-all duration-150',
                gridCols === 2 
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' 
                  : 'text-[var(--text-muted)]'
              )}
              title="2 per row"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleGridColsChange(3)}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center',
                'transition-all duration-150',
                gridCols === 3 
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' 
                  : 'text-[var(--text-muted)]'
              )}
              title="3 per row"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic grid based on user preference */}
        <div 
          className={cn(
            'grid gap-2',
            gridCols === 1 && 'grid-cols-1',
            gridCols === 2 && 'grid-cols-2',
            gridCols === 3 && 'grid-cols-3'
          )}
        >
          {results.map((image, index) => (
            <MobileImageCard
              key={image.id}
              image={image}
              onTap={() => handleOpenViewer(index)}
              onDelete={() => removeResult(image.id)}
              compact={gridCols === 3}
            />
          ))}
        </div>
      </div>

      {/* Full-screen viewer */}
      {viewerIndex !== null && results[viewerIndex] && (
        <MobileViewer
          image={results[viewerIndex]}
          images={results}
          currentIndex={viewerIndex}
          isOpen={true}
          onClose={handleCloseViewer}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}
