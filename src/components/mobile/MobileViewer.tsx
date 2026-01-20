'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import {
  X,
  Download,
  Share,
  Dices,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { GeneratedImage } from '@/types';
import { useGenerationStore } from '@/store/useGenerationStore';
import { downloadImage, generateFilename } from '@/lib/download';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface MobileViewerProps {
  image: GeneratedImage;
  images?: GeneratedImage[];
  currentIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function MobileViewer({
  image,
  images = [],
  currentIndex = 0,
  isOpen,
  onClose,
  onNavigate,
}: MobileViewerProps) {
  const { setSeed } = useGenerationStore();
  const [showUI, setShowUI] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Crossfade animation state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);
  const prevIndexRef = useRef(currentIndex);

  const hasPrev = images.length > 1 && currentIndex > 0;
  const hasNext = images.length > 1 && currentIndex < images.length - 1;

  // Handle crossfade transition on image change
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      const direction = currentIndex > prevIndexRef.current ? 'left' : 'right';
      setTransitionDirection(direction);
      setIsTransitioning(true);
      
      // Reset transition after animation
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionDirection(null);
      }, 300);
      
      prevIndexRef.current = currentIndex;
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const resetUITimeout = useCallback(() => {
    setShowUI(true);
    if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    uiTimeoutRef.current = setTimeout(() => setShowUI(false), 3000);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetUITimeout();
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    };
  }, [isOpen, resetUITimeout]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    
    const velocity = Math.abs(dx) / dt;
    const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy) * 1.5;
    
    if (isHorizontalSwipe && velocity > 0.3) {
      if (dx > 50 && hasPrev) {
        onNavigate?.('prev');
      } else if (dx < -50 && hasNext) {
        onNavigate?.('next');
      }
    }
    
    if (dy > 100 && Math.abs(dy) > Math.abs(dx) * 2) {
      onClose();
    }
    
    touchStartRef.current = null;
  }, [hasPrev, hasNext, onNavigate, onClose]);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const filename = generateFilename(image.prompt, image.seed);
      await downloadImage(image.url, filename);
      toast({ title: 'Saved to device' });
    } catch {
      toast({ variant: 'destructive', title: 'Download failed' });
    } finally {
      setIsDownloading(false);
    }
  }, [image]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const file = new File([blob], 'dreamdeck-image.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: 'DreamDeck Creation' });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(image.url);
      toast({ title: 'Link copied' });
    }
  }, [image.url]);

  const handleUseSeed = useCallback(() => {
    if (image.seed) {
      setSeed(image.seed);
      toast({ title: 'Seed applied', description: `${image.seed}` });
    }
  }, [image.seed, setSeed]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => setShowUI(prev => !prev)}
    >
      {/* Top bar */}
      <div className={cn(
        'absolute top-0 left-0 right-0 z-10',
        'flex items-center justify-between p-4',
        'bg-gradient-to-b from-black/80 to-transparent',
        'safe-area-inset-top',
        'transition-opacity duration-200',
        showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        
        <div className="text-white/60 text-sm">
          {images.length > 1 && `${currentIndex + 1} / ${images.length}`}
        </div>
        
        <div className="w-10" />
      </div>

      {/* Image viewer */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        centerOnInit
        pinch={{ step: 10 }}
        doubleClick={{ mode: 'toggle', step: 2 }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100vw', height: '100vh' }}
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
            className={cn(
              'max-w-full max-h-full object-contain select-none',
              'transition-all duration-300 ease-out',
              isTransitioning && transitionDirection === 'left' && 'animate-[slideInRight_0.3s_ease-out]',
              isTransitioning && transitionDirection === 'right' && 'animate-[slideInLeft_0.3s_ease-out]'
            )}
            draggable={false}
          />
        </TransformComponent>
      </TransformWrapper>

      {/* Navigation hints */}
      {showUI && hasPrev && (
        <div className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 z-10',
          'w-8 h-16 flex items-center justify-center',
          'bg-white/10 rounded-full'
        )}>
          <ChevronLeft className="w-5 h-5 text-white/60" />
        </div>
      )}
      {showUI && hasNext && (
        <div className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 z-10',
          'w-8 h-16 flex items-center justify-center',
          'bg-white/10 rounded-full'
        )}>
          <ChevronRight className="w-5 h-5 text-white/60" />
        </div>
      )}

      {/* Bottom bar */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 z-10',
        'bg-gradient-to-t from-black/90 via-black/60 to-transparent',
        'safe-area-inset-bottom',
        'transition-opacity duration-200',
        showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3 text-xs text-white/50 mb-2">
            <span>{image.width}×{image.height}</span>
            {image.seed && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleUseSeed(); }}
                className="font-mono px-2 py-0.5 bg-white/10 rounded"
              >
                #{image.seed}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-around px-4 py-3 border-t border-white/10">
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            disabled={isDownloading}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Download className={cn('w-5 h-5 text-white', isDownloading && 'animate-pulse')} />
            </div>
            <span className="text-[10px] text-white/60">Save</span>
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Share className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] text-white/60">Share</span>
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleUseSeed(); }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Dices className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] text-white/60">Use Seed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
