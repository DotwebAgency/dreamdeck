'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { 
  Clock, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ImageIcon,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import type { GenerationJob } from '@/types';
import { useGenerationStore } from '@/store/useGenerationStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: GenerationJob;
  onRetry?: () => void;
}

const STATUS_CONFIG = {
  queued: {
    icon: Clock,
    label: 'Queued',
    color: 'text-[var(--text-muted)]',
    bg: 'bg-[var(--bg-soft)]',
    dotColor: 'bg-[var(--text-muted)]',
    animate: false,
  },
  processing: {
    icon: Sparkles,
    label: 'Creating',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    dotColor: 'bg-emerald-400',
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    label: 'Complete',
    color: 'text-[var(--text-primary)]',
    bg: 'bg-[var(--accent-primary)]/10',
    dotColor: 'bg-[var(--success)]',
    animate: false,
  },
  failed: {
    icon: AlertCircle,
    label: 'Failed',
    color: 'text-[var(--error)]',
    bg: 'bg-[var(--error)]/10',
    dotColor: 'bg-[var(--error)]',
    animate: false,
  },
};

const PROGRESS_MESSAGES = [
  'Initializing model...',
  'Loading neural networks...',
  'Processing prompt...',
  'Generating composition...',
  'Rendering details...',
  'Applying style...',
  'Enhancing quality...',
  'Finalizing image...',
  'Almost there...',
];

export const JobCard = memo(function JobCard({ job, onRetry }: JobCardProps) {
  const { removeJob } = useGenerationStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const config = STATUS_CONFIG[job.status];
  const StatusIcon = config.icon;
  
  const is4K = job.resolution.width >= 4000 || job.resolution.height >= 4000;
  const aspectRatio = getAspectRatioLabel(job.resolution.width, job.resolution.height);
  
  // Timer for elapsed time
  useEffect(() => {
    if (job.status === 'processing' && job.startedAt) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - job.startedAt!) / 1000));
      }, 100);
    } else if (job.status === 'completed' && job.startedAt && job.completedAt) {
      setElapsedTime(Math.floor((job.completedAt - job.startedAt) / 1000));
    } else {
      setElapsedTime(0);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [job.status, job.startedAt, job.completedAt]);
  
  // Rotate progress messages
  useEffect(() => {
    if (job.status !== 'processing') return;
    
    const idx = Math.min(
      Math.floor(job.progress / (100 / PROGRESS_MESSAGES.length)),
      PROGRESS_MESSAGES.length - 1
    );
    setMessageIndex(idx);
  }, [job.progress, job.status]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };
  
  const handleDismiss = () => {
    removeJob(job.id);
  };
  
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'rounded-xl',
        'bg-[var(--bg-elevated)]',
        'border border-[var(--border-subtle)]',
        'transition-all duration-300',
        'animate-fade-in',
        job.status === 'processing' && 'ring-1 ring-emerald-500/20',
        job.status === 'completed' && 'opacity-80 hover:opacity-100'
      )}
    >
      {/* Gradient top accent for processing */}
      {job.status === 'processing' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 animate-pulse" />
      )}
      
      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Status dot */}
            <div 
              className={cn(
                'w-2 h-2 rounded-full',
                config.dotColor,
                config.animate && 'animate-pulse'
              )} 
            />
            
            {/* Status badge */}
            <span 
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider',
                'px-2 py-0.5 rounded-full',
                config.bg,
                config.color
              )}
            >
              {config.label}
            </span>
            
            {/* 4K badge */}
            {is4K && (
              <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500">
                4K
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Time */}
            {(job.status === 'processing' || job.status === 'completed') && (
              <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
                <Clock className="w-3 h-3" />
                {formatTime(elapsedTime)}
              </span>
            )}
            
            {/* Dismiss button */}
            {(job.status === 'completed' || job.status === 'failed') && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDismiss}
                className="w-6 h-6 text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Prompt preview */}
        <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {job.prompt}
        </p>
        
        {/* Resolution info */}
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-subtle)]">
          <span className="font-mono">{job.resolution.width}×{job.resolution.height}</span>
          <span>•</span>
          <span>{aspectRatio}</span>
          {job.numImages > 1 && (
            <>
              <span>•</span>
              <span>{job.numImages} images</span>
            </>
          )}
        </div>
        
        {/* Progress section (only for processing/queued) */}
        {(job.status === 'processing' || job.status === 'queued') && (
          <div className="space-y-2 pt-1">
            <Progress 
              value={job.progress} 
              variant={job.status === 'processing' ? 'gradient' : 'default'}
              showGlow={job.status === 'processing'}
              className="h-1.5"
            />
            
            {job.status === 'processing' && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-muted)] animate-pulse">
                  {PROGRESS_MESSAGES[messageIndex]}
                </span>
                <span className="text-[10px] text-[var(--text-subtle)] font-mono">
                  {Math.round(job.progress)}%
                </span>
              </div>
            )}
            
            {job.status === 'queued' && (
              <span className="text-[10px] text-[var(--text-subtle)]">
                Waiting in queue...
              </span>
            )}
          </div>
        )}
        
        {/* Completed results preview */}
        {job.status === 'completed' && job.results && job.results.length > 0 && (
          <div className="flex gap-2 pt-1">
            {job.results.slice(0, 4).map((result, idx) => (
              <div 
                key={result.id}
                className={cn(
                  'relative w-12 h-12 rounded-lg overflow-hidden',
                  'bg-[var(--bg-soft)]',
                  'border border-[var(--border-subtle)]',
                  'animate-scale-in'
                )}
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                <img
                  src={result.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {job.results.length > 4 && (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--bg-soft)] border border-[var(--border-subtle)]">
                <span className="text-[11px] text-[var(--text-muted)]">
                  +{job.results.length - 4}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Error message */}
        {job.status === 'failed' && job.error && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
            <AlertCircle className="w-4 h-4 text-[var(--error)] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[var(--error)] line-clamp-2">
                {job.error}
              </p>
              {onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRetry}
                  className="mt-2 h-7 text-[11px] gap-1.5 text-[var(--error)] hover:text-[var(--error)]"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Helper to get aspect ratio label
function getAspectRatioLabel(width: number, height: number): string {
  const ratio = width / height;
  
  if (Math.abs(ratio - 1) < 0.05) return '1:1';
  if (Math.abs(ratio - 16/9) < 0.05) return '16:9';
  if (Math.abs(ratio - 9/16) < 0.05) return '9:16';
  if (Math.abs(ratio - 4/3) < 0.05) return '4:3';
  if (Math.abs(ratio - 3/4) < 0.05) return '3:4';
  if (Math.abs(ratio - 3/2) < 0.05) return '3:2';
  if (Math.abs(ratio - 2/3) < 0.05) return '2:3';
  if (Math.abs(ratio - 21/9) < 0.05) return '21:9';
  
  return 'Custom';
}
