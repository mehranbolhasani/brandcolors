'use client';

import { Brand, ColorFormat } from '@/lib/types';
import { usePreferences } from '@/lib/store';
import { BrandLogo } from './brand-logo';
import { Button } from '@/components/ui/button';
import { Heart, Copy, Check } from 'lucide-react';
import { formatColor, copyToClipboard, getTextColorForBackground, isVeryBright } from '@/lib/utils';
import { useState, useLayoutEffect, useRef, memo } from 'react';
import { gsap } from 'gsap';
import { toast } from 'sonner';

interface BrandRowListProps {
  brand: Brand;
  colorFormat: ColorFormat;
  appearIndex?: number;
  skipAnimation?: boolean;
}

export const BrandRowList = memo(function BrandRowList({ brand, colorFormat, appearIndex = 0, skipAnimation = false }: BrandRowListProps) {
  const { favorites, toggleFavorite } = usePreferences();
  const favorite = favorites.includes(brand.id);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    
    // Skip animations on pagination for instant rendering
    if (skipAnimation) {
      gsap.set(rootRef.current, { autoAlpha: 1, y: 0 });
      return;
    }
    
    // Only animate on initial load
    gsap.fromTo(
      rootRef.current,
      { autoAlpha: 0, y: 4 },
      { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out', delay: Math.min(appearIndex * 0.04, 0.3), overwrite: 'auto' }
    );
  }, [appearIndex, skipAnimation]);

  return (
    <div ref={rootRef} className="flex flex-col items-start justify-between px-4 py-6 glass gap-6 border-t-0! border-l-0! border-r-0! border-b! border-slate-300!">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {brand.website && (
            <BrandLogo domain={brand.website} brandName={brand.name} size={32} className="rounded overflow-hidden" />
          )}
          <div className="flex flex-col">
            <span className="text-md font-medium">{brand.name}</span>
            <span className="text-xs text-muted-foreground">{brand.category}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(brand.id)}>
          <Heart className={favorite ? 'h-4 w-4 fill-red-500 text-red-500' : 'h-4 w-4 text-slate-400'} />
        </Button>
      </div>
      <div className="flex items-center gap-0 h-20 w-full">
        {brand.colors.map((c, i) => (
          <button
            key={i}
            onClick={async () => {
              const value = formatColor(c.hex, colorFormat);
              const ok = await copyToClipboard(value);
              if (ok) {
                setCopiedIndex(i);
                toast.success(`Copied ${value}`, { description: brand.name });
                setTimeout(() => setCopiedIndex(null), 1500);
              } else {
                toast.error('Failed to copy color');
              }
            }}
            className="flex flex-1 items-end gap-1 text-[11px] font-mono px-4 pb-4 h-full transition-smooth first:rounded-l-xl last:rounded-r-xl last:border-r-xl last:border-b-xl cursor-pointer"
            style={{ backgroundColor: c.hex, color: getTextColorForBackground(c.hex), border: isVeryBright(c.hex) ? '1px solid rgba(0,0,0,0.1)' : undefined }}
            title={formatColor(c.hex, colorFormat)}
          >
            {formatColor(c.hex, colorFormat)}
            {copiedIndex === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </button>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.brand.id === nextProps.brand.id &&
    prevProps.colorFormat === nextProps.colorFormat
  );
});

interface BrandRowCompactProps {
  brand: Brand;
  colorFormat: ColorFormat;
  appearIndex?: number;
  skipAnimation?: boolean;
}

export const BrandRowCompact = memo(function BrandRowCompact({ brand, colorFormat, appearIndex = 0, skipAnimation = false }: BrandRowCompactProps) {
  const { favorites, toggleFavorite } = usePreferences();
  const favorite = favorites.includes(brand.id);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    
    // Skip animations on pagination for instant rendering
    if (skipAnimation) {
      gsap.set(rootRef.current, { autoAlpha: 1, y: 0 });
      return;
    }
    
    // Only animate on initial load
    gsap.fromTo(
      rootRef.current,
      { autoAlpha: 0, y: 4 },
      { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out', delay: Math.min(appearIndex * 0.04, 0.3), overwrite: 'auto' }
    );
  }, [appearIndex, skipAnimation]);

  return (
    <div ref={rootRef} className="flex flex-col px-4 py-4 glass">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {brand.website && (
            <BrandLogo domain={brand.website} brandName={brand.name} size={32} className="rounded overflow-hidden" />
          )}
          <div className="flex flex-col">
            <span className="text-md font-medium">{brand.name}</span>
            <span className="text-xs text-muted-foreground">{brand.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0 w-40">
            {brand.colors.map((c, i) => (
              <button
                key={i}
                onClick={async () => {
                  const value = formatColor(c.hex, colorFormat);
                  const ok = await copyToClipboard(value);
                  if (ok) {
                    toast.success(`Copied ${value}`, { description: brand.name });
                  } else {
                    toast.error('Failed to copy color');
                  }
                }}
                className="h-4 w-full flex-1 rounded-0 first:rounded-l-sm last:rounded-r-sm focus:outline-hidden cursor-pointer hover:scale-y-150 transition-transform duration-200"
                style={{ backgroundColor: c.hex, border: isVeryBright(c.hex) ? '1px solid rgba(0,0,0,0.15)' : undefined }}
                aria-label={`Copy ${formatColor(c.hex, colorFormat)}`}
                title={formatColor(c.hex, colorFormat)}
              />
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={() => toggleFavorite(brand.id)}>
            <Heart className={favorite ? 'h-4 w-4 fill-red-500 text-red-500' : 'h-4 w-4 text-slate-400'} />
          </Button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.brand.id === nextProps.brand.id &&
    prevProps.colorFormat === nextProps.colorFormat
  );
});
