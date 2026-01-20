'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useGenerationStore } from '@/store/useGenerationStore';
import { 
  Sun, 
  Moon, 
  Utensils, 
  Plane, 
  Bath, 
  Home,
  Sparkles,
  Lightbulb,
  Mountain,
  Box,
  Camera,
  Aperture
} from 'lucide-react';

// Style enhancement words for architectural visualization
interface StyleToken {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
  category: 'material' | 'lighting' | 'style' | 'angle';
}

const STYLE_TOKENS: StyleToken[] = [
  // Materials
  { id: 'marble', label: 'Marble', value: 'Carrara marble surfaces with subtle veining', category: 'material' },
  { id: 'wood', label: 'Warm Wood', value: 'rich walnut wood accents, natural grain texture', category: 'material' },
  { id: 'glass', label: 'Glass', value: 'floor-to-ceiling glass panels, frameless glazing', category: 'material' },
  { id: 'concrete', label: 'Concrete', value: 'polished concrete floors, architectural concrete', category: 'material' },
  
  // Lighting
  { id: 'golden', label: 'Golden Hour', value: 'warm golden hour sunlight, long soft shadows', category: 'lighting', icon: <Sun className="w-2.5 h-2.5" /> },
  { id: 'blue-hour', label: 'Blue Hour', value: 'twilight blue hour, warm interior glow contrasting evening sky', category: 'lighting', icon: <Moon className="w-2.5 h-2.5" /> },
  { id: 'daylight', label: 'Daylight', value: 'bright natural daylight, soft diffused shadows', category: 'lighting', icon: <Lightbulb className="w-2.5 h-2.5" /> },
  { id: 'dramatic', label: 'Dramatic', value: 'dramatic directional lighting, bold contrast', category: 'lighting' },
  
  // Angles/Composition
  { id: 'wide', label: 'Wide Angle', value: 'wide-angle architectural lens 16mm', category: 'angle', icon: <Aperture className="w-2.5 h-2.5" /> },
  { id: 'straight', label: 'Straight-on', value: 'straight-on perspective, level horizontal lines', category: 'angle' },
  { id: 'elevated', label: 'Elevated', value: '45-degree elevated angle, bird\'s eye perspective', category: 'angle', icon: <Mountain className="w-2.5 h-2.5" /> },
  { id: 'detail', label: 'Detail', value: 'close-up detail shot, macro architectural elements', category: 'angle', icon: <Camera className="w-2.5 h-2.5" /> },
  
  // Style
  { id: 'minimal', label: 'Minimalist', value: 'minimalist contemporary staging, clean negative space', category: 'style' },
  { id: 'luxury', label: 'Luxury', value: 'high-end luxury aesthetic, premium finishes', category: 'style', icon: <Sparkles className="w-2.5 h-2.5" /> },
  { id: 'editorial', label: 'Editorial', value: 'Architectural Digest editorial quality', category: 'style' },
  { id: 'scandinavian', label: 'Scandinavian', value: 'Scandinavian design, hygge atmosphere, soft neutrals', category: 'style' },
];

// Scene presets (full prompts)
interface ScenePreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  prompt: string;
}

const SCENE_PRESETS: ScenePreset[] = [
  {
    id: 'interior-daylight',
    name: 'Interior',
    icon: <Sun className="w-3 h-3" />,
    prompt: 'Professional real estate photography of modern interior living space, abundant natural daylight streaming through large windows, soft diffused shadows, wide-angle architectural lens 16mm, contemporary minimalist staging with designer furniture, neutral color palette with warm wood accents, perfectly level horizontal lines, high-end luxury property listing quality, sharp focus throughout, clean composition',
  },
  {
    id: 'exterior-twilight',
    name: 'Twilight',
    icon: <Moon className="w-3 h-3" />,
    prompt: 'Luxury real estate photography of residential exterior at twilight blue hour, warm golden interior lighting glowing through windows contrasting deep blue evening sky, manicured landscaping and perfectly trimmed hedges, dramatic professional architectural lighting, symmetrical composition, premium curb appeal shot, pristine driveway, editorial quality, tack sharp focus',
  },
  {
    id: 'kitchen-detail',
    name: 'Kitchen',
    icon: <Utensils className="w-3 h-3" />,
    prompt: 'High-end kitchen photography, Carrara marble waterfall island with subtle veining, professional stainless steel appliances, soft directional window light from left, minimal lifestyle staging with fresh flowers, neutral warm color temperature, straight-on three-quarter angle, crisp clean lines, modern European cabinetry, editorial real estate quality, ultra sharp focus on countertop detail',
  },
  {
    id: 'aerial-overview',
    name: 'Aerial',
    icon: <Plane className="w-3 h-3" />,
    prompt: 'Professional drone photography of residential property from 45-degree elevated angle, morning golden hour light casting long soft shadows, entire property visible including landscaping pool and outdoor areas, surrounding neighborhood context, crisp atmospheric clarity, no lens distortion, real estate aerial survey quality, lush green lawn, high altitude perspective',
  },
  {
    id: 'bathroom-elegance',
    name: 'Bathroom',
    icon: <Bath className="w-3 h-3" />,
    prompt: 'Spa-inspired luxury bathroom photography, floor-to-ceiling Calacatta marble with gold veining, frameless glass shower enclosure, brushed nickel fixtures, soft diffused natural skylight illumination, pristine white towels and minimal spa accessories, steam-free mirrors, five-star hotel aesthetic, architectural digest editorial quality, perfect white balance',
  },
  {
    id: 'street-view',
    name: 'Street',
    icon: <Home className="w-3 h-3" />,
    prompt: 'Street-level property photography at golden hour, warm afternoon sunlight on facade, inviting front entrance with landscaped walkway, professional architectural perspective with converging lines corrected, vibrant but natural color saturation, clear blue sky with soft clouds, street trees framing composition, curb appeal maximized, pristine condition, magazine cover quality real estate hero shot',
  },
];

