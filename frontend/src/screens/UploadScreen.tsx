import { useRef, useState, type DragEvent } from 'react'
import { Camera, ChevronRight, CircleAlert, FileText, Keyboard, Lightbulb, Pill, Sun, Upload, Volume2 } from 'lucide-react'
import { validateImage } from '../lib/api'
import { SAMPLE_DOCUMENT_TEXT } from '../lib/mock'
import type { AnalyzeInput } from '../lib/types'

const TIPS = [
  { icon: Sun, text: 'Use bright light with no shadows.' },
  { icon: FileText, text: 'Lay the paper flat and fit it all in.' },
  { icon: Volume2, text: 'You can listen to every answer.' },
]

export function UploadScreen({
  onAnalyze,
  onIdentifyPill,
}: {
  onAnalyze: (input: AnalyzeInput) => void
  onIdentifyPill: (file: File) => void
}) {
  const cameraInput = useRef<HTMLInputElement>(null)
  const pillInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [typing, setTyping] = useState(false)
  const [text, setText] = useState('')

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const invalid = validateImage(file)
    if (invalid) {
      setError(invalid.message)
      return
    }
    setError(null)
    onAnalyze({ kind: 'image', file })
  }

  const handlePill = (file: File | undefined) => {
    if (!file) return
    const invalid = validateImage(file)
    if (invalid) {
      setError(invalid.message)
      return
    }
    setError(null)
    onIdentifyPill(file)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 md:px-8 md:py-14">
      <section className="flex flex-col gap-4 text-center md:items-center">
        <h1 className="text-4xl font-bold md:text-5xl">Your medical papers, made simple</h1>
        <p className="reading mx-auto max-w-[36rem] text-xl text-muted-foreground text-pretty">
          Take a photo of a doctor&apos;s note or hospital paper. We will turn it into clear steps you can read or hear.
        </p>
      </section>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col gap-4 rounded-3xl border-4 border-dashed p-4 transition-colors md:p-6 ${
          dragging ? 'border-primary bg-surface' : 'border-transparent'
        }`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => cameraInput.current?.click()}
            className="lift on-brand flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl bg-primary p-8 text-primary-foreground hover:bg-primary-strong"
          >
            <span className="flex size-20 items-center justify-center rounded-full bg-primary-foreground/15">
              <Camera className="size-10" aria-hidden="true" />
            </span>
            <span className="text-2xl font-bold">Take a photo</span>
            <span className="text-base opacity-90">Use your camera</span>
          </button>

          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="lift flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-border bg-surface p-8 text-foreground hover:border-primary"
          >
            <span className="flex size-20 items-center justify-center rounded-full bg-surface-muted text-primary">
              <Upload className="size-10" aria-hidden="true" />
            </span>
            <span className="text-2xl font-bold">Choose a picture</span>
            <span className="text-base text-muted-foreground">JPEG or PNG, up to 10MB. You can also drop it here.</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => pillInput.current?.click()}
          className="lift flex min-h-24 items-center gap-5 rounded-2xl border-2 border-border bg-surface p-5 text-left text-foreground hover:border-primary md:p-6"
        >
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-surface-muted text-primary">
            <Pill className="size-8" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-2xl font-bold">What is this pill?</span>
            <span className="text-base text-muted-foreground">Take a photo of a pill or a medicine bottle. We will tell you what it is.</span>
          </span>
          <ChevronRight className="size-8 shrink-0 text-primary" aria-hidden="true" />
        </button>

        <input
          ref={pillInput}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            handlePill(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <input
          ref={cameraInput}
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            handleFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            handleFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />

        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border-2 border-critical bg-critical-soft p-4 text-foreground">
            <CircleAlert className="mt-0.5 size-6 shrink-0 text-critical" aria-hidden="true" />
            <p className="reading">{error}</p>
          </div>
        )}

        {typing ? (
          <form
            className="flex flex-col gap-3 rounded-2xl border-2 border-border bg-surface p-5"
            onSubmit={(event) => {
              event.preventDefault()
              if (text.trim()) onAnalyze({ kind: 'text', text })
            }}
          >
            <label htmlFor="paper-text" className="text-lg font-bold">
              Type or paste the words from your paper
            </label>
            <textarea
              id="paper-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={5}
              placeholder="For example: Take 500mg PO BID with food..."
              className="reading w-full resize-y rounded-xl border-2 border-border bg-background p-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!text.trim()}
                className="min-h-12 rounded-xl bg-primary px-6 font-bold text-primary-foreground hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                Make it simple
              </button>
              <button
                type="button"
                onClick={() => setText(SAMPLE_DOCUMENT_TEXT)}
                className="min-h-12 rounded-xl border-2 border-border px-5 font-bold hover:border-primary"
              >
                Fill in an example
              </button>
              <button
                type="button"
                onClick={() => setTyping(false)}
                className="min-h-12 rounded-xl px-4 font-bold text-muted-foreground underline underline-offset-4"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <button
              type="button"
              onClick={() => setTyping(true)}
              className="flex min-h-12 items-center gap-2 rounded-xl px-3 font-bold text-primary-strong underline underline-offset-4"
            >
              <Keyboard className="size-5" aria-hidden="true" />
              Type the words instead
            </button>
            <button
              type="button"
              onClick={() => onAnalyze({ kind: 'text', text: SAMPLE_DOCUMENT_TEXT })}
              className="flex min-h-12 items-center gap-2 rounded-xl px-3 font-bold text-primary-strong underline underline-offset-4"
            >
              <FileText className="size-5" aria-hidden="true" />
              Try an example paper
            </button>
          </div>
        )}
      </div>

      <section aria-labelledby="tips-title" className="flex flex-col gap-4">
        <h2 id="tips-title" className="flex items-center gap-2 text-xl font-bold">
          <Lightbulb className="size-6 text-primary" aria-hidden="true" />
          Tips for a good photo
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {TIPS.map(({ icon: Icon, text: tip }) => (
            <li key={tip} className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface p-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span className="reading">{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="reading text-center text-base text-muted-foreground">
        HealthLens helps you understand your papers. It does not replace your doctor. If you are unsure, ask them.
      </p>
    </div>
  )
}
