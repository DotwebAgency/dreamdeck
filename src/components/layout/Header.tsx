'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Sparkles, Wallet, Menu, RefreshCw, ChevronRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UsageModal } from './UsageModal';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { EVENTS } from '@/lib/events';

interface BalanceData {
  balance: number;
}

// Animated number counter hook
function useAnimatedNumber(value: number | null, duration = 500) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (value === null || previousValue.current === null) {
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    const start = previousValue.current;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(start + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return displayValue;
}

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const animatedBalance = useAnimatedNumber(balance);

  const fetchBalance = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/balance');
      if (res.ok) {
        const data: BalanceData = await res.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Listen for balance refresh events (triggered after generation)
  useEffect(() => {
    const handleRefresh = () => {
      fetchBalance();
    };

    window.addEventListener(EVENTS.BALANCE_REFRESH, handleRefresh);
    return () => window.removeEventListener(EVENTS.BALANCE_REFRESH, handleRefresh);
  }, [fetchBalance]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchBalance, 60000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      fetchBalance();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchBalance]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-14',
          'bg-[var(--bg-void)]/98 glass-subtle',
          'border-b border-[var(--border-subtle)]'
        )}
      >
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Left: Logo + Status combined */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden touch-target"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo mark - FLAT solid */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-8 h-8 flex items-center justify-center relative',
                  'bg-[var(--text-primary)]',
                  'rounded-lg',
                  'transition-all duration-300',
                  'hover:bg-[var(--text-secondary)]',
                  'hover:scale-105',
                  'overflow-hidden'
                )}
              >
                {/* Abstract D mark */}
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="text-[var(--bg-void)]"
                >
                  <path 
                    d="M6 4h6c5.523 0 10 4.477 10 10s-4.477 10-10 10H6V4z" 
                    fill="currentColor"
                    opacity="0.9"
                  />
                  <path 
                    d="M10 8h2c3.314 0 6 2.686 6 6s-2.686 6-6 6h-2V8z" 
                    fill="var(--bg-mid)"
                    opacity="0.5"
                  />
                </svg>
              </div>
              
              {/* Logo text + status */}
              <div className="flex items-center gap-2">
                <span 
                  className={cn(
                    'text-[13px] font-medium tracking-[0.05em]',
                    'text-[var(--text-primary)]',
                    'hidden sm:block'
                  )}
                >
                  DREAMDECK
                </span>
                
                {/* Status indicator - inline with logo */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span 
                    className={cn(
                      'text-[10px] tracking-[0.05em]',
                      'text-[var(--text-muted)]'
                    )}
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Balance + Theme */}
          <div className="flex items-center gap-3">
            {/* Balance */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowUsageModal(true)}
                    className={cn(
                      'flex items-center gap-2.5 px-3.5 h-9',
                      'bg-[var(--bg-deep)]',
                      'rounded-[var(--radius-sm)]',
                      'border border-[var(--border-default)]',
                      'shadow-[var(--inset-sm)]',
                      'transition-all duration-200',
                      'hover:border-[var(--border-strong)]',
                      'hover:bg-[var(--bg-mid)]',
                      'active:scale-[0.98]',
                      'cursor-pointer touch-target'
                    )}
                  >
                    <Wallet className={cn(
                      'w-4 h-4 text-[var(--text-muted)]',
                      isRefreshing && 'animate-pulse'
                    )} />
                    {isLoading ? (
                      <div className="w-14 h-3.5 bg-[var(--bg-soft)] rounded animate-pulse" />
                    ) : animatedBalance !== null ? (
                      <span className={cn(
                        'text-[13px] font-medium tabular-nums',
                        'text-[var(--text-primary)]'
                      )}>
                        ${animatedBalance.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[13px] text-[var(--text-subtle)]">—</span>
                    )}
                    <ChevronRight className="w-3 h-3 text-[var(--text-subtle)]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Click for usage details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Divider */}
            <div className="w-px h-6 bg-[var(--border-default)]" />

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Usage Modal */}
      <UsageModal 
        isOpen={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        balance={balance}
      />
    </>
  );
}
