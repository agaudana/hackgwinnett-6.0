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

export type AnalyzeResult = { ok: true; data: AnalysisData } | { ok: false; error: ApiError }
