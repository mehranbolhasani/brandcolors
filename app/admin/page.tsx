'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { Brand } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

type ColorInput = { name: string; hex: string; rgb?: string; hsl?: string; oklch?: string }
type CRow = { brand_id: string; name: string; hex: string; rgb?: string; hsl?: string; oklch?: string }

function EditForm({ initial, onSave, categories }: { initial?: Brand; onSave: (b: Brand, colors: ColorInput[]) => Promise<void>; categories: string[] }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [customCategory, setCustomCategory] = useState('')
  const [useCustomCategory, setUseCustomCategory] = useState(false)
  const [colors, setColors] = useState<ColorInput[]>(() => initial?.colors.map(c => ({ name: c.name, hex: c.hex, rgb: c.rgb, hsl: c.hsl, oklch: c.oklch })) ?? [{ name: '', hex: '' }])
  const addColor = () => setColors(v => [...v, { name: '', hex: '' }])
  const updateColor = (i: number, k: keyof ColorInput, val: string) => setColors(v => v.map((c, idx) => (idx === i ? { ...c, [k]: val } : c)))
  const removeColor = (i: number) => setColors(v => v.filter((_, idx) => idx !== i))
  const slug = (name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const effectiveCategory = useCustomCategory ? customCategory : category
  const disabled = !slug || !name || !effectiveCategory || colors.length === 0 || colors.some(c => !c.name || !c.hex)
  return (
    <div className="space-y-3">
      <Input placeholder="name" value={name} onChange={e => setName(e.target.value)} />
      <div className="flex items-center gap-2">
        {!useCustomCategory ? (
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input placeholder="New category" value={customCategory} onChange={e => setCustomCategory(e.target.value)} />
        )}
        <Button variant="outline" onClick={() => setUseCustomCategory(v => !v)}>{useCustomCategory ? 'Use list' : 'New category'}</Button>
      </div>
      <div className="space-y-2">
        {colors.map((c, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <Input placeholder="color name" value={c.name} onChange={e => updateColor(i, 'name', e.target.value)} />
            <div className="flex items-center gap-2">
              <Input placeholder="#HEX" value={c.hex} onChange={e => updateColor(i, 'hex', e.target.value)} />
              <div className="size-6 rounded-md border" style={{ backgroundColor: c.hex || '#ffffff' }} />
            </div>
            <Input placeholder="rgb(...)" value={c.rgb ?? ''} onChange={e => updateColor(i, 'rgb', e.target.value)} />
            <Input placeholder="hsl(...)" value={c.hsl ?? ''} onChange={e => updateColor(i, 'hsl', e.target.value)} />
            <Input placeholder="oklch(...)" value={c.oklch ?? ''} onChange={e => updateColor(i, 'oklch', e.target.value)} />
            <div className="flex md:col-span-2 lg:col-span-3 justify-end">
              <Button variant="ghost" onClick={() => removeColor(i)}>Remove</Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addColor}>Add Color</Button>
      </div>
      <div className="text-xs text-muted-foreground">id: {slug || '(auto-from-name)'}</div>
      <Button disabled={disabled} onClick={() => onSave({ id: slug, name, category: effectiveCategory, colors: [] }, colors)}>Save</Button>
    </div>
  )
}

export default function AdminPage() {
  const supabase = getSupabase()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [brands, setBrands] = useState<Brand[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<unknown>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    if (!supabase) return
    const unsubRef: { fn?: () => void } = {}
    supabase.auth.getSession().then(r => {
      setUser(r.data.session?.user ?? null)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setUser(sess?.user ?? null)
      setAuthReady(true)
    })
    unsubRef.fn = sub?.subscription.unsubscribe
    return () => { unsubRef.fn?.() }
  }, [supabase])

  useEffect(() => {
    if (!supabase || !authReady) return
    if (!user) router.replace('/login')
  }, [supabase, user, authReady, router])

  const loadBrands = useCallback(async () => {
    if (!supabase) return
    const { data: bdata, error: berr } = await supabase.from('brands').select('id,name,category').order('name')
    if (berr) return
    const { data: cdata } = await supabase.from('colors').select('brand_id,name,hex,rgb,hsl,oklch')
    const colorsByBrand = new Map<string, ColorInput[]>()
    for (const c of (cdata ?? []) as CRow[]) {
      const arr = colorsByBrand.get(c.brand_id) ?? []
      arr.push({ name: c.name, hex: c.hex, rgb: c.rgb, hsl: c.hsl, oklch: c.oklch })
      colorsByBrand.set(c.brand_id, arr)
    }
    const list = (bdata ?? []).map(row => ({ id: row.id, name: row.name, category: row.category, colors: colorsByBrand.get(row.id) ?? [] })) as Brand[]
    setBrands(list)
  }, [supabase])

  useEffect(() => {
    if (!supabase) return
    const t = setTimeout(() => { void loadBrands() }, 0)
    return () => clearTimeout(t)
  }, [supabase, loadBrands])


  const signInWithEmail = async () => {
    if (!supabase || !userEmail) return
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
    const { error } = await supabase.auth.signInWithOtp({ email: userEmail, options: { emailRedirectTo: redirectTo } })
    if (error) toast.error('Failed to send magic link')
    else toast.success('Check your email for the magic link')
  }

  const signInWithProvider = async (provider: 'github' | 'google') => {
    if (!supabase) return
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
    if (error) toast.error('Auth failed')
  }

  const signOut = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) toast.error('Sign out failed')
    else toast.success('Signed out')
  }

  const saveBrand = async (b: Brand, colors: ColorInput[]) => {
    if (!supabase) return
    await supabase.from('brands').upsert({ id: b.id, name: b.name, category: b.category }).throwOnError()
    await supabase.from('colors').delete().eq('brand_id', b.id)
    if (colors.length) {
      await supabase.from('colors').insert(colors.map(c => ({ brand_id: b.id, name: c.name, hex: c.hex, rgb: c.rgb, hsl: c.hsl, oklch: c.oklch }))).throwOnError()
    }
    await loadBrands()
    setOpenId(null)
  }

  const importJson = async (file: File) => {
    const text = await file.text()
    const json = JSON.parse(text) as Brand[]
    for (const b of json) {
      await saveBrand(b, b.colors.map(c => ({ name: c.name, hex: c.hex })))
    }
  }

  if (!supabase) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="w-64" />
          <Button variant="outline" onClick={signInWithEmail}>Magic Link</Button>
          <Button variant="outline" onClick={() => signInWithProvider('github')}>GitHub</Button>
          <Button variant="outline" onClick={() => signInWithProvider('google')}>Google</Button>
          {user ? <Button onClick={() => { signOut(); router.replace('/login') }}>Sign Out</Button> : null}
        </div>
      </div>

      {!user && (
        <p className="text-sm text-muted-foreground">Sign in to add or edit brands. You can still refresh and view data if public read is enabled.</p>
      )}

      <div className="flex items-center gap-2">
        <Dialog open={openId === 'new'} onOpenChange={o => setOpenId(o ? 'new' : null)}>
          <DialogTrigger asChild>
            <Button disabled={!user}>Add Brand</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Brand</DialogTitle>
              <DialogDescription>Create a brand and add one or more colors. id is generated from the name.</DialogDescription>
            </DialogHeader>
            <EditForm onSave={saveBrand} categories={[...new Set(brands.map(b => b.category))].sort()} />
          </DialogContent>
        </Dialog>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={e => {
          const f = e.target.files?.[0]
          if (f) importJson(f)
          e.currentTarget.value = ''
        }} />
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={!user}>Import JSON</Button>
        <Button variant="outline" onClick={loadBrands}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {brands.map(b => (
          <div key={b.id} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.category}</p>
              </div>
              <Dialog open={openId === b.id} onOpenChange={o => setOpenId(o ? b.id : null)}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={!user}>Edit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Brand</DialogTitle>
                    <DialogDescription>Update brand details and colors.</DialogDescription>
                  </DialogHeader>
                  <EditForm initial={b} onSave={saveBrand} categories={[...new Set(brands.map(b => b.category))].sort()} />
                </DialogContent>
              </Dialog>
              <Button variant="destructive" disabled={!user} onClick={async () => { if (!supabase) return; await supabase.from('brands').delete().eq('id', b.id); await loadBrands(); }}>Delete</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {b.colors.map(c => (
                <Badge key={c.name} variant="outline">{c.name}: {c.hex}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
