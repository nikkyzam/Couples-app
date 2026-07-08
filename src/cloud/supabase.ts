import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Cloud sync is opt-in: it turns on only when both env vars are set at build
// time. Without them the app runs entirely locally (per-device) — nothing here
// throws, so the local experience is never broken.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const cloudEnabled = Boolean(url && anonKey)

// Where Supabase should send users back to after they click the confirmation
// link in their email. Without this, Supabase falls back to the project's
// "Site URL" (which defaults to http://localhost:3000) — so confirmation emails
// point at localhost. Using the live origin + base path means the link returns
// to whatever deployed site the person actually signed up from (e.g.
// https://<user>.github.io/Couples-app/). detectSessionInUrl (on by default)
// then parses the token on arrival and signs them in automatically.
//
// NOTE: this URL must also be added to the Supabase dashboard allowlist under
// Authentication → URL Configuration → Redirect URLs, and the Site URL there
// should be set to the deployed site — otherwise Supabase ignores this value
// and falls back to Site URL.
export const emailRedirectTo =
  typeof window !== 'undefined'
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : undefined

export const supabase: SupabaseClient | null = cloudEnabled
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
