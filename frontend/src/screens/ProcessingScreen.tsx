import { useEffect, useState } from 'react'
import { Check, FileText } from 'lucide-react'
import type { AnalyzeInput } from '../lib/types'

const DOCUMENT_STEPS = ['Reading your paper', 'Finding hard words', 'Writing simple steps']

export function ProcessingScreen({
  previewUrl,
  input,
  onCancel,
  title = 'Making it simple',
  steps: STEPS = DOCUMENT_STEPS,
}: {
  previewUrl: string | null
  input: AnalyzeInput
  onCancel: () => void
  title?: string
  steps?: string[]
}) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1100)
    return () => clearInterval(timer)
  }, [STEPS.length])

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-10 px-4 py-10 text-center">
      <div className="relative h-64 w-48 overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-lg" aria-hidden="true">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover opacity-80" />
        ) : (
          <div className="flex size-full flex-col gap-3 p-6 text-left">
            <FileText className="size-8 text-primary" />
            <p className="line-clamp-6 text-sm leading-relaxed text-muted-foreground">
              {input.kind === 'text' ? input.text : ''}
            </p>
          </div>
        )}
        <div className="animate-scan absolute inset-x-3 h-1 rounded-full bg-primary shadow-[0_0_16px_4px] shadow-primary/60" />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="reading text-lg text-muted-foreground">This takes a few seconds. You do not need to do anything.</p>
      </div>

      <ol className="flex w-full flex-col gap-3 text-left" aria-label="Progress">
        {STEPS.map((label, index) => {
          const done = index < step
          const current = index === step
          return (
            <li
              key={label}
              aria-current={current ? 'step' : undefined}
              className={`flex min-h-14 items-center gap-4 rounded-xl border-2 px-4 py-3 transition-colors ${
                current ? 'border-primary bg-surface' : 'border-border bg-surface/60'
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  done ? 'bg-routine text-primary-foreground' : current ? 'bg-primary text-primary-foreground' : 'bg-surface-muted'
                }`}
              >
                {done ? (
                  <Check className="size-5" aria-hidden="true" />
                ) : current ? (
                  <span className="animate-pulse-dot size-3 rounded-full bg-primary-foreground" aria-hidden="true" />
                ) : null}
              </span>
              <span className={`text-lg ${current ? 'font-bold' : done ? '' : 'text-muted-foreground'}`}>{label}</span>
              <span className="sr-only">{done ? '(done)' : current ? '(working now)' : '(waiting)'}</span>
            </li>
          )
        })}
      </ol>

      <p className="sr-only" aria-live="polite">
        {STEPS[step]}
      </p>

      <button
        type="button"
        onClick={onCancel}
        className="min-h-12 rounded-xl border-2 border-border bg-surface px-6 font-bold hover:border-primary"
      >
        Cancel
      </button>
    </div>
  )
}
