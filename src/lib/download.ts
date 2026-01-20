import { saveAs } from 'file-saver';

// === FORMAT DATE FOR FILENAME ===
const formatDateForFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

// === GENERATE FILENAME (Privacy-Safe - No Prompt) ===
// Format: DD_{DATE}_{TIME}_{SEED}_{INDEX}.png
export const generateFilename = (
  _prompt: string, // Kept for API compatibility but not used
  seed?: number | string,
  index?: number
): string => {
  const timestamp = formatDateForFilename();
  const seedStr = seed ? `_${seed}` : '';
  const indexStr = index !== undefined ? `_${String(index + 1).padStart(3, '0')}` : '';
  
  return `DD_${timestamp}${seedStr}${indexStr}.png`;
};

// === FORMAT TIMESTAMP ===
export const formatTimestamp = (): string => {
  return formatDateForFilename();
};

// === DOWNLOAD IMAGE FROM URL ===
export const downloadImage = async (
  imageUrl: string,
  filename?: string
): Promise<Blob> => {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  const name = filename || `DD_${formatTimestamp()}.png`;
  
  saveAs(blob, name);
  return blob;
};

// === DOWNLOAD IMAGE FROM URL (alias) ===
export const downloadImageFromUrl = downloadImage;

// === DOWNLOAD BLOB ===
export const downloadBlob = (blob: Blob, filename: string): void => {
  saveAs(blob, filename);
};

// === DOWNLOAD DATA URL ===
export const downloadDataUrl = (dataUrl: string, filename: string): void => {
  // Convert data URL to blob
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], { type: mime });
  
  saveAs(blob, filename);
};

// === AUTO-SAVE HANDLER ===
export const autoSaveImage = async (
  imageUrl: string,
  prompt: string,
  seed: number | string,
  index = 0
): Promise<void> => {
  const filename = generateFilename(prompt, seed, index);
  await downloadImage(imageUrl, filename);
};

// === BATCH DOWNLOAD ===
export const downloadMultipleImages = async (
  images: { url: string; prompt: string; seed: number | string; index: number }[]
): Promise<void> => {
  for (const image of images) {
    await autoSaveImage(image.url, image.prompt, image.seed, image.index);
    // Small delay between downloads to prevent browser blocking
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};
