'use client';

import { useRef, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGenerationStore } from '@/store/useGenerationStore';
import { cn } from '@/lib/utils';

// Suggestion chips for quick prompt building
const STYLE_SUGGESTIONS = [
  'photorealistic', 'cinematic', 'artistic', 'minimalist', 
  'dramatic lighting', 'soft light', 'golden hour', 'neon',
  'highly detailed', 'smooth', '8k', 'professional'
];

export function PromptInput() {
  const { prompt, setPrompt } = useGenerationStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      // Trigger generation - handled by parent through keyboard shortcut
      e.preventDefault();
      // Save to history
      if (prompt.trim() && !history.includes(prompt)) {
        setHistory(prev => [prompt, ...prev.slice(0, 9)]);
      }
    }
  };

  const handleClear = () => {
    if (prompt.trim()) {
      // Save current prompt before clearing
      if (!history.includes(prompt)) {
        setHistory(prev => [prompt, ...prev.slice(0, 9)]);
      }
    }
    setPrompt('');
    textareaRef.current?.focus();
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prevPrompt = history[0];
      setPrompt(prevPrompt);
      setHistory(prev => prev.slice(1));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const newPrompt = prompt.trim() 
      ? `${prompt.trim()}, ${suggestion}`
      : suggestion;
    setPrompt(newPrompt);
    textareaRef.current?.focus();
  };

  const charCount = prompt.length;
  const maxChars = 2000;
  const isWarning = charCount > maxChars * 0.8;
  const isError = charCount > maxChars * 0.95;

  return (
    <div className="space-y-3">
      {/* Main textarea with floating elements */}
      <div className="relative group">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your image in detail... (e.g., 'A serene mountain landscape at golden hour, cinematic lighting, 8k')"
          className={cn(
            'min-h-[140px] resize-none',
            'text-[13px] leading-relaxed',
            'pr-20', // Space for controls
            'placeholder:text-[var(--text-subtle)]'
          )}
          maxLength={maxChars}
        />

        {/* Floating controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {/* Undo button */}
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleUndo}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="Undo (restore previous)"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
          
          {/* Clear button */}
          {prompt.length > 0 && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleClear}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--error)]"
              title="Clear prompt"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Character count */}
        <div
          className={cn(
            'absolute bottom-2 right-2',
            'text-[10px] tabular-nums font-mono',
            'transition-colors',
            isError ? 'text-[var(--error)]' : 
            isWarning ? 'text-[var(--warning)]' : 
            'text-[var(--text-subtle)]'
          )}
        >
          {charCount.toLocaleString()}/{maxChars.toLocaleString()}
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5">
        {STYLE_SUGGESTIONS.slice(0, 6).map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            className={cn(
              'px-2 py-1 rounded',
              'text-[10px] font-medium',
              'bg-[var(--bg-soft)] text-[var(--text-muted)]',
              'border border-[var(--border-subtle)]',
              'hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]',
              'hover:border-[var(--border-default)]',
              'transition-all duration-150',
              'active:scale-95'
            )}
          >
            + {suggestion}
          </button>
        ))}
      </div>

      {/* Keyboard hint */}
      <div className="flex items-center justify-end">
        <div className="text-[10px] text-[var(--text-subtle)]">
          <kbd className="px-1 py-0.5 bg-[var(--bg-soft)] border border-[var(--border-default)] rounded text-[9px] font-mono">⌘</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-1 py-0.5 bg-[var(--bg-soft)] border border-[var(--border-default)] rounded text-[9px] font-mono">↵</kbd>
          <span className="ml-1">to generate</span>
        </div>
      </div>
    </div>
  );
}
