import { test } from 'node:test'
import assert from 'node:assert/strict'
import { segmentText } from './segmentText.ts'

const terms = [
  { term: 'amoxicillin', definition: 'An antibiotic', category: 'medication' },
  { term: 'PO BID', definition: 'By mouth, twice a day', category: 'instruction' },
  { term: 'PCP', definition: 'Your regular doctor', category: 'provider' },
]

test('marks terms case-insensitively and keeps the original casing', () => {
  const parts = segmentText('Take Amoxicillin PO BID.', terms)
  assert.deepEqual(parts.map((p) => [p.text, p.term?.term ?? null]), [
    ['Take ', null],
    ['Amoxicillin', 'amoxicillin'],
    [' ', null],
    ['PO BID', 'PO BID'],
    ['.', null],
  ])
})

test('joining the parts reproduces the input exactly', () => {
  const text = 'See your PCP. Then amoxicillin again, amoxicillin!'
  assert.equal(segmentText(text, terms).map((p) => p.text).join(''), text)
})

test('does not match a term inside a longer word', () => {
  const parts = segmentText('PCPs and xPCP', terms)
  assert.ok(parts.every((p) => p.term === null), 'no partial-word matches')
})

test('returns one plain part when there are no terms', () => {
  assert.deepEqual(segmentText('hello', []), [{ text: 'hello', term: null }])
})

test('treats regex characters in terms literally', () => {
  const parts = segmentText('fever >101°F (high)', [{ term: '>101°F', definition: 'd', category: 'symptom' }])
  assert.equal(parts.find((p) => p.term)?.text, '>101°F')
})
