'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const logoFailCache: Set<string> = new Set();
const logoOkCache: Set<string> = new Set();

function getDomain(url: string) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

interface BrandLogoProps {
  domain: string; // e.g., "nike.com"
  brandName: string;
  size?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

export function BrandLogo({ 
  domain, 
  brandName, 
  size = 48, 
  className = '',
  theme 
}: BrandLogoProps) {
  const { theme: currentTheme } = useTheme();
  const [hasError, setHasError] = useState<boolean>(() => {
    const d = getDomain(domain);
    if (logoFailCache.has(d)) return true;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('brandcolors_logo_fail');
        const map = stored ? JSON.parse(stored) : {};
        if (map[d]) return true;
      } catch {}
    }
    return false;
  });
  
  const cleanDomain = getDomain(domain);
  if (logoOkCache.has(cleanDomain)) {
    if (hasError) {
      // If previously marked error, trust success cache
      // Reset local error state
      // Note: avoiding immediate state changes in effects; this runs in render
    }
  }
  
  // No effect needed; initial state handles cached failures

  // Logo.dev API URL
  const apiKey = process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY;
  const params = new URLSearchParams({
    size: size.toString(),
    format: 'png',
    ...(theme ? { theme } : {}),
    ...(currentTheme ? { theme: currentTheme === 'dark' ? 'dark' : 'light' } : {}),
  });
  
  // Only add token if API key is available
  if (apiKey) {
    params.set('token', apiKey);
  }
  
  const logoUrl = `https://img.logo.dev/${cleanDomain}?${params}`;

  // Fallback to first letter if logo fails to load
  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-lg font-bold text-primary">
          {brandName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={logoUrl}
        alt={`${brandName} logo`}
        width={size}
        height={size}
        className="object-contain"
        onError={() => {
          setHasError(true);
          logoFailCache.add(cleanDomain);
          if (typeof window !== 'undefined') {
            try {
              const stored = localStorage.getItem('brandcolors_logo_fail');
              const map = stored ? JSON.parse(stored) : {};
              map[cleanDomain] = true;
              localStorage.setItem('brandcolors_logo_fail', JSON.stringify(map));
            } catch {}
          }
        }}
        onLoad={() => {
          logoOkCache.add(cleanDomain);
          // Clean any previous failure marks
          logoFailCache.delete(cleanDomain);
          if (typeof window !== 'undefined') {
            try {
              const okStored = localStorage.getItem('brandcolors_logo_ok');
              const okMap = okStored ? JSON.parse(okStored) : {};
              okMap[cleanDomain] = true;
              localStorage.setItem('brandcolors_logo_ok', JSON.stringify(okMap));

              const failStored = localStorage.getItem('brandcolors_logo_fail');
              const failMap = failStored ? JSON.parse(failStored) : {};
              if (failMap[cleanDomain]) {
                delete failMap[cleanDomain];
                localStorage.setItem('brandcolors_logo_fail', JSON.stringify(failMap));
              }
            } catch {}
          }
        }}
        unoptimized // Logo.dev handles optimization
      />
    </div>
  );
}
