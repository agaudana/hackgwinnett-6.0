import { useReducer } from 'react'
import { analyze, USE_MOCK } from './api.js'
import UploadScreen from './UploadScreen.jsx'
import LoadingScreen from './LoadingScreen.jsx'
import ResultsScreen from './ResultsScreen.jsx'
import ErrorScreen from './ErrorScreen.jsx'
import Icon from './Icon.jsx'

const initial = { status: 'idle' }

function reducer(state, event) {
  switch (event.type) {
    case 'submit':
      return { status: 'loading', input: event.input }
    case 'success':
      return state.status === 'loading' ? { status: 'result', input: state.input, data: event.data } : state
    case 'failure':
      return state.status === 'loading' ? { status: 'error', input: state.input, error: event.error } : state
    case 'reset':
      return initial
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial)

  async function submit(input) {
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
