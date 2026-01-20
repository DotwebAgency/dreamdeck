import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { GeneratedImage, ReferenceImage, GenerationMode } from '@/types';
import { TOTAL_SLOTS } from '@/lib/constants';

// Utility to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// === REFERENCE SLOTS TYPE ===
export type { ReferenceImage };

// === STATE INTERFACE ===
interface GenerationState {
  // Reference Slots (10 fixed)
  referenceSlots: (ReferenceImage | null)[];
  
  // Generation Settings
  prompt: string;
  resolution: { width: number; height: number };
  seed: number;
  numImages: number;
  mode: GenerationMode;
  
  // UI State
  isGenerating: boolean;
  progress: number;
  error: string | null;
  
  // Results
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
  
  // Actions - Generation
  setIsGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  
  // Actions - Results
  addResults: (images: GeneratedImage[]) => void;
  removeResult: (id: string) => void;
  clearResults: () => void;
  
  // Actions - Settings
  setAutoSave: (enabled: boolean) => void;
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
        resolution: { width: 1024, height: 1024 },
        seed: -1,
        numImages: 1,
        mode: 'std',
        isGenerating: false,
        progress: 0,
        error: null,
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

        // === GENERATION ACTIONS ===
        setIsGenerating: (isGenerating) => set({ isGenerating }),
        setProgress: (progress) => set({ progress }),
        setError: (error) => set({ error }),

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
        }),
      }
    ),
    { name: 'DreamDeck' }
  )
);

// === SELECTORS ===
export const useSlots = () => useGenerationStore((state) => state.referenceSlots);
export const usePrompt = () => useGenerationStore((state) => state.prompt);
export const useResolution = () => useGenerationStore((state) => state.resolution);
export const useIsGenerating = () => useGenerationStore((state) => state.isGenerating);
export const useProgress = () => useGenerationStore((state) => state.progress);
export const useError = () => useGenerationStore((state) => state.error);
export const useResults = () => useGenerationStore((state) => state.results);
export const useAutoSave = () => useGenerationStore((state) => state.autoSave);

// === COMPUTED SELECTORS ===
export const useFilledSlotCount = () => useGenerationStore((state) => 
  state.referenceSlots.filter(slot => slot !== null).length
);

export const useCanGenerate = () => useGenerationStore((state) => 
  state.prompt.trim().length > 0 && !state.isGenerating
);
