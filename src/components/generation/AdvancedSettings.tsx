'use client';

import { Dices, Hash, Layers } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function AdvancedSettings() {
  const { seed, setSeed, numImages, setNumImages, mode, setMode } =
    useGenerationStore();

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 2147483647));
  };

  return (
    <div className="space-y-5">
      {/* Seed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5">
            <Hash className="w-3 h-3" />
            Seed
          </Label>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={randomizeSeed}
            className="text-slate-500 hover:text-slate-300"
          >
            <Dices className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={seed === -1 ? '' : seed}
            onChange={(e) =>
              setSeed(e.target.value === '' ? -1 : parseInt(e.target.value, 10))
            }
            placeholder="Random"
            className="font-mono text-sm"
          />
        </div>
        <p className="text-[10px] text-slate-600">
          Leave empty for random. Use same seed for reproducible results.
        </p>
      </div>

      {/* Number of images */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            Images
          </Label>
          <span className="text-[12px] font-mono text-slate-400">{numImages}</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => setNumImages(num)}
              className={cn(
                'flex-1 py-2 text-[13px] font-medium rounded-[4px]',
                'border transition-all duration-150',
                numImages === num
                  ? 'bg-[#151820] border-slate-600 text-slate-100'
                  : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="space-y-2">
        <Label>Generation Mode</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as 'std' | 'turbo')}>
          <SelectTrigger>
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="std">
              <span className="flex items-center gap-2">
                <span>Standard</span>
                <span className="text-[10px] text-slate-500">Higher quality</span>
              </span>
            </SelectItem>
            <SelectItem value="turbo">
              <span className="flex items-center gap-2">
                <span>Turbo</span>
                <span className="text-[10px] text-slate-500">Faster</span>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
