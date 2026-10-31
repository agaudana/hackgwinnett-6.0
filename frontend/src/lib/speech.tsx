import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { usePreferences } from './preferences'

interface SpeechContextValue {
  supported: boolean
  activeId: string | null
  charIndex: number
  speak: (id: string, text: string) => void
  stop: () => void
  toggle: (id: string, text: string) => void
}

const SpeechContext = createContext<SpeechContextValue | null>(null)

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  return (
    english.find((v) => /natural|neural|samantha|google us/i.test(v.name)) ??
    english.find((v) => v.localService) ??
    english[0]
  )
}

export function SpeechProvider({ children }: { children: ReactNode }) {
  const { prefs } = usePreferences()
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [activeId, setActiveId] = useState<string | null>(null)
  const [charIndex, setCharIndex] = useState(0)
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    if (!supported) return
    currentUtterance.current = null
    window.speechSynthesis.cancel()
    setActiveId(null)
    setCharIndex(0)
  }, [supported])

  const speak = useCallback(
    (id: string, text: string) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = prefs.speechRate
      utterance.lang = 'en-US'
      const voice = pickVoice()
      if (voice) utterance.voice = voice
      utterance.onboundary = (event) => {
        if (currentUtterance.current === utterance) setCharIndex(event.charIndex)
      }
      const finish = () => {
        if (currentUtterance.current !== utterance) return
        currentUtterance.current = null
        setActiveId(null)
        setCharIndex(0)
      }
      utterance.onend = finish
      utterance.onerror = finish
      currentUtterance.current = utterance
      setActiveId(id)
      setCharIndex(0)
      window.speechSynthesis.speak(utterance)
    },
    [supported, prefs.speechRate],
  )

  const toggle = useCallback(
    (id: string, text: string) => (activeId === id ? stop() : speak(id, text)),
    [activeId, speak, stop],
  )

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const value = useMemo(
    () => ({ supported, activeId, charIndex, speak, stop, toggle }),
    [supported, activeId, charIndex, speak, stop, toggle],
  )
  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>
}

export function useSpeech() {
  const ctx = useContext(SpeechContext)
  if (!ctx) throw new Error('useSpeech must be used inside SpeechProvider')
  return ctx
}
