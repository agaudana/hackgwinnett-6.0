import { useMemo } from 'react'
import { BookOpen, Volume1 } from 'lucide-react'
import { useSpeech } from '../../lib/speech'
import { buildReadAloudScript, segmentWithTerms, splitSentences } from '../../lib/text'
import type { MedicalTerm } from '../../lib/types'
import { SpeakButton } from '../SpeakButton'

const SUMMARY_ID = 'summary'

export function SummaryCard({
  text,
  terms,
  onTerm,
}: {
  text: string
  terms: MedicalTerm[]
  onTerm: (term: MedicalTerm) => void
}) {
  const { activeId, charIndex, speak } = useSpeech()
  const sentences = useMemo(() => splitSentences(text), [text])
  const { script, ranges } = useMemo(
    () => buildReadAloudScript(sentences.map((s, i) => ({ id: `${SUMMARY_ID}-${i}`, text: s }))),
    [sentences],
  )

  const readingAll = activeId === SUMMARY_ID
  const activeSentence = readingAll
    ? ranges.findIndex((r) => charIndex >= r.start && charIndex <= r.end)
    : sentences.findIndex((_, i) => activeId === `${SUMMARY_ID}-${i}`)

  return (
    <section aria-labelledby="summary-title" className="animate-rise flex flex-col gap-5 rounded-2xl border-2 border-border bg-surface p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="summary-title" className="flex items-center gap-3 text-2xl font-bold">
          <span className="flex size-11 items-center justify-center rounded-xl bg-surface-muted text-primary">
            <BookOpen className="size-6" aria-hidden="true" />
          </span>
          In plain words
        </h2>
        <SpeakButton id={SUMMARY_ID} text={script} label="Read it to me" variant="primary" />
      </div>

      <div className="reading flex max-w-[65ch] flex-col gap-3 text-xl">
        {sentences.map((sentence, index) => {
          const active = index === activeSentence
          return (
            <p
              key={index}
              className={`-mx-2 rounded-lg px-2 py-1 transition-colors ${active ? 'bg-highlight text-on-highlight' : ''}`}
            >
              {segmentWithTerms(sentence, terms).map((segment, i) =>
                segment.type === 'text' ? (
                  <span key={i}>{segment.value}</span>
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onTerm(segment.term)}
                    className="rounded font-bold text-primary-strong underline decoration-2 decoration-dotted underline-offset-[6px] hover:decoration-solid"
                    aria-label={`${segment.value}, tap to hear what this word means`}
                  >
                    {segment.value}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => speak(`${SUMMARY_ID}-${index}`, sentence)}
                className="ml-2 inline-flex size-8 translate-y-1 items-center justify-center rounded-md align-baseline text-muted-foreground hover:bg-surface-muted hover:text-primary"
              >
                <Volume1 className="size-4" aria-hidden="true" />
                <span className="sr-only">Read this sentence</span>
              </button>
            </p>
          )
        })}
      </div>

      {terms.length > 0 && (
        <p className="text-base text-muted-foreground">
          Tap any <span className="font-bold text-primary-strong underline decoration-dotted underline-offset-4">underlined word</span> to see what it means.
        </p>
      )}
    </section>
  )
}
