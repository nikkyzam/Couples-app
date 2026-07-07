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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)

// Register the service worker for offline / installable PWA support. The path
// is relative to BASE_URL so this also works when hosted under a subpath
// (e.g. GitHub Pages' /Couples-app/) — the SW's scope follows its own URL.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // service worker is a progressive enhancement — ignore failures
    })
  })
}
