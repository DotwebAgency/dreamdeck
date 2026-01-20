'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import {
  X,
  Download,
  Copy,
  Dices,
  RefreshCw,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { GeneratedImage } from '@/types';
import { useGenerationStore } from '@/store/useGenerationStore';
import { downloadImage, generateFilename } from '@/lib/download';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface FullscreenViewerProps {
  image: GeneratedImage;
  images?: GeneratedImage[];
  currentIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function FullscreenViewer({
  image,
  images = [],
  currentIndex = 0,
  isOpen,
  onClose,
  onNavigate,
}: FullscreenViewerProps) {
  const { setSeed, setPrompt } = useGenerationStore();
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Touch swipe state
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const hasPrev = images.length > 1 && currentIndex > 0;
  const hasNext = images.length > 1 && currentIndex < images.length - 1;

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (scale === 1) {
        setShowControls(false);
      }
    }, 3000);
  }, [scale]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrev) onNavigate?.('prev');
          break;
        case 'ArrowRight':
          if (hasNext) onNavigate?.('next');
          break;
        case '+':
        case '=':
          transformRef.current?.zoomIn();
          break;
        case '-':
          transformRef.current?.zoomOut();
          break;
        case '0':
          transformRef.current?.resetTransform();
          break;
        case '1':
          transformRef.current?.setTransform(0, 0, 1, 200);
          break;
        case '2':
          transformRef.current?.setTransform(0, 0, 2, 200);
          break;
        case 'f':
          // Fit to screen
          transformRef.current?.resetTransform();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, hasPrev, hasNext, onNavigate]);

  // Mouse move to show controls
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = () => {
      resetControlsTimeout();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen, resetControlsTimeout]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Touch swipe handlers for mobile navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only handle single touch and when not zoomed
    if (e.touches.length !== 1 || scale > 1.1) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setSwipeOffset(0);
  }, [scale]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 1 || scale > 1.1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Only track horizontal swipes
    if (deltaY > 50) {
      touchStartRef.current = null;
      setSwipeOffset(0);
      return;
    }
    
    // Limit swipe range and add resistance at edges
    let offset = deltaX;
    if ((deltaX > 0 && !hasPrev) || (deltaX < 0 && !hasNext)) {
      offset = deltaX * 0.3; // Add resistance when at edge
    }
    
    setSwipeOffset(offset);
  }, [scale, hasPrev, hasNext]);
  
  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    
    const threshold = 80; // Minimum swipe distance
    const velocity = Math.abs(swipeOffset) / (Date.now() - touchStartRef.current.time);
    
    // Fast swipe or long enough swipe
    if (Math.abs(swipeOffset) > threshold || velocity > 0.5) {
      if (swipeOffset > 0 && hasPrev) {
        onNavigate?.('prev');
      } else if (swipeOffset < 0 && hasNext) {
        onNavigate?.('next');
      }
    }
    
    touchStartRef.current = null;
    setSwipeOffset(0);
  }, [swipeOffset, hasPrev, hasNext, onNavigate]);

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
        description: 'Could not download image',
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
    onClose();
    toast({
      title: 'Settings reused',
      description: 'Prompt and seed have been applied',
    });
  }, [image.prompt, image.seed, setPrompt, setSeed, onClose]);

  const handleScaleChange = useCallback((ref: ReactZoomPanPinchRef) => {
    setScale(ref.state.scale);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/98"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 z-10',
          'flex items-center justify-between p-4',
          'bg-gradient-to-b from-black/80 to-transparent',
          'transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Left: Close + Info */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="text-white/60 text-[13px]">
            {images.length > 1 && (
              <span className="mr-3">{currentIndex + 1} / {images.length}</span>
            )}
            <span>{image.width}×{image.height}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyPrompt}
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
          >
            {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedPrompt ? 'Copied' : 'Prompt'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyImage}
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
          >
            {copiedImage ? <Check className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedImage ? 'Copied' : 'Image'}</span>
          </Button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUseSeed}
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
          >
            <Dices className="w-4 h-4" />
            <span className="hidden sm:inline font-mono">{image.seed || 'N/A'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReuse}
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reuse</span>
          </Button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-1.5"
          >
            <Download className={cn('w-4 h-4', isDownloading && 'animate-pulse')} />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* Zoom controls */}
      <div
        className={cn(
          'absolute bottom-4 left-1/2 -translate-x-1/2 z-10',
          'flex items-center gap-1 px-2 py-1.5 rounded-full',
          'bg-black/60 backdrop-blur-sm border border-white/10',
          'transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => transformRef.current?.zoomOut()}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-white/60 min-w-[4rem] text-center font-mono">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => transformRef.current?.zoomIn()}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => transformRef.current?.resetTransform()}
          className="text-white/70 hover:text-white hover:bg-white/10"
          title="Fit (F)"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => transformRef.current?.setTransform(0, 0, 1, 200)}
          className="text-white/70 hover:text-white hover:bg-white/10"
          title="100% (1)"
        >
          <span className="text-[10px] font-mono">1:1</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => transformRef.current?.setTransform(0, 0, 2, 200)}
          className="text-white/70 hover:text-white hover:bg-white/10"
          title="200% (2)"
        >
          <span className="text-[10px] font-mono">2×</span>
        </Button>
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={() => onNavigate?.('prev')}
          className={cn(
            'absolute left-4 top-1/2 -translate-y-1/2 z-10',
            'w-12 h-12 flex items-center justify-center rounded-full',
            'bg-black/40 hover:bg-black/60 text-white/70 hover:text-white',
            'transition-all duration-200',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => onNavigate?.('next')}
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 z-10',
            'w-12 h-12 flex items-center justify-center rounded-full',
            'bg-black/40 hover:bg-black/60 text-white/70 hover:text-white',
            'transition-all duration-200',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Zoomable/Pannable image area with swipe support */}
      <div
        className="w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : undefined,
          transition: swipeOffset === 0 ? 'transform 0.3s ease-out' : undefined,
        }}
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.1}
          maxScale={10}
          centerOnInit
          wheel={{ step: 0.05, smoothStep: 0.005 }}
          pinch={{ step: 5 }}
          doubleClick={{ mode: 'toggle', step: 2 }}
          panning={{ velocityDisabled: false }}
          onTransformed={handleScaleChange}
        >
          <TransformComponent
            wrapperStyle={{
              width: '100vw',
              height: '100vh',
            }}
            contentStyle={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={image.url}
              alt={image.prompt}
              className="max-w-full max-h-full object-contain select-none pointer-events-none"
              draggable={false}
              style={{
                maxWidth: '95vw',
                maxHeight: '95vh',
              }}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
      
      {/* Mobile swipe indicator dots */}
      {images.length > 1 && (
        <div className={cn(
          'absolute bottom-20 left-1/2 -translate-x-1/2 z-10',
          'flex items-center gap-1.5 px-3 py-1.5',
          'rounded-full bg-black/40 backdrop-blur-sm',
          'transition-opacity duration-300',
          'sm:hidden', // Only show on mobile
          showControls ? 'opacity-100' : 'opacity-0'
        )}>
          {images.slice(Math.max(0, currentIndex - 2), Math.min(images.length, currentIndex + 3)).map((_, i) => {
            const actualIndex = Math.max(0, currentIndex - 2) + i;
            return (
              <button
                key={actualIndex}
                onClick={() => {
                  const diff = actualIndex - currentIndex;
                  if (diff > 0) {
                    for (let j = 0; j < diff; j++) onNavigate?.('next');
                  } else {
                    for (let j = 0; j < -diff; j++) onNavigate?.('prev');
                  }
                }}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  actualIndex === currentIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/40 hover:bg-white/60'
                )}
              />
            );
          })}
        </div>
      )}

      {/* Keyboard hints */}
      <div
        className={cn(
          'absolute bottom-4 right-4 z-10',
          'text-[10px] text-white/30',
          'transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <kbd className="px-1.5 py-0.5 bg-white/10 rounded mr-1">←→</kbd>
        navigate
        <span className="mx-2">•</span>
        <kbd className="px-1.5 py-0.5 bg-white/10 rounded mr-1">+−</kbd>
        zoom
        <span className="mx-2">•</span>
        <kbd className="px-1.5 py-0.5 bg-white/10 rounded mr-1">Esc</kbd>
        close
      </div>
    </div>
  );
}
