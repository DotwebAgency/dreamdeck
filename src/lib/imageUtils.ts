/**
 * Image compression utilities optimized for Wavespeed Seedream v4.5 API
 * 
 * Key Design Decisions:
 * - MAX_DIMENSION = 2560px (balanced for quality vs Vercel limits)
 * - MAX_FILE_SIZE = 3MB (enough for detailed reference images)
 * - MIN_QUALITY = 0.65 (never degrade below acceptable threshold)
 * - WebP first, JPEG fallback (better compression efficiency)
 * - Progressive degradation: quality first, then dimensions
 */

// === CONFIGURATION ===
const MAX_DIMENSION = 2560;        // Max width/height - balanced for 4K outputs
const INITIAL_QUALITY = 0.92;      // Start high quality
const MIN_QUALITY = 0.65;          // Never go below this
const QUALITY_STEP = 0.08;         // Reduction per iteration
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB target per image
const BASE64_OVERHEAD = 1.37;      // Base64 encoding overhead factor

// Dimension scale steps for progressive resize
const DIMENSION_SCALES = [1.0, 0.85, 0.75, 0.65, 0.55];

// === TYPES ===
export interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  originalDimensions: { width: number; height: number };
  finalDimensions: { width: number; height: number };
  format: 'webp' | 'jpeg';
  quality: number;
}

export interface CompressionOptions {
  maxDimension?: number;
  maxFileSize?: number;
  preferWebP?: boolean;
}

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Load an image from a data URL
 */
function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Calculate scaled dimensions maintaining aspect ratio
 */
function calculateScaledDimensions(
  width: number,
  height: number,
  maxDim: number,
  scale: number = 1.0
): { width: number; height: number } {
  const effectiveMax = maxDim * scale;
  
  if (width <= effectiveMax && height <= effectiveMax && scale === 1.0) {
    return { width, height };
  }
  
  let newWidth = width * scale;
  let newHeight = height * scale;
  
  if (newWidth > effectiveMax || newHeight > effectiveMax) {
    if (newWidth > newHeight) {
      newHeight = Math.round((newHeight * effectiveMax) / newWidth);
      newWidth = effectiveMax;
        } else {
      newWidth = Math.round((newWidth * effectiveMax) / newHeight);
      newHeight = effectiveMax;
    }
  }
  
  // Round to nearest even number (better for encoding)
  return {
    width: Math.round(newWidth / 2) * 2,
    height: Math.round(newHeight / 2) * 2,
  };
}

/**
 * Compress image to canvas with given dimensions
 */
function compressToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { 
    alpha: false,  // Disable alpha for smaller files
    desynchronized: true  // Performance optimization
  });
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

      canvas.width = width;
      canvas.height = height;
  
  // Use high-quality image rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Fill with white background (prevents transparency issues)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  
  // Draw image
      ctx.drawImage(img, 0, 0, width, height);

  return canvas;
}

/**
 * Try to export as WebP, fallback to JPEG if not supported
 */
function exportCanvas(
  canvas: HTMLCanvasElement,
  quality: number,
  preferWebP: boolean = true
): { dataUrl: string; format: 'webp' | 'jpeg' } {
  if (preferWebP) {
    const webpDataUrl = canvas.toDataURL('image/webp', quality);
    // Check if browser actually supports WebP
    if (webpDataUrl.startsWith('data:image/webp')) {
      return { dataUrl: webpDataUrl, format: 'webp' };
    }
  }
  
  const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
  return { dataUrl: jpegDataUrl, format: 'jpeg' };
}

/**
 * Estimate file size from data URL
 */
export function estimateBase64Size(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || dataUrl;
  // Base64 encodes 3 bytes as 4 characters, minus padding
  const padding = (base64.match(/=/g) || []).length;
  return Math.ceil((base64.length * 3) / 4) - padding;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Smart compression algorithm - prioritizes quality over dimensions
 * 
 * Strategy:
 * 1. Try full dimensions at decreasing quality (0.92 → 0.65)
 * 2. If still too large, scale down dimensions progressively
 * 3. At each dimension scale, try quality degradation
 * 4. Never go below MIN_QUALITY
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const result = await compressImageWithStats(file, options);
  return result.dataUrl;
}

/**
 * Smart compression with full statistics
 */
