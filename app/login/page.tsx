'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const supabase = getSupabase()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    if (!supabase) return
    const unsubRef: { fn?: () => void } = {}
    supabase.auth.getSession().then(r => {
      const u = r.data.session?.user
      setAuthReady(true)
      if (u) router.replace('/admin')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setAuthReady(true)
      const u = sess?.user
      if (u) router.replace('/admin')
    })
    unsubRef.fn = sub?.subscription.unsubscribe
    return () => { unsubRef.fn?.() }
  }, [supabase, router])

  const magic = async () => {
    if (!supabase || !email) return
    setLoading(true)
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
      if (error) throw error
      // Success message handled by Supabase redirect or can be added here
    } catch (error) {
      console.error('Failed to send magic link:', error)
      // Error handling - could show toast if toast is available
    } finally {
      setLoading(false)
    }
  }

  const oauth = async (provider: 'github' | 'google') => {
    if (!supabase) return
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      if (error) throw error
    } catch (error) {
      console.error('OAuth failed:', error)
      // Error handling - could show toast if toast is available
    }
  }

  return (
    <main className="w-screen h-screen flex items-center justify-center" aria-busy={!authReady}>
      <div>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-1">Access the admin dashboard.</p>
        <div className="mt-6 space-y-3">
          <Input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
          <Button disabled={!authReady || !email || loading} onClick={magic}>{loading ? 'Sending…' : 'Magic Link'}</Button>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!authReady} onClick={() => oauth('github')}>GitHub</Button>
            <Button variant="outline" disabled={!authReady} onClick={() => oauth('google')}>Google</Button>
          </div>
        </div>
      </div>
    </main>
  )
}
