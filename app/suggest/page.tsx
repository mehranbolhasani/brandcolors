'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type ColorInput = { hex: string }

export default function SuggestPage() {
  const supabase = getSupabase()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [website, setWebsite] = useState('')
  const [colors, setColors] = useState<ColorInput[]>([{ hex: '' }])
  const [submitted, setSubmitted] = useState(false)
  const addColor = () => setColors(v => [...v, { hex: '' }])
  const updateColor = (i: number, k: keyof ColorInput, val: string) => setColors(v => v.map((c, idx) => (idx === i ? { ...c, [k]: val } : c)))
  const removeColor = (i: number) => setColors(v => v.filter((_, idx) => idx !== i))
  const canSubmit = name && category && website && colors.length && colors.every(c => c.hex)

  const submit = async () => {
    if (!supabase) return setSubmitted(true)
    await supabase.from('submissions').insert({ name, category, website, colors }).throwOnError()
    setSubmitted(true)
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-semibold">Suggest a Brand</h1>
      {submitted ? (
        <p className="text-sm">Thanks for your suggestion. We will review it soon.</p>
      ) : (
        <div className="space-y-3">
          <Input placeholder="Brand name" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
          <Input placeholder="Website" value={website} onChange={e => setWebsite(e.target.value)} />
          <div className="space-y-2">
            {colors.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="#HEX" value={c.hex} onChange={e => updateColor(i, 'hex', e.target.value)} />
                <Button variant="ghost" onClick={() => removeColor(i)}>Remove</Button>
              </div>
            ))}
            <Button variant="outline" onClick={addColor}>Add Color</Button>
          </div>
          <Button disabled={!canSubmit} onClick={submit}>Submit</Button>
          <p className="text-xs text-muted-foreground">No account required. Suggestions are reviewed in the Admin.</p>
        </div>
      )}
      <div>
        <Badge variant="outline">Public contributions</Badge>
      </div>
    </main>
  )
}
