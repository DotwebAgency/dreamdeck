'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, RefreshCw, TrendingUp, Calendar, Zap, DollarSign, BarChart3, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface UsageData {
  per_model_usage?: Array<{
    model_uuid: string;
    model_type?: string;
    unit_price?: number;
    total_cost: number;
    total_count: number;
    last_used_date?: string;
  }>;
  daily_usage?: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  summary?: {
    total_cost: number;
    total_requests: number;
    success_requests?: number;
  };
}

interface UsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number | null;
}

export function UsageModal({ isOpen, onClose, balance }: UsageModalProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d'>('7d');

  const fetchUsage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '14d':
          startDate.setDate(startDate.getDate() - 14);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      setUsage(data.data || data);
    } catch (err) {
      console.error('Usage fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (isOpen) {
      fetchUsage();
    }
  }, [isOpen, fetchUsage]);

  if (!isOpen) return null;

  const totalCost = usage?.summary?.total_cost ?? 0;
  const totalRequests = usage?.summary?.total_requests ?? 0;
  const successRate = usage?.summary?.success_requests 
    ? Math.round((usage.summary.success_requests / totalRequests) * 100) 
    : 100;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className={cn(
          'relative z-10 w-full max-w-lg mx-4',
          'bg-[var(--bg-elevated)]',
          'border border-[var(--border-default)]',
          'rounded-[var(--radius-xl)]',
          'shadow-[var(--shadow-2xl)]',
          'animate-scale-in',
          'max-h-[85vh] flex flex-col'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center',
              'bg-[var(--bg-soft)]'
            )}>
              <BarChart3 className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
                Usage & History
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                API usage statistics
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Balance card */}
          <div className={cn(
            'p-4 rounded-[var(--radius-lg)]',
            'bg-gradient-to-br from-[var(--bg-soft)] to-[var(--bg-mid)]',
            'border border-[var(--border-subtle)]'
          )}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Current Balance
              </span>
              <DollarSign className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div className="text-2xl font-medium text-[var(--text-primary)] tabular-nums">
              ${balance?.toFixed(2) ?? '—'}
            </div>
          </div>

          {/* Date range selector */}
          <div className="flex gap-2">
            {(['7d', '14d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-[var(--radius-sm)]',
                  'text-[var(--text-xs)] font-medium',
                  'transition-all duration-150',
                  dateRange === range
                    ? 'bg-[var(--accent-primary)] text-[var(--bg-void)]'
                    : 'bg-[var(--bg-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {range === '7d' ? 'Last 7 days' : range === '14d' ? 'Last 14 days' : 'Last 30 days'}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="py-10 flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[var(--text-muted)] animate-spin mb-3" />
              <p className="text-[var(--text-sm)] text-[var(--text-muted)]">Loading usage data...</p>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className={cn(
              'p-4 rounded-[var(--radius-md)]',
              'bg-[var(--error-muted)]',
              'border border-[var(--error)]/20',
              'text-center'
            )}>
              <p className="text-[var(--text-sm)] text-[var(--error)]">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchUsage}
                className="mt-2 text-[var(--error)]"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Retry
              </Button>
            </div>
          )}

          {/* Usage stats */}
          {!isLoading && !error && usage && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className={cn(
                  'p-3 rounded-[var(--radius-md)]',
                  'bg-[var(--bg-deep)]',
                  'border border-[var(--border-subtle)]'
                )}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ImageIcon className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="text-[10px] uppercase tracking-[var(--tracking-caps)] text-[var(--text-muted)]">
                      Requests
                    </span>
                  </div>
                  <div className="text-lg font-medium text-[var(--text-primary)] tabular-nums">
                    {totalRequests.toLocaleString()}
                  </div>
                </div>

                <div className={cn(
                  'p-3 rounded-[var(--radius-md)]',
                  'bg-[var(--bg-deep)]',
                  'border border-[var(--border-subtle)]'
                )}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <DollarSign className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="text-[10px] uppercase tracking-[var(--tracking-caps)] text-[var(--text-muted)]">
                      Spent
                    </span>
                  </div>
                  <div className="text-lg font-medium text-[var(--text-primary)] tabular-nums">
                    ${totalCost.toFixed(2)}
                  </div>
                </div>

                <div className={cn(
                  'p-3 rounded-[var(--radius-md)]',
                  'bg-[var(--bg-deep)]',
                  'border border-[var(--border-subtle)]'
                )}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="text-[10px] uppercase tracking-[var(--tracking-caps)] text-[var(--text-muted)]">
                      Success
                    </span>
                  </div>
                  <div className="text-lg font-medium text-[var(--success)] tabular-nums">
                    {successRate}%
                  </div>
                </div>
              </div>

              {/* Daily usage chart */}
              {usage.daily_usage && usage.daily_usage.length > 0 && (
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    Daily Activity
                  </h3>
                  <div className="space-y-2">
                    {usage.daily_usage.slice(0, 7).map((day) => {
                      const maxCount = Math.max(...usage.daily_usage!.map(d => d.count));
                      const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                      
                      return (
                        <div key={day.date} className="flex items-center gap-3">
                          <div className="w-16 text-[var(--text-xs)] text-[var(--text-muted)] font-mono">
                            {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex-1 h-5 bg-[var(--bg-soft)] rounded-[var(--radius-xs)] overflow-hidden">
                            <div 
                              className="h-full bg-[var(--accent-secondary)] rounded-[var(--radius-xs)] transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-12 text-right text-[var(--text-xs)] text-[var(--text-secondary)] tabular-nums">
                            {day.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Model breakdown */}
              {usage.per_model_usage && usage.per_model_usage.length > 0 && (
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    By Model
                  </h3>
                  <div className="space-y-2">
                    {usage.per_model_usage.map((model, i) => (
                      <div 
                        key={model.model_uuid || i}
                        className={cn(
                          'p-3 rounded-[var(--radius-md)]',
                          'bg-[var(--bg-deep)]',
                          'border border-[var(--border-subtle)]',
                          'flex items-center justify-between'
                        )}
                      >
                        <div>
                          <div className="text-[13px] text-[var(--text-primary)]">
                            {model.model_uuid?.split('/').pop() || 'Unknown Model'}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            {model.total_count.toLocaleString()} generations
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[13px] font-medium text-[var(--text-primary)] tabular-nums">
                            ${model.total_cost.toFixed(2)}
                          </div>
                          {model.unit_price && (
                            <div className="text-[11px] text-[var(--text-muted)]">
                              ${model.unit_price.toFixed(3)}/gen
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {(!usage.daily_usage || usage.daily_usage.length === 0) && 
               (!usage.per_model_usage || usage.per_model_usage.length === 0) && (
                <div className="py-10 text-center">
                  <ImageIcon className="w-10 h-10 text-[var(--text-subtle)] mx-auto mb-3" />
                  <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                    No usage data for this period
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-default)] flex items-center justify-between">
          <span className="text-[10px] text-[var(--text-subtle)]">
            Usage data may be delayed up to 24h
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchUsage}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
