'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Layers, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { JobCard } from './JobCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { MAX_CONCURRENT_JOBS } from '@/lib/constants';
import { triggerBalanceRefresh } from '@/lib/events';
import type { GeneratedImage, GenerationJob } from '@/types';

// Process a single job - standalone function to avoid dependency issues
async function processJobAsync(job: GenerationJob) {
  const jobId = job.id;
  const store = useGenerationStore.getState();
  
  // Start processing
  store.updateJobStatus(jobId, 'processing', Date.now());
  
  // Simulate progress
  const is4K = job.resolution.width >= 4000 || job.resolution.height >= 4000;
  let progress = 0;
  
  const progressInterval = setInterval(() => {
    progress += Math.random() * (is4K ? 4 : 6);
    if (progress > 90) progress = 90 + Math.random() * 2;
    useGenerationStore.getState().updateJobProgress(jobId, Math.min(progress, 92));
  }, 500);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: job.prompt,
        width: job.resolution.width,
        height: job.resolution.height,
        seed: job.seed === -1 ? undefined : job.seed,
        num_images: job.numImages,
        mode: job.mode,
        reference_images: job.referenceImages,
      }),
    });
    
    clearInterval(progressInterval);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Generation failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.images && data.images.length > 0) {
      const results: GeneratedImage[] = data.images.map((url: string, i: number) => ({
        id: `${jobId}-${i}-${Date.now()}`,
        url,
        prompt: job.prompt,
        width: job.resolution.width,
        height: job.resolution.height,
        seed: data.seed || job.seed,
        timestamp: Date.now(),
      }));
      
      useGenerationStore.getState().completeJob(jobId, results);
      
      toast({
        variant: 'success',
        title: `Generated ${results.length} image${results.length > 1 ? 's' : ''}`,
        description: `${job.resolution.width}×${job.resolution.height} • Seed: ${data.seed || 'random'}`,
      });
      
      triggerBalanceRefresh();
    } else {
      throw new Error('No images were generated');
    }
  } catch (err) {
    clearInterval(progressInterval);
    const message = err instanceof Error ? err.message : 'Generation failed';
    useGenerationStore.getState().failJob(jobId, message);
    
    toast({
      variant: 'destructive',
      title: 'Generation failed',
      description: message,
    });
  }
}

export function JobQueue() {
  const jobs = useGenerationStore((state) => state.jobs);
  const clearCompletedJobs = useGenerationStore((state) => state.clearCompletedJobs);
  
  const [isExpanded, setIsExpanded] = useState(true);
  const processingIdsRef = useRef<Set<string>>(new Set());
  
  // Process queued jobs effect - minimal dependencies
  useEffect(() => {
    const queuedJobs = jobs.filter(j => j.status === 'queued');
    const processingJobs = jobs.filter(j => j.status === 'processing');
    
    // Check if we can start more jobs
    if (processingJobs.length >= MAX_CONCURRENT_JOBS) return;
    if (queuedJobs.length === 0) return;
    
    // Find jobs we haven't started processing yet (not in our tracking set)
    const jobsToStart = queuedJobs.filter(j => !processingIdsRef.current.has(j.id));
    if (jobsToStart.length === 0) return;
    
    // How many slots are available?
    const slotsAvailable = MAX_CONCURRENT_JOBS - processingJobs.length;
    const jobsToProcess = jobsToStart.slice(0, slotsAvailable);
    
    // Process each job
    jobsToProcess.forEach(job => {
      // Mark as being processed (prevents re-triggering)
      processingIdsRef.current.add(job.id);
      
      // Start async processing
      processJobAsync(job).finally(() => {
        // When done, remove from tracking (allows cleanup)
        processingIdsRef.current.delete(job.id);
      });
    });
  }, [jobs]); // Only depend on jobs array
  
  // Count by status
  const processingCount = jobs.filter(j => j.status === 'processing').length;
  const queuedCount = jobs.filter(j => j.status === 'queued').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;
  
  // Don't render if no jobs
  if (jobs.length === 0) return null;
  
  return (
    <div 
      className={cn(
        'fixed z-50',
        // Mobile: full width at bottom above the bottom bar
        'left-3 right-3 bottom-[calc(88px+env(safe-area-inset-bottom))]',
        // Desktop: positioned at bottom right
        'sm:left-auto sm:right-6 sm:bottom-6 sm:w-[360px]',
        'max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-120px)]',
        'rounded-2xl',
        'bg-[var(--bg-elevated)]/95 backdrop-blur-xl',
        'border border-[var(--border-default)]',
        'shadow-2xl',
        'flex flex-col',
        'animate-slide-up'
      )}
    >
      {/* Header */}
      <div 
        className={cn(
          'flex items-center justify-between',
          'px-4 py-3',
          'border-b border-[var(--border-subtle)]',
          'cursor-pointer'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Layers className="w-5 h-5 text-[var(--text-secondary)]" />
            {processingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          
          <div>
            <h3 className="text-[13px] font-medium text-[var(--text-primary)]">
              Job Queue
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">
              {processingCount > 0 && `${processingCount} processing`}
              {processingCount > 0 && queuedCount > 0 && ' • '}
              {queuedCount > 0 && `${queuedCount} queued`}
              {(processingCount === 0 && queuedCount === 0 && completedCount > 0) && `${completedCount} completed`}
              {(processingCount === 0 && queuedCount === 0 && completedCount === 0 && failedCount > 0) && `${failedCount} failed`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {(completedCount > 0 || failedCount > 0) && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                clearCompletedJobs();
              }}
              className="text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
              title="Clear finished jobs"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-[var(--text-subtle)]"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Job list */}
      {isExpanded && (
        <div 
          className={cn(
            'flex-1 overflow-y-auto',
            'p-3 space-y-2',
            'scrollbar-hide hover:scrollbar-default'
          )}
        >
          {/* Processing jobs first */}
          {jobs
            .filter(j => j.status === 'processing')
            .map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          
          {/* Then queued */}
          {jobs
            .filter(j => j.status === 'queued')
            .map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          
          {/* Then completed */}
          {jobs
            .filter(j => j.status === 'completed')
            .map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          
          {/* Then failed */}
          {jobs
            .filter(j => j.status === 'failed')
            .map(job => (
              <JobCard key={job.id} job={job} />
            ))}
        </div>
      )}
      
      {/* Collapsed summary */}
      {!isExpanded && processingCount > 0 && (
        <div className="px-4 py-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-[11px] text-[var(--text-muted)]">
              {processingCount} job{processingCount > 1 ? 's' : ''} in progress...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
