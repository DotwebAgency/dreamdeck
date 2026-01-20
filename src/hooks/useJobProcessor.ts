'use client';

import { useEffect, useRef } from 'react';
import { useGenerationStore, useJobs } from '@/store/useGenerationStore';
import { MAX_CONCURRENT_JOBS } from '@/lib/constants';
import { toast } from '@/components/ui/use-toast';
import { triggerBalanceRefresh } from '@/lib/events';
import type { GeneratedImage, GenerationJob } from '@/types';

// Request notification permission on load
const requestNotificationPermission = () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
};

// Send browser notification
const sendNotification = (title: string, body: string, imageUrl?: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (document.hasFocus()) return; // Don't notify if tab is focused
  
  try {
    const notification = new Notification(title, {
      body,
      icon: imageUrl || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'dreamdeck-generation',
    } as NotificationOptions);
    
    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
    
    // Focus window on click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (e) {
    // Notifications may fail in some environments
    console.warn('Notification failed:', e);
  }
};

// Update page title with job count
const updatePageTitle = (processingCount: number, queuedCount: number) => {
  if (typeof document === 'undefined') return;
  
  const baseTitle = 'DreamDeck';
  
  if (processingCount > 0 || queuedCount > 0) {
    const total = processingCount + queuedCount;
    document.title = `(${total}) ${baseTitle}`;
  } else {
    document.title = baseTitle;
  }
};

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
      
      // Send browser notification if tab not focused
      sendNotification(
        `Generated ${results.length} image${results.length > 1 ? 's' : ''}`,
        job.prompt.slice(0, 100) + (job.prompt.length > 100 ? '...' : ''),
        results[0]?.url
      );
      
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

/**
 * Hook that processes jobs from the queue.
 * Should be mounted once at the app level.
 */
export function useJobProcessor() {
  const jobs = useJobs();
  const processingIdsRef = useRef<Set<string>>(new Set());
  
  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  
  // Update page title based on job status
  useEffect(() => {
    const processingCount = jobs.filter(j => j.status === 'processing').length;
    const queuedCount = jobs.filter(j => j.status === 'queued').length;
    updatePageTitle(processingCount, queuedCount);
  }, [jobs]);
  
  // Process jobs
  useEffect(() => {
    const queuedJobs = jobs.filter(j => j.status === 'queued');
    const processingJobs = jobs.filter(j => j.status === 'processing');
    
    // Check if we can start more jobs
    if (processingJobs.length >= MAX_CONCURRENT_JOBS) return;
    if (queuedJobs.length === 0) return;
    
    // Find jobs we haven't started processing yet
    const jobsToStart = queuedJobs.filter(j => !processingIdsRef.current.has(j.id));
    if (jobsToStart.length === 0) return;
    
    // How many slots are available?
    const slotsAvailable = MAX_CONCURRENT_JOBS - processingJobs.length;
    const jobsToProcess = jobsToStart.slice(0, slotsAvailable);
    
    // Process each job
    jobsToProcess.forEach(job => {
      // Mark as being processed
      processingIdsRef.current.add(job.id);
      
      // Start async processing
      processJobAsync(job).finally(() => {
        processingIdsRef.current.delete(job.id);
      });
    });
  }, [jobs]);
}
