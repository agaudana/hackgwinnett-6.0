import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useSpeech } from '../../lib/speech'
import type { MedicalTerm } from '../../lib/types'
import { SpeakButton } from '../SpeakButton'

/** Definitions always open in the same place (a bottom sheet) so the reader never has to hunt for them. */
export function TermSheet({ term, onClose }: { term: MedicalTerm | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const { stop } = useSpeech()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (term && !dialog.open) dialog.showModal()
    if (!term && dialog.open) dialog.close()
  }, [term])

  const spoken = term ? `${term.term}. ${term.definition}` : ''

  return (
    <dialog
      ref={ref}
      aria-labelledby="term-title"
      onClose={() => {
        stop()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
      className="mx-auto mb-0 mt-auto w-full max-w-2xl rounded-t-3xl border-2 border-b-0 border-border bg-background p-0 text-foreground shadow-2xl md:mb-auto md:rounded-3xl md:border-b-2"
    >
      {term && (
        <div className="flex flex-col gap-5 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold uppercase tracking-widest text-primary">{term.category}</span>
              <h2 id="term-title" className="text-3xl font-bold">
                {term.term}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-border bg-surface hover:border-primary"
            >
              <X className="size-6" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <p className="reading text-xl">{term.definition}</p>
          <div className="flex flex-wrap gap-3">
            <SpeakButton id={`term-${term.term}`} text={spoken} label="Read it to me" variant="primary" />
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="min-h-14 rounded-xl border-2 border-border bg-surface px-6 text-lg font-bold hover:border-primary"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
