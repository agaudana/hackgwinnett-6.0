import { useReducer } from 'react'
import { analyze, USE_MOCK } from './api'
import UploadScreen from './UploadScreen'
import LoadingScreen from './LoadingScreen'
import ResultsScreen from './ResultsScreen'
import ErrorScreen from './ErrorScreen'
import Icon from './Icon'
import type { AnalysisData, AnalyzeInput, ApiError } from './types'

type State =
  | { status: 'idle' }
  | { status: 'loading'; input: AnalyzeInput }
  | { status: 'result'; input: AnalyzeInput; data: AnalysisData }
  | { status: 'error'; input: AnalyzeInput; error: ApiError }

type Event =
  | { type: 'submit'; input: AnalyzeInput }
  | { type: 'success'; data: AnalysisData }
  | { type: 'failure'; error: ApiError }
  | { type: 'reset' }

const initial: State = { status: 'idle' }

function reducer(state: State, event: Event): State {
  switch (event.type) {
    case 'submit':
      return { status: 'loading', input: event.input }
    case 'success':
      return state.status === 'loading' ? { status: 'result', input: state.input, data: event.data } : state
    case 'failure':
      return state.status === 'loading' ? { status: 'error', input: state.input, error: event.error } : state
    case 'reset':
      return initial
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial)

  async function submit(input: AnalyzeInput) {
    dispatch({ type: 'submit', input })
    const result = await analyze(input)
    dispatch(result.ok ? { type: 'success', data: result.data } : { type: 'failure', error: result.error })
  }
  const reset = () => dispatch({ type: 'reset' })

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={reset} aria-label="HealthLens, go to start">
          <Icon name="lens" /> HealthLens
        </button>
        {USE_MOCK && <span className="demo-badge">Demo mode</span>}
      </header>

      <main className="screen">
        {state.status === 'idle' && <UploadScreen onSubmit={submit} />}
        {state.status === 'loading' && <LoadingScreen input={state.input} />}
        {state.status === 'result' && <ResultsScreen data={state.data} onReset={reset} />}
        {state.status === 'error' && (
          <ErrorScreen error={state.error} onRetry={() => submit(state.input)} onReset={reset} />
        )}
      </main>

      <footer className="disclaimer">
        HealthLens helps explain your papers. It does not replace your doctor. If you feel very sick, call 911.
      </footer>
    </div>
  )
}
