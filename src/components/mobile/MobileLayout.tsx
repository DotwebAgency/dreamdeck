'use client';

import { useState, useCallback } from 'react';
import { useIsAnyJobRunning } from '@/store/useGenerationStore';
import { MobileHeader } from './MobileHeader';
import { MobileQuickSettings } from './MobileQuickSettings';
import { MobileReferenceRack } from './MobileReferenceRack';
import { MobileResultsGrid } from './MobileResultsGrid';
import { MobileSettingsSheet } from './MobileSettingsSheet';
import { MobileBottomBar } from './MobileBottomBar';
import { InlineJobQueue } from '@/components/jobs';
import { useJobProcessor } from '@/hooks/useJobProcessor';
import { cn } from '@/lib/utils';

export function MobileLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const isAnyJobRunning = useIsAnyJobRunning();
  
  // Process jobs from queue
  useJobProcessor();

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
        
        {/* Inline Job Queue - integrated into the UI */}
        <InlineJobQueue />

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

      {/* Generation progress indicator - fixed at absolute top pixel of screen */}
      {isAnyJobRunning && (
        <div 
          className={cn(
            'fixed top-0 left-0 right-0 z-[100]', // Absolute top pixel
            'h-0.5 bg-[var(--bg-deep)]',
            'overflow-hidden'
          )}
        >
          <div className={cn(
            'h-full w-full',
            'bg-gradient-to-r from-transparent via-emerald-500 to-transparent',
            'animate-[shimmer_1.5s_ease-in-out_infinite]'
          )} />
        </div>
      )}
    </div>
  );
}
