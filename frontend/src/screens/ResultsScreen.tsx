import { useState } from 'react'
import { Camera, Info, Printer } from 'lucide-react'
import { ActionList } from '../components/results/ActionList'
import { OriginalText } from '../components/results/OriginalText'
import { SummaryCard } from '../components/results/SummaryCard'
import { TermSheet } from '../components/results/TermSheet'
import { WordList } from '../components/results/WordList'
import type { AnalysisResult, MedicalTerm } from '../lib/types'

export function ResultsScreen({
  result,
  previewUrl,
  onStartOver,
}: {
  result: AnalysisResult
  previewUrl: string | null
  onStartOver: () => void
}) {
  const { data, source } = result
  const [openTerm, setOpenTerm] = useState<MedicalTerm | null>(null)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <div className="animate-rise flex flex-col gap-2">
        <p className="text-base font-bold uppercase tracking-widest text-primary">Your paper, made simple</p>
        <h1 className="text-3xl font-bold md:text-4xl">Here is what it says</h1>
      </div>

      {source === 'sample' && (
        <div className="flex items-start gap-3 rounded-xl border-2 border-border bg-surface p-4">
          <Info className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
          <p className="reading text-base">
            You are seeing an example. The HealthLens server is not connected yet, so this is not from your paper.
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <SummaryCard text={data.simplifiedText} terms={data.medicalTerms} onTerm={setOpenTerm} />
          <ActionList actions={data.keyActions} />
          <OriginalText text={data.originalText} previewUrl={previewUrl} />
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <WordList terms={data.medicalTerms} onTerm={setOpenTerm} />
        </aside>
      </div>

      <div className="flex flex-wrap justify-center gap-3 border-t-2 border-border pt-8 print:hidden">
        <button
          type="button"
          onClick={onStartOver}
          className="flex min-h-14 items-center gap-2 rounded-xl bg-primary px-6 text-lg font-bold text-primary-foreground hover:bg-primary-strong"
        >
          <Camera className="size-5" aria-hidden="true" />
          Read another paper
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-14 items-center gap-2 rounded-xl border-2 border-border bg-surface px-6 text-lg font-bold hover:border-primary"
        >
          <Printer className="size-5" aria-hidden="true" />
          Print or save
        </button>
      </div>

      <p className="reading text-center text-base text-muted-foreground">
        This is a guide to help you understand. Always follow what your doctor tells you.
      </p>

      <TermSheet term={openTerm} onClose={() => setOpenTerm(null)} />
    </div>
  )
}
