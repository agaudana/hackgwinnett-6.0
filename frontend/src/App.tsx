import { useCallback, useEffect, useRef, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { ReadingRuler } from './components/ReadingRuler'
import { ErrorScreen } from './screens/ErrorScreen'
import { ProcessingScreen } from './screens/ProcessingScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { UploadScreen } from './screens/UploadScreen'
import { AnalyzeError, analyzeDocument } from './lib/api'
import { usePreferences } from './lib/preferences'
import { useSpeech } from './lib/speech'
import type { AnalysisResult, AnalyzeInput } from './lib/types'

type View =
  | { name: 'upload' }
  | { name: 'processing'; input: AnalyzeInput; previewUrl: string | null }
  | { name: 'results'; result: AnalysisResult; previewUrl: string | null }
  | { name: 'error'; message: string; input: AnalyzeInput }

export default function App() {
  const [view, setView] = useState<View>({ name: 'upload' })
  const controller = useRef<AbortController | null>(null)
  const mainRef = useRef<HTMLElement>(null)
  const { prefs } = usePreferences()
  const { stop } = useSpeech()

  const previewUrl = view.name === 'processing' || view.name === 'results' ? view.previewUrl : null
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  useEffect(() => {
    stop()
    mainRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [view.name, stop])

  const analyze = useCallback(async (input: AnalyzeInput) => {
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    const preview = input.kind === 'image' ? URL.createObjectURL(input.file) : null
    setView({ name: 'processing', input, previewUrl: preview })

    try {
      const result = await analyzeDocument(input, abort.signal)
      if (abort.signal.aborted) return
      setView({ name: 'results', result, previewUrl: preview })
    } catch (error) {
      if (abort.signal.aborted) return
      const message =
        error instanceof AnalyzeError ? error.message : 'Something went wrong while reading your paper. Please try again.'
      setView({ name: 'error', message, input })
    }
  }, [])

  const reset = useCallback(() => {
    controller.current?.abort()
    setView({ name: 'upload' })
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <AppHeader onHome={view.name === 'upload' ? undefined : reset} />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {view.name === 'upload' && <UploadScreen onAnalyze={analyze} />}
        {view.name === 'processing' && (
          <ProcessingScreen previewUrl={view.previewUrl} input={view.input} onCancel={reset} />
        )}
        {view.name === 'results' && (
          <ResultsScreen result={view.result} previewUrl={view.previewUrl} onStartOver={reset} />
        )}
        {view.name === 'error' && (
          <ErrorScreen message={view.message} onRetry={() => analyze(view.input)} onStartOver={reset} />
        )}
      </main>
      {prefs.ruler && <ReadingRuler />}
    </div>
  )
}
