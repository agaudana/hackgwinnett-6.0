import { type Ref, type ReactNode, useId } from 'react'
import { X } from 'lucide-react'
import { usePreferences, type Preferences } from '../lib/preferences'

interface Option<T> {
  value: T
  label: string
  preview?: ReactNode
}

function Choice<T extends string | number>({
  legend,
  hint,
  options,
  value,
  onChange,
}: {
  legend: string
  hint: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}) {
  const name = useId()
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-lg font-bold">{legend}</legend>
      <p className="-mt-1 text-base text-muted-foreground">{hint}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <label
            key={String(option.value)}
            className="flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-border bg-surface px-2 py-2 text-center font-bold transition-colors hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.preview}
            <span className="text-base">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function ReadingSettings({ ref }: { ref: Ref<HTMLDialogElement> }) {
  const { prefs, update, reset } = usePreferences()
  const set =
    <K extends keyof Preferences>(key: K) =>
    (value: Preferences[K]) =>
      update({ [key]: value } as Partial<Preferences>)

  const close = (event: React.MouseEvent<HTMLElement>) => event.currentTarget.closest('dialog')?.close()

  return (
    <dialog
      ref={ref}
      aria-labelledby="reading-settings-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border-2 border-border bg-background p-0 text-foreground shadow-2xl"
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="reading-settings-title" className="text-2xl font-bold">
              Reading settings
            </h2>
            <p className="mt-1 text-base text-muted-foreground">Make the words easier for you to read.</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-border bg-surface hover:border-primary"
          >
            <X className="size-6" aria-hidden="true" />
            <span className="sr-only">Close reading settings</span>
          </button>
        </div>

        <Choice
          legend="Text size"
          hint="Bigger words can be easier to follow."
          value={prefs.textSize}
          onChange={set('textSize')}
          options={[
            { value: 'md', label: 'Normal', preview: <span className="text-lg leading-none">Aa</span> },
            { value: 'lg', label: 'Large', preview: <span className="text-2xl leading-none">Aa</span> },
            { value: 'xl', label: 'Largest', preview: <span className="text-3xl leading-none">Aa</span> },
          ]}
        />

        <Choice
          legend="Space between letters"
          hint="More space can stop letters from mixing up."
          value={prefs.spacing}
          onChange={set('spacing')}
          options={[
            { value: 'normal', label: 'Normal', preview: <span className="leading-none">abc</span> },
            { value: 'wide', label: 'Wide', preview: <span className="leading-none tracking-[0.2em]">abc</span> },
          ]}
        />

        <Choice
          legend="Colors"
          hint="A softer page can reduce glare."
          value={prefs.theme}
          onChange={set('theme')}
          options={[
            {
              value: 'cool',
              label: 'Cool',
              preview: <span className="size-5 rounded-full border border-black/10" style={{ background: '#ECFEFF' }} />,
            },
            {
              value: 'warm',
              label: 'Warm',
              preview: <span className="size-5 rounded-full border border-black/10" style={{ background: '#F7F2E7' }} />,
            },
            {
              value: 'dark',
              label: 'Dark',
              preview: <span className="size-5 rounded-full border border-white/20" style={{ background: '#0C1D24' }} />,
            },
          ]}
        />

        <Choice
          legend="Reading voice speed"
          hint="How fast words are read out loud."
          value={prefs.speechRate}
          onChange={set('speechRate')}
          options={[
            { value: 0.75, label: 'Slow' },
            { value: 1, label: 'Normal' },
          ]}
        />

        <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border-2 border-border bg-surface px-4 py-3">
          <span>
            <span className="block text-lg font-bold">Reading guide</span>
            <span className="block text-base text-muted-foreground">A light band follows your pointer to keep your place.</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={prefs.ruler}
            onChange={(event) => update({ ruler: event.target.checked })}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-8 w-14 shrink-0 rounded-full bg-surface-muted transition-colors after:absolute after:left-1 after:top-1 after:size-6 after:rounded-full after:bg-surface after:shadow after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-6 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
          />
        </label>

        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" onClick={reset} className="min-h-12 rounded-xl px-4 font-bold text-primary-strong underline underline-offset-4">
            Reset to default
          </button>
          <button
            type="button"
            onClick={close}
            className="min-h-12 rounded-xl bg-primary px-6 font-bold text-primary-foreground hover:bg-primary-strong"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  )
}
