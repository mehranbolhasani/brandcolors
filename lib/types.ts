export interface BrandColor {
  name?: string; // Optional: e.g., "Primary Blue" (deprecated, kept for backward compatibility)
  hex: string; // e.g., "#1877F2"
  rgb?: string; // Optional: "rgb(24, 119, 242)"
  hsl?: string; // Optional: "hsl(214, 89%, 52%)"
  oklch?: string; // Optional: "oklch(0.61 0.24 264)"
}

export interface Brand {
  id: string; // Unique identifier (slug)
  name: string; // Brand name
  colors: BrandColor[]; // Array of brand colors
  category: string; // e.g., "Tech", "Sports", "Fashion", "News"
  tags?: string[]; // Additional tags for filtering
  website?: string; // Official website
  updatedAt?: string; // Last update date
}

export interface Collection {
  id: string; // Unique identifier
  name: string; // Collection name
  brandIds: string[]; // Array of brand IDs in this collection
  createdAt: string; // Creation timestamp
}

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export type LayoutMode = "grid" | "list" | "compact";

export interface UserPreferences {
  colorFormat: ColorFormat;
  theme: "light" | "dark" | "system";
  favorites: string[]; // Array of brand IDs
  collections: Collection[];
  layout?: LayoutMode;
}
