import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { PreferencesProvider } from './lib/preferences'
import { SpeechProvider } from './lib/speech'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <SpeechProvider>
        <App />
      </SpeechProvider>
    </PreferencesProvider>
  </StrictMode>,
)
