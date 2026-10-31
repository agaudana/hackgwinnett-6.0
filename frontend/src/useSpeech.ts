import { useCallback, useEffect, useState } from 'react'

const synth: SpeechSynthesis | undefined = typeof window !== 'undefined' ? window.speechSynthesis : undefined

export interface Speech {
  supported: boolean
  speakingId: string | null
  speak: (id: string, text: string) => void
  stop: () => void
}

export function useSpeech(rate = 0.9): Speech {
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  const stop = useCallback(() => {
    synth?.cancel()
    setSpeakingId(null)
  }, [])

  const speak = useCallback((id: string, text: string) => {
    if (!synth) return
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    const done = () => setSpeakingId((current) => (current === id ? null : current))
    utterance.onend = done
    utterance.onerror = done
    setSpeakingId(id)
    synth.speak(utterance)
  }, [rate])

  useEffect(() => () => synth?.cancel(), [])

  return { supported: Boolean(synth), speakingId, speak, stop }
}
