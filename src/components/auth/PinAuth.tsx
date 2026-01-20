'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Lock, Unlock, AlertCircle, Sparkles } from 'lucide-react';

// PIN from environment variable for security
const CORRECT_PIN = process.env.NEXT_PUBLIC_AUTH_PIN || '68500';
const STORAGE_KEY = 'dreamdeck_auth';

interface PinAuthProps {
  children: ReactNode;
}

export function PinAuth({ children }: PinAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [pin, setPin] = useState<string[]>(['', '', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check session on mount
  useEffect(() => {
    const auth = sessionStorage.getItem(STORAGE_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  // Focus first input when auth screen shows
  useEffect(() => {
    if (!isAuthenticated && !isChecking) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isAuthenticated, isChecking]);

  const handleChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError(false);

    if (digit && index < 4) {
      inputRefs.current[index + 1]?.focus();
      setFocused(index + 1);
    }

    if (digit && index === 4) {
      const enteredPin = newPin.join('');
      
      if (enteredPin === CORRECT_PIN) {
        setSuccess(true);
        sessionStorage.setItem(STORAGE_KEY, 'true');
        setTimeout(() => {
          setIsAuthenticated(true);
        }, 800);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(['', '', '', '', '']);
          inputRefs.current[0]?.focus();
          setFocused(0);
        }, 600);
      }
    }
  }, [pin]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        inputRefs.current[index - 1]?.focus();
        setFocused(index - 1);
      } else {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocused(index - 1);
    } else if (e.key === 'ArrowRight' && index < 4) {
      inputRefs.current[index + 1]?.focus();
      setFocused(index + 1);
    }
  }, [pin]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    
    if (pasted.length === 5) {
      const newPin = pasted.split('');
      setPin(newPin);
      
      if (pasted === CORRECT_PIN) {
        setSuccess(true);
        sessionStorage.setItem(STORAGE_KEY, 'true');
        setTimeout(() => {
          setIsAuthenticated(true);
        }, 800);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(['', '', '', '', '']);
          inputRefs.current[0]?.focus();
          setFocused(0);
        }, 600);
      }
    }
  }, []);

  // Show nothing while checking
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-void)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--border-default)] border-t-[var(--text-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  // Show children if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show PIN screen
  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-void)] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div 
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--bg-soft),transparent)]'
        )} 
      />
      <div 
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(ellipse_50%_50%_at_50%_100%,var(--bg-mid)/50,transparent)]'
        )} 
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-md">
        {/* Logo */}
        <div
          className={cn(
            'w-24 h-24 rounded-[var(--radius-xl)] flex items-center justify-center mb-8',
            'bg-gradient-to-br from-[var(--bg-mid)] to-[var(--bg-deep)]',
            'border border-[var(--border-default)]',
            'shadow-[var(--shadow-xl),var(--inset-highlight)]',
            'transition-all duration-500',
            success && 'scale-110 border-[var(--success)]/50 shadow-[0_0_40px_var(--success)/20]'
          )}
        >
          {success ? (
            <Unlock className="w-10 h-10 text-[var(--success)] animate-[pulse_1s_ease-in-out]" />
          ) : (
            <Sparkles className="w-10 h-10 text-[var(--text-muted)]" />
          )}
        </div>

        {/* Title */}
        <h1 
          className={cn(
            'text-xl font-medium tracking-[0.05em]',
            'text-[var(--text-primary)] mb-3'
          )}
        >
          DREAMDECK
        </h1>
        
        <p className="text-[13px] text-[var(--text-muted)] mb-12 tracking-wide">
          Enter access code to continue
        </p>

        {/* PIN Inputs */}
        <div
          className={cn(
            'flex gap-3 sm:gap-4 mb-8',
            shake && 'animate-shake'
          )}
          onPaste={handlePaste}
        >
          {pin.map((digit, index) => (
            <div 
              key={index} 
              className="relative"
              style={{
                animation: 'pin-stagger 0.5s ease-out forwards',
                animationDelay: `${index * 80}ms`,
                opacity: 0,
                transform: 'translateY(20px)'
              }}
            >
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => setFocused(index)}
                className={cn(
                  'w-12 h-16 sm:w-14 sm:h-18 text-center',
                  'text-xl font-mono font-medium',
                  'bg-[var(--bg-deep)]',
                  'rounded-[var(--radius-md)]',
                  'border-2 transition-all duration-200',
                  'outline-none',
                  'shadow-[var(--inset-sm)]',
                  'touch-target',
                  error
                    ? 'border-[var(--error)]/60 text-[var(--error)]'
                    : success
                    ? 'border-[var(--success)]/60 text-[var(--success)] scale-105'
                    : focused === index
                    ? 'border-[var(--border-focus)] text-[var(--text-primary)]'
                    : digit
                    ? 'border-[var(--border-default)] text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] text-[var(--text-muted)]',
                  'placeholder:text-[var(--text-subtle)]'
                )}
                placeholder="•"
                autoComplete="off"
                aria-label={`PIN digit ${index + 1}`}
              />
              
              {/* Focus glow */}
              {focused === index && !error && !success && (
                <div 
                  className={cn(
                    'absolute inset-0 rounded-[var(--radius-md)]',
                    'bg-[var(--text-primary)]/5 blur-xl -z-10',
                    'animate-pulse'
                  )} 
                />
              )}
              
              {/* Success glow per input */}
              {success && (
                <div 
                  className={cn(
                    'absolute inset-0 rounded-[var(--radius-md)]',
                    'bg-[var(--success)]/20 blur-lg -z-10'
                  )}
                  style={{
                    animation: 'success-glow 0.6s ease-out forwards',
                    animationDelay: `${index * 60}ms`
                  }}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* CSS for staggered animations */}
        <style jsx>{`
          @keyframes pin-stagger {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes success-glow {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
            100% {
              opacity: 0.5;
              transform: scale(1);
            }
          }
        `}</style>

        {/* Status messages */}
        <div className="h-8 flex items-center justify-center">
          {/* Error message */}
          <div
            className={cn(
              'flex items-center gap-2 text-[12px] transition-all duration-200',
              error ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            )}
          >
            <AlertCircle className="w-4 h-4 text-[var(--error)]" />
            <span className="text-[var(--error)]">Invalid access code</span>
          </div>

          {/* Success message */}
          <div
            className={cn(
              'flex items-center gap-2 text-[12px] transition-all duration-200',
              success ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
              !success && 'absolute'
            )}
          >
            <Shield className="w-4 h-4 text-[var(--success)]" />
            <span className="text-[var(--success)]">Access granted</span>
          </div>
        </div>

        {/* Footer */}
        <p 
          className={cn(
            'absolute bottom-8 left-1/2 -translate-x-1/2',
            'text-[10px] text-[var(--text-subtle)]',
            'tracking-wide whitespace-nowrap'
          )}
        >
          Secure session • Clears on tab close
        </p>
      </div>
    </div>
  );
}
