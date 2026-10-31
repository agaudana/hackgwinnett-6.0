import { useState } from 'react'
import { checkImage } from './api'
import { SAMPLE_TEXT } from './mock'
import Icon from './Icon'
import type { AnalyzeInput } from './types'

export default function UploadScreen({ onSubmit }: { onSubmit: (input: AnalyzeInput) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const [text, setText] = useState('')
  const [dragging, setDragging] = useState(false)

  function choose(picked: File | undefined) {
    if (!picked) return
    const issue = checkImage(picked)
    setProblem(issue?.message ?? null)
    if (issue) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(picked)
    setPreviewUrl(URL.createObjectURL(picked))
  }

  function clearPhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
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
        choose(e.target.files?.[0])
        e.target.value = ''
      }}
    />
  )

  return (
    <section className="stack" aria-labelledby="upload-title">
      <h1 id="upload-title">What paper do you have?</h1>
      <p className="lead">Take a picture of it. We will tell you what it means in simple words.</p>

      <label className="btn btn-primary btn-huge">
        {pickerInput(true)}
        <Icon name="camera" className="huge-icon" />
        Take a picture
      </label>

      <label
        className={`btn btn-outline btn-big dropzone${dragging ? ' is-dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files?.[0]) }}
      >
        {pickerInput(false)}
        <Icon name="upload" />
        Choose a picture
      </label>

      {problem && <p className="inline-error" role="alert">{problem}</p>}

      <button className="btn btn-outline btn-big" onClick={() => setTyping(true)}>Type the words instead</button>
      <button className="btn btn-outline btn-big btn-dashed" onClick={() => onSubmit({ kind: 'text', text: SAMPLE_TEXT })}>
        Try an example paper
      </button>

      <div className="tips">
        <h2 className="tips-title">Tips for a good picture</h2>
        <ul>
          <li><Icon name="sun" /> Use bright light with no shadows.</li>
          <li><Icon name="paper" /> Lay the paper flat and fit all of it in.</li>
          <li><Icon name="sound" /> You can listen to every answer.</li>
        </ul>
      </div>
    </section>
  )
}
