import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Brand, BrandColor, Collection, ColorFormat } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// Color Conversion Functions
// ============================================

export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgb(${r}, ${g}, ${b})`;
}

export function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function hexToOklch(hex: string): string {
  // Simplified OKLCH conversion (approximation)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  // Simplified linear RGB to OKLCH (this is a rough approximation)
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const c = Math.sqrt(Math.pow(r - l, 2) + Math.pow(g - l, 2) + Math.pow(b - l, 2));
  const h = Math.atan2(g - l, r - l) * 180 / Math.PI;
  
  return `oklch(${l.toFixed(2)} ${c.toFixed(2)} ${h.toFixed(0)})`;
}

export function formatColor(hex: string, format: ColorFormat): string {
  switch (format) {
    case 'hex':
      return hex.toUpperCase();
    case 'rgb':
      return hexToRgb(hex);
    case 'hsl':
      return hexToHsl(hex);
    case 'oklch':
      return hexToOklch(hex);
    default:
      return hex;
  }
}

// ============================================
// Clipboard Functions
// ============================================

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

// ============================================
// Search and Filter Functions
// ============================================

export function searchBrands(brands: Brand[], query: string): Brand[] {
  if (!query.trim()) return brands;
  
  const lowerQuery = query.toLowerCase();
  return brands.filter(brand =>
    brand.name.toLowerCase().includes(lowerQuery) ||
    brand.category.toLowerCase().includes(lowerQuery) ||
    brand.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function filterByCategory(brands: Brand[], category: string | null): Brand[] {
  if (!category || category === 'All') return brands;
  return brands.filter(brand => brand.category === category);
}

// ============================================
// Local Storage Functions
// ============================================

const STORAGE_KEYS = {
  FAVORITES: 'brandcolors_favorites',
  COLLECTIONS: 'brandcolors_collections',
  COLOR_FORMAT: 'brandcolors_color_format',
  THEME: 'brandcolors_theme',
};

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
  return stored ? JSON.parse(stored) : [];
}

export function toggleFavorite(brandId: string): string[] {
  const favorites = getFavorites();
  const index = favorites.indexOf(brandId);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(brandId);
  }
  
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  return favorites;
}

export function isFavorite(brandId: string): boolean {
  return getFavorites().includes(brandId);
}

export function getCollections(): Collection[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
  return stored ? JSON.parse(stored) : [];
}

export function saveCollection(collection: Collection): void {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === collection.id);
  
  if (index > -1) {
    collections[index] = collection;
  } else {
    collections.push(collection);
  }
  
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
}

export function deleteCollection(collectionId: string): void {
  const collections = getCollections().filter(c => c.id !== collectionId);
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
}

export function getColorFormat(): ColorFormat {
  if (typeof window === 'undefined') return 'hex';
  const stored = localStorage.getItem(STORAGE_KEYS.COLOR_FORMAT);
  return (stored as ColorFormat) || 'hex';
}

export function setColorFormat(format: ColorFormat): void {
  localStorage.setItem(STORAGE_KEYS.COLOR_FORMAT, format);
}

// ============================================
// Export Functions
// ============================================

export function exportAsJSON(brands: Brand[]): string {
  return JSON.stringify(brands, null, 2);
}

export function exportAsCSS(brands: Brand[]): string {
  let css = ':root {\n';
  
  brands.forEach(brand => {
    brand.colors.forEach((color, index) => {
      const varName = `--${brand.id}-${color.name.toLowerCase().replace(/\s+/g, '-')}`;
      css += `  ${varName}: ${color.hex};\n`;
    });
  });
  
  css += '}\n';
  return css;
}

export function exportAsTailwind(brands: Brand[]): string {
  const colors: Record<string, any> = {};
  
  brands.forEach(brand => {
    const brandColors: Record<string, string> = {};
    brand.colors.forEach(color => {
      const colorKey = color.name.toLowerCase().replace(/\s+/g, '-');
      brandColors[colorKey] = color.hex;
    });
    colors[brand.id] = brandColors;
  });
  
  return `// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 8)}
    }
  }
}`;
}

export function exportAsSVG(brands: Brand[]): string {
  const swatchSize = 50;
  const padding = 10;
  const colorsPerRow = 10;
  
  let totalColors = 0;
  brands.forEach(brand => totalColors += brand.colors.length);
  
  const rows = Math.ceil(totalColors / colorsPerRow);
  const width = colorsPerRow * (swatchSize + padding) + padding;
  const height = rows * (swatchSize + padding) + padding;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">\n`;
  
  let colorIndex = 0;
  brands.forEach(brand => {
    brand.colors.forEach(color => {
      const row = Math.floor(colorIndex / colorsPerRow);
      const col = colorIndex % colorsPerRow;
      const x = col * (swatchSize + padding) + padding;
      const y = row * (swatchSize + padding) + padding;
      
      svg += `  <rect x="${x}" y="${y}" width="${swatchSize}" height="${swatchSize}" fill="${color.hex}" />\n`;
      colorIndex++;
    });
  });
  
  svg += '</svg>';
  return svg;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
