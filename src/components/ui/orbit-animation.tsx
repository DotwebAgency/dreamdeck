'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OrbitAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Orbit Animation - PURE MONOCHROME BLACK/SLATE VERSION
 * No colors except grayscale - perfectly neutral for any theme
 */
export function OrbitAnimation({ className, size = 'md' }: OrbitAnimationProps) {
  const sizeConfig = {
    sm: { container: 'w-20 h-20', earth: 'w-5 h-5', ring1: 12, ring2: 20, ring3: 30 },
    md: { container: 'w-28 h-28', earth: 'w-6 h-6', ring1: 16, ring2: 28, ring3: 40 },
    lg: { container: 'w-36 h-36', earth: 'w-8 h-8', ring1: 20, ring2: 36, ring3: 52 },
  };

  const config = sizeConfig[size];

  // Memoized stars for performance
  const stars = useMemo(() => 
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      size: Math.random() * 1.5 + 0.5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
      brightness: Math.random() * 0.4 + 0.15,
    })),
    []
  );

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center',
        config.container,
        className
      )}
      aria-hidden="true"
    >
      {/* Deep space background stars - pure white/gray */}
      {stars.map((star) => (
        <div 
          key={star.id}
          className="absolute rounded-full will-change-transform"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.x}%`,
            top: `${star.y}%`,
            backgroundColor: 'var(--text-muted)',
            animation: `star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            opacity: star.brightness,
          }}
        />
      ))}

      {/* Subtle dust cloud - grayscale only */}
      <div 
        className="absolute inset-0 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, var(--text-subtle) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, var(--text-disabled) 0%, transparent 40%)',
        }}
      />

      {/* Outer orbit ring - furthest */}
      <div 
        className="absolute rounded-full border border-[var(--border-subtle)] will-change-transform"
        style={{
          inset: '0',
          animation: 'orbit-spin 50s linear infinite',
        }}
      >
        {/* Distant moon */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--text-muted)]"
          style={{
            boxShadow: '0 0 6px var(--text-subtle)',
          }}
        />
      </div>

      {/* Middle orbit ring */}
      <div 
        className="absolute rounded-full border border-[var(--border-default)] will-change-transform"
        style={{
          inset: `${config.ring1}px`,
          animation: 'orbit-spin 35s linear infinite reverse',
        }}
      >
        {/* Satellite */}
        <div 
          className="absolute bottom-0 right-1/4 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)]"
          style={{
            boxShadow: '0 0 4px var(--text-muted)',
          }}
        />
      </div>

      {/* Inner orbit ring - closest to center */}
      <div 
        className="absolute rounded-full border border-dashed border-[var(--border-default)] opacity-60 will-change-transform"
        style={{
          inset: `${config.ring2}px`,
          animation: 'orbit-spin 22s linear infinite',
        }}
      >
        {/* Space station */}
        <div 
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[var(--text-primary)]"
          style={{
            boxShadow: '0 0 3px var(--text-secondary)',
          }}
        />
      </div>

      {/* Center sphere - pure grayscale */}
      <div className="relative z-10">
        {/* Atmospheric glow - gray */}
        <div 
          className="absolute -inset-3 rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle, var(--text-subtle) 0%, var(--text-disabled) 40%, transparent 70%)',
            opacity: 0.25,
            animation: 'atmosphere-pulse 4s ease-in-out infinite',
          }}
        />
        
        {/* Core sphere - monochrome gradient */}
        <div 
          className={cn(
            'relative rounded-full overflow-hidden',
            config.earth
          )}
          style={{
            background: 'linear-gradient(135deg, #27272a 0%, #52525b 50%, #3f3f46 100%)',
            boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.6), inset 2px 2px 4px rgba(255,255,255,0.08), 0 0 12px rgba(113,113,122,0.3)',
          }}
        >
          {/* Surface texture layer */}
          <div 
            className="absolute inset-0 rounded-full will-change-transform"
            style={{
              animation: 'earth-rotate 80s linear infinite',
            }}
          >
            {/* Surface feature 1 */}
            <div 
              className="absolute rounded-full"
              style={{ 
                width: '35%', 
                height: '25%', 
                top: '20%', 
                left: '10%',
                background: 'rgba(82, 82, 91, 0.4)',
                filter: 'blur(1px)',
                transform: 'rotate(-15deg)',
              }}
            />
            {/* Surface feature 2 */}
            <div 
              className="absolute rounded-full"
              style={{ 
                width: '20%', 
                height: '40%', 
                top: '25%', 
                left: '45%',
                background: 'rgba(82, 82, 91, 0.35)',
                filter: 'blur(1px)',
              }}
            />
            {/* Surface feature 3 */}
            <div 
              className="absolute rounded-full"
              style={{ 
                width: '35%', 
                height: '30%', 
                top: '20%', 
                right: '5%',
                background: 'rgba(82, 82, 91, 0.3)',
                filter: 'blur(1px)',
              }}
            />
          </div>
          
          {/* Cloud/atmosphere layer */}
          <div 
            className="absolute inset-0 rounded-full will-change-transform"
            style={{
              background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.12) 0%, transparent 30%), radial-gradient(ellipse at 60% 70%, rgba(255,255,255,0.08) 0%, transparent 25%)',
              animation: 'clouds-drift 40s linear infinite',
            }}
          />
          
          {/* Polar caps - subtle white */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-white/15 rounded-full"
            style={{ filter: 'blur(1px)' }}
          />
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-white/10 rounded-full"
            style={{ filter: 'blur(1px)' }}
          />
        </div>
      </div>

      {/* Cosmic dust ring */}
      <div 
        className="absolute inset-0 rounded-full opacity-10 will-change-transform"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, var(--border-subtle) 25%, transparent 50%, var(--border-subtle) 75%, transparent 100%)',
          animation: 'orbit-spin 120s linear infinite',
        }}
      />

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes atmosphere-pulse {
          0%, 100% { 
            opacity: 0.2;
            transform: scale(1);
          }
          50% { 
            opacity: 0.35;
            transform: scale(1.08);
          }
        }
        
        @keyframes earth-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes clouds-drift {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        
        @keyframes star-twinkle {
          0%, 100% { 
            opacity: 0.15;
            transform: scale(0.8);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.3);
          }
        }
        
        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
