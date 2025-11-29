import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ColorSwatch } from '@/components/color-swatch'
import { BrandColor } from '@/lib/types'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

describe('ColorSwatch', () => {
  const mockColor: BrandColor = {
    name: 'Primary',
    hex: '#FF0000',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders color swatch', () => {
    render(<ColorSwatch color={mockColor} format="hex" brandName="Test Brand" />)
    expect(screen.getByText('#FF0000')).toBeInTheDocument()
  })

  it('displays color in different formats', () => {
    const { rerender } = render(<ColorSwatch color={mockColor} format="hex" brandName="Test" />)
    expect(screen.getByText('#FF0000')).toBeInTheDocument()

    rerender(<ColorSwatch color={mockColor} format="rgb" brandName="Test" />)
    expect(screen.getByText(/rgb\(/i)).toBeInTheDocument()
  })

  it('handles click to copy', async () => {
    render(<ColorSwatch color={mockColor} format="hex" brandName="Test Brand" />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#FF0000')
    })
  })

  it('renders compact variant', () => {
    render(<ColorSwatch color={mockColor} format="hex" brandName="Test" variant="compact" />)
    expect(screen.getByText('#FF0000')).toBeInTheDocument()
  })
})

