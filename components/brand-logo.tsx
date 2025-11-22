'use client';

import { useState } from 'react';
import Image from 'next/image';

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
  const [hasError, setHasError] = useState(false);
  
  // Extract domain from full URL if needed
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const cleanDomain = getDomain(domain);
  
  // Logo.dev API URL
  const apiKey = process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY;
  const params = new URLSearchParams({
    size: size.toString(),
    format: 'png',
    ...(theme && { theme })
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
        onError={() => setHasError(true)}
        unoptimized // Logo.dev handles optimization
      />
    </div>
  );
}
