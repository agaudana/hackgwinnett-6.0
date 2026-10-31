import { useEffect, useId, useRef } from 'react'
import Icon from './Icon'
import type { Preferences } from './types'

interface ChoiceProps<K extends keyof Preferences> {
  legend: string
  options: { value: Preferences[K]; label: string }[]
  value: Preferences[K]
  onChange: (value: Preferences[K]) => void
}

function Choice<K extends keyof Preferences>({ legend, options, value, onChange }: ChoiceProps<K>) {
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

interface Props {
  open: boolean
  prefs: Preferences
  onChange: (patch: Partial<Preferences>) => void
  onReset: () => void
  onClose: () => void
}

export default function SettingsDialog({ open, prefs, onChange, onReset, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog ref={dialog} className="settings-dialog" aria-labelledby="settings-title" onClose={onClose}>
      <div className="settings-body">
        <div className="settings-head">
          <h2 id="settings-title">Reading settings</h2>
          <button className="btn btn-outline btn-icon" onClick={() => dialog.current?.close()} aria-label="Close reading settings">
            <Icon name="close" />
          </button>
        </div>
        <p className="lead">Make the words easier for you to read and hear.</p>

        <Choice<'textSize'>
          legend="Text size"
          value={prefs.textSize}
          onChange={(textSize) => onChange({ textSize })}
          options={[{ value: 'md', label: 'Normal' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Largest' }]}
        />
        <Choice<'font'>
          legend="Font"
          value={prefs.font}
          onChange={(font) => onChange({ font })}
          options={[{ value: 'default', label: 'Standard' }, { value: 'dyslexic', label: 'OpenDyslexic' }]}
        />
        <Choice<'spacing'>
          legend="Space between letters and lines"
          value={prefs.spacing}
          onChange={(spacing) => onChange({ spacing })}
          options={[{ value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' }]}
        />
        <Choice<'theme'>
          legend="Colors"
          value={prefs.theme}
          onChange={(theme) => onChange({ theme })}
          options={[{ value: 'yellow', label: 'Yellow' }, { value: 'white', label: 'White' }, { value: 'dark', label: 'Dark' }]}
        />
        <Choice<'speechRate'>
          legend="Reading voice speed"
          value={prefs.speechRate}
          onChange={(speechRate) => onChange({ speechRate })}
          options={[{ value: 0.75, label: 'Slow' }, { value: 0.9, label: 'Normal' }]}
        />
        <Choice<'ruler'>
          legend="Reading guide"
          value={prefs.ruler}
          onChange={(ruler) => onChange({ ruler })}
          options={[{ value: false, label: 'Off' }, { value: true, label: 'On' }]}
        />
        <p className="hint">The reading guide dims the page except the line under your finger or mouse.</p>

        <div className="row">
          <button className="btn btn-outline btn-big" onClick={onReset}>Reset</button>
          <button className="btn btn-dark btn-big" onClick={() => dialog.current?.close()}>Done</button>
        </div>
      </div>
    </dialog>
  )
}
