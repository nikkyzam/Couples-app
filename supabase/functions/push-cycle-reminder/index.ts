// Supabase Edge Function: push-cycle-reminder
//
// Runs once a day (via Supabase Cron — see README "Background push" section)
// and sends a gentle "period starts tomorrow" push to BOTH partners in any
// couple that has cycle tracking on. Idempotent: tracks the last date a
// reminder was sent per couple so re-running the same day never double-sends.
//
// Required function secrets (same as push-on-note/push-on-plan):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, WEBHOOK_SECRET
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const DAY = 86_400_000

interface CoupleRow {
  id: string
  cycle_last_start: string | null
  cycle_length: number | null
  cycle_reminder_last_sent: string | null
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Days until this couple's next predicted period, given today's date.
function daysUntilNextPeriod(lastStart: string, cycleLength: number): number {
  const len = Math.max(15, Math.min(60, Math.round(cycleLength) || 28))
  const start = new Date(lastStart + 'T00:00:00')
  const today = new Date(todayISO() + 'T00:00:00')
  const daysSince = Math.round((today.getTime() - start.getTime()) / DAY)
  const pos = ((daysSince % len) + len) % len
  const cycleStart = new Date(today.getTime() - pos * DAY)
  const nextPeriod = new Date(cycleStart.getTime() + len * DAY)
  return Math.round((nextPeriod.getTime() - today.getTime()) / DAY)
}

Deno.serve(async (req) => {
  const secret = req.headers.get('x-webhook-secret')
  if (!secret || secret !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: couples } = await supabase
    .from('couples')
    .select('id, cycle_last_start, cycle_length, cycle_reminder_last_sent')
    .not('cycle_last_start', 'is', null)

  if (!couples || couples.length === 0) return new Response('no couples tracking', { status: 200 })

  const today = todayISO()
  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT')!,
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!,
  )

  let sent = 0
  for (const couple of couples as CoupleRow[]) {
    if (!couple.cycle_last_start) continue
    if (couple.cycle_reminder_last_sent === today) continue // already sent today

    const days = daysUntilNextPeriod(couple.cycle_last_start, couple.cycle_length ?? 28)
    if (days !== 1) continue // only remind the day before

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('couple_id', couple.id)
    if (!subs || subs.length === 0) continue

    const body = JSON.stringify({
      title: '🩸 Heads up',
      body: 'The period is expected to start tomorrow.',
      tag: `cycle-${couple.id}-${today}`,
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
    await supabase
      .from('couples')
      .update({ cycle_reminder_last_sent: today })
      .eq('id', couple.id)
    sent++
  }

  return new Response(`ok, reminded ${sent} couple(s)`, { status: 200 })
})
