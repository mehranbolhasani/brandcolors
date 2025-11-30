
'use client';

import { brands as staticBrands } from '@/lib/brands-data';
import { Brand, ColorFormat } from '@/lib/types';
import { getRuntimeBrands, saveRuntimeBrands, fetchBrandsFromUrl } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { usePreferences } from '@/lib/store';
import dynamic from 'next/dynamic';
import { BrandsFilters } from '@/components/brands-filters';
import { BrandsSection } from '@/components/brands-section';
import { BrandsPagination } from '@/components/brands-pagination';
import { SiteHeader } from '@/components/site-header';
import { HeroSection } from '@/components/hero-section';
import { useState, useEffect, useRef, useMemo, useDeferredValue, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useBrandFilters, SortOption } from '@/hooks/useBrandFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import ColorBends from '@/components/ColorBends';
import { MetaLogoIcon, AmazonLogoIcon, GoogleLogoIcon, TiktokLogoIcon, SketchLogoIcon, InstagramLogoIcon, YoutubeLogoIcon, LinkedinLogoIcon, SlackLogoIcon, AppleLogoIcon, LinuxLogoIcon, LinktreeLogoIcon, MastodonLogoIcon, SpotifyLogoIcon, XLogoIcon, GoodreadsLogoIcon, NyTimesLogoIcon, DropboxLogoIcon, BehanceLogoIcon, AndroidLogoIcon, WindowsLogoIcon, PatreonLogoIcon} from "@phosphor-icons/react";
import LogoLoop from '@/components/LogoLoop';

const techLogos = [
  { node: <MetaLogoIcon />, title: "Meta" },
  { node: <AmazonLogoIcon />, title: "Amazon" },
  { node: <GoogleLogoIcon />, title: "Google" },
  { node: <TiktokLogoIcon />, title: "TikTok" },
  { node: <SketchLogoIcon />, title: "Sketch" },
  { node: <InstagramLogoIcon />, title: "Instagram" },
  { node: <YoutubeLogoIcon />, title: "YouTube" },
  { node: <LinkedinLogoIcon />, title: "LinkedIn" },
  { node: <SlackLogoIcon />, title: "Slack" },
  { node: <AppleLogoIcon />, title: "Apple" },
  { node: <LinuxLogoIcon />, title: "Linux" },
  { node: <LinktreeLogoIcon />, title: "Linktree" },
  { node: <MastodonLogoIcon />, title: "Mastodon" },
  { node: <SpotifyLogoIcon />, title: "Spotify" },
  { node: <XLogoIcon />, title: "X" },
  { node: <GoodreadsLogoIcon />, title: "Goodreads" },
  { node: <NyTimesLogoIcon />, title: "New York Times" },
  { node: <DropboxLogoIcon />, title: "Dropbox" },
  { node: <BehanceLogoIcon />, title: "Behance" },
  { node: <AndroidLogoIcon />, title: "Android" },
  { node: <WindowsLogoIcon />, title: "Windows" },
  { node: <PatreonLogoIcon />, title: "Patreon" },
];


const LazyBrandCard = dynamic(() => import('@/components/brand-card').then(m => m.BrandCard), {
  loading: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { BrandCardSkeleton } = require('@/components/brand-card-skeleton');
    return <BrandCardSkeleton layout="grid" />;
  },
});

