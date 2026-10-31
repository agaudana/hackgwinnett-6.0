import { useId } from 'react'
import type { Preferences } from './types'

interface ChoiceProps<K extends keyof Preferences> {
  legend: string
  options: { value: Preferences[K]; label: string }[]
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
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
