import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { WOULD_YOU_RATHER } from '../data/prompts'
import { availablePrompts, pickRandom } from '../lib/play'
import type { Prompt } from '../types'
import { Button, LevelBadge } from '../components/ui'
import SafeWordBar from '../components/SafeWordBar'
import { useSpeech } from '../lib/useSpeech'

export default function WouldYouRather() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const { supported, speak, prefs } = useSpeech()
  const pool = useMemo(
    () => availablePrompts(WOULD_YOU_RATHER, state.unlockedLevel),
    [state.unlockedLevel],
  )
  const [current, setCurrent] = useState<Prompt | null>(() => pickRandom(pool) ?? null)
  const [picked, setPicked] = useState<'a' | 'b' | null>(null)

  const sayCurrent = (force = false) => {
    if (current) speak(`Would you rather ${current.text}, or ${current.altText}?`, { force })
  }

  function next() {
    setPicked(null)
    const n = pickRandom(pool, current?.id) ?? null
    setCurrent(n)
    dispatch({ type: 'RECORD_PLAY' })
    if (n && prefs.enabled) speak(`Would you rather ${n.text}, or ${n.altText}?`)
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <button onClick={() => navigate('/games')} className="mb-2 text-sm text-plum-300">
        ← Games
      </button>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Would You Rather</h1>
        <LevelBadge level={state.unlockedLevel} />
      </div>
      <p className="mt-2 text-sm text-plum-200/80">
        Both of you point at the same time. Matches are a green light. 💚
      </p>

      <div className="flex flex-1 flex-col justify-center gap-4 py-6">
        {current ? (
          <div className="animate-flip space-y-4">
            <div className="flex items-center justify-center gap-2">
              <p className="text-center text-sm font-semibold uppercase tracking-widest text-ember-300">
                Would you rather…
              </p>
              {supported && (
                <button
                  onClick={() => sayCurrent(true)}
                  className="text-lg"
                  title="Hear it"
                >
                  🔊
                </button>
              )}
            </div>
            <button
              onClick={() => setPicked('a')}
              className={`w-full rounded-3xl border p-6 text-lg font-medium transition ${
                picked === 'a'
                  ? 'border-ember-400 bg-ember-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-plum-50'
              }`}
            >
              {current.text}
            </button>
            <p className="text-center text-xs font-semibold text-plum-300/60">or</p>
            <button
              onClick={() => setPicked('b')}
              className={`w-full rounded-3xl border p-6 text-lg font-medium transition ${
                picked === 'b'
                  ? 'border-ember-400 bg-ember-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-plum-50'
              }`}
            >
              {current.altText}
            </button>
          </div>
        ) : (
          <p className="text-center text-plum-200/70">No cards at this level yet.</p>
        )}
      </div>

      <div className="space-y-3">
        <Button className="w-full" onClick={next} disabled={!current}>
          Next question →
        </Button>
        <SafeWordBar />
      </div>
    </div>
  )
}
