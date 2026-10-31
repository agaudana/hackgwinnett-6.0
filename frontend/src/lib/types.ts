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

export interface ApiSuccess {
  success: true
  data: AnalysisData
}

export interface ApiFailure {
  success: false
  error: { code: string; message: string }
}

export type ApiResponse = ApiSuccess | ApiFailure

export type AnalyzeInput = { kind: 'image'; file: File } | { kind: 'text'; text: string }

export interface AnalysisResult {
  data: AnalysisData
  source: 'live' | 'sample'
}