export async function compressImageWithStats(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxDimension = MAX_DIMENSION,
    maxFileSize = MAX_FILE_SIZE,
    preferWebP = true,
  } = options;
  
  const img = await loadImage(file);
  const originalDimensions = { width: img.width, height: img.height };
  const originalSize = file.size;
  const maxBytes = maxFileSize;
  
  // Try each dimension scale
  for (const scale of DIMENSION_SCALES) {
    const { width, height } = calculateScaledDimensions(
      img.width,
      img.height,
      maxDimension,
      scale
    );
    
    const canvas = compressToCanvas(img, width, height);
    
    // Try decreasing quality at this dimension
    for (
      let quality = INITIAL_QUALITY;
      quality >= MIN_QUALITY;
      quality -= QUALITY_STEP
    ) {
      const { dataUrl, format } = exportCanvas(canvas, quality, preferWebP);
      const size = estimateBase64Size(dataUrl);
      
      if (size <= maxBytes) {
        console.log(
          `[ImageUtils] Compressed: ${formatFileSize(originalSize)} → ${formatFileSize(size)} ` +
          `(${originalDimensions.width}×${originalDimensions.height} → ${width}×${height}) ` +
          `@ ${(quality * 100).toFixed(0)}% ${format.toUpperCase()}`
        );
        
        return {
          dataUrl,
          originalSize,
          compressedSize: size,
          originalDimensions,
          finalDimensions: { width, height },
          format,
          quality,
        };
      }
    }
  }
  
  // Last resort: aggressive compression at smallest scale
  const lastScale = DIMENSION_SCALES[DIMENSION_SCALES.length - 1];
  const { width, height } = calculateScaledDimensions(
    img.width,
    img.height,
    maxDimension,
    lastScale * 0.8 // Extra small
  );
  
  const canvas = compressToCanvas(img, width, height);
  const { dataUrl, format } = exportCanvas(canvas, MIN_QUALITY, preferWebP);
  const size = estimateBase64Size(dataUrl);
  
  console.warn(
    `[ImageUtils] WARNING: Could not meet size target. Final: ${formatFileSize(size)} ` +
    `(${width}×${height}) @ ${(MIN_QUALITY * 100).toFixed(0)}% ${format.toUpperCase()}`
  );
  
  return {
    dataUrl,
    originalSize,
    compressedSize: size,
    originalDimensions,
    finalDimensions: { width, height },
    format,
    quality: MIN_QUALITY,
  };
}

/**
 * Compress an image from a data URL
 */
export async function compressDataUrl(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxDimension = MAX_DIMENSION,
    maxFileSize = MAX_FILE_SIZE,
    preferWebP = true,
  } = options;
  
  const img = await loadImageFromDataUrl(dataUrl);
  const maxBytes = maxFileSize;
  
  // Try each dimension scale
  for (const scale of DIMENSION_SCALES) {
    const { width, height } = calculateScaledDimensions(
      img.width,
      img.height,
      maxDimension,
      scale
    );
    
    const canvas = compressToCanvas(img, width, height);
    
    // Try decreasing quality at this dimension
    for (
      let quality = INITIAL_QUALITY;
      quality >= MIN_QUALITY;
      quality -= QUALITY_STEP
    ) {
      const { dataUrl: result } = exportCanvas(canvas, quality, preferWebP);
      const size = estimateBase64Size(result);
      
      if (size <= maxBytes) {
        return result;
      }
    }
  }
  
  // Last resort
  const lastScale = DIMENSION_SCALES[DIMENSION_SCALES.length - 1];
  const { width, height } = calculateScaledDimensions(
    img.width,
    img.height,
    maxDimension,
    lastScale * 0.8
  );
  
  const canvas = compressToCanvas(img, width, height);
  const { dataUrl: result } = exportCanvas(canvas, MIN_QUALITY, preferWebP);
  
  return result;
}

/**
 * Check if a data URL is within acceptable size limits
 */
export function isWithinSizeLimit(
  dataUrl: string,
  maxBytes: number = MAX_FILE_SIZE
): boolean {
  return estimateBase64Size(dataUrl) <= maxBytes;
}

/**
 * Get compression statistics for a data URL
 */
export function getCompressionStats(dataUrl: string): {
  size: number;
  sizeFormatted: string;
  withinLimit: boolean;
  format: string;
} {
  const size = estimateBase64Size(dataUrl);
  const match = dataUrl.match(/^data:image\/(\w+)/);
  const format = match ? match[1] : 'unknown';
  
  return {
    size,
    sizeFormatted: formatFileSize(size),
    withinLimit: size <= MAX_FILE_SIZE,
    format,
  };
}
