import { useState } from 'react'
import { CATEGORY_LABELS, PRIORITIES, priorityOf, sortActions } from './display'
import { segmentText } from './segmentText'
import { splitSentences } from './sentences'
import { useSpeech, type Speech } from './useSpeech'
import Icon from './Icon'
import TermDialog from './TermDialog'
import type { AnalysisData, KeyAction, MedicalTerm, Preferences, ResultSource } from './types'

type Step = { kind: 'action'; action: KeyAction; actionIndex: number } | { kind: 'summary' } | { kind: 'terms' }

function buildSteps(data: AnalysisData): Step[] {
  const steps: Step[] = sortActions(data.keyActions).map((action, actionIndex): Step => ({ kind: 'action', action, actionIndex }))
  if (data.simplifiedText) steps.push({ kind: 'summary' })
  if (data.medicalTerms.length) steps.push({ kind: 'terms' })
  return steps
}

function spokenStep(step: Step, data: AnalysisData) {
  if (step.kind === 'action') return `${PRIORITIES[priorityOf(step.action)].label}. ${step.action.action}.`
  if (step.kind === 'summary') return `Your paper in plain words. ${data.simplifiedText}`
  return `Words from your paper. ${data.medicalTerms.map((t) => `${t.term} means ${t.definition}.`).join(' ')}`
}

function fullScript(steps: Step[], data: AnalysisData) {
  const actions = steps.filter((s): s is Extract<Step, { kind: 'action' }> => s.kind === 'action')
  const list = actions.map((s, i) => `Step ${i + 1}. ${s.action.action}.`).join(' ')
  return `${actions.length ? `Here is what you need to do. ${list} ` : ''}Here is your paper in plain words. ${data.simplifiedText}`
}

interface TermTextProps {
  text: string
  terms: MedicalTerm[]
  onPick: (term: MedicalTerm) => void
}

function TermText({ text, terms, onPick }: TermTextProps) {
  const parts = segmentText(text, terms).map((part, i) =>
    part.term ? (
      <button key={i} className="term" onClick={() => onPick(part.term!)} aria-label={`${part.text}. Tap to learn what this means`}>
        {part.text}
      </button>
    ) : (
      <span key={i}>{part.text}</span>
    ),
  )
  return <>{parts}</>
}

interface StepCardProps {
  step: Step
  data: AnalysisData
  speech: Speech
  done: boolean
  onToggleDone: () => void
  onPick: (term: MedicalTerm) => void
}

