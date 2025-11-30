'use client'

import { FolderOpen, Download } from 'lucide-react'
import { ColorFormatSelector } from './color-format-selector'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { Heart } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu'
import { usePreferences } from '@/lib/store'
import { Brand } from '@/lib/types'
import { useState } from 'react'
import { exportAsJSON, exportAsCSS, exportAsTailwind, exportAsSVG, downloadFile } from '@/lib/utils'

import { ColorFormat } from '@/lib/types'

import { motion } from "motion/react"

interface SiteHeaderProps {
  colorFormat: ColorFormat
  onColorFormatChange: (format: ColorFormat) => void
  favorites: string[]
  brands: Brand[]
  filteredBrands?: Brand[]
}

export function SiteHeader({ colorFormat, onColorFormatChange, favorites, brands, filteredBrands }: SiteHeaderProps) {
  const [showFavorites, setShowFavorites] = useState(false)
  const favoriteBrands = brands.filter(b => favorites.includes(b.id))
  const brandsToExport = filteredBrands || brands

  return (
    <motion.header 
    initial={{ transform: "translateY(-100px)" }}
    animate={{ transform: "translateY(0px)" }}
    transition={{ type: "spring", duration: 1, bounce: 0.25, ease: "easeInOut", delay: 0.7 }}
    className="relative top-8 z-50 max-w-4xl mx-auto glass rounded-xl shadow-lg shadow-neutral-900/5">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6 transition-smooth" />
            <h1 className="text-lg font-medium tracking-tight transition-smooth">
              Brand×Colors · <span className="text-muted-foreground/80">Directory</span>
            </h1>
          </div>

          {/* Right: Color Format, Export, Favorites, Theme Toggle */}
          <div className="flex items-center gap-3">
            <ColorFormatSelector value={colorFormat} onChange={onColorFormatChange} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Export all brands"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    const content = exportAsJSON(brandsToExport);
                    downloadFile(content, 'brands.json', 'application/json');
                  }}
                >
                  Download JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    const content = exportAsCSS(brandsToExport);
                    downloadFile(content, 'brands.css', 'text/css');
                  }}
                >
                  Download CSS Variables
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    const content = exportAsTailwind(brandsToExport);
                    downloadFile(content, 'brands.tailwind.js', 'application/javascript');
                  }}
                >
                  Download Tailwind Theme
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    const content = exportAsSVG(brandsToExport);
                    downloadFile(content, 'brands.svg', 'image/svg+xml');
                  }}
                >
                  Download SVG Swatches
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Dialog open={showFavorites} onOpenChange={setShowFavorites}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="View favorites">
                  <Heart className="h-5 w-5" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Favorites ({favoriteBrands.length})</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  {favoriteBrands.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No favorites yet. Click the heart icon on any brand to add it to favorites.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {favoriteBrands.map(brand => (
                        <div key={brand.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{brand.name}</p>
                            <p className="text-sm text-muted-foreground">{brand.category}</p>
                          </div>
                          <div className="flex gap-1">
                            {brand.colors.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: color.hex }}
                                title={color.hex}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  )
}

