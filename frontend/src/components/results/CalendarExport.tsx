import { useMemo } from 'react'
import { CalendarPlus } from 'lucide-react'
import { buildIcs, describeEvents, downloadIcs, toCalendarEvents } from '../../lib/calendar'
import type { KeyAction } from '../../lib/types'

export function CalendarExport({ actions }: { actions: KeyAction[] }) {
  const events = useMemo(() => toCalendarEvents(actions), [actions])
  if (events.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => downloadIcs(buildIcs(events))}
        aria-describedby="calendar-export-hint"
        className="flex min-h-14 items-center gap-2 rounded-xl border-2 border-border bg-surface px-6 text-lg font-bold hover:border-primary"
      >
        <CalendarPlus className="size-5" aria-hidden="true" />
        Add to my calendar
      </button>
      <p id="calendar-export-hint" className="sr-only">
        {describeEvents(events)}
      </p>
    </>
  )
}
