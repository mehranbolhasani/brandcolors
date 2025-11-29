import { describe, it, expect } from 'vitest'
import { validateBrands, normalizeBrand } from '@/lib/utils'
import { Brand } from '@/lib/types'

describe('Validation', () => {
  describe('validateBrands', () => {
    it('validates correct brand array', () => {
      const brands: Brand[] = [
        {
          id: 'test',
          name: 'Test Brand',
          category: 'Tech',
          colors: [
            { name: 'Primary', hex: '#FF0000' }
          ]
        }
      ]
      expect(validateBrands(brands)).toBe(true)
    })

    it('rejects non-array input', () => {
      expect(validateBrands(null)).toBe(false)
      expect(validateBrands({})).toBe(false)
      expect(validateBrands('string')).toBe(false)
    })

    it('rejects invalid brand structure', () => {
      expect(validateBrands([{ id: 'test' }])).toBe(false)
      expect(validateBrands([{ name: 'Test' }])).toBe(false)
      expect(validateBrands([{ id: 'test', name: 'Test', category: 'Tech' }])).toBe(false)
    })

    it('rejects invalid color structure', () => {
      const brands = [
        {
          id: 'test',
          name: 'Test',
          category: 'Tech',
          colors: [{ name: 'Primary' }] // missing hex
        }
      ]
      expect(validateBrands(brands)).toBe(false)
    })
  })

  describe('normalizeBrand', () => {
    it('normalizes brand data', () => {
      const brand: Brand = {
        id: '  TEST-BRAND  ',
        name: '  Test Brand  ',
        category: '  Tech  ',
        colors: [
          { name: '  Primary  ', hex: '  ff0000  ' }
        ]
      }
      const normalized = normalizeBrand(brand)
      expect(normalized.id).toBe('test-brand')
      expect(normalized.name).toBe('Test Brand')
      expect(normalized.category).toBe('Tech')
      expect(normalized.colors[0].name).toBe('Primary')
      expect(normalized.colors[0].hex).toBe('#FF0000')
    })

    it('adds # to hex if missing', () => {
      const brand: Brand = {
        id: 'test',
        name: 'Test',
        category: 'Tech',
        colors: [{ name: 'Primary', hex: 'FF0000' }]
      }
      const normalized = normalizeBrand(brand)
      expect(normalized.colors[0].hex).toBe('#FF0000')
    })
  })
})

