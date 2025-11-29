import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AdminPage from '@/app/admin/page'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('Admin Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders admin page', async () => {
    render(<AdminPage />)
    await waitFor(() => {
      expect(screen.getByText(/Admin/i)).toBeInTheDocument()
    })
  })

  it('shows sign in message when not authenticated', async () => {
    render(<AdminPage />)
    await waitFor(() => {
      expect(screen.getByText(/Sign in to add or edit brands/i)).toBeInTheDocument()
    })
  })

  it('displays add brand button', async () => {
    render(<AdminPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Brand/i })).toBeInTheDocument()
    })
  })
})

