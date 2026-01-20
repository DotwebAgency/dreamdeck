// ============================================
// DREAMDECK TYPE DEFINITIONS
// ============================================

// === JOB QUEUE TYPES ===
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface GenerationJob {
  id: string;
  status: JobStatus;
  progress: number; // 0-100
  
  // Settings snapshot (immutable once created)
  prompt: string;
  resolution: { width: number; height: number };
  seed: number;
  numImages: number;
  mode: GenerationMode;
  referenceImages: { url: string; priority: number }[];
  
  // Timing
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  
  // Results
  results?: GeneratedImage[];
  error?: string;
}

// === IMAGE SLOT TYPES ===
export interface ImageSlot {
  id: string;
  file: File | null;
  preview: string | null; // Object URL or data URL
  name: string;
}

export type SlotsArray = (ImageSlot | null)[];

// === REFERENCE IMAGE (for components) ===
export interface ReferenceImage {
  id: string;
  url: string;
  type: 'local' | 'url';
  name?: string;
}

// === GENERATED IMAGE ===
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  width: number;
  height: number;
  seed?: number;
  timestamp: number;
}

// === RESOLUTION TYPES ===
export interface Resolution {
  width: number;
  height: number;
  label: string;
  ratio: string;
}

export const RESOLUTION_PRESETS: Record<string, Resolution> = {
  square: { width: 2048, height: 2048, label: 'Square', ratio: '1:1' },
  portrait: { width: 1440, height: 2560, label: 'Portrait', ratio: '9:16' },
  landscape: { width: 2560, height: 1440, label: 'Landscape', ratio: '16:9' },
  ultrawide: { width: 3072, height: 1280, label: 'Ultrawide', ratio: '21:9' },
  max: { width: 4096, height: 4096, label: 'MAX', ratio: '1:1' },
} as const;

export type ResolutionPreset = keyof typeof RESOLUTION_PRESETS;

// === GENERATION TYPES ===
export type GenerationMode = 'std' | 'turbo';

export interface GenerationSettings {
  prompt: string;
  width: number;
  height: number;
  seed: number;
  numImages: number;
  mode: GenerationMode;
}

export interface GenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  seed: number;
  resolution: { width: number; height: number };
  timestamp: number;
  mode: GenerationMode;
}

// === API TYPES ===
export interface GenerateRequest {
  prompt: string;
  slots: (SlotData | null)[];
  width: number;
  height: number;
  seed: number;
  numImages: number;
  mode: GenerationMode;
}

export interface SlotData {
  id: string;
  dataUrl: string;
}

export interface GenerateResponse {
  success: boolean;
  results?: {
    id: string;
    imageUrl: string;
    seed: number;
  }[];
  error?: string;
  requestId?: string;
}

export interface BalanceResponse {
  success: boolean;
  balance?: number;
  error?: string;
}

export interface UsageRequest {
  startTime: string;
  endTime: string;
  modelUuid?: string;
}

export interface UsageResponse {
  success: boolean;
  statistics?: {
    perModelUsage: { modelName: string; usageCount: number; totalCost: number }[];
    dailyUsage: { date: string; totalUsage: number; totalCost: number }[];
  };
  summary?: {
    totalModelsUsed: number;
    totalUsageCount: number;
    totalCost: number;
  };
  error?: string;
}

// === HISTORY TYPES ===
export interface HistoryEntry {
  id: string;
  timestamp: number;
  prompt: string;
  seed: number;
  resolution: { width: number; height: number };
  referenceCount: number;
  imageBlob?: Blob;
  imageUrl?: string;
  mode: GenerationMode;
}

// === UI STATE TYPES ===
export type GenerationStatus = 'idle' | 'generating' | 'polling' | 'completed' | 'failed';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

// === BALANCE STATE ===
export type BalanceStatus = 'healthy' | 'warning' | 'critical';

export const getBalanceStatus = (balance: number): BalanceStatus => {
  if (balance >= 10) return 'healthy';
  if (balance >= 2) return 'warning';
  return 'critical';
};
