import { describe, it, expect, beforeEach } from 'vitest'
import { formatColor, toggleFavorite, getFavorites, setColorFormat, getColorFormat } from '@/lib/utils'

describe('utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('formats color in various formats', () => {
    expect(formatColor('#000000', 'hex')).toBe('#000000')
    expect(formatColor('#000000', 'rgb')).toContain('rgb(')
    expect(formatColor('#000000', 'hsl')).toContain('hsl(')
    expect(formatColor('#000000', 'oklch')).toContain('oklch(')
  })

  it('toggles favorites in localStorage', () => {
    expect(getFavorites()).toEqual([])
    toggleFavorite('brand-1')
    expect(getFavorites()).toEqual(['brand-1'])
    toggleFavorite('brand-1')
    expect(getFavorites()).toEqual([])
  })

  it('persists and reads color format', () => {
    expect(getColorFormat()).toBe('hex')
    setColorFormat('rgb')
    expect(getColorFormat()).toBe('rgb')
  })
})
