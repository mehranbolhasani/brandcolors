'use client';

import { brands, categories } from '@/lib/brands-data';
import { Brand, ColorFormat } from '@/lib/types';
import { searchBrands, filterByCategory, getColorFormat, setColorFormat, getFavorites } from '@/lib/utils';
import { BrandCard } from '@/components/brand-card';
import { ColorFormatSelector } from '@/components/color-format-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FolderOpen } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [colorFormat, setColorFormatState] = useState<ColorFormat>('hex');
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(brands);
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedFormat = getColorFormat();
    setColorFormatState(savedFormat);
  }, []);

  // GSAP ScrollTrigger for smooth sticky header animations
  useEffect(() => {
    if (!mounted || !headerRef.current || !searchRef.current || !categoriesRef.current || !sentinelRef.current) return;

    const ctx = gsap.context(() => {
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
            height: '4rem', // h-16
            boxShadow: '0 15px 25px -12px rgb(0 0 0 / 0.05)',
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          
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
            clearProps: 'boxShadow', // Remove inline boxShadow to use CSS class
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          
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
      ctx.revert(); // Clean up GSAP animations
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    let result = [...brands]; // Create a new array to avoid mutation
    
    // Apply category filter first
    if (selectedCategory === 'Favorites') {
      const favorites = getFavorites();
      result = result.filter(brand => favorites.includes(brand.id));
    } else if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(brand => brand.category === selectedCategory);
    }
    
    // Then apply search
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(brand =>
        brand.name.toLowerCase().includes(lowerQuery) ||
        brand.category.toLowerCase().includes(lowerQuery) ||
        brand.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    setFilteredBrands(result);
  }, [searchQuery, selectedCategory, mounted]);

  const handleFormatChange = (format: ColorFormat) => {
    setColorFormatState(format);
    setColorFormat(format);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background w-3xl mx-auto relative">
      {/* Sentinel element for ScrollTrigger - positioned where header starts */}
      <div ref={sentinelRef} className="absolute top-12 left-0 w-full h-px pointer-events-none" aria-hidden="true" />
      
      {/* Header */}
      <header 
        ref={headerRef}
        className="sticky top-2 mt-12 z-50 w-full rounded-xl glass shadow-sm shadow-neutral-900/5 overflow-hidden transition-shadow duration-300"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6 transition-smooth" />
              <h1 className="text-lg font-medium tracking-tight transition-smooth">Brand×Colors · Directory</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <ColorFormatSelector value={colorFormat} onChange={handleFormatChange} />
              <ThemeToggle />
            </div>
          </div>
          
          {/* Search */}
          <div ref={searchRef} className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          
          {/* Category Filters */}
          <div ref={categoriesRef} className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className="cursor-pointer transition-smooth"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer transition-smooth"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
            <Badge
              variant={selectedCategory === 'Favorites' ? 'default' : 'outline'}
              className="cursor-pointer transition-smooth"
              onClick={() => setSelectedCategory('Favorites')}
            >
              ❤️ Favorites
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 py-8">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No brands found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} colorFormat={colorFormat} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t glass mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>A curated library of official brand colors</p>
          <p className="mt-1">{brands.length} brands • Multiple color formats • Open source</p>
        </div>
      </footer>
    </div>
  );
}
