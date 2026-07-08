// Supabase Edge Function: push-on-plan
//
// Sends a Web Push notification to the *other* partner whenever a date/plan is
// added to the shared schedule. Wire it to a Database Webhook on INSERT of
// public.plans — same setup as push-on-note, see the README "Background push"
// section, just pointed at a different table/function.
//
// Required function secrets (supabase secrets set ...):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (e.g. mailto:you@example.com)
//   WEBHOOK_SECRET  (a random string; also set as the webhook's header value —
//   can reuse the same secret as push-on-note)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

interface PlanRecord {
  id: string
  couple_id: string
  created_by: string | null
  title: string
  plan_date: string
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok', { status: 200 })

  const secret = req.headers.get('x-webhook-secret')
  if (!secret || secret !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('unauthorized', { status: 401 })
  }

  const payload = await req.json().catch(() => null)
  const plan = payload?.record as PlanRecord | undefined
  if (!plan?.couple_id || !plan.created_by) {
    return new Response('no record', { status: 200 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('couple_id', plan.couple_id)
    .neq('user_id', plan.created_by)

  if (!subs || subs.length === 0) return new Response('no subscribers', { status: 200 })

  const { data: sender } = await supabase
    .from('members')
    .select('display_name')
    .eq('couple_id', plan.couple_id)
    .eq('user_id', plan.created_by)
    .maybeSingle()
  const name = sender?.display_name || 'Your partner'

  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT')!,
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!,
  )

  // Keep the plan's title out of the notification, same as notes — some idea
  // chips are explicit (e.g. "Oral only night"), and nothing intimate belongs on
  // a lock screen. Just the date is shown; the details wait until they open the app.
  const when = new Date(plan.plan_date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const body = JSON.stringify({
    title: `🗓️ ${name} scheduled something`,
    body: `Check the Planner for ${when}.`,
    tag: `plan-${plan.id}`,
  })

  await Promise.all(
    subs.map((s) =>
      webpush
        .sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
        )
        .catch(async (err: { statusCode?: number }) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
          }
        }),
    ),
  )

  return new Response('ok', { status: 200 })
})
