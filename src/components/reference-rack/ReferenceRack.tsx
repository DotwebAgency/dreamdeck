'use client';

import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useGenerationStore } from '@/store/useGenerationStore';
import { ReferenceSlot } from './ReferenceSlot';
import { cn } from '@/lib/utils';
import { Images, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ReferenceRack() {
  const { referenceSlots, reorderSlots, clearAllSlots } = useGenerationStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = parseInt(active.id as string, 10);
        const newIndex = parseInt(over.id as string, 10);

        // Get new order
        const indices = referenceSlots.map((_, i) => i);
        const newIndices = arrayMove(indices, oldIndex, newIndex);

        reorderSlots(oldIndex, newIndex);
      }
    },
    [referenceSlots, reorderSlots]
  );

  const filledCount = referenceSlots.filter((s) => s !== null).length;

  return (
    <div
      className={cn(
        'bg-[var(--bg-deep)]',
        'border-b border-[var(--border-default)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Reference Images
          </h2>
          {filledCount > 0 && (
            <span className={cn(
              'px-1.5 py-0.5',
              'text-[10px] font-medium',
              'text-[var(--text-secondary)]',
              'bg-[var(--bg-soft)]',
              'rounded-[var(--radius-xs)]'
            )}>
              {filledCount}/10
            </span>
          )}
        </div>

        {filledCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm(`Clear all ${filledCount} reference images?`)) {
                clearAllSlots();
              }
            }}
            className="text-[var(--text-muted)] hover:text-[var(--error)] text-xs gap-1.5"
          >
            <Trash2 className="w-3 h-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Slots */}
      <div className="p-4 overflow-x-auto scrollbar-hide">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={referenceSlots.map((_, i) => i.toString())}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-2 min-w-max">
              {referenceSlots.map((slot, index) => (
                <ReferenceSlot key={index} index={index} slot={slot} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Help text */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-[var(--text-subtle)]">
          Drag to reorder priority. First slots have higher influence.
        </p>
      </div>
    </div>
  );
}
