import { useState } from 'react'
import { CATEGORY_LABELS, PRIORITIES, priorityOf, sortActions } from './display.js'
import { segmentText } from './segmentText.js'
import { useSpeech } from './useSpeech.js'
import Icon from './Icon.jsx'
import TermDialog from './TermDialog.jsx'

function buildSteps(data) {
  const steps = sortActions(data.keyActions).map((action) => ({ kind: 'action', action }))
  if (data.simplifiedText) steps.push({ kind: 'summary' })
  if (data.medicalTerms.length) steps.push({ kind: 'terms' })
  return steps
}

function spokenStep(step, data) {
  if (step.kind === 'action') return `${PRIORITIES[priorityOf(step.action)].label}. ${step.action.action}.`
  if (step.kind === 'summary') return `Your paper in plain words. ${data.simplifiedText}`
  return `Words from your paper. ${data.medicalTerms.map((t) => `${t.term} means ${t.definition}.`).join(' ')}`
}

function fullScript(steps, data) {
  const actions = steps.filter((s) => s.kind === 'action')
  const list = actions.map((s, i) => `Step ${i + 1}. ${s.action.action}.`).join(' ')
  return `${actions.length ? `Here is what you need to do. ${list} ` : ''}Here is your paper in plain words. ${data.simplifiedText}`
}

function TermText({ text, terms, onPick }) {
  return segmentText(text, terms).map((part, i) =>
    part.term ? (
      <button key={i} className="term" onClick={() => onPick(part.term)} aria-label={`${part.text}. Tap to learn what this means`}>
        {part.text}
      </button>
    ) : (
      <span key={i}>{part.text}</span>
    ),
  )
}

function StepCard({ step, data, onPick }) {
  if (step.kind === 'action') {
    const level = priorityOf(step.action)
    return (
      <>
        <span className={`flag flag-${level}`}>{PRIORITIES[level].label}</span>
        <Icon name={step.action.icon} className="step-icon" />
        <p className="step-text">
          <TermText text={step.action.action} terms={data.medicalTerms} onPick={onPick} />
        </p>
      </>
    )
  }
  if (step.kind === 'summary') {
    return (
      <>
        <span className="flag flag-normal">Your paper in plain words</span>
        <Icon name="paper" className="step-icon" />
        <p className="step-body">
          <TermText text={data.simplifiedText} terms={data.medicalTerms} onPick={onPick} />
        </p>
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

export default function ResultsScreen({ data, onReset }) {
  const steps = buildSteps(data)
  const [index, setIndex] = useState(0)
  const [openTerm, setOpenTerm] = useState(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const speech = useSpeech()

  const step = steps[index]
  const isLast = index === steps.length - 1
  const actionCount = steps.filter((s) => s.kind === 'action').length

  function go(next) {
    speech.stop()
    setIndex(next)
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
      <p className="step-count" aria-live="polite">Step {index + 1} of {steps.length}</p>

      <div className="step-card" key={index}>
        <StepCard step={step} data={data} onPick={setOpenTerm} />
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

      {data.originalText && (
        <div className="original">
          <button className="btn btn-link" onClick={() => setShowOriginal((v) => !v)} aria-expanded={showOriginal}>
            {showOriginal ? 'Hide the original words' : 'See the original words from your paper'}
          </button>
          {showOriginal && (
            <p className="original-text">
              <TermText text={data.originalText} terms={data.medicalTerms} onPick={setOpenTerm} />
            </p>
          )}
        </div>
      )}

      <TermDialog term={openTerm} speech={speech} onClose={() => setOpenTerm(null)} />
    </section>
  )
}
