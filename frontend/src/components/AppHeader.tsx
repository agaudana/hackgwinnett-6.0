import { useRef } from 'react'
import { Settings2 } from 'lucide-react'
import { usePreferences } from '../lib/preferences'
import { ReadingSettings } from './ReadingSettings'

export function AppHeader({ onHome }: { onHome?: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { prefs } = usePreferences()
  const logo = prefs.theme === 'dark' ? '/logo/logo-horizontal-dark.svg' : '/logo/logo-horizontal.svg'

  const brand = <img src={logo} alt="HealthLens" className="h-10 w-auto md:h-12" />

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        {onHome ? (
          <button type="button" onClick={onHome} className="rounded-xl" aria-label="HealthLens, go back to start">
            {brand}
          </button>
        ) : (
          brand
        )}
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-border bg-surface px-4 font-bold text-foreground transition-colors hover:border-primary"
        >
          <Settings2 className="size-5 text-primary" aria-hidden="true" />
          <span>Reading settings</span>
        </button>
      </div>
      <ReadingSettings ref={dialogRef} />
    </header>
  )
}
