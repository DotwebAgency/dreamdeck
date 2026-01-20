'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ReferenceRack } from '@/components/reference-rack/ReferenceRack';
import { ResultsGrid } from '@/components/results/ResultsGrid';
import { PinAuth } from '@/components/auth/PinAuth';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { InlineJobQueue } from '@/components/jobs';
import { useJobProcessor } from '@/hooks/useJobProcessor';
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
  
  // Process jobs from queue
  useJobProcessor();

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
          'pt-[84px]', // Header height (56px) + trial banner (28px)
          'lg:pl-[320px]', // Sidebar width
          'min-h-screen',
          'flex flex-col'
        )}
      >
        <ReferenceRack />
        
        {/* Inline Job Queue - integrated into the UI */}
        <InlineJobQueue />

        <div className="flex-1">
          <ResultsGrid />
        </div>
      </main>
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
