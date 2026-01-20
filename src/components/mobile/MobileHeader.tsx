'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, Wallet } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils';
import { EVENTS } from '@/lib/events';

interface MobileHeaderProps {
  onSettingsClick: () => void;
}

export function MobileHeader({ onSettingsClick }: MobileHeaderProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        'bg-[var(--bg-void)]/98 glass-subtle',
        'border-b border-[var(--border-subtle)]',
        'safe-top'
      )}
    >
      {/* Trial expiration banner */}
      <div className={cn(
        'h-6 flex items-center justify-center gap-1.5 px-4',
        'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10',
        'border-b border-amber-500/20',
        'text-[10px] text-amber-400/90'
      )}>
        <span>Trial expired.</span>
        <a 
          href="https://tryvoiceink.com/buy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium text-amber-300 hover:text-amber-200 underline underline-offset-2"
        >
          Upgrade to VoiceInk Pro
        </a>
      </div>
      
      {/* Main header content */}
      <div className="flex items-center justify-between px-4 h-14">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div 
          className={cn(
            'w-8 h-8 flex items-center justify-center',
            'bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-secondary)]',
            'rounded-[var(--radius-sm)]',
            'shadow-[var(--shadow-sm)]'
          )}
        >
          <Sparkles className="w-4 h-4 text-[var(--bg-void)]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium tracking-[0.05em] text-[var(--text-primary)]">
            DREAMDECK
          </span>
          <span className="status-indicator" />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Balance */}
        <button
          onClick={fetchBalance}
          className={cn(
            'flex items-center gap-2 px-3 h-9',
            'bg-[var(--bg-deep)]',
            'rounded-[var(--radius-sm)]',
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
        </button>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
      </div>
    </header>
  );
}
