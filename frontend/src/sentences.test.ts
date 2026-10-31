import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitSentences } from './sentences.ts'

test('splits on sentence endings and keeps the punctuation', () => {
  assert.deepEqual(splitSentences('Take your pill. Watch your fever! Call us?'), ['Take your pill.', 'Watch your fever!', 'Call us?'])
})

test('keeps a final sentence with no ending punctuation', () => {
  assert.deepEqual(splitSentences('Rest today. See your doctor in 7 days'), ['Rest today.', 'See your doctor in 7 days'])
})

test('keeps decimals and temperatures inside one sentence', () => {
  assert.deepEqual(splitSentences('Fever above 101°F is important.'), ['Fever above 101°F is important.'])
})

test('returns nothing for empty text', () => {
  assert.deepEqual(splitSentences('   '), [])
})

test('does not split inside a dose like 2.5 mL', () => {
  assert.deepEqual(splitSentences('Take 2.5 mL twice a day. Then rest.'), ['Take 2.5 mL twice a day.', 'Then rest.'])
})
