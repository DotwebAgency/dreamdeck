'use client';

import { useState, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Download, 
  Trash2, 
  CheckSquare, 
  Square, 
  X as XIcon,
  Package,
  Loader2
} from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { ResultCard } from './ResultCard';
import { EmptyState } from './EmptyState';
import { FullscreenViewer } from './FullscreenViewer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { generateFilename, formatTimestamp } from '@/lib/download';

export function ResultsGrid() {
  const { results, removeResult, clearResults } = useGenerationStore();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedCount = selectedIds.size;
  const allSelected = selectedCount === results.length && results.length > 0;

  const handleOpenViewer = useCallback((index: number) => {
    if (selectionMode) return; // Don't open viewer in selection mode
    setViewerIndex(index);
  }, [selectionMode]);

  const handleCloseViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (viewerIndex === null) return;
    
    if (direction === 'prev' && viewerIndex > 0) {
      setViewerIndex(viewerIndex - 1);
    } else if (direction === 'next' && viewerIndex < results.length - 1) {
      setViewerIndex(viewerIndex + 1);
    }
  }, [viewerIndex, results.length]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id)));
    }
  }, [allSelected, results]);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
  }, []);

  const handleBulkDownload = useCallback(async () => {
    if (selectedIds.size === 0) return;
    
    setIsDownloading(true);
    const selectedImages = results.filter(img => selectedIds.has(img.id));
    
    try {
      if (selectedImages.length === 1) {
        // Single image - direct download
        const img = selectedImages[0];
        const filename = generateFilename(img.prompt, img.seed, 0);
        const response = await fetch(img.url);
        const blob = await response.blob();
        saveAs(blob, filename);
        toast({
          title: 'Downloaded',
          description: filename,
        });
      } else {
        // Multiple images - create ZIP
        const zip = new JSZip();
        const timestamp = formatTimestamp();
        
        // Create metadata JSON
        const metadata = {
          exportDate: new Date().toISOString(),
          imageCount: selectedImages.length,
          images: selectedImages.map((img, i) => ({
            filename: generateFilename(img.prompt, img.seed, i),
            prompt: img.prompt,
            seed: img.seed,
            width: img.width,
            height: img.height,
            timestamp: img.timestamp,
          })),
        };
        
        // Add metadata to ZIP
        zip.file('metadata.json', JSON.stringify(metadata, null, 2));
        
        // Fetch and add all images
        const imagePromises = selectedImages.map(async (img, index) => {
          try {
            const response = await fetch(img.url);
            const blob = await response.blob();
            const filename = generateFilename(img.prompt, img.seed, index);
            zip.file(filename, blob);
          } catch (error) {
            console.error(`Failed to fetch image ${img.id}:`, error);
          }
        });
        
        await Promise.all(imagePromises);
        
        // Generate ZIP
        const zipBlob = await zip.generateAsync({ 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });
        
        const zipFilename = `DREAMDECK_export_${timestamp}_${selectedImages.length}images.zip`;
        saveAs(zipBlob, zipFilename);
        
        toast({
          title: 'Download complete',
          description: `${selectedImages.length} images saved as ${zipFilename}`,
        });
      }
      
      // Exit selection mode after download
      exitSelectionMode();
    } catch (error) {
      console.error('Bulk download failed:', error);
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'Could not download selected images',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [selectedIds, results, exitSelectionMode]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    
    const count = selectedIds.size;
    selectedIds.forEach(id => removeResult(id));
    
    toast({
      title: 'Deleted',
      description: `${count} image${count > 1 ? 's' : ''} removed`,
    });
    
    exitSelectionMode();
  }, [selectedIds, removeResult, exitSelectionMode]);

  if (results.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="p-6">
        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
              Generated Images
            </h2>
            <span className="text-[11px] text-slate-600">
              {results.length} {results.length === 1 ? 'image' : 'images'}
            </span>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {selectionMode ? (
              <>
                {/* Selection mode controls */}
                <span className="text-[11px] text-slate-400 mr-2">
                  {selectedCount} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="gap-1.5 text-slate-400"
                >
                  {allSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  {allSelected ? 'Deselect all' : 'Select all'}
                </Button>
                <div className="w-px h-5 bg-slate-800" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkDownload}
                  disabled={selectedCount === 0 || isDownloading}
                  className="gap-1.5"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : selectedCount > 1 ? (
                    <Package className="w-3.5 h-3.5" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {isDownloading ? 'Downloading...' : selectedCount > 1 ? `Download ZIP (${selectedCount})` : 'Download'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedCount === 0}
                  className="gap-1.5 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete ({selectedCount})
                </Button>
                <div className="w-px h-5 bg-slate-800" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={exitSelectionMode}
                  className="text-slate-400"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                {/* Normal mode controls */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={enterSelectionMode}
                  className="gap-1.5 text-slate-400"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Select
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Masonry grid */}
        <div
          className={cn(
            'grid gap-4',
            'grid-cols-1',
            'sm:grid-cols-2',
            'lg:grid-cols-2',
            'xl:grid-cols-3',
            '2xl:grid-cols-4'
          )}
        >
          {results.map((image, index) => (
            <ResultCard
              key={image.id}
              image={image}
              onDelete={removeResult}
              onOpenViewer={() => handleOpenViewer(index)}
              selectionMode={selectionMode}
              isSelected={selectedIds.has(image.id)}
              onToggleSelect={() => toggleSelection(image.id)}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen viewer */}
      {viewerIndex !== null && results[viewerIndex] && (
        <FullscreenViewer
          image={results[viewerIndex]}
          images={results}
          currentIndex={viewerIndex}
          isOpen={viewerIndex !== null}
          onClose={handleCloseViewer}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}
