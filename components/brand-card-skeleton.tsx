'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface BrandCardSkeletonProps {
  layout?: 'grid' | 'list' | 'compact';
}

export function BrandCardSkeleton({ layout = 'grid' }: BrandCardSkeletonProps) {
  return (
    <Card className="bg-white rounded-3xl p-0 gap-0 overflow-hidden border-foreground/15 animate-shimmer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-6">
        <div className="flex items-center gap-3 flex-1">
          <div className={`shrink-0 rounded-md bg-muted ${layout === 'compact' ? 'w-7 h-7' : 'w-10 h-10'}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-4 bg-muted rounded ${layout === 'compact' ? 'w-24' : 'w-32'}`} />
            <div className={`h-3 bg-muted/60 rounded ${layout === 'compact' ? 'w-16' : 'w-20'}`} />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className={`bg-muted rounded ${layout === 'compact' ? 'w-9 h-9' : 'w-8 h-8'}`} />
          <div className={`bg-muted rounded ${layout === 'compact' ? 'w-9 h-9' : 'w-10 h-10'}`} />
        </div>
      </CardHeader>
      <CardContent>
        {layout === 'compact' ? (
          <div className="flex flex-row gap-2 rounded-2xl overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 flex-1 bg-muted rounded" />
            ))}
          </div>
        ) : (
          <div className={`flex flex-col gap-0 justify-center rounded-2xl overflow-hidden ${layout === 'list' ? 'h-56' : 'h-80'}`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 bg-muted" style={{ opacity: 1 - (i - 1) * 0.1 }} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

