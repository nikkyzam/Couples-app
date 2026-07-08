import { useCallback, useEffect, useState } from 'react'

// Gentle web notifications — a heads-up when your partner leaves you a note.
// Two independent gates are always checked before anything shows: the user's
// in-app opt-in (below) *and* the OS-level permission (which they can revoke in
// system settings at any time). We keep the note's words out of the notification
// on purpose — an intimate app shouldn't spill onto a lock screen.

const NOTIFY_KEY = 'kindle.notify.v1'

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationsPref(): boolean {
  try {
    return localStorage.getItem(NOTIFY_KEY) === 'on'
  } catch {
    return false
  }
}

function setNotificationsPref(on: boolean) {
  try {
    localStorage.setItem(NOTIFY_KEY, on ? 'on' : 'off')
  } catch {
    /* ignore */
  }
}

// Standalone (non-hook) so data/realtime code can fire a notification. Stays
// silent unless the user opted in *and* the OS permission is granted. Prefers the
// service worker registration (more reliable, and required on installed iOS PWAs).
export async function showAppNotification(
  title: string,
  body: string,
  opts?: { tag?: string },
) {
  if (!notificationsSupported()) return
  if (Notification.permission !== 'granted' || !notificationsPref()) return
  const icon = new URL('icon-192.png', import.meta.env.BASE_URL).href
  const options: NotificationOptions = { body, icon, badge: icon, tag: opts?.tag }
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      await reg.showNotification(title, options)
      return
    }
  } catch {
    /* fall through to the basic Notification */
  }
  try {
    new Notification(title, options)
  } catch {
    /* some platforms only allow notifications via the service worker — ignore */
  }
}

export function useNotifications() {
  const supported = notificationsSupported()
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : 'denied',
  )
  const [enabled, setEnabled] = useState(notificationsPref)

  useEffect(() => {
    if (supported) setPermission(Notification.permission)
  }, [supported])

  // Turn on: request the OS permission if it hasn't been decided, then remember
  // the choice. Returns whether notifications ended up actually enabled.
  const enable = useCallback(async () => {
    if (!supported) return false
    let perm = Notification.permission
    if (perm === 'default') perm = await Notification.requestPermission()
    setPermission(perm)
    const ok = perm === 'granted'
    setNotificationsPref(ok)
    setEnabled(ok)
    return ok
  }, [supported])

  const disable = useCallback(() => {
    setNotificationsPref(false)
    setEnabled(false)
  }, [])

  return { supported, permission, enabled, enable, disable }
}
