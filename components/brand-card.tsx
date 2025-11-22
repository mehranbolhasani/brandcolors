'use client';

import { Brand, ColorFormat } from '@/lib/types';
import { ColorSwatch } from './color-swatch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from './brand-logo';
import { toggleFavorite, isFavorite } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface BrandCardProps {
  brand: Brand;
  colorFormat: ColorFormat;
}

export function BrandCard({ brand, colorFormat }: BrandCardProps) {
  const [favorite, setFavorite] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavorite(isFavorite(brand.id));
  }, [brand.id]);

  const handleToggleFavorite = () => {
    toggleFavorite(brand.id);
    setFavorite(!favorite);
  };

  if (!mounted) {
    return (
      <Card className="glass animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass group transition-smooth animate-fade-in rounded-3xl!">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3 flex-1">
          {brand.website && (
            <BrandLogo 
              domain={brand.website} 
              brandName={brand.name}
              size={40}
              className="flex-shrink-0 rounded-md overflow-hidden"
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{brand.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{brand.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-lg"
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
        <div className="flex flex-col gap-0 justify-center rounded-2xl overflow-hidden h-80">
          {brand.colors.map((color, index) => (
            <ColorSwatch
              key={index}
              color={color}
              format={colorFormat}
              brandName={brand.name}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
