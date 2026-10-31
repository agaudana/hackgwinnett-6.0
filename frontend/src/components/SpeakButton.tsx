import { Square, Volume2 } from 'lucide-react'
import { useSpeech } from '../lib/speech'

export function SpeakButton({
  id,
  text,
  label,
  variant = 'icon',
}: {
  id: string
  text: string
  label: string
  variant?: 'icon' | 'primary'
}) {
  const { supported, activeId, toggle } = useSpeech()
  if (!supported) return null
  const speaking = activeId === id
  const Icon = speaking ? Square : Volume2

  if (variant === 'primary') {
    return (
      <button
        type="button"
        onClick={() => toggle(id, text)}
        aria-pressed={speaking}
        className="flex min-h-14 items-center justify-center gap-3 rounded-xl bg-primary px-6 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary-strong"
      >
        <Icon className="size-6" aria-hidden="true" />
        <span>{speaking ? 'Stop reading' : label}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => toggle(id, text)}
      aria-pressed={speaking}
      className={`flex size-12 shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
        speaking ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface text-primary hover:border-primary'
      }`}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span className="sr-only">{speaking ? 'Stop reading' : label}</span>
    </button>
  )
}
