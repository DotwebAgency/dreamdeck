'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OrbitAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

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
      brightness: Math.random() * 0.4 + 0.2,
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
      {/* Deep space background stars */}
      {stars.map((star) => (
        <div 
          key={star.id}
          className="absolute rounded-full will-change-transform"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.x}%`,
            top: `${star.y}%`,
            backgroundColor: 'var(--text-subtle)',
            animation: `star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            opacity: star.brightness,
          }}
        />
      ))}

      {/* Nebula glow - subtle cosmic dust */}
      <div 
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, rgba(96,165,250,0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.08) 0%, transparent 40%)',
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
            boxShadow: '0 0 6px var(--text-muted)',
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
            boxShadow: '0 0 4px var(--text-secondary)',
          }}
        />
      </div>

      {/* Inner orbit ring - closest to Earth */}
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
            boxShadow: '0 0 3px var(--text-primary)',
          }}
        />
      </div>

      {/* Earth at center */}
      <div className="relative z-10">
        {/* Atmospheric glow */}
        <div 
          className="absolute -inset-3 rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(96,165,250,0.25) 0%, rgba(59,130,246,0.1) 40%, transparent 70%)',
            animation: 'atmosphere-pulse 4s ease-in-out infinite',
          }}
        />
        
        {/* Earth sphere */}
        <div 
          className={cn(
            'relative rounded-full overflow-hidden',
            config.earth
          )}
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)',
            boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.5), inset 2px 2px 4px rgba(255,255,255,0.1), 0 0 12px rgba(59,130,246,0.4)',
          }}
        >
          {/* Continents layer */}
          <div 
            className="absolute inset-0 rounded-full will-change-transform"
            style={{
              animation: 'earth-rotate 80s linear infinite',
            }}
          >
            {/* North America hint */}
            <div 
              className="absolute rounded-full bg-[#22c55e]/40"
              style={{ 
                width: '35%', 
                height: '25%', 
                top: '20%', 
                left: '10%',
                filter: 'blur(1px)',
                transform: 'rotate(-15deg)',
              }}
            />
            {/* Europe/Africa hint */}
            <div 
              className="absolute rounded-full bg-[#22c55e]/35"
              style={{ 
                width: '20%', 
                height: '40%', 
                top: '25%', 
                left: '45%',
                filter: 'blur(1px)',
              }}
            />
            {/* Asia hint */}
            <div 
              className="absolute rounded-full bg-[#22c55e]/30"
              style={{ 
                width: '35%', 
                height: '30%', 
                top: '20%', 
                right: '5%',
                filter: 'blur(1px)',
              }}
            />
          </div>
          
          {/* Cloud layer */}
          <div 
            className="absolute inset-0 rounded-full will-change-transform"
            style={{
              background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.2) 0%, transparent 30%), radial-gradient(ellipse at 60% 70%, rgba(255,255,255,0.15) 0%, transparent 25%)',
              animation: 'clouds-drift 40s linear infinite',
            }}
          />
          
          {/* Polar ice caps */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-white/25 rounded-full"
            style={{ filter: 'blur(1px)' }}
          />
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-white/20 rounded-full"
            style={{ filter: 'blur(1px)' }}
          />
        </div>
      </div>

      {/* Cosmic dust ring */}
      <div 
        className="absolute inset-0 rounded-full opacity-15 will-change-transform"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, var(--border-subtle) 25%, transparent 50%, var(--border-subtle) 75%, transparent 100%)',
          animation: 'orbit-spin 120s linear infinite',
        }}
      />

      {/* CSS Keyframes - Using transform for GPU acceleration */}
      <style jsx>{`
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes atmosphere-pulse {
          0%, 100% { 
            opacity: 0.7;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
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
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% { 
            opacity: 0.9;
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