export default function Home() {
  const { colorFormat, favorites, layout, setColorFormat: setColorFormatPref, setLayout } = usePreferences();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fetchedOnceRef = useRef(false);
  const urlParamsInitialized = useRef(false);
  const isInitialLoadRef = useRef(true);

  const [dataBrands, setDataBrands] = useState<Brand[]>(staticBrands);
  const supabase = getSupabase();
  const [mounted, setMounted] = useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 24;

  // Initialize from URL params
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || null;
  const initialSort = (searchParams.get('sort') as 'name' | 'category' | 'colors') || 'name';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  // Local search query state for input
  const [searchQueryInput, setSearchQueryInput] = useState(initialSearch);
  const debouncedSearchQuery = useDebounce(searchQueryInput, 300);
  const deferredQuery = useDeferredValue(debouncedSearchQuery);

  // Use the brand filters hook
  const {
    filteredBrands,
    paginatedBrands,
    totalPages,
    currentPage,
    setCurrentPage,
    startIndex,
    endIndex,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories,
  } = useBrandFilters({
    brands: dataBrands,
    itemsPerPage,
    searchQuery: deferredQuery,
    initialCategory,
    initialSort,
    initialPage,
  });

  // Initialize from URL params on mount
  useEffect(() => {
    if (!urlParamsInitialized.current && mounted) {
      urlParamsInitialized.current = true;
      if (initialSearch) {
        setSearchQueryInput(initialSearch);
      }
      if (initialCategory) {
        setSelectedCategory(initialCategory);
      }
      if (initialSort) {
        setSortBy(initialSort);
      }
      if (initialPage > 1) {
        setCurrentPage(initialPage);
      }
    }
  }, [mounted, initialSearch, initialCategory, initialSort, initialPage, setSelectedCategory, setSortBy, setCurrentPage]);

  // Update URL params when filters change
  useEffect(() => {
    if (!mounted || !urlParamsInitialized.current) return;

    const params = new URLSearchParams();
    if (deferredQuery) {
      params.set('search', deferredQuery);
    }
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    if (sortBy !== 'name') {
      params.set('sort', sortBy);
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '/';
    const currentUrl = searchParams.toString() ? `?${searchParams.toString()}` : '/';
    
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [deferredQuery, selectedCategory, sortBy, currentPage, mounted, router, searchParams]);

  /**
   * Fetches brands from a remote URL and updates the local state
   * @throws Will display an error toast if the URL is not configured or fetch fails
   */
  const refreshFromRemote = async () => {
    const url = process.env.NEXT_PUBLIC_BRANDS_URL;
    if (!url) {
      toast.error('Remote URL not configured');
      return;
    }
    try {
      const remote = await fetchBrandsFromUrl(url);
      saveRuntimeBrands(remote);
      setDataBrands(remote);
      setSelectedCategory(null);
      toast.success('Fetched remote brands', { description: `${remote.length} brands` });
    } catch (error) {
      console.error('Failed to fetch remote brands:', error);
      toast.error('Failed to fetch remote brands');
    }
  };


  /**
   * Type guard to validate if an unknown value is a valid Supabase brand row
   * @param row - Unknown value to validate
   * @returns True if the value matches the expected Supabase brand row structure
   */
  function isValidBrandRow(row: unknown): row is { id: string; name: string; category: string; website?: string; colors?: { name: string; hex: string }[] } {
    if (!row || typeof row !== 'object') return false;
    const r = row as Record<string, unknown>;
    return (
      typeof r.id === 'string' &&
      typeof r.name === 'string' &&
      typeof r.category === 'string' &&
      (r.website === undefined || typeof r.website === 'string') &&
      (r.colors === undefined || Array.isArray(r.colors))
    );
  }

  /**
   * Loads brands and colors from Supabase database
   * Fetches brands and colors separately to avoid join issues, then combines them
   * @throws Will display error toasts if Supabase is not configured or fetch fails
   */
  const loadFromSupabase = useCallback(async () => {
    if (!supabase) {
      toast.error('Supabase not configured');
      return;
    }
    setIsLoadingBrands(true);
    try {
      // Load brands and colors separately to avoid join issues
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('id,name,category,website')
        .order('name');
      
      if (brandsError) throw brandsError;
      
      const { data: colorsData, error: colorsError } = await supabase
        .from('colors')
        .select('brand_id,hex,rgb,hsl,oklch')
        .order('brand_id');
      
      if (colorsError) throw colorsError;
      
      if (!brandsData || brandsData.length === 0) {
        toast.info('No brands in Supabase; showing local dataset');
        return;
      }
      
      // Group colors by brand_id
      const colorsByBrand = new Map<string, Array<{ hex: string; rgb?: string; hsl?: string; oklch?: string }>>();
      for (const color of colorsData || []) {
        const arr = colorsByBrand.get(color.brand_id) ?? [];
        arr.push({
          hex: color.hex,
          rgb: color.rgb || undefined,
          hsl: color.hsl || undefined,
          oklch: color.oklch || undefined,
        });
        colorsByBrand.set(color.brand_id, arr);
      }
      
      // Build brand list with colors
      const list: Brand[] = brandsData.map(brand => ({
        id: brand.id,
        name: brand.name,
        category: brand.category,
        website: brand.website || undefined,
        colors: colorsByBrand.get(brand.id) ?? [],
      }));
      
      if (list.length > 0) {
        saveRuntimeBrands(list);
        setDataBrands(list);
        setSelectedCategory(null);
        toast.success('Loaded brands from Supabase', { description: `${list.length} brands` });
      } else {
        toast.info('No brands in Supabase; showing local dataset');
      }
    } catch (error) {
      console.error('Failed to load from Supabase:', error);
      toast.error('Failed to load from Supabase');
    } finally {
      setIsLoadingBrands(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (supabase && !fetchedOnceRef.current) {
      fetchedOnceRef.current = true;
      void loadFromSupabase();
    }
  }, [supabase, loadFromSupabase]);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage after mount to avoid hydration mismatch
    const rb = getRuntimeBrands();
    if (rb.length > 0) {
      setDataBrands(rb);
    }
  }, []);

  // Track when page changes (after initial load) to skip animations
  useEffect(() => {
    if (mounted && currentPage > 1) {
      // If we're changing pages (not on page 1), skip animations
      isInitialLoadRef.current = false;
    }
  }, [currentPage, mounted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on "/" key (when not typing in an input)
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Clear search on Escape
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQueryInput('');
        searchInputRef.current?.blur();
      }
      // Show keyboard help on "?"
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const handleFormatChange = (format: ColorFormat) => {
    setColorFormatPref(format);
  };

  return (
    <div className="min-h-screen flex flex-col w-screen mx-auto">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      
      <div className="relative h-[70vh] w-[1200px] mx-auto mt-8 glass rounded-3xl overflow-hidden">
        <div className="absolute inset-0 -top-1 h-[calc(100%-80px)] -z-1 rounded-3xl overflow-hidden">
          <ColorBends
            colors={["#FF3737", "#FCAF45"]}
            rotation={0}
            speed={0.2}
            scale={1.2}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={0.2}
            noise={0.1}
            transparent={true}
          />
        </div>

        {/* Header */}
        <SiteHeader
          colorFormat={colorFormat}
          onColorFormatChange={handleFormatChange}
          favorites={favorites}
          brands={dataBrands}
          filteredBrands={filteredBrands}
        />
  
        {/* Hero Section */}
        <HeroSection />

        <div className="absolute bottom-0 left-0 w-full h-[80px] text-foreground/70 flex items-center justify-center bg-white dark:bg-background">
          {/* Basic horizontal loop */}
          <LogoLoop
            logos={techLogos}
            speed={10}
            direction="left"
            logoHeight={24}
            gap={50}
            pauseOnHover={false}
            ariaLabel="Technology partners"
            className="[&_li]:even:opacity-80"
          />
        </div>
      </div>

      {/* Main Content - Brands Section */}
      <main id="main-content" className="flex-1 mx-auto space-y-6 bg-card rounded-2xl w-[1200px] mt-4" tabIndex={-1}>
        <BrandsFilters
          ref={searchInputRef}
          searchQuery={searchQueryInput}
          onSearchChange={setSearchQueryInput}
          isSearching={searchQueryInput !== debouncedSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          sortBy={sortBy}
          onSortChange={setSortBy}
          layout={layout}
          onLayoutChange={setLayout}
          filteredCount={filteredBrands.length}
          mounted={mounted}
        />

        <BrandsSection
          brands={paginatedBrands}
          layout={layout}
          colorFormat={colorFormat}
          isLoading={isLoadingBrands}
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          skipAnimation={!isInitialLoadRef.current}
        />

        <BrandsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredBrands.length}
        />
      </main>

      {/* Keyboard Shortcuts Help Dialog */}
      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Focus search</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">/</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Clear search</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">Esc</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Show this help</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">?</kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="min-h-80 flex items-center justify-center">
        <div className="text-center text-base text-muted-foreground">
          <p>A curated library of official brand colors</p>
          <p className="mt-1">{dataBrands.length} brands • Multiple color formats • Open source</p>
          <Separator orientation="vertical" className="my-8 bg-foreground/20 h-12 w-px mx-auto" />
          <p>by <a href="https://bolhasani.com" className="text-primary">Mehran Bolhasani</a></p>
          <p className="text-sm text-muted-foreground mt-0">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
