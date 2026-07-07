import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { ACTIONS, SPOTS, HOWS, type DiceFace } from '../data/dice'
import { type PartnerId } from '../types'
import { Button, LevelBadge } from '../components/ui'
import SafeWordBar from '../components/SafeWordBar'
import { useSpeech } from '../lib/useSpeech'

type Reel = { label: string; emoji: string; pool: DiceFace[] }

function faceOf(pool: DiceFace[]) {
  return pool[Math.floor(Math.random() * pool.length)].text
}

function sentence(a: string, b: string, c: string) {
  return `${a} ${b}, ${c}.`
}

export default function Dice() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const { supported, speak, prefs } = useSpeech()

  const ceiling = state.unlockedLevel
  const names = state.profile.accounts
  const [turn, setTurn] = useState<PartnerId>('A')

  // Only surface faces at or below the couple's unlocked ceiling.
  const reels: Reel[] = useMemo(
    () => [
      { label: 'Do this', emoji: '💋', pool: ACTIONS.filter((f) => f.level <= ceiling) },
      { label: 'To here', emoji: '📍', pool: SPOTS.filter((f) => f.level <= ceiling) },
      { label: 'Like this', emoji: '⏳', pool: HOWS.filter((f) => f.level <= ceiling) },
    ],
    [ceiling],
  )

  const [display, setDisplay] = useState<string[]>(['?', '?', '?'])
  const [locked, setLocked] = useState<boolean[]>([true, true, true])
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<string[] | null>(null)

  // Timers + a locked-ref so the fast spin loop knows which reels have settled.
  const lockedRef = useRef<boolean[]>([true, true, true])
  const timers = useRef<number[]>([])
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearInterval(t))
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  function roll() {
    clearTimers()
    const finals = reels.map((r) => faceOf(r.pool))
    setResult(null)
    setRolling(true)
    lockedRef.current = [false, false, false]
    setLocked([false, false, false])

    // Fast blur of random faces on every reel that hasn't settled yet.
    const spin = window.setInterval(() => {
      setDisplay((d) => d.map((v, i) => (lockedRef.current[i] ? v : faceOf(reels[i].pool))))
    }, 70)
    timers.current.push(spin)

    // Reels settle one after another, slot-machine style.
    reels.forEach((_, i) => {
      const t = window.setTimeout(() => {
        lockedRef.current[i] = true
        setLocked((l) => l.map((v, idx) => (idx === i ? true : v)))
        setDisplay((d) => d.map((v, idx) => (idx === i ? finals[i] : v)))
        if (i === reels.length - 1) {
          window.clearInterval(spin)
          setRolling(false)
          setResult(finals)
          if (prefs.enabled) speak(sentence(finals[0], finals[1], finals[2]))
        }
      }, 550 + i * 450)
      timers.current.push(t)
    })
  }

  function done() {
    dispatch({ type: 'RECORD_PLAY' })
    setResult(null)
    setDisplay(['?', '?', '?'])
    setTurn((t) => (t === 'A' ? 'B' : 'A'))
  }

  const line = result ? sentence(result[0], result[1], result[2]) : ''

  return (
    <div className="flex min-h-[70vh] flex-col">
      <button onClick={() => navigate('/games')} className="mb-2 text-sm text-plum-300">
        ← Games
      </button>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Love Dice 🎲</h1>
        <LevelBadge level={ceiling} />
      </div>
      <p className="mt-1 text-sm text-plum-200/80">
        Let the dice decide. Roll three, do what they say — or pass, always.
      </p>

      <p className="mt-3 text-sm text-plum-200/80">
        <span className="font-semibold text-ember-300">
          {names[turn].emoji} {names[turn].name || `Partner ${turn === 'A' ? 1 : 2}`}
        </span>
        , you’re rolling for your partner.
      </p>

      {/* Reels */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {reels.map((r, i) => (
          <div
            key={r.label}
            className={`card-glass overflow-hidden rounded-2xl p-3 text-center transition ${
              rolling && !locked[i] ? 'ring-1 ring-ember-400/40' : ''
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ember-300/80">
              {r.emoji} {r.label}
            </p>
            <div className="mt-2 flex min-h-[3.5rem] items-center justify-center">
              <p
                className={`text-sm font-medium leading-snug text-white transition-all ${
                  rolling && !locked[i] ? 'blur-[1.5px] opacity-70' : 'opacity-100'
                }`}
              >
                {display[i]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Combined result */}
      <div className="mt-4 flex flex-1 flex-col justify-center">
        {result && (
          <div className="animate-flip card-glass rounded-3xl p-6 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ember-300">
              The dice say
            </p>
            <p className="text-2xl font-medium leading-relaxed text-white">{line}</p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <Button className="w-full !py-5 text-lg" onClick={roll} disabled={rolling}>
            {rolling ? 'Rolling…' : result ? '🎲 Roll again' : '🎲 Roll the dice'}
          </Button>

          {result && !rolling && (
            <div className="flex items-center justify-center gap-3">
              {supported && (
                <button
                  onClick={() => speak(line, { force: true })}
                  className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-xl"
                  title="Hear it"
                >
                  🔊
                </button>
              )}
              <Button className="flex-1" onClick={done}>
                We did it ✓
              </Button>
              <Button variant="soft" onClick={done}>
                Pass
              </Button>
            </div>
          )}
        </div>
      </div>

      <SafeWordBar />
    </div>
  )
}
