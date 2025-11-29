import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrandCard } from '@/components/brand-card'
import { Brand } from '@/lib/types'

// Mock store
vi.mock('@/lib/store', () => ({
  usePreferences: () => ({
    favorites: [],
    toggleFavorite: vi.fn(),
  }),
}))

// Mock GSAP
vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
  },
}))

describe('BrandCard', () => {
  const mockBrand: Brand = {
    id: 'test-brand',
    name: 'Test Brand',
    category: 'Tech',
    colors: [
      { name: 'Primary', hex: '#FF0000' },
      { name: 'Secondary', hex: '#00FF00' },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders brand name and category', () => {
    render(<BrandCard brand={mockBrand} colorFormat="hex" />)
    expect(screen.getByText('Test Brand')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
  })

  it('renders all colors', () => {
    render(<BrandCard brand={mockBrand} colorFormat="hex" />)
    expect(screen.getByText('#FF0000')).toBeInTheDocument()
    expect(screen.getByText('#00FF00')).toBeInTheDocument()
  })

  it('renders favorite button', () => {
    render(<BrandCard brand={mockBrand} colorFormat="hex" />)
    const favoriteButton = screen.getByRole('button', { name: /favorite/i })
    expect(favoriteButton).toBeInTheDocument()
  })

  it('handles favorite toggle', () => {
    const { usePreferences } = require('@/lib/store')
    const mockToggle = vi.fn()
    usePreferences.mockReturnValue({
      favorites: [],
      toggleFavorite: mockToggle,
    })

    render(<BrandCard brand={mockBrand} colorFormat="hex" />)
    const favoriteButton = screen.getByRole('button', { name: /favorite/i })
    fireEvent.click(favoriteButton)
    
    expect(mockToggle).toHaveBeenCalledWith('test-brand')
  })
})

