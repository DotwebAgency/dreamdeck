'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
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
  RotateCcw,
  Zap,
  ImageIcon
} from 'lucide-react';
import { useGenerationStore, useJobs, useActiveJobCount, useTotalQueueCost, useQueueCapacityUsed, useQueueCapacityMax } from '@/store/useGenerationStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import type { GenerationJob, GeneratedImage } from '@/types';

// ============================================================================
// COMPACT JOB CARD - Redesigned for 2026 aesthetics
// ============================================================================
interface CompactJobCardProps {
  job: GenerationJob;
  queuePosition?: number;
  onImageClick?: (image: GeneratedImage) => void;
}

const CompactJobCard = memo(function CompactJobCard({ 
  job, 
  queuePosition,
  onImageClick 
}: CompactJobCardProps) {
  const removeJob = useGenerationStore((s) => s.removeJob);
  const retryJob = useGenerationStore((s) => s.retryJob);
  const cancelJob = useGenerationStore((s) => s.cancelJob);
  const [elapsed, setElapsed] = useState(0);
  
  // Timer for processing jobs
  useEffect(() => {
    if (job.status !== 'processing' || !job.startedAt) return;
    
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - job.startedAt!) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [job.status, job.startedAt]);
  
  const formatTime = (s: number) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  };

  // Status configurations
  const statusConfig = {
    queued: { 
      icon: Clock, 
      label: 'Queued',
      gradient: 'from-zinc-500/20 to-zinc-600/10',
      border: 'border-zinc-500/30',
      text: 'text-zinc-400',
      glow: ''
    },
    processing: { 
      icon: Sparkles, 
      label: 'Creating',
      gradient: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/10',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
    },
    completed: { 
      icon: CheckCircle2, 
      label: 'Done',
      gradient: 'from-emerald-600/15 to-green-600/10',
      border: 'border-emerald-600/30',
      text: 'text-emerald-500',
      glow: ''
    },
    failed: { 
      icon: AlertCircle, 
      label: 'Failed',
      gradient: 'from-red-500/20 to-rose-600/10',
      border: 'border-red-500/40',
      text: 'text-red-400',
      glow: ''
    },
  }[job.status];
  
  const StatusIcon = statusConfig.icon;

  return (
    <div 
      className={cn(
        'relative group flex-shrink-0',
        'w-[200px] sm:w-[240px]',
        'rounded-2xl overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        statusConfig.glow
      )}
    >
      {/* Gradient background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br',
        statusConfig.gradient
      )} />
      
      {/* Glass layer */}
      <div className={cn(
        'relative backdrop-blur-md',
        'bg-[var(--surface-glass)]/40',
        'border',
        statusConfig.border,
        'rounded-2xl',
        'p-3'
      )}>
        {/* Header row - Status & Actions */}
        <div className="flex items-center justify-between mb-2.5">
          {/* Status badge */}
          <div className={cn(
            'flex items-center gap-1.5',
            'px-2.5 py-1 rounded-full',
            'bg-black/20 backdrop-blur-sm',
            'border border-white/5',
            statusConfig.text,
            'text-[10px] font-semibold tracking-wide uppercase'
          )}>
            <StatusIcon className={cn(
              'w-3 h-3',
              job.status === 'processing' && 'animate-pulse'
            )} />
            <span>{statusConfig.label}</span>
          </div>
          
          {/* Timer for processing */}
          {job.status === 'processing' && (
            <span className="text-[11px] font-mono text-emerald-400/80 tabular-nums">
              {formatTime(elapsed)}
            </span>
          )}
          
          {/* Dismiss button for completed/failed */}
          {(job.status === 'completed' || job.status === 'failed') && (
            <button
              onClick={(e) => { e.stopPropagation(); removeJob(job.id); }}
              className={cn(
                'p-1.5 rounded-full',
                'bg-white/5 hover:bg-white/10',
                'text-white/40 hover:text-white/70',
                'transition-all duration-200',
                'opacity-0 group-hover:opacity-100'
              )}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        
        {/* Prompt preview */}
        <p className={cn(
          'text-[12px] leading-relaxed',
          'text-white/70',
          'line-clamp-2 mb-3',
          'min-h-[2.5em]'
        )}>
          {job.prompt || 'No prompt...'}
        </p>
        
        {/* Progress bar for processing */}
        {job.status === 'processing' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/40">Progress</span>
              <span className="text-emerald-400 font-medium tabular-nums">{job.progress}%</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-black/30 overflow-hidden">
              {/* Animated shimmer on track */}
              <div className="absolute inset-0 opacity-50">
                <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
              </div>
              {/* Actual progress */}
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Queued state */}
        {job.status === 'queued' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <Zap className="w-3 h-3" />
              <span>Position #{queuePosition || '?'}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); cancelJob(job.id); }}
              className={cn(
                'text-[10px] text-white/40 hover:text-red-400',
                'px-2 py-0.5 rounded',
                'hover:bg-red-500/10',
                'transition-colors duration-200'
              )}
            >
              Cancel
            </button>
          </div>
        )}
        
        {/* Completed - Image previews */}
        {job.status === 'completed' && job.results && job.results.length > 0 && (
          <div className="flex items-center gap-1.5">
            {job.results.slice(0, 4).map((result, idx) => (
              <button
                key={result.id}
                onClick={(e) => { e.stopPropagation(); onImageClick?.(result); }}
                className={cn(
                  'relative w-10 h-10 rounded-lg overflow-hidden',
                  'ring-1 ring-white/10 hover:ring-white/30',
                  'transition-all duration-200',
                  'hover:scale-110 hover:z-10',
                  'animate-scale-in'
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <img 
                  src={result.url} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              </button>
            ))}
            {job.results.length > 4 && (
              <div className={cn(
                'w-10 h-10 rounded-lg',
                'bg-black/30 border border-white/10',
                'flex items-center justify-center',
                'text-[10px] font-medium text-white/50'
              )}>
                +{job.results.length - 4}
              </div>
            )}
          </div>
        )}
        
        {/* Failed state */}
        {job.status === 'failed' && (
          <div className="space-y-2">
            <p className="text-[10px] text-red-300/70 line-clamp-1">
              {job.error || 'Generation failed'}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); retryJob(job.id); }}
              className={cn(
                'flex items-center gap-1.5',
                'px-3 py-1.5 rounded-lg',
                'bg-red-500/20 hover:bg-red-500/30',
                'border border-red-500/30',
                'text-red-300 text-[10px] font-medium',
                'transition-colors duration-200'
              )}
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// MOBILE JOB CARD - Ultra-compact for mobile
// ============================================================================
const MobileJobCard = memo(function MobileJobCard({ 
  job, 
  queuePosition,
  onImageClick 
}: CompactJobCardProps) {
  const removeJob = useGenerationStore((s) => s.removeJob);
  const retryJob = useGenerationStore((s) => s.retryJob);
  const cancelJob = useGenerationStore((s) => s.cancelJob);

  const statusConfig = {
    queued: { icon: Clock, color: 'text-zinc-400', bg: 'bg-zinc-500/20' },
    processing: { icon: Sparkles, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
    failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  }[job.status];
  
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn(
      'flex-shrink-0 w-[160px]',
      'rounded-xl overflow-hidden',
      'bg-[var(--surface-glass)]/60 backdrop-blur-md',
      'border border-white/10',
      'p-2.5',
      job.status === 'processing' && 'ring-1 ring-emerald-500/30'
    )}>
      {/* Compact header */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          'p-1.5 rounded-full',
          statusConfig.bg,
          statusConfig.color
        )}>
          <StatusIcon className={cn(
            'w-3 h-3',
            job.status === 'processing' && 'animate-pulse'
          )} />
        </div>
        
        {job.status === 'processing' && (
          <span className="text-[10px] text-emerald-400 font-mono tabular-nums">
            {job.progress}%
          </span>
        )}
        
        {job.status === 'queued' && queuePosition && (
          <span className="text-[9px] text-white/40">#{queuePosition}</span>
        )}
      </div>
      
      {/* Prompt - single line */}
      <p className="text-[10px] text-white/60 line-clamp-1 mb-2">
        {job.prompt}
      </p>
      
      {/* Progress bar */}
      {job.status === 'processing' && (
        <div className="h-1 rounded-full bg-black/30 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}
      
      {/* Actions */}
      {job.status === 'queued' && (
        <button
          onClick={() => cancelJob(job.id)}
          className="text-[9px] text-white/40 hover:text-red-400"
        >
          Cancel
        </button>
      )}
      
      {job.status === 'completed' && job.results && job.results.length > 0 && (
        <div className="flex gap-1">
          {job.results.slice(0, 3).map((r) => (
            <button
              key={r.id}
              onClick={() => onImageClick?.(r)}
              className="w-6 h-6 rounded overflow-hidden ring-1 ring-white/10 hover:ring-white/30"
            >
              <img src={r.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      
      {job.status === 'failed' && (
        <button
          onClick={() => retryJob(job.id)}
          className="flex items-center gap-1 text-[9px] text-red-400 hover:text-red-300"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          Retry
        </button>
      )}
    </div>
  );
});

// ============================================================================
// MAIN JOB QUEUE COMPONENT
// ============================================================================
const COLLAPSE_STORAGE_KEY = 'dreamdeck-queue-collapsed';

// Custom event for opening image viewer
export const OPEN_VIEWER_EVENT = 'dreamdeck:open-viewer';

export function InlineJobQueue() {
  const jobs = useJobs();
  const activeCount = useActiveJobCount();
  const totalCost = useTotalQueueCost();
  const queueUsed = useQueueCapacityUsed();
  const queueMax = useQueueCapacityMax();
  const clearCompletedJobs = useGenerationStore((s) => s.clearCompletedJobs);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true';
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevJobCountRef = useRef(jobs.length);
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
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
  
  // Handle image click - dispatch event for ResultsGrid to handle
  const handleImageClick = useCallback((image: GeneratedImage) => {
    window.dispatchEvent(new CustomEvent(OPEN_VIEWER_EVENT, { detail: image }));
  }, []);
  
  // Handle clear with toast
  const handleClearCompleted = useCallback(() => {
    const finishedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed');
    if (finishedJobs.length === 0) return;
    
    clearCompletedJobs();
    
    toast({
      title: `Cleared ${finishedJobs.length} finished job${finishedJobs.length > 1 ? 's' : ''}`,
      description: 'Results remain in gallery',
    });
  }, [jobs, clearCompletedJobs]);
  
  // Sort jobs: processing > queued > completed > failed
  const sortedJobs = [...jobs].sort((a, b) => {
    const order = { processing: 0, queued: 1, completed: 2, failed: 3 };
    return order[a.status] - order[b.status];
  });
  
  // Queue positions for queued jobs
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
    if (jobs.length > prevJobCountRef.current && scrollRef.current && !isCollapsed) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          left: scrollRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }, 100);
    }
    prevJobCountRef.current = jobs.length;
  }, [jobs.length, isCollapsed]);
  
  // Don't render if no jobs
  if (jobs.length === 0) return null;
  
  // Status summary text
  const getStatusText = () => {
    const parts = [];
    if (processingCount > 0) parts.push(`${processingCount} creating`);
    if (queuedCount > 0) parts.push(`${queuedCount} queued`);
    if (parts.length === 0) {
      if (completedCount > 0) parts.push(`${completedCount} done`);
      if (failedCount > 0) parts.push(`${failedCount} failed`);
    }
    return parts.join(' • ');
  };

  return (
    <div className={cn(
      'w-full',
      'bg-gradient-to-b from-[var(--bg-deep)] to-transparent',
      'border-b border-white/5'
    )}>
      {/* Header - Always visible */}
      <button
        className={cn(
          'w-full flex items-center justify-between',
          'px-4 py-2.5',
          'hover:bg-white/[0.02] transition-colors duration-200'
        )}
        onClick={toggleCollapse}
      >
        {/* Left - Status */}
        <div className="flex items-center gap-3">
          {/* Activity indicator */}
          <div className="relative">
            {processingCount > 0 ? (
              <div className="relative">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <div className="absolute inset-0 w-4 h-4 bg-emerald-400/20 rounded-full animate-ping" />
              </div>
            ) : activeCount > 0 ? (
              <Clock className="w-4 h-4 text-zinc-400" />
            ) : completedCount > 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
          </div>
          
          {/* Text */}
          <div className="flex flex-col items-start">
            <span className="text-[12px] font-medium text-white/80">
              {getStatusText()}
            </span>
            {activeCount > 0 && (
              <span className="text-[10px] text-white/40 tabular-nums">
                ~${totalCost.toFixed(3)} • {queueUsed}/{queueMax} slots
              </span>
            )}
          </div>
        </div>
        
        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {(completedCount > 0 || failedCount > 0) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleClearCompleted(); }}
              className={cn(
                'p-1.5 rounded-lg',
                'text-white/40 hover:text-white/70',
                'hover:bg-white/5',
                'transition-colors duration-200'
              )}
              title="Clear finished jobs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          
          <div className={cn(
            'p-1 rounded-lg',
            'text-white/40',
            'transition-transform duration-200',
            isCollapsed && 'rotate-180'
          )}>
            <ChevronUp className="w-4 h-4" />
          </div>
        </div>
      </button>
      
      {/* Job Cards - Horizontal scroll */}
      <div className={cn(
        'overflow-hidden transition-all duration-300 ease-out',
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[200px] opacity-100'
      )}>
        <div 
          ref={scrollRef}
          className={cn(
            'flex gap-3 px-4 pb-4',
            'overflow-x-auto',
            'scrollbar-hide',
            'scroll-smooth snap-x snap-mandatory'
          )}
        >
          {sortedJobs.map(job => (
            <div key={job.id} className="snap-start">
              {isMobile ? (
                <MobileJobCard 
                  job={job} 
                  queuePosition={job.status === 'queued' ? getQueuePosition(job.id) : undefined}
                  onImageClick={handleImageClick}
                />
              ) : (
                <CompactJobCard 
                  job={job} 
                  queuePosition={job.status === 'queued' ? getQueuePosition(job.id) : undefined}
                  onImageClick={handleImageClick}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
