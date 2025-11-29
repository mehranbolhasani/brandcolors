import { describe, it, expect, beforeEach } from 'vitest'
import { setColorFormatPref, toggleFavoritePref, getPreferences, setLayoutPref } from '@/lib/store'

describe('Store', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('setColorFormatPref', () => {
    it('sets and persists color format', () => {
      setColorFormatPref('rgb')
      const prefs = getPreferences()
      expect(prefs.colorFormat).toBe('rgb')
      expect(localStorage.getItem('brandcolors_color_format')).toBe('rgb')
    })

    it('updates color format', () => {
      setColorFormatPref('hex')
      setColorFormatPref('hsl')
      const prefs = getPreferences()
      expect(prefs.colorFormat).toBe('hsl')
    })
  })

  describe('toggleFavoritePref', () => {
    it('adds favorite', () => {
      toggleFavoritePref('brand-1')
      const prefs = getPreferences()
      expect(prefs.favorites).toContain('brand-1')
    })

    it('removes favorite when toggled again', () => {
      toggleFavoritePref('brand-1')
      toggleFavoritePref('brand-1')
      const prefs = getPreferences()
      expect(prefs.favorites).not.toContain('brand-1')
    })

    it('handles multiple favorites', () => {
      toggleFavoritePref('brand-1')
      toggleFavoritePref('brand-2')
      const prefs = getPreferences()
      expect(prefs.favorites).toContain('brand-1')
      expect(prefs.favorites).toContain('brand-2')
    })
  })

  describe('setLayoutPref', () => {
    it('sets and persists layout', () => {
      setLayoutPref('list')
      const prefs = getPreferences()
      expect(prefs.layout).toBe('list')
      expect(localStorage.getItem('brandcolors_layout')).toBe('list')
    })
  })
})

