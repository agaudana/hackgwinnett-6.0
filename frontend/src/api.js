import { MOCK_RESPONSE, MOCK_ERROR_TRIGGER } from './mock.js'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const MAX_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

const NETWORK_ERROR = {
  code: 'NETWORK_ERROR',
  message: "We couldn't reach HealthLens. Check your internet and try again.",
}

export function checkImage(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { code: 'INVALID_IMAGE', message: "Please choose a JPEG or PNG photo. Other file types can't be read yet." }
  }
  if (file.size > MAX_BYTES) {
    return { code: 'FILE_TOO_LARGE', message: 'Image must be under 10MB' }
  }
  return null
}

function parseAnalysis(data) {
  return {
    originalText: String(data?.originalText ?? ''),
    simplifiedText: String(data?.simplifiedText ?? ''),
    keyActions: Array.isArray(data?.keyActions) ? data.keyActions : [],
    medicalTerms: Array.isArray(data?.medicalTerms) ? data.medicalTerms : [],
  }
}

async function mockAnalyze(input) {
  await new Promise((r) => setTimeout(r, 1800))
  if (input.kind === 'text' && input.text.trim().toLowerCase() === MOCK_ERROR_TRIGGER) {
    return { ok: false, error: { code: 'AI_PROCESSING_FAILED', message: 'Unable to simplify document at this time. Please try again' } }
  }
  const data = parseAnalysis(MOCK_RESPONSE.data)
  if (input.kind === 'text') data.originalText = input.text
  return { ok: true, data }
}

export async function analyze(input) {
  if (USE_MOCK) return mockAnalyze(input)

  let request
  if (input.kind === 'image') {
    const form = new FormData()
    form.append('image', input.file)
    form.append('inputType', 'image')
    request = { method: 'POST', body: form }
  } else {
    request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input.text, inputType: 'text' }),
    }
  }

  let body
  try {
    const res = await fetch('/api/analyze', request)
    body = await res.json()
  } catch {
    return { ok: false, error: NETWORK_ERROR }
  }
  if (body?.success) return { ok: true, data: parseAnalysis(body.data) }
  return { ok: false, error: body?.error?.message ? body.error : NETWORK_ERROR }
}
