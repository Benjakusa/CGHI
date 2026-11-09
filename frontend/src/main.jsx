import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { primeApi } from './hooks/useApi'

// Start the hero fetch before React mounts so the hero is already
// available (or in flight) by the time <Home /> first renders.
primeApi('/api/heroes')
primeApi('/api/jobs')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
