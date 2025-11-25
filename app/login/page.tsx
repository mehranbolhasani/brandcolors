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
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
    setLoading(false)
  }

  const oauth = async (provider: 'github' | 'google') => {
    if (!supabase) return
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
  }

  return (
    <main className="container mx-auto px-4 py-24 max-w-md" aria-busy={!authReady}>
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
    </main>
  )
}
