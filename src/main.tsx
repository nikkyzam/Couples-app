import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { StoreProvider } from './store'
import { cloudEnabled } from './cloud/supabase'
import { CloudProvider } from './cloud/CloudProvider'

// When Supabase is configured, run in synced multi-account mode; otherwise the
// app works fully offline as a private, per-device experience.
const Provider = cloudEnabled ? CloudProvider : StoreProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)

// Register the service worker for offline / installable PWA support.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // service worker is a progressive enhancement — ignore failures
    })
  })
}
