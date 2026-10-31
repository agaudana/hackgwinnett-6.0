import type { MedicalTerm } from './types'

export interface TextPart {
  text: string
  term: MedicalTerm | null
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function segmentText(text: string, terms: MedicalTerm[]): TextPart[] {
  const usable = terms.filter((t) => t.term && t.term.trim())
  if (!text || usable.length === 0) return [{ text: text ?? '', term: null }]

  const byLower = new Map(usable.map((t) => [t.term.toLowerCase(), t]))
  const alternatives = [...byLower.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join('|')
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`, 'giu')

  const parts: TextPart[] = []
  let last = 0
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) parts.push({ text: text.slice(last, start), term: null })
    parts.push({ text: match[0], term: byLower.get(match[0].toLowerCase()) ?? null })
    last = start + match[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), term: null })
  return parts
}
