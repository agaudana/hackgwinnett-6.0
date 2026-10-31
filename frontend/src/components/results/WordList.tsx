import { ChevronRight, Languages } from 'lucide-react'
import type { MedicalTerm } from '../../lib/types'

export function WordList({ terms, onTerm }: { terms: MedicalTerm[]; onTerm: (term: MedicalTerm) => void }) {
  if (terms.length === 0) return null
  return (
    <section aria-labelledby="words-title" className="animate-rise flex flex-col gap-4 rounded-2xl border-2 border-border bg-surface p-5" style={{ animationDelay: '160ms' }}>
      <div className="flex flex-col gap-1">
        <h2 id="words-title" className="flex items-center gap-3 text-xl font-bold">
          <Languages className="size-6 text-primary" aria-hidden="true" />
          Hard words
        </h2>
        <p className="text-base text-muted-foreground">Tap a word to learn what it means.</p>
      </div>
      <ul className="flex flex-col gap-2">
        {terms.map((term) => (
          <li key={term.term}>
            <button
              type="button"
              onClick={() => onTerm(term)}
              className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border-2 border-border bg-background px-4 py-2 text-left transition-colors hover:border-primary"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-lg font-bold">{term.term}</span>
                <span className="text-sm capitalize text-muted-foreground">{term.category}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-primary" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
