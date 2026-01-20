'use client';

import { useState } from 'react';
import { ChevronDown, Settings2, Sparkles, X } from 'lucide-react';
import { PromptInput } from '@/components/generation/PromptInput';
import { PromptPresets } from '@/components/generation/PromptPresets';
import { ResolutionPicker } from '@/components/generation/ResolutionPicker';
import { AdvancedSettings } from '@/components/generation/AdvancedSettings';
import { GenerateButton } from '@/components/generation/GenerateButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-[84px] bottom-0 left-0 z-40', // 56px header + 28px banner
          'w-[320px]',
          'bg-[var(--bg-deep)]',
          'border-r border-[var(--border-default)]',
          'flex flex-col',
          'transition-transform duration-300 ease-out',
          // Mobile: slide in/out
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between px-4 h-12 border-b border-[var(--border-default)]">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Controls
          </span>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable content - scrollbar hidden by default */}
        <div className="flex-1 overflow-y-auto scrollbar-hide hover:scrollbar-default">
          {/* Prompt Section with Presets underneath */}
          <section className="p-3 border-b border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Prompt
              </h2>
              <Sparkles className="w-3 h-3 text-[var(--text-subtle)]" />
            </div>
            <PromptInput />
            
            {/* Quick Presets underneath prompt */}
            <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <PromptPresets compact />
            </div>
          </section>

          {/* Resolution Section */}
          <section className="p-3 border-b border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Resolution
              </h2>
            </div>
            <ResolutionPicker />
          </section>

          {/* Advanced Settings (Collapsible) */}
          <section className="p-3 border-b border-[var(--border-default)]">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className={cn(
                'w-full flex items-center justify-between',
                'text-[10px] font-medium uppercase tracking-[0.08em]',
                advancedOpen ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]',
                'hover:text-[var(--text-primary)] transition-colors'
              )}
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-3 h-3" />
                <span>Advanced</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200',
                  advancedOpen && 'rotate-180'
                )}
              />
            </button>

            {advancedOpen && (
              <div className="mt-3 animate-fade-in">
                <AdvancedSettings />
              </div>
            )}
          </section>
        </div>

        {/* Generate Button (Fixed at bottom) */}
        <div className="p-3 border-t border-[var(--border-default)] bg-[var(--bg-deep)]">
          <GenerateButton />
        </div>
      </aside>
    </>
  );
}
