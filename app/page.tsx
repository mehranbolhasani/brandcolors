
'use client';

import { brands as staticBrands } from '@/lib/brands-data';
import { Brand, ColorFormat } from '@/lib/types';
import { getRuntimeBrands, saveRuntimeBrands, fetchBrandsFromUrl } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { usePreferences } from '@/lib/store';
import dynamic from 'next/dynamic';
import { BrandRowList, BrandRowCompact } from '@/components/brand-row';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, LayoutGrid, LayoutList, List, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { HeroSection } from '@/components/hero-section';
import { useState, useEffect, useRef, useMemo, useDeferredValue, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import ColorBends from '@/components/ColorBends';
import { MetaLogoIcon, AmazonLogoIcon, GoogleLogoIcon, TiktokLogoIcon, SketchLogoIcon, InstagramLogoIcon, YoutubeLogoIcon, LinkedinLogoIcon, SlackLogoIcon, AppleLogoIcon, LinuxLogoIcon, LinktreeLogoIcon, MastodonLogoIcon, SpotifyLogoIcon, XLogoIcon, GoodreadsLogoIcon, NyTimesLogoIcon, DropboxLogoIcon, BehanceLogoIcon, AndroidLogoIcon, WindowsLogoIcon, PatreonLogoIcon} from "@phosphor-icons/react";
import LogoLoop from '@/components/LogoLoop';

const techLogos = [
  { node: <MetaLogoIcon />, title: "Meta", href: "https://meta.com" },
  { node: <AmazonLogoIcon />, title: "Amazon", href: "https://amazon.com" },
  { node: <GoogleLogoIcon />, title: "Google", href: "https://google.com" },
  { node: <TiktokLogoIcon />, title: "TikTok", href: "https://tiktok.com" },
  { node: <SketchLogoIcon />, title: "Sketch", href: "https://sketch.com" },
  { node: <InstagramLogoIcon />, title: "Instagram", href: "https://instagram.com" },
  { node: <YoutubeLogoIcon />, title: "YouTube", href: "https://youtube.com" },
  { node: <LinkedinLogoIcon />, title: "LinkedIn", href: "https://linkedin.com" },
  { node: <SlackLogoIcon />, title: "Slack", href: "https://slack.com" },
  { node: <AppleLogoIcon />, title: "Apple", href: "https://apple.com" },
  { node: <LinuxLogoIcon />, title: "Linux", href: "https://linux.org" },
  { node: <LinktreeLogoIcon />, title: "Linktree", href: "https://linktree.com" },
  { node: <MastodonLogoIcon />, title: "Mastodon", href: "https://mastodon.com" },
  { node: <SpotifyLogoIcon />, title: "Spotify", href: "https://spotify.com" },
  { node: <XLogoIcon />, title: "X", href: "https://x.com" },
  { node: <GoodreadsLogoIcon />, title: "Goodreads", href: "https://goodreads.com" },
  { node: <NyTimesLogoIcon />, title: "New York Times", href: "https://nytimes.com" },
  { node: <DropboxLogoIcon />, title: "Dropbox", href: "https://dropbox.com" },
  { node: <BehanceLogoIcon />, title: "Behance", href: "https://behance.net" },
  { node: <AndroidLogoIcon />, title: "Android", href: "https://android.com" },
  { node: <WindowsLogoIcon />, title: "Windows", href: "https://windows.com" },
  { node: <PatreonLogoIcon />, title: "Patreon", href: "https://patreon.com" },
];


const LazyBrandCard = dynamic(() => import('@/components/brand-card').then(m => m.BrandCard), {
  loading: () => <div className="glass rounded-3xl h-80" />,
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { colorFormat, favorites, layout, setColorFormat: setColorFormatPref, setLayout } = usePreferences();
  const deferredQuery = useDeferredValue(searchQuery);
  const gridRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fetchedOnceRef = useRef(false);

  const [dataBrands, setDataBrands] = useState<Brand[]>(staticBrands);
  const supabase = getSupabase();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'colors'>('name');
  const itemsPerPage = 24;

  const categories = useMemo<string[]>(() => {
    const set = new Set<string>();
    for (const b of dataBrands) set.add(b.category);
    return Array.from(set);
  }, [dataBrands]);

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

  const filteredBrands = useMemo<Brand[]>(() => {
    let result: Brand[] = dataBrands;
    if (selectedCategory === 'Favorites') {
      result = result.filter(brand => favorites.includes(brand.id));
    } else if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(brand => brand.category === selectedCategory);
    }
    if (deferredQuery.trim()) {
      const lowerQuery = deferredQuery.toLowerCase();
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
  }, [deferredQuery, selectedCategory, favorites, dataBrands, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBrands = filteredBrands.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery, selectedCategory, sortBy]);

  // Type guard for Supabase brand row
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

  const loadFromSupabase = useCallback(async () => {
    if (!supabase) {
      toast.error('Supabase not configured');
      return;
    }
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


  const handleFormatChange = (format: ColorFormat) => {
    setColorFormatPref(format);
  };

  return (
    <div className="min-h-screen flex flex-col w-screen mx-auto">
      
      <div className="relative h-[70vh] w-[calc(100%-4rem)] mx-auto mt-8 glass rounded-3xl overflow-hidden">
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
        />
  
        {/* Hero Section */}
        <HeroSection />

        <div className="absolute bottom-0 left-0 w-full h-[80px] text-foreground/70 flex items-center justify-center bg-white">
          {/* Basic horizontal loop */}
          <LogoLoop
            logos={techLogos}
            speed={10}
            direction="left"
            logoHeight={24}
            gap={50}
            ariaLabel="Technology partners"
          />
        </div>
      </div>

      {/* Main Content - Brands Section */}
      <main className="flex-1 mx-auto space-y-6 glass rounded-2xl p-4 w-full mt-4">
        {/* Filters, Search, Sort, Layout Controls */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
              aria-label="Search brands"
            />
          </div>

          {/* Category Filters */}
          {mounted && (
            <div className="flex flex-wrap gap-2">
              <Badge
                asChild
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="transition-smooth cursor-pointer"
              >
                <button type="button" onClick={() => setSelectedCategory(null)}>All</button>
              </Badge>
              {categories.map((category) => (
                <Badge
                  asChild
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="transition-smooth cursor-pointer"
                >
                  <button type="button" onClick={() => setSelectedCategory(category)}>{category}</button>
                </Badge>
              ))}
              <Badge
                asChild
                variant={selectedCategory === 'Favorites' ? 'default' : 'outline'}
                className="transition-smooth cursor-pointer"
              >
                <button type="button" onClick={() => setSelectedCategory('Favorites')}>❤️ Favorites</button>
              </Badge>
            </div>
          )}

          {/* Sort and Layout Controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v: 'name' | 'category' | 'colors') => setSortBy(v)}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="category">Sort by Category</SelectItem>
                  <SelectItem value="colors">Sort by Colors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground" aria-live="polite" suppressHydrationWarning>
                {mounted ? (
                  <>Showing {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}</>
                ) : (
                  <>Loading…</>
                )}
              </p>
              <div className="flex items-center gap-0 rounded-md border overflow-hidden">
                <Button
                  variant={layout === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLayout('grid')}
                  className="rounded-none"
                  aria-label="Grid layout"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={layout === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLayout('list')}
                  className="rounded-none"
                  aria-label="List layout"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button
                  variant={layout === 'compact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLayout('compact')}
                  className="rounded-none"
                  aria-label="Compact layout"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Brands List */}
        {filteredBrands.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No brands found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            {layout === 'grid' ? (
              <div key={layout} ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {paginatedBrands.map((brand, idx) => (
                  <LazyBrandCard key={brand.id} brand={brand} colorFormat={colorFormat} layout={layout} appearIndex={startIndex + idx} />
                ))}
              </div>
            ) : (
              <div key={layout} ref={listRef} className="grid grid-cols-1 gap-0">
                {layout === 'list'
                  ? paginatedBrands.map((brand, idx) => (
                      <BrandRowList key={brand.id} brand={brand} colorFormat={colorFormat} appearIndex={startIndex + idx} />
                    ))
                  : paginatedBrands.map((brand, idx) => (
                      <BrandRowCompact key={brand.id} brand={brand} colorFormat={colorFormat} appearIndex={startIndex + idx} />
                    ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="min-w-10"
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {totalPages > 1 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredBrands.length)} of {filteredBrands.length} brands
              </p>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t glass mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>A curated library of official brand colors</p>
          <p className="mt-1">{dataBrands.length} brands • Multiple color formats • Open source</p>
        </div>
      </footer>
    </div>
  );
}
