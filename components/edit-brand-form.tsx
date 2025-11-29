'use client'

import { useState, useEffect } from 'react'
import { Brand } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { isValidHex, normalizeHex, parseColorToHex, hexToRgb, hexToHsl, hexToOklch } from '@/lib/utils'
import { Trash2, Plus, Palette } from 'lucide-react'

type ColorInput = { hex: string; rgb?: string; hsl?: string; oklch?: string }

interface EditBrandFormProps {
  initial?: Brand
  onSave: (b: Brand, colors: ColorInput[]) => Promise<void>
  categories: string[]
  saving?: boolean
}

export function EditBrandForm({ initial, onSave, categories, saving = false }: EditBrandFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [customCategory, setCustomCategory] = useState('')
  const [useCustomCategory, setUseCustomCategory] = useState(false)
  const [colors, setColors] = useState<ColorInput[]>(() => 
    initial?.colors.map(c => ({ 
      hex: c.hex, 
      rgb: c.rgb || hexToRgb(c.hex), 
      hsl: c.hsl || hexToHsl(c.hex), 
      oklch: c.oklch || hexToOklch(c.hex) 
    })) ?? [{ hex: '' }]
  )
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})
  const [showPicker, setShowPicker] = useState<Record<number, boolean>>({})
  
  const addColor = () => setColors(v => [...v, { hex: '' }])
  
  const updateColorField = (i: number, field: keyof ColorInput, val: string) => {
    setColors(v => {
      const updated = [...v]
      const color = { ...updated[i] }
      
      if (field === 'hex') {
        // Update hex and auto-fill other formats
        color.hex = val
        const normalized = normalizeHex(val)
        if (isValidHex(normalized)) {
          color.hex = normalized
          color.rgb = hexToRgb(normalized)
          color.hsl = hexToHsl(normalized)
          color.oklch = hexToOklch(normalized)
        }
      } else {
        // User entered a different format - try to parse and convert to hex
        color[field] = val
        const parsedHex = parseColorToHex(val)
        if (parsedHex) {
          color.hex = parsedHex
          color.rgb = hexToRgb(parsedHex)
          color.hsl = hexToHsl(parsedHex)
          color.oklch = hexToOklch(parsedHex)
        }
      }
      
      updated[i] = color
      return updated
    })
    
    // Clear validation error
    if (validationErrors[i]) {
      setValidationErrors(prev => {
        const next = { ...prev }
        delete next[i]
        return next
      })
    }
  }
  
  const removeColor = (i: number) => {
    setColors(v => v.filter((_, idx) => idx !== i))
    setValidationErrors(prev => {
      const next = { ...prev }
      delete next[i]
      const reindexed: Record<number, string> = {}
      Object.keys(next).forEach(key => {
        const idx = parseInt(key)
        if (idx > i) {
          reindexed[idx - 1] = next[idx]
        } else if (idx < i) {
          reindexed[idx] = next[idx]
        }
      })
      return reindexed
    })
    setShowPicker(prev => {
      const next = { ...prev }
      delete next[i]
      const reindexed: Record<number, boolean> = {}
      Object.keys(next).forEach(key => {
        const idx = parseInt(key)
        if (idx > i) {
          reindexed[idx - 1] = next[idx]
        } else if (idx < i) {
          reindexed[idx] = next[idx]
        }
      })
      return reindexed
    })
  }
  
  const slug = (name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const effectiveCategory = useCustomCategory ? customCategory : category
  
  const validateForm = (): boolean => {
    const errors: Record<number, string> = {}
    if (!name.trim()) {
      toast.error('Brand name is required')
      return false
    }
    if (!effectiveCategory.trim()) {
      toast.error('Category is required')
      return false
    }
    if (colors.length === 0) {
      toast.error('At least one color is required')
      return false
    }
    colors.forEach((c, i) => {
      if (!c.hex.trim()) {
        errors[i] = 'Hex color is required'
      } else {
        const normalized = normalizeHex(c.hex)
        if (!isValidHex(normalized)) {
          errors[i] = 'Invalid hex format'
        }
      }
    })
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Please fix validation errors')
      return false
    }
    setValidationErrors({})
    return true
  }
  
  const handleSave = async () => {
    if (!validateForm()) return
    const normalizedColors = colors.map(c => ({
      hex: normalizeHex(c.hex),
      rgb: c.rgb,
      hsl: c.hsl,
      oklch: c.oklch,
    }))
    await onSave({ id: slug, name: name.trim(), category: effectiveCategory.trim(), colors: [] }, normalizedColors)
  }
  
  const disabled = !slug || !name.trim() || !effectiveCategory.trim() || colors.length === 0 || colors.some(c => !c.hex.trim() || !isValidHex(normalizeHex(c.hex)))

  // Preset colors for quick selection
  const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#008000', '#000080',
  ]

  return (
    <div className="space-y-6">
      {/* Brand Information Section */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Brand Name</label>
          <Input 
            placeholder="e.g., Apple" 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <div className="flex items-center gap-2">
            {!useCustomCategory ? (
              <Select value={category} onValueChange={setCategory} className="flex-1">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input 
                placeholder="New category" 
                value={customCategory} 
                onChange={e => setCustomCategory(e.target.value)}
                className="flex-1"
              />
            )}
            <Button 
              variant="outline" 
              type="button"
              onClick={() => setUseCustomCategory(v => !v)}
            >
              {useCustomCategory ? 'Use List' : 'Custom'}
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">ID:</span> {slug || '(auto-generated from name)'}
        </div>
      </div>

      <Separator />

      {/* Colors Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Colors</label>
          <Button variant="outline" size="sm" onClick={addColor} type="button">
            <Plus className="h-4 w-4 mr-1" />
            Add Color
          </Button>
        </div>

        <div className="space-y-4">
          {colors.map((c, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Color {i + 1}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeColor(i)}
                  type="button"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Color Preview & HEX Input */}
              <div className="flex items-center gap-3">
                <div 
                  className="size-12 rounded-md border-2 border-border shadow-sm flex-shrink-0"
                  style={{ backgroundColor: normalizeHex(c.hex || '#ffffff') }}
                />
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">HEX</label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="#FF0000"
                      value={c.hex}
                      onChange={e => updateColorField(i, 'hex', e.target.value)}
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPicker(prev => ({ ...prev, [i]: !prev[i] }))}
                      title="Color picker"
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </div>
                  {validationErrors[i] && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors[i]}</p>
                  )}
                </div>
              </div>

              {/* Color Picker Presets */}
              {showPicker[i] && (
                <div className="p-3 bg-background border rounded-md">
                  <p className="text-xs text-muted-foreground mb-2">Quick Pick</p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {PRESET_COLORS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="aspect-square rounded border border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: preset }}
                        onClick={() => updateColorField(i, 'hex', preset)}
                        aria-label={`Select ${preset}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Format Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">RGB</label>
                  <Input
                    placeholder="rgb(255, 0, 0)"
                    value={c.rgb ?? ''}
                    onChange={e => updateColorField(i, 'rgb', e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">HSL</label>
                  <Input
                    placeholder="hsl(0, 100%, 50%)"
                    value={c.hsl ?? ''}
                    onChange={e => updateColorField(i, 'hsl', e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">OKLCH</label>
                  <Input
                    placeholder="oklch(0.61 0.24 264)"
                    value={c.oklch ?? ''}
                    onChange={e => updateColorField(i, 'oklch', e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button 
          disabled={disabled || saving} 
          onClick={handleSave}
          className="min-w-24"
        >
          {saving ? 'Saving...' : 'Save Brand'}
        </Button>
      </div>
    </div>
  )
}
