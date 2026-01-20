'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  X,
  Trash2,
  DollarSign
} from 'lucide-react';
import { useGenerationStore, useJobs, useActiveJobCount, useTotalQueueCost, useQueueCapacity } from '@/store/useGenerationStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import type { GenerationJob } from '@/types';
import { MAX_QUEUED_JOBS } from '@/lib/constants';

// Minimal job card for inline display
function CompactJobCard({ job, queuePosition }: { job: GenerationJob; queuePosition?: number }) {
  const removeJob = useGenerationStore((s) => s.removeJob);
  const retryJob = useGenerationStore((s) => s.retryJob);
  const cancelJob = useGenerationStore((s) => s.cancelJob);
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    if (job.status !== 'processing' || !job.startedAt) return;
    
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - job.startedAt!) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [job.status, job.startedAt]);
  
  const formatTime = (s: number) => s < 60 ? `${s}s` : `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  
  const statusConfig = {
    queued: { icon: Clock, color: 'text-[var(--text-muted)]', bg: 'bg-[var(--bg-soft)]' },
    processing: { icon: Sparkles, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    completed: { icon: CheckCircle2, color: 'text-[var(--success)]', bg: 'bg-[var(--success)]/10' },
    failed: { icon: AlertCircle, color: 'text-[var(--error)]', bg: 'bg-[var(--error)]/10' },
  }[job.status];
  
  const StatusIcon = statusConfig.icon;
  
  return (
    <div 
      className={cn(
        'relative flex-shrink-0',
        'w-[180px] min-[400px]:w-[200px] sm:w-[240px]',
        'p-2.5 sm:p-3 rounded-xl',
        'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
        job.status === 'processing' && 'ring-1 ring-emerald-500/20',
        'transition-all duration-200'
      )}
    >
      {/* Status & Actions Row */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium', statusConfig.bg, statusConfig.color)}>
          <StatusIcon className="w-3 h-3" />
          <span className="capitalize">{job.status === 'processing' ? 'Creating' : job.status}</span>
        </div>
        
        {(job.status === 'completed' || job.status === 'failed') && (
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => removeJob(job.id)}
            className="w-5 h-5 text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
        
        {job.status === 'processing' && (
          <span className="text-[10px] text-[var(--text-muted)] font-mono">{formatTime(elapsed)}</span>
        )}
      </div>
      
      {/* Prompt Preview */}
      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mb-2">
        {job.prompt}
      </p>
      
      {/* Progress */}
      {job.status === 'processing' && (
        <Progress 
          value={job.progress} 
          variant="gradient"
          className="h-1"
        />
      )}
      
      {/* Queued state with position and cancel */}
      {job.status === 'queued' && (
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-[var(--text-subtle)]">
            {queuePosition ? `#${queuePosition} in queue` : 'Queued'}
          </span>
          <button
            onClick={() => cancelJob(job.id)}
            className="text-[9px] text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* Completed Preview */}
      {job.status === 'completed' && job.results && job.results.length > 0 && (
        <div className="flex gap-1">
          {job.results.slice(0, 3).map((r) => (
            <div key={r.id} className="w-8 h-8 rounded overflow-hidden bg-[var(--bg-soft)]">
              <img src={r.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {job.results.length > 3 && (
            <div className="w-8 h-8 rounded flex items-center justify-center bg-[var(--bg-soft)] text-[9px] text-[var(--text-muted)]">
              +{job.results.length - 3}
            </div>
          )}
        </div>
      )}
      
      {/* Failed state with retry */}
      {job.status === 'failed' && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-[var(--error)] line-clamp-1 flex-1">{job.error}</p>
          <button
            onClick={() => retryJob(job.id)}
            className="ml-2 text-[9px] text-[var(--error)] hover:underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

// Persist collapse state key
const COLLAPSE_STORAGE_KEY = 'dreamdeck-queue-collapsed';

export function InlineJobQueue() {
  const jobs = useJobs();
  const activeCount = useActiveJobCount();
  const totalCost = useTotalQueueCost();
  const queueCapacity = useQueueCapacity();
  const clearCompletedJobs = useGenerationStore((s) => s.clearCompletedJobs);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true';
    }
    return false;
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevJobCountRef = useRef(jobs.length);
  const clearedJobsRef = useRef<GenerationJob[]>([]);
  
  // Persist collapse state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);
  
  // Handle clear with undo
  const handleClearCompleted = useCallback(() => {
    const finishedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed');
    if (finishedJobs.length === 0) return;
    
    // Store for potential undo
    clearedJobsRef.current = finishedJobs;
    
    // Clear the jobs
    clearCompletedJobs();
    
    // Show toast with undo action
    toast({
      title: `Cleared ${finishedJobs.length} finished job${finishedJobs.length > 1 ? 's' : ''}`,
      description: 'Results are still available in the gallery',
    });
  }, [jobs, clearCompletedJobs]);
  
  // Sort: processing first, then queued, then completed, then failed
  const sortedJobs = [...jobs].sort((a, b) => {
    const order = { processing: 0, queued: 1, completed: 2, failed: 3 };
    return order[a.status] - order[b.status];
  });
  
  // Calculate queue positions for queued jobs
  const pendingJobs = jobs.filter(j => j.status === 'queued' || j.status === 'processing');
  const getQueuePosition = useCallback((jobId: string) => {
    const idx = pendingJobs.findIndex(j => j.id === jobId);
    return idx >= 0 ? idx + 1 : 0;
  }, [pendingJobs]);
  
  const processingCount = jobs.filter(j => j.status === 'processing').length;
  const queuedCount = jobs.filter(j => j.status === 'queued').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;
  
  // Auto-scroll when new job added
  useEffect(() => {
    if (jobs.length > prevJobCountRef.current && scrollRef.current) {
      // New job added - scroll to end
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
    prevJobCountRef.current = jobs.length;
  }, [jobs.length]);
  
  // Don't render if no jobs
  if (jobs.length === 0) return null;
  
  return (
    <div className={cn(
      'w-full border-b border-[var(--border-default)]',
      'bg-[var(--bg-deep)]/50 backdrop-blur-sm'
    )}>
      {/* Header */}
      <div 
        className={cn(
          'flex items-center justify-between px-4 py-2',
          'cursor-pointer hover:bg-[var(--bg-soft)]/30 transition-colors'
        )}
        onClick={toggleCollapse}
      >
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="relative">
            <Loader2 className={cn(
              'w-4 h-4',
              processingCount > 0 ? 'text-emerald-400 animate-spin' : 'text-[var(--text-muted)]'
            )} />
            {activeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              {processingCount > 0 && `${processingCount} generating`}
              {processingCount > 0 && queuedCount > 0 && ' • '}
              {queuedCount > 0 && `${queuedCount} queued`}
              {activeCount === 0 && completedCount > 0 && `${completedCount} completed`}
              {activeCount === 0 && completedCount === 0 && failedCount > 0 && `${failedCount} failed`}
            </span>
            {activeCount > 0 && (
              <span className="text-[9px] text-[var(--text-muted)] tabular-nums">
                ~${totalCost.toFixed(3)} • {queueCapacity.used}/{queueCapacity.max} slots
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {(completedCount > 0 || failedCount > 0) && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => { e.stopPropagation(); handleClearCompleted(); }}
              className="text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
              title="Clear finished"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </div>
      </div>
      
      {/* Job Cards - Horizontal Scroll */}
      {!isCollapsed && (
        <div 
          ref={scrollRef}
          className={cn(
            'flex gap-2 sm:gap-3 px-3 sm:px-4 pb-3',
            'overflow-x-auto',
            'scrollbar-hide hover:scrollbar-default',
            'scroll-smooth snap-x snap-mandatory'
          )}
        >
          {sortedJobs.map(job => (
            <div key={job.id} className="snap-start">
              <CompactJobCard 
                job={job} 
                queuePosition={job.status === 'queued' ? getQueuePosition(job.id) : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
