'use client';

import { useState, useCallback } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { GeneratedImage } from '@/types';
import { downloadImage, generateFilename } from '@/lib/download';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface MobileImageCardProps {
  image: GeneratedImage;
  onTap: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export function MobileImageCard({ image, onTap, onDelete, compact = false }: MobileImageCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      const filename = generateFilename(image.prompt, image.seed);
      await downloadImage(image.url, filename);
      toast({ title: 'Saved', description: filename });
    } catch {
      toast({ variant: 'destructive', title: 'Download failed' });
    } finally {
      setIsDownloading(false);
    }
  }, [image]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setShowActions(false);
  }, [onDelete]);

  const handleLongPress = useCallback(() => {
    setShowActions(true);
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, []);

  return (
    <div
      onClick={showActions ? () => setShowActions(false) : onTap}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
      className={cn(
        'relative aspect-square rounded-lg overflow-hidden',
        'bg-[var(--bg-deep)]',
        'active:scale-[0.98] transition-transform'
      )}
    >
      <img
        src={image.url}
        alt={image.prompt}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Seed badge - hidden in compact mode */}
      {image.seed && !compact && (
        <div className={cn(
          'absolute bottom-1.5 right-1.5',
          'px-1.5 py-0.5 rounded',
          'bg-black/60 backdrop-blur-sm',
          'text-[9px] font-mono text-white/70'
        )}>
          #{image.seed}
        </div>
      )}

      {/* Quick actions overlay */}
      {showActions && (
        <div 
          className={cn(
            'absolute inset-0',
            'bg-black/80 backdrop-blur-sm',
            'flex items-center justify-center',
            compact ? 'gap-2' : 'gap-4'
          )}
        >
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={cn(
              'rounded-full',
              'bg-white/20 flex items-center justify-center',
              'active:scale-95',
              compact ? 'w-9 h-9' : 'w-12 h-12'
            )}
          >
            <Download className={cn(compact ? 'w-4 h-4' : 'w-5 h-5', 'text-white', isDownloading && 'animate-pulse')} />
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              'rounded-full',
              'bg-red-500/30 flex items-center justify-center',
              'active:scale-95',
              compact ? 'w-9 h-9' : 'w-12 h-12'
            )}
          >
            <Trash2 className={cn(compact ? 'w-4 h-4' : 'w-5 h-5', 'text-red-400')} />
          </button>
        </div>
      )}
    </div>
  );
}
