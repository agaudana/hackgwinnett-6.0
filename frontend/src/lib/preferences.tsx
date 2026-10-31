import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type TextSize = 'md' | 'lg' | 'xl'
export type Spacing = 'normal' | 'wide'
export type Theme = 'cool' | 'warm' | 'dark'
export type SpeechRate = 0.75 | 1

export interface Preferences {
  textSize: TextSize
  spacing: Spacing
  theme: Theme
  ruler: boolean
  speechRate: SpeechRate
}

const DEFAULTS: Preferences = {
  textSize: 'md',
  spacing: 'normal',
  theme: 'cool',
  ruler: false,
  speechRate: 0.75,
}

const STORAGE_KEY = 'healthlens:reading-preferences'

function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

interface PreferencesContextValue {
  prefs: Preferences
  update: (patch: Partial<Preferences>) => void
  reset: () => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

const THEME_COLORS: Record<Theme, string> = { cool: '#0891B2', warm: '#0E7490', dark: '#0C1D24' }

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = prefs.theme
    root.dataset.size = prefs.textSize
    root.dataset.spacing = prefs.spacing
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[prefs.theme])
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // Storage can be unavailable (private mode); preferences still apply for this session.
    }
  }, [prefs])

  const update = useCallback((patch: Partial<Preferences>) => setPrefs((p) => ({ ...p, ...patch })), [])
  const reset = useCallback(() => setPrefs(DEFAULTS), [])
  const value = useMemo(() => ({ prefs, update, reset }), [prefs, update, reset])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider')
  return ctx
}
