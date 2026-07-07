import { useCallback, useEffect, useRef, useState } from 'react'

// A device-level PIN lock, independent of local/cloud mode — it just guards
// whatever is already on this device/browser. Stored outside the main app
// state so it works identically in both modes.
const LOCK_KEY = 'kindle.lock.v1'
// If the app sits in the background this long, require the PIN again.
const RELOCK_AFTER_MS = 2 * 60 * 1000

function loadCode(): string {
  try {
    return localStorage.getItem(LOCK_KEY) || ''
  } catch {
    return ''
  }
}

export function useAppLock() {
  const [code, setCodeState] = useState(loadCode)
  const [unlocked, setUnlocked] = useState(() => !loadCode())
  const hiddenAt = useRef<number | null>(null)

  // Re-lock if the app was hidden (backgrounded / screen off) for a while.
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        hiddenAt.current = Date.now()
        return
      }
      if (hiddenAt.current && code && Date.now() - hiddenAt.current > RELOCK_AFTER_MS) {
        setUnlocked(false)
      }
      hiddenAt.current = null
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [code])

  const setCode = useCallback((next: string) => {
    try {
      if (next) localStorage.setItem(LOCK_KEY, next)
      else localStorage.removeItem(LOCK_KEY)
    } catch {
      /* storage unavailable — lock just won't persist */
    }
    setCodeState(next)
    if (!next) setUnlocked(true)
  }, [])

  const tryUnlock = useCallback(
    (attempt: string) => {
      if (attempt.length > 0 && attempt === code) {
        setUnlocked(true)
        return true
      }
      return false
    },
    [code],
  )

  return {
    hasLock: code.length > 0,
    unlocked,
    setCode,
    tryUnlock,
    lockNow: () => setUnlocked(false),
  }
}

// Wipes everything Kindle stores on this device — the escape hatch for a
// forgotten PIN. Cloud-mode accounts are unaffected (their data lives in
// Supabase); this only clears what's local to this browser.
export function eraseDevice() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('kindle.'))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
  location.reload()
}
