
'use client';

import { brands as staticBrands } from '@/lib/brands-data';
import { Brand, ColorFormat } from '@/lib/types';
import { setColorFormat, getRuntimeBrands, validateBrands, normalizeBrand, saveRuntimeBrands, clearRuntimeBrands, fetchBrandsFromUrl } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { usePreferences } from '@/lib/store';
import dynamic from 'next/dynamic';
import { BrandRowList, BrandRowCompact } from '@/components/brand-row';
import { ColorFormatSelector } from '@/components/color-format-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FolderOpen, LayoutGrid, LayoutList, List } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useDeferredValue, useLayoutEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportAsJSON, exportAsCSS, exportAsTailwind, exportAsSVG, downloadFile } from '@/lib/utils';
import { toast } from 'sonner';

const LazyBrandCard = dynamic(() => import('@/components/brand-card').then(m => m.BrandCard), {
  loading: () => <div className="glass rounded-3xl h-80" />,
});

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { colorFormat, favorites, layout, setColorFormat: setColorFormatPref, setLayout } = usePreferences();
  const deferredQuery = useDeferredValue(searchQuery);
  const headerRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fetchedOnceRef = useRef(false);

  const [dataBrands, setDataBrands] = useState<Brand[]>(() => {
    const rb = getRuntimeBrands();
    return rb.length ? rb : staticBrands;
  });
  const supabase = getSupabase();
  const [mounted, setMounted] = useState(false);

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
    } catch {
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
    return result;
  }, [deferredQuery, selectedCategory, favorites, dataBrands]);

  const loadFromSupabase = useCallback(async () => {
    if (!supabase) {
      toast.error('Supabase not configured');
      return;
    }
    try {
      const { data, error } = await supabase.from('brands').select('id,name,category,website,colors(name,hex)').order('name');
      if (error) throw error;
      const list = (data ?? []).map((d: unknown) => {
        const row = d as { id: string; name: string; category: string; website?: string; colors?: { name: string; hex: string }[] };
        return { id: row.id, name: row.name, category: row.category, website: row.website, colors: row.colors ?? [] };
      }) as Brand[];
      if (list.length > 0) {
        saveRuntimeBrands(list);
        setDataBrands(list);
        setSelectedCategory(null);
        toast.success('Loaded brands from Supabase', { description: `${list.length} brands` });
      } else {
        toast.info('No brands in Supabase; showing local dataset');
      }
    } catch {
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
  }, []);

  useLayoutEffect(() => {
    // Container-level animation no longer needed; handled per-item for reliable stagger
  }, [filteredBrands, layout]);

  // GSAP ScrollTrigger for smooth sticky header animations
  useEffect(() => {
    if (!headerRef.current || !searchRef.current || !categoriesRef.current || !sentinelRef.current) return;

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;
      // Use sentinel element to avoid trigger position changes during animation
      ScrollTrigger.create({
        trigger: sentinelRef.current,
        start: 'bottom 8px', // When sentinel bottom reaches the sticky position
        end: 'bottom 8px',
        toggleActions: 'play none none reverse', // Only play on enter, reverse on leave back
        invalidateOnRefresh: true,
        onEnter: () => {
          // Kill any existing animations to prevent conflicts
          gsap.killTweensOf([headerRef.current, searchRef.current, categoriesRef.current]);

          // Animate to stuck state
          gsap.to(headerRef.current, {
            height: '4rem',
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          if (headerRef.current) headerRef.current.classList.add('is-stuck');

          // Fade out search and categories
          gsap.to([searchRef.current, categoriesRef.current], {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        },
        onLeaveBack: () => {
          // Kill any existing animations to prevent conflicts
          gsap.killTweensOf([headerRef.current, searchRef.current, categoriesRef.current]);

          // Animate back to normal state - clear inline styles to let CSS take over
          gsap.to(headerRef.current, {
            height: 'auto',
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          if (headerRef.current) headerRef.current.classList.remove('is-stuck');

          // Fade in search and categories
          gsap.to([searchRef.current, categoriesRef.current], {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  const handleFormatChange = (format: ColorFormat) => {
    setColorFormatPref(format);
    setColorFormat(format);
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl w-full mx-auto relative selection:bg-primary selection:text-primary-foreground">
      {/* Sentinel element for ScrollTrigger - positioned where header starts */}
      <div ref={sentinelRef} className="absolute top-12 left-0 w-full h-px pointer-events-none" aria-hidden="true" />
      
      {/* Header */}
        <header
          ref={headerRef}
          className="sticky top-2 mt-4 z-50 w-full rounded-xl glass shadow-sm shadow-neutral-900/5 overflow-hidden transition-shadow duration-300"
          suppressHydrationWarning
        >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6 transition-smooth" />
              <h1 className="text-lg font-medium tracking-tight transition-smooth">Brand×Colors · Directory</h1>
            </div>
            
          <div className="flex items-center gap-3">
            <ColorFormatSelector value={colorFormat} onChange={handleFormatChange} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-3 gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    const content = exportAsJSON(filteredBrands);
                    downloadFile(content, 'brandcolors.json', 'application/json');
                  }}
                >
                  Download JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    const content = exportAsCSS(filteredBrands);
                    downloadFile(content, 'brandcolors.css', 'text/css');
                  }}
                >
                  Download CSS Variables
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    const content = exportAsTailwind(filteredBrands);
                    downloadFile(content, 'brandcolors.tailwind.js', 'application/javascript');
                  }}
                >
                  Download Tailwind Theme
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    const content = exportAsSVG(filteredBrands);
                    downloadFile(content, 'brandcolors.svg', 'image/svg+xml');
                  }}
                >
                  Download SVG Swatches
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => fileRef.current?.click()}
                >
                  Import JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={loadFromSupabase}
                >
                  Refresh from Supabase
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={refreshFromRemote}
                >
                  Refresh from Remote
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    clearRuntimeBrands();
                    setDataBrands(staticBrands);
                    setSelectedCategory(null);
                    toast.success('Reset to default brands');
                  }}
                >
                  Reset to Defaults
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                if (!validateBrands(parsed)) throw new Error('Invalid format');
                const normalized = parsed.map((b: Brand) => normalizeBrand(b));
                saveRuntimeBrands(normalized);
                setDataBrands(normalized);
                setSelectedCategory(null);
                toast.success('Imported brands', { description: `${normalized.length} brands` });
              } catch {
                toast.error('Failed to import brands');
              } finally {
                e.target.value = '';
              }
            }}
          />
          {/* Search */}
          <div ref={searchRef} className="mt-4 relative">
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
            <div ref={categoriesRef} className="mt-4 flex flex-wrap gap-2">
              <Badge
                asChild
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="transition-smooth"
              >
                <button type="button" onClick={() => setSelectedCategory(null)}>All</button>
              </Badge>
              {categories.map((category) => (
                <Badge
                  asChild
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="transition-smooth"
                >
                  <button type="button" onClick={() => setSelectedCategory(category)}>{category}</button>
                </Badge>
              ))}
              <Badge
                asChild
                variant={selectedCategory === 'Favorites' ? 'default' : 'outline'}
                className="transition-smooth"
              >
                <button type="button" onClick={() => setSelectedCategory('Favorites')}>❤️ Favorites</button>
              </Badge>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite" suppressHydrationWarning>
            {mounted ? (
              <>Showing {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}</>
            ) : (
              <>Loading…</>
            )}
          </p>
          <div className="flex items-center gap-0 rounded-md border border-slate-300 overflow-hidden">
            <Button variant={layout === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setLayout('grid')} className="rounded-none">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={layout === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setLayout('list')} className="rounded-none">
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button variant={layout === 'compact' ? 'default' : 'outline'} size="sm" onClick={() => setLayout('compact')} className="rounded-none">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
                {filteredBrands.map((brand, idx) => (
                  <LazyBrandCard key={brand.id} brand={brand} colorFormat={colorFormat} layout={layout} appearIndex={idx} />
                ))}
              </div>
            ) : (
              <div key={layout} ref={listRef} className="grid grid-cols-1 gap-0">
                {layout === 'list'
                  ? filteredBrands.map((brand, idx) => (
                      <BrandRowList key={brand.id} brand={brand} colorFormat={colorFormat} appearIndex={idx} />
                    ))
                  : filteredBrands.map((brand, idx) => (
                      <BrandRowCompact key={brand.id} brand={brand} colorFormat={colorFormat} appearIndex={idx} />
                    ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t glass mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>A curated library of official brand colors</p>
          <p className="mt-1">{dataBrands.length} brands • Multiple color formats • Open source</p>
        </div>
      </footer>
    </div>
  );
}
