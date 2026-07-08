import { useState, type FormEvent, type ReactNode } from 'react'
import { useSiteGate } from '../lib/useSiteGate'

// Sits above everything else — router, providers, the PIN lock — so a stranger
// who lands on the public URL never reaches onboarding or sign-up. No-ops
// entirely when VITE_SITE_PASSPHRASE_HASH isn't configured.
export default function SiteGate({ children }: { children: ReactNode }) {
  const { enabled, unlocked, tryUnlock } = useSiteGate()
  if (!enabled || unlocked) return <>{children}</>
  return <PassphraseScreen tryUnlock={tryUnlock} />
}

function PassphraseScreen({
  tryUnlock,
}: {
  tryUnlock: (attempt: string) => Promise<boolean>
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim() || busy) return
    setBusy(true)
    const ok = await tryUnlock(value)
    setBusy(false)
    if (!ok) {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-plum-950 px-6">
      <div className="ambiance" aria-hidden />
      <form
        onSubmit={submit}
        className="relative z-10 flex w-full max-w-xs flex-col items-center"
      >
        <div className="text-5xl">🔥</div>
        <h1 className="font-display mt-4 text-2xl font-bold text-white">Kindle</h1>
        <p className="mt-1 text-center text-sm text-plum-200/70">
          This is a private space. Enter the passphrase to continue.
        </p>
        <input
          autoFocus
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="Passphrase"
          className={`mt-6 w-full rounded-2xl border bg-white/5 px-4 py-4 text-center text-white placeholder:text-plum-300/50 focus:outline-none ${
            error ? 'border-red-400' : 'border-white/10 focus:border-ember-400'
          }`}
        />
        {error && (
          <p className="mt-2 text-sm text-red-300">That's not it — try again.</p>
        )}
        <button
          type="submit"
          disabled={!value.trim() || busy}
          className="mt-5 w-full rounded-2xl bg-gradient-to-br from-ember-500 to-plum-500 py-3 font-semibold text-white transition disabled:opacity-40"
        >
          {busy ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
