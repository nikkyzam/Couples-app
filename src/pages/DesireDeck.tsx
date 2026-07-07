import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { TRUTHS, DARES } from '../data/prompts'
import { availablePrompts, pickRandom } from '../lib/play'
import { SPICE_META, type Prompt } from '../types'
import { Button, LevelBadge } from '../components/ui'
import SafeWordBar from '../components/SafeWordBar'
import { useSpeech } from '../lib/useSpeech'

export default function DesireDeck() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const { supported, speak, prefs } = useSpeech()

  const deck = useMemo(
    () => [
      ...availablePrompts(TRUTHS, state.unlockedLevel),
      ...availablePrompts(DARES, state.unlockedLevel),
    ],
    [state.unlockedLevel],
  )

  const [card, setCard] = useState<Prompt | null>(null)
  const [flipped, setFlipped] = useState(false)

  function drawCard() {
    const next = pickRandom(deck, card?.id)
    if (next) {
      setCard(next)
      setFlipped(true)
      dispatch({ type: 'RECORD_PLAY' })
      if (prefs.enabled) speak(next.text)
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <button onClick={() => navigate('/games')} className="mb-2 text-sm text-plum-300">
        ← Games
      </button>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Desire Deck</h1>
        <LevelBadge level={state.unlockedLevel} />
      </div>
      <p className="mt-2 text-sm text-plum-200/80">
        One shared deck. Tap to draw and let it decide the mood.
      </p>

      <div className="flex flex-1 items-center justify-center py-6">
        {!card ? (
          <button
            onClick={drawCard}
            className="grid h-72 w-52 place-items-center rounded-3xl border border-white/15 bg-gradient-to-br from-plum-700/60 to-ember-800/40 text-center shadow-2xl transition active:scale-95"
          >
            <div>
              <div className="text-6xl">🃏</div>
              <p className="mt-3 font-semibold text-white">Tap to draw</p>
            </div>
          </button>
        ) : (
          <div
            key={card.id}
            className={`w-full ${flipped ? 'animate-flip' : ''}`}
          >
            <div
              className="rounded-3xl border border-white/15 p-8 text-center shadow-2xl"
              style={{
                background: `linear-gradient(160deg, ${SPICE_META[card.level].accent}33, rgba(255,255,255,0.03))`,
              }}
            >
              <div className="mb-3 text-3xl">{SPICE_META[card.level].emoji}</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                {SPICE_META[card.level].name}
              </p>
              <p className="mt-4 text-xl font-medium leading-relaxed text-white">
                {card.text}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {card && (
          <div className="flex gap-3">
            <Button className="flex-1" onClick={drawCard}>
              Draw again 🃏
            </Button>
            {supported && (
              <Button variant="soft" onClick={() => speak(card.text, { force: true })}>
                🔊
              </Button>
            )}
            <Button
              variant="soft"
              onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', id: card.id })}
            >
              {state.favorites.includes(card.id) ? '❤️' : '🤍'}
            </Button>
          </div>
        )}
        <SafeWordBar />
      </div>
    </div>
  )
}
