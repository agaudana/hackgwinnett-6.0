import { useCallback, useEffect, useState } from 'react'

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined

export function useSpeech() {
  const [speakingId, setSpeakingId] = useState(null)

  const stop = useCallback(() => {
    synth?.cancel()
    setSpeakingId(null)
  }, [])

  const speak = useCallback((id, text) => {
    if (!synth) return
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.onend = () => setSpeakingId((current) => (current === id ? null : current))
    utterance.onerror = utterance.onend
    setSpeakingId(id)
    synth.speak(utterance)
  }, [])

  useEffect(() => () => synth?.cancel(), [])

  return { supported: Boolean(synth), speakingId, speak, stop }
}
