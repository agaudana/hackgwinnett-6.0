import { useEffect, useReducer, useRef, useState } from 'react'
import { analyze, backendIsDemo, identifyPill } from './api'
import { usePreferences } from './preferences'
import UploadScreen from './UploadScreen'
import LoadingScreen from './LoadingScreen'
import ResultsScreen from './ResultsScreen'
import ErrorScreen from './ErrorScreen'
import PillResultsScreen from './PillResultsScreen'
import SettingsDialog from './SettingsDialog'
import Onboarding, { hasOnboarded, markOnboarded } from './Onboarding'
import ReadingRuler from './ReadingRuler'
import Icon from './Icon'
import type { AnalysisData, AnalyzeInput, ApiError, PillData, PillInput, ResultSource } from './types'

const PILL_STEPS = ['Looking at your picture…', 'Reading the label or pill…', 'Putting it into plain words…']

type State =
  | { status: 'idle' }
  | { status: 'loading'; input: AnalyzeInput }
  | { status: 'result'; input: AnalyzeInput; data: AnalysisData; source: ResultSource }
  | { status: 'error'; input: AnalyzeInput; error: ApiError }
  | { status: 'pill-loading'; pill: PillInput }
  | { status: 'pill-result'; pill: PillInput; data: PillData; source: ResultSource }
  | { status: 'pill-error'; pill: PillInput; error: ApiError }

type Event =
  | { type: 'submit'; input: AnalyzeInput }
  | { type: 'success'; data: AnalysisData; source: ResultSource }
  | { type: 'failure'; error: ApiError }
  | { type: 'pill-submit'; pill: PillInput }
  | { type: 'pill-success'; data: PillData; source: ResultSource }
  | { type: 'pill-failure'; error: ApiError }
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
    case 'pill-submit':
      return { status: 'pill-loading', pill: event.pill }
    case 'pill-success':
      return state.status === 'pill-loading' ? { status: 'pill-result', pill: state.pill, data: event.data, source: event.source } : state
    case 'pill-failure':
      return state.status === 'pill-loading' ? { status: 'pill-error', pill: state.pill, error: event.error } : state
    case 'reset':
      return initial
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial)
  const [demo, setDemo] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [onboarding, setOnboarding] = useState(() => !hasOnboarded())
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

  async function checkPill(pill: PillInput) {
    inFlight.current?.abort()
    const controller = new AbortController()
    inFlight.current = controller
    dispatch({ type: 'pill-submit', pill })
    try {
      const result = await identifyPill(pill, controller.signal)
      dispatch(result.ok ? { type: 'pill-success', data: result.data, source: result.source } : { type: 'pill-failure', error: result.error })
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
        <div className="topbar-row">
          <button className="brand" onClick={reset} aria-label="HealthLens, go to start">
            <img
              className="brand-logo"
              src={prefs.theme === 'dark' ? '/logo/logo-horizontal-dark.svg' : '/logo/logo-horizontal.svg'}
              alt=""
            />
          </button>
          {demo && <span className="demo-badge">Demo mode</span>}
        </div>
        <div className="topbar-row">
          <button className="btn btn-outline btn-small" onClick={() => setOnboarding(true)}>
            <Icon name="info" /> Help
          </button>
          <button className="btn btn-outline btn-small settings-button" onClick={() => setSettingsOpen(true)}>
            <Icon name="sliders" /> <span className="settings-label">Reading settings</span>
          </button>
        </div>
      </header>

      <main className="screen">
        {onboarding && (
          <Onboarding
            prefs={prefs}
            onChange={update}
            onFinish={() => {
              markOnboarded()
              setOnboarding(false)
            }}
          />
        )}
        {!onboarding && state.status === 'idle' && <UploadScreen onSubmit={submit} onCheckPill={checkPill} />}
        {!onboarding && state.status === 'loading' && <LoadingScreen input={state.input} onCancel={reset} />}
        {!onboarding && state.status === 'result' && (
          <ResultsScreen data={state.data} source={state.source} speechRate={prefs.speechRate} onReset={reset} />
        )}
        {!onboarding && state.status === 'error' && (
          <ErrorScreen error={state.error} onRetry={() => submit(state.input)} onReset={reset} />
        )}
        {!onboarding && state.status === 'pill-loading' && (
          <LoadingScreen input={{ kind: 'image', ...state.pill }} steps={PILL_STEPS} onCancel={reset} />
        )}
        {!onboarding && state.status === 'pill-result' && (
          <PillResultsScreen
            data={state.data}
            source={state.source}
            previewUrl={state.pill.previewUrl}
            speechRate={prefs.speechRate}
            onCheckAnother={checkPill}
            onReset={reset}
          />
        )}
        {!onboarding && state.status === 'pill-error' && (
          <ErrorScreen error={state.error} onRetry={() => checkPill(state.pill)} onReset={reset} />
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
