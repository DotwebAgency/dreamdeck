'use client';

import { useEffect, useState, useCallback } from 'react';
import { Wallet, ChevronRight } from 'lucide-react';
import { DiamondsFour } from '@phosphor-icons/react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UsageModal } from '@/components/layout/UsageModal';
import { cn } from '@/lib/utils';
import { EVENTS } from '@/lib/events';

interface MobileHeaderProps {
  onSettingsClick: () => void;
}

export function MobileHeader({ onSettingsClick }: MobileHeaderProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/balance');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    const handleRefresh = () => fetchBalance();
    window.addEventListener(EVENTS.BALANCE_REFRESH, handleRefresh);
    return () => window.removeEventListener(EVENTS.BALANCE_REFRESH, handleRefresh);
  }, [fetchBalance]);

  return (
    <header 
      className={cn(
        'flex items-center justify-between px-4 h-14',
        'bg-[var(--bg-void)]/98 glass-subtle',
        'border-b border-[var(--border-subtle)]',
        'safe-top'
      )}
    >
      {/* Logo - Professional slate icon */}
      <div className="flex items-center gap-2.5">
        <div 
          className={cn(
            'w-8 h-8 flex items-center justify-center',
            'bg-neutral-900',
            'rounded-xl',
            'border border-neutral-800'
          )}
        >
          <DiamondsFour 
            weight="fill" 
            className="w-5 h-5 text-neutral-300" 
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium tracking-[0.05em] text-[var(--text-primary)]">
            DREAMDECK
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] animate-pulse" />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Balance - Opens Usage Modal */}
        <button
          onClick={() => setShowUsageModal(true)}
          className={cn(
            'flex items-center gap-2 px-3 h-9',
            'bg-[var(--bg-deep)]',
            'rounded-lg',
            'border border-[var(--border-default)]',
            'shadow-[var(--inset-sm)]',
            'transition-all duration-150',
            'active:scale-[0.98]',
            'touch-target'
          )}
        >
          <Wallet 
            className={cn(
              'w-4 h-4 text-[var(--text-muted)]',
              isRefreshing && 'animate-pulse'
            )} 
          />
          {balance !== null ? (
            <span className="text-[12px] font-medium text-[var(--text-primary)] tabular-nums">
              ${balance.toFixed(2)}
            </span>
          ) : (
            <span className="text-[12px] text-[var(--text-subtle)]">—</span>
          )}
          <ChevronRight className="w-3 h-3 text-[var(--text-subtle)]" />
        </button>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
      
      {/* Usage Modal */}
      <UsageModal 
        isOpen={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        balance={balance}
      />
    </header>
  );
}
