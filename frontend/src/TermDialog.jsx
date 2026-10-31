import { useEffect, useRef } from 'react'
import { CATEGORY_LABELS } from './display.js'
import Icon from './Icon.jsx'

export default function TermDialog({ term, speech, onClose }) {
  const dialog = useRef(null)

  useEffect(() => {
    const el = dialog.current
    if (term && !el.open) el.showModal()
    if (!term && el.open) el.close()
  }, [term])

  const speakingThis = speech.speakingId === 'term'

  return (
    <dialog
      ref={dialog}
      className="term-dialog"
      aria-labelledby="term-title"
      onClose={() => { if (speakingThis) speech.stop(); onClose() }}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
    >
      {term && (
        <div className="term-body">
          <p className="chip-cat">{CATEGORY_LABELS[term.category] ?? 'Medical word'}</p>
          <h2 id="term-title">{term.term}</h2>
          <p className="term-def">{term.definition}</p>
          <div className="row">
            {speech.supported && (
              <button
                className="btn btn-outline btn-big"
                onClick={() => (speakingThis ? speech.stop() : speech.speak('term', `${term.term}. ${term.definition}`))}
              >
                <Icon name={speakingThis ? 'stop' : 'sound'} /> {speakingThis ? 'Stop' : 'Hear it'}
              </button>
            )}
            <button className="btn btn-dark btn-big" onClick={() => dialog.current.close()} autoFocus>
              Got it
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
