const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function segmentText(text, terms) {
  const usable = terms.filter((t) => t.term && t.term.trim())
  if (!text || usable.length === 0) return [{ text: text ?? '', term: null }]

  const byLower = new Map(usable.map((t) => [t.term.toLowerCase(), t]))
  const alternatives = [...byLower.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join('|')
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`, 'giu')

  const parts = []
  let last = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), term: null })
    parts.push({ text: match[0], term: byLower.get(match[0].toLowerCase()) })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), term: null })
  return parts
}
