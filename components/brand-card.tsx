'use client';

import { Brand, ColorFormat, LayoutMode } from '@/lib/types';
import { ColorSwatch } from './color-swatch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from './brand-logo';
import { usePreferences } from '@/lib/store';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface BrandCardProps {
  brand: Brand;
  colorFormat: ColorFormat;
  layout?: LayoutMode;
  appearIndex?: number;
}

export function BrandCard({ brand, colorFormat, layout = 'grid', appearIndex = 0 }: BrandCardProps) {
  const { favorites, toggleFavorite } = usePreferences();
  const favorite = favorites.includes(brand.id);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    gsap.fromTo(
      rootRef.current,
      { autoAlpha: 0, y: 4 },
      { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out', delay: appearIndex * 0.04, overwrite: 'auto' }
    );
  }, [appearIndex, layout]);

  const handleToggleFavorite = () => {
    toggleFavorite(brand.id);
  };

  return (
    <div ref={rootRef}>
    <Card className="glass group transition-smooth rounded-3xl!">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3 flex-1">
          {brand.website && (
            <BrandLogo 
              domain={brand.website} 
              brandName={brand.name}
              size={layout === 'compact' ? 28 : 40}
              className="flex-shrink-0 rounded-md overflow-hidden"
            />
          )}
          <div className="flex-1">
            <CardTitle className={layout === 'compact' ? 'text-base font-semibold' : 'text-lg font-semibold'}>{brand.name}</CardTitle>
            <p className={layout === 'compact' ? 'text-xs text-muted-foreground' : 'text-sm text-muted-foreground'}>{brand.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size={layout === 'compact' ? 'icon' : 'icon-lg'}
            // className="h-8 w-8"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={`h-6! w-6! transition-smooth ${
                favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'
              }`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {layout === 'compact' ? (
          <div className="flex flex-row gap-2 rounded-2xl overflow-hidden">
            {brand.colors.map((color, index) => (
              <ColorSwatch
                key={index}
                color={color}
                format={colorFormat}
                brandName={brand.name}
                variant="compact"
              />
            ))}
          </div>
        ) : (
          <div className={layout === 'list' ? 'flex flex-col gap-0 justify-center rounded-2xl overflow-hidden h-56' : 'flex flex-col gap-0 justify-center rounded-2xl overflow-hidden h-80'}>
            {brand.colors.map((color, index) => (
              <ColorSwatch
                key={index}
                color={color}
                format={colorFormat}
                brandName={brand.name}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
