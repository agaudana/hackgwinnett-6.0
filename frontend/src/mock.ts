// Demo-mode response, copied from the success example in API_CONTRACT.md v1.0.
import type { AnalysisData, PillData } from './types'

export const SAMPLE_TEXT =
  'Patient should take amoxicillin 500mg PO BID with food. Monitor for fever >101°F. Return to ED if SOB worsens. Follow up with PCP in 7-10 days.'

export const MOCK_ERROR_TRIGGER = 'error'

export const MOCK_RESPONSE: { success: true; data: AnalysisData } = {
  success: true,
  data: {
    originalText: SAMPLE_TEXT,
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
    ],
  },
}

// Demo-mode pill answer, matching the /identify example shape in API_CONTRACT.md v1.1.
export const MOCK_PILL: PillData = {
  kind: 'bottle',
  medicationName: 'Lisinopril',
  strength: '10 mg',
  purpose: 'High blood pressure.',
  howToTake: '1 pill every morning.',
  appearance: 'Small pink round pill.',
  imprint: '',
  warnings: ['May make you dizzy.', 'Stand up slowly.'],
  confidence: 'high',
  identified: true,
  summary: 'Lisinopril is for high blood pressure.',
}

// "Try an example pill": photo in public/samples, plus a matching answer in case the server is unreachable.
export const EXAMPLE_PILL_URL = '/samples/images.jpeg'

export const EXAMPLE_PILL: PillData = {
  identified: true,
  kind: 'pill',
  medicationName: 'Biktarvy',
  strength: '',
  purpose: 'HIV infection.',
  howToTake: '',
  appearance: 'Brown-pink oval pill.',
  imprint: 'GSI 9883',
  warnings: [],
  confidence: 'medium',
  summary: 'The stamp matches Biktarvy, an HIV medicine.',
}
