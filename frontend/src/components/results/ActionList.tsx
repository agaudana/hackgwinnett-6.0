import { useMemo, useState } from 'react'
import {
  CalendarCheck,
  Check,
  ClipboardCheck,
  HeartPulse,
  Pill,
  Siren,
  Stethoscope,
  Thermometer,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  type LucideIcon,
} from 'lucide-react'
import { PRIORITY_LABEL, sortByPriority } from '../../lib/text'
import type { KeyAction, Priority } from '../../lib/types'
import { SpeakButton } from '../SpeakButton'

const ICONS: Record<string, LucideIcon> = {
  medication: Pill,
  medicine: Pill,
  pill: Pill,
  thermometer: Thermometer,
  fever: Thermometer,
  emergency: Siren,
  calendar: CalendarCheck,
  appointment: CalendarCheck,
  doctor: Stethoscope,
  heart: HeartPulse,
}

const PRIORITY_STYLE: Record<Priority, { card: string; badge: string; icon: LucideIcon }> = {
  critical: { card: 'border-critical bg-critical-soft', badge: 'bg-critical text-primary-foreground', icon: TriangleAlert },
  important: { card: 'border-important bg-important-soft', badge: 'bg-important text-primary-foreground', icon: CircleAlert },
  normal: { card: 'border-routine bg-routine-soft', badge: 'bg-routine text-primary-foreground', icon: CircleCheck },
}

export function ActionList({ actions }: { actions: KeyAction[] }) {
  const sorted = useMemo(() => sortByPriority(actions), [actions])
  const [done, setDone] = useState<Set<number>>(new Set())

  const toggle = (index: number) =>
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  if (actions.length === 0) return null

  return (
    <section aria-labelledby="actions-title" className="animate-rise flex flex-col gap-4" style={{ animationDelay: '80ms' }}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="actions-title" className="flex items-center gap-3 text-2xl font-bold">
          <span className="flex size-11 items-center justify-center rounded-xl bg-surface-muted text-primary">
            <ClipboardCheck className="size-6" aria-hidden="true" />
          </span>
          What you need to do
        </h2>
        <p className="text-base text-muted-foreground" aria-live="polite">
          {done.size} of {actions.length} done
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {sorted.map(({ action, index }) => {
          const style = PRIORITY_STYLE[action.priority] ?? PRIORITY_STYLE.normal
          const Icon = ICONS[action.icon?.toLowerCase()] ?? ClipboardCheck
          const BadgeIcon = style.icon
          const checked = done.has(index)
          const checkboxId = `action-${index}`
          return (
            <li
              key={index}
              className={`flex items-start gap-4 rounded-2xl border-2 p-4 transition-opacity md:p-5 ${style.card} ${checked ? 'opacity-60' : ''}`}
            >
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-surface text-foreground sm:flex">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${style.badge}`}>
                  <BadgeIcon className="size-4" aria-hidden="true" />
                  {PRIORITY_LABEL[action.priority] ?? 'Routine'}
                </span>
                <label htmlFor={checkboxId} className={`reading cursor-pointer text-lg ${checked ? 'line-through' : ''}`}>
                  {action.action}
                </label>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <SpeakButton id={`action-speak-${index}`} text={action.action} label="Read this step" />
                <input id={checkboxId} type="checkbox" checked={checked} onChange={() => toggle(index)} className="peer sr-only" />
                <label
                  htmlFor={checkboxId}
                  className={`flex size-12 cursor-pointer items-center justify-center rounded-xl border-2 transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                    checked ? 'border-routine bg-routine text-primary-foreground' : 'border-border bg-surface text-transparent hover:border-routine'
                  }`}
                >
                  <Check className="size-6" aria-hidden="true" />
                  <span className="sr-only">Mark as done</span>
                </label>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
