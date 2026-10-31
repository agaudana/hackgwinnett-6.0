import { useId, type CSSProperties } from 'react'
import type { Preferences } from './types'

export interface ChoiceOption<K extends keyof Preferences> {
  value: Preferences[K]
  label: string
  /** Shows the option the way it will look once applied. */
  look?: CSSProperties
  /** Optional sample line shown under the label with the same look. */
  sample?: string
}

interface ChoiceProps<K extends keyof Preferences> {
  legend: string
  options: ChoiceOption<K>[]
  value: Preferences[K]
  onChange: (value: Preferences[K]) => void
}

export default function Choice<K extends keyof Preferences>({ legend, options, value, onChange }: ChoiceProps<K>) {
  const name = useId()
  return (
    <fieldset className="choice">
      <legend>{legend}</legend>
      <div className="choice-row">
        {options.map((option) => (
          <label key={String(option.value)} className="choice-option">
            <input
              type="radio"
              name={name}
              className="visually-hidden"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className={option.look ? 'choice-look' : undefined} style={option.look}>
              {option.label}
              {option.sample && <span className="choice-sample">{option.sample}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

const LEXEND = "'Lexend', system-ui, sans-serif"

export const FONT_OPTIONS: ChoiceOption<'font'>[] = [
  { value: 'default', label: 'Standard', look: { fontFamily: LEXEND } },
  { value: 'dyslexic', label: 'OpenDyslexic', look: { fontFamily: "'OpenDyslexic', 'Lexend', sans-serif" } },
]

export const SIZE_OPTIONS: ChoiceOption<'textSize'>[] = [
  { value: 'md', label: 'Normal', look: { fontSize: 20 } },
  { value: 'lg', label: 'Large', look: { fontSize: 23 } },
  { value: 'xl', label: 'Largest', look: { fontSize: 26 } },
]

const SPACING_SAMPLE = 'Take one pill with food'

export const SPACING_OPTIONS: ChoiceOption<'spacing'>[] = [
  { value: 'normal', label: 'Normal', sample: SPACING_SAMPLE, look: { lineHeight: 1.45, letterSpacing: 'normal', wordSpacing: 'normal' } },
  {
    value: 'wide',
    label: 'Wide',
    sample: SPACING_SAMPLE,
    look: { lineHeight: 'var(--wide-leading)', letterSpacing: 'var(--wide-tracking)', wordSpacing: 'var(--wide-word-gap)' },
  },
]

export const THEME_OPTIONS: ChoiceOption<'theme'>[] = [
  { value: 'yellow', label: 'Yellow', look: { background: '#fff7d1', color: '#111111' } },
  { value: 'white', label: 'White', look: { background: '#ffffff', color: '#111111' } },
  { value: 'dark', label: 'Dark', look: { background: '#141414', color: '#f4f4f4' } },
]
