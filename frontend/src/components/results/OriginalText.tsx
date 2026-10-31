import { ChevronDown, FileText } from 'lucide-react'

export function OriginalText({ text, previewUrl }: { text: string; previewUrl: string | null }) {
  if (!text && !previewUrl) return null
  return (
    <details className="group rounded-2xl border-2 border-border bg-surface">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3 text-lg font-bold">
          <FileText className="size-6 text-primary" aria-hidden="true" />
          See the original paper
        </span>
        <ChevronDown className="size-6 text-primary transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="flex flex-col gap-4 px-5 pb-5 md:flex-row">
        {previewUrl && (
          <img src={previewUrl} alt="Your photo of the paper" className="max-h-80 w-full rounded-xl border-2 border-border object-contain md:w-56" />
        )}
        {text && <p className="reading whitespace-pre-line text-base text-muted-foreground">{text}</p>}
      </div>
    </details>
  )
}
