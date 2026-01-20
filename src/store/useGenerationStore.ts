import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { GeneratedImage, ReferenceImage, GenerationMode, GenerationJob, JobStatus } from '@/types';
import { TOTAL_SLOTS, DEFAULT_RESOLUTION, MAX_CONCURRENT_JOBS, MAX_QUEUED_JOBS } from '@/lib/constants';

// Utility to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

// === REFERENCE SLOTS TYPE ===
export type { ReferenceImage };

// === STATE INTERFACE ===
interface GenerationState {
  // Reference Slots (10 fixed)
  referenceSlots: (ReferenceImage | null)[];
  
  // Generation Settings (defaults for next job)
  prompt: string;
  resolution: { width: number; height: number };
  seed: number;
  numImages: number;
  mode: GenerationMode;
  
  // Job Queue System
  jobs: GenerationJob[];
  
  // Results (from completed jobs)
  results: GeneratedImage[];
  
  // Settings
  autoSave: boolean;
  
  // Actions - Slots
  setSlot: (index: number, image: ReferenceImage) => void;
  removeSlot: (index: number) => void;
  reorderSlots: (fromIndex: number, toIndex: number) => void;
  clearAllSlots: () => void;
  
  // Actions - Settings
  setPrompt: (prompt: string) => void;
  setResolution: (resolution: { width: number; height: number }) => void;
  setSeed: (seed: number) => void;
  setNumImages: (num: number) => void;
  setMode: (mode: GenerationMode) => void;
  
  // Actions - Job Queue
  createJob: () => string | null;  // Returns job ID or null if queue full
  updateJobProgress: (jobId: string, progress: number) => void;
  updateJobStatus: (jobId: string, status: JobStatus, startedAt?: number) => void;
  completeJob: (jobId: string, results: GeneratedImage[]) => void;
  failJob: (jobId: string, error: string) => void;
  removeJob: (jobId: string) => void;
  clearCompletedJobs: () => void;
  
  // Actions - Results
  addResults: (images: GeneratedImage[]) => void;
  removeResult: (id: string) => void;
  clearResults: () => void;
  
  // Actions - Settings
  setAutoSave: (enabled: boolean) => void;
  
  // Computed helpers (as functions, not selectors)
  getActiveJobCount: () => number;
  getQueuedJobs: () => GenerationJob[];
  getProcessingJobs: () => GenerationJob[];
  canQueueJob: () => boolean;
}

// === INITIAL STATE HELPERS ===
const createEmptySlots = (): (ReferenceImage | null)[] => Array(TOTAL_SLOTS).fill(null);

