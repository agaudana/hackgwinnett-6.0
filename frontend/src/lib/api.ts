import { SAMPLE_ANALYSIS } from './mock'
import type { AnalysisResult, AnalyzeInput, ApiResponse } from './types'

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
