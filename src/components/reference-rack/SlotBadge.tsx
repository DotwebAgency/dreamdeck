'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PRIMARY_SLOT_INDEX, SECONDARY_SLOT_INDICES } from '@/lib/constants';

interface SlotBadgeProps {
  index: number;
  className?: string;
}

export function SlotBadge({ index, className }: SlotBadgeProps) {
  const isPrimary = index === PRIMARY_SLOT_INDEX;
  const isSecondary = SECONDARY_SLOT_INDICES.includes(index);

  return (
    <div
      className={cn(
        'absolute top-1 left-1 z-10 flex items-center justify-center rounded-full text-[10px] font-medium w-5 h-5',
        isPrimary && 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black glow-gold',
        isSecondary && 'bg-gradient-to-br from-slate-300 to-slate-500 text-black glow-silver',
        !isPrimary && !isSecondary && 'bg-gradient-to-br from-orange-400 to-orange-700 text-black glow-bronze',
        className
      )}
    >
      {index + 1}
    </div>
  );
}

export function SlotPriorityIndicator({ index }: { index: number }) {
  const isPrimary = index === PRIMARY_SLOT_INDEX;
  const isSecondary = SECONDARY_SLOT_INDICES.includes(index);

  if (isPrimary) {
    return (
      <span className="text-[10px] font-medium text-yellow-500">
        Primary Weight
      </span>
    );
  }

  if (isSecondary) {
    return (
      <span className="text-[10px] font-medium text-slate-400">
        Style Reference
      </span>
    );
  }

  return (
    <span className="text-[10px] font-medium text-orange-400/70">
      Composition
    </span>
  );
}
