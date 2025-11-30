'use client';

import { memo } from 'react';
import { Brand, ColorFormat, LayoutMode } from '@/lib/types';
import { BrandRowList, BrandRowCompact } from '@/components/brand-row';
import { BrandCardSkeleton } from '@/components/brand-card-skeleton';
import dynamic from 'next/dynamic';

const LazyBrandCard = dynamic(() => import('@/components/brand-card').then(m => m.BrandCard), {
  loading: () => <BrandCardSkeleton layout="grid" />,
  ssr: false,
});

interface BrandsSectionProps {
  brands: Brand[];
  layout: LayoutMode;
  colorFormat: ColorFormat;
  isLoading: boolean;
  itemsPerPage: number;
  startIndex: number;
  skipAnimation?: boolean;
}

export const BrandsSection = memo(function BrandsSection({
  brands,
  layout,
  colorFormat,
  isLoading,
  itemsPerPage,
  startIndex,
  skipAnimation = false,
}: BrandsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <BrandCardSkeleton key={i} layout={layout} />
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">No brands found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <>
      {layout === 'grid' ? (
        <div key={layout} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
          {brands.map((brand, idx) => (
            <LazyBrandCard 
              key={brand.id} 
              brand={brand} 
              colorFormat={colorFormat} 
              layout={layout} 
              appearIndex={startIndex + idx}
              skipAnimation={skipAnimation}
            />
          ))}
        </div>
      ) : (
        <div key={layout} className="grid grid-cols-1 gap-0">
          {layout === 'list'
            ? brands.map((brand, idx) => (
                <BrandRowList 
                  key={brand.id} 
                  brand={brand} 
                  colorFormat={colorFormat} 
                  appearIndex={startIndex + idx}
                  skipAnimation={skipAnimation}
                />
              ))
            : brands.map((brand, idx) => (
                <BrandRowCompact 
                  key={brand.id} 
                  brand={brand} 
                  colorFormat={colorFormat} 
                  appearIndex={startIndex + idx}
                  skipAnimation={skipAnimation}
                />
              ))}
        </div>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render if brands array reference changes or key props change
  return (
    prevProps.brands === nextProps.brands &&
    prevProps.layout === nextProps.layout &&
    prevProps.colorFormat === nextProps.colorFormat &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.startIndex === nextProps.startIndex
  );
});

