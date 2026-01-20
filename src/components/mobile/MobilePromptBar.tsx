'use client';

import { useRef, useEffect } from 'react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { cn } from '@/lib/utils';

export function MobilePromptBar() {
  const { prompt, setPrompt } = useGenerationStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  return (
    <div className={cn(
      'px-4 py-3',
      'bg-[var(--bg-deep)]',
      'border-b border-[var(--border-default)]'
    )}>
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your vision..."
        rows={2}
        className={cn(
          'w-full resize-none',
          'bg-transparent',
          'text-[var(--text-base)] text-[var(--text-primary)]',
          'placeholder:text-[var(--text-muted)]',
          'focus:outline-none',
          'leading-relaxed'
        )}
      />
      
      {/* Character count */}
      {prompt.length > 0 && (
        <div className="flex justify-end mt-1">
          <span className={cn(
            'text-[10px] tabular-nums',
            prompt.length > 500 ? 'text-[var(--warning)]' : 'text-[var(--text-subtle)]'
          )}>
            {prompt.length}
          </span>
        </div>
      )}
    </div>
  );
}
