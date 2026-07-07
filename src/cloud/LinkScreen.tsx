import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { Button } from '../components/ui'

const EMOJIS = ['💜', '❤️', '🧡', '💛', '💚', '💙', '🩷', '🔥', '🌙', '⭐']

// After signing in, each partner either creates a shared space (and shares the
// invite code) or joins their partner's space with that code.
export default function LinkScreen({
  onLinked,
  onSignOut,
}: {
  onLinked: () => void
  onSignOut: () => void
}) {
  const sb = supabase!
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('💜')
  const [code, setCode] = useState('')
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prefill the name from the email handle.
  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      const handle = data.user?.email?.split('@')[0]
      if (handle) setName((n) => n || handle)
    })
  }, [sb])

  async function create() {
    setBusy(true)
    setError(null)
    try {
      const { data, error } = await sb.rpc('create_couple', { p_name: name.trim(), p_emoji: emoji })
      if (error) throw error
      // Fetch the code to display before continuing.
      const { data: couple } = await sb.from('couples').select('invite_code').eq('id', data).single()
      setCreatedCode(couple?.invite_code ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your space.')
    } finally {
      setBusy(false)
    }
  }

  async function join() {
    setBusy(true)
    setError(null)
    try {
      const { error } = await sb.rpc('join_couple', {
        p_code: code.trim(),
        p_name: name.trim(),
        p_emoji: emoji,
      })
      if (error) throw error
      onLinked()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join that space.')
    } finally {
      setBusy(false)
    }
  }

  if (createdCode) {
    return (
      <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-10 text-center">
        <div className="text-5xl">💞</div>
        <h1 className="mt-4 text-2xl font-bold text-white">Your space is ready</h1>
        <p className="mt-2 text-plum-200/80">
          Share this invite code with your partner so they can join from their own phone.
        </p>
        <div className="my-8 rounded-3xl border border-ember-400/30 bg-ember-500/10 py-6">
          <p className="text-xs uppercase tracking-widest text-ember-300">Invite code</p>
          <p className="mt-1 text-5xl font-bold tracking-[0.3em] text-white">{createdCode}</p>
        </div>
        <Button onClick={onLinked}>Enter Kindle 🔥</Button>
        <p className="mt-3 text-xs text-plum-300/50">
          You can find this code again anytime in Settings.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-6 py-10">
      <h1 className="text-2xl font-bold text-white">Connect with your partner</h1>
      <p className="mt-1 text-sm text-plum-200/80">
        One of you creates your private space; the other joins with the code.
      </p>

      <div className="mt-6 flex gap-2 rounded-2xl bg-white/5 p-1 text-sm">
        <button
          onClick={() => setTab('create')}
          className={`flex-1 rounded-xl py-2 font-semibold transition ${tab === 'create' ? 'bg-white/10 text-white' : 'text-plum-300'}`}
        >
          Create a space
        </button>
        <button
          onClick={() => setTab('join')}
          className={`flex-1 rounded-xl py-2 font-semibold transition ${tab === 'join' ? 'bg-white/10 text-white' : 'text-plum-300'}`}
        >
          Join with a code
        </button>
      </div>

      <div className="mt-6 card-glass rounded-3xl p-4">
        <label className="text-xs text-plum-300">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-1 w-full bg-transparent text-lg font-semibold text-white placeholder:text-plum-300/50 focus:outline-none"
        />
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl transition ${emoji === e ? 'bg-ember-500/40 ring-2 ring-ember-400' : 'bg-white/5'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {tab === 'join' && (
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Invite code (e.g. A1B2C3)"
          maxLength={6}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold tracking-[0.3em] text-white placeholder:text-base placeholder:tracking-normal placeholder:text-plum-300/50 focus:border-ember-400 focus:outline-none"
        />
      )}

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      <Button
        className="mt-6"
        onClick={tab === 'create' ? create : join}
        disabled={busy || !name.trim() || (tab === 'join' && code.trim().length < 4)}
      >
        {busy ? 'One sec…' : tab === 'create' ? 'Create our space' : 'Join'}
      </Button>

      <button onClick={onSignOut} className="mt-6 text-center text-sm text-plum-300/60">
        Sign out
      </button>
    </div>
  )
}
