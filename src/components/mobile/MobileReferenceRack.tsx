'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { Plus, X, GripVertical, Star } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { cn } from '@/lib/utils';
import type { ReferenceImage } from '@/types';
import { TOTAL_SLOTS } from '@/lib/constants';

export function MobileReferenceRack() {
  const { referenceSlots, setSlot, removeSlot, reorderSlots } = useGenerationStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const filledSlotCount = referenceSlots.filter(s => s !== null).length;

  // Hide scroll hint after user scrolls
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollLeft > 20) {
        setShowScrollHint(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileSelect = useCallback((index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageSlot: ReferenceImage = {
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            type: 'local',
            name: file.name,
          };
          setSlot(index, imageSlot);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [setSlot]);

  // Only start drag when touching the grip handle area
  const handleGripTouchStart = useCallback((index: number, e: React.TouchEvent) => {
    e.stopPropagation(); // Prevent scroll from triggering
    const touch = e.touches[0];
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    // Start drag immediately when touching grip (no long press needed)
    setIsDragging(true);
    setDragIndex(index);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || dragIndex === null) return;

    e.preventDefault(); // Prevent scroll while dragging
    
    const touch = e.touches[0];
    
    // Find which slot the finger is over
    let newDropTarget: number | null = null;
    slotRefs.current.forEach((ref, index) => {
      if (ref && index !== dragIndex) {
        const rect = ref.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          newDropTarget = index;
        }
      }
    });
    
    setDropTargetIndex(newDropTarget);
  }, [isDragging, dragIndex]);

  const handleTouchEnd = useCallback(() => {
    // Perform swap if we have valid drag and drop targets
    if (isDragging && dragIndex !== null && dropTargetIndex !== null && dragIndex !== dropTargetIndex) {
      // Call reorderSlots with from and to indices
      reorderSlots(dragIndex, dropTargetIndex);
      
      // Haptic feedback on successful drop
      if (navigator.vibrate) {
        navigator.vibrate([30, 20, 30]);
      }
    }
    
    setIsDragging(false);
    setDragIndex(null);
    setDropTargetIndex(null);
    dragStartPos.current = null;
  }, [isDragging, dragIndex, dropTargetIndex, reorderSlots]);

  // Priority stars for first 3 slots
  const getPriorityStars = (index: number) => {
    if (index === 0) return 3;
    if (index === 1) return 2;
    if (index === 2) return 1;
    return 0;
  };

  return (
    <div className={cn(
      'px-4 py-3',
      'bg-[var(--bg-void)]',
      'border-b border-[var(--border-default)]'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] font-medium">
          Reference Images
        </span>
        <span className="text-[10px] text-[var(--text-subtle)]">
          {filledSlotCount}/{TOTAL_SLOTS}
        </span>
      </div>

      {/* Horizontal scroll rack with gradient fade indicators */}
      <div className="relative">
        {/* Left fade (hidden when scrolled to start) */}
        <div className={cn(
          'absolute left-0 top-0 bottom-1 w-4 z-10',
          'bg-gradient-to-r from-[var(--bg-void)] to-transparent',
          'pointer-events-none opacity-0'
        )} />
        
        {/* Scroll container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide"
        >
          {/* Show all 10 slots */}
          {referenceSlots.map((slot, index) => {
            const stars = getPriorityStars(index);
            const isHighPriority = index < 3;
            
            return (
              <div
                key={index}
                ref={(el) => { slotRefs.current[index] = el; }}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={cn(
                  'flex-shrink-0 relative',
                  'w-16 h-16 rounded-lg overflow-hidden',
                  'transition-all duration-150',
                  slot 
                    ? 'bg-[var(--bg-mid)]' 
                    : cn(
                        'border border-dashed',
                        isHighPriority
                          ? 'border-[var(--border-strong)] bg-[var(--bg-deep)]'
                          : 'border-[var(--border-default)] bg-[var(--bg-deep)]'
                      ),
                  // Dragging state - lift and glow
                  isDragging && dragIndex === index && 'scale-110 shadow-2xl z-20 ring-2 ring-[var(--text-primary)] opacity-90',
                  // Drop target highlight
                  dropTargetIndex === index && 'ring-2 ring-[var(--accent-brand)] bg-[var(--accent-brand)]/10 scale-105'
                )}
                style={{
                  touchAction: isDragging ? 'none' : 'auto'
                }}
              >
                {slot ? (
                  <>
                    {/* Image with scale animation on add */}
                    <img
                      src={slot.url}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover animate-scale-in"
                    />
                    
                    {/* Priority stars for top 3 */}
                    {stars > 0 && (
                      <div className={cn(
                        'absolute -top-0.5 left-1/2 -translate-x-1/2',
                        'flex gap-px'
                      )}>
                        {Array.from({ length: stars }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-2 h-2',
                              stars === 3 ? 'text-amber-400 fill-amber-400' :
                              stars === 2 ? 'text-[var(--text-secondary)] fill-[var(--text-secondary)]' :
                              'text-[var(--text-muted)] fill-[var(--text-muted)]'
                            )}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Priority badge */}
                    <div className={cn(
                      'absolute bottom-0.5 left-0.5',
                      'px-1 py-0.5 rounded',
                      'bg-black/70 flex items-center justify-center'
                    )}>
                      <span className="text-[9px] font-mono font-medium text-white">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Drag handle - touch this to drag */}
                    <div 
                      className={cn(
                        'absolute top-0.5 left-0.5',
                        'w-6 h-6 rounded',
                        'bg-black/70 flex items-center justify-center',
                        'active:bg-[var(--accent-primary)]',
                        'cursor-grab active:cursor-grabbing',
                        'touch-none' // Prevent scroll when touching this
                      )}
                      onTouchStart={(e) => handleGripTouchStart(index, e)}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-white" />
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSlot(index);
                      }}
                      className={cn(
                        'absolute top-0.5 right-0.5',
                        'w-5 h-5 rounded',
                        'bg-black/60 flex items-center justify-center',
                        'active:bg-[var(--error)]/80',
                        'transition-colors'
                      )}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </>
                ) : (
                  /* Empty slot - clickable to add */
                  <button
                    onClick={() => handleFileSelect(index)}
                    className="w-full h-full flex flex-col items-center justify-center gap-1"
                  >
                    <Plus className={cn(
                      'w-5 h-5',
                      isHighPriority ? 'text-[var(--text-secondary)]' : 'text-[var(--text-subtle)]'
                    )} />
                    <span className={cn(
                      'text-[10px] font-mono font-medium',
                      isHighPriority ? 'text-[var(--text-secondary)]' : 'text-[var(--text-subtle)]'
                    )}>
                      {index + 1}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right fade (scroll indicator) */}
        {showScrollHint && filledSlotCount < 4 && (
          <div className={cn(
            'absolute right-0 top-0 bottom-1 w-8 z-10',
            'bg-gradient-to-l from-[var(--bg-void)] via-[var(--bg-void)]/80 to-transparent',
            'pointer-events-none',
            'flex items-center justify-end pr-1'
          )}>
            <span className="text-[10px] text-[var(--text-muted)] animate-pulse">→</span>
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="text-[9px] text-[var(--text-subtle)] mt-2">
        Drag ≡ handle to reorder. First slots have higher influence.
      </p>
    </div>
  );
}
