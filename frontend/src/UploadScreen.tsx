import { useState } from 'react'
import { checkImage, loadExamplePill } from './api'
import { EXAMPLE_PILL_URL, SAMPLE_TEXT } from './mock'
import Icon from './Icon'
import type { AnalyzeInput, PillInput } from './types'

interface Props {
  onSubmit: (input: AnalyzeInput) => void
  onCheckPill: (input: PillInput) => void
}

export default function UploadScreen({ onSubmit, onCheckPill }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const [text, setText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [forPill, setForPill] = useState(false)
  const [mode, setMode] = useState<'paper' | 'pill'>('paper')
  const pillMode = mode === 'pill'

  function choose(picked: File | undefined, pill = false) {
    if (!picked) return
    const issue = checkImage(picked)
    setProblem(issue?.message ?? null)
    if (issue) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setForPill(pill)
    setFile(picked)
    setPreviewUrl(URL.createObjectURL(picked))
  }

  function switchMode(next: 'paper' | 'pill') {
    setProblem(null)
    setMode(next)
  }

  function clearPhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
  }

  if (file && previewUrl && forPill) {
    return (
      <section className="stack" aria-labelledby="preview-title">
        <h1 id="preview-title">Is this the pill or bottle?</h1>
        <img className="preview-img" src={previewUrl} alt="The photo you chose" />
        <button className="btn btn-primary btn-huge" onClick={() => onCheckPill({ file, previewUrl })}>
          Yes, tell me what it is
        </button>
        <button className="btn btn-outline btn-big" onClick={clearPhoto}>Take a different picture</button>
      </section>
    )
  }

  if (file && previewUrl) {
    return (
      <section className="stack" aria-labelledby="preview-title">
        <h1 id="preview-title">Is this your paper?</h1>
        <img className="preview-img" src={previewUrl} alt="The photo you chose" />
        <button className="btn btn-primary btn-huge" onClick={() => onSubmit({ kind: 'image', file, previewUrl })}>
          Yes, explain it
        </button>
        <button className="btn btn-outline btn-big" onClick={clearPhoto}>Take a different picture</button>
      </section>
    )
  }

  if (typing) {
    return (
      <section className="stack" aria-labelledby="type-title">
        <h1 id="type-title">Type the words from your paper</h1>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault()
            if (text.trim()) onSubmit({ kind: 'text', text: text.trim() })
          }}
        >
          <label htmlFor="paper-text" className="visually-hidden">Words from your paper</label>
          <textarea
            id="paper-text"
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="For example: Take 1 tab PO BID with food"
            autoFocus
          />
          <button type="submit" className="btn btn-primary btn-huge" disabled={!text.trim()}>Explain these words</button>
          <button type="button" className="btn btn-outline btn-big" onClick={() => setTyping(false)}>Go back</button>
        </form>
      </section>
    )
  }

  const pickerInput = (capture: boolean) => (
    <input
      type="file"
      accept="image/jpeg,image/png"
      {...(capture ? { capture: 'environment' as const } : {})}
      className="visually-hidden"
      onChange={(e) => {
        choose(e.target.files?.[0], pillMode)
        e.target.value = ''
      }}
    />
  )

  return (
    <section className="stack" aria-labelledby="upload-title">
      <h1 id="upload-title">{pillMode ? 'What pill do you have?' : 'What paper do you have?'}</h1>
      <p className="lead">
        {pillMode
          ? 'Take a picture of the pill or the medicine bottle. We will tell you what it is in simple words.'
          : 'Take a picture of it. We will tell you what it means in simple words.'}
      </p>

      <div
        className={`capture-card${dragging ? ' is-dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files?.[0], pillMode) }}
      >
        <label className="capture-main">
          {pickerInput(true)}
          <Icon name={pillMode ? 'medication' : 'camera'} className="huge-icon" />
          Take a picture
        </label>
        <label className="btn btn-outline btn-small capture-choose">
          {pickerInput(false)}
          <Icon name="upload" />
          Choose a picture
        </label>
      </div>

      {problem && <p className="inline-error" role="alert">{problem}</p>}

      <div className={`option-pair${pillMode ? ' option-single' : ''}`}>
        {pillMode ? (
          <button
            className="btn btn-outline btn-big btn-dashed btn-example btn-example-row"
            onClick={async () => {
              const example = await loadExamplePill()
              if (example) onCheckPill(example)
              else setProblem('The example pill could not load. Please try again.')
            }}
          >
            Try an example pill
            <img className="example-thumb example-thumb-pill" src={EXAMPLE_PILL_URL} alt="" />
          </button>
        ) : (
          <>
            <button className="btn btn-outline btn-big btn-example" onClick={() => setTyping(true)}>
              <Icon name="pencil" className="pair-icon" />
              Type it out
            </button>
            <button className="btn btn-outline btn-big btn-dashed btn-example" onClick={() => onSubmit({ kind: 'text', text: SAMPLE_TEXT })}>
              <img className="example-thumb" src="/sample-paper.svg" alt="" />
              Try an example paper
            </button>
          </>
        )}
      </div>

      <button className="btn btn-outline btn-big" onClick={() => switchMode(pillMode ? 'paper' : 'pill')}>
        <Icon name={pillMode ? 'paper' : 'medication'} />
        {pillMode ? 'Check a paper instead' : 'Check a pill instead'}
      </button>

      <div className="tips">
        <h2 className="tips-title">{pillMode ? 'Tips for a good pill picture' : 'Tips for a good picture'}</h2>
        <ul>
          <li><Icon name="sun" /> Use bright light with no shadows.</li>
          {pillMode ? (
            <li><Icon name="medication" /> Put the pill on a plain flat surface, or show the bottle label.</li>
          ) : (
            <li><Icon name="paper" /> Lay the paper flat and fit all of it in.</li>
          )}
          <li><Icon name="sound" /> You can listen to every answer.</li>
        </ul>
      </div>
    </section>
  )
}