// === STORE IMPLEMENTATION ===
export const useGenerationStore = create<GenerationState>()(
  devtools(
    persist(
      (set, get) => ({
        // === INITIAL STATE ===
        referenceSlots: createEmptySlots(),
        prompt: '',
        resolution: DEFAULT_RESOLUTION,  // 9:16 4K by default!
        seed: -1,
        numImages: 1,
        mode: 'std',
        jobs: [],
        results: [],
        autoSave: false,

        // === SLOT ACTIONS ===
        setSlot: (index, image) => {
          if (index < 0 || index >= TOTAL_SLOTS) return;
          set((state) => {
            const newSlots = [...state.referenceSlots];
            newSlots[index] = image;
            return { referenceSlots: newSlots };
          });
        },

        removeSlot: (index) => {
          if (index < 0 || index >= TOTAL_SLOTS) return;
          set((state) => {
            const newSlots = [...state.referenceSlots];
            newSlots[index] = null;
            return { referenceSlots: newSlots };
          });
        },

        reorderSlots: (fromIndex, toIndex) => {
          if (
            fromIndex < 0 || fromIndex >= TOTAL_SLOTS ||
            toIndex < 0 || toIndex >= TOTAL_SLOTS ||
            fromIndex === toIndex
          ) return;
          
          set((state) => {
            const newSlots = [...state.referenceSlots];
            const [removed] = newSlots.splice(fromIndex, 1);
            newSlots.splice(toIndex, 0, removed);
            return { referenceSlots: newSlots };
          });
        },

        clearAllSlots: () => {
          set({ referenceSlots: createEmptySlots() });
        },

        // === SETTINGS ACTIONS ===
        setPrompt: (prompt) => set({ prompt }),
        
        setResolution: (resolution) => {
          const maxPixels = 16_777_216;
          if (resolution.width * resolution.height <= maxPixels && 
              resolution.width >= 512 && resolution.height >= 512) {
            set({ resolution });
          }
        },
        
        setSeed: (seed) => set({ seed }),
        setNumImages: (numImages) => set({ numImages: Math.min(Math.max(1, numImages), 4) }),
        setMode: (mode) => set({ mode }),

        // === JOB QUEUE ACTIONS ===
        createJob: () => {
          const state = get();
          
          // Check if queue is full
          const totalJobs = state.jobs.filter(j => j.status !== 'completed' && j.status !== 'failed').length;
          if (totalJobs >= MAX_QUEUED_JOBS) {
            return null;
          }
          
          // Validate prompt
          if (!state.prompt.trim()) {
            return null;
          }
          
          // Snapshot current settings into a new job
          const jobId = generateId();
          const newJob: GenerationJob = {
            id: jobId,
            status: 'queued',
            progress: 0,
            prompt: state.prompt.trim(),
            resolution: { ...state.resolution },
            seed: state.seed,
            numImages: state.numImages,
            mode: state.mode,
            referenceImages: state.referenceSlots
              .map((slot, index) => slot ? { url: slot.url, priority: index } : null)
              .filter((item): item is { url: string; priority: number } => item !== null),
            createdAt: Date.now(),
          };
          
          set((state) => ({
            jobs: [...state.jobs, newJob],
          }));
          
          return jobId;
        },
        
        updateJobProgress: (jobId, progress) => {
          set((state) => ({
            jobs: state.jobs.map(job =>
              job.id === jobId ? { ...job, progress: Math.min(100, Math.max(0, progress)) } : job
            ),
          }));
        },
        
        updateJobStatus: (jobId, status, startedAt) => {
          set((state) => ({
            jobs: state.jobs.map(job =>
              job.id === jobId 
                ? { 
                    ...job, 
                    status,
                    ...(startedAt && { startedAt }),
                  } 
                : job
            ),
          }));
        },
        
        completeJob: (jobId, results) => {
          const now = Date.now();
          set((state) => ({
            jobs: state.jobs.map(job =>
              job.id === jobId
                ? { ...job, status: 'completed' as JobStatus, progress: 100, results, completedAt: now }
                : job
            ),
            // Also add results to the main results array
            results: [...results, ...state.results],
          }));
        },
        
        failJob: (jobId, error) => {
          const now = Date.now();
          set((state) => ({
            jobs: state.jobs.map(job =>
              job.id === jobId
                ? { ...job, status: 'failed' as JobStatus, error, completedAt: now }
                : job
            ),
          }));
        },
        
        removeJob: (jobId) => {
          set((state) => ({
            jobs: state.jobs.filter(job => job.id !== jobId),
          }));
        },
        
        clearCompletedJobs: () => {
          set((state) => ({
            jobs: state.jobs.filter(job => job.status !== 'completed' && job.status !== 'failed'),
          }));
        },

        // === RESULTS ACTIONS ===
        addResults: (images) => {
          set((state) => ({
            results: [...images, ...state.results],
          }));
        },

        removeResult: (id) => {
          set((state) => ({
            results: state.results.filter((r) => r.id !== id),
          }));
        },

        clearResults: () => set({ results: [] }),

        // === SETTINGS ACTIONS ===
        setAutoSave: (autoSave) => set({ autoSave }),
        
        // === COMPUTED HELPERS ===
        getActiveJobCount: () => {
          const state = get();
          return state.jobs.filter(j => j.status === 'processing').length;
        },
        
        getQueuedJobs: () => {
          const state = get();
          return state.jobs.filter(j => j.status === 'queued');
        },
        
        getProcessingJobs: () => {
          const state = get();
          return state.jobs.filter(j => j.status === 'processing');
        },
        
        canQueueJob: () => {
          const state = get();
          const activeJobs = state.jobs.filter(j => j.status !== 'completed' && j.status !== 'failed').length;
          return activeJobs < MAX_QUEUED_JOBS && state.prompt.trim().length > 0;
        },
      }),
      {
        name: 'dreamdeck-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist settings, not ephemeral state
          prompt: state.prompt,
          resolution: state.resolution,
          seed: state.seed,
          numImages: state.numImages,
          mode: state.mode,
          autoSave: state.autoSave,
          // Don't persist jobs (they're ephemeral)
        }),
      }
    ),
    { name: 'DreamDeck' }
  )
);

// === SELECTORS ===
// Direct state selectors (primitive values / stable references)
export const useSlots = () => useGenerationStore((state) => state.referenceSlots);
export const usePrompt = () => useGenerationStore((state) => state.prompt);
export const useResolution = () => useGenerationStore((state) => state.resolution);
export const useResults = () => useGenerationStore((state) => state.results);
export const useAutoSave = () => useGenerationStore((state) => state.autoSave);

// === JOB SELECTORS ===
// Use the raw jobs array (stable reference from store)
export const useJobs = () => useGenerationStore((state) => state.jobs);

// Derived array selectors - these return new arrays but that's ok for display purposes
// The infinite loop was fixed in JobQueue by using getState() outside the component
export const useActiveJobs = () => useGenerationStore(
  (state) => state.jobs.filter(j => j.status === 'processing' || j.status === 'queued')
);
export const useProcessingJobs = () => useGenerationStore(
  (state) => state.jobs.filter(j => j.status === 'processing')
);
export const useQueuedJobs = () => useGenerationStore(
  (state) => state.jobs.filter(j => j.status === 'queued')
);
export const useCompletedJobs = () => useGenerationStore(
  (state) => state.jobs.filter(j => j.status === 'completed')
);

// === COMPUTED SELECTORS ===
// Primitive returns (number/boolean) are stable by default
export const useFilledSlotCount = () => useGenerationStore((state) => 
  state.referenceSlots.filter(slot => slot !== null).length
);

export const useCanGenerate = () => useGenerationStore((state) => {
  const activeJobs = state.jobs.filter(j => j.status !== 'completed' && j.status !== 'failed').length;
  return state.prompt.trim().length > 0 && activeJobs < MAX_QUEUED_JOBS;
});

// Boolean selectors are stable
export const useIsAnyJobRunning = () => useGenerationStore((state) =>
  state.jobs.some(j => j.status === 'processing' || j.status === 'queued')
);

// Legacy compatibility - returns true if any job is processing
export const useIsGenerating = () => useGenerationStore((state) =>
  state.jobs.some(j => j.status === 'processing')
);

// Legacy compatibility - returns progress of first processing job
export const useProgress = () => useGenerationStore((state) => {
  const processingJob = state.jobs.find(j => j.status === 'processing');
  return processingJob?.progress ?? 0;
});

export const useError = () => useGenerationStore((state) => {
  const failedJob = state.jobs.find(j => j.status === 'failed');
  return failedJob?.error ?? null;
});
