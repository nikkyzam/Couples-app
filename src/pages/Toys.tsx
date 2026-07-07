import { useState } from 'react'
import { useStore } from '../store'
import { TOYS } from '../data/toys'
import { SPICE_META, type Toy } from '../types'
import { SectionTitle, LevelBadge, Button } from '../components/ui'

export default function Toys() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState<Toy | null>(null)
  const [tab, setTab] = useState<'all' | 'box'>('all')

  const owned = state.ownedToys
  const isOwned = (id: string) => owned.includes(id)
  const toggleOwned = (id: string) => dispatch({ type: 'TOGGLE_OWNED_TOY', id })

  const unlocked = TOYS.filter((t) => t.level <= state.unlockedLevel)
  const toys = tab === 'box' ? unlocked.filter((t) => isOwned(t.id)) : unlocked
  const locked = TOYS.filter((t) => t.level > state.unlockedLevel)
  const ownedCount = unlocked.filter((t) => isOwned(t.id)).length

  return (
    <div>
      <SectionTitle
        eyebrow="No pressure, just curiosity"
        title="Toy Explorer"
        sub="Tap ✓ on the ones you have — your Date Night will only ever suggest toys from your box."
      />

      {/* All vs. our toy box */}
      <div className="mb-5 flex items-center gap-2 rounded-2xl bg-white/5 p-1 text-sm">
        <button
          onClick={() => setTab('all')}
          className={`flex-1 rounded-xl py-2 font-semibold transition ${tab === 'all' ? 'bg-white/10 text-white' : 'text-plum-300'}`}
        >
          All toys
        </button>
        <button
          onClick={() => setTab('box')}
          className={`flex-1 rounded-xl py-2 font-semibold transition ${tab === 'box' ? 'bg-white/10 text-white' : 'text-plum-300'}`}
        >
          🧰 Our toy box{ownedCount > 0 ? ` (${ownedCount})` : ''}
        </button>
      </div>

      {toys.length === 0 && tab === 'box' ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
          <div className="text-4xl">🧰</div>
          <p className="mt-2 font-semibold text-white">Your toy box is empty</p>
          <p className="mt-1 text-sm text-plum-200/70">
            Switch to <span className="font-semibold">All toys</span> and tap “We have this”
            on the ones you own.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {toys.map((t) => {
            const mine = isOwned(t.id)
            return (
              <div
                key={t.id}
                className={`animate-float-in flex flex-col rounded-3xl border p-4 transition ${
                  mine
                    ? 'border-ember-400/50 bg-ember-500/10'
                    : 'card-glass border-transparent'
                }`}
              >
                <button
                  onClick={() => setOpen(t)}
                  className="flex flex-1 flex-col text-left"
                >
                  <span className="text-4xl">{t.emoji}</span>
                  <span className="mt-2 font-semibold text-white">{t.name}</span>
                  <span className="mt-0.5 text-xs text-plum-200/70">{t.tagline}</span>
                </button>
                <button
                  onClick={() => toggleOwned(t.id)}
                  className={`mt-3 rounded-xl py-1.5 text-xs font-semibold transition ${
                    mine
                      ? 'bg-ember-500/30 text-ember-100'
                      : 'bg-white/5 text-plum-200 hover:bg-white/10'
                  }`}
                >
                  {mine ? '✓ In our box' : '＋ We have this'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'all' && locked.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/60">
            Unlocks as you level up
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {locked.map((t) => (
              <div
                key={t.id}
                className="flex flex-col items-start rounded-3xl border border-white/5 bg-white/[0.02] p-4 opacity-60"
              >
                <span className="text-4xl grayscale">🔒</span>
                <span className="mt-2 font-semibold text-plum-200">Level {t.level}</span>
                <span className="text-xs text-plum-300/60">
                  Reach {SPICE_META[t.level].name} to explore this
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail sheet */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div
            className="animate-float-in w-full max-w-md rounded-3xl border border-white/10 bg-plum-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-5xl">{open.emoji}</span>
                <h2 className="mt-2 text-2xl font-bold text-white">{open.name}</h2>
                <p className="text-sm text-plum-200/80">{open.tagline}</p>
              </div>
              <LevelBadge level={open.level} />
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="font-semibold text-ember-300">Great for</p>
                <p className="text-plum-100">{open.goodFor}</p>
              </div>
              <div>
                <p className="font-semibold text-ember-300">How to start</p>
                <p className="text-plum-100">{open.howTo}</p>
              </div>
              <div>
                <p className="font-semibold text-ember-300">Tips</p>
                <ul className="mt-1 space-y-1">
                  {open.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-plum-100">
                      <span className="text-ember-400">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => toggleOwned(open.id)}
              className={`mt-6 w-full rounded-2xl py-3 font-semibold transition ${
                isOwned(open.id)
                  ? 'bg-ember-500/25 text-ember-100'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              {isOwned(open.id) ? '✓ In our toy box' : '＋ Add to our toy box'}
            </button>
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setOpen(null)}>
              Close
            </Button>
          </div>
        </div>
      )}

      <p className="mt-6 px-2 text-center text-xs text-plum-300/50">
        Educational guidance only. Use body-safe materials and a compatible
        lubricant, and stop anytime either of you wants to.
      </p>
    </div>
  )
}
