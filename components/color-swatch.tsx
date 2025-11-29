'use client';

import { BrandColor, ColorFormat } from '@/lib/types';
import { formatColor, copyToClipboard, getTextColorForBackground, isVeryBright } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColorSwatchProps {
  color: BrandColor;
  format: ColorFormat;
  brandName: string;
  variant?: 'default' | 'compact';
}

export function ColorSwatch({ color, format, brandName, variant = 'default' }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);
  const formattedColor = formatColor(color.hex, format);
  const textColor = getTextColorForBackground(color.hex);
  const veryBright = isVeryBright(color.hex);

  const handleCopy = async () => {
    const success = await copyToClipboard(formattedColor);
    if (success) {
      setCopied(true);
      toast.success(`Copied ${formattedColor}`, {
        description: brandName,
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
            className={variant === 'compact' ? 'group relative flex items-center justify-center h-12 w-20 rounded-md transition-smooth' : 'group relative flex flex-col items-center gap-2 px-4 hover:bg-muted/50 transition-smooth flex-1 justify-end'} 
            style={{ backgroundColor: color.hex, color: textColor, border: veryBright ? '1px solid rgba(0,0,0,0.1)' : undefined }}
            aria-label={`Copy ${formattedColor} from ${brandName}`}
          >
            {variant === 'compact' ? (
              <span className="text-[10px] font-mono text-white px-1 py-0.5 rounded bg-black/20">
                {formattedColor}
              </span>
            ) : (
              <div className="flex flex-col items-start justify-end w-full mb-4">
                {/* {color.name && (
                <span className="text-base font-medium">
                  {color.name}
                </span>
              )} */}
                <span className="text-sm font-mono flex items-center gap-1 tracking-tighter">
                  {formattedColor}
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </span>
              </div>
            )}
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
