import { useRef, useState } from 'react'
import Choice, { FONT_OPTIONS, SIZE_OPTIONS, SPACING_OPTIONS, THEME_OPTIONS } from './Choice'
import Icon from './Icon'
import type { Preferences } from './types'

const STORAGE_KEY = 'healthlens:onboarded'

export function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboarded() {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Storage can be blocked; the tutorial just shows again next visit.
  }
}

const STEPS = ['Welcome', 'Reading setup', 'How it works'] as const

const HOW: { icon: string; title: string; body: string }[] = [
  { icon: 'camera', title: 'Take a photo', body: 'Snap your discharge paper, bill, or prescription note.' },
  { icon: 'lens', title: 'We make it simple', body: 'You get short steps in plain words. The most important ones come first.' },
  { icon: 'book', title: 'Tap any hard word', body: 'Tap a highlighted word to see what it means.' },
  { icon: 'sound', title: 'Listen out loud', body: 'Press the speaker button to hear it read to you.' },
]

interface Props {
  prefs: Preferences
  onChange: (patch: Partial<Preferences>) => void
  onFinish: () => void
}

export default function Onboarding({ prefs, onChange, onFinish }: Props) {
  const [step, setStep] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const last = step === STEPS.length - 1

  function go(next: number) {
    setStep(next)
    requestAnimationFrame(() => heading.current?.focus())
  }

  return (
    <section className="stack" aria-labelledby="onboarding-title">
      <p className="step-count" aria-live="polite">Step {step + 1} of {STEPS.length}</p>
      <div className="progress" aria-hidden="true">
        {STEPS.map((name, i) => (
          <span key={name} className={i <= step ? 'on' : ''} />
        ))}
      </div>

      {step === 0 && (
        <>
          <h1 id="onboarding-title" ref={heading} tabIndex={-1}>Welcome to HealthLens</h1>
          <p className="lead">
            Medical papers can be hard to read. HealthLens turns them into short, clear steps you can read or listen to.
          </p>
          <p className="lead">First, let us set up the words so they are easy for you.</p>
        </>
      )}

      {step === 1 && (
        <>
          <h1 id="onboarding-title" ref={heading} tabIndex={-1}>How do you like to read?</h1>
          <Choice<'font'>
            legend="Font"
            value={prefs.font}
            onChange={(font) => onChange({ font })}
            options={FONT_OPTIONS}
          />
          <Choice<'textSize'>
            legend="Text size"
            value={prefs.textSize}
            onChange={(textSize) => onChange({ textSize })}
            options={SIZE_OPTIONS}
          />
          <Choice<'spacing'>
            legend="Space between letters and lines"
            value={prefs.spacing}
            onChange={(spacing) => onChange({ spacing })}
            options={SPACING_OPTIONS}
          />
          <Choice<'theme'>
            legend="Colors"
            value={prefs.theme}
            onChange={(theme) => onChange({ theme })}
            options={THEME_OPTIONS}
          />
          <div className="tip" aria-label="Preview">
            <p className="hint">Preview</p>
            <p className="step-body">Take 1 pill two times a day, with food. Call your doctor if you feel dizzy.</p>
          </div>
          <p className="hint">You can change these any time with the Reading settings button.</p>
        </>
      )}

      {step === 2 && (
        <>
          <h1 id="onboarding-title" ref={heading} tabIndex={-1}>How it works</h1>
          <ol className="how-list">
            {HOW.map((item, i) => (
              <li key={item.title} className="tip how-item">
                <Icon name={item.icon} className="how-icon" />
                <div>
                  <strong>{i + 1}. {item.title}</strong>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      <div className="row">
        {step > 0 && <button className="btn btn-outline btn-big" onClick={() => go(step - 1)}>Back</button>}
        <button className="btn btn-primary btn-big" onClick={() => (last ? onFinish() : go(step + 1))}>
          {last ? 'Start' : 'Next'}
        </button>
      </div>
      {!last && <button className="btn-link" onClick={onFinish}>Skip for now</button>}
    </section>
  )
}
