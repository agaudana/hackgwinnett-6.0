import type { KeyAction, MedicalTerm, Priority } from './types'

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"(])/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export type Segment = { type: 'text'; value: string } | { type: 'term'; value: string; term: MedicalTerm }

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function segmentWithTerms(text: string, terms: MedicalTerm[]): Segment[] {
  const usable = terms.filter((t) => t.term.trim().length > 0).sort((a, b) => b.term.length - a.term.length)
  if (usable.length === 0) return [{ type: 'text', value: text }]

  const pattern = new RegExp(`(?<![\\w])(${usable.map((t) => escapeRegExp(t.term)).join('|')})(?![\\w])`, 'gi')
  const lookup = new Map(usable.map((t) => [t.term.toLowerCase(), t]))
  const segments: Segment[] = []
  let cursor = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0
    const term = lookup.get(match[0].toLowerCase())
    if (!term) continue
    if (index > cursor) segments.push({ type: 'text', value: text.slice(cursor, index) })
    segments.push({ type: 'term', value: match[0], term })
    cursor = index + match[0].length
  }
  if (cursor < text.length) segments.push({ type: 'text', value: text.slice(cursor) })
  return segments
}

const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, important: 1, normal: 2 }

export function sortByPriority(actions: KeyAction[]) {
  return actions
    .map((action, index) => ({ action, index }))
    .sort((a, b) => (PRIORITY_ORDER[a.action.priority] ?? 3) - (PRIORITY_ORDER[b.action.priority] ?? 3) || a.index - b.index)
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: 'Critical',
  important: 'Important',
  normal: 'Routine',
}

/** Builds one script for "read everything aloud" and remembers where each piece starts, so we can highlight it. */
export function buildReadAloudScript(parts: { id: string; text: string }[]) {
  let script = ''
  const ranges = parts.map((part) => {
    const start = script.length
    const piece = /[.!?:]$/.test(part.text.trim()) ? part.text.trim() : `${part.text.trim()}.`
    script += `${piece} `
    return { id: part.id, start, end: start + piece.length }
  })
  return { script: script.trim(), ranges }
}
