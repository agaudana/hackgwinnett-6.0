import type { ApiError } from './types'

const TIPS: Record<string, string> = {
  OCR_FAILED: 'Tip: put the paper on a flat table, turn on a light, and hold the phone straight above it.',
  INVALID_IMAGE: 'Tip: take a new photo with your phone camera, or type the words instead.',
  FILE_TOO_LARGE: 'Tip: take a new photo instead of using a scan, or type the words instead.',
}

interface Props {
  error: ApiError
  onRetry: () => void
  onReset: () => void
}

export default function ErrorScreen({ error, onRetry, onReset }: Props) {
  return (
    <section className="stack center" aria-labelledby="error-title">
      <h1 id="error-title">We could not read that</h1>
      <p className="lead" role="alert">{error.message}</p>
      {TIPS[error.code] && <p className="tip">{TIPS[error.code]}</p>}
      <div className="row">
        <button className="btn btn-primary btn-big" onClick={onRetry}>Try again</button>
        <button className="btn btn-outline btn-big" onClick={onReset}>Start over</button>
      </div>
    </section>
  )
}
