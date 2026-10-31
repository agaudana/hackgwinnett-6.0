import { useCallback, useEffect, useState } from 'react'
import type { Preferences } from './types'

export const DEFAULT_PREFERENCES: Preferences = {
  textSize: 'md',
  font: 'default',
  spacing: 'normal',
  theme: 'yellow',
  ruler: false,
  speechRate: 0.9,
}

const STORAGE_KEY = 'healthlens:reading-preferences'
const THEME_COLORS: Record<Preferences['theme'], string> = { yellow: '#fff7d1', white: '#ffffff', dark: '#141414' }

function load(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(load)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = prefs.theme
    root.dataset.size = prefs.textSize
    root.dataset.spacing = prefs.spacing
    root.dataset.font = prefs.font
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[prefs.theme])
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // Private browsing can block storage. Settings still apply until the page closes.
    }
  }, [prefs])

  const update = useCallback((patch: Partial<Preferences>) => setPrefs((p) => ({ ...p, ...patch })), [])
  const reset = useCallback(() => setPrefs(DEFAULT_PREFERENCES), [])
  return { prefs, update, reset }
}
