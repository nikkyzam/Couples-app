// Web Push helpers. Background push is optional: it only turns on when a VAPID
// public key is configured at build time (VITE_VAPID_PUBLIC_KEY). Without it, the
// app still shows the in-app notification when it's open — nothing breaks.

export function vapidPublicKey(): string | undefined {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
  return key && key.trim() ? key.trim() : undefined
}

export function pushSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window
  )
}

// VAPID keys are base64url; the browser's applicationServerKey wants raw bytes.
// Backed by an explicit ArrayBuffer so it satisfies BufferSource under strict
// typed-array typing.
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buffer = new ArrayBuffer(raw.length)
  const out = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}
