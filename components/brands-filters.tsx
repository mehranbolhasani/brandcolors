'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, LayoutGrid, LayoutList, List, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import { LayoutMode, SortOption } from '@/lib/types';

interface BrandsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching: boolean;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  filteredCount: number;
  mounted: boolean;
}

export const BrandsFilters = forwardRef<HTMLInputElement, BrandsFiltersProps>(function BrandsFilters({
  searchQuery,
  onSearchChange,
  isSearching,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
  layout,
  onLayoutChange,
  filteredCount,
  mounted,
}, ref) {
  return (
    <>
      {/* Search */}
      <div className="sticky top-0 z-10 rounded-t-2xl overflow-hidden bg-card focus-within:bg-amber-50/50 border-b border-border mb-0">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        {isSearching && (
          <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
        )}
        <Input
          ref={ref}
          type="text"
          id="search-brands"
          name="search-brands"
          placeholder="Search brands... (Press / to focus)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-16 pr-12 h-20 border-none rounded-none text-lg! shadow-none placeholder:text-muted-foreground/50"
          aria-label="Search brands"
          aria-keyshortcuts="/"
        />
      </div>

      {/* Sort and Layout Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-0 border-b border-border">
        <div className="flex items-center">
          {mounted && (
            <Select 
              value={selectedCategory === null ? 'all' : selectedCategory}
              data-size="default"
              onValueChange={(v) => {
                if (v === 'all') {
                  onCategoryChange(null);
                } else {
                  onCategoryChange(v);
                }
              }}
            >
              <SelectTrigger className="w-[200px] border-r! border-solid! border-r-border">
                <Filter className="h-4! w-4! ml-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={sortBy} onValueChange={(v: SortOption) => onSortChange(v)}>
            <SelectTrigger className="w-[200px]">
              <ArrowUpDown className="h-4 w-4 ml-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
              <SelectItem value="colors">Sort by Colors</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 mr-6">
          <p className="text-md text-muted-foreground" aria-live="polite" suppressHydrationWarning>
            {mounted ? (
              <>Showing {filteredCount} {filteredCount === 1 ? 'brand' : 'brands'}</>
            ) : (
              <>Loading…</>
            )}
          </p>
          <div className="flex items-center gap-0 rounded-md border overflow-hidden">
            <Button
              variant={layout === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLayoutChange('grid')}
              className="rounded-none"
              aria-label="Grid layout"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLayoutChange('list')}
              className="rounded-none"
              aria-label="List layout"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'compact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLayoutChange('compact')}
              className="rounded-none"
              aria-label="Compact layout"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
});

