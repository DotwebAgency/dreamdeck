'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Wand2,
  Send,
  ChevronUp, 
  ChevronDown,
  Plus
} from 'lucide-react';
import { useGenerationStore, useCanGenerate, useActiveJobCount, useQueueCapacityUsed, useQueueCapacityMax } from '@/store/useGenerationStore';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { COST_PER_IMAGE, MAX_QUEUED_JOBS } from '@/lib/constants';

interface MobileBottomBarProps {
  onSettingsClick: () => void;
  onHistoryClick?: () => void;
}

export function MobileBottomBar({ onSettingsClick, onHistoryClick }: MobileBottomBarProps) {
  const {
    prompt,
    setPrompt,
    resolution,
    numImages,
    createJob,
    results,
  } = useGenerationStore();

  const canGenerate = useCanGenerate();
  const activeJobCount = useActiveJobCount();
  const queueUsed = useQueueCapacityUsed();
  const queueMax = useQueueCapacityMax();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isQueueFull = queueUsed >= queueMax;
  const hasResults = results.length > 0;
  const activeCount = activeJobCount;
  const estimatedCost = numImages * COST_PER_IMAGE;
  const isQueueActive = activeCount > 0;
  
  // Handle keyboard visibility on Android
  useEffect(() => {
    const handleResize = () => {
      // On Android, window.innerHeight shrinks when keyboard appears
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      setIsKeyboardVisible(viewportHeight < windowHeight * 0.75);
    };
    
    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Auto-scroll textarea into view when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isExpanded]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt required',
        description: 'Please enter a prompt to generate images.',
      });
      return;
    }
    
    if (isQueueFull) {
      toast({
        variant: 'warning',
        title: 'Queue full',
        description: `Maximum ${MAX_QUEUED_JOBS} jobs allowed.`,
      });
      return;
    }

    const jobId = createJob();
    
    if (jobId) {
      const position = queueUsed + 1;
      toast({
        variant: 'success',
        title: activeJobCount > 0 ? `Queued (#${position})` : 'Generating',
        description: `${resolution.width}×${resolution.height} • ${numImages} image${numImages > 1 ? 's' : ''}`,
      });
      // Collapse after generating
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    textareaRef.current?.focus();
  };
  
  const handleClose = () => {
    setIsExpanded(false);
    textareaRef.current?.blur();
  };

  return (
    <>
      {/* Full-screen prompt editor overlay */}
      {isExpanded && (
        <div 
          ref={containerRef}
          className={cn(
            'fixed inset-0 z-[100]',
            'flex flex-col',
            'bg-[var(--bg-void)]'
          )}
        >
          {/* Header */}
          <div className={cn(
            'flex items-center justify-between px-4 h-14',
            'bg-[var(--bg-void)] border-b border-[var(--border-subtle)]',
            'safe-top'
          )}>
            {/* Left - Done button */}
            <button
              onClick={handleClose}
              className="flex items-center gap-2 text-[var(--text-secondary)] min-w-[80px]"
            >
              <ChevronDown className="w-5 h-5" />
              <span className="text-[13px]">Done</span>
            </button>
            
            {/* Center - Character count */}
            <span className={cn(
              'text-[11px] tabular-nums',
              prompt.length > 1800 ? 'text-[var(--error)]' : 
              prompt.length > 1500 ? 'text-amber-400' : 
              'text-[var(--text-muted)]'
            )}>
              {prompt.length}/2000
            </span>
            
            {/* Right - Generate button */}
            <button
              onClick={() => {
                if (canGenerate) handleGenerate();
                handleClose();
              }}
              disabled={!canGenerate}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg min-w-[44px] justify-center',
                'text-[13px] font-medium',
                'transition-all duration-150',
                canGenerate
                  ? 'bg-[var(--text-primary)] text-[var(--bg-void)]'
                  : 'bg-[var(--bg-soft)] text-[var(--text-muted)]'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Textarea - takes remaining space */}
          <div className="flex-1 p-4">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your image in detail...

Examples:
• A serene mountain landscape at golden hour
• Portrait of a cyberpunk character with neon lights
• Minimalist product photo with soft shadows"
              className={cn(
                'w-full h-full',
                'bg-transparent',
                'text-[16px] text-[var(--text-primary)]', // 16px prevents iOS zoom
                'placeholder:text-[var(--text-subtle)]',
                'resize-none',
                'focus:outline-none',
                'leading-relaxed'
              )}
              maxLength={2000}
            />
          </div>
          
          {/* Bottom action bar - stays above keyboard */}
          <div 
            className={cn(
              'px-4 py-3',
              'bg-[var(--bg-deep)] border-t border-[var(--border-default)]',
              'safe-bottom'
            )}
            style={{
              // On Android, this keeps the bar visible above keyboard
              paddingBottom: isKeyboardVisible ? '8px' : 'calc(8px + env(safe-area-inset-bottom))'
            }}
          >
            <div className="flex items-center gap-3">
              {/* Resolution badge */}
              <div className="flex-1">
                <span className="text-[11px] text-[var(--text-muted)]">
                  {resolution.width}×{resolution.height} • ~${estimatedCost.toFixed(3)}
                </span>
              </div>
              
              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 rounded-xl',
                  'text-[14px] font-medium',
                  'transition-all duration-150',
                  'active:scale-[0.97]',
                  canGenerate
                    ? 'bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] text-[var(--bg-void)] shadow-lg'
                    : 'bg-[var(--bg-soft)] text-[var(--text-muted)]'
                )}
              >
                {isQueueActive ? (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Queue</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div 
        className={cn(
          'fixed left-0 right-0 bottom-0 z-50',
          'bg-[var(--bg-deep)]/95 backdrop-blur-xl',
          'border-t border-[var(--border-default)]',
          isExpanded && 'hidden'
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-2 px-3 py-3">
          {/* Prompt Preview / Expand - main touch target */}
          <button
            onClick={() => setIsExpanded(true)}
            className={cn(
              'flex-1 flex items-center gap-2 px-4 py-3 h-12',
              'bg-[var(--bg-mid)]',
              'border border-[var(--border-default)]',
              'rounded-xl',
              'text-left',
              'active:scale-[0.98]',
              'transition-all duration-150'
            )}
          >
            <div className="flex-1 min-w-0">
              {prompt ? (
                <span className="text-[14px] text-[var(--text-secondary)] line-clamp-1">
                  {prompt}
                </span>
              ) : (
                <span className="text-[14px] text-[var(--text-subtle)]">
                  Write your prompt...
                </span>
              )}
            </div>
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          </button>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={cn(
              'relative h-12 px-4 rounded-xl',
              'font-medium text-[14px]',
              'flex items-center justify-center gap-2',
              'transition-all duration-150',
              'active:scale-[0.97]',
              canGenerate
                ? 'bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] text-[var(--bg-void)] shadow-lg'
                : 'bg-[var(--bg-soft)] text-[var(--text-muted)]'
            )}
          >
            {isQueueActive ? (
              <>
                <Plus className="w-5 h-5" />
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--bg-void)]/20 text-[11px] font-bold">
                  {activeCount}
                </span>
              </>
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
