/**
 * Image compression utilities to handle Vercel's 4.5MB request body limit
 */

const MAX_DIMENSION = 1536; // Max width/height for reference images
const QUALITY = 0.85; // JPEG quality
const MAX_FILE_SIZE = 1024 * 1024; // 1MB target per image

/**
 * Compress and resize an image file to reduce payload size
 */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      // Try JPEG first (better compression)
      let dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
      
      // If still too large, reduce quality further
      let quality = QUALITY;
      while (dataUrl.length > MAX_FILE_SIZE * 1.37 && quality > 0.3) { // 1.37 = base64 overhead
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      // If STILL too large, resize more aggressively
      if (dataUrl.length > MAX_FILE_SIZE * 1.37) {
        const scale = 0.7;
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      }

      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL to load the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress an image from a data URL (e.g., from clipboard paste)
 */
export async function compressDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      let result = canvas.toDataURL('image/jpeg', QUALITY);
      
      // Reduce if needed
      let quality = QUALITY;
      while (result.length > MAX_FILE_SIZE * 1.37 && quality > 0.3) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(result);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = dataUrl;
  });
}

/**
 * Estimate the size of a base64 data URL in bytes
 */
export function estimateBase64Size(dataUrl: string): number {
  // Remove data URL prefix
  const base64 = dataUrl.split(',')[1] || dataUrl;
  // Base64 encodes 3 bytes as 4 characters
  return Math.ceil((base64.length * 3) / 4);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
