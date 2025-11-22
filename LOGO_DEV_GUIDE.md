# Logo.dev Integration Guide

## What is Logo.dev?

Logo.dev is a comprehensive logo API that provides instant access to company logos via simple image URLs. It's perfect for enriching your brand colors directory with professional logos.

## Features

✅ **Simple URL-based API** - No complex SDK needed
✅ **Multiple lookup modes** - Domain, company name, stock ticker, crypto symbol
✅ **Format options** - PNG, JPG, WebP
✅ **Theme support** - Light/dark mode logos
✅ **Automatic resizing** - Specify any size
✅ **Retina support** - High-DPI displays
✅ **Fallback handling** - Graceful degradation
✅ **Free tier available** - Great for getting started

## Getting Started

### 1. Sign Up for API Key

1. Go to [logo.dev](https://logo.dev)
2. Sign up for a free account
3. Get your publishable API key (starts with `pk_`)
4. Add it to your `.env.local`:

```bash
NEXT_PUBLIC_LOGO_DEV_API_KEY=pk_your_api_key_here
```

### 2. Update BrandLogo Component

Open `/components/brand-logo.tsx` and update line 38:

```tsx
// Before
// token: 'pk_YOUR_API_KEY_HERE', // Add your API key

// After
token: process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY || '',
```

## How It Works

### Basic Usage

The `BrandLogo` component automatically:

1. Extracts the domain from the brand's website URL
2. Fetches the logo from Logo.dev
3. Displays it with proper sizing
4. Falls back to the first letter if logo fails

### Example

```tsx
<BrandLogo domain="nike.com" brandName="Nike" size={40} />
```

### URL Structure

Logo.dev uses simple URL patterns:

```
https://img.logo.dev/{domain}?token={api_key}&size={size}&format={format}
```

**Examples:**

- `https://img.logo.dev/nike.com?token=pk_xxx&size=40&format=png`
- `https://img.logo.dev/apple.com?token=pk_xxx&size=80&theme=dark`
- `https://img.logo.dev/google.com?token=pk_xxx&size=120&retina=true`

## Available Parameters

### Required

- `token` - Your API key (pk_xxxxx)

### Optional

- `size` - Logo size in pixels (default: varies)
- `format` - Image format: `png`, `jpg`, `webp` (default: jpg)
- `theme` - `light` or `dark` for theme-specific logos
- `greyscale` - `true` to desaturate the logo
- `retina` - `true` for 2x resolution
- `fallback` - `404` to return 404 instead of placeholder

## Lookup Modes

### 1. By Domain (Most Reliable)

```tsx
<BrandLogo domain="shopify.com" brandName="Shopify" />
```

### 2. By Company Name

```tsx
<BrandLogo domain="Tesla" brandName="Tesla" />
```

Note: Less reliable, domain is preferred

### 3. By Stock Ticker

```
https://img.logo.dev/ticker/AAPL?token=pk_xxx
```

### 4. By Crypto Symbol

```
https://img.logo.dev/crypto/BTC?token=pk_xxx
```

## Advanced Features

### Dark Mode Support

```tsx
import { useTheme } from "next-themes";

function BrandCardWithTheme({ brand }) {
  const { theme } = useTheme();

  return (
    <BrandLogo
      domain={brand.website}
      brandName={brand.name}
      theme={theme === "dark" ? "dark" : "light"}
    />
  );
}
```

### Retina Displays

```tsx
<BrandLogo domain="nike.com" brandName="Nike" size={40} retina={true} />
```

### Custom Fallback

The component already has a fallback to show the first letter:

```tsx
// Fallback UI (automatically shown on error)
<div className="flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
  <span className="text-lg font-bold text-primary">
    {brandName.charAt(0).toUpperCase()}
  </span>
</div>
```

## Current Implementation

### In BrandCard Component

```tsx
<BrandLogo
  domain={brand.website}
  brandName={brand.name}
  size={40}
  className="flex-shrink-0"
/>
```

This displays:

- 40x40px logo
- Fetched from Logo.dev
- Falls back to first letter if unavailable
- Positioned next to brand name

## Pricing

### Free Tier

- 1,000 requests/month
- Perfect for development and small projects

### Paid Tiers

- Starter: $19/month - 10,000 requests
- Pro: $49/month - 50,000 requests
- Enterprise: Custom pricing

Check [logo.dev/pricing](https://logo.dev/pricing) for latest pricing

## Best Practices

### 1. Use Environment Variables

```bash
# .env.local
NEXT_PUBLIC_LOGO_DEV_API_KEY=pk_your_key_here
```

### 2. Handle Errors Gracefully

The component already handles errors with a fallback UI.

### 3. Optimize Image Loading

```tsx
<Image
  src={logoUrl}
  alt={`${brandName} logo`}
  width={size}
  height={size}
  loading="lazy" // Lazy load logos
  unoptimized // Logo.dev handles optimization
/>
```

### 4. Cache Logos (Optional)

For production, consider caching logos:

```tsx
// In next.config.js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'img.logo.dev',
    },
  ],
}
```

## Troubleshooting

### Logo Not Showing?

1. **Check API Key**

   - Ensure `NEXT_PUBLIC_LOGO_DEV_API_KEY` is set
   - Restart dev server after adding env variable

2. **Check Domain**

   - Use clean domain: `nike.com` not `https://nike.com`
   - Remove `www.` prefix

3. **Check Console**

   - Look for 401 (unauthorized) or 404 (not found) errors

4. **Fallback Working?**
   - If you see the first letter, the logo fetch failed
   - This is expected behavior for some brands

### Rate Limiting

If you hit rate limits:

- Free tier: 1,000/month
- Implement caching
- Upgrade to paid tier

## Alternative: Manual Logo Management

If you prefer not to use Logo.dev:

1. Download logos manually
2. Place in `/public/logos/`
3. Update BrandLogo component:

```tsx
<Image
  src={`/logos/${brand.id}.png`}
  alt={`${brand.name} logo`}
  width={size}
  height={size}
/>
```

## Resources

- [Logo.dev Documentation](https://docs.logo.dev)
- [Logo.dev Dashboard](https://logo.dev/dashboard)
- [API Reference](https://docs.logo.dev/logo-images/introduction)
- [Brand Search API](https://docs.logo.dev/brand-search/introduction)

## Next Steps

1. ✅ Sign up for Logo.dev account
2. ✅ Get your API key
3. ✅ Add to `.env.local`
4. ✅ Update BrandLogo component
5. ✅ Test with your brands
6. Consider adding theme support
7. Consider caching for production

Your brand cards now look more professional with real company logos! 🎨✨
