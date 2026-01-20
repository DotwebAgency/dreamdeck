'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon-sm" 
        disabled 
        className="text-[var(--text-muted)] touch-target"
      >
        <div className="w-4 h-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      ripple={false}
      className={cn(
        'relative overflow-hidden touch-target',
        'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        'transition-all duration-300'
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon - shown in dark mode (to switch to light) */}
      <Sun
        className={cn(
          'h-[18px] w-[18px] absolute transition-all duration-500',
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
        )}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      
      {/* Moon icon - shown in light mode (to switch to dark) */}
      <Moon
        className={cn(
          'h-[18px] w-[18px] absolute transition-all duration-500',
          isDark
            ? '-rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        )}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </Button>
  );
}
