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

/**
 * Converts a HEX color string to RGB format
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns RGB color string (e.g., "rgb(255, 0, 0)")
 */
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts a HEX color string to HSL format
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns HSL color string (e.g., "hsl(0, 100%, 50%)")
 */
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

/**
 * Converts a HEX color string to OKLCH color space
 * OKLCH is a perceptually uniform color space that provides better color consistency
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns OKLCH color string (e.g., "oklch(0.61 0.24 264)")
 */
export function hexToOklch(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const sr = parseInt(m[1], 16) / 255;
  const sg = parseInt(m[2], 16) / 255;
  const sb = parseInt(m[3], 16) / 255;
  const r = sr <= 0.04045 ? sr / 12.92 : Math.pow((sr + 0.055) / 1.055, 2.4);
  const g = sg <= 0.04045 ? sg / 12.92 : Math.pow((sg + 0.055) / 1.055, 2.4);
  const b = sb <= 0.04045 ? sb / 12.92 : Math.pow((sb + 0.055) / 1.055, 2.4);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m1 = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m1);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(A * A + B * B);
  let H = Math.atan2(B, A) * 180 / Math.PI;
  if (H < 0) H += 360;
  const Lc = Math.max(0, Math.min(1, L));
  const Cc = Math.max(0, C);
  const Hc = Math.round(H) % 360;
  return `oklch(${Lc.toFixed(2)} ${Cc.toFixed(2)} ${Hc})`;
}

/**
 * Formats a color in the specified format
 * @param hex - Hex color string to format
 * @param format - Target format: 'hex', 'rgb', 'hsl', or 'oklch'
 * @returns Formatted color string in the requested format
 */
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

/**
 * Calculates the relative luminance of a color (0-1 scale)
 * Used to determine text contrast for accessibility
 * @param hex - Hex color string
 * @returns Luminance value between 0 (darkest) and 1 (lightest)
 */
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

/**
 * Determines the appropriate text color (black or white) for a given background color
 * @param hex - Background hex color string
 * @returns '#000000' for bright backgrounds, '#FFFFFF' for dark backgrounds
 */
export function getTextColorForBackground(hex: string): string {
  return isBright(hex) ? '#000000' : '#FFFFFF';
}

/**
 * Calculates the contrast ratio between two colors (WCAG standard)
 * @param color1 - First color hex string
 * @param color2 - Second color hex string
 * @returns Contrast ratio (1.0 to 21.0, where 4.5+ meets WCAG AA for normal text, 3.0+ for large text)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if contrast ratio meets WCAG AA standards
 * @param foreground - Foreground color hex string
 * @param background - Background color hex string
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns True if contrast meets WCAG AA (4.5:1 for normal, 3:1 for large)
 */
export function meetsWCAGAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

// ============================================
// Clipboard Functions
// ============================================

/**
 * Copies text to the clipboard with fallback for older browsers
 * @param text - Text to copy to clipboard
 * @returns Promise that resolves to true if successful, false otherwise
 */
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
  BRANDS: 'brandcolors_brands',
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

/**
 * Validates if a string is a valid hex color
 * @param hex - Hex color string to validate
 * @returns true if valid hex color format
 */
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Parses RGB string and converts to HEX
 * @param rgb - RGB string like "rgb(255, 0, 0)" or "255, 0, 0"
 * @returns HEX color string or null if invalid
 */
export function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/**
 * Parses HSL string and converts to HEX
 * @param hsl - HSL string like "hsl(0, 100%, 50%)"
 * @returns HEX color string or null if invalid
 */
export function hslToHex(hsl: string): string | null {
  const match = hsl.match(/(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%/);
  if (!match) return null;
  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;
  
  if (s === 0) {
    const gray = Math.round(l * 255);
    return `#${gray.toString(16).padStart(2, '0').repeat(3).toUpperCase()}`;
  }
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
  
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/**
 * Parses OKLCH string and converts to HEX (simplified conversion)
 * @param oklch - OKLCH string like "oklch(0.61 0.24 264)"
 * @returns HEX color string or null if invalid
 */
export function oklchToHex(oklch: string): string | null {
  // This is a simplified conversion - full OKLCH to RGB conversion is complex
  // For now, we'll return null and let users enter HEX directly
  // Full implementation would require OKLCH -> LAB -> XYZ -> RGB conversion
  return null;
}

/**
 * Detects color format and converts to HEX
 * @param value - Color value in any format
 * @returns HEX color string or null if invalid
 */
export function parseColorToHex(value: string): string | null {
  if (!value.trim()) return null;
  
  const trimmed = value.trim();
  
  // Check if it's already HEX
  if (trimmed.startsWith('#')) {
    const normalized = normalizeHex(trimmed);
    return isValidHex(normalized) ? normalized : null;
  }
  
  // Check if it's RGB
  if (trimmed.toLowerCase().startsWith('rgb')) {
    return rgbToHex(trimmed);
  }
  
  // Check if it's HSL
  if (trimmed.toLowerCase().startsWith('hsl')) {
    return hslToHex(trimmed);
  }
  
  // Check if it's OKLCH
  if (trimmed.toLowerCase().startsWith('oklch')) {
    return oklchToHex(trimmed);
  }
  
  // Try as HEX without #
  const withHash = normalizeHex(trimmed);
  return isValidHex(withHash) ? withHash : null;
}

export function normalizeHex(hex: string): string {
  const v = hex.trim().toUpperCase();
  return v.startsWith('#') ? v : `#${v}`;
}

/**
 * Normalizes a brand object by trimming strings and normalizing hex colors
 * @param brand - Brand object to normalize
 * @returns Normalized brand object with cleaned data
 */
export function normalizeBrand(brand: Brand): Brand {
  return {
    ...brand,
    id: brand.id.trim().toLowerCase(),
    name: brand.name.trim(),
    category: brand.category.trim(),
    colors: brand.colors.map(c => ({
      ...c,
      hex: normalizeHex(c.hex),
    })),
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

function isColor(v: unknown): v is { hex: string; name?: string } {
  if (!isRecord(v)) return false;
  return typeof v.hex === 'string';
}

/**
 * Type guard to validate if input is an array of valid Brand objects
 * @param input - Unknown value to validate
 * @returns true if input is a valid array of Brand objects
 */
export function validateBrands(input: unknown): input is Brand[] {
  if (!Array.isArray(input)) return false;
  for (const b of input) {
    if (!isRecord(b)) return false;
    if (typeof b.id !== 'string' || typeof b.name !== 'string' || typeof b.category !== 'string') return false;
    if (!Array.isArray(b.colors)) return false;
    for (const c of b.colors) {
      if (!isColor(c)) return false;
    }
  }
  return true;
}

export function getRuntimeBrands(): Brand[] {
  if (typeof window === 'undefined') return [];
  const s = localStorage.getItem(STORAGE_KEYS.BRANDS);
  return s ? JSON.parse(s) : [];
}

export function saveRuntimeBrands(brands: Brand[]): void {
  localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
}

export function clearRuntimeBrands(): void {
  localStorage.removeItem(STORAGE_KEYS.BRANDS);
}

export async function fetchBrandsFromUrl(url: string): Promise<Brand[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!validateBrands(data)) throw new Error('Invalid brands schema');
  return (data as Brand[]).map(normalizeBrand);
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
      const varName = `--${brand.id}-color-${index + 1}`;
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
    brand.colors.forEach((color, index) => {
      const colorKey = `color-${index + 1}`;
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
