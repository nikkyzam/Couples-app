// Supabase Edge Function: push-on-note
//
// Sends a Web Push notification to the *other* partner whenever a note is
// inserted. Wire it to a Database Webhook on INSERT of public.notes (see the
// README "Background push" section for the one-time setup).
//
// Required function secrets (supabase secrets set ...):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (e.g. mailto:you@example.com)
//   WEBHOOK_SECRET  (a random string; also set as the webhook's header value)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

interface NoteRecord {
  id: string
  couple_id: string
  from_user: string
  text: string
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok', { status: 200 })

  // Only accept calls carrying our shared secret (set on the webhook's headers).
  const secret = req.headers.get('x-webhook-secret')
  if (!secret || secret !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('unauthorized', { status: 401 })
  }

  const payload = await req.json().catch(() => null)
  const note = payload?.record as NoteRecord | undefined
  if (!note?.couple_id || !note.from_user) {
    return new Response('no record', { status: 200 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // The recipient is every device in the couple that isn't the sender's.
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('couple_id', note.couple_id)
    .neq('user_id', note.from_user)

  if (!subs || subs.length === 0) return new Response('no subscribers', { status: 200 })

  const { data: sender } = await supabase
    .from('members')
    .select('display_name')
    .eq('couple_id', note.couple_id)
    .eq('user_id', note.from_user)
    .maybeSingle()
  const name = sender?.display_name || 'Your partner'

  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT')!,
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!,
  )

  // Keep the note's words out of the notification — just say one arrived.
  const body = JSON.stringify({
    title: `💌 ${name} sent you a note`,
    body: 'Open Kindle to read it.',
    tag: `note-${note.id}`,
  })

  await Promise.all(
    subs.map((s) =>
      webpush
        .sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
        )
        .catch(async (err: { statusCode?: number }) => {
          // Prune dead subscriptions (expired/unsubscribed devices).
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
          }
        }),
    ),
  )

  return new Response('ok', { status: 200 })
})
