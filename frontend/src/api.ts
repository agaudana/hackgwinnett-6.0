import { MOCK_RESPONSE, MOCK_ERROR_TRIGGER } from './mock'
import type { AnalysisData, AnalyzeInput, AnalyzeResult, ApiError } from './types'

type MockMode = 'always' | 'never' | 'fallback'

const MOCK_MODE: MockMode =
  import.meta.env.VITE_USE_MOCK === 'true' ? 'always' : import.meta.env.VITE_USE_MOCK === 'false' ? 'never' : 'fallback'

export const ALWAYS_MOCK = MOCK_MODE === 'always'

const MAX_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

const NETWORK_ERROR: ApiError = {
  code: 'NETWORK_ERROR',
  message: "We couldn't reach HealthLens. Check your internet and try again.",
}

class BackendUnreachable extends Error {}

export function checkImage(file: File): ApiError | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { code: 'INVALID_IMAGE', message: "Please choose a JPEG or PNG photo. Other file types can't be read yet." }
  }
  if (file.size > MAX_BYTES) {
    return { code: 'FILE_TOO_LARGE', message: 'Image must be under 10MB' }
  }
  return null
}

function parseAnalysis(data: unknown): AnalysisData {
  const d = (data ?? {}) as Partial<Record<keyof AnalysisData, unknown>>
  return {
    originalText: String(d.originalText ?? ''),
    simplifiedText: String(d.simplifiedText ?? ''),
    keyActions: Array.isArray(d.keyActions) ? d.keyActions : [],
    medicalTerms: Array.isArray(d.medicalTerms) ? d.medicalTerms : [],
  }
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

async function sample(input: AnalyzeInput, signal: AbortSignal): Promise<AnalyzeResult> {
  await wait(1800, signal)
  if (input.kind === 'text' && input.text.trim().toLowerCase() === MOCK_ERROR_TRIGGER) {
    return { ok: false, error: { code: 'AI_PROCESSING_FAILED', message: 'Unable to simplify document at this time. Please try again' } }
  }
  const data = parseAnalysis(MOCK_RESPONSE.data)
  if (input.kind === 'text') data.originalText = input.text
  return { ok: true, data, source: 'sample' }
}

async function callBackend(input: AnalyzeInput, signal: AbortSignal): Promise<AnalyzeResult> {
  const request: RequestInit =
    input.kind === 'image'
      ? { method: 'POST', body: formFor(input.file), signal }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input.text, inputType: 'text' }),
          signal,
        }

  let body: { success?: unknown; data?: unknown; error?: Partial<ApiError> }
  try {
    const res = await fetch('/api/analyze', request)
    body = await res.json()
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new BackendUnreachable()
  }
  if (typeof body?.success !== 'boolean') throw new BackendUnreachable()
  if (body.success) return { ok: true, data: parseAnalysis(body.data), source: 'live' }
  const err = body.error
  return { ok: false, error: err?.message ? { code: String(err.code ?? 'UNKNOWN'), message: err.message } : NETWORK_ERROR }
}

function formFor(file: File) {
  const form = new FormData()
  form.append('image', file)
  form.append('inputType', 'image')
  return form
}

export async function analyze(input: AnalyzeInput, signal: AbortSignal): Promise<AnalyzeResult> {
  if (MOCK_MODE === 'always') return sample(input, signal)
  try {
    return await callBackend(input, signal)
  } catch (error) {
    if (!(error instanceof BackendUnreachable)) throw error
    return MOCK_MODE === 'fallback' ? sample(input, signal) : { ok: false, error: NETWORK_ERROR }
  }
}

export async function backendIsDemo(): Promise<boolean> {
  if (MOCK_MODE === 'always') return true
  try {
    const res = await fetch('/api/health')
    const health = await res.json()
    return health?.services?.ai === 'mock'
  } catch {
    return MOCK_MODE === 'fallback'
  }
}
