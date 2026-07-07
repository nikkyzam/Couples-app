import { useState } from 'react'
import { eraseDevice } from '../lib/useAppLock'

const PIN_LENGTH = 4
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export default function LockScreen({
  tryUnlock,
}: {
  tryUnlock: (pin: string) => boolean
}) {
  const [digits, setDigits] = useState('')
  const [shake, setShake] = useState(false)

  function press(key: string) {
    if (key === '') return
    if (key === '⌫') {
      setDigits((d) => d.slice(0, -1))
      return
    }
    if (digits.length >= PIN_LENGTH) return
    const next = digits + key
    setDigits(next)
    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        if (!tryUnlock(next)) {
          setShake(true)
          setTimeout(() => {
            setShake(false)
            setDigits('')
          }, 350)
        }
      }, 100)
    }
  }

  function resetDevice() {
    if (
      confirm(
        "This erases Kindle's saved data on this device (profiles, notes, and progress) so you can start over with a new PIN. This can't be undone. Continue?",
      )
    ) {
      eraseDevice()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-plum-950 px-6">
      <div className="ambiance" aria-hidden />
      <div className="relative z-10 flex flex-col items-center">
        <div className="animate-breathe text-5xl">🔒</div>
        <h1 className="font-display mt-4 text-2xl font-bold text-white">Kindle is locked</h1>
        <p className="mt-1 text-sm text-plum-200/70">Enter your PIN to continue</p>

        <div className={`mt-8 flex gap-4 ${shake ? 'animate-[shake_0.35s]' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full border-2 border-ember-400 transition-colors ${
                i < digits.length ? 'bg-ember-400' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4">
          {KEYS.map((k, i) => (
            <button
              key={i}
              onClick={() => press(k)}
              disabled={k === ''}
              className={`grid h-16 w-16 place-items-center rounded-full text-2xl font-semibold transition ${
                k === ''
                  ? 'pointer-events-none'
                  : k === '⌫'
                    ? 'text-plum-300 active:bg-white/5'
                    : 'bg-white/5 text-white active:bg-white/15'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <button
          onClick={resetDevice}
          className="mt-10 text-xs text-plum-300/60 underline underline-offset-2"
        >
          Forgot your PIN?
        </button>
      </div>
    </div>
  )
}
