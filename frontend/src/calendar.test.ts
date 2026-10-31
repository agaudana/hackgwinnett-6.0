import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildIcs, describeEvents, toCalendarEvents } from './calendar.ts'
import type { KeyAction } from './types.ts'

const NOW = new Date(2026, 9, 31, 13, 0)
const act = (action: string): KeyAction => ({ action, priority: 'normal', icon: 'info' })

test('twice daily medicine becomes two daily reminders for a default week', () => {
  const events = toCalendarEvents([act('Take amoxicillin 500mg twice daily with food')], NOW)
  assert.equal(events.length, 2)
  assert.deepEqual(events.map((e) => (e.kind === 'medication' ? [e.start.getHours(), e.days] : null)), [[9, 7], [21, 7]])
})

test('a stated course length sets how many days the reminders repeat', () => {
  const [event] = toCalendarEvents([act('Take 1 pill once daily for 2 weeks')], NOW)
  assert.equal(event.kind === 'medication' && event.days, 14)
})

test('a follow-up range is booked on its earliest day as an all-day item', () => {
  const [event] = toCalendarEvents([act('Schedule follow-up with your doctor in 7-10 days')], NOW)
  assert.equal(event.kind, 'followup')
  assert.equal(event.kind === 'followup' && event.date.toDateString(), new Date(2026, 10, 7).toDateString())
})

test('actions with no timing add nothing', () => {
  assert.deepEqual(toCalendarEvents([act('Return to emergency room if breathing worsens')], NOW), [])
})

test('describes what will be added in plain words', () => {
  const events = toCalendarEvents([act('Take pill twice daily'), act('See your doctor within 2 weeks')], NOW)
  assert.equal(describeEvents(events), 'Adds medicine reminders and 1 follow-up visit to your calendar.')
})

test('ics output is valid-shaped: CRLF lines, escaped commas, repeat rule, short lines', () => {
  const ics = buildIcs(toCalendarEvents([act('Take amoxicillin 500mg twice daily, with food')], NOW), NOW)
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.endsWith('END:VCALENDAR\r\n'), 'calendar wrapper with CRLF')
  assert.ok(ics.includes('RRULE:FREQ=DAILY;COUNT=7'), 'repeats daily for a week')
  assert.ok(ics.includes('twice daily\\, with food'), 'commas escaped')
  for (const line of ics.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line}`)
})
