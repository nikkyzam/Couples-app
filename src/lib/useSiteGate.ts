import { useCallback, useState } from 'react'

// A front-door passphrase for the whole site — separate from the per-device PIN
// (useAppLock). This one keeps casual strangers who stumble on the public URL
// from even reaching onboarding/sign-up; the PIN is a second, per-device layer
// on top of that for whoever already has access.
//
// Same threat model as the PIN lock: this is a static site, so a sufficiently
// determined visitor can still view the bundled JS and see the configured hash,
// then attempt to crack it offline. It is not encryption — it's a doorbell, not
// a vault. Pick a real passphrase (not "1234") and it'll comfortably keep out
// anyone who isn't deliberately trying to break in.
const GATE_KEY = 'kindle.sitegate.v1'

function configuredHash(): string | undefined {
  const h = import.meta.env.VITE_SITE_PASSPHRASE_HASH as string | undefined
  return h && h.trim() ? h.trim().toLowerCase() : undefined
}

export function siteGateEnabled(): boolean {
  return !!configuredHash()
}

function loadUnlocked(): boolean {
  try {
    return localStorage.getItem(GATE_KEY) === 'ok'
  } catch {
    return false
  }
}

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function useSiteGate() {
  const hash = configuredHash()
  const [unlocked, setUnlocked] = useState(() => !hash || loadUnlocked())

  const tryUnlock = useCallback(
    async (attempt: string) => {
      if (!hash) return true
      if (!attempt.trim()) return false
      const digest = await sha256Hex(attempt.trim())
      if (digest === hash) {
        try {
          localStorage.setItem(GATE_KEY, 'ok')
        } catch {
          /* storage unavailable — it'll just ask again next visit */
        }
        setUnlocked(true)
        return true
      }
      return false
    },
    [hash],
  )

  return { enabled: !!hash, unlocked, tryUnlock }
}
