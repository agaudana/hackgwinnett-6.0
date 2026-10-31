// Mirrors API_CONTRACT.md v1.0. Do not rename fields without team coordination.

export type Priority = 'critical' | 'important' | 'normal'

export interface KeyAction {
  action: string
  priority: Priority
  icon: string
}

export interface MedicalTerm {
  term: string
  definition: string
  category: string
}

export interface AnalysisData {
  originalText: string
  simplifiedText: string
  keyActions: KeyAction[]
  medicalTerms: MedicalTerm[]
}

export interface ApiError {
  code: string
  message: string
}

export type AnalyzeInput =
  | { kind: 'image'; file: File; previewUrl: string }
  | { kind: 'text'; text: string }

export type ResultSource = 'live' | 'sample'

export type AnalyzeResult =
  | { ok: true; data: AnalysisData; source: ResultSource }
  | { ok: false; error: ApiError }

export interface Preferences {
  textSize: 'md' | 'lg' | 'xl'
  spacing: 'normal' | 'wide'
  theme: 'yellow' | 'white' | 'dark'
  ruler: boolean
  speechRate: 0.75 | 0.9
}

// POST /api/identify (API_CONTRACT.md v1.1)

export type PillConfidence = 'high' | 'medium' | 'low'

export interface PillData {
  identified: boolean
  kind: 'bottle' | 'pill' | 'unknown'
  medicationName: string
  strength: string
  purpose: string
  howToTake: string
  appearance: string
  imprint: string
  warnings: string[]
  confidence: PillConfidence
  summary: string
}

export interface PillInput {
  file: File
  previewUrl: string
}

export type IdentifyResult =
  | { ok: true; data: PillData; source: ResultSource }
  | { ok: false; error: ApiError }
