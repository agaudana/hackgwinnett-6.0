import { CircleAlert, RotateCcw } from 'lucide-react'

export function ErrorScreen({
  message,
  onRetry,
  onStartOver,
  startOverLabel = 'Use a different paper',
}: {
  message: string
  onRetry: () => void
  onStartOver: () => void
  startOverLabel?: string
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-critical-soft text-critical">
        <CircleAlert className="size-10" aria-hidden="true" />
      </span>
      <div role="alert" className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">We could not read that</h1>
        <p className="reading text-lg text-muted-foreground">{message}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="flex min-h-14 items-center gap-2 rounded-xl bg-primary px-6 text-lg font-bold text-primary-foreground hover:bg-primary-strong"
        >
          <RotateCcw className="size-5" aria-hidden="true" />
          Try again
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-14 rounded-xl border-2 border-border bg-surface px-6 text-lg font-bold hover:border-primary"
        >
          {startOverLabel}
        </button>
      </div>
    </div>
  )
}
