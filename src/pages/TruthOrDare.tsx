import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { TRUTHS, DARES } from '../data/prompts'
import { availablePrompts, pickRandom } from '../lib/play'
import type { PartnerId, Prompt } from '../types'
import { Button, LevelBadge } from '../components/ui'
import SafeWordBar from '../components/SafeWordBar'
import { useSpeech } from '../lib/useSpeech'

export default function TruthOrDare() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const { supported, speak, prefs } = useSpeech()
  const [turn, setTurn] = useState<PartnerId>('A')
  const [current, setCurrent] = useState<Prompt | null>(null)
  const [kind, setKind] = useState<'truth' | 'dare' | null>(null)

  const names = state.profile.accounts

  function draw(type: 'truth' | 'dare') {
    const pool = availablePrompts(
      type === 'truth' ? TRUTHS : DARES,
      state.unlockedLevel,
    )
    const next = pickRandom(pool, current?.id)
    if (next) {
      setKind(type)
      setCurrent(next)
      // Read the prompt aloud if the guided voice is on.
      if (prefs.enabled) {
        speak(`${type === 'truth' ? 'Truth.' : 'Dare.'} ${next.text}`)
      }
    }
  }

  function complete() {
    dispatch({ type: 'RECORD_PLAY' })
    reset()
  }
  function reset() {
    setCurrent(null)
    setKind(null)
    setTurn((t) => (t === 'A' ? 'B' : 'A'))
  }

  const isFav = current ? state.favorites.includes(current.id) : false

  return (
    <div className="flex min-h-[70vh] flex-col">
      <button
        onClick={() => navigate('/games')}
        className="mb-2 text-sm text-plum-300"
      >
        ← Games
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Truth or Dare</h1>
        <LevelBadge level={state.unlockedLevel} />
      </div>

      <p className="mt-2 text-sm text-plum-200/80">
        <span className="font-semibold text-ember-300">
          {names[turn].emoji} {names[turn].name || `Partner ${turn === 'A' ? 1 : 2}`}
        </span>
        , it's your turn.
      </p>

      <div className="flex flex-1 flex-col items-center justify-center py-6">
        {!current ? (
          <div className="w-full space-y-4 text-center">
            <div className="text-6xl">🎯</div>
            <p className="text-plum-200/80">Choose your fate</p>
            <div className="flex gap-3">
              <Button className="flex-1 !py-6 text-lg" onClick={() => draw('truth')}>
                💬 Truth
              </Button>
              <Button
                variant="soft"
                className="flex-1 !py-6 text-lg"
                onClick={() => draw('dare')}
              >
                🔥 Dare
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-flip w-full">
            <div className="card-glass rounded-3xl p-7 text-center">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ember-300">
                {kind === 'truth' ? 'Truth' : 'Dare'}
              </p>
              <p className="text-xl font-medium leading-relaxed text-white">
                {current.text}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() =>
                  dispatch({ type: 'TOGGLE_FAVORITE', id: current.id })
                }
                className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-xl"
                title="Save favorite"
              >
                {isFav ? '❤️' : '🤍'}
              </button>
              {supported && (
                <button
                  onClick={() =>
                    speak(`${kind === 'truth' ? 'Truth.' : 'Dare.'} ${current.text}`, {
                      force: true,
                    })
                  }
                  className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-xl"
                  title="Hear it"
                >
                  🔊
                </button>
              )}
              <Button className="flex-1" onClick={complete}>
                Done ✓
              </Button>
              <Button variant="soft" onClick={reset}>
                Pass
              </Button>
            </div>
            <button
              onClick={() => draw(kind!)}
              className="mt-3 w-full text-sm text-plum-300"
            >
              ↻ Draw another {kind}
            </button>
          </div>
        )}
      </div>

      <SafeWordBar />
    </div>
  )
}
