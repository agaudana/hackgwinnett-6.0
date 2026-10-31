import type { AnalysisData, PillData } from './types'

export const SAMPLE_DOCUMENT_TEXT =
  'Patient should take amoxicillin 500mg PO BID with food. Monitor for fever >101°F. Return to ED if SOB worsens. Follow up with PCP in 7-10 days.'

export const SAMPLE_ANALYSIS: AnalysisData = {
  originalText: SAMPLE_DOCUMENT_TEXT,
  simplifiedText:
    "Take your antibiotic pill (amoxicillin) twice a day with food. Watch your temperature - if it goes above 101°F, that's important to note. Go back to the emergency room if your breathing gets worse. Schedule an appointment with your regular doctor within 7 to 10 days.",
  keyActions: [
    { action: 'Take amoxicillin 500mg twice daily with food', priority: 'critical', icon: 'medication' },
    { action: 'Watch for fever above 101°F', priority: 'important', icon: 'thermometer' },
    { action: 'Return to emergency room if breathing worsens', priority: 'critical', icon: 'emergency' },
    { action: 'Schedule follow-up with your doctor in 7-10 days', priority: 'normal', icon: 'calendar' },
  ],
  medicalTerms: [
    { term: 'amoxicillin', definition: 'An antibiotic medicine that fights bacterial infections', category: 'medication' },
    { term: 'PO BID', definition: 'By mouth, two times per day', category: 'instruction' },
    { term: 'SOB', definition: 'Shortness of breath - difficulty breathing', category: 'symptom' },
    { term: 'PCP', definition: 'Primary Care Provider - your regular doctor', category: 'provider' },
    { term: 'ED', definition: 'Emergency Department - the emergency room at a hospital', category: 'provider' },
  ],
}

export const SAMPLE_PILL: PillData = {
  identified: true,
  kind: 'bottle',
  medicationName: 'Lisinopril',
  strength: '10 mg',
  purpose: 'This medicine lowers blood pressure. It helps protect your heart and kidneys.',
  howToTake: 'Take 1 pill by mouth every morning.',
  appearance: 'Orange pill bottle with a white label. The pills are small, round, and pink.',
  imprint: '',
  warnings: ['It may make you dizzy. Stand up slowly.', 'Tell your doctor if you get a dry cough or swelling in your face.'],
  confidence: 'high',
  summary: 'This is lisinopril, 10 mg. It lowers blood pressure. Take 1 pill by mouth every morning.',
}
