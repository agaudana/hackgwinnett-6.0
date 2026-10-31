import { useEffect, useReducer, useRef, useState } from 'react'
import { analyze, backendIsDemo } from './api'
import { usePreferences } from './preferences'
import UploadScreen from './UploadScreen'
import LoadingScreen from './LoadingScreen'
import ResultsScreen from './ResultsScreen'
import ErrorScreen from './ErrorScreen'
import SettingsDialog from './SettingsDialog'
import ReadingRuler from './ReadingRuler'
import Icon from './Icon'
import type { AnalysisData, AnalyzeInput, ApiError, ResultSource } from './types'

type State =
  | { status: 'idle' }
  | { status: 'loading'; input: AnalyzeInput }
  | { status: 'result'; input: AnalyzeInput; data: AnalysisData; source: ResultSource }
  | { status: 'error'; input: AnalyzeInput; error: ApiError }

type Event =
  | { type: 'submit'; input: AnalyzeInput }
  | { type: 'success'; data: AnalysisData; source: ResultSource }
  | { type: 'failure'; error: ApiError }
  | { type: 'reset' }

const initial: State = { status: 'idle' }

function reducer(state: State, event: Event): State {
  switch (event.type) {
    case 'submit':
      return { status: 'loading', input: event.input }
    case 'success':
      return state.status === 'loading' ? { status: 'result', input: state.input, data: event.data, source: event.source } : state
    case 'failure':
      return state.status === 'loading' ? { status: 'error', input: state.input, error: event.error } : state
    case 'reset':
      return initial
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial)
  const [demo, setDemo] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { prefs, update, reset: resetPrefs } = usePreferences()
  const inFlight = useRef<AbortController | null>(null)

  useEffect(() => {
    backendIsDemo().then(setDemo)
  }, [])

  async function submit(input: AnalyzeInput) {
    inFlight.current?.abort()
    const controller = new AbortController()
    inFlight.current = controller
    dispatch({ type: 'submit', input })
    try {
      const result = await analyze(input, controller.signal)
      dispatch(result.ok ? { type: 'success', data: result.data, source: result.source } : { type: 'failure', error: result.error })
    } catch (error) {
      if (!controller.signal.aborted) throw error
    }
  }

  function reset() {
    inFlight.current?.abort()
    dispatch({ type: 'reset' })
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={reset} aria-label="HealthLens, go to start">
          <Icon name="lens" /> HealthLens
        </button>
        <div className="topbar-right">
          {demo && <span className="demo-badge">Demo mode</span>}
          <button className="btn btn-outline btn-small settings-button" onClick={() => setSettingsOpen(true)}>
            <Icon name="sliders" /> <span className="settings-label">Reading settings</span>
          </button>
        </div>
      </header>

      <main className="screen">
        {state.status === 'idle' && <UploadScreen onSubmit={submit} />}
        {state.status === 'loading' && <LoadingScreen input={state.input} onCancel={reset} />}
        {state.status === 'result' && (
          <ResultsScreen data={state.data} source={state.source} speechRate={prefs.speechRate} onReset={reset} />
        )}
        {state.status === 'error' && (
          <ErrorScreen error={state.error} onRetry={() => submit(state.input)} onReset={reset} />
        )}
      </main>

      <footer className="disclaimer">
        HealthLens helps explain your papers. It does not replace your doctor. If you feel very sick, call 911.
      </footer>

      <SettingsDialog open={settingsOpen} prefs={prefs} onChange={update} onReset={resetPrefs} onClose={() => setSettingsOpen(false)} />
      {prefs.ruler && <ReadingRuler />}
    </div>
  )
}