interface PromptPresetsProps {
  compact?: boolean;
}

export function PromptPresets({ compact = false }: PromptPresetsProps) {
  const { prompt, setPrompt } = useGenerationStore();
  const [activeCategory, setActiveCategory] = useState<'scenes' | 'style'>('scenes');
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());

  const handleSceneClick = useCallback((preset: ScenePreset) => {
    if (prompt.trim()) {
      setPrompt(`${prompt.trim()}, ${preset.prompt}`);
    } else {
      setPrompt(preset.prompt);
    }
  }, [prompt, setPrompt]);

  const handleTokenClick = useCallback((token: StyleToken) => {
    const newSelected = new Set(selectedTokens);
    
    if (newSelected.has(token.id)) {
      newSelected.delete(token.id);
      // Remove from prompt (simple approach)
    } else {
      newSelected.add(token.id);
      // Add to prompt
      if (prompt.trim()) {
        setPrompt(`${prompt.trim()}, ${token.value}`);
      } else {
        setPrompt(token.value);
      }
    }
    
    setSelectedTokens(newSelected);
  }, [prompt, setPrompt, selectedTokens]);

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-1 p-0.5 bg-[var(--bg-deep)] rounded-[var(--radius-sm)]">
        <button
          onClick={() => setActiveCategory('scenes')}
          className={cn(
            'flex-1 px-3 py-1.5 rounded-[var(--radius-xs)]',
            'text-[10px] font-medium transition-all duration-150',
            activeCategory === 'scenes' 
              ? 'bg-[var(--bg-mid)] text-[var(--text-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          )}
        >
          Scenes
        </button>
        <button
          onClick={() => setActiveCategory('style')}
          className={cn(
            'flex-1 px-3 py-1.5 rounded-[var(--radius-xs)]',
            'text-[10px] font-medium transition-all duration-150',
            activeCategory === 'style' 
              ? 'bg-[var(--bg-mid)] text-[var(--text-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          )}
        >
          Style
        </button>
      </div>

      {/* Scene presets */}
      {activeCategory === 'scenes' && (
        <div className="flex flex-wrap gap-1.5">
          {SCENE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSceneClick(preset)}
              className={cn(
                'flex items-center gap-1.5',
                'px-2.5 py-1.5 rounded-[var(--radius-sm)]',
                'text-[11px] font-medium',
                'bg-[var(--bg-elevated)]',
                'border border-[var(--border-default)]',
                'text-[var(--text-secondary)]',
                'hover:border-[var(--border-strong)]',
                'hover:text-[var(--text-primary)]',
                'hover:bg-[var(--bg-hover)]',
                'active:scale-[0.97]',
                'transition-all duration-150'
              )}
            >
              {preset.icon}
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Style tokens */}
      {activeCategory === 'style' && (
        <div className="space-y-2">
          {/* Materials */}
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)] mb-1 block">Materials</span>
            <div className="flex flex-wrap gap-1">
              {STYLE_TOKENS.filter(t => t.category === 'material').map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleTokenClick(token)}
                  className={cn(
                    'px-2 py-1 rounded-[var(--radius-xs)]',
                    'text-[10px]',
                    'border transition-all duration-150',
                    selectedTokens.has(token.id)
                      ? 'bg-[var(--bg-mid)] border-[var(--border-strong)] text-[var(--text-primary)]'
                      : 'bg-[var(--bg-deep)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                    'active:scale-[0.97]'
                  )}
                >
                  {token.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Lighting */}
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)] mb-1 block">Lighting</span>
            <div className="flex flex-wrap gap-1">
              {STYLE_TOKENS.filter(t => t.category === 'lighting').map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleTokenClick(token)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-[var(--radius-xs)]',
                    'text-[10px]',
                    'border transition-all duration-150',
                    selectedTokens.has(token.id)
                      ? 'bg-[var(--bg-mid)] border-[var(--border-strong)] text-[var(--text-primary)]'
                      : 'bg-[var(--bg-deep)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                    'active:scale-[0.97]'
                  )}
                >
                  {token.icon}
                  {token.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Angles */}
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)] mb-1 block">Angle</span>
            <div className="flex flex-wrap gap-1">
              {STYLE_TOKENS.filter(t => t.category === 'angle').map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleTokenClick(token)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-[var(--radius-xs)]',
                    'text-[10px]',
                    'border transition-all duration-150',
                    selectedTokens.has(token.id)
                      ? 'bg-[var(--bg-mid)] border-[var(--border-strong)] text-[var(--text-primary)]'
                      : 'bg-[var(--bg-deep)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                    'active:scale-[0.97]'
                  )}
                >
                  {token.icon}
                  {token.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Style */}
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)] mb-1 block">Style</span>
            <div className="flex flex-wrap gap-1">
              {STYLE_TOKENS.filter(t => t.category === 'style').map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleTokenClick(token)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-[var(--radius-xs)]',
                    'text-[10px]',
                    'border transition-all duration-150',
                    selectedTokens.has(token.id)
                      ? 'bg-[var(--bg-mid)] border-[var(--border-strong)] text-[var(--text-primary)]'
                      : 'bg-[var(--bg-deep)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                    'active:scale-[0.97]'
                  )}
                >
                  {token.icon}
                  {token.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-[9px] text-[var(--text-subtle)]">
        {activeCategory === 'scenes' 
          ? 'Tap to add full scene preset to prompt.'
          : 'Tap style tokens to add to your prompt.'}
      </p>
    </div>
  );
}
