import { useState } from 'react'
import { supabase, emailRedirectTo } from './supabase'
import { Button } from '../components/ui'

// Email + password auth. Each partner makes their own account on their own phone.
export default function AuthScreen() {
  const sb = supabase!
  const [mode, setMode] = useState<'in' | 'up'>('up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Shows the "resend confirmation" option once we know an email is unconfirmed —
  // either right after sign-up, or when a sign-in fails because it isn't confirmed.
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)

  async function submit() {
    setBusy(true)
    setError(null)
    setMsg(null)
    try {
      if (mode === 'up') {
        const { error } = await sb.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo },
        })
        if (error) throw error
        // If email confirmation is on, there's no session yet.
        const { data } = await sb.auth.getSession()
        if (!data.session) {
          setMsg('Check your email to confirm your account, then sign in.')
          setMode('in')
          setAwaitingConfirm(true)
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      // Supabase blocks sign-in until the address is confirmed — surface the resend.
      if (/confirm/i.test(message)) setAwaitingConfirm(true)
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  // Re-send the sign-up confirmation email (with the same corrected redirect).
  async function resend() {
    if (!email.trim()) {
      setError('Enter your email above first, then tap resend.')
      return
    }
    setBusy(true)
    setError(null)
    setMsg(null)
    try {
      const { error } = await sb.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo },
      })
      if (error) throw error
      setMsg('Sent again — check your inbox (and your spam folder).')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resend just now. Try again shortly.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="text-6xl">🔥</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Kindle</h1>
        <p className="mt-2 text-plum-200/80">
          {mode === 'up' ? 'Create your account to sync with your partner.' : 'Welcome back.'}
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="email"
          inputMode="email"
          autoCapitalize="none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-plum-300/50 focus:border-ember-400 focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-plum-300/50 focus:border-ember-400 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {msg && <p className="mt-3 text-sm text-green-300">{msg}</p>}

      <Button className="mt-6" onClick={submit} disabled={busy || !email || password.length < 6}>
        {busy ? 'One sec…' : mode === 'up' ? 'Create account' : 'Sign in'}
      </Button>

      <button
        onClick={() => {
          setMode(mode === 'up' ? 'in' : 'up')
          setError(null)
          setMsg(null)
        }}
        className="mt-4 text-center text-sm text-plum-300"
      >
        {mode === 'up' ? 'Already have an account? Sign in' : 'New here? Create an account'}
      </button>

      {awaitingConfirm && (
        <button
          onClick={resend}
          disabled={busy}
          className="mt-3 text-center text-sm text-ember-300 disabled:opacity-40"
        >
          Didn’t get the email? Resend confirmation
        </button>
      )}

      <p className="mt-8 text-center text-xs text-plum-300/50">
        Passwords must be at least 6 characters. Your data is private to you and your partner.
      </p>
    </div>
  )
}
