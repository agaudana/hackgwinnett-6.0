import { MOCK_RESPONSE, MOCK_ERROR_TRIGGER, MOCK_PILL, EXAMPLE_PILL, EXAMPLE_PILL_URL } from './mock'
import type { AnalysisData, AnalyzeInput, AnalyzeResult, ApiError, IdentifyResult, PillData, PillInput } from './types'

type MockMode = 'always' | 'never' | 'fallback'

const MOCK_MODE: MockMode =
  import.meta.env.VITE_USE_MOCK === 'true' ? 'always' : import.meta.env.VITE_USE_MOCK === 'false' ? 'never' : 'fallback'

export const ALWAYS_MOCK = MOCK_MODE === 'always'

// Where the backend lives. Empty in dev (Vite proxies /api). In production, set at build time to the
// backend's public URL, e.g. https://healthlens-api.onrender.com
const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

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
      ? { method: 'POST', body: await formFor(input.file), signal }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input.text, inputType: 'text' }),
          signal,
        }

  let body: { success?: unknown; data?: unknown; error?: Partial<ApiError> }
  try {
    const res = await fetch(`${API_BASE}/api/analyze`, request)
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

// Server-side OCR time grows with pixel count; full-size phone photos were far too slow on a small
// server. Documents keep more pixels than pills so small print stays readable.
const MAX_DOCUMENT_SIDE = 2000

async function formFor(file: File) {
  const form = new FormData()
  form.append('image', await shrinkForUpload(file, MAX_DOCUMENT_SIDE))
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
    const res = await fetch(`${API_BASE}/api/health`)
    const health = await res.json()
    return health?.services?.ai === 'mock'
  } catch {
    return MOCK_MODE === 'fallback'
  }
}

// --- pill identification (POST /api/identify) ------------------------------

// Pill-specific wording for the shared error codes; the server messages talk about "documents".
const PILL_MESSAGES: Record<string, string> = {
  MISSING_INPUT: 'Please take a picture of the pill or the bottle first.',
  AI_PROCESSING_FAILED: 'We could not check this picture right now. Please try again.',
}

// The vision model rejects images over ~3.75MB, and phone photos are often bigger.
// Pills and labels stay readable at this size. Falls back to the original file if resizing fails.
const MAX_UPLOAD_SIDE = 1600

async function shrinkForUpload(file: File, maxSide = MAX_UPLOAD_SIDE): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size < 3 * 1024 * 1024) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    return blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file
  } catch {
    return file
  }
}

async function samplePill(input: PillInput, signal: AbortSignal): Promise<IdentifyResult> {
  await wait(1800, signal)
  return { ok: true, data: input.sample ?? MOCK_PILL, source: 'sample' }
}

async function callIdentify(input: PillInput, signal: AbortSignal): Promise<IdentifyResult> {
  const form = new FormData()
  form.append('image', await shrinkForUpload(input.file))

  let body: { success?: unknown; data?: unknown; error?: Partial<ApiError> }
  try {
    const res = await fetch(`${API_BASE}/api/identify`, { method: 'POST', body: form, signal })
    body = await res.json()
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new BackendUnreachable()
  }
  if (typeof body?.success !== 'boolean') throw new BackendUnreachable()
  if (body.success) return { ok: true, data: body.data as PillData, source: 'live' }
  const err = body.error
  if (!err?.message) return { ok: false, error: NETWORK_ERROR }
  const code = String(err.code ?? 'UNKNOWN')
  return { ok: false, error: { code, message: PILL_MESSAGES[code] ?? err.message } }
}

export async function identifyPill(input: PillInput, signal: AbortSignal): Promise<IdentifyResult> {
  if (MOCK_MODE === 'always') return samplePill(input, signal)
  try {
    return await callIdentify(input, signal)
  } catch (error) {
    if (!(error instanceof BackendUnreachable)) throw error
    return MOCK_MODE === 'fallback' ? samplePill(input, signal) : { ok: false, error: NETWORK_ERROR }
  }
}

/** Loads the bundled example pill photo as a File so it goes through the same flow as a real upload. */
export async function loadExamplePill(): Promise<PillInput | null> {
  try {
    const res = await fetch(EXAMPLE_PILL_URL)
    if (!res.ok) return null
    const file = new File([await res.blob()], 'example-pill.jpg', { type: 'image/jpeg' })
    return { file, previewUrl: URL.createObjectURL(file), sample: EXAMPLE_PILL }
  } catch {
    return null
  }
}
