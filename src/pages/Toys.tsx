import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { TOYS } from '../data/toys'
import { DESIRES } from '../data/desires'
import { SPICE_META, type Toy } from '../types'
import { SectionTitle, LevelBadge, Button } from '../components/ui'

export default function Toys() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState<Toy | null>(null)
  const [tab, setTab] = useState<'all' | 'box' | 'buy'>('all')

  const isOwned = (id: string) => state.ownedToys.includes(id)
  const isWished = (id: string) => state.wishlist.includes(id)
  const toggleOwned = (id: string) => dispatch({ type: 'TOGGLE_OWNED_TOY', id })
  const toggleWish = (id: string) => dispatch({ type: 'TOGGLE_WISHLIST_TOY', id })

  const unlocked = TOYS.filter((t) => t.level <= state.unlockedLevel)
  const locked = TOYS.filter((t) => t.level > state.unlockedLevel)
  const ownedCount = unlocked.filter((t) => isOwned(t.id)).length

  // Does the couple mutually want a toy? (Both said yes/maybe to a linked desire.)
  const bothWant = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const d of DESIRES) {
      if (!d.toyId) continue
      const a = state.desiresA[d.id]
      const b = state.desiresB[d.id]
      const yes = (v: string | null | undefined) => v === 'yes' || v === 'maybe'
      if (yes(a) && yes(b)) map[d.toyId] = true
    }
    return map
  }, [state.desiresA, state.desiresB])

  // Toys worth buying: unlocked, not owned — ranked by mutual interest, then
  // beginner-friendliness. This is what we suggest they add for both of them.
  const suggestions = useMemo(() => {
    return unlocked
      .filter((t) => !isOwned(t.id))
      .map((t) => ({ t, both: !!bothWant[t.id] }))
      .sort(
        (a, b) =>
          Number(b.both) - Number(a.both) ||
          Number(b.t.beginnerFriendly) - Number(a.t.beginnerFriendly),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, state.ownedToys, bothWant])

  const reasonFor = (t: Toy, both: boolean) =>
    both
      ? 'You both said yes to this ✨'
      : t.beginnerFriendly
        ? 'A gentle place to start'
        : 'A fun next step for you two'

  const gridToys = tab === 'box' ? unlocked.filter((t) => isOwned(t.id)) : unlocked

  return (
    <div>
      <SectionTitle
        eyebrow="No pressure, just curiosity"
        title="Toy Explorer"
        sub="Tap ✓ on the ones you have — Date Night only suggests toys from your box."
      />

      <div className="mb-5 flex items-center gap-1 rounded-2xl bg-white/5 p-1 text-sm">
        {(
          [
            ['all', 'All'],
            ['box', `🧰 Our box${ownedCount ? ` (${ownedCount})` : ''}`],
            ['buy', `🛒 To buy${state.wishlist.length ? ` (${state.wishlist.length})` : ''}`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl py-2 font-semibold transition ${
              tab === key ? 'bg-white/10 text-white' : 'text-plum-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── To buy: suggestions + wishlist ─────────────────────────────────── */}
      {tab === 'buy' && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
              Suggested for you two
            </h3>
            {suggestions.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-plum-200/70">
                You already have every toy unlocked at your level. 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.slice(0, 5).map(({ t, both }) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 rounded-3xl border p-4 ${
                      both ? 'border-ember-400/40 bg-ember-500/10' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <button onClick={() => setOpen(t)} className="text-3xl">
                      {t.emoji}
                    </button>
                    <button
                      onClick={() => setOpen(t)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-ember-300">{reasonFor(t, both)}</p>
                    </button>
                    <button
                      onClick={() => toggleWish(t.id)}
                      className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        isWished(t.id)
                          ? 'bg-ember-500/30 text-ember-100'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {isWished(t.id) ? '🛒 On list' : '🛒 Want'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-plum-300/70">
              Your shopping list
            </h3>
            {state.wishlist.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-plum-200/70">
                Tap 🛒 Want on anything above to start a list you can shop from together.
              </div>
            ) : (
              <div className="space-y-2">
                {TOYS.filter((t) => isWished(t.id)).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="flex-1 text-white">{t.name}</span>
                    <button
                      onClick={() => toggleOwned(t.id)}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white"
                    >
                      Got it ✓
                    </button>
                    <button
                      onClick={() => toggleWish(t.id)}
                      className="text-plum-300/60"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 px-2 text-center text-xs text-plum-300/50">
              Kindle doesn't sell anything — search these names at a reputable, body-safe
              retailer you both trust.
            </p>
          </div>
        </div>
      )}

      {/* ── All / Our box grid ─────────────────────────────────────────────── */}
      {tab !== 'buy' &&
        (gridToys.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
            <div className="text-4xl">🧰</div>
            <p className="mt-2 font-semibold text-white">Your toy box is empty</p>
            <p className="mt-1 text-sm text-plum-200/70">
              Switch to <span className="font-semibold">All</span> and tap “We have this”
              on the ones you own.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {gridToys.map((t) => {
              const mine = isOwned(t.id)
              return (
                <div
                  key={t.id}
                  className={`animate-float-in flex flex-col rounded-3xl border p-4 transition ${
                    mine ? 'border-ember-400/50 bg-ember-500/10' : 'card-glass border-transparent'
                  }`}
                >
                  <button onClick={() => setOpen(t)} className="flex flex-1 flex-col text-left">
                    <span className="text-4xl">{t.emoji}</span>
                    <span className="mt-2 font-semibold text-white">{t.name}</span>
                    <span className="mt-0.5 text-xs text-plum-200/70">{t.tagline}</span>
                  </button>
                  {mine ? (
                    <button
                      onClick={() => toggleOwned(t.id)}
                      className="mt-3 rounded-xl bg-ember-500/30 py-1.5 text-xs font-semibold text-ember-100"
                    >
                      ✓ In our box
                    </button>
                  ) : (
                    <div className="mt-3 flex gap-1.5">
                      <button
                        onClick={() => toggleOwned(t.id)}
                        className="flex-1 rounded-xl bg-white/5 py-1.5 text-xs font-semibold text-plum-200 hover:bg-white/10"
                      >
                        ＋ Have
                      </button>
                      <button
                        onClick={() => toggleWish(t.id)}
                        className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                          isWished(t.id)
                            ? 'bg-ember-500/30 text-ember-100'
                            : 'bg-white/5 text-plum-200 hover:bg-white/10'
                        }`}
                        title="Add to shopping list"
                      >
                        🛒
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

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

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => toggleOwned(open.id)}
                className={`flex-1 rounded-2xl py-3 font-semibold transition ${
                  isOwned(open.id)
                    ? 'bg-ember-500/25 text-ember-100'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {isOwned(open.id) ? '✓ In our toy box' : '＋ We have this'}
              </button>
              {!isOwned(open.id) && (
                <button
                  onClick={() => toggleWish(open.id)}
                  className={`rounded-2xl px-4 py-3 font-semibold transition ${
                    isWished(open.id)
                      ? 'bg-ember-500/25 text-ember-100'
                      : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  {isWished(open.id) ? '🛒 On list' : '🛒 Want'}
                </button>
              )}
            </div>
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
