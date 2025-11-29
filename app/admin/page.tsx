'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { Brand } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription } from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { FolderOpen, LogOut, Plus, Import, RefreshCw, Tag, X, Edit2, CheckSquare, Square, Trash2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js'
import { FILE_LIMITS } from '@/lib/constants'
import { EditBrandForm } from '@/components/edit-brand-form'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

type ColorInput = { hex: string; rgb?: string; hsl?: string; oklch?: string }
type CRow = { brand_id: string; name?: string; hex: string; rgb?: string; hsl?: string; oklch?: string }

export default function AdminPage() {
  const supabase = getSupabase()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [brands, setBrands] = useState<Brand[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false)
  const [bulkEditCategory, setBulkEditCategory] = useState('')

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
    setLoading(true)
    try {
      const { data: bdata, error: berr } = await supabase.from('brands').select('id,name,category').order('name')
      if (berr) throw berr
      const { data: cdata, error: cerr } = await supabase.from('colors').select('brand_id,name,hex,rgb,hsl,oklch')
      if (cerr) throw cerr
      const colorsByBrand = new Map<string, ColorInput[]>()
      for (const c of (cdata ?? []) as CRow[]) {
        const arr = colorsByBrand.get(c.brand_id) ?? []
        arr.push({ hex: c.hex, rgb: c.rgb, hsl: c.hsl, oklch: c.oklch })
        colorsByBrand.set(c.brand_id, arr)
      }
      const list = (bdata ?? []).map(row => ({ id: row.id, name: row.name, category: row.category, colors: colorsByBrand.get(row.id) ?? [] })) as Brand[]
      setBrands(list)
      
      // Update categories list
      const uniqueCategories = [...new Set(list.map(b => b.category))].sort()
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Failed to load brands:', error)
      toast.error('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  const updateCategory = async (oldCategory: string, newCategory: string) => {
    if (!supabase || !user) return
    if (newCategory.trim() === oldCategory) {
      setEditingCategory(null)
      return
    }
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty')
      return
    }
    
    try {
      const { error } = await supabase
        .from('brands')
        .update({ category: newCategory.trim() })
        .eq('category', oldCategory)
      
      if (error) throw error
      
      toast.success(`Updated category "${oldCategory}" to "${newCategory.trim()}"`)
      setEditingCategory(null)
      await loadBrands()
    } catch (error) {
      console.error('Failed to update category:', error)
      toast.error('Failed to update category')
    }
  }
  
  const deleteCategory = async (category: string) => {
    if (!supabase || !user) return
    
    const brandsWithCategory = brands.filter(b => b.category === category)
    if (brandsWithCategory.length > 0) {
      toast.error(`Cannot delete category "${category}" - ${brandsWithCategory.length} brand(s) still use it. Please update brands first.`)
      return
    }
    
    // Categories are just strings, so we just need to ensure no brands use it
    toast.success(`Category "${category}" is no longer in use`)
    await loadBrands()
  }

  const toggleBrandSelection = (brandId: string) => {
    setSelectedBrands(prev => {
      const next = new Set(prev)
      if (next.has(brandId)) {
        next.delete(brandId)
      } else {
        next.add(brandId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    const filtered = filterCategory 
      ? brands.filter(b => b.category === filterCategory)
      : brands
    
    if (selectedBrands.size === filtered.length && filtered.length > 0) {
      setSelectedBrands(new Set())
    } else {
      setSelectedBrands(new Set(filtered.map(b => b.id)))
    }
  }

  const bulkUpdateCategory = async () => {
    if (!supabase || !user || selectedBrands.size === 0 || !bulkEditCategory.trim()) {
      toast.error('Please select brands and enter a category')
      return
    }

    try {
      const { error } = await supabase
        .from('brands')
        .update({ category: bulkEditCategory.trim() })
        .in('id', Array.from(selectedBrands))
      
      if (error) throw error
      
      toast.success(`Updated ${selectedBrands.size} brand(s) to category "${bulkEditCategory.trim()}"`)
      setSelectedBrands(new Set())
      setShowBulkEditDialog(false)
      setBulkEditCategory('')
      await loadBrands()
    } catch (error) {
      console.error('Failed to bulk update category:', error)
      toast.error('Failed to update brands')
    }
  }

  const bulkDeleteBrands = async () => {
    if (!supabase || !user || selectedBrands.size === 0) {
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedBrands.size} brand(s)? This action cannot be undone.`)) {
      return
    }

    try {
      const brandIds = Array.from(selectedBrands)
      
      // Delete colors first
      for (const brandId of brandIds) {
        const { error: colorError } = await supabase.from('colors').delete().eq('brand_id', brandId)
        if (colorError) throw colorError
      }
      
      // Delete brands
      const { error: brandError } = await supabase.from('brands').delete().in('id', brandIds)
      if (brandError) throw brandError
      
      toast.success(`Deleted ${selectedBrands.size} brand(s)`)
      setSelectedBrands(new Set())
      await loadBrands()
    } catch (error) {
      console.error('Failed to bulk delete brands:', error)
      toast.error('Failed to delete brands')
    }
  }

  const filteredBrands = filterCategory 
    ? brands.filter(b => b.category === filterCategory)
    : brands

  useEffect(() => {
    if (!supabase) return
    void loadBrands()
  }, [supabase, loadBrands])


  const signInWithEmail = async () => {
    if (!supabase || !userEmail) return
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
      const { error } = await supabase.auth.signInWithOtp({ email: userEmail, options: { emailRedirectTo: redirectTo } })
      if (error) throw error
      toast.success('Check your email for the magic link')
    } catch (error) {
      console.error('Failed to send magic link:', error)
      toast.error('Failed to send magic link')
    }
  }

  const signInWithProvider = async (provider: 'github' | 'google') => {
    if (!supabase) return
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      if (error) throw error
    } catch (error) {
      console.error('Auth failed:', error)
      toast.error('Auth failed')
    }
  }

  const signOut = async () => {
    if (!supabase) return
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out')
    } catch (error) {
      console.error('Sign out failed:', error)
      toast.error('Sign out failed')
    }
  }

  const saveBrand = async (b: Brand, colors: ColorInput[]) => {
    if (!supabase) return
    setSaving(true)
    try {
      const { error: brandError } = await supabase.from('brands').upsert({ id: b.id, name: b.name, category: b.category })
      if (brandError) throw brandError
      const { error: deleteError } = await supabase.from('colors').delete().eq('brand_id', b.id)
      if (deleteError) throw deleteError
      if (colors.length) {
        const { error: insertError } = await supabase.from('colors').insert(colors.map((c, index) => ({ 
          brand_id: b.id, 
          name: `Color ${index + 1}`, // Database requires name field
          hex: c.hex, 
          rgb: c.rgb, 
          hsl: c.hsl, 
          oklch: c.oklch 
        })))
        if (insertError) throw insertError
      }
      await loadBrands()
      setOpenId(null)
      toast.success('Brand saved successfully')
    } catch (error) {
      console.error('Failed to save brand:', error)
      toast.error('Failed to save brand')
      throw error
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBrand = async (brandId: string) => {
    if (!supabase) return
    setDeleting(brandId)
    try {
      const { error } = await supabase.from('brands').delete().eq('id', brandId)
      if (error) throw error
      await loadBrands()
      toast.success('Brand deleted')
    } catch (error) {
      console.error('Failed to delete brand:', error)
      toast.error('Failed to delete brand')
    } finally {
      setDeleting(null)
    }
  }

  const importJson = async (file: File) => {
    try {
      if (file.size > FILE_LIMITS.MAX_JSON_SIZE) {
        toast.error(`File too large. Maximum size is ${FILE_LIMITS.MAX_JSON_SIZE / 1024 / 1024}MB`)
        return
      }
      const text = await file.text()
      const json = JSON.parse(text) as Brand[]
      if (!Array.isArray(json)) {
        toast.error('Invalid JSON format: expected an array')
        return
      }
      
      // Check for duplicate IDs in the import file
      const seenIds = new Set<string>()
      const duplicates: string[] = []
      json.forEach(b => {
        if (seenIds.has(b.id)) {
          duplicates.push(b.id)
        } else {
          seenIds.add(b.id)
        }
      })
      
      if (duplicates.length > 0) {
        toast.error(`Duplicate brand IDs found: ${[...new Set(duplicates)].join(', ')}. Please fix these before importing.`)
        return
      }
      
      // Start import with progress tracking
      setImporting(true)
      setShowImportDialog(true)
      setImportProgress({ current: 0, total: json.length })
      
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []
      
      for (let i = 0; i < json.length; i++) {
        const b = json[i]
        try {
          await saveBrand(b, b.colors.map(c => ({ hex: c.hex, rgb: c.rgb, hsl: c.hsl, oklch: c.oklch })))
          successCount++
        } catch (error) {
          errorCount++
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`${b.name} (${b.id}): ${errorMsg}`)
          console.error(`Failed to import brand ${b.id}:`, error)
        }
        
        // Update progress
        setImportProgress({ current: i + 1, total: json.length })
        
        // Small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      setImporting(false)
      
      if (errorCount === 0) {
        toast.success(`Successfully imported ${successCount} brand(s)`)
        setShowImportDialog(false)
      } else {
        toast.warning(`Imported ${successCount} brand(s), ${errorCount} failed. Check console for details.`)
        if (errors.length > 0) {
          console.error('Import errors:', errors)
        }
        // Keep dialog open to show errors, but allow closing
      }
      
      // Refresh brands list
      await loadBrands()
    } catch (error) {
      console.error('Failed to import JSON:', error)
      toast.error('Failed to import: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setImporting(false)
      setShowImportDialog(false)
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
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between h-24">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-10 w-10 transition-smooth" />
          <h1 className="text-lg font-medium tracking-tight transition-smooth flex flex-col">
            <span>Brand×Colors · Directory</span>
            <span className="text-sm text-muted-foreground">Admin</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {user ? <Button variant="outline" onClick={() => { signOut(); router.replace('/login') }} aria-label="Sign out">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
            </Button> : null}
        </div>
      </div>

      {!user && (
        <p className="text-sm text-muted-foreground">Sign in to add or edit brands. You can still refresh and view data if public read is enabled.</p>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Drawer open={openId === 'new'} onOpenChange={(o: boolean) => setOpenId(o ? 'new' : null)}>
            <DrawerTrigger asChild>
              <Button disabled={!user} aria-label="Add new brand">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Brand
              </Button>
            </DrawerTrigger>
            <DrawerContent side="right" className="overflow-y-auto">
              <DrawerHeader>
                <DrawerTitle>New Brand</DrawerTitle>
                <DrawerDescription>Create a brand and add one or more colors. ID is generated from the name.</DrawerDescription>
              </DrawerHeader>
              <div className="px-6 pb-6">
                <EditBrandForm onSave={saveBrand} categories={[...new Set(brands.map(b => b.category))].sort()} saving={saving} />
              </div>
            </DrawerContent>
          </Drawer>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={e => {
            const f = e.target.files?.[0]
            if (f) importJson(f)
            e.currentTarget.value = ''
          }} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={!user} aria-label="Import brands from JSON file">
            <Import className="h-4 w-4" aria-hidden="true" />
            Import JSON
          </Button>
          <Button variant="outline" onClick={loadBrands} aria-label="Refresh brands list" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setShowCategoriesDialog(true)} disabled={!user} aria-label="Manage categories">
            <Tag className="h-4 w-4" aria-hidden="true" />
            Categories
          </Button>
        </div>

        {/* Filter and Bulk Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Select value={filterCategory || 'all'} onValueChange={(v) => setFilterCategory(v === 'all' ? null : v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBrands.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedBrands.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkEditDialog(true)}
                aria-label="Bulk edit category"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Change Category
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={bulkDeleteBrands}
                aria-label="Bulk delete brands"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBrands(new Set())}
                aria-label="Clear selection"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBrands.length > 0 && (
          <div className="md:col-span-2 flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm hover:text-foreground transition-colors"
              aria-label={selectedBrands.size === filteredBrands.length ? 'Deselect all' : 'Select all'}
            >
              {selectedBrands.size === filteredBrands.length && filteredBrands.length > 0 ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span>Select All ({filteredBrands.length})</span>
            </button>
          </div>
        )}
        {filteredBrands.map(b => {
          const isSelected = selectedBrands.has(b.id)
          return (
            <div key={b.id} className={`glass rounded-xl p-4 border-2 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent'}`}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleBrandSelection(b.id)}
                  className="mt-1 shrink-0"
                  aria-label={isSelected ? `Deselect ${b.name}` : `Select ${b.name}`}
                >
                  {isSelected ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.category}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Drawer open={openId === b.id} onOpenChange={(o: boolean) => setOpenId(o ? b.id : null)}>
                        <DrawerTrigger asChild>
                          <Button variant="outline" size="sm" disabled={!user || saving} aria-label={`Edit ${b.name}`}>Edit</Button>
                        </DrawerTrigger>
                        <DrawerContent side="right" className="overflow-y-auto">
                          <DrawerHeader>
                            <DrawerTitle>Edit Brand</DrawerTitle>
                            <DrawerDescription>Update brand details and colors.</DrawerDescription>
                          </DrawerHeader>
                          <div className="px-6 pb-6">
                            <EditBrandForm initial={b} onSave={saveBrand} categories={[...new Set(brands.map(b => b.category))].sort()} saving={saving} />
                          </div>
                        </DrawerContent>
                      </Drawer>
                      <Button variant="destructive" size="sm" disabled={!user || deleting === b.id} onClick={() => handleDeleteBrand(b.id)} aria-label={`Delete ${b.name}`}>
                        {deleting === b.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.colors.map((c, idx) => (
                      <Badge key={idx} variant="outline" className="flex items-center gap-1.5">
                        <div className="size-3 rounded-full" style={{ backgroundColor: c.hex }} />
                        {c.hex}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {filteredBrands.length === 0 && (
          <div className="md:col-span-2 text-center py-12">
            <p className="text-muted-foreground">
              {filterCategory ? `No brands found in category "${filterCategory}"` : 'No brands found'}
            </p>
          </div>
        )}
      </div>

      {/* Import Progress Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importing Brands</DialogTitle>
            <DialogDescription>
              Please wait while brands are being imported...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {importProgress.current} / {importProgress.total}
                </span>
              </div>
              <Progress 
                value={importProgress.current} 
                max={importProgress.total}
                className="h-2"
              />
            </div>
            {importProgress.total > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {Math.round((importProgress.current / importProgress.total) * 100)}% complete
              </p>
            )}
            {!importing && importProgress.current === importProgress.total && (
              <p className="text-sm text-center text-green-600 dark:text-green-400">
                Import completed!
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories Management Dialog */}
      <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Edit or delete categories. Note: You cannot delete a category that is still in use by brands.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No categories found</p>
            ) : (
              <div className="space-y-2">
                {categories.map(category => {
                  const brandCount = brands.filter(b => b.category === category).length
                  const isEditing = editingCategory === category
                  
                  return (
                    <div key={category} className="flex items-center gap-2 p-3 border rounded-lg">
                      {isEditing ? (
                        <>
                          <Input
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateCategory(category, newCategoryName)
                              } else if (e.key === 'Escape') {
                                setEditingCategory(null)
                                setNewCategoryName('')
                              }
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => updateCategory(category, newCategoryName)}
                            disabled={!newCategoryName.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(null)
                              setNewCategoryName('')
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-medium">{category}</p>
                            <p className="text-xs text-muted-foreground">{brandCount} brand{brandCount !== 1 ? 's' : ''}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(category)
                              setNewCategoryName(category)
                            }}
                            aria-label={`Edit category ${category}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCategory(category)}
                            disabled={brandCount > 0}
                            aria-label={`Delete category ${category}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories Management Dialog */}
      <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Edit or delete categories. Note: You cannot delete a category that is still in use by brands.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No categories found</p>
            ) : (
              <div className="space-y-2">
                {categories.map(category => {
                  const brandCount = brands.filter(b => b.category === category).length
                  const isEditing = editingCategory === category
                  
                  return (
                    <div key={category} className="flex items-center gap-2 p-3 border rounded-lg">
                      {isEditing ? (
                        <>
                          <Input
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                updateCategory(category, newCategoryName)
                              } else if (e.key === 'Escape') {
                                setEditingCategory(null)
                                setNewCategoryName('')
                              }
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => updateCategory(category, newCategoryName)}
                            disabled={!newCategoryName.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(null)
                              setNewCategoryName('')
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-medium">{category}</p>
                            <p className="text-xs text-muted-foreground">{brandCount} brand{brandCount !== 1 ? 's' : ''}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(category)
                              setNewCategoryName(category)
                            }}
                            aria-label={`Edit category ${category}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCategory(category)}
                            disabled={brandCount > 0}
                            aria-label={`Delete category ${category}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Category Dialog */}
      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit Category</DialogTitle>
            <DialogDescription>
              Update category for {selectedBrands.size} selected brand(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">New Category</label>
              <Select value={bulkEditCategory} onValueChange={setBulkEditCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or enter category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="mt-2"
                placeholder="Or enter new category name"
                value={bulkEditCategory}
                onChange={e => setBulkEditCategory(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowBulkEditDialog(false)
                setBulkEditCategory('')
              }}>
                Cancel
              </Button>
              <Button onClick={bulkUpdateCategory} disabled={!bulkEditCategory.trim()}>
                Update {selectedBrands.size} Brand(s)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
