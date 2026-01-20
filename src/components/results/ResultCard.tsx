'use client';

import { useState, useCallback, memo } from 'react';
import {
  Download,
  Copy,
  Trash2,
  Maximize2,
  MoreHorizontal,
  Dices,
  RefreshCw,
  Check,
  Image as ImageIcon,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { GeneratedImage } from '@/types';
import { useGenerationStore } from '@/store/useGenerationStore';
import { downloadImage, generateFilename } from '@/lib/download';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface ResultCardProps {
  image: GeneratedImage;
  onDelete?: (id: string) => void;
  onOpenViewer?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const ResultCard = memo(function ResultCard({ 
  image, 
  onDelete, 
  onOpenViewer,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: ResultCardProps) {
  const { setSeed, setPrompt } = useGenerationStore();
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const filename = generateFilename(image.prompt, image.seed);
      await downloadImage(image.url, filename);
      toast({
        title: 'Downloaded',
        description: filename,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        variant: 'destructive',
        title: 'Download failed',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [image.url, image.prompt, image.seed]);

  const handleCopyPrompt = useCallback(async () => {
    await navigator.clipboard.writeText(image.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }, [image.prompt]);

  const handleCopyImage = useCallback(async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      // Fallback: copy URL
      await navigator.clipboard.writeText(image.url);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    }
  }, [image.url]);

  const handleUseSeed = useCallback(() => {
    if (image.seed) {
      setSeed(image.seed);
      toast({
        title: 'Seed applied',
        description: `Seed ${image.seed} is now active`,
      });
    }
  }, [image.seed, setSeed]);

  const handleReuse = useCallback(() => {
    setPrompt(image.prompt);
    if (image.seed) {
      setSeed(image.seed);
    }
    toast({
      title: 'Settings reused',
      description: 'Prompt and seed have been applied',
    });
  }, [image.prompt, image.seed, setPrompt, setSeed]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't process if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) return;
    
    if (selectionMode) {
      onToggleSelect?.();
    } else {
      onOpenViewer?.();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative overflow-hidden cursor-pointer',
        'rounded-[var(--radius-md)]',
        'bg-[var(--bg-elevated)]',
        'border border-[var(--border-subtle)]',
        'shadow-[var(--shadow-sm)]',
        'transition-all duration-300',
        selectionMode && isSelected 
          ? 'ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-void)]' 
          : 'hover:border-[var(--border-default)] hover:shadow-[var(--shadow-md)]',
        // Entrance animation
        !imageLoaded && 'animate-pulse'
      )}
    >
      {/* Image */}
      <div className="relative aspect-square">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div 
            className={cn(
              'absolute inset-0',
              'bg-[var(--bg-soft)]',
              'animate-shimmer'
            )} 
          />
        )}
        
        <img
          src={image.url}
          alt={image.prompt}
          className={cn(
            'w-full h-full object-cover',
            'transition-all duration-500',
            !imageLoaded && 'opacity-0 scale-105 blur-sm',
            imageLoaded && 'opacity-100 scale-100 blur-0',
            selectionMode && !isSelected && 'opacity-60'
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Selection checkbox */}
        {selectionMode && (
          <div className="absolute top-3 left-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.();
              }}
              className={cn(
                'w-7 h-7 rounded-[var(--radius-full)] flex items-center justify-center',
                'transition-all duration-200',
                'shadow-[var(--shadow-md)]',
                isSelected 
                  ? 'bg-[var(--accent-primary)] text-[var(--bg-void)]' 
                  : 'bg-[var(--bg-void)]/80 text-[var(--text-muted)] hover:bg-[var(--bg-void)] hover:text-[var(--text-primary)]'
              )}
            >
              {isSelected ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
          </div>
        )}

        {/* Gradient overlay on hover (only when not in selection mode) */}
        {!selectionMode && (
          <div
            className={cn(
              'absolute inset-0',
              'bg-gradient-to-t from-[var(--bg-void)]/95 via-[var(--bg-void)]/30 to-transparent',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-300',
              'pointer-events-none'
            )}
          />
        )}

        {/* Click hint overlay (only when not in selection mode) */}
        {!selectionMode && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'opacity-0 group-hover:opacity-100',
              'transition-all duration-300',
              'pointer-events-none'
            )}
          >
            <div 
              className={cn(
                'p-3 rounded-[var(--radius-full)]',
                'bg-[var(--bg-void)]/80',
                'shadow-[var(--shadow-lg)]',
                'backdrop-blur-sm',
                'transform scale-90 group-hover:scale-100',
                'transition-transform duration-300'
              )}
            >
              <Maximize2 className="w-6 h-6 text-[var(--text-primary)]" />
            </div>
          </div>
        )}

        {/* Top actions (only when not in selection mode) */}
        {!selectionMode && (
          <div
            className={cn(
              'absolute top-3 right-3 flex gap-1.5',
              'opacity-0 group-hover:opacity-100',
              'transition-all duration-200',
              'transform -translate-y-2 group-hover:translate-y-0'
            )}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              disabled={isDownloading}
              className={cn(
                'bg-[var(--bg-void)]/80 text-[var(--text-primary)]',
                'hover:bg-[var(--bg-void)]',
                'shadow-[var(--shadow-sm)]',
                'backdrop-blur-sm'
              )}
            >
              <Download className={cn('w-4 h-4', isDownloading && 'animate-pulse')} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyImage();
              }}
              className={cn(
                'bg-[var(--bg-void)]/80 text-[var(--text-primary)]',
                'hover:bg-[var(--bg-void)]',
                'shadow-[var(--shadow-sm)]',
                'backdrop-blur-sm'
              )}
            >
              {copiedImage ? (
                <Check className="w-4 h-4 text-[var(--success)]" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    'bg-[var(--bg-void)]/80 text-[var(--text-primary)]',
                    'hover:bg-[var(--bg-void)]',
                    'shadow-[var(--shadow-sm)]',
                    'backdrop-blur-sm'
                  )}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyPrompt} className="gap-2">
                  {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedPrompt ? 'Copied!' : 'Copy prompt'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyImage} className="gap-2">
                  {copiedImage ? <Check className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                  {copiedImage ? 'Copied!' : 'Copy image'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleUseSeed} className="gap-2">
                  <Dices className="w-4 h-4" />
                  Use seed ({image.seed || 'N/A'})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReuse} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reuse settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(image.id)}
                  className="gap-2 text-[var(--error)] focus:text-[var(--error)]"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Bottom info with seed (only when not in selection mode) */}
        {!selectionMode && (
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 p-4',
              'opacity-0 group-hover:opacity-100',
              'transition-all duration-300',
              'transform translate-y-2 group-hover:translate-y-0',
              'pointer-events-none'
            )}
          >
            <p className="text-[var(--text-sm)] text-[var(--text-primary)] line-clamp-2 mb-2">
              {image.prompt}
            </p>
            <div className="flex items-center justify-between text-[var(--text-xs)] text-[var(--text-muted)]">
              <span>{image.width}×{image.height}</span>
              {image.seed && (
                <span 
                  className={cn(
                    'font-mono px-2 py-0.5',
                    'bg-[var(--bg-deep)]/80 rounded-[var(--radius-xs)]'
                  )}
                >
                  #{image.seed}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Selection mode info */}
        {selectionMode && (
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 p-3',
              'bg-gradient-to-t from-[var(--bg-void)]/90 to-transparent'
            )}
          >
            <div className="flex items-center justify-between text-[var(--text-xs)] text-[var(--text-secondary)]">
              <span>{image.width}×{image.height}</span>
              {image.seed && (
                <span className="font-mono">#{image.seed}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
