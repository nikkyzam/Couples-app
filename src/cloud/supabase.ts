import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Cloud sync is opt-in: it turns on only when both env vars are set at build
// time. Without them the app runs entirely locally (per-device) — nothing here
// throws, so the local experience is never broken.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const cloudEnabled = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = cloudEnabled
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
