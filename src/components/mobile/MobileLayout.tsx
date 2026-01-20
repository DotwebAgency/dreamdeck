'use client';

import { useState, useCallback } from 'react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { MobileHeader } from './MobileHeader';
import { MobileQuickSettings } from './MobileQuickSettings';
import { MobileReferenceRack } from './MobileReferenceRack';
import { MobileResultsGrid } from './MobileResultsGrid';
import { MobileSettingsSheet } from './MobileSettingsSheet';
import { MobileBottomBar } from './MobileBottomBar';
import { cn } from '@/lib/utils';

export function MobileLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { isGenerating } = useGenerationStore();

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const openHistory = useCallback(() => setHistoryOpen(true), []);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);

  return (
    <div className="min-h-screen bg-[var(--bg-void)] flex flex-col">
      {/* Header */}
      <MobileHeader onSettingsClick={openSettings} />

      {/* Main content area - account for bottom bar */}
      <main className="flex-1 flex flex-col overflow-hidden pb-[calc(80px+env(safe-area-inset-bottom))]">
        {/* Reference Rack */}
        <MobileReferenceRack />

        {/* Quick Settings (visual aspect ratio cards) */}
        <MobileQuickSettings onExpandSettings={openSettings} />

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto">
          <MobileResultsGrid />
        </div>
      </main>

      {/* Bottom Action Bar */}
      <MobileBottomBar 
        onSettingsClick={openSettings}
        onHistoryClick={openHistory}
      />

      {/* Settings Sheet */}
      <MobileSettingsSheet 
        isOpen={settingsOpen} 
        onClose={closeSettings} 
      />

      {/* Generation overlay - subtle version */}
      {isGenerating && (
        <div className={cn(
          'fixed top-14 left-0 right-0 z-30',
          'h-1 bg-[var(--bg-soft)]',
          'overflow-hidden'
        )}>
          <div className={cn(
            'h-full bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]',
            'animate-[shimmer_1.5s_ease-in-out_infinite]'
          )} />
        </div>
      )}
    </div>
  );
}
