'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ReferenceRack } from '@/components/reference-rack/ReferenceRack';
import { ResultsGrid } from '@/components/results/ResultsGrid';
import { PinAuth } from '@/components/auth/PinAuth';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { JobQueue } from '@/components/jobs';
import { useGenerationStore } from '@/store/useGenerationStore';
import { cn } from '@/lib/utils';

// Hook to detect mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

function DesktopLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        const generateBtn = document.querySelector(
          '[data-generate-button]'
        ) as HTMLButtonElement;
        if (generateBtn && !generateBtn.disabled) {
          generateBtn.click();
        }
      }

      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className={cn(
          'pt-14', // Header height
          'lg:pl-[320px]', // Sidebar width
          'min-h-screen',
          'flex flex-col'
        )}
      >
        <ReferenceRack />

        <div className="flex-1">
          <ResultsGrid />
        </div>
      </main>

      {/* Job Queue floating panel */}
      <JobQueue />
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();

  return (
    <PinAuth>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </PinAuth>
  );
}
