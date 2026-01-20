// ============================================
// DREAMDECK CONSTANTS
// Optimized for Wavespeed Seedream v4.5 API
// Max Resolution: 4096x4096 (16.7MP)
// ============================================

// === SLOT CONFIGURATION ===
export const TOTAL_SLOTS = 10;
export const PRIMARY_SLOT_INDEX = 0;
export const SECONDARY_SLOT_INDICES = [1, 2];
export const TERTIARY_SLOT_INDICES = [3, 4, 5, 6, 7, 8, 9];

// === RESOLUTION PRESETS (MAXIMIZED FOR API) ===
// Seedream v4.5 supports up to 4096x4096 (4K)
// Presets optimized for maximum quality at each aspect ratio
export const RESOLUTION_PRESETS = [
  // Standard quality (faster, ~4MP)
  { width: 2048, height: 2048, label: '1:1', category: 'standard' },
  { width: 2432, height: 1624, label: '3:2', category: 'standard' },
  { width: 1624, height: 2432, label: '2:3', category: 'standard' },
  { width: 2560, height: 1440, label: '16:9', category: 'standard' },
  { width: 1440, height: 2560, label: '9:16', category: 'standard' },
  { width: 2304, height: 1728, label: '4:3', category: 'standard' },
  { width: 1728, height: 2304, label: '3:4', category: 'standard' },
  { width: 2880, height: 1232, label: '21:9', category: 'standard' },
  
  // Maximum quality (slower, ~16MP / 4K)
  { width: 4096, height: 4096, label: '1:1 4K', category: 'max' },
  { width: 4096, height: 2730, label: '3:2 4K', category: 'max' },
  { width: 2730, height: 4096, label: '2:3 4K', category: 'max' },
  { width: 4096, height: 2304, label: '16:9 4K', category: 'max' },
  { width: 2304, height: 4096, label: '9:16 4K', category: 'max' },
  { width: 4096, height: 3072, label: '4:3 4K', category: 'max' },
  { width: 3072, height: 4096, label: '3:4 4K', category: 'max' },
] as const;

// === RESOLUTION LIMITS (Per Wavespeed API) ===
export const MIN_DIMENSION = 512;
export const MAX_DIMENSION = 4096;  // 4K support!
export const MAX_PIXELS = 16_777_216; // 16.7 megapixels
export const DIMENSION_STEP = 64;

// === GENERATION LIMITS ===
export const MIN_IMAGES = 1;
export const MAX_IMAGES = 15;  // API supports up to 15!
export const MIN_SEED = -1;
export const MAX_SEED = 2147483647;

// === JOB QUEUE CONFIGURATION ===
export const MAX_CONCURRENT_JOBS = 3;  // Process up to 3 jobs simultaneously
export const MAX_QUEUED_JOBS = 10;     // Maximum jobs in queue

// === DEFAULT RESOLUTION (9:16 4K - Story format) ===
export const DEFAULT_RESOLUTION = { width: 2304, height: 4096 };
export const DEFAULT_QUALITY_TAB = 'max' as const;

// === API CONFIGURATION ===
export const WAVESPEED_MODELS = {
  SEEDREAM_V45: 'bytedance/seedream-v4.5',
  SEEDREAM_V45_EDIT: 'bytedance/seedream-v4.5/edit',
  SEEDREAM_V45_SEQUENTIAL: 'bytedance/seedream-v4.5/edit-sequential',
} as const;

// API Endpoints (v3)
export const API_ENDPOINTS = {
  TEXT_TO_IMAGE: '/api/v3/bytedance/seedream-v4.5',
  IMAGE_EDIT: '/api/v3/bytedance/seedream-v4.5/edit',
  SEQUENTIAL_EDIT: '/api/v3/bytedance/seedream-v4.5/edit-sequential',
  BALANCE: '/api/v3/balance',
} as const;

// === POLLING CONFIGURATION ===
export const POLL_INTERVAL_MS = 2000;
export const MAX_POLL_ATTEMPTS = 60; // 2 minutes max
export const BALANCE_REFRESH_INTERVAL_MS = 60000; // 1 minute

// === FILE CONFIGURATION ===
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// === UI CONFIGURATION ===
export const SIDEBAR_WIDTH = 320;
export const HEADER_HEIGHT = 56;
export const RACK_HEIGHT = 120;

// === KEYBOARD SHORTCUTS ===
export const SHORTCUTS = {
  GENERATE: 'mod+enter',
  SAVE: 'mod+s',
  PASTE: 'mod+v',
  UNDO: 'mod+z',
  SLOT_1: '1',
  SLOT_2: '2',
  SLOT_3: '3',
  SLOT_4: '4',
  SLOT_5: '5',
  SLOT_6: '6',
  SLOT_7: '7',
  SLOT_8: '8',
  SLOT_9: '9',
  SLOT_10: '0',
} as const;

// === PRICING (for display) ===
export const COST_PER_IMAGE = 0.027; // $0.027 per image
