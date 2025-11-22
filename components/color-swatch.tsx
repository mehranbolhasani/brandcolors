'use client';

import { BrandColor, ColorFormat } from '@/lib/types';
import { formatColor, copyToClipboard } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColorSwatchProps {
  color: BrandColor;
  format: ColorFormat;
  brandName: string;
}

export function ColorSwatch({ color, format, brandName }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);
  const formattedColor = formatColor(color.hex, format);

  const handleCopy = async () => {
    const success = await copyToClipboard(formattedColor);
    if (success) {
      setCopied(true);
      toast.success(`Copied ${formattedColor}`, {
        description: `${brandName} - ${color.name}`,
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy color');
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="group relative flex flex-col items-center gap-2 px-4 hover:bg-muted/50 transition-smooth flex-1" style={{ backgroundColor: color.hex }}
          >
            <div className="flex flex-col items-start justify-between w-full mt-4">
              {color.name && (
                <span className="text-base font-medium text-white">
                  {color.name}
                </span>
              )}
              <span className="text-sm font-mono text-white flex items-center gap-1 tracking-tighter">
                {formattedColor}
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Click to copy</p>
            <div className="text-xs space-y-0.5">
              <p>HEX: {formatColor(color.hex, 'hex')}</p>
              <p>RGB: {formatColor(color.hex, 'rgb')}</p>
              <p>HSL: {formatColor(color.hex, 'hsl')}</p>
              <p>OKLCH: {formatColor(color.hex, 'oklch')}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
