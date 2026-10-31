import { useEffect, useRef } from 'react'
import { CATEGORY_LABELS } from './display'
import Icon from './Icon'
import type { MedicalTerm } from './types'
import type { Speech } from './useSpeech'

interface Props {
  term: MedicalTerm | null
  speech: Speech
  onClose: () => void
}

export default function TermDialog({ term, speech, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialog.current
    if (!el) return
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
      onClick={(e) => { if (e.target === dialog.current) dialog.current.close() }}
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
            <button className="btn btn-dark btn-big" onClick={() => dialog.current?.close()} autoFocus>
              Got it
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
