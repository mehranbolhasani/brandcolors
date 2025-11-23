import { ColorFormat, LayoutMode } from './types'
import { useSyncExternalStore } from 'react'

type PreferencesState = {
  colorFormat: ColorFormat
  favorites: string[]
  layout: LayoutMode
}

const STORAGE_KEYS = {
  FAVORITES: 'brandcolors_favorites',
  COLOR_FORMAT: 'brandcolors_color_format',
  LAYOUT: 'brandcolors_layout',
} as const

const listeners = new Set<() => void>()

function readInitialState(): PreferencesState {
  if (typeof window === 'undefined') {
    return { colorFormat: 'hex', favorites: [], layout: 'grid' }
  }
  const format = (localStorage.getItem(STORAGE_KEYS.COLOR_FORMAT) as ColorFormat) || 'hex'
  const favoritesRaw = localStorage.getItem(STORAGE_KEYS.FAVORITES)
  const favorites = favoritesRaw ? JSON.parse(favoritesRaw) : []
  const layout = (localStorage.getItem(STORAGE_KEYS.LAYOUT) as LayoutMode) || 'grid'
  return { colorFormat: format, favorites, layout }
}

let state: PreferencesState = readInitialState()
const SERVER_SNAPSHOT: PreferencesState = { colorFormat: 'hex', favorites: [], layout: 'grid' }

function emit() {
  for (const l of listeners) l()
}

export function getPreferences(): PreferencesState {
  return state
}

export function subscribePreferences(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setColorFormatPref(format: ColorFormat) {
  state = { ...state, colorFormat: format }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.COLOR_FORMAT, format)
  }
  emit()
}

export function toggleFavoritePref(brandId: string) {
  const favorites = new Set(state.favorites)
  if (favorites.has(brandId)) favorites.delete(brandId)
  else favorites.add(brandId)
  const updated = Array.from(favorites)
  state = { ...state, favorites: updated }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated))
  }
  emit()
}

export function setLayoutPref(layout: LayoutMode) {
  state = { ...state, layout }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.LAYOUT, layout)
  }
  emit()
}

export function usePreferences() {
  const subscribe = (cb: () => void) => subscribePreferences(cb)
  const getSnapshot = () => getPreferences()
  const getServerSnapshot: () => PreferencesState = () => SERVER_SNAPSHOT
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return {
    ...snapshot,
    setColorFormat: setColorFormatPref,
    toggleFavorite: toggleFavoritePref,
    setLayout: setLayoutPref,
  }
}
