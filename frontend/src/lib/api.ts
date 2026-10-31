import { SAMPLE_ANALYSIS, SAMPLE_PILL } from './mock'
import type { AnalysisResult, AnalyzeInput, ApiFailure, ApiResponse, PillData, PillResult } from './types'

type PillApiResponse = { success: true; data: PillData } | ApiFailure

const API_BASE = '/api'
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png']

type MockMode = 'always' | 'never' | 'fallback'

function getMockMode(): MockMode {
  const flag = import.meta.env.VITE_USE_MOCK ?? import.meta.env.NEXT_PUBLIC_USE_MOCK
  if (flag === 'true') return 'always'
  if (flag === 'false') return 'never'
  return 'fallback'
}

export class AnalyzeError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

class BackendUnreachableError extends Error {}

export function validateImage(file: File): AnalyzeError | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return new AnalyzeError('INVALID_IMAGE', 'This file type will not work. Please use a JPEG or PNG photo.')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return new AnalyzeError('FILE_TOO_LARGE', 'This photo is too big. Please use a photo under 10MB.')
  }
  return null
}

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

async function sampleResult(signal?: AbortSignal): Promise<AnalysisResult> {
  await wait(3200, signal)
  return { data: SAMPLE_ANALYSIS, source: 'sample' }
}

async function callBackend(input: AnalyzeInput, signal?: AbortSignal): Promise<AnalysisResult> {
  let response: Response
  try {
    if (input.kind === 'image') {
      const body = new FormData()
      body.append('image', input.file)
      body.append('inputType', 'image')
      response = await fetch(`${API_BASE}/analyze`, { method: 'POST', body, signal })
    } else {
      response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.text, inputType: 'text' }),
        signal,
      })
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new BackendUnreachableError()
  }

  let payload: ApiResponse
  try {
    payload = (await response.json()) as ApiResponse
  } catch {
    throw new BackendUnreachableError()
  }

  if (typeof payload?.success !== 'boolean') throw new BackendUnreachableError()
  if (!payload.success) throw new AnalyzeError(payload.error.code, payload.error.message)
  return { data: payload.data, source: 'live' }
}

export async function analyzeDocument(input: AnalyzeInput, signal?: AbortSignal): Promise<AnalysisResult> {
  if (input.kind === 'image') {
    const invalid = validateImage(input.file)
    if (invalid) throw invalid
  } else if (!input.text.trim()) {
    throw new AnalyzeError('MISSING_INPUT', 'Please type or say some words from your paper first.')
  }

  const mode = getMockMode()
  if (mode === 'always') return sampleResult(signal)

  try {
    return await callBackend(input, signal)
  } catch (error) {
    if (error instanceof BackendUnreachableError) {
      if (mode === 'fallback') return sampleResult(signal)
      throw new AnalyzeError('NETWORK', 'We could not reach HealthLens right now. Please check your internet and try again.')
    }
    throw error
  }
}

// Pill-specific wording for the shared error codes; the server messages talk about "documents".
const PILL_ERROR_MESSAGES: Record<string, string> = {
  MISSING_INPUT: 'Please take a photo of the pill or the bottle first.',
  AI_PROCESSING_FAILED: 'We could not check this photo right now. Please try again.',
}

async function sampleIdentify(signal?: AbortSignal): Promise<PillResult> {
  await wait(2400, signal)
  return { data: SAMPLE_PILL, source: 'sample' }
}

// The vision model rejects images over ~3.75MB, and phone photos are often bigger. Pills and labels
// stay readable at this size. Falls back to the original file if the browser cannot resize it.
const MAX_UPLOAD_SIDE = 1600

async function shrinkForUpload(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_UPLOAD_SIDE / Math.max(bitmap.width, bitmap.height))
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

async function callIdentify(file: File, signal?: AbortSignal): Promise<PillResult> {
  let response: Response
  try {
    const body = new FormData()
    body.append('image', await shrinkForUpload(file))
    response = await fetch(`${API_BASE}/identify`, { method: 'POST', body, signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new BackendUnreachableError()
  }

  let payload: PillApiResponse
  try {
    payload = (await response.json()) as PillApiResponse
  } catch {
    throw new BackendUnreachableError()
  }

  if (typeof payload?.success !== 'boolean') throw new BackendUnreachableError()
  if (!payload.success) {
    const { code, message } = payload.error
    throw new AnalyzeError(code, PILL_ERROR_MESSAGES[code] ?? message)
  }
  return { data: payload.data, source: 'live' }
}

export async function identifyPill(file: File, signal?: AbortSignal): Promise<PillResult> {
  const invalid = validateImage(file)
  if (invalid) throw invalid

  const mode = getMockMode()
  if (mode === 'always') return sampleIdentify(signal)

  try {
    return await callIdentify(file, signal)
  } catch (error) {
    if (error instanceof BackendUnreachableError) {
      if (mode === 'fallback') return sampleIdentify(signal)
      throw new AnalyzeError('NETWORK', 'We could not reach HealthLens right now. Please check your internet and try again.')
    }
    throw error
  }
}
