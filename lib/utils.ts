import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Brand, Collection, ColorFormat } from "./types"
import { getPreferences, setColorFormatPref, toggleFavoritePref } from "./store"

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
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
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

export function hexToRgbTuple(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

export function getLuminance(hex: string): number {
  const t = hexToRgbTuple(hex);
  if (!t) return 0;
  const [r8, g8, b8] = t;
  const srgb = [r8, g8, b8].map(v => v / 255).map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const [r, g, b] = srgb as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isBright(hex: string): boolean {
  return getLuminance(hex) > 0.7;
}

export function isVeryBright(hex: string): boolean {
  return getLuminance(hex) > 0.92;
}

export function getTextColorForBackground(hex: string): string {
  return isBright(hex) ? '#000000' : '#FFFFFF';
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
  return getPreferences().favorites;
}

export function toggleFavorite(brandId: string): string[] {
  toggleFavoritePref(brandId);
  return getPreferences().favorites;
}

export function isFavorite(brandId: string): boolean {
  return getPreferences().favorites.includes(brandId);
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
  return getPreferences().colorFormat;
}

export function setColorFormat(format: ColorFormat): void {
  setColorFormatPref(format);
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
    brand.colors.forEach((color) => {
      const varName = `--${brand.id}-${color.name.toLowerCase().replace(/\s+/g, '-')}`;
      css += `  ${varName}: ${color.hex};\n`;
    });
  });
  
  css += '}\n';
  return css;
}

export function exportAsTailwind(brands: Brand[]): string {
  const colors: Record<string, Record<string, string>> = {};
  
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
