import { useState, type ReactNode } from 'react'
import { checkImage } from './api'
import { useSpeech, type Speech } from './useSpeech'
import Icon from './Icon'
import type { PillConfidence, PillData, PillInput, Preferences, ResultSource } from './types'

const CONFIDENCE: Record<PillConfidence, { label: string; flag: string }> = {
  high: { label: 'Read from the label', flag: 'flag-normal' },
  medium: { label: 'Possible match. Please check.', flag: 'flag-important' },
  low: { label: 'We are not sure', flag: 'flag-critical' },
}

const POISON_CONTROL = '1-800-222-1222'

function SpeakIcon({ id, text, speech, label }: { id: string; text: string; speech: Speech; label: string }) {
  if (!speech.supported) return null
  const speaking = speech.speakingId === id
  return (
    <button
      className="btn btn-outline btn-icon"
      onClick={() => (speaking ? speech.stop() : speech.speak(id, text))}
      aria-label={speaking ? 'Stop reading' : label}
      aria-pressed={speaking}
    >
      <Icon name={speaking ? 'stop' : 'sound'} />
    </button>
  )
}

function Section({ id, icon, title, speak, speech, children }: {
  id: string
  icon: string
  title: string
  speak?: string
  speech: Speech
  children: ReactNode
}) {
  return (
    <section className="pill-section" aria-labelledby={`${id}-title`}>
      <div className="pill-section-head">
        <h2 id={`${id}-title`}><Icon name={icon} /> {title}</h2>
        {speak && <SpeakIcon id={id} text={speak} speech={speech} label={`Read "${title}" to me`} />}
      </div>
      {children}
    </section>
  )
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
  const title = data.identified ? [data.medicationName, data.strength].filter(Boolean).join(', ') : 'We could not tell what this is'
  const seen = [data.appearance, data.imprint && `The pill says ${data.imprint}.`].filter(Boolean).join(' ')

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
          <Icon name="info" /> This is an example. HealthLens could not reach its server, so this is not from your picture.
        </p>
      )}

      <div className="step-card">
        <span className={`flag ${confidence.flag}`}>{confidence.label}</span>
        <div className="pill-head">
          <img className="pill-thumb" src={previewUrl} alt="Your picture" />
          <div>
            <p className="pill-kicker">{data.identified ? 'This looks like' : 'Pill check'}</p>
            <h1 id="pill-title" className="results-title">{title}</h1>
          </div>
        </div>
        <p className="step-body">{data.summary}</p>
        {speech.supported ? (
          <button
            className="btn btn-primary"
            onClick={() => (speech.speakingId === 'pill-all' ? speech.stop() : speech.speak('pill-all', `${title}. ${data.summary}`))}
            aria-pressed={speech.speakingId === 'pill-all'}
          >
            <Icon name={speech.speakingId === 'pill-all' ? 'stop' : 'sound'} />
            {speech.speakingId === 'pill-all' ? 'Stop reading' : 'Read this to me'}
          </button>
        ) : (
          <p className="hint">Read aloud does not work in this browser. Try Chrome or Safari.</p>
        )}
      </div>

      <div className="safety-note" role="note">
        <Icon name="warning" />
        <div>
          <p><strong>Always check with your pharmacist before you take a pill.</strong></p>
          <p>
            If someone swallowed a pill by mistake, call Poison Control:{' '}
            <a href={`tel:${POISON_CONTROL}`}>{POISON_CONTROL}</a>
          </p>
        </div>
      </div>

      {data.purpose && (
        <Section id="pill-purpose" icon="medication" title="What it is for" speak={data.purpose} speech={speech}>
          <p>{data.purpose}</p>
        </Section>
      )}

      {data.howToTake && (
        <Section id="pill-how" icon="check" title="How to take it" speak={data.howToTake} speech={speech}>
          <p>{data.howToTake}</p>
          <p className="hint">From the label on your bottle.</p>
        </Section>
      )}

      {data.warnings.length > 0 && (
        <Section id="pill-warnings" icon="warning" title="Be careful" speak={data.warnings.join(' ')} speech={speech}>
          <ul className="warn-list">
            {data.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </Section>
      )}

      {seen && (
        <Section id="pill-seen" icon="lens" title="What we see" speak={seen} speech={speech}>
          {data.appearance && <p>{data.appearance}</p>}
          {data.imprint && <p>Letters or numbers on the pill: <span className="imprint">{data.imprint}</span></p>}
        </Section>
      )}

      {!data.identified && (
        <Section id="pill-tips" icon="info" title="Try this" speech={speech}>
          <ul className="warn-list">
            <li>Take a picture of the bottle label if you have it.</li>
            <li>Use bright light. Get close so the letters on the pill are clear.</li>
            <li>Bring the pill to your pharmacist. They can tell you what it is.</li>
          </ul>
        </Section>
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
          Check another pill
        </label>
      </div>

      <p className="hint">HealthLens can make mistakes. It does not replace your pharmacist or doctor.</p>
    </section>
  )
}
