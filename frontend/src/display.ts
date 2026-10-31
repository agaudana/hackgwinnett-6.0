import type { KeyAction, Priority } from './types'

export const PRIORITIES: Record<Priority, { label: string; rank: number }> = {
  critical: { label: 'Do this first', rank: 0 },
  important: { label: 'Important', rank: 1 },
  normal: { label: 'To do', rank: 2 },
}

export const CATEGORY_LABELS: Record<string, string> = {
  medication: 'Medicine',
  instruction: 'Instruction',
  symptom: 'Symptom',
  provider: 'Care provider',
  condition: 'Health problem',
  procedure: 'Treatment',
  test: 'Medical test',
  other: 'Medical word',
}

export const priorityOf = (action: KeyAction): Priority =>
  action.priority in PRIORITIES ? action.priority : 'normal'

export const sortActions = (actions: KeyAction[]) =>
  [...actions].sort((a, b) => PRIORITIES[priorityOf(a)].rank - PRIORITIES[priorityOf(b)].rank)
