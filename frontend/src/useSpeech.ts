import { useCallback, useEffect, useState } from 'react'

const synth: SpeechSynthesis | undefined = typeof window !== 'undefined' ? window.speechSynthesis : undefined

export interface Speech {
  supported: boolean
  speakingId: string | null
  speak: (id: string, text: string) => void
  stop: () => void
}

export function useSpeech(): Speech {
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  const stop = useCallback(() => {
    synth?.cancel()
    setSpeakingId(null)
  }, [])

  const speak = useCallback((id: string, text: string) => {
    if (!synth) return
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    const done = () => setSpeakingId((current) => (current === id ? null : current))
    utterance.onend = done
    utterance.onerror = done
    setSpeakingId(id)
    synth.speak(utterance)
  }, [])

  useEffect(() => () => synth?.cancel(), [])

  return { supported: Boolean(synth), speakingId, speak, stop }
}
