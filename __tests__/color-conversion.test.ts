import { describe, it, expect } from 'vitest'
import { hexToRgb, hexToHsl, hexToOklch, formatColor, isValidHex, normalizeHex } from '@/lib/utils'

describe('Color Conversion', () => {
  describe('hexToRgb', () => {
    it('converts hex to rgb', () => {
      expect(hexToRgb('#FF0000')).toBe('rgb(255, 0, 0)')
      expect(hexToRgb('#00FF00')).toBe('rgb(0, 255, 0)')
      expect(hexToRgb('#0000FF')).toBe('rgb(0, 0, 255)')
      expect(hexToRgb('#FFFFFF')).toBe('rgb(255, 255, 255)')
      expect(hexToRgb('#000000')).toBe('rgb(0, 0, 0)')
    })

    it('handles hex without #', () => {
      expect(hexToRgb('FF0000')).toBe('rgb(255, 0, 0)')
    })

    it('returns original if invalid', () => {
      expect(hexToRgb('invalid')).toBe('invalid')
    })
  })

  describe('hexToHsl', () => {
    it('converts hex to hsl', () => {
      const result = hexToHsl('#FF0000')
      expect(result).toContain('hsl(')
      expect(result).toContain('0')
    })

    it('handles hex without #', () => {
      const result = hexToHsl('00FF00')
      expect(result).toContain('hsl(')
    })
  })

  describe('hexToOklch', () => {
    it('converts hex to oklch', () => {
      const result = hexToOklch('#FF0000')
      expect(result).toContain('oklch(')
    })

    it('handles hex without #', () => {
      const result = hexToOklch('0000FF')
      expect(result).toContain('oklch(')
    })
  })

  describe('formatColor', () => {
    it('formats as hex', () => {
      expect(formatColor('#ff0000', 'hex')).toBe('#FF0000')
    })

    it('formats as rgb', () => {
      expect(formatColor('#FF0000', 'rgb')).toContain('rgb(')
    })

    it('formats as hsl', () => {
      expect(formatColor('#FF0000', 'hsl')).toContain('hsl(')
    })

    it('formats as oklch', () => {
      expect(formatColor('#FF0000', 'oklch')).toContain('oklch(')
    })
  })

  describe('isValidHex', () => {
    it('validates correct hex colors', () => {
      expect(isValidHex('#FF0000')).toBe(true)
      expect(isValidHex('#fff')).toBe(true)
      expect(isValidHex('#ABC123')).toBe(true)
    })

    it('rejects invalid hex colors', () => {
      expect(isValidHex('invalid')).toBe(false)
      expect(isValidHex('#GG0000')).toBe(false)
      expect(isValidHex('FF0000')).toBe(false)
      expect(isValidHex('')).toBe(false)
    })
  })

  describe('normalizeHex', () => {
    it('adds # if missing', () => {
      expect(normalizeHex('FF0000')).toBe('#FF0000')
    })

    it('keeps # if present', () => {
      expect(normalizeHex('#FF0000')).toBe('#FF0000')
    })

    it('converts to uppercase', () => {
      expect(normalizeHex('#ff0000')).toBe('#FF0000')
    })

    it('trims whitespace', () => {
      expect(normalizeHex('  FF0000  ')).toBe('#FF0000')
    })
  })
})

