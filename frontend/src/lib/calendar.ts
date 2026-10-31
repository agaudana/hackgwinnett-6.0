import type { KeyAction } from './types'

// Builds a .ics file from keyActions. The contract has no dates, so timing is read from the action text.

export type CalendarEvent =
  | { kind: 'followup'; title: string; date: Date }
  | { kind: 'medication'; title: string; start: Date; days: number }

const DOSE_NOTE = "Times are suggestions. Follow your doctor's instructions."
const DEFAULT_MED_DAYS = 7

const DOSE_HOURS: Record<number, number[]> = {
  1: [9],
  2: [9, 21],
  3: [9, 14, 21],
  4: [8, 12, 16, 20],
}

const UNIT_DAYS: Record<string, number> = { day: 1, week: 7, month: 30 }

function dosesPerDay(text: string): number[] | null {
  const t = text.toLowerCase()
  const everyHours = t.match(/every\s+(\d+)\s*(?:hours?|hrs?)/)
  if (everyHours) {
    const step = Number(everyHours[1])
    if (step < 1 || step > 24) return null
    return Array.from({ length: Math.floor(24 / step) }, (_, i) => 8 + i * step).filter((h) => h < 24)
  }
  if (/\b(four times|4 times|qid)\b/.test(t)) return DOSE_HOURS[4]
  if (/\b(three times|3 times|tid)\b/.test(t)) return DOSE_HOURS[3]
  if (/\b(twice|two times|2 times|bid)\b/.test(t)) return DOSE_HOURS[2]
  if (/\b(once (a|per) day|once daily|every day|every morning|daily|qd)\b/.test(t)) return DOSE_HOURS[1]
  return null
}

function durationDays(text: string): number {
  const match = text.toLowerCase().match(/for\s+(\d+)\s*(day|week|month)s?/)
  return match ? Number(match[1]) * UNIT_DAYS[match[2]] : DEFAULT_MED_DAYS
}

/** "in 7-10 days" / "within 2 weeks" -> 7 / 14 (earliest day of a range). */
function followUpOffsetDays(text: string): number | null {
  const match = text.toLowerCase().match(/(?:in|within)\s+(\d+)(?:\s*(?:-|–|to)\s*\d+)?\s*(day|week|month)s?/)
  return match ? Number(match[1]) * UNIT_DAYS[match[2]] : null
}

function atHour(base: Date, hour: number) {
  const d = new Date(base)
  d.setHours(hour, 0, 0, 0)
  return d
}

export function toCalendarEvents(actions: KeyAction[], now = new Date()): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (const { action } of actions) {
    const hours = dosesPerDay(action)
    if (hours) {
      const days = durationDays(action)
      for (const hour of hours) events.push({ kind: 'medication', title: action, start: atHour(now, hour), days })
      continue
    }
    const offset = followUpOffsetDays(action)
    if (offset !== null) {
      const date = atHour(now, 0)
      date.setDate(date.getDate() + offset)
      events.push({ kind: 'followup', title: action, date })
    }
  }
  return events
}

/** e.g. "Adds medicine reminders and 1 follow-up visit." */
export function describeEvents(events: CalendarEvent[]): string {
  const meds = events.some((e) => e.kind === 'medication')
  const visits = events.filter((e) => e.kind === 'followup').length
  const parts = [meds && 'medicine reminders', visits > 0 && `${visits} follow-up ${visits === 1 ? 'visit' : 'visits'}`].filter(Boolean)
  return `Adds ${parts.join(' and ')} to your calendar.`
}

// --- RFC 5545 -------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0')
const formatDate = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
const formatLocal = (d: Date) => `${formatDate(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`
const formatUtc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function escapeText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Folds lines longer than 75 octets without splitting multi-byte characters. */
function fold(line: string) {
  const encoder = new TextEncoder()
  const out: string[] = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    const limit = out.length === 0 ? 75 : 74 // continuation lines start with a space
    if (bytes + size > limit) {
      out.push(current)
      current = ''
      bytes = 0
    }
    current += char
    bytes += size
  }
  out.push(current)
  return out.join('\r\n ')
}

export function buildIcs(events: CalendarEvent[], now = new Date()): string {
  const stamp = formatUtc(now)
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HealthLens//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']

  events.forEach((event, index) => {
    lines.push('BEGIN:VEVENT', `UID:${index}-${now.getTime()}@healthlens`, `DTSTAMP:${stamp}`)
    if (event.kind === 'followup') {
      const end = new Date(event.date)
      end.setDate(end.getDate() + 1)
      lines.push(
        `DTSTART;VALUE=DATE:${formatDate(event.date)}`,
        `DTEND;VALUE=DATE:${formatDate(end)}`,
        `SUMMARY:${escapeText(event.title)}`,
        `DESCRIPTION:${escapeText('From your HealthLens summary. Call your doctor to book this visit.')}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeText(event.title)}`,
        'TRIGGER:-PT15H', // 9:00 the day before
        'END:VALARM',
      )
    } else {
      const end = new Date(event.start.getTime() + 15 * 60 * 1000)
      lines.push(
        `DTSTART:${formatLocal(event.start)}`,
        `DTEND:${formatLocal(end)}`,
        `RRULE:FREQ=DAILY;COUNT=${event.days}`,
        `SUMMARY:${escapeText(event.title)}`,
        `DESCRIPTION:${escapeText(DOSE_NOTE)}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeText(event.title)}`,
        'TRIGGER:PT0M',
        'END:VALARM',
      )
    }
    lines.push('END:VEVENT')
  })

  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

export function downloadIcs(ics: string, filename = 'healthlens-plan.ics') {
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
