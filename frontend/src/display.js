export const PRIORITIES = {
  critical: { label: 'Do this first', rank: 0 },
  important: { label: 'Important', rank: 1 },
  normal: { label: 'To do', rank: 2 },
}

export const CATEGORY_LABELS = {
  medication: 'Medicine',
  instruction: 'Instruction',
  symptom: 'Symptom',
  provider: 'Care provider',
}

export const priorityOf = (action) => PRIORITIES[action.priority] ? action.priority : 'normal'

export const sortActions = (actions) =>
  [...actions].sort((a, b) => PRIORITIES[priorityOf(a)].rank - PRIORITIES[priorityOf(b)].rank)
