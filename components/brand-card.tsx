'use client';

import { Brand, ColorFormat, LayoutMode } from '@/lib/types';
import { ColorSwatch } from './color-swatch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from './brand-logo';
import { usePreferences } from '@/lib/store';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ANIMATION } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { exportAsJSON, exportAsCSS, exportAsTailwind, exportAsSVG, downloadFile } from '@/lib/utils';

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
      { 
        autoAlpha: 1, 
        y: 0, 
        duration: ANIMATION.CARD_APPEAR_DURATION, 
        ease: 'power2.out', 
        delay: appearIndex * ANIMATION.STAGGER_DELAY, 
        overwrite: 'auto' 
      }
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
            onClick={handleToggleFavorite}
            aria-label={favorite ? `Remove ${brand.name} from favorites` : `Add ${brand.name} to favorites`}
          >
            <Heart
              className={`h-6! w-6! transition-smooth ${
                favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'
              }`}
              aria-hidden="true"
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size={layout === 'compact' ? 'icon' : 'icon-lg'}
                aria-label={`Export ${brand.name} colors`}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  const content = exportAsJSON([brand]);
                  downloadFile(content, `${brand.id}.json`, 'application/json');
                }}
              >
                Download JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  const content = exportAsCSS([brand]);
                  downloadFile(content, `${brand.id}.css`, 'text/css');
                }}
              >
                Download CSS Variables
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  const content = exportAsTailwind([brand]);
                  downloadFile(content, `${brand.id}.tailwind.js`, 'application/javascript');
                }}
              >
                Download Tailwind Theme
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  const content = exportAsSVG([brand]);
                  downloadFile(content, `${brand.id}.svg`, 'image/svg+xml');
                }}
              >
                Download SVG Swatches
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
