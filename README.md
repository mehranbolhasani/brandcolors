# Brand Colors 🎨

A modern, curated library of official brand colors from top companies worldwide. Copy colors in multiple formats (HEX, RGB, HSL, OKLCH) with a beautiful, responsive interface.

![Brand Colors Demo](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- **50+ Curated Brands** across Tech, Sports, Fashion, and News
- **Multiple Color Formats** - HEX, RGB, HSL, OKLCH
- **One-Click Copy** - Click any color to copy to clipboard
- **Smart Search** - Find brands instantly
- **Category Filters** - Filter by industry
- **Favorites System** - Save your favorite brands
- **Dark/Light Mode** - Beautiful in any theme
- **Fully Responsive** - Works on all devices
- **Premium Design** - Glassmorphism effects and smooth animations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Font**: [Geist](https://vercel.com/font)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 📁 Project Structure

```
brandcolors/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main brand library page
│   └── globals.css         # Global styles + Tailwind
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── brand-card.tsx      # Brand display card
│   ├── color-swatch.tsx    # Individual color display
│   ├── color-format-selector.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── brands-data.ts      # Brand dataset (50 brands)
│   └── utils.ts            # Utility functions
└── package.json
```

## 🎨 Brands Included

### Tech (12 brands)

Google, Meta, Apple, Microsoft, Amazon, Spotify, Netflix, X (Twitter), Instagram, YouTube, LinkedIn, Slack

### Sports (10 brands)

Real Madrid, Barcelona, Manchester United, Liverpool, Chelsea, Bayern Munich, Juventus, PSG, LA Lakers, NY Yankees

### Fashion (10 brands)

Nike, Adidas, Gucci, Louis Vuitton, Chanel, Prada, Hermès, Burberry, Versace, Zara

### News (10 brands)

CNN, BBC, The New York Times, Reuters, Bloomberg, The Guardian, WSJ, Al Jazeera, Fox News, Washington Post

## 🔮 Upcoming Features

- [ ] Collections - Create custom brand collections
- [ ] Export - Download as JSON, CSS, Tailwind config, or SVG
- [ ] Keyboard Shortcuts - `/` for search, `F` for favorites
- [ ] Brand Logos - Visual brand recognition
- [ ] More Brands - Expanding to 100+ brands
- [ ] API Access - Programmatic access to brand data

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Brand colors sourced from official brand guidelines
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

Made with ❤️ for designers
