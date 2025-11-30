import { useState, useEffect, useMemo } from 'react';
import { Brand } from '@/lib/types';

export type SortOption = 'name' | 'category' | 'colors';

interface UseBrandFiltersOptions {
  brands: Brand[];
  itemsPerPage?: number;
  searchQuery?: string;
  initialCategory?: string | null;
  initialSort?: SortOption;
  initialPage?: number;
}

interface UseBrandFiltersReturn {
  filteredBrands: Brand[];
  paginatedBrands: Brand[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  startIndex: number;
  endIndex: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  categories: string[];
}

/**
 * Custom hook to manage brand filtering, sorting, and pagination
 * @param options - Configuration options for the hook
 * @returns Filtered and paginated brands along with control functions
 */
export function useBrandFilters({
  brands,
  itemsPerPage = 24,
  searchQuery: externalSearchQuery,
  initialCategory,
  initialSort,
  initialPage,
}: UseBrandFiltersOptions): UseBrandFiltersReturn {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort ?? 'name');
  const [currentPage, setCurrentPage] = useState(initialPage ?? 1);

  // Extract unique categories
  const categories = useMemo<string[]>(() => {
    const set = new Set<string>();
    for (const b of brands) set.add(b.category);
    return Array.from(set).sort();
  }, [brands]);

  // Filter brands based on search query and category
  const filteredBrands = useMemo<Brand[]>(() => {
    let result: Brand[] = brands;
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(brand => brand.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(brand =>
        brand.name.toLowerCase().includes(lowerQuery) ||
        brand.category.toLowerCase().includes(lowerQuery) ||
        brand.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Sort brands
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
        case 'colors':
          return b.colors.length - a.colors.length || a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return result;
  }, [brands, searchQuery, selectedCategory, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBrands = filteredBrands.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleSetCurrentPage = (page: number | ((prev: number) => number)) => {
    if (typeof page === 'function') {
      setCurrentPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  return {
    filteredBrands,
    paginatedBrands,
    totalPages,
    currentPage,
    setCurrentPage: handleSetCurrentPage,
    startIndex,
    endIndex,
    searchQuery,
    setSearchQuery: setInternalSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories,
  };
}

