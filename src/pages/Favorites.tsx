import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { TRUTHS, DARES } from '../data/prompts'
import { SectionTitle, EmptyState, LevelBadge } from '../components/ui'

const ALL_PROMPTS = [...TRUTHS, ...DARES]

export default function Favorites() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()

  const favorited = useMemo(
    () => ALL_PROMPTS.filter((p) => state.favorites.includes(p.id)),
    [state.favorites],
  )

  const truths = favorited.filter((p) => p.id.startsWith('t'))
  const dares = favorited.filter((p) => p.id.startsWith('d'))

  return (
    <div>
      <button onClick={() => navigate('/games')} className="mb-2 text-sm text-plum-300">
        ← Games
      </button>

      <SectionTitle
        eyebrow="Saved for later"
        title="Favorites"
        sub="Truths and dares you both loved — tap the heart to unsave one."
      />

      {favorited.length === 0 ? (
        <EmptyState
          emoji="🤍"
          title="No favorites yet"
          sub="While playing Truth or Dare or the Desire Deck, tap the heart on a card to save it here."
        />
      ) : (
        <div className="space-y-6">
          {truths.length > 0 && (
            <div>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-ember-300">
                💬 Truths ({truths.length})
              </h2>
              <div className="space-y-2">
                {truths.map((p) => (
                  <FavRow key={p.id} text={p.text} level={p.level} onRemove={() => dispatch({ type: 'TOGGLE_FAVORITE', id: p.id })} />
                ))}
              </div>
            </div>
          )}
          {dares.length > 0 && (
            <div>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-ember-300">
                🔥 Dares ({dares.length})
              </h2>
              <div className="space-y-2">
                {dares.map((p) => (
                  <FavRow key={p.id} text={p.text} level={p.level} onRemove={() => dispatch({ type: 'TOGGLE_FAVORITE', id: p.id })} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FavRow({
  text,
  level,
  onRemove,
}: {
  text: string
  level: 1 | 2 | 3 | 4 | 5
  onRemove: () => void
}) {
  return (
    <div className="card-glass flex items-start gap-3 rounded-3xl p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">{text}</p>
        <div className="mt-2">
          <LevelBadge level={level} />
        </div>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 text-xl"
        title="Remove from favorites"
      >
        ❤️
      </button>
    </div>
  )
}