function StepCard({ step, data, speech, done, onToggleDone, onPick }: StepCardProps) {
  if (step.kind === 'action') {
    const level = priorityOf(step.action)
    return (
      <>
        <span className={`flag flag-${level}`}>{PRIORITIES[level].label}</span>
        <Icon name={step.action.icon} className="step-icon" />
        <p className={`step-text${done ? ' is-done' : ''}`}>
          <TermText text={step.action.action} terms={data.medicalTerms} onPick={onPick} />
        </p>
        <button className={`btn btn-big ${done ? 'btn-done' : 'btn-outline'}`} onClick={onToggleDone} aria-pressed={done}>
          <Icon name={done ? 'tick' : 'check'} />
          {done ? 'Done' : 'Mark as done'}
        </button>
      </>
    )
  }
  if (step.kind === 'summary') {
    return (
      <>
        <span className="flag flag-normal">Your paper in plain words</span>
        <Icon name="paper" className="step-icon" />
        <ul className="sentences">
          {splitSentences(data.simplifiedText).map((sentence, i) => {
            const id = `sentence-${i}`
            const speaking = speech.speakingId === id
            return (
              <li key={i}>
                <p className="step-body">
                  <TermText text={sentence} terms={data.medicalTerms} onPick={onPick} />
                </p>
                {speech.supported && (
                  <button
                    className="btn btn-outline btn-icon"
                    onClick={() => (speaking ? speech.stop() : speech.speak(id, sentence))}
                    aria-label={speaking ? 'Stop reading this sentence' : 'Read this sentence to me'}
                    aria-pressed={speaking}
                  >
                    <Icon name={speaking ? 'stop' : 'sound'} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </>
    )
  }
  return (
    <>
      <span className="flag flag-normal">Words to know</span>
      <Icon name="book" className="step-icon" />
      <p className="step-body">Your paper used doctor words. Tap one to learn what it means.</p>
      <ul className="term-list">
        {data.medicalTerms.map((t) => (
          <li key={t.term}>
            <button className="term-chip" onClick={() => onPick(t)}>
              <span>{t.term}</span>
              <small>{CATEGORY_LABELS[t.category] ?? 'Medical word'}</small>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

function PrintSummary({ steps, data }: { steps: Step[]; data: AnalysisData }) {
  return (
    <div className="print-only">
      <h1>HealthLens: your paper in plain words</h1>
      <h2>What you need to do</h2>
      <ol>
        {steps.map((s, i) =>
          s.kind === 'action' ? <li key={i}><strong>{PRIORITIES[priorityOf(s.action)].label}:</strong> {s.action.action}</li> : null,
        )}
      </ol>
      <h2>In plain words</h2>
      <p>{data.simplifiedText}</p>
      {data.medicalTerms.length > 0 && (
        <>
          <h2>Words to know</h2>
          <dl>
            {data.medicalTerms.map((t) => (
              <div key={t.term}><dt>{t.term}</dt><dd>{t.definition}</dd></div>
            ))}
          </dl>
        </>
      )}
      <p>HealthLens helps explain your papers. It does not replace your doctor.</p>
    </div>
  )
}

interface Props {
  data: AnalysisData
  source: ResultSource
  speechRate: Preferences['speechRate']
  onReset: () => void
}

export default function ResultsScreen({ data, source, speechRate, onReset }: Props) {
  const steps = buildSteps(data)
  const [index, setIndex] = useState(0)
  const [openTerm, setOpenTerm] = useState<MedicalTerm | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [done, setDone] = useState<ReadonlySet<number>>(new Set())
  const speech = useSpeech(speechRate)

  const step = steps[index]
  const isLast = index === steps.length - 1
  const actionCount = steps.filter((s) => s.kind === 'action').length

  function go(next: number) {
    speech.stop()
    setIndex(next)
  }

  function toggleDone(actionIndex: number) {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(actionIndex)) next.delete(actionIndex)
      else next.add(actionIndex)
      return next
    })
  }

  if (!step) {
    return (
      <section className="stack">
        <h1>We could not find anything to explain</h1>
        <p className="lead">The paper may be blank or hard to read. Try another photo.</p>
        <button className="btn btn-primary btn-big" onClick={onReset}>Try another paper</button>
      </section>
    )
  }

  return (
    <section className="stack" aria-labelledby="results-title">
      {source === 'sample' && (
        <p className="sample-note" role="status">
          <Icon name="info" /> This is an example. HealthLens could not reach its server, so this is not from your paper.
        </p>
      )}

      <div className="results-head">
        <h1 id="results-title" className="results-title">
          {actionCount > 0 ? `You have ${actionCount} thing${actionCount === 1 ? '' : 's'} to do` : 'Here is your paper'}
        </h1>
        {speech.supported && (
          <button
            className="btn btn-outline btn-small"
            onClick={() => (speech.speakingId === 'all' ? speech.stop() : speech.speak('all', fullScript(steps, data)))}
            aria-pressed={speech.speakingId === 'all'}
          >
            <Icon name={speech.speakingId === 'all' ? 'stop' : 'sound'} />
            {speech.speakingId === 'all' ? 'Stop' : 'Read everything'}
          </button>
        )}
      </div>

      <div className="progress" aria-hidden="true">
        {steps.map((_, i) => <span key={i} className={i <= index ? 'on' : ''} />)}
      </div>
      <p className="step-count" aria-live="polite">
        Step {index + 1} of {steps.length}
        {actionCount > 0 && <span className="done-count"> · {done.size} of {actionCount} done</span>}
      </p>

      <div className="step-card" key={index}>
        <StepCard
          step={step}
          data={data}
          speech={speech}
          done={step.kind === 'action' && done.has(step.actionIndex)}
          onToggleDone={() => step.kind === 'action' && toggleDone(step.actionIndex)}
          onPick={setOpenTerm}
        />
      </div>

      {speech.supported ? (
        <button
          className="btn btn-outline"
          onClick={() => (speech.speakingId === 'step' ? speech.stop() : speech.speak('step', spokenStep(step, data)))}
          aria-pressed={speech.speakingId === 'step'}
        >
          <Icon name={speech.speakingId === 'step' ? 'stop' : 'sound'} />
          {speech.speakingId === 'step' ? 'Stop reading' : 'Read this to me'}
        </button>
      ) : (
        <p className="hint">Read aloud does not work in this browser. Try Chrome or Safari.</p>
      )}

      <div className="step-nav">
        <button className="btn btn-outline btn-big" onClick={() => go(index - 1)} disabled={index === 0}>
          Back
        </button>
        {isLast ? (
          <button className="btn btn-dark btn-big" onClick={() => { speech.stop(); onReset() }}>
            New paper
          </button>
        ) : (
          <button className="btn btn-dark btn-big" onClick={() => go(index + 1)}>
            Next
          </button>
        )}
      </div>

      <div className="original">
        {data.originalText && (
          <button className="btn btn-link" onClick={() => setShowOriginal((v) => !v)} aria-expanded={showOriginal}>
            {showOriginal ? 'Hide the original words' : 'See the original words from your paper'}
          </button>
        )}
        <button className="btn btn-link" onClick={() => window.print()}>
          <Icon name="print" /> Print or save
        </button>
      </div>
      {showOriginal && (
        <p className="original-text">
          <TermText text={data.originalText} terms={data.medicalTerms} onPick={setOpenTerm} />
        </p>
      )}

      <PrintSummary steps={steps} data={data} />
      <TermDialog term={openTerm} speech={speech} onClose={() => setOpenTerm(null)} />
    </section>
  )
}
