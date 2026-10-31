import { useState } from 'react'
import { checkImage } from './api'
import { useSpeech } from './useSpeech'
import Icon from './Icon'
import type { PillConfidence, PillData, PillInput, Preferences, ResultSource } from './types'

// Kept deliberately short: readers may have dyslexia. One fact per line, no repeated text.
const CONFIDENCE: Record<PillConfidence, { label: string; flag: string }> = {
  high: { label: 'From the label', flag: 'flag-normal' },
  medium: { label: 'Maybe. Please check.', flag: 'flag-important' },
  low: { label: 'Not sure', flag: 'flag-critical' },
}

const POISON_CONTROL = '1-800-222-1222'

/** The row is already labeled "For", so drop a leading "For " the model may still write. */
const purposeText = (purpose: string) => purpose.replace(/^fors+/i, '').replace(/^./, (c) => c.toUpperCase())

/** What gets read aloud: the same few lines the screen shows, nothing extra. */
function script(data: PillData, title: string) {
  if (!data.identified) return `${title}. ${data.summary} Ask your pharmacist.`
  return [title, data.purpose && `For ${purposeText(data.purpose)}`, data.howToTake, ...data.warnings, 'Ask your pharmacist before you take it.']
    .filter(Boolean)
    .join('. ')
    .replace(/\.\./g, '.')
}

interface Props {
  data: PillData
  source: ResultSource
  previewUrl: string
  speechRate: Preferences['speechRate']
  onCheckAnother: (input: PillInput) => void
  onReset: () => void
}

export default function PillResultsScreen({ data, source, previewUrl, speechRate, onCheckAnother, onReset }: Props) {
  const speech = useSpeech(speechRate)
  const [problem, setProblem] = useState<string | null>(null)
  const confidence = CONFIDENCE[data.confidence] ?? CONFIDENCE.low
  const title = data.identified ? [data.medicationName, data.strength].filter(Boolean).join(' ') : 'We are not sure'
  const reading = speech.speakingId === 'pill'

  const facts = data.identified
    ? [
        { icon: 'medication', label: 'For', text: purposeText(data.purpose) },
        { icon: 'check', label: 'Take', text: data.howToTake },
        { icon: 'warning', label: 'Careful', text: data.warnings.join(' ') },
      ].filter((f) => f.text)
    : [{ icon: 'lens', label: 'Pill says', text: data.imprint }].filter((f) => f.text)

  function pickAnother(file: File | undefined) {
    if (!file) return
    const issue = checkImage(file)
    setProblem(issue?.message ?? null)
    if (issue) return
    speech.stop()
    onCheckAnother({ file, previewUrl: URL.createObjectURL(file) })
  }

  return (
    <section className="stack" aria-labelledby="pill-title">
      {source === 'sample' && (
        <p className="sample-note" role="status">
          <Icon name="info" /> Example only. Not from your picture.
        </p>
      )}

      <div className="step-card">
        <span className={`flag ${confidence.flag}`}>{confidence.label}</span>
        <div className="pill-head">
          <img className="pill-thumb" src={previewUrl} alt="Your picture" />
          <h1 id="pill-title" className="pill-name">{title}</h1>
        </div>

        {!data.identified && <p className="step-body">{data.summary}</p>}

        {facts.length > 0 && (
          <dl className="pill-facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt><Icon name={f.icon} /> {f.label}</dt>
                <dd>{f.text}</dd>
              </div>
            ))}
          </dl>
        )}

        {speech.supported && (
          <button
            className="btn btn-primary"
            onClick={() => (reading ? speech.stop() : speech.speak('pill', script(data, title)))}
            aria-pressed={reading}
          >
            <Icon name={reading ? 'stop' : 'sound'} />
            {reading ? 'Stop' : 'Read to me'}
          </button>
        )}
      </div>

      <div className="safety-note" role="note">
        <Icon name="warning" />
        <div>
          <p><strong>Ask your pharmacist before you take it.</strong></p>
          <p>Swallowed by mistake? Call <a href={`tel:${POISON_CONTROL}`}>{POISON_CONTROL}</a></p>
        </div>
      </div>

      {!data.identified && (
        <p className="tip">Tip: take a picture of the bottle label, in bright light.</p>
      )}

      {problem && <p className="inline-error" role="alert">{problem}</p>}
      <div className="step-nav">
        <button className="btn btn-outline btn-big" onClick={() => { speech.stop(); onReset() }}>Start over</button>
        <label className="btn btn-dark btn-big">
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="visually-hidden"
            onChange={(e) => {
              pickAnother(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          Another pill
        </label>
      </div>
    </section>
  )
}
