'use client';

import { useCallback, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImagePlus, X, Star, GripVertical, Link, Loader2 } from 'lucide-react';
import { useGenerationStore, ReferenceImage } from '@/store/useGenerationStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { compressImage, compressDataUrl } from '@/lib/imageUtils';

interface ReferenceSlotProps {
  index: number;
  slot: ReferenceImage | null;
}

export function ReferenceSlot({ index, slot }: ReferenceSlotProps) {
  const { setSlot, removeSlot } = useGenerationStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Priority indicators - first 3 get stars
  const getPriorityStars = (idx: number) => {
    if (idx === 0) return 3;
    if (idx === 1) return 2;
    if (idx === 2) return 1;
    return 0;
  };

  const stars = getPriorityStars(index);

  // Check if a string is a valid image URL
  const isImageUrl = (str: string): boolean => {
    try {
      const url = new URL(str);
      return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url.pathname) ||
             str.startsWith('data:image/') ||
             url.hostname.includes('wavespeed') ||
             url.hostname.includes('cdn') ||
             url.hostname.includes('cloudinary') ||
             url.hostname.includes('imgur');
    } catch {
      return str.startsWith('data:image/');
    }
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;

      setIsCompressing(true);
      try {
        // Compress image to avoid 413 Payload Too Large errors
        const compressedUrl = await compressImage(file);
        setSlot(index, {
          id: `local-${Date.now()}`,
          url: compressedUrl,
          type: 'local',
          name: file.name,
        });
      } catch (error) {
        console.error('Failed to compress image:', error);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          setSlot(index, {
            id: `local-${Date.now()}`,
            url,
            type: 'local',
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    },
    [index, setSlot]
  );

  const handleUrlPaste = useCallback(
    (url: string) => {
      if (isImageUrl(url)) {
        setSlot(index, {
          id: `url-${Date.now()}`,
          url,
          type: 'url',
          name: url.split('/').pop() || 'pasted-image',
        });
        return true;
      }
      return false;
    },
    [index, setSlot]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      // Check for URL drop
      const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      if (url && handleUrlPaste(url)) {
        return;
      }

      // File drop
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await handleFile(files[0]);
      }
    },
    [handleFile, handleUrlPaste]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      // Check for URL in clipboard
      const text = e.clipboardData.getData('text/plain');
      if (text && handleUrlPaste(text)) {
        e.preventDefault();
        return;
      }

      // Check for image files
      const items = e.clipboardData.items;
      // @ts-ignore - DataTransferItemList iteration
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            await handleFile(file);
            e.preventDefault();
          }
          break;
        }
      }
    },
    [handleFile, handleUrlPaste]
  );

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) await handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        'w-20 h-20',
        'rounded-[var(--radius-sm)]',
        'transition-all duration-200',
        isDragging && 'opacity-50 scale-95'
      )}
    >
      {/* Priority stars indicator */}
      {stars > 0 && slot && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 flex gap-0.5">
          {Array.from({ length: stars }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'w-2.5 h-2.5',
                stars === 3
                  ? 'text-amber-400 fill-amber-400'
                  : stars === 2
                    ? 'text-[var(--text-secondary)] fill-[var(--text-secondary)]'
                    : 'text-[var(--text-muted)] fill-[var(--text-muted)]'
              )}
            />
          ))}
        </div>
      )}

      {slot ? (
        /* Filled slot */
        <div
          className={cn(
            'relative w-full h-full overflow-hidden rounded-[var(--radius-sm)]',
            'border border-[var(--border-default)]',
            'bg-[var(--bg-soft)]'
          )}
        >
          {/* Image */}
          <img
            src={slot.url}
            alt={slot.name || `Reference ${index + 1}`}
            className="w-full h-full object-cover"
          />

          {/* URL indicator */}
          {slot.type === 'url' && (
            <div className="absolute top-1 left-1 p-0.5 rounded-[var(--radius-xs)] bg-black/60">
              <Link className="w-2.5 h-2.5 text-[var(--text-secondary)]" />
            </div>
          )}

          {/* Overlay on hover - FLAT solid color */}
          <div
            className={cn(
              'absolute inset-0',
              'bg-black/40',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-150'
            )}
          />

          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className={cn(
              'absolute top-1 left-1',
              'p-1 rounded-[var(--radius-xs)]',
              'bg-black/60',
              'text-[var(--text-secondary)]',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-150',
              'cursor-grab active:cursor-grabbing',
              slot.type === 'url' && 'left-5'
            )}
          >
            <GripVertical className="w-3 h-3" />
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => removeSlot(index)}
            className={cn(
              'absolute top-1 right-1',
              'w-5 h-5 p-0',
              'bg-black/60 hover:bg-[var(--error-muted)]',
              'text-[var(--text-secondary)] hover:text-[var(--error)]',
              'opacity-0 group-hover:opacity-100',
              'transition-all duration-150'
            )}
          >
            <X className="w-3 h-3" />
          </Button>

          {/* Slot number */}
          <div
            className={cn(
              'absolute bottom-1 left-1',
              'px-1.5 py-0.5 rounded-[var(--radius-xs)]',
              'bg-black/60',
              'text-[9px] font-mono text-[var(--text-secondary)]',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-150'
            )}
          >
            #{index + 1}
          </div>
        </div>
      ) : (
        /* Empty slot */
        <button
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onPaste={handlePaste}
          tabIndex={0}
          disabled={isCompressing}
          className={cn(
            'w-full h-full rounded-[var(--radius-sm)]',
            'border border-dashed',
            'flex flex-col items-center justify-center gap-1',
            'transition-all duration-150',
            'focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)]',
            'disabled:opacity-50 disabled:cursor-wait',
            isDragOver
              ? 'border-[var(--text-secondary)] bg-[var(--bg-soft)]'
              : 'border-[var(--border-default)] bg-[var(--bg-deep)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-mid)]'
          )}
        >
          {isCompressing ? (
            <Loader2 className="w-4 h-4 text-[var(--text-muted)] animate-spin" />
          ) : (
            <ImagePlus
              className={cn(
                'w-4 h-4',
                isDragOver ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
              )}
            />
          )}
          <span
            className={cn(
              'text-[10px] font-mono font-medium',
              isDragOver ? 'text-[var(--text-secondary)]' : '',
              // High contrast slot numbers for first 3
              index < 3 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
            )}
          >
            {isCompressing ? '...' : index + 1}
          </span>
        </button>
      )}
    </div>
  );
}
