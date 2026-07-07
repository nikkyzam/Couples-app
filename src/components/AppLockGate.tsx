import type { ReactNode } from 'react'
import { useAppLock } from '../lib/useAppLock'
import LockScreen from './LockScreen'

// Sits above everything else (router, store, providers) so a locked device
// never even initializes auth/network calls — it just shows the PIN pad.
export default function AppLockGate({ children }: { children: ReactNode }) {
  const { hasLock, unlocked, tryUnlock } = useAppLock()
  if (hasLock && !unlocked) {
    return <LockScreen tryUnlock={tryUnlock} />
  }
  return <>{children}</>
}
