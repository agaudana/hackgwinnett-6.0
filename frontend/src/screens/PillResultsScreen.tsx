import { CircleAlert, CircleHelp, ClipboardList, Eye, FileText, Info, Phone, Pill, TriangleAlert } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { SpeakButton } from '../components/SpeakButton'
import type { PillConfidence, PillResult } from '../lib/types'

const CONFIDENCE: Record<PillConfidence, { label: string; badge: string }> = {
  high: { label: 'Read from the label', badge: 'bg-routine text-primary-foreground' },
  medium: { label: 'Possible match. Please check.', badge: 'bg-important text-primary-foreground' },
  low: { label: 'We are not sure', badge: 'bg-critical text-primary-foreground' },
}

const POISON_CONTROL = '1-800-222-1222'

function Section({ icon: Icon, title, children, speak }: {
  icon: typeof Pill
  title: string
  children: ReactNode
  speak?: string
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-border bg-surface p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-xl font-bold">
          <span className="flex size-10 items-center justify-center rounded-xl bg-surface-muted text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          {title}
        </h2>
        {speak && <SpeakButton id={`pill-${title}`} text={speak} label={`Read "${title}"`} />}
      </div>
      {children}
    </section>
  )
}

export function PillResultsScreen({
  result,
  previewUrl,
  onCheckAnother,
  onStartOver,
}: {
  result: PillResult
  previewUrl: string | null
  onCheckAnother: (file: File) => void
  onStartOver: () => void
}) {
  const { data, source } = result
  const fileInput = useRef<HTMLInputElement>(null)
  const confidence = CONFIDENCE[data.confidence] ?? CONFIDENCE.low
  const title = data.identified ? [data.medicationName, data.strength].filter(Boolean).join(', ') : 'We could not tell what this is'

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
      {source === 'sample' && (
        <div className="flex items-start gap-3 rounded-xl border-2 border-border bg-surface p-4">
          <Info className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
          <p className="reading text-base">
            You are seeing an example. The HealthLens server is not connected yet, so this is not from your photo.
          </p>
        </div>
      )}

      <section aria-labelledby="pill-title" className="animate-rise flex flex-col gap-5 rounded-2xl border-2 border-border bg-surface p-5 md:p-8">
        <div className="flex items-start gap-4">
          {previewUrl ? (
            <img src={previewUrl} alt="Your photo" className="size-24 shrink-0 rounded-xl border-2 border-border object-cover" />
          ) : (
            <span className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary">
              <Pill className="size-10" aria-hidden="true" />
            </span>
          )}
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-base font-bold uppercase tracking-widest text-primary">
              {data.identified ? 'This looks like' : 'Pill check'}
            </p>
            <h1 id="pill-title" className="text-3xl font-bold break-words md:text-4xl">{title}</h1>
            <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${confidence.badge}`}>
              {data.confidence === 'high' ? <FileText className="size-4" aria-hidden="true" /> : <CircleHelp className="size-4" aria-hidden="true" />}
              {confidence.label}
            </span>
          </div>
        </div>

        <p className="reading max-w-[65ch] text-xl">{data.summary}</p>
        <div>
          <SpeakButton id="pill-summary" text={`${title}. ${data.summary}`} label="Read it to me" variant="primary" />
        </div>
      </section>

      <div role="note" className="flex items-start gap-3 rounded-2xl border-2 border-important bg-important-soft p-5">
        <TriangleAlert className="mt-0.5 size-7 shrink-0 text-important" aria-hidden="true" />
        <div className="reading flex flex-col gap-2 text-lg">
          <p className="font-bold">Always check with your pharmacist before you take a pill.</p>
          <p>
            If someone swallowed a pill by mistake, call Poison Control:{' '}
            <a href={`tel:${POISON_CONTROL}`} className="inline-flex items-center gap-1 font-bold text-primary-strong underline underline-offset-4">
              <Phone className="size-4" aria-hidden="true" />
              {POISON_CONTROL}
            </a>
          </p>
        </div>
      </div>

      {data.purpose && (
        <Section icon={Pill} title="What it is for" speak={data.purpose}>
          <p className="reading text-lg">{data.purpose}</p>
        </Section>
      )}

      {data.howToTake && (
        <Section icon={ClipboardList} title="How to take it" speak={data.howToTake}>
          <p className="reading text-lg">{data.howToTake}</p>
          <p className="text-base text-muted-foreground">From the label on your bottle.</p>
        </Section>
      )}

      {data.warnings.length > 0 && (
        <Section icon={CircleAlert} title="Be careful" speak={data.warnings.join(' ')}>
          <ul className="flex flex-col gap-2">
            {data.warnings.map((warning) => (
              <li key={warning} className="reading flex items-start gap-3 text-lg">
                <CircleAlert className="mt-1 size-5 shrink-0 text-important" aria-hidden="true" />
                {warning}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(data.appearance || data.imprint) && (
        <Section icon={Eye} title="What we see" speak={[data.appearance, data.imprint && `The pill says ${data.imprint}.`].filter(Boolean).join(' ')}>
          {data.appearance && <p className="reading text-lg">{data.appearance}</p>}
          {data.imprint && (
            <p className="reading text-lg">
              Letters or numbers on the pill: <span className="rounded-md bg-surface-muted px-2 py-0.5 font-mono font-bold">{data.imprint}</span>
            </p>
          )}
        </Section>
      )}

      {!data.identified && (
        <Section icon={CircleHelp} title="Try this">
          <ul className="reading flex list-disc flex-col gap-2 pl-6 text-lg">
            <li>Take a photo of the bottle label if you have it.</li>
            <li>Use bright light. Get close so the letters on the pill are clear.</li>
            <li>Bring the pill to your pharmacist. They can tell you what it is.</li>
          </ul>
        </Section>
      )}

      <div className="flex flex-wrap justify-center gap-3 border-t-2 border-border pt-8 print:hidden">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex min-h-14 items-center gap-2 rounded-xl bg-primary px-6 text-lg font-bold text-primary-foreground hover:bg-primary-strong"
        >
          <Pill className="size-5" aria-hidden="true" />
          Check another pill
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="flex min-h-14 items-center gap-2 rounded-xl border-2 border-border bg-surface px-6 text-lg font-bold hover:border-primary"
        >
          <FileText className="size-5" aria-hidden="true" />
          Read a paper instead
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) onCheckAnother(file)
          }}
        />
      </div>

      <p className="reading text-center text-base text-muted-foreground">
        HealthLens can make mistakes. It does not replace your pharmacist or doctor.
      </p>
    </div>
  )
}
